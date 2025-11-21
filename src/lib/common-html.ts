// Common HTML parts for reuse

export const htmlHead = (title: string) => `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ShipShare</title>
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
`

export const navbar = (isLoggedIn = false) => `
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
                <a href="/search" class="text-gray-600 hover:text-primary transition">선박 검색</a>
                ${isLoggedIn ? `
                    <a href="/dashboard" class="text-gray-600 hover:text-primary transition">대시보드</a>
                    <a href="/bookings" class="text-gray-600 hover:text-primary transition">내 예약</a>
                    <button onclick="logout()" class="text-gray-600 hover:text-primary transition">로그아웃</button>
                ` : `
                    <a href="/login" class="text-gray-600 hover:text-primary transition">로그인</a>
                    <a href="/signup" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition">시작하기</a>
                `}
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
            <a href="/search" class="block text-gray-600 hover:text-primary">선박 검색</a>
            ${isLoggedIn ? `
                <a href="/dashboard" class="block text-gray-600 hover:text-primary">대시보드</a>
                <a href="/bookings" class="block text-gray-600 hover:text-primary">내 예약</a>
                <button onclick="logout()" class="block text-gray-600 hover:text-primary w-full text-left">로그아웃</button>
            ` : `
                <a href="/login" class="block text-gray-600 hover:text-primary">로그인</a>
                <a href="/signup" class="block bg-primary text-white px-6 py-2 rounded-lg text-center">시작하기</a>
            `}
        </div>
    </div>
</nav>

<script>
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  // Check if user is logged in
  function isLoggedIn() {
    return localStorage.getItem('token') !== null;
  }

  // Get current user
  function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
</script>
`
