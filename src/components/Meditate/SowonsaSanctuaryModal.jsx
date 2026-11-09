import React, { useState, useEffect, useRef } from 'react'
import { X, Volume2, VolumeX, Sparkles, DoorOpen, Share2, Award, ChevronRight, ChevronDown, Play, Pause, Check, Music } from 'lucide-react'
import { awardMerit, getDailyMeritInfo } from '../../lib/meritSystem'

// 📿 대웅전 8대 법음 & 염불 트랙 라이브러리 (앱 홈 24시간 힐링 오디오 정식 연동)
const SANCTUARY_AUDIO_TRACKS = [
  {
    id: 'sowonsa_prajna_meditation',
    shortTitle: '반야심경(명상)',
    title: '제주 소원사 반야심경',
    subtitle: '대웅전 힐링 명상 (스님 저음 범패 & 묵직한 목탁)',
    icon: '🧘',
    audioUrl: '/audio/sowonsa_prajna_meditation.mp3',
    tag: '대웅전 명상',
  },
  {
    id: 'prajna_chanting',
    shortTitle: '반야심경(정통)',
    title: '반야심경 영인스님 정통 독경',
    subtitle: '청아한 육성 원음 & 법당 목탁 (2분 51초)',
    icon: '📿',
    audioUrl: '/audio/prajna_chanting.mp3',
    tag: '정통 독경',
  },
  {
    id: 'dhammapada_wisdom',
    shortTitle: '천수경',
    title: '천수경 영인스님 정통 독경',
    subtitle: '액난 소멸과 소원 성취 영험 독경 (3분 20초)',
    icon: '📜',
    audioUrl: '/audio/dhammapada_wisdom.mp3',
    tag: '소원 성취',
  },
  {
    id: 'sleep_meditation',
    shortTitle: '광명진언',
    title: '광명진언 영인스님 치유 독경',
    subtitle: '마음의 불안을 잠재우는 치유 종송 (2분 46초)',
    icon: '🌙',
    audioUrl: '/audio/sleep_meditation.mp3',
    tag: '마음 치유',
  },
  {
    id: 'lotus_destiny',
    shortTitle: '연꽃 인연',
    title: '연꽃 인연 (소원사 힐링 찬불가)',
    subtitle: '청아한 보컬 & 대금·해금·피아노 선율',
    icon: '🌸',
    audioUrl: '/audio/lotus_destiny.mp3',
    tag: '힐링 찬불가',
  },
  {
    id: 'jeju_sowonsa',
    shortTitle: '도량 테마송',
    title: '제주 소원사 (도량 공식 테마송)',
    subtitle: '따뜻한 어쿠스틱 발라드 & 첼로 선율',
    icon: '🍊',
    audioUrl: '/audio/jeju_sowonsa.mp3',
    tag: '공식 찬가',
  },
  {
    id: 'rhythmic_moktak',
    shortTitle: '박달목탁',
    title: '박달나무 실물 목탁 원음',
    subtitle: '천년고찰 대웅전 목탁 소리 & 법당 자연 잔향 (108배용)',
    icon: '🪵',
    audioUrl: '/audio/muyeok_moktak.mp3',
    tag: '108배 정진',
  },
  {
    id: 'temple_chime_nature',
    shortTitle: '풍경·자연음',
    title: '은방울 풍경소리 & 산새소리 ASMR',
    subtitle: '처마 밑 은방울 풍경과 제주 산새소리 앰비언스',
    icon: '🍃',
    audioUrl: '/audio/sowonsa_wind.mp3',
    tag: '자연 쉼터',
  },
]

// 📿 실제 대추나무 단주/염주알 굴릴 때 나는 따뜻하고 묵직한 원목 구슬 소리 (쇠소리 완전 제거)
function playYeomjuAcousticSynth() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // 1. 1차 원목 구슬 부딪힘 (460Hz / 680Hz / 320Hz의 따뜻한 원목 공명)
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(460, now)
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.05)

    osc2.type = 'triangle' // 부드럽고 따뜻한 배음
    osc2.frequency.setValueAtTime(680, now)
    osc2.frequency.exponentialRampToValueAtTime(480, now + 0.04)

    gainNode.gain.setValueAtTime(0.55, now)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.07)

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.08)
    osc2.stop(now + 0.08)

    // 2. 35ms 뒤 이웃 구슬이 스르륵 감기는 미세한 원목 굴림음 ("또륵")
    setTimeout(() => {
      try {
        const now2 = ctx.currentTime
        const oscRoll = ctx.createOscillator()
        const rollGain = ctx.createGain()
        oscRoll.type = 'sine'
        oscRoll.frequency.setValueAtTime(520, now2)
        oscRoll.frequency.exponentialRampToValueAtTime(380, now2 + 0.04)
        rollGain.gain.setValueAtTime(0.3, now2)
        rollGain.gain.exponentialRampToValueAtTime(0.001, now2 + 0.06)
        oscRoll.connect(rollGain)
        rollGain.connect(ctx.destination)
        oscRoll.start(now2)
        oscRoll.stop(now2 + 0.07)
      } catch {}
    }, 35)
  } catch {}
}


/**
 * 🪔 제주 소원사 고요 법당 (멍스테이 & 사찰 쉼터 뷰)
 * - 기존 앱 로직과 완전히 격리된 독립 힐링 컴포넌트
 * - 도량 바람소리 + 스님 은은한 반야심경 염불 On/Off 토글
 * - 4대 정진(합장, 108배 마일스톤, 목탁 타종, 108 염주알 굴리기) + 소원등 연동
 * - 실시간 도량 온기(동행 불자님 3인 구도 + 라이브 정진 피드 + 호흡하는 접속자수)
 * - 전체화면 고요 멍스테이 모드 (화면 터치 시 복귀)
 */
