/**
 * 네이버 지도 API Client
 * https://www.ncloud.com/product/applicationService/maps
 */

export interface GeocodeResult {
  latitude: number
  longitude: number
  roadAddress: string
  jibunAddress: string
}

export interface ReverseGeocodeResult {
  address: string
  country: string
  province: string
  city: string
  district: string
}

export interface PortCoordinate {
  lat: number
  lon: number
}

export class NaverMapsAPI {
  private clientId: string
  private clientSecret: string

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  /**
   * 주소 → 좌표 변환 (Geocoding)
   */
  async geocode(address: string): Promise<GeocodeResult | null> {
    const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`

    const response = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': this.clientId,
        'X-NCP-APIGW-API-KEY': this.clientSecret,
      },
    })

    if (!response.ok) {
      throw new Error(`Naver Maps API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.addresses && data.addresses.length > 0) {
      const addr = data.addresses[0]
      return {
        latitude: parseFloat(addr.y),
        longitude: parseFloat(addr.x),
        roadAddress: addr.roadAddress,
        jibunAddress: addr.jibunAddress,
      }
    }
    
    return null
  }

  /**
   * 좌표 → 주소 변환 (Reverse Geocoding)
   */
  async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
    const url = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lon},${lat}&output=json`

    const response = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': this.clientId,
        'X-NCP-APIGW-API-KEY': this.clientSecret,
      },
    })

    if (!response.ok) {
      throw new Error(`Naver Maps API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const region = data.results[0].region
      return {
        address: `${region.area1.name} ${region.area2.name} ${region.area3.name}`,
        country: region.area0.name,
        province: region.area1.name,
        city: region.area2.name,
        district: region.area3.name,
      }
    }
    
    return null
  }

  /**
   * 두 지점 간 거리 계산 (Haversine 공식)
   * @returns 거리 (km)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // 지구 반지름 (km)
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * 가장 가까운 항구 찾기
   */
  findNearestPort(lat: number, lon: number): { name: string; distance: number; coords: PortCoordinate } | null {
    let nearestPort = null
    let minDistance = Infinity
    
    for (const [portName, coords] of Object.entries(PORT_COORDINATES)) {
      const distance = this.calculateDistance(lat, lon, coords.lat, coords.lon)
      
      if (distance < minDistance) {
        minDistance = distance
        nearestPort = { 
          name: portName, 
          distance: Math.round(distance * 10) / 10, // 소수점 1자리
          coords 
        }
      }
    }
    
    return nearestPort
  }

  /**
   * 항구 간 거리 계산
   */
  calculatePortDistance(fromPort: string, toPort: string): number | null {
    const from = PORT_COORDINATES[fromPort as keyof typeof PORT_COORDINATES]
    const to = PORT_COORDINATES[toPort as keyof typeof PORT_COORDINATES]
    
    if (!from || !to) {
      return null
    }
    
    return this.calculateDistance(from.lat, from.lon, to.lat, to.lon)
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}

/**
 * 네이버 지도 API 인스턴스 생성 헬퍼
 */
export function createNaverMapsClient(env: any): NaverMapsAPI {
  if (!env.NAVER_MAP_CLIENT_ID || !env.NAVER_MAP_CLIENT_SECRET) {
    throw new Error('NAVER_MAP_CLIENT_ID 또는 NAVER_MAP_CLIENT_SECRET 환경 변수가 설정되지 않았습니다.')
  }
  return new NaverMapsAPI(env.NAVER_MAP_CLIENT_ID, env.NAVER_MAP_CLIENT_SECRET)
}

/**
 * 주요 항구 좌표
 */
