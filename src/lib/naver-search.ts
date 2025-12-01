/**
 * 네이버 검색 API Client
 * https://developers.naver.com/docs/serviceapi/search/blog/blog.md
 */

export interface SearchResult {
  total: number
  start: number
  display: number
  items: any[]
}

export class NaverSearchAPI {
  private clientId: string
  private clientSecret: string

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  /**
   * 블로그 검색
   */
  async searchBlog(query: string, display: number = 10, start: number = 1, sort: 'sim' | 'date' = 'sim'): Promise<SearchResult> {
    return await this.search('blog', query, display, start, sort)
  }

  /**
   * 뉴스 검색
   */
  async searchNews(query: string, display: number = 10, start: number = 1, sort: 'sim' | 'date' = 'date'): Promise<SearchResult> {
    return await this.search('news', query, display, start, sort)
  }

  /**
   * 웹 문서 검색
   */
  async searchWeb(query: string, display: number = 10, start: number = 1): Promise<SearchResult> {
    return await this.search('webkr', query, display, start)
  }

  /**
   * 이미지 검색
   */
  async searchImage(query: string, display: number = 10, start: number = 1, sort: 'sim' | 'date' = 'sim'): Promise<SearchResult> {
    return await this.search('image', query, display, start, sort)
  }

  /**
   * 백과사전 검색
   */
  async searchEncyclopedia(query: string, display: number = 10, start: number = 1): Promise<SearchResult> {
    return await this.search('encyc', query, display, start)
  }

  /**
   * 지식iN 검색
   */
  async searchKin(query: string, display: number = 10, start: number = 1, sort: 'sim' | 'date' | 'point' = 'sim'): Promise<SearchResult> {
    return await this.search('kin', query, display, start, sort)
  }

  /**
   * 공통 검색 메서드
   */
  private async search(
    type: string, 
    query: string, 
    display: number = 10, 
    start: number = 1,
    sort?: string
  ): Promise<SearchResult> {
    let url = `https://openapi.naver.com/v1/search/${type}?query=${encodeURIComponent(query)}&display=${display}&start=${start}`
    
    if (sort) {
      url += `&sort=${sort}`
    }

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': this.clientId,
        'X-Naver-Client-Secret': this.clientSecret,
      },
    })

    if (!response.ok) {
      throw new Error(`Naver Search API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * 선사 정보 검색
   */
  async searchShippingCompany(companyName: string) {
    const newsResults = await this.searchNews(`${companyName} 선사`, 5, 1, 'date')
    const webResults = await this.searchWeb(`${companyName} shipping company`, 5)
    
    return {
      company: companyName,
      news: newsResults.items,
      web: webResults.items,
    }
  }

  /**
   * 항구 정보 검색
   */
  async searchPort(portName: string) {
    const newsResults = await this.searchNews(`${portName} 항구`, 5, 1, 'date')
    const blogResults = await this.searchBlog(`${portName} port`, 5)
    const encycResults = await this.searchEncyclopedia(portName, 3)
    
    return {
      port: portName,
      news: newsResults.items,
      blog: blogResults.items,
      encyclopedia: encycResults.items,
    }
  }

  /**
   * 선박 관련 뉴스 검색
   */
  async searchMaritimeNews(keyword: string = '해운') {
    const results = await this.searchNews(keyword, 20, 1, 'date')
    
    return {
      keyword: keyword,
      totalResults: results.total,
      news: results.items.map((item: any) => ({
        title: this.removeHTMLTags(item.title),
        description: this.removeHTMLTags(item.description),
        link: item.link,
        pubDate: item.pubDate,
      }))
    }
  }

  /**
   * 컨테이너 운임 관련 정보 검색
   */
  async searchFreightRates() {
    const keywords = ['컨테이너 운임', '해운 운임', '운임 지수']
    const results = await Promise.all(
      keywords.map(keyword => this.searchNews(keyword, 10, 1, 'date'))
    )
    
    return {
      keywords: keywords,
      results: results.map((result, index) => ({
        keyword: keywords[index],
        total: result.total,
        news: result.items.slice(0, 5).map((item: any) => ({
          title: this.removeHTMLTags(item.title),
          description: this.removeHTMLTags(item.description),
          link: item.link,
          pubDate: item.pubDate,
        }))
      }))
    }
  }

  /**
   * HTML 태그 제거
   */
  private removeHTMLTags(text: string): string {
    return text
      .replace(/<b>/g, '')
      .replace(/<\/b>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  }
}

/**
 * 네이버 검색 API 인스턴스 생성 헬퍼
 */
export function createNaverSearchClient(env: any): NaverSearchAPI {
  if (!env.NAVER_SEARCH_CLIENT_ID || !env.NAVER_SEARCH_CLIENT_SECRET) {
    throw new Error('NAVER_SEARCH_CLIENT_ID 또는 NAVER_SEARCH_CLIENT_SECRET 환경 변수가 설정되지 않았습니다.')
  }
  return new NaverSearchAPI(env.NAVER_SEARCH_CLIENT_ID, env.NAVER_SEARCH_CLIENT_SECRET)
}

/**
 * 검색 타입 정의
 */
export const SEARCH_TYPES = {
  BLOG: 'blog',
  NEWS: 'news',
  WEB: 'webkr',
  IMAGE: 'image',
  ENCYC: 'encyc',
  KIN: 'kin',
  BOOK: 'book',
  CAFEARTICLE: 'cafearticle',
} as const

/**
 * 정렬 옵션
 */
export const SORT_OPTIONS = {
  SIMILARITY: 'sim', // 정확도순
  DATE: 'date', // 날짜순
  POINT: 'point', // 평점순 (지식iN)
} as const

/**
 * 해운 관련 키워드
 */
export const MARITIME_KEYWORDS = [
  '해운',
  '컨테이너',
  '선박',
  '항만',
  '물류',
  '수출입',
  '선사',
  '해상운송',
  '국제물류',
  'shipping',
  'container',
  'vessel',
  'port',
  'logistics',
] as const
