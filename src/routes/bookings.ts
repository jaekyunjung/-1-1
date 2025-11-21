import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

const bookings = new Hono<{ Bindings: Bindings }>()

// Create booking
bookings.post('/', async (c) => {
  try {
    const { 
      userId, vesselId, containerType, quantity, notes,
      cargoWeight, cargoDescription, companyName, contactPerson, phone, email
    } = await c.req.json()

    // Validation
    if (!userId || !vesselId || !containerType || !quantity) {
      return c.json({ error: '필수 정보가 누락되었습니다.' }, 400)
    }

    // Check vessel availability
    const vessel = await c.env.DB.prepare(
      'SELECT * FROM vessels WHERE id = ? AND status = ?'
    ).bind(vesselId, 'available').first()

    if (!vessel) {
      return c.json({ error: '선택한 선박을 사용할 수 없습니다.' }, 404)
    }

    // Check container availability
    const container = await c.env.DB.prepare(
      'SELECT * FROM vessel_containers WHERE vessel_id = ? AND container_type = ?'
    ).bind(vesselId, containerType).first()

    if (!container) {
      return c.json({ error: '선택한 컨테이너 타입을 사용할 수 없습니다.' }, 404)
    }

    if (container.available_quantity < quantity) {
      return c.json({ 
        error: `가용 수량이 부족합니다. (가용: ${container.available_quantity}개)` 
      }, 400)
    }

    // Calculate total price
    const totalPrice = container.price_per_unit * quantity

    // Generate booking reference with SHIP-YYYYMMDD-XXXX format
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const bookingRef = `SHIP-${dateStr}-${randomNum}`

    // Create booking with additional fields
    const result = await c.env.DB.prepare(
      `INSERT INTO bookings 
       (user_id, vessel_id, container_type, quantity, total_price, booking_reference, notes, status,
        cargo_weight, cargo_description, company_name, contact_person, phone, email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      userId, vesselId, containerType, quantity, totalPrice, bookingRef, notes || null, 'pending',
      cargoWeight || null, cargoDescription || null, companyName || null, 
      contactPerson || null, phone || null, email || null
    ).run()

    if (!result.success) {
      return c.json({ error: '예약 생성 중 오류가 발생했습니다.' }, 500)
    }

    // Update container availability
    await c.env.DB.prepare(
      'UPDATE vessel_containers SET available_quantity = available_quantity - ? WHERE vessel_id = ? AND container_type = ?'
    ).bind(quantity, vesselId, containerType).run()

    // Get the created booking
    const booking = await c.env.DB.prepare(
      'SELECT * FROM bookings WHERE booking_reference = ?'
    ).bind(bookingRef).first()

    // Create blockchain transaction
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`
    const blockNumber = Math.floor(Math.random() * 1000000) + 1000000
    
    await c.env.DB.prepare(`
      INSERT INTO blockchain_transactions 
      (transaction_hash, booking_id, block_number, transaction_type, from_address, to_address, amount, status, blockchain_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      txHash,
      result.meta.last_row_id,
      blockNumber,
      'booking',
      `0xUser${userId}`,
      `0xVessel${vesselId}`,
      totalPrice,
      'confirmed',
      JSON.stringify({
        gasUsed: Math.floor(Math.random() * 100000) + 21000,
        gasPrice: '20',
        blockHash: `0x${Math.random().toString(16).slice(2)}`,
        network: 'ShipShare Chain',
        timestamp: new Date().toISOString()
      })
    ).run()

    // Create smart contract
    const contractAddress = `0xContract${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`
    await c.env.DB.prepare(`
      INSERT INTO smart_contracts (contract_address, contract_type, booking_id, terms)
      VALUES (?, ?, ?, ?)
    `).bind(
      contractAddress,
      'booking',
      result.meta.last_row_id,
      JSON.stringify({
        booking_reference: bookingRef,
        vessel_id: vesselId,
        container_type: containerType,
        quantity: quantity,
        total_price: totalPrice,
        terms: 'Payment upon delivery confirmation',
        auto_execute: true
      })
    ).run()

    return c.json({
      success: true,
      message: '예약이 완료되었습니다.',
      booking,
      blockchain: {
        transaction_hash: txHash,
        block_number: blockNumber,
        contract_address: contractAddress
      }
    }, 201)

  } catch (error) {
    console.error('Create booking error:', error)
    return c.json({ error: '예약 중 오류가 발생했습니다.' }, 500)
  }
})

// Get user's bookings
bookings.get('/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')

    const result = await c.env.DB.prepare(
      `SELECT 
        b.*,
        v.vessel_name,
        v.carrier_name,
        v.departure_port,
        v.arrival_port,
        v.departure_date,
        v.arrival_date
       FROM bookings b
       JOIN vessels v ON b.vessel_id = v.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`
    ).bind(userId).all()

    return c.json({
      success: true,
      count: result.results.length,
      bookings: result.results
    })

  } catch (error) {
    console.error('Get bookings error:', error)
    return c.json({ error: '예약 목록 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// Get booking by reference
bookings.get('/:reference', async (c) => {
  try {
    const reference = c.req.param('reference')

    const booking = await c.env.DB.prepare(
      `SELECT 
        b.*,
        v.*,
        u.name as user_name,
        u.email as user_email,
        u.company as user_company
       FROM bookings b
       JOIN vessels v ON b.vessel_id = v.id
       JOIN users u ON b.user_id = u.id
       WHERE b.booking_reference = ?`
    ).bind(reference).first()

    if (!booking) {
      return c.json({ error: '예약을 찾을 수 없습니다.' }, 404)
    }

    return c.json({
      success: true,
      booking
    })

  } catch (error) {
    console.error('Get booking error:', error)
    return c.json({ error: '예약 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// Cancel booking
bookings.patch('/:reference/cancel', async (c) => {
  try {
    const reference = c.req.param('reference')

    // Get booking details
    const booking = await c.env.DB.prepare(
      'SELECT * FROM bookings WHERE booking_reference = ?'
    ).bind(reference).first()

    if (!booking) {
      return c.json({ error: '예약을 찾을 수 없습니다.' }, 404)
    }

    if (booking.status === 'cancelled') {
      return c.json({ error: '이미 취소된 예약입니다.' }, 400)
    }

    if (booking.status === 'completed') {
      return c.json({ error: '완료된 예약은 취소할 수 없습니다.' }, 400)
    }

    // Update booking status
    await c.env.DB.prepare(
      'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE booking_reference = ?'
    ).bind('cancelled', reference).run()

    // Restore container availability
    await c.env.DB.prepare(
      'UPDATE vessel_containers SET available_quantity = available_quantity + ? WHERE vessel_id = ? AND container_type = ?'
    ).bind(booking.quantity, booking.vessel_id, booking.container_type).run()

    return c.json({
      success: true,
      message: '예약이 취소되었습니다.'
    })

  } catch (error) {
    console.error('Cancel booking error:', error)
    return c.json({ error: '예약 취소 중 오류가 발생했습니다.' }, 500)
  }
})

export default bookings
