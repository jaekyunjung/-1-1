import { Hono } from 'hono'

const login = new Hono()

// Login page with magic link support
login.get('/login', (c) => {
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
          
          .code-input {
            width: 3rem;
            height: 3.5rem;
            font-size: 1.5rem;
            text-align: center;
            border: 2px solid #e5e7eb;
            border-radius: 0.5rem;
            transition: all 0.2s;
          }
          
          .code-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          
          .code-input:not(:placeholder-shown) {
            border-color: #10b981;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .fade-in {
            animation: fadeIn 0.3s ease-out;
          }
        </style>
    </head>
    <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <!-- Logo -->
            <div class="text-center mb-8">
                <a href="/" class="inline-flex items-center justify-center">
                    <i class="fas fa-ship text-primary text-4xl mr-3"></i>
                    <span class="text-3xl font-bold text-gray-800">ShipShare</span>
                </a>
                <p class="text-gray-600 mt-2">스마트 선적권 거래 플랫폼</p>
            </div>

            <!-- Login Card -->
            <div class="bg-white rounded-2xl shadow-xl p-8">
                <!-- Tab Navigation -->
                <div class="flex border-b mb-6">
                    <button id="tab-password" class="flex-1 py-3 text-center font-semibold border-b-2 border-primary text-primary transition">
                        <i class="fas fa-lock mr-2"></i>비밀번호
                    </button>
                    <button id="tab-magic" class="flex-1 py-3 text-center font-semibold border-b-2 border-transparent text-gray-500 hover:text-primary transition">
                        <i class="fas fa-magic mr-2"></i>간편 로그인
                    </button>
                    <button id="tab-hash" class="flex-1 py-3 text-center font-semibold border-b-2 border-transparent text-gray-500 hover:text-primary transition">
                        <i class="fas fa-key mr-2"></i>해시키
                    </button>
                </div>

                <!-- Password Login Form -->
                <form id="password-login-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                        <div class="relative">
                            <i class="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
                            <input type="email" id="password-email" required
                                   class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                   placeholder="your@email.com">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                        <div class="relative">
                            <i class="fas fa-lock absolute left-3 top-3.5 text-gray-400"></i>
                            <input type="password" id="password-input" required
                                   class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                   placeholder="비밀번호">
                        </div>
                    </div>
                    
                    <button type="submit" id="password-login-btn"
                            class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                        <i class="fas fa-sign-in-alt mr-2"></i>로그인
                    </button>
                </form>

                <!-- Magic Link Login Form -->
                <div id="magic-login-form" class="space-y-6 hidden">
                    <!-- Email Input Step -->
                    <div id="magic-email-step">
                        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                            <p class="text-sm text-blue-700">
                                <i class="fas fa-info-circle mr-2"></i>
                                비밀번호 없이 이메일만으로 간편하게 로그인하세요
                            </p>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">이메일 주소</label>
                                <div class="relative">
                                    <i class="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
                                    <input type="email" id="magic-email" required
                                           class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                           placeholder="your@email.com">
                                </div>
                            </div>
                            
                            <button type="button" id="send-magic-link-btn"
                                    class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                                <i class="fas fa-paper-plane mr-2"></i>로그인 코드 받기
                            </button>
                        </div>
                    </div>

                    <!-- Code Verification Step -->
                    <div id="magic-code-step" class="hidden fade-in">
                        <div class="text-center mb-6">
                            <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <i class="fas fa-envelope text-green-600 text-2xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">이메일을 확인하세요</h3>
                            <p class="text-sm text-gray-600">
                                <span id="sent-email" class="font-semibold"></span>로<br/>
                                6자리 인증 코드를 발송했습니다
                            </p>
                        </div>
                        
                        <div class="flex gap-2 justify-center mb-6">
                            <input type="text" maxlength="1" class="code-input" data-index="0" />
                            <input type="text" maxlength="1" class="code-input" data-index="1" />
                            <input type="text" maxlength="1" class="code-input" data-index="2" />
                            <input type="text" maxlength="1" class="code-input" data-index="3" />
                            <input type="text" maxlength="1" class="code-input" data-index="4" />
                            <input type="text" maxlength="1" class="code-input" data-index="5" />
                        </div>
                        
                        <div class="text-center mb-6">
                            <p class="text-sm text-gray-600">
                                ⏱ <span id="countdown" class="font-semibold text-primary">5:00</span> 남음
                            </p>
                        </div>
                        
                        <button type="button" id="verify-code-btn"
                                class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition mb-3">
                            <i class="fas fa-check mr-2"></i>확인
                        </button>
                        
                        <button type="button" id="resend-code-btn"
                                class="w-full text-primary py-2 text-sm hover:underline">
                            코드가 오지 않나요? <span class="font-semibold">다시 받기</span>
                        </button>
                        
                        <button type="button" id="back-to-email-btn"
                                class="w-full text-gray-600 py-2 text-sm hover:underline mt-2">
                            <i class="fas fa-arrow-left mr-1"></i>이메일 변경
                        </button>
                    </div>
                </div>

                <!-- Hash Key Login Form -->
                <form id="hash-login-form" class="space-y-6 hidden">
                    <div class="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
                        <p class="text-sm text-purple-700">
                            <i class="fas fa-info-circle mr-2"></i>
                            회원가입 시 발급받은 블록체인 해시키로 로그인하세요
                        </p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">블록체인 해시키</label>
                        <div class="relative">
                            <i class="fas fa-key absolute left-3 top-3.5 text-gray-400"></i>
                            <input type="text" id="hash-key" required
                                   class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                                   placeholder="0x1a2b3c4d5e6f7890...">
                        </div>
                    </div>
                    
                    <button type="submit" id="hash-login-btn"
                            class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition">
                        <i class="fas fa-key mr-2"></i>해시키로 로그인
                    </button>
                </form>

                <!-- Divider -->
                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600">
                        계정이 없으신가요? 
                        <a href="/signup" class="text-primary font-semibold hover:underline">회원가입</a>
                    </p>
                </div>
            </div>

            <!-- Error Message -->
            <div id="error-message" class="hidden mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg fade-in">
                <p class="text-sm text-red-700">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span id="error-text"></span>
                </p>
            </div>

            <!-- Success Message -->
            <div id="success-message" class="hidden mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg fade-in">
                <p class="text-sm text-green-700">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span id="success-text"></span>
                </p>
            </div>
        </div>

        <script>
          // Tab switching
          const tabs = {
            password: document.getElementById('tab-password'),
            magic: document.getElementById('tab-magic'),
            hash: document.getElementById('tab-hash')
          };
          
          const forms = {
            password: document.getElementById('password-login-form'),
            magic: document.getElementById('magic-login-form'),
            hash: document.getElementById('hash-login-form')
          };
          
          function switchTab(activeTab) {
            // Update tab styles
            Object.values(tabs).forEach(tab => {
              tab.classList.remove('border-primary', 'text-primary');
              tab.classList.add('border-transparent', 'text-gray-500');
            });
            tabs[activeTab].classList.remove('border-transparent', 'text-gray-500');
            tabs[activeTab].classList.add('border-primary', 'text-primary');
            
            // Show active form
            Object.values(forms).forEach(form => form.classList.add('hidden'));
            forms[activeTab].classList.remove('hidden');
            
            // Reset magic link steps
            if (activeTab !== 'magic') {
              document.getElementById('magic-email-step').classList.remove('hidden');
              document.getElementById('magic-code-step').classList.add('hidden');
            }
          }
          
          tabs.password.addEventListener('click', () => switchTab('password'));
          tabs.magic.addEventListener('click', () => switchTab('magic'));
          tabs.hash.addEventListener('click', () => switchTab('hash'));

          // Helper functions
          function showError(message) {
            const errorDiv = document.getElementById('error-message');
            document.getElementById('error-text').textContent = message;
            errorDiv.classList.remove('hidden');
            setTimeout(() => errorDiv.classList.add('hidden'), 5000);
          }
          
          function showSuccess(message) {
            const successDiv = document.getElementById('success-message');
            document.getElementById('success-text').textContent = message;
            successDiv.classList.remove('hidden');
            setTimeout(() => successDiv.classList.add('hidden'), 3000);
          }
          
          function setLoading(button, loading) {
            if (loading) {
              button.disabled = true;
              button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>처리 중...';
            } else {
              button.disabled = false;
            }
          }

          // Password login
          document.getElementById('password-login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('password-login-btn');
            const email = document.getElementById('password-email').value;
            const password = document.getElementById('password-input').value;
            
            setLoading(btn, true);
            
            try {
              const response = await axios.post('/api/auth/login', { email, password });
              
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('user', JSON.stringify(response.data.user));
              
              showSuccess('로그인 성공! 이동 중...');
              setTimeout(() => window.location.href = '/dashboard', 1000);
            } catch (error) {
              showError(error.response?.data?.error || '로그인에 실패했습니다.');
              btn.disabled = false;
              btn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>로그인';
            }
          });

          // Hash key login
          document.getElementById('hash-login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('hash-login-btn');
            const hashKey = document.getElementById('hash-key').value;
            
            setLoading(btn, true);
            
            try {
              const response = await axios.post('/api/auth/login-hash', { hash_key: hashKey });
              
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('user', JSON.stringify(response.data.user));
              
              showSuccess('해시키 인증 성공! 이동 중...');
              setTimeout(() => window.location.href = '/dashboard', 1000);
            } catch (error) {
              showError(error.response?.data?.error || '해시키 인증에 실패했습니다.');
              btn.disabled = false;
              btn.innerHTML = '<i class="fas fa-key mr-2"></i>해시키로 로그인';
            }
          });

          // Magic link - Send code
          let countdownInterval;
          let currentEmail = '';
          
          document.getElementById('send-magic-link-btn').addEventListener('click', async () => {
            const btn = document.getElementById('send-magic-link-btn');
            const email = document.getElementById('magic-email').value;
            
            if (!email) {
              showError('이메일을 입력해주세요.');
              return;
            }
            
            setLoading(btn, true);
            
            try {
              const response = await axios.post('/api/auth/send-magic-link', { email });
              
              currentEmail = email;
              document.getElementById('sent-email').textContent = email;
              
              // Switch to code input step
              document.getElementById('magic-email-step').classList.add('hidden');
              document.getElementById('magic-code-step').classList.remove('hidden');
              
              // Start countdown
              startCountdown(300); // 5 minutes
              
              showSuccess('인증 코드를 발송했습니다!');
            } catch (error) {
              showError(error.response?.data?.error || '코드 발송에 실패했습니다.');
              btn.disabled = false;
              btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>로그인 코드 받기';
            }
          });

          // Countdown timer
          function startCountdown(seconds) {
            if (countdownInterval) clearInterval(countdownInterval);
            
            let remaining = seconds;
            const countdownEl = document.getElementById('countdown');
            
            function update() {
              const minutes = Math.floor(remaining / 60);
              const secs = remaining % 60;
              countdownEl.textContent = \`\${minutes}:\${secs.toString().padStart(2, '0')}\`;
              
              if (remaining <= 0) {
                clearInterval(countdownInterval);
                countdownEl.textContent = '만료됨';
                showError('인증 코드가 만료되었습니다. 다시 받기를 클릭하세요.');
              }
              
              remaining--;
            }
            
            update();
            countdownInterval = setInterval(update, 1000);
          }

          // Code input handling
          const codeInputs = document.querySelectorAll('.code-input');
          
          codeInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
              if (e.target.value.length === 1) {
                if (index < codeInputs.length - 1) {
                  codeInputs[index + 1].focus();
                }
              }
            });
            
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Backspace' && !e.target.value && index > 0) {
                codeInputs[index - 1].focus();
              }
            });
            
            // Handle paste
            input.addEventListener('paste', (e) => {
              e.preventDefault();
              const pastedData = e.clipboardData.getData('text').replace(/\\s/g, '');
              
              if (/^\\d{6}$/.test(pastedData)) {
                pastedData.split('').forEach((digit, i) => {
                  if (codeInputs[i]) {
                    codeInputs[i].value = digit;
                  }
                });
                codeInputs[5].focus();
              }
            });
          });

          // Verify code
          document.getElementById('verify-code-btn').addEventListener('click', async () => {
            const btn = document.getElementById('verify-code-btn');
            const code = Array.from(codeInputs).map(input => input.value).join('');
            
            if (code.length !== 6) {
              showError('6자리 코드를 모두 입력해주세요.');
              return;
            }
            
            setLoading(btn, true);
            
            try {
              const response = await axios.post('/api/auth/verify-magic-code', {
                email: currentEmail,
                code: code
              });
              
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('user', JSON.stringify(response.data.user));
              
              showSuccess('인증 성공! 이동 중...');
              
              if (countdownInterval) clearInterval(countdownInterval);
              
              setTimeout(() => {
                const user = response.data.user;
                if (user.auth_level === 'basic') {
                  window.location.href = '/search';
                } else {
                  window.location.href = '/dashboard';
                }
              }, 1000);
            } catch (error) {
              const errorData = error.response?.data;
              if (errorData?.attemptsRemaining !== undefined) {
                showError(\`\${errorData.error} (\${errorData.attemptsRemaining}회 남음)\`);
              } else {
                showError(errorData?.error || '코드 검증에 실패했습니다.');
              }
              
              btn.disabled = false;
              btn.innerHTML = '<i class="fas fa-check mr-2"></i>확인';
              
              // Clear code inputs on error
              codeInputs.forEach(input => input.value = '');
              codeInputs[0].focus();
            }
          });

          // Resend code
          document.getElementById('resend-code-btn').addEventListener('click', async () => {
            const btn = document.getElementById('resend-code-btn');
            btn.disabled = true;
            
            try {
              await axios.post('/api/auth/send-magic-link', { email: currentEmail });
              
              codeInputs.forEach(input => input.value = '');
              codeInputs[0].focus();
              
              startCountdown(300);
              showSuccess('새 인증 코드를 발송했습니다!');
              
              setTimeout(() => btn.disabled = false, 60000); // 1분 후 재활성화
            } catch (error) {
              showError(error.response?.data?.error || '코드 재발송에 실패했습니다.');
              btn.disabled = false;
            }
          });

          // Back to email
          document.getElementById('back-to-email-btn').addEventListener('click', () => {
            if (countdownInterval) clearInterval(countdownInterval);
            
            document.getElementById('magic-code-step').classList.add('hidden');
            document.getElementById('magic-email-step').classList.remove('hidden');
            
            codeInputs.forEach(input => input.value = '');
          });

          // Auto-focus first input
          codeInputs[0].focus();
        </script>
    </body>
    </html>
  `)
})

export default login
