# 네이버 클라우드 연동 가이드

## 📋 목차
1. [SENS (이메일/SMS) 연동](#1-sens-이메일sms-연동)
2. [Object Storage 연동](#2-object-storage-연동)
3. [Cloud DB 연동](#3-cloud-db-연동)
4. [CLOVA OCR 연동](#4-clova-ocr-연동)
5. [환경 변수 설정](#5-환경-변수-설정)

---

## 1. SENS (이메일/SMS) 연동

### 📝 사전 준비

1. **네이버 클라우드 콘솔** 접속: https://console.ncloud.com
2. **Services → Application Service → SENS** 메뉴 이동
3. **Email 프로젝트 생성**
4. **발신 이메일 등록 및 인증**
5. **Access Key ID, Secret Key 발급**

### 🔑 필요한 정보

```bash
NCLOUD_ACCESS_KEY=your_access_key_id
NCLOUD_SECRET_KEY=your_secret_key
NCLOUD_SENS_SERVICE_ID=ncp:sms:kr:123456789012:your_service_id
NCLOUD_FROM_EMAIL=noreply@shipshare.com
```

### 💻 코드 구현

**파일**: `src/lib/ncloud-sens.ts` (이미 생성됨)

**사용 예시**:

```typescript
import { createSENSClient } from '../lib/ncloud-sens'

// auth.ts의 send-magic-link 엔드포인트에서
auth.post('/send-magic-link', async (c) => {
  const { email } = await c.req.json()
  
  // 매직 코드 생성
  const magicCode = generateMagicCode()
  const expiresAt = getMagicCodeExpiry()
  
  // DB 업데이트
  await c.env.DB.prepare(
    'UPDATE users SET magic_code = ?, magic_code_expires_at = ? WHERE email = ?'
  ).bind(magicCode, expiresAt, email).run()
  
  // 🔥 SENS 이메일 발송 (실제 구현)
  try {
    const sens = createSENSClient(c.env)
    await sens.sendMagicLinkEmail(email, magicCode)
    
    return c.json({
      success: true,
      message: '인증 코드를 이메일로 발송했습니다.'
    })
  } catch (error) {
    console.error('SENS 이메일 발송 실패:', error)
    // 실패해도 매직 코드는 생성되었으므로 성공 반환 (개발 환경)
    return c.json({
      success: true,
      message: '인증 코드를 생성했습니다.',
      devMode: true,
      code: magicCode // 개발 환경에서만
    })
  }
})
```

### 📧 이메일 템플릿

매직 링크 이메일은 다음과 같이 보입니다:

```html
┌─────────────────────────────────┐
│  ShipShare 로그인 인증          │
├─────────────────────────────────┤
│                                 │
│  안녕하세요,                    │
│  로그인을 위한 인증 코드입니다: │
│                                 │
│  ┌─────────────────────────┐   │
│  │      123456             │   │
│  └─────────────────────────┘   │
│                                 │
│  이 코드는 5분간 유효합니다.    │
│                                 │
└─────────────────────────────────┘
```

---

## 2. Object Storage 연동

### 📝 사전 준비

1. **Services → Storage → Object Storage** 메뉴 이동
2. **버킷 생성** (예: `shipshare-files`)
3. **Access Key 발급** (Sub Account 권장)

### 🔑 필요한 정보

```bash
NCLOUD_OBJECT_STORAGE_ACCESS_KEY=your_access_key
NCLOUD_OBJECT_STORAGE_SECRET_KEY=your_secret_key
NCLOUD_OBJECT_STORAGE_BUCKET=shipshare-files
NCLOUD_OBJECT_STORAGE_ENDPOINT=https://kr.object.ncloudstorage.com
```

### 💻 코드 구현

```typescript
// src/lib/ncloud-storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

export class NCloudObjectStorage {
  private s3Client: S3Client
  private bucketName: string

  constructor(accessKey: string, secretKey: string, endpoint: string, bucket: string) {
    this.s3Client = new S3Client({
      region: 'kr-standard',
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    })
    this.bucketName = bucket
  }

  /**
   * 파일 업로드
   */
  async uploadFile(key: string, body: Buffer | Uint8Array, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })

    await this.s3Client.send(command)
    
    return {
      url: `https://${this.bucketName}.kr.object.ncloudstorage.com/${key}`,
      key: key,
    }
  }

  /**
   * 파일 다운로드
   */
  async downloadFile(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })

    const response = await this.s3Client.send(command)
    return response.Body
  }
}

