import React, { useState, useEffect, useRef } from 'react'
import { X, Volume2, VolumeX, Sparkles, Heart } from 'lucide-react'

/**
 * 🪔 제주 소원사 고요 법당 (멍스테이 & 사찰 쉼터 뷰)
 * - 기존 앱 로직과 완전히 격리된 독립 힐링 컴포넌트
 * - 실시간 앰비언스 바람/풍경소리 + 108 목탁 + 합장/1배 올리기 인터랙션
 */
export default function SowonsaSanctuaryModal({ isOpen, onClose, onOpenLantern }) {
  const [isPlayingSound, setIsPlayingSound] = useState(false)
  const [actionState, setActionState] = useState('idle') // 'idle' | 'hapjang' | 'bow' | 'moktak'
  const [bowCount, setBowCount] = useState(0)
  const [moktakTapCount, setMoktakTapCount] = useState(0)
  const [actionToast, setActionToast] = useState('')

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
  const moktakAudioRef = useRef(null)
  const toastTimerRef = useRef(null)

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
  ]

  // 실시간 도량 활기 효과 (동행 불자님 모션 + 라이브 피드 + 인원 변동)
  useEffect(() => {
    if (!isOpen) return

    // 1) 좌측 동반 불자님 잔잔한 모션 주기 (8초 주기)
    const leftInterval = setInterval(() => {
      setCompanionLeftState('bow')
      setTimeout(() => setCompanionLeftState('idle'), 2200)
    }, 8500)

    // 2) 우측 동반 불자님 잔잔한 합장/참선 모션 주기 (12초 주기)
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

  // 토스트 메시지 헬퍼
  const showActionToast = (msg) => {
    setActionToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => {
      setActionToast('')
    }, 2500)
  }

  // 배경 앰비언스(바람/자연음) 토글
  const toggleSound = () => {
    if (!ambientAudioRef.current) return
    if (isPlayingSound) {
      ambientAudioRef.current.pause()
      setIsPlayingSound(false)
      showActionToast('소리가 잠시 멈췄습니다')
    } else {
      ambientAudioRef.current.play().then(() => {
        setIsPlayingSound(true)
        showActionToast('🍃 청아한 제주 소원사 도량의 바람 소리')
      }).catch(() => {
        setIsPlayingSound(false)
      })
    }
  }

  // 1) 합장하기
  const handleHapjang = () => {
    setActionState('hapjang')
    showActionToast('🙏 부처님 전 두 손 모아 간절히 합장합니다')
    setLiveStreamMsg({
      name: '나의 정진',
      action: '삼존불 전에 두 손 모아 간절히 합장하셨습니다',
      icon: '🙏'
    })
    setTimeout(() => setActionState('idle'), 2000)
  }

  // 2) 1배 올리기
  const handleBow = () => {
    setActionState('bow')
    const nextCount = bowCount + 1
    setBowCount(nextCount)
    showActionToast(`🙇 부처님 전 정성스레 ${nextCount}배를 올립니다`)
    setLiveStreamMsg({
      name: '나의 정진',
      action: `삼존불 전에 ${nextCount}배를 정성스레 올렸습니다`,
      icon: '🙇'
    })
    setTimeout(() => setActionState('idle'), 2400)
  }

  // 3) 목탁 치기
  const handleMoktak = () => {
    setActionState('moktak')
    setMoktakTapCount((prev) => prev + 1)
    try {
      if (moktakAudioRef.current) {
        moktakAudioRef.current.currentTime = 0
        moktakAudioRef.current.play().catch(() => {})
      }
    } catch {}
    showActionToast('🪵 맑은 목탁 소리로 번뇌와 잡념을 비워냅니다')
    setLiveStreamMsg({
      name: '나의 정진',
      action: '맑은 목탁 소리로 번뇌와 잡념을 비워냅니다',
      icon: '🪵'
    })
    setTimeout(() => setActionState('idle'), 800)
  }

  // 닫을 때 오디오 정지
  useEffect(() => {
    if (!isOpen && ambientAudioRef.current) {
      ambientAudioRef.current.pause()
      setIsPlayingSound(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col justify-between overflow-hidden animate-fadeIn select-none">
      {/* 1. 배경 오디오 소스 */}
      <audio ref={ambientAudioRef} src="/audio/sowonsa_wind.mp3" loop preload="auto" />
      <audio ref={moktakAudioRef} src="/audio/moktak.mp3" preload="auto" />

      {/* 2. 대웅전 실제 전경 제단 뷰 (헤더 아래로 안전하게 배치하여 삼존불 머리와 보관, 단청이 시원하게 보이도록 처리) */}
      <div className="absolute inset-x-0 top-14 sm:top-16 flex flex-col items-center pointer-events-none z-0">
        <div className="relative w-full max-w-xl aspect-[4/3] overflow-hidden">
          <img 
            src="/images/sowonsa_daewoongjeon_altar_front.jpg" 
            alt="제주 소원사 대웅전 삼존불" 
            className="w-full h-full object-contain"
          />
          {/* 상단 단청 연결부 자연스러운 음영 */}
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          {/* 하단 제단 목조 수미단 및 공양물 영역이 또렷하게 보이도록 최소한의 밑단 음영만 적용 */}
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          {/* 좌우 은은한 비네팅 */}
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />
          
          {/* 삼존불 황금빛 광배 은은한 후광 조명 효과 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,_var(--tw-gradient-stops))] from-[#FFD700]/15 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* 2-1. 법당 내부 은은한 향 연기/금빛 기운 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#FFB703]/10 via-transparent to-black/40 pointer-events-none z-[1]" />

      {/* 3. 상단 헤더 바 (산사 스타일 깔끔한 상태 표시 및 나가기) */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-2 text-white bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#F5D061]/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-xs font-serif-kr text-[#F5D061] font-bold">제주 소원사 고요 법당</span>
            <span className="text-[10px] text-[#D6CEC2] border-l border-white/20 pl-2">
              실시간 {liveDevoteeCount}명 함께 정진 중
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 소리 토글 버튼 */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2.5 rounded-full backdrop-blur-md border transition active:scale-95 ${
              isPlayingSound
                ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061] shadow-[0_0_15px_rgba(245,208,97,0.5)]'
                : 'bg-black/60 text-[#D6CEC2] border-white/20 hover:text-white'
            }`}
            title="도량 바람/풍경소리 켜기"
          >
            {isPlayingSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#D6CEC2] hover:text-white transition active:scale-95"
            title="법당 나가기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 4. 중앙 공간 (부처님 시선 + 방석 위의 나) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-8 text-center px-4">
        {/* 상단 알림 토스트 (인터랙션 피드백) */}
        {actionToast && (
          <div className="mb-auto mt-4 px-4 py-2 rounded-full bg-[#1F1914]/90 backdrop-blur-md border border-[#F5D061]/60 text-[#F5D061] text-xs font-medium shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {actionToast}
          </div>
        )}

        {/* 실시간 다른 불자님들의 정진 발원 티커 (산사 Sansa 핵심 라이브 온기) */}
        <div className="mb-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#F5D061]/25 text-[11px] text-[#E8DFD1] flex items-center gap-2 shadow-lg transition-all duration-500 max-w-xs">
          <span className="text-sm shrink-0">{liveStreamMsg.icon}</span>
          <span className="font-bold text-[#F5D061] shrink-0">{liveStreamMsg.name}</span>
          <span className="truncate text-white/80">{liveStreamMsg.action}</span>
        </div>

        {/* 법당 마루: 동료 불자님 방석 + 나의 참선 방석 (3인 도량 참선 구도) */}
        <div className="relative w-full max-w-sm flex items-end justify-center gap-3 sm:gap-6 px-2">
          {/* 좌측 동행 불자님 (제주 불자님) */}
          <div className="flex flex-col items-center opacity-75 hover:opacity-100 transition-opacity">
            <div className="px-1.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-[9px] text-[#D6CEC2] border border-white/20 mb-1">
              제주 불자님
            </div>
            <div className={`transition-all duration-500 ${
              companionLeftState === 'bow' ? 'scale-90 translate-y-2' : ''
            }`}>
              <div className="w-14 h-14 rounded-full bg-[#201A15]/80 border border-white/15 flex flex-col items-center justify-center shadow">
                <span className="text-lg">
                  {companionLeftState === 'bow' ? '🙇' : '🧘'}
                </span>
                <span className="text-[7.5px] text-[#D6CEC2]/70">
                  {companionLeftState === 'bow' ? '정성 1배' : '참선 중'}
                </span>
              </div>
              <div className="w-20 h-4 rounded-[100%] bg-gradient-to-r from-[#4A3722] via-[#6B4E2B] to-[#4A3722] mx-auto -mt-1 shadow" />
            </div>
          </div>

          {/* 중앙: 나의 참선 방석 (주인공 강조) */}
          <div className="relative flex flex-col items-center z-10 -mb-1">
            {/* 아바타 위 '나' 이름 뱃지 */}
            <div className="px-2.5 py-0.5 rounded-full bg-[#F5D061]/20 backdrop-blur-md text-[10.5px] text-[#F5D061] border border-[#F5D061]/40 mb-1.5 font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(245,208,97,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5D061] animate-ping" />
              <span>나의 참선 방석</span>
              {bowCount > 0 && <span className="text-white font-normal">({bowCount}배)</span>}
            </div>

            {/* 나의 아바타 애니메이션 모션 (합장, 절하기, 목탁) */}
            <div className={`relative transition-all duration-300 ${
              actionState === 'bow'
                ? 'scale-90 translate-y-3 opacity-90'
                : actionState === 'hapjang'
                ? 'scale-105 -translate-y-1'
                : actionState === 'moktak'
                ? 'animate-pulse'
                : ''
            }`}>
              {/* 황금빛 후광 & 메인 아바타 */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-t from-[#C59B27]/40 via-[#F5D061]/20 to-transparent p-1 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#2A231C]/95 border-2 border-[#F5D061]/70 shadow-[0_0_30px_rgba(245,208,97,0.5)] flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="text-3xl filter drop-shadow">
                    {actionState === 'bow' ? '🙇' : actionState === 'hapjang' ? '🙏' : actionState === 'moktak' ? '🪵' : '🧘'}
                  </span>
                  <span className="text-[9px] font-serif-kr text-[#F5D061] mt-0.5 font-bold">
                    {actionState === 'bow' ? '정성 1배' : actionState === 'hapjang' ? '간절 합장' : actionState === 'moktak' ? '목탁 청음' : '고요 참선'}
                  </span>
                </div>
              </div>

              {/* 중앙 명당 마루 방석 */}
              <div className="w-32 h-7 rounded-[100%] bg-gradient-to-r from-[#594228] via-[#8A6538] to-[#594228] border border-[#A8884C]/50 mx-auto -mt-2 shadow-[0_10px_25px_rgba(0,0,0,0.9)]" />
            </div>
          </div>

          {/* 우측 동행 불자님 (해운대 보살님) */}
          <div className="flex flex-col items-center opacity-75 hover:opacity-100 transition-opacity">
            <div className="px-1.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-[9px] text-[#D6CEC2] border border-white/20 mb-1">
              해운대 보살님
            </div>
            <div className={`transition-all duration-500 ${
              companionRightState === 'hapjang' ? 'scale-105 -translate-y-1' : ''
            }`}>
              <div className="w-14 h-14 rounded-full bg-[#201A15]/80 border border-white/15 flex flex-col items-center justify-center shadow">
                <span className="text-lg">
                  {companionRightState === 'hapjang' ? '🙏' : '🧘'}
                </span>
                <span className="text-[7.5px] text-[#D6CEC2]/70">
                  {companionRightState === 'hapjang' ? '간절 합장' : '참선 중'}
                </span>
              </div>
              <div className="w-20 h-4 rounded-[100%] bg-gradient-to-r from-[#4A3722] via-[#6B4E2B] to-[#4A3722] mx-auto -mt-1 shadow" />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#D6CEC2]/80 mt-3 font-serif-kr">
          "바람 소리에 귀 기울이며, 잠시 생각을 내려놓으세요."
        </p>
      </div>

      {/* 5. 하단 4대 액션 인터랙션 바 (산사 Sansa 템플 스타일 초직관 버튼) */}
      <footer className="relative z-20 px-3 pb-6 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
          {/* 버튼 1: 합장 */}
          <button
            type="button"
            onClick={handleHapjang}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 transition group"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition">🙏</span>
            <span className="text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061]">합장하기</span>
          </button>

          {/* 버튼 2: 1배 올리기 */}
          <button
            type="button"
            onClick={handleBow}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 transition group"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition">🙇</span>
            <span className="text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061]">1배 올리기</span>
          </button>

          {/* 버튼 3: 목탁 치기 */}
          <button
            type="button"
            onClick={handleMoktak}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 transition group"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition">🪵</span>
            <span className="text-xs font-bold text-[#E8DFD1] group-hover:text-[#F5D061]">목탁 치기</span>
          </button>

          {/* 버튼 4: 소원등 켜기 (소원사 핵심 연동) */}
          <button
            type="button"
            onClick={() => {
              onClose()
              if (onOpenLantern) onOpenLantern()
            }}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-gradient-to-b from-[#F5D061] to-[#C59B27] text-[#1B1815] active:scale-95 border border-[#FFF275] shadow-[0_0_15px_rgba(245,208,97,0.4)] transition group font-bold"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition">🪔</span>
            <span className="text-xs">소원등 켜기</span>
          </button>
        </div>
      </footer>
    </div>
  )
}
