import { Hono } from 'hono'

type Bindings = {
  MTIS_API_KEY: string;
}

const mtis = new Hono<{ Bindings: Bindings }>()

// MTIS API 기본 URL
const MTIS_BASE_URL = 'https://mtisopenapi.komsa.or.kr'

/**
 * 실시간 선박 위치 조회
 * GET /api/mtis/vessel-position?callSign=XXXX
 */
mtis.get('/vessel-position', async (c) => {
  try {
    const callSign = c.req.query('callSign')
    
    if (!callSign) {
      return c.json({ 
        success: false, 
        message: '호출부호(callSign)가 필요합니다.' 
      }, 400)
    }

    const apiKey = c.env.MTIS_API_KEY || '9da0fa5aa5af26a16022855af03e6cf3a8aa2f7a6b0e704b7118db870bc2d003eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYWVreXVuMjM4NTIwMjUuMTIuMDIuMTEuNDEuMjIiLCJyb2xlcyI6IkdOUiIsImlhdCI6MTc2NDY0MzI4MiwiZXhwIjoxNzY0NjQ1MDgyfQ.4cpEncqIqYKhqSSJDVf5G7n0PDOTnpXO6Ftew8I_KUc'

    // MTIS API 호출 (실제 엔드포인트는 문서 확인 필요)
    const response = await fetch(`${MTIS_BASE_URL}/api/vessel/position?callSign=${callSign}&serviceKey=${apiKey}`)
    
    if (!response.ok) {
      throw new Error(`MTIS API 오류: ${response.statusText}`)
    }

    const data = await response.json()

    return c.json({
      success: true,
      data: data
    })

  } catch (error: any) {
    console.error('MTIS API 오류:', error)
    return c.json({ 
      success: false, 
      message: '선박 위치 조회 중 오류가 발생했습니다.',
      error: error.message 
    }, 500)
  }
})

/**
 * 여객선 실시간 운항 정보 (PATIS)
 * GET /api/mtis/passenger-ship?terminalId=XXXX
 */
mtis.get('/passenger-ship', async (c) => {
  try {
    const terminalId = c.req.query('terminalId')
    
    if (!terminalId) {
      return c.json({ 
        success: false, 
        message: '터미널ID(terminalId)가 필요합니다.' 
      }, 400)
    }

    const apiKey = c.env.MTIS_API_KEY || '9da0fa5aa5af26a16022855af03e6cf3a8aa2f7a6b0e704b7118db870bc2d003eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYWVreXVuMjM4NTIwMjUuMTIuMDIuMTEuNDEuMjIiLCJyb2xlcyI6IkdOUiIsImlhdCI6MTc2NDY0MzI4MiwiZXhwIjoxNzY0NjQ1MDgyfQ.4cpEncqIqYKhqSSJDVf5G7n0PDOTnpXO6Ftew8I_KUc'

    const response = await fetch(`${MTIS_BASE_URL}/api/patis/ship?terminalId=${terminalId}&serviceKey=${apiKey}`)
    
    if (!response.ok) {
      throw new Error(`MTIS API 오류: ${response.statusText}`)
    }

    const data = await response.json()

    return c.json({
      success: true,
      data: data
    })

  } catch (error: any) {
    console.error('MTIS API 오류:', error)
    return c.json({ 
      success: false, 
      message: '여객선 정보 조회 중 오류가 발생했습니다.',
      error: error.message 
    }, 500)
  }
})

/**
 * 해양교통량 조회 (5분 단위)
 * GET /api/mtis/traffic?gridId=XXXX
 */
mtis.get('/traffic', async (c) => {
  try {
    const gridId = c.req.query('gridId') // 해양격자 ID
    
    if (!gridId) {
      return c.json({ 
        success: false, 
        message: '격자ID(gridId)가 필요합니다.' 
      }, 400)
    }

    const apiKey = c.env.MTIS_API_KEY || '9da0fa5aa5af26a16022855af03e6cf3a8aa2f7a6b0e704b7118db870bc2d003eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYWVreXVuMjM4NTIwMjUuMTIuMDIuMTEuNDEuMjIiLCJyb2xlcyI6IkdOUiIsImlhdCI6MTc2NDY0MzI4MiwiZXhwIjoxNzY0NjQ1MDgyfQ.4cpEncqIqYKhqSSJDVf5G7n0PDOTnpXO6Ftew8I_KUc'

    const response = await fetch(`${MTIS_BASE_URL}/api/traffic?gridId=${gridId}&serviceKey=${apiKey}`)
    
    if (!response.ok) {
      throw new Error(`MTIS API 오류: ${response.statusText}`)
    }

    const data = await response.json()

    return c.json({
      success: true,
      data: data
    })

  } catch (error: any) {
    console.error('MTIS API 오류:', error)
    return c.json({ 
      success: false, 
      message: '해양교통량 조회 중 오류가 발생했습니다.',
      error: error.message 
    }, 500)
  }
})

