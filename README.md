# ShipShare - AI & 블록체인 기반 스마트 선적권 거래 플랫폼

## 📋 프로젝트 개요

ShipShare는 AI와 블록체인 기술을 활용한 차세대 선박 예약 플랫폼입니다. 해운/항공 롤오버 발생 시 실시간으로 대체 선박을 찾고, AI가 최적의 선택을 추천하며, 블록체인으로 모든 거래를 투명하게 기록합니다.

### 주요 특징
- 🚢 **실시간 선박 검색**: 전 세계 선박 스케줄 실시간 조회
- 🤖 **AI 가격 예측**: 머신러닝 기반 운임 예측 및 최적 예약 시점 추천
- 🧠 **AI 추천 시스템**: 조건에 맞는 최적의 선박 자동 추천
- 📊 **수요 예측 분석**: AI 기반 시즌별 컨테이너 수요 예측
- 🔐 **블록체인 보안**: 모든 거래를 블록체인에 투명하게 기록
- 📜 **스마트 계약**: 자동 실행되는 계약으로 신뢰성 보장
- 💰 **가격 비교**: 여러 선사의 운임을 한눈에 비교
- ⚡ **즉시 예약**: 클릭 한 번으로 간편한 선박 공간 예약

## 🌐 배포 URL

### 개발 환경
- **로컬 개발**: http://localhost:3000
- **샌드박스**: https://3000-iopwnq1nluxtoxto0kcl7-0e616f0a.sandbox.novita.ai

### GitHub
- **저장소**: https://github.com/jaekyunjung/-1-1
- **브랜치**: main

### 프로덕션 (Cloudflare Pages)
- 배포 예정

## 🎯 완료된 기능

### 1. 랜딩 페이지 ✅
- AI & 블록체인 강조 히어로 섹션
- 주요 기능 소개 (AI 가격 예측, 블록체인 보안, AI 추천, 수요 예측)
- 이용 방법 (3단계 프로세스)
- CTA 섹션
- 반응형 네비게이션
- **계명대학교** 문의 정보 (푸터)

### 2. 사용자 인증 시스템 ✅
**회원가입 페이지** (`/signup`)
- 이메일, 비밀번호, 이름 입력
- 역할 선택 (화주/포워더/선사)
- 회사명, 전화번호 (선택)
- 실시간 유효성 검사
- 비밀번호 확인 매칭

**로그인 페이지** (`/login`) ✅ **다중 로그인 방식 지원**
- **비밀번호 로그인** 탭
  - 이메일/비밀번호 입력 방식
  - 로그인 상태 유지 옵션
  - Verified 사용자 전용
  
- **간편 로그인 (매직 링크)** 탭 ⚡
  - 이메일만으로 간편 로그인
  - 6자리 인증 코드 입력 UI
  - 개별 입력 박스 (자동 포커스)
  - 붙여넣기 자동 분배
  - 5분 카운트다운 타이머
  - 재전송 버튼 (60초 쿨다운)
  - Basic 사용자 자동 생성
  
- **해시키 로그인** 탭 🔑
  - 블록체인 해시키 입력 (0x 형식)
  - 해시키 형식 자동 검증 (0x 접두사, 최소 10자)
  - 회원가입 시 발급된 해시키로 간편 로그인
  - Verified 사용자 전용
  
- 3-탭 UI로 간편한 로그인 방법 선택
- 에러 메시지 표시 및 성공 알림
- 애니메이션 효과 (페이드인)

**인증 API** (`/api/auth/*`)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 이메일/비밀번호 로그인
- `POST /api/auth/login-hash` - 해시키 로그인 🆕
- `POST /api/auth/login-cert` - 공동인증서 로그인 🆕
- `POST /api/auth/send-magic-link` - 매직 링크 발송 🆕
- `POST /api/auth/verify-magic-code` - 매직 코드 검증 🆕
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

