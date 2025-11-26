# 선박 데이터 API 가이드

## 📋 목차
1. [실시간 선박 추적 API](#1-실시간-선박-추적-api)
2. [해운 스케줄 API](#2-해운-스케줄-api)
3. [항만 데이터 API](#3-항만-데이터-api)
4. [운임 데이터 API](#4-운임-데이터-api)
5. [통합 물류 플랫폼 API](#5-통합-물류-플랫폼-api)
6. [추천 조합](#6-추천-조합)

---

## 1. 실시간 선박 추적 API

### 🌟 **MarineTraffic API** (최고 인기)
**URL**: https://www.marinetraffic.com/en/ais-api-services

**기능**:
- ✅ 실시간 선박 위치 추적 (AIS 데이터)
- ✅ 선박 상세 정보 (IMO, MMSI, 크기, 속도)
- ✅ 항로 기록 (Historical Track)
- ✅ 도착 예정 시간 (ETA)
- ✅ 항구 도착/출발 이벤트

**가격**:
```
- Developer Plan: $49/월 (5,000 API calls)
- Professional Plan: $199/월 (50,000 API calls)
- Enterprise: 맞춤 가격
```

**샘플 코드**:
```typescript
// src/lib/marine-traffic.ts
export class MarineTrafficAPI {
  private apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  // 선박 실시간 위치 조회
  async getVesselPosition(mmsi: string) {
    const response = await fetch(
      `https://services.marinetraffic.com/api/exportvessel/v:8/${this.apiKey}` +
      `/timespan:10/protocol:json/mmsi:${mmsi}`
    )
    return await response.json()
  }
  
  // 항구별 선박 목록
  async getPortCalls(portId: number) {
    const response = await fetch(
      `https://services.marinetraffic.com/api/portcalls/v:3/${this.apiKey}` +
      `/portid:${portId}/protocol:json`
    )
    return await response.json()
  }
  
  // ETA (도착 예정 시간)
  async getVesselETA(mmsi: string) {
    const response = await fetch(
      `https://services.marinetraffic.com/api/expectedarrivals/v:3/${this.apiKey}` +
      `/mmsi:${mmsi}/protocol:json`
    )
    return await response.json()
  }
}
```

---

### 🌟 **VesselFinder API**
**URL**: https://www.vesselfinder.com/api

**기능**:
- ✅ 실시간 AIS 데이터
- ✅ 선박 사진
- ✅ 항구 정보
- ✅ 날씨 데이터

**가격**:
```
- Basic: $29/월 (1,000 requests)
- Pro: $99/월 (10,000 requests)
- Business: $299/월 (100,000 requests)
```

---

### 🌟 **AISHub API** (무료)
**URL**: http://www.aishub.net/

**기능**:
- ✅ 무료 AIS 데이터
- ✅ 실시간 선박 위치
- ⚠️ 제한적 데이터

**가격**: **무료** (커뮤니티 기반)

---

## 2. 해운 스케줄 API

### 🌟 **SeaRates API** (최고 추천)
**URL**: https://www.searates.com/services/api/

**기능**:
- ✅ 전 세계 해운 스케줄
- ✅ 주요 선사별 스케줄 (Maersk, MSC, CMA CGM 등)
- ✅ 운임 계산기
- ✅ 컨테이너 추적
- ✅ 항구 간 거리 계산

**가격**:
```
- Starter: €99/월 (1,000 requests)
- Professional: €299/월 (5,000 requests)
- Enterprise: 맞춤 가격
```

**샘플 코드**:
```typescript
// src/lib/searates.ts
export class SeaRatesAPI {
  private apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  // 항구 간 스케줄 조회
  async getSchedule(from: string, to: string, date: string) {
    const response = await fetch(
      `https://www.searates.com/reference/api/schedules/` +
      `?from=${from}&to=${to}&date=${date}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return await response.json()
  }
  
  // 운임 계산
  async calculateFreight(params: {
    from: string
    to: string
    weight: number
    volume: number
    containerType: string
  }) {
    const response = await fetch(
      `https://www.searates.com/reference/api/freight/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      }
    )
    return await response.json()
  }
}
```

---

### 🌟 **Freightos Baltic Index (FBX) API**
**URL**: https://fbx.freightos.com/

**기능**:
- ✅ 글로벌 컨테이너 운임 지수
- ✅ 실시간 운임 변동
- ✅ 경로별 운임 트렌드

**가격**: 문의 필요 (엔터프라이즈)

---

## 3. 항만 데이터 API

### 🌟 **PortCalls.io API**
**URL**: https://www.portcalls.io/

**기능**:
- ✅ 항구 도착/출발 스케줄
- ✅ 체선 시간 (Demurrage)
- ✅ 터미널 정보

**가격**:
```
- Basic: $99/월
- Pro: $299/월
```

---

### 🌟 **국토교통부 항만운영정보시스템 (PORT-MIS)** (한국)
**URL**: https://new.portmis.go.kr/

**기능**:
- ✅ 한국 항만 입출항 정보
- ✅ 무료 API
- ✅ 실시간 선박 입출항 현황

**가격**: **무료** (회원가입 필요)

**샘플 코드**:
```typescript
// src/lib/portmis.ts
export class PortMISAPI {
  private serviceKey: string
  
  constructor(serviceKey: string) {
    this.serviceKey = serviceKey
  }
  
  // 입출항 선박 조회
  async getPortArrivals(portCode: string, date: string) {
    const response = await fetch(
      `http://apis.data.go.kr/1192000/VesslArivlInfoService/getVesslArivlList` +
      `?serviceKey=${this.serviceKey}` +
      `&portCode=${portCode}` +
      `&callDate=${date}` +
      `&_type=json`
    )
    return await response.json()
  }
}
```

---

## 4. 운임 데이터 API

### 🌟 **Xeneta API** (최고급)
**URL**: https://www.xeneta.com/

**기능**:
- ✅ 글로벌 컨테이너 운임 벤치마크
- ✅ 실시간 시장 가격
- ✅ 계약 운임 vs 현물 운임
- ✅ AI 기반 가격 예측

**가격**: 엔터프라이즈 전용 (연 $10,000+)

---

### 🌟 **Container xChange API**
**URL**: https://www.container-xchange.com/api/

**기능**:
- ✅ 컨테이너 가용성
- ✅ 컨테이너 리스 가격
- ✅ 컨테이너 위치 추적

**가격**:
```
- Standard: $199/월
- Professional: $499/월
```

---

## 5. 통합 물류 플랫폼 API

### 🌟 **Cargowise One API**
**URL**: https://www.cargowise.com/

**기능**:
- ✅ 통합 물류 관리 (TMS)
- ✅ 선박, 항공, 트럭 통합
- ✅ 재고 관리
- ✅ 관세 및 통관

**가격**: 엔터프라이즈 전용

---

### 🌟 **Project44 API**
**URL**: https://www.project44.com/

**기능**:
- ✅ 멀티모달 운송 가시성
- ✅ 실시간 배송 추적
- ✅ 예측 ETA
- ✅ 180개 이상 선사 연동

**가격**: 맞춤 가격 (문의 필요)

---

## 6. 추천 조합

### 💡 **스타트업 추천 (저예산)**
```
1. MarineTraffic API (Developer) - $49/월
   → 실시간 선박 위치 및 ETA
   
2. PORT-MIS API (무료)
   → 한국 항만 데이터
   
3. SeaRates 크롤링 (무료)
   → 스케줄 정보 (API 없이)
   
총 비용: $49/월 (~₩65,000)
```

---

### 💡 **중급 추천 (성장 단계)**
```
1. MarineTraffic API (Professional) - $199/월
   → 실시간 선박 추적
   
2. SeaRates API (Starter) - €99/월
   → 해운 스케줄 및 운임
   
3. VesselFinder API (Basic) - $29/월
   → 보조 데이터 및 선박 사진
   
총 비용: $327/월 (~₩430,000)
```

---

### 💡 **엔터프라이즈 추천 (본격 사업)**
```
1. MarineTraffic API (Enterprise)
   → 무제한 실시간 데이터
   
2. SeaRates API (Professional)
   → 전 세계 스케줄 및 운임
   
3. Xeneta API
   → AI 기반 가격 예측
   
4. Project44 API
   → 통합 물류 가시성
   
총 비용: $2,000+/월 (~₩2,600,000+)
```

---

## 🚀 실제 연동 예시

### Step 1: MarineTraffic 연동

```typescript
// src/lib/marine-traffic.ts
export class MarineTrafficAPI {
  private apiKey: string
  private baseUrl = 'https://services.marinetraffic.com/api'
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  // 선박 실시간 위치
  async getVesselPosition(mmsi: string) {
    const url = `${this.baseUrl}/exportvessel/v:8/${this.apiKey}/timespan:10/protocol:json/mmsi:${mmsi}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`MarineTraffic API Error: ${response.statusText}`)
    }
    
    return await response.json()
  }
  
  // 항구 도착/출발 이벤트
  async getPortEvents(portId: number, timespan: number = 3) {
    const url = `${this.baseUrl}/portcalls/v:3/${this.apiKey}/portid:${portId}/timespan:${timespan}/protocol:json`
    const response = await fetch(url)
    return await response.json()
  }
  
  // 선박 경로 기록
  async getVesselTrack(mmsi: string, fromDate: string, toDate: string) {
    const url = `${this.baseUrl}/exportvesseltrack/v:2/${this.apiKey}/period:daily/mmsi:${mmsi}/fromdate:${fromDate}/todate:${toDate}/protocol:json`
    const response = await fetch(url)
    return await response.json()
  }
}
```

### Step 2: 실제 사용 (API Route)

```typescript
// src/routes/vessels.ts
import { MarineTrafficAPI } from '../lib/marine-traffic'

// 선박 실시간 위치 조회
vessels.get('/:id/location', async (c) => {
  try {
    const vesselId = c.req.param('id')
    
    // DB에서 선박의 MMSI 번호 조회
    const vessel = await c.env.DB.prepare(
      'SELECT mmsi FROM vessels WHERE id = ?'
    ).bind(vesselId).first()
    
    if (!vessel || !vessel.mmsi) {
      return c.json({ error: '선박을 찾을 수 없습니다.' }, 404)
    }
    
    // MarineTraffic API 호출
    const api = new MarineTrafficAPI(c.env.MARINE_TRAFFIC_API_KEY)
    const position = await api.getVesselPosition(vessel.mmsi as string)
    
    return c.json({
      success: true,
      vessel_id: vesselId,
      position: {
        latitude: position[0]?.LAT,
        longitude: position[0]?.LON,
        speed: position[0]?.SPEED,
        course: position[0]?.COURSE,
        timestamp: position[0]?.TIMESTAMP
      }
    })
    
  } catch (error) {
    console.error('Get vessel location error:', error)
    return c.json({ error: '위치 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 항구 입출항 정보
vessels.get('/port/:portId/arrivals', async (c) => {
  try {
    const portId = parseInt(c.req.param('portId'))
    
    const api = new MarineTrafficAPI(c.env.MARINE_TRAFFIC_API_KEY)
    const events = await api.getPortEvents(portId, 7) // 최근 7일
    
    return c.json({
      success: true,
      port_id: portId,
      events: events.map((e: any) => ({
        vessel_name: e.SHIPNAME,
        mmsi: e.MMSI,
        arrival_time: e.ARRIVAL,
        departure_time: e.DEPARTURE,
        ship_type: e.SHIP_TYPE
      }))
    })
    
  } catch (error) {
    console.error('Get port arrivals error:', error)
    return c.json({ error: '항구 정보 조회 중 오류가 발생했습니다.' }, 500)
  }
})
```

### Step 3: 환경 변수 설정

```bash
# .dev.vars
MARINE_TRAFFIC_API_KEY=your_api_key_here
SEARATES_API_KEY=your_searates_key_here
PORTMIS_SERVICE_KEY=your_portmis_key_here
```

---

## 📊 API 비교표

| API | 실시간 위치 | 스케줄 | 운임 | 한국 지원 | 가격/월 |
|-----|------------|--------|------|-----------|---------|
| **MarineTraffic** | ⭐⭐⭐ | ⭐ | ❌ | ✅ | $49+ |
| **SeaRates** | ❌ | ⭐⭐⭐ | ⭐⭐⭐ | ✅ | €99+ |
| **VesselFinder** | ⭐⭐ | ⭐ | ❌ | ✅ | $29+ |
| **PORT-MIS** | ⭐ | ⭐⭐ | ❌ | ⭐⭐⭐ | 무료 |
| **Xeneta** | ❌ | ⭐ | ⭐⭐⭐ | ✅ | $1000+ |
| **Project44** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ✅ | 맞춤 |

---

## 🎯 ShipShare 프로젝트 추천

### Phase 1: MVP (최소 기능)
```
1. MarineTraffic Developer ($49/월)
2. PORT-MIS (무료)
3. 수동 스케줄 입력

총 비용: $49/월
```

### Phase 2: 베타 출시
```
1. MarineTraffic Professional ($199/월)
2. SeaRates Starter (€99/월)
3. PORT-MIS (무료)

총 비용: $298/월
```

### Phase 3: 정식 출시
```
1. MarineTraffic Enterprise
2. SeaRates Professional
3. Xeneta API
4. Project44 API

총 비용: $2,000+/월
```

---

## 💡 무료 대안

### 웹 스크래핑 (합법적 범위 내)
```typescript
// 주의: robots.txt 확인 및 Terms of Service 준수 필수
// 교육 목적으로만 사용

// 예: SeaRates 공개 데이터 크롤링
async function scrapeSchedule(from: string, to: string) {
  // Puppeteer 또는 Cheerio 사용
  // 단, 과도한 요청은 금지
}
```

### 공공 데이터
- PORT-MIS (한국)
- 해양수산부 공공데이터 포털
- IMO (국제해사기구) 공개 데이터

---

## 📚 참고 자료

### 공식 문서
- [MarineTraffic API Docs](https://www.marinetraffic.com/en/ais-api-services)
- [SeaRates API Docs](https://www.searates.com/services/api/)
- [PORT-MIS 공공데이터](https://www.data.go.kr/)

### 업계 리소스
- [IMO (국제해사기구)](https://www.imo.org/)
- [IATA (국제항공운송협회)](https://www.iata.org/)

---

## ✅ 다음 단계

1. **MarineTraffic 계정 생성** → Developer Plan 시작
2. **PORT-MIS 인증키 발급** → 무료 API 사용
3. **실제 데이터 연동** → vessels.ts에 통합
4. **프론트엔드 업데이트** → 실시간 위치 표시

---

**작성일**: 2024-11-21  
**작성자**: AI Assistant  
**상태**: 실제 API 연동 준비 완료 ✅
