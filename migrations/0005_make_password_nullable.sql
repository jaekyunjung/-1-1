-- password_hash를 nullable로 변경
-- SQLite는 ALTER COLUMN을 지원하지 않으므로 테이블을 재생성해야 합니다

PRAGMA foreign_keys = OFF;

-- 1. 백업 테이블 생성
CREATE TABLE users_backup AS SELECT * FROM users;

-- 2. 기존 users 테이블 삭제
DROP TABLE users;

-- 3. password_hash가 nullable인 새 users 테이블 생성
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- nullable로 변경 (Basic 사용자는 NULL)
  name TEXT,
  company TEXT,
  role TEXT CHECK(role IN ('shipper', 'forwarder', 'carrier')),
  phone TEXT,
  
  -- 권한 시스템
  auth_level TEXT DEFAULT 'verified' CHECK(auth_level IN ('guest', 'basic', 'verified')),
  
  -- 매직 링크 인증
  magic_code TEXT,
  magic_code_expires_at DATETIME,
  magic_code_attempts INTEGER DEFAULT 0,
  magic_code_blocked_until DATETIME,
  
  -- 검색 제한
  search_count_monthly INTEGER DEFAULT 0,
  search_count_reset_date DATE,
  
  -- 메타데이터
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

-- 4. 백업 데이터 복원
INSERT INTO users (
  id, email, password_hash, name, company, role, phone,
  auth_level, magic_code, magic_code_expires_at, magic_code_attempts, 
  magic_code_blocked_until, search_count_monthly, search_count_reset_date,
  created_at, updated_at, last_login_at
)
SELECT 
  id, email, password_hash, name, company, role, phone,
  auth_level, magic_code, magic_code_expires_at, magic_code_attempts,
  magic_code_blocked_until, search_count_monthly, search_count_reset_date,
  created_at, updated_at, last_login_at
FROM users_backup;

-- 5. 백업 테이블 삭제
DROP TABLE users_backup;

-- 6. 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_level ON users(auth_level);
CREATE INDEX IF NOT EXISTS idx_users_magic_code ON users(magic_code);

PRAGMA foreign_keys = ON;
