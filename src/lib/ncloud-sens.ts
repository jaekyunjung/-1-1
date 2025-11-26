import crypto from 'crypto'

interface SendEmailParams {
  to: string
  subject: string
  body: string
}

export class NCloudSENS {
  private accessKey: string
  private secretKey: string
  private serviceId: string
  private fromEmail: string

  constructor(accessKey: string, secretKey: string, serviceId: string, fromEmail: string) {
    this.accessKey = accessKey
    this.secretKey = secretKey
    this.serviceId = serviceId
    this.fromEmail = fromEmail
  }

  /**
   * SENS 이메일 발송
   */
  async sendEmail({ to, subject, body }: SendEmailParams) {
    const timestamp = Date.now().toString()
    const url = `/emails/v1/services/${this.serviceId}/mails`
    const signature = this.makeSignature('POST', url, timestamp)

    const response = await fetch(`https://mail.apigw.ntruss.com${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': this.accessKey,
        'x-ncp-apigw-signature-v2': signature,
      },
      body: JSON.stringify({
        senderAddress: this.fromEmail,
        title: subject,
        body: body,
        recipients: [
          {
            address: to,
            name: to.split('@')[0],
            type: 'R', // R: 수신자, C: 참조, B: 숨은참조
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`SENS 이메일 발송 실패: ${error}`)
    }

    return await response.json()
  }

  /**
   * 매직 링크 이메일 발송
   */
  async sendMagicLinkEmail(to: string, magicCode: string) {
    const subject = '[ShipShare] 로그인 인증 코드'
    const body = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #667eea;">ShipShare 로그인 인증</h2>
          <p>안녕하세요,</p>
          <p>로그인을 위한 인증 코드입니다:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${magicCode}
          </div>
          <p>이 코드는 <strong>5분간 유효</strong>합니다.</p>
          <p>본인이 요청한 것이 아니라면 이 이메일을 무시해주세요.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            © 2024 ShipShare. All rights reserved.
          </p>
        </body>
      </html>
    `

    return await this.sendEmail({ to, subject, body })
  }

  /**
   * SENS API 서명 생성
   */
  private makeSignature(method: string, url: string, timestamp: string): string {
    const space = ' '
    const newLine = '\n'

    const message = [
      method,
      space,
      url,
      newLine,
      timestamp,
      newLine,
      this.accessKey,
    ].join('')

    const hmac = crypto.createHmac('sha256', this.secretKey)
    const signature = hmac.update(message).digest('base64')

    return signature
  }
}

/**
 * SENS 인스턴스 생성 헬퍼
 */
export function createSENSClient(env: any) {
  return new NCloudSENS(
    env.NCLOUD_ACCESS_KEY,
    env.NCLOUD_SECRET_KEY,
    env.NCLOUD_SENS_SERVICE_ID,
    env.NCLOUD_FROM_EMAIL
  )
}
