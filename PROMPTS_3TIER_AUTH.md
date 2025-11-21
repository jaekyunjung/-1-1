# 🎯 ShipShare 3단계 권한 시스템 구현 프롬프트

이 문서는 ShipShare 프로젝트에 **3단계 권한 시스템 (Guest → Basic → Verified)**을 구현하기 위한 단계별 프롬프트를 포함합니다.

## 📊 현재 진행 상황

### ✅ 완료된 단계
- **[1단계]** 데이터베이스 스키마 생성 - ✅ 완료
- **[2단계]** 매직 링크 인증 시스템 (백엔드) - ✅ 완료

### 🔄 남은 단계
- **[3단계]** 권한 검증 미들웨어
- **[4단계]** 프론트엔드 UI
- **[5단계]** Basic → Verified 업그레이드
- **[6단계]** 통합 테스트

---

## 📋 완료 내역 상세

### [1단계] 데이터베이스 스키마 ✅

**적용된 마이그레이션:**
- `0004_add_auth_levels.sql` - 권한 시스템 컬럼 추가
- `0005_make_password_nullable.sql` - password_hash를 nullable로 변경

**추가된 테이블:**
```sql
-- auth_sessions (JWT 토큰 관리)
-- search_logs (검색 횟수 추적)
```

**추가된 컬럼 (users 테이블):**
```sql
auth_level TEXT DEFAULT 'verified' -- 'guest' | 'basic' | 'verified'
magic_code TEXT
magic_code_expires_at DATETIME
magic_code_attempts INTEGER DEFAULT 0
magic_code_blocked_until DATETIME
search_count_monthly INTEGER DEFAULT 0
search_count_reset_date DATE
last_login_at DATETIME
```

### [2단계] 매직 링크 인증 ✅

**구현된 파일:**
- `src/lib/magic-link.ts` - 매직 링크 유틸리티 함수
- `src/routes/auth.ts` - 새 API 엔드포인트 추가

**API 엔드포인트:**

1. **POST /api/auth/send-magic-link**
   ```json
   요청: { "email": "user@example.com" }
   응답: {
     "success": true,
     "message": "인증 코드를 이메일로 발송했습니다.",
     "expiresIn": 300
   }
   ```

2. **POST /api/auth/verify-magic-code**
   ```json
   요청: { "email": "user@example.com", "code": "825391" }
   응답: {
     "success": true,
     "message": "로그인 성공!",
     "token": "jwt_token",
     "user": {
       "id": 4,
       "email": "user@example.com",
       "auth_level": "basic",
       "searchRemaining": 10
     }
   }
   ```

**보안 기능:**
- ✅ 6자리 숫자 코드 (5분 유효)
- ✅ 재전송 제한 (1분)
- ✅ 실패 제한 (5회 실패 시 10분 차단)
- ✅ 자동 코드 삭제 (재사용 방지)

---

## 🚀 [3단계] 권한 검증 미들웨어 구현

다음 단계로, 권한 검증 미들웨어를 구현해주세요.

### 목표
각 API 엔드포인트에서 사용자의 권한(Guest/Basic/Verified)을 검증하고, 검색 횟수 제한을 관리합니다.

### 구현 요청

#### 1. src/middleware/auth.middleware.ts 생성

```typescript
import { Context, Next } from 'hono'

// JWT 토큰 검증 및 사용자 인증
export const requireAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: '로그인이 필요합니다.',
      loginUrl: '/login'
    }, 401)
  }

  const token = authHeader.substring(7)
  
  // TODO: JWT 토큰 검증 로직
  // TODO: 데이터베이스에서 사용자 정보 가져오기
  // TODO: c.set('user', user) 로 사용자 정보 주입
  
  await next()
}

// Basic 권한 이상 필요
export const requireBasic = async (c: Context, next: Next) => {
  const user = c.get('user')
  
  if (!user || !['basic', 'verified'].includes(user.auth_level)) {
    return c.json({
      success: false,
      error: '이 기능은 회원 전용입니다.',
      currentLevel: user?.auth_level || 'guest',
      requiredLevel: 'basic',
      upgradeUrl: '/login'
    }, 403)
  }
  
  await next()
}

// Verified 권한 필요
export const requireVerified = async (c: Context, next: Next) => {
  const user = c.get('user')
  
  if (!user || user.auth_level !== 'verified') {
    return c.json({
      success: false,
      error: '이 기능은 정회원 전용입니다.',
      message: '회원가입하시면 무제한으로 이용 가능합니다.',
      currentLevel: user?.auth_level || 'guest',
      requiredLevel: 'verified',
      upgradeUrl: '/signup'
    }, 403)
  }
  
  await next()
}
```

