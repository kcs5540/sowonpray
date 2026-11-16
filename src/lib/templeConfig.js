/**
 * SaaS 멀티 테넌트 사찰 설정 및 자동 감지 모듈
 * 
 * - 각 사찰별 고유 ID, 명칭, 도메인, 연락처 등을 통합 관리합니다.
 * - 접속 도메인(hostname) 또는 URL 파라미터(?temple=...), 로컬스토리지에 따라 현재 사찰을 자동 판별합니다.
 * - 기본값은 'sowonsa'(제주 소원사)이며, 추후 제2, 제3 사찰 추가 시 레지스트리에 등록만 하면 즉시 확장됩니다.
 */

export const TEMPLE_REGISTRY = {
  sowonsa: {
    id: 'sowonsa',
    name: '제주 소원사',
    shortName: '소원사',
    slogan: '제주 애월 한라산 자락, 천혜의 기도 청정도량',
    officePhone: '010-4912-1083',
    domains: [
      'sowonpray.vercel.app',
      'sowonpray.kr',
      'www.sowonpray.kr',
      'sowonsa.kr',
      'www.sowonsa.kr',
      'localhost',
      '127.0.0.1',
    ],
    theme: {
      primaryColor: '#C59B27',
      accentColor: '#F5D061',
    },
  },
  // 예시: 향후 제2, 제3 사찰 추가 템플릿
  // seonamsa: {
  //   id: 'seonamsa',
  //   name: '선암사',
  //   shortName: '선암사',
  //   slogan: '천년 고찰, 맑고 고요한 수행도량',
  //   officePhone: '010-0000-0000',
  //   domains: ['seonamsa.kr'],
  // },
}

export const DEFAULT_TEMPLE_ID = 'sowonsa'

let cachedTempleId = null

/**
 * 접속 환경을 분석하여 현재 사찰 ID를 동적으로 감지합니다.
 * 우선순위:
 * 1. URL 쿼리 파라미터 (?temple=xxx 또는 ?t=xxx)
 * 2. 로컬 스토리지 ('sowonpray_current_temple_id')
 * 3. 호스트명(도메인) 매칭
 * 4. 환경 변수 (VITE_DEFAULT_TEMPLE_ID)
 * 5. 기본값 ('sowonsa')
 */
export function detectTempleId() {
  if (typeof window === 'undefined') {
    return DEFAULT_TEMPLE_ID
  }

  try {
    // 1. URL Query Parameter
    const urlParams = new URLSearchParams(window.location.search)
    const paramTemple = urlParams.get('temple') || urlParams.get('t')
    if (paramTemple && TEMPLE_REGISTRY[paramTemple.toLowerCase()]) {
      const detected = paramTemple.toLowerCase()
      localStorage.setItem('sowonpray_current_temple_id', detected)
      return detected
    }

    // 2. LocalStorage
    const storedTemple = localStorage.getItem('sowonpray_current_temple_id')
    if (storedTemple && TEMPLE_REGISTRY[storedTemple.toLowerCase()]) {
      return storedTemple.toLowerCase()
    }

    // 3. Hostname Matching
    const hostname = window.location.hostname.toLowerCase()
    for (const [tId, config] of Object.entries(TEMPLE_REGISTRY)) {
      if (config.domains && config.domains.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
        return tId
      }
    }
  } catch (err) {
    console.warn('[templeConfig] Failed to detect temple from window:', err)
  }

  // 4. Default Fallback
  return import.meta.env?.VITE_DEFAULT_TEMPLE_ID || DEFAULT_TEMPLE_ID
}

/**
 * 현재 활성화된 사찰 ID 반환 (단일 메모리 캐싱)
 */
export function getCurrentTempleId() {
  if (!cachedTempleId) {
    cachedTempleId = detectTempleId()
  }
  return cachedTempleId
}

/**
 * 사찰 ID를 수동으로 변경 (테넌트 스위칭)
 */
export function setCurrentTempleId(templeId) {
  const normalized = (templeId || '').toLowerCase()
  if (TEMPLE_REGISTRY[normalized]) {
    cachedTempleId = normalized
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sowonpray_current_temple_id', normalized)
      } catch (e) {}
    }
  }
}

/**
 * 사찰 설정 객체 반환
 */
export function getTempleConfig(templeId = null) {
  const targetId = templeId || getCurrentTempleId()
  return TEMPLE_REGISTRY[targetId] || TEMPLE_REGISTRY[DEFAULT_TEMPLE_ID]
}
