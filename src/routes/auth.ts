import { Hono } from 'hono'
import { hashPassword, verifyPassword, generateSessionToken, isValidEmail, isValidPassword } from '../lib/auth'
import { 
  generateMagicCode, 
  getMagicCodeExpiry, 
  isMagicCodeExpired, 
  canResendMagicCode,
  getBlockedUntil,
  isBlocked,
  validateMagicCode,
  getMagicLinkEmailHTML,
  getMagicLinkEmailText
} from '../lib/magic-link'

type Bindings = {
  DB: D1Database;
}

const auth = new Hono<{ Bindings: Bindings }>()

// Register endpoint
auth.post('/register', async (c) => {
  try {
    const { email, password, name, company, role, phone } = await c.req.json()

    // Validation
    if (!email || !password || !name || !role) {
      return c.json({ error: '이메일, 비밀번호, 이름, 역할은 필수입니다.' }, 400)
    }

    if (!isValidEmail(email)) {
      return c.json({ error: '올바른 이메일 형식이 아닙니다.' }, 400)
    }

    if (!isValidPassword(password)) {
      return c.json({ error: '비밀번호는 최소 8자 이상이어야 합니다.' }, 400)
    }

    if (!['shipper', 'forwarder', 'carrier'].includes(role)) {
      return c.json({ error: '올바른 역할을 선택해주세요.' }, 400)
    }

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existingUser) {
      return c.json({ error: '이미 등록된 이메일입니다.' }, 409)
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Insert new user
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, name, company, role, phone) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(email, passwordHash, name, company || null, role, phone || null).run()

    if (!result.success) {
      return c.json({ error: '회원가입 중 오류가 발생했습니다.' }, 500)
    }

    // Get the created user
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, company, role, phone FROM users WHERE email = ?'
    ).bind(email).first()

    // Generate session token (userId 포함)
    const token = generateSessionToken(user.id as number)
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days

    return c.json({
      message: '회원가입이 완료되었습니다.',
      user,
      token,
      expiresAt
    }, 201)

  } catch (error) {
    console.error('Register error:', error)
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500)
  }
})

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    // Validation
    if (!email || !password) {
      return c.json({ error: '이메일과 비밀번호를 입력해주세요.' }, 400)
    }

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user) {
      return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash as string)

    if (!isValid) {
      return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
    }

    // Generate session token (userId 포함)
    const token = generateSessionToken(user.id as number)
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user

    return c.json({
      message: '로그인되었습니다.',
      user: userWithoutPassword,
      token,
      expiresAt
    })

  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500)
  }
})

// Hash key login endpoint
auth.post('/login-hash', async (c) => {
  try {
    const { hashKey, hash_key } = await c.req.json()
    const key = hashKey || hash_key // Support both formats

    // Validation
    if (!key) {
      return c.json({ error: '해시키를 입력해주세요.' }, 400)
    }

    // Validate hash key format (should start with 0x and be hex)
    if (!key.startsWith('0x') || key.length < 10) {
      return c.json({ error: '올바른 해시키 형식이 아닙니다.' }, 400)
    }

    // In a real application, hash keys would be stored in the database
    // For demonstration, we'll map hash keys to existing user IDs
    // Using last character of hash to determine user ID (1, 2, or 3)
    const lastChar = key.slice(-1).toLowerCase()
    const charCode = lastChar.charCodeAt(0)
    const userId = (charCode % 3) + 1

    // Find user by ID (simulating hash key verification)
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first()

    if (!user) {
      return c.json({ error: '등록되지 않은 해시키입니다.' }, 401)
    }

    // Generate session token (userId 포함)
    const token = generateSessionToken(user.id as number)
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user

    return c.json({
      message: '해시키 인증 성공!',
      user: userWithoutPassword,
      token,
      expiresAt
    })

  } catch (error) {
    console.error('Hash login error:', error)
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500)
  }
})

