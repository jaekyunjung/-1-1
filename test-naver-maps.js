/**
 * 네이버 지도 API 테스트 스크립트
 * 실행: node test-naver-maps.js
 */

const CLIENT_ID = 'ZjmPu7PtB7hiA34OLCu8';
const CLIENT_SECRET = 'KvepjQsv1P';

// 주요 항구 좌표 (MAJOR_PORTS에서)
const PORTS = {
  busan: { name: '부산항', lat: 35.1028, lng: 129.0403 },
  shanghai: { name: '상하이항', lat: 31.2304, lng: 121.4737 },
  losangeles: { name: 'LA항', lat: 33.7406, lng: -118.2728 },
  singapore: { name: '싱가포르항', lat: 1.2644, lng: 103.8220 }
};

// Haversine 거리 계산 공식
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

  const distance = R * c; // 미터
  const distanceKm = distance / 1000; // 킬로미터
  const distanceNm = distance / 1852; // 해리

  return { distance, distanceKm, distanceNm };
}

async function testGeocoding() {
  console.log('\n🗺️ 1. 지오코딩 테스트 (주소 → 좌표)');
  console.log('=' .repeat(60));

  const address = '부산광역시 중구 중앙동4가';
  const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
        'X-NCP-APIGW-API-KEY': CLIENT_SECRET
      }
    });

    if (!response.ok) {
      console.error(`❌ 실패: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    
    if (data.addresses && data.addresses.length > 0) {
      const result = data.addresses[0];
      console.log(`✅ 주소: ${result.roadAddress || result.jibunAddress}`);
      console.log(`   위도: ${result.y}`);
      console.log(`   경도: ${result.x}`);
    } else {
      console.log('❌ 결과 없음');
    }
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

async function testReverseGeocoding() {
  console.log('\n🗺️ 2. 역지오코딩 테스트 (좌표 → 주소)');
  console.log('=' .repeat(60));

  const { lat, lng } = PORTS.busan;
  const url = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&output=json&orders=roadaddr,addr`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
        'X-NCP-APIGW-API-KEY': CLIENT_SECRET
      }
    });

    if (!response.ok) {
      console.error(`❌ 실패: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const region = result.region;
      const land = result.land;
      const address = `${region.area1.name} ${region.area2.name} ${region.area3.name} ${land?.name || ''}`.trim();
      
      console.log(`✅ 좌표: ${lat}, ${lng}`);
      console.log(`   주소: ${address}`);
    } else {
      console.log('❌ 결과 없음');
    }
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

function testDistanceCalculation() {
  console.log('\n🗺️ 3. 거리 계산 테스트 (Haversine)');
  console.log('=' .repeat(60));

  const routes = [
    { from: 'busan', to: 'shanghai', name: '부산 → 상하이' },
    { from: 'busan', to: 'losangeles', name: '부산 → 로스앤젤레스' },
    { from: 'busan', to: 'singapore', name: '부산 → 싱가포르' },
    { from: 'shanghai', to: 'losangeles', name: '상하이 → 로스앤젤레스' }
  ];

  routes.forEach(route => {
    const from = PORTS[route.from];
    const to = PORTS[route.to];
    const result = calculateDistance(from.lat, from.lng, to.lat, to.lng);
    
    // 예상 소요 시간 (평균 선박 속도: 20노트 = 37.04 km/h)
    const avgSpeedKmh = 37.04;
    const durationHours = result.distanceKm / avgSpeedKmh;
    const days = Math.floor(durationHours / 24);
    const hours = Math.floor(durationHours % 24);

    console.log(`\n✅ ${route.name}`);
    console.log(`   출발: ${from.name} (${from.lat}, ${from.lng})`);
    console.log(`   도착: ${to.name} (${to.lat}, ${to.lng})`);
    console.log(`   거리: ${result.distanceKm.toFixed(2)} km / ${result.distanceNm.toFixed(2)} NM (해리)`);
    console.log(`   소요 시간: 약 ${days}일 ${hours}시간 (20노트 기준)`);
  });
}

async function testPortDatabase() {
  console.log('\n🗺️ 4. 항구 데이터베이스 테스트');
  console.log('=' .repeat(60));

  console.log(`\n✅ 등록된 항구: ${Object.keys(PORTS).length}개`);
  
  Object.entries(PORTS).forEach(([code, port]) => {
    console.log(`   ${code.padEnd(12)} - ${port.name.padEnd(15)} (${port.lat}, ${port.lng})`);
  });
}

async function runAllTests() {
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(10) + '네이버 지도 API 통합 테스트' + ' '.repeat(17) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  // 1. 지오코딩 테스트
  await testGeocoding();

  // 2. 역지오코딩 테스트
  await testReverseGeocoding();

  // 3. 거리 계산 테스트
  testDistanceCalculation();

  // 4. 항구 데이터베이스
  await testPortDatabase();

  console.log('\n' + '═'.repeat(60));
  console.log('✅ 모든 테스트 완료!');
  console.log('═'.repeat(60));

  console.log('\n📝 다음 단계:');
  console.log('   1. 네이버 개발자센터에서 Maps API 권한 추가');
  console.log('   2. API 엔드포인트 테스트: curl http://localhost:3000/api/maps/ports');
  console.log('   3. 거리 계산 테스트: curl "http://localhost:3000/api/maps/distance?from=busan&to=shanghai"');
}

// 테스트 실행
runAllTests().catch(console.error);
