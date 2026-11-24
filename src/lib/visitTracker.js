// src/lib/visitTracker.js
// 익명 방문자(비로그인 포함) 1일 1회 고유 집계 + 유입 경로 자동 분류 트래커

import { supabase } from './supabase'
import { getCurrentTempleId } from './templeConfig'
import { getTodayKey } from './meritSystem'

const VISITOR_ID_KEY = 'sowonpray_anon_visitor_id_v1'

export const SOURCE_LABELS = {
  naver_blog: '네이버 블로그',
  naver_clip: '네이버 클립',
  naver_search: '네이버 검색',
  threads: '스레드(Threads)',
  instagram: '인스타그램',
  youtube: '유튜브',
  kakao: '카카오톡',
  danggeun: '당근',
  google: '구글 검색',
  direct: '직접 접속 · 공유링크',
  other: '기타 외부유입',
}

function getOrCreateVisitorId() {
  try {
    let vid = localStorage.getItem(VISITOR_ID_KEY)
    if (!vid || vid.length < 8) {
      vid = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(VISITOR_ID_KEY, vid)
    }
    return vid
  } catch {
    return `v_mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  }
}

export function detectTrafficSource() {
  try {
    const params = new URLSearchParams(window.location.search)
    const rawParam = (params.get('src') || params.get('utm_source') || '').trim().toLowerCase()
    if (rawParam) {
      if (rawParam.includes('blog')) return 'naver_blog'
      if (rawParam.includes('clip')) return 'naver_clip'
      if (rawParam.includes('naver')) return 'naver_search'
      if (rawParam.includes('thread')) return 'threads'
      if (rawParam.includes('insta')) return 'instagram'
      if (rawParam.includes('youtu') || rawParam === 'yt') return 'youtube'
      if (rawParam.includes('kakao')) return 'kakao'
      if (rawParam.includes('danggeun') || rawParam.includes('karrot')) return 'danggeun'
      return rawParam.slice(0, 30)
    }

    const ref = (document.referrer || '').toLowerCase()
    const ua = (navigator.userAgent || '').toLowerCase()

    if (ref.includes('blog.naver.com') || ref.includes('m.blog.naver.com')) {
      return ref.includes('/clip/') ? 'naver_clip' : 'naver_blog'
    }
    if (ref.includes('clip.naver.com')) return 'naver_clip'
    if (ref.includes('naver.com')) return 'naver_search'
    if (ref.includes('threads.net') || ref.includes('threads.com')) return 'threads'
    if (ref.includes('instagram.com') || ua.includes('instagram')) return 'instagram'
    if (ref.includes('youtube.com') || ref.includes('youtu.be')) return 'youtube'
    if (ref.includes('kakao') || ua.includes('kakaotalk')) return 'kakao'
    if (ref.includes('daangn.com') || ref.includes('karrot')) return 'danggeun'
    if (ref.includes('google.')) return 'google'
    if (!ref || ref.includes(window.location.hostname.toLowerCase())) return 'direct'
    return 'other'
  } catch {
    return 'direct'
  }
}

export async function recordAnonymousVisit() {
  if (!supabase) return
  try {
    const todayKey = getTodayKey()
    const sentKey = `sowonpray_visit_logged_${todayKey}`
    if (localStorage.getItem(sentKey) === '1') return

    const visitorId = getOrCreateVisitorId()
    const source = detectTrafficSource()
    const referrer = (document.referrer || '').slice(0, 300)
    const landingPath = (window.location.pathname + window.location.search).slice(0, 200)
    const templeId = getCurrentTempleId()

    const { error } = await supabase.rpc('record_site_visit', {
      p_visitor_id: visitorId,
      p_source: source,
      p_referrer: referrer,
      p_landing_path: landingPath,
      p_temple_id: templeId,
    })

    if (!error) {
      localStorage.setItem(sentKey, '1')
    }
  } catch {
    // 방문 집계 실패는 사용자 화면에 영향을 주지 않도록 조용히 무시
  }
}

export async function fetchSiteVisitStats() {
  if (!supabase) return null
  try {
    const templeId = getCurrentTempleId()
    const { data, error } = await supabase.rpc('get_site_visit_stats', {
      p_temple_id: templeId,
    })
    if (error || !data) return null
    return {
      todayCount: Number(data.today_count) || 0,
      weekCount: Number(data.week_count) || 0,
      totalCount: Number(data.total_count) || 0,
      topSources: Array.isArray(data.top_sources) ? data.top_sources : [],
    }
  } catch {
    return null
  }
}
