# ShipShare - 블록체인 기반 선적권 거래 플랫폼

## 프로젝트 개요

ShipShare는 해운/항공 롤오버 발생 시 실시간으로 대체 선박을 찾고 예약할 수 있는 혁신적인 플랫폼입니다.

### 주요 목표
- 롤오버 발생 시 빠른 대체 선박 검색
- 투명한 가격 비교 및 즉시 예약
- 블록체인 기술 기반의 안전한 거래

## 기술 스택

### 프론트엔드
- **HTML/CSS/JavaScript** - 순수 웹 기술
- **TailwindCSS** - 유틸리티 기반 CSS 프레임워크
- **Font Awesome** - 아이콘 라이브러리
- **Axios** - HTTP 클라이언트

### 백엔드
- **Hono** - 경량 웹 프레임워크
- **TypeScript** - 타입 안정성
- **Cloudflare Workers** - 엣지 런타임

### 데이터베이스
- **Cloudflare D1** - 글로벌 분산 SQLite 데이터베이스
- 로컬 개발: `.wrangler/state/v3/d1` (자동 생성)

### 배포
- **Cloudflare Pages** - 글로벌 CDN 배포

## 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx           # 메인 애플리케이션 (모든 페이지 포함)
│   ├── lib/
│   │   ├── auth.ts         # 인증 유틸리티
│   │   └── common-html.ts  # 공통 HTML 컴포넌트
│   └── routes/
│       ├── auth.ts         # 인증 API
│       ├── vessels.ts      # 선박 검색 API
│       └── bookings.ts     # 예약 관리 API
├── migrations/
│   └── 0001_initial_schema.sql  # 데이터베이스 스키마
├── public/                 # 정적 파일
├── seed.sql               # 테스트 데이터
├── wrangler.jsonc         # Cloudflare 설정
├── ecosystem.config.cjs   # PM2 설정
└── package.json           # 프로젝트 의존성
```

## 데이터베이스 스키마

### Users (사용자)
- 화주 (shipper): 제조업체
- 포워더 (forwarder): 중개업체
- 선사 (carrier): 해운사

### Vessels (선박)
- 선박 정보, 스케줄, 가용 공간

### Vessel Containers (컨테이너)
- 컨테이너 타입별 가용 수량 및 가격
- 지원 타입: 20GP, 40GP, 40HC, 45HC, Reefer

### Bookings (예약)
- 예약 정보, 상태 추적

## 현재 구현된 기능

### ✅ 1단계 완료 기능

#### 메인 랜딩 페이지
- 히어로 섹션 (가치 제안)
- 주요 기능 소개
- 이용 방법 안내
- CTA 버튼 및 푸터

#### 회원가입/로그인
- 이메일/비밀번호 인증
- 역할 선택 (화주/포워더/선사)
- JWT 기반 세션 관리
- LocalStorage 토큰 저장

#### 선박 검색
- 필터링 (출발지, 도착지, 날짜, 컨테이너 타입)
- 실시간 검색 결과
- 가격 및 가용 공간 표시
- 정렬 기능

#### 예약 시스템
- 선박 선택 및 예약
- 컨테이너 타입/수량 선택
- 가격 자동 계산
- 예약 확인서 발급

## API 엔드포인트

### 인증 API (`/api/auth`)
- `POST /register` - 회원가입
- `POST /login` - 로그인
- `POST /logout` - 로그아웃
- `GET /me` - 현재 사용자 정보

### 선박 API (`/api/vessels`)
- `GET /search` - 선박 검색 (쿼리 파라미터)
- `GET /` - 모든 선박 목록
- `GET /:id` - 선박 상세 정보

### 예약 API (`/api/bookings`)
- `POST /` - 예약 생성
- `GET /user/:userId` - 사용자 예약 목록
- `GET /:reference` - 예약 상세 정보
- `PATCH /:reference/cancel` - 예약 취소

## 로컬 개발 가이드

### 1. 프로젝트 설정

```bash
cd /home/user/webapp
npm install
```

### 2. 데이터베이스 초기화

```bash
# 마이그레이션 실행
npm run db:migrate:local