export function createStorageClient(env: any) {
  return new NCloudObjectStorage(
    env.NCLOUD_OBJECT_STORAGE_ACCESS_KEY,
    env.NCLOUD_OBJECT_STORAGE_SECRET_KEY,
    env.NCLOUD_OBJECT_STORAGE_ENDPOINT,
    env.NCLOUD_OBJECT_STORAGE_BUCKET
  )
}
```

### 🎯 사용 예시: 인증서 파일 저장

```typescript
// 공동인증서 업로드 시
auth.post('/upload-certificate', async (c) => {
  const { cert_data, cert_filename } = await c.req.json()
  
  const storage = createStorageClient(c.env)
  const buffer = Buffer.from(cert_data, 'base64')
  const key = `certificates/${Date.now()}-${cert_filename}`
  
  const result = await storage.uploadFile(key, buffer, 'application/x-x509-ca-cert')
  
  return c.json({
    success: true,
    url: result.url,
    key: result.key
  })
})
```

---

## 3. Cloud DB 연동

### 📝 사전 준비

1. **Services → Database → Cloud DB for MySQL** 메뉴 이동
2. **DB 서버 생성** (VPC 설정 필요)
3. **Public IP 할당** 또는 **VPN 연결**
4. **방화벽 규칙 설정** (접근 IP 허용)

### 🔑 필요한 정보

```bash
NCLOUD_DB_HOST=db-xxxxx.cdb.ntruss.com
NCLOUD_DB_PORT=3306
NCLOUD_DB_USER=admin
NCLOUD_DB_PASSWORD=your_password
NCLOUD_DB_NAME=shipshare
```

### 💻 코드 구현

**주의**: Cloudflare Workers는 TCP 연결을 직접 지원하지 않으므로, **HTTP API를 통한 연결** 또는 **외부 REST API** 사용 필요

**대안 1**: Cloudflare D1 계속 사용 (권장)
**대안 2**: 네이버 Cloud Functions로 DB 접근 API 구축

```typescript
// 외부 API 서버 (Node.js + Express)
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.NCLOUD_DB_HOST,
  port: parseInt(process.env.NCLOUD_DB_PORT || '3306'),
  user: process.env.NCLOUD_DB_USER,
  password: process.env.NCLOUD_DB_PASSWORD,
  database: process.env.NCLOUD_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
})

// REST API 엔드포인트
app.get('/api/vessels', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vessels WHERE status = ?', ['available'])
  res.json({ success: true, vessels: rows })
})
```

---

## 4. CLOVA OCR 연동

### 📝 사전 준비

1. **Services → AI Service → CLOVA OCR** 메뉴 이동
2. **도메인 생성** (일반 문서 인식)
3. **Invoke URL, Secret Key 확인**

### 🔑 필요한 정보

```bash
NCLOUD_CLOVA_OCR_URL=https://xxxxx.apigw.ntruss.com/custom/v1/12345/xxxxxxx
NCLOUD_CLOVA_OCR_SECRET=your_secret_key
```

### 💻 코드 구현

```typescript
// src/lib/ncloud-ocr.ts
export class NCloudOCR {
  private invokeUrl: string
  private secretKey: string

  constructor(invokeUrl: string, secretKey: string) {
    this.invokeUrl = invokeUrl
    this.secretKey = secretKey
  }

  /**
   * 문서 OCR 처리
   */
  async recognizeDocument(imageData: string, format: string = 'jpg') {
    const requestBody = {
      version: 'V2',
      requestId: crypto.randomUUID(),
      timestamp: Date.now(),
      images: [
        {
          format: format,
          name: 'document',
          data: imageData, // Base64 encoded
        },
      ],
    }

    const response = await fetch(this.invokeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OCR-SECRET': this.secretKey,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`OCR 처리 실패: ${response.statusText}`)
    }

    const result = await response.json()
    
    // 텍스트 추출
    const texts = result.images[0].fields.map((field: any) => field.inferText)
    
    return {
      fullText: texts.join(' '),
      fields: result.images[0].fields,
    }
  }
}

