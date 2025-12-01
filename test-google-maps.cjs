/**
 * Google Maps API 테스트 스크립트
 * 
 * 실행 방법:
 * 1. .dev.vars 파일에 GOOGLE_MAPS_API_KEY 설정
 * 2. node test-google-maps.js
 * 
 * ⚠️ 주의: 이 테스트는 실제 Google Maps API를 호출합니다.
 * 무료 한도: 월 28,500회
 */

// .dev.vars에서 API 키 읽기
const fs = require('fs');
const path = require('path');

let GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';

try {
  const devVarsPath = path.join(__dirname, '.dev.vars');
  const devVarsContent = fs.readFileSync(devVarsPath, 'utf-8');
  const match = devVarsContent.match(/GOOGLE_MAPS_API_KEY=(.+)/);
  if (match && match[1] !== 'YOUR_API_KEY_HERE') {
    GOOGLE_MAPS_API_KEY = match[1].trim();
  }
} catch (error) {
  console.warn('⚠️  .dev.vars 파일을 읽을 수 없습니다. 기본값 사용.');
}

const BASE_URL = 'https://maps.googleapis.com/maps/api';

// 주요 항구 좌표
const PORTS = {
  busan: { name: '부산항', lat: 35.1028, lng: 129.0403 },
  shanghai: { name: '상하이항', lat: 31.2304, lng: 121.4737 },
  losangeles: { name: 'LA항', lat: 33.7406, lng: -118.2728 },
  singapore: { name: '싱가포르항', lat: 1.2644, lng: 103.8220 }
};

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testGeocodingAPI() {
  console.log('\n🗺️ 1. Geocoding API 테스트 (주소 → 좌표)');
  console.log('=' .repeat(60));

  if (GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    log('yellow', '⚠️  API 키가 설정되지 않았습니다. 이 테스트를 건너뜁니다.');
    log('yellow', '   .dev.vars 파일에 GOOGLE_MAPS_API_KEY를 설정하세요.');
    return;
  }

  const address = 'Busan Port, South Korea';
  const url = `${BASE_URL}/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}&language=ko`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      log('green', `✅ 주소: ${address}`);
      log('cyan', `   → 결과: ${result.formatted_address}`);
      log('cyan', `   → 위도: ${result.geometry.location.lat}`);
      log('cyan', `   → 경도: ${result.geometry.location.lng}`);
      log('cyan', `   → Place ID: ${result.place_id}`);
    } else {
      log('red', `❌ 실패: ${data.status}`);
      if (data.error_message) {
        log('red', `   오류: ${data.error_message}`);
      }
    }
  } catch (error) {
    log('red', `❌ 오류: ${error.message}`);
  }
}

async function testDistanceMatrixAPI() {
  console.log('\n🗺️ 2. Distance Matrix API 테스트 (거리 계산)');
  console.log('=' .repeat(60));

  if (GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    log('yellow', '⚠️  API 키가 설정되지 않았습니다. 이 테스트를 건너뜁니다.');
    return;
  }

  const from = PORTS.busan;
  const to = PORTS.shanghai;
  const origins = `${from.lat},${from.lng}`;
  const destinations = `${to.lat},${to.lng}`;
  const url = `${BASE_URL}/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${GOOGLE_MAPS_API_KEY}&language=ko`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows && data.rows.length > 0) {
      const element = data.rows[0].elements[0];
      
      if (element.status === 'OK') {
        const distanceKm = element.distance.value / 1000;
        const distanceNm = element.distance.value / 1852;
        
        log('green', `✅ ${from.name} → ${to.name}`);
        log('cyan', `   → 거리: ${element.distance.text} (${distanceKm.toFixed(2)} km / ${distanceNm.toFixed(2)} NM)`);
        log('cyan', `   → 소요 시간: ${element.duration.text}`);
      } else {
        log('red', `❌ Element 상태: ${element.status}`);
      }
    } else {
      log('red', `❌ 실패: ${data.status}`);
      if (data.error_message) {
        log('red', `   오류: ${data.error_message}`);
      }
    }
  } catch (error) {
    log('red', `❌ 오류: ${error.message}`);
  }
}

async function testDirectionsAPI() {
  console.log('\n🗺️ 3. Directions API 테스트 (경로 안내)');
  console.log('=' .repeat(60));

  if (GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    log('yellow', '⚠️  API 키가 설정되지 않았습니다. 이 테스트를 건너뜁니다.');
    return;
  }

  const from = PORTS.busan;
  const to = PORTS.shanghai;
  const origin = `${from.lat},${from.lng}`;
  const destination = `${to.lat},${to.lng}`;
  const url = `${BASE_URL}/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}&language=ko`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];
      
      log('green', `✅ ${from.name} → ${to.name} 경로`);
      log('cyan', `   → 거리: ${leg.distance.text}`);
      log('cyan', `   → 소요 시간: ${leg.duration.text}`);
      log('cyan', `   → 경로 요약: ${route.summary || 'N/A'}`);
      log('cyan', `   → 단계 수: ${leg.steps.length}개`);
    } else {
      log('red', `❌ 실패: ${data.status}`);
      if (data.error_message) {
        log('red', `   오류: ${data.error_message}`);
      }
    }
  } catch (error) {
    log('red', `❌ 오류: ${error.message}`);
  }
}

