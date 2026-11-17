const CACHE_NAME = 'sowonpray-cache-v80'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // HTML 문서 페이지 요청은 브라우저 캐시 무조건 건너뛰고 최신 서버 배포본 로드
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => {
        return caches.match(event.request)
      })
    )
    return
  }

  // JS/CSS 및 데이터 요청은 항상 최신 서버 리소스 우선 로드 (캐시 오염 방지)
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' }).catch(() => {
      return caches.match(event.request)
    })
  )
})
