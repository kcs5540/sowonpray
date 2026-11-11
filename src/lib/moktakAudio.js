// src/lib/moktakAudio.js
// 제주 소원사 대웅전 실물 박달나무 목탁 zero-latency Web Audio 엔진
// 모바일 폰 스피커 최적화: 화이트노이즈 리버브 완전 제거 + 마스터 소프트 리미터 + 원목 대역 튜닝

let sharedAudioCtx = null
let rawMoktakBytes = null
let moktakAudioBuffer = null
let rawFetchPromise = null
let bufferDecodePromise = null
let masterBus = null

// 앱 시작 시 네트워크에서 raw bytes만 미리 받아둠 (AudioContext 경고 없이 즉시 캐싱)
export function prefetchMoktakBytes() {
  if (rawMoktakBytes) return Promise.resolve(rawMoktakBytes)
  if (rawFetchPromise) return rawFetchPromise
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return Promise.resolve(null)

  rawFetchPromise = fetch('/audio/moktak.mp3?v=4', { cache: 'force-cache' })
    .then((res) => (res.ok ? res.arrayBuffer() : null))
    .then((buf) => {
      if (buf) rawMoktakBytes = buf
      return rawMoktakBytes
    })
    .catch(() => null)

  return rawFetchPromise
}

// 브라우저 오디오 컨텍스트 안전 초기화 (iOS/Android 모바일 자동잠금 해제 대응)
function ensureAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx()
    masterBus = null
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {})
  }
  return sharedAudioCtx
}

// 모바일 스피커 클리핑(찌직거림) 완벽 방지 마스터 체인 + 순수 목조 초기 반사음 (화이트노이즈 0%)
function ensureMasterBus(ctx) {
  if (!ctx) return null
  if (masterBus) return masterBus

  // 1. 소프트 리미터 (모바일 스피커 과부하/찢어짐 물리 차단)
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -8
  compressor.knee.value = 12
  compressor.ratio.value = 6
  compressor.attack.value = 0.002
  compressor.release.value = 0.12

  // 2. 따뜻한 목조 톤 보호 로우패스 (폰 트위터 치찰음 방지)
  const masterFilter = ctx.createBiquadFilter()
  masterFilter.type = 'lowpass'
  masterFilter.frequency.value = 4200

  // 3. 입력 합산 노드 -> 직접음(dry) + 은은한 법당 목조 반사(32ms 단일 클린 딜레이, 노이즈 없음)
  const inputNode = ctx.createGain()
  inputNode.gain.value = 0.90

  const earlyDelay = ctx.createDelay(0.1)
  earlyDelay.delayTime.value = 0.032

  const roomWarmFilter = ctx.createBiquadFilter()
  roomWarmFilter.type = 'lowpass'
  roomWarmFilter.frequency.value = 1250

  const earlyGain = ctx.createGain()
  earlyGain.gain.value = 0.14

  inputNode.connect(masterFilter)
  inputNode.connect(earlyDelay)
  earlyDelay.connect(roomWarmFilter)
  roomWarmFilter.connect(earlyGain)
  earlyGain.connect(masterFilter)

  masterFilter.connect(compressor)
  compressor.connect(ctx.destination)

  masterBus = { input: inputNode, roomGain: earlyGain }
  return masterBus
}

// 첫 사용자 제스처 시 오디오 버퍼 디코딩 완료 (0ms 지연 재생 준비)
export function preloadMoktakAudio() {
  if (moktakAudioBuffer) return Promise.resolve(moktakAudioBuffer)
  if (bufferDecodePromise) return bufferDecodePromise

  bufferDecodePromise = (async () => {
    try {
      const ctx = ensureAudioContext()
      if (!ctx) return null
      const bytes = rawMoktakBytes || (await prefetchMoktakBytes())
      if (!bytes) return null
      moktakAudioBuffer = await ctx.decodeAudioData(bytes.slice(0))
      return moktakAudioBuffer
    } catch {
      bufferDecodePromise = null
      return null
    }
  })()

  return bufferDecodePromise
}

// 오프라인/디코딩 전 찰나 대체용: 화이트노이즈 없는 따뜻한 원목 목탁 음향 합성 (폰 스피커 안전)
export function playMoktakAcousticSynth(pitchRate = 1.0) {
  try {
    const ctx = ensureAudioContext()
    if (!ctx) return
    const bus = ensureMasterBus(ctx)
    const dest = bus ? bus.input : ctx.destination
    const now = ctx.currentTime

    // 1. 주 원목 공명 (460Hz -> 380Hz 부드러운 대추/박달나무 타격)
    const bodyOsc = ctx.createOscillator()
    const bodyGain = ctx.createGain()
    bodyOsc.type = 'sine'
    bodyOsc.frequency.setValueAtTime(520 * pitchRate, now)
    bodyOsc.frequency.exponentialRampToValueAtTime(420 * pitchRate, now + 0.035)
    bodyGain.gain.setValueAtTime(0.001, now)
    bodyGain.gain.linearRampToValueAtTime(0.45, now + 0.004)
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
    bodyOsc.connect(bodyGain)
    bodyGain.connect(dest)
    bodyOsc.start(now)
    bodyOsc.stop(now + 0.24)

    // 2. 따뜻한 목탁 통 배음 (590Hz 순수 원목 울림)
    const subOsc = ctx.createOscillator()
    const subGain = ctx.createGain()
    subOsc.type = 'triangle'
    subOsc.frequency.setValueAtTime(620 * pitchRate, now)
    subOsc.frequency.exponentialRampToValueAtTime(540 * pitchRate, now + 0.025)
    subGain.gain.setValueAtTime(0.001, now)
    subGain.gain.linearRampToValueAtTime(0.18, now + 0.004)
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14)
    subOsc.connect(subGain)
    subGain.connect(dest)
    subOsc.start(now)
    subOsc.stop(now + 0.16)
  } catch {
    // 오디오 컨텍스트 제한 시 무시
  }
}

/**
 * 실시간 0ms 지연 대웅전 박달나무 목탁 타격 실행
 * @param {object} options
 * @param {number} [options.pitchJitter=0.02] 타격마다 미세 음정 변화 폭
 * @param {number} [options.baseVolume=0.88] 기본 음량
 * @param {number} [options.reverbAmount=0.14] 은은한 목조 반사 비율 (0~0.35)
 */
export function playMoktakSound({
  pitchJitter = 0.02,
  baseVolume = 0.88,
  reverbAmount = 0.14,
} = {}) {
  try {
    const ctx = ensureAudioContext()
    if (!ctx) return

    if (!moktakAudioBuffer) {
      preloadMoktakAudio()
    }

    const rate = 1.0 + (Math.random() * 2 - 1) * pitchJitter
    const velocity = baseVolume * (0.90 + Math.random() * 0.10)

    if (moktakAudioBuffer) {
      const bus = ensureMasterBus(ctx)
      const source = ctx.createBufferSource()
      source.buffer = moktakAudioBuffer
      source.playbackRate.value = rate

      const hitGain = ctx.createGain()
      hitGain.gain.value = velocity

      source.connect(hitGain)
      if (bus) {
        bus.roomGain.gain.setTargetAtTime(Math.min(0.25, reverbAmount), ctx.currentTime, 0.01)
        hitGain.connect(bus.input)
      } else {
        hitGain.connect(ctx.destination)
      }

      source.start(0)
      return
    }

    playMoktakAcousticSynth(rate)
  } catch {
    playMoktakAcousticSynth()
  }
}
