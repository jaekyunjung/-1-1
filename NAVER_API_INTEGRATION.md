# 네이버 API 통합 가이드

## 📋 목차
1. [네이버 클라우드 vs 네이버 오픈 API](#1-네이버-클라우드-vs-네이버-오픈-api)
2. [ShipShare 프로젝트 추천 API](#2-shipshare-프로젝트-추천-api)
3. [네이버 클라우드 API](#3-네이버-클라우드-api)
4. [네이버 오픈 API](#4-네이버-오픈-api)
5. [통합 구현 예시](#5-통합-구현-예시)
6. [전체 통합 로드맵](#6-전체-통합-로드맵)

---

## 1. 네이버 클라우드 vs 네이버 오픈 API

### 🔵 **네이버 클라우드 Platform** (유료)
- URL: https://console.ncloud.com
- 엔터프라이즈급 인프라 서비스
- 신용카드 등록 필요
- 종량제 과금

### 🟢 **네이버 오픈 API** (무료/제한적)
- URL: https://developers.naver.com
- 개발자용 공개 API
- 무료 (일일 호출 제한)
- 애플리케이션 등록 필요

---

## 2. ShipShare 프로젝트 추천 API

### 🌟 **최우선 통합 (무료/저비용)**

#### ✅ 1. **네이버 지도 API** (무료)
**용도**: 항구 위치, 배송 경로 시각화
```
일일 호출: 무료 50,000회
초과 시: 건당 ₩0.5
```

#### ✅ 2. **파파고 번역 API** (무료)
**용도**: 다국어 지원 (한/영/중/일)
```
일일 호출: 무료 10,000자
초과 시: 10,000자당 ₩20
```

#### ✅ 3. **네이버 검색 API** (무료)
**용도**: 선사 정보, 항구 정보 검색
```
일일 호출: 무료 25,000회
```

#### ✅ 4. **네이버 클라우드 SENS** (유료, 이미 준비됨)
**용도**: 매직 링크 이메일, SMS 인증
```
이메일: 500건 무료, 초과 시 건당 ₩4
SMS: 건당 ₩9
```

#### ✅ 5. **CLOVA OCR** (유료)
**용도**: 선하증권, 공동인증서 자동 인식
```
월 1,000건 무료
초과 시: 건당 ₩30
```

---

### 🎯 **추가 고려 API**

#### 🔶 6. **네이버 클라우드 Maps** (유료)
**용도**: 고급 지도 기능 (경로 최적화)
```
월 100,000건: ₩30,000
```

#### 🔶 7. **CLOVA Chatbot** (유료)
**용도**: 고객 문의 자동 응답
```
월 1,000건: 무료
초과 시: 건당 ₩30
```

#### 🔶 8. **CLOVA Speech** (TTS/STT) (유료)
**용도**: 음성 안내, 음성 검색
```
월 30분: 무료
초과 시: 분당 ₩30
```

---

## 3. 네이버 클라우드 API

### 🔵 **SENS (이미 구현 완료)**

**파일**: `src/lib/ncloud-sens.ts`

**기능**:
- ✅ 이메일 발송 (매직 링크)
- ✅ SMS 인증
- ✅ 알림톡 (카카오톡)

**사용 예시**:
```typescript
import { createSENSClient } from '../lib/ncloud-sens'

const sens = createSENSClient(c.env)
await sens.sendMagicLinkEmail(email, magicCode)
```

---

### 🔵 **CLOVA OCR**

**용도**: 선하증권, 공동인증서, 여권 스캔

**구현**:
```typescript
// src/lib/ncloud-ocr.ts
import crypto from 'crypto'

export class NCloudOCR {
  private invokeUrl: string
  private secretKey: string

  constructor(invokeUrl: string, secretKey: string) {
    this.invokeUrl = invokeUrl
    this.secretKey = secretKey
  }

  /**
   * 문서 OCR 처리
   */
  async recognizeDocument(imageBase64: string, format: string = 'jpg') {
    const requestBody = {
      version: 'V2',
      requestId: crypto.randomUUID(),
      timestamp: Date.now(),
      images: [
        {
          format: format,
          name: 'document',
          data: imageBase64,
        },
      ],
    }

    const response = await fetch(this.invokeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OCR-SECRET': this.secretKey,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`CLOVA OCR Error: ${response.statusText}`)
    }

    const result = await response.json()
    
    return {
      fullText: result.images[0].fields.map((f: any) => f.inferText).join(' '),
      fields: result.images[0].fields,
    }
  }

  /**
   * 선하증권(B/L) 정보 추출
   */
  async extractBillOfLading(imageBase64: string) {
    const result = await this.recognizeDocument(imageBase64)
    
    return {
      bookingNumber: this.extractPattern(result.fullText, /B\/L\s*NO[:\s]+(\w+)/i),
      vesselName: this.extractPattern(result.fullText, /VESSEL[:\s]+([A-Z\s]+)/i),
      voyageNumber: this.extractPattern(result.fullText, /VOYAGE[:\s]+(\w+)/i),
      portOfLoading: this.extractPattern(result.fullText, /PORT\s+OF\s+LOADING[:\s]+([A-Z\s]+)/i),
      portOfDischarge: this.extractPattern(result.fullText, /PORT\s+OF\s+DISCHARGE[:\s]+([A-Z\s]+)/i),
      containerNumber: this.extractPattern(result.fullText, /CONTAINER[:\s]+([A-Z0-9]{11})/i),
      rawText: result.fullText,
    }
  }

  private extractPattern(text: string, pattern: RegExp): string | null {
    const match = text.match(pattern)
    return match ? match[1].trim() : null
  }
}

export function createOCRClient(env: any): NCloudOCR {
  return new NCloudOCR(
    env.NCLOUD_CLOVA_OCR_URL,
    env.NCLOUD_CLOVA_OCR_SECRET
  )
}
```

---

### 🔵 **Object Storage** (이미 구현 완료)

**파일**: `src/lib/ncloud-storage.ts` (NCLOUD_INTEGRATION_GUIDE.md 참고)

**용도**: 인증서 파일, 선하증권 이미지 저장

---

## 4. 네이버 오픈 API

### 🟢 **네이버 지도 API** (최우선 추천)

**용도**: 항구 위치 시각화, 배송 경로 표시

**구현**:
```typescript
// src/lib/naver-maps.ts
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
  async geocode(address: string) {
    const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`

    const response = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': this.clientId,
        'X-NCP-APIGW-API-KEY': this.clientSecret,
      },
    })

    if (!response.ok) {
      throw new Error(`Naver Maps API Error: ${response.statusText}`)
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
  async reverseGeocode(lat: number, lon: number) {
    const url = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lon},${lat}&output=json`

    const response = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': this.clientId,
        'X-NCP-APIGW-API-KEY': this.clientSecret,
      },
    })

    if (!response.ok) {
      throw new Error(`Naver Maps API Error: ${response.statusText}`)
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
   * 두 지점 간 거리 계산 (Haversine)
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

  private toRad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}

export function createNaverMapsClient(env: any): NaverMapsAPI {
  return new NaverMapsAPI(
    env.NAVER_MAP_CLIENT_ID,
    env.NAVER_MAP_CLIENT_SECRET
  )
}

/**
 * 주요 항구 좌표
 */
export const PORT_COORDINATES = {
  BUSAN: { lat: 35.1028, lon: 129.0403 },
  INCHEON: { lat: 37.4563, lon: 126.7052 },
  GWANGYANG: { lat: 34.9406, lon: 127.6950 },
  ULSAN: { lat: 35.5384, lon: 129.3114 },
  SHANGHAI: { lat: 31.2304, lon: 121.4737 },
  LOS_ANGELES: { lat: 33.7405, lon: -118.2716 },
  SINGAPORE: { lat: 1.2644, lon: 103.8223 },
  ROTTERDAM: { lat: 51.9225, lon: 4.4792 },
} as const
```

---

### 🟢 **파파고 번역 API**

**용도**: 다국어 지원 (한국어 ↔ 영어/중국어/일본어)

**구현**:
```typescript
// src/lib/naver-papago.ts
export class NaverPapagoAPI {
  private clientId: string
  private clientSecret: string

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  /**
   * 텍스트 번역
   */
  async translate(text: string, sourceLang: string, targetLang: string) {
    const url = 'https://naveropenapi.apigw.ntruss.com/nmt/v1/translation'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': this.clientId,
        'X-NCP-APIGW-API-KEY': this.clientSecret,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        source: sourceLang,
        target: targetLang,
        text: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`Papago API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      translatedText: data.message.result.translatedText,
      sourceLang: sourceLang,
      targetLang: targetLang,
    }
  }

  /**
   * 언어 감지
   */
  async detectLanguage(text: string) {
    const url = 'https://naveropenapi.apigw.ntruss.com/langs/v1/dect'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': this.clientId,
        'X-NCP-APIGW-API-KEY': this.clientSecret,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        query: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`Papago API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.langCode
  }

  /**
   * 다국어 자동 번역 (언어 자동 감지)
   */
  async autoTranslate(text: string, targetLang: string = 'en') {
    const sourceLang = await this.detectLanguage(text)
    
    if (sourceLang === targetLang) {
      return { translatedText: text, sourceLang, targetLang }
    }
    
    return await this.translate(text, sourceLang, targetLang)
  }
}

export function createPapagoClient(env: any): NaverPapagoAPI {
  return new NaverPapagoAPI(
    env.NAVER_PAPAGO_CLIENT_ID,
    env.NAVER_PAPAGO_CLIENT_SECRET
  )
}

/**
 * 지원 언어 코드
 */
export const SUPPORTED_LANGUAGES = {
  KO: 'ko', // 한국어
  EN: 'en', // 영어
  JA: 'ja', // 일본어
  ZH_CN: 'zh-CN', // 중국어 간체
  ZH_TW: 'zh-TW', // 중국어 번체
  ES: 'es', // 스페인어
  FR: 'fr', // 프랑스어
  DE: 'de', // 독일어
  RU: 'ru', // 러시아어
  PT: 'pt', // 포르투갈어
  IT: 'it', // 이탈리아어
  VI: 'vi', // 베트남어
  TH: 'th', // 태국어
  ID: 'id', // 인도네시아어
  HI: 'hi', // 힌디어
  AR: 'ar', // 아랍어
} as const
```

---

### 🟢 **네이버 검색 API**

**용도**: 선사 정보, 항구 정보, 뉴스 검색

**구현**:
```typescript
// src/lib/naver-search.ts
export class NaverSearchAPI {
  private clientId: string
  private clientSecret: string

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  /**
   * 블로그 검색
   */
  async searchBlog(query: string, display: number = 10) {
    return await this.search('blog', query, display)
  }

  /**
   * 뉴스 검색
   */
  async searchNews(query: string, display: number = 10) {
    return await this.search('news', query, display)
  }

  /**
   * 웹 문서 검색
   */
  async searchWeb(query: string, display: number = 10) {
    return await this.search('webkr', query, display)
  }

  /**
   * 이미지 검색
   */
  async searchImage(query: string, display: number = 10) {
    return await this.search('image', query, display)
  }

  /**
   * 공통 검색 메서드
   */
  private async search(type: string, query: string, display: number) {
    const url = `https://openapi.naver.com/v1/search/${type}?query=${encodeURIComponent(query)}&display=${display}`

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': this.clientId,
        'X-Naver-Client-Secret': this.clientSecret,
      },
    })

    if (!response.ok) {
      throw new Error(`Naver Search API Error: ${response.statusText}`)
    }

    return await response.json()
  }
}