/**
 * 부산항 실시간 입출항 선박 조회
 * GET /api/mtis/busan-port
 */
mtis.get('/busan-port', async (c) => {
  try {
    const apiKey = c.env.MTIS_API_KEY || '9da0fa5aa5af26a16022855af03e6cf3a8aa2f7a6b0e704b7118db870bc2d003eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYWVreXVuMjM4NTIwMjUuMTIuMDIuMTEuNDEuMjIiLCJyb2xlcyI6IkdOUiIsImlhdCI6MTc2NDY0MzI4MiwiZXhwIjoxNzY0NjQ1MDgyfQ.4cpEncqIqYKhqSSJDVf5G7n0PDOTnpXO6Ftew8I_KUc'

    // 부산항 코드 (실제 코드는 MTIS 문서 확인 필요)
    const portCode = 'KRPUS' 

    const response = await fetch(`${MTIS_BASE_URL}/api/port/vessels?portCode=${portCode}&serviceKey=${apiKey}`)
    
    if (!response.ok) {
      throw new Error(`MTIS API 오류: ${response.statusText}`)
    }

    const data = await response.json()

    return c.json({
      success: true,
      data: data,
      port: '부산항',
      portCode: portCode
    })

  } catch (error: any) {
    console.error('MTIS API 오류:', error)
    return c.json({ 
      success: false, 
      message: '부산항 입출항 정보 조회 중 오류가 발생했습니다.',
      error: error.message 
    }, 500)
  }
})

/**
 * 인천항 실시간 입출항 선박 조회
 * GET /api/mtis/incheon-port
 */
mtis.get('/incheon-port', async (c) => {
  try {
    const apiKey = c.env.MTIS_API_KEY || '9da0fa5aa5af26a16022855af03e6cf3a8aa2f7a6b0e704b7118db870bc2d003eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYWVreXVuMjM4NTIwMjUuMTIuMDIuMTEuNDEuMjIiLCJyb2xlcyI6IkdOUiIsImlhdCI6MTc2NDY0MzI4MiwiZXhwIjoxNzY0NjQ1MDgyfQ.4cpEncqIqYKhqSSJDVf5G7n0PDOTnpXO6Ftew8I_KUc'

    // 인천항 코드
    const portCode = 'KRINC'

    const response = await fetch(`${MTIS_BASE_URL}/api/port/vessels?portCode=${portCode}&serviceKey=${apiKey}`)
    
    if (!response.ok) {
      throw new Error(`MTIS API 오류: ${response.statusText}`)
    }

    const data = await response.json()

    return c.json({
      success: true,
      data: data,
      port: '인천항',
      portCode: portCode
    })

  } catch (error: any) {
    console.error('MTIS API 오류:', error)
    return c.json({ 
      success: false, 
      message: '인천항 입출항 정보 조회 중 오류가 발생했습니다.',
      error: error.message 
    }, 500)
  }
})

/**
 * MTIS API 테스트 엔드포인트
 * GET /api/mtis/test
 */
mtis.get('/test', async (c) => {
  const apiKey = c.env.MTIS_API_KEY || '9da0fa5aa5af26a16022855af03e6cf3a8aa2f7a6b0e704b7118db870bc2d003eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYWVreXVuMjM4NTIwMjUuMTIuMDIuMTEuNDEuMjIiLCJyb2xlcyI6IkdOUiIsImlhdCI6MTc2NDY0MzI4MiwiZXhwIjoxNzY0NjQ1MDgyfQ.4cpEncqIqYKhqSSJDVf5G7n0PDOTnpXO6Ftew8I_KUc'

  return c.json({
    success: true,
    message: 'MTIS API 연동 준비 완료',
    apiKey: apiKey.substring(0, 20) + '...',
    endpoints: {
      vesselPosition: '/api/mtis/vessel-position?callSign=XXXX',
      passengerShip: '/api/mtis/passenger-ship?terminalId=XXXX',
      traffic: '/api/mtis/traffic?gridId=XXXX',
      busanPort: '/api/mtis/busan-port',
      incheonPort: '/api/mtis/incheon-port'
    },
    note: '실제 엔드포인트는 MTIS Open API 문서를 참조하세요.'
  })
})

export default mtis
