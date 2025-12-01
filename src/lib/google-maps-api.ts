/**
 * Google Maps Platform API Integration
 * 구글 지도 API를 사용하여 전 세계 항구 위치, 거리 계산, 경로 최적화
 * 
 * 주요 기능:
 * - Geocoding API: 주소 → 좌표 변환 (전 세계 지원)
 * - Distance Matrix API: 정확한 거리 및 소요 시간 계산
 * - Directions API: 최적 경로 계산
 * 
 * 무료 한도 (2025년 기준):
 * - Geocoding: 월 28,500회
 * - Distance Matrix: 월 28,500회
 * - Directions: 월 28,500회
 * 
 * @see https://developers.google.com/maps/documentation
 */

interface GoogleMapsEnv {
  GOOGLE_MAPS_API_KEY: string;
}

interface PortLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
  country: string;
  countryCode: string;
}

interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
  types: string[];
}

interface DistanceResult {
  from: string;
  to: string;
  distance: {
    meters: number;
    kilometers: number;
    nauticalMiles: number;
    text: string;
  };
  duration: {
    seconds: number;
    text: string;
  };
  status: string;
}

interface DirectionsResult {
  routes: Array<{
    summary: string;
    distance: { meters: number; text: string };
    duration: { seconds: number; text: string };
    steps: Array<{
      distance: { meters: number; text: string };
      duration: { seconds: number; text: string };
      instruction: string;
      startLocation: { lat: number; lng: number };
      endLocation: { lat: number; lng: number };
    }>;
    polyline: string;
  }>;
  status: string;
}

/**
 * 주요 항구 좌표 데이터베이스 (전 세계 24개 주요 항구)
 * Google Maps와 함께 사용하여 빠른 조회 제공
 */