**🔥 3단계 권한 시스템** ✅
- **Guest**: 비로그인 상태 (랜딩 페이지만)
- **Basic**: 매직 링크 인증 (검색 월 10회 제한)
- **Verified**: 풀 가입 (모든 기능 무제한)

**매직 링크 인증** (완료):
- ✅ 6자리 숫자 코드 (5분 유효)
- ✅ 재전송 제한 (60초 쿨다운)
- ✅ 실패 5회 시 10분 차단
- ✅ Basic 사용자 자동 생성
- ✅ 6개 입력 박스 UI (자동 포커스, 붙여넣기 지원)
- ✅ 카운트다운 타이머 표시

**권한 미들웨어** (완료):
- ✅ `requireAuth`: 로그인 필수
- ✅ `requireBasic`: Basic 이상 권한 필요
- ✅ `requireVerified`: Verified 권한 필수
- ✅ `checkSearchLimit`: 검색 횟수 제한 (Basic 사용자)

**API 엔드포인트**:
- ✅ `/api/vessels/search` - Basic 이상 + 검색 제한
- ✅ `/api/bookings/*` - Verified 전용
- 📄 상세 가이드: [PROMPTS_3TIER_AUTH.md](./PROMPTS_3TIER_AUTH.md)
- 📄 구현 문서: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

### 3. 선박 검색 시스템 ✅
**검색 페이지** (`/search`) 🗺️ **Google Maps 통합 완료!**
- 출발지/도착지 검색
- 날짜 필터
- 컨테이너 타입 필터
- 가격 정렬 (낮은/높은 순)
- 선박 카드 목록 표시
- 즉시 예약 기능
- **🆕 Google Maps 인터랙티브 지도**:
  - 전 세계 24개 주요 항구 마커 표시
  - 출발지 → 도착지 항로 시각화
  - 거리 정보 (km, 해리)
  - 예상 소요 시간 (20노트 기준)
  - 항구 클릭 시 상세 정보 표시
  - 전체화면 토글 기능

**선박 API** (`/api/vessels/*`)
- `GET /api/vessels` - 전체 선박 목록
- `GET /api/vessels/search` - 조건별 검색
- `GET /api/vessels/:id` - 선박 상세 정보

### 4. 예약 관리 시스템 ✅
**예약 API** (`/api/bookings/*`)
- `POST /api/bookings` - 예약 생성 (자동 블록체인 거래 생성)
- `GET /api/bookings/user/:userId` - 사용자 예약 목록
- `GET /api/bookings/:reference` - 예약 상세 조회
- `PATCH /api/bookings/:reference/cancel` - 예약 취소

### 5. 블록체인 시스템 ✅
**블록체인 탐색기 페이지** (`/blockchain`)
- 블록체인 통계 대시보드
- 트랜잭션 해시 조회
- 거래 내역 상세 정보
- 스마트 계약 현황

**블록체인 API** (`/api/blockchain/*`)
- `POST /api/blockchain/transaction` - 블록체인 거래 생성
- `GET /api/blockchain/transactions/:booking_id` - 예약별 거래 내역
- `GET /api/blockchain/transaction/:hash` - 트랜잭션 조회
- `POST /api/blockchain/smart-contract` - 스마트 계약 생성
- `POST /api/blockchain/smart-contract/:id/execute` - 계약 실행
- `GET /api/blockchain/stats` - 블록체인 통계

### 6. AI 추천 시스템 ✅
**AI 추천 페이지** (`/ai-recommend`)
- AI 통계 대시보드
- 가격 예측 폼
- 수요 예측 분석
- 선박 추천 시스템

**AI API** (`/api/ai/*`)
- `POST /api/ai/predict-price` - 가격 예측
- `POST /api/ai/recommend-vessels` - 선박 추천
- `GET /api/ai/demand-forecast` - 수요 예측
- `GET /api/ai/stats` - AI 통계

### 8. 네이버 API 통합 ✅
**네이버 검색 API** (`/api/search`) ✅
- `GET /api/search/news` - 해운 뉴스 검색 (733,648건)
- `GET /api/search/web` - 해운사 정보 검색 (1,648,509건)
- `GET /api/search/images` - 컨테이너 이미지 검색 (251,288건)
- 무료 일일 25,000건 호출 가능