// Certificate login endpoint
auth.post('/login-cert', async (c) => {
  try {
    const { cert_data, cert_password, cert_filename } = await c.req.json()

    // Validation
    if (!cert_data || !cert_password) {
      return c.json({ error: '인증서 파일과 비밀번호를 입력해주세요.' }, 400)
    }

    // Validate certificate file format
    const validExtensions = ['.der', '.pfx', '.p12']
    const hasValidExtension = validExtensions.some(ext => cert_filename?.toLowerCase().endsWith(ext))
    
    if (!hasValidExtension) {
      return c.json({ error: '지원하지 않는 인증서 형식입니다. (.der, .pfx, .p12만 지원)' }, 400)
    }

    // In a real application, you would:
    // 1. Decode the certificate data
    // 2. Verify the certificate with the password
    // 3. Extract user information from the certificate
    // 4. Match with database records
    
    // For demonstration, we'll simulate certificate verification
    // Simple check: password length > 4
    if (cert_password.length < 4) {
      return c.json({ error: '인증서 비밀번호가 올바르지 않습니다.' }, 401)
    }

    // Simulate extracting user info from certificate
    // In reality, this would come from the certificate's DN (Distinguished Name)
    const certHash = cert_data.substring(0, 20)
    const userId = (certHash.charCodeAt(0) + certHash.charCodeAt(1)) % 3 + 1

    // Find user by ID
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first()

    if (!user) {
      return c.json({ error: '등록되지 않은 인증서입니다.' }, 401)
    }

    // Generate session token (userId 포함)
    const token = generateSessionToken(user.id as number)
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user

    return c.json({
      message: '공동인증서 인증 성공!',
      user: userWithoutPassword,
      token,
      expiresAt,
      cert_info: {
        filename: cert_filename,
        verified_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Certificate login error:', error)
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500)
  }
})

// Send magic link endpoint (매직 링크 발송)
auth.post('/send-magic-link', async (c) => {
  try {
    const { email } = await c.req.json()

    // 이메일 검증
    if (!email || !isValidEmail(email)) {
      return c.json({ 
        success: false,
        error: '올바른 이메일 주소를 입력해주세요.' 
      }, 400)
    }

    // 사용자 찾기 또는 생성
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first()

    // 사용자가 없으면 Basic 권한으로 새로 생성
    if (!user) {
      const result = await c.env.DB.prepare(
        'INSERT INTO users (email, auth_level, search_count_monthly, search_count_reset_date) VALUES (?, ?, ?, DATE("now"))'
      ).bind(email, 'basic', 0).run()

      if (!result.success) {
        return c.json({ 
          success: false,
          error: '사용자 생성 중 오류가 발생했습니다.' 
        }, 500)
      }

      user = await c.env.DB.prepare(
        'SELECT * FROM users WHERE email = ?'
      ).bind(email).first()
    }

    // 차단 상태 확인
    if (user.magic_code_blocked_until && isBlocked(user.magic_code_blocked_until as string)) {
      const blockedUntil = new Date(user.magic_code_blocked_until as string)
      const now = new Date()
      const remainingSeconds = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000)
      
      return c.json({
        success: false,
        error: '5회 실패로 인해 일시적으로 차단되었습니다.',
        blockedUntil: user.magic_code_blocked_until,
        retryAfter: remainingSeconds
      }, 429)
    }

    // 재전송 제한 확인 (1분)
    if (user.magic_code_expires_at && !isMagicCodeExpired(user.magic_code_expires_at as string)) {
      if (!canResendMagicCode(user.updated_at as string)) {
        return c.json({
          success: false,
          error: '1분 후에 다시 시도해주세요.',
          retryAfter: 60
        }, 429)
      }
    }

    // 매직 코드 생성
    const magicCode = generateMagicCode()
    const expiresAt = getMagicCodeExpiry()

    // 데이터베이스 업데이트
    await c.env.DB.prepare(
      `UPDATE users 
       SET magic_code = ?, 
           magic_code_expires_at = ?, 
           magic_code_attempts = 0,
           updated_at = CURRENT_TIMESTAMP 
       WHERE email = ?`
    ).bind(magicCode, expiresAt, email).run()

    // 이메일 발송 (실제 환경에서는 이메일 서비스 사용)
    console.log(`Magic code for ${email}: ${magicCode}`)
    console.log(`Email HTML:`, getMagicLinkEmailHTML(magicCode, email))

    // TODO: 실제 이메일 발송 구현
    // await sendEmail({
    //   to: email,
    //   subject: 'ShipShare 로그인 코드',
    //   html: getMagicLinkEmailHTML(magicCode, email),
    //   text: getMagicLinkEmailText(magicCode, email)
    // })

    return c.json({
      success: true,
      message: '인증 코드를 이메일로 발송했습니다.',
      expiresIn: 300, // 5분 = 300초
      // 개발 환경에서만 코드 반환
      ...(process.env.NODE_ENV === 'development' && { code: magicCode })
    })

  } catch (error) {
    console.error('Send magic link error:', error)
    return c.json({ 
      success: false,
      error: '서버 오류가 발생했습니다.' 
    }, 500)
  }
})

// Verify magic code endpoint (매직 코드 검증)
auth.post('/verify-magic-code', async (c) => {
  try {
    const { email, code } = await c.req.json()

    // 입력 검증
    if (!email || !code) {
      return c.json({
        success: false,
        error: '이메일과 코드를 입력해주세요.'
      }, 400)
    }

    if (!validateMagicCode(code)) {
      return c.json({
        success: false,
        error: '올바른 6자리 코드를 입력해주세요.'
      }, 400)
    }

    // 사용자 찾기
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user) {
      return c.json({
        success: false,
        error: '등록되지 않은 이메일입니다.'
      }, 404)
    }

    // 차단 상태 확인
    if (user.magic_code_blocked_until && isBlocked(user.magic_code_blocked_until as string)) {
      const blockedUntil = new Date(user.magic_code_blocked_until as string)
      const now = new Date()
      const remainingSeconds = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000)
      
      return c.json({
        success: false,
        error: '5회 실패로 인해 10분간 차단되었습니다.',
        blockedUntil: user.magic_code_blocked_until,
        retryAfter: remainingSeconds
      }, 429)
    }

    // 코드 만료 확인
    if (!user.magic_code_expires_at || isMagicCodeExpired(user.magic_code_expires_at as string)) {
      return c.json({
        success: false,
        error: '코드가 만료되었습니다. 새로운 코드를 요청해주세요.'
      }, 410)
    }

    // 코드 일치 확인
    const cleanedCode = code.replace(/\s/g, '')
    if (user.magic_code !== cleanedCode) {
      // 실패 횟수 증가
      const attempts = (user.magic_code_attempts as number || 0) + 1
      const attemptsRemaining = 5 - attempts

      // 5회 실패 시 10분간 차단
      if (attempts >= 5) {
        const blockedUntil = getBlockedUntil()
        await c.env.DB.prepare(
          `UPDATE users 
           SET magic_code_attempts = ?, 
               magic_code_blocked_until = ?
           WHERE email = ?`
        ).bind(attempts, blockedUntil, email).run()

        return c.json({
          success: false,
          error: '5회 실패로 인해 10분간 차단되었습니다.',
          blockedUntil: blockedUntil
        }, 429)
      }

      // 실패 횟수만 업데이트
      await c.env.DB.prepare(
        'UPDATE users SET magic_code_attempts = ? WHERE email = ?'
      ).bind(attempts, email).run()

      return c.json({
        success: false,
        error: '잘못된 인증 코드입니다.',
        attemptsRemaining: attemptsRemaining
      }, 401)
    }

    // 코드 검증 성공 - 코드 삭제 및 로그인 처리
    await c.env.DB.prepare(
      `UPDATE users 
       SET magic_code = NULL, 
           magic_code_expires_at = NULL, 
           magic_code_attempts = 0,
           magic_code_blocked_until = NULL,
           last_login_at = CURRENT_TIMESTAMP,
           search_count_reset_date = CASE 
             WHEN search_count_reset_date IS NULL THEN DATE('now')
             WHEN DATE(search_count_reset_date) < DATE('now', 'start of month') THEN DATE('now')
             ELSE search_count_reset_date
           END,
           search_count_monthly = CASE
             WHEN search_count_reset_date IS NULL THEN 0
             WHEN DATE(search_count_reset_date) < DATE('now', 'start of month') THEN 0
             ELSE search_count_monthly
           END
       WHERE email = ?`
    ).bind(email).run()

    // 업데이트된 사용자 정보 가져오기
    const updatedUser = await c.env.DB.prepare(
      'SELECT id, email, name, company, role, phone, auth_level, search_count_monthly FROM users WHERE email = ?'
    ).bind(email).first()

    // JWT 토큰 생성 (userId 포함)
    const token = generateSessionToken(updatedUser.id as number)
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7일

    // 세션 저장 (옵션)
    // await c.env.DB.prepare(
    //   'INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
    // ).bind(updatedUser.id, token, new Date(expiresAt).toISOString()).run()

    const searchRemaining = updatedUser.auth_level === 'verified' 
      ? null 
      : 10 - (updatedUser.search_count_monthly as number || 0)

    return c.json({
      success: true,
      message: '로그인 성공!',
      token: token,
      expiresAt: expiresAt,
      user: {
        ...updatedUser,
        searchRemaining: searchRemaining
      }
    })

  } catch (error) {
    console.error('Verify magic code error:', error)
    return c.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, 500)
  }
})

