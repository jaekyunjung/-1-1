// 검색 횟수 제한 미들웨어
import { Context, Next } from 'hono'

type User = {
  id: number
  email: string
  auth_level: 'guest' | 'basic' | 'verified'
  search_count_monthly: number
  search_count_reset_date?: string
}

/**
 * 검색 횟수 제한 (Basic 사용자만)
 * Verified 사용자는 무제한
 */
export const checkSearchLimit = async (c: Context, next: Next) => {
  try {
    const user = c.get('user') as User
    
    if (!user) {
      return c.json({
        success: false,
        error: '로그인이 필요합니다.'
      }, 401)
    }

    // Verified 사용자는 무제한
    if (user.auth_level === 'verified') {
      c.set('searchRemaining', null) // 무제한
      await next()
      return
    }

    // 월별 검색 횟수 초기화 확인
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    let resetDate: Date | null = null
    if (user.search_count_reset_date) {
      resetDate = new Date(user.search_count_reset_date)
    }
    
    let searchCount = user.search_count_monthly || 0
    
    // 이번 달이 아니면 초기화
    const needsReset = !resetDate || 
      resetDate.getMonth() !== currentMonth || 
      resetDate.getFullYear() !== currentYear
    
    if (needsReset) {
      // 검색 카운트 초기화
      await c.env.DB.prepare(`
        UPDATE users 
        SET search_count_monthly = 0,
            search_count_reset_date = DATE('now')
        WHERE id = ?
      `).bind(user.id).run()
      
      searchCount = 0
    }
    
    // Basic 사용자: 월 10회 제한
    const SEARCH_LIMIT = 10
    
    if (searchCount >= SEARCH_LIMIT) {
      const nextMonth = new Date(currentYear, currentMonth + 1, 1)
      
      return c.json({
        success: false,
        error: '이번 달 검색 한도를 모두 사용했습니다.',
        message: '회원가입하시면 무제한으로 이용 가능합니다.',
        currentCount: searchCount,
        maxCount: SEARCH_LIMIT,
        resetDate: nextMonth.toISOString().split('T')[0],
        upgradeUrl: '/signup',
        benefits: [
          '무제한 선박 검색',
          '실시간 예약',
          'AI 가격 예측',
          '북마크 기능'
        ]
      }, 403)
    }
    
    // 검색 횟수 증가
    await c.env.DB.prepare(`
      UPDATE users 
      SET search_count_monthly = search_count_monthly + 1
      WHERE id = ?
    `).bind(user.id).run()
    
    // 검색 로그 기록
    const queryParams = c.req.query()
    await c.env.DB.prepare(`
      INSERT INTO search_logs (user_id, query_params, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).bind(user.id, JSON.stringify(queryParams)).run()
    
    // 남은 횟수를 context에 저장
    const remaining = SEARCH_LIMIT - searchCount - 1
    c.set('searchRemaining', remaining)
    
    await next()
    
  } catch (error) {
    console.error('Rate limit middleware error:', error)
    return c.json({
      success: false,
      error: '검색 제한 확인 중 오류가 발생했습니다.'
    }, 500)
  }
}

/**
 * 검색 카운트 초기화 (Cron 작업용)
 * 매월 1일에 실행
 */
export async function resetMonthlySearchCounts(DB: D1Database) {
  try {
    // 이번 달이 아닌 모든 사용자의 카운트 초기화
    const result = await DB.prepare(`
      UPDATE users 
      SET search_count_monthly = 0,
          search_count_reset_date = DATE('now')
      WHERE search_count_reset_date IS NULL 
         OR DATE(search_count_reset_date) < DATE('now', 'start of month')
    `).run()
    
    console.log(`Monthly search counts reset: ${result.meta.changes} users updated`)
    
    return result.meta.changes
  } catch (error) {
    console.error('Reset monthly counts error:', error)
    throw error
  }
}

/**
 * 사용자의 남은 검색 횟수 조회
 */
export async function getSearchRemaining(DB: D1Database, userId: number): Promise<number | null> {
  try {
    const user = await DB.prepare(
      'SELECT auth_level, search_count_monthly, search_count_reset_date FROM users WHERE id = ?'
    ).bind(userId).first() as User | null
    
    if (!user) return null
    
    // Verified 사용자는 무제한
    if (user.auth_level === 'verified') {
      return null
    }
    
    // 월별 초기화 확인
    const now = new Date()
    const resetDate = user.search_count_reset_date ? new Date(user.search_count_reset_date) : null
    
    let searchCount = user.search_count_monthly || 0
    
    if (!resetDate || 
        resetDate.getMonth() !== now.getMonth() || 
        resetDate.getFullYear() !== now.getFullYear()) {
      searchCount = 0
    }
    
    return Math.max(0, 10 - searchCount)
  } catch (error) {
    console.error('Get search remaining error:', error)
    return null
  }
}
