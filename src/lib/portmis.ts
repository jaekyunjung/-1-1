/**
 * 국토교통부 항만운영정보시스템 (PORT-MIS) API Client
 * https://new.portmis.go.kr/
 * https://www.data.go.kr/ (공공데이터 포털에서 서비스키 발급)
 */

export interface PortArrival {
  portKorNm: string // 항만명
  vsslKorNm: string // 선박명
  nationKorNm: string // 국적
  callDate: string // 입항일자
  callTime: string // 입항시간
  berthNm: string // 접안지
  shipType: string // 선종
  gt: number // 총톤수
  dwt: number // 재화중량톤수
}

export interface PortDeparture {
  portKorNm: string // 항만명
  vsslKorNm: string // 선박명
  nationKorNm: string // 국적
  departDate: string // 출항일자
  departTime: string // 출항시간
  berthNm: string // 접안지
  shipType: string // 선종
}

export class PortMISAPI {
  private serviceKey: string
  private baseUrl = 'http://apis.data.go.kr/1192000'

  constructor(serviceKey: string) {
    this.serviceKey = serviceKey
  }

  /**
   * 입항 선박 목록 조회
   * @param portCode 항만 코드 (예: KR-PUS = 부산항)
   * @param callDate 입항일자 (YYYYMMDD)
   */
  async getPortArrivals(portCode: string, callDate: string): Promise<PortArrival[]> {
    const url = `${this.baseUrl}/VesslArivlInfoService/getVesslArivlList` +
      `?serviceKey=${this.serviceKey}` +
      `&portCode=${portCode}` +
      `&callDate=${callDate}` +
      `&numOfRows=100` +
      `&pageNo=1` +
      `&_type=json`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`PORT-MIS API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // 응답 구조: response.body.items.item[]
    if (data.response?.body?.items?.item) {
      return Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item]
    }
    
    return []
  }

  /**
   * 출항 선박 목록 조회
   * @param portCode 항만 코드
   * @param departDate 출항일자 (YYYYMMDD)
   */
  async getPortDepartures(portCode: string, departDate: string): Promise<PortDeparture[]> {
    const url = `${this.baseUrl}/VesslDprtInfoService/getVesslDprtList` +
      `?serviceKey=${this.serviceKey}` +
      `&portCode=${portCode}` +
      `&departDate=${departDate}` +
      `&numOfRows=100` +
      `&pageNo=1` +
      `&_type=json`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`PORT-MIS API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.response?.body?.items?.item) {
      return Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item]
    }
    
    return []
  }

  /**
   * 항만 시설 현황 조회
   * @param portCode 항만 코드
   */
  async getPortFacilities(portCode: string) {
    const url = `${this.baseUrl}/PortFacilityService/getPortFacilityList` +
      `?serviceKey=${this.serviceKey}` +
      `&portCode=${portCode}` +
      `&numOfRows=100` +
      `&pageNo=1` +
      `&_type=json`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`PORT-MIS API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.response?.body?.items?.item) {
      return Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item]
    }
    
    return []
  }

  /**
   * 선박 입출항 통계
   * @param portCode 항만 코드
   * @param startDate 시작일자 (YYYYMMDD)
   * @param endDate 종료일자 (YYYYMMDD)
   */
  async getPortStatistics(portCode: string, startDate: string, endDate: string) {
    // 입항 데이터
    const arrivals = await this.getPortArrivals(portCode, startDate)
    
    // 출항 데이터
    const departures = await this.getPortDepartures(portCode, startDate)
    
    return {
      totalArrivals: arrivals.length,
      totalDepartures: departures.length,
      arrivals: arrivals,
      departures: departures,
      period: {
        start: startDate,
        end: endDate
      }
    }
  }
}

/**
 * PORT-MIS API 인스턴스 생성 헬퍼
 */
export function createPortMISClient(env: any): PortMISAPI {
  if (!env.PORTMIS_SERVICE_KEY) {
    throw new Error('PORTMIS_SERVICE_KEY 환경 변수가 설정되지 않았습니다.')
  }
  return new PortMISAPI(env.PORTMIS_SERVICE_KEY)
}

/**
 * 한국 주요 항만 코드
 */
export const KOREA_PORT_CODES = {
  BUSAN: 'KR-PUS', // 부산항
  INCHEON: 'KR-ICN', // 인천항
  GWANGYANG: 'KR-KWY', // 광양항
  ULSAN: 'KR-USN', // 울산항
  PYEONGTAEK: 'KR-PTK', // 평택항
  GUNSAN: 'KR-KUV', // 군산항
  YEOSU: 'KR-YOS', // 여수항
  MOKPO: 'KR-MPK', // 목포항
  POHANG: 'KR-KPO', // 포항항
  DONGHAE: 'KR-KDH', // 동해항
} as const

/**
 * 선종 코드 해석
 */
export function getShipTypeText(shipType: string): string {
  const shipTypeMap: Record<string, string> = {
    '1': '화물선',
    '2': '컨테이너선',
    '3': '벌크선',
    '4': '탱커',
    '5': 'LNG선',
    '6': 'LPG선',
    '7': '자동차운반선',
    '8': '여객선',
    '9': '예인선',
    '10': '어선',
    '99': '기타'
  }
  return shipTypeMap[shipType] || '알 수 없음'
}

/**
 * 날짜 포맷 변환 (YYYY-MM-DD → YYYYMMDD)
 */
export function formatDateForAPI(date: string): string {
  return date.replace(/-/g, '')
}

/**
 * 날짜 포맷 변환 (YYYYMMDD → YYYY-MM-DD)
 */
export function formatDateForDisplay(date: string): string {
  return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
}