**네이버 지도 API** (`/api/maps`) ✅ **DEPRECATED**
- Naver Maps API는 해상 경로를 지원하지 않아 더 이상 권장되지 않습니다
- Google Maps API로 전환됨 (아래 참조)

**Google Maps Platform API** (`/api/maps-google`) ✅ **NEW!** 🗺️
- `GET /api/maps-google/ports` - 전 세계 24개 주요 항구 목록 조회
- `GET /api/maps-google/ports/:code` - 특정 항구 정보 (좌표, 주소)
- `GET /api/maps-google/geocode` - 주소 → 좌표 변환 (Geocoding API)
- `GET /api/maps-google/reverse-geocode` - 좌표 → 주소 변환
- `GET /api/maps-google/distance` - 두 항구 간 Haversine 거리 계산 (km, 해리, 소요시간)
- **등록 항구**: 부산, 인천, 광양, 울산 (한국), 상하이, 닝보, 선전 (중국), 도쿄, 요코하마 (일본), 싱가포르, LA, 뉴욕, 로테르담 등 24개 항구
- **거리 계산 예시** (Haversine 공식):
  - 부산 → 상하이: 825km (445해리) - 약 22시간 ⛴️
  - 부산 → LA: 9,644km (5,207해리) - 약 10일 20시간 🚢
  - 부산 → 싱가포르: 4,579km (2,472해리) - 약 5일 3시간 🌊
- **무료 한도**: 월 28,500 요청 (Geocoding API)
- **비용**: $5 / 1,000 요청 (무료 한도 초과 시)
- **참고**: Distance Matrix API와 Directions API는 해상 경로를 지원하지 않으므로, Haversine 공식으로 직선 거리를 계산합니다.

### 7. 사용자 대시보드 ✅
**대시보드 페이지** (`/dashboard`)
- 통계 카드 (총 예약, 진행 중, 확정, 총 비용)
- 최근 예약 목록
- 빠른 실행 메뉴
- 도움말 섹션
- 예약 취소 기능

## 🗄️ 데이터베이스 스키마

### Users 테이블
```sql
- id: INTEGER (PK, AUTOINCREMENT)
- email: TEXT (UNIQUE, NOT NULL)
- password_hash: TEXT (NOT NULL)
- name: TEXT (NOT NULL)
- company: TEXT
- role: TEXT (shipper/forwarder/carrier)
- phone: TEXT
- created_at: DATETIME
- updated_at: DATETIME
```

### Vessels 테이블
```sql
- id: INTEGER (PK, AUTOINCREMENT)
- vessel_name: TEXT (NOT NULL)
- carrier_name: TEXT (NOT NULL)
- vessel_type: TEXT (container/bulk/tanker/roro)
- capacity: INTEGER (NOT NULL)
- departure_port: TEXT (NOT NULL)
- arrival_port: TEXT (NOT NULL)
- departure_date: TEXT (NOT NULL)
- arrival_date: TEXT (NOT NULL)
- available_space: INTEGER (NOT NULL)
- price_per_teu: REAL (NOT NULL)
- status: TEXT (available/full/departed/cancelled)
```

### Vessel Containers 테이블
```sql
- id: INTEGER (PK, AUTOINCREMENT)
- vessel_id: INTEGER (FK)
- container_type: TEXT (20GP/40GP/40HC/45HC/reefer)
- available_quantity: INTEGER (NOT NULL)
- price_per_unit: REAL (NOT NULL)
```

### Bookings 테이블
```sql
- id: INTEGER (PK, AUTOINCREMENT)
- user_id: INTEGER (FK)
- vessel_id: INTEGER (FK)
- container_type: TEXT (NOT NULL)
- quantity: INTEGER (NOT NULL)
- total_price: REAL (NOT NULL)
- status: TEXT (pending/confirmed/cancelled/completed)
- booking_reference: TEXT (UNIQUE, SHIP-YYYYMMDD-XXXX)
- cargo_weight: REAL
- cargo_description: TEXT
- company_name: TEXT
- contact_person: TEXT
- phone: TEXT
- email: TEXT
- notes: TEXT
```

