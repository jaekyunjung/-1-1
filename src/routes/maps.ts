/**
 * Maps API Routes
 * 네이버 지도 API를 활용한 항구 위치, 선박 경로 조회 엔드포인트
 */

import { Hono } from 'hono';
import { 
  createNaverMapsClient, 
  formatDistance, 
  formatDuration,
  MAJOR_PORTS 
} from '../lib/naver-maps-api';

type Bindings = {
  NAVER_MAPS_CLIENT_ID: string;
  NAVER_MAPS_CLIENT_SECRET: string;
};

const maps = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/maps/ports
 * 모든 항구 목록 조회
 */
maps.get('/ports', (c) => {
  try {
    const ports = Object.values(MAJOR_PORTS).map(port => ({
      code: Object.keys(MAJOR_PORTS).find(key => MAJOR_PORTS[key] === port),
      name: port.name,
      country: port.country,
      coordinates: {
        lat: port.lat,
        lng: port.lng
      },
      address: port.address
    }));

    return c.json({
      success: true,
      total: ports.length,
      ports
    });
  } catch (error: any) {
    console.error('Get ports error:', error);
    return c.json({ 
      success: false, 
      error: error.message || '항구 목록 조회 실패' 
    }, 500);
  }
});

/**
 * GET /api/maps/ports/:code
 * 특정 항구 정보 조회
 */
maps.get('/ports/:code', (c) => {
  try {
    const code = c.req.param('code');
    const maps = createNaverMapsClient(c.env);
    const port = maps.getPortLocation(code);

    if (!port) {
      return c.json({
        success: false,
        error: `항구를 찾을 수 없습니다: ${code}`
      }, 404);
    }

    return c.json({
      success: true,
      port: {
        code,
        name: port.name,
        country: port.country,
        coordinates: {
          lat: port.lat,
          lng: port.lng
        },
        address: port.address
      }
    });
  } catch (error: any) {
    console.error('Get port error:', error);
    return c.json({ 
      success: false, 
      error: error.message || '항구 정보 조회 실패' 
    }, 500);
  }
});

/**
 * GET /api/maps/ports/country/:code
 * 특정 국가의 항구 목록 조회
 */
maps.get('/ports/country/:code', (c) => {
  try {
    const countryCode = c.req.param('code');
    const maps = createNaverMapsClient(c.env);
    const ports = maps.getPortsByCountry(countryCode);

    return c.json({
      success: true,
      country: countryCode.toUpperCase(),
      total: ports.length,
      ports: ports.map(port => ({
        code: Object.keys(MAJOR_PORTS).find(key => MAJOR_PORTS[key] === port),
        name: port.name,
        coordinates: {
          lat: port.lat,
          lng: port.lng
        },
        address: port.address
      }))
    });
  } catch (error: any) {
    console.error('Get ports by country error:', error);
    return c.json({ 
      success: false, 
      error: error.message || '국가별 항구 조회 실패' 
    }, 500);
  }
});

/**
 * GET /api/maps/distance
 * 두 항구 간 거리 계산
 * Query: from=busan&to=shanghai
 */
maps.get('/distance', (c) => {
  try {
    const fromPort = c.req.query('from');
    const toPort = c.req.query('to');

    if (!fromPort || !toPort) {
      return c.json({
        success: false,
        error: '출발지(from)와 도착지(to)를 입력해주세요.'
      }, 400);
    }

    const maps = createNaverMapsClient(c.env);
    const distance = maps.calculatePortDistance(fromPort, toPort);

    if (!distance) {
      return c.json({
        success: false,
        error: '항구를 찾을 수 없습니다. 유효한 항구 코드를 입력해주세요.'
      }, 404);
    }

    return c.json({
      success: true,
      distance: {
        from: distance.from,
        to: distance.to,
        meters: distance.distance,
        kilometers: distance.distanceKm,
        nauticalMiles: distance.distanceNm,
        formatted: formatDistance(distance.distanceKm),
        estimatedDuration: {
          seconds: distance.duration,
          formatted: formatDuration(distance.duration)
        }
      }
    });
  } catch (error: any) {
    console.error('Calculate distance error:', error);
    return c.json({ 
      success: false, 
      error: error.message || '거리 계산 실패' 
    }, 500);
  }
});

