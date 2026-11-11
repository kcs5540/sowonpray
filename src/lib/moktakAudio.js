// src/lib/moktakAudio.js
// 제주 소원사 대웅전 실물 박달나무 목탁 zero-latency Web Audio 엔진

let sharedAudioCtx = null
let rawMoktakBytes = null
let moktakAudioBuffer = null
let rawFetchPromise = null
let bufferDecodePromise = null
let templeConvolverNode = null
let templeWetGain = null
let templeDryGain = null

// 앱 시작 시 네트워크에서 raw bytes만 미리 받아둠 (AudioContext 경고 없이 즉시 캐싱)
export function prefetchMoktakBytes() {
  if (rawMoktakBytes) return Promise.resolve(rawMoktakBytes)
  if (rawFetchPromise) return rawFetchPromise
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return Promise.resolve(null)

  rawFetchPromise = fetch('/audio/moktak.mp3?v=3', { cache: 'force-cache' })
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
    templeConvolverNode = null
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {})
  }
  return sharedAudioCtx
}

// 대웅전 목조 법당 공간 임펄스 리버브(IR) 생성 (~0.85초 따뜻한 목조 잔향)
function ensureTempleHallChain(ctx) {
  if (!ctx) return null
  if (templeConvolverNode && templeDryGain && templeWetGain) {
    return { dry: templeDryGain, wet: templeWetGain, convolver: templeConvolverNode }
  }

  const sampleRate = ctx.sampleRate
  const duration = 0.85
  const length = Math.floor(sampleRate * duration)
  const impulse = ctx.createBuffer(2, length, sampleRate)

  for (let ch = 0; ch < 2; ch++) {
    const channelData = impulse.getChannelData(ch)
    let lpState = 0
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // 초기 목조 반사음(Early Reflections) + 부드러운 지수 감쇠
      const envelope = Math.exp(-t * 4.6) * (1 - Math.exp(-t * 95))
      const white = Math.random() * 2 - 1
      // 목조 법당 특유의 고역 원목 흡수 감쇠
      lpState = lpState * 0.72 + white * 0.28
      channelData[i] = lpState * envelope * 0.9
    }
  }

  templeConvolverNode = ctx.createConvolver()
  templeConvolverNode.buffer = impulse

  // 리버브 전용 저역/중역 따뜻한 EQ 필터 (2.4kHz 이상 치찰음 억제)
  const hallFilter = ctx.createBiquadFilter()
  hallFilter.type = 'lowpass'
  hallFilter.frequency.value = 2400

  templeDryGain = ctx.createGain()
  templeDryGain.gain.value = 0.88

  templeWetGain = ctx.createGain()
  templeWetGain.gain.value = 0.30

  templeDryGain.connect(ctx.destination)
  templeConvolverNode.connect(hallFilter)
  hallFilter.connect(templeWetGain)
  templeWetGain.connect(ctx.destination)

  return { dry: templeDryGain, wet: templeWetGain, convolver: templeConvolverNode }
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
      // decodeAudioData는 ArrayBuffer를 detach할 수 있으므로 slice(0) 복사본 전달
      moktakAudioBuffer = await ctx.decodeAudioData(bytes.slice(0))
      return moktakAudioBuffer
    } catch {
      bufferDecodePromise = null
      return null
    }
  })()

  return bufferDecodePromise
}

// 오프라인/최초 1회 디코딩 직전 1~2ms 간극용: 642Hz + 570Hz 박달나무 물리 합성음 + 법당 리버브
export function playMoktakAcousticSynth(pitchRate = 1.0) {
  try {
    const ctx = ensureAudioContext()
    if (!ctx) return
    const chain = ensureTempleHallChain(ctx)
    const now = ctx.currentTime

    // 1. 목탁 채 어택 (대나무/박달나무 타격 순간)
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.014), ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(2800 * pitchRate, now)
    noiseFilter.Q.setValueAtTime(2.5, now)
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.35, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014)
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(chain ? chain.dry : ctx.destination)
    if (chain) noiseGain.connect(chain.convolver)
    noise.start(now)

    // 2. 주 공명음 (박달나무 본체 642Hz 공명)
    const bodyOsc = ctx.createOscillator()
    const bodyGain = ctx.createGain()
    bodyOsc.type = 'sine'
    bodyOsc.frequency.setValueAtTime(695 * pitchRate, now)
    bodyOsc.frequency.exponentialRampToValueAtTime(642 * pitchRate, now + 0.03)
    bodyGain.gain.setValueAtTime(0.001, now)
    bodyGain.gain.linearRampToValueAtTime(0.68, now + 0.003)
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34)
    bodyOsc.connect(bodyGain)
    bodyGain.connect(chain ? chain.dry : ctx.destination)
    if (chain) bodyGain.connect(chain.convolver)
    bodyOsc.start(now)
    bodyOsc.stop(now + 0.36)

    // 3. 부 공명음 (목탁 깊은 배음 570Hz)
    const subOsc = ctx.createOscillator()
    const subGain = ctx.createGain()
    subOsc.type = 'sine'
    subOsc.frequency.setValueAtTime(570 * pitchRate, now)
    subGain.gain.setValueAtTime(0.001, now)
    subGain.gain.linearRampToValueAtTime(0.32, now + 0.004)
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
    subOsc.connect(subGain)
    subGain.connect(chain ? chain.dry : ctx.destination)
    if (chain) subGain.connect(chain.convolver)
    subOsc.start(now)
    subOsc.stop(now + 0.27)
  } catch {
    // 오디오 컨텍스트 제한 시 무시
  }
}

/**
 * 실시간 0ms 지연 대웅전 박달나무 목탁 타격 실행
 * @param {object} options
 * @param {number} [options.pitchJitter=0.025] 타격마다 미세 음정 변화 폭 (자연스러운 스님 손맛)
 * @param {number} [options.baseVolume=0.92] 기본 음량
 * @param {number} [options.reverbAmount=0.30] 법당 공간 울림 비율 (0~1)
 */
export function playMoktakSound({
  pitchJitter = 0.025,
  baseVolume = 0.92,
  reverbAmount = 0.30,
} = {}) {
  try {
    const ctx = ensureAudioContext()
    if (!ctx) return

    if (!moktakAudioBuffer) {
      preloadMoktakAudio()
    }

    // 타격마다 맑고 자연스러운 미세 손맛 변화 (음정 ±2.5~4%, 강약 88~100%)
    const rate = 1.0 + (Math.random() * 2 - 1) * pitchJitter
    const velocity = baseVolume * (0.88 + Math.random() * 0.12)

    if (moktakAudioBuffer) {
      const chain = ensureTempleHallChain(ctx)
      const source = ctx.createBufferSource()
      source.buffer = moktakAudioBuffer
      source.playbackRate.value = rate

      const hitGain = ctx.createGain()
      hitGain.gain.value = velocity

      source.connect(hitGain)
      if (chain) {
        chain.wet.gain.setTargetAtTime(reverbAmount, ctx.currentTime, 0.01)
        hitGain.connect(chain.dry)
        hitGain.connect(chain.convolver)
      } else {
        hitGain.connect(ctx.destination)
      }

      source.start(0)
      return
    }

    // 첫 탭 시 디코딩 중이면 즉시 642Hz 물리 합성음으로 지연 0ms 대체 재생
    playMoktakAcousticSynth(rate)
  } catch {
    playMoktakAcousticSynth()
  }
}
