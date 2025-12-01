import { Hono } from 'hono'
import { requireAuth, requireBasic } from '../middleware/auth.middleware'
import { checkSearchLimit } from '../middleware/rate-limit.middleware'

type Bindings = {
  DB: D1Database;
}

const vessels = new Hono<{ Bindings: Bindings }>()

// Search vessels (Basic 이상, 검색 횟수 제한)
vessels.get('/search', 
  requireAuth,
  requireBasic,
  checkSearchLimit,
  async (c) => {
  try {
    const departure = c.req.query('departure')
    const arrival = c.req.query('arrival')
    const date = c.req.query('date')
    const containerType = c.req.query('containerType')

    // Port name mapping (English to Korean)
    const portMapping: { [key: string]: string } = {
      'busan': '부산',
      'incheon': '인천',
      'gwangyang': '광양',
      'ulsan': '울산',
      'pyeongtaek': '평택',
      'shanghai': '상하이',
      'ningbo': '닝보',
      'shenzhen': '선전',
      'hongkong': '홍콩',
      'tokyo': '도쿄',
      'yokohama': '요코하마',
      'singapore': '싱가포르',
      'la': 'LA',
      'los angeles': 'LA',
      'new york': '뉴욕',
      'newyork': '뉴욕',
      'rotterdam': '로테르담',
      'hamburg': '함부르크',
      'antwerp': '앤트워프'
    }

    // Normalize search terms (check English mapping first)
    const normalizeDeparture = departure ? (portMapping[departure.toLowerCase()] || departure) : null
    const normalizeArrival = arrival ? (portMapping[arrival.toLowerCase()] || arrival) : null

    let query = `
      SELECT 
        v.*,
        GROUP_CONCAT(
          vc.container_type || ':' || vc.available_quantity || ':' || vc.price_per_unit
        ) as container_info
      FROM vessels v
      LEFT JOIN vessel_containers vc ON v.id = vc.vessel_id
      WHERE v.status = 'available'
    `
    
    const params: any[] = []

    if (normalizeDeparture) {
      query += ' AND v.departure_port LIKE ?'
      params.push(`%${normalizeDeparture}%`)
    }

    if (normalizeArrival) {
      query += ' AND v.arrival_port LIKE ?'
      params.push(`%${normalizeArrival}%`)
    }

    if (date) {
      query += ' AND v.departure_date >= ?'
      params.push(date)
    }

    if (containerType) {
      query += ' AND vc.container_type = ?'
      params.push(containerType)
    }

    query += ' GROUP BY v.id ORDER BY v.departure_date ASC'

    const stmt = c.env.DB.prepare(query)
    const result = await stmt.bind(...params).all()

    // Parse container info
    const vessels = result.results.map((vessel: any) => {
      const containers: any[] = []
      if (vessel.container_info) {
        const containerParts = vessel.container_info.split(',')
        containerParts.forEach((part: string) => {
          const [type, quantity, price] = part.split(':')
          containers.push({
            type,
            available: parseInt(quantity),
            price: parseFloat(price)
          })
        })
      }
      
      const { container_info, ...vesselData } = vessel
      return {
        ...vesselData,
        containers
      }
    })

    // 남은 검색 횟수 추가
    const searchRemaining = c.get('searchRemaining')
    const user = c.get('user')
    
    return c.json({
      success: true,
      count: vessels.length,
      vessels,
      searchInfo: {
        remaining: searchRemaining,
        authLevel: user?.auth_level,
        isUnlimited: user?.auth_level === 'verified'
      }
    })

  } catch (error) {
    console.error('Search error:', error)
    return c.json({ error: '검색 중 오류가 발생했습니다.' }, 500)
  }
})

// Get vessel by ID
vessels.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const vessel = await c.env.DB.prepare(
      'SELECT * FROM vessels WHERE id = ?'
    ).bind(id).first()

    if (!vessel) {
      return c.json({ error: '선박을 찾을 수 없습니다.' }, 404)
    }

    const containers = await c.env.DB.prepare(
      'SELECT * FROM vessel_containers WHERE vessel_id = ?'
    ).bind(id).all()

    return c.json({
      success: true,
      vessel: {
        ...vessel,
        containers: containers.results
      }
    })

  } catch (error) {
    console.error('Get vessel error:', error)
    return c.json({ error: '선박 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// Get all vessels (for list view)
vessels.get('/', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM vessels WHERE status = ? ORDER BY departure_date ASC LIMIT 50'
    ).bind('available').all()

    return c.json({
      success: true,
      count: result.results.length,
      vessels: result.results
    })

  } catch (error) {
    console.error('Get vessels error:', error)
    return c.json({ error: '선박 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

export default vessels
