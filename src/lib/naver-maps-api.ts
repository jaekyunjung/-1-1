/**
 * Naver Maps API Integration
 * 네이버 지도 API를 사용하여 항구 위치, 선박 경로를 시각화합니다.
 * 
 * 주요 기능:
 * - 항구 위치 지오코딩 (주소 → 좌표)
 * - 선박 경로 표시
 * - 거리 계산
 * 
 * @see https://developers.naver.com/docs/serviceapi/search/local/local.md
 */

interface NaverMapsEnv {
  NAVER_MAPS_CLIENT_ID: string;
  NAVER_MAPS_CLIENT_SECRET: string;
}

interface PortLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
  country: string;
}

interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
  status: string;
}

interface DistanceResult {
  from: string;
  to: string;
  distance: number; // meters
  distanceKm: number;
  distanceNm: number; // nautical miles
  duration: number; // seconds (estimated)
}

/**
 * 주요 항구 좌표 데이터베이스
 * 실제 환경에서는 D1 Database에서 조회하는 것을 권장합니다.
 */
export const MAJOR_PORTS: Record<string, PortLocation> = {
  // 한국
  'busan': { name: 'Busan Port', address: '부산광역시 중구 중앙동4가', lat: 35.1028, lng: 129.0403, country: 'KR' },
  'incheon': { name: 'Incheon Port', address: '인천광역시 중구 항동7가', lat: 37.4650, lng: 126.6170, country: 'KR' },
  'gwangyang': { name: 'Gwangyang Port', address: '전라남도 광양시 광양읍', lat: 34.9006, lng: 127.7190, country: 'KR' },
  'ulsan': { name: 'Ulsan Port', address: '울산광역시 남구 장생포고래로', lat: 35.5014, lng: 129.3869, country: 'KR' },
  
  // 중국
  'shanghai': { name: 'Shanghai Port', address: 'Shanghai, China', lat: 31.2304, lng: 121.4737, country: 'CN' },
  'ningbo': { name: 'Ningbo Port', address: 'Ningbo, Zhejiang, China', lat: 29.8683, lng: 121.5440, country: 'CN' },
  'shenzhen': { name: 'Shenzhen Port', address: 'Shenzhen, Guangdong, China', lat: 22.5431, lng: 114.0579, country: 'CN' },
  'guangzhou': { name: 'Guangzhou Port', address: 'Guangzhou, Guangdong, China', lat: 23.1291, lng: 113.2644, country: 'CN' },
  
  // 일본
  'tokyo': { name: 'Tokyo Port', address: 'Tokyo, Japan', lat: 35.6581, lng: 139.7594, country: 'JP' },
  'yokohama': { name: 'Yokohama Port', address: 'Yokohama, Kanagawa, Japan', lat: 35.4437, lng: 139.6380, country: 'JP' },
  'osaka': { name: 'Osaka Port', address: 'Osaka, Japan', lat: 34.6520, lng: 135.4305, country: 'JP' },
  'kobe': { name: 'Kobe Port', address: 'Kobe, Hyogo, Japan', lat: 34.6814, lng: 135.1781, country: 'JP' },
  
  // 싱가포르
  'singapore': { name: 'Singapore Port', address: 'Singapore', lat: 1.2644, lng: 103.8220, country: 'SG' },
  
  // 미국
  'losangeles': { name: 'Los Angeles Port', address: 'Los Angeles, CA, USA', lat: 33.7406, lng: -118.2728, country: 'US' },
  'longbeach': { name: 'Long Beach Port', address: 'Long Beach, CA, USA', lat: 33.7549, lng: -118.2000, country: 'US' },
  'newyork': { name: 'New York Port', address: 'New York, NY, USA', lat: 40.6694, lng: -74.0419, country: 'US' },
  'seattle': { name: 'Seattle Port', address: 'Seattle, WA, USA', lat: 47.6062, lng: -122.3321, country: 'US' },
  
  // 유럽
  'rotterdam': { name: 'Rotterdam Port', address: 'Rotterdam, Netherlands', lat: 51.9225, lng: 4.4792, country: 'NL' },
  'hamburg': { name: 'Hamburg Port', address: 'Hamburg, Germany', lat: 53.5511, lng: 9.9937, country: 'DE' },
  'antwerp': { name: 'Antwerp Port', address: 'Antwerp, Belgium', lat: 51.2194, lng: 4.4025, country: 'BE' },
};

/**
 * 네이버 지도 API 클라이언트
 */
export class NaverMapsClient {
  private clientId: string;
  private clientSecret: string;

  constructor(env: NaverMapsEnv) {
    this.clientId = env.NAVER_MAPS_CLIENT_ID;
    this.clientSecret = env.NAVER_MAPS_CLIENT_SECRET;
  }

