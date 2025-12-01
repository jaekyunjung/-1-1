import { Hono } from 'hono'
import { createNaverSearchClient } from '../lib/naver-search'

type Bindings = {
  DB: D1Database
  NAVER_SEARCH_CLIENT_ID: string
  NAVER_SEARCH_CLIENT_SECRET: string
}

const search = new Hono<{ Bindings: Bindings }>()

/**
 * 해운 뉴스 검색
 */
search.get('/maritime-news', async (c) => {
  try {
    const keyword = c.req.query('keyword') || '해운'
    const display = parseInt(c.req.query('display') || '10')
    
    const searchClient = createNaverSearchClient(c.env)
    const result = await searchClient.searchMaritimeNews(keyword)
    
    return c.json({
      success: true,
      keyword: keyword,
      total: result.totalResults,
      news: result.news
    })
  } catch (error) {
    console.error('Maritime news search error:', error)
    return c.json({ 
      success: false, 
      error: '뉴스 검색 중 오류가 발생했습니다.' 
    }, 500)
  }
})

/**
 * 컨테이너 운임 관련 뉴스
 */
search.get('/freight-rates', async (c) => {
  try {
    const searchClient = createNaverSearchClient(c.env)
    const result = await searchClient.searchFreightRates()
    
    return c.json({
      success: true,
      results: result.results
    })
  } catch (error) {
    console.error('Freight rates search error:', error)
    return c.json({ 
      success: false, 
      error: '운임 정보 검색 중 오류가 발생했습니다.' 
    }, 500)
  }
})

/**
 * 선사 정보 검색
 */
search.get('/shipping-company/:companyName', async (c) => {
  try {
    const companyName = c.req.param('companyName')
    
    const searchClient = createNaverSearchClient(c.env)
    const result = await searchClient.searchShippingCompany(companyName)
    
    return c.json({
      success: true,
      company: result.company,
      news: result.news,
      web: result.web
    })
  } catch (error) {
    console.error('Shipping company search error:', error)
    return c.json({ 
      success: false, 
      error: '선사 정보 검색 중 오류가 발생했습니다.' 
    }, 500)
  }
})

/**
 * 항구 정보 검색
 */
search.get('/port/:portName', async (c) => {
  try {
    const portName = c.req.param('portName')
    
    const searchClient = createNaverSearchClient(c.env)
    const result = await searchClient.searchPort(portName)
    
    return c.json({
      success: true,
      port: result.port,
      news: result.news,
      blog: result.blog,
      encyclopedia: result.encyclopedia
    })
  } catch (error) {
    console.error('Port search error:', error)
    return c.json({ 
      success: false, 
      error: '항구 정보 검색 중 오류가 발생했습니다.' 
    }, 500)
  }
})

/**
 * 통합 검색 (뉴스, 블로그, 웹)
 */
search.get('/all/:query', async (c) => {
  try {
    const query = c.req.param('query')
    const display = parseInt(c.req.query('display') || '5')
    
    const searchClient = createNaverSearchClient(c.env)
    
    const [news, blog, web] = await Promise.all([
      searchClient.searchNews(query, display),
      searchClient.searchBlog(query, display),
      searchClient.searchWeb(query, display)
    ])
    
    return c.json({
      success: true,
      query: query,
      results: {
        news: {
          total: news.total,
          items: news.items
        },
        blog: {
          total: blog.total,
          items: blog.items
        },
        web: {
          total: web.total,
          items: web.items
        }
      }
    })
  } catch (error) {
    console.error('All search error:', error)
    return c.json({ 
      success: false, 
      error: '통합 검색 중 오류가 발생했습니다.' 
    }, 500)
  }
})

export default search