function testHaversineFormula() {
  console.log('\n🗺️ 4. Haversine 공식 테스트 (직선 거리, API 호출 없음)');
  console.log('=' .repeat(60));

  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  const routes = [
    { from: 'busan', to: 'shanghai', name: '부산 → 상하이' },
    { from: 'busan', to: 'losangeles', name: '부산 → 로스앤젤레스' },
    { from: 'busan', to: 'singapore', name: '부산 → 싱가포르' }
  ];

  routes.forEach(route => {
    const from = PORTS[route.from];
    const to = PORTS[route.to];
    const distance = calculateDistance(from.lat, from.lng, to.lat, to.lng);
    const distanceKm = distance / 1000;
    const distanceNm = distance / 1852;

    // 예상 소요 시간 (평균 선박 속도: 20노트 = 37.04 km/h)
    const avgSpeedKmh = 37.04;
    const durationHours = distanceKm / avgSpeedKmh;
    const days = Math.floor(durationHours / 24);
    const hours = Math.floor(durationHours % 24);

    log('green', `✅ ${route.name}`);
    log('cyan', `   → 거리: ${distanceKm.toFixed(2)} km / ${distanceNm.toFixed(2)} NM (해리)`);
    log('cyan', `   → 예상 소요 시간: 약 ${days}일 ${hours}시간 (20노트 기준)`);
  });
}

function testPortDatabase() {
  console.log('\n🗺️ 5. 항구 데이터베이스 테스트');
  console.log('=' .repeat(60));

  log('green', `✅ 등록된 항구: ${Object.keys(PORTS).length}개`);
  
  Object.entries(PORTS).forEach(([code, port]) => {
    log('cyan', `   ${code.padEnd(12)} - ${port.name.padEnd(15)} (${port.lat}, ${port.lng})`);
  });

  log('yellow', '\n💡 전체 24개 항구는 src/lib/google-maps-api.ts의 MAJOR_PORTS에 등록되어 있습니다.');
}

async function testAPIKeyStatus() {
  console.log('\n🗺️ 0. API 키 상태 확인');
  console.log('=' .repeat(60));

  if (GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    log('red', '❌ Google Maps API 키가 설정되지 않았습니다.');
    log('yellow', '\n📋 설정 방법:');
    log('yellow', '   1. https://console.cloud.google.com/ 접속');
    log('yellow', '   2. 프로젝트 생성 (ShipShare)');
    log('yellow', '   3. APIs & Services → Library → Maps JavaScript API, Geocoding API, Distance Matrix API 활성화');
    log('yellow', '   4. Credentials → Create Credentials → API Key 생성');
    log('yellow', '   5. .dev.vars 파일에 GOOGLE_MAPS_API_KEY=YOUR_KEY 추가');
    log('yellow', '\n📚 자세한 가이드: GOOGLE_MAPS_SETUP.md 참고\n');
    return false;
  } else {
    log('green', '✅ Google Maps API 키가 설정되었습니다.');
    log('cyan', `   키: ${GOOGLE_MAPS_API_KEY.substring(0, 20)}...`);
    return true;
  }
}

async function runAllTests() {
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(10) + 'Google Maps API 통합 테스트' + ' '.repeat(17) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  const hasApiKey = await testAPIKeyStatus();

  // Haversine과 항구 DB는 API 키 없이도 작동
  testHaversineFormula();
  testPortDatabase();

  if (hasApiKey) {
    // API 키가 있을 때만 실제 API 테스트
    await testGeocodingAPI();
    await testDistanceMatrixAPI();
    await testDirectionsAPI();

    console.log('\n' + '═'.repeat(60));
    log('green', '✅ 모든 테스트 완료!');
    console.log('═'.repeat(60));

    log('cyan', '\n📝 다음 단계:');
    log('cyan', '   1. API 엔드포인트 테스트: curl http://localhost:3000/api/maps-google/ports');
    log('cyan', '   2. 거리 계산 테스트: curl "http://localhost:3000/api/maps-google/distance?from=busan&to=shanghai"');
    log('cyan', '   3. 지오코딩 테스트: curl "http://localhost:3000/api/maps-google/geocode?address=Busan Port"');
  } else {
    console.log('\n' + '═'.repeat(60));
    log('yellow', '⚠️  API 키 설정 후 다시 테스트하세요.');
    console.log('═'.repeat(60));
  }

  log('blue', '\n💰 비용 정보:');
  log('blue', '   - 무료 한도: 월 28,500 요청 (Geocoding, Distance Matrix, Directions)');
  log('blue', '   - 초과 시: $5 / 1,000 요청');
  log('blue', '   - Haversine 계산은 무료 (API 호출 없음)');
}

// 테스트 실행
runAllTests().catch(console.error);