### Blockchain Transactions 테이블 (신규) 🆕
```sql
- id: INTEGER (PK, AUTOINCREMENT)
- transaction_hash: TEXT (UNIQUE, NOT NULL)
- booking_id: INTEGER (FK)
- block_number: INTEGER
- transaction_type: TEXT (booking/payment/delivery/cancellation)
- from_address: TEXT (NOT NULL)
- to_address: TEXT (NOT NULL)
- amount: REAL
- gas_used: INTEGER
- status: TEXT (pending/confirmed/failed)
- blockchain_data: TEXT (JSON)
- timestamp: DATETIME
```

### Smart Contracts 테이블 (신규) 🆕
```sql
- id: INTEGER (PK, AUTOINCREMENT)
- contract_address: TEXT (UNIQUE, NOT NULL)
- contract_type: TEXT (booking/payment/escrow)
- booking_id: INTEGER (FK)
- status: TEXT (deployed/executed/cancelled)
- terms: TEXT (JSON)
- deployed_at: DATETIME
- executed_at: DATETIME
```

### AI Price Predictions 테이블 (신규) 🆕
```sql
- id: INTEGER (PK, AUTOINCREMENT)
- route: TEXT (NOT NULL, departure-arrival)
- container_type: TEXT (NOT NULL)
- predicted_price: REAL (NOT NULL)
- confidence_score: REAL (0.0-1.0)
- prediction_date: DATE
- actual_price: REAL
- model_version: TEXT
- features: TEXT (JSON)
```

### AI Recommendations 테이블 (신규) 🆕
```sql
- id: INTEGER (PK, AUTOINCREMENT)
- user_id: INTEGER (FK)
- recommendation_type: TEXT (vessel/route/price)
- input_criteria: TEXT (JSON)
- recommended_vessels: TEXT (JSON array)
- recommendation_score: REAL
- user_action: TEXT (accepted/rejected/ignored)
```

### AI Demand Forecasts 테이블 (신규) 🆕
```sql
- id: INTEGER (PK, AUTOINCREMENT)
- route: TEXT (NOT NULL)
- container_type: TEXT (NOT NULL)
- forecast_period: TEXT (YYYY-MM or YYYY-QN)
- predicted_demand: INTEGER (NOT NULL)
- confidence_level: TEXT (high/medium/low)
- factors: TEXT (JSON)
```

## 🛠️ 기술 스택

### Frontend
- **HTML/CSS**: 반응형 UI
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **JavaScript**: Vanilla JS (Axios로 API 통신)
- **Font Awesome**: 아이콘

### Backend
- **Hono**: 경량 웹 프레임워크
- **TypeScript**: 타입 안전성
- **Cloudflare Workers**: Edge 런타임

### Database
- **Cloudflare D1**: SQLite 기반 분산 데이터베이스

### AI & Blockchain (시뮬레이션)
- **AI 가격 예측**: 과거 데이터 기반 통계 모델
- **AI 추천 시스템**: 점수 기반 추천 알고리즘
- **블록체인**: 거래 해시 및 스마트 계약 시뮬레이션

### DevOps
- **Wrangler**: Cloudflare CLI
- **PM2**: 프로세스 관리 (개발 환경)
- **Vite**: 빌드 도구

## 🚀 로컬 개발 환경 설정

### 1. 의존성 설치
```bash
cd /home/user/webapp
npm install
```

### 2. 데이터베이스 초기화
```bash
# 마이그레이션 실행 (블록체인 & AI 테이블 포함)
npm run db:migrate:local

# 테스트 데이터 삽입
npm run db:seed
```

### 3. 개발 서버 시작
```bash
# 빌드
npm run build

# PM2로 서버 시작
pm2 start ecosystem.config.cjs

# 또는 직접 실행
npm run dev:sandbox
```

