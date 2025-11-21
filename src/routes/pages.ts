import { Hono } from 'hono'

const pages = new Hono()

// Blockchain Explorer page
pages.get('/blockchain', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>블록체인 탐색기 - ShipShare</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#667eea',
                  secondary: '#764ba2',
                }
              }
            }
          }
        </script>
        <style>
          .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/" class="flex items-center">
                            <i class="fas fa-ship text-primary text-2xl mr-3"></i>
                            <span class="text-2xl font-bold text-gray-800">ShipShare</span>
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="/search" class="text-gray-600 hover:text-primary">검색</a>
                        <a href="/blockchain" class="text-primary font-semibold">블록체인</a>
                        <a href="/ai-recommend" class="text-gray-600 hover:text-primary">AI 추천</a>
                        <a href="/dashboard" class="text-gray-600 hover:text-primary">대시보드</a>
                        <button onclick="logout()" class="text-gray-600 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> 로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="gradient-bg text-white rounded-xl p-8 mb-8">
                <h1 class="text-4xl font-bold mb-4">
                    <i class="fas fa-cube mr-3"></i>블록체인 탐색기
                </h1>
                <p class="text-xl">모든 거래를 투명하게 확인하고 검증하세요</p>
            </div>

            <!-- Stats Cards -->
            <div class="grid md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="text-gray-600 mb-2">총 거래 수</div>
                    <div class="text-3xl font-bold text-primary" id="total-tx">-</div>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="text-gray-600 mb-2">확정된 거래</div>
                    <div class="text-3xl font-bold text-green-600" id="confirmed-tx">-</div>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="text-gray-600 mb-2">스마트 계약</div>
                    <div class="text-3xl font-bold text-purple-600" id="total-contracts">-</div>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="text-gray-600 mb-2">총 거래 금액</div>
                    <div class="text-3xl font-bold text-blue-600" id="total-value">-</div>
                </div>
            </div>

            <!-- Search Transaction -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 class="text-2xl font-bold mb-4">거래 조회</h2>
                <div class="flex gap-4">
                    <input 
                        type="text" 
                        id="tx-hash" 
                        placeholder="트랜잭션 해시를 입력하세요 (예: 0x...)" 
                        class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                    <button 
                        onclick="searchTransaction()" 
                        class="bg-primary text-white px-8 py-2 rounded-lg hover:bg-secondary transition"
                    >
                        <i class="fas fa-search mr-2"></i>조회
                    </button>
                </div>
                <div id="tx-result" class="mt-4"></div>
            </div>
        </div>

        <script>
          function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }

          async function loadBlockchainStats() {
            try {
              const response = await axios.get('/api/blockchain/stats');
              if (response.data.success) {
                const stats = response.data.stats;
                document.getElementById('total-tx').textContent = stats.total_transactions;
                document.getElementById('confirmed-tx').textContent = stats.confirmed_transactions;
                document.getElementById('total-contracts').textContent = stats.total_contracts;
                document.getElementById('total-value').textContent = new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW'
                }).format(stats.total_value || 0);
              }
            } catch (error) {
              console.error('통계 로드 오류:', error);
            }
          }

          async function searchTransaction() {
            const hash = document.getElementById('tx-hash').value.trim();
            const resultDiv = document.getElementById('tx-result');
            
            if (!hash) {
              resultDiv.innerHTML = '<div class="text-red-600">트랜잭션 해시를 입력하세요.</div>';
              return;
            }

            try {
              const response = await axios.get('/api/blockchain/transaction/' + hash);
              if (response.data.success) {
                const tx = response.data.transaction;
                const blockchainData = JSON.parse(tx.blockchain_data || '{}');
                const statusClass = tx.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                const statusText = tx.status === 'confirmed' ? '확정됨' : '대기 중';
                
                resultDiv.innerHTML = '<div class="border rounded-lg p-4 bg-gray-50">' +
                  '<div class="grid md:grid-cols-2 gap-4">' +
                  '<div><div class="text-sm text-gray-600">트랜잭션 해시</div><div class="font-mono text-sm break-all">' + tx.transaction_hash + '</div></div>' +
                  '<div><div class="text-sm text-gray-600">블록 번호</div><div class="font-semibold">' + tx.block_number + '</div></div>' +
                  '<div><div class="text-sm text-gray-600">거래 유형</div><div class="font-semibold">' + tx.transaction_type + '</div></div>' +
                  '<div><div class="text-sm text-gray-600">상태</div><div class="inline-block px-3 py-1 rounded-full text-sm font-semibold ' + statusClass + '">' + statusText + '</div></div>' +
                  '<div><div class="text-sm text-gray-600">예약 번호</div><div class="font-semibold">' + tx.booking_reference + '</div></div>' +
                  '<div><div class="text-sm text-gray-600">사용자</div><div class="font-semibold">' + tx.user_name + '</div></div>' +
                  '<div><div class="text-sm text-gray-600">금액</div><div class="font-semibold">' + new Intl.NumberFormat('ko-KR', {style: 'currency', currency: 'KRW'}).format(tx.amount || 0) + '</div></div>' +
                  '<div><div class="text-sm text-gray-600">가스 사용량</div><div class="font-semibold">' + (blockchainData.gasUsed || 'N/A') + '</div></div>' +
                  '<div class="md:col-span-2"><div class="text-sm text-gray-600">타임스탬프</div><div class="font-semibold">' + new Date(tx.timestamp).toLocaleString('ko-KR') + '</div></div>' +
                  '</div></div>';
              }
            } catch (error) {
              if (error.response && error.response.status === 404) {
                resultDiv.innerHTML = '<div class="text-red-600">거래를 찾을 수 없습니다.</div>';
              } else {
                resultDiv.innerHTML = '<div class="text-red-600">조회 중 오류가 발생했습니다.</div>';
              }
            }
          }

          // Load stats on page load
          loadBlockchainStats();
        </script>
    </body>
    </html>
  `)
})

// AI Recommendation page  
pages.get('/ai-recommend', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI 추천 - ShipShare</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#667eea',
                  secondary: '#764ba2',
                }
              }
            }
          }
        </script>
        <style>
          .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/" class="flex items-center">
                            <i class="fas fa-ship text-primary text-2xl mr-3"></i>
                            <span class="text-2xl font-bold text-gray-800">ShipShare</span>
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="/search" class="text-gray-600 hover:text-primary">검색</a>
                        <a href="/blockchain" class="text-gray-600 hover:text-primary">블록체인</a>
                        <a href="/ai-recommend" class="text-primary font-semibold">AI 추천</a>
                        <a href="/dashboard" class="text-gray-600 hover:text-primary">대시보드</a>
                        <button onclick="logout()" class="text-gray-600 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> 로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="gradient-bg text-white rounded-xl p-8 mb-8">
                <h1 class="text-4xl font-bold mb-4">
                    <i class="fas fa-brain mr-3"></i>AI 스마트 추천
                </h1>
                <p class="text-xl">인공지능이 분석한 최적의 선박과 경로를 확인하세요</p>
            </div>

            <!-- AI Stats -->
            <div class="grid md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="text-gray-600 mb-2">총 예측 건수</div>
                    <div class="text-3xl font-bold text-primary" id="total-predictions">-</div>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="text-gray-600 mb-2">평균 신뢰도</div>
                    <div class="text-3xl font-bold text-green-600" id="avg-confidence">-</div>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="text-gray-600 mb-2">추천 수락률</div>
                    <div class="text-3xl font-bold text-purple-600" id="acceptance-rate">-</div>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="text-gray-600 mb-2">총 추천 건수</div>
                    <div class="text-3xl font-bold text-blue-600" id="total-recommendations">-</div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-8 mb-8">
                <!-- Price Prediction -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-2xl font-bold mb-4">
                        <i class="fas fa-chart-line mr-2 text-primary"></i>가격 예측
                    </h2>
                    <form id="price-prediction-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold mb-2">출발지</label>
                            <input type="text" id="predict-departure" class="w-full px-4 py-2 border rounded-lg" placeholder="예: Busan" required />
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">도착지</label>
                            <input type="text" id="predict-arrival" class="w-full px-4 py-2 border rounded-lg" placeholder="예: Los Angeles" required />
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">컨테이너 타입</label>
                            <select id="predict-container" class="w-full px-4 py-2 border rounded-lg" required>
                                <option value="20GP">20GP</option>
                                <option value="40GP">40GP</option>
                                <option value="40HC">40HC</option>
                                <option value="45HC">45HC</option>
                                <option value="reefer">Reefer</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">예상 날짜</label>
                            <input type="date" id="predict-date" class="w-full px-4 py-2 border rounded-lg" required />
                        </div>
                        <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                            <i class="fas fa-magic mr-2"></i>AI 가격 예측
                        </button>
                    </form>
                    <div id="price-result" class="mt-4"></div>
                </div>

                <!-- Demand Forecast -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-2xl font-bold mb-4">
                        <i class="fas fa-chart-area mr-2 text-primary"></i>수요 예측
                    </h2>
                    <form id="demand-forecast-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold mb-2">경로</label>
                            <input type="text" id="demand-route" class="w-full px-4 py-2 border rounded-lg" placeholder="예: Busan-Los Angeles" required />
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">컨테이너 타입</label>
                            <select id="demand-container" class="w-full px-4 py-2 border rounded-lg" required>
                                <option value="20GP">20GP</option>
                                <option value="40GP">40GP</option>
                                <option value="40HC">40HC</option>
                                <option value="45HC">45HC</option>
                                <option value="reefer">Reefer</option>
                            </select>
                        </div>
                        <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                            <i class="fas fa-chart-bar mr-2"></i>수요 예측 분석
                        </button>
                    </form>
                    <div id="demand-result" class="mt-4"></div>
                </div>
            </div>

            <!-- AI Recommendations Info -->
            <div class="bg-blue-50 border-l-4 border-primary rounded-lg p-6 mb-8">
                <div class="flex items-start">
                    <i class="fas fa-info-circle text-primary text-2xl mr-4 mt-1"></i>
                    <div>
                        <h3 class="text-lg font-bold text-gray-800 mb-2">AI 추천 시스템 안내</h3>
                        <p class="text-gray-700">
                            ShipShare의 AI는 과거 거래 데이터, 시장 동향, 계절성 등을 분석하여 
                            최적의 선박과 가격 정보를 제공합니다. 선박 검색 페이지에서 더 많은 추천 기능을 경험해보세요.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <script>
          function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }

          async function loadAIStats() {
            try {
              const response = await axios.get('/api/ai/stats');
              if (response.data.success) {
                const stats = response.data.stats;
                document.getElementById('total-predictions').textContent = stats.total_predictions;
                document.getElementById('avg-confidence').textContent = (stats.average_confidence * 100).toFixed(1) + '%';
                document.getElementById('acceptance-rate').textContent = stats.acceptance_rate + '%';
                document.getElementById('total-recommendations').textContent = stats.total_recommendations;
              }
            } catch (error) {
              console.error('AI 통계 로드 오류:', error);
            }
          }

          document.getElementById('price-prediction-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const resultDiv = document.getElementById('price-result');
            resultDiv.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-primary text-2xl"></i></div>';

            try {
              const response = await axios.post('/api/ai/predict-price', {
                departure_port: document.getElementById('predict-departure').value,
                arrival_port: document.getElementById('predict-arrival').value,
                container_type: document.getElementById('predict-container').value,
                date: document.getElementById('predict-date').value
              });

              if (response.data.success) {
                const pred = response.data.prediction;
                const trendColor = pred.trend === 'increasing' ? 'text-red-600' : 'text-green-600';
                const trendText = pred.trend === 'increasing' ? '↑ 상승' : '↓ 하락';
                
                resultDiv.innerHTML = '<div class="border-2 border-primary rounded-lg p-4 bg-blue-50">' +
                  '<div class="text-center mb-3">' +
                  '<div class="text-3xl font-bold text-primary">' + new Intl.NumberFormat('ko-KR', {style: 'currency', currency: 'KRW'}).format(pred.predicted_price) + '</div>' +
                  '<div class="text-sm text-gray-600 mt-1">예측 가격</div>' +
                  '</div>' +
                  '<div class="grid grid-cols-2 gap-4 text-sm">' +
                  '<div><div class="text-gray-600">신뢰도</div><div class="font-semibold">' + (pred.confidence_score * 100).toFixed(1) + '%</div></div>' +
                  '<div><div class="text-gray-600">트렌드</div><div class="font-semibold ' + trendColor + '">' + trendText + '</div></div>' +
                  '<div><div class="text-gray-600">역사적 평균</div><div class="font-semibold">' + new Intl.NumberFormat('ko-KR', {style: 'currency', currency: 'KRW'}).format(pred.historical_average) + '</div></div>' +
                  '<div><div class="text-gray-600">예측 날짜</div><div class="font-semibold">' + pred.date + '</div></div>' +
                  '</div></div>';
              }
            } catch (error) {
              resultDiv.innerHTML = '<div class="text-red-600">예측에 실패했습니다. 해당 경로에 대한 데이터가 부족할 수 있습니다.</div>';
            }
          });

          document.getElementById('demand-forecast-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const resultDiv = document.getElementById('demand-result');
            resultDiv.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-primary text-2xl"></i></div>';

            try {
              const route = document.getElementById('demand-route').value;
              const containerType = document.getElementById('demand-container').value;
              const response = await axios.get('/api/ai/demand-forecast?route=' + route + '&container_type=' + containerType);

              if (response.data.success) {
                const forecast = response.data.forecast;
                const confClass = forecast.confidence_level === 'high' ? 'text-green-600' : 'text-yellow-600';
                const confText = forecast.confidence_level === 'high' ? '높음' : '중간';
                const trendColor = forecast.trend === 'increasing' ? 'text-red-600' : 'text-green-600';
                const trendText = forecast.trend === 'increasing' ? '↑ 증가' : '↓ 감소';
                
                resultDiv.innerHTML = '<div class="border-2 border-purple-500 rounded-lg p-4 bg-purple-50">' +
                  '<div class="text-center mb-3">' +
                  '<div class="text-3xl font-bold text-purple-600">' + forecast.predicted_demand + '</div>' +
                  '<div class="text-sm text-gray-600 mt-1">예상 수요 (컨테이너)</div>' +
                  '</div>' +
                  '<div class="grid grid-cols-2 gap-4 text-sm">' +
                  '<div><div class="text-gray-600">예측 기간</div><div class="font-semibold">' + forecast.forecast_period + '</div></div>' +
                  '<div><div class="text-gray-600">신뢰도</div><div class="font-semibold ' + confClass + '">' + confText + '</div></div>' +
                  '<div><div class="text-gray-600">역사적 평균</div><div class="font-semibold">' + forecast.historical_average + '</div></div>' +
                  '<div><div class="text-gray-600">트렌드</div><div class="font-semibold ' + trendColor + '">' + trendText + ' (' + forecast.trend_percent + '%)</div></div>' +
                  '</div></div>';
              }
            } catch (error) {
              resultDiv.innerHTML = '<div class="text-red-600">수요 예측에 실패했습니다. 해당 경로에 대한 데이터가 부족할 수 있습니다.</div>';
            }
          });

          // Load AI stats on page load
          loadAIStats();
        </script>
    </body>
    </html>
  `)
})

export default pages
