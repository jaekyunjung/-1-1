import { Hono } from 'hono'
import { hashPassword, verifyPassword, generateSessionToken, isValidEmail, isValidPassword } from '../lib/auth'

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

    // Generate session token
    const token = generateSessionToken()
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

    // Generate session token
    const token = generateSessionToken()
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