export const MAJOR_PORTS: Record<string, PortLocation> = {
  // 한국 (South Korea)
  'busan': { 
    name: 'Busan Port', 
    address: 'Busan, South Korea', 
    lat: 35.1028, 
    lng: 129.0403, 
    country: 'South Korea',
    countryCode: 'KR'
  },
  'incheon': { 
    name: 'Incheon Port', 
    address: 'Incheon, South Korea', 
    lat: 37.4650, 
    lng: 126.6170, 
    country: 'South Korea',
    countryCode: 'KR'
  },
  'gwangyang': { 
    name: 'Gwangyang Port', 
    address: 'Gwangyang, South Korea', 
    lat: 34.9006, 
    lng: 127.7190, 
    country: 'South Korea',
    countryCode: 'KR'
  },
  'ulsan': { 
    name: 'Ulsan Port', 
    address: 'Ulsan, South Korea', 
    lat: 35.5014, 
    lng: 129.3869, 
    country: 'South Korea',
    countryCode: 'KR'
  },
  
  // 중국 (China)
  'shanghai': { 
    name: 'Shanghai Port', 
    address: 'Shanghai, China', 
    lat: 31.2304, 
    lng: 121.4737, 
    country: 'China',
    countryCode: 'CN'
  },
  'ningbo': { 
    name: 'Ningbo-Zhoushan Port', 
    address: 'Ningbo, Zhejiang, China', 
    lat: 29.8683, 
    lng: 121.5440, 
    country: 'China',
    countryCode: 'CN'
  },
  'shenzhen': { 
    name: 'Shenzhen Port', 
    address: 'Shenzhen, Guangdong, China', 
    lat: 22.5431, 
    lng: 114.0579, 
    country: 'China',
    countryCode: 'CN'
  },
  'guangzhou': { 
    name: 'Guangzhou Port', 
    address: 'Guangzhou, Guangdong, China', 
    lat: 23.1291, 
    lng: 113.2644, 
    country: 'China',
    countryCode: 'CN'
  },
  
  // 일본 (Japan)
  'tokyo': { 
    name: 'Tokyo Port', 
    address: 'Tokyo, Japan', 
    lat: 35.6581, 
    lng: 139.7594, 
    country: 'Japan',
    countryCode: 'JP'
  },
  'yokohama': { 
    name: 'Yokohama Port', 
    address: 'Yokohama, Kanagawa, Japan', 
    lat: 35.4437, 
    lng: 139.6380, 
    country: 'Japan',
    countryCode: 'JP'
  },
  'osaka': { 
    name: 'Osaka Port', 
    address: 'Osaka, Japan', 
    lat: 34.6520, 
    lng: 135.4305, 
    country: 'Japan',
    countryCode: 'JP'
  },
  'kobe': { 
    name: 'Kobe Port', 
    address: 'Kobe, Hyogo, Japan', 
    lat: 34.6814, 
    lng: 135.1781, 
    country: 'Japan',
    countryCode: 'JP'
  },
  
  // 싱가포르 (Singapore)
  'singapore': { 
    name: 'Port of Singapore', 
    address: 'Singapore', 
    lat: 1.2644, 
    lng: 103.8220, 
    country: 'Singapore',
    countryCode: 'SG'
  },
  
  // 미국 (United States)
  'losangeles': { 
    name: 'Port of Los Angeles', 
    address: 'Los Angeles, CA, USA', 
    lat: 33.7406, 
    lng: -118.2728, 
    country: 'United States',
    countryCode: 'US'
  },
  'longbeach': { 
    name: 'Port of Long Beach', 
    address: 'Long Beach, CA, USA', 
    lat: 33.7549, 
    lng: -118.2000, 
    country: 'United States',
    countryCode: 'US'
  },
  'newyork': { 
    name: 'Port of New York and New Jersey', 
    address: 'New York, NY, USA', 
    lat: 40.6694, 
    lng: -74.0419, 
    country: 'United States',
    countryCode: 'US'
  },
  'seattle': { 
    name: 'Port of Seattle', 
    address: 'Seattle, WA, USA', 
    lat: 47.6062, 
    lng: -122.3321, 
    country: 'United States',
    countryCode: 'US'
  },
  'houston': { 
    name: 'Port of Houston', 
    address: 'Houston, TX, USA', 
    lat: 29.7355, 
    lng: -95.2653, 
    country: 'United States',
    countryCode: 'US'
  },
  
  // 유럽 (Europe)
  'rotterdam': { 
    name: 'Port of Rotterdam', 
    address: 'Rotterdam, Netherlands', 
    lat: 51.9225, 
    lng: 4.4792, 
    country: 'Netherlands',
    countryCode: 'NL'
  },
  'hamburg': { 
    name: 'Port of Hamburg', 
    address: 'Hamburg, Germany', 
    lat: 53.5511, 
    lng: 9.9937, 
    country: 'Germany',
    countryCode: 'DE'
  },
  'antwerp': { 
    name: 'Port of Antwerp', 
    address: 'Antwerp, Belgium', 
    lat: 51.2194, 
    lng: 4.4025, 
    country: 'Belgium',
    countryCode: 'BE'
  },
  
  // 중동 (Middle East)
  'dubai': { 
    name: 'Port of Jebel Ali', 
    address: 'Dubai, UAE', 
    lat: 24.9857, 
    lng: 55.0272, 
    country: 'United Arab Emirates',
    countryCode: 'AE'
  },
  
  // 동남아시아 (Southeast Asia)
  'hongkong': { 
    name: 'Port of Hong Kong', 
    address: 'Hong Kong', 
    lat: 22.2908, 
    lng: 114.1501, 
    country: 'Hong Kong',
    countryCode: 'HK'
  },
  'bangkok': { 
    name: 'Port of Bangkok', 
    address: 'Bangkok, Thailand', 
    lat: 13.6554, 
    lng: 100.6205, 
    country: 'Thailand',
    countryCode: 'TH'
  },
};

/**
 * Google Maps API 클라이언트
 */
