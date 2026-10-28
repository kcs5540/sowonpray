import React from 'react'
import {
  Award,
  Calculator,
  CheckCircle2,
  FileText,
  Flame,
  Heart,
  LogOut,
  PlusCircle,
  Printer,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import MemberDetailModal from './MemberDetailModal'
import {
  SettlementModal,
  SettlementEditModal,
  SettlementConfirmModal,
} from './SettlementModals'
import BusinessCardModal from '../BusinessCardModal'
import {
  IndividualRecordPrintModal,
  IndeungNameplatePrintModal,
  SasiPrayerPrintModal,
} from '../PrintModals'
import { computeZodiacAndGanji, formatPhone11 } from '../../lib/supabase'

// 🏛️ [독립형 종무행정 ERP 풀스크린 데스크톱 모드 전산센터]
export default function AdminERPView(props) {
  const {
    currentUser,
    isMasterOrTempleAdmin,
    isMaster,
    isTempleAdmin,
    loginIdInput,
    setLoginIdInput,
    loginPwInput,
    setLoginPwInput,
    handleLogin,
    handleLogout,
    members = [],
    setMembers,
    prayers = [],
    setPrayers,
    settlements = [],
    setSettlements,
    activeSasiPrayers,
    filteredSasiPrayers,
    isStandaloneAdmin,
    setIsStandaloneAdmin,
    erpTab,
    setErpTab,
    activeTab,
    setActiveTab,
    showToast,
    adminMemberRoleFilter,
    setAdminMemberRoleFilter,
    adminMemberSearchQuery = "",
    setAdminMemberSearchQuery,
    adminMemberSort,
    setAdminMemberSort,
    filteredAdminMembers = [],
    businessCardTarget,
    setBusinessCardTarget,
    editingSettlement,
    setEditingSettlement,
    excelParsedRows = [],
    setExcelParsedRows,
    excelPasteText,
    setExcelPasteText,
    indeungTargetMember,
    setIndeungTargetMember,
    individualRecordTargetMember,
    setIndividualRecordTargetMember,
    isEditingMember,
    setIsEditingMember,
    isExcelUploading,
    setIsExcelUploading,
    lanternTargetMember,
    setLanternTargetMember,
    memberEditForm,
    setMemberEditForm,
    pendingSettlementConfirm,
    setPendingSettlementConfirm,
    regBelieverAddress,
    setRegBelieverAddress,
    regBelieverDharma,
    setRegBelieverDharma,
    regBelieverName,
    setRegBelieverName,
    regBelieverParent,
    setRegBelieverParent,
    regBelieverPhone,
    setRegBelieverPhone,
    regFamilyList = [],
    setRegFamilyList,
    regPrayerType,
    setRegPrayerType,
    regWishText,
    setRegWishText,
    sasiPrayedCheckedIds = new Set(),
    setSasiPrayedCheckedIds,
    sasiPrayerTypeTab,
    setSasiPrayerTypeTab,
    selectedMemberDetail,
    setSelectedMemberDetail,
    settlementItemType,
    setSettlementItemType,
    settlementMemo,
    setSettlementMemo,
    settlementPaidAmount,
    setSettlementPaidAmount,
    settlementPaymentStatus,
    setSettlementPaymentStatus,
    settlementStandardAmount,
    setSettlementStandardAmount,
    settlementAppliedDate,
    setSettlementAppliedDate,
    settlementPaidDate,
    setSettlementPaidDate,
    settlementPaymentMethod,
    setSettlementPaymentMethod,
    settlementTargetMember,
    setSettlementTargetMember,
    showBulsaCategorySheet,
    setShowBulsaCategorySheet,
    showBusinessCardModal,
    setShowBusinessCardModal,
    showIndeungNameplateModal,
    setShowIndeungNameplateModal,
    showIndividualRecordPrintModal,
    setShowIndividualRecordPrintModal,
    showSasiPrintModal,
    setShowSasiPrintModal,
    showSettlementModal,
    setShowSettlementModal,
    executeFinalSettlementRegistration,
    getMemberPrayerAndPaymentInfo,
    handleAddFamilyRow,
    handleConfirmSettlementPayment,
    handleDeleteSettlement,
    handleParseExcel,
    handleBatchImportExcel,
    handleRefundSettlement,
    handleRegisterFamilyMember,
    handleRegisterSettlementForMember,
    handleRemoveFamilyRow,
    handleSaveEditedSettlement,
    handleUpdateFamilyRow,
    renderBulsaCategorySheet,
    renderLanternModal,
    renderMemberRowCard,
    toggleSasiPrayedCheck,
    handleSaveMemberEdit,
    adminKPIs = {},
    currentActiveBeliever,
    setActiveBelieverCode,
    setCurrentUserCode,
  } = props

  const agents = React.useMemo(() => {
    return (members || []).filter(
      (m) =>
        m.role === 'agent' ||
        m.role === 'committee_head' ||
        m.role === 'committee_member' ||
        m.role === 'temple_admin' ||
        m.role === 'master'
    )
  }, [members])

  return (
      <div className="min-h-screen bg-[#161310] text-[#FAF8F5] w-full selection:bg-[#C59B27] selection:text-white flex flex-col font-sans">
        {/* ==================== 🏛️ ERP 전용 최상단 데스크톱 헤더 ==================== */}
        <header className="sticky top-0 z-40 bg-[#1B1815] text-[#FAF8F5] px-4 sm:px-6 py-3 border-b-2 border-[#C59B27] flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D241C] via-[#221C16] to-[#17130F] flex items-center justify-center border border-[#C59B27]/70 p-1 shrink-0 shadow-md">
              <span className="text-xl text-[#F5D061] font-bold">卍</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif-kr font-extrabold text-base sm:text-lg tracking-tight text-[#F5D061]">
                  제주 소원사 종무행정 종합 ERP 전산센터
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold font-mono">
                  temple_id: sowonsa (사찰 단독 격리 100%)
                </span>
              </div>
              <p className="text-[11px] text-[#C5BBAF]">
                신도 신적부 · 가족 사주 만세력 · 사시예불 축원 및 대웅전 인등 명패 원스톱 관제
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isMasterOrTempleAdmin && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-[#2C241C] text-[#F5D061] border border-[#C59B27]/50 font-bold hidden md:inline">
                {isTempleAdmin ? '🏛️ 양영문 창건주 본부' : '👑 김철수 총괄대표 (마스터)'}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setIsStandaloneAdmin(false)
                window.history.pushState({}, '', '/')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-white/20 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>📱 모바일 법당 보기</span>
            </button>
            {isMasterOrTempleAdmin && (
              <button
                type="button"
                onClick={() => {
                  setCurrentUserCode('82341088')
                  localStorage.removeItem('sowonpray_current_user_v3')
                  setIsStandaloneAdmin(false)
                  window.history.pushState({}, '', '/')
                  showToast('종무행정 전산에서 로그아웃되었습니다.')
                }}
                className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700/60 text-xs font-bold transition flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            )}
          </div>
        </header>

        {/* ==================== 본문 분기: 관리자 로그인 vs ERP 대시보드 ==================== */}
        {!isMasterOrTempleAdmin ? (
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#FAF8F5] text-[#231F1C] rounded-3xl p-6 sm:p-8 border-2 border-[#C59B27] shadow-2xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1B1815] text-[#F5D061] flex items-center justify-center text-2xl font-bold mx-auto border-2 border-[#C59B27] shadow">
                卍
              </div>
              <div>
                <h2 className="font-serif-kr text-xl font-black text-[#1B1815]">
                  종무행정 전산 보안 로그인
                </h2>
                <p className="text-xs text-[#7A6E5E] mt-1 leading-relaxed">
                  사찰 최고책임자(창건주 양영문 회장) 및 총괄대표(김철수 위원장) 전용 행정 전산망입니다.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3 text-left">
                <div>
                  <label className="text-xs font-bold text-[#4A3D2A] block mb-1">
                    관리자 전화번호 (아이디)
                  </label>
                  <input
                    type="tel"
                    value={loginIdInput}
                    onChange={(e) => setLoginIdInput(e.target.value)}
                    placeholder="010-3306-5540 또는 010-5557-0267"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C59B] text-xs font-bold font-mono focus:outline-none focus:border-[#C59B27]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#4A3D2A] block mb-1">
                    전산 비밀번호
                  </label>
                  <input
                    type="password"
                    value={loginPwInput}
                    onChange={(e) => setLoginPwInput(e.target.value)}
                    placeholder="비밀번호 입력 (초기: 0000 / 0267)"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C59B] text-xs font-bold font-mono focus:outline-none focus:border-[#C59B27]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#8A6510] to-[#231F1C] text-[#FAF8F5] font-extrabold text-sm shadow-md hover:brightness-105 transition"
                >
                  종무행정 ERP 관제센터 접속하기
                </button>
              </form>

              {/* 원클릭 테스트 계정 버튼 */}
              <div className="pt-2 border-t border-[#E6DEC8] space-y-1.5">
                <div className="text-[11px] text-[#8C8071] font-semibold">
                  원클릭 테스트 로그인:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentUserCode('33065540')
                      localStorage.setItem('sowonpray_current_user_v3', '33065540')
                      showToast('김철수 총괄대표님(마스터)으로 접속되었습니다.')
                    }}
                    className="p-2 rounded-xl bg-white border border-[#D5C59B] font-bold text-[#8A6510] hover:bg-[#FAF3DF] transition"
                  >
                    👑 김철수 총괄대표
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentUserCode('55570267')
                      localStorage.setItem('sowonpray_current_user_v3', '55570267')
                      showToast('양영문 창건주 회장님(사찰최고대표)으로 접속되었습니다.')
                    }}
                    className="p-2 rounded-xl bg-white border border-[#D5C59B] font-bold text-[#231F1C] hover:bg-[#FAF3DF] transition"
                  >
                    🏛️ 양영문 창건주 본부
                  </button>
                </div>
              </div>
            </div>
          </main>
        ) : (
          /* ==================== 🏛️ ERP 메인 와이드 작업 화면 ==================== */
          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
            {/* 상단 4종 KPI 대시보드 */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#1F1B17] border border-[#C59B27]/40 shadow-sm">
                <div className="text-xs text-[#C5BBAF] font-semibold flex items-center justify-between">
                  <span>총 등록 신도</span>
                  <Users className="w-4 h-4 text-[#F5D061]" />
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {Number(adminKPIs?.totalMembers || 0).toLocaleString()}
                  <span className="text-sm font-normal text-[#C5BBAF] ml-1">명</span>
                </div>
                <div className="text-[11px] text-[#A69B8D] mt-1 truncate">
                  일반신도 {adminKPIs?.totalBelievers || 0} · 위원 {adminKPIs?.totalAgents || 0} · 본부 {adminKPIs?.totalAdmins || 0}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#1F1B17] border border-[#C59B27]/40 shadow-sm">
                <div className="text-xs text-[#C5BBAF] font-semibold flex items-center justify-between">
                  <span>사시예불 축원 대상</span>
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-[#F5D061] mt-1">
                  {adminKPIs?.totalPrayersCount || 0}
                  <span className="text-sm font-normal text-[#C5BBAF] ml-1">위</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-bold mt-1 truncate">
                  금일 축원완료: {sasiPrayedCheckedIds?.size || 0}위 회향
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#1F1B17] border border-[#C59B27]/40 shadow-sm">
                <div className="text-xs text-[#C5BBAF] font-semibold flex items-center justify-between">
                  <span>누적 불사 접수금</span>
                  <Award className="w-4 h-4 text-[#F5D061]" />
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {Math.round(Number(adminKPIs?.totalSettlementAmount || 0) / 10000).toLocaleString()}
                  <span className="text-sm font-normal text-[#C5BBAF] ml-1">만원</span>
                </div>
                <div className="text-[11px] text-[#A69B8D] mt-1 truncate">
                  총 {settlements?.length || 0}건 봉안 접수완료
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2D241C] to-[#221C16] border border-[#F5D061]/50 shadow-sm">
                <div className="text-xs text-[#F5D061] font-bold flex items-center justify-between">
                  <span>소원사 사찰 귀속금</span>
                  <span className="text-sm font-bold text-[#F5D061]">卍</span>
                </div>
                <div className="text-2xl font-black text-[#F5D061] mt-1">
                  {Math.round(Number(adminKPIs?.templeFund || 0) / 10000).toLocaleString()}
                  <span className="text-sm font-normal text-[#C5BBAF] ml-1">만원</span>
                </div>
                <div className="text-[11px] text-[#F5D061]/80 font-semibold mt-1 truncate">
                  실입금액 50% 사찰 계좌 직속
                </div>
              </div>
            </section>

            {/* 원클릭 대웅전 축원 & 1년 인등 명패 인쇄 퀵 바 */}
            <section className="bg-gradient-to-r from-[#241E17] via-[#2F2417] to-[#1C160F] text-white rounded-2xl p-4 sm:p-5 border-2 border-[#D4AF37] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#1B1815] text-[11px] font-extrabold whitespace-nowrap">
                    대웅전 불단 축원 &amp; 인등단 연동
                  </span>
                  <span className="text-xs text-[#F5D061] font-bold">
                    매일 오전 10:00 사시예불 실시간 연동
                  </span>
                </div>
                <h3 className="font-serif-kr text-base sm:text-lg font-bold text-white">
                  오늘의 사시예불 축원 명부 ({activeSasiPrayers.length}위) &amp; 대웅전 1년 인등 명패
                </h3>
                <p className="text-xs text-[#D6CEC2] mt-0.5">
                  1일 소원등, 100일 특별기도, 1년 가족인등을 대웅전 규격 A4로 즉시 인쇄합니다.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSasiPrayerTypeTab('all')
                    setShowSasiPrintModal(true)
                  }}
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs shadow hover:brightness-105 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Printer className="w-4 h-4" />
                  <span>📿 사시예불 명부 A4 인쇄</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSasiPrayerTypeTab('indeung_1yr')
                    setShowSasiPrintModal(true)
                  }}
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#FAF8F5] text-[#231F1C] border border-[#D5C59B] font-extrabold text-xs shadow hover:bg-white transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>🏮 1년 인등 명패 A4 인쇄</span>
                </button>
              </div>
            </section>

            {/* ERP 서브 메뉴 탭 바 (와이드 버튼 4종) */}
            <div className="flex items-center gap-2 p-1.5 bg-[#1F1B17] rounded-2xl border border-[#C59B27]/40 text-xs sm:text-sm overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setErpTab('search')}
                className={`flex-1 py-3 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  erpTab === 'search'
                    ? 'bg-[#F5D061] text-[#1B1815] shadow'
                    : 'text-[#D6CEC2] hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>📋 1. 신도교적부 리스트 &amp; 검색·수정</span>
              </button>
              <button
                type="button"
                onClick={() => setErpTab('register')}
                className={`flex-1 py-3 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  erpTab === 'register'
                    ? 'bg-[#F5D061] text-[#1B1815] shadow'
                    : 'text-[#D6CEC2] hover:text-white'
                }`}
              >
                <Heart className="w-4 h-4 text-amber-700" />
                <span>🏮 2. 신도 &amp; 가족사주 신규 등록</span>
              </button>
              <button
                type="button"
                onClick={() => setErpTab('excel')}
                className={`flex-1 py-3 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  erpTab === 'excel'
                    ? 'bg-[#F5D061] text-[#1B1815] shadow'
                    : 'text-[#D6CEC2] hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>📂 3. 기존 전산 엑셀 일괄 이관</span>
              </button>
              <button
                type="button"
                onClick={() => setErpTab('settlement')}
                className={`flex-1 py-3 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  erpTab === 'settlement'
                    ? 'bg-[#F5D061] text-[#1B1815] shadow'
                    : 'text-[#D6CEC2] hover:text-white'
                }`}
              >
                <Calculator className="w-4 h-4 text-[#C59B27]" />
                <span>💰 4. 정산관제</span>
              </button>
            </div>

            {/* ==================== 1. 신도 & 가족 사주 신규 등록 탭 ==================== */}
            {erpTab === 'register' && (
              <section className="bg-white text-[#231F1C] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E6DEC8] space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-[#E6DEC8]">
                  <div>
                    <h3 className="font-serif-kr font-bold text-lg text-[#1B1815]">
                      2. 종무소 현장/전화 접수 신도 및 가족 사주 통합 등록
                    </h3>
                    <p className="text-xs text-[#8C8071] mt-0.5">
                      생년월일만 넣으면 띠와 육십간지가 100% 자동 산출되며, 세주(가장)부터 축원 명부에 자동 편성됩니다.
                    </p>
                  </div>
                  <span className="text-xs text-[#8A6510] font-bold bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#D5C59B]">
                    추천인 기본 배정: 김철수 총괄대표(33065540) 직속
                  </span>
                </div>

                <form onSubmit={handleRegisterFamilyMember} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 왼쪽: 대표 신도 정보 */}
                    <div className="lg:col-span-5 space-y-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD4C4]">
                      <div className="text-xs font-bold text-[#8A6510] flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>대표 신도 기본 인적사항</span>
                      </div>

                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[11px] font-bold text-[#554E45] block mb-1">
                            대표 신도 성함 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={regBelieverName}
                            onChange={(e) => setRegBelieverName(e.target.value)}
                            placeholder="성함 (예: 이정숙)"
                            required
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD4C4] text-xs font-bold focus:outline-none focus:border-[#C59B27]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#554E45] block mb-1">
                            법명 (선택사항)
                          </label>
                          <input
                            type="text"
                            value={regBelieverDharma}
                            onChange={(e) => setRegBelieverDharma(e.target.value)}
                            placeholder="법명 (예: 무량화)"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD4C4] text-xs focus:outline-none focus:border-[#C59B27]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#554E45] block mb-1">
                            휴대폰 번호 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={regBelieverPhone}
                            onChange={(e) => setRegBelieverPhone(e.target.value)}
                            placeholder="전화번호 (예: 010-8234-1088)"
                            required
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD4C4] text-xs font-mono focus:outline-none focus:border-[#C59B27]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#554E45] block mb-1">
                            거주지 주소
                          </label>
                          <input
                            type="text"
                            value={regBelieverAddress}
                            onChange={(e) => setRegBelieverAddress(e.target.value)}
                            placeholder="주소 (예: 제주특별자치도 제주시 애월읍)"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD4C4] text-xs focus:outline-none focus:border-[#C59B27]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#554E45] block mb-1">
                            신도 귀속처 (본사 사찰본부 / 포교위원장)
                          </label>
                          <select
                            value={regBelieverParent}
                            onChange={(e) => setRegBelieverParent(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD4C4] text-xs font-semibold text-[#8A6510]"
                          >
                            <option value="55570267">🏛️ 1. 본사 귀속: 양영문 창건주 회장 (55570267 · 사찰본부 직속)</option>
                            <option value="33065540">👑 2. 귀속: 김철수 총괄대표 (33065540 · 전국포교본부 / 자연유입)</option>
                            {agents
                              .filter((a) => a.code !== '55570267' && a.code !== '33065540')
                              .map((a) => (
                                <option key={a.code} value={a.code}>
                                  귀속: {a.name} ({a.role === 'agent' ? '위원장' : '위원'})
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E6DEC8] space-y-2">
                        <div className="text-xs font-bold text-[#8A6510] flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-600" />
                          <span>대웅전 기도 동시 접수 (선택)</span>
                        </div>
                        <select
                          value={regPrayerType}
                          onChange={(e) => setRegPrayerType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD4C4] text-xs font-bold text-[#8A6510]"
                        >
                          <option value="none">기도 동시 접수 없음 (신적부만 등록)</option>
                          <option value="indeung_1yr">🏮 대웅전 1년 인등 (가족등 · 365일 상시축원)</option>
                          <option value="prayer_100d">📿 100일 특별기도 (입재 · D-100일 정진)</option>
                          <option value="lantern_1d">🪔 1일 소원등 (사시예불 당일 1회 축원)</option>
                          <option value="jesujae">⚱️ 생전예수재 황금위패 봉안</option>
                        </select>
                        {regPrayerType !== 'none' && (
                          <input
                            type="text"
                            value={regWishText}
                            onChange={(e) => setRegWishText(e.target.value)}
                            placeholder="발원문 (예: 온 가족 무병장수 및 사업번창 발원)"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD4C4] text-xs focus:outline-none focus:border-[#C59B27]"
                          />
                        )}
                      </div>
                    </div>

                    {/* 오른쪽: 가족 사주 명단 */}
                    <div className="lg:col-span-7 space-y-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD4C4]">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-[#8A6510] flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-[#8A6510]" />
                          <span>가족 사주 명단 (세주 · 배우자 · 자녀)</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddFamilyRow}
                          className="px-3 py-1.5 rounded-xl bg-[#231F1C] text-[#F5D061] text-xs font-bold hover:bg-[#302A25] transition flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ 가족 추가</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {regFamilyList.map((f, idx) => {
                          const { ganji, animal } = computeZodiacAndGanji(f.birth_year || f.birth_date)
                          return (
                            <div
                              key={f.id || idx}
                              className="p-3 rounded-xl bg-white border border-[#DDD3C1] flex items-center gap-2 flex-wrap text-xs shadow-sm"
                            >
                              <select
                                value={f.relation}
                                onChange={(e) => handleUpdateFamilyRow(f.id, 'relation', e.target.value)}
                                className="px-2 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD4C4] text-[11px] font-bold text-[#8A6510] shrink-0"
                              >
                                <option value="세주(가장)">세주(가장)</option>
                                <option value="배우자">배우자</option>
                                <option value="장남">장남</option>
                                <option value="차남">차남</option>
                                <option value="장녀">장녀</option>
                                <option value="차녀">차녀</option>
                                <option value="부">부(아버지)</option>
                                <option value="모">모(어머니)</option>
                                <option value="자녀">자녀</option>
                                <option value="가족">기타가족</option>
                              </select>

                              <input
                                type="text"
                                value={f.name}
                                onChange={(e) => handleUpdateFamilyRow(f.id, 'name', e.target.value)}
                                placeholder="성함"
                                className="w-24 px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD4C4] text-xs font-bold"
                              />

                              <input
                                type="text"
                                value={f.dharma_name}
                                onChange={(e) => handleUpdateFamilyRow(f.id, 'dharma_name', e.target.value)}
                                placeholder="법명"
                                className="w-20 px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD4C4] text-xs"
                              />

                              <input
                                type="text"
                                value={f.birth_year}
                                onChange={(e) => handleUpdateFamilyRow(f.id, 'birth_year', e.target.value)}
                                placeholder="출생연도(1959)"
                                className="w-28 px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD4C4] text-xs font-mono font-bold"
                              />

                              <select
                                value={f.lunar_solar}
                                onChange={(e) => handleUpdateFamilyRow(f.id, 'lunar_solar', e.target.value)}
                                className="px-2 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD4C4] text-[11px]"
                              >
                                <option value="음력">음력</option>
                                <option value="양력">양력</option>
                              </select>

                              <div className="flex-1 min-w-[140px]">
                                {ganji ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-[#FFF5DC] text-[#7A5B0B] border border-[#E8D4A2] font-black text-xs inline-flex items-center gap-1">
                                    <span>{ganji}</span>
                                    <span className="font-normal text-[#8A6510]">({animal})</span>
                                  </span>
                                ) : (
                                  <span className="text-[10.5px] text-[#A69B8D]">
                                    생년 입력 시 간지 자동계산
                                  </span>
                                )}
                              </div>

                              {regFamilyList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFamilyRow(f.id)}
                                  className="p-1 rounded-lg text-[#999999] hover:text-red-600 hover:bg-red-50 transition shrink-0"
                                  title="가족 삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      <p className="text-[11px] text-[#7A6E5E] leading-relaxed pt-1">
                        ※ 스님 예불 축원 시 세주(가장)부터 자동 낭독되며, 1년 인등 명패에 가족 전체 사주가 일괄 정렬됩니다.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C59B27] via-[#8A6510] to-[#231F1C] text-[#FAF8F5] font-black text-sm shadow-xl hover:brightness-105 active:scale-99 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>卍 소원사 종무전산에 신도 및 가족 신적부 등록하기</span>
                  </button>
                </form>
              </section>
            )}

            {/* ==================== 1. 신도교적부 리스트 & 검색·수정 탭 ==================== */}
            {erpTab === 'search' && (
              <section className="bg-white text-[#231F1C] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E6DEC8] space-y-5">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 pb-3 border-b border-[#E6DEC8]">
                  <div>
                    <h3 className="font-serif-kr font-bold text-lg text-[#1B1815] flex items-center gap-2 flex-wrap">
                      <span>1. 신도교적부 리스트 &amp; 검색·수정</span>
                      {adminMemberSearchQuery.trim() ? (
                        <span className="text-xs font-bold text-[#8A6510] bg-[#FAF3DF] px-2.5 py-0.5 rounded-lg border border-[#E8D4A2]">
                          검색 일치: {filteredAdminMembers?.length || 0}명 / 전체 {members?.length || 0}명
                        </span>
                      ) : (
                        <span className="text-xs font-normal text-[#8C8071]">
                          (전체 {members?.length || 0}명)
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#8C8071] mt-0.5">
                      본인 이름뿐 아니라 남편(세주) 이름, 자녀 이름, 전화번호 뒷4자리 아무거나 검색해도 1초 만에 가족 전체가 호출됩니다.
                    </p>
                  </div>

                  {/* 🌟 대표님 요청: 페이지 상단 오른쪽 종무원 공통 액션 툴바 (4대 핵심 버튼) */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {/* 현재 선택 신도 안내 배지 */}
                    {currentActiveBeliever && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D5C59B] text-xs shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-[#C59B27] animate-pulse shrink-0" />
                        <span className="text-[#8C8071]">선택 신도:</span>
                        <strong className="text-[#1B1815] font-bold">
                          {currentActiveBeliever.name} {currentActiveBeliever.dharma_name ? `(${currentActiveBeliever.dharma_name})` : ''}
                        </strong>
                      </div>
                    )}

                    {/* 1. 기도 · 위패 · 불사 정식 접수 (모바일 신청란 표준 100% 통합 일치) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentActiveBeliever) return
                        setActiveBelieverCode(currentActiveBeliever.code)
                        setSettlementTargetMember(currentActiveBeliever)
                        setShowSettlementModal(true)
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-105 text-[#1B1815] font-black text-xs transition flex items-center gap-1.5 shadow-sm border border-amber-400 active:scale-95 cursor-pointer"
                      title={currentActiveBeliever ? `[${currentActiveBeliever.name} 신도] 기도·위패·불사 동참 정식 접수 (상시기도/인등 · 영구위패 · 삼성각대작불사 100% 통합)` : '기도 · 위패 · 불사 접수'}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-950 fill-amber-900" />
                      <span>기도 · 위패 · 불사 접수</span>
                    </button>

                    {/* 3. 인등 명패 */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentActiveBeliever) return
                        setActiveBelieverCode(currentActiveBeliever.code)
                        setIndeungTargetMember(currentActiveBeliever)
                        setShowIndeungNameplateModal(true)
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF3DF] border-2 border-[#D5C59B] text-[#8A6510] font-bold text-xs transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                      title={currentActiveBeliever ? `[${currentActiveBeliever.name} 신도] 대웅전 1년 가족인등 전통 명패 A4 원터치 인쇄` : '인등 명패 인쇄'}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>인등 명패</span>
                    </button>

                    {/* 4. 교적 수정 */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentActiveBeliever) return
                        setActiveBelieverCode(currentActiveBeliever.code)
                        setSelectedMemberDetail(currentActiveBeliever)
                        setIsEditingMember(false)
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#1B1815] hover:bg-[#2C251F] text-[#F5D061] font-bold text-xs transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                      title={currentActiveBeliever ? `[${currentActiveBeliever.name} 신도] 신도교적부 상세 조회 및 수정` : '교적 상세수정'}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>교적 수정</span>
                    </button>

                    {/* 5. 신규 등록 */}
                    <button
                      type="button"
                      onClick={() => setErpTab('register')}
                      className="px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EAE2D3] text-[#555] font-bold text-xs transition flex items-center gap-1.5 border border-[#DDD4C4] active:scale-95 cursor-pointer"
                      title="신규 신도 교적 새로 등록하기"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#777]" />
                      <span>신규 등록</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-5 h-5 text-[#8C8071] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={adminMemberSearchQuery}
                    onChange={(e) => setAdminMemberSearchQuery(e.target.value)}
                    placeholder="성함, 법명, 남편(세주)/자녀 이름, 전화번호 뒷4자리, 고유코드, 주소 검색 (1초 고속 검색)"
                    className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#FAF8F5] border-2 border-[#D5C59B] text-sm placeholder:text-[#A89D8E] focus:outline-none focus:border-[#C59B27] shadow-inner font-semibold"
                  />
                  {adminMemberSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAdminMemberSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C8071] hover:text-[#1B1815] p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                    {[
                      { id: 'all', label: `전체 (${members?.length || 0})` },
                      {
                        id: 'lantern_active',
                        label: `🔥 점등중 (${members.filter((m) => getMemberPrayerAndPaymentInfo(m).isLanternActive).length})`,
                      },
                      {
                        id: 'lantern_off',
                        label: `⚪ 소등 (${members.filter((m) => !getMemberPrayerAndPaymentInfo(m).isLanternActive).length})`,
                      },
                      { id: 'believer', label: `일반신도 (${members.filter((m) => m.role === 'believer').length})` },
                      { id: 'committee_member', label: `포교위원 (${members.filter((m) => m.role === 'committee_member').length})` },
                      { id: 'agent', label: `위원장 (${members.filter((m) => m.role === 'agent').length})` },
                      { id: 'admin', label: `본부임원 (${members.filter((m) => m.role === 'temple_admin' || m.role === 'master').length})` },
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setAdminMemberRoleFilter(chip.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition ${
                          adminMemberRoleFilter === chip.id
                            ? 'bg-[#1B1815] text-[#F5D061] shadow-sm'
                            : 'bg-[#FAF8F5] text-[#6B6155] border border-[#DDD4C4] hover:bg-white'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  <select
                    value={adminMemberSort}
                    onChange={(e) => setAdminMemberSort(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#DDD4C4] text-xs font-semibold text-[#231F1C] ml-auto shrink-0"
                  >
                    <option value="latest">최신 등록순</option>
                    <option value="name">성함 가나다순</option>
                    <option value="merit">공덕(기도) 많은순</option>
                  </select>
                </div>

                {/* 🪷 10만 신도 교적부 종합 5단 열 헤더 (각 행 중복 제목을 상단 헤더로 일괄 통합!) */}
                <div className="hidden lg:grid grid-cols-12 gap-3.5 px-4 sm:px-5 py-2.5 rounded-xl bg-[#FAF5EB] border border-[#E6DEC8] text-xs font-bold text-[#7A6E5E] tracking-tight shadow-xs select-none">
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span>신도 기본 인적</span>
                  </div>
                  <div className="col-span-2 border-l border-[#E6DEC8] pl-3.5 flex items-center gap-1.5">
                    <span>대웅전 점등 상태</span>
                  </div>
                  <div className="col-span-2 border-l border-[#E6DEC8] pl-3.5 flex items-center gap-1.5">
                    <span>부처님 전 축원 발원</span>
                  </div>
                  <div className="col-span-4 border-l border-[#E6DEC8] pl-3.5 flex items-center gap-1.5">
                    <span>기도·불사 접수 현황 & 일자</span>
                  </div>
                  <div className="col-span-2 border-l border-[#E6DEC8] pl-3.5 flex items-center gap-1.5">
                    <span>보시금 입금 상태 & 관리</span>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {filteredAdminMembers.length === 0 ? (
                    <div className="p-12 text-center text-sm text-[#8C8071] border border-dashed border-[#DDD4C4] rounded-2xl">
                      일치하는 신도 또는 가족이 없습니다.
                    </div>
                  ) : (
                    filteredAdminMembers.map(renderMemberRowCard)
                  )}
                </div>
              </section>
            )}

            {/* ==================== 3. 기존 전산 엑셀 일괄 이관 탭 ==================== */}
            {erpTab === 'excel' && (
              <section className="bg-white text-[#231F1C] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E6DEC8] space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E6DEC8]">
                  <div>
                    <h3 className="font-serif-kr font-bold text-lg text-[#1B1815]">
                      3. 기존 사찰 전산(모아소프트 등) 신도 명부 엑셀 일괄 이관
                    </h3>
                    <p className="text-xs text-[#8C8071] mt-0.5">
                      기존 프로그램에서 내보낸 엑셀 내용을 복사하여 아래에 붙여넣기만 하면, 수백~수천 명의 신도가 소원사 DB로 1초 만에 이관됩니다.
                    </p>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
                    복사 &amp; 붙여넣기 원터치 이관
                  </span>
                </div>

                <div className="space-y-4">
                  <textarea
                    rows={6}
                    value={excelPasteText}
                    onChange={(e) => setExcelPasteText(e.target.value)}
                    placeholder="기존 전산 엑셀에서 복사(Ctrl+C) 후 여기에 붙여넣기(Ctrl+V) 하세요.&#10;예시:&#10;홍길동	010-1234-5678	보현심	제주특별자치도 제주시&#10;김성수	010-9876-5432	법륜	제주특별자치도 서귀포시"
                    className="w-full p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#DDD4C4] text-xs font-mono placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#C59B27]"
                  />

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleParseExcel}
                      className="px-5 py-2.5 rounded-xl bg-[#231F1C] text-[#F5D061] text-xs font-bold hover:bg-[#302A25] transition shadow"
                    >
                      1. 엑셀 데이터 분석 및 미리보기
                    </button>
                    {excelParsedRows.length > 0 && (
                      <button
                        type="button"
                        onClick={handleBatchImportExcel}
                        disabled={isExcelUploading}
                        className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          2. {excelParsedRows.length}명 소원사 DB로 즉시 일괄 등록
                        </span>
                      </button>
                    )}
                  </div>

                  {excelParsedRows.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD4C4] space-y-2 max-h-60 overflow-y-auto">
                      <div className="text-xs font-bold text-[#8A6510]">
                        분석된 신도 미리보기 (총 {excelParsedRows.length}명):
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {excelParsedRows.slice(0, 10).map((r, i) => (
                          <div key={i} className="flex items-center gap-3 text-[#444444] p-1.5 bg-white rounded-lg border border-[#EAE2D3]">
                            <span className="font-bold text-[#111111]">{r.name}</span>
                            <span className="font-mono">{r.phone}</span>
                            {r.dharma_name && <span className="text-[#8A6510]">({r.dharma_name})</span>}
                            <span className="text-[#888888] truncate flex-1">{r.address}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ==================== 4. 정산관제 탭 ==================== */}
            {erpTab === 'settlement' && (
              <section className="bg-white text-[#231F1C] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E6DEC8] space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E6DEC8]">
                  <div>
                    <h3 className="font-serif-kr font-bold text-lg text-[#1B1815]">
                      4. 정산관제
                    </h3>
                    <p className="text-xs text-[#8C8071] mt-0.5">
                      사찰 불사금 50% 원천 적립 및 전국 포교위원회 1·2·3차 조직표 요율제 실시간 정산 집행 및 감사 원장입니다.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    실입금액 100% 완전 분배·정산
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs pt-1">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4]">
                    <div className="text-[10.5px] text-[#8C8071]">1차 직속추천</div>
                    <div className="text-base font-black text-[#1B1815] mt-0.5">30%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4]">
                    <div className="text-[10.5px] text-[#8C8071]">2차 상위추천</div>
                    <div className="text-base font-black text-[#1B1815] mt-0.5">10%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4]">
                    <div className="text-[10.5px] text-[#8C8071]">3차 상위추천</div>
                    <div className="text-base font-black text-[#1B1815] mt-0.5">5%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4]">
                    <div className="text-[10.5px] text-[#8A6510]">전산 인프라</div>
                    <div className="text-base font-black text-[#8A6510] mt-0.5">5%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300">
                    <div className="text-[10.5px] text-amber-900 font-bold">소원사 사찰불사</div>
                    <div className="text-base font-black text-amber-900 mt-0.5">50%</div>
                  </div>
                </div>

                {/* 📜 사찰 불사 및 위패 봉안 전체 접수 원장 목록 */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif-kr font-bold text-sm text-[#1B1815] flex items-center gap-1.5">
                      <span>📜 사찰 불사 및 위패 봉안 전체 정산 원장 ({settlements?.length || 0}건)</span>
                    </h4>
                    <span className="text-xs font-bold text-[#8A6510]">
                      총 불사금: {settlements.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0).toLocaleString()}원
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[#DDD4C4] bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#FAF8F5] text-[#5C4D3C] border-b border-[#DDD4C4] text-[11px] font-bold">
                        <tr>
                          <th className="p-2.5 text-center whitespace-nowrap">접수일 / 입금일</th>
                          <th className="p-2.5 whitespace-nowrap">동참 신도</th>
                          <th className="p-2.5 whitespace-nowrap">기도·불사·위패 종목</th>
                          <th className="p-2.5 text-right whitespace-nowrap">표준 약정액</th>
                          <th className="p-2.5 text-right whitespace-nowrap">실제 입금액</th>
                          <th className="p-2.5 text-center whitespace-nowrap">사찰 본원(50%)</th>
                          <th className="p-2.5 whitespace-nowrap">1차 직속추천 (30%)</th>
                          <th className="p-2.5 whitespace-nowrap">2차 상위관리 (10%)</th>
                          <th className="p-2.5 text-center whitespace-nowrap">수납·정산상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE7D8]">
                        {settlements.map((s, idx) => {
                          const stdAmt = Number(s.standard_amount || s.total_amount || 0)
                          const actualPaid = s.paid_amount !== undefined ? Number(s.paid_amount) : (s.payment_status === 'pending' ? 0 : stdAmt)
                          const templeAmt = Math.round(actualPaid * 0.5)
                          const agent1Amt = Math.round(actualPaid * 0.3)
                          const isConfirmed = s.payment_status === 'confirmed' || (!s.payment_status && actualPaid > 0)
                          const isPartial = s.payment_status === 'partial'
                          const isPending = s.payment_status === 'pending' || actualPaid === 0

                          return (
                            <tr key={s.id || idx} className="hover:bg-[#FAF8F5]">
                              <td className="p-2.5 text-center whitespace-nowrap font-mono text-[11px]">
                                <div className="text-[#666]" title="접수일자">
                                  접수: {(s.applied_date || s.created_at || '').slice(0, 10)}
                                </div>
                                <div className={`text-[10.5px] font-bold ${s.paid_date ? 'text-emerald-700' : 'text-amber-700'}`} title="입금일자">
                                  {s.paid_date ? `입금: ${s.paid_date.slice(0, 10)}` : '미입금 (대기)'}
                                </div>
                              </td>
                              <td className="p-2.5 font-bold text-[#1B1815] whitespace-nowrap">
                                <div>{s.believer_name}</div>
                                {s.believer_phone && (
                                  <div className="font-mono text-[10.5px] text-[#8C8071]">{s.believer_phone}</div>
                                )}
                              </td>
                              <td className="p-2.5 font-bold text-[#8A6510]">
                                <div>{s.item_name || s.title || '사찰 특별불사'}</div>
                                {s.memo && (
                                  <div className="text-[10px] text-[#888] font-normal italic truncate max-w-[200px]" title={s.memo}>
                                    축원: {s.memo}
                                  </div>
                                )}
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-[#555] whitespace-nowrap">
                                {stdAmt.toLocaleString()}원
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold whitespace-nowrap">
                                <span className={isConfirmed ? 'text-emerald-700' : isPartial ? 'text-amber-700' : 'text-stone-400'}>
                                  {actualPaid.toLocaleString()}원
                                </span>
                                {stdAmt - actualPaid > 0 && (
                                  <div className="text-[10px] text-red-600 font-bold">
                                    미납: {(stdAmt - actualPaid).toLocaleString()}원
                                  </div>
                                )}
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold text-amber-900 bg-amber-50/50 whitespace-nowrap">
                                {templeAmt.toLocaleString()}원
                              </td>
                              <td className="p-2.5 text-[#554E45] whitespace-nowrap font-bold">
                                <div>{s.agent_1st_name || '-'}</div>
                                {actualPaid > 0 && (
                                  <div className="font-mono text-[10px] text-emerald-700 font-semibold">
                                    +{agent1Amt.toLocaleString()}원
                                  </div>
                                )}
                              </td>
                              <td className="p-2.5 text-[#777777] whitespace-nowrap text-[11px]">
                                {s.agent_2nd_name || '-'}
                              </td>
                              <td className="p-2.5 text-center whitespace-nowrap">
                                <div className="flex flex-col items-center gap-1">
                                  {s.payment_status === 'refunded' ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300">
                                      환불·취소 (정산회수)
                                    </span>
                                  ) : isConfirmed ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      완납·정산완료
                                    </span>
                                  ) : isPartial ? (
                                    <>
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                        분납(1차정산)
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleConfirmSettlementPayment(s.id)}
                                        className="px-2 py-0.5 rounded-lg text-[9.5px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition cursor-pointer"
                                        title="신도가 남은 잔액을 완납했을 때 클릭"
                                      >
                                        잔액완납✓
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmSettlementPayment(s.id)}
                                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 hover:bg-emerald-600 hover:text-white text-stone-700 border border-stone-300 transition cursor-pointer shadow-2xs"
                                      title="신도가 입금했을 때 클릭하여 완납 처리"
                                    >
                                      입금대기(완납✓)
                                    </button>
                                  )}

                                  {/* 착오 수정 및 환불/취소 관리 버튼 */}
                                  <button
                                    type="button"
                                    onClick={() => setEditingSettlement(s)}
                                    className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#8A6510] border border-[#D5C59B] transition cursor-pointer"
                                    title="착오 금액 수정, 환불 처리, 장부 삭제"
                                  >
                                    ⚙️ 수정/환불
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody></table>
                  </div>
                </div>
              </section>
            )}
          </main>
        )}

        {/* ==================== 대웅전 사시예불 축원 명부 A4 인쇄 모달 ==================== */}
        <SasiPrayerPrintModal
          isOpen={showSasiPrintModal}
          onClose={() => setShowSasiPrintModal(false)}
          activeSasiPrayers={activeSasiPrayers}
          filteredSasiPrayers={filteredSasiPrayers}
          sasiPrayedCheckedIds={sasiPrayedCheckedIds}
          toggleSasiPrayedCheck={toggleSasiPrayedCheck}
          sasiPrayerTypeTab={sasiPrayerTypeTab}
          setSasiPrayerTypeTab={setSasiPrayerTypeTab}
          members={members}
        />

                {/* 신도 상세 및 가족 사주 수정 모달 */}
        <MemberDetailModal
          isOpen={!!selectedMemberDetail}
          member={selectedMemberDetail}
          onClose={() => setSelectedMemberDetail(null)}
          isEditingMember={isEditingMember}
          setIsEditingMember={setIsEditingMember}
          memberEditForm={memberEditForm}
          setMemberEditForm={setMemberEditForm}
          onSaveMemberEdit={handleSaveMemberEdit}
          prayers={prayers}
          settlements={settlements}
          members={members}
          agents={agents}
          getMemberPrayerAndPaymentInfo={getMemberPrayerAndPaymentInfo}
          onOpenIndividualRecordPrint={(m) => {
            setIndividualRecordTargetMember(m)
            setShowIndividualRecordPrintModal(true)
          }}
          onOpenIndeungPrint={(m) => {
            setIndeungTargetMember(m)
            setShowIndeungNameplateModal(true)
          }}
          onOpenSettlement={(m) => {
            setSettlementTargetMember(m)
            setShowSettlementModal(true)
          }}
        />
        <SettlementModal
          isOpen={showSettlementModal && !!settlementTargetMember}
          member={settlementTargetMember}
          onClose={() => {
            setShowSettlementModal(false)
            setSettlementTargetMember(null)
          }}
          members={members}
          settlementItemType={settlementItemType}
          setSettlementItemType={setSettlementItemType}
          settlementStandardAmount={settlementStandardAmount}
          setSettlementStandardAmount={setSettlementStandardAmount}
          settlementPaidAmount={settlementPaidAmount}
          setSettlementPaidAmount={setSettlementPaidAmount}
          settlementPaymentStatus={settlementPaymentStatus}
          setSettlementPaymentStatus={setSettlementPaymentStatus}
          settlementMemo={settlementMemo}
          setSettlementMemo={setSettlementMemo}
          settlementAppliedDate={settlementAppliedDate}
          setSettlementAppliedDate={setSettlementAppliedDate}
          settlementPaidDate={settlementPaidDate}
          setSettlementPaidDate={setSettlementPaidDate}
          settlementPaymentMethod={settlementPaymentMethod}
          setSettlementPaymentMethod={setSettlementPaymentMethod}
          onSubmit={handleRegisterSettlementForMember}
          onOpenCategorySheet={() => setShowBulsaCategorySheet(true)}
        />
        <SettlementEditModal
          isOpen={!!editingSettlement}
          settlement={editingSettlement}
          setEditingSettlement={setEditingSettlement}
          onClose={() => setEditingSettlement(null)}
          onSave={handleSaveEditedSettlement}
          onRefund={handleRefundSettlement}
          onDelete={handleDeleteSettlement}
        />
        <SettlementConfirmModal
          isOpen={!!pendingSettlementConfirm}
          data={pendingSettlementConfirm}
          onClose={() => setPendingSettlementConfirm(null)}
          onConfirm={(data) => executeFinalSettlementRegistration(data)}
          settlementItemType={settlementItemType}
          settlementPaymentStatus={settlementPaymentStatus}
        />
        {showBulsaCategorySheet && renderBulsaCategorySheet()}
        <BusinessCardModal
          isOpen={showBusinessCardModal}
          isModal={true}
          member={businessCardTarget || currentUser || members.find((m) => m.code === '33065540')}
          onClose={() => setShowBusinessCardModal(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          showToast={showToast}
        />
        <IndividualRecordPrintModal
          isOpen={showIndividualRecordPrintModal}
          onClose={() => setShowIndividualRecordPrintModal(false)}
          member={individualRecordTargetMember}
          prayers={prayers}
          settlements={settlements}
        />
        <IndeungNameplatePrintModal
          isOpen={showIndeungNameplateModal}
          onClose={() => setShowIndeungNameplateModal(false)}
          member={indeungTargetMember}
        />
        {lanternTargetMember && renderLanternModal()}
      </div>
    )
}