export function createNaverSearchClient(env: any): NaverSearchAPI {
  return new NaverSearchAPI(
    env.NAVER_SEARCH_CLIENT_ID,
    env.NAVER_SEARCH_CLIENT_SECRET
  )
}
```

---

## 5. 통합 구현 예시

### 📍 **실제 사용 예시 1: 선박 위치 + 지도**

```typescript
// src/routes/vessels.ts
import { createMarineTrafficClient } from '../lib/marine-traffic'
import { createNaverMapsClient, PORT_COORDINATES } from '../lib/naver-maps'

vessels.get('/:id/map-location', async (c) => {
  try {
    const vesselId = c.req.param('id')
    
    // 1. 선박 위치 조회 (MarineTraffic)
    const vessel = await c.env.DB.prepare(
      'SELECT mmsi, vessel_name FROM vessels WHERE id = ?'
    ).bind(vesselId).first()
    
    const marinTraffic = createMarineTrafficClient(c.env)
    const position = await marinTraffic.getVesselPosition(vessel.mmsi)
    
    // 2. 좌표 → 주소 변환 (네이버 지도)
    const naverMaps = createNaverMapsClient(c.env)
    const address = await naverMaps.reverseGeocode(
      position[0].LAT,
      position[0].LON
    )
    
    // 3. 가장 가까운 항구 찾기
    let nearestPort = null
    let minDistance = Infinity
    
    for (const [portName, coords] of Object.entries(PORT_COORDINATES)) {
      const distance = naverMaps.calculateDistance(
        position[0].LAT,
        position[0].LON,
        coords.lat,
        coords.lon
      )
      
      if (distance < minDistance) {
        minDistance = distance
        nearestPort = { name: portName, ...coords, distance }
      }
    }
    
    return c.json({
      success: true,
      vessel: {
        name: vessel.vessel_name,
        position: {
          lat: position[0].LAT,
          lon: position[0].LON,
          speed: position[0].SPEED,
          heading: position[0].HEADING,
        },
        location: address,
        nearestPort: nearestPort,
      }
    })
    
  } catch (error) {
    console.error('Get vessel map location error:', error)
    return c.json({ error: '위치 조회 중 오류가 발생했습니다.' }, 500)
  }
})
```

---

### 📄 **실제 사용 예시 2: 선하증권 OCR**

```typescript
// src/routes/ocr.ts
import { Hono } from 'hono'
import { createOCRClient } from '../lib/ncloud-ocr'

