/**
 * MarineTraffic API Client
 * https://www.marinetraffic.com/en/ais-api-services
 */

export interface VesselPosition {
  MMSI: string
  LAT: number
  LON: number
  SPEED: number
  HEADING: number
  COURSE: number
  STATUS: string
  TIMESTAMP: string
  SHIP_ID: string
}

export interface PortCall {
  SHIP_ID: string
  MMSI: string
  SHIPNAME: string
  ARRIVAL: string
  DEPARTURE: string
  PORT_ID: number
  PORT_NAME: string
  SHIP_TYPE: string
  DRAUGHT: number
}

export interface VesselETA {
  MMSI: string
  SHIP_ID: string
  SHIPNAME: string
  PORT_ID: number
  PORT_NAME: string
  ETA: string
  CURRENT_PORT: string
  DISTANCE: number
}

export class MarineTrafficAPI {
  private apiKey: string
  private baseUrl = 'https://services.marinetraffic.com/api'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 선박 실시간 위치 조회
   * @param mmsi Maritime Mobile Service Identity
   * @param timespan 조회 시간 범위 (분)
   */
  async getVesselPosition(mmsi: string, timespan: number = 10): Promise<VesselPosition[]> {
    const url = `${this.baseUrl}/exportvessel/v:8/${this.apiKey}` +
      `/timespan:${timespan}/protocol:json/mmsi:${mmsi}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`MarineTraffic API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  /**
   * 다수 선박 위치 조회 (특정 영역)
   * @param minLat 최소 위도
   * @param maxLat 최대 위도
   * @param minLon 최소 경도
   * @param maxLon 최대 경도
   */
  async getVesselsInArea(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number
  ): Promise<VesselPosition[]> {
    const url = `${this.baseUrl}/exportvessels/v:8/${this.apiKey}` +
      `/protocol:json/minlat:${minLat}/maxlat:${maxLat}` +
      `/minlon:${minLon}/maxlon:${maxLon}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`MarineTraffic API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * 항구 도착/출발 이벤트 조회
   * @param portId 항구 ID
   * @param timespan 조회 기간 (일)
   */
  async getPortCalls(portId: number, timespan: number = 3): Promise<PortCall[]> {
    const url = `${this.baseUrl}/portcalls/v:3/${this.apiKey}` +
      `/portid:${portId}/timespan:${timespan}/protocol:json`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`MarineTraffic API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * 선박 도착 예정 시간 (ETA) 조회
   * @param mmsi Maritime Mobile Service Identity
   */
  async getVesselETA(mmsi: string): Promise<VesselETA[]> {
    const url = `${this.baseUrl}/expectedarrivals/v:3/${this.apiKey}` +
      `/mmsi:${mmsi}/protocol:json`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`MarineTraffic API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * 선박 경로 기록 조회
   * @param mmsi Maritime Mobile Service Identity
   * @param fromDate YYYY-MM-DD 형식
   * @param toDate YYYY-MM-DD 형식
   */
  async getVesselTrack(mmsi: string, fromDate: string, toDate: string) {
    const url = `${this.baseUrl}/exportvesseltrack/v:2/${this.apiKey}` +
      `/period:daily/mmsi:${mmsi}/fromdate:${fromDate}/todate:${toDate}/protocol:json`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`MarineTraffic API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * 선박 상세 정보 조회
   * @param mmsi Maritime Mobile Service Identity
   */
  async getVesselDetails(mmsi: string) {
    const url = `${this.baseUrl}/vessel-data/v:5/${this.apiKey}` +
      `/mmsi:${mmsi}/protocol:json`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`MarineTraffic API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * 특정 항로의 선박 목록
   * @param fromPort 출발 항구 ID
   * @param toPort 도착 항구 ID
   */
  async getRouteVessels(fromPort: number, toPort: number) {
    // 이 기능은 Enterprise Plan에서 사용 가능
    // Developer/Professional Plan에서는 별도 구현 필요
    throw new Error('이 기능은 Enterprise Plan에서만 사용 가능합니다.')
  }
}

/**
 * MarineTraffic API 인스턴스 생성 헬퍼
 */
export function createMarineTrafficClient(env: any): MarineTrafficAPI {
  if (!env.MARINE_TRAFFIC_API_KEY) {
    throw new Error('MARINE_TRAFFIC_API_KEY 환경 변수가 설정되지 않았습니다.')
  }
  return new MarineTrafficAPI(env.MARINE_TRAFFIC_API_KEY)
}

/**
 * 주요 항구 ID 매핑
 */
export const PORT_IDS = {
  // 한국
  BUSAN: 3837, // 부산항
  INCHEON: 3785, // 인천항
  GWANGYANG: 3810, // 광양항
  ULSAN: 3844, // 울산항

  // 중국
  SHANGHAI: 3359, // 상하이항
  NINGBO: 3358, // 닝보항
  SHENZHEN: 3371, // 선전항
  GUANGZHOU: 3377, // 광저우항
  QINGDAO: 3345, // 칭다오항

  // 일본
  TOKYO: 3302, // 도쿄항
  YOKOHAMA: 3303, // 요코하마항
  OSAKA: 3295, // 오사카항
  KOBE: 3296, // 고베항

  // 미국
  LOS_ANGELES: 3484, // 로스앤젤레스항
  LONG_BEACH: 3483, // 롱비치항
  NEW_YORK: 3817, // 뉴욕항
  SAVANNAH: 3826, // 사바나항

  // 유럽
  ROTTERDAM: 3066, // 로테르담항
  HAMBURG: 3099, // 함부르크항
  ANTWERP: 3067, // 앤트워프항
  LE_HAVRE: 3053, // 르아브르항

  // 동남아시아
  SINGAPORE: 3260, // 싱가포르항
  PORT_KLANG: 3272, // 포트클랑항
  BANGKOK: 3258, // 방콕항
  HO_CHI_MINH: 3264, // 호치민항
} as const

/**
 * 선박 상태 코드 해석
 */
export function getVesselStatusText(statusCode: string): string {
  const statusMap: Record<string, string> = {
    '0': '항해 중',
    '1': '정박 중',
    '2': '통제 불가',
    '3': '조종 능력 제한',
    '4': '흘수 제한',
    '5': '정박',
    '6': '좌초',
    '7': '어업 중',
    '8': '기관 항해',
    '9': '예비',
    '10': '예비',
    '11': '예비',
    '12': '예비',
    '13': '예비',
    '14': '예비',
    '15': '정의되지 않음',
  }
  return statusMap[statusCode] || '알 수 없음'
}
