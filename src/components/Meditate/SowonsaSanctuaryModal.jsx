import React, { useState, useEffect, useRef } from 'react'
import { X, Volume2, VolumeX, Sparkles, DoorOpen, Share2, Award, ChevronRight } from 'lucide-react'
import { awardMerit, getDailyMeritInfo } from '../../lib/meritSystem'

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

  // 인터랙션 상태
  const [actionState, setActionState] = useState('idle') // 'idle' | 'hapjang' | 'bow' | 'moktak' | 'yeomju'
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
  const [showExitCertModal, setShowExitCertModal] = useState(false)

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
  const toastTimerRef = useRef(null)
  const lastActionTimeRef = useRef(0)

  // 1회당 최소 2.5초 간격 엄수 (대표님 지시: 정성스러운 호흡과 무분별한 연타 방지)
  const MIN_ACTION_INTERVAL_MS = 2500

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

  // 2) 스님 반야심경 염불 토글
  const toggleChant = (e) => {
    e?.stopPropagation()
    if (!chantAudioRef.current) return
    if (isPlayingChant) {
      chantAudioRef.current.pause()
      setIsPlayingChant(false)
      showActionToast('염불 소리가 멈췄습니다')
    } else {
      chantAudioRef.current.play().then(() => {
        setIsPlayingChant(true)
        showActionToast('📿 은은한 스님의 반야심경 염불을 봉독합니다')
      }).catch(() => {
        setIsPlayingChant(false)
      })
    }
  }

  // 3) 합장하기
  const handleHapjang = (e) => {
    e?.stopPropagation()
    if (!canExecuteAction()) return
    setActionState('hapjang')
    showActionToast('🙏 부처님 전 두 손 모아 간절히 합장합니다')
    setLiveStreamMsg({
      name: currentUser?.name || '나의 정진',
      action: '삼존불 전에 두 손 모아 간절히 합장하셨습니다',
      icon: '🙏'
    })
    setTimeout(() => setActionState('idle'), 2500)
  }

  // 4) 1배 올리기 (108배 마일스톤 축하)
  const handleBow = (e) => {
    e?.stopPropagation()
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
    setTimeout(() => setActionState('idle'), 2500)
  }

  // 5) 목탁 치기
  const handleMoktak = (e) => {
    e?.stopPropagation()
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
    setTimeout(() => setActionState('idle'), 2500)
  }

  // 6) 108 염주알 굴리기
  const handleYeomju = (e) => {
    e?.stopPropagation()
    if (!canExecuteAction()) return
    setActionState('yeomju')
    const nextYeomju = yeomjuCount >= 108 ? 1 : yeomjuCount + 1
    setYeomjuCount(nextYeomju)
    setSessionYeomjus(prev => prev + 1)

    try {
      if (moktakAudioRef.current) {
        moktakAudioRef.current.currentTime = 0
        moktakAudioRef.current.volume = 0.5
        moktakAudioRef.current.play().catch(() => {})
      }
    } catch {}

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
    setTimeout(() => setActionState('idle'), 2500)
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

  // 닫을 때 모든 오디오 정지
  useEffect(() => {
    if (!isOpen) {
      if (ambientAudioRef.current) ambientAudioRef.current.pause()
      if (chantAudioRef.current) chantAudioRef.current.pause()
      setIsPlayingSound(false)
      setIsPlayingChant(false)
      setIsZenMode(false)
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
      <audio ref={chantAudioRef} src="/audio/prajna_chanting.mp3" loop preload="auto" />
      <audio ref={moktakAudioRef} src="/audio/moktak.mp3" preload="auto" />

      {/* 2. 대웅전 옻칠 대청마루 바닥 레이어 (z-0: 제단 밑바닥과 바닥 전체에 자연스럽게 깔림) */}
      <div 
        className="absolute inset-x-0 bottom-0 top-[260px] sm:top-[300px] bg-cover bg-bottom pointer-events-none z-0 opacity-75"
        style={{ backgroundImage: "url('/images/temple_wood_floor.jpg')" }}
      >
        {/* 하단 액션바 영역 은은한 페이드 */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

        {/* 제단 촛불이 마루에 비치는 황금빛 온기 반사광 효과 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_15%,_var(--tw-gradient-stops))] from-[#FFB703]/25 via-transparent to-transparent pointer-events-none" />
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

      {/* 2-2. 법당 내부 은은한 향 연기/금빛 기운 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#FFB703]/10 via-transparent to-black/30 pointer-events-none z-[1]" />

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
          {/* 스님 염불 듣기 토글 버튼 (산사 스타일) */}
          <button
            type="button"
            onClick={toggleChant}
            className={`px-2.5 py-1.5 rounded-full backdrop-blur-md border text-[11px] font-serif-kr flex items-center gap-1.5 transition active:scale-95 ${
              isPlayingChant
                ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061] font-bold shadow-[0_0_12px_rgba(245,208,97,0.5)]'
                : 'bg-black/60 text-[#D6CEC2] border-white/20 hover:text-white'
            }`}
            title="스님 반야심경 염불 듣기"
          >
            <img src="/images/avatar_yeomju_3d.png" alt="3D 염주" className="w-3.5 h-3.5 object-contain inline" />
            <span>{isPlayingChant ? '염불 중' : '염불 듣기'}</span>
            {isPlayingChant && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shrink-0" />}
          </button>

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
              setShowExitCertModal(true)
            }}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#D6CEC2] hover:text-white transition active:scale-95"
            title="대웅전 참배 회향 (공덕장 & 카카오톡 공유)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 우측 세로 정진 기록 위젯 (절 N배 / 목탁 N타 / 염주 N알 세로 정렬 HUD) */}
      <div className={`absolute right-3 sm:right-4 top-[38%] z-20 transition-opacity duration-500 ${
        isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="px-2.5 py-2 rounded-2xl bg-black/35 backdrop-blur-md border border-[#F5D061]/30 shadow-lg flex flex-col items-center gap-1.5 text-xs font-serif-kr min-w-[56px] sm:min-w-[62px]">
          <div className="w-full text-center border-b border-white/10 pb-1">
            <span className="font-bold text-[#F5D061] text-xs sm:text-[13px] tracking-tight">{bowCount}배</span>
          </div>
          <div className="w-full text-center border-b border-white/10 pb-1">
            <span className="font-bold text-[#F5D061] text-xs sm:text-[13px] tracking-tight">{moktakTapCount}타</span>
          </div>
          <div className="w-full text-center">
            <span className="font-bold text-[#F5D061] text-xs sm:text-[13px] tracking-tight">{yeomjuCount}알</span>
          </div>
        </div>
      </div>

      {/* 4. 중앙 공간 (부처님 시선 + 방석 위의 나) */}
      <div className={`relative z-10 flex-1 flex flex-col items-center justify-end pb-4 sm:pb-6 text-center px-3 transition-opacity duration-500 ${
        isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>


        {/* 원경(중간 거리) 고요한 도량 빈 방석 2개 (산사 템플 스타일 3D 원근감) */}
        <div className="w-full max-w-xs flex justify-around px-10 mb-2 opacity-35 pointer-events-none">
          <div className="w-14 h-3 rounded-[100%] bg-gradient-to-r from-[#594228] via-[#8A6538] to-[#594228] border border-[#A8884C]/40 shadow-sm" />
          <div className="w-14 h-3 rounded-[100%] bg-gradient-to-r from-[#594228] via-[#8A6538] to-[#594228] border border-[#A8884C]/40 shadow-sm" />
        </div>

        {/* 법당 마루: 동료 불자님 방석 + 나의 참선 방석 (3D 동자승 아바타 실사 구도) */}
        <div className="relative w-full max-w-sm flex items-end justify-center gap-2 sm:gap-4 px-1">
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

          {/* 중앙: 나의 참선 방석 (3D 동자승 대형 주인공 - '나의 방석' 명패 제거로 시야 확보) */}
          <div className="relative flex flex-col items-center z-10 -mb-1">
            {/* 나의 3D 동자승 아바타 모션 (크고 당당하게 전면 배치) */}
            <div className={`relative flex flex-col items-center transition-all duration-300 ${
              actionState === 'bow'
                ? 'scale-95 translate-y-2'
                : actionState === 'hapjang'
                ? 'scale-105 -translate-y-1'
                : actionState === 'moktak'
                ? 'animate-pulse'
                : actionState === 'yeomju'
                ? 'scale-105'
                : ''
            }`}>
              {/* 은은한 부처님 가피 후광 오라 */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFD700]/25 via-transparent to-transparent pointer-events-none scale-125" />

              {/* 3D 동자승 실사 캐릭터 (절하기 vs 참선) */}
              <div className="relative z-10 h-28 sm:h-34 flex items-end justify-center filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)]">
                {actionState === 'bow' ? (
                  <img 
                    src="/images/avatar_monk_bow.png" 
                    alt="1배 올리는 동자승" 
                    className="h-24 sm:h-30 object-contain transition-transform duration-300"
                  />
                ) : (
                  <img 
                    src="/images/avatar_monk_meditate.png" 
                    alt="고요히 참선 중인 동자승" 
                    className="h-28 sm:h-34 object-contain transition-transform duration-300"
                  />
                )}
              </div>

              {/* 도량 비단 방석 */}
              <div className="w-34 sm:w-42 h-7 sm:h-8 rounded-[100%] bg-gradient-to-r from-[#6E4F28] via-[#A87B3F] to-[#6E4F28] border-2 border-[#E5B556]/60 mx-auto -mt-3 shadow-[0_12px_25px_rgba(0,0,0,0.95)] relative z-0" />

              {/* 방석 좌측 실제 3D 108 염주 (목탁과 완벽한 시각적 균형을 이루도록 정밀 축소) */}
              <div 
                onClick={handleYeomju}
                className={`absolute -left-2 sm:-left-3.5 bottom-0.5 z-20 cursor-pointer transition-transform duration-200 ${
                  actionState === 'yeomju' ? 'scale-125 rotate-12' : 'hover:scale-110 active:scale-95'
                }`}
                title="108 염주알 굴리기"
              >
                <img 
                  src="/images/avatar_yeomju_3d.png" 
                  alt="3D 108 침향목 염주" 
                  className="w-9 sm:w-10.5 object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                />
                {/* 염주 굴릴 때 황금빛 염송 파동 */}
                {actionState === 'yeomju' && (
                  <span className="absolute inset-0 rounded-full border-2 border-[#F5D061] animate-ping pointer-events-none" />
                )}
              </div>

              {/* 방석 옆 실제 3D 목탁과 목탁채 (터치하여 직접 칠 수 있는 인터랙션) */}
              <div 
                onClick={handleMoktak}
                className={`absolute -right-3 sm:-right-5 bottom-0 z-20 cursor-pointer transition-transform duration-200 ${
                  actionState === 'moktak' ? 'scale-125 -rotate-12' : 'hover:scale-110 active:scale-95'
                }`}
                title="목탁 치기"
              >
                <img 
                  src="/images/avatar_moktak_3d.png" 
                  alt="3D 황금 목탁과 목탁채" 
                  className="w-12 sm:w-14 object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                />
                {/* 목탁 타종 시 황금빛 음파 파동 이펙트 */}
                {actionState === 'moktak' && (
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

        {/* 동자승 아래 정진 피드백 팝업 (대표님 지시: 상단 시야 가림 방지 및 동자승 바로 아래 배치) */}
        {actionToast ? (
          <div className="mt-2.5 mb-1 px-3.5 py-1.5 rounded-full bg-[#1F1914]/90 backdrop-blur-md border border-[#F5D061]/70 text-[#F5D061] text-xs font-medium shadow-[0_4px_20px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200 max-w-sm break-keep">
            {actionToast}
          </div>
        ) : (
          /* 실시간 다른 불자님들의 정진 발원 티커 */
          <div className="mt-2.5 mb-1 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#F5D061]/25 text-[10.5px] text-[#E8DFD1] flex items-center gap-1.5 shadow-lg transition-all duration-500 max-w-xs">
            <span className="text-xs shrink-0">{liveStreamMsg.icon}</span>
            <span className="font-bold text-[#F5D061] shrink-0">{liveStreamMsg.name}</span>
            <span className="truncate text-white/85">{liveStreamMsg.action}</span>
          </div>
        )}

        <p className="text-[10px] sm:text-[10.5px] text-[#D6CEC2]/75 mt-1 font-serif-kr">
          "바람 소리와 염불에 귀 기울이며, 잠시 생각을 내려놓으세요."
        </p>
      </div>

      {/* 5. 하단 5대 신행 & 소원등 인터랙션 바 */}
      <footer className={`relative z-20 px-2 sm:px-3 pb-5 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent transition-opacity duration-500 ${
        isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 sm:gap-2">
          {/* 버튼 1: 합장 */}
          <button
            type="button"
            onClick={handleHapjang}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 transition group ${actionState === 'hapjang' ? 'bg-[#F5D061]/25 border-[#F5D061]/60 shadow-[0_0_12px_rgba(245,208,97,0.4)]' : ''}`}
          >
            <span className="text-lg sm:text-xl mb-0.5 group-hover:scale-110 transition">🙏</span>
            <span className="text-[10px] sm:text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061]">합장</span>
          </button>

          {/* 버튼 2: 108배 (3D 절하는 동자승 아이콘) */}
          <button
            type="button"
            onClick={handleBow}
            className="flex flex-col items-center justify-center py-2 px-0.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 transition group"
          >
            <img 
              src="/images/icon_bow_3d.png" 
              alt="3D 절하기" 
              className="h-6 sm:h-7 object-contain mb-0.5 group-hover:scale-110 group-active:translate-y-0.5 transition filter drop-shadow-[0_2px_8px_rgba(245,208,97,0.5)]" 
            />
            <span className="text-[10px] sm:text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061] whitespace-nowrap">
              절하기
            </span>
          </button>

          {/* 버튼 3: 목탁 치기 */}
          <button
            type="button"
            onClick={handleMoktak}
            className="flex flex-col items-center justify-center py-2 px-0.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 transition group"
          >
            <img 
              src="/images/avatar_moktak_3d.png" 
              alt="3D 목탁" 
              className="h-6 sm:h-7 object-contain mb-0.5 group-hover:scale-110 group-active:rotate-12 transition filter drop-shadow-[0_2px_8px_rgba(245,208,97,0.5)]" 
            />
            <span className="text-[10px] sm:text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061]">
              목탁
            </span>
          </button>

          {/* 버튼 4: 108 염주 굴리기 */}
          <button
            type="button"
            onClick={handleYeomju}
            className="flex flex-col items-center justify-center py-2 px-0.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 transition group"
          >
            <img 
              src="/images/avatar_yeomju_3d.png" 
              alt="3D 108 염주" 
              className="h-6 sm:h-7 object-contain mb-0.5 group-hover:scale-110 group-active:rotate-45 transition filter drop-shadow-[0_2px_8px_rgba(245,208,97,0.5)]" 
            />
            <span className="text-[10px] sm:text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061]">
              염주
            </span>
          </button>

          {/* 버튼 5: 법당 나가기 (참배 회향 공덕장 & 카톡 복 나눔 팝업 오픈) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowExitCertModal(true)
            }}
            className="flex flex-col items-center justify-center py-2 px-0.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 hover:border-[#F5D061]/50 transition group"
            title="대웅전 참배 회향 (공덕장 보기)"
          >
            <div className="relative mb-0.5 flex items-center justify-center">
              <DoorOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5D061] group-hover:scale-110 transition-transform filter drop-shadow-[0_2px_8px_rgba(245,208,97,0.4)]" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061] transition">
              회향·나가기
            </span>
          </button>
        </div>
      </footer>

      {/* 📜 [대웅전 참배 회향 공덕장 모달 & 카카오톡 복 나눔] */}
      {showExitCertModal && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn select-none"
        >
          <div className="w-full max-w-[350px] sm:max-w-[390px] max-h-[96dvh] overflow-y-auto bg-gradient-to-b from-[#251F19] via-[#1B1713] to-[#120F0D] text-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border-2 border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.4)] relative my-auto">
            {/* 상단 장식 빛무리 */}
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-[#F5D061]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setShowExitCertModal(false)}
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-[#E5DCD0] flex items-center justify-center transition active:scale-90 z-10 cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* 공덕장 내부 본문 카드 (전통 한지 & 황금 테두리 - 컴팩트 최적화) */}
            <div
              className="p-2 sm:p-3 rounded-xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EEDB] text-[#241F1A] border border-[#C59B27] relative shadow-md"
              style={{
                boxShadow: '0 4px 16px rgba(197, 155, 39, 0.15)',
              }}
            >
              {/* 내부 전통 괘선 (이중 금선 프레임) */}
              <div className="border border-[#D4AF37]/60 rounded-lg p-2 sm:p-2.5 bg-white/60">
                {/* 상단 사찰 표기 */}
                <div className="flex items-center justify-center gap-1.5">
                  <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#C59B27]" />
                  <span className="text-[9.5px] text-[#8C6D1F] font-serif-kr tracking-[0.2em] font-extrabold">
                    卍 제주 소원사 卍
                  </span>
                  <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#C59B27]" />
                </div>

                {/* 공덕장 대명칭 */}
                <h3 className="font-serif-kr text-[18px] sm:text-[20px] font-black text-[#523505] text-center tracking-[0.12em] mt-0.5 drop-shadow-xs">
                  대웅전 참배 회향 공덕장
                </h3>

                <div className="my-1.5 border-t border-[#C59B27]/40 border-dashed" />

                {/* 수여 대상 정보 */}
                <div className="space-y-1 text-[11px] sm:text-xs text-[#3A3228] font-serif-kr">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C6D1F] font-bold text-[11px]">정진 불자</span>
                    <span className="font-black text-[#1C1814] text-[12px] sm:text-[13px]">
                      {currentUser?.name || '소원사 정진 불자'}
                      {currentUser?.dharma_name ? ` (${currentUser.dharma_name})` : ''} 합장
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C6D1F] font-bold text-[11px]">참배 도량</span>
                    <span className="font-bold text-[#6B4E08] text-[11.5px] sm:text-[12px]">
                      제주 소원사 대웅전 (삼존불 전)
                    </span>
                  </div>
                </div>

                {/* 중앙 참배 정진 통계 박스 */}
                <div className="mt-2 p-2 rounded-lg bg-[#F8F3E8] border border-[#D5C59B] text-center shadow-[inset_0_1px_2px_rgba(197,155,39,0.06)]">
                  <div className="text-[9.5px] font-extrabold text-[#8A6510] bg-[#FAF3DF] px-2 py-0.5 rounded border border-[#E5D399] inline-block mb-1.5">
                    오늘 올린 삼보 참배 정진
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div className="p-1 rounded bg-white/80 border border-[#E5D399]/80">
                      <div className="text-[9px] text-[#786134]">절하기</div>
                      <div className="font-black text-[#8A4B08] text-xs sm:text-sm font-serif-kr">
                        {bowCount || sessionBows || 1}배
                      </div>
                    </div>
                    <div className="p-1 rounded bg-white/80 border border-[#E5D399]/80">
                      <div className="text-[9px] text-[#786134]">목탁 정진</div>
                      <div className="font-black text-[#8A4B08] text-xs sm:text-sm font-serif-kr">
                        {moktakTapCount || sessionMoktaks || 0}타
                      </div>
                    </div>
                    <div className="p-1 rounded bg-white/80 border border-[#E5D399]/80">
                      <div className="text-[9px] text-[#786134]">염주 정진</div>
                      <div className="font-black text-[#8A4B08] text-xs sm:text-sm font-serif-kr">
                        {yeomjuCount || sessionYeomjus || 0}알
                      </div>
                    </div>
                  </div>
                  <p className="font-serif-kr text-[10.5px] sm:text-[11px] font-bold text-[#423218] mt-1.5 leading-snug break-keep">
                    “삼보에 정성껏 참배 올리신 불자님의 일상에 부처님의 가피가 늘 가득하길 발원합니다.”
                  </p>
                </div>

                {/* 하단 일자 및 주지 직인 서명 */}
                <div className="mt-2 pt-1 border-t border-[#C59B27]/40 text-center font-serif-kr space-y-0.5 w-full">
                  <div className="text-[10px] text-[#736352] font-medium">
                    {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <span className="font-black text-[#4F3906] text-[12px] sm:text-[13px] tracking-wide">
                      제주 소원사 주지 합장
                    </span>
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-[2px] bg-[#AB2317] text-white text-[9.5px] font-black border border-[#7D150C] shadow-xs select-none shrink-0" title="합장 직인">
                      🙏
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 💌 가족·도반에게 참배 복 나누기 (카톡 공유 & 다이렉트 링크) */}
            <div className="mt-2 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  if (handleShareSanctuary) {
                    handleShareSanctuary({
                      believerName: currentUser?.name,
                      bowCount: bowCount || sessionBows || 1,
                      moktakCount: moktakTapCount || sessionMoktaks,
                      yeomjuCount: yeomjuCount || sessionYeomjus,
                    })
                  }
                  if (showToast) {
                    showToast('💌 가족·도반에게 대웅전 참배 회향 카드가 공유되었습니다.')
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FEE500] via-[#FDD835] to-[#FBC02D] hover:brightness-105 active:scale-95 text-[#3C1E1E] font-black text-[12.5px] sm:text-xs shadow-[0_2px_12px_rgba(253,216,53,0.35)] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#3C1E1E] shrink-0" />
                <span>가족·도반에게 참배 복(福) 나누기 (카톡)</span>
              </button>


              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowExitCertModal(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-medium text-[11px] transition active:scale-95 border border-white/10 cursor-pointer"
                >
                  조금 더 참배하기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitCertModal(false)
                    onClose()
                  }}
                  className="flex-1 py-2 rounded-lg bg-[#3B2C1B] hover:bg-[#4D3A24] text-[#F5D061] font-bold text-[11px] transition active:scale-95 border border-[#D4A024]/40 cursor-pointer"
                >
                  대웅전 나가기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
