// 권한 검증 미들웨어
import { Context, Next } from 'hono'

type User = {
  id: number
  email: string
  name?: string
  company?: string
  role?: string
  phone?: string
  auth_level: 'guest' | 'basic' | 'verified'
  search_count_monthly: number
  search_count_reset_date?: string
  last_login_at?: string
}

/**
 * JWT 토큰에서 사용자 ID 추출 (간단한 구현)
 * 실제 환경에서는 JWT 라이브러리 사용 권장
 * 
 * 토큰 형식: base64(userId:timestamp)
 * generateSessionToken()과 호환되는 형식
 */
function extractUserIdFromToken(token: string): number | null {
  try {
    // base64 디코딩
    const decoded = atob(token)
    
    // userId:timestamp 형식 파싱
    const parts = decoded.split(':')
    if (parts.length >= 1) {
      const userId = parseInt(parts[0])
      return isNaN(userId) ? null : userId
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * JWT 토큰 검증 및 사용자 인증
 * Authorization: Bearer <token> 헤더에서 토큰 추출
 */
export const requireAuth = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: '로그인이 필요합니다.',
        loginUrl: '/login'
      }, 401)
    }

    const token = authHeader.substring(7)
    
    // 토큰에서 사용자 ID 추출
    const userId = extractUserIdFromToken(token)
    
    if (!userId) {
      return c.json({
        success: false,
        error: '유효하지 않은 토큰입니다.',
        loginUrl: '/login'
      }, 401)
    }

    // 데이터베이스에서 사용자 정보 가져오기
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, company, role, phone, auth_level, search_count_monthly, search_count_reset_date, last_login_at FROM users WHERE id = ?'
    ).bind(userId).first() as User | null

    if (!user) {
      return c.json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
        loginUrl: '/login'
      }, 401)
    }

    // 사용자 정보를 context에 주입
    c.set('user', user)
    
    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({
      success: false,
      error: '인증 처리 중 오류가 발생했습니다.'
    }, 500)
  }
}

/**
 * Basic 권한 이상 필요
 * requireAuth 이후에 사용해야 함
 */
export const requireBasic = async (c: Context, next: Next) => {
  const user = c.get('user') as User
  
  if (!user) {
    return c.json({
      success: false,
      error: '인증이 필요합니다.',
      loginUrl: '/login'
    }, 401)
  }

  if (!['basic', 'verified'].includes(user.auth_level)) {
    return c.json({
      success: false,
      error: '이 기능은 회원 전용입니다.',
      message: '이메일 인증만으로 간편하게 시작하세요.',
      currentLevel: user.auth_level,
      requiredLevel: 'basic',
      upgradeUrl: '/login'
    }, 403)
  }
  
  await next()
}

/**
 * Verified 권한 필요
 * requireAuth 이후에 사용해야 함
 */
export const requireVerified = async (c: Context, next: Next) => {
  const user = c.get('user') as User
  
  if (!user) {
    return c.json({
      success: false,
      error: '인증이 필요합니다.',
      loginUrl: '/login'
    }, 401)
  }

  if (user.auth_level !== 'verified') {
    return c.json({
      success: false,
      error: '이 기능은 정회원 전용입니다.',
      message: '30초만에 간편 가입하고 모든 기능을 이용하세요.',
      currentLevel: user.auth_level,
      requiredLevel: 'verified',
      upgradeUrl: '/signup',
      benefits: [
        '무제한 선박 검색',
        '실시간 예약',
        'AI 추천 서비스',
        '가격 알림',
        '전용 고객 지원'
      ]
    }, 403)
  }
  
  await next()
}

/**
 * 사용자 정보 추출 헬퍼 함수
 */
export function getUser(c: Context): User | null {
  return c.get('user') || null
}
