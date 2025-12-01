/**
 * 네이버 파파고 번역 API Client
 * https://developers.naver.com/docs/papago/papago-nmt-overview.md
 */

export interface TranslationResult {
  translatedText: string
  sourceLang: string
  targetLang: string
}

export class NaverPapagoAPI {
  private clientId: string
  private clientSecret: string

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  /**
   * 텍스트 번역
   */
  async translate(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const url = 'https://naveropenapi.apigw.ntruss.com/nmt/v1/translation'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': this.clientId,
        'X-NCP-APIGW-API-KEY': this.clientSecret,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        source: sourceLang,
        target: targetLang,
        text: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`Papago API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return {
      translatedText: data.message.result.translatedText,
      sourceLang: sourceLang,
      targetLang: targetLang,
    }
  }

  /**
   * 언어 감지
   */
  async detectLanguage(text: string): Promise<string> {
    const url = 'https://naveropenapi.apigw.ntruss.com/langs/v1/dect'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': this.clientId,
        'X-NCP-APIGW-API-KEY': this.clientSecret,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        query: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`Papago API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.langCode
  }

  /**
   * 다국어 자동 번역 (언어 자동 감지)
   */
  async autoTranslate(text: string, targetLang: string = 'en'): Promise<TranslationResult> {
    const sourceLang = await this.detectLanguage(text)
    
    if (sourceLang === targetLang) {
      return { 
        translatedText: text, 
        sourceLang, 
        targetLang 
      }
    }
    
    return await this.translate(text, sourceLang, targetLang)
  }

  /**
   * 다수 텍스트 일괄 번역
   */
  async translateBatch(texts: string[], sourceLang: string, targetLang: string): Promise<TranslationResult[]> {
    const results = await Promise.all(
      texts.map(text => this.translate(text, sourceLang, targetLang))
    )
    return results
  }

  /**
   * 선박 정보 번역 (특화)
   */
  async translateVesselInfo(vessel: {
    vessel_name?: string
    carrier_name?: string
    departure_port?: string
    arrival_port?: string
    description?: string
  }, targetLang: string = 'en') {
    const translations: any = {}

    if (vessel.vessel_name) {
      const result = await this.autoTranslate(vessel.vessel_name, targetLang)
      translations.vessel_name = result.translatedText
    }

    if (vessel.carrier_name) {
      const result = await this.autoTranslate(vessel.carrier_name, targetLang)
      translations.carrier_name = result.translatedText
    }

    if (vessel.departure_port) {
      const result = await this.autoTranslate(vessel.departure_port, targetLang)
      translations.departure_port = result.translatedText
    }

    if (vessel.arrival_port) {
      const result = await this.autoTranslate(vessel.arrival_port, targetLang)
      translations.arrival_port = result.translatedText
    }

    if (vessel.description) {
      const result = await this.autoTranslate(vessel.description, targetLang)
      translations.description = result.translatedText
    }

    return {
      original: vessel,
      translated: translations,
      targetLang: targetLang
    }
  }
}

/**
 * 파파고 API 인스턴스 생성 헬퍼
 */
export function createPapagoClient(env: any): NaverPapagoAPI {
  if (!env.NAVER_PAPAGO_CLIENT_ID || !env.NAVER_PAPAGO_CLIENT_SECRET) {
    throw new Error('NAVER_PAPAGO_CLIENT_ID 또는 NAVER_PAPAGO_CLIENT_SECRET 환경 변수가 설정되지 않았습니다.')
  }
  return new NaverPapagoAPI(env.NAVER_PAPAGO_CLIENT_ID, env.NAVER_PAPAGO_CLIENT_SECRET)
}

/**
 * 지원 언어 코드
 */
export const SUPPORTED_LANGUAGES = {
  KO: 'ko', // 한국어
  EN: 'en', // 영어
  JA: 'ja', // 일본어
  ZH_CN: 'zh-CN', // 중국어 간체
  ZH_TW: 'zh-TW', // 중국어 번체
  ES: 'es', // 스페인어
  FR: 'fr', // 프랑스어
  DE: 'de', // 독일어
  RU: 'ru', // 러시아어
  PT: 'pt', // 포르투갈어
  IT: 'it', // 이탈리아어
  VI: 'vi', // 베트남어
  TH: 'th', // 태국어
  ID: 'id', // 인도네시아어
  HI: 'hi', // 힌디어
  AR: 'ar', // 아랍어
} as const

/**
 * 언어 코드 → 한글 이름
 */
export const LANGUAGE_NAMES: Record<string, string> = {
  'ko': '한국어',
  'en': '영어',
  'ja': '일본어',
  'zh-CN': '중국어(간체)',
  'zh-TW': '중국어(번체)',
  'es': '스페인어',
  'fr': '프랑스어',
  'de': '독일어',
  'ru': '러시아어',
  'pt': '포르투갈어',
  'it': '이탈리아어',
  'vi': '베트남어',
  'th': '태국어',
  'id': '인도네시아어',
  'hi': '힌디어',
  'ar': '아랍어',
}

/**
 * 주요 번역 쌍
 */
export const COMMON_TRANSLATION_PAIRS = [
  { from: 'ko', to: 'en', name: '한국어 → 영어' },
  { from: 'en', to: 'ko', name: '영어 → 한국어' },
  { from: 'ko', to: 'ja', name: '한국어 → 일본어' },
  { from: 'ja', to: 'ko', name: '일본어 → 한국어' },
  { from: 'ko', to: 'zh-CN', name: '한국어 → 중국어' },
  { from: 'zh-CN', to: 'ko', name: '중국어 → 한국어' },
  { from: 'en', to: 'ja', name: '영어 → 일본어' },
  { from: 'en', to: 'zh-CN', name: '영어 → 중국어' },
] as const