# 테스트 데이터 추가
npm run db:seed
```

### 3. 개발 서버 실행

```bash
# 빌드
npm run build

# PM2로 서버 시작
pm2 start ecosystem.config.cjs

# 서버 확인
curl http://localhost:3000
```

### 4. 데이터베이스 관리

```bash
# 로컬 DB 콘솔 접속
npm run db:console:local

# 데이터베이스 리셋 (모든 데이터 삭제 후 재생성)
npm run db:reset
```

### 5. 유용한 명령어

```bash
# PM2 상태 확인
pm2 list

# 로그 확인 (비차단)
pm2 logs --nostream

# 서버 재시작
pm2 restart shipshare

# 포트 정리
npm run clean-port

# 빌드 & 재시작 (변경사항 반영)
npm run build && pm2 restart shipshare
```

## 테스트 계정

시스템에 사전 등록된 테스트 계정:

```
화주 계정:
Email: shipper@example.com
Password: password123

포워더 계정:
Email: forwarder@example.com
Password: password123

선사 계정:
Email: carrier@example.com
Password: password123
```

## 샘플 데이터

데이터베이스에는 다음 테스트 데이터가 포함되어 있습니다:

### 선박 5척
1. PACIFIC GLORY (부산 → 로스앤젤레스)
2. ASIA EXPRESS (부산 → 로테르담)
3. OCEAN STAR (인천 → 함부르크)
4. KOREAN PRIDE (부산 → 싱가포르)
5. TRANS PACIFIC (부산 → 뉴욕)

### 각 선박별 컨테이너 타입 및 가격 정보 제공

## 배포 (Cloudflare Pages)

### 준비 사항
1. Cloudflare 계정
2. Cloudflare API 토큰

### 배포 절차

```bash
# 1. API 키 설정
# setup_cloudflare_api_key 함수 호출

# 2. 프로덕션 D1 데이터베이스 생성
npx wrangler d1 create shipshare-production

# 3. wrangler.jsonc에 database_id 업데이트

# 4. 프로덕션 마이그레이션
npm run db:migrate:prod

# 5. Cloudflare Pages 프로젝트 생성
npx wrangler pages project create shipshare --production-branch main

# 6. 배포
npm run deploy:prod
```

### 배포 URL
- Production: `https://shipshare.pages.dev`
- Branch: `https://main.shipshare.pages.dev`

## 현재 상태

### ✅ 완료된 기능
- 메인 랜딩 페이지
- 회원가입/로그인 시스템
- 선박 검색 기능
- 예약 시스템
- D1 데이터베이스 통합
- 로컬 개발 환경 구축

### 🚧 진행 중 / 향후 계획
- 사용자 대시보드 (예약 내역, 통계)
- 블록체인 통합 (스마트 컨트랙트)
- 실시간 알림 시스템
- 결제 시스템 통합
- 모바일 앱 개발
- 선사 대시보드 (선박 등록)
- 관리자 패널

## 프로젝트 특징

### 1. 모던 아키텍처
- 엣지 컴퓨팅 (Cloudflare Workers)
- 글로벌 분산 데이터베이스 (D1)
- 서버리스 아키텍처

### 2. 개발자 친화적
- TypeScript 타입 안정성
- Hot reload 지원
- 로컬 개발 환경 (--local 모드)

### 3. 확장 가능
- RESTful API 설계
- 모듈화된 라우트 구조
- 마이그레이션 기반 DB 관리

## 라이선스

MIT License

## 개발자

ShipShare 개발팀

## 문의

- 이메일: support@shipshare.com
- 전화: 02-1234-5678

---

**Last Updated**: 2025-11-21
**Version**: 1.0.0
**Status**: ✅ Active (Local Development)
