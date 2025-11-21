# ShipShare - 블록체인 기반 선적권 거래 플랫폼

## 📋 프로젝트 개요

ShipShare는 해운/항공 롤오버 발생 시 실시간으로 대체 선박을 찾고 예약할 수 있는 혁신적인 플랫폼입니다. 블록체인 기술을 기반으로 투명하고 안전한 선박 예약 서비스를 제공합니다.

### 주요 특징
- 🚢 **실시간 선박 검색**: 전 세계 선박 스케줄 실시간 조회
- 💰 **가격 비교**: 여러 선사의 운임을 한눈에 비교
- ⚡ **즉시 예약**: 클릭 한 번으로 간편한 선박 공간 예약
- 🔐 **블록체인 보안**: 거래의 투명성과 보안 보장
- 📊 **통계 분석**: 선박 이용 내역과 비용 관리

## 🌐 배포 URL

### 개발 환경
- **로컬 개발**: https://3000-iopwnq1nluxtoxto0kcl7-0e616f0a.sandbox.novita.ai

### 프로덕션 (Cloudflare Pages)
- 배포 예정

## 🎯 완료된 기능

### 1. 랜딩 페이지 ✅
- 히어로 섹션 (그라데이션 배경)
- 주요 기능 소개 (6개 기능 카드)
- 이용 방법 (3단계 프로세스)
- CTA 섹션
- 반응형 네비게이션

### 2. 사용자 인증 시스템 ✅
**회원가입 페이지** (`/signup`)
- 이메일, 비밀번호, 이름 입력
- 역할 선택 (화주/포워더/선사)
- 회사명, 전화번호 (선택)
- 실시간 유효성 검사
- 비밀번호 확인 매칭

**로그인 페이지** (`/login`)
- 이메일/비밀번호 입력
- 로그인 상태 유지 옵션
- 에러 메시지 표시
- 소셜 로그인 버튼 (UI)

**인증 API** (`/api/auth/*`)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 3. 선박 검색 시스템 ✅
**검색 페이지** (`/search`)
- 출발지/도착지 검색
- 날짜 필터
- 컨테이너 타입 필터
- 가격 정렬 (낮은/높은 순)
- 선박 카드 목록 표시
- 즉시 예약 기능

**선박 API** (`/api/vessels/*`)
- `GET /api/vessels` - 전체 선박 목록
- `GET /api/vessels/search` - 조건별 검색
- `GET /api/vessels/:id` - 선박 상세 정보

### 4. 예약 관리 시스템 ✅
**예약 API** (`/api/bookings/*`)
- `POST /api/bookings` - 예약 생성
- `GET /api/bookings/user/:userId` - 사용자 예약 목록
- `GET /api/bookings/:reference` - 예약 상세 조회
- `PATCH /api/bookings/:reference/cancel` - 예약 취소

### 5. 사용자 대시보드 ✅
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
- created_at: DATETIME
- updated_at: DATETIME
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
- booking_reference: TEXT (UNIQUE)
- notes: TEXT
- created_at: DATETIME
- updated_at: DATETIME
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
# 마이그레이션 실행
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
```

## 📝 테스트 계정

### 화주 계정
- **이메일**: shipper@example.com
- **비밀번호**: password123
- **역할**: 화주 (Shipper)

### 포워더 계정
- **이메일**: forwarder@example.com
- **비밀번호**: password123
- **역할**: 포워더 (Forwarder)

### 선사 계정
- **이메일**: carrier@example.com
- **비밀번호**: password123
- **역할**: 선사 (Carrier)

## 📂 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx          # 메인 애플리케이션 (페이지 라우팅)
│   ├── lib/
│   │   └── auth.ts        # 인증 유틸리티
│   └── routes/
│       ├── auth.ts        # 인증 API
│       ├── vessels.ts     # 선박 API
│       └── bookings.ts    # 예약 API
├── migrations/
│   └── 0001_initial_schema.sql  # 데이터베이스 스키마
├── seed.sql               # 테스트 데이터
├── public/
│   └── static/            # 정적 파일
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

## 🔜 향후 개발 계획

### 단기 (1-2주)
- [ ] 사용자 프로필 페이지
- [ ] 예약 상세 페이지
- [ ] 결제 시스템 통합
- [ ] 이메일 알림

### 중기 (1-2개월)
- [ ] 실시간 채팅 지원
- [ ] 블록체인 스마트 컨트랙트 통합
- [ ] 모바일 앱 (React Native)
- [ ] 관리자 대시보드

### 장기 (3-6개월)
- [ ] AI 기반 선박 추천
- [ ] 자동 롤오버 감지 및 알림
- [ ] 다국어 지원
- [ ] API 마켓플레이스

## 🐛 알려진 이슈

1. 비밀번호 해싱이 간소화되어 있음 (프로덕션에서는 bcrypt 사용 필요)
2. JWT 토큰이 localStorage에 저장됨 (HttpOnly 쿠키 사용 권장)
3. 실제 블록체인 통합은 아직 미구현 상태

## 📄 라이선스

MIT License

## 👥 개발팀

- **프로젝트 관리**: ShipShare Team
- **개발**: AI Assistant
- **문의**: support@shipshare.com

## 🙏 기여하기

이슈나 PR을 환영합니다! 기여 가이드라인을 확인해주세요.

---

**마지막 업데이트**: 2025-11-21
**버전**: 1.0.0
**상태**: 개발 진행 중 🚧