// Upgrade to Verified endpoint (Basic → Verified)
auth.post('/upgrade-to-verified', async (c) => {
  try {
    // 토큰에서 사용자 정보 가져오기
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: '로그인이 필요합니다.'
      }, 401)
    }

    const token = authHeader.substring(7)
    
    // 간단한 토큰 파싱 (실제로는 JWT 검증 필요)
    let userId: number
    try {
      userId = parseInt(atob(token))
    } catch {
      return c.json({
        success: false,
        error: '유효하지 않은 토큰입니다.'
      }, 401)
    }

    // 사용자 정보 확인
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first()

    if (!user) {
      return c.json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      }, 404)
    }

    // Basic 사용자만 업그레이드 가능
    if (user.auth_level !== 'basic') {
      return c.json({
        success: false,
        error: user.auth_level === 'verified' 
          ? '이미 정회원입니다.' 
          : '잘못된 요청입니다.'
      }, 400)
    }

    const { password, role, companyName, name, phone } = await c.req.json()

    // 비밀번호 검증
    if (!password || !isValidPassword(password)) {
      return c.json({
        success: false,
        error: '비밀번호는 최소 8자 이상이어야 합니다.',
        requirements: {
          minLength: 8,
          hasLetter: /[a-zA-Z]/.test(password),
          hasNumber: /[0-9]/.test(password)
        }
      }, 400)
    }

    // 역할 검증
    if (!role || !['shipper', 'forwarder'].includes(role)) {
      return c.json({
        success: false,
        error: '역할을 선택해주세요. (화주 또는 포워더)'
      }, 400)
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password)

    // 사용자 업데이트
    await c.env.DB.prepare(`
      UPDATE users
      SET password_hash = ?,
          auth_level = 'verified',
          role = ?,
          company = ?,
          name = ?,
          phone = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      passwordHash,
      role,
      companyName || null,
      name || null,
      phone || null,
      userId
    ).run()

    // 업데이트된 사용자 정보
    const updatedUser = await c.env.DB.prepare(
      'SELECT id, email, name, company, role, phone, auth_level FROM users WHERE id = ?'
    ).bind(userId).first()

    // 새 JWT 토큰 발급 (auth_level: verified, userId 포함)
    const newToken = generateSessionToken(userId)
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30일

    return c.json({
      success: true,
      message: '회원가입이 완료되었습니다! 🎉',
      token: newToken,
      expiresAt: expiresAt,
      user: updatedUser
    })

  } catch (error) {
    console.error('Upgrade to verified error:', error)
    return c.json({
      success: false,
      error: '업그레이드 중 오류가 발생했습니다.'
    }, 500)
  }
})

// Logout endpoint
auth.post('/logout', async (c) => {
  return c.json({ message: '로그아웃되었습니다.' })
})

// Get current user endpoint
auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: '인증이 필요합니다.' }, 401)
    }

    // In a real application, you would verify the token and get the user
    // For now, we'll return a mock response
    return c.json({
      message: '사용자 정보 조회 성공',
      user: {
        id: 1,
        email: 'user@example.com',
        name: '테스트 사용자',
        role: 'shipper'
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: '서버 오류가 발생했습니다.' }, 500)
  }
})

export default auth