const ocr = new Hono()

ocr.post('/bill-of-lading', async (c) => {
  try {
    const { imageBase64 } = await c.req.json()
    
    // CLOVA OCR로 선하증권 인식
    const ocrClient = createOCRClient(c.env)
    const result = await ocrClient.extractBillOfLading(imageBase64)
    
    // 추출된 정보로 자동 예약 생성 가능
    if (result.bookingNumber && result.vesselName) {
      // DB에서 해당 선박 찾기
      const vessel = await c.env.DB.prepare(
        'SELECT * FROM vessels WHERE vessel_name LIKE ?'
      ).bind(`%${result.vesselName}%`).first()
      
      if (vessel) {
        return c.json({
          success: true,
          extracted: result,
          vessel: vessel,
          message: '선하증권 정보를 인식했습니다. 예약을 진행하시겠습니까?'
        })
      }
    }
    
    return c.json({
      success: true,
      extracted: result,
      message: '선하증권 정보를 인식했습니다.'
    })
    
  } catch (error) {
    console.error('OCR error:', error)
    return c.json({ error: 'OCR 처리 중 오류가 발생했습니다.' }, 500)
  }
})

export default ocr
```

---

### 🌐 **실제 사용 예시 3: 다국어 지원**

```typescript
// src/routes/translate.ts
import { Hono } from 'hono'
import { createPapagoClient } from '../lib/naver-papago'