export class GoogleMapsClient {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(env: GoogleMapsEnv) {
    this.apiKey = env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Geocoding API: 주소를 좌표로 변환
   * @param address - 검색할 주소 (전 세계 지원)
   * @returns 위도/경도 및 상세 정보
   */
  async geocode(address: string): Promise<GeocodeResult | null> {
    const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}&language=ko`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data: any = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          address: address,
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          types: result.types
        };
      }

      console.warn(`Geocoding: ${data.status}`, data.error_message);
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Distance Matrix API: 두 지점 간 정확한 거리 및 소요 시간 계산
   * @param origins - 출발지 (좌표 또는 주소)
   * @param destinations - 도착지 (좌표 또는 주소)
   * @returns 거리 및 소요 시간
   */
  async getDistance(origins: string, destinations: string): Promise<DistanceResult | null> {
    const url = `${this.baseUrl}/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&key=${this.apiKey}&language=ko`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Distance Matrix failed: ${response.statusText}`);
      }

      const data: any = await response.json();

      if (data.status === 'OK' && data.rows && data.rows.length > 0) {
        const element = data.rows[0].elements[0];
        
        if (element.status === 'OK') {
          const meters = element.distance.value;
          const kilometers = meters / 1000;
          const nauticalMiles = meters / 1852;
          const seconds = element.duration.value;

          return {
            from: data.origin_addresses[0],
            to: data.destination_addresses[0],
            distance: {
              meters,
              kilometers: Math.round(kilometers * 100) / 100,
              nauticalMiles: Math.round(nauticalMiles * 100) / 100,
              text: element.distance.text
            },
            duration: {
              seconds,
              text: element.duration.text
            },
            status: element.status
          };
        }
      }

      console.warn(`Distance Matrix: ${data.status}`, data.error_message);
      return null;
    } catch (error) {
      console.error('Distance Matrix error:', error);
      throw error;
    }
  }

  /**
   * Directions API: 최적 경로 계산
   * @param origin - 출발지
   * @param destination - 도착지
   * @returns 경로 정보 및 단계별 안내
   */
  async getDirections(origin: string, destination: string): Promise<DirectionsResult | null> {
    const url = `${this.baseUrl}/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${this.apiKey}&language=ko`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Directions failed: ${response.statusText}`);
      }

      const data: any = await response.json();

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const routes = data.routes.map((route: any) => {
          const leg = route.legs[0];
          return {
            summary: route.summary,
            distance: {
              meters: leg.distance.value,
              text: leg.distance.text
            },
            duration: {
              seconds: leg.duration.value,
              text: leg.duration.text
            },
            steps: leg.steps.map((step: any) => ({
              distance: {
                meters: step.distance.value,
                text: step.distance.text
              },
              duration: {
                seconds: step.duration.value,
                text: step.duration.text
              },
              instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
              startLocation: {
                lat: step.start_location.lat,
                lng: step.start_location.lng
              },
              endLocation: {
                lat: step.end_location.lat,
                lng: step.end_location.lng
              }
            })),
            polyline: route.overview_polyline.points
          };
        });

        return {
          routes,
          status: data.status
        };
      }

      console.warn(`Directions: ${data.status}`, data.error_message);
      return null;
    } catch (error) {
      console.error('Directions error:', error);
      throw error;
    }
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
   * @param countryCode - 국가 코드 (예: 'KR', 'CN', 'JP', 'US')
   * @returns 항구 목록
   */
  getPortsByCountry(countryCode: string): PortLocation[] {
    return Object.values(MAJOR_PORTS).filter(
      (port) => port.countryCode === countryCode.toUpperCase()
    );
  }

  /**
   * 두 항구 간 거리 계산 (Google Distance Matrix API 사용)
   * @param fromPort - 출발 항구 코드
   * @param toPort - 도착 항구 코드
   * @returns 정확한 거리 정보
   */
  async calculatePortDistance(fromPort: string, toPort: string): Promise<DistanceResult | null> {
    const from = this.getPortLocation(fromPort);
    const to = this.getPortLocation(toPort);

    if (!from || !to) {
      return null;
    }

    const origins = `${from.lat},${from.lng}`;
    const destinations = `${to.lat},${to.lng}`;

    const result = await this.getDistance(origins, destinations);

    if (result) {
      return {
        ...result,
        from: `${from.name} (${from.countryCode})`,
        to: `${to.name} (${to.countryCode})`
      };
    }

    return null;
  }

  /**
   * Haversine 공식을 사용한 직선 거리 계산 (백업용)
   * Google API 호출 없이 빠른 계산 제공
   */
  calculateStraightDistance(lat1: number, lng1: number, lat2: number, lng2: number): {
    meters: number;
    kilometers: number;
    nauticalMiles: number;
  } {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const meters = R * c;
    const kilometers = meters / 1000;
    const nauticalMiles = meters / 1852;

    return {
      meters: Math.round(meters),
      kilometers: Math.round(kilometers * 100) / 100,
      nauticalMiles: Math.round(nauticalMiles * 100) / 100
    };
  }
}

/**
 * Google Maps API 클라이언트 생성
 */
export function createGoogleMapsClient(env: GoogleMapsEnv): GoogleMapsClient {
  return new GoogleMapsClient(env);
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
