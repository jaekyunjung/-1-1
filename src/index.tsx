import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import auth from './routes/auth'
import vessels from './routes/vessels'
import bookings from './routes/bookings'
import blockchain from './routes/blockchain'
import ai from './routes/ai'
import maps from './routes/maps'
import mapsGoogle from './routes/maps-google'
import search from './routes/search'
import pages from './routes/pages'
import login from './routes/login'

type Bindings = {
  DB: D1Database;
  NAVER_MAPS_CLIENT_ID: string;
  NAVER_MAPS_CLIENT_SECRET: string;
  NAVER_SEARCH_CLIENT_ID: string;
  NAVER_SEARCH_CLIENT_SECRET: string;
  GOOGLE_MAPS_API_KEY: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Mount API routes
app.route('/api/auth', auth)
app.route('/api/vessels', vessels)
app.route('/api/bookings', bookings)
app.route('/api/blockchain', blockchain)
app.route('/api/ai', ai)
app.route('/api/maps', maps)
app.route('/api/maps-google', mapsGoogle)
app.route('/api/search', search)

// Mount page routes
app.route('/', pages)
app.route('/', login)

// Landing page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ShipShare - AI & 블록체인 기반 스마트 선적권 거래 플랫폼</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="/static/session-timer.js"></script>
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
          .hero-pattern {
            background-color: #667eea;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm fixed w-full top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <i class="fas fa-ship text-primary text-2xl mr-3"></i>
                        <span class="text-2xl font-bold text-gray-800">ShipShare</span>
                    </div>
                    <div class="hidden md:flex items-center space-x-8">
                        <a href="#features" class="text-gray-600 hover:text-primary transition">주요 기능</a>
                        <a href="#how-it-works" class="text-gray-600 hover:text-primary transition">이용 방법</a>
                        <a href="#pricing" class="text-gray-600 hover:text-primary transition">요금</a>
                        <a id="auth-link" href="/login" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition">로그인</a>
                    </div>
                    <div class="md:hidden">
                        <button id="mobile-menu-btn" class="text-gray-600">
                            <i class="fas fa-bars text-2xl"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Mobile Menu -->
            <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
                <div class="px-4 py-3 space-y-3">
                    <a href="#features" class="block text-gray-600 hover:text-primary">주요 기능</a>
                    <a href="#how-it-works" class="block text-gray-600 hover:text-primary">이용 방법</a>
                    <a href="#pricing" class="block text-gray-600 hover:text-primary">요금</a>
                    <a id="auth-link-mobile" href="/login" class="block bg-primary text-white px-6 py-2 rounded-lg text-center">로그인</a>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero-pattern pt-32 pb-20 px-4">
            <div class="max-w-7xl mx-auto">
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <div class="text-white">
                        <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            AI & 블록체인으로<br/>
                            <span class="text-yellow-300">스마트한 선박 예약</span>
                        </h1>
                        <p class="text-xl mb-8 text-gray-100">
                            AI 가격 예측, 블록체인 보안, 실시간 검색까지<br/>
                            ShipShare로 미래의 물류를 경험하세요
                        </p>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <a href="/login" class="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition text-center">
                                <i class="fas fa-sign-in-alt mr-2"></i>로그인
                            </a>
                            <a href="#how-it-works" class="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary transition text-center">
                                <i class="fas fa-play-circle mr-2"></i>이용 방법 보기
                            </a>
                        </div>
                    </div>
                    <div class="hidden md:block">
                        <div class="bg-white rounded-2xl shadow-2xl p-8">
                            <div class="text-center">
                                <i class="fas fa-search-location text-primary text-6xl mb-6"></i>
                                <h3 class="text-2xl font-bold text-gray-800 mb-4">선박 검색</h3>
                                <p class="text-gray-600 mb-6">
                                    전 세계 주요 항구를 연결하는<br/>
                                    최적의 선박을 찾아보세요
                                </p>
                                <a href="/search" class="inline-block w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-secondary transition">
                                    <i class="fas fa-search mr-2"></i>선박 검색하기
                                </a>
                                <div class="mt-6 pt-6 border-t">
                                    <div class="text-sm text-gray-600 space-y-2">
                                        <div class="flex items-center justify-center">
                                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                            <span>실시간 선박 정보</span>
                                        </div>
                                        <div class="flex items-center justify-center">
                                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                            <span>Google Maps 경로 표시</span>
                                        </div>
                                        <div class="flex items-center justify-center">
                                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                            <span>거리 및 소요시간 계산</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="py-20 px-4 bg-white">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-4xl font-bold text-gray-800 mb-4">주요 기능</h2>
                    <p class="text-xl text-gray-600">ShipShare가 제공하는 혁신적인 기능들</p>
                </div>
                
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="text-center p-8 rounded-xl hover:shadow-xl transition">
                        <div class="bg-primary bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-bolt text-primary text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">실시간 검색</h3>
                        <p class="text-gray-600">전 세계 선박 스케줄을 실시간으로 확인하고 가용 공간을 즉시 검색하세요</p>
                    </div>
                    
                    <div class="text-center p-8 rounded-xl hover:shadow-xl transition">
                        <div class="bg-primary bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-brain text-primary text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">AI 가격 예측</h3>
                        <p class="text-gray-600">머신러닝으로 미래 운임을 예측하고 최적의 예약 시점을 추천받으세요</p>
                    </div>
                    
                    <div class="text-center p-8 rounded-xl hover:shadow-xl transition">
                        <div class="bg-primary bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-check-circle text-primary text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">즉시 예약</h3>
                        <p class="text-gray-600">복잡한 절차 없이 클릭 한 번으로 선박 공간을 즉시 예약할 수 있습니다</p>
                    </div>
                    
                    <div class="text-center p-8 rounded-xl hover:shadow-xl transition">
                        <div class="bg-primary bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-cube text-primary text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">블록체인 보안</h3>
                        <p class="text-gray-600">블록체인 기술로 모든 거래를 투명하게 기록하고 변조 불가능한 스마트 계약 제공</p>
                    </div>
                    
                    <div class="text-center p-8 rounded-xl hover:shadow-xl transition">
                        <div class="bg-primary bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-robot text-primary text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">AI 추천 시스템</h3>
                        <p class="text-gray-600">AI가 조건에 맞는 최적의 선박과 경로를 자동으로 추천해드립니다</p>
                    </div>
                    
                    <div class="text-center p-8 rounded-xl hover:shadow-xl transition">
                        <div class="bg-primary bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-chart-line text-primary text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">수요 예측 분석</h3>
                        <p class="text-gray-600">AI 기반 수요 예측으로 시즌별 최적의 물류 전략을 수립하세요</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- How It Works Section -->
        <section id="how-it-works" class="py-20 px-4 bg-gray-50">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-4xl font-bold text-gray-800 mb-4">이용 방법</h2>
                    <p class="text-xl text-gray-600">3단계로 간단하게 선박을 예약하세요</p>
                </div>
                
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="bg-white p-8 rounded-xl shadow-lg relative">
                        <div class="absolute -top-6 left-8 bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">1</div>
                        <div class="mt-6">
                            <i class="fas fa-user-plus text-primary text-4xl mb-4"></i>
                            <h3 class="text-2xl font-bold text-gray-800 mb-4">회원 가입</h3>
                            <p class="text-gray-600">간단한 정보 입력으로 회원가입을 완료하세요. 화주, 포워더, 선사 중 역할을 선택할 수 있습니다.</p>
                        </div>
                    </div>
                    
                    <div class="bg-white p-8 rounded-xl shadow-lg relative">
                        <div class="absolute -top-6 left-8 bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">2</div>
                        <div class="mt-6">
                            <i class="fas fa-search text-primary text-4xl mb-4"></i>
                            <h3 class="text-2xl font-bold text-gray-800 mb-4">선박 검색</h3>
                            <p class="text-gray-600">출발지, 도착지, 날짜, 컨테이너 타입을 입력하여 원하는 조건의 선박을 검색하세요.</p>
                        </div>
                    </div>
                    
                    <div class="bg-white p-8 rounded-xl shadow-lg relative">
                        <div class="absolute -top-6 left-8 bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">3</div>
                        <div class="mt-6">
                            <i class="fas fa-calendar-check text-primary text-4xl mb-4"></i>
                            <h3 class="text-2xl font-bold text-gray-800 mb-4">즉시 예약</h3>
                            <p class="text-gray-600">마음에 드는 선박을 선택하고 클릭 한 번으로 예약을 완료하세요. 예약 확인서를 즉시 받을 수 있습니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="gradient-bg py-20 px-4">
            <div class="max-w-4xl mx-auto text-center text-white">
                <h2 class="text-4xl font-bold mb-6">지금 바로 시작하세요</h2>
                <p class="text-xl mb-8">롤오버 걱정 없는 스마트한 선박 예약을 경험해보세요</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/login" class="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
                        <i class="fas fa-sign-in-alt mr-2"></i>로그인하기
                    </a>
                    <a href="/search" class="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary transition">
                        선박 둘러보기
                    </a>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-12 px-4">
            <div class="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
                <div>
                    <div class="flex items-center mb-4">
                        <i class="fas fa-ship text-2xl mr-2"></i>
                        <span class="text-xl font-bold">ShipShare</span>
                    </div>
                    <p class="text-gray-400">블록체인 기반 선적권 거래 플랫폼</p>
                </div>
                <div>
                    <h4 class="font-bold mb-4">서비스</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="/search" class="hover:text-white">선박 검색</a></li>
                        <li><a href="/dashboard" class="hover:text-white">대시보드</a></li>
                        <li><a href="/bookings" class="hover:text-white">예약 관리</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-4">회사</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="/about" class="hover:text-white">회사 소개</a></li>
                        <li><a href="/contact" class="hover:text-white">문의하기</a></li>
                        <li><a href="/careers" class="hover:text-white">채용</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-4">문의</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><i class="fas fa-envelope mr-2"></i>support@shipshare.com</li>
                        <li><i class="fas fa-phone mr-2"></i>053-580-5000</li>
                        <li><i class="fas fa-map-marker-alt mr-2"></i>계명대학교</li>
                        <li class="text-sm">대구광역시 달서구 달구벌대로 1095</li>
                    </ul>
                </div>
            </div>
            <div class="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
                <p>&copy; 2025 ShipShare. All rights reserved.</p>
                <p class="mt-2 text-sm">계명대학교 산학협력 프로젝트</p>
            </div>
        </footer>

        <script>
          // Check login status and update navigation
          function updateAuthLinks() {
            const token = localStorage.getItem('token');
            const authLink = document.getElementById('auth-link');
            const authLinkMobile = document.getElementById('auth-link-mobile');
            
            if (token) {
              // User is logged in - show logout
              if (authLink) {
                authLink.textContent = '\ub85c\uadf8\uc544\uc6c3';
                authLink.href = '#';
                authLink.className = 'bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition';
                authLink.onclick = (e) => {
                  e.preventDefault();
                  localStorage.removeItem('token');
                  localStorage.removeItem('expiresAt');
                  localStorage.removeItem('user');
                  if (window.sessionTimer) {
                    window.sessionTimer.stop();
                  }
                  alert('\ub85c\uadf8\uc544\uc6c3\ub418\uc5c8\uc2b5\ub2c8\ub2e4.');
                  window.location.href = '/login';
                };
              }
              if (authLinkMobile) {
                authLinkMobile.textContent = '\ub85c\uadf8\uc544\uc6c3';
                authLinkMobile.href = '#';
                authLinkMobile.className = 'block bg-red-500 text-white px-6 py-2 rounded-lg text-center hover:bg-red-600 transition';
                authLinkMobile.onclick = (e) => {
                  e.preventDefault();
                  localStorage.removeItem('token');
                  localStorage.removeItem('expiresAt');
                  localStorage.removeItem('user');
                  if (window.sessionTimer) {
                    window.sessionTimer.stop();
                  }
                  alert('\ub85c\uadf8\uc544\uc6c3\ub418\uc5c8\uc2b5\ub2c8\ub2e4.');
                  window.location.href = '/login';
                };
              }
            } else {
              // User is not logged in - show login
              if (authLink) {
                authLink.textContent = '\ub85c\uadf8\uc778';
                authLink.href = '/login';
                authLink.className = 'bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition';
                authLink.onclick = null;
              }
              if (authLinkMobile) {
                authLinkMobile.textContent = '\ub85c\uadf8\uc778';
                authLinkMobile.href = '/login';
                authLinkMobile.className = 'block bg-primary text-white px-6 py-2 rounded-lg text-center';
                authLinkMobile.onclick = null;
              }
            }
          }

          // Update on page load
          updateAuthLinks();

          // Mobile menu toggle
          const mobileMenuBtn = document.getElementById('mobile-menu-btn');
          const mobileMenu = document.getElementById('mobile-menu');
          
          mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
          });

          // Smooth scroll for anchor links
          document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
              e.preventDefault();
              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                mobileMenu.classList.add('hidden');
              }
            });
          });
        </script>
    </body>
    </html>
  `)
})

// Login page
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>로그인 - ShipShare</title>
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
    <body class="gradient-bg min-h-screen flex items-center justify-center px-4">
        <div class="max-w-md w-full">
            <div class="text-center mb-8">
                <a href="/" class="inline-flex items-center text-white text-3xl font-bold mb-4">
                    <i class="fas fa-ship mr-3"></i>
                    ShipShare
                </a>
                <p class="text-white text-lg">계정에 로그인하세요</p>
            </div>

            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <!-- Login Method Tabs -->
                <div class="flex border-b mb-6">
                    <button id="tab-email" class="flex-1 py-3 text-center font-semibold border-b-2 border-primary text-primary">
                        <i class="fas fa-envelope mr-2"></i>이메일
                    </button>
                    <button id="tab-hash" class="flex-1 py-3 text-center font-semibold border-b-2 border-transparent text-gray-500 hover:text-primary">
                        <i class="fas fa-key mr-2"></i>해시키
                    </button>
                    <button id="tab-cert" class="flex-1 py-3 text-center font-semibold border-b-2 border-transparent text-gray-500 hover:text-primary">
                        <i class="fas fa-certificate mr-2"></i>공동인증서
                    </button>
                </div>

                <!-- Email Login Form -->
                <form id="login-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                        <div class="relative">
                            <i class="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
                            <input type="email" id="email" required
                                   class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                   placeholder="your@email.com">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                        <div class="relative">
                            <i class="fas fa-lock absolute left-3 top-3.5 text-gray-400"></i>
                            <input type="password" id="password" required
                                   class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                   placeholder="••••••••">
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <label class="flex items-center">
                            <input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary">
                            <span class="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
                        </label>
                        <a href="/forgot-password" class="text-sm text-primary hover:text-secondary">비밀번호 찾기</a>
                    </div>

                    <div id="error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>
                    <div id="success-message" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"></div>

                    <button type="submit" id="login-btn"
                            class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                        <i class="fas fa-sign-in-alt mr-2"></i>로그인
                    </button>
                </form>

                <!-- Hash Key Login Form -->
                <form id="hash-login-form" class="space-y-6 hidden">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">블록체인 해시키</label>
                        <div class="relative">
                            <i class="fas fa-key absolute left-3 top-3.5 text-gray-400"></i>
                            <input type="text" id="hash-key" required
                                   class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                                   placeholder="0x1a2b3c4d5e6f7890...">
                        </div>
                        <p class="text-xs text-gray-500 mt-2">
                            <i class="fas fa-info-circle mr-1"></i>회원가입 시 발급받은 블록체인 해시키를 입력하세요
                        </p>
                    </div>

                    <div id="hash-error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>
                    <div id="hash-success-message" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"></div>

                    <button type="submit" id="hash-login-btn"
                            class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                        <i class="fas fa-key mr-2"></i>해시키로 로그인
                    </button>
                </form>

                <!-- Certificate Login Form -->
                <form id="cert-login-form" class="space-y-6 hidden">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div class="flex items-start">
                            <i class="fas fa-info-circle text-blue-500 text-xl mr-3 mt-1"></i>
                            <div>
                                <h4 class="font-semibold text-blue-800 mb-1">공동인증서 로그인</h4>
                                <p class="text-sm text-blue-700">
                                    금융기관에서 발급받은 공동인증서(구 공인인증서)로 안전하게 로그인하세요.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-certificate mr-2"></i>인증서 선택
                        </label>
                        <input type="file" id="cert-file" accept=".der,.pfx,.p12" required
                               class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <p class="text-xs text-gray-500 mt-2">
                            지원 형식: .der, .pfx, .p12
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">인증서 비밀번호</label>
                        <div class="relative">
                            <i class="fas fa-lock absolute left-3 top-3.5 text-gray-400"></i>
                            <input type="password" id="cert-password" required
                                   class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                   placeholder="인증서 비밀번호">
                        </div>
                    </div>

                    <div id="cert-error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>
                    <div id="cert-success-message" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"></div>

                    <button type="submit" id="cert-login-btn"
                            class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                        <i class="fas fa-certificate mr-2"></i>공동인증서로 로그인
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-gray-600">
                        계정이 없으신가요?
                        <a href="/signup" class="text-primary font-bold hover:text-secondary">회원가입</a>
                    </p>
                </div>

                <div class="mt-6">
                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-gray-300"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-2 bg-white text-gray-500">또는</span>
                        </div>
                    </div>

                    <div class="mt-6 grid grid-cols-2 gap-3">
                        <button class="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
                            <i class="fab fa-google text-red-500 mr-2"></i>
                            Google
                        </button>
                        <button class="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
                            <i class="fab fa-facebook text-blue-600 mr-2"></i>
                            Facebook
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script>
          // Tab switching
          const tabEmail = document.getElementById('tab-email');
          const tabHash = document.getElementById('tab-hash');
          const tabCert = document.getElementById('tab-cert');
          const emailForm = document.getElementById('login-form');
          const hashForm = document.getElementById('hash-login-form');
          const certForm = document.getElementById('cert-login-form');

          function switchTab(activeTab, activeForm) {
            [tabEmail, tabHash, tabCert].forEach(tab => {
              tab.classList.remove('border-primary', 'text-primary');
              tab.classList.add('border-transparent', 'text-gray-500');
            });
            activeTab.classList.remove('border-transparent', 'text-gray-500');
            activeTab.classList.add('border-primary', 'text-primary');

            [emailForm, hashForm, certForm].forEach(form => form.classList.add('hidden'));
            activeForm.classList.remove('hidden');
          }

          tabEmail.addEventListener('click', () => switchTab(tabEmail, emailForm));
          tabHash.addEventListener('click', () => switchTab(tabHash, hashForm));
          tabCert.addEventListener('click', () => switchTab(tabCert, certForm));

          // Email login
          const form = document.getElementById('login-form');
          const errorMsg = document.getElementById('error-message');
          const successMsg = document.getElementById('success-message');
          const loginBtn = document.getElementById('login-btn');

          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            errorMsg.classList.add('hidden');
            successMsg.classList.add('hidden');
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>로그인 중...';

            try {
              const response = await axios.post('/api/auth/login', {
                email,
                password
              });

              successMsg.textContent = response.data.message;
              successMsg.classList.remove('hidden');

              localStorage.setItem('token', response.data.token);
              localStorage.setItem('expiresAt', response.data.expiresAt);
              localStorage.setItem('user', JSON.stringify(response.data.user));

              console.log('✅ [이메일 로그인] localStorage 저장 완료');
              console.log('  - Token:', response.data.token.substring(0, 20) + '...');
              console.log('  - ExpiresAt:', response.data.expiresAt);
              console.log('  - User:', response.data.user.email, '/', response.data.user.role);
              console.log('  - 저장 확인 - Token:', localStorage.getItem('token') ? '있음' : '없음');
              console.log('  - 저장 확인 - ExpiresAt:', localStorage.getItem('expiresAt'));

              setTimeout(() => {
                // Check if there's a redirect parameter
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');
                window.location.href = redirect || '/dashboard';
              }, 1000);

            } catch (error) {
              const message = error.response?.data?.error || '로그인 중 오류가 발생했습니다.';
              errorMsg.textContent = message;
              errorMsg.classList.remove('hidden');
              
              loginBtn.disabled = false;
              loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>로그인';
            }
          });

          // Hash key login
          const hashLoginForm = document.getElementById('hash-login-form');
          const hashErrorMsg = document.getElementById('hash-error-message');
          const hashSuccessMsg = document.getElementById('hash-success-message');
          const hashLoginBtn = document.getElementById('hash-login-btn');

          hashLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const hashKey = document.getElementById('hash-key').value;

            hashErrorMsg.classList.add('hidden');
            hashSuccessMsg.classList.add('hidden');
            hashLoginBtn.disabled = true;
            hashLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>인증 중...';

            try {
              const response = await axios.post('/api/auth/login-hash', {
                hash_key: hashKey
              });

              hashSuccessMsg.textContent = '해시키 인증 성공! 리디렉션 중...';
              hashSuccessMsg.classList.remove('hidden');

              localStorage.setItem('token', response.data.token);
              localStorage.setItem('expiresAt', response.data.expiresAt);
              localStorage.setItem('user', JSON.stringify(response.data.user));

              console.log('✅ [해시키 로그인] localStorage 저장 완료');
              console.log('  - Token:', response.data.token.substring(0, 20) + '...');
              console.log('  - ExpiresAt:', response.data.expiresAt);
              console.log('  - User:', response.data.user.email, '/', response.data.user.role);
              console.log('  - 저장 확인 - Token:', localStorage.getItem('token') ? '있음' : '없음');
              console.log('  - 저장 확인 - ExpiresAt:', localStorage.getItem('expiresAt'));

              setTimeout(() => {
                // Check if there's a redirect parameter
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');
                window.location.href = redirect || '/dashboard';
              }, 1000);

            } catch (error) {
              const message = error.response?.data?.error || '해시키 인증에 실패했습니다.';
              hashErrorMsg.textContent = message;
              hashErrorMsg.classList.remove('hidden');
              
              hashLoginBtn.disabled = false;
              hashLoginBtn.innerHTML = '<i class="fas fa-key mr-2"></i>해시키로 로그인';
            }
          });

          // Certificate login
          const certLoginForm = document.getElementById('cert-login-form');
          const certErrorMsg = document.getElementById('cert-error-message');
          const certSuccessMsg = document.getElementById('cert-success-message');
          const certLoginBtn = document.getElementById('cert-login-btn');

          certLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const certFile = document.getElementById('cert-file').files[0];
            const certPassword = document.getElementById('cert-password').value;

            if (!certFile) {
              certErrorMsg.textContent = '인증서 파일을 선택해주세요.';
              certErrorMsg.classList.remove('hidden');
              return;
            }

            certErrorMsg.classList.add('hidden');
            certSuccessMsg.classList.add('hidden');
            certLoginBtn.disabled = true;
            certLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>인증서 검증 중...';

            try {
              const reader = new FileReader();
              reader.onload = async (event) => {
                const certData = event.target.result.split(',')[1]; // Get base64 data

                try {
                  const response = await axios.post('/api/auth/login-cert', {
                    cert_data: certData,
                    cert_password: certPassword,
                    cert_filename: certFile.name
                  });

                  certSuccessMsg.textContent = '공동인증서 인증 성공! 리디렉션 중...';
                  certSuccessMsg.classList.remove('hidden');

                  localStorage.setItem('token', response.data.token);
                  localStorage.setItem('user', JSON.stringify(response.data.user));

                  setTimeout(() => {
                    window.location.href = '/dashboard';
                  }, 1000);

                } catch (error) {
                  const message = error.response?.data?.error || '공동인증서 인증에 실패했습니다.';
                  certErrorMsg.textContent = message;
                  certErrorMsg.classList.remove('hidden');
                  
                  certLoginBtn.disabled = false;
                  certLoginBtn.innerHTML = '<i class="fas fa-certificate mr-2"></i>공동인증서로 로그인';
                }
              };

              reader.readAsDataURL(certFile);

            } catch (error) {
              certErrorMsg.textContent = '인증서 파일을 읽는 중 오류가 발생했습니다.';
              certErrorMsg.classList.remove('hidden');
              
              certLoginBtn.disabled = false;
              certLoginBtn.innerHTML = '<i class="fas fa-certificate mr-2"></i>공동인증서로 로그인';
            }
          });
        </script>
    </body>
    </html>
  `)
})

