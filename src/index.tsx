import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Landing page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ShipShare - 블록체인 기반 선적권 거래 플랫폼</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
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
                        <a href="/login" class="text-gray-600 hover:text-primary transition">로그인</a>
                        <a href="/signup" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition">시작하기</a>
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
                    <a href="/login" class="block text-gray-600 hover:text-primary">로그인</a>
                    <a href="/signup" class="block bg-primary text-white px-6 py-2 rounded-lg text-center">시작하기</a>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero-pattern pt-32 pb-20 px-4">
            <div class="max-w-7xl mx-auto">
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <div class="text-white">
                        <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            롤오버 걱정 없는<br/>
                            <span class="text-yellow-300">스마트 선박 예약</span>
                        </h1>
                        <p class="text-xl mb-8 text-gray-100">
                            실시간 선박 검색, 가격 비교, 즉시 예약까지<br/>
                            ShipShare로 간편하게 해결하세요
                        </p>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <a href="/signup" class="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition text-center">
                                <i class="fas fa-rocket mr-2"></i>무료로 시작하기
                            </a>
                            <a href="#how-it-works" class="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary transition text-center">
                                <i class="fas fa-play-circle mr-2"></i>이용 방법 보기
                            </a>
                        </div>
                        <div class="mt-8 flex items-center gap-8">
                            <div>
                                <div class="text-3xl font-bold">500+</div>
                                <div class="text-gray-200">등록 선박</div>
                            </div>
                            <div>
                                <div class="text-3xl font-bold">1,000+</div>
                                <div class="text-gray-200">활성 사용자</div>
                            </div>
                            <div>
                                <div class="text-3xl font-bold">98%</div>
                                <div class="text-gray-200">고객 만족도</div>
                            </div>
                        </div>
                    </div>
                    <div class="hidden md:block">
                        <div class="bg-white rounded-2xl shadow-2xl p-8">
                            <div class="text-center mb-6">
                                <i class="fas fa-search-location text-primary text-6xl mb-4"></i>
                                <h3 class="text-2xl font-bold text-gray-800">선박 빠른 검색</h3>
                            </div>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">출발지</label>
                                    <input type="text" placeholder="부산" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">도착지</label>
                                    <input type="text" placeholder="로스앤젤레스" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">출발일</label>
                                    <input type="date" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                </div>
                                <button class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                                    <i class="fas fa-search mr-2"></i>선박 검색하기
                                </button>
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
                            <i class="fas fa-dollar-sign text-primary text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">가격 비교</h3>
                        <p class="text-gray-600">여러 선사의 운임을 한눈에 비교하고 최적의 가격을 선택하세요</p>
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
                            <i class="fas fa-shield-alt text-primary text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">블록체인 보안</h3>
                        <p class="text-gray-600">블록체인 기술로 거래의 투명성과 보안을 보장합니다</p>
                    </div>
                    
                    <div class="text-center p-8 rounded-xl hover:shadow-xl transition">
                        <div class="bg-primary bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-bell text-primary text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">스마트 알림</h3>
                        <p class="text-gray-600">롤오버 발생 시 실시간으로 대체 선박을 추천받으세요</p>
                    </div>
                    
                    <div class="text-center p-8 rounded-xl hover:shadow-xl transition">
                        <div class="bg-primary bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-chart-line text-primary text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">통계 분석</h3>
                        <p class="text-gray-600">선박 이용 내역과 비용을 한눈에 파악하고 관리하세요</p>
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
                    <a href="/signup" class="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
                        무료로 시작하기
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
                        <li><i class="fas fa-phone mr-2"></i>02-1234-5678</li>
                        <li><i class="fas fa-map-marker-alt mr-2"></i>서울시 강남구</li>
                    </ul>
                </div>
            </div>
            <div class="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
                <p>&copy; 2025 ShipShare. All rights reserved.</p>
            </div>
        </footer>

        <script>
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

// API Routes will be added here

export default app
