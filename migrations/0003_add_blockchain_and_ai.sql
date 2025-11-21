-- 블록체인 거래 기록 테이블
CREATE TABLE IF NOT EXISTS blockchain_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_hash TEXT UNIQUE NOT NULL,
  booking_id INTEGER NOT NULL,
  block_number INTEGER,
  transaction_type TEXT NOT NULL, -- 'booking', 'payment', 'delivery', 'cancellation'
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount REAL,
  gas_used INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  blockchain_data TEXT, -- JSON 형태로 블록체인 원본 데이터 저장
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- 스마트 계약 테이블
CREATE TABLE IF NOT EXISTS smart_contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_address TEXT UNIQUE NOT NULL,
  contract_type TEXT NOT NULL, -- 'booking', 'payment', 'escrow'
  booking_id INTEGER NOT NULL,
  status TEXT DEFAULT 'deployed', -- 'deployed', 'executed', 'cancelled'
  terms TEXT, -- JSON 형태로 계약 조건 저장
  deployed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  executed_at DATETIME,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- AI 가격 예측 기록 테이블
CREATE TABLE IF NOT EXISTS ai_price_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route TEXT NOT NULL, -- 'departure_port-arrival_port'
  container_type TEXT NOT NULL,
  predicted_price REAL NOT NULL,
  confidence_score REAL, -- 0.0 ~ 1.0
  prediction_date DATE NOT NULL,
  actual_price REAL,
  model_version TEXT,
  features TEXT, -- JSON 형태로 예측에 사용된 특성 저장
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI 추천 로그 테이블
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'vessel', 'route', 'price'
  input_criteria TEXT, -- JSON 형태로 입력 조건 저장
  recommended_vessels TEXT, -- JSON 배열로 추천 선박 ID 저장
  recommendation_score REAL,
  user_action TEXT, -- 'accepted', 'rejected', 'ignored'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI 수요 예측 테이블
CREATE TABLE IF NOT EXISTS ai_demand_forecasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route TEXT NOT NULL,
  container_type TEXT NOT NULL,
  forecast_period TEXT NOT NULL, -- '2024-12', '2025-Q1' 등
  predicted_demand INTEGER NOT NULL, -- 예상 컨테이너 수요량
  confidence_level TEXT, -- 'high', 'medium', 'low'
  factors TEXT, -- JSON 형태로 수요 영향 요인 저장
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_blockchain_booking_id ON blockchain_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_hash ON blockchain_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_smart_contract_booking ON smart_contracts(booking_id);
CREATE INDEX IF NOT EXISTS idx_ai_price_route ON ai_price_predictions(route, container_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_demand_route ON ai_demand_forecasts(route);