### 4. 테스트
```bash
# 서비스 확인
curl http://localhost:3000

# API 테스트
curl http://localhost:3000/api/vessels
curl http://localhost:3000/api/blockchain/stats
curl http://localhost:3000/api/ai/stats
```

## 📝 테스트 계정

### 화주 계정
- **이메일**: shipper@example.com
- **비밀번호**: password123
- **해시키**: 0x1234567890abcdefc (또는 마지막 문자가 'c'인 임의 해시키)
- **역할**: 화주 (Shipper)

### 포워더 계정
- **이메일**: forwarder@example.com
- **비밀번호**: password123
- **해시키**: 0x1234567890abcdefa (또는 마지막 문자가 'a'인 임의 해시키)
- **역할**: 포워더 (Forwarder)

### 선사 계정
- **이메일**: carrier@example.com
- **비밀번호**: password123
- **해시키**: 0x1234567890abcdefb (또는 마지막 문자가 'b'인 임의 해시키)
- **역할**: 선사 (Carrier)

### 공동인증서 로그인 테스트
- 모든 `.der`, `.pfx`, `.p12` 형식의 인증서 파일 지원
- 인증서 비밀번호는 4자 이상 필요
- 데모 환경에서는 어떤 인증서든 사용자 ID로 자동 매핑됨

## 📂 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx          # 메인 애플리케이션 (페이지 라우팅)
│   └── routes/
│       ├── auth.ts        # 인증 API
│       ├── vessels.ts     # 선박 API
│       ├── bookings.ts    # 예약 API (블록체인 통합)
│       ├── blockchain.ts  # 블록체인 API (신규)
│       ├── ai.ts          # AI API (신규)
│       └── pages.ts       # 블록체인/AI 페이지 라우트
├── migrations/
│   ├── 0001_initial_schema.sql         # 기본 스키마
│   ├── 0002_add_booking_details.sql    # 예약 상세 정보
│   └── 0003_add_blockchain_and_ai.sql  # 블록체인 & AI 테이블
├── seed.sql               # 테스트 데이터 (10개 선박)
├── public/
│   └── static/
│       ├── map-view.js    # Google Maps 클라이언트 (신규)
│       ├── utils.js       # 유틸리티 함수
│       └── styles.css     # 커스텀 스타일
├── wrangler.jsonc         # Cloudflare 설정
├── package.json           # 의존성 및 스크립트
├── ecosystem.config.cjs   # PM2 설정
└── README.md             # 프로젝트 문서
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: #667eea (보라색)
- **Secondary**: #764ba2 (진보라색)
- **Success**: #10b981 (녹색)
- **Warning**: #f59e0b (주황색)
- **Danger**: #ef4444 (빨간색)

### 그라데이션
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 🤖 AI 기능 상세

### 1. 가격 예측
- **알고리즘**: 과거 평균 가격 + 계절성 요인 + 랜덤 변동
- **신뢰도 계산**: 샘플 수 기반 (최소 60%, 최대 95%)
- **트렌드 분석**: 계절성 사인 함수로 상승/하락 판단

### 2. 선박 추천
- **점수 계산**: 가격(30점) + 출발일(20점) + 가용성(20점) + 기타(30점)
- **추천 이유**: 경쟁력 있는 가격, 충분한 재고, 신뢰할 수 있는 운송사
- **정렬**: 추천 점수 내림차순

### 3. 수요 예측
- **데이터**: 최근 6개월 예약 기록
- **예측 방법**: 최근 3개월 vs 이전 3개월 트렌드 비교
- **신뢰도**: 데이터 6개월 이상 시 'high', 미만 시 'medium'

## 🔗 블록체인 기능 상세

**📖 자세한 내용은 [블록체인 활용 설명서](./BLOCKCHAIN_EXPLANATION.md)를 참조하세요!**