#### 2. src/middleware/rate-limit.middleware.ts 생성

```typescript
// 검색 횟수 제한 (Basic 사용자만)
export const checkSearchLimit = async (c: Context, next: Next) => {
  const user = c.get('user')
  
  // Verified 사용자는 무제한
  if (user.auth_level === 'verified') {
    return await next()
  }
  
  // 월별 검색 횟수 초기화 확인
  const now = new Date()
  const resetDate = user.search_count_reset_date 
    ? new Date(user.search_count_reset_date) 
    : null
  
  let searchCount = user.search_count_monthly || 0
  
  // 이번 달이 아니면 초기화
  if (!resetDate || resetDate.getMonth() !== now.getMonth()) {
    await c.env.DB.prepare(`
      UPDATE users 
      SET search_count_monthly = 0,
          search_count_reset_date = DATE('now')
      WHERE id = ?
    `).bind(user.id).run()
    
    searchCount = 0
  }
  
  // Basic 사용자: 월 10회 제한
  if (searchCount >= 10) {
    return c.json({
      success: false,
      error: '이번 달 검색 한도를 모두 사용했습니다.',
      message: '회원가입하시면 무제한으로 이용 가능합니다.',
      currentCount: searchCount,
      maxCount: 10,
      resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0],
      upgradeUrl: '/signup'
    }, 403)
  }
  
  // 검색 횟수 증가
  await c.env.DB.prepare(`
    UPDATE users 
    SET search_count_monthly = search_count_monthly + 1
    WHERE id = ?
  `).bind(user.id).run()
  
  // 검색 로그 기록
  await c.env.DB.prepare(`
    INSERT INTO search_logs (user_id, query_params)
    VALUES (?, ?)
  `).bind(user.id, JSON.stringify(c.req.query())).run()
  
  // 남은 횟수 응답에 포함
  c.set('searchRemaining', 10 - searchCount - 1)
  
  await next()
}
```

#### 3. src/routes/vessels.ts 수정

기존 선박 검색 API에 미들웨어 적용:

```typescript
import { requireAuth, requireBasic } from '../middleware/auth.middleware'
import { checkSearchLimit } from '../middleware/rate-limit.middleware'

// 선박 검색 (Basic 이상, 검색 횟수 제한)
vessels.get('/search', 
  requireAuth,           // 로그인 필수
  requireBasic,          // Basic 권한 필수
  checkSearchLimit,      // 검색 횟수 확인
  async (c) => {
    // 기존 검색 로직...
    
    const searchRemaining = c.get('searchRemaining')
    
    return c.json({
      success: true,
      results: [...],
      searchRemaining: searchRemaining
    })
  }
)
```

#### 4. src/routes/bookings.ts 수정

예약 API에 Verified 권한 요구:

```typescript
import { requireAuth, requireVerified } from '../middleware/auth.middleware'

// 선박 예약 (Verified만)
bookings.post('/', 
  requireAuth,
  requireVerified,
  async (c) => {
    // 기존 예약 로직...
  }
)
```

### 테스트 요청

다음 시나리오를 테스트해주세요:

1. **로그인 없이 검색 시도** → 401 Unauthorized
2. **Basic 사용자 검색** → 성공 (남은 횟수 표시)
3. **Basic 사용자 10회 검색** → 403 Forbidden (한도 초과)
4. **Verified 사용자 검색** → 무제한 성공
5. **Basic 사용자 예약 시도** → 403 Forbidden (권한 부족)
6. **Verified 사용자 예약** → 성공

---

## 🎨 [4단계] 프론트엔드 UI 구현

프론트엔드는 기존 Vanilla JS + Tailwind CSS 방식을 유지합니다.

### 구현 요청

#### 1. 이메일 로그인 페이지 수정 (/login)

`src/index.tsx`의 로그인 페이지에 **매직 링크 탭** 추가:

```html
<!-- 기존 이메일/비밀번호 탭 유지 -->
<div id="tab-magic-link" class="tab-content hidden">
  <h2>이메일로 간편 로그인</h2>
  <p class="text-sm text-gray-600 mb-4">
    비밀번호 없이 이메일만으로 로그인할 수 있습니다
  </p>
  
  <form id="magic-link-form">
    <input 
      type="email" 
      id="magic-email" 
      placeholder="이메일 주소"
      required
      class="w-full px-4 py-3 border rounded-lg"
    />
    <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg mt-4">
      로그인 코드 받기
    </button>
  </form>
</div>
```

