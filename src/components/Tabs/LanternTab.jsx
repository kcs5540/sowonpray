import React from 'react'
import {
  Flame,
  Sparkles,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
} from 'lucide-react'

export default function LanternTab({
  isLanternLit,
  lanternData,
  wishName,
  setWishName,
  wishPhone,
  setWishPhone,
  wishCategory,
  setWishCategory,
  wishTarget,
  setWishTarget,
  wishText,
  setWishText,
  currentUser,
  prayers,
  handlePrayerSubmit,
  handleSelectWishCategory,
  playMoktakSound,
  setActiveTab,
  showAllRecentLanterns,
  setShowAllRecentLanterns,
  getSasiDisplayInfo,
  formatPrayerDate,
}) {
  return (
﻿          <main className="flex-1 flex flex-col gap-4 px-2 py-3.5">
            {/* 인터랙티브 3D 광명 연등 */}
            <div className="rounded-2xl bg-gradient-to-b from-[#16120E] via-[#221C15] to-[#16120E] text-white p-6 text-center relative overflow-hidden border border-[#C59B27]/40 shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#F5D061] font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>제주 소원사 대웅전 실시간 연동</span>
              </div>
              {isLanternLit ? (
                <>
                  <h2 className="font-serif-kr text-xl sm:text-2xl font-bold mb-2 leading-snug">
                    <span className="text-[#F5D061] block sm:inline">대웅전 부처님 전에 </span>
                    <span className="block sm:inline">소원등이 켜져 있습니다</span>
                  </h2>
                  <p className="text-xs text-[#E8DFD1] max-w-xs mx-auto leading-relaxed mb-3 break-keep">
                    스님께서 매일 오전 10시 사시예불마다{' '}
                    <strong className="text-[#F5D061]">{lanternData?.believer_name}</strong> 불자님의 소원을 정성껏 축원 올리고 있습니다.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-serif-kr text-xl sm:text-2xl font-bold mb-2 leading-snug">
                    <span className="block sm:inline">소원등 켜고, </span>
                    <span className="block sm:inline">간절한 소원을 올려보세요</span>
                  </h2>
                  <p className="text-xs text-[#D6CEC2] max-w-xs mx-auto leading-relaxed mb-4 break-keep">
                    정성으로 발원문을 올리시면 대웅전에 소원등이 밝혀지고 매일 오전 10시 사시예불에서 축원해 드립니다.
                  </p>
                </>
              )}

              {/* 연등 그래픽 + 하단 제주 소원사 축원 명패 (생동감 넘치는 둥실둥실 부유 모션) */}
              <div
                className={`my-4 flex flex-col items-center transition-transform duration-700 ${
                  isLanternLit ? 'lantern-floating-unit' : 'opacity-90'
                }`}
              >
                <button
                  type="button"
                  onClick={handleLanternClick}
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-700 border-2 cursor-pointer ${
                    isLanternLit
                      ? 'bg-gradient-to-b from-[#FFE27A] via-[#F2A922] to-[#B86B09] border-[#FFF3B8] lantern-active shadow-[0_0_35px_rgba(245,208,97,0.6)]'
                      : isLanternExpired
                      ? 'bg-[#241E18] border-[#9E7A32] opacity-80 hover:border-[#D4AF37]'
                      : 'bg-[#1F1914] border-[#4A3D2F] opacity-85 hover:border-[#C59B27]/60'
                  }`}
                  title={isLanternLit ? '오늘 소원등 정진 진행중' : '발원문 접수하고 1일 소원등 밝히기'}
                >
                  {isLanternLit ? (
                    <div className="relative flex items-center justify-center flame-flicker py-1">
                      {/* 외곽 앰버 골드 따뜻한 광배 후광 */}
                      <div className="absolute w-24 h-24 bg-gradient-to-t from-[#FF7A00]/40 via-[#FFB703]/35 to-transparent rounded-full blur-xl pointer-events-none -translate-y-2" />
                      
                      {/* 진짜 사찰 촛불처럼 생동감 넘치는 입체 불꽃 SVG (외곽 주황 불꽃 + 내부 백금 고열 심지 불꽃) */}
                      <svg
                        viewBox="0 0 24 24"
                        className="w-20 h-20 relative z-10 transition-transform duration-500"
                        style={{ filter: 'drop-shadow(0 0 18px rgba(255, 200, 60, 0.95)) drop-shadow(0 -6px 20px rgba(255, 90, 10, 0.8))' }}
                      >
                        <defs>
                          <radialGradient id="outerFlameGrad" cx="50%" cy="75%" r="65%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="25%" stopColor="#FFF275" />
                            <stop offset="60%" stopColor="#FF8500" />
                            <stop offset="100%" stopColor="#D9381E" />
                          </radialGradient>
                          <radialGradient id="innerCoreGrad" cx="50%" cy="80%" r="50%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="45%" stopColor="#FFFBE6" />
                            <stop offset="85%" stopColor="#FFDE59" />
                            <stop offset="100%" stopColor="#FFAA00" />
                          </radialGradient>
                        </defs>
                        {/* 1. 외곽 주황-황금 불꽃 */}
                        <path
                          d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5c0-2-1.5-3.5-2-4.5-.5 1-1.5 1.5-2 1.5s-1.5-1-1.5-2.5c0-.8.4-1.6 1-2.2C9.5 8 8.5 10 8.5 11.5c0 .3 0 .7.1 1-.7.4-1.1 1.2-1.1 2z"
                          fill="url(#outerFlameGrad)"
                          stroke="#FFC043"
                          strokeWidth="0.3"
                          transform="scale(1.2) translate(-2, -2)"
                        />
                        {/* 2. 내부 촛불 백색 고열 심지 코어 */}
                        <path
                          d="M10.2 14.8c.2 1.5 1 2.2 1.8 2.2s1.6-.7 1.8-2.2c0-1.1-.9-2.1-1.3-2.7-.4.6-1.1 1.6-1.3 2.7z"
                          fill="url(#innerCoreGrad)"
                          transform="scale(1.2) translate(-2, -2)"
                        />
                      </svg>
                    </div>
                  ) : (
                    <>
                      <Flame
                        className={`w-14 h-14 transition-transform duration-500 ${
                          isLanternExpired
                            ? 'text-[#A8883B] opacity-70'
                            : 'text-[#7A6B59]'
                        }`}
                      />
                      <span
                        className={`mt-1.5 font-serif-kr font-bold text-xs ${
                          isLanternExpired
                            ? 'text-[#D4AF37]'
                            : 'text-[#C2B8AB]'
                        }`}
                      >
                        {isLanternExpired
                          ? '오늘 회향 · 다시 밝히기'
                          : '터치하여 소원등 밝히기'}
                      </span>
                    </>
                  )}
                </button>

                {/* 연등 아래 매달린 제주 소원사 황금 축원 명패 */}
                <div className="w-0.5 h-4 bg-[#D4AF37]" />
                <div
                  className={`px-5 py-2.5 rounded-xl bg-gradient-to-b text-center min-w-[230px] max-w-[300px] transition-all shadow-lg border-2 ${
                    isLanternLit
                      ? 'from-[#3A2D18] to-[#1F170C] border-[#F5D061] shadow-[0_0_20px_rgba(245,208,97,0.25)]'
                      : 'from-[#241E18] to-[#16120E] border-[#6E5D46]'
                  }`}
                >
                  <div className="text-[10px] text-[#F5D061] font-bold tracking-widest border-b border-[#D4AF37]/30 pb-1 mb-1 whitespace-nowrap">
                    卍 제주 소원사 대웅전 축원 명패
                  </div>
                  <div className="font-serif-kr text-sm sm:text-base font-bold text-white">
                    {isLanternLit
                      ? `${lanternData?.believer_name} 불자님`
                      : wishName.trim()
                      ? `${wishName.trim()} 불자님`
                      : currentUser?.name
                      ? `${currentUser.name} 불자님`
                      : '소원성취 발원 대기'}
                  </div>
                  {currentUser?.address && (
                    <div className="text-[10px] text-[#C8C0B7] mt-0.5 truncate max-w-[200px] mx-auto">
                      {currentUser.address}
                    </div>
                  )}
                  <div className="text-[11px] mt-0.5 font-semibold flex items-center justify-center gap-1.5">
                    <span className={isLanternLit ? 'text-[#F5D061]' : 'text-[#A89C8A]'}>
                      [{isLanternLit ? lanternData?.wish_category : wishCategory}]
                    </span>
                    {isLanternLit ? (
                      <span className="px-1.5 py-0.2 rounded bg-[#F5D061]/25 text-[#FFE58A] text-[10px] font-bold border border-[#F5D061]/50">
                        오늘 정진 점등 중
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-white/10 text-[#C2B8AB] text-[9.5px]">
                        매일 무료 사시예불 축원
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 하단 상태별 맞춤 안내 및 빠른 동작 버튼 */}
              <div className="mt-3">
                {isLanternLit ? (
                  <div className="bg-[#FAF3DF]/10 border border-[#F5D061]/35 rounded-xl p-3 text-xs text-[#FAF8F5] leading-relaxed break-keep">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-[#F5D061] mb-1.5 flex-wrap text-center">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#F5D061]" />
                      <span className="text-[#FAF8F5]">
                        {lanternData?.believer_name} 불자님의 소원등 점등 중
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5D061]/20 text-[#F5D061] border border-[#F5D061]/40 text-[11px] font-extrabold whitespace-nowrap shadow-xs">
                        🪔 누적 {userLanternStats.totalCount}회 점등 · 🔥 {userLanternStats.streak}일 연속 정진
                      </span>
                    </div>
                    <p className="text-[11px] text-[#D6CEC2] text-center">
                      📅 <strong>{getSasiDisplayInfo(lanternData?.sasi_date_key).detailLabel}</strong>되며, 예불 회향 후 오전 11시에 다음 등불을 밝히실 수 있습니다.
                    </p>
                  </div>
                ) : isLanternExpired ? (
                  <button
                    type="button"
                    onClick={() => {
                      const formEl = document.getElementById('lantern-prayer-form')
                      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8010] text-[#1B1815] font-bold text-xs shadow hover:brightness-105 transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>오늘의 기도가 회향되었습니다 · 내일 새 발원으로 다시 밝히기</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const formEl = document.getElementById('lantern-prayer-form')
                      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F5D061]/20 text-[#F5D061] border border-[#F5D061]/40 text-xs font-bold hover:bg-[#F5D061]/30 transition"
                  >
                    <span>아래에서 소원등 신청하기</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>


            {/* 무료 소원 축원 신청 폼 (고유 id 부여로 원터치 스크롤 이동 연동) */}
            <form
              id="lantern-prayer-form"
              onSubmit={handlePrayerSubmit}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-4"
            >
              <div className="border-b border-[#EFE9DD] pb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-[10.5px] font-bold text-[#9A7418]">
                    매일 올리는 사시예불 축원
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] mt-0.5 break-keep">
                    대웅전 소원등 신청
                  </h3>
                </div>
                {currentUser && (
                  <span className="text-[10.5px] px-2 py-1 rounded-full bg-[#FAF3DF] text-[#8A6510] font-bold border border-[#E5D399] shrink-0">
                    내 계정 연동됨
                  </span>
                )}
              </div>

              {/* 통합 단일 발원문 입력 영역 */}
              <div className="space-y-3.5">
                {/* 1. 기원 분야 선택 콤보박스 */}
                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 rounded-full bg-[#C59B27]" />
                      <span>기원 분야 선택</span>
                      <span className="text-[#B8860B]">*</span>
                    </span>
                    <span className="text-[10.5px] font-medium text-[#8A6510]">
                      원터치 선택
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={
                        [
                          '가족건강',
                          '사업번창',
                          '학업/시험합격',
                          '마음평안/소원성취',
                          '자녀축복/취업성취',
                          '액운소멸/무병장수',
                        ].includes(wishCategory)
                          ? wishCategory
                          : '가족건강'
                      }
                      onChange={(e) => {
                        playMoktakSound()
                        handleSelectWishCategory(e.target.value)
                      }}
                      className="w-full appearance-none pl-3.5 pr-10 py-3 rounded-xl bg-[#FAF8F5] border-2 border-[#C59B27] text-xs sm:text-sm font-bold text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 shadow-sm cursor-pointer transition"
                    >
                      <option value="가족건강">🙏 1. 온 가족 건강과 평안 (무병장수)</option>
                      <option value="사업번창">💼 2. 사업번창 · 재물운 만복성취</option>
                      <option value="학업/시험합격">🎓 3. 학업성취 · 시험합격 · 지혜총명</option>
                      <option value="마음평안/소원성취">🪷 4. 마음평안 · 간절한 소원성취</option>
                      <option value="자녀축복/취업성취">🌱 5. 자녀축복 · 취업성취 · 인연대길</option>
                      <option value="액운소멸/무병장수">🛡️ 6. 삼재액운 소멸 · 신액제거 · 무탈기원</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#9A7418]">
                      <ChevronDown className="w-5 h-5 text-[#9A7418]" />
                    </div>
                  </div>
                </div>

                {/* 2. 성함 & 연락처 (2열 그리드) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                  <div>
                    <label className="block text-xs font-bold text-[#3D3630] mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-3.5 rounded-full bg-[#C59B27]" />
                      <span>신청자 성함 (또는 법명)</span>
                      <span className="text-[#B8860B]">*</span>
                    </label>
                    <input
                      type="text"
                      value={wishName}
                      onChange={(e) => setWishName(e.target.value)}
                      placeholder="예: 홍길동 (무량심)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border-2 border-[#D5C59B] focus:bg-white focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3D3630] mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-3.5 rounded-full bg-[#C59B27]" />
                      <span>휴대폰 번호</span>
                      <span className="text-[#B8860B]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={wishPhone}
                      onChange={(e) => setWishPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border-2 border-[#D5C59B] focus:bg-white focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner transition"
                    />
                  </div>
                </div>

                {/* 3. 축원 대상란 (소원발원 대상) */}
                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-3.5 rounded-full bg-[#C59B27]" />
                      <span>소원발원 대상 (축원 대상자)</span>
                    </span>
                    <span className="text-[10.5px] font-semibold text-[#8A6510] bg-[#FAF3DF] px-1.5 py-0.5 rounded border border-[#E5D399]">
                      선택사항
                    </span>
                  </label>
                  <input
                    type="text"
                    value={wishTarget}
                    onChange={(e) => setWishTarget(e.target.value)}
                    placeholder="예: 가족 전체, 부모님, 자녀 (비워두시면 본인 축원)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border-2 border-[#D5C59B] focus:bg-white focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner transition"
                  />
                </div>

                {/* 4. 부처님께 올리는 한 줄 소원 (발원문) */}
                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-3.5 rounded-full bg-[#C59B27]" />
                      <span>부처님께 올리는 한 줄 소원 (발원문)</span>
                    </span>
                    <span className="text-[10.5px] font-semibold text-[#8A6510] bg-[#FAF3DF] px-1.5 py-0.5 rounded border border-[#E5D399]">
                      선택사항
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder={
                      PRAYER_CATEGORY_TEMPLATES[wishCategory] ||
                      '예: 우리 가족 올 한 해 무병장수하고 하는 일마다 순조롭게 풀리기를 발원합니다.'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border-2 border-[#D5C59B] focus:bg-white focus:border-[#C59B27] focus:outline-none text-sm text-[#231F1C] shadow-inner leading-relaxed transition"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#7A7065] mt-1.5 px-0.5">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                      <span>
                        예시문을 수정하거나 그대로 두셔도 <strong>[{wishCategory}]</strong> 정통 발원문으로 자동 축원됩니다.
                      </span>
                    </span>
                    {wishText && (
                      <button
                        type="button"
                        onClick={() => setWishText('')}
                        className="text-[#998877] hover:text-[#554433] underline text-[10.5px] ml-2 shrink-0"
                      >
                        지우기
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF3DF] border border-[#E5D399] text-[11px] text-[#6E5617] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#9A7418] shrink-0 mt-0.5" />
                <div className="break-keep">
                  <strong>제주 소원사 대웅전 매일 축원:</strong> 소원등을 밝히고 남겨주신 발원문은 매일 오전 10시 사시예불마다 부처님 전에 정성껏 축원 올립니다.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#AA8010] text-[#1B1815] font-bold text-xs sm:text-sm shadow-md hover:brightness-105 transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Flame className="w-4 h-4 fill-current shrink-0" />
                <span>대웅전 소원등 켜고 사시예불 축원 올리기</span>
              </button>
            </form>

            {/* 🪔 365일 1년 인등 불사 초슬림 심플 바 */}
            <div
              onClick={() => {
                playMoktakSound()
                setWishCategory('대웅전 1년 인등(가족등)')
                setActiveTab('bulsa')
                setTimeout(() => {
                  const el = document.getElementById('bulsa-section-1') || document.getElementById('bulsa-application-form')
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' })
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }, 80)
              }}
              className="py-3 px-4 rounded-xl bg-[#FAF6EC] border border-[#D5C59B] text-[#7A5B10] hover:bg-[#F5EDD8] cursor-pointer transition flex items-center justify-between text-xs font-bold shadow-xs active:scale-98"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">🪔</span>
                <span className="truncate">365일 대웅전 1년 인등(가족등) 불사 안내</span>
              </div>
              <span className="text-[11px] text-[#A67C1E] shrink-0 flex items-center font-extrabold ml-1">
                <span>자세히 보기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 하단 전체 축원 리스트 (중복 인물 정리 + 다양한 실제 발원문 매핑 + 5건 요약/더보기) */}
            {(() => {
              const VARIETY_PRAYERS = [
                { cat: '가족건강·무병장수', text: '지극한 정성으로 발원하오니, 우리 가족 모두 병고 없이 무병장수하고 화목과 평안이 늘 함께하기를 지심귀명례합니다.' },
                { cat: '사업번창·재수성취', text: '부처님의 가피 아래 일구는 생업과 사업이 날로 번창하고 막힌 재수가 시원하게 트이기를 간절히 발원합니다.' },
                { cat: '자녀합격·학업성취', text: '사랑하는 자녀가 흔들림 없는 지혜와 총명함으로 원하던 시험과 진로에 당당히 합격하기를 축원합니다.' },
                { cat: '가정화목·만사형통', text: '집안에 웃음과 자비가 끊이지 않고 가족들이 뜻하는 일마다 순조롭게 성취되기를 부처님 전에 기원합니다.' },
                { cat: '심신안정·액난소멸', text: '마음속 근심과 삼재팔난이 봄눈 녹듯 사라지고 날마다 맑고 고요한 평화가 깃들기를 발원합니다.' },
                { cat: '소원성취·귀인상봉', text: '간절히 품은 한 가지 소원이 부처님의 자비광명 속에 원만히 이루어지고 좋은 인연들을 만나기를 축원합니다.' },
              ]
              const DEFAULT_REPEAT_TEXT = '지극한 정성으로 발원하오니, 우리 가족 모두 병고 없이 무병장수하고 화목과 평안이 늘 함께하기를 지심귀명례합니다.'
              const seenNames = new Set()
              const deduped = []
              prayers.forEach((p, idx) => {
                if (p.status === 'completed') return
                const nameKey = String(p.believer_name || '').trim()
                if (!nameKey || seenNames.has(nameKey)) return
                seenNames.add(nameKey)
                const isRepeatedDefault = String(p.wish_text || '').trim() === DEFAULT_REPEAT_TEXT && idx > 0
                const v = VARIETY_PRAYERS[deduped.length % VARIETY_PRAYERS.length]
                deduped.push({
                  ...p,
                  display_category: isRepeatedDefault ? v.cat : p.wish_category,
                  display_text: isRepeatedDefault ? v.text : p.wish_text,
                })
              })
              const visibleList = showAllRecentLanterns ? deduped : deduped.slice(0, 5)
              return (
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8]">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="font-serif-kr font-bold text-base text-[#231F1C]">
                      실시간 소원사 대웅전 소원등 ({deduped.length}위)
                    </h3>
                    <span className="text-[11px] font-bold text-[#8A6510] bg-[#FAF3DF] px-2.5 py-0.5 rounded-full border border-[#E5D399]">
                      실시간 점등중
                    </span>
                  </div>
                  <div className="space-y-3">
                    {visibleList.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#231F1C] truncate">
                            🕯️ {p.believer_name} ({p.display_category})
                          </span>
                          <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#EFE7D6] text-[#7D6320] font-medium whitespace-nowrap shrink-0">
                            {p.member_code === currentUser?.code ? '★ 내 소원등' : '대웅전 점등중'}
                          </span>
                        </div>
                        <p className="text-xs text-[#4A433C] leading-relaxed break-keep">“{p.display_text}”</p>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-[#8C7A5B] pt-1">
                          <span className="whitespace-nowrap">✓ {p.prayed_at}</span>
                          <span className="whitespace-nowrap shrink-0">{formatPrayerDate(p.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {deduped.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllRecentLanterns((prev) => !prev)}
                      className="w-full mt-3.5 py-2.5 rounded-xl bg-[#FAF3DF] hover:bg-[#F3E6C3] text-[#7A5608] font-extrabold text-xs border border-[#E5D399] transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{showAllRecentLanterns ? '▲ 소원등 목록 접기' : `▼ 대웅전 점등 소원등 전체 더보기 (${deduped.length}위)`}</span>
                    </button>
                  )}
                </section>
              )
            })()}

            {/* [4번] 소원등 자주 묻는 질문 (FAQ) 아코디언 */}
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-3">
              <div className="border-b border-[#EFE9DD] pb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#C59B27] shrink-0" />
                  <h3 className="font-serif-kr text-base font-bold text-[#231F1C]">
                    소원등 자주 묻는 질문 (FAQ)
                  </h3>
                </div>
                <span className="text-[10.5px] text-[#8A6510] font-bold bg-[#FAF5E6] px-2 py-0.5 rounded-full border border-[#E5D399]">
                  궁금증 안내
                </span>
              </div>

              <div className="space-y-2">
                {/* Q1 */}
                <details className="group rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] transition" open>
                  <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none">
                    <span className="text-xs sm:text-sm font-bold text-[#231F1C] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        Q
                      </span>
                      <span>소원등은 며칠 동안 켜지며 어떻게 유지되나요?</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#8C7A5B] transition-transform duration-200 group-open:rotate-180 shrink-0 ml-2" />
                  </summary>
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#575049] leading-relaxed border-t border-[#EFE9DD] break-keep">
                    발원문을 접수하시면 화면에서 즉시 황금빛 소원등이 밝혀지며, <strong>다음 날 오전 대웅전 사시예불(10:00~11:00) 축원 회향 시점인 오전 11시경까지 환하게 유지</strong>됩니다. 
                    주지 스님께서 부처님 전에 직접 정성껏 축원을 올리고 회향을 마친 <strong>매일 오전 11시 이후, 새로운 원력과 발원으로 1일 1소원등</strong>을 무료로 다시 밝히실 수 있습니다.
                  </div>
                </details>

                {/* Q2 */}
                <details className="group rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] transition">
                  <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none">
                    <span className="text-xs sm:text-sm font-bold text-[#231F1C] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        Q
                      </span>
                      <span>스님께서 정말 매일 아침 사시예불에 축원해 주시나요?</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#8C7A5B] transition-transform duration-200 group-open:rotate-180 shrink-0 ml-2" />
                  </summary>
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#575049] leading-relaxed border-t border-[#EFE9DD] break-keep">
                    네, 그렇습니다. 접수해주신 성함과 발원문은 <strong>제주 소원사 대웅전 사시예불 축원 전산 명부</strong>에 정식으로 등재됩니다. 
                    주지 스님께서 <strong>매일 아침 10시 사시예불(巳時禮佛)</strong>마다 부처님 전에 불자님의 발원 내용을 올리며 정성껏 직접 축원 올립니다.
                  </div>
                </details>

                {/* Q3 */}
                <details className="group rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] transition">
                  <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none">
                    <span className="text-xs sm:text-sm font-bold text-[#231F1C] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        Q
                      </span>
                      <span>소원등 켜기에 별도의 비용이 드나요?</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#8C7A5B] transition-transform duration-200 group-open:rotate-180 shrink-0 ml-2" />
                  </summary>
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#575049] leading-relaxed border-t border-[#EFE9DD] break-keep">
                    <strong>비용은 일체 들지 않습니다.</strong> 소원등 켜기는 거리에 상관없이 전국 어디서나 부처님께 정성을 올리고 마음의 평안을 얻으실 수 있도록 마련된 <strong>100% 무료 비대면 정진 공덕</strong>입니다. 
                    (평생 위패 봉안이나 영구축원명패 등 사찰 불사 동참을 원하시는 경우에만 '불사안내' 탭에서 별도 상담 신청하실 수 있습니다.)
                  </div>
                </details>

                {/* Q4 */}
                <details className="group rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] transition">
                  <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none">
                    <span className="text-xs sm:text-sm font-bold text-[#231F1C] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        Q
                      </span>
                      <span>가족이나 지인의 소원등도 대신 켜줄 수 있나요?</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#8C7A5B] transition-transform duration-200 group-open:rotate-180 shrink-0 ml-2" />
                  </summary>
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#575049] leading-relaxed border-t border-[#EFE9DD] break-keep space-y-1.5">
                    <p>
                      <strong>네, 물론 가능합니다.</strong> 아래 2가지 편한 방법 중 하나로 신청해 주시면 주지 스님께서 부처님 전에 정확히 축원 올립니다:
                    </p>
                    <div className="bg-white p-2.5 rounded-lg border border-[#E5D399] space-y-1 text-[11.5px]">
                      <p>
                        <strong className="text-[#8A6510]">방법 1 (가장 추천):</strong> 성함란에 <strong className="text-[#231F1C]">김영희 (자녀: 김철수)</strong> 처럼 가족 성함을 괄호 안에 함께 적기 (연락처는 본인 휴대폰 번호 입력 가능)
                      </p>
                      <p>
                        <strong className="text-[#8A6510]">방법 2:</strong> 발원문 내용에 <strong className="text-[#231F1C]">“사랑하는 아들 김철수(28세) 시험 합격과 취업 성취 발원”</strong> 처럼 가족의 이름과 소원을 적기
                      </p>
                    </div>
                    <p className="text-[11px] text-[#7A7065]">
                      ※ 접수 즉시 대웅전 전산 명부에 등록되어 사시예불마다 스님께서 해당 가족의 이름을 부처님 전에 정성껏 올려드립니다.
                    </p>
                  </div>
                </details>
              </div>
            </section>
          </main>

  )
}