const translate = new Hono()

// 선박 정보 자동 번역
translate.post('/vessel-info', async (c) => {
  try {
    const { vesselId, targetLang } = await c.req.json()
    
    // 선박 정보 조회
    const vessel = await c.env.DB.prepare(
      'SELECT * FROM vessels WHERE id = ?'
    ).bind(vesselId).first()
    
    // 파파고로 번역
    const papago = createPapagoClient(c.env)
    
    const translatedName = await papago.autoTranslate(
      vessel.vessel_name,
      targetLang
    )
    
    const translatedDescription = vessel.description
      ? await papago.autoTranslate(vessel.description, targetLang)
      : null
    
    return c.json({
      success: true,
      original: {
        name: vessel.vessel_name,
        description: vessel.description,
      },
      translated: {
        name: translatedName.translatedText,
        description: translatedDescription?.translatedText,
        lang: targetLang,
      }
    })
    
  } catch (error) {
    console.error('Translation error:', error)
    return c.json({ error: '번역 중 오류가 발생했습니다.' }, 500)
  }
})

// 페이지 전체 번역
translate.post('/page', async (c) => {
  try {
    const { texts, targetLang } = await c.req.json()
    
    const papago = createPapagoClient(c.env)
    
    const translations = await Promise.all(
      texts.map(async (text: string) => {
        const result = await papago.autoTranslate(text, targetLang)
        return result.translatedText
      })
    )
    
    return c.json({
      success: true,
      translations: translations,
      targetLang: targetLang
    })
    
  } catch (error) {
    console.error('Translation error:', error)
    return c.json({ error: '번역 중 오류가 발생했습니다.' }, 500)
  }
})

