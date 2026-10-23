// 제주 소원사 모바일 법당 Service Worker (PWA 설치 및 캐시 지원)
const CACHE_NAME = 'sowonpray-cache-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // 기본 네트워크 우선 전략 (최신 콘텐츠 즉시 반영)
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    })
  )
})
