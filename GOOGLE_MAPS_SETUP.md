# Google Maps Platform 설정 가이드 🗺️

ShipShare 프로젝트에서 Google Maps API를 사용하기 위한 완전한 설정 가이드입니다.

---

## 📋 목차

1. [Google Cloud Console 설정](#1-google-cloud-console-설정)
2. [API 키 생성](#2-api-키-생성)
3. [API 키 보안 설정](#3-api-키-보안-설정)
4. [결제 설정](#4-결제-설정)
5. [환경 변수 설정](#5-환경-변수-설정)
6. [테스트](#6-테스트)
7. [비용 관리](#7-비용-관리)

---

## 1. Google Cloud Console 설정

### Step 1-1: Google Cloud Console 접속
https://console.cloud.google.com/

### Step 1-2: 프로젝트 생성
1. 상단 **"프로젝트 선택"** 드롭다운 클릭
2. **"새 프로젝트"** 클릭
3. **프로젝트 이름**: `ShipShare` (또는 원하는 이름)
4. **위치**: 조직 없음
5. **만들기** 클릭

### Step 1-3: 프로젝트 선택
생성된 `ShipShare` 프로젝트를 선택합니다.

---

## 2. API 키 생성

### Step 2-1: Maps Platform API 활성화
1. 좌측 메뉴 → **"APIs & Services"** → **"Library"** 클릭
2. 다음 API를 검색하여 **"사용 설정"** 클릭:

   **필수 API**:
   - ✅ **Maps JavaScript API** - 지도 표시
   - ✅ **Geocoding API** - 주소 → 좌표 변환
   - ✅ **Distance Matrix API** - 거리 계산
   
   **선택 API** (추가 기능 필요 시):
   - **Directions API** - 경로 안내
   - **Places API** - 장소 검색
   - **Elevation API** - 고도 정보

### Step 2-2: API 키 생성
1. 좌측 메뉴 → **"APIs & Services"** → **"Credentials"** 클릭
2. 상단 **"+ CREATE CREDENTIALS"** 클릭
3. **"API Key"** 선택
4. API 키가 생성됩니다 (예: `AIzaSyB...`)
5. **복사** 버튼 클릭하여 API 키 저장

---

## 3. API 키 보안 설정

### Step 3-1: API 키 제한
생성된 API 키 옆 **연필 아이콘(편집)** 클릭

### Step 3-2: Application restrictions (애플리케이션 제한)
**HTTP referrers (websites)** 선택:

```
http://localhost:3000/*
https://localhost:3000/*
https://*.pages.dev/*
https://3000-*.sandbox.novita.ai/*
https://your-domain.com/*
```

**설명**:
- 특정 도메인에서만 API 키 사용 가능
- 무단 사용 방지
- 와일드카드(`*`) 사용 가능

### Step 3-3: API restrictions (API 제한)
**Restrict key** 선택 후 다음 API만 허용:

- ✅ Maps JavaScript API
- ✅ Geocoding API
- ✅ Distance Matrix API
- ✅ Directions API (선택)

### Step 3-4: 저장
**저장** 버튼 클릭

---

## 4. 결제 설정

### ⚠️ 중요: 신용카드 등록 필수
Google Maps API는 무료 한도를 제공하지만, **신용카드 등록이 필수**입니다.

### Step 4-1: 결제 계정 연결
1. 좌측 메뉴 → **"Billing"** 클릭
2. **"계정 연결"** 또는 **"결제 계정 만들기"** 클릭
3. 신용카드 정보 입력
4. 국가: **대한민국**
5. 약관 동의 후 **제출**

### Step 4-2: 예산 알림 설정 (안전장치)
1. **"Billing"** → **"Budgets & alerts"** 클릭
2. **"CREATE BUDGET"** 클릭
3. **Budget name**: `ShipShare-Maps-Budget`
4. **Budget amount**: `$10` (또는 원하는 금액)
5. **Threshold rules**:
   - 50% ($5) - 이메일 알림
   - 90% ($9) - 이메일 알림
   - 100% ($10) - 이메일 알림
6. **FINISH** 클릭

**참고**: 알림을 받아도 자동으로 중단되지는 않습니다. 수동으로 API를 비활성화해야 합니다.

---

## 5. 환경 변수 설정

### Step 5-1: 로컬 개발 환경 (.dev.vars)
`/home/user/webapp/.dev.vars` 파일을 열고 API 키를 추가하세요:

```bash
# Google Maps Platform API
GOOGLE_MAPS_API_KEY=AIzaSyB...YOUR_ACTUAL_API_KEY_HERE...
```

### Step 5-2: Cloudflare Pages 프로덕션 환경
배포 시 Cloudflare에서 환경 변수 설정:

```bash
# Cloudflare에서 환경 변수 설정 (나중에 배포 시)
npx wrangler pages secret put GOOGLE_MAPS_API_KEY
# 프롬프트에서 API 키 입력
```

---

## 6. 테스트

### Step 6-1: 테스트 스크립트 실행
```bash
cd /home/user/webapp
node test-google-maps.js
```

### Step 6-2: API 엔드포인트 테스트

#### 1️⃣ 항구 목록 조회 (API 키 불필요)
```bash
curl http://localhost:3000/api/maps-google/ports
```

#### 2️⃣ 거리 계산 (Google Distance Matrix API)
```bash
curl "http://localhost:3000/api/maps-google/distance?from=busan&to=shanghai"
```

**예상 응답**:
```json
{
  "success": true,
  "distance": {
    "from": "Busan Port (KR)",
    "to": "Shanghai Port (CN)",
    "meters": 825102,
    "kilometers": 825.1,
    "nauticalMiles": 445.52,
    "formatted": "825km",
    "estimatedDuration": {
      "seconds": 80142,
      "formatted": "22시간 15분",
      "googleText": "22시간 15분"
    }
  },
  "provider": "Google Distance Matrix API"
}
```

#### 3️⃣ 지오코딩 (주소 → 좌표)
```bash
curl "http://localhost:3000/api/maps-google/geocode?address=Busan Port, South Korea"
```

#### 4️⃣ 경로 조회 (Google Directions API)
```bash
curl "http://localhost:3000/api/maps-google/directions?from=busan&to=shanghai"
```

#### 5️⃣ 직선 거리 계산 (API 키 불필요, Haversine)
```bash
curl "http://localhost:3000/api/maps-google/distance/straight?from=busan&to=losangeles"
```

---

## 7. 비용 관리

### 🆓 무료 한도 (2025년 기준)

| API | 무료 한도 (월) | 초과 시 비용 |
|-----|:-------------:|:----------:|
| **Maps JavaScript API** | 28,500 페이지 로드 | $7 / 1,000 로드 |
| **Geocoding API** | 28,500 요청 | $5 / 1,000 요청 |
| **Distance Matrix API** | 28,500 요청 | $5 / 1,000 요청 |
| **Directions API** | 28,500 요청 | $5 / 1,000 요청 |

### 📊 ShipShare 예상 사용량 (월 1,000 사용자)

**시나리오**:
- 각 사용자가 평균 5회 검색
- 각 검색마다 거리 계산 1회

**예상 API 호출**:
- Distance Matrix: 5,000 요청/월
- Geocoding: 1,000 요청/월 (가끔 주소 검색)
- Maps JavaScript: 10,000 로드/월 (지도 표시)

**총합**: 16,000 요청/월 → **무료 한도 내** (28,500회)

**💰 예상 비용**: **$0/월**

### 📈 무료 한도 초과 시

**10,000 사용자 기준** (월 50,000 검색):
- Distance Matrix: 50,000 요청
- 초과: 21,500 요청 × $5 / 1,000 = **$107.5/월**

**해결책**:
1. **캐싱 활용**: 같은 경로는 캐시에서 제공
2. **Haversine 우선**: API 호출 전 직선 거리로 대략 계산
3. **Rate Limiting**: 사용자당 검색 횟수 제한

### 🛡️ 비용 초과 방지 방법

#### 1. API 사용량 모니터링
Google Cloud Console → **APIs & Services** → **Dashboard**에서 실시간 사용량 확인

#### 2. 알림 설정 (이미 완료)
예산 $10 초과 시 이메일 알림

#### 3. API 쿼터 설정
**APIs & Services** → **Quotas**에서 일일 최대 호출 수 제한:
- Distance Matrix API: 1,000 요청/일
- Geocoding API: 500 요청/일

#### 4. 긴급 중단
비용이 너무 많이 발생하면:
1. **APIs & Services** → **Library**
2. 해당 API 클릭 → **"사용 중지"**

---

## 🎯 체크리스트

설정 완료 후 체크:

- [ ] Google Cloud 프로젝트 생성 (`ShipShare`)
- [ ] Maps JavaScript API 활성화
- [ ] Geocoding API 활성화
- [ ] Distance Matrix API 활성화
- [ ] API 키 생성 (`AIzaSyB...`)
- [ ] API 키 제한 설정 (HTTP referrers)
- [ ] API restrictions 설정 (특정 API만 허용)
- [ ] 신용카드 등록 (결제 계정 연결)
- [ ] 예산 알림 설정 ($10 한도)
- [ ] `.dev.vars`에 API 키 추가
- [ ] 테스트 스크립트 실행 성공
- [ ] API 엔드포인트 테스트 성공

---

## 🆘 문제 해결

### ❌ "API key not valid" 오류
- API 키가 올바른지 확인
- API restrictions에서 사용하려는 API가 허용되었는지 확인
- HTTP referrers 설정이 현재 도메인을 포함하는지 확인

### ❌ "This API project is not authorized" 오류
- 해당 API가 활성화되었는지 확인 (Library에서 확인)
- 프로젝트가 올바르게 선택되었는지 확인

### ❌ "Billing must be enabled" 오류
- 신용카드 등록 (결제 계정 연결)
- 결제 계정이 프로젝트에 연결되었는지 확인

### ❌ "ZERO_RESULTS" 응답
- 주소가 올바른지 확인
- 항구 코드가 존재하는지 확인 (`/api/maps-google/ports`에서 조회)

---

## 📚 참고 자료

- [Google Maps Platform 공식 문서](https://developers.google.com/maps/documentation)
- [Pricing 가이드](https://mapsplatform.google.com/pricing/)
- [API 키 보안 Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [무료 한도 정보](https://developers.google.com/maps/billing-and-pricing/pricing)

---

## 🎉 완료!

설정이 완료되면 ShipShare 프로젝트에서 전 세계 항구 간 정확한 거리 계산, 지오코딩, 경로 안내를 사용할 수 있습니다! 🚢🗺️
