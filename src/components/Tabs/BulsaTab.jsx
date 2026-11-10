import React from 'react'
import {
  Award,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  CreditCard,
  Copy,
  HelpCircle,
} from 'lucide-react'

export default function BulsaTab({
  wishName,
  setWishName,
  wishTarget,
  setWishTarget,
  wishPhone,
  setWishPhone,
  wishCategory,
  setWishCategory,
  wishText,
  setWishText,
  showBulsaCategorySheet,
  setShowBulsaCategorySheet,
  tossPayMethod,
  setTossPayMethod,
  customPayAmount,
  setCustomPayAmount,
  currentUser,
  playMoktakSound,
  showToast,
  handleTossTestPayment,
  handlePrayerSubmit,
  PRAYER_CATEGORY_TEMPLATES,
}) {
  return (
<main className="flex-1 flex flex-col gap-4 px-2 py-3.5">
            {/* 상단 불사안내 헤더 */}
            <section className="rounded-2xl bg-gradient-to-br from-[#231F1C] to-[#151210] text-white p-5 border border-[#C59B27]/50 shadow-md">
              <span className="block text-[11px] text-[#F5D061] font-bold whitespace-nowrap">
                제주 소원사 상시 기도 · 공덕 불사 · 위패 봉안 · 삼성각 건립
              </span>
              <h2 className="font-serif-kr text-lg sm:text-xl font-bold mt-1 break-keep">
                현세의 복덕과 자손만대 번창을 발원합니다
              </h2>
              <p className="text-xs text-[#D6CEC2] mt-1.5 leading-relaxed break-keep">
                원하시는 불사 항목을 터치하여 선택하시고 아래 신청란에 남겨주시면 제주 소원사 종무소에서 정성껏 안내 및 축원을 도와드립니다.
              </p>
            </section>

            {/* 3대 불사 바로가기 퀵 탭 (원터치 앵커 이동) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  document.getElementById('bulsa-section-1')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="py-2.5 px-1.5 rounded-xl bg-white border border-[#E6DEC8] text-center shadow-sm hover:border-[#C59B27] transition active:scale-95"
              >
                <span className="block text-[10px] text-[#8A6510] font-bold">1. 상시 기도</span>
                <span className="block text-xs font-black text-[#231F1C] mt-0.5 truncate">공양미 · 인등</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('bulsa-section-2')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="py-2.5 px-1.5 rounded-xl bg-white border border-[#E6DEC8] text-center shadow-sm hover:border-[#C59B27] transition active:scale-95"
              >
                <span className="block text-[10px] text-[#8A6510] font-bold">2. 영구 위패</span>
                <span className="block text-xs font-black text-[#231F1C] mt-0.5 truncate">황금 · 흑색</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('bulsa-section-3')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="py-2.5 px-1.5 rounded-xl bg-white border border-[#E6DEC8] text-center shadow-sm hover:border-[#C59B27] transition active:scale-95"
              >
                <span className="block text-[10px] text-[#8A6510] font-bold">3. 성전 건립</span>
                <span className="block text-xs font-black text-[#231F1C] mt-0.5 truncate">삼성각 불사</span>
              </button>
            </div>

            {/* [큰 항목 1] 상시 기도 및 공덕 불사 종목 (6종) - 가벼운 일상 공덕 우선 배치 */}
            <section
              id="bulsa-section-1"
              className="bg-white rounded-2xl p-5 shadow-md border-2 border-[#C59B27] space-y-3.5 scroll-mt-20"
            >
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAF3DF] text-[#7A5707] border-2 border-[#C59B27] text-[11.5px] font-black whitespace-nowrap shadow-sm mb-1.5">
                  1. 상시 기도 및 공덕 불사 (6종)
                </span>
                <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] break-keep">
                  공양미·초 시주 · 1년 가족 인등 · 100일 특별기도 · 49재 · 조상 천도재 · 기일제사
                </h3>
                <p className="text-xs text-[#575049] mt-1 leading-relaxed break-keep">
                  부처님 전에 정성 어린 공양을 올리고 온 가족의 건강·평안과 조상 영가님의 극락왕생을 발원하는 상시 기도입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    key: '공양미·초 시주',
                    badge: '무량 공덕 보시',
                    title: '① 공양미 · 초 시주',
                    desc: '부처님 전에 올리는 맑은 공양미와 황초 시주 및 제주 소원사 도량 수호에 누구나 가볍게 동참하는 일상 보시입니다.',
                  },
                  {
                    key: '1년 가족 인등',
                    badge: '365일 상시 점등',
                    title: '② 1년 가족 인등',
                    desc: '대웅전 부처님 전에 1년 365일 꺼지지 않는 등불을 밝혀 온 가족의 건강, 자녀 학업·취업, 사업 번창을 매일 사시예불(오전 10시)에 축원합니다.',
                  },
                  {
                    key: '100일 특별기도',
                    badge: '백일 정진 가피',
                    title: '③ 100일 특별기도',
                    desc: '수능·학업·취업·시험합격, 사업번창 및 건강 쾌유를 위해 100일 동안 스님께서 매일 정성껏 축원 올리는 특별 정진 기도입니다.',
                  },
                  {
                    key: '49재 봉행',
                    badge: '영가 극락왕생',
                    title: '④ 49재 봉행',
                    desc: '고인이 돌아가신 후 다음 생을 결정짓는 49일 동안, 7일마다 스님께서 법문을 설하고 영가의 업장을 소멸하여 극락세계 왕생을 돕는 정통 의식입니다.',
                  },
                  {
                    key: '조상 천도재',
                    badge: '조상 해원·우환 소멸',
                    title: '⑤ 조상 천도재',
                    desc: '돌아가신 조상님, 집안의 원인 모를 우환, 빛을 보지 못한 태아령(수자령)의 맺힌 한을 풀고 가내 평안을 회복하는 특별 천도재입니다.',
                  },
                  {
                    key: '사찰 기일제사',
                    badge: '사찰 정갈한 제사',
                    title: '⑥ 사찰 기일제사',
                    desc: '현대 가정에서 제사상을 차리기 어려울 때, 고인의 기일에 맞춰 사찰 대웅전에서 스님 집전 아래 정갈하게 모셔드리는 기일 제사입니다.',
                  },
                ].map((item) => {
                  const isSelected = wishCategory === item.key
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        playMoktakSound()
                        setWishCategory(item.key)
                        document.getElementById('bulsa-application-form')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF3DF] border-[#C59B27] ring-1 ring-[#C59B27]'
                          : 'bg-[#FAF8F5] border-[#EAE2D3] hover:border-[#C59B27]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                        <span className="text-xs font-bold text-[#231F1C] break-keep">
                          {item.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${
                          isSelected
                            ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27]'
                            : 'bg-white text-[#8A6510] border-[#E5D399]'
                        }`}>
                          {isSelected ? `✓ 선택됨 · ${item.badge}` : item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#575049] leading-relaxed break-keep">{item.desc}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* [큰 항목 2] 명당 위패 봉안 불사 (2종) */}
            <section
              id="bulsa-section-2"
              className="bg-white rounded-2xl p-5 shadow-md border-2 border-[#C59B27] space-y-4 scroll-mt-20"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAF3DF] text-[#7A5707] border-2 border-[#C59B27] text-[11.5px] font-black whitespace-nowrap shadow-sm mb-1.5">
                    2. 명당 위패 봉안 불사 (2종)
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] break-keep">
                    생전 예수재 황금위패 · 조상 영구위패
                  </h3>
                </div>
                <Award className="w-6 h-6 text-[#C59B27] shrink-0" />
              </div>

              <div className="rounded-xl overflow-hidden border border-[#D8CBB8]">
                <img
                  src="/images/wipae_product.jpg"
                  alt="생전 예수재 황금위패와 조상 흑색 위패 실물"
                  className="w-full h-44 object-cover"
                />
                <div className="bg-[#1B1815] text-white px-3 py-2 flex flex-col sm:flex-row sm:justify-between items-center gap-1 text-[10.5px] font-bold text-center">
                  <span className="text-[#F5D061]">◀ 좌측: 생전 예수재 황금위패</span>
                  <span className="text-[#E2DAD0]">우측: 조상 영가 흑색위패 ▶</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* ① 생전 예수재 황금위패 */}
                <div
                  onClick={() => {
                    playMoktakSound()
                    setWishCategory('생전예수재(황금위패)')
                    document.getElementById('bulsa-application-form')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`rounded-xl border-2 p-4 space-y-2 cursor-pointer transition ${
                    wishCategory === '생전예수재(황금위패)'
                      ? 'border-[#B8860B] ring-2 ring-[#D4AF37]/40 bg-gradient-to-br from-[#FFFDF7] to-[#F6E8BE]'
                      : 'border-[#D4AF37] bg-gradient-to-br from-[#FFFDF7] to-[#F9F1D8]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#D4AF37] text-[#1B1815] break-keep">
                      살아계신 분 · 현세 복덕과 무병장수
                    </span>
                    <span className="text-xs font-extrabold text-[#8A6510] shrink-0">
                      영구 봉안
                    </span>
                  </div>
                  <h4 className="font-serif-kr font-bold text-base text-[#231F1C] break-keep">
                    ① 생전 예수재 황금빛 위패
                  </h4>
                  <p className="text-xs text-[#575049] leading-relaxed break-keep">
                    살아생전에 미리 선업과 공덕을 닦아 삼재팔난과 액난을 소멸하고, 부모님과 가족의 무병장수·수복증장을 기원하는 찬란한 황금 위패입니다.
                  </p>
                </div>

                {/* ② 조상 영가 흑색 위패 */}
                <div
                  onClick={() => {
                    playMoktakSound()
                    setWishCategory('조상영구위패(흑색)')
                    document.getElementById('bulsa-application-form')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`rounded-xl border p-4 space-y-2 cursor-pointer transition bg-gradient-to-br from-[#3D3731] to-[#2B2621] text-[#FAF8F5] shadow-sm ${
                    wishCategory === '조상영구위패(흑색)'
                      ? 'border-[#F5D061] ring-2 ring-[#F5D061]/40'
                      : 'border-[#5A5146]/60 hover:border-[#8C7B68]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#C59B27]/30 text-[#FCE18B] border border-[#F5D061]/50 break-keep">
                      돌아가신 조상님 · 극락왕생 천도
                    </span>
                    <span className="text-xs font-extrabold text-[#FCE18B] shrink-0">
                      영구 봉안
                    </span>
                  </div>
                  <h4 className="font-serif-kr font-bold text-base text-white break-keep">
                    ② 조상 영가 품격 흑색 영구위패
                  </h4>
                  <p className="text-xs text-[#D8D0C5] leading-relaxed break-keep">
                    중후한 흑색 바탕에 순금빛 존함을 새겨 후손들의 제사 부담을 덜어드리고, 사찰에서 영구히 독경과 합동 차례·천도 축원을 올립니다.
                  </p>
                </div>
              </div>
            </section>

            {/* [큰 항목 3] 삼성각(三聖閣) 성전 건립 대작불사 (3종) - 가벼운 소원기와부터 배치 */}
            <section
              id="bulsa-section-3"
              className="bg-white rounded-2xl p-5 shadow-md border-2 border-[#C59B27] space-y-3.5 scroll-mt-20"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAF3DF] text-[#7A5707] border-2 border-[#C59B27] text-[11.5px] font-black whitespace-nowrap shadow-sm mb-1.5">
                    3. 천년 도량 성전 건립 대작불사 (3종)
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] break-keep">
                    제주 소원사 ‘삼성각(三聖閣)’ 건립 불사
                  </h3>
                  <p className="text-xs text-[#575049] mt-1 leading-relaxed break-keep">
                    성전을 짓는 불사에 한 번 이름을 올리는 공덕은 전각이 도량에 서 있는 한{' '}
                    <strong className="text-[#8A6510]">자손만대 복밭(福田)</strong>으로 이어집니다.
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-[#C59B27] shrink-0 mt-0.5" />
              </div>

              {/* 삼성각에 모시는 세 분 성인(三聖) 가피 요약 (정갈한 베이지 골드 톤) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-[#FAF5E6] border border-[#E5D399] text-center">
                  <div className="text-[11px] font-extrabold text-[#8A6510] whitespace-nowrap">
                    칠성님
                  </div>
                  <div className="text-[10px] text-[#575049] mt-0.5 break-keep">
                    무병장수·자손번창
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF5E6] border border-[#E5D399] text-center">
                  <div className="text-[11px] font-extrabold text-[#8A6510] whitespace-nowrap">
                    산신님
                  </div>
                  <div className="text-[10px] text-[#575049] mt-0.5 break-keep">
                    재물성취·사업번창
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF5E6] border border-[#E5D399] text-center">
                  <div className="text-[11px] font-extrabold text-[#8A6510] whitespace-nowrap">
                    독성(나반존자)
                  </div>
                  <div className="text-[10px] text-[#575049] mt-0.5 break-keep">
                    빠른소원·시험합격
                  </div>
                </div>
              </div>

              {/* 삼성각 건립 3단계 동참 항목 (가벼운 소원기와부터 정갈한 카드 스타일) */}
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    key: '삼성각 소원기와불사',
                    badge: '가족 소원 기재',
                    title: '① 삼성각 건립 소원 기와 불사 (1장)',
                    desc: '한식 기와 뒷면에 온 가족의 성함과 간절한 소원을 직접 적어 삼성각 지붕 위에 영구히 올리는 정성 어린 대중 불사입니다.',
                  },
                  {
                    key: '삼성각 기둥·단청불사',
                    badge: '가문 공덕 각인',
                    title: '② 삼성각 대들보 · 기둥 · 오색단청 불사',
                    desc: '성전을 떠받치는 기둥·서까래와 장엄한 오색 단청에 시주자 가문의 이름을 영구히 각인하여 가내 평안과 자손 번창의 기틀을 세웁니다.',
                  },
                  {
                    key: '삼성각 영구축원명패',
                    badge: '가족 영구 봉안',
                    title: '③ 삼성각 가족 영구축원 명패 · 주춧돌 불사',
                    desc: '삼성각 내부에 온 가족의 이름과 발원을 담은 영구 축원 명패를 모셔 대대로 칠성·산신·독성 세 분 성인의 크신 가피를 받습니다.',
                  },
                ].map((item) => {
                  const isSelected = wishCategory === item.key
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        playMoktakSound()
                        setWishCategory(item.key)
                        document.getElementById('bulsa-application-form')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF3DF] border-[#C59B27] ring-1 ring-[#C59B27]'
                          : 'bg-[#FAF8F5] border-[#EAE2D3] hover:border-[#C59B27]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-[#231F1C] break-keep">
                          {item.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold whitespace-nowrap shrink-0 ${
                          isSelected
                            ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27]'
                            : 'bg-white text-[#8A6510] border-[#E5D399]'
                        }`}>
                          {isSelected ? `✓ 선택됨 · ${item.badge}` : item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#575049] leading-relaxed break-keep">
                        {item.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 기도·위패·불사 통합 신청란 */}
            <form
              id="bulsa-application-form"
              onSubmit={handlePrayerSubmit}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border-2 border-[#C59B27] space-y-4 scroll-mt-20"
            >
              <div className="border-b border-[#EFE9DD] pb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-[10.5px] font-bold text-[#9A7418]">
                    ONLINE APPLICATION
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] break-keep">
                    기도 · 위패 · 불사 동참 신청란
                  </h3>
                </div>
                {currentUser && (
                  <span className="text-[10.5px] px-2 py-1 rounded-full bg-[#FAF3DF] text-[#8A6510] font-bold border border-[#E5D399] shrink-0">
                    내 계정 연동됨
                  </span>
                )}
              </div>

              {/* STEP 1. 종목 선택 영역 (세련된 콤보박스 / 드롭다운) */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF5E6] border border-[#E5D399] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <label htmlFor="bulsa-category-select" className="flex items-center gap-1.5 text-xs font-extrabold text-[#231F1C]">
                    <span className="px-2 py-0.5 rounded-md bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold shrink-0">
                      1단계
                    </span>
                    <span>기도 · 위패 · 불사 종목 선택</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#9A7418] shrink-0">
                    ▼ 콤보박스 선택
                  </span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    id="bulsa-category-select-btn"
                    onClick={() => setShowBulsaCategorySheet(true)}
                    className="w-full appearance-none pl-3.5 pr-10 py-3 rounded-xl bg-white border-2 border-[#C59B27] text-left text-xs sm:text-sm font-bold text-[#231F1C] focus:outline-none focus:ring-2 focus:ring-[#C59B27]/50 shadow-sm cursor-pointer flex items-center justify-between"
                  >
                    <span className={wishCategory ? "text-[#231F1C] truncate" : "text-[#8C8071] truncate"}>
                      {wishCategory ? (
                        wishCategory === '생전예수재(황금위패)'
                          ? '① 생전예수재 황금빛 위패 (살아계신 분)'
                          : wishCategory === '조상영구위패(흑색)'
                          ? '② 조상 영가 품격 흑색 영구위패'
                          : wishCategory === '공양미·초 시주' || wishCategory === '대웅전 공양미/불전시주'
                          ? '① 공양미 · 초 시주'
                          : wishCategory === '1년 가족 인등' || wishCategory === '대웅전 1년 인등(가족등)'
                          ? '② 1년 가족 인등'
                          : wishCategory === '100일 특별기도' || wishCategory === '100일 소원성취 특별기도'
                          ? '③ 100일 특별기도'
                          : wishCategory === '49재 봉행'
                          ? '④ 49재 봉행'
                          : wishCategory === '조상 천도재'
                          ? '⑤ 조상 천도재'
                          : wishCategory === '사찰 기일제사'
                          ? '⑥ 사찰 기일제사'
                          : wishCategory === '49재/천도재/기일제사'
                          ? '④ 49재 / 천도재 / 기일제사'
                          : wishCategory === '삼성각 소원기와불사'
                          ? '① 삼성각 건립 소원 기와 불사 (1장)'
                          : wishCategory === '삼성각 기둥·단청불사'
                          ? '② 삼성각 대들보 · 기둥 · 오색단청 불사'
                          : wishCategory === '삼성각 영구축원명패'
                          ? '③ 삼성각 가족 영구축원 명패 · 주춧돌'
                          : wishCategory === '기타 특별기도 상담'
                          ? '④ 기타 특별기도 및 맞춤 불사 상담'
                          : wishCategory
                      ) : (
                        '동참하실 종목을 선택해 주세요 (눌러서 선택) ▾'
                      )}
                    </span>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#9A7418]">
                      <ChevronDown className="w-5 h-5 text-[#9A7418]" />
                    </div>
                  </button>
                </div>

                {[
                  '공양미·초 시주',
                  '1년 가족 인등',
                  '100일 특별기도',
                  '49재 봉행',
                  '조상 천도재',
                  '사찰 기일제사',
                  '대웅전 공양미/불전시주',
                  '대웅전 1년 인등(가족등)',
                  '100일 소원성취 특별기도',
                  '49재/천도재/기일제사',
                  '생전예수재(황금위패)',
                  '조상영구위패(흑색)',
                  '삼성각 소원기와불사',
                  '삼성각 기둥·단청불사',
                  '삼성각 영구축원명패',
                  '기타 특별기도 상담',
                ].includes(wishCategory) ? (
                  <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white/80 border border-[#E5D399] text-xs">
                    <span className="text-[#7A5B10] font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#C59B27] inline-block animate-pulse" />
                      선택된 종목:
                    </span>
                    <strong className="text-[#231F1C] font-extrabold truncate">
                      {wishCategory}
                    </strong>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#8A7456] leading-tight pl-1">
                    ※ 위 1·2·3번 안내 카드를 터치하셔도 해당 종목이 자동 선택됩니다.
                  </p>
                )}
              </div>

              {/* 구분선 */}
              <div className="border-t border-dashed border-[#DFD6C7]" />

              {/* STEP 2. 신청자 정보 및 발원 내용 입력 영역 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F4F1EA] border border-[#DDD4C4] space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#231F1C]">
                    <span className="px-2 py-0.5 rounded-md bg-[#8A6510] text-white text-[10px] font-extrabold shrink-0">
                      2단계
                    </span>
                    <span>신청자 성함 · 발원문 접수</span>
                  </div>
                  <span className="text-[10.5px] text-[#7A7065] font-medium shrink-0">
                    ✎ 직접 입력
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#3D3630] mb-1">
                      신청자 성함 (법명) <span className="text-[#B8860B]">*</span>
                    </label>
                    <input
                      type="text"
                      value={wishName}
                      onChange={(e) => setWishName(e.target.value)}
                      placeholder="예: 홍길동 (무량심)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3D3630] mb-1">
                      연락처 (상담 안내용) <span className="text-[#B8860B]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={wishPhone}
                      onChange={(e) => setWishPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner"
                    />
                  </div>
                </div>

                {/* 축원 대상란 (소원발원 대상) */}
                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1 flex items-center gap-1.5">
                    <span>소원발원 대상 (축원 대상자)</span>
                    <span className="text-[10px] font-semibold text-[#8A6510] bg-[#FAF3DF] px-1.5 py-0.5 rounded border border-[#E5D399]">
                      선택
                    </span>
                  </label>
                  <input
                    type="text"
                    value={wishTarget}
                    onChange={(e) => setWishTarget(e.target.value)}
                    placeholder="예: 자녀 김철수, 부모님, 가족 전체"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner"
                  />
                  <div className="flex items-center gap-1 text-[11px] text-[#7A7065] mt-1.5 px-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                    <span>
                      비워두시면 <strong>[신청자 본인]</strong>으로 축원됩니다
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1 flex items-center gap-1.5">
                    <span>봉안 대상자 정보 및 발원 내용</span>
                    <span className="text-[10px] font-semibold text-[#8A6510] bg-[#FAF3DF] px-1.5 py-0.5 rounded border border-[#E5D399]">
                      선택
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder={
                      PRAYER_CATEGORY_TEMPLATES[wishCategory] ||
                      '예: 부모님 생전예수재 황금위패 2기 봉안 상담 희망합니다 / 가족 1년 인등 신청합니다.'
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm text-[#231F1C] shadow-inner leading-relaxed"
                  />
                  <div className="mt-2 p-2.5 sm:p-3 rounded-xl bg-[#FAF5E6] border border-[#E5D399] text-xs text-[#5C4A28] space-y-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                        <p className="leading-relaxed break-keep text-[#3D3630]">
                          <strong className="text-[#231F1C] font-extrabold">예시문을 자유롭게 수정하시거나 그대로 두셔도 됩니다.</strong><br />
                          접수해 주시면 <strong className="text-[#8A6510] font-extrabold">제주 소원사 종무소에서 전화로 친절히 상세 일정과 동참 절차를 상담 안내</strong>해 드립니다.
                        </p>
                      </div>
                      {wishText && (
                        <button
                          type="button"
                          onClick={() => setWishText('')}
                          className="text-[#998877] hover:text-[#554433] underline text-[10.5px] shrink-0 ml-1 font-semibold"
                        >
                          지우기
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#AA8010] text-[#1B1815] font-extrabold text-xs sm:text-sm shadow-md hover:brightness-105 transition flex items-center justify-center gap-1.5 cursor-pointer overflow-hidden"
                >
                  <Award className="w-4 h-4 shrink-0" />
                  <span className="truncate">기도 · 위패 · 불사 신청 접수하기</span>
                </button>

                {/* 💳 간편 온라인 시주 · 보시 결제 (카카오페이 · 신용카드 · 계좌이체) */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF6EC] border border-[#DFCFA8] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CreditCard className="w-4 h-4 text-[#8A6510] shrink-0" />
                      <span className="text-xs font-extrabold text-[#231F1C] truncate">
                        간편 온라인 시주 · 보시 결제
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#231F1C] text-[#F5D061] border border-[#C59B27]/50 shrink-0 whitespace-nowrap">
                      종무소 자동 등재
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[11px] sm:text-xs">
                    {['카드', '계좌이체', '가상계좌'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTossPayMethod(m)}
                        className={`py-2 px-1 rounded-lg font-bold border transition cursor-pointer whitespace-nowrap truncate ${
                          tossPayMethod === m
                            ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] shadow-sm'
                            : 'bg-white text-[#5C5349] border-[#DDD4C4] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {m === '카드' ? '카드·간편결제' : m === '계좌이체' ? '계좌이체' : '가상계좌'}
                      </button>
                    ))}
                  </div>

                  {/* 빠른 금액 선택 칩 + 잘림 없는 천단위 콤마 금액 입력란 */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { label: '3만', val: '30000' },
                        { label: '5만', val: '50000' },
                        { label: '10만', val: '100000' },
                        { label: '30만', val: '300000' },
                        { label: '50만', val: '500000' },
                      ].map((chip) => {
                        const active = String(customPayAmount) === chip.val
                        return (
                          <button
                            key={chip.val}
                            type="button"
                            onClick={() => setCustomPayAmount(chip.val)}
                            className={`py-1.5 rounded-lg text-[11px] font-extrabold border transition cursor-pointer ${
                              active
                                ? 'bg-[#FAF0D7] text-[#8A6510] border-[#C59B27]'
                                : 'bg-white text-[#6E655C] border-[#E4DDD0] hover:bg-[#FAF8F5]'
                            }`}
                          >
                            +{chip.label}
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl border-2 border-[#D5C59B] focus-within:border-[#C59B27] px-3.5 py-2.5">
                      <span className="text-xs font-bold text-[#6E655C] shrink-0">보시금액 입력</span>
                      <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={customPayAmount ? Number(customPayAmount).toLocaleString() : ''}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, '')
                            setCustomPayAmount(raw)
                          }}
                          placeholder="100,000"
                          className="w-full text-right font-mono font-extrabold text-base text-[#231F1C] focus:outline-none min-w-0"
                        />
                        <span className="text-xs font-extrabold text-[#231F1C] shrink-0">원</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleTossTestPayment}
                      className="w-full py-3 rounded-xl bg-[#231F1C] hover:bg-[#322C26] text-[#F5D061] border border-[#C59B27] font-extrabold text-xs sm:text-sm shadow flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer transition active:scale-98"
                    >
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <span>{Number(customPayAmount || 0).toLocaleString()}원 온라인 보시 결제하기</span>
                    </button>
                  </div>
                  <p className="text-[10.5px] text-[#7A6E5D] leading-snug">
                    ※ 결제 완료 즉시 대웅전 사시예불 축원 명부와 종무소 전산에 자동 등재됩니다.
                  </p>
                </div>
              </div>
            </form>

            {/* 제주 소원사 공식 시주 · 불사 동참 계좌 안내 및 원터치 복사 */}
            <section className="bg-gradient-to-br from-[#1E1A16] to-[#151210] rounded-2xl p-4 sm:p-5 border border-[#C59B27]/50 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F5D061] animate-pulse shrink-0" />
                  <span className="text-xs font-black text-[#F5D061] tracking-wide">
                    제주 소원사 공식 시주 · 불사 동참 계좌
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C59B27]/25 text-[#FCE18B] border border-[#F5D061]/30 font-bold whitespace-nowrap shrink-0">
                  종무소 공식
                </span>
              </div>
              <p className="text-[11.5px] text-[#D6CEC2] leading-relaxed break-keep">
                불사 및 상시기도 신청 후 아래 사찰 공식 계좌로 시주금을 입금해 주시면, 입금 확인 즉시 종무소 대웅전 축원 대장에 등재되어 매일 오전 10시 사시예불 축원이 정성껏 봉행됩니다.
              </p>
              <div className="p-3 rounded-xl bg-[#28221C] border border-[#C59B27]/40 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-[#A89E90] font-semibold">
                    농협은행 (예금주: 소원사)
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-[#F5D061] tracking-wider mt-0.5 select-all truncate">
                    301-0324-0024-41
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('301-0324-0024-41')
                    showToast('📋 소원사 농협 계좌번호(301-0324-0024-41)가 복사되었습니다!')
                  }}
                  className="px-2.5 py-2 rounded-lg bg-[#C59B27] hover:bg-[#D4AF37] text-[#1B1815] font-extrabold text-xs flex items-center gap-1 shadow active:scale-95 transition shrink-0 whitespace-nowrap"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>복사</span>
                </button>
              </div>
              <div className="text-[10.5px] text-[#A89E90] flex items-center gap-1.5 pt-0.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                <span>입금 시 신청자 성함(또는 법명)으로 입금해 주시면 종무소 확인이 가장 빠릅니다.</span>
              </div>
            </section>
          </main>
  )
}
