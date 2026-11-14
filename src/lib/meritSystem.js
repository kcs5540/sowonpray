// src/lib/meritSystem.js
// 제주 소원사 공덕 포인트 시스템 표준 규격
// 규정:
// 1. 대웅전 참배: 들어갔다 나오면 1,000 공덕 (한도 1일 1,000)
// 2. 소원등 켜기: 1회 점등 시 1,000 공덕 (한도 1일 1,000)
// 3. 한줄 사경: 1회 사경 시 1,000 공덕 (한도 1일 1,000)
// 4. 인연 전달 한 사람: 상대방이 소원등 켰을 경우 5,000 공덕 (한도 1일 50,000)
// 5. (신규) 인연 받은 사람: 상대방이 소원등 켰을 경우 5,000 공덕
// 6. 절 올리기 (108배): 1배당 +10 공덕 (1일 최대 1,080 공덕 = 최대 108배)
// 7. 목탁 치기: 1타당 +10 공덕 (1일 최대 1,080 공덕 = 최대 108타)
// 8. 염주 굴리기: 1알당 +10 공덕 (1일 최대 1,080 공덕 = 최대 108알)

export const MERIT_RULES = {
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
    name: '(신규) 인연 받은 사람',
    shortName: '(신규) 인연 받음',
    icon: '🌸',
    pointsPerUnit: 5000,
    dailyMax: 5000, // 상대방이 소원등 켰을 경우 5,000 (1일 5,000)
    unitName: '회',
    desc: '상대방이 소원등 켰을 경우 5,000 공덕',
  },
  BOW: {
    key: 'bow',
    name: '절 올리기 (108배)',
    shortName: '절',
    icon: '🙇',
    pointsPerUnit: 10,
    dailyMax: 1080, // 최대 1080 공덕 (1일 108배)
    unitName: '배',
    desc: '1배 10 공덕 (1일 최대 1,080 공덕)',
  },
  MOKTAK: {
    key: 'moktak',
    name: '목탁 치기',
    shortName: '목탁',
    icon: '🪵',
    pointsPerUnit: 10,
    dailyMax: 1080, // 최대 1080 공덕 (1일 108타)
    unitName: '타',
    desc: '1타 10 공덕 (1일 최대 1,080 공덕)',
  },
  YEOMJU: {
    key: 'yeomju',
    name: '염주 굴리기',
    shortName: '염주',
    icon: '📿',
    pointsPerUnit: 10,
    dailyMax: 1080, // 최대 1080 공덕 (1일 108알)
    unitName: '알',
    desc: '1알 10 공덕 (1일 최대 1,080 공덕)',
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
 * 특정 활동의 오늘 적립 현황 조회
 */
export const getDailyMeritInfo = (activityKey, userCode = 'guest') => {
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
  let currentPoints = 0
  try {
    const val = localStorage.getItem(storageKey)
    if (val) currentPoints = parseInt(val, 10) || 0
  } catch (e) {}

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
export const awardMerit = (activityKey, userCode = 'guest', customUnits = 1) => {
  const rule = Object.values(MERIT_RULES).find((r) => r.key === activityKey)
  if (!rule) {
    return { earnedPoints: 0, isMax: false, isNewlyMax: false, currentDailyPoints: 0, message: '' }
  }

  const today = getTodayKey()
  const code = userCode || 'guest'
  const storageKey = `sowon_daily_merit_${activityKey}_${code}_${today}`
  let currentPoints = 0
  try {
    const val = localStorage.getItem(storageKey)
    if (val) currentPoints = parseInt(val, 10) || 0
  } catch (e) {}

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