// Signup page
app.get('/signup', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>회원가입 - ShipShare</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/session-timer.js"></script>
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
    <body class="gradient-bg min-h-screen flex items-center justify-center px-4 py-12">
        <div class="max-w-2xl w-full">
            <div class="text-center mb-8">
                <a href="/" class="inline-flex items-center text-white text-3xl font-bold mb-4">
                    <i class="fas fa-ship mr-3"></i>
                    ShipShare
                </a>
                <p class="text-white text-lg">새 계정을 만드세요</p>
            </div>

            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <form id="signup-form" class="space-y-6">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
                            <input type="email" id="email" required
                                   class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                   placeholder="your@email.com">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                            <input type="text" id="name" required
                                   class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                   placeholder="홍길동">
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 *</label>
                            <input type="password" id="password" required
                                   class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                   placeholder="최소 8자 이상">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인 *</label>
                            <input type="password" id="confirm-password" required
                                   class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                   placeholder="비밀번호 재입력">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">역할 선택 *</label>
                        <div class="grid md:grid-cols-3 gap-4">
                            <label class="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition">
                                <input type="radio" name="role" value="shipper" required class="mb-2">
                                <i class="fas fa-industry text-primary text-3xl mb-2"></i>
                                <span class="font-bold">화주</span>
                                <span class="text-xs text-gray-500 text-center">제조업체</span>
                            </label>
                            <label class="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition">
                                <input type="radio" name="role" value="forwarder" required class="mb-2">
                                <i class="fas fa-truck text-primary text-3xl mb-2"></i>
                                <span class="font-bold">포워더</span>
                                <span class="text-xs text-gray-500 text-center">중개업체</span>
                            </label>
                            <label class="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition">
                                <input type="radio" name="role" value="carrier" required class="mb-2">
                                <i class="fas fa-ship text-primary text-3xl mb-2"></i>
                                <span class="font-bold">선사</span>
                                <span class="text-xs text-gray-500 text-center">해운사</span>
                            </label>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">회사명</label>
                            <input type="text" id="company"
                                   class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                   placeholder="회사명 (선택)">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                            <input type="tel" id="phone"
                                   class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                   placeholder="010-1234-5678">
                        </div>
                    </div>

                    <div class="flex items-start">
                        <input type="checkbox" id="terms" required class="mt-1 rounded border-gray-300 text-primary focus:ring-primary">
                        <label for="terms" class="ml-2 text-sm text-gray-600">
                            <a href="/terms" class="text-primary hover:text-secondary">이용약관</a> 및 
                            <a href="/privacy" class="text-primary hover:text-secondary">개인정보처리방침</a>에 동의합니다. *
                        </label>
                    </div>

                    <div id="error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>
                    <div id="success-message" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"></div>

                    <button type="submit" id="signup-btn"
                            class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                        <i class="fas fa-user-plus mr-2"></i>회원가입
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-gray-600">
                        이미 계정이 있으신가요?
                        <a href="/login" class="text-primary font-bold hover:text-secondary">로그인</a>
                    </p>
                </div>
            </div>
        </div>

        <script>
          const form = document.getElementById('signup-form');
          const errorMsg = document.getElementById('error-message');
          const successMsg = document.getElementById('success-message');
          const signupBtn = document.getElementById('signup-btn');

          // Style selected role
          document.querySelectorAll('input[name="role"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
              document.querySelectorAll('input[name="role"]').forEach(r => {
                r.parentElement.classList.remove('border-primary', 'bg-primary', 'bg-opacity-5');
              });
              if (e.target.checked) {
                e.target.parentElement.classList.add('border-primary', 'bg-primary', 'bg-opacity-5');
              }
            });
          });

          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const name = document.getElementById('name').value;
            const role = document.querySelector('input[name="role"]:checked')?.value;
            const company = document.getElementById('company').value;
            const phone = document.getElementById('phone').value;

            errorMsg.classList.add('hidden');
            successMsg.classList.add('hidden');

            // Validation
            if (password !== confirmPassword) {
              errorMsg.textContent = '비밀번호가 일치하지 않습니다.';
              errorMsg.classList.remove('hidden');
              return;
            }

            if (password.length < 8) {
              errorMsg.textContent = '비밀번호는 최소 8자 이상이어야 합니다.';
              errorMsg.classList.remove('hidden');
              return;
            }

            if (!role) {
              errorMsg.textContent = '역할을 선택해주세요.';
              errorMsg.classList.remove('hidden');
              return;
            }

            signupBtn.disabled = true;
            signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>회원가입 중...';

            try {
              const response = await axios.post('/api/auth/register', {
                email,
                password,
                name,
                role,
                company: company || undefined,
                phone: phone || undefined
              });

              successMsg.textContent = response.data.message;
              successMsg.classList.remove('hidden');

              // Store token in localStorage
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('expiresAt', response.data.expiresAt);
              localStorage.setItem('user', JSON.stringify(response.data.user));

              console.log('✅ [회원가입] localStorage 저장 완료');
              console.log('  - Token:', response.data.token.substring(0, 20) + '...');
              console.log('  - ExpiresAt:', response.data.expiresAt);
              console.log('  - User:', response.data.user.email, '/', response.data.user.role);
              console.log('  - 저장 확인 - Token:', localStorage.getItem('token') ? '있음' : '없음');
              console.log('  - 저장 확인 - ExpiresAt:', localStorage.getItem('expiresAt'));

              // Redirect to dashboard after 2 seconds
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 2000);

            } catch (error) {
              const message = error.response?.data?.error || '회원가입 중 오류가 발생했습니다.';
              errorMsg.textContent = message;
              errorMsg.classList.remove('hidden');
              
              signupBtn.disabled = false;
              signupBtn.innerHTML = '<i class="fas fa-user-plus mr-2"></i>회원가입';
            }
          });
        </script>
    </body>
    </html>
  `)
})

// Search page
app.get('/search', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>선박 검색 - ShipShare</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/map-view.js"></script>
        <script src="/static/session-timer.js"></script>
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
          .vessel-card {
            transition: all 0.3s ease;
          }
          .vessel-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          .carrier-logo {
            width: 80px;
            height: 50px;
            object-fit: contain;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm fixed w-full top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/" class="flex items-center">
                            <i class="fas fa-ship text-primary text-2xl mr-3"></i>
                            <span class="text-2xl font-bold text-gray-800">ShipShare</span>
                        </a>
                    </div>
                    <div class="hidden md:flex items-center space-x-8">
                        <a href="/search" class="text-primary font-bold">선박 검색</a>
                        <a href="/dashboard" class="text-gray-600 hover:text-primary transition">대시보드</a>
                        <a id="search-auth-link" href="/login" class="text-gray-600 hover:text-primary transition">로그인</a>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Search Header -->
        <div class="gradient-bg pt-24 pb-12 px-4">
            <div class="max-w-7xl mx-auto">
                <h1 class="text-4xl font-bold text-white mb-8 text-center">
                    <i class="fas fa-search mr-3"></i>선박 검색
                </h1>

                <!-- Login Status Banner -->
                <div id="login-status-banner" class="hidden mt-16 mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded animate-pulse">
                    <p class="font-bold text-lg">⚠️ 로그인이 필요합니다</p>
                    <p class="text-sm mt-2">검색 기능을 사용하려면 먼저 로그인해주세요.</p>
                    <p class="text-sm mt-1 font-semibold">3초 후 자동으로 로그인 페이지로 이동합니다...</p>
                    <a href="/login?redirect=/search" class="inline-block mt-3 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">
                        <i class="fas fa-sign-in-alt mr-2"></i>지금 로그인하기
                    </a>
                </div>
                
                <!-- Search Form -->
                <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                    <form id="search-form" class="space-y-6">
                        <div class="grid md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">출발지</label>
                                <input type="text" id="departure" placeholder="예: Busan"
                                       class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">도착지</label>
                                <input type="text" id="arrival" placeholder="예: Los Angeles"
                                       class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">출발일 (이후)</label>
                                <input type="date" id="date"
                                       class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">컨테이너 타입</label>
                                <select id="containerType"
                                        class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                    <option value="">전체</option>
                                    <option value="20GP">20GP</option>
                                    <option value="40GP">40GP</option>
                                    <option value="40HC">40HC</option>
                                    <option value="45HC">45HC</option>
                                    <option value="reefer">Reefer</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="flex gap-4">
                            <button type="submit"
                                    class="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                                <i class="fas fa-search mr-2"></i>검색
                            </button>
                            <button type="button" onclick="resetSearch()"
                                    class="px-8 border-2 border-gray-300 text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-50 transition">
                                <i class="fas fa-redo mr-2"></i>초기화
                            </button>
                        </div>

                        <!-- Search Guide -->
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 class="font-bold text-blue-900 mb-2">
                                <i class="fas fa-info-circle mr-2"></i>검색 팁
                            </h4>
                            <ul class="text-sm text-blue-800 space-y-1">
                                <li><i class="fas fa-check mr-2"></i><strong>출발지/도착지는 필수</strong> 항목입니다 (예: 부산, LA, 상하이)</li>
                                <li><i class="fas fa-check mr-2"></i>출발일은 선택사항이며, 미입력 시 모든 일정의 선박을 검색합니다</li>
                                <li><i class="fas fa-check mr-2"></i>검색 가능한 항구: 부산, 상하이, LA, 싱가포르, 로테르담 등</li>
                            </ul>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Results Section -->
        <div class="max-w-7xl mx-auto px-4 py-12">
            <!-- Loading State -->
            <div id="loading" class="hidden text-center py-12">
                <i class="fas fa-spinner fa-spin text-primary text-4xl mb-4"></i>
                <p class="text-gray-600">선박을 검색하는 중입니다...</p>
            </div>

            <!-- Empty State -->
            <div id="empty-state" class="text-center py-12">
                <i class="fas fa-search text-gray-300 text-6xl mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">검색 조건을 입력하세요</h3>
                <p class="text-gray-600">원하는 조건으로 선박을 검색해보세요</p>
            </div>

            <!-- No Results -->
            <div id="no-results" class="hidden text-center py-12">
                <i class="fas fa-ship text-gray-300 text-6xl mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">검색 결과가 없습니다</h3>
                <p class="text-gray-600">다른 조건으로 다시 검색해보세요</p>
            </div>

            <!-- Results List -->
            <div id="results" class="hidden">
                <!-- Route Map Section -->
                <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-map-marked-alt text-primary mr-2"></i>항로 지도
                        </h2>
                        <button onclick="toggleMapView()" class="text-primary hover:text-secondary transition">
                            <i class="fas fa-expand-alt mr-1"></i>
                            <span id="map-toggle-text">전체화면</span>
                        </button>
                    </div>
                    
                    <!-- Map Container -->
                    <div id="map" class="w-full h-96 rounded-lg border-2 border-gray-200" style="min-height: 400px;">
                        <div class="flex items-center justify-center h-full text-gray-400">
                            <div class="text-center">
                                <i class="fas fa-map text-6xl mb-4"></i>
                                <p>지도를 로딩하는 중...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Route Info -->
                    <div id="route-info" class="mt-4 p-4 bg-blue-50 rounded-lg hidden">
                        <div class="grid md:grid-cols-3 gap-4 text-center">
                            <div>
                                <div class="text-sm text-gray-600 mb-1">직선 거리</div>
                                <div class="text-2xl font-bold text-primary">
                                    <span id="distance-km">-</span> km
                                </div>
                                <div class="text-xs text-gray-500">
                                    <span id="distance-nm">-</span> NM (해리)
                                </div>
                            </div>
                            <div>
                                <div class="text-sm text-gray-600 mb-1">예상 소요 시간</div>
                                <div class="text-2xl font-bold text-green-600">
                                    <span id="estimated-days">-</span> 일
                                </div>
                                <div class="text-xs text-gray-500">평균 속도 20노트 기준</div>
                            </div>
                            <div>
                                <div class="text-sm text-gray-600 mb-1">항로</div>
                                <div class="text-lg font-bold text-gray-800">
                                    <span id="route-from">-</span>
                                    <i class="fas fa-arrow-right mx-2 text-primary"></i>
                                    <span id="route-to">-</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">
                        검색 결과 <span id="result-count" class="text-primary">0</span>건
                    </h2>
                    <select id="sort" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary">
                        <option value="date">출발일 빠른순</option>
                        <option value="price">가격 낮은순</option>
                        <option value="space">가용 공간 많은순</option>
                    </select>
                </div>

                <div id="vessel-list" class="space-y-4">
                    <!-- Vessels will be inserted here -->
                </div>
            </div>
        </div>

        <!-- Booking Modal -->
        <div id="booking-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-gray-800">예약하기</h3>
                    <button onclick="closeBookingModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <div id="vessel-details" class="mb-6">
                    <!-- Vessel details will be inserted here -->
                </div>

                <form id="booking-form" class="space-y-4">
                    <input type="hidden" id="booking-vessel-id">
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">컨테이너 타입 *</label>
                        <select id="booking-container-type" required
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary">
                            <option value="">선택하세요</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">수량 *</label>
                        <input type="number" id="booking-quantity" required min="1"
                               class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                               placeholder="1">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">메모</label>
                        <textarea id="booking-notes" rows="3"
                                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                  placeholder="특이사항이 있으면 입력하세요"></textarea>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">단가:</span>
                            <span id="unit-price" class="font-bold">$0</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">수량:</span>
                            <span id="total-quantity" class="font-bold">0</span>
                        </div>
                        <div class="border-t pt-2 mt-2 flex justify-between">
                            <span class="text-lg font-bold">총 금액:</span>
                            <span id="total-price" class="text-xl font-bold text-primary">$0</span>
                        </div>
                    </div>

                    <div id="booking-error" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>

                    <button type="submit" id="booking-submit-btn"
                            class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                        <i class="fas fa-check mr-2"></i>예약 확정
                    </button>
                </form>
            </div>
        </div>

        <script>
          let vessels = [];
          let currentVessel = null;
          let shipShareMap = null;
          const GOOGLE_MAPS_API_KEY = 'AIzaSyCQzKdmApqm2cRuKqws-a4xkzMF4CjCh-A';

          // Check if user is logged in
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user') || '{}');

          // Update navigation auth link
          function updateSearchAuthLink() {
            const authLink = document.getElementById('search-auth-link');
            const token = localStorage.getItem('token');
            
            if (authLink) {
              if (token) {
                authLink.textContent = '\ub85c\uadf8\uc544\uc6c3';
                authLink.href = '#';
                authLink.onclick = (e) => {
                  e.preventDefault();
                  localStorage.removeItem('token');
                  localStorage.removeItem('expiresAt');
                  localStorage.removeItem('user');
                  if (window.sessionTimer) {
                    window.sessionTimer.stop();
                  }
                  alert('\ub85c\uadf8\uc544\uc6c3\ub418\uc5c8\uc2b5\ub2c8\ub2e4.');
                  window.location.href = '/login';
                };
              } else {
                authLink.textContent = '\ub85c\uadf8\uc778';
                authLink.href = '/login';
                authLink.onclick = null;
              }
            }
          }

          // Initialize map on page load
          document.addEventListener('DOMContentLoaded', async () => {
            // Update auth link
            updateSearchAuthLink();

            // Show login notice if not logged in
            if (!token) {
              console.warn('⚠️ 로그인되지 않았습니다. 3초 후 로그인 페이지로 이동합니다.');
              const banner = document.getElementById('login-status-banner');
              if (banner) {
                banner.classList.remove('hidden');
                // Auto redirect to login after 3 seconds
                setTimeout(() => {
                  window.location.href = '/login?redirect=/search';
                }, 3000);
              }
            } else {
              console.log('✅ 로그인 확인:', user.email || user.name);
            }

            // Initialize Google Maps
            try {
              shipShareMap = new ShipShareMap(GOOGLE_MAPS_API_KEY);
              await shipShareMap.init('map');
              console.log('✅ Google Maps 초기화 완료');
              
              // Display all major ports
              await shipShareMap.displayAllPorts();
              console.log('✅ 주요 항구 표시 완료');
            } catch (error) {
              console.error('❌ 지도 초기화 실패:', error);
              document.getElementById('map').innerHTML = \`
                <div class="flex items-center justify-center h-full text-red-500">
                  <div class="text-center">
                    <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                    <p>지도를 로딩할 수 없습니다</p>
                    <p class="text-sm">API 키를 확인해주세요</p>
                  </div>
                </div>
              \`;
            }
          });

          // Search form submission
          document.getElementById('search-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await searchVessels();
          });

          async function searchVessels() {
            const departure = document.getElementById('departure').value;
            const arrival = document.getElementById('arrival').value;
            const date = document.getElementById('date').value;
            const containerType = document.getElementById('containerType').value;

            console.log('🔍 검색 시작 - 입력값:', { departure, arrival, date, containerType });

            // Check login first
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('🔑 토큰 상태:', token ? '있음' : '없음', '사용자:', user.email || '없음');

            if (!token) {
              console.warn('⚠️ 토큰 없음 - 로그인 페이지로 이동');
              alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
              window.location.href = '/login';
              return;
            }

            // Validate inputs
            if (!departure || !arrival) {
              alert('출발지와 도착지를 모두 입력해주세요.');
              return;
            }

            // Show loading
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('no-results').classList.add('hidden');
            document.getElementById('results').classList.add('hidden');
            document.getElementById('loading').classList.remove('hidden');

            try {
              const params = new URLSearchParams();
              params.append('departure', departure);
              params.append('arrival', arrival);
              if (date) params.append('date', date);
              if (containerType) params.append('containerType', containerType);

              const url = '/api/vessels/search?' + params.toString();
              console.log('🔍 검색 요청 URL:', url);

              const response = await axios.get(url, {
                headers: { 'Authorization': \`Bearer \${token}\` }
              });
              
              console.log('✅ 검색 응답:', response.data);
              console.log('✅ 선박 수:', response.data.vessels.length);
              vessels = response.data.vessels;

              document.getElementById('loading').classList.add('hidden');

              if (vessels.length === 0) {
                document.getElementById('no-results').classList.remove('hidden');
              } else {
                document.getElementById('result-count').textContent = vessels.length;
                renderVessels(vessels);
                document.getElementById('results').classList.remove('hidden');
                
                // Update map with route
                if (departure && arrival && shipShareMap) {
                  await updateMapRoute(departure, arrival);
                }
              }

            } catch (error) {
              console.error('❌ 검색 에러:', error);
              console.error('에러 상세:', error.response?.data);
              document.getElementById('loading').classList.add('hidden');
              
              // Check if error is authentication related
              if (error.response && error.response.status === 401) {
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              } else {
                const errorMessage = error.response?.data?.error || '검색 중 오류가 발생했습니다.';
                alert(errorMessage);
                document.getElementById('no-results').classList.remove('hidden');
              }
            }
          }

          async function updateMapRoute(departure, arrival) {
            try {
              // Convert port names to codes (simple mapping)
              const portMapping = {
                'busan': 'busan',
                '부산': 'busan',
                'shanghai': 'shanghai',
                '상하이': 'shanghai',
                'losangeles': 'losangeles',
                'los angeles': 'losangeles',
                'la': 'losangeles',
                '로스앤젤레스': 'losangeles',
                'singapore': 'singapore',
                '싱가포르': 'singapore',
                'tokyo': 'tokyo',
                '도쿄': 'tokyo',
                'hongkong': 'hongkong',
                '홍콩': 'hongkong',
                'rotterdam': 'rotterdam',
                '로테르담': 'rotterdam',
                'hamburg': 'hamburg',
                '함부르크': 'hamburg'
              };

              const fromCode = portMapping[departure.toLowerCase()] || departure.toLowerCase();
              const toCode = portMapping[arrival.toLowerCase()] || arrival.toLowerCase();

              const routeInfo = await shipShareMap.displayRouteInfo(fromCode, toCode);
              
              if (routeInfo) {
                // Show route info
                document.getElementById('route-info').classList.remove('hidden');
                document.getElementById('distance-km').textContent = routeInfo.distance.toFixed(0);
                document.getElementById('distance-nm').textContent = routeInfo.nauticalMiles.toFixed(0);
                document.getElementById('estimated-days').textContent = routeInfo.estimatedDays.toFixed(1);
                document.getElementById('route-from').textContent = routeInfo.from.name;
                document.getElementById('route-to').textContent = routeInfo.to.name;
              }
            } catch (error) {
              console.error('지도 업데이트 실패:', error);
              document.getElementById('route-info').classList.add('hidden');
            }
          }

          function toggleMapView() {
            const mapEl = document.getElementById('map');
            const toggleText = document.getElementById('map-toggle-text');
            
            if (mapEl.style.height === '600px') {
              mapEl.style.height = '400px';
              toggleText.textContent = '전체화면';
            } else {
              mapEl.style.height = '600px';
              toggleText.textContent = '축소';
            }
            
            // Trigger map resize
            if (shipShareMap && shipShareMap.map) {
              google.maps.event.trigger(shipShareMap.map, 'resize');
            }
          }

          function renderVessels(vesselList) {
            const container = document.getElementById('vessel-list');
            container.innerHTML = vesselList.map(vessel => \`
              <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-1">\${vessel.vessel_name}</h3>
                    <p class="text-gray-600">\${vessel.carrier_name}</p>
                  </div>
                  <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <i class="fas fa-check-circle mr-1"></i>운항중
                  </span>
                </div>

                <div class="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div class="flex items-center text-gray-600 mb-2">
                      <i class="fas fa-anchor text-primary mr-2"></i>
                      <span class="font-medium">출발:</span>
                      <span class="ml-2">\${vessel.departure_port}</span>
                    </div>
                    <div class="flex items-center text-gray-600">
                      <i class="fas fa-calendar text-primary mr-2"></i>
                      <span>\${vessel.departure_date}</span>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center text-gray-600 mb-2">
                      <i class="fas fa-map-marker-alt text-primary mr-2"></i>
                      <span class="font-medium">도착:</span>
                      <span class="ml-2">\${vessel.arrival_port}</span>
                    </div>
                    <div class="flex items-center text-gray-600">
                      <i class="fas fa-calendar-check text-primary mr-2"></i>
                      <span>\${vessel.arrival_date}</span>
                    </div>
                  </div>
                </div>

                <div class="border-t pt-4">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-sm font-medium text-gray-600">가용 컨테이너:</span>
                    <span class="text-sm text-gray-600">\${vessel.available_space}개 공간</span>
                  </div>
                  
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    \${vessel.containers.map(c => \`
                      <div class="text-center p-2 bg-gray-50 rounded">
                        <div class="text-xs text-gray-600">\${c.type}</div>
                        <div class="font-bold text-primary">$\${c.price.toFixed(2)}</div>
                        <div class="text-xs text-gray-500">\${c.available}개</div>
                      </div>
                    \`).join('')}
                  </div>

                  <button onclick="openBookingModal(\${vessel.id})" 
                          class="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-secondary transition">
                    <i class="fas fa-calendar-check mr-2"></i>예약하기
                  </button>
                </div>
              </div>
            \`).join('');
          }

          function resetSearch() {
            document.getElementById('search-form').reset();
            document.getElementById('results').classList.add('hidden');
            document.getElementById('no-results').classList.add('hidden');
            document.getElementById('empty-state').classList.remove('hidden');
            vessels = [];
          }

          async function openBookingModal(vesselId) {
            currentVessel = vessels.find(v => v.id == vesselId);
            
            if (!currentVessel) return;

            // Populate vessel details
            document.getElementById('vessel-details').innerHTML = \`
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-bold text-lg mb-2">\${currentVessel.vessel_name}</h4>
                <p class="text-gray-600 mb-1">\${currentVessel.carrier_name}</p>
                <p class="text-sm text-gray-600">
                  <i class="fas fa-route mr-1"></i>
                  \${currentVessel.departure_port} → \${currentVessel.arrival_port}
                </p>
                <p class="text-sm text-gray-600">
                  <i class="fas fa-calendar mr-1"></i>
                  \${currentVessel.departure_date} - \${currentVessel.arrival_date}
                </p>
              </div>
            \`;

            // Populate container types
            const containerSelect = document.getElementById('booking-container-type');
            containerSelect.innerHTML = '<option value="">선택하세요</option>' + 
              currentVessel.containers.map(c => 
                \`<option value="\${c.type}" data-price="\${c.price}" data-available="\${c.available}">
                  \${c.type} - $\${c.price.toFixed(2)} (가용: \${c.available}개)
                </option>\`
              ).join('');

            document.getElementById('booking-vessel-id').value = vesselId;
            document.getElementById('booking-modal').classList.remove('hidden');
          }

          function closeBookingModal() {
            document.getElementById('booking-modal').classList.add('hidden');
            document.getElementById('booking-form').reset();
            document.getElementById('booking-error').classList.add('hidden');
          }

          // Update price calculation
          document.getElementById('booking-container-type').addEventListener('change', updatePrice);
          document.getElementById('booking-quantity').addEventListener('input', updatePrice);

          function updatePrice() {
            const select = document.getElementById('booking-container-type');
            const option = select.options[select.selectedIndex];
            const price = parseFloat(option.dataset.price || 0);
            const quantity = parseInt(document.getElementById('booking-quantity').value || 0);
            const available = parseInt(option.dataset.available || 0);

            document.getElementById('unit-price').textContent = '$' + price.toFixed(2);
            document.getElementById('total-quantity').textContent = quantity;
            document.getElementById('total-price').textContent = '$' + (price * quantity).toFixed(2);

            // Validate quantity
            const errorDiv = document.getElementById('booking-error');
            if (quantity > available) {
              errorDiv.textContent = \`가용 수량(\${available}개)을 초과했습니다.\`;
              errorDiv.classList.remove('hidden');
            } else {
              errorDiv.classList.add('hidden');
            }
          }

          // Booking form submission
          document.getElementById('booking-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            // Check if logged in
            const user = localStorage.getItem('user');
            if (!user) {
              alert('로그인이 필요합니다.');
              window.location.href = '/login';
              return;
            }

            const userId = JSON.parse(user).id;
            const vesselId = document.getElementById('booking-vessel-id').value;
            const containerType = document.getElementById('booking-container-type').value;
            const quantity = parseInt(document.getElementById('booking-quantity').value);
            const notes = document.getElementById('booking-notes').value;

            const submitBtn = document.getElementById('booking-submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>예약 중...';

            try {
              const response = await axios.post('/api/bookings', {
                userId,
                vesselId,
                containerType,
                quantity,
                notes
              });

              alert('예약이 완료되었습니다!\\n예약번호: ' + response.data.booking.booking_reference);
              closeBookingModal();
              window.location.href = '/dashboard';

            } catch (error) {
              const message = error.response?.data?.error || '예약 중 오류가 발생했습니다.';
              document.getElementById('booking-error').textContent = message;
              document.getElementById('booking-error').classList.remove('hidden');
              
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>예약 확정';
            }
          });

          // Sort functionality
          document.getElementById('sort').addEventListener('change', (e) => {
            const sortBy = e.target.value;
            let sorted = [...vessels];

            if (sortBy === 'date') {
              sorted.sort((a, b) => a.departure_date.localeCompare(b.departure_date));
            } else if (sortBy === 'price') {
              sorted.sort((a, b) => a.price_per_teu - b.price_per_teu);
            } else if (sortBy === 'space') {
              sorted.sort((a, b) => b.available_space - a.available_space);
            }

            renderVessels(sorted);
          });
        </script>
    </body>
    </html>
  `)
})

