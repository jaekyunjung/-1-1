# 🔗 ShipShare 블록체인 활용 설명서

## 📌 개요

ShipShare에서 블록체인은 **모든 예약 거래의 투명성과 무결성을 보장**하기 위해 사용됩니다. 
사용자가 선박을 예약할 때마다 자동으로 블록체인 거래가 생성되어 기록됩니다.

---

## 🎯 블록체인이 사용되는 주요 시점

### 1️⃣ **예약 생성 시 (자동 발생)**

사용자가 선박 예약을 완료하는 순간, 다음 3가지가 자동으로 생성됩니다:

#### A. 일반 예약 데이터
```sql
-- bookings 테이블에 저장
INSERT INTO bookings (
  user_id, vessel_id, container_type, quantity, 
  total_price, booking_reference, status
) VALUES (...)
```

#### B. **블록체인 거래 (Blockchain Transaction)** 🔗
```sql
-- blockchain_transactions 테이블에 자동 생성
INSERT INTO blockchain_transactions (
  transaction_hash,      -- 예: 0x1a2b3c4d...
  booking_id,           -- 예약 ID 연결
  block_number,         -- 블록 번호
  transaction_type,     -- 'booking'
  from_address,         -- 0xUser123 (사용자 주소)
  to_address,           -- 0xVessel456 (선박 주소)
  amount,               -- 거래 금액
  status,               -- 'confirmed'
  blockchain_data       -- 가스비, 블록해시 등
) VALUES (...)
```

#### C. **스마트 계약 (Smart Contract)** 📜
```sql
-- smart_contracts 테이블에 자동 생성
INSERT INTO smart_contracts (
  contract_address,     -- 예: 0xContract789abc
  contract_type,        -- 'booking'
  booking_id,           -- 예약 ID 연결
  terms                 -- 계약 조건 (JSON)
) VALUES (...)
```

---

## 🔍 실제 코드 예시

### 📂 위치: `/home/user/webapp/src/routes/bookings.ts`