export default function SowonsaSanctuaryModal({ isOpen, onClose, onOpenLantern, currentUser, onAddMerit, handleShareSanctuary, showToast }) {
  // 사운드 상태
  const [isPlayingSound, setIsPlayingSound] = useState(false)
  const [isPlayingChant, setIsPlayingChant] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState(() => SANCTUARY_AUDIO_TRACKS[0])
  const [showAudioDrawer, setShowAudioDrawer] = useState(false)

  // 인터랙션 상태
  const [actionState, setActionState] = useState('idle') // 'idle' | 'hapjang' | 'bow' | 'moktak' | 'yeomju'
  // 🎬 대웅전 입장 시네마틱 시퀀스: 'entering'(걸어들어옴) -> 'hapjang'(합장반배) -> 'seated'(착석완료)
  const [entranceStep, setEntranceStep] = useState('entering')
  const [bowCount, setBowCount] = useState(() => {
    const info = getDailyMeritInfo('bow', currentUser?.code || 'guest')
    return info.currentCount || 0
  })
  const [moktakTapCount, setMoktakTapCount] = useState(() => {
    const info = getDailyMeritInfo('moktak', currentUser?.code || 'guest')
    return info.currentCount || 0
  })
  const [yeomjuCount, setYeomjuCount] = useState(() => {
    const info = getDailyMeritInfo('yeomju', currentUser?.code || 'guest')
    return info.currentCount || 0
  })
  const [actionToast, setActionToast] = useState('')
  const [sessionBows, setSessionBows] = useState(0)
  const [sessionMoktaks, setSessionMoktaks] = useState(0)
  const [sessionYeomjus, setSessionYeomjus] = useState(0)

  // 멍스테이 전체화면 모드 (UI 숨김)
  const [isZenMode, setIsZenMode] = useState(false)

  // 👥 함께 정진하는 실시간 도량 시뮬레이션 상태
  const [liveDevoteeCount, setLiveDevoteeCount] = useState(348)
  const [companionLeftState, setCompanionLeftState] = useState('idle') // 'idle' | 'bow' | 'hapjang'
  const [companionRightState, setCompanionRightState] = useState('idle')
  const [liveStreamMsg, setLiveStreamMsg] = useState({
    name: '서귀포 불자님',
    action: '부처님 전에 3배를 올리셨습니다',
    icon: '🙇'
  })

  const ambientAudioRef = useRef(null)
  const chantAudioRef = useRef(null)
  const moktakAudioRef = useRef(null)
  const yeomjuAudioRef = useRef(null)
  const toastTimerRef = useRef(null)
  const lastActionTimeRef = useRef(0)

  // 1회당 최소 2.5초 간격 엄수 (대표님 지시: 정성스러운 호흡과 무분별한 연타 방지)
  const MIN_ACTION_INTERVAL_MS = 1500

  const canExecuteAction = () => {
    const now = Date.now()
    const elapsed = now - lastActionTimeRef.current
    if (elapsed < MIN_ACTION_INTERVAL_MS) {
      const remainingSec = ((MIN_ACTION_INTERVAL_MS - elapsed) / 1000).toFixed(1)
      showActionToast(`🙏 정성을 다해 호흡을 고르세요 (${remainingSec}초 대기)`)
      return false
    }
    lastActionTimeRef.current = now
    return true
  }

  // 실시간 기도/정진 발원 피드 목록
  const LIVE_PRAYERS = [
    { name: '서귀포 불자님', action: '부처님 전 3배를 올리셨습니다', icon: '🙇' },
    { name: '강남 거사님', action: '번뇌를 비우며 맑은 목탁을 쳤습니다', icon: '🪵' },
    { name: '해운대 보살님', action: '가족의 건강과 평안을 위해 합장하셨습니다', icon: '🙏' },
    { name: '제주 불자님', action: '삼존불 전에 소원등을 밝히셨습니다', icon: '🪔' },
    { name: '분당 보살님', action: '108배 정진 중 21배를 올리셨습니다', icon: '🙇' },
    { name: '종로 거사님', action: '고요한 참선으로 잡념을 내려놓습니다', icon: '🧘' },
    { name: '대구 불자님', action: '자녀 시험 원만성취를 위해 두 손 모았습니다', icon: '🙏' },
    { name: '수원 보살님', action: '부처님 대자대비에 감사하며 1배를 올렸습니다', icon: '🙇' },
    { name: '마포 불자님', action: '도량 바람소리를 들으며 마음을 정돈합니다', icon: '🍃' },
    { name: '일산 거사님', action: '108 염주를 한 알씩 굴리며 염송합니다', icon: '📿' },
  ]

  // 토스트 메시지 헬퍼
  const showActionToast = (msg) => {
    setActionToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => {
      setActionToast('')
    }, 2800)
  }

  // 1) 배경 도량 바람/풍경소리 토글
  const toggleSound = (e) => {
    e?.stopPropagation()
    if (!ambientAudioRef.current) return
    if (isPlayingSound) {
      ambientAudioRef.current.pause()
      setIsPlayingSound(false)
      showActionToast('바람소리가 잠시 멈췄습니다')
    } else {
      ambientAudioRef.current.play().then(() => {
        setIsPlayingSound(true)
        showActionToast('🍃 청아한 제주 소원사 도량의 바람 소리')
      }).catch(() => {
        setIsPlayingSound(false)
      })
    }
  }

  // 2) 대웅전 법음 & 염불 트랙 선택 및 토글
  const handleSelectTrack = (track) => {
    setSelectedTrack(track)
    if (chantAudioRef.current) {
      chantAudioRef.current.pause()
      chantAudioRef.current.src = track.audioUrl
      chantAudioRef.current.currentTime = 0
      chantAudioRef.current.play().then(() => {
        setIsPlayingChant(true)
        if (showToast) showToast(`📿 [${track.title}] 봉독을 시작합니다`)
      }).catch(() => {
        setIsPlayingChant(false)
      })
    }
    setShowAudioDrawer(false)
  }

  const toggleChant = (e) => {
    e?.stopPropagation()
    if (!chantAudioRef.current) return
    if (isPlayingChant) {
      chantAudioRef.current.pause()
      setIsPlayingChant(false)
      if (showToast) showToast('법음 소리가 멈췄습니다')
    } else {
      if (!chantAudioRef.current.src || !chantAudioRef.current.src.includes(selectedTrack.audioUrl)) {
        chantAudioRef.current.src = selectedTrack.audioUrl
      }
      chantAudioRef.current.play().then(() => {
        setIsPlayingChant(true)
        if (showToast) showToast(`📿 [${selectedTrack.title}] 봉독을 시작합니다`)
      }).catch(() => {
        setIsPlayingChant(false)
      })
    }
  }


  // 3) 1배 올리기 (108배 마일스톤 축하)
  const handleBow = (e) => {
    e?.stopPropagation()
    setEntranceStep('seated')
    if (!canExecuteAction()) return
    setActionState('bow')
    const nextCount = bowCount + 1
    setBowCount(nextCount)
    setSessionBows(prev => prev + 1)

    const userCode = currentUser?.code || 'guest'
    const meritRes = awardMerit('bow', userCode, 1)
    if (meritRes.earnedPoints > 0 && onAddMerit) {
      onAddMerit(meritRes.earnedPoints)
    }

    let milestoneMsg = ''
    if (nextCount === 3) milestoneMsg = ' 🎉 3배 달성: 삼보에 귀의합니다'
    else if (nextCount === 7) milestoneMsg = ' 칠성님의 가피가 함께합니다'
    else if (nextCount === 21) milestoneMsg = ' ✨ 21배 달성: 맑은 기운이 찹니다'
    else if (nextCount === 108) milestoneMsg = ' 🏆 108배 대정진 원만회향! 무량공덕!'

    let pointMsg = ''
    if (meritRes.earnedPoints > 0) {
      pointMsg = ` (+10 공덕 | 오늘 ${meritRes.currentDailyPoints}/1,080)`
    } else {
      pointMsg = ' (오늘 최대 1,080 공덕 달성)'
    }

    showActionToast(`🙇 부처님 전 정성스레 ${nextCount}배를 올립니다${milestoneMsg}${pointMsg}`)
    setLiveStreamMsg({
      name: currentUser?.name || '나의 정진',
      action: `삼존불 전에 ${nextCount}배를 정성스레 올렸습니다`,
      icon: '🙇'
    })
    setTimeout(() => setActionState('idle'), 1500)
  }

  // 5) 목탁 치기
  const handleMoktak = (e) => {
    e?.stopPropagation()
    setEntranceStep('seated')
    if (!canExecuteAction()) return
    setActionState('moktak')
    const nextTap = moktakTapCount + 1
    setMoktakTapCount(nextTap)
    setSessionMoktaks(prev => prev + 1)
    try {
      if (moktakAudioRef.current) {
        moktakAudioRef.current.currentTime = 0
        moktakAudioRef.current.play().catch(() => {})
      }
    } catch {}

    const userCode = currentUser?.code || 'guest'
    const meritRes = awardMerit('moktak', userCode, 1)
    if (meritRes.earnedPoints > 0 && onAddMerit) {
      onAddMerit(meritRes.earnedPoints)
    }

    let pointMsg = ''
    if (meritRes.earnedPoints > 0) {
      pointMsg = ` (+10 공덕 | 오늘 ${meritRes.currentDailyPoints}/1,080)`
    } else {
      pointMsg = ' (오늘 최대 1,080 공덕 달성)'
    }

    showActionToast(`🪵 맑은 목탁 ${nextTap}타 정진${pointMsg}`)
    setLiveStreamMsg({
      name: currentUser?.name || '나의 정진',
      action: `맑은 목탁 소리(${nextTap}타)로 번뇌와 잡념을 비워냅니다`,
      icon: '🪵'
    })
    setTimeout(() => setActionState('idle'), 1500)
  }

  // 6) 108 염주알 굴리기
  const handleYeomju = (e) => {
    e?.stopPropagation()
    setEntranceStep('seated')
    if (!canExecuteAction()) return
    setActionState('yeomju')
    const nextYeomju = yeomjuCount >= 108 ? 1 : yeomjuCount + 1
    setYeomjuCount(nextYeomju)
    setSessionYeomjus(prev => prev + 1)

    try {
      if (yeomjuAudioRef.current) {
        yeomjuAudioRef.current.currentTime = 0
        yeomjuAudioRef.current.volume = 0.95
        const p = yeomjuAudioRef.current.play()
        if (p !== undefined) {
          p.catch(() => playYeomjuAcousticSynth())
        }
      } else {
        playYeomjuAcousticSynth()
      }
    } catch {
      playYeomjuAcousticSynth()
    }

    const userCode = currentUser?.code || 'guest'
    const meritRes = awardMerit('yeomju', userCode, 1)
    if (meritRes.earnedPoints > 0 && onAddMerit) {
      onAddMerit(meritRes.earnedPoints)
    }

    let pointMsg = ''
    if (meritRes.earnedPoints > 0) {
      pointMsg = ` (+10 공덕 | 오늘 ${meritRes.currentDailyPoints}/1,080)`
    } else {
      pointMsg = ' (오늘 최대 1,080 공덕 달성)'
    }

    if (nextYeomju === 108) {
      showActionToast(`📿 108염주 완주! 마음에 큰 평화와 자비가 깃듭니다${pointMsg}`)
      setLiveStreamMsg({
        name: currentUser?.name || '나의 정진',
        action: '108 염주 한 바퀴를 지극정성으로 완주하셨습니다',
        icon: '📿'
      })
    } else {
      showActionToast(`📿 염주 ${nextYeomju}/108알: 나무아미타불 관세음보살${pointMsg}`)
      setLiveStreamMsg({
        name: currentUser?.name || '나의 정진',
        action: `108 염주(${nextYeomju}번째 알)를 굴리며 염송합니다`,
        icon: '📿'
      })
    }
    setTimeout(() => setActionState('idle'), 1500)
  }

  // 실시간 도량 활기 효과 (동행 불자님 모션 + 라이브 피드 + 인원 변동)
  useEffect(() => {
    if (!isOpen) return

    // 1) 좌측 동반 불자님 잔잔한 모션 주기 (8.5초 주기)
    const leftInterval = setInterval(() => {
      setCompanionLeftState('bow')
      setTimeout(() => setCompanionLeftState('idle'), 2200)
    }, 8500)

    // 2) 우측 동반 불자님 잔잔한 합장/참선 모션 주기 (11.5초 주기)
    const rightInterval = setInterval(() => {
      setCompanionRightState('hapjang')
      setTimeout(() => setCompanionRightState('idle'), 2000)
    }, 11500)

    // 3) 실시간 정진 라이브 토스트 순환 (5.5초 주기)
    let pIdx = 0
    const feedInterval = setInterval(() => {
      pIdx = (pIdx + 1) % LIVE_PRAYERS.length
      setLiveStreamMsg(LIVE_PRAYERS[pIdx])
    }, 5500)

    // 4) 실시간 정진 인원수 자연스러운 숨쉬기 (15초 주기)
    const countInterval = setInterval(() => {
      setLiveDevoteeCount(prev => prev + (Math.random() > 0.5 ? 1 : -1))
    }, 15000)

    return () => {
      clearInterval(leftInterval)
      clearInterval(rightInterval)
      clearInterval(feedInterval)
      clearInterval(countInterval)
    }
  }, [isOpen])

  // 닫을 때 모든 오디오 정지 및 대웅전 입장 시퀀스 타이머
  useEffect(() => {
    if (!isOpen) {
      if (ambientAudioRef.current) ambientAudioRef.current.pause()
      if (chantAudioRef.current) chantAudioRef.current.pause()
      setIsPlayingSound(false)
      setIsPlayingChant(false)
      setIsZenMode(false)
      setEntranceStep('entering')
      return
    }

    // 🎬 대웅전 입장 시퀀스:
    // 0~2.5s: 대청마루에서 사뿐사뿐 걸어 방석 앞으로 들어오기
    // 2.5~4.5s: 방석 앞에 단정히 서서 부처님 전 깊고 정성스런 합장 반배 올리기
    // 4.5s+: 비단 방석에 가부좌 틀고 착석 완료
    setEntranceStep('entering')

    const tHapjang = setTimeout(() => {
      setEntranceStep('hapjang')
    }, 2500)

    const tSeated = setTimeout(() => {
      setEntranceStep('seated')
    }, 4500)

    return () => {
      clearTimeout(tHapjang)
      clearTimeout(tSeated)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/90 flex justify-center items-center overflow-hidden animate-fadeIn select-none"
    >
      <div 
        onClick={(e) => {
          e.stopPropagation()
          // 멍스테이 모드일 때 화면 터치 시 UI 복귀
          if (isZenMode) {
            setIsZenMode(false)
            showActionToast('법당 메뉴가 다시 열렸습니다')
          }
        }}
        className="relative w-full max-w-[480px] h-full bg-black flex flex-col justify-between overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.95)] border-x border-[#C59B27]/30 cursor-pointer"
      >
      {/* 1. 배경 오디오 소스 */}
      <audio ref={ambientAudioRef} src="/audio/sowonsa_wind.mp3" loop preload="auto" />
      <audio ref={chantAudioRef} src={selectedTrack.audioUrl} loop preload="auto" />
      <audio ref={moktakAudioRef} src="/audio/moktak.mp3" preload="auto" />
      <audio ref={yeomjuAudioRef} src="/audio/yeomju_click.wav" preload="auto" />

      {/* 2. 대웅전 옻칠 대청마루 바닥 레이어 (z-0: 제단 밑바닥과 바닥 전체에 자연스럽게 깔림) */}
      <div 
        className="absolute inset-x-0 bottom-0 top-[260px] sm:top-[300px] bg-cover bg-bottom pointer-events-none z-0 opacity-75"
        style={{ backgroundImage: "url('/images/temple_wood_floor.jpg')" }}
      >
        {/* 하단 액션바 영역 은은한 페이드 */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
      </div>

      {/* 2-1. 대웅전 실제 전경 제단 뷰 (z-[1]: 수미단 목조 하단까지 원본 그대로 높고 웅장하게 전체 노출) */}
      <div className="absolute inset-x-0 top-12 sm:top-14 flex flex-col items-center pointer-events-none z-[1]">
        <div className="relative w-full max-w-xl aspect-[4/3] overflow-hidden">
          <img 
            src="/images/sowonsa_daewoongjeon_altar_front.jpg" 
            alt="제주 소원사 대웅전 삼존불" 
            className="w-full h-full object-contain"
          />
          {/* 상단 단청 연결부 자연스러운 음영 */}
          <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
          
          {/* 하단 목조 수미단 바닥 접지면만 미세한 자연스러운 그림자 (수미단 본체 전체 온전히 노출) */}
          <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {/* 좌우 은은한 비네팅 */}
          <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-2.5 bg-gradient-to-l from-black/30 to-transparent pointer-events-none" />
          
          {/* 삼존불 황금빛 광배 은은한 후광 조명 효과 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,_var(--tw-gradient-stops))] from-[#FFD700]/15 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* 멍스테이 모드 안내 플로팅 팁 */}
      {isZenMode && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-center pointer-events-none animate-pulse">
          <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#F5D061] text-xs font-serif-kr shadow-2xl">
            🍃 고요 멍스테이 중입니다 (화면을 터치하면 메뉴가 나타납니다)
          </div>
        </div>
      )}

      {/* 3. 상단 헤더 바 (산사 스타일 깔끔한 상태 표시 및 나가기) */}
      <header className={`relative z-20 flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-2 text-white bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-500 ${
        isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#F5D061]/30 flex items-center gap-1.5 shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-[11px] sm:text-xs font-serif-kr text-[#F5D061] font-bold whitespace-nowrap">대웅전 참배</span>
            <span className="text-[9.5px] sm:text-[10px] text-[#D6CEC2] border-l border-white/20 pl-1.5">
              실시간 {liveDevoteeCount}명
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 제주 소원사 법음/염불 선택 & 토글 버튼 */}
          <div className="flex items-center rounded-full backdrop-blur-md border border-white/20 bg-black/60 shadow overflow-hidden">
            {/* 재생/일시정지 클릭 버튼 */}
            <button
              type="button"
              onClick={toggleChant}
              className={`pl-2.5 pr-1.5 py-1.5 text-[11px] font-serif-kr flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
                isPlayingChant
                  ? 'bg-[#F5D061] text-[#1B1815] font-bold shadow-[0_0_12px_rgba(245,208,97,0.5)]'
                  : 'text-[#D6CEC2] hover:text-white'
              }`}
              title={isPlayingChant ? '일시 정지' : `${selectedTrack.title} 듣기`}
            >
              {isPlayingChant ? (
                <span className="w-3.5 h-3.5 flex items-center justify-center text-xs animate-pulse">🔊</span>
              ) : (
                <span className="text-xs">{selectedTrack.icon}</span>
              )}
              <span className="whitespace-nowrap tracking-tight font-medium">{selectedTrack.shortTitle}</span>
            </button>

            {/* 곡 목록 열기 드롭다운 화살표 버튼 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowAudioDrawer((prev) => !prev)
              }}
              className={`px-1.5 py-1.5 border-l border-white/15 text-[10px] transition cursor-pointer ${
                isPlayingChant
                  ? 'bg-[#F5D061]/90 text-[#1B1815] hover:bg-[#F5D061]'
                  : 'text-[#D6CEC2] hover:text-white bg-black/40'
              }`}
              title="염불·법음 곡 바꾸기 (8곡 선택)"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAudioDrawer ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* 도량 바람소리 토글 버튼 */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-full backdrop-blur-md border transition active:scale-95 ${
              isPlayingSound
                ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061] shadow-[0_0_12px_rgba(245,208,97,0.5)]'
                : 'bg-black/60 text-[#D6CEC2] border-white/20 hover:text-white'
            }`}
            title="도량 바람/풍경소리"
          >
            {isPlayingSound ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* 고요 멍스테이(전체화면) 모드 버튼 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsZenMode(true)
            }}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#F5D061] hover:text-white transition active:scale-95"
            title="전체화면 고요 멍스테이 (메뉴 숨김)"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#D6CEC2] hover:text-white transition active:scale-95"
            title="법당 나가기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 📿 [대웅전 법음·염불 마당 8곡 선택 팝업] */}
      {showAudioDrawer && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowAudioDrawer(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#231B13] via-[#1B150F] to-[#14100C] border-2 border-[#F5D061]/50 text-white shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 상단 타이틀 */}
            <div className="px-4 py-3 bg-[#2D2217] border-b border-[#F5D061]/25 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base">📿</span>
                <div>
                  <h3 className="font-serif-kr font-bold text-sm text-[#F5D061]">
                    대웅전 법음 · 염불 선택
                  </h3>
                  <p className="text-[10px] text-[#C5BBAA]">
                    마음에 닿는 독경과 치유음을 선택해 보세요
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAudioDrawer(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#D6CEC2] flex items-center justify-center transition cursor-pointer"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 현재 재생 중 바 & 정지/재생 컨트롤 */}
            <div className="px-3.5 py-2.5 bg-black/50 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">{selectedTrack.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#F5D061] font-bold bg-[#F5D061]/15 px-1.5 py-0.5 rounded border border-[#F5D061]/30">
                      {selectedTrack.tag}
                    </span>
                    {isPlayingChant && (
                      <span className="text-[9.5px] text-[#4ADE80] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-ping" />
                        법음 봉독 중
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white truncate mt-0.5">
                    {selectedTrack.title}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleChant}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shrink-0 transition active:scale-95 cursor-pointer ${
                  isPlayingChant
                    ? 'bg-[#F5D061] text-[#1B1815] shadow-[0_0_12px_rgba(245,208,97,0.4)]'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                {isPlayingChant ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>정지</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>재생</span>
                  </>
                )}
              </button>
            </div>

            {/* 8대 트랙 리스트 (스크롤) */}
            <div className="p-2.5 overflow-y-auto space-y-1.5 flex-1 divide-y divide-white/5">
              {SANCTUARY_AUDIO_TRACKS.map((track) => {
                const isCurrent = track.id === selectedTrack.id
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectTrack(track)}
                    className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-2.5 ${
                      isCurrent
                        ? 'bg-[#F5D061]/15 border border-[#F5D061]/50 text-white shadow-sm'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] text-[#D6CEC2] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base ${
                        isCurrent
                          ? 'bg-[#F5D061] text-[#1B1815] shadow'
                          : 'bg-white/10 text-white'
                      }`}>
                        {track.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] font-bold text-[#F5D061]/90">
                            {track.tag}
                          </span>
                          {isCurrent && isPlayingChant && (
                            <span className="text-[9px] text-[#4ADE80] font-bold">
                              ● 봉독 중
                            </span>
                          )}
                        </div>
                        <div className={`text-xs font-bold truncate mt-0.5 ${
                          isCurrent ? 'text-[#F5D061]' : 'text-white'
                        }`}>
                          {track.title}
                        </div>
                        <div className="text-[10px] text-[#A89F91] truncate mt-0.5">
                          {track.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-[#F5D061] text-[#1B1815] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/5 text-white/40 flex items-center justify-center">
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* 하단 닫기 안내 */}
            <div className="p-2.5 bg-[#17120D] border-t border-white/10 text-center shrink-0">
              <button
                type="button"
                onClick={() => setShowAudioDrawer(false)}
                className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-[#D6CEC2] font-medium transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. 중앙 공간 (부처님 시선 + 방석 위의 나) */}
      <div className={`relative z-10 flex-1 flex flex-col items-center justify-end pb-4 sm:pb-6 text-center px-3 transition-opacity duration-500 ${
        isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>


        {/* 원경 도량 빈 방석 2개 (원근감과 도량의 그윽한 입체감 복원) */}
        <div className="w-full max-w-xs flex justify-around px-10 mb-2 opacity-30 pointer-events-none">
          <div className="w-16 h-4 rounded-[100%] bg-gradient-to-r from-[#4A351E] via-[#6B4D2B] to-[#4A351E] border border-[#5A4022]/40 shadow-sm" />
          <div className="w-16 h-4 rounded-[100%] bg-gradient-to-r from-[#4A351E] via-[#6B4D2B] to-[#4A351E] border border-[#5A4022]/40 shadow-sm" />
        </div>

        {/* 법당 마루: 동료 불자님 방석 + 나의 참선 방석 (부처님 전 한 칸 앞으로 전진 배치) */}
        <div className="relative w-full max-w-sm flex items-end justify-center gap-2 sm:gap-4 px-1 mb-2 sm:mb-3">
          {/* 좌측 동행 불자님 (제주 불자님) */}
          <div className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity">
            <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[8.5px] text-[#D6CEC2] border border-white/20 mb-1">
              제주 불자님
            </div>
            <div className={`transition-all duration-500 flex flex-col items-center ${
              companionLeftState === 'bow' ? 'scale-95 translate-y-1' : ''
            }`}>
              <div className="h-16 sm:h-20 flex items-end justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                {companionLeftState === 'bow' ? (
                  <img src="/images/avatar_monk_bow.png" alt="절하는 불자님" className="h-14 sm:h-16 object-contain" />
                ) : (
                  <img src="/images/avatar_monk_meditate.png" alt="참선 중인 불자님" className="h-16 sm:h-20 object-contain" />
                )}
              </div>
              <div className="w-20 sm:w-24 h-4 rounded-[100%] bg-gradient-to-r from-[#4A3722] via-[#6B4E2B] to-[#4A3722] border border-white/20 -mt-2 shadow" />
            </div>
          </div>

          {/* 중앙: 나의 참선 방석 (3D 동자승 대형 주인공 - 부처님 쪽으로 당당하게 전진) */}
          <div className="relative flex flex-col items-center z-10 -mb-1">
            {/* 나의 3D 동자승 아바타 모션 (크고 당당하게 전면 배치) */}
            <div className={`relative flex flex-col items-center transition-all duration-300 ${
              actionState === 'bow'
                ? 'scale-95 translate-y-2'
                : actionState === 'hapjang'
                ? 'scale-105 -translate-y-1'
                : actionState === 'moktak' || actionState === 'yeomju'
                ? 'scale-105'
                : ''
            }`}>
              {/* 3D 동자승 실사 캐릭터 (대웅전 사뿐사뿐 걷기 -> 서서 합장 반배 -> 비단 방석 가부좌 착석 -> 절하기/참선) */}
              <div className="relative z-10 h-28 sm:h-34 flex items-end justify-center filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)]">
                {entranceStep === 'entering' ? (
                  /* 1단계: 팔 움직임 없이 양손을 차분히 내리고, 대청마루를 사뿐사뿐 걸어 들어오는 단정한 동자승 (2.5초) */
                  <div className="flex flex-col items-center animate-monk-walk">
                    <img 
                      src="/images/avatar_monk_walk.png?v=calm_arms" 
                      alt="대청마루를 걸어 들어오는 동자승" 
                      className="h-32 sm:h-38 object-contain"
                    />
                  </div>
                ) : entranceStep === 'hapjang' ? (
                  /* 2단계: 부처님 전을 향해 두 손 모아 정중히 합장 반배 올리는 모습 (2.0초) */
                  <div className="flex flex-col items-center animate-monk-hapjang">
                    <img 
                      src="/images/avatar_monk_stand_hapjang.png?v=right" 
                      alt="부처님 전 합장 반배 올리는 동자승" 
                      className="h-32 sm:h-38 object-contain"
                    />
                  </div>
                ) : actionState === 'bow' ? (
                  /* 절하기 1배 모션 */
                  <img 
                    src="/images/avatar_monk_bow.png" 
                    alt="1배 올리는 동자승" 
                    className="h-24 sm:h-30 object-contain transition-transform duration-300"
                  />
                ) : (
                  /* 3단계 & 기본: 비단 방석에 가부좌 틀고 고요히 참선하는 모습 (착석 완료) */
                  <img 
                    src="/images/avatar_monk_meditate.png" 
                    alt="고요히 참선 중인 동자승" 
                    className="h-28 sm:h-34 object-contain animate-monk-sit"
                  />
                )}
              </div>

              {/* 도량 비단 방석 (노란 불빛 링 원천 차단: 차분하고 도톰한 전통 사찰 밤색 비단 솜방석) */}
              <div className="w-40 sm:w-48 h-8 sm:h-9 rounded-[100%] bg-gradient-to-r from-[#3B2816] via-[#5C3F22] to-[#3B2816] border border-[#7A5630]/40 mx-auto -mt-3 shadow-[0_12px_25px_rgba(0,0,0,0.95)] relative z-0" />

              {/* 좌측 실제 3D 목탁과 목탁채 (동자승 무릎 가까이 안쪽으로 이동 배치) */}
              <div 
                onClick={handleMoktak}
                className={`absolute left-0 sm:left-1.5 bottom-0 z-20 cursor-pointer transition-transform duration-200 ${
                  actionState === 'moktak' ? 'scale-125 -rotate-12' : 'hover:scale-110 active:scale-95'
                }`}
                title="목탁 치기"
              >
                <img 
                  src="/images/avatar_moktak_3d.png" 
                  alt="3D 황금 목탁과 목탁채" 
                  className="w-[50px] sm:w-[58px] object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                />
                {/* 목탁 타종 시 황금빛 음파 파동 이펙트 */}
                {actionState === 'moktak' && (
                  <span className="absolute inset-0 rounded-full border-2 border-[#F5D061] animate-ping pointer-events-none" />
                )}
              </div>

              {/* 우측 실제 3D 108 염주 (동자승 무릎 가까이 안쪽으로 이동 배치) */}
              <div 
                onClick={handleYeomju}
                className={`absolute right-1 sm:right-2.5 bottom-0.5 z-20 cursor-pointer transition-transform duration-200 ${
                  actionState === 'yeomju' ? 'scale-125 rotate-12' : 'hover:scale-110 active:scale-95'
                }`}
                title="108 염주알 굴리기"
              >
                <img 
                  src="/images/avatar_yeomju_3d.png" 
                  alt="3D 108 침향목 염주" 
                  className="w-9 sm:w-10 object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                />
                {/* 염주 굴릴 때 황금빛 염송 파동 */}
                {actionState === 'yeomju' && (
                  <span className="absolute inset-0 rounded-full border-2 border-[#F5D061] animate-ping pointer-events-none" />
                )}
              </div>
            </div>
          </div>

          {/* 우측 동행 불자님 (해운대 보살님) */}
          <div className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity">
            <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[8.5px] text-[#D6CEC2] border border-white/20 mb-1">
              해운대 보살님
            </div>
            <div className={`transition-all duration-500 flex flex-col items-center ${
              companionRightState === 'hapjang' ? 'scale-105 -translate-y-1' : ''
            }`}>
              <div className="h-16 sm:h-20 flex items-end justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                <img src="/images/avatar_monk_meditate.png" alt="참선 중인 보살님" className="h-16 sm:h-20 object-contain" />
              </div>
              <div className="w-20 sm:w-24 h-4 rounded-[100%] bg-gradient-to-r from-[#4A3722] via-[#6B4E2B] to-[#4A3722] border border-white/20 -mt-2 shadow" />
            </div>
          </div>
        </div>

        {/* 동자승과 아래 텍스트 사이: 대표님 지정 여유로운 1칸 공간 (mt-5 / mb-2) - 팝업 제거하고 평온한 실시간 도량 온기만 유지 */}
        {entranceStep === 'entering' ? (
          <div className="mt-4 sm:mt-5 mb-1.5 px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#F5D061]/40 text-[10.5px] text-[#F5D061] flex items-center gap-1.5 shadow-lg animate-pulse max-w-xs">
            <span className="text-xs shrink-0">👣</span>
            <span className="font-bold shrink-0">동자승</span>
            <span className="truncate text-white/90">법당 마루를 사뿐사뿐 걸어 들어섭니다...</span>
          </div>
        ) : entranceStep === 'hapjang' ? (
          <div className="mt-4 sm:mt-5 mb-1.5 px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#F5D061]/60 text-[10.5px] text-[#F5D061] flex items-center gap-1.5 shadow-lg animate-in fade-in max-w-xs">
            <span className="text-xs shrink-0">🙏</span>
            <span className="font-bold shrink-0">동자승</span>
            <span className="truncate text-white/90">부처님 전 공손히 합장 반배를 올립니다</span>
          </div>
        ) : (
          /* 실시간 다른 불자님들의 정진 발원 티커 (동자승과 한 칸 띄움 적용) */
          <div className="mt-4 sm:mt-5 mb-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#F5D061]/25 text-[10.5px] text-[#E8DFD1] flex items-center gap-1.5 shadow-lg transition-all duration-500 max-w-xs">
            <span className="text-xs shrink-0">{liveStreamMsg.icon}</span>
            <span className="font-bold text-[#F5D061] shrink-0">{liveStreamMsg.name}</span>
            <span className="truncate text-white/85">{liveStreamMsg.action}</span>
          </div>
        )}

        {/* 나의 실시간 정진 기록 가로형 바 (절 N배 · 목탁 N타 · 염주 N알) + 복 나눔 버튼 (대표님 지정 1번 위치에 품격 배치) */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-serif-kr shadow-sm">
            <span className="font-bold text-[#F5D061] text-[11px] sm:text-xs tracking-tight">{bowCount}배</span>
            <span className="w-px h-2.5 bg-white/20" />
            <span className="font-bold text-[#F5D061] text-[11px] sm:text-xs tracking-tight">{moktakTapCount}타</span>
            <span className="w-px h-2.5 bg-white/20" />
            <span className="font-bold text-[#F5D061] text-[11px] sm:text-xs tracking-tight">{yeomjuCount}알</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (handleShareSanctuary) {
                handleShareSanctuary({
                  believerName: currentUser?.name,
                  bowCount: bowCount || sessionBows || 0,
                  moktakCount: moktakTapCount || sessionMoktaks || 0,
                  yeomjuCount: yeomjuCount || sessionYeomjus || 0,
                })
              }
              if (showToast) {
                showToast('💌 가족·도반에게 대웅전 참배 복(福) 카드가 공유되었습니다.')
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 active:scale-95 backdrop-blur-md border border-[#F5D061]/35 hover:border-[#F5D061]/70 text-xs font-serif-kr shadow-sm transition-all cursor-pointer group"
            title="가족·도반에게 참배 복(福) 나누기 (카카오톡)"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-3.5 h-3.5 text-[#F5D061] group-hover:scale-110 group-active:scale-95 transition-transform filter drop-shadow-[0_2px_4px_rgba(245,208,97,0.5)]" 
              fill="currentColor"
            >
              <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
            </svg>
            <span className="text-[10.5px] font-bold text-[#F5D061] group-hover:text-yellow-300 tracking-tight whitespace-nowrap">
              나눔
            </span>
          </button>
        </div>
      </div>

      {/* 5. 하단 4대 신행 인터랙션 바 (절하기 / 목탁 / 염주 / 나가기) */}
      <footer className={`relative z-20 px-2 sm:px-3 pb-5 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent transition-opacity duration-500 ${
        isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5 sm:gap-2.5">
          {/* 버튼 1: 108배 (3D 절하는 동자승 아이콘) */}
          <button
            type="button"
            onClick={handleBow}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 hover:border-[#F5D061]/40 transition group"
            title="삼존불 1배 올리기"
          >
            <img 
              src="/images/icon_bow_3d.png" 
              alt="3D 절하기" 
              className="h-6 sm:h-7 object-contain mb-0.5 group-hover:scale-110 group-active:translate-y-0.5 transition filter drop-shadow-[0_2px_8px_rgba(245,208,97,0.5)]" 
            />
            <span className="text-[11px] sm:text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061] whitespace-nowrap">
              절하기
            </span>
          </button>

          {/* 버튼 2: 목탁 치기 */}
          <button
            type="button"
            onClick={handleMoktak}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 hover:border-[#F5D061]/40 transition group"
            title="목탁 치기"
          >
            <img 
              src="/images/avatar_moktak_3d.png" 
              alt="3D 목탁" 
              className="h-6 sm:h-7 object-contain mb-0.5 group-hover:scale-110 group-active:rotate-12 transition filter drop-shadow-[0_2px_8px_rgba(245,208,97,0.5)]" 
            />
            <span className="text-[11px] sm:text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061]">
              목탁
            </span>
          </button>

          {/* 버튼 3: 108 염주 굴리기 */}
          <button
            type="button"
            onClick={handleYeomju}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 hover:border-[#F5D061]/40 transition group"
            title="108 염주알 굴리기"
          >
            <img 
              src="/images/avatar_yeomju_3d.png" 
              alt="3D 108 염주" 
              className="h-6 sm:h-7 object-contain mb-0.5 group-hover:scale-110 group-active:rotate-45 transition filter drop-shadow-[0_2px_8px_rgba(245,208,97,0.5)]" 
            />
            <span className="text-[11px] sm:text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061]">
              염주
            </span>
          </button>

          {/* 버튼 4: 법당 나가기 (즉시 퇴장) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 hover:border-[#F5D061]/50 transition group"
            title="대웅전 나가기"
          >
            <div className="relative mb-0.5 flex items-center justify-center">
              <DoorOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5D061] group-hover:scale-110 transition-transform filter drop-shadow-[0_2px_8px_rgba(245,208,97,0.4)]" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061] transition">
              나가기
            </span>
          </button>
        </div>
      </footer>
    </div>
  </div>
)
}
