// src/lib/moktakAudio.js
// 스튜디오 원목 목탁 zero-latency Web Audio 엔진
// 원음 그대로의 투명한 재생 + 연타 시 폰 스피커 클리핑 방지용 소프트 리미터

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

  rawFetchPromise = fetch('/audio/moktak.mp3?v=5', { cache: 'force-cache' })
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

// 모바일 스피커 연타 시 과부하만 방어하고 원음은 왜곡 없이 통과시키는 마스터 체인
function ensureMasterBus(ctx) {
  if (!ctx) return null
  if (masterBus) return masterBus

  // 소프트 리미터 (단타는 무압축 원음 통과, 빠른 연타 합산 피크만 안전하게 제한)
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -4
  compressor.knee.value = 8
  compressor.ratio.value = 4
  compressor.attack.value = 0.002
  compressor.release.value = 0.10

  const inputNode = ctx.createGain()
  inputNode.gain.value = 0.94

  inputNode.connect(compressor)
  compressor.connect(ctx.destination)

  masterBus = { input: inputNode }
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

// 오프라인/디코딩 전 찰나 대체용: 순수 원목 공명 합성 (폰 스피커 안전)
export function playMoktakAcousticSynth(pitchRate = 1.0) {
  try {
    const ctx = ensureAudioContext()
    if (!ctx) return
    const bus = ensureMasterBus(ctx)
    const dest = bus ? bus.input : ctx.destination
    const now = ctx.currentTime

    // 1. 주 원목 공명 (640Hz -> 585Hz 맑은 박달나무 공명)
    const bodyOsc = ctx.createOscillator()
    const bodyGain = ctx.createGain()
    bodyOsc.type = 'sine'
    bodyOsc.frequency.setValueAtTime(640 * pitchRate, now)
    bodyOsc.frequency.exponentialRampToValueAtTime(585 * pitchRate, now + 0.030)
    bodyGain.gain.setValueAtTime(0.001, now)
    bodyGain.gain.linearRampToValueAtTime(0.45, now + 0.004)
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
    bodyOsc.connect(bodyGain)
    bodyGain.connect(dest)
    bodyOsc.start(now)
    bodyOsc.stop(now + 0.24)

    // 2. 따뜻한 보조 공명 (575Hz -> 530Hz)
    const subOsc = ctx.createOscillator()
    const subGain = ctx.createGain()
    subOsc.type = 'triangle'
    subOsc.frequency.setValueAtTime(575 * pitchRate, now)
    subOsc.frequency.exponentialRampToValueAtTime(530 * pitchRate, now + 0.025)
    subGain.gain.setValueAtTime(0.001, now)
    subGain.gain.linearRampToValueAtTime(0.16, now + 0.004)
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
 * 실시간 0ms 지연 원목 목탁 타격 실행
 * @param {object} options
 * @param {number} [options.pitchJitter=0.02] 타격마다 미세 음정 변화 폭
 * @param {number} [options.baseVolume=0.88] 기본 음량
 * @param {number} [options.reverbAmount=0] 하위 호환용 옵션 (원음 그대로 재생)
 */
export function playMoktakSound({
  pitchJitter = 0.02,
  baseVolume = 0.88,
  reverbAmount = 0, // eslint-disable-line no-unused-vars
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
      hitGain.connect(bus ? bus.input : ctx.destination)

      source.start(0)
      return
    }

    playMoktakAcousticSynth(rate)
  } catch {
    playMoktakAcousticSynth()
  }
}
