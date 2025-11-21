// ShipShare Utility Functions

// API Caching
class APICache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const age = Date.now() - item.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Global cache instance
window.apiCache = new APICache();

// Debounce function
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit = 100) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy load images
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Format currency
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Format date
function formatDate(date, format = 'short') {
  const d = new Date(date);
  const options = format === 'short' 
    ? { year: 'numeric', month: 'short', day: 'numeric' }
    : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  
  return d.toLocaleDateString('ko-KR', options);
}

// Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone
function validatePhone(phone) {
  const re = /^[0-9-]+$/;
  return re.test(phone);
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-slide-up ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    type === 'warning' ? 'bg-yellow-500' : 
    'bg-blue-500'
  }`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slide-down 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Check mobile device
function isMobile() {
  return window.innerWidth < 768;
}

// Check tablet device
function isTablet() {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

// Check desktop device
function isDesktop() {
  return window.innerWidth >= 1024;
}

// Get breakpoint
function getBreakpoint() {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}

// Responsive handler
const responsiveHandlers = [];
function onBreakpointChange(callback) {
  responsiveHandlers.push(callback);
}

let currentBreakpoint = getBreakpoint();
window.addEventListener('resize', throttle(() => {
  const newBreakpoint = getBreakpoint();
  if (newBreakpoint !== currentBreakpoint) {
    currentBreakpoint = newBreakpoint;
    responsiveHandlers.forEach(handler => handler(newBreakpoint));
  }
}, 100));

// Enhanced fetch with caching
async function cachedFetch(url, options = {}) {
  const cacheKey = url + JSON.stringify(options);
  
  // Check cache first
  const cached = window.apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(url, options);
  const data = await response.json();

  // Cache the result
  if (response.ok) {
    window.apiCache.set(cacheKey, data);
  }

  return data;
}

// Local storage with expiry
const storage = {
  set(key, value, ttl = 24 * 60 * 60 * 1000) { // 24 hours default
    const item = {
      value,
      expiry: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  },

  remove(key) {
    localStorage.removeItem(key);
  }
};

// Keyboard navigation helper
function enableKeyboardNav(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el, index) => {
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
      if (e.key === 'ArrowDown' && elements[index + 1]) {
        elements[index + 1].focus();
      }
      if (e.key === 'ArrowUp' && elements[index - 1]) {
        elements[index - 1].focus();
      }
    });
  });
}

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    APICache,
    debounce,
    throttle,
    lazyLoadImages,
    formatCurrency,
    formatDate,
    validateEmail,
    validatePhone,
    showToast,
    isMobile,
    isTablet,
    isDesktop,
    getBreakpoint,
    onBreakpointChange,
    cachedFetch,
    storage,
    enableKeyboardNav
  };
}