#### 2. 코드 입력 화면

```html
<div id="verify-code-screen" class="hidden">
  <h2>이메일로 발송된 코드를 입력하세요</h2>
  <p class="text-sm text-gray-600">
    <span id="sent-email"></span>로<br/>
    인증 코드를 발송했습니다
  </p>
  
  <div class="flex gap-2 justify-center my-6">
    <input type="text" maxlength="1" class="code-input w-12 h-14 text-center text-2xl border rounded" />
    <input type="text" maxlength="1" class="code-input w-12 h-14 text-center text-2xl border rounded" />
    <input type="text" maxlength="1" class="code-input w-12 h-14 text-center text-2xl border rounded" />
    <input type="text" maxlength="1" class="code-input w-12 h-14 text-center text-2xl border rounded" />
    <input type="text" maxlength="1" class="code-input w-12 h-14 text-center text-2xl border rounded" />
    <input type="text" maxlength="1" class="code-input w-12 h-14 text-center text-2xl border rounded" />
  </div>
  
  <p class="text-sm text-center">
    ⏱ <span id="countdown">5:00</span> 남음
  </p>
  
  <button id="verify-code-btn" class="w-full bg-primary text-white py-3 rounded-lg mt-4">
    확인
  </button>
  
  <button id="resend-code-btn" class="w-full text-primary py-2 mt-2">
    코드가 오지 않나요? 다시 받기
  </button>
</div>
```

#### 3. JavaScript 로직

```javascript
// 매직 링크 발송
document.getElementById('magic-link-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('magic-email').value
  
  const response = await axios.post('/api/auth/send-magic-link', { email })
  
  if (response.data.success) {
    // 코드 입력 화면으로 전환
    document.getElementById('tab-magic-link').classList.add('hidden')
    document.getElementById('verify-code-screen').classList.remove('hidden')
    document.getElementById('sent-email').textContent = email
    
    // 카운트다운 시작
    startCountdown(300) // 5분
  }
})

// 코드 입력 자동 포커스 이동
const codeInputs = document.querySelectorAll('.code-input')
codeInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    if (e.target.value && index < codeInputs.length - 1) {
      codeInputs[index + 1].focus()
    }
  })
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      codeInputs[index - 1].focus()
    }
  })
})

// 코드 검증
document.getElementById('verify-code-btn').addEventListener('click', async () => {
  const code = Array.from(codeInputs).map(input => input.value).join('')
  const email = document.getElementById('sent-email').textContent
  
  const response = await axios.post('/api/auth/verify-magic-code', {
    email,
    code
  })
  
  if (response.data.success) {
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    window.location.href = '/search' // 검색 페이지로 이동
  } else {
    alert(response.data.error)
  }
})
```

#### 4. 검색 페이지에 제한 표시

```html
<!-- Basic 사용자에게만 표시 -->
<div id="search-limit-banner" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
  <p class="text-sm">
    ⚠️ 이번 달 검색: <strong><span id="search-used">3</span>/10회</strong> 남음
  </p>
  <button class="text-sm text-primary underline">
    무제한 검색하기 (회원가입)
  </button>
</div>
```

---

## 🔄 [5단계] Basic → Verified 업그레이드

Basic 사용자가 Verified로 전환하는 플로우를 구현해주세요.

### 구현 요청

#### 1. POST /api/auth/upgrade-to-verified

