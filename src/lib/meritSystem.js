// src/lib/meritSystem.js
// 제주 소원사 공덕 포인트 시스템 공식 5대 신행 규격
// 규정:
// 1. 소원등 켜기: 1회 점등 시 1,000 공덕 (한도 1일 1,000)
// 2. 대웅전 참배: 들어갔다 나오면 1,000 공덕 (한도 1일 1,000)
// 3. 한줄 사경: 1회 사경 시 1,000 공덕 (한도 1일 1,000)
// 4. 인연 전달 한 사람: 상대방이 소원등 켰을 경우 5,000 공덕 (한도 1일 50,000)
// 5. (신규) 인연 받은 사람: 상대방이 소원등 켰을 경우 5,000 공덕 (1일 5,000)

import { supabase } from './supabase'
import { getCurrentTempleId } from './templeConfig'

export const MERIT_RULES = {
  LANTERN: {
    key: 'lantern',
    name: '소원등 점등',
    shortName: '소원등 켜기',
    icon: '🪔',
    pointsPerUnit: 1000,
    dailyMax: 1000, // 1일 1회 한정 (최대 1,000 공덕)
    unitName: '회',
    desc: '1회 점등 시 1,000 공덕 (1일 최대 1,000 공덕)',
  },
  SANCTUARY: {
    key: 'sanctuary',
    name: '대웅전 참배',
    shortName: '대웅전 참배',
    icon: '🏛️',
    pointsPerUnit: 1000,
    dailyMax: 1000, // 1일 1회 한정 (최대 1,000 공덕)
    unitName: '회',
    desc: '들어갔다 나오면 1,000 공덕 (1일 최대 1,000 공덕)',
  },
  SUTRA: {
    key: 'sutra',
    name: '한줄사경 정진',
    shortName: '한줄 사경',
    icon: '✍️',
    pointsPerUnit: 1000,
    dailyMax: 1000, // 1회 사경 시 1,000 공덕 (1일 최대 1,000 공덕)
    unitName: '회',
    desc: '1회 사경 시 1,000 공덕 (1일 최대 1,000 공덕)',
  },
  INYEON_GIVER: {
    key: 'inyeon_giver',
    name: '인연 전달 한 사람',
    shortName: '인연 전달',
    icon: '🤝',
    pointsPerUnit: 5000,
    dailyMax: 50000, // 상대방이 소원등 켰을 경우 5,000 (한도 1일 50,000 = 최대 10회)
    unitName: '회',
    desc: '상대방이 소원등 켰을 경우 5,000 공덕 (한도 1일 50,000)',
  },
  INYEON_RECEIVER: {
    key: 'inyeon_receiver',
    name: '신규회원공덕',
    shortName: '신규회원공덕',
    icon: '🌸',
    pointsPerUnit: 5000,
    dailyMax: 5000, // 신규 가입 후 점등 시 5,000 공덕
    unitName: '회',
    desc: '신규 가입 후 점등 시 5,000 공덕',
  },
}

export const getTodayKey = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 특정 활동의 오늘 적립 현황 조회 (클라우드 DB 동기화 지원)
 */
export const getDailyMeritInfo = (activityKey, userCode = 'guest', cloudPoints = null) => {
  const rule = Object.values(MERIT_RULES).find((r) => r.key === activityKey)
  if (!rule) {
    return {
      key: activityKey,
      points: 0,
      count: 0,
      remainingPoints: 0,
      dailyMax: 0,
      isMax: false,
    }
  }

  const today = getTodayKey()
  const storageKey = `sowon_daily_merit_${activityKey}_${userCode || 'guest'}_${today}`
  
  // 🌟 클라우드 DB 우선 원칙 (Single Source of Truth) + 로컬 즉시성 안전 병합
  let currentPoints = 0
  let localPoints = 0
  try {
    const val = localStorage.getItem(storageKey)
    if (val) localPoints = parseInt(val, 10) || 0
  } catch (e) {}

  if (cloudPoints !== null && cloudPoints !== undefined) {
    // 장부(서버) 값이 주어지면 그 값만 신뢰 (기기별 localStorage 값과 섞지 않음)
    currentPoints = Number(cloudPoints) || 0
  } else {
    currentPoints = localPoints
  }

  const currentCount = rule.pointsPerUnit > 0 ? Math.floor(currentPoints / rule.pointsPerUnit) : 0
  const maxPoints = rule.dailyMax
  const isMax = maxPoints !== null && currentPoints >= maxPoints
  const remainingPoints = maxPoints !== null ? Math.max(0, maxPoints - currentPoints) : Infinity

  return {
    ...rule,
    currentPoints,
    currentCount,
    remainingPoints,
    isMax,
  }
}

