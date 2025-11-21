import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const ai = new Hono<{ Bindings: Bindings }>()

// AI 가격 예측
ai.post('/predict-price', async (c) => {
  try {
    const { departure_port, arrival_port, container_type, date } = await c.req.json()

    const route = `${departure_port}-${arrival_port}`

    // 실제로는 머신러닝 모델을 사용하지만, 여기서는 과거 데이터 기반 시뮬레이션
    const historicalPrices = await c.env.DB.prepare(`
      SELECT AVG(vc.price_per_unit) as avg_price, COUNT(*) as sample_count
      FROM vessels v
      JOIN vessel_containers vc ON v.id = vc.vessel_id
      WHERE v.departure_port = ? AND v.arrival_port = ? AND vc.container_type = ?
    `).bind(departure_port, arrival_port, container_type).first()

    if (!historicalPrices || historicalPrices.sample_count === 0) {
      return c.json({
        success: false,
        error: '해당 경로에 대한 충분한 데이터가 없습니다.'
      }, 404)
    }

    // 시뮬레이션: 평균 가격에 계절성 및 랜덤 변동 적용
    const basePrice = historicalPrices.avg_price
    const seasonalFactor = Math.sin(new Date(date).getMonth() / 12 * Math.PI * 2) * 0.1 + 1 // ±10% 계절 변동
    const randomFactor = (Math.random() - 0.5) * 0.1 + 1 // ±5% 랜덤 변동
    const predictedPrice = Math.round(basePrice * seasonalFactor * randomFactor)
    const confidence = Math.min(0.95, 0.6 + (historicalPrices.sample_count / 100))

    // 예측 기록 저장
    await c.env.DB.prepare(`
      INSERT INTO ai_price_predictions (route, container_type, predicted_price, confidence_score, prediction_date, model_version, features)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      route,
      container_type,
      predictedPrice,
      confidence,
      date,
      'v1.0-baseline',
      JSON.stringify({
        historical_avg: basePrice,
        sample_count: historicalPrices.sample_count,
        seasonal_factor: seasonalFactor,
        date_requested: new Date().toISOString()
      })
    ).run()

    return c.json({
      success: true,
      prediction: {
        route,
        container_type,
        predicted_price: predictedPrice,
        confidence_score: confidence,
        trend: seasonalFactor > 1 ? 'increasing' : 'decreasing',
        historical_average: Math.round(basePrice),
        date
      }
    })
  } catch (error) {
    console.error('가격 예측 오류:', error)
    return c.json({ success: false, error: '가격 예측에 실패했습니다.' }, 500)
  }
})

// AI 선박 추천
ai.post('/recommend-vessels', async (c) => {
  try {
    const { user_id, departure_port, arrival_port, container_type, max_price, preferred_date } = await c.req.json()

    // 조건에 맞는 선박 검색
    let query = `
      SELECT v.*, vc.container_type, vc.available_quantity, vc.price_per_unit,
             GROUP_CONCAT(vc.container_type || ':' || vc.available_quantity || ':' || vc.price_per_unit) as containers
      FROM vessels v
      JOIN vessel_containers vc ON v.id = vc.vessel_id
      WHERE v.status = 'available'
    `
    const params = []

    if (departure_port) {
      query += ` AND v.departure_port = ?`
      params.push(departure_port)
    }

    if (arrival_port) {
      query += ` AND v.arrival_port = ?`
      params.push(arrival_port)
    }

    if (container_type) {
      query += ` AND vc.container_type = ?`
      params.push(container_type)
    }

    if (max_price) {
      query += ` AND vc.price_per_unit <= ?`
      params.push(max_price)
    }

    query += ` GROUP BY v.id ORDER BY vc.price_per_unit ASC LIMIT 10`

    const { results } = await c.env.DB.prepare(query).bind(...params).all()

    // AI 점수 계산 (가격, 출발일, 가용성 기반)
    const recommendations = results.map((vessel: any) => {
      let score = 100

      // 가격 점수 (낮을수록 좋음)
      const priceScore = max_price ? ((max_price - vessel.price_per_unit) / max_price) * 30 : 20
      score += priceScore

      // 출발일 점수 (선호 날짜와 가까울수록 좋음)
      if (preferred_date) {
        const daysDiff = Math.abs(new Date(vessel.departure_date).getTime() - new Date(preferred_date).getTime()) / (1000 * 60 * 60 * 24)
        const dateScore = Math.max(0, 20 - daysDiff)
        score += dateScore
      }

      // 가용성 점수
      const availabilityScore = Math.min(20, vessel.available_quantity * 2)
      score += availabilityScore

      return {
        ...vessel,
        recommendation_score: Math.round(score),
        reasons: [
          priceScore > 15 ? '경쟁력 있는 가격' : null,
          vessel.available_quantity > 5 ? '충분한 재고' : null,
          vessel.carrier_name.includes('Maersk') || vessel.carrier_name.includes('MSC') ? '신뢰할 수 있는 운송사' : null
        ].filter(Boolean)
      }
    }).sort((a, b) => b.recommendation_score - a.recommendation_score)

    // 추천 로그 저장
    await c.env.DB.prepare(`
      INSERT INTO ai_recommendations (user_id, recommendation_type, input_criteria, recommended_vessels, recommendation_score)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user_id,
      'vessel',
      JSON.stringify({ departure_port, arrival_port, container_type, max_price, preferred_date }),
      JSON.stringify(recommendations.slice(0, 5).map(v => v.id)),
      recommendations[0]?.recommendation_score || 0
    ).run()

    return c.json({
      success: true,
      recommendations: recommendations.slice(0, 5),
      total_found: results.length
    })
  } catch (error) {
    console.error('선박 추천 오류:', error)
    return c.json({ success: false, error: '선박 추천에 실패했습니다.' }, 500)
  }
})

