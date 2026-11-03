import React from 'react'
import { Sparkles } from 'lucide-react'
import BusinessCardModal from '../BusinessCardModal'

/**
 * 🪪 나의 소원사 모바일 전자명함 전용 전체화면 탭 컴포넌트
 */
export default function MobileCardTab({
  setActiveTab,
  businessCardTarget,
  currentUser,
  members,
  showToast,
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setActiveTab('home')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
        >
          ← 모바일 법당 홈으로
        </button>
        <span className="text-[11px] font-bold text-[#F5D061] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>소원사 모바일 전자명함</span>
        </span>
      </div>

      <BusinessCardModal
        isOpen={true}
        isModal={false}
        member={businessCardTarget || currentUser || members.find((m) => m.code === '33065540')}
        onNavigateTab={(tab) => setActiveTab(tab)}
        showToast={showToast}
      />
    </main>
  )
}
