// 매직 링크 인증 유틸리티

/**
 * 6자리 숫자 매직 코드 생성
 */
export function generateMagicCode(): string {
  // crypto.randomInt를 사용하여 안전한 난수 생성 (100000 ~ 999999)
  const code = Math.floor(Math.random() * 900000) + 100000
  return code.toString()
}

/**
 * 매직 코드 만료 시간 계산 (5분)
 */
export function getMagicCodeExpiry(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5)
  return now.toISOString()
}

/**
 * 매직 코드가 만료되었는지 확인
 */
export function isMagicCodeExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

/**
 * 재전송 제한 확인 (1분)
 */
export function canResendMagicCode(lastSentAt: string | null): boolean {
  if (!lastSentAt) return true
  
  const lastSent = new Date(lastSentAt)
  const now = new Date()
  const diffMs = now.getTime() - lastSent.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  
  return diffSeconds >= 60 // 60초(1분) 이상 경과
}

/**
 * 차단 시간 계산 (10분)
 */
export function getBlockedUntil(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 10)
  return now.toISOString()
}

/**
 * 차단 상태 확인
 */
export function isBlocked(blockedUntil: string | null): boolean {
  if (!blockedUntil) return false
  return new Date(blockedUntil) > new Date()
}

/**
 * 매직 코드 검증 (공백 제거, 6자리 숫자 확인)
 */
export function validateMagicCode(code: string): boolean {
  const cleaned = code.replace(/\s/g, '')
  return /^\d{6}$/.test(cleaned)
}

/**
 * 간단한 이메일 템플릿 (HTML)
 */
export function getMagicLinkEmailHTML(code: string, email: string): string {
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify?code=${code}&email=${encodeURIComponent(email)}`
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShipShare 로그인 코드</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .code {
      font-size: 48px;
      font-weight: bold;
      letter-spacing: 8px;
      background: white;
      color: #667eea;
      padding: 20px 40px;
      border-radius: 12px;
      margin: 30px 0;
      display: inline-block;
    }
    .button {
      display: inline-block;
      background: white;
      color: #667eea;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: bold;
      margin-top: 20px;
    }
    .footer {
      margin-top: 30px;
      font-size: 14px;
      opacity: 0.9;
    }
    .warning {
      background: rgba(255, 255, 255, 0.2);
      padding: 15px;
      border-radius: 8px;
      margin-top: 30px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🚢 ShipShare</div>
    <h1>로그인 코드</h1>
    <p>아래 코드를 입력하여 로그인하세요</p>
    
    <div class="code">${code}</div>
    
    <p style="font-size: 14px; opacity: 0.9;">⏱ 5분간 유효합니다</p>
    
    <p style="margin-top: 30px;">또는 아래 버튼을 클릭하세요</p>
    <a href="${verifyUrl}" class="button">로그인하기</a>
    
    <div class="warning">
      ⚠️ 본인이 요청하지 않았다면 이 이메일을 무시하세요
    </div>
    
    <div class="footer">
      <p>ShipShare - AI & 블록체인 기반 스마트 선적권 거래 플랫폼</p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * 텍스트 이메일 템플릿
 */
export function getMagicLinkEmailText(code: string, email: string): string {
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify?code=${code}&email=${encodeURIComponent(email)}`
  
  return `
ShipShare 로그인 코드

아래 코드를 입력하여 로그인하세요:

${code}

(5분간 유효)

또는 아래 링크를 클릭하세요:
${verifyUrl}

본인이 요청하지 않았다면 이 이메일을 무시하세요.

ShipShare - AI & 블록체인 기반 스마트 선적권 거래 플랫폼
  `
}
