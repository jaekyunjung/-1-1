import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import auth from './routes/auth'
import vessels from './routes/vessels'
import bookings from './routes/bookings'

type Bindings = {
  DB: D1Database;
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
app.route('/api/vessels', vessels)
app.route('/api/bookings', bookings)

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

              // Store token in localStorage
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('user', JSON.stringify(response.data.user));

              // Redirect to dashboard after 1 second
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1000);

            } catch (error) {
              const message = error.response?.data?.error || '로그인 중 오류가 발생했습니다.';
              errorMsg.textContent = message;
              errorMsg.classList.remove('hidden');
              
              loginBtn.disabled = false;
              loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>로그인';
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
              localStorage.setItem('user', JSON.stringify(response.data.user));

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
                        <a href="/login" class="text-gray-600 hover:text-primary transition">로그인</a>
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

            // Show loading
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('no-results').classList.add('hidden');
            document.getElementById('results').classList.add('hidden');
            document.getElementById('loading').classList.remove('hidden');

            try {
              const params = new URLSearchParams();
              if (departure) params.append('departure', departure);
              if (arrival) params.append('arrival', arrival);
              if (date) params.append('date', date);
              if (containerType) params.append('containerType', containerType);

              const response = await axios.get('/api/vessels/search?' + params.toString());
              vessels = response.data.vessels;

              document.getElementById('loading').classList.add('hidden');

              if (vessels.length === 0) {
                document.getElementById('no-results').classList.remove('hidden');
              } else {
                document.getElementById('result-count').textContent = vessels.length;
                renderVessels(vessels);
                document.getElementById('results').classList.remove('hidden');
              }

            } catch (error) {
              console.error('Search error:', error);
              document.getElementById('loading').classList.add('hidden');
              document.getElementById('no-results').classList.remove('hidden');
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

// Dashboard page
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
                        <span id="user-name" class="text-gray-600"></span>
                        <span id="user-role" class="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-medium"></span>
                        <button onclick="logout()" class="text-gray-600 hover:text-red-600 transition">
                            <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Page Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-800 mb-2">대시보드</h1>
                <p class="text-gray-600">선박 예약 현황과 통계를 확인하세요</p>
            </div>

            <!-- Quick Stats -->
            <div class="grid md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm mb-1">총 예약</p>
                            <p id="stat-total" class="text-3xl font-bold text-gray-800">0</p>
                        </div>
                        <div class="bg-primary bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center">
                            <i class="fas fa-calendar-check text-primary text-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm mb-1">진행 중</p>
                            <p id="stat-pending" class="text-3xl font-bold text-yellow-600">0</p>
                        </div>
                        <div class="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center">
                            <i class="fas fa-clock text-yellow-600 text-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm mb-1">확정</p>
                            <p id="stat-confirmed" class="text-3xl font-bold text-green-600">0</p>
                        </div>
                        <div class="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                            <i class="fas fa-check-circle text-green-600 text-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm mb-1">총 비용</p>
                            <p id="stat-cost" class="text-2xl font-bold text-gray-800">$0</p>
                        </div>
                        <div class="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                            <i class="fas fa-dollar-sign text-blue-600 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="grid lg:grid-cols-3 gap-8">
                <!-- Recent Bookings -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-bold text-gray-800">최근 예약</h2>
                            <a href="/search" class="text-primary hover:text-secondary font-medium">
                                <i class="fas fa-plus mr-2"></i>새 예약
                            </a>
                        </div>

                        <div id="bookings-list" class="space-y-4">
                            <div class="text-center py-8 text-gray-500">
                                <i class="fas fa-spinner fa-spin text-3xl mb-4"></i>
                                <p>예약 목록을 불러오는 중...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions & Info -->
                <div class="space-y-6">
                    <!-- Quick Actions -->
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">빠른 실행</h3>
                        <div class="space-y-3">
                            <a href="/search" class="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition">
                                <i class="fas fa-search text-primary text-xl mr-3"></i>
                                <span class="font-medium">선박 검색</span>
                            </a>
                            <a href="/bookings" class="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition">
                                <i class="fas fa-list text-primary text-xl mr-3"></i>
                                <span class="font-medium">예약 내역</span>
                            </a>
                            <a href="/profile" class="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition">
                                <i class="fas fa-user text-primary text-xl mr-3"></i>
                                <span class="font-medium">프로필 설정</span>
                            </a>
                        </div>
                    </div>

                    <!-- Help & Support -->
                    <div class="gradient-bg rounded-xl shadow-sm p-6 text-white">
                        <h3 class="text-lg font-bold mb-4">도움이 필요하신가요?</h3>
                        <p class="mb-4 text-sm text-gray-100">
                            ShipShare 팀이 언제든 도와드립니다.
                        </p>
                        <button class="w-full bg-white text-primary py-2 rounded-lg font-medium hover:bg-gray-100 transition">
                            <i class="fas fa-headset mr-2"></i>고객 지원
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script>
          // Check authentication
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user') || '{}');

          if (!token || !user.id) {
            window.location.href = '/login';
          }

          // Display user info
          document.getElementById('user-name').textContent = user.name || user.email;
          const roleMap = {
            shipper: '화주',
            forwarder: '포워더',
            carrier: '선사'
          };
          document.getElementById('user-role').textContent = roleMap[user.role] || user.role;

          // Logout function
          function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }

          // Load bookings
          async function loadBookings() {
            try {
              const response = await axios.get(\`/api/bookings/user/\${user.id}\`, {
                headers: {
                  'Authorization': \`Bearer \${token}\`
                }
              });

              const bookings = response.data.bookings || [];
              
              // Update stats
              document.getElementById('stat-total').textContent = bookings.length;
              
              const pending = bookings.filter(b => b.status === 'pending').length;
              const confirmed = bookings.filter(b => b.status === 'confirmed').length;
              const totalCost = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
              
              document.getElementById('stat-pending').textContent = pending;
              document.getElementById('stat-confirmed').textContent = confirmed;
              document.getElementById('stat-cost').textContent = \`$\${totalCost.toLocaleString()}\`;

              // Display bookings
              const bookingsList = document.getElementById('bookings-list');
              
              if (bookings.length === 0) {
                bookingsList.innerHTML = \`
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p class="mb-4">아직 예약이 없습니다</p>
                    <a href="/search" class="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition">
                      첫 예약 만들기
                    </a>
                  </div>
                \`;
                return;
              }

              bookingsList.innerHTML = bookings.slice(0, 5).map(booking => {
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

                return \`
                  <div class="border rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <h3 class="font-bold text-gray-800">\${booking.vessel_name}</h3>
                          <span class="px-2 py-1 rounded text-xs \${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}">
                            \${statusLabels[booking.status] || booking.status}
                          </span>
                        </div>
                        <p class="text-sm text-gray-600 mb-1">
                          <i class="fas fa-building mr-2"></i>\${booking.carrier_name}
                        </p>
                        <p class="text-sm text-gray-600">
                          <i class="fas fa-route mr-2"></i>
                          \${booking.departure_port} → \${booking.arrival_port}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="text-lg font-bold text-primary">$\${booking.total_price.toLocaleString()}</p>
                        <p class="text-xs text-gray-500">\${booking.container_type} x \${booking.quantity}</p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between pt-3 border-t">
                      <div class="text-xs text-gray-500">
                        <i class="fas fa-calendar mr-1"></i>
                        출발: \${new Date(booking.departure_date).toLocaleDateString('ko-KR')}
                      </div>
                      <div class="flex gap-2">
                        <button onclick="viewBooking('\${booking.booking_reference}')" 
                                class="text-xs text-primary hover:text-secondary">
                          <i class="fas fa-eye mr-1"></i>상세보기
                        </button>
                        \${booking.status === 'pending' ? \`
                          <button onclick="cancelBooking('\${booking.booking_reference}')" 
                                  class="text-xs text-red-600 hover:text-red-800">
                            <i class="fas fa-times mr-1"></i>취소
                          </button>
                        \` : ''}
                      </div>
                    </div>
                  </div>
                \`;
              }).join('');

            } catch (error) {
              console.error('Load bookings error:', error);
              document.getElementById('bookings-list').innerHTML = \`
                <div class="text-center py-8 text-red-500">
                  <i class="fas fa-exclamation-circle text-3xl mb-4"></i>
                  <p>예약 목록을 불러오지 못했습니다.</p>
                </div>
              \`;
            }
          }

          function viewBooking(reference) {
            window.location.href = \`/booking/\${reference}\`;
          }

          async function cancelBooking(reference) {
            if (!confirm('예약을 취소하시겠습니까?')) return;

            try {
              await axios.patch(\`/api/bookings/\${reference}/cancel\`, {}, {
                headers: {
                  'Authorization': \`Bearer \${token}\`
                }
              });

              alert('예약이 취소되었습니다.');
              loadBookings();

            } catch (error) {
              alert('예약 취소 중 오류가 발생했습니다.');
            }
          }

          // Load data on page load
          loadBookings();
        </script>
    </body>
    </html>
  `)
})

export default app
