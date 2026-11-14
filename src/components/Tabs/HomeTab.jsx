import React, { useState } from 'react'
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
  Info,
  X,
  Sparkles,
  Gift,
} from 'lucide-react'

// 🪷 한국 사찰 전통의 은은하고 장엄한 황금색 연꽃 아이콘
function GoldenLotusIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-[0_1px_2px_rgba(212,160,36,0.3)]`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldenLotusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE07A" />
          <stop offset="45%" stopColor="#E5B324" />
          <stop offset="100%" stopColor="#B38210" />
        </linearGradient>
      </defs>
      {/* 바닥 연화대 받침 */}
      <path
        d="M5 18C7.5 19.5 16.5 19.5 19 18C17 21 7 21 5 18Z"
        fill="url(#goldenLotusGrad)"
        opacity="0.85"
      />
      {/* 좌측 바깥 꽃잎 */}
      <path
        d="M2.5 14C3.8 11 6.5 10 9 13C6.8 15.2 4.2 15.5 2.5 14Z"
        fill="url(#goldenLotusGrad)"
        opacity="0.9"
      />
      {/* 우측 바깥 꽃잎 */}
      <path
        d="M21.5 14C20.2 11 17.5 10 15 13C17.2 15.2 19.8 15.5 21.5 14Z"
        fill="url(#goldenLotusGrad)"
        opacity="0.9"
      />
      {/* 좌측 중간 꽃잎 */}
      <path
        d="M5.5 15C6.5 9 10 7.5 11.5 12C9.5 15 7.5 16.5 5.5 15Z"
        fill="url(#goldenLotusGrad)"
      />
      {/* 우측 중간 꽃잎 */}
      <path
        d="M18.5 15C17.5 9 14 7.5 12.5 12C14.5 15 16.5 16.5 18.5 15Z"
        fill="url(#goldenLotusGrad)"
      />
      {/* 중앙 주 꽃잎 (봉오리 꽃잎) */}
      <path
        d="M12 4C10.5 7.5 10 11 12 16C14 11 13.5 7.5 12 4Z"
        fill="url(#goldenLotusGrad)"
      />
      {/* 중앙 연꽃 수술 포인트 */}
      <circle cx="12" cy="11.5" r="1.2" fill="#FFF4BD" />
    </svg>
  )
}

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
  setShowMeritCertModal,
  setMeritCertType,
  handleShareMyLantern,
  lanternData,
  userLanternStats,
}) {
  const [showMeritInfoModal, setShowMeritInfoModal] = useState(false)
  const currentQuote = DAILY_QUOTES[quoteIdx] || DAILY_QUOTES[0]

  return (
<main className="flex-1 flex flex-col gap-3.5 px-2 py-3.5">
            {/* 히어로 3종 동적 가로 슬라이딩 캐러셀 (지인 피드백: 좌우로 스르륵 넘어가는 동적 효과) */}
            {(() => {
              const slide = HERO_SLIDES[heroSlideIdx] || HERO_SLIDES[0]
              return (
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#D8CBB8] min-h-[224px] flex flex-col justify-between px-3.5 py-4 sm:p-4 bg-[#161310]">
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
                    <p className="text-[11px] sm:text-xs text-[#E8DFD1] leading-relaxed tracking-tight break-keep">
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
              {/* 단정하고 맑은 타이틀 + 바로 옆 공덕 안내 버튼 + 다음 줄 은은한 서브 문구 */}
              <div className="mb-2.5 px-0.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <GoldenLotusIcon className="w-[18px] h-[18px] sm:w-[19px] sm:h-[19px] shrink-0" />
                    <h3 className="font-sans text-[14.5px] sm:text-[15.5px] font-bold text-[#2B1F11] tracking-tight whitespace-nowrap">
                      오늘의 공덕
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (playSingingBowlSound) playSingingBowlSound()
                      setShowMeritInfoModal(true)
                    }}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FCFBF8] hover:bg-[#F5EEDC] border border-[#D4A024]/40 text-[#8C6D15] hover:text-[#5C4505] text-[10.5px] font-bold transition shrink-0 cursor-pointer shadow-2xs active:scale-95"
                    title="신행 공덕이란? 안내 보기"
                  >
                    <Info className="w-3.5 h-3.5 text-[#D4A024] shrink-0" />
                    <span>공덕 안내</span>
                  </button>
                </div>
                <p className="text-[11px] sm:text-[11.5px] text-[#8E8475] font-normal mt-1 pl-[25px] tracking-tight">
                  작은 기도와 실천이 모여 큰 공덕이 됩니다
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {/* 1) 대웅전 참배 (✨ 참배 동선 1순위: 부처님 전 참선 정진 - 3D 동자승) */}
                <button
                  type="button"
                  onClick={() => {
                    playSingingBowlSound()
                    if (setShowSanctuaryModal) setShowSanctuaryModal(true)
                  }}
                  className="py-3 px-1.5 rounded-2xl bg-gradient-to-b from-white via-[#FCF9F2] to-[#F7EED9] hover:from-white hover:to-[#F4E8CB] border border-[#DFCBA0] hover:border-[#C59B27] flex flex-col items-center justify-between text-center transition-all cursor-pointer active:scale-95 shadow-[0_3px_10px_rgba(180,140,50,0.12)] hover:shadow-[0_4px_16px_rgba(180,140,50,0.2)] group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E6] to-[#F5E6BF] flex items-center justify-center p-1.5 mb-1.5 shrink-0 group-hover:scale-105 transition-transform border border-[#ECD9A8] shadow-xs overflow-hidden">
                    <img src="/images/icon_monk_meditate_front.png" alt="대웅전 참배" className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-center justify-center w-full px-0.5">
                    <span className="font-serif-kr text-[12px] sm:text-[12.5px] font-black text-[#2B1F11] tracking-tight leading-tight text-center break-keep">
                      대웅전 참배
                    </span>
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-[#8C6D15] font-semibold mt-0.5 whitespace-nowrap block">
                    마음 쉬어가기
                  </span>
                </button>

                {/* 2) 소원등 켜기 (✨ 참배 동선 2순위: 부처님 전 등불 공양 - 3D 황금 연등) */}
                <button
                  type="button"
                  onClick={() => {
                    playSingingBowlSound()
                    setActiveTab('lantern')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="py-3 px-1.5 rounded-2xl bg-gradient-to-b from-white via-[#FCF9F2] to-[#F7EED9] hover:from-white hover:to-[#F4E8CB] border border-[#DFCBA0] hover:border-[#C59B27] flex flex-col items-center justify-between text-center transition-all cursor-pointer active:scale-95 shadow-[0_3px_10px_rgba(180,140,50,0.12)] hover:shadow-[0_4px_16px_rgba(180,140,50,0.2)] group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E6] to-[#F5E6BF] flex items-center justify-center p-1.5 mb-1.5 shrink-0 group-hover:scale-105 transition-transform border border-[#ECD9A8] shadow-xs overflow-hidden">
                    <img src="/images/sowon_lantern_realistic.png" alt="소원등 켜기" className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-center justify-center w-full px-0.5">
                    <span className="font-serif-kr text-[12px] sm:text-[12.5px] font-black text-[#2B1F11] tracking-tight leading-tight text-center break-keep">
                      소원등 켜기
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-[#8C6D15] font-semibold mt-0.5 whitespace-nowrap block tracking-tight">
                    1일 무료 소원등
                  </span>
                </button>

                {/* 3) 한줄 사경 (✨ 참배 동선 3순위: 지혜 사경 정진 - 3D 황금 사경첩 & 붓) */}
                <button
                  type="button"
                  onClick={() => {
                    playSingingBowlSound()
                    setActiveTab('sutra')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="py-3 px-1.5 rounded-2xl bg-gradient-to-b from-white via-[#FCF9F2] to-[#F7EED9] hover:from-white hover:to-[#F4E8CB] border border-[#DFCBA0] hover:border-[#C59B27] flex flex-col items-center justify-between text-center transition-all cursor-pointer active:scale-95 shadow-[0_3px_10px_rgba(180,140,50,0.12)] hover:shadow-[0_4px_16px_rgba(180,140,50,0.2)] group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E6] to-[#F5E6BF] flex items-center justify-center p-1.5 mb-1.5 shrink-0 group-hover:scale-105 transition-transform border border-[#ECD9A8] shadow-xs overflow-hidden">
                    <img src="/images/icon_sutra_brush_3d.png" alt="한줄 사경" className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-center justify-center w-full px-0.5">
                    <span className="font-serif-kr text-[12px] sm:text-[12.5px] font-black text-[#2B1F11] tracking-tight leading-tight text-center break-keep">
                      한줄 사경
                    </span>
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-[#8C6D15] font-semibold mt-0.5 whitespace-nowrap block">
                    지혜 정진 사경
                  </span>
                </button>
              </div>
            </section>

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

            {/* 따뜻한 차와 도량 참배 온라인 사전예약 카드 (온화한 전통 한지 다실 톤으로 상단 먹색 플레이어와 명암 대비 조화) */}
            <section id="visit-reserve-section" className="rounded-2xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E3] to-[#F3E7CC] text-[#231F1C] p-4 sm:p-5 border-2 border-[#DEC896] shadow-md space-y-3.5 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2A221A] to-[#1B1612] border border-[#C59B27] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Coffee className="w-5 h-5 text-[#F5D061]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10.5px] text-[#8A6510] bg-[#FAF0D7] px-2 py-0.5 rounded-full border border-[#E5D399] font-extrabold break-keep">
                    🍵 도량 참배 · 스님과의 따뜻한 차담(茶談)
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-extrabold text-[#1F1A14] mt-1 break-keep">
                    “도량에서 따뜻한 차 한 잔 나누세요”
                  </h3>
                  <p className="text-xs text-[#574E42] mt-1 leading-relaxed break-keep">
                    제주 소원사는 모든 불자님께 언제나 열려 있습니다.{' '}
                    <strong className="text-[#7A5608] font-bold">
                      도량 참배나 스님과의 편안한 신행 차담을 원하시는 불자님께서는 미리 방문 예약을 남겨주시면 정성껏 맞이해 드립니다.
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
                  <span className="text-[#FAF8F5]">사찰 방문 · 차담 예약</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F5D061] text-[#1B1815] text-[10.5px] font-extrabold whitespace-nowrap shrink-0">
                  {showVisitForm ? '창 닫기 ▲' : '창 열기 ▼'}
                </span>
              </button>

              {/* 버튼 클릭 시에만 펼쳐지는 온라인 사찰 방문 & 차담 예약 폼 */}
              {showVisitForm && (
                <form
                  onSubmit={handleVisitSubmit}
                  className="bg-[#181411] rounded-xl p-3.5 sm:p-4 border border-[#C59B27]/40 space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5D061] whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>사찰 방문 · 차담 예약 신청서</span>
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
                      <div className="relative flex items-center w-full">
                        <input
                          type="date"
                          style={{ colorScheme: 'dark' }}
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="date-input-custom-wrapper block w-full max-w-full min-w-0 box-border pl-2.5 pr-9 py-2 rounded-lg bg-[#26211C] border border-[#C59B27]/50 text-white text-xs font-bold focus:outline-none focus:border-[#F5D061] cursor-pointer"
                        />
                        <div className="absolute right-2.5 pointer-events-none flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-[#F5D061] drop-shadow-[0_0_6px_rgba(245,208,97,0.85)]" />
                        </div>
                      </div>
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
                        placeholder="예: 스님과 신행 차담 및 도량 참배 희망합니다"
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#FFFDF9] border border-[#C59B27]/60 text-[#1B1815] text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#F5D061] text-[#1B1815] font-extrabold text-xs shadow hover:brightness-105 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>총 {visitHeadcount || 1}명 사찰 방문 · 차담 예약 접수하기</span>
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

            {/* 🪷 [신행 공덕 안내 팝업 모달] */}
            {showMeritInfoModal && (
              <div
                className="fixed inset-0 z-[120] flex items-center justify-center p-3.5 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setShowMeritInfoModal(false)}
              >
                <div
                  className="w-full max-w-[420px] bg-gradient-to-b from-[#FFFDF9] via-[#FAF6ED] to-[#F5EFE0] rounded-3xl border-2 border-[#D4A024] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200 text-[#2B1F11]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 상단 헤더 */}
                  <div className="bg-gradient-to-r from-[#2A231C] via-[#382E24] to-[#2A231C] px-4 py-3.5 flex items-center justify-between text-white border-b border-[#D4A024]/30">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F5D061] to-[#C59B27] flex items-center justify-center text-[#1C1713] shadow-xs">
                        <Sparkles className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <h3 className="font-serif-kr text-[14px] sm:text-[15px] font-bold text-[#F5D061] tracking-tight">
                          제주 소원사 신행 공덕 안내
                        </h3>
                        <p className="text-[10px] text-[#C2B6A6]">
                          매일 부처님 전에 올리는 정성과 복덕
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMeritInfoModal(false)}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#E8DFD1] transition cursor-pointer"
                      title="닫기"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 본문 영역 */}
                  <div className="p-4 sm:p-5 flex flex-col gap-3.5 max-h-[75vh] overflow-y-auto">
                    {/* 발원 글귀 박스 */}
                    <div className="rounded-xl bg-gradient-to-r from-[#FFF5DC] to-[#FDF0D0] border border-[#D4A024]/35 p-3 text-center">
                      <p className="font-serif-kr text-[12px] sm:text-[12.5px] font-bold text-[#6D4C08] leading-relaxed break-keep">
                        “부처님 전에 정성스레 올리는 매일의 기도는<br />
                        불자님의 삶을 밝히는 가장 큰 복전(福田)이 됩니다.”
                      </p>
                    </div>

                    {/* 공덕 적립 방법 3대 정진 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif-kr text-[12px] font-bold text-[#2B1F11] flex items-center gap-1.5">
                          <GoldenLotusIcon className="w-4 h-4" />
                          <span>어떻게 공덕을 쌓나요?</span>
                        </span>
                        <span className="text-[10px] text-[#8C6D15] font-bold bg-[#F4E8CB] px-2 py-0.5 rounded-full">
                          하루 최대 3,840 공덕
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* 1) 대웅전 참배 */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E6DEC8] shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#FFF4D4] flex items-center justify-center text-base shrink-0">
                              🙇
                            </div>
                            <div>
                              <div className="font-bold text-[11.5px] text-[#2B1F11]">대웅전 참배 (절·목탁·염주)</div>
                              <div className="text-[10px] text-[#7A6B58]">절 1배 · 목탁 1타 · 염주 1알 정진</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-extrabold text-[#9A7418] shrink-0 bg-[#FFF9EC] px-2 py-1 rounded-lg border border-[#D4A024]/20">
                            각 +10 공덕
                          </span>
                        </div>

                        {/* 2) 소원등 켜기 */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E6DEC8] shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#FFEAD9] flex items-center justify-center text-base shrink-0">
                              🪔
                            </div>
                            <div>
                              <div className="font-bold text-[11.5px] text-[#2B1F11]">소원등 켜기 (1일등·100일등)</div>
                              <div className="text-[10px] text-[#7A6B58]">부처님 전 정성스런 등불 공양</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-extrabold text-[#D9531E] shrink-0 bg-[#FFF5EC] px-2 py-1 rounded-lg border border-[#D9531E]/20">
                            1일 1회 +300
                          </span>
                        </div>

                        {/* 3) 한줄 사경 */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E6DEC8] shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#EFEAD8] flex items-center justify-center text-base shrink-0">
                              ✍️
                            </div>
                            <div>
                              <div className="font-bold text-[11.5px] text-[#2B1F11]">한줄 사경 (지혜 정진)</div>
                              <div className="text-[10px] text-[#7A6B58]">부처님 말씀 1문장 필사 정진</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-extrabold text-[#785C10] shrink-0 bg-[#FBF9F0] px-2 py-1 rounded-lg border border-[#785C10]/20">
                            회당 +100 (최대 3회)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 공덕 사용처 안내 */}
                    <div className="rounded-2xl bg-gradient-to-br from-[#2D241C] to-[#1C1610] text-[#FFFDF7] p-3.5 border border-[#D4A024]/40 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Gift className="w-3.5 h-3.5 text-[#F5D061]" />
                        <span className="font-serif-kr text-[11.5px] font-bold text-[#F5D061]">
                          모인 공덕은 어디에 사용하나요?
                        </span>
                      </div>
                      <p className="text-[11px] text-[#E8DFD1] leading-relaxed break-keep">
                        제주 소원사 종무소 방문 시 <strong className="text-[#F5D061]">기념품 구입</strong> 및 삼성각·기와·인등 등 영험한 <strong className="text-[#F5D061]">불사 참여</strong>에 정성껏 차감하여 사용하실 수 있습니다.
                      </p>
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#A89D8E]">
                        <span>※ 도량 내 신행 활동에 영구 보존됩니다.</span>
                        <span className="text-[#F5D061] font-semibold">1공덕 = 정성의 복덕</span>
                      </div>
                    </div>
                    {/* 💌 가족·도반에게 복(福) 나누기 (카카오톡 공유 & 공덕장 바로가기) */}
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (handleShareMyLantern) {
                            handleShareMyLantern(currentUser?.name || lanternData?.believer_name, {
                              type: 'lantern',
                              category: lanternData?.wish_category,
                              wishText: lanternData?.wish_text,
                              streak: userLanternStats?.streak,
                              totalCount: userLanternStats?.totalCount,
                            })
                          }
                          if (showToast) {
                            showToast('💌 가족·도반에게 소원등 복(福) 나눔 카드가 공유되었습니다.')
                          }
                        }}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FEE500] via-[#FDD835] to-[#FBC02D] hover:brightness-105 active:scale-95 text-[#3C1E1E] font-black text-[13px] sm:text-sm shadow-[0_4px_16px_rgba(253,216,53,0.35)] flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-[#3C1E1E] shrink-0" />
                        <span>가족·도반에게 복(福) 나누기 (카톡)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMeritInfoModal(false)
                          if (setMeritCertType) setMeritCertType('lantern')
                          if (setShowMeritCertModal) setShowMeritCertModal(true)
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#2A231C] hover:bg-[#382E24] text-[#F5D061] border border-[#D4A024]/50 font-serif-kr font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>📜 나의 정진 공덕장 (황금 인증서) 열기</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#F5D061]" />
                      </button>
                    </div>
                  </div>

                  {/* 하단 버튼 바 */}
                  <div className="p-3.5 bg-[#FAF6ED] border-t border-[#E6DEC8] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMeritInfoModal(false);
                        if (setShowSanctuaryModal) setShowSanctuaryModal(true);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A024] via-[#F5D061] to-[#C59B27] hover:brightness-105 text-[#2B1F11] font-serif-kr text-xs font-bold transition shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>부처님 전 참배 정진하기</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMeritInfoModal(false)}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-[#D5CBB8] text-stone-700 text-xs font-semibold transition cursor-pointer"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
  )
}