```typescript
auth.post('/upgrade-to-verified', requireAuth, requireBasic, async (c) => {
  const user = c.get('user')
  const { password, role, companyName } = await c.req.json()
  
  // 비밀번호 강도 검증
  if (!isValidPassword(password)) {
    return c.json({
      success: false,
      error: '비밀번호는 최소 8자 이상이어야 합니다.'
    }, 400)
  }
  
  // 역할 검증
  if (!['shipper', 'forwarder'].includes(role)) {
    return c.json({
      success: false,
      error: '역할을 선택해주세요.'
    }, 400)
  }
  
  // 비밀번호 해싱
  const passwordHash = await hashPassword(password)
  
  // 사용자 업데이트
  await c.env.DB.prepare(`
    UPDATE users
    SET password_hash = ?,
        auth_level = 'verified',
        role = ?,
        company = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(passwordHash, role, companyName || null, user.id).run()
  
  // 새 JWT 토큰 발급
  const token = generateSessionToken()
  
  return c.json({
    success: true,
    message: '회원가입이 완료되었습니다!',
    token: token,
    user: {
      ...user,
      auth_level: 'verified',
      role: role,
      company: companyName
    }
  })
})
```

#### 2. 업그레이드 모달 (프론트엔드)

```html
<div id="upgrade-modal" class="fixed inset-0 bg-black/50 hidden">
  <div class="bg-white rounded-2xl max-w-md mx-auto mt-20 p-6">
    <h2 class="text-2xl font-bold mb-4">🎉 30초 만에 가입 완료!</h2>
    
    <p class="text-sm text-gray-600 mb-4">
      이미 로그인된 이메일: <strong id="current-email"></strong> ✓
    </p>
    
    <form id="upgrade-form">
      <div class="mb-4">
        <label>비밀번호 설정</label>
        <input 
          type="password" 
          id="upgrade-password" 
          required
          placeholder="최소 8자, 영문+숫자 조합"
          class="w-full px-4 py-2 border rounded"
        />
        <div id="password-strength" class="h-2 bg-gray-200 rounded mt-2">
          <div class="h-full bg-green-500 rounded" style="width: 0%"></div>
        </div>
      </div>
      
      <div class="mb-4">
        <label>사용자 유형</label>
        <div class="flex gap-4 mt-2">
          <label class="flex items-center">
            <input type="radio" name="role" value="shipper" required />
            <span class="ml-2">화주 (제조업체)</span>
          </label>
          <label class="flex items-center">
            <input type="radio" name="role" value="forwarder" required />
            <span class="ml-2">포워더 (물류업체)</span>
          </label>
        </div>
      </div>
      
      <div class="mb-4">
        <label>회사명 (선택)</label>
        <input 
          type="text" 
          id="upgrade-company" 
          placeholder="회사명 입력"
          class="w-full px-4 py-2 border rounded"
        />
      </div>
      
      <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg">
        완료하기
      </button>
    </form>
  </div>
</div>
```

---

## 📝 [6단계] 통합 테스트 & 문서화

### 테스트 체크리스트

**인증:**
- [ ] 매직 링크 이메일 발송 성공
- [ ] 6자리 코드 정상 생성
- [ ] 코드 유효시간 5분 확인
- [ ] 재전송 제한 1분 확인
- [ ] 실패 5회 시 10분 차단 확인
- [ ] JWT 토큰 발급 성공

**권한:**
- [ ] Guest 사용자는 검색 불가
- [ ] Basic 사용자는 검색만 가능
- [ ] Basic 사용자는 예약 불가
- [ ] Verified 사용자는 모든 기능 사용 가능

**검색 제한:**
- [ ] Basic 사용자 월 10회 제한 확인
- [ ] Verified 사용자 무제한 확인
- [ ] 검색 횟수 실시간 업데이트
- [ ] 매월 1일 자동 초기화
- [ ] 한도 초과 시 적절한 안내

**업그레이드:**
- [ ] Basic → Verified 업그레이드 성공
- [ ] 비밀번호 강도 검증 작동
- [ ] 역할 선택 정상 저장
- [ ] JWT 토큰 재발급 성공

---

## 📚 참고 자료

### 권한 레벨 정의

| 레벨 | 이름 | 설명 | 기능 |
|------|------|------|------|
| 0 | Guest | 비로그인 | 랜딩 페이지만 |
| 1 | Basic | 이메일 인증 | 검색 (월 10회), 북마크 |
| 2 | Verified | 풀 가입 | 모든 기능 무제한 |

### API 엔드포인트 목록

**인증:**
- `POST /api/auth/send-magic-link` - 매직 링크 발송
- `POST /api/auth/verify-magic-code` - 코드 검증
- `POST /api/auth/login` - 비밀번호 로그인 (기존)
- `POST /api/auth/register` - 회원가입 (기존)
- `POST /api/auth/upgrade-to-verified` - 권한 업그레이드

**선박:**
- `GET /api/vessels/search` - 선박 검색 (Basic+, 횟수 제한)
- `GET /api/vessels/:id` - 선박 상세 (Basic+)

**예약:**
- `POST /api/bookings` - 예약 생성 (Verified만)
- `GET /api/bookings/user/:userId` - 예약 목록 (Verified만)

---

## 🎓 학습 자료

- [Hono 미들웨어 문서](https://hono.dev/guides/middleware)
- [Cloudflare D1 문서](https://developers.cloudflare.com/d1/)
- [JWT 인증 가이드](https://jwt.io/introduction)

---

**작성일**: 2025-11-21  
**버전**: 1.0  
**상태**: 1-2단계 완료, 3-6단계 대기 중