/**
 * 일일 신행 공덕을 Supabase 클라우드 DB에 실시간 백업/동기화
 */
export async function syncDailyMeritToCloud(activityKey, userCode, points) {
  if (!supabase || !userCode || userCode === 'guest') return
  try {
    const today = getTodayKey()
    const { data: member } = await supabase.from('members').select('extra_data').eq('code', userCode).maybeSingle()
    if (!member) return
    const extra = member.extra_data || {}
    const daily = extra.daily_merits || {}
    const todayDaily = daily[today] || {}
    todayDaily[activityKey] = Math.max(Number(todayDaily[activityKey]) || 0, points)
    daily[today] = todayDaily
    await supabase.from('members').update({ extra_data: { ...extra, daily_merits: daily } }).eq('code', userCode)
  } catch (err) {
    console.error('syncDailyMeritToCloud note:', err)
  }
}

/**
 * 모든 5대 신행 활동의 오늘 적립 현황 종합 조회
 */
export const getAllDailyMeritSummary = (userCode = 'guest') => {
  const summary = {}
  let totalTodayEarned = 0

  Object.values(MERIT_RULES).forEach((rule) => {
    const info = getDailyMeritInfo(rule.key, userCode)
    summary[rule.key] = info
    totalTodayEarned += info.currentPoints
  })

  return {
    items: summary,
    totalTodayEarned,
  }
}

/**
 * 공덕 포인트 적립 실행
 * @param {string} activityKey - 'lantern' | 'sutra' | 'bow' | 'moktak' | 'yeomju'
 * @param {string} userCode - 회원 식별 코드 또는 'guest'
 * @param {number} customUnits - 단위 수량 (기본 1)
 * @returns {object} { earnedPoints, currentDailyPoints, maxDailyPoints, isMax, isNewlyMax, message }
 */
export const awardMerit = (activityKey, userCode = 'guest', customUnits = 1, cloudPoints = null) => {
  const rule = Object.values(MERIT_RULES).find((r) => r.key === activityKey)
  if (!rule) {
    return { earnedPoints: 0, isMax: false, isNewlyMax: false, currentDailyPoints: 0, message: '' }
  }

  const today = getTodayKey()
  const code = userCode || 'guest'
  const storageKey = `sowon_daily_merit_${activityKey}_${code}_${today}`
  let currentPoints = 0
  let localPoints = 0
  try {
    const val = localStorage.getItem(storageKey)
    if (val) localPoints = parseInt(val, 10) || 0
  } catch (e) {}

  if (cloudPoints !== null && cloudPoints !== undefined) {
    currentPoints = Math.max(Number(cloudPoints) || 0, localPoints)
  } else {
    currentPoints = localPoints
  }

  const maxPoints = rule.dailyMax
  if (maxPoints !== null && currentPoints >= maxPoints) {
    return {
      earnedPoints: 0,
      isMax: true,
      isNewlyMax: false,
      currentDailyPoints: currentPoints,
      maxDailyPoints: maxPoints,
      message: `오늘의 ${rule.shortName} 공덕(최대 ${maxPoints.toLocaleString()} 공덕)을 모두 달성하셨습니다 🙏`,
    }
  }

  const desiredAdd = rule.pointsPerUnit * customUnits
  let pointsToAdd = desiredAdd
  if (maxPoints !== null) {
    pointsToAdd = Math.min(desiredAdd, maxPoints - currentPoints)
  }

  const nextPoints = currentPoints + pointsToAdd
  try {
    localStorage.setItem(storageKey, String(nextPoints))
  } catch (e) {}

  // ☁️ Supabase 클라우드 실시간 동기화 (전국 모든 기기 공덕 실시간 일치)
  syncDailyMeritToCloud(activityKey, code, nextPoints)

  const isNowMax = maxPoints !== null && nextPoints >= maxPoints

  let message = ''
  if (isNowMax) {
    message = `🎉 오늘의 ${rule.shortName} 정진(${maxPoints.toLocaleString()} 공덕)을 원만 달성하셨습니다!`
  } else if (maxPoints !== null) {
    message = `+${pointsToAdd} 공덕 적립 (${nextPoints.toLocaleString()}/${maxPoints.toLocaleString()} 공덕)`
  } else {
    message = `+${pointsToAdd} 공덕 적립`
  }

  return {
    earnedPoints: pointsToAdd,
    currentDailyPoints: nextPoints,
    maxDailyPoints: maxPoints,
    isMax: isNowMax,
    isNewlyMax: isNowMax && currentPoints < maxPoints,
    message,
  }
}