export default translate
```

---

## 6. 전체 통합 로드맵

### 🎯 **Phase 1: 필수 API (무료)** - 즉시 시작

```
1. ✅ 네이버 지도 API
   - 항구 위치 표시
   - 배송 경로 시각화
   - 거리 계산

2. ✅ 파파고 번역 API
   - 한/영/중/일 다국어 지원
   - 자동 언어 감지
   
3. ✅ 네이버 검색 API
   - 선사 정보 검색
   - 항구 뉴스
   
비용: 무료 (일일 제한 내)
```

---

### 🎯 **Phase 2: 확장 API (저비용)** - 베타 출시

```
4. ✅ SENS 이메일 (이미 준비됨)
   - 매직 링크 발송
   - 예약 확인 이메일
   
5. ✅ CLOVA OCR
   - 선하증권 스캔
   - 공동인증서 인식
   
비용: ~₩50,000/월
```

---

### 🎯 **Phase 3: 고급 API (선택)** - 정식 출시

```
6. 🔶 네이버 클라우드 Maps
   - 경로 최적화
   - 실시간 교통 정보
   
7. 🔶 CLOVA Chatbot
   - 고객 문의 자동 응답
   
8. 🔶 CLOVA Speech (TTS/STT)
   - 음성 안내
   
비용: ~₩100,000/월
```

---

## 💰 비용 시뮬레이션

### 월 사용자 1,000명 기준

| API | 예상 호출 | 무료 한도 | 초과 비용 | 월 비용 |
|-----|----------|----------|----------|---------|
| **네이버 지도** | 30,000 | 50,000 | - | **무료** |
| **파파고** | 50,000자 | 300,000자 | - | **무료** |
| **검색 API** | 5,000 | 25,000 | - | **무료** |
| **SENS 이메일** | 1,000 | 500 | 500건 × ₩4 | **₩2,000** |
| **CLOVA OCR** | 500 | 1,000 | - | **무료** |
| **총 비용** | - | - | - | **₩2,000** |

**결론**: 거의 무료로 강력한 기능 구현 가능! 🎉

---

## 📚 환경 변수 설정

```bash
# .dev.vars

# 네이버 오픈 API (무료)
NAVER_MAP_CLIENT_ID=your_map_client_id
NAVER_MAP_CLIENT_SECRET=your_map_client_secret
NAVER_PAPAGO_CLIENT_ID=your_papago_client_id
NAVER_PAPAGO_CLIENT_SECRET=your_papago_client_secret
NAVER_SEARCH_CLIENT_ID=your_search_client_id
NAVER_SEARCH_CLIENT_SECRET=your_search_client_secret

# 네이버 클라우드 (유료)
NCLOUD_ACCESS_KEY=your_access_key
NCLOUD_SECRET_KEY=your_secret_key
NCLOUD_SENS_SERVICE_ID=your_sens_service_id
NCLOUD_FROM_EMAIL=noreply@shipshare.com
NCLOUD_CLOVA_OCR_URL=your_ocr_url
NCLOUD_CLOVA_OCR_SECRET=your_ocr_secret
```

---

## 🚀 시작 가이드

### Step 1: 네이버 개발자 센터 등록
1. https://developers.naver.com 접속
2. 로그인 및 애플리케이션 등록
3. 지도 API, 파파고 API, 검색 API 활성화
4. Client ID, Secret 발급

### Step 2: 네이버 클라우드 계정 (선택)
1. https://console.ncloud.com 접속
2. SENS, CLOVA OCR 서비스 신청
3. API Key 발급

### Step 3: 환경 변수 설정
```bash
# .dev.vars 파일 생성
cp .dev.vars.example .dev.vars
# API 키 입력
```

### Step 4: 라이브러리 생성 (제가 해드릴게요!)
```bash
src/lib/naver-maps.ts
src/lib/naver-papago.ts
src/lib/naver-search.ts
src/lib/ncloud-ocr.ts
```

---

## ✅ 다음 단계

지금 바로 구현을 시작하시겠습니까?

1. **네이버 지도 API 연동** (무료, 최우선)
2. **파파고 번역 API 연동** (무료, 다국어)
3. **CLOVA OCR 연동** (유료, 선하증권 스캔)

말씀만 해주시면 바로 코드 생성하고 GitHub에 푸시해드리겠습니다! 🚀

---

**작성일**: 2024-11-21  
**작성자**: AI Assistant  
**상태**: 실제 API 연동 준비 완료 ✅