export const PORT_COORDINATES = {
  // 한국
  BUSAN: { lat: 35.1028, lon: 129.0403 },
  INCHEON: { lat: 37.4563, lon: 126.7052 },
  GWANGYANG: { lat: 34.9406, lon: 127.6950 },
  ULSAN: { lat: 35.5384, lon: 129.3114 },
  PYEONGTAEK: { lat: 36.9950, lon: 126.8228 },
  
  // 중국
  SHANGHAI: { lat: 31.2304, lon: 121.4737 },
  NINGBO: { lat: 29.8683, lon: 121.5440 },
  SHENZHEN: { lat: 22.5431, lon: 114.0579 },
  QINGDAO: { lat: 36.0671, lon: 120.3826 },
  GUANGZHOU: { lat: 23.1291, lon: 113.2644 },
  
  // 일본
  TOKYO: { lat: 35.6528, lon: 139.8394 },
  YOKOHAMA: { lat: 35.4437, lon: 139.6380 },
  OSAKA: { lat: 34.6198, lon: 135.4305 },
  KOBE: { lat: 34.6901, lon: 135.1955 },
  NAGOYA: { lat: 35.0437, lon: 136.8097 },
  
  // 미국
  LOS_ANGELES: { lat: 33.7405, lon: -118.2716 },
  LONG_BEACH: { lat: 33.7701, lon: -118.1937 },
  NEW_YORK: { lat: 40.7128, lon: -74.0060 },
  SAVANNAH: { lat: 32.0809, lon: -81.0912 },
  SEATTLE: { lat: 47.6062, lon: -122.3321 },
  
  // 유럽
  ROTTERDAM: { lat: 51.9225, lon: 4.4792 },
  HAMBURG: { lat: 53.5511, lon: 9.9937 },
  ANTWERP: { lat: 51.2194, lon: 4.4025 },
  LE_HAVRE: { lat: 49.4944, lon: 0.1079 },
  FELIXSTOWE: { lat: 51.9568, lon: 1.3479 },
  
  // 동남아시아
  SINGAPORE: { lat: 1.2644, lon: 103.8223 },
  PORT_KLANG: { lat: 3.0044, lon: 101.3928 },
  BANGKOK: { lat: 13.7563, lon: 100.5018 },
  HO_CHI_MINH: { lat: 10.7769, lon: 106.7009 },
  MANILA: { lat: 14.5995, lon: 120.9842 },
  
  // 중동
  DUBAI: { lat: 25.2048, lon: 55.2708 },
  JEBEL_ALI: { lat: 25.0129, lon: 55.0764 },
  
  // 호주
  SYDNEY: { lat: -33.8688, lon: 151.2093 },
  MELBOURNE: { lat: -37.8136, lon: 144.9631 },
} as const

/**
 * 항구 이름 한글 매핑
 */
export const PORT_NAMES_KR: Record<string, string> = {
  BUSAN: '부산항',
  INCHEON: '인천항',
  GWANGYANG: '광양항',
  ULSAN: '울산항',
  PYEONGTAEK: '평택항',
  SHANGHAI: '상하이항',
  NINGBO: '닝보항',
  SHENZHEN: '선전항',
  QINGDAO: '칭다오항',
  GUANGZHOU: '광저우항',
  TOKYO: '도쿄항',
  YOKOHAMA: '요코하마항',
  OSAKA: '오사카항',
  KOBE: '고베항',
  NAGOYA: '나고야항',
  LOS_ANGELES: '로스앤젤레스항',
  LONG_BEACH: '롱비치항',
  NEW_YORK: '뉴욕항',
  SAVANNAH: '사바나항',
  SEATTLE: '시애틀항',
  ROTTERDAM: '로테르담항',
  HAMBURG: '함부르크항',
  ANTWERP: '앤트워프항',
  LE_HAVRE: '르아브르항',
  FELIXSTOWE: '펠릭스토항',
  SINGAPORE: '싱가포르항',
  PORT_KLANG: '포트클랑항',
  BANGKOK: '방콕항',
  HO_CHI_MINH: '호치민항',
  MANILA: '마닐라항',
  DUBAI: '두바이항',
  JEBEL_ALI: '제벨알리항',
  SYDNEY: '시드니항',
  MELBOURNE: '멜버른항',
}