// =====================================================================
// 🏦 공덕 거래 장부 방식 (회원 공덕의 유일한 적립 통로)
// 점수 규정·중복 방지·하루 한도는 DB 함수 grant_merit 와 merit_ledger 표가 책임진다.
// 앱은 호출만 하고, 응답으로 받은 balance(누적)만 화면에 반영한다.
// SaaS 멀티테넌트(temple_id) 완벽 지원
// =====================================================================
export async function grantMerit(activity, memberCode, ref = '', templeId = null) {
  if (!supabase || !memberCode || memberCode === 'guest') {
    return { earned: 0, reason: 'no_supabase' }
  }
  const resolvedTempleId = templeId || getCurrentTempleId()
  try {
    const { data, error } = await supabase.rpc('grant_merit', {
      p_code: memberCode,
      p_activity: activity,
      p_ref: ref || '',
      p_temple_id: resolvedTempleId,
    })
    if (error) {
      // p_temple_id 파라미터가 아직 없는 구버전 RPC 함수 대비 안전 fallback
      if (error.message && error.message.includes('p_temple_id')) {
        const fallback = await supabase.rpc('grant_merit', {
          p_code: memberCode,
          p_activity: activity,
          p_ref: ref || '',
        })
        return fallback.data || { earned: 0, reason: 'empty' }
      }
      console.error('grant_merit error:', error)
      return { earned: 0, reason: 'error', error }
    }
    return data || { earned: 0, reason: 'empty' }
  } catch (err) {
    console.error('grant_merit exception:', err)
    return { earned: 0, reason: 'error', error: err }
  }
}

// 오늘(한국시간) 장부 합계: { lantern: 1000, sanctuary: 1000, ... }
export async function fetchTodayLedger(memberCode, templeId = null) {
  if (!supabase || !memberCode) return {}
  const resolvedTempleId = templeId || getCurrentTempleId()
  try {
    let query = supabase
      .from('merit_ledger')
      .select('activity, points')
      .eq('member_code', memberCode)
      .eq('ledger_date', getTodayKey())

    // temple_id 컬럼이 있는 경우 사찰별 격리 조회
    if (resolvedTempleId) {
      query = query.or(`temple_id.eq.${resolvedTempleId},temple_id.is.null`)
    }

    const { data, error } = await query
    if (error) return {}
    const sums = {}
    ;(data || []).forEach((r) => {
      if (r.activity === 'opening') return
      sums[r.activity] = (sums[r.activity] || 0) + (Number(r.points) || 0)
    })
    return sums
  } catch (e) {
    return {}
  }
}