  /**
   * 주소를 좌표로 변환 (지오코딩)
   * @param address - 검색할 주소
   * @returns 위도/경도 좌표
   */
  async geocode(address: string): Promise<GeocodeResult> {
    const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;

    try {
      const response = await fetch(url, {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': this.clientId,
          'X-NCP-APIGW-API-KEY': this.clientSecret,
        },
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data: any = await response.json();

      if (data.addresses && data.addresses.length > 0) {
        const result = data.addresses[0];
        return {
          address: result.roadAddress || result.jibunAddress,
          lat: parseFloat(result.y),
          lng: parseFloat(result.x),
          status: 'OK',
        };
      }

      return {
        address,
        lat: 0,
        lng: 0,
        status: 'ZERO_RESULTS',
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * 좌표를 주소로 변환 (역지오코딩)
   * @param lat - 위도
   * @param lng - 경도
   * @returns 주소
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    const url = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&output=json&orders=roadaddr,addr`;

    try {
      const response = await fetch(url, {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': this.clientId,
          'X-NCP-APIGW-API-KEY': this.clientSecret,
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.statusText}`);
      }

      const data: any = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const region = result.region;
        const land = result.land;

        return `${region.area1.name} ${region.area2.name} ${region.area3.name} ${land?.name || ''}`.trim();
      }

      return 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * 두 지점 간 거리 계산 (Haversine formula)
   * @param lat1 - 출발지 위도
   * @param lng1 - 출발지 경도
   * @param lat2 - 도착지 위도
   * @param lng2 - 도착지 경도
   * @returns 거리 정보 (미터, 킬로미터, 해리)
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): DistanceResult {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // 미터
    const distanceKm = distance / 1000; // 킬로미터
    const distanceNm = distance / 1852; // 해리 (nautical miles)

    // 예상 소요 시간 (평균 선박 속도: 20노트 = 37.04 km/h)
    const avgSpeedKmh = 37.04;
    const duration = (distanceKm / avgSpeedKmh) * 3600; // 초

    return {
      from: `${lat1},${lng1}`,
      to: `${lat2},${lng2}`,
      distance: Math.round(distance),
      distanceKm: Math.round(distanceKm * 100) / 100,
      distanceNm: Math.round(distanceNm * 100) / 100,
      duration: Math.round(duration),
    };
  }

  /**
   * 항구 코드로 위치 정보 조회
   * @param portCode - 항구 코드 (예: 'busan', 'shanghai')
   * @returns 항구 위치 정보
   */
  getPortLocation(portCode: string): PortLocation | null {
    const port = MAJOR_PORTS[portCode.toLowerCase()];
    return port || null;
  }

  /**
   * 모든 항구 목록 조회
   * @returns 항구 목록
   */
  getAllPorts(): PortLocation[] {
    return Object.values(MAJOR_PORTS);
  }

  /**
   * 특정 국가의 항구 목록 조회
   * @param countryCode - 국가 코드 (예: 'KR', 'CN', 'JP')
   * @returns 항구 목록
   */
  getPortsByCountry(countryCode: string): PortLocation[] {
    return Object.values(MAJOR_PORTS).filter(
      (port) => port.country === countryCode.toUpperCase()
    );
  }

  /**
   * 두 항구 간 거리 계산
   * @param fromPort - 출발 항구 코드
   * @param toPort - 도착 항구 코드
   * @returns 거리 정보
   */
  calculatePortDistance(fromPort: string, toPort: string): DistanceResult | null {
    const from = this.getPortLocation(fromPort);
    const to = this.getPortLocation(toPort);

    if (!from || !to) {
      return null;
    }

    const result = this.calculateDistance(from.lat, from.lng, to.lat, to.lng);

    return {
      ...result,
      from: `${from.name} (${from.country})`,
      to: `${to.name} (${to.country})`,
    };
  }

  /**
   * 선박 경로 중간 지점 계산 (지도에 경로 표시용)
   * @param lat1 - 출발지 위도
   * @param lng1 - 출발지 경도
   * @param lat2 - 도착지 위도
   * @param lng2 - 도착지 경도
   * @param segments - 경로 분할 개수 (기본값: 10)
   * @returns 경로 좌표 배열
   */
  generateRoutePath(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    segments: number = 10
  ): { lat: number; lng: number }[] {
    const path: { lat: number; lng: number }[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const lat = lat1 + (lat2 - lat1) * t;
      const lng = lng1 + (lng2 - lng1) * t;
      path.push({ lat, lng });
    }

    return path;
  }
}

/**
 * 네이버 지도 API 클라이언트 생성
 */
export function createNaverMapsClient(env: NaverMapsEnv): NaverMapsClient {
  return new NaverMapsClient(env);
}

/**
 * 거리 포맷팅 유틸리티
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(2)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}

/**
 * 소요 시간 포맷팅 유틸리티
 */
export function formatDuration(durationSeconds: number): string {
  const days = Math.floor(durationSeconds / 86400);
  const hours = Math.floor((durationSeconds % 86400) / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}일 ${hours}시간`;
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  } else {
    return `${minutes}분`;
  }
}