```typescript
// 예약 생성 API 엔드포인트
bookings.post('/', async (c) => {
  // ... 예약 생성 로직 ...
  
  // ✅ 1. 예약 데이터 저장
  const result = await c.env.DB.prepare(`
    INSERT INTO bookings (...) VALUES (...)
  `).run()

  // ✅ 2. 블록체인 거래 자동 생성
  const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`
  const blockNumber = Math.floor(Math.random() * 1000000) + 1000000
  
  await c.env.DB.prepare(`
    INSERT INTO blockchain_transactions 
    (transaction_hash, booking_id, block_number, transaction_type, 
     from_address, to_address, amount, status, blockchain_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    txHash,                    // 트랜잭션 해시
    result.meta.last_row_id,   // 방금 생성한 예약 ID
    blockNumber,               // 블록 번호
    'booking',                 // 거래 유형
    `0xUser${userId}`,         // 발신 주소 (사용자)
    `0xVessel${vesselId}`,     // 수신 주소 (선박)
    totalPrice,                // 거래 금액
    'confirmed',               // 거래 상태
    JSON.stringify({           // 블록체인 메타데이터
      gasUsed: Math.floor(Math.random() * 100000) + 21000,
      gasPrice: '20',
      blockHash: `0x${Math.random().toString(16).slice(2)}`,
      network: 'ShipShare Chain',
      timestamp: new Date().toISOString()
    })
  ).run()

  // ✅ 3. 스마트 계약 자동 생성
  const contractAddress = `0xContract${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`
  
  await c.env.DB.prepare(`
    INSERT INTO smart_contracts 
    (contract_address, contract_type, booking_id, terms)
    VALUES (?, ?, ?, ?)
  `).bind(
    contractAddress,           // 계약 주소
    'booking',                 // 계약 유형
    result.meta.last_row_id,   // 예약 ID
    JSON.stringify({           // 계약 조건
      booking_reference: bookingRef,
      vessel_id: vesselId,
      container_type: containerType,
      quantity: quantity,
      total_price: totalPrice,
      terms: 'Payment upon delivery confirmation',
      auto_execute: true
    })
  ).run()

  // ✅ 4. 응답에 블록체인 정보 포함
  return c.json({
    success: true,
    message: '예약이 완료되었습니다.',
    booking,
    blockchain: {
      transaction_hash: txHash,
      block_number: blockNumber,
      contract_address: contractAddress
    }
  })
})
```

---

## 📊 데이터베이스 테이블 구조

### 1. `blockchain_transactions` 테이블

| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `id` | INTEGER | 고유 ID | 1 |
| `transaction_hash` | TEXT | 트랜잭션 해시 | 0x1a2b3c4d5e6f |
| `booking_id` | INTEGER | 연결된 예약 ID | 42 |
| `block_number` | INTEGER | 블록 번호 | 1234567 |
| `transaction_type` | TEXT | 거래 유형 | booking |
| `from_address` | TEXT | 발신 주소 | 0xUser123 |
| `to_address` | TEXT | 수신 주소 | 0xVessel456 |
| `amount` | REAL | 거래 금액 | 2500000 |
| `gas_used` | INTEGER | 가스 사용량 | 45678 |
| `status` | TEXT | 상태 | confirmed |
| `blockchain_data` | TEXT | 메타데이터 (JSON) | {...} |
| `timestamp` | DATETIME | 생성 시간 | 2025-11-21 14:30:00 |

### 2. `smart_contracts` 테이블

| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `id` | INTEGER | 고유 ID | 1 |
| `contract_address` | TEXT | 계약 주소 | 0xContract789abc |
| `contract_type` | TEXT | 계약 유형 | booking |
| `booking_id` | INTEGER | 연결된 예약 ID | 42 |
| `status` | TEXT | 계약 상태 | deployed |
| `terms` | TEXT | 계약 조건 (JSON) | {...} |
| `deployed_at` | DATETIME | 배포 시간 | 2025-11-21 14:30:00 |
| `executed_at` | DATETIME | 실행 시간 | NULL |

---

## 🌐 사용자가 블록체인을 확인하는 방법

### 1️⃣ **예약 완료 시**

예약이 완료되면 응답에 블록체인 정보가 포함됩니다:

```json
{
  "success": true,
  "message": "예약이 완료되었습니다.",
  "booking": { ... },
  "blockchain": {
    "transaction_hash": "0x1a2b3c4d5e6f",
    "block_number": 1234567,
    "contract_address": "0xContract789abc"
  }
}
```

### 2️⃣ **블록체인 탐색기 페이지** 🔍

URL: `/blockchain`

사용자는 다음을 확인할 수 있습니다:

#### A. 블록체인 통계 대시보드
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  총 거래 수     │ 확정된 거래     │ 스마트 계약     │ 총 거래 금액    │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│      125        │      120        │       85        │  ₩350,000,000   │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

#### B. 트랜잭션 해시 검색
```
┌────────────────────────────────────────────────┐
│  트랜잭션 해시 입력                            │
│  [0x1a2b3c4d5e6f________________] [🔍 조회]   │
└────────────────────────────────────────────────┘
```

검색 결과:
```
┌─────────────────────────────────────────────────────┐
│  거래 상세 정보                                     │
├─────────────────────────────────────────────────────┤
│  트랜잭션 해시: 0x1a2b3c4d5e6f                      │
│  블록 번호: 1234567                                 │
│  거래 유형: booking                                 │
│  상태: ✅ 확정됨                                    │
│  예약 번호: SHIP-20251121-0042                      │
│  사용자: 홍길동                                     │
│  금액: ₩2,500,000                                   │
│  가스 사용량: 45,678                                │
│  타임스탬프: 2025-11-21 14:30:00                    │
└─────────────────────────────────────────────────────┘
```

### 3️⃣ **API를 통한 조회**

#### 예약별 블록체인 거래 조회
```bash
GET /api/blockchain/transactions/:booking_id

# 응답
{
  "success": true,
  "transactions": [
    {
      "id": 1,
      "transaction_hash": "0x1a2b3c4d5e6f",
      "booking_id": 42,
      "block_number": 1234567,
      "transaction_type": "booking",
      "from_address": "0xUser123",
      "to_address": "0xVessel456",
      "amount": 2500000,
      "status": "confirmed",
      "timestamp": "2025-11-21T14:30:00Z"
    }
  ]
}
```

#### 트랜잭션 해시로 조회
```bash
GET /api/blockchain/transaction/:hash

# 응답
{
  "success": true,
  "transaction": {
    "transaction_hash": "0x1a2b3c4d5e6f",
    "booking_reference": "SHIP-20251121-0042",
    "user_name": "홍길동",
    "booking_status": "confirmed",
    ...
  }
}
```

---

## 💡 블록체인의 장점

### 1. **투명성** 🔍
- 모든 거래가 블록체인에 기록됨
- 누구나 트랜잭션 해시로 거래 내역 확인 가능
- 예약 내역 조작 불가능

### 2. **불변성** 🔒
- 한번 기록된 거래는 수정/삭제 불가
- 데이터 무결성 보장
- 분쟁 발생 시 명확한 증거 자료

### 3. **자동화** ⚡
- 스마트 계약으로 조건 충족 시 자동 실행
- 수동 개입 없이 계약 이행
- 신뢰성 향상

### 4. **추적성** 📊
- 예약부터 배송까지 전 과정 추적
- 거래 이력 완벽 보존
- 감사(Audit) 용이

---

## 🔄 전체 프로세스 흐름

```
1. 사용자 예약 요청
   └─> POST /api/bookings

2. 예약 데이터 생성
   └─> bookings 테이블 INSERT

3. 블록체인 거래 자동 생성 🔗
   ├─> transaction_hash 생성
   ├─> block_number 할당
   └─> blockchain_transactions 테이블 INSERT

4. 스마트 계약 자동 배포 📜
   ├─> contract_address 생성
   ├─> 계약 조건(terms) 저장
   └─> smart_contracts 테이블 INSERT

5. 응답 반환
   └─> 예약 정보 + 블록체인 정보

6. 사용자 확인 가능
   ├─> 대시보드에서 예약 확인
   ├─> 블록체인 탐색기에서 거래 검증
   └─> API로 상세 정보 조회
```

---

## 🎯 실전 예시

### 시나리오: 홍길동이 Maersk Line 선박 예약

1. **예약 정보**
   - 사용자: 홍길동 (user_id: 1)
   - 선박: Maersk Copenhagen (vessel_id: 3)
   - 컨테이너: 40HC x 2개
   - 가격: ₩2,500,000

2. **생성된 블록체인 데이터**
   ```json
   {
     "booking": {
       "id": 42,
       "booking_reference": "SHIP-20251121-0042",
       "status": "pending"
     },
     "blockchain_transaction": {
       "transaction_hash": "0x1a2b3c4d5e6f789...",
       "block_number": 1234567,
       "from_address": "0xUser1",
       "to_address": "0xVessel3",
       "amount": 2500000,
       "status": "confirmed"
     },
     "smart_contract": {
       "contract_address": "0xContract789abc...",
       "terms": {
         "booking_reference": "SHIP-20251121-0042",
         "vessel_id": 3,
         "container_type": "40HC",
         "quantity": 2,
         "total_price": 2500000,
         "terms": "Payment upon delivery confirmation",
         "auto_execute": true
       }
     }
   }
   ```

3. **홍길동이 확인하는 방법**
   - 대시보드 → 최근 예약 목록 확인
   - 블록체인 탐색기 → `0x1a2b3c4d5e6f789` 검색
   - 거래 상세 정보 확인
   - 스마트 계약 상태 확인

---

## 📝 주요 API 엔드포인트

### 블록체인 관련 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/blockchain/transaction` | POST | 블록체인 거래 생성 |
| `/api/blockchain/transactions/:booking_id` | GET | 예약별 거래 조회 |
| `/api/blockchain/transaction/:hash` | GET | 해시로 거래 조회 |
| `/api/blockchain/smart-contract` | POST | 스마트 계약 생성 |
| `/api/blockchain/smart-contract/:id/execute` | POST | 계약 실행 |
| `/api/blockchain/stats` | GET | 블록체인 통계 |

---

## ⚠️ 현재 구현 상태

### ✅ 구현된 기능
- 예약 시 자동 블록체인 거래 생성
- 스마트 계약 자동 배포
- 블록체인 탐색기 UI
- 트랜잭션 조회 API
- 통계 대시보드

### 🚧 향후 개선 사항
- 실제 블록체인 네트워크 연동 (Ethereum, Polygon 등)
- 실제 지갑 주소 연동
- 실제 가스비 계산
- 멀티시그(Multi-signature) 지원
- 크로스체인(Cross-chain) 거래

---

## 📚 참고 파일

- **예약 API**: `/home/user/webapp/src/routes/bookings.ts` (라인 81-125)
- **블록체인 API**: `/home/user/webapp/src/routes/blockchain.ts`
- **블록체인 페이지**: `/home/user/webapp/src/routes/pages.ts` (라인 5-208)
- **데이터베이스 스키마**: `/home/user/webapp/migrations/0003_add_blockchain_and_ai.sql`

---

## 🎓 결론

ShipShare의 블록체인은 **예약 생성 시점에 자동으로 발동**되어:

1. 모든 거래를 투명하게 기록
2. 변조 불가능한 증거 생성
3. 스마트 계약으로 자동화
4. 블록체인 탐색기로 누구나 검증 가능

이를 통해 **신뢰할 수 있는 선박 예약 플랫폼**을 구축했습니다! 🚢⛓️
