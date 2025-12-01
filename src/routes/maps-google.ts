/**
 * Google Maps API Routes
 * 구글 지도 API를 활용한 항구 위치, 거리 계산, 경로 조회 엔드포인트
 */

import { Hono } from 'hono';
import { 
  createGoogleMapsClient, 
  formatDistance, 
  formatDuration,
  MAJOR_PORTS 
} from '../lib/google-maps-api';

type Bindings = {
  GOOGLE_MAPS_API_KEY: string;
};

const mapsGoogle = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/maps-google/ports
 * 모든 항구 목록 조회 (24개 주요 항구)
 */
mapsGoogle.get('/ports', (c) => {
  try {
    const ports = Object.entries(MAJOR_PORTS).map(([code, port]) => ({
      code,
      name: port.name,
      country: port.country,
      countryCode: port.countryCode,
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
 * GET /api/maps-google/ports/:code
 * 특정 항구 정보 조회
 */
mapsGoogle.get('/ports/:code', (c) => {
  try {
    const code = c.req.param('code');
    const maps = createGoogleMapsClient(c.env);
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
        countryCode: port.countryCode,
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
 * GET /api/maps-google/ports/country/:code
 * 특정 국가의 항구 목록 조회
 */
mapsGoogle.get('/ports/country/:code', (c) => {
  try {
    const countryCode = c.req.param('code');
    const maps = createGoogleMapsClient(c.env);
    const ports = maps.getPortsByCountry(countryCode);

    return c.json({
      success: true,
      country: countryCode.toUpperCase(),
      total: ports.length,
      ports: ports.map(port => {
        const code = Object.keys(MAJOR_PORTS).find(key => MAJOR_PORTS[key] === port);
        return {
          code,
          name: port.name,
          coordinates: {
            lat: port.lat,
            lng: port.lng
          },
          address: port.address
        };
      })
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
 * GET /api/maps-google/distance
 * 두 항구 간 거리 계산 (Google Distance Matrix API 사용)
 * Query: from=busan&to=shanghai
 */
mapsGoogle.get('/distance', async (c) => {
  try {
    const fromPort = c.req.query('from');
    const toPort = c.req.query('to');

    if (!fromPort || !toPort) {
      return c.json({
        success: false,
        error: '출발지(from)와 도착지(to)를 입력해주세요.'
      }, 400);
    }

    const maps = createGoogleMapsClient(c.env);
    const distance = await maps.calculatePortDistance(fromPort, toPort);

    if (!distance) {
      return c.json({
        success: false,
        error: '항구를 찾을 수 없거나 거리 계산에 실패했습니다.'
      }, 404);
    }

    return c.json({
      success: true,
      distance: {
        from: distance.from,
        to: distance.to,
        meters: distance.distance.meters,
        kilometers: distance.distance.kilometers,
        nauticalMiles: distance.distance.nauticalMiles,
        formatted: formatDistance(distance.distance.kilometers),
        estimatedDuration: {
          seconds: distance.duration.seconds,
          formatted: formatDuration(distance.duration.seconds),
          googleText: distance.duration.text
        }
      },
      provider: 'Google Distance Matrix API'
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
 * GET /api/maps-google/distance/straight
 * 두 항구 간 직선 거리 계산 (Haversine, API 호출 없음)
 * Query: from=busan&to=shanghai
 */
mapsGoogle.get('/distance/straight', (c) => {
  try {
    const fromPort = c.req.query('from');
    const toPort = c.req.query('to');

    if (!fromPort || !toPort) {
      return c.json({
        success: false,
        error: '출발지(from)와 도착지(to)를 입력해주세요.'
      }, 400);
    }

    const maps = createGoogleMapsClient(c.env);
    const from = maps.getPortLocation(fromPort);
    const to = maps.getPortLocation(toPort);

    if (!from || !to) {
      return c.json({
        success: false,
        error: '항구를 찾을 수 없습니다.'
      }, 404);
    }

    const distance = maps.calculateStraightDistance(from.lat, from.lng, to.lat, to.lng);
    
    // 예상 소요 시간 (평균 선박 속도: 20노트 = 37.04 km/h)
    const avgSpeedKmh = 37.04;
    const durationSeconds = (distance.kilometers / avgSpeedKmh) * 3600;

    return c.json({
      success: true,
      distance: {
        from: `${from.name} (${from.countryCode})`,
        to: `${to.name} (${to.countryCode})`,
        meters: distance.meters,
        kilometers: distance.kilometers,
        nauticalMiles: distance.nauticalMiles,
        formatted: formatDistance(distance.kilometers),
        estimatedDuration: {
          seconds: Math.round(durationSeconds),
          formatted: formatDuration(durationSeconds)
        }
      },
      provider: 'Haversine Formula (Straight Line)',
      note: 'This is a straight-line distance, not actual maritime route'
    });
  } catch (error: any) {
    console.error('Calculate straight distance error:', error);
    return c.json({ 
      success: false, 
      error: error.message || '직선 거리 계산 실패' 
    }, 500);
  }
});

/**
 * GET /api/maps-google/directions
 * 최적 경로 조회 (Google Directions API)
 * Query: from=busan&to=shanghai
 */
mapsGoogle.get('/directions', async (c) => {
  try {
    const fromPort = c.req.query('from');
    const toPort = c.req.query('to');

    if (!fromPort || !toPort) {
      return c.json({
        success: false,
        error: '출발지(from)와 도착지(to)를 입력해주세요.'
      }, 400);
    }

    const maps = createGoogleMapsClient(c.env);
    const from = maps.getPortLocation(fromPort);
    const to = maps.getPortLocation(toPort);

    if (!from || !to) {
      return c.json({
        success: false,
        error: '항구를 찾을 수 없습니다.'
      }, 404);
    }

    const origins = `${from.lat},${from.lng}`;
    const destinations = `${to.lat},${to.lng}`;

    const directions = await maps.getDirections(origins, destinations);

    if (!directions || directions.routes.length === 0) {
      return c.json({
        success: false,
        error: '경로를 찾을 수 없습니다.'
      }, 404);
    }

    return c.json({
      success: true,
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
      routes: directions.routes.map(route => ({
        summary: route.summary,
        distance: {
          meters: route.distance.meters,
          kilometers: Math.round(route.distance.meters / 1000 * 100) / 100,
          nauticalMiles: Math.round(route.distance.meters / 1852 * 100) / 100,
          text: route.distance.text
        },
        duration: {
          seconds: route.duration.seconds,
          formatted: formatDuration(route.duration.seconds),
          text: route.duration.text
        },
        steps: route.steps.length,
        polyline: route.polyline
      })),
      provider: 'Google Directions API'
    });
  } catch (error: any) {
    console.error('Get directions error:', error);
    return c.json({ 
      success: false, 
      error: error.message || '경로 조회 실패' 
    }, 500);
  }
});

/**
 * GET /api/maps-google/geocode
 * 주소를 좌표로 변환 (Google Geocoding API)
 * Query: address=Busan Port, South Korea
 */
mapsGoogle.get('/geocode', async (c) => {
  try {
    const address = c.req.query('address');

    if (!address) {
      return c.json({
        success: false,
        error: '주소(address)를 입력해주세요.'
      }, 400);
    }

    const maps = createGoogleMapsClient(c.env);
    const result = await maps.geocode(address);

    if (!result) {
      return c.json({
        success: false,
        error: '주소를 찾을 수 없습니다.'
      }, 404);
    }

    return c.json({
      success: true,
      geocode: {
        address: result.address,
        formattedAddress: result.formattedAddress,
        coordinates: {
          lat: result.lat,
          lng: result.lng
        },
        placeId: result.placeId,
        types: result.types
      },
      provider: 'Google Geocoding API'
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
 * GET /api/maps-google/batch-geocode
 * 여러 주소를 한 번에 좌표로 변환
 * Query: addresses=Busan Port,Shanghai Port,LA Port (쉼표로 구분)
 */
mapsGoogle.get('/batch-geocode', async (c) => {
  try {
    const addressesParam = c.req.query('addresses');

    if (!addressesParam) {
      return c.json({
        success: false,
        error: '주소 목록(addresses)을 입력해주세요. (쉼표로 구분)'
      }, 400);
    }

    const addresses = addressesParam.split(',').map(addr => addr.trim());
    
    if (addresses.length > 10) {
      return c.json({
        success: false,
        error: '최대 10개의 주소만 처리할 수 있습니다.'
      }, 400);
    }

    const maps = createGoogleMapsClient(c.env);
    const results = await Promise.all(
      addresses.map(async (address) => {
        try {
          const result = await maps.geocode(address);
          return {
            address,
            success: !!result,
            result: result ? {
              formattedAddress: result.formattedAddress,
              coordinates: {
                lat: result.lat,
                lng: result.lng
              }
            } : null
          };
        } catch (error) {
          return {
            address,
            success: false,
            error: 'Geocoding failed'
          };
        }
      })
    );

    return c.json({
      success: true,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
      provider: 'Google Geocoding API'
    });
  } catch (error: any) {
    console.error('Batch geocode error:', error);
    return c.json({ 
      success: false, 
      error: error.message || '일괄 지오코딩 실패' 
    }, 500);
  }
});

export default mapsGoogle;