/**
 * GET /api/maps/route
 * 선박 경로 좌표 생성
 * Query: from=busan&to=shanghai&segments=20
 */
maps.get('/route', (c) => {
  try {
    const fromPort = c.req.query('from');
    const toPort = c.req.query('to');
    const segments = parseInt(c.req.query('segments') || '10');

    if (!fromPort || !toPort) {
      return c.json({
        success: false,
        error: '출발지(from)와 도착지(to)를 입력해주세요.'
      }, 400);
    }

    const maps = createNaverMapsClient(c.env);
    const from = maps.getPortLocation(fromPort);
    const to = maps.getPortLocation(toPort);

    if (!from || !to) {
      return c.json({
        success: false,
        error: '항구를 찾을 수 없습니다. 유효한 항구 코드를 입력해주세요.'
      }, 404);
    }

    const path = maps.generateRoutePath(from.lat, from.lng, to.lat, to.lng, segments);
    const distance = maps.calculatePortDistance(fromPort, toPort);

    return c.json({
      success: true,
      route: {
        from: {
          code: fromPort,
          name: from.name,
          coordinates: { lat: from.lat, lng: from.lng }
        },
        to: {
          code: toPort,
          name: to.name,
          coordinates: { lat: to.lat, lng: to.lng }
        },
        path,
        segments: path.length,
        distance: distance ? {
          kilometers: distance.distanceKm,
          nauticalMiles: distance.distanceNm,
          formatted: formatDistance(distance.distanceKm),
          estimatedDuration: formatDuration(distance.duration)
        } : null
      }
    });
  } catch (error: any) {
    console.error('Generate route error:', error);
    return c.json({ 
      success: false, 
      error: error.message || '경로 생성 실패' 
    }, 500);
  }
});

/**
 * GET /api/maps/geocode
 * 주소를 좌표로 변환
 * Query: address=부산광역시 중구
 */
maps.get('/geocode', async (c) => {
  try {
    const address = c.req.query('address');

    if (!address) {
      return c.json({
        success: false,
        error: '주소(address)를 입력해주세요.'
      }, 400);
    }

    const maps = createNaverMapsClient(c.env);
    const result = await maps.geocode(address);

    if (result.status !== 'OK') {
      return c.json({
        success: false,
        error: '주소를 찾을 수 없습니다.'
      }, 404);
    }

    return c.json({
      success: true,
      geocode: {
        address: result.address,
        coordinates: {
          lat: result.lat,
          lng: result.lng
        }
      }
    });
  } catch (error: any) {
    console.error('Geocode error:', error);
    return c.json({ 
      success: false, 
      error: error.message || '지오코딩 실패' 
    }, 500);
  }
});

/**
 * GET /api/maps/reverse-geocode
 * 좌표를 주소로 변환
 * Query: lat=35.1028&lng=129.0403
 */
maps.get('/reverse-geocode', async (c) => {
  try {
    const lat = parseFloat(c.req.query('lat') || '0');
    const lng = parseFloat(c.req.query('lng') || '0');

    if (!lat || !lng) {
      return c.json({
        success: false,
        error: '위도(lat)와 경도(lng)를 입력해주세요.'
      }, 400);
    }

    const maps = createNaverMapsClient(c.env);
    const address = await maps.reverseGeocode(lat, lng);

    return c.json({
      success: true,
      reverseGeocode: {
        coordinates: { lat, lng },
        address
      }
    });
  } catch (error: any) {
    console.error('Reverse geocode error:', error);
    return c.json({ 
      success: false, 
      error: error.message || '역지오코딩 실패' 
    }, 500);
  }
});

export default maps;