// Booking page
app.get('/booking/new', (c) => {
  const vesselId = c.req.query('vessel')
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>선박 예약 - ShipShare</title>
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
          .step {
            opacity: 0.5;
          }
          .step.active {
            opacity: 1;
          }
          .step.completed {
            opacity: 1;
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
                        <a href="/search" class="text-gray-600 hover:text-primary transition">
                            <i class="fas fa-arrow-left mr-2"></i>검색으로 돌아가기
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Progress Steps -->
            <div class="mb-8">
                <div class="flex items-center justify-center">
                    <div class="flex items-center">
                        <div id="step1-indicator" class="step active flex items-center">
                            <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                            <span class="ml-2 font-medium">선박 정보</span>
                        </div>
                        <div class="w-24 h-1 bg-gray-300 mx-4"></div>
                        <div id="step2-indicator" class="step flex items-center">
                            <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">2</div>
                            <span class="ml-2 font-medium">예약 정보</span>
                        </div>
                        <div class="w-24 h-1 bg-gray-300 mx-4"></div>
                        <div id="step3-indicator" class="step flex items-center">
                            <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">3</div>
                            <span class="ml-2 font-medium">결제 확인</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 1: Vessel Information -->
            <div id="step1" class="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-ship mr-3 text-primary"></i>선박 정보 확인
                </h2>
                
                <div id="vessel-loading" class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-primary text-3xl mb-4"></i>
                    <p class="text-gray-600">선박 정보를 불러오는 중...</p>
                </div>

                <div id="vessel-info" class="hidden">
                    <!-- Vessel details will be loaded here -->
                </div>

                <div class="flex justify-end mt-6">
                    <button onclick="nextStep(2)" class="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-secondary transition">
                        다음 단계
                        <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>

            <!-- Step 2: Booking Information -->
            <div id="step2" class="hidden bg-white rounded-xl shadow-lg p-8 mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-clipboard-list mr-3 text-primary"></i>예약 정보 입력
                </h2>

                <form id="booking-form">
                    <!-- Cargo Information -->
                    <div class="mb-8">
                        <h3 class="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">
                            <i class="fas fa-box mr-2"></i>화물 정보
                        </h3>
                        
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    컨테이너 타입 *
                                </label>
                                <select id="container-type" required
                                        class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                    <option value="">선택하세요</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    컨테이너 수량 * (1-10)
                                </label>
                                <input type="number" id="container-count" required min="1" max="10" value="1"
                                       class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    화물 중량 (kg) *
                                </label>
                                <input type="number" id="cargo-weight" required min="1" step="0.01"
                                       placeholder="예: 15000"
                                       class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    화물 품목 *
                                </label>
                                <input type="text" id="cargo-description" required
                                       placeholder="예: 전자제품"
                                       class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>
                        </div>
                    </div>

                    <!-- Shipper Information -->
                    <div class="mb-6">
                        <h3 class="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">
                            <i class="fas fa-building mr-2"></i>화주 정보
                        </h3>
                        
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    회사명 *
                                </label>
                                <input type="text" id="company-name" required
                                       placeholder="예: 대한무역"
                                       class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    담당자명 *
                                </label>
                                <input type="text" id="contact-person" required
                                       placeholder="예: 홍길동"
                                       class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    연락처 * (숫자만)
                                </label>
                                <input type="tel" id="phone" required pattern="[0-9-]+"
                                       placeholder="예: 010-1234-5678"
                                       class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    이메일 *
                                </label>
                                <input type="email" id="email" required
                                       placeholder="예: user@company.com"
                                       class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>
                        </div>
                    </div>

                    <div id="form-error" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"></div>

                    <div class="flex justify-between mt-6">
                        <button type="button" onclick="prevStep(1)" 
                                class="border-2 border-gray-300 text-gray-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition">
                            <i class="fas fa-arrow-left mr-2"></i>이전 단계
                        </button>
                        <button type="submit"
                                class="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-secondary transition">
                            다음 단계
                            <i class="fas fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Step 3: Payment Confirmation -->
            <div id="step3" class="hidden bg-white rounded-xl shadow-lg p-8 mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-credit-card mr-3 text-primary"></i>결제 정보 확인
                </h2>

                <!-- Summary -->
                <div class="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 class="text-lg font-bold text-gray-700 mb-4">예약 요약</h3>
                    <div id="booking-summary" class="space-y-3">
                        <!-- Summary will be loaded here -->
                    </div>
                </div>

                <!-- Total Price -->
                <div class="bg-primary bg-opacity-10 rounded-lg p-6 mb-6">
                    <div class="flex items-center justify-between">
                        <span class="text-xl font-bold text-gray-800">총 결제 금액</span>
                        <span id="total-price" class="text-3xl font-bold text-primary">$0</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-2">* VAT 별도</p>
                </div>

                <!-- Payment Method -->
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-700 mb-4">결제 방법</h3>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p class="text-sm text-gray-700">
                            <i class="fas fa-info-circle text-yellow-600 mr-2"></i>
                            현재는 예약만 진행됩니다. 실제 결제는 담당자가 별도로 연락드립니다.
                        </p>
                    </div>
                </div>

                <div class="flex justify-between mt-6">
                    <button type="button" onclick="prevStep(2)" 
                            class="border-2 border-gray-300 text-gray-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition">
                        <i class="fas fa-arrow-left mr-2"></i>이전 단계
                    </button>
                    <button onclick="confirmBooking()" id="confirm-btn"
                            class="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition">
                        <i class="fas fa-check-circle mr-2"></i>예약 확정
                    </button>
                </div>
            </div>
        </div>

        <!-- Success Modal -->
        <div id="success-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all">
                <div class="text-center">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-green-600 text-4xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">예약이 완료되었습니다!</h3>
                    <p class="text-gray-600 mb-6">예약 번호를 확인하세요</p>
                    
                    <div class="bg-gray-50 rounded-lg p-4 mb-6">
                        <p class="text-sm text-gray-600 mb-1">예약 번호</p>
                        <p id="booking-number" class="text-2xl font-bold text-primary">SHIP-20250101-0001</p>
                    </div>

                    <p class="text-sm text-gray-600 mb-6">
                        예약 확인 이메일이 발송되었습니다.<br/>
                        담당자가 곧 연락드리겠습니다.
                    </p>

                    <div class="flex gap-3">
                        <button onclick="window.location.href='/dashboard'" 
                                class="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                            대시보드로 이동
                        </button>
                        <button onclick="window.location.href='/search'" 
                                class="flex-1 border-2 border-gray-300 text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-50 transition">
                            새 검색
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script>
          let currentStep = 1;
          let vesselData = null;
          let selectedContainer = null;
          let bookingData = {};
          const vesselId = '${vesselId}';

          // Load vessel information
          async function loadVesselInfo() {
            if (!vesselId) {
              alert('선박 ID가 없습니다. 검색 페이지로 돌아갑니다.');
              window.location.href = '/search';
              return;
            }

            try {
              const response = await axios.get(\\\`/api/vessels/\\\${vesselId}\\\`);
              vesselData = response.data.vessel;

              // Populate container type options
              const containerSelect = document.getElementById('container-type');
              vesselData.containers.forEach(container => {
                const option = document.createElement('option');
                option.value = container.container_type;
                option.textContent = \\\`\\\${container.container_type} - $\\\${container.price_per_unit.toLocaleString()} (재고: \\\${container.available_quantity}개)\\\`;
                option.dataset.price = container.price_per_unit;
                option.dataset.available = container.available_quantity;
                containerSelect.appendChild(option);
              });

              // Display vessel info
              document.getElementById('vessel-loading').classList.add('hidden');
              document.getElementById('vessel-info').classList.remove('hidden');
              document.getElementById('vessel-info').innerHTML = \\\`
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">선사</p>
                    <p class="text-lg font-bold text-gray-800">\\\${vesselData.carrier_name}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-1">선박명</p>
                    <p class="text-lg font-bold text-gray-800">\\\${vesselData.vessel_name}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-1">출발</p>
                    <p class="font-bold text-gray-800">\\\${vesselData.departure_port}</p>
                    <p class="text-sm text-gray-600">\\\${new Date(vesselData.departure_date).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-1">도착</p>
                    <p class="font-bold text-gray-800">\\\${vesselData.arrival_port}</p>
                    <p class="text-sm text-gray-600">\\\${new Date(vesselData.arrival_date).toLocaleDateString('ko-KR')}</p>
                  </div>
                </div>

                <div class="mt-6 bg-blue-50 rounded-lg p-4">
                  <h4 class="font-bold text-gray-700 mb-2">사용 가능한 컨테이너</h4>
                  <div class="grid md:grid-cols-3 gap-4">
                    \\\${vesselData.containers.map(c => \\\`
                      <div class="bg-white rounded p-3">
                        <p class="font-bold text-gray-800">\\\${c.container_type}</p>
                        <p class="text-sm text-gray-600">$\\\${c.price_per_unit.toLocaleString()}</p>
                        <p class="text-xs text-gray-500">재고: \\\${c.available_quantity}개</p>
                      </div>
                    \\\`).join('')}
                  </div>
                </div>
              \\\`;

            } catch (error) {
              console.error('Load vessel error:', error);
              alert('선박 정보를 불러오는데 실패했습니다.');
              window.location.href = '/search';
            }
          }

          function nextStep(step) {
            document.getElementById(\\\`step\\\${currentStep}\\\`).classList.add('hidden');
            document.getElementById(\\\`step\\\${step}\\\`).classList.remove('hidden');
            
            document.getElementById(\\\`step\\\${currentStep}-indicator\\\`).classList.remove('active');
            document.getElementById(\\\`step\\\${currentStep}-indicator\\\`).classList.add('completed');
            document.getElementById(\\\`step\\\${step}-indicator\\\`).classList.add('active');
            
            currentStep = step;

            if (step === 3) {
              displaySummary();
            }
          }

          function prevStep(step) {
            document.getElementById(\\\`step\\\${currentStep}\\\`).classList.add('hidden');
            document.getElementById(\\\`step\\\${step}\\\`).classList.remove('hidden');
            
            document.getElementById(\\\`step\\\${currentStep}-indicator\\\`).classList.remove('active');
            document.getElementById(\\\`step\\\${step}-indicator\\\`).classList.add('active');
            
            currentStep = step;
          }

          // Form validation and submission
          document.getElementById('booking-form').addEventListener('submit', (e) => {
            e.preventDefault();

            const formError = document.getElementById('form-error');
            formError.classList.add('hidden');

            // Get form values
            const containerType = document.getElementById('container-type').value;
            const containerCount = parseInt(document.getElementById('container-count').value);
            const cargoWeight = parseFloat(document.getElementById('cargo-weight').value);
            const cargoDescription = document.getElementById('cargo-description').value;
            const companyName = document.getElementById('company-name').value;
            const contactPerson = document.getElementById('contact-person').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;

            // Validation
            if (!containerType) {
              formError.textContent = '컨테이너 타입을 선택해주세요.';
              formError.classList.remove('hidden');
              return;
            }

            if (containerCount < 1 || containerCount > 10) {
              formError.textContent = '컨테이너 수량은 1-10개 사이여야 합니다.';
              formError.classList.remove('hidden');
              return;
            }

            const containerOption = document.querySelector(\\\`#container-type option[value="\\\${containerType}"]\\\`);
            const availableQuantity = parseInt(containerOption.dataset.available);
            
            if (containerCount > availableQuantity) {
              formError.textContent = \\\`선택한 컨테이너 타입의 재고가 부족합니다. (가능: \\\${availableQuantity}개)\\\`;
              formError.classList.remove('hidden');
              return;
            }

            if (cargoWeight <= 0) {
              formError.textContent = '화물 중량은 양수여야 합니다.';
              formError.classList.remove('hidden');
              return;
            }

            if (!/^[0-9-]+$/.test(phone)) {
              formError.textContent = '연락처는 숫자와 하이픈(-)만 입력 가능합니다.';
              formError.classList.remove('hidden');
              return;
            }

            if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
              formError.textContent = '올바른 이메일 형식을 입력해주세요.';
              formError.classList.remove('hidden');
              return;
            }

            // Store booking data
            bookingData = {
              containerType,
              containerCount,
              cargoWeight,
              cargoDescription,
              companyName,
              contactPerson,
              phone,
              email,
              price: parseFloat(containerOption.dataset.price)
            };

            nextStep(3);
          });

          function displaySummary() {
            const total = bookingData.price * bookingData.containerCount;
            
            document.getElementById('booking-summary').innerHTML = \\\`
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-600">선박</span>
                <span class="font-medium">\\\${vesselData.vessel_name}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-600">항로</span>
                <span class="font-medium">\\\${vesselData.departure_port} → \\\${vesselData.arrival_port}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-600">컨테이너</span>
                <span class="font-medium">\\\${bookingData.containerType} x \\\${bookingData.containerCount}개</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-600">화물 중량</span>
                <span class="font-medium">\\\${bookingData.cargoWeight.toLocaleString()} kg</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-600">화물 품목</span>
                <span class="font-medium">\\\${bookingData.cargoDescription}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-600">회사명</span>
                <span class="font-medium">\\\${bookingData.companyName}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-600">담당자</span>
                <span class="font-medium">\\\${bookingData.contactPerson}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-600">연락처</span>
                <span class="font-medium">\\\${bookingData.phone}</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-gray-600">이메일</span>
                <span class="font-medium">\\\${bookingData.email}</span>
              </div>
            \\\`;

            document.getElementById('total-price').textContent = \\\`$\\\${total.toLocaleString()}\\\`;
          }

          async function confirmBooking() {
            if (!confirm('정말 예약하시겠습니까?')) {
              return;
            }

            const confirmBtn = document.getElementById('confirm-btn');
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>처리 중...';

            try {
              // Get user from localStorage
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              const token = localStorage.getItem('token');

              if (!user.id) {
                alert('로그인이 필요합니다.');
                window.location.href = '/login';
                return;
              }

              const response = await axios.post('/api/bookings', {
                userId: user.id,
                vesselId: parseInt(vesselId),
                containerType: bookingData.containerType,
                quantity: bookingData.containerCount,
                cargoWeight: bookingData.cargoWeight,
                cargoDescription: bookingData.cargoDescription,
                companyName: bookingData.companyName,
                contactPerson: bookingData.contactPerson,
                phone: bookingData.phone,
                email: bookingData.email,
                notes: ''
              }, {
                headers: {
                  'Authorization': \\\`Bearer \\\${token}\\\`
                }
              });

              // Show success modal
              document.getElementById('booking-number').textContent = response.data.booking.booking_reference;
              document.getElementById('success-modal').classList.remove('hidden');

            } catch (error) {
              console.error('Booking error:', error);
              alert(error.response?.data?.error || '예약 중 오류가 발생했습니다.');
              confirmBtn.disabled = false;
              confirmBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>예약 확정';
            }
          }

          // Load vessel info on page load
          loadVesselInfo();
        </script>
    </body>
    </html>
  `)
})

// Dashboard page (Role-based)
app.get('/dashboard', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>대시보드 - ShipShare</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="/static/session-timer.js"></script>
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
          .sidebar {
            width: 250px;
            transition: transform 0.3s;
          }
          @media (max-width: 768px) {
            .sidebar {
              transform: translateX(-100%);
              position: fixed;
              height: 100vh;
              z-index: 40;
            }
            .sidebar.open {
              transform: translateX(0);
            }
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <div class="flex h-screen">
            <!-- Sidebar -->
            <aside id="sidebar" class="sidebar bg-white shadow-lg">
                <div class="p-6 border-b">
                    <a href="/" class="flex items-center">
                        <i class="fas fa-ship text-primary text-2xl mr-3"></i>
                        <span class="text-xl font-bold text-gray-800">ShipShare</span>
                    </a>
                </div>

                <nav class="p-4">
                    <a href="/dashboard" class="flex items-center px-4 py-3 mb-2 bg-primary bg-opacity-10 text-primary rounded-lg">
                        <i class="fas fa-chart-line mr-3"></i>
                        대시보드
                    </a>
                    <a href="/search" class="flex items-center px-4 py-3 mb-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <i class="fas fa-search mr-3"></i>
                        선박 검색
                    </a>
                    <a href="/bookings" class="flex items-center px-4 py-3 mb-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <i class="fas fa-list mr-3"></i>
                        예약 내역
                    </a>
                    <a href="/profile" class="flex items-center px-4 py-3 mb-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <i class="fas fa-user mr-3"></i>
                        프로필
                    </a>
                </nav>

                <div class="absolute bottom-0 w-full p-4 border-t">
                    <button onclick="logout()" class="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <i class="fas fa-sign-out-alt mr-3"></i>
                        로그아웃
                    </button>
                </div>
            </aside>

            <!-- Main Content -->
            <div class="flex-1 overflow-auto">
                <!-- Top Bar -->
                <header class="bg-white shadow-sm">
                    <div class="flex items-center justify-between px-6 py-4">
                        <div class="flex items-center">
                            <button onclick="toggleSidebar()" class="md:hidden mr-4 text-gray-600">
                                <i class="fas fa-bars text-xl"></i>
                            </button>
                            <h1 class="text-2xl font-bold text-gray-800">대시보드</h1>
                        </div>
                        <div class="flex items-center space-x-4">
                            <button class="relative text-gray-600 hover:text-primary transition">
                                <i class="fas fa-bell text-xl"></i>
                                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                            </button>
                            <div class="flex items-center space-x-3">
                                <div class="text-right">
                                    <p id="user-name" class="text-sm font-medium text-gray-800"></p>
                                    <p id="user-role" class="text-xs text-gray-500"></p>
                                </div>
                                <div class="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-primary"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Dashboard Content -->
                <main class="p-6">
                    <!-- Stats Cards -->
                    <div id="stats-cards" class="grid md:grid-cols-4 gap-6 mb-8">
                        <!-- Cards will be loaded dynamically -->
                    </div>

                    <div class="grid lg:grid-cols-3 gap-6">
                        <!-- Main Content Area -->
                        <div class="lg:col-span-2">
                            <!-- Chart -->
                            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                                <h3 class="text-lg font-bold text-gray-800 mb-4">예약 추이</h3>
                                <div style="height: 300px; max-height: 300px;">
                                    <canvas id="bookingChart"></canvas>
                                </div>
                            </div>

                            <!-- Recent Bookings -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex items-center justify-between mb-6">
                                    <h3 class="text-lg font-bold text-gray-800">최근 예약 내역</h3>
                                    <a href="/bookings" class="text-primary hover:text-secondary text-sm font-medium">
                                        전체보기 <i class="fas fa-arrow-right ml-1"></i>
                                    </a>
                                </div>

                                <div id="bookings-table" class="overflow-x-auto">
                                    <table class="w-full">
                                        <thead>
                                            <tr class="border-b">
                                                <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">예약번호</th>
                                                <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">선박명</th>
                                                <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">출발일</th>
                                                <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">상태</th>
                                                <th class="text-right py-3 px-4 text-sm font-medium text-gray-600">금액</th>
                                                <th class="text-center py-3 px-4 text-sm font-medium text-gray-600">액션</th>
                                            </tr>
                                        </thead>
                                        <tbody id="bookings-tbody">
                                            <tr>
                                                <td colspan="6" class="text-center py-8">
                                                    <i class="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
                                                    <p class="text-gray-500">데이터 로딩 중...</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Pagination -->
                                <div id="pagination" class="flex items-center justify-between mt-6 pt-6 border-t">
                                    <p class="text-sm text-gray-600">
                                        <span id="page-info">1-10 of 0 items</span>
                                    </p>
                                    <div class="flex gap-2">
                                        <button onclick="prevPage()" class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                                            <i class="fas fa-chevron-left"></i>
                                        </button>
                                        <button onclick="nextPage()" class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                                            <i class="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions Sidebar -->
                        <div class="space-y-6">
                            <!-- Quick Actions -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h3 class="text-lg font-bold text-gray-800 mb-4">빠른 실행</h3>
                                <div id="quick-actions" class="space-y-3">
                                    <!-- Actions will be loaded dynamically -->
                                </div>
                            </div>

                            <!-- Help Card -->
                            <div class="gradient-bg rounded-xl shadow-sm p-6 text-white">
                                <div class="flex items-center mb-4">
                                    <i class="fas fa-headset text-3xl mr-3"></i>
                                    <h3 class="text-lg font-bold">도움이 필요하신가요?</h3>
                                </div>
                                <p class="text-sm mb-4 text-gray-100">
                                    고객 지원팀이 24/7 대기 중입니다.
                                </p>
                                <button class="w-full bg-white text-primary py-2 rounded-lg font-medium hover:bg-gray-100 transition">
                                    문의하기
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <script>
          let currentPage = 1;
          const itemsPerPage = 10;
          let totalBookings = 0;
          let allBookings = [];
          let chart = null;

          // Check authentication
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user') || '{}');

          console.log('📊 대시보드 로드 - 세션 확인');
          console.log('  - Token:', token ? '있음 (' + token.substring(0, 10) + '...)' : '없음');
          console.log('  - User:', user.name || user.email || '없음');
          console.log('  - ExpiresAt:', localStorage.getItem('expiresAt'));

          if (!token || !user.id) {
            console.warn('❌ 토큰 또는 사용자 정보 없음 - 로그인 페이지로 이동');
            window.location.href = '/login';
            return;
          }

          // Force reinitialize session timer
          if (window.sessionTimer) {
            console.log('🔄 세션 타이머 강제 재초기화');
            window.sessionTimer.stop();
            window.sessionTimer.init();
          }

          // Display user info
          document.getElementById('user-name').textContent = user.name || user.email;
          const roleMap = {
            shipper: '화주',
            forwarder: '포워더',
            carrier: '선사'
          };
          document.getElementById('user-role').textContent = roleMap[user.role] || user.role;

          // Sidebar toggle for mobile
          function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('open');
          }

          // Logout function
          function logout() {
            console.log('🚪 로그아웃 시작');
            
            // Stop session timer
            if (window.sessionTimer) {
              window.sessionTimer.stop();
            }
            
            // Clear all session data
            localStorage.removeItem('token');
            localStorage.removeItem('expiresAt');
            localStorage.removeItem('user');
            
            console.log('✅ 로그아웃 완료 - 로그인 페이지로 이동');
            window.location.href = '/login';
          }

          // Load dashboard data based on role
          async function loadDashboard() {
            try {
              const response = await axios.get(\`/api/bookings/user/\${user.id}\`, {
                headers: { 'Authorization': \`Bearer \${token}\` }
              });

              allBookings = response.data.bookings || [];
              totalBookings = allBookings.length;

              if (user.role === 'shipper') {
                loadShipperDashboard();
              } else if (user.role === 'forwarder') {
                loadForwarderDashboard();
              } else {
                loadShipperDashboard(); // Default
              }

            } catch (error) {
              console.error('Load dashboard error:', error);
            }
          }

          // Shipper Dashboard
          function loadShipperDashboard() {
            const pending = allBookings.filter(b => b.status === 'pending').length;
            const confirmed = allBookings.filter(b => b.status === 'confirmed').length;
            const completed = allBookings.filter(b => b.status === 'completed').length;
            const totalCost = allBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

            // Stats Cards
            document.getElementById('stats-cards').innerHTML = \`
              <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">총 예약 건수</p>
                    <p class="text-3xl font-bold text-gray-800">\${totalBookings}</p>
                  </div>
                  <div class="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <i class="fas fa-calendar-check text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">진행 중인 예약</p>
                    <p class="text-3xl font-bold text-yellow-600">\${pending}</p>
                  </div>
                  <div class="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <i class="fas fa-clock text-yellow-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">완료된 예약</p>
                    <p class="text-3xl font-bold text-green-600">\${completed}</p>
                  </div>
                  <div class="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <i class="fas fa-check-circle text-green-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">총 지출 금액</p>
                    <p class="text-2xl font-bold text-gray-800">$\${totalCost.toLocaleString()}</p>
                  </div>
                  <div class="bg-primary bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center">
                    <i class="fas fa-dollar-sign text-primary text-xl"></i>
                  </div>
                </div>
              </div>
            \`;

            // Quick Actions
            document.getElementById('quick-actions').innerHTML = \`
              <a href="/search" class="flex items-center p-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition">
                <i class="fas fa-search text-2xl mr-3"></i>
                <div>
                  <p class="font-bold">새 선박 검색</p>
                  <p class="text-xs opacity-80">대체 선박 찾기</p>
                </div>
              </a>
              <button class="w-full flex items-center p-4 border rounded-lg hover:bg-gray-50 transition">
                <i class="fas fa-headset text-2xl mr-3 text-gray-600"></i>
                <div class="text-left">
                  <p class="font-bold text-gray-800">긴급 문의</p>
                  <p class="text-xs text-gray-500">24/7 고객 지원</p>
                </div>
              </button>
            \`;

            renderBookingsTable();
            renderChart();
          }

          // Forwarder Dashboard
          function loadForwarderDashboard() {
            const thisMonth = new Date().getMonth();
            const thisMonthBookings = allBookings.filter(b => 
              new Date(b.created_at).getMonth() === thisMonth
            ).length;
            
            const totalTEU = allBookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
            const commission = allBookings.reduce((sum, b) => sum + (b.total_price * 0.05), 0); // 5% commission

            // Stats Cards
            document.getElementById('stats-cards').innerHTML = \`
              <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">관리 중인 화주 수</p>
                    <p class="text-3xl font-bold text-gray-800">5</p>
                  </div>
                  <div class="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <i class="fas fa-users text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">이번 달 예약 건수</p>
                    <p class="text-3xl font-bold text-primary">\${thisMonthBookings}</p>
                  </div>
                  <div class="bg-primary bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center">
                    <i class="fas fa-calendar-alt text-primary text-xl"></i>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">총 처리 TEU</p>
                    <p class="text-3xl font-bold text-green-600">\${totalTEU}</p>
                  </div>
                  <div class="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <i class="fas fa-box text-green-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">이번 달 수수료 수익</p>
                    <p class="text-2xl font-bold text-gray-800">$\${commission.toLocaleString()}</p>
                  </div>
                  <div class="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <i class="fas fa-percentage text-yellow-600 text-xl"></i>
                  </div>
                </div>
              </div>
            \`;

            // Quick Actions
            document.getElementById('quick-actions').innerHTML = \`
              <button class="w-full flex items-center p-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition">
                <i class="fas fa-user-plus text-2xl mr-3"></i>
                <div class="text-left">
                  <p class="font-bold">화주 추가</p>
                  <p class="text-xs opacity-80">새 고객 등록</p>
                </div>
              </button>
              <button class="w-full flex items-center p-4 border rounded-lg hover:bg-gray-50 transition">
                <i class="fas fa-layer-group text-2xl mr-3 text-gray-600"></i>
                <div class="text-left">
                  <p class="font-bold text-gray-800">일괄 예약</p>
                  <p class="text-xs text-gray-500">여러 건 동시 예약</p>
                </div>
              </button>
            \`;

            renderBookingsTable();
            renderChart();
          }

          // Render Bookings Table
          function renderBookingsTable() {
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageBookings = allBookings.slice(start, end);

            if (pageBookings.length === 0) {
              document.getElementById('bookings-tbody').innerHTML = \`
                <tr>
                  <td colspan="6" class="text-center py-8">
                    <i class="fas fa-inbox text-gray-400 text-3xl mb-2"></i>
                    <p class="text-gray-500">예약 내역이 없습니다</p>
                  </td>
                </tr>
              \`;
              return;
            }

            const statusColors = {
              pending: 'bg-yellow-100 text-yellow-800',
              confirmed: 'bg-green-100 text-green-800',
              cancelled: 'bg-red-100 text-red-800',
              completed: 'bg-blue-100 text-blue-800'
            };

            const statusLabels = {
              pending: '대기 중',
              confirmed: '확정',
              cancelled: '취소됨',
              completed: '완료'
            };

            document.getElementById('bookings-tbody').innerHTML = pageBookings.map(booking => \`
              <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">
                  <span class="text-sm font-medium text-gray-800">\${booking.booking_reference}</span>
                </td>
                <td class="py-3 px-4">
                  <div>
                    <p class="text-sm font-medium text-gray-800">\${booking.vessel_name}</p>
                    <p class="text-xs text-gray-500">\${booking.carrier_name}</p>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="text-sm text-gray-600">\${new Date(booking.departure_date).toLocaleDateString('ko-KR')}</span>
                </td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 rounded text-xs font-medium \${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}">
                    \${statusLabels[booking.status] || booking.status}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <span class="text-sm font-bold text-primary">$\${booking.total_price.toLocaleString()}</span>
                </td>
                <td class="py-3 px-4 text-center">
                  <button onclick="viewBooking('\${booking.booking_reference}')" 
                          class="text-primary hover:text-secondary">
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            \`).join('');

            // Update pagination
            document.getElementById('page-info').textContent = \`\${start + 1}-\${Math.min(end, totalBookings)} of \${totalBookings} items\`;
          }

          // Render Chart
          function renderChart() {
            const ctx = document.getElementById('bookingChart').getContext('2d');
            
            // Sample data - last 6 months
            const labels = ['6월', '7월', '8월', '9월', '10월', '11월'];
            const data = [5, 8, 12, 7, 15, totalBookings || 10];

            if (chart) {
              chart.destroy();
            }

            chart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: '예약 건수',
                  data: data,
                  borderColor: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 5,
                      precision: 0
                    },
                    grid: {
                      display: true,
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }
            });
          }

          // Pagination
          function prevPage() {
            if (currentPage > 1) {
              currentPage--;
              renderBookingsTable();
            }
          }

          function nextPage() {
            if (currentPage < Math.ceil(totalBookings / itemsPerPage)) {
              currentPage++;
              renderBookingsTable();
            }
          }

          function viewBooking(reference) {
            window.location.href = \`/booking/\${reference}\`;
          }

          // Load dashboard on page load
          loadDashboard();
        </script>
    </body>
    </html>
  `)
})

export default app
