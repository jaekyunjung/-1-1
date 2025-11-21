-- 3단계 권한 시스템 마이그레이션
-- Guest (비로그인) → Basic (이메일 인증) → Verified (풀 가입)

-- 1. 인증 세션 테이블 (JWT 토큰 관리)
CREATE TABLE IF NOT EXISTS auth_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON auth_sessions(token_hash);

-- 2. 검색 로그 테이블 (검색 횟수 추적)
CREATE TABLE IF NOT EXISTS search_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  query_params TEXT, -- JSON 형태로 저장
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);

-- 3. users 테이블에 신규 컬럼 추가 (ALTER TABLE 사용)
-- 권한 시스템
ALTER TABLE users ADD COLUMN auth_level TEXT DEFAULT 'verified' CHECK(auth_level IN ('guest', 'basic', 'verified'));

-- 매직 링크 인증
ALTER TABLE users ADD COLUMN magic_code TEXT;
ALTER TABLE users ADD COLUMN magic_code_expires_at DATETIME;
ALTER TABLE users ADD COLUMN magic_code_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN magic_code_blocked_until DATETIME;

-- 검색 제한
ALTER TABLE users ADD COLUMN search_count_monthly INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN search_count_reset_date DATE;

-- 메타데이터
ALTER TABLE users ADD COLUMN last_login_at DATETIME;

-- 4. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_auth_level ON users(auth_level);
CREATE INDEX IF NOT EXISTS idx_users_magic_code ON users(magic_code);