// AI 수요 예측
ai.get('/demand-forecast', async (c) => {
  try {
    const route = c.req.query('route')
    const container_type = c.req.query('container_type')

    if (!route || !container_type) {
      return c.json({ success: false, error: 'route와 container_type이 필요합니다.' }, 400)
    }

    // 과거 예약 데이터 기반 수요 분석
    const { results: bookingHistory } = await c.env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', b.created_at) as month,
        SUM(b.quantity) as total_quantity
      FROM bookings b
      JOIN vessels v ON b.vessel_id = v.id
      WHERE (v.departure_port || '-' || v.arrival_port) = ?
        AND b.container_type = ?
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `).bind(route, container_type).all()

    if (bookingHistory.length === 0) {
      return c.json({
        success: false,
        error: '해당 경로에 대한 수요 데이터가 없습니다.'
      }, 404)
    }

    // 평균 수요 계산
    const avgDemand = bookingHistory.reduce((sum: number, item: any) => sum + item.total_quantity, 0) / bookingHistory.length
    
    // 추세 분석 (최근 3개월 vs 이전 3개월)
    const recentDemand = bookingHistory.slice(0, 3).reduce((sum: number, item: any) => sum + item.total_quantity, 0) / 3
    const olderDemand = bookingHistory.slice(3, 6).reduce((sum: number, item: any) => sum + item.total_quantity, 0) / 3
    const trend = recentDemand > olderDemand ? 'increasing' : 'decreasing'
    const trendPercent = Math.round(((recentDemand - olderDemand) / olderDemand) * 100)

    // 다음 달 수요 예측
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const forecastPeriod = nextMonth.toISOString().slice(0, 7)
    const predictedDemand = Math.round(recentDemand * (1 + trendPercent / 100))

    // 예측 저장
    await c.env.DB.prepare(`
      INSERT INTO ai_demand_forecasts (route, container_type, forecast_period, predicted_demand, confidence_level, factors)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      route,
      container_type,
      forecastPeriod,
      predictedDemand,
      bookingHistory.length >= 6 ? 'high' : 'medium',
      JSON.stringify({
        historical_average: Math.round(avgDemand),
        recent_average: Math.round(recentDemand),
        trend,
        trend_percent: trendPercent
      })
    ).run()

    return c.json({
      success: true,
      forecast: {
        route,
        container_type,
        forecast_period: forecastPeriod,
        predicted_demand: predictedDemand,
        historical_average: Math.round(avgDemand),
        trend,
        trend_percent: trendPercent,
        confidence_level: bookingHistory.length >= 6 ? 'high' : 'medium',
        history: bookingHistory
      }
    })
  } catch (error) {
    console.error('수요 예측 오류:', error)
    return c.json({ success: false, error: '수요 예측에 실패했습니다.' }, 500)
  }
})

// AI 통계
ai.get('/stats', async (c) => {
  try {
    const totalPredictions = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM ai_price_predictions
    `).first()

    const totalRecommendations = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM ai_recommendations
    `).first()

    const avgConfidence = await c.env.DB.prepare(`
      SELECT AVG(confidence_score) as avg FROM ai_price_predictions
    `).first()

    const acceptedRecommendations = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM ai_recommendations WHERE user_action = 'accepted'
    `).first()

    return c.json({
      success: true,
      stats: {
        total_predictions: totalPredictions?.count || 0,
        total_recommendations: totalRecommendations?.count || 0,
        average_confidence: avgConfidence?.avg ? Math.round(avgConfidence.avg * 100) / 100 : 0,
        accepted_recommendations: acceptedRecommendations?.count || 0,
        acceptance_rate: totalRecommendations?.count > 0 
          ? Math.round((acceptedRecommendations?.count / totalRecommendations?.count) * 100) 
          : 0
      }
    })
  } catch (error) {
    console.error('AI 통계 조회 오류:', error)
    return c.json({ success: false, error: '통계 조회에 실패했습니다.' }, 500)
  }
})

export default ai