### 1. 거래 기록
- **자동 발생**: 예약 생성 시 자동으로 블록체인 거래 생성
- **트랜잭션 해시**: `0x{timestamp}{random}` 형식
- **블록 번호**: 1,000,000 ~ 2,000,000 범위
- **가스 사용량**: 21,000 ~ 121,000 시뮬레이션

### 2. 스마트 계약
- **자동 배포**: 예약 시 스마트 계약 자동 생성
- **계약 주소**: `0xContract{timestamp}{random}`
- **계약 조건**: JSON 형태로 저장 (예약 정보, 가격, 조건)
- **상태 관리**: deployed → executed → cancelled

### 3. 투명성 및 검증
- **블록체인 탐색기**: `/blockchain` 페이지에서 모든 거래 조회 가능
- **거래 검증**: 트랜잭션 해시로 거래 상세 정보 확인
- **변조 불가**: 한번 기록된 거래는 수정/삭제 불가능
- **스마트 계약**: 조건 충족 시 자동 실행 보장

### 4. 실제 사용 예시
```javascript
// 예약 생성 시 자동으로 블록체인 거래 생성
POST /api/bookings

// 응답
{
  "success": true,
  "booking": { ... },
  "blockchain": {
    "transaction_hash": "0x1a2b3c4d5e6f",
    "block_number": 1234567,
    "contract_address": "0xContract789abc"
  }
}
```

### 5. 확인 방법
- **블록체인 탐색기**: https://your-domain/blockchain
- **API 조회**: `GET /api/blockchain/transaction/:hash`
- **통계 대시보드**: `GET /api/blockchain/stats`

## 🔜 향후 개발 계획

### 단기 (1-2주)
- [ ] 사용자 프로필 페이지
- [ ] 예약 상세 페이지
- [ ] 결제 시스템 통합
- [ ] 이메일 알림

### 중기 (1-2개월)
- [ ] 실시간 채팅 지원
- [x] 블록체인 스마트 컨트랙트 통합 ✅
- [x] AI 기반 선박 추천 ✅
- [ ] 모바일 앱 (React Native)
- [ ] 관리자 대시보드

### 장기 (3-6개월)
- [ ] 실제 블록체인 네트워크 연동 (Ethereum/Polygon)
- [ ] 고급 ML 모델 (LSTM, Prophet)
- [ ] 자동 롤오버 감지 및 알림
- [ ] 다국어 지원
- [ ] API 마켓플레이스

## 🐛 알려진 이슈

1. 비밀번호 해싱이 간소화되어 있음 (프로덕션에서는 bcrypt 사용 필요)
2. JWT 토큰이 localStorage에 저장됨 (HttpOnly 쿠키 사용 권장)
3. 블록체인 기능은 시뮬레이션 (실제 네트워크 연동 필요)
4. AI 모델은 간단한 통계 기반 (고급 ML 모델 필요)
5. 해시키 로그인은 시뮬레이션 (실제로는 DB에 해시키 저장 및 검증 필요)
6. 공동인증서 로그인은 시뮬레이션 (실제로는 PKI 라이브러리로 인증서 검증 필요)

---

**마지막 업데이트**: 2025-12-01
**버전**: 2.4.0 (Google Maps 통합 완료) ✅
**상태**: 개발 진행 중 🚧

**📋 진행 상황:**
- ✅ 1단계: 데이터베이스 스키마
- ✅ 2단계: 매직 링크 인증 (백엔드)
- ✅ 3단계: 권한 미들웨어 (완료)
- ✅ 4단계: 프론트엔드 UI (완료)
- ✅ 5단계: Basic → Verified 업그레이드 (완료)
- ✅ 6단계: Google Maps 통합 (완료) 🗺️
- 🔄 7단계: 통합 테스트 (진행 중)

**🎉 최근 완료 기능:**
- Google Maps Platform API 통합
- 검색 페이지에 인터랙티브 지도 추가
- 항로 시각화 (출발지 → 도착지)
- 거리 및 소요 시간 자동 계산
- 24개 주요 항구 데이터베이스
