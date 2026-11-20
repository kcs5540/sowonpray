import React, { useState } from 'react'
import {
  Sparkles,
  Flame,
  Printer,
  Calendar,
  Users,
  Award,
  Phone,
  Share2,
  Copy,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  BookOpen,
  ArrowRight,
  Download,
  HelpCircle
} from 'lucide-react'

export default function ProposalView({ onEnterTemple }) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://sowonpray.vercel.app/proposal'
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="min-h-screen bg-[#120F0D] text-[#E8DFD5] font-sans selection:bg-[#C59B27] selection:text-black">
      {/* 🏛️ 상단 고정 헤더 바 (군더더기 없는 대형 공식 B2B 제안서 타이틀) */}
      <header className="sticky top-0 z-50 bg-[#1A1512]/95 backdrop-blur border-b border-[#C59B27]/40 px-3.5 sm:px-6 py-3 sm:py-3.5 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center gap-2.5 sm:gap-3.5">
          {/* 제주소원사 공식 황금 연꽃 엠블럼 마크 */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#2D241C] via-[#221C16] to-[#17130F] flex items-center justify-center shadow-[0_0_15px_rgba(245,208,97,0.4)] border border-[#C59B27]/70 p-1 shrink-0" title="제주 소원사 공식 심볼">
            <svg className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M20 5C20 5 15 14.5 15 21C15 23.8 17.2 26 20 26C22.8 26 25 23.8 25 21C25 14.5 20 5 20 5Z" fill="url(#proposalHeaderGoldLotus)" opacity="0.95" />
              <path d="M14 12C14 12 7.5 18.5 7.5 23C7.5 26.2 10.2 28 13.2 28C16.2 28 17.8 25.5 17.8 24C17.8 18.5 14 12 14 12Z" fill="url(#proposalHeaderGoldLotus)" opacity="0.82" />
              <path d="M26 12C26 12 32.5 18.5 32.5 23C32.5 26.2 29.8 28 26.8 28C23.8 28 22.2 25.5 22.2 24C22.2 18.5 26 12 26 12Z" fill="url(#proposalHeaderGoldLotus)" opacity="0.82" />
              <path d="M6.5 22.5C6.5 22.5 2.5 26 2.5 29C2.5 31.2 4.5 33 7.8 33C11.8 33 14.8 29.8 14.8 28C14.8 25.2 6.5 22.5 6.5 22.5Z" fill="url(#proposalHeaderGoldLotus)" opacity="0.65" />
              <path d="M33.5 22.5C33.5 22.5 37.5 26 37.5 29C37.5 31.2 35.5 33 32.2 33C28.2 33 25.2 29.8 25.2 28C25.2 25.2 33.5 22.5 33.5 22.5Z" fill="url(#proposalHeaderGoldLotus)" opacity="0.65" />
              <path d="M11.5 32C15.2 34.8 24.8 34.8 28.5 32C26.5 34.8 23.5 35.8 20 35.8C16.5 35.8 13.5 34.8 11.5 32Z" fill="url(#proposalHeaderGoldLotus)" />
              <defs>
                <linearGradient id="proposalHeaderGoldLotus" x1="5" y1="5" x2="35" y2="35" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FDE68A" />
                  <stop offset="0.5" stopColor="#F5D061" />
                  <stop offset="1" stopColor="#B6861C" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 군더더기 없이 시원하고 큼직한 공식 제안서 메인 타이틀 */}
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-white tracking-tight leading-snug break-keep flex-1">
            스마트 모바일법당 & 종무 ERP 도입 제안서
          </h1>
        </div>
      </header>

      {/* 📜 본문 컨테이너 (A4 인쇄 최적화 및 모바일 가독성) */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-12 pb-24">
        {/* 🌟 1. 표지 및 히어로 섹션 */}
        <section className="text-center space-y-6 pt-4 pb-8 border-b border-[#C59B27]/20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C59B27]/15 border border-[#C59B27]/40 text-[#F5D061] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>천년의 불심, 디지털 도량으로 피어나다</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
            내 손안의 도량, <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE58F] via-[#F5D061] to-[#D4AF37]">
              천년의 불심을 스마트폰으로
            </span>
          </h2>

          <p className="text-sm md:text-base text-[#B8AA99] max-w-2xl mx-auto leading-relaxed">
            신도 고령화와 사찰 재정 정체의 위기를 돌파하는 <br className="hidden md:inline" />
            <strong>스마트폰 기도 접수 · AI 사주 변환 · 축원 명패 1초 인쇄 · 어디서나 실시간 종무</strong>
          </p>

          {/* 핵심 지표 뱃지 바 */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] md:text-xs">
            <span className="px-3 py-1 rounded-lg bg-[#241E19] border border-[#C59B27]/30 text-[#E8DFD5]">
              📱 스마트폰 기도·연등 24시간 접수
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#241E19] border border-[#C59B27]/30 text-[#E8DFD5]">
              📖 만세력 필요 없는 사주간지 자동 변환
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#241E19] border border-[#C59B27]/30 text-[#E8DFD5]">
              🖨️ 대웅전 축원 명패 원터치 1초 인쇄
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#241E19] border border-[#C59B27]/30 text-[#E8DFD5]">
              ☁️ 언제 어디서나 PC · 핸드폰 실시간 종무
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#241E19] border border-[#C59B27]/30 text-[#E8DFD5]">
              🎁 카톡 소원등 선물로 전국 자동 포교
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#C59B27]/20 border border-[#F5D061] text-[#FFE58F] font-bold">
              💰 사찰 부담금 0원 (전액 무료 구축)
            </span>
          </div>

          {/* 주요 CTA 버튼들 */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-xl mx-auto">
            <button
              type="button"
              onClick={onEnterTemple}
              className="w-full sm:w-auto px-4 sm:px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F5D061] via-[#D4AF37] to-[#AA7C11] text-black font-extrabold text-xs sm:text-sm md:text-base shadow-xl hover:brightness-110 flex items-center justify-center gap-1.5 transition whitespace-nowrap tracking-tight"
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-red-900 animate-pulse shrink-0" />
              <span className="whitespace-nowrap">제주 소원사 모바일법당 체험하기 ▶</span>
            </button>
            <a
              href="tel:010-3306-5540"
              className="w-full sm:w-auto px-4 sm:px-5 py-3.5 rounded-xl bg-[#28221D] hover:bg-[#342D26] border border-[#C59B27]/50 text-[#F5D061] font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition whitespace-nowrap tracking-tight"
            >
              <Phone className="w-4 h-4 text-[#F5D061] shrink-0" />
              <span className="whitespace-nowrap">제주AI파트너 김철수 대표 (010-3306-5540)</span>
            </a>
          </div>
        </section>

        {/* 📉 2. 전국 사찰이 직면한 3대 현실 위기 (밝은 한지 아이보리 리포트 톤) */}
        <section className="space-y-4 bg-[#FAF8F5] p-6 md:p-8 rounded-3xl border border-[#C59B27]/40 shadow-xl text-[#231F1C]">
          <div className="text-center">
            <span className="text-xs font-bold text-[#AA7C11] tracking-wider uppercase block mb-1">
              01. 현실 위기 분석
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-[#1B1815] mt-1">
              "절에 오시는 보살님들은 연로해지시고, 자녀 세대는 절을 찾지 않습니다"
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-5 rounded-2xl border border-red-200/80 shadow-md space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-bold text-lg">
                👵
              </div>
              <h4 className="font-bold text-[#1B1815] text-base">신도 고령화와 세대 단절</h4>
              <p className="text-xs text-[#5C5247] leading-relaxed">
                도량을 지탱해오신 60~80대 신도들의 거동이 불편해지며 오프라인 참배가 급감하고, 30~50대 청년·중장년 자녀들은 불교와 멀어지고 있습니다.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-md space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-lg">
                📉
              </div>
              <h4 className="font-bold text-[#1B1815] text-base">사찰 재정의 구조적 한계</h4>
              <p className="text-xs text-[#5C5247] leading-relaxed">
                초하루·보름에 직접 사찰에 오는 신도에게만 의존하다 보니, 지리적 한계로 인해 연등·기도 접수와 불사 보시금이 해마다 감소하고 있습니다.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#C59B27]/30 shadow-md space-y-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-[#C59B27]/40 flex items-center justify-center text-[#B6861C] font-bold text-lg">
                ⏳
              </div>
              <h4 className="font-bold text-[#1B1815] text-base">20년 전 구형 전산의 피로</h4>
              <p className="text-xs text-[#5C5247] leading-relaxed">
                구형 전산(두손모아 등)과 수기 장부로 인해 신도 접수 때마다 만세력 책을 뒤지고 명패를 워드로 타이핑하느라 법회 때마다 야근에 시달립니다.
              </p>
            </div>
          </div>
        </section>

        {/* 🔄 3. 패러다임 대전환 */}
        <section className="bg-gradient-to-br from-[#201A16] to-[#15110E] p-6 md:p-8 rounded-3xl border border-[#C59B27]/40 shadow-xl space-y-4">
          <div className="text-center">
            <span className="text-xs font-bold text-[#F5D061] tracking-wider uppercase block mb-1">
              02. 패러다임 대전환
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              '찾아오기만을 기다리는 사찰'에서 <br className="sm:hidden" />
              <span className="text-[#F5D061]">365일 신도의 일상에 머무는 도량</span>으로
            </h3>
          </div>

          <p className="text-xs md:text-sm text-[#C8BCAC] leading-relaxed text-center max-w-2xl mx-auto">
            서울, 부산, 미국, 유럽 등 어디에 살든 내 손안의 스마트폰으로 고향 사찰 부처님께 매일 소원등을 켜고, 
            가족을 위한 기도를 올릴 수 있습니다. 전통의 경건함에 첨단 AI 기술을 더해 <strong>전국 10만 불자 도량</strong>으로 도약합니다.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 text-center">
            <div className="bg-[#14100D] p-3 rounded-xl border border-[#C59B27]/30">
              <div className="text-lg">🕯️</div>
              <div className="text-xs font-bold text-white mt-1">매일 1분 소원등</div>
              <div className="text-[10px] text-[#8C8071]">1일 1회 무료 점등</div>
            </div>
            <div className="bg-[#14100D] p-3 rounded-xl border border-[#C59B27]/30">
              <div className="text-lg">🏛️</div>
              <div className="text-xs font-bold text-white mt-1">대웅전 참배</div>
              <div className="text-[10px] text-[#8C8071]">부처님 삼배와 명상</div>
            </div>
            <div className="bg-[#14100D] p-3 rounded-xl border border-[#C59B27]/30">
              <div className="text-lg">✍️</div>
              <div className="text-xs font-bold text-white mt-1">한줄 금강경 사경</div>
              <div className="text-[10px] text-[#8C8071]">매일 마음 정진</div>
            </div>
            <div className="bg-[#14100D] p-3 rounded-xl border border-[#C59B27]/30">
              <div className="text-lg">🎁</div>
              <div className="text-xs font-bold text-white mt-1">카톡 인연 전달</div>
              <div className="text-[10px] text-[#8C8071]">소원등 선물 전법</div>
            </div>
          </div>
        </section>

        {/* ⚡ 4. 4대 핵심 킬러 솔루션 (밝은 한지 아이보리 테마) */}
        <section className="space-y-6 bg-[#FAF8F5] p-6 md:p-8 rounded-3xl border border-[#C59B27]/40 shadow-xl text-[#231F1C]">
          <div className="text-center">
            <span className="text-xs font-bold text-[#AA7C11] tracking-wider uppercase block mb-1">
              03. 4대 핵심 킬러 솔루션
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-[#1B1815] mt-1">
              스님과 종무소의 일손은 90% 줄이고, 신도의 참여는 500% 폭증합니다
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 솔루션 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#C59B27]/30 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#FAF1D6] text-[#9A6708] border border-[#E3BF6B] text-xs font-bold">킬러 1</span>
                <h4 className="font-bold text-[#1B1815] text-base">자가 접수 & AI 사주간지 자동 산출</h4>
              </div>
              <p className="text-xs text-[#5C5247] leading-relaxed">
                신도가 집에서 스마트폰으로 이름과 생년월일만 입력하면, 만세력 책을 찾을 필요 없이 <strong>사주 간지(예: 갑인생 甲寅生)</strong>가 즉시 자동 변환되어 종무소 ERP에 입력됩니다.
              </p>
              <div className="p-3 rounded-xl bg-[#F5F2EB] border border-[#E5DECF] text-[11px] text-[#4A4036] font-medium leading-relaxed">
                • 양력/음력/윤달 오차 제로 자동 연산 <br />
                • 축원 발원문 및 가족 명단 원터치 동시 등록
              </div>
            </div>

            {/* 솔루션 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#C59B27]/30 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#FAF1D6] text-[#9A6708] border border-[#E3BF6B] text-xs font-bold">킬러 2</span>
                <h4 className="font-bold text-[#1B1815] text-base">대웅전 축원 명패 원터치 1초 인쇄</h4>
              </div>
              <p className="text-xs text-[#5C5247] leading-relaxed">
                신도가 온라인으로 접수한 기도·연등 데이터가 사찰 종무소 관리자에 실시간 연동되어, <strong>[명패 인쇄] 버튼 단 한 번 클릭</strong>으로 대웅전 규격 명패가 출력됩니다.
              </p>
              <div className="p-3 rounded-xl bg-[#F5F2EB] border border-[#E5DECF] text-[11px] text-[#4A4036] font-medium leading-relaxed">
                • 초하루/부처님오신날 수기 타이핑 야근 완전 소멸 <br />
                • 오타 걱정 없는 사찰 표준 명패 서식 자동 정렬
              </div>
            </div>

            {/* 솔루션 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#C59B27]/30 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#FAF1D6] text-[#9A6708] border border-[#E3BF6B] text-xs font-bold">킬러 3</span>
                <h4 className="font-bold text-[#1B1815] text-base">매일 3분 신행 & 공덕 마일리지 락인</h4>
              </div>
              <p className="text-xs text-[#5C5247] leading-relaxed">
                소원등 켜기(+1,000), 대웅전 참배(+1,000), 한줄사경(+1,000) 등 매일 신행을 할 때마다 복덕 공덕이 적립되어, 신도가 매일 도량을 찾게 만드는 강력한 습관을 형성합니다.
              </p>
              <div className="p-3 rounded-xl bg-[#F5F2EB] border border-[#E5DECF] text-[11px] text-[#4A4036] font-medium leading-relaxed">
                • 적립된 공덕은 종무소 단주/기념품 또는 불사 동참 시 사용 <br />
                • 단순 방문을 넘어 진정한 신행의 보람 제공
              </div>
            </div>

            {/* 솔루션 4 */}
            <div className="bg-white p-5 rounded-2xl border border-[#C59B27]/30 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#FAF1D6] text-[#9A6708] border border-[#E3BF6B] text-xs font-bold">킬러 4</span>
                <h4 className="font-bold text-[#1B1815] text-base">신도가 신도를 모셔오는 카톡 전법</h4>
              </div>
              <p className="text-xs text-[#5C5247] leading-relaxed">
                신도가 가족과 친구에게 <em>"우리 절 모바일법당에서 무료 소원등 켜고 성불하세요"</em>라며 카톡으로 등을 선물하면, 상대방도 신도로 자동 가입되는 전법 네트워크입니다.
              </p>
              <div className="p-3 rounded-xl bg-[#F5F2EB] border border-[#E5DECF] text-[11px] text-[#4A4036] font-medium leading-relaxed">
                • 전법 추천인에게 신행 공덕 보너스 부여 <br />
                • 전국·해외의 자녀·친척 세대까지 자연스럽게 신도화
              </div>
            </div>
          </div>
        </section>

        {/* 🎬 5. 스님을 사로잡는 3분 현장 데모 시연 가이드 */}
        <section className="bg-[#181310] p-6 md:p-8 rounded-3xl border border-[#C59B27]/50 shadow-2xl space-y-5">
          <div className="text-center">
            <span className="text-xs font-bold text-[#F5D061] tracking-wider uppercase block mb-1">
              04. 3분 현장 데모 시연 프로세스
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              스님 스마트폰으로 3분 만에 끝내는 현장 검증
            </h3>
          </div>

          <div className="space-y-3 text-xs md:text-sm">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#201A16] border border-[#C59B27]/20">
              <span className="w-6 h-6 rounded-full bg-[#C59B27] text-black font-extrabold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <div>
                <strong className="text-white block text-sm">1분차: 스님 스마트폰으로 소원등 켜기 (신도 관점)</strong>
                <span className="text-[#A89C8C]">
                  스님 스마트폰으로 모바일법당에 접속하여 스님 성함과 생년월일로 무료 소원등을 켭니다. 화면에 사주 간지가 자동으로 즉시 뜨는 것을 확인하십니다.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#201A16] border border-[#C59B27]/20">
              <span className="w-6 h-6 rounded-full bg-[#C59B27] text-black font-extrabold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <strong className="text-white block text-sm">2분차: 종무소 컴퓨터/태블릿 실시간 접수 확인 (종무소 관점)</strong>
                <span className="text-[#A89C8C]">
                  방금 스님 폰에서 켠 소원등이 종무소 관리자 ERP에 실시간 1초 만에 접수되어 장부에 기록된 화면을 보여드립니다.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#201A16] border border-[#C59B27]/20">
              <span className="w-6 h-6 rounded-full bg-[#C59B27] text-black font-extrabold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <strong className="text-white block text-sm">3분차: 대웅전 축원 명패 원터치 출력 시연 (결정타)</strong>
                <span className="text-[#A89C8C]">
                  관리자 화면에서 [명패 인쇄] 버튼을 클릭하자마자, 표준 명패 서식으로 인쇄 대기 화면이 뜨며 즉시 출력되는 모습을 보여드립니다.
                </span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onEnterTemple}
              className="px-6 py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#D4AF37] text-black font-bold text-xs md:text-sm inline-flex items-center gap-1.5 transition"
            >
              <span>지금 스님 스마트폰 시연 바로 해보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 🤝 6. 상생 도입 모델 (밝은 한지 아이보리 테마) */}
        <section className="space-y-4 bg-[#FAF8F5] p-6 md:p-8 rounded-3xl border border-[#C59B27]/40 shadow-xl text-[#231F1C]">
          <div className="text-center">
            <span className="text-xs font-bold text-[#AA7C11] tracking-wider uppercase block mb-1">
              05. 상생 도입 모델 안내
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-[#1B1815] mt-1">
              사찰의 초기 재정 부담을 완전히 없앤 맞춤형 파트너십
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* 옵션 A */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#D4AF37] relative shadow-lg space-y-4">
              <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-[#D4AF37] text-white text-[10px] font-extrabold uppercase shadow-sm">
                스님 선호도 1위 · 적극 추천
              </div>
              <div>
                <span className="text-xs text-[#AA7C11] font-bold">Option A</span>
                <h4 className="text-lg font-bold text-[#1B1815]">상생 파트너형 (초기비용 0원)</h4>
              </div>
              <div className="space-y-2.5 text-xs text-[#5C5247]">
                <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-1.5 gap-2">
                  <span className="shrink-0 whitespace-nowrap text-[#6B5E51]">초기 구축비</span>
                  <div className="text-right">
                    <strong className="text-[#9A6708] font-bold text-sm">0원</strong>
                    <span className="text-[10px] text-[#AA7C11] ml-1">(전액 무료 구축)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-1.5 gap-2">
                  <span className="shrink-0 whitespace-nowrap text-[#6B5E51]">월 고정 유지비</span>
                  <div className="text-right">
                    <strong className="text-[#1B1815] font-bold">0원</strong>
                    <span className="text-[10px] text-[#8C8071] ml-1">(고정비 없음)</span>
                  </div>
                </div>
                <div className="flex items-start justify-between border-b border-[#EAE4D8] pb-1.5 gap-2">
                  <span className="shrink-0 whitespace-nowrap text-[#6B5E51] pt-0.5">정산 방식</span>
                  <div className="text-right">
                    <strong className="text-[#9A6708] font-bold block text-sm">사찰 80% : 운영사 20%</strong>
                    <span className="text-[10px] text-[#8C8071] block">신규 온라인 보시금 기준 (카드·PG수수료, 알림톡/문자비, 서버비 일체 포함)</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#4A4036] leading-relaxed bg-[#F5F2EB] border border-[#E5DECF] p-3.5 rounded-xl font-medium">
                사찰에서 돈 한 푼 들이지 않고 최첨단 모바일법당을 열어, 기존에 없던 온라인 보시금 수익을 창출하므로 사찰에 위험 부담이 전혀 없습니다.
              </p>
            </div>

            {/* 옵션 B */}
            <div className="bg-white p-6 rounded-2xl border border-[#C59B27]/30 shadow-md space-y-4">
              <div>
                <span className="text-xs text-[#8C8071] font-bold">Option B</span>
                <h4 className="text-lg font-bold text-[#1B1815]">단독 독립 솔루션형</h4>
              </div>
              <div className="space-y-2.5 text-xs text-[#5C5247]">
                <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-1.5 gap-2">
                  <span className="shrink-0 whitespace-nowrap text-[#6B5E51]">초기 구축비</span>
                  <div className="text-right">
                    <span className="text-[11px] text-[#A89C8A] line-through mr-1.5">500만 원</span>
                    <strong className="text-[#9A6708] font-bold text-sm">300만 원</strong>
                    <span className="text-[10px] text-[#AA7C11] ml-1">(도입 특별가)</span>
                  </div>
                </div>
                <div className="flex items-start justify-between border-b border-[#EAE4D8] pb-1.5 gap-2">
                  <span className="shrink-0 whitespace-nowrap text-[#6B5E51] pt-0.5">월 유지관리비</span>
                  <div className="text-right">
                    <span className="text-[11px] text-[#A89C8A] line-through mr-1.5">월 50만 원</span>
                    <strong className="text-[#1B1815] font-bold inline-block text-sm">월 30만 원</strong>
                    <span className="text-[10px] text-[#8C8071] block">전용 서버 · 보안 · 기술지원 일체 포함</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-1.5 gap-2">
                  <span className="shrink-0 whitespace-nowrap text-[#6B5E51]">정산 방식</span>
                  <strong className="text-[#1B1815] font-bold text-right text-sm">온라인 보시금 100% 사찰 귀속</strong>
                </div>
              </div>
              <p className="text-[11px] text-[#5C5247] leading-relaxed bg-[#F5F2EB] border border-[#E5DECF] p-3.5 rounded-xl">
                독립적인 전산 자산화를 원하시는 대형 사찰 및 본사급 도량에 적합한 정액제 모델입니다.
              </p>
            </div>
          </div>
        </section>

        {/* 🚀 7. 3주 완성 맞춤 구축 로드맵 */}
        <section className="bg-[#16120F] p-6 md:p-8 rounded-3xl border border-[#C59B27]/30 space-y-4">
          <div className="text-center">
            <span className="text-xs font-bold text-[#F5D061] tracking-wider uppercase block mb-1">
              06. 3주 완성 맞춤 구축 로드맵
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              신청 후 3주면 귀 사찰만의 차세대 모바일법당과 종무 ERP가 완벽히 구축됩니다
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-[#1F1915] p-3.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[#C59B27] font-bold block text-[11px]">1주차: 기획 & 자료</span>
              <strong className="text-white block">사찰 맞춤 설계</strong>
              <p className="text-[#8C8071] text-[11px]">사찰 기본 정보, 주지스님 법문, 법당 전경 및 불상 고화질 촬영본 접수</p>
            </div>
            <div className="bg-[#1F1915] p-3.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[#C59B27] font-bold block text-[11px]">2주차: 전산 구축</span>
              <strong className="text-white block">법당 & 결제 연동</strong>
              <p className="text-[#8C8071] text-[11px]">사찰 전용 화면 디자인, 계좌/온라인 결제 연동, 신도 DB 및 기도 서식 이관</p>
            </div>
            <div className="bg-[#1F1915] p-3.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[#C59B27] font-bold block text-[11px]">3주차 초: 현장 교육</span>
              <strong className="text-white block">종무소 실무 교육</strong>
              <p className="text-[#8C8071] text-[11px]">종무소 관리자 1:1 방문 교육, 대웅전 명패 원터치 인쇄 테스트 완료</p>
            </div>
            <div className="bg-[#1F1915] p-3.5 rounded-xl border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 font-bold block text-[11px]">3주차 말: 개원 & 전법</span>
              <strong className="text-emerald-300 block">공식 오픈 및 홍보</strong>
              <p className="text-[#8C8071] text-[11px]">모바일법당 정식 개원, 기존 신도 안내 문자 및 카카오톡 전법 발송</p>
            </div>
          </div>
        </section>

        {/* 📞 8. 문의 및 상담 신청 푸터 */}
        <section className="bg-gradient-to-r from-[#241E18] to-[#1A1512] p-6 md:p-8 rounded-3xl border border-[#C59B27]/50 shadow-2xl text-center space-y-4">
          <span className="text-2xl">🙏</span>
          <h3 className="text-xl md:text-2xl font-bold text-white">
            지금 귀 사찰의 모바일법당 구축을 상담하세요
          </h3>
          <p className="text-xs md:text-sm text-[#B8AA99] max-w-xl mx-auto">
            요청하시면 사찰을 직접 찾아뵙고 스님과 종무소장님께 스마트폰과 노트북으로 3분 시연을 직접 보여드립니다.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-xl mx-auto">
            <a
              href="tel:010-3306-5540"
              className="w-full sm:w-auto px-4 sm:px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#C59B27] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg hover:brightness-110 transition whitespace-nowrap tracking-tight"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">제주AI파트너 김철수 대표 (010-3306-5540)</span>
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 sm:px-5 py-3.5 rounded-xl bg-[#28221D] hover:bg-[#342D26] border border-[#C59B27]/40 text-[#D5C59B] text-xs font-semibold flex items-center justify-center gap-1.5 transition whitespace-nowrap tracking-tight"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">A4 제안서 인쇄 / PDF 저장</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-[#7A6E5E] space-y-1">
            <p><strong>제안 기관</strong>: 제주소원사 전국 포교위원회 · 제주AI파트너</p>
            <p><strong>대표</strong>: 김철수 (제주AI파트너 대표 / 010-3306-5540) | <strong>이메일</strong>: kcs5540@naver.com</p>
            <p><strong>온라인 데모 도량</strong>: https://sowonpray.vercel.app</p>
          </div>
        </section>
      </main>

      {/* 📱 모바일 하단 플로팅 고정 액션바 */}
      <aside aria-label="모바일 하단 빠른 실행" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1512]/95 backdrop-blur border-t border-[#C59B27]/40 p-3 flex gap-2">
        <a
          href="tel:010-3306-5540"
          className="flex-1 py-2.5 rounded-xl bg-[#28221D] border border-[#C59B27]/40 text-[#F5D061] text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Phone className="w-4 h-4" />
          <span>전화 상담</span>
        </a>
        <button
          type="button"
          onClick={onEnterTemple}
          className="flex-[1.5] py-2.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#C59B27] text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md"
        >
          <Flame className="w-4 h-4 text-red-900" />
          <span>모바일법당 체험 ▶</span>
        </button>
      </aside>
    </div>
  )
}
