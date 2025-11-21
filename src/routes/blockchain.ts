import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const blockchain = new Hono<{ Bindings: Bindings }>()

// 블록체인 거래 생성 (예약 시 자동 호출)
blockchain.post('/transaction', async (c) => {
  try {
    const { booking_id, transaction_type, from_address, to_address, amount } = await c.req.json()

    // 실제 블록체인과 연동 시에는 여기서 Web3.js 또는 ethers.js 사용
    // 현재는 시뮬레이션으로 트랜잭션 해시 생성
    const transaction_hash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`
    const block_number = Math.floor(Math.random() * 1000000) + 1000000

    const result = await c.env.DB.prepare(`
      INSERT INTO blockchain_transactions 
      (transaction_hash, booking_id, block_number, transaction_type, from_address, to_address, amount, status, blockchain_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
    `).bind(
      transaction_hash,
      booking_id,
      block_number,
      transaction_type,
      from_address,
      to_address,
      amount,
      JSON.stringify({
        gasUsed: Math.floor(Math.random() * 100000) + 21000,
        gasPrice: '20',
        blockHash: `0x${Math.random().toString(16).slice(2)}`,
        network: 'ShipShare Chain'
      })
    ).run()

    return c.json({
      success: true,
      transaction: {
        id: result.meta.last_row_id,
        transaction_hash,
        block_number,
        status: 'confirmed'
      }
    })
  } catch (error) {
    console.error('블록체인 거래 생성 오류:', error)
    return c.json({ success: false, error: '거래 생성에 실패했습니다.' }, 500)
  }
})

// 예약별 블록체인 거래 내역 조회
blockchain.get('/transactions/:booking_id', async (c) => {
  try {
    const bookingId = c.req.param('booking_id')

    const { results } = await c.env.DB.prepare(`
      SELECT * FROM blockchain_transactions
      WHERE booking_id = ?
      ORDER BY timestamp DESC
    `).bind(bookingId).all()

    return c.json({
      success: true,
      transactions: results
    })
  } catch (error) {
    console.error('거래 내역 조회 오류:', error)
    return c.json({ success: false, error: '거래 내역 조회에 실패했습니다.' }, 500)
  }
})

// 트랜잭션 해시로 거래 조회
blockchain.get('/transaction/:hash', async (c) => {
  try {
    const hash = c.req.param('hash')

    const transaction = await c.env.DB.prepare(`
      SELECT bt.*, b.booking_reference, b.status as booking_status, u.name as user_name
      FROM blockchain_transactions bt
      JOIN bookings b ON bt.booking_id = b.id
      JOIN users u ON b.user_id = u.id
      WHERE bt.transaction_hash = ?
    `).bind(hash).first()

    if (!transaction) {
      return c.json({ success: false, error: '거래를 찾을 수 없습니다.' }, 404)
    }

    return c.json({
      success: true,
      transaction
    })
  } catch (error) {
    console.error('거래 조회 오류:', error)
    return c.json({ success: false, error: '거래 조회에 실패했습니다.' }, 500)
  }
})

// 스마트 계약 생성
blockchain.post('/smart-contract', async (c) => {
  try {
    const { booking_id, contract_type, terms } = await c.req.json()

    const contract_address = `0xContract${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`

    const result = await c.env.DB.prepare(`
      INSERT INTO smart_contracts (contract_address, contract_type, booking_id, terms)
      VALUES (?, ?, ?, ?)
    `).bind(contract_address, contract_type, booking_id, JSON.stringify(terms)).run()

    return c.json({
      success: true,
      contract: {
        id: result.meta.last_row_id,
        contract_address,
        status: 'deployed'
      }
    })
  } catch (error) {
    console.error('스마트 계약 생성 오류:', error)
    return c.json({ success: false, error: '계약 생성에 실패했습니다.' }, 500)
  }
})

// 스마트 계약 실행
blockchain.post('/smart-contract/:id/execute', async (c) => {
  try {
    const contractId = c.req.param('id')

    await c.env.DB.prepare(`
      UPDATE smart_contracts
      SET status = 'executed', executed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(contractId).run()

    return c.json({
      success: true,
      message: '스마트 계약이 실행되었습니다.'
    })
  } catch (error) {
    console.error('스마트 계약 실행 오류:', error)
    return c.json({ success: false, error: '계약 실행에 실패했습니다.' }, 500)
  }
})

// 예약별 스마트 계약 조회
blockchain.get('/smart-contracts/:booking_id', async (c) => {
  try {
    const bookingId = c.req.param('booking_id')

    const { results } = await c.env.DB.prepare(`
      SELECT * FROM smart_contracts
      WHERE booking_id = ?
      ORDER BY deployed_at DESC
    `).bind(bookingId).all()

    return c.json({
      success: true,
      contracts: results
    })
  } catch (error) {
    console.error('계약 조회 오류:', error)
    return c.json({ success: false, error: '계약 조회에 실패했습니다.' }, 500)
  }
})

// 블록체인 통계
blockchain.get('/stats', async (c) => {
  try {
    const totalTx = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM blockchain_transactions
    `).first()

    const confirmedTx = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM blockchain_transactions WHERE status = 'confirmed'
    `).first()

    const totalContracts = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM smart_contracts
    `).first()

    const executedContracts = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM smart_contracts WHERE status = 'executed'
    `).first()

    const totalValue = await c.env.DB.prepare(`
      SELECT SUM(amount) as total FROM blockchain_transactions WHERE status = 'confirmed'
    `).first()

    return c.json({
      success: true,
      stats: {
        total_transactions: totalTx?.count || 0,
        confirmed_transactions: confirmedTx?.count || 0,
        total_contracts: totalContracts?.count || 0,
        executed_contracts: executedContracts?.count || 0,
        total_value: totalValue?.total || 0
      }
    })
  } catch (error) {
    console.error('통계 조회 오류:', error)
    return c.json({ success: false, error: '통계 조회에 실패했습니다.' }, 500)
  }
})

export default blockchain