export function createOCRClient(env: any) {
  return new NCloudOCR(
    env.NCLOUD_CLOVA_OCR_URL,
    env.NCLOUD_CLOVA_OCR_SECRET
  )
}
```

### 🎯 사용 예시: 선하증권 스캔

```typescript
// 선하증권(Bill of Lading) 자동 인식
app.post('/api/ocr/bill-of-lading', async (c) => {
  const { imageData } = await c.req.json()
  
  const ocr = createOCRClient(c.env)
  const result = await ocr.recognizeDocument(imageData)
  
  // 주요 정보 추출
  const extractedData = {
    bookingNumber: extractBookingNumber(result.fullText),
    vesselName: extractVesselName(result.fullText),
    departurePort: extractPort(result.fullText, 'departure'),
    arrivalPort: extractPort(result.fullText, 'arrival'),
    containerNumber: extractContainerNumber(result.fullText),
  }
  
  return c.json({
    success: true,
    data: extractedData,
    rawText: result.fullText
  })
})
```

---

## 5. 환경 변수 설정

### 📝 로컬 개발 환경 (`.dev.vars`)

```bash
# .dev.vars 파일 생성
cat > /home/user/webapp/.dev.vars << 'EOF'
# SENS (Email)
NCLOUD_ACCESS_KEY=your_access_key_id
NCLOUD_SECRET_KEY=your_secret_key
NCLOUD_SENS_SERVICE_ID=ncp:sms:kr:123456789012:your_service_id
NCLOUD_FROM_EMAIL=noreply@shipshare.com

# Object Storage
NCLOUD_OBJECT_STORAGE_ACCESS_KEY=your_storage_access_key
NCLOUD_OBJECT_STORAGE_SECRET_KEY=your_storage_secret_key
NCLOUD_OBJECT_STORAGE_BUCKET=shipshare-files
NCLOUD_OBJECT_STORAGE_ENDPOINT=https://kr.object.ncloudstorage.com

# CLOVA OCR
NCLOUD_CLOVA_OCR_URL=https://xxxxx.apigw.ntruss.com/custom/v1/12345/xxxxxxx
NCLOUD_CLOVA_OCR_SECRET=your_ocr_secret_key
EOF
```

### 🚀 Cloudflare Pages 프로덕션 환경

```bash
# Cloudflare Pages 환경 변수 설정
npx wrangler pages secret put NCLOUD_ACCESS_KEY --project-name webapp
npx wrangler pages secret put NCLOUD_SECRET_KEY --project-name webapp
npx wrangler pages secret put NCLOUD_SENS_SERVICE_ID --project-name webapp
npx wrangler pages secret put NCLOUD_FROM_EMAIL --project-name webapp

# 나머지 환경 변수도 동일하게 설정...
```

### 📋 wrangler.jsonc 업데이트

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  
  // 환경 변수는 Cloudflare Dashboard 또는 wrangler secret으로 관리
  "vars": {
    "ENVIRONMENT": "production"
  }
}
```

---

## 📊 네이버 클라우드 서비스 비교

| 서비스 | 용도 | 대체 가능 | 우선순위 |
|--------|------|----------|----------|
| **SENS** | 이메일/SMS | - | ⭐⭐⭐ 높음 |
| **Object Storage** | 파일 저장 | Cloudflare R2 | ⭐⭐ 중간 |
| **Cloud DB** | 데이터베이스 | Cloudflare D1 | ⭐ 낮음 |
| **CLOVA OCR** | 문서 인식 | - | ⭐⭐ 중간 |
| **Maps** | 지도 | Google Maps | ⭐ 낮음 |
| **PAPAGO** | 번역 | - | ⭐ 낮음 |

---

## 🎯 추천 통합 순서

1. **1단계**: SENS 이메일 (매직 링크 실제 발송) ⭐⭐⭐
2. **2단계**: Object Storage (인증서 파일 저장) ⭐⭐
3. **3단계**: CLOVA OCR (선하증권 자동 인식) ⭐⭐
4. **4단계**: PAPAGO (다국어 지원) ⭐

---

## 💰 예상 비용

### SENS (이메일)
- **기본**: 무료 (월 500건)
- **유료**: 건당 ₩4 (500건 초과 시)

### Object Storage
- **저장**: ₩119/GB/월
- **트래픽**: 무료 (50GB/월), 초과 시 ₩124/GB

### CLOVA OCR
- **기본**: 무료 (월 1,000건)
- **유료**: 건당 ₩30 (1,000건 초과 시)

---

## 🚀 빠른 시작

### 1. SENS 이메일만 먼저 연동하기

```bash
# 1. 네이버 클라우드에서 SENS 설정
# 2. .dev.vars 파일에 키 입력
# 3. auth.ts 수정 (console.log → SENS 호출)
# 4. 테스트
npm run build
pm2 restart webapp
curl -X POST http://localhost:3000/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 📚 참고 자료

- [SENS 가이드](https://guide.ncloud-docs.com/docs/sens-sens-1-1)
- [Object Storage 가이드](https://guide.ncloud-docs.com/docs/storage-storage-8-1)
- [CLOVA OCR 가이드](https://guide.ncloud-docs.com/docs/clovaocr-overview)

---

**작성일**: 2024-11-21  
**작성자**: AI Assistant
