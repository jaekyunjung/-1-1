// Session Timer for ShipShare
// Displays remaining session time and handles auto-logout

class SessionTimer {
  constructor() {
    this.token = null;
    this.expiresAt = null;
    this.user = null;
    this.timerInterval = null;
    this.warningShown = false;
  }

  // Initialize session timer
  init() {
    // Get session data from localStorage
    this.token = localStorage.getItem('token');
    const expiresAtStr = localStorage.getItem('expiresAt');
    this.expiresAt = parseInt(expiresAtStr || '0');
    const userStr = localStorage.getItem('user');
    this.user = JSON.parse(userStr || '{}');

    console.log('🔍 세션 타이머 초기화 시도');
    console.log('  - Token:', this.token ? '있음 (' + this.token.substring(0, 10) + '...)' : '없음');
    console.log('  - ExpiresAt (raw):', expiresAtStr);
    console.log('  - ExpiresAt (parsed):', this.expiresAt);
    console.log('  - Current time:', Date.now());
    console.log('  - User:', this.user.name || this.user.email || '없음');
    console.log('  - Role:', this.user.role || '없음');

    if (!this.token || !this.expiresAt) {
      console.log('❌ 세션 타이머: 로그인 안 됨 (token 또는 expiresAt 없음)');
      return false;
    }

    // Check if session is already expired
    const remainingTime = this.expiresAt - Date.now();
    if (remainingTime <= 0) {
      console.log('❌ 세션 타이머: 세션 만료됨 (남은 시간:', remainingTime, 'ms)');
      this.handleExpiredSession();
      return false;
    }

    console.log('✅ 세션 유효 (남은 시간:', Math.floor(remainingTime / 1000), '초)');

    // Create timer display element
    this.createTimerDisplay();

    // Start countdown
    this.startTimer();

    console.log('✅ 세션 타이머 시작:', new Date(this.expiresAt).toLocaleString());
    return true;
  }

  // Create timer display element
  createTimerDisplay() {
    const roleMap = {
      shipper: '화주',
      forwarder: '포워더',
      carrier: '선사'
    };

    const existingTimer = document.getElementById('session-timer-display');
    if (existingTimer) {
      existingTimer.remove();
    }

    const timerDiv = document.createElement('div');
    timerDiv.id = 'session-timer-display';
    timerDiv.className = 'fixed top-20 right-4 bg-white shadow-lg rounded-lg px-4 py-2 border border-gray-200 z-40';
    timerDiv.style.minWidth = '250px';
    
    timerDiv.innerHTML = `
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center space-x-2">
          <span class="text-gray-600">${roleMap[this.user.role] || this.user.role}</span>
          <span class="text-gray-400">|</span>
          <span class="font-bold text-gray-800">${this.user.name || this.user.email}</span>
          <span class="text-gray-400">|</span>
        </div>
        <div id="timer-countdown" class="font-mono text-primary font-bold">
          --:--:--
        </div>
      </div>
    `;

    document.body.appendChild(timerDiv);
  }

  // Start countdown timer
  startTimer() {
    // Update immediately
    this.updateDisplay();

    // Update every second
    this.timerInterval = setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }

  // Update timer display
  updateDisplay() {
    const now = Date.now();
    const remaining = this.expiresAt - now;

    if (remaining <= 0) {
      this.handleExpiredSession();
      return;
    }

    // Show warning at 2 minutes
    if (remaining <= 2 * 60 * 1000 && !this.warningShown) {
      this.showExpiryWarning();
      this.warningShown = true;
    }

    // Calculate time components
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Format display
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const timerElement = document.getElementById('timer-countdown');
    if (timerElement) {
      timerElement.textContent = display;
      
      // Change color based on remaining time
      if (remaining <= 60 * 1000) { // Less than 1 minute
        timerElement.className = 'font-mono text-red-600 font-bold';
      } else if (remaining <= 5 * 60 * 1000) { // Less than 5 minutes
        timerElement.className = 'font-mono text-orange-600 font-bold';
      } else {
        timerElement.className = 'font-mono text-primary font-bold';
      }
    }
  }

  // Show warning before expiry
  showExpiryWarning() {
    const warning = document.createElement('div');
    warning.className = 'fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50 max-w-md';
    warning.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-exclamation-triangle text-2xl mr-3"></i>
        <div>
          <p class="font-bold">세션 만료 임박</p>
          <p class="text-sm">2분 후 자동으로 로그아웃됩니다.</p>
        </div>
      </div>
    `;
    document.body.appendChild(warning);

    setTimeout(() => {
      warning.remove();
    }, 10000);
  }

  // Handle expired session
  handleExpiredSession() {
    console.log('⏰ 세션 만료 - 자동 로그아웃');
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Clear session data
    localStorage.removeItem('token');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('user');

    // Show expiry message
    alert('세션이 만료되었습니다. 다시 로그인해주세요.');

    // Redirect to login
    window.location.href = '/login';
  }

  // Stop timer (for logout)
  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    const timerDisplay = document.getElementById('session-timer-display');
    if (timerDisplay) {
      timerDisplay.remove();
    }
  }
}

// Create global session timer instance
window.sessionTimer = new SessionTimer();

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.sessionTimer.init();
  });
} else {
  window.sessionTimer.init();
}
