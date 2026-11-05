import React from 'react'
import {
  Megaphone,
  Calendar,
  Volume2,
  Share2,
  RefreshCw,
  Headphones,
  Pause,
  Play,
  ChevronUp,
  ListMusic,
  ChevronRight,
  ShieldCheck,
  Maximize2,
  Coffee,
  Clock,
  CheckCircle2,
  Phone,
  Flame,
  MapPin,
  Copy,
  Globe,
} from 'lucide-react'

export default function HomeTab({
  setShowSanctuaryModal,
  heroSlideIdx,
  setHeroSlideIdx,
  HERO_SLIDES,
  setActiveTab,
  playSingingBowlSound,
  getTodayLunarAndJaeil,
  handleShareDailyQuote,
  DAILY_QUOTES,
  quoteIdx,
  setQuoteIdx,
  autoVoiceEnabled,
  speakingId,
  startSpeech,
  toggleSpeech,
  showToast,
  healingAudioTrack,
  setHealingAudioTrack,
  HEALING_AUDIO_TRACKS,
  isHealingPlaying,
  handleToggleHealingPlay,
  isPlayerExpanded,
  setIsPlayerExpanded,
  showFullAudioModal,
  setShowFullAudioModal,
  sleepTimerMinutes,
  sleepTimerSecondsLeft,
  handleSetSleepTimer,
  playMoktakSound,
  setShow108MoktakModal,
  notices,
  activeNoticeIdx,
  setActiveNoticeIdx,
  setSelectedNotice,
  setShowNoticeModal,
  setShowNoticeListModal,
  currentUser,
  wishName,
  setWishName,
  wishPhone,
  setWishPhone,
  showVisitForm,
  setShowVisitForm,
  visitDate,
  setVisitDate,
  visitTime,
  setVisitTime,
  VISIT_TIME_SLOTS,
  visitHeadcount,
  setVisitHeadcount,
  visitPurpose,
  setVisitPurpose,
  visitMemo,
  setVisitMemo,
  handleVisitSubmit,
  handle108MoktakTap,
  isHealingVoiceOn,
}) {
  const currentQuote = DAILY_QUOTES[quoteIdx] || DAILY_QUOTES[0]

  return (
<main className="flex-1 flex flex-col gap-3.5 px-2 py-3.5">
            {/* 히어로 3종 동적 가로 슬라이딩 캐러셀 (지인 피드백: 좌우로 스르륵 넘어가는 동적 효과) */}
            {(() => {
              const slide = HERO_SLIDES[heroSlideIdx] || HERO_SLIDES[0]
              return (
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#D8CBB8] min-h-[224px] flex flex-col justify-between p-4 bg-[#161310]">
                  {/* 좌우 동적 슬라이딩 이미지 트랙 */}
                  <div
                    className="absolute inset-0 flex transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${heroSlideIdx * 100}%)` }}
                  >
                    {HERO_SLIDES.map((s, idx) => (
                      <div key={s.id} className="relative w-full h-full shrink-0">
                        <img
                          src={s.image}
                          alt={s.titleHighlight}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          className="w-full h-full object-cover brightness-105"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161310]/95 via-[#161310]/50 to-black/25 pointer-events-none" />

                  {/* 상단 배지 + 우측 슬라이드 인디케이터 점 (1/3) */}
                  <div className="relative z-10 flex justify-between items-center gap-2 mb-5">
                    <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-sm text-[#F5D061] text-[11px] font-semibold border border-[#F5D061]/45 flex items-center gap-2 whitespace-nowrap shadow-sm">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5D061] opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5D061]" />
                      </span>
                      {slide.badge}
                    </span>

                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full border border-white/15 shrink-0">
                      {HERO_SLIDES.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setHeroSlideIdx(idx)}
                          aria-label={`${idx + 1}번 배너 보기`}
                          className={`h-2 rounded-full transition-all ${
                            idx === heroSlideIdx
                              ? 'w-5 bg-[#F5D061]'
                              : 'w-2 bg-white/45 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 하단 타이틀 & 설명 & 바로가기 버튼 */}
                  <div className="relative z-10 text-white pt-1 pb-0.5">
                    <h1 className="font-serif-kr text-xl sm:text-2xl font-bold leading-tight mb-1.5 break-keep">
                      {slide.titlePrefix}{' '}
                      <span className="text-[#F5D061] underline decoration-[#F5D061]/50 underline-offset-4 whitespace-nowrap">
                        {slide.titleHighlight}
                      </span>
                    </h1>
                    <p className="text-xs text-[#E8DFD1] leading-relaxed break-keep">
                      {slide.description}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playMoktakSound()
                          setActiveTab(slide.targetTab)
                        }}
                        className="px-3 py-1 rounded-lg bg-[#F5D061]/20 hover:bg-[#F5D061]/30 text-[#F5D061] border border-[#F5D061]/40 text-[11px] font-bold transition whitespace-nowrap"
                      >
                        {slide.ctaLabel}
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setHeroSlideIdx(
                              (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                            )
                          }
                          className="w-6 h-6 rounded-full bg-black/55 text-[#F5D061] border border-[#F5D061]/30 text-xs font-bold flex items-center justify-center hover:bg-black/80 transition"
                          aria-label="이전 배너"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setHeroSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)
                          }
                          className="w-6 h-6 rounded-full bg-black/55 text-[#F5D061] border border-[#F5D061]/30 text-xs font-bold flex items-center justify-center hover:bg-black/80 transition"
                          aria-label="다음 배너"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* 👑 [시니어 맞춤 6대 핵심 비주얼 퀵 메뉴판] - 아이콘 세로 위치 및 텍스트 베이스라인 완전 일치 정돈 */}
            <section className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#E6DEC8]">
              {/* 단정하고 맑은 한 줄 타이틀 (군더더기 없는 절제의 미) */}
              <div className="flex items-center gap-1.5 mb-2.5 px-0.5">
                <span className="text-xs">🪷</span>
                <h3 className="font-serif-kr text-[12.5px] sm:text-[13px] font-bold text-[#2B1F11] tracking-tight">
                  매일 기도와 공덕 쌓기
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {/* 1) 대웅전 참배 (✨ 참배 동선 1순위: 부처님 전 참선 정진) */}
                <button
                  type="button"
                  onClick={() => {
                    playSingingBowlSound()
                    if (setShowSanctuaryModal) setShowSanctuaryModal(true)
                  }}
                  className="pt-3.5 pb-2.5 px-1.5 rounded-xl bg-gradient-to-b from-[#FFFDF5] via-[#FFF6DC] to-[#FCE8B3] hover:from-[#FFF9EB] hover:to-[#FBDD96] border-2 border-[#D4A024] flex flex-col items-center justify-start text-center transition cursor-pointer active:scale-95 shadow-[0_3px_12px_rgba(212,160,36,0.22)] group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF0B3] via-[#F5D061] to-[#C59B27] text-white flex items-center justify-center shadow-sm mb-1.5 shrink-0 group-hover:scale-105 transition-transform overflow-hidden p-1 border border-[#FFF8DC]">
                    <img src="/images/icon_monk_meditate_front.png" alt="대웅전 참배" className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="h-8 sm:h-9 flex items-center justify-center w-full px-0.5">
                    <span className="font-serif-kr text-[11.5px] sm:text-xs font-black text-[#2B1F11] tracking-tight leading-tight text-center break-keep">
                      대웅전 참배
                    </span>
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-[#8C6D15] font-bold mt-0.5 whitespace-nowrap block">
                    부처님 전 참선 정진
                  </span>
                </button>

                {/* 2) 소원등 켜기 (✨ 참배 동선 2순위: 부처님 전 등불 공양) */}
                <button
                  type="button"
                  onClick={() => {
                    playSingingBowlSound()
                    setActiveTab('lantern')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="pt-3.5 pb-2.5 px-1.5 rounded-xl bg-gradient-to-b from-[#FFFDF5] via-[#FFF6DC] to-[#FCE8B3] hover:from-[#FFF9EB] hover:to-[#FBDD96] border-2 border-[#D4A024] flex flex-col items-center justify-start text-center transition cursor-pointer active:scale-95 shadow-[0_3px_12px_rgba(212,160,36,0.22)] group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E25C2B] to-[#F4B41A] text-white flex items-center justify-center shadow-sm mb-1.5 shrink-0 group-hover:scale-105 transition-transform p-2 ring-2 ring-[#F4B41A]/30">
                    <Flame className="w-6 h-6 fill-current text-white drop-shadow-sm" />
                  </div>
                  <div className="h-8 sm:h-9 flex items-center justify-center w-full px-0.5">
                    <span className="font-serif-kr text-[11.5px] sm:text-xs font-black text-[#2B1F11] tracking-tight leading-tight text-center break-keep">
                      소원등 켜기
                    </span>
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-[#8C6D15] font-bold mt-0.5 whitespace-nowrap block">
                    1일등 · 100일등
                  </span>
                </button>

                {/* 3) 한줄 사경 (✨ 참배 동선 3순위: 지혜 사경 정진) */}
                <button
                  type="button"
                  onClick={() => {
                    playSingingBowlSound()
                    setActiveTab('sutra')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="pt-3.5 pb-2.5 px-1.5 rounded-xl bg-gradient-to-b from-[#FFFDF5] via-[#FFF6DC] to-[#FCE8B3] hover:from-[#FFF9EB] hover:to-[#FBDD96] border-2 border-[#D4A024] flex flex-col items-center justify-start text-center transition cursor-pointer active:scale-95 shadow-[0_3px_12px_rgba(212,160,36,0.22)] group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8C6D15] to-[#C59B27] text-white flex items-center justify-center text-xl shadow-sm mb-1.5 shrink-0 group-hover:scale-105 transition-transform">
                    ✍️
                  </div>
                  <div className="h-8 sm:h-9 flex items-center justify-center w-full px-0.5">
                    <span className="font-serif-kr text-[11.5px] sm:text-xs font-black text-[#2B1F11] tracking-tight leading-tight text-center break-keep">
                      한줄 사경
                    </span>
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-[#8C6D15] font-bold mt-0.5 whitespace-nowrap block">
                    지혜 정진 사경
                  </span>
                </button>

                {/* 4) 법음 · 찬불가 */}
                <button
                  type="button"
                  onClick={() => {
                    playSingingBowlSound()
                    setIsPlayerExpanded(true)
                    const el = document.getElementById('healing-audio-section')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="pt-3.5 pb-2.5 px-1.5 rounded-xl bg-gradient-to-b from-[#FCFBF8] to-[#F5F1E8] hover:from-[#F7F3EA] hover:to-[#ECE6D8] border border-[#E2DDD2] flex flex-col items-center justify-start text-center transition cursor-pointer active:scale-95 shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4A3B29] to-[#2B231A] text-[#F5D061] flex items-center justify-center text-xl shadow-xs mb-1.5 shrink-0 border border-[#C59B27]/30 group-hover:scale-105 transition-transform">
                    🎵
                  </div>
                  <div className="h-8 sm:h-9 flex items-center justify-center w-full px-0.5">
                    <span className="font-serif-kr text-[11.5px] sm:text-xs font-bold text-[#3B2F21] tracking-tight leading-tight text-center break-keep">
                      법음 · 찬불가
                    </span>
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-[#9E907E] font-medium mt-0.5 whitespace-nowrap block">
                    독경 & 소원사노래
                  </span>
                </button>

                {/* 5) 사시예불 축원 */}
                <button
                  type="button"
                  onClick={() => {
                    playSingingBowlSound()
                    const el = document.getElementById('sasi-prayer-section')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="pt-3.5 pb-2.5 px-1.5 rounded-xl bg-gradient-to-b from-[#FCFBF8] to-[#F5F1E8] hover:from-[#F7F3EA] hover:to-[#ECE6D8] border border-[#E2DDD2] flex flex-col items-center justify-start text-center transition cursor-pointer active:scale-95 shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8C4A28] to-[#A86432] text-white flex items-center justify-center text-xl shadow-xs mb-1.5 shrink-0 group-hover:scale-105 transition-transform">
                    🔔
                  </div>
                  <div className="h-8 sm:h-9 flex items-center justify-center w-full px-0.5">
                    <span className="font-serif-kr text-[11.5px] sm:text-xs font-bold text-[#3B2F21] tracking-tight leading-tight text-center break-keep">
                      사시예불 축원
                    </span>
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-[#9E907E] font-medium mt-0.5 whitespace-nowrap block">
                    매일 오전 10시
                  </span>
                </button>

                {/* 6) 차 · 공양 예약 */}
                <button
                  type="button"
                  onClick={() => {
                    playSingingBowlSound()
                    setShowVisitForm(true)
                    const el = document.getElementById('visit-reserve-section')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="pt-3.5 pb-2.5 px-1.5 rounded-xl bg-gradient-to-b from-[#FCFBF8] to-[#F5F1E8] hover:from-[#F7F3EA] hover:to-[#ECE6D8] border border-[#E2DDD2] flex flex-col items-center justify-start text-center transition cursor-pointer active:scale-95 shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6B5A45] to-[#544634] text-white flex items-center justify-center text-xl shadow-xs mb-1.5 shrink-0 group-hover:scale-105 transition-transform">
                    ☕
                  </div>
                  <div className="h-8 sm:h-9 flex items-center justify-center w-full px-0.5">
                    <span className="font-serif-kr text-[11.5px] sm:text-xs font-bold text-[#3B2F21] tracking-tight leading-tight text-center break-keep">
                      차 · 공양 예약
                    </span>
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-[#9E907E] font-medium mt-0.5 whitespace-nowrap block">
                    사찰 무료 대접
                  </span>
                </button>
              </div>
            </section>

            
            {/* 🍃 [산사 Sansa 템플 감성] 제주 소원사 3D 고요 법당 쉼터 배너 */}
            <div 
              onClick={() => {
                playSingingBowlSound()
                if (setShowSanctuaryModal) setShowSanctuaryModal(true)
              }}
              className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#1F1914] via-[#2D2319] to-[#1F1914] text-white border-2 border-[#D4AF37]/60 shadow-lg cursor-pointer hover:border-[#F5D061] transition active:scale-[0.99] relative overflow-hidden group"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                style={{ backgroundImage: "url('/images/sowonsa_daewoongjeon_altar_front.jpg')" }}
              />
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F5D061]/20 border border-[#F5D061]/40 text-[#F5D061] text-[10.5px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <span>대웅전 참배</span>
                    </span>
                    <span className="text-[11px] text-[#C2B6A6] whitespace-nowrap truncate">잠깐 쉬어가도 괜찮아요 🍃</span>
                  </div>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-white group-hover:text-[#F5D061] transition whitespace-nowrap tracking-tight">
                    대웅전 참선 입장하기
                  </h3>
                  <p className="text-[11px] text-[#A89D8E] mt-0.5 truncate">
                    도량 바람 소리 듣기 · 부처님 전 1배 올리기 · 목탁 치기
                  </p>
                </div>
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-[#FFF0B3] via-[#F5D061] to-[#C59B27] border-2 border-[#FFF8DC] flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(245,208,97,0.45)] shrink-0 group-hover:scale-105 transition-all duration-300 p-1 relative overflow-hidden">
                  <img 
                    src="/images/icon_monk_meditate_front.png" 
                    alt="3D 참선 동자승" 
                    className="w-full h-full object-contain filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" 
                  />
                  {/* 황금빛 펄스 광채 */}
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 오늘의 부처님 말씀 + 사찰 음력 일진·재일 법력 안내 */}
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] relative overflow-hidden">
              {(() => {
                const { lunarText, jaeilBadge } = getTodayLunarAndJaeil()
                return (
                  <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#F0EAE0] text-xs">
                    <div className="flex items-center gap-1.5 text-[#6E5D45] font-bold truncate">
                      <Calendar className="w-4 h-4 text-[#C59B27] shrink-0" />
                      <span className="text-[12.5px] tracking-tight">{lunarText}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3DF] text-[#8A6510] text-[11.5px] font-extrabold border border-[#E5D399] whitespace-nowrap shrink-0">
                      {jaeilBadge}
                    </span>
                  </div>
                )
              })()}
              <div className="flex items-center justify-between gap-1.5 mb-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-[#9A7418] bg-[#FAF3DF] px-2.5 py-1 rounded-full border border-[#E5D399] whitespace-nowrap">
                    오늘의 부처님 말씀
                  </span>
                  {/* 소리 아이콘 버튼 */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleSpeech(
                        'home-quote',
                        `오늘의 부처님 말씀입니다. ${currentQuote.verse}. ${currentQuote.source}. ${currentQuote.commentary}`
                      )
                    }
                    title="말씀 듣기"
                    aria-label="말씀 듣기"
                    className={`p-1.5 rounded-full border transition flex items-center justify-center shrink-0 ${
                      speakingId === 'home-quote'
                        ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] animate-pulse shadow-sm'
                        : 'bg-[#FAF3DF] text-[#9A7418] border-[#E5D399] hover:bg-[#F3E7C4] hover:text-[#7A5B0B]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  {/* 말씀 카카오톡 카드 공유 (법공양) 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleShareDailyQuote(currentQuote)}
                    title="오늘의 부처님 말씀 카카오톡 카드 전송 (법공양)"
                    aria-label="말씀 카카오톡 카드 공유하기"
                    className="p-1.5 rounded-full border border-[#E5D399] bg-[#FAF3DF] text-[#9A7418] hover:bg-[#F3E7C4] hover:text-[#7A5B0B] transition flex items-center justify-center shrink-0 active:scale-95 shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = (quoteIdx + 1) % DAILY_QUOTES.length
                      setQuoteIdx(nextIdx)
                      const nextQuote = DAILY_QUOTES[nextIdx]
                      if (autoVoiceEnabled || speakingId === 'home-quote') {
                        startSpeech(
                          'home-quote',
                          `${nextQuote.verse}. ${nextQuote.source}. ${nextQuote.commentary}`
                        )
                      } else {
                        playSingingBowlSound()
                      }
                    }}
                    className="text-xs text-[#786E63] hover:text-[#231F1C] flex items-center gap-1 whitespace-nowrap shrink-0 px-2 py-1 rounded-lg hover:bg-black/5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                    <span>다른 말씀</span>
                  </button>
                </div>
              </div>

              <blockquote className="font-serif-kr text-[16px] sm:text-[17px] font-bold text-[#231F1C] leading-relaxed mb-2.5 break-keep">
                “{currentQuote.verse}”
              </blockquote>
              <p className="text-xs font-semibold text-[#8C7A5B] mb-2">— {currentQuote.source}</p>
              <p className="text-xs text-[#575049] bg-[#FAF8F5] p-3 rounded-xl border border-[#EFE9DD] leading-relaxed break-keep">
                💡 {currentQuote.commentary}
              </p>
            </section>

            {/* ==================== 24시간 마음 쉼터: 일할 때 & 잘 때 듣는 법음(法音) 플레이어 ==================== */}
            <section id="healing-audio-section" className="rounded-2xl bg-gradient-to-br from-[#1E1914] via-[#2A221A] to-[#16120E] text-white border-2 border-[#C59B27]/60 shadow-xl overflow-hidden transition-all duration-300">
              {/* 은은한 배경 후광 */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F5D061]/10 rounded-full blur-2xl pointer-events-none" />

              {/* [기본 플레이어 바] 접힘/펼침과 무관하게 상시 그대로 유지 */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5">
                <div
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  onClick={() => setIsPlayerExpanded((prev) => !prev)}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                      isHealingPlaying
                        ? 'bg-[#F5D061] text-[#1B1815] border-[#FFF3B8] shadow-[0_0_15px_rgba(245,208,97,0.5)] scale-105'
                        : 'bg-white/10 text-[#F5D061] border-white/10'
                    }`}
                  >
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-[#F5D061] bg-[#F5D061]/15 px-1.5 py-0.2 rounded border border-[#F5D061]/30 whitespace-nowrap">
                        24시간 법음 쉼터
                      </span>
                      {isHealingPlaying && (
                        <span className="flex items-center gap-1 text-[9.5px] text-[#4ADE80] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-ping" />
                          치유중
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white truncate mt-0.5 flex items-center gap-1">
                      <span>{HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.icon}</span>
                      <span className="truncate">
                        {HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 우측 퀵 컨트롤: 재생/정지 + 트랙목록 열기/닫기 아이콘 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleHealingPlay()}
                    className="w-9 h-9 rounded-full bg-[#F5D061] text-[#1B1815] flex items-center justify-center shadow hover:scale-105 active:scale-95 transition"
                    title="재생 / 일시정지"
                  >
                    {isHealingPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlayerExpanded((prev) => !prev)}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition ${
                      isPlayerExpanded
                        ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                        : 'bg-white/10 hover:bg-white/15 text-[#F5D061] border-[#F5D061]/30'
                    }`}
                    title={isPlayerExpanded ? '트랙 목록 닫기' : '힐링 법음·찬불가 트랙 목록 열기'}
                    aria-label="트랙 목록 열기/닫기"
                  >
                    {isPlayerExpanded ? <ChevronUp className="w-4 h-4" /> : <ListMusic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* [펼침 상태] 플레이어 바 바로 아래에 트랙 목록만 깔끔하게 드롭다운 */}
              {isPlayerExpanded && (
                <div className="px-3 pb-3.5 pt-1 space-y-2.5 border-t border-white/10 animate-in fade-in duration-200">
                  {/* 상단 간편 안내 */}
                  <div className="pt-1.5 pb-0.5">
                    <span className="text-[11.5px] font-bold text-[#F5D061] flex items-center gap-1.5">
                      <span>📜</span>
                      <span>원하시는 독경 · 쉼터 트랙을 선택해 주세요</span>
                    </span>
                  </div>

                  {/* 5대 힐링 트랙 선택 리스트 (한 줄씩 풀 너비로 글자 잘림 없이 시원하게 노출) */}
                  <div className="flex flex-col gap-2 relative z-10">
                    {HEALING_AUDIO_TRACKS.map((t) => {
                      const isSelected = healingAudioTrack === t.id
                      const isThisPlaying = isSelected && isHealingPlaying
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToggleHealingPlay(t.id)}
                          className={`w-full p-3 sm:p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#3D3020] via-[#2A2015] to-[#1C150E] border-[#F5D061] shadow-lg'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-2xl border ${
                                isSelected
                                  ? 'bg-[#F5D061]/20 border-[#F5D061]/40 shadow-sm'
                                  : 'bg-white/5 border-white/10'
                              }`}
                            >
                              {t.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] text-[#F5D061] font-bold">
                                  {t.category}
                                </span>
                                {t.id === 'prajna_chanting' || t.id === 'sleep_meditation' || t.id === 'dhammapada_wisdom' ? (
                                  <span className="bg-[#F5D061]/25 text-[#FFE58A] px-1.5 py-0.2 rounded text-[8.5px] font-bold border border-[#F5D061]/40">
                                    🎙️ 영인스님 실물 독경 원음
                                  </span>
                                ) : t.id === 'sowonsa_prajna_meditation' ? (
                                  <span className="bg-[#F5D061]/25 text-[#FFE58A] px-1.5 py-0.2 rounded text-[8.5px] font-bold border border-[#F5D061]/40">
                                    🧘 소원사 힐링 명상
                                  </span>
                                ) : t.id === 'lotus_destiny' ? (
                                  <span className="bg-[#F5D061]/25 text-[#FFE58A] px-1.5 py-0.2 rounded text-[8.5px] font-bold border border-[#F5D061]/40">
                                    🌸 소원사 찬불가
                                  </span>
                                ) : t.id === 'jeju_sowonsa' ? (
                                  <span className="bg-[#F5D061]/25 text-[#FFE58A] px-1.5 py-0.2 rounded text-[8.5px] font-bold border border-[#F5D061]/40">
                                    🍊 소원사 테마송
                                  </span>
                                ) : t.id === 'rhythmic_moktak' ? (
                                  <span className="bg-[#F5D061]/20 text-[#FFE58A] px-1.5 py-0.2 rounded text-[8.5px] font-bold border border-[#F5D061]/30">
                                    🪷 천년고찰 실물 목탁
                                  </span>
                                ) : (
                                  <span className="bg-white/10 text-[#C2B8AB] px-1.5 py-0.2 rounded text-[8.5px] font-medium border border-white/10">
                                    🍃 사찰 자연 ASMR
                                  </span>
                                )}
                              </div>
                              <div className="text-xs sm:text-sm font-bold text-white break-keep">
                                {t.title}
                              </div>
                              <div className="text-[11px] text-[#C2B8AB] break-keep mt-0.5 leading-snug">
                                {t.subtitle}
                              </div>
                            </div>
                          </div>

                          {/* 우측 재생 상태 인디케이터 또는 버튼 */}
                          <div className="shrink-0 flex items-center">
                            {isThisPlaying ? (
                              <div className="flex items-center gap-1 bg-[#F5D061] text-[#1B1815] px-2.5 py-1 rounded-full text-[10.5px] font-bold shadow-md">
                                <span className="flex gap-0.5 items-end h-3">
                                  <span className="w-0.5 h-3 bg-[#1B1815] animate-pulse" />
                                  <span className="w-0.5 h-1.5 bg-[#1B1815] animate-pulse delay-75" />
                                  <span className="w-0.5 h-2.5 bg-[#1B1815] animate-pulse delay-150" />
                                </span>
                                <span>재생중</span>
                              </div>
                            ) : isSelected ? (
                              <div className="w-8 h-8 rounded-full bg-[#F5D061]/20 border border-[#F5D061]/40 text-[#F5D061] flex items-center justify-center shadow-sm">
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-[#8C8275] flex items-center justify-center">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* 스튜디오 마스터 음원 출처 및 안심 보증 배지 */}
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#A89880] bg-white/5 px-3 py-2 rounded-xl border border-white/10 relative z-10">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                      <span className="truncate">영인스님 독경 &amp; 대웅전 실물 목탁 · BBS 불교방송 마스터링본</span>
                    </div>
                    <span className="text-[#F5D061] font-bold text-[9.5px] shrink-0 ml-1">사찰 포교 및 법공양</span>
                  </div>

                  {/* 플레이어 조작 바 & 수면 타이머 */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleHealingPlay()}
                        className="w-10 h-10 rounded-full bg-[#F5D061] text-[#1B1815] flex items-center justify-center shrink-0 shadow-lg hover:scale-105 active:scale-95 transition"
                      >
                        {isHealingPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#F5D061] truncate flex items-center gap-1">
                          <span>{HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.title}</span>
                          {HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.voiceText &&
                            isHealingVoiceOn && (
                              <span className="text-[9px] text-[#4ADE80] font-normal shrink-0">
                                (낭독중)
                              </span>
                            )}
                        </div>
                        <div className="text-[10.5px] text-[#C2B8AB] truncate">
                          {isHealingPlaying
                            ? sleepTimerSecondsLeft > 0
                              ? `🌙 ${Math.floor(sleepTimerSecondsLeft / 60)}분 ${sleepTimerSecondsLeft % 60}초 후 자동종료`
                              : '화면 꺼짐 지원 · 연속 스트리밍 중'
                            : '재생 버튼을 눌러 스님 음성으로 청취하세요'}
                        </div>
                      </div>
                    </div>

                    {/* 수면 타이머 퀵 버튼들 */}
                    <div className="flex items-center gap-1 shrink-0">
                      {[15, 30, 60].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleSetSleepTimer(m)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                            sleepTimerMinutes === m
                              ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                              : 'bg-white/5 text-[#D6CEC2] border-white/10 hover:bg-white/15'
                          }`}
                        >
                          {m}분
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 하단 전체화면 모달 열기 & 접기 바 */}
                  <div className="flex items-center justify-between pt-1 text-xs text-[#8C8275] border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowFullAudioModal(true)}
                      className="hover:text-[#F5D061] flex items-center gap-1 text-[11px] font-medium transition"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>전체화면 감성 LP 모드</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPlayerExpanded(false)}
                      className="hover:text-white flex items-center gap-1 text-[11px] font-bold transition"
                    >
                      <span>위로 접기</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* 따뜻한 차와 사찰 공양(식사) 대접 온라인 사전예약 카드 (온화한 전통 한지 다실 톤으로 상단 먹색 플레이어와 명암 대비 조화) */}
            <section id="visit-reserve-section" className="rounded-2xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E3] to-[#F3E7CC] text-[#231F1C] p-4 sm:p-5 border-2 border-[#DEC896] shadow-md space-y-3.5 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2A221A] to-[#1B1612] border border-[#C59B27] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Coffee className="w-5 h-5 text-[#F5D061]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10.5px] text-[#8A6510] bg-[#FAF0D7] px-2 py-0.5 rounded-full border border-[#E5D399] font-extrabold break-keep">
                    🍵 전날 예약 시 차(茶) · 사찰 공양 무료 대접
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-extrabold text-[#1F1A14] mt-1 break-keep">
                    “도량에서 따뜻한 차 한 잔 나누세요”
                  </h3>
                  <p className="text-xs text-[#574E42] mt-1 leading-relaxed break-keep">
                    제주 소원사는 모든 불자님께 언제나 열려 있습니다.{' '}
                    <strong className="text-[#7A5608] font-bold">
                      오시기 전날 미리 방문 예약을 남겨주시면 따뜻한 차와 정성스러운 사찰 공양(식사)을 무료로 준비해 드립니다.
                    </strong>
                  </p>
                </div>
              </div>

              {/* 예약창 열기/닫기 버튼 */}
              <button
                type="button"
                onClick={() => setShowVisitForm((prev) => !prev)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#26201A] via-[#332A21] to-[#26201A] text-[#F5D061] border border-[#C59B27] font-extrabold text-xs shadow hover:brightness-110 transition flex items-center justify-between gap-1.5 cursor-pointer"
              >
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Calendar className="w-4 h-4 text-[#F5D061] shrink-0" />
                  <span className="text-[#FAF8F5]">전날 방문 · 사찰 공양(식사) 예약</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F5D061] text-[#1B1815] text-[10.5px] font-extrabold whitespace-nowrap shrink-0">
                  {showVisitForm ? '창 닫기 ▲' : '창 열기 ▼'}
                </span>
              </button>

              {/* 버튼 클릭 시에만 펼쳐지는 온라인 전날 방문 & 식사(공양) 예약 폼 */}
              {showVisitForm && (
                <form
                  onSubmit={handleVisitSubmit}
                  className="bg-[#181411] rounded-xl p-3.5 sm:p-4 border border-[#C59B27]/40 space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5D061] whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>방문 · 공양 예약 신청서</span>
                    </div>
                    {currentUser && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C59B27]/25 text-[#F5D061] border border-[#F5D061]/30 whitespace-nowrap shrink-0">
                        내 계정 연동됨
                      </span>
                    )}
                  </div>

                  {/* 1열 가로줄 배치: 모든 입력/선택창 좌우 끝선 100% 칼정렬 (grid-cols-[80px_minmax(0,1fr)]) */}
                  <div className="space-y-2 w-full">
                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#E8DFD1] font-bold whitespace-nowrap">
                        방문 예정일
                      </label>
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#26211C] border border-[#C59B27]/50 text-white text-xs font-bold focus:outline-none focus:border-[#F5D061]"
                      />
                    </div>

                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#E8DFD1] font-bold whitespace-nowrap">
                        방문 인원수
                      </label>
                      <div className="flex items-center justify-between w-full max-w-full min-w-0 box-border px-1.5 py-1 rounded-lg bg-[#26211C] border border-[#C59B27]/50 focus-within:border-[#F5D061]">
                        <button
                          type="button"
                          onClick={() =>
                            setVisitHeadcount((prev) => Math.max(1, Number(prev || 1) - 1))
                          }
                          className="w-8 h-8 rounded-md bg-[#181411] border border-[#C59B27]/40 text-[#F5D061] font-extrabold text-base flex items-center justify-center shrink-0 active:scale-95 transition"
                          aria-label="방문 인원 1명 감소"
                        >
                          -
                        </button>
                        <div className="flex items-center justify-center gap-1 min-w-0 flex-1 px-1">
                          <input
                            type="number"
                            min={1}
                            max={200}
                            value={visitHeadcount}
                            onChange={(e) => {
                              const val = e.target.value
                              if (val === '') {
                                setVisitHeadcount('')
                              } else {
                                setVisitHeadcount(
                                  Math.max(1, Math.min(200, parseInt(val, 10) || 1))
                                )
                              }
                            }}
                            onBlur={() => {
                              if (!visitHeadcount || Number(visitHeadcount) < 1) {
                                setVisitHeadcount(1)
                              }
                            }}
                            className="w-10 text-right bg-transparent text-[#F5D061] text-sm font-extrabold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-xs text-white font-extrabold whitespace-nowrap pr-1">
                            명
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setVisitHeadcount((prev) => Math.min(200, Number(prev || 1) + 1))
                          }
                          className="w-8 h-8 rounded-md bg-[#181411] border border-[#C59B27]/40 text-[#F5D061] font-extrabold text-base flex items-center justify-center shrink-0 active:scale-95 transition"
                          aria-label="방문 인원 1명 증가"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 방문 시간 및 목적 2x2 직관형 원터치 버튼 */}
                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-start gap-2 w-full pt-0.5">
                      <label className="text-xs text-[#E8DFD1] font-bold whitespace-nowrap pt-2">
                        시간 · 목적
                      </label>
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {VISIT_TIME_SLOTS.map((slot) => {
                          const isSelected =
                            visitTime === slot.fullTime ||
                            visitTime === slot.time ||
                            visitTime.includes(slot.time)
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => {
                                setVisitTime(slot.fullTime)
                                setVisitPurpose(slot.purpose)
                              }}
                              className={`relative p-2.5 rounded-xl border text-left transition flex flex-col justify-center active:scale-95 ${
                                isSelected
                                  ? 'bg-[#C59B27]/25 border-[#F5D061] text-[#F5D061] shadow-[0_0_12px_rgba(245,208,97,0.25)] ring-1 ring-[#F5D061]'
                                  : 'bg-[#26211C] border-[#C59B27]/40 text-[#D6CEC2] hover:border-[#C59B27]'
                              }`}
                            >
                              {slot.badge && (
                                <span className="absolute -top-1.5 right-1.5 px-1.5 py-0.2 rounded-full bg-[#E53935] text-white text-[9px] font-extrabold shadow">
                                  {slot.badge}
                                </span>
                              )}
                              <span className="text-xs font-black tracking-wide flex items-center gap-1 text-white">
                                <Clock className="w-3.5 h-3.5 text-[#F5D061] shrink-0" />
                                {slot.time}
                              </span>
                              <span
                                className={`text-[11px] font-bold mt-1 leading-tight ${
                                  isSelected ? 'text-[#F5D061]' : 'text-[#A89E90]'
                                }`}
                              >
                                {slot.title}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 신청자 정보 입력 영역 구분 (동일한 좌우 끝선 칼정렬) */}
                  <div className="pt-2.5 border-t border-white/10 space-y-2 w-full">
                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#F5D061] font-bold whitespace-nowrap">
                        방문자 성함
                      </label>
                      <input
                        type="text"
                        value={wishName}
                        onChange={(e) => setWishName(e.target.value)}
                        placeholder="예: 홍길동 (무량심)"
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#FFFDF9] border-2 border-[#C59B27] text-[#1B1815] font-bold text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#F5D061] font-bold whitespace-nowrap">
                        연락처 번호
                      </label>
                      <input
                        type="tel"
                        value={wishPhone}
                        onChange={(e) => setWishPhone(e.target.value)}
                        placeholder="010-0000-0000"
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#FFFDF9] border-2 border-[#C59B27] text-[#1B1815] font-bold text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#D6CEC2] font-semibold whitespace-nowrap">
                        요청 메모
                      </label>
                      <input
                        type="text"
                        value={visitMemo}
                        onChange={(e) => setVisitMemo(e.target.value)}
                        placeholder={`예: 총 ${visitHeadcount || 1}명 점심 공양 부탁드립니다`}
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#FFFDF9] border border-[#C59B27]/60 text-[#1B1815] text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#F5D061] text-[#1B1815] font-extrabold text-xs shadow hover:brightness-105 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>총 {visitHeadcount || 1}명 방문 · 사찰 공양(식사) 예약 접수하기</span>
                  </button>
                </form>
              )}

              {/* 전화 예약 통합 바로가기 바 (좁은 스마트폰에서도 1줄 고정) */}
              <div className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white text-[#3D352B] text-[11px] sm:text-xs tracking-tight font-bold border border-[#D8C28E] shadow-xs whitespace-nowrap overflow-hidden">
                <span className="inline-flex items-center gap-1 text-[#7A5608] font-extrabold shrink-0">
                  <Phone className="w-3 h-3 text-[#B8860B] fill-current shrink-0" />
                  <span>종무소</span>
                </span>
                <a href="tel:064-805-2007" className="text-[#231F1C] hover:text-[#7A5608] font-extrabold transition shrink-0">
                  064-805-2007
                </a>
                <span className="text-[#C8BFA8] shrink-0">·</span>
                <a href="tel:010-4912-1083" className="text-[#7A5608] hover:text-[#5C3F05] font-extrabold transition shrink-0">
                  010-4912-1083
                </a>
              </div>
            </section>

            {/* 📢 제주 소원사 도량 소식 & 공지사항 롤링 바 (터치 시 모달 오픈) */}
            {notices && notices.length > 0 && (() => {
              const curNotice = notices[activeNoticeIdx % notices.length] || notices[0]
              return (
                <div className="relative rounded-2xl bg-gradient-to-r from-[#241F1A] via-[#2F271E] to-[#241F1A] p-2.5 sm:p-3 border border-[#C59B27]/40 shadow-sm overflow-hidden text-white flex items-center justify-between gap-2.5">
                  <div
                    onClick={() => {
                      playSingingBowlSound()
                      setSelectedNotice(curNotice)
                      setShowNoticeModal(true)
                    }}
                    className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C59B27] flex items-center justify-center text-[#1B1815] shrink-0 shadow-sm animate-pulse">
                      <Megaphone className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#C59B27]/30 text-[#F5D061] border border-[#F5D061]/30 whitespace-nowrap">
                          {curNotice.badge || curNotice.category || '도량소식'}
                        </span>
                        <span className="text-[10px] text-[#A89D8E] font-mono whitespace-nowrap">
                          {curNotice.date}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#FBF8F3] group-hover:text-[#F5D061] transition truncate">
                        {curNotice.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        playMoktakSound()
                        setShowNoticeListModal(true)
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#F5D061] border border-[#F5D061]/30 text-[10.5px] font-bold transition whitespace-nowrap"
                    >
                      전체보기
                    </button>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveNoticeIdx(
                            (prev) => (prev - 1 + notices.length) % notices.length
                          )
                        }
                        className="w-5 h-5 rounded-full text-[#A89D8E] hover:text-[#F5D061] flex items-center justify-center text-xs"
                        aria-label="이전 공지"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveNoticeIdx((prev) => (prev + 1) % notices.length)
                        }
                        className="w-5 h-5 rounded-full text-[#A89D8E] hover:text-[#F5D061] flex items-center justify-center text-xs"
                        aria-label="다음 공지"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* 🔔 제주 소원사 대웅전 매일 사시예불(巳時禮佛) & 다가오는 사찰 주요 재일 D-Day 캘린더 */}
            {(() => {
              const { upcomingJaeils } = getTodayLunarAndJaeil()
              return (
                <section id="sasi-prayer-section" className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-3.5">
                  {/* 상단 헤더: 사시예불 안내 (우측 중복 뱃지 제거 및 1줄 칼정돈) */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E25C2B] to-[#F4B41A] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Flame className="w-4 h-4 fill-current text-[#FFF7CE]" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-serif-kr font-bold text-sm sm:text-base text-[#231F1C] whitespace-nowrap">
                        대웅전 사시예불 & 기도 재일
                      </h2>
                      <p className="text-xs text-[#8C7A5B] truncate mt-0.5">
                        매일 오전 10:00 삼존불 전 육성 축원 봉행
                      </p>
                    </div>
                  </div>

                  {/* 사시예불 안내 박스 (핵심 1~2줄 요약) */}
                  <div className="py-2 px-3 rounded-xl bg-[#FAF8F5] border border-[#EDE6D8] text-xs text-[#2B231A] leading-normal break-keep">
                    <span>올려주신 소원등은 매일 오전 10시 대웅전에서 스님의 육성으로 정성껏 축원됩니다.</span>
                    <span className="text-[11px] text-[#9A7418] font-medium block mt-0.5">
                      (지금 점등 시 내일 사시예불 자동 배정)
                    </span>
                  </div>

                  {/* 다가오는 사찰 주요 3대 재일 (D-Day 캘린더 칩) */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="text-[11.5px] font-bold text-[#6E5D45] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>다가오는 사찰 주요 재일</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {(upcomingJaeils || []).slice(0, 3).map((j) => (
                        <button
                          key={j.name}
                          type="button"
                          onClick={() => {
                            playSingingBowlSound()
                            setActiveTab('lantern')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer active:scale-95 flex items-center justify-between sm:flex-col sm:items-start gap-1 ${
                            j.isToday
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 shadow-xs'
                              : 'bg-[#FAF8F5] hover:bg-[#F5EFE4] border-[#E8DFC9] text-[#2C251E]'
                          }`}
                          title={`${j.name} 소원등 올리기`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate flex items-center gap-1">
                              <span>{j.isToday ? '🔥' : '🪔'}</span>
                              <span className="truncate">{j.name}</span>
                            </div>
                            <div className="text-[10px] text-[#8C7A5B] mt-0.5">
                              음력 {j.day}일
                            </div>
                          </div>
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded-md shrink-0 font-mono ${
                              j.isToday
                                ? 'bg-amber-500 text-white animate-pulse'
                                : 'bg-[#EFE7D6] text-[#7D6320]'
                            }`}
                          >
                            {j.ddayText}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 원터치 소원등 켜기 바로가기 */}
                  <button
                    type="button"
                    onClick={() => {
                      playSingingBowlSound()
                      setActiveTab('lantern')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#F5D061] via-[#E5BF47] to-[#D4AF37] hover:brightness-105 active:scale-[0.99] text-[#1B1815] font-black text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 fill-current text-[#7A5B0B]" />
                    <span>내 소원등 켜고 사시예불 축원 올리기 ➜</span>
                  </button>
                </section>
              )
            })()}

            {/* 제주 소원사 도량 위치 안내 & 원터치 주소 복사 · 네이버 지도 길찾기 */}
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D241C] to-[#17130F] border border-[#C59B27]/60 flex items-center justify-center shrink-0 shadow-xs">
                    <MapPin className="w-4 h-4 text-[#F5D061]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-serif-kr font-bold text-sm sm:text-base text-[#231F1C]">
                      제주 소원사 오시는 길
                    </h2>
                    <p className="text-xs font-semibold text-[#8C7A5B] truncate mt-0.5">
                      제주시 죽성서길 75 (오등동 935)
                    </p>
                  </div>
                </div>
              </div>

              {/* 세로 높이 좁힌 [주소 복사] [네이버 지도] 2개 버튼 */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const addr = '제주시 죽성서길 75 (오등동 935)'
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(addr)
                      showToast('📋 소원사 주소가 복사되었습니다! 차량 내비나 카카오톡에 붙여넣으세요.')
                    } else {
                      showToast(addr)
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#2B231A] border border-[#DCD3C3] font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer whitespace-nowrap"
                  title="소원사 주소 클립보드 복사"
                >
                  <Copy className="w-3.5 h-3.5 text-[#8A6510] shrink-0" />
                  <span>주소 복사</span>
                </button>

                <a
                  href="https://map.naver.com/p/search/%EC%A0%9C%EC%A3%BC%20%EC%86%8C%EC%9B%90%EC%82%AC"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-xl bg-[#03C75A] hover:bg-[#02B351] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs whitespace-nowrap"
                  title="네이버 지도로 소원사 길찾기 바로 연결"
                >
                  <span className="text-xs">🧭</span>
                  <span>네이버 지도</span>
                </a>
              </div>
            </section>

            {/* 제주 소원사 공식 사이트 & SNS 채널 통합 바로가기 (A안: 가로 원형 아이콘 바) */}
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] font-bold text-[#9A7418]">
                    OFFICIAL CHANNELS
                  </span>
                  <h2 className="font-serif-kr font-bold text-sm sm:text-base text-[#231F1C] mt-0.5 whitespace-nowrap">
                    제주 소원사 공식 사이트 · 채널
                  </h2>
                </div>
                <span className="text-[10.5px] text-[#A69B8D] font-medium hidden sm:inline-block">
                  터치하여 바로가기
                </span>
              </div>

              {/* 가로 아이콘 그리드 / 바 (슬림화된 앙증맞은 아이콘 규격) */}
              <div className="grid grid-cols-6 gap-1.5 sm:gap-2 pt-0.5">
                {[
                  {
                    name: '홈페이지',
                    url: 'https://sowonsa.vercel.app/',
                    icon: (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#231F1C] to-[#151210] border border-[#C59B27] flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow-sm transition-all">
                        <Globe className="w-4 h-4 text-[#F5D061]" />
                      </div>
                    ),
                  },
                  {
                    name: '네이버',
                    url: 'https://map.naver.com/p/search/%EC%A0%9C%EC%A3%BC%20%EC%86%8C%EC%9B%90%EC%82%AC',
                    icon: (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#03C75A] flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow-sm transition-all">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" aria-hidden="true">
                          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    name: '유튜브',
                    url: 'https://www.youtube.com/@jejusowonsa',
                    icon: (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF0000] flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow-sm transition-all">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    name: '인스타그램',
                    url: 'https://www.instagram.com/jejusowonsa/',
                    icon: (
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow-sm transition-all"
                        style={{
                          background:
                            'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                        }}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    name: '스레드',
                    url: 'https://www.threads.net/@jejusowonsa',
                    icon: (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow-sm transition-all">
                        <svg viewBox="0 0 192 192" className="w-4 h-4 fill-white" aria-hidden="true">
                          <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.13 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.35-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.19 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.552zm-43.096 40.519c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.113 3.895-.169 5.79-.169 6.235 0 12.068.606 17.371 1.765-1.978 24.702-13.58 28.713-23.802 29.274z" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    name: '안내카드',
                    url: 'https://sowonsa.vercel.app/introcard',
                    icon: (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FEE500] flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow-sm transition-all">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#3C1E1E]" aria-hidden="true">
                          <path d="M12 3C6.477 3 2 6.477 2 10.765c0 2.772 1.868 5.204 4.685 6.57-.204.763-.74 2.768-.847 3.197-.133.527.194.52.408.378.168-.111 2.668-1.81 3.746-2.546.652.094 1.323.144 2.008.144 5.523 0 10-3.477 10-7.743C22 6.477 17.523 3 12 3z" />
                        </svg>
                      </div>
                    ),
                  },
                ].map((ch) => (
                  <a
                    key={ch.url}
                    href={ch.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col items-center gap-1 py-1 text-center"
                    title={ch.name}
                  >
                    {ch.icon}
                    <span className="text-[10px] sm:text-[10.5px] font-medium text-[#544B41] group-hover:text-[#9A7418] transition-colors whitespace-nowrap">
                      {ch.name}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </main>
  )
}
