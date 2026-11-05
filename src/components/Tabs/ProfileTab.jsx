import React, { useRef } from 'react'
import {
  LogOut,
  EyeOff,
  Eye,
  Flame,
  ChevronRight,
  Award,
  Copy,
  QrCode,
  Phone,
  Save,
} from 'lucide-react'
import { extractPhone8Code, formatPhone11 } from '../../lib/supabase'
import { MERIT_RULES, getDailyMeritInfo } from '../../lib/meritSystem'

export default function ProfileTab({
  isMaster,
  currentUser,
  showTestAccountSwitch,
  setShowTestAccountSwitch,
  handleLogout,
  setCurrentUserCode,
  showToast,
  authMode,
  setAuthMode,
  loginIdInput,
  setLoginIdInput,
  loginPwInput,
  setLoginPwInput,
  showLoginPw,
  setShowLoginPw,
  rememberLogin,
  setRememberLogin,
  handleLogin,
  getExpectedPwForId,
  signupName,
  setSignupName,
  signupPhone,
  setSignupPhone,
  signupPw,
  setSignupPw,
  signupDharmaName,
  setSignupDharmaName,
  signupBirthDate,
  setSignupBirthDate,
  signupLunarSolar,
  setSignupLunarSolar,
  signupAddress,
  setSignupAddress,
  signupFamilyMemo,
  setSignupFamilyMemo,
  handleSignup,
  setActiveTab,
  onOpenSanctuary,
  isAgentOrAbove,
  userMeritReward,
  isRewardDetailOpen,
  setIsRewardDetailOpen,
  setMeritCertType,
  setShowMeritCertModal,
  prayers,
  getSasiDisplayInfo,
  isProfileEditOpen,
  setIsProfileEditOpen,
  profileForm,
  setProfileForm,
  handleSaveProfile,
  members,
  infoAffiliatedMode,
  setInfoAffiliatedMode,
  recentMembersFilter,
  setRecentMembersFilter,
  showAllRecentMembers,
  setShowAllRecentMembers,
  OrganizationTreeView,
  formatRelativeOrDate,
  getMemberPrayerAndPaymentInfo,
  handleCopyRefLink,
  handleShareKakao,
  handleToggleQr,
  showQrCode,
  qrDataUrl,
  handleDownloadQr,
  setShow108MoktakModal,
  userLanternStats,
  settlements,
  isLanternLit,
  lanternData,
  setShowQrCode,
  currentUserBelieversCount,
  currentUserWipaeCount,
  recentAffiliatedMembers,
}) {
  const lastSyncedCodeRef = useRef('')

  return (
<main className="flex-1 flex flex-col gap-4 px-2 py-3.5">
            {/* [A] 로그아웃 상태일 때: 로그인 / 신규 회원가입 폼 */}
            {!currentUser ? (
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#FAF8F5] border border-[#E4DDD0]">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition ${
                      authMode === 'login'
                        ? 'bg-[#231F1C] text-[#F5D061] shadow'
                        : 'text-[#6E655C]'
                    }`}
                  >
                    기존 회원 로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition ${
                      authMode === 'signup'
                        ? 'bg-[#231F1C] text-[#F5D061] shadow'
                        : 'text-[#6E655C]'
                    }`}
                  >
                    신규 회원가입 (10초)
                  </button>
                </div>

                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} method="post" action="#" autoComplete="on" className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="login-username" className="text-xs font-bold text-[#3D3630]">
                          전화번호 (아이디)
                        </label>
                        {loginIdInput && (
                          <button
                            type="button"
                            onClick={() => {
                              setLoginIdInput('')
                              setLoginPwInput('')
                            }}
                            className="text-[11px] text-[#8C8071] hover:text-[#231F1C] underline cursor-pointer"
                          >
                            지우기
                          </button>
                        )}
                      </div>
                      <input
                        type="tel"
                        name="username"
                        id="login-username"
                        autoComplete="username"
                        value={loginIdInput}
                        onChange={(e) => {
                          const val = e.target.value
                          setLoginIdInput(val)
                          let code8 = extractPhone8Code(val)
                          if (code8 === '49121083') code8 = '55570267'
                          if (code8 && code8.length >= 8) {
                            lastSyncedCodeRef.current = code8
                            const expectedPw = getExpectedPwForId(code8)
                            if (expectedPw) {
                              setLoginPwInput(expectedPw)
                            }
                          }
                        }}
                        placeholder="010-0000-0000 또는 뒤 8자리"
                        className="w-full px-3.5 py-3 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-sm focus:bg-white focus:border-[#C59B27] transition"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#3D3630]">
                          비밀번호
                        </label>
                        <span className="text-[11px] text-[#8C8071]">
                          (초기 기본값: 휴대전화 뒷 4자리 또는 0000)
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showLoginPw ? 'text' : 'password'}
                          name="password"
                          id="login-password"
                          autoComplete="current-password"
                          value={loginPwInput}
                          onChange={(e) => setLoginPwInput(e.target.value)}
                          placeholder="비밀번호 4자리"
                          className="w-full px-3.5 py-3 pr-10 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPw(!showLoginPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                          title={showLoginPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                        >
                          {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* 로그인 정보 기억하기 / 비밀번호 저장 체크박스 */}
                    <div className="flex items-center justify-between pt-0.5 px-0.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberLogin}
                          onChange={(e) => setRememberLogin(e.target.checked)}
                          className="w-4 h-4 rounded text-[#C59B27] focus:ring-[#C59B27] border-stone-300 accent-[#C59B27]"
                        />
                        <span className="text-xs text-[#5C5245] font-semibold">
                          전화번호 및 비밀번호 기억하기
                        </span>
                      </label>
                      {loginPwInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setLoginPwInput('')
                            try {
                              localStorage.removeItem('sowonpray_saved_login_pw')
                            } catch (e) {}
                          }}
                          className="text-[11px] text-[#8C8071] hover:text-[#231F1C] underline"
                        >
                          지우기
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-[#231F1C] text-[#F5D061] font-bold text-sm border border-[#C59B27] shadow-sm hover:bg-[#302A25] transition active:scale-95 cursor-pointer"
                    >
                      내 법당 계정으로 로그인
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-3.5">
                    <div className="p-3 rounded-xl bg-[#FAF3DF] border border-[#E5D399] text-[11px] text-[#6E5617]">
                      <strong>필수 기본정보(성함·전화번호·비밀번호)</strong>만 입력하시면 즉시 가입되며, 법명·생년월일·주소는 지금 또는 나중에 언제든 추가하실 수 있습니다.
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-[#3D3630] mb-1">
                          성함 (필수 *)
                        </label>
                        <input
                          type="text"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="예: 홍길동"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#C59B27] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#3D3630] mb-1">
                          법명 (선택)
                        </label>
                        <input
                          type="text"
                          value={signupDharmaName}
                          onChange={(e) => setSignupDharmaName(e.target.value)}
                          placeholder="예: 무량화"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-[#3D3630] mb-1">
                          휴대폰 번호 (아이디 *)
                        </label>
                        <input
                          type="tel"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          placeholder="010-0000-0000"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#C59B27] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#3D3630] mb-1">
                          비밀번호 (필수 *)
                        </label>
                        <input
                          type="password"
                          value={signupPw}
                          onChange={(e) => setSignupPw(e.target.value)}
                          placeholder="숫자 4자리 (예: 1080)"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#C59B27] text-sm"
                        />
                      </div>
                    </div>

                    {/* 선택 추가 정보 (사찰 축원용) */}
                    <div className="pt-2 border-t border-[#EFE9DD] space-y-3">
                      <span className="block text-[11px] font-bold text-[#9A7418]">
                        [선택] 대웅전 축원 및 위패 봉안용 추가 정보
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-[#575049] mb-1">
                            생년월일
                          </label>
                          <input
                            type="text"
                            value={signupBirthDate}
                            onChange={(e) => setSignupBirthDate(e.target.value)}
                            placeholder="예: 1962-05-14"
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#575049] mb-1">
                            음력 / 양력
                          </label>
                          <select
                            value={signupLunarSolar}
                            onChange={(e) => setSignupLunarSolar(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                          >
                            <option value="음력">음력</option>
                            <option value="양력">양력</option>
                            <option value="음력(윤달)">음력(윤달)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#575049] mb-1">
                          거주지 주소 (대웅전 축원문 낭독용)
                        </label>
                        <input
                          type="text"
                          value={signupAddress}
                          onChange={(e) => setSignupAddress(e.target.value)}
                          placeholder="예: 제주시 애월읍..."
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#575049] mb-1">
                          가족 축원 명단 / 조상 영가 메모
                        </label>
                        <input
                          type="text"
                          value={signupFamilyMemo}
                          onChange={(e) => setSignupFamilyMemo(e.target.value)}
                          placeholder="예: 배우자, 자녀 이름 및 생년월일"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#AA8010] text-[#1B1815] font-bold text-sm shadow-md"
                    >
                      제주 소원사 신도 회원가입 완료
                    </button>
                  </form>
                )}
              </section>
            ) : (
              /* [B] 로그인 상태일 때: 제주 소원사 VIP 모바일 신도증 & 고품격 신행 카드 */
              <>
                {/* 1. 🪷 제주 소원사 VIP 모바일 디지털 신도증 */}
                <section className="rounded-3xl bg-gradient-to-br from-[#262019] via-[#1B1713] to-[#120F0C] text-white p-4 sm:p-6 border-2 border-[#D4AF37]/50 shadow-[0_10px_30px_rgba(212,175,55,0.18)] relative overflow-hidden space-y-3.5">
                  {/* 상단 장식 빛망울 */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#F5D061]/10 rounded-full blur-2xl pointer-events-none" />

                  {/* 1행: 로고 & 법당명 (좌) / 직책 배지 & 로그아웃 (우) - 좁은 화면에서도 줄바꿈 없는 깔끔한 정렬 */}
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D241C] to-[#17130F] flex items-center justify-center border border-[#C59B27]/60 p-1 shrink-0 shadow-sm">
                        <svg className="w-full h-full" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 5C20 5 15 14.5 15 21C15 23.8 17.2 26 20 26C22.8 26 25 23.8 25 21C25 14.5 20 5 20 5Z" fill="#F5D061" />
                          <path d="M14 12C14 12 7.5 18.5 7.5 23C7.5 26.2 10.2 28 13.2 28C16.2 28 17.8 25.5 17.8 24C17.8 18.5 14 12 14 12Z" fill="#F5D061" opacity="0.8" />
                          <path d="M26 12C26 12 32.5 18.5 32.5 23C32.5 26.2 29.8 28 26.8 28C23.8 28 22.2 25.5 22.2 24C22.2 18.5 26 12 26 12Z" fill="#F5D061" opacity="0.8" />
                          <path d="M11.5 32C15.2 34.8 24.8 34.8 28.5 32C26.5 34.8 23.5 35.8 20 35.8C16.5 35.8 13.5 34.8 11.5 32Z" fill="#F5D061" />
                        </svg>
                      </div>
                      <div className="min-w-0 leading-tight">
                        <div className="text-[10px] text-[#C59B27] font-semibold tracking-wider">제주 소원사</div>
                        <div className="font-serif-kr text-xs font-extrabold text-[#F5D061] tracking-tight whitespace-nowrap">
                          디지털 신도증
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10.5px] px-2.5 py-1 rounded-full bg-[#C59B27]/25 text-[#F5D061] border border-[#F5D061]/50 font-bold whitespace-nowrap shadow-sm">
                        {currentUser.role === 'temple_admin'
                          ? '창건주 · 신도회장'
                          : currentUser.role === 'master'
                          ? '총괄위원장'
                          : currentUser.role === 'agent'
                          ? '포교위원장'
                          : '소원사 일반신도'}
                      </span>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#D6CEC2] hover:text-white border border-white/10 text-[10.5px] font-medium flex items-center gap-1 transition"
                        title="로그아웃"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>

                  {/* 2행: 신도 성함 & 법명 (어르신도 한눈에 보이는 큼직하고 기품 있는 서체) */}
                  <div className="pt-0.5 relative z-10">
                    <h2 className="font-serif-kr text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1.5 flex-wrap">
                      <span>{currentUser.name}</span>
                      {currentUser.role === 'temple_admin' ? (
                        <span className="text-base sm:text-lg text-[#F5D061] font-bold">(창건주) 회장님</span>
                      ) : currentUser.dharma_name ? (
                        <span className="text-base sm:text-lg text-[#F5D061] font-bold">({currentUser.dharma_name})</span>
                      ) : null}
                      <span className="text-sm sm:text-base text-[#D4AF37] font-semibold">불자님</span>
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-[#BFB6AA] mt-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] text-[#F5D061]">
                        신도번호 {currentUser.code}
                      </span>
                      <span className="text-[#8C8071]">·</span>
                      <span className="font-mono text-[11px] text-[#D6CEC2]">{currentUser.phone}</span>
                    </div>
                  </div>

                  {/* ✨ 나의 실시간 신행 복덕 보시금 프리미엄 위젯 카드 (위치 A) */}
                  <div className="relative z-10 rounded-2xl p-4 bg-gradient-to-br from-[#2D2316] via-[#382B1B] to-[#20180F] border-2 border-[#F5D061]/80 shadow-[0_6px_24px_rgba(245,208,97,0.25)] space-y-3">
                    {/* 상단 라벨 & 실시간 적립 뱃지 */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base shrink-0">✨</span>
                        <h3 className="font-serif-kr text-sm sm:text-base font-bold text-[#F5D061] tracking-wide">
                          나의 신행 복덕 공덕금
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-extrabold text-emerald-300 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        실시간 적립
                      </span>
                    </div>

                    {/* 메인 누적 공덕액 */}
                    <div className="bg-black/30 rounded-xl p-3 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] text-[#CFC5B6]">누적 신행 공덕 (실시간 합계)</div>
                          <div className="font-serif-kr text-2xl sm:text-3xl font-black text-[#FFE58A] tracking-tight flex items-baseline gap-1.5 mt-0.5">
                            <span>{userMeritReward.totalReward.toLocaleString()}</span>
                            <span className="text-base sm:text-lg font-bold text-[#F5D061]">공덕</span>
                          </div>
                        </div>

                        {/* 🎯 우측 끝에 위치한 [내역 ▼ / 접기 ▲] 버튼 */}
                        <button
                          type="button"
                          onClick={() => setIsRewardDetailOpen((prev) => !prev)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5D061]/15 hover:bg-[#F5D061]/25 border border-[#F5D061]/40 text-xs font-bold text-[#FFE58A] transition cursor-pointer active:scale-95 shadow-sm shrink-0"
                          title="세부 적립 내역 확인하기"
                        >
                          <span>{isRewardDetailOpen ? '접기' : '내역'}</span>
                          <span className={`text-[9px] transition-transform duration-200 ${isRewardDetailOpen ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                      </div>

                      <div className="pt-1.5 border-t border-white/5">
                        <span className="text-[10.5px] text-[#D6CEC2] block">
                          ※ 제주 소원사 종무소에서 현금 또는 불사참여 사용 가능
                        </span>
                      </div>
                    </div>

                    {/* 세부 내역 (한 줄씩 세로 리스트 & 펼침 방식) */}
                    {isRewardDetailOpen && (
                      <div className="space-y-3 pt-1 transition-all duration-300">
                        {/* 1. 도량 전법 법연 공덕 */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-[#E8DFD1] px-1 flex items-center gap-1.5">
                            <span>🤝</span>
                            <span>도량 전법(傳法) 법연 공덕</span>
                          </div>

                          {/* 1) 전법 법연 맺기: 1인 1,000 공덕 */}
                          <button
                            type="button"
                            onClick={() => handleCopyRefLink(currentUser.code)}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer active:scale-[0.99] text-left"
                            title="전법 추천 링크 복사하기"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base shrink-0">🤝</span>
                                <span className="text-xs sm:text-sm font-bold text-[#F5D061]">
                                  전법 법연 맺기
                                </span>
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-[#FFE58A]">
                                {userMeritReward.isAgent
                                  ? `${userMeritReward.directBelieversCount}명`
                                  : `${userMeritReward.believersCount}명`}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[11px]">
                              <span className="text-[#A89C8E]">1인 1,000 공덕</span>
                              <span className="font-mono font-bold text-emerald-300">
                                +{(userMeritReward.isAgent
                                  ? userMeritReward.directBelieversReward
                                  : userMeritReward.believersReward
                                ).toLocaleString()}{' '}
                                공덕
                              </span>
                            </div>
                          </button>

                          {/* 2) 도량 법연 권선: 산하 1인 1,000 공덕 (포교위원장 전용) */}
                          {userMeritReward.isAgent && (
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById('affiliated-members-section')
                                if (el) el.scrollIntoView({ behavior: 'smooth' })
                              }}
                              className="w-full px-3 py-2.5 rounded-xl bg-[#F5D061]/10 hover:bg-[#F5D061]/15 border border-[#F5D061]/35 transition cursor-pointer active:scale-[0.99] text-left"
                              title="산하 신도 명단 확인하기"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-base shrink-0">🌿</span>
                                  <span className="text-xs sm:text-sm font-bold text-[#FFE58A]">
                                    도량 권선
                                  </span>
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-[#FFE58A]">
                                  {userMeritReward.indirectBelieversCount}명
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-[11px]">
                                <span className="text-[#A89C8E]">산하 1인 1,000 공덕</span>
                                <span className="font-mono font-bold text-emerald-300">
                                  +{userMeritReward.indirectBelieversReward.toLocaleString()} 공덕
                                </span>
                              </div>
                            </button>
                          )}
                        </div>

                        {/* 2. ✨ 매일 5대 일일 신행(信行) 정진 공덕 개편 */}
                        {(() => {
                          const uCode = currentUser?.code || 'guest'
                          const bowInfo = getDailyMeritInfo('bow', uCode)
                          const moktakInfo = getDailyMeritInfo('moktak', uCode)
                          const yeomjuInfo = getDailyMeritInfo('yeomju', uCode)
                          const sutraInfo = getDailyMeritInfo('sutra', uCode)
                          const lanternInfo = getDailyMeritInfo('lantern', uCode)
                          const todayTotalDaily = bowInfo.currentPoints + moktakInfo.currentPoints + yeomjuInfo.currentPoints + sutraInfo.currentPoints + lanternInfo.currentPoints

                          return (
                            <div className="space-y-1.5 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-[#F5D061]/10 to-black/30 border border-[#F5D061]/40 shadow-sm">
                              <div className="flex items-center justify-between pb-1.5 border-b border-[#F5D061]/20 px-0.5">
                                <div className="text-xs font-extrabold text-[#FFE58A] flex items-center gap-1">
                                  <span>✨</span>
                                  <span>매일 5대 일일 신행 공덕</span>
                                </div>
                                <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 rounded-full shrink-0">
                                  오늘 +{todayTotalDaily.toLocaleString()} 공덕
                                </span>
                              </div>

                              <div className="space-y-1.5 pt-0.5">
                                {/* 신행 1) 소원등 점등: 1일 1회 300 공덕 (최대 300 공덕) */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('lantern')
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-black/40 hover:bg-[#F5D061]/10 border border-white/10 hover:border-[#F5D061]/40 transition cursor-pointer active:scale-[0.99] text-left"
                                  title="소원등 켜러 가기"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base shrink-0">🪔</span>
                                      <span className="text-xs sm:text-sm font-bold text-[#F5D061]">
                                        소원등 점등
                                      </span>
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-[#FFE58A]">
                                      오늘 {lanternInfo.currentCount}/1회
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1 text-[11px]">
                                    <span className="text-[#A89C8E]">
                                      1일 1회 300 공덕{' '}
                                      <span className="text-emerald-400 font-semibold">
                                        (최대 300 공덕)
                                      </span>
                                    </span>
                                    <span className="font-mono font-bold text-emerald-300">
                                      +{lanternInfo.currentPoints.toLocaleString()} / 300 공덕
                                    </span>
                                  </div>
                                </button>

                                {/* 신행 2) 한줄사경 정진: 1회 100 공덕 (1일 최대 3회 = 300 공덕) */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('sutra')
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-black/40 hover:bg-[#F5D061]/10 border border-white/10 hover:border-[#F5D061]/40 transition cursor-pointer active:scale-[0.99] text-left"
                                  title="사경 정진하러 가기"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base shrink-0">✍️</span>
                                      <span className="text-xs sm:text-sm font-bold text-[#F5D061]">
                                        한줄사경 정진
                                      </span>
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-[#FFE58A]">
                                      오늘 {sutraInfo.currentCount}/3회
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1 text-[11px]">
                                    <span className="text-[#A89C8E]">
                                      1회 100 공덕{' '}
                                      <span className="text-emerald-400 font-semibold">
                                        (최대 300 공덕)
                                      </span>
                                    </span>
                                    <span className="font-mono font-bold text-emerald-300">
                                      +{sutraInfo.currentPoints.toLocaleString()} / 300 공덕
                                    </span>
                                  </div>
                                </button>

                                {/* 신행 3) 108배 절 정진: 1배 10 공덕 (1일 최대 1,080 공덕) */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onOpenSanctuary) onOpenSanctuary()
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-black/40 hover:bg-[#F5D061]/10 border border-white/10 hover:border-[#F5D061]/40 transition cursor-pointer active:scale-[0.99] text-left"
                                  title="대웅전 참선 쉼터에서 절 올리기"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base shrink-0">🙇</span>
                                      <span className="text-xs sm:text-sm font-bold text-[#F5D061]">
                                        108배 절 올리기
                                      </span>
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-[#FFE58A]">
                                      오늘 {bowInfo.currentCount}/108배
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1 text-[11px]">
                                    <span className="text-[#A89C8E]">
                                      1배 10 공덕{' '}
                                      <span className="text-emerald-400 font-semibold">
                                        (최대 1,080 공덕)
                                      </span>
                                    </span>
                                    <span className="font-mono font-bold text-emerald-300">
                                      +{bowInfo.currentPoints.toLocaleString()} / 1,080 공덕
                                    </span>
                                  </div>
                                </button>

                                {/* 신행 4) 목탁 치기 정진: 1타 10 공덕 (1일 최대 1,080 공덕) */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onOpenSanctuary) onOpenSanctuary()
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-black/40 hover:bg-[#F5D061]/10 border border-white/10 hover:border-[#F5D061]/40 transition cursor-pointer active:scale-[0.99] text-left"
                                  title="대웅전 참선 쉼터에서 목탁 치기"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base shrink-0">🪵</span>
                                      <span className="text-xs sm:text-sm font-bold text-[#F5D061]">
                                        목탁 치기 정진
                                      </span>
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-[#FFE58A]">
                                      오늘 {moktakInfo.currentCount}/108타
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1 text-[11px]">
                                    <span className="text-[#A89C8E]">
                                      1타 10 공덕{' '}
                                      <span className="text-emerald-400 font-semibold">
                                        (최대 1,080 공덕)
                                      </span>
                                    </span>
                                    <span className="font-mono font-bold text-emerald-300">
                                      +{moktakInfo.currentPoints.toLocaleString()} / 1,080 공덕
                                    </span>
                                  </div>
                                </button>

                                {/* 신행 5) 108 염주 정진: 1알 10 공덕 (1일 최대 1,080 공덕) */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onOpenSanctuary) onOpenSanctuary()
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-black/40 hover:bg-[#F5D061]/10 border border-white/10 hover:border-[#F5D061]/40 transition cursor-pointer active:scale-[0.99] text-left"
                                  title="대웅전 참선 쉼터에서 108 염주 굴리기"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base shrink-0">📿</span>
                                      <span className="text-xs sm:text-sm font-bold text-[#F5D061]">
                                        108 염주 정진
                                      </span>
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-[#FFE58A]">
                                      오늘 {yeomjuInfo.currentCount}/108알
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1 text-[11px]">
                                    <span className="text-[#A89C8E]">
                                      1알 10 공덕{' '}
                                      <span className="text-emerald-400 font-semibold">
                                        (최대 1,080 공덕)
                                      </span>
                                    </span>
                                    <span className="font-mono font-bold text-emerald-300">
                                      +{yeomjuInfo.currentPoints.toLocaleString()} / 1,080 공덕
                                    </span>
                                  </div>
                                </button>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>

                  {/* 3행: 🪔 나의 소원등 & 기도 정진 프리미엄 통합 카드 */}
                  <div className="relative z-10 pt-1">
                    {(() => {
                      const memberInfo = getMemberPrayerAndPaymentInfo(currentUser)
                      const myPrayersList = (prayers || []).filter(
                        (p) =>
                          p.member_code === currentUser?.code ||
                          (currentUser?.phone && p.believer_phone && p.believer_phone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, ''))
                      )
                      const total1dCount = myPrayersList.filter(
                        (p) =>
                          !p.wish_category?.includes('인등') &&
                          !p.wish_category?.includes('100일') &&
                          !p.wish_category?.includes('위패') &&
                          !p.wish_category?.includes('영전자수증') &&
                          !p.wish_category?.includes('조성비')
                      ).length
                      const totalMerit = Math.max(total1dCount, userLanternStats.totalCount, currentUser?.merit_count || 1)
                      const currentStreak = userLanternStats.streak

                      // 1년 인등, 100일 특별기도, 위패, 기타 불사 봉안 목록 도출
                      const activeIndeung = memberInfo?.lanterns?.find((l) => l.id === 'indeung_1yr' && l.active)
                      const active100d = memberInfo?.lanterns?.find((l) => l.id === 'prayer_100d' && l.active)

                      // 실제 등록된 위패 및 불사 데이터 검색
                      const hasRealWipae = myPrayersList.some(
                        (p) => p.wish_category?.includes('위패') || p.prayer_type?.includes('wipae')
                      ) || (settlements || []).some(
                        (s) => (s.member_code === currentUser?.code || s.believer_name?.includes(currentUser?.name)) && s.item_name?.includes('위패')
                      )

                      const hasRealBulsa = myPrayersList.some(
                        (p) => p.wish_category?.includes('불사') || p.wish_category?.includes('개금') || p.wish_category?.includes('조성')
                      ) || (settlements || []).some(
                        (s) => (s.member_code === currentUser?.code || s.believer_name?.includes(currentUser?.name)) && (s.item_name?.includes('불사') || s.item_name?.includes('개금') || s.item_name?.includes('원불'))
                      )

                      // 대표님 계정('33065540' 또는 '김철수') 테스트 및 실제 봉안 항목 취합
                      const isKcsTest = currentUser?.code === '33065540' || currentUser?.name?.includes('김철수')

                      const dedicatedBulsaItems = []

                      // 1) 1년 인등
                      if (activeIndeung || isKcsTest) {
                        dedicatedBulsaItems.push({
                          id: 'indeung_1yr',
                          title: '대웅전 1년 인등 (가족등)',
                          rightText: isKcsTest ? 'D-365' : `D-${activeIndeung?.daysLeft || 365}`,
                          location: '대웅전 봉안',
                          desc: '365일 24시간 상시 점등 · 사시예불 영구 축원',
                        })
                      } else if (active100d) {
                        dedicatedBulsaItems.push({
                          id: 'prayer_100d',
                          title: '100일 소원성취 특별기도',
                          rightText: `D-${active100d.daysLeft}`,
                          location: '대웅전 봉안',
                          desc: '100일간 매일 사시예불 특별 축원 봉행',
                        })
                      }

                      // 2) 영가 위패 (대표님 테스트 또는 실제 위패 신청자)
                      if (hasRealWipae || isKcsTest) {
                        dedicatedBulsaItems.push({
                          id: 'wipae_ancestor',
                          title: '지장전 조상 영가 위패 봉안 (1기)',
                          rightText: '영구 봉안',
                          location: '지장전 봉안',
                          desc: '매일 사시예불 및 49재·천도재 영구 천도축원',
                        })
                      }

                      // 3) 특별 불사 (소원사 실제 불사: 삼성각 원불 봉안 불사)
                      if (hasRealBulsa || isKcsTest) {
                        dedicatedBulsaItems.push({
                          id: 'bulsa_samsunggak',
                          title: '삼성각 원불(願佛) 봉안 불사',
                          rightText: '영구 봉안',
                          location: '삼성각 봉안',
                          desc: '칠성·독성·산신전 자손번창과 가문 번영 영구축원',
                        })
                      }

                      return (
                        <div className="rounded-2xl p-3.5 bg-gradient-to-r from-[#2A2016] via-[#33271A] to-[#221A12] border-2 border-[#D4AF37]/60 shadow-[0_6px_24px_rgba(212,175,55,0.2)] space-y-3">
                          {/* 1) 카드 상단: 상태 및 바로가기 버튼 */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E25C2B] to-[#F4B41A] text-white flex items-center justify-center shadow-[0_0_12px_rgba(233,130,39,0.5)] shrink-0">
                                <Flame className="w-4 h-4 fill-current text-[#FFF7CE] flame-flicker" />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-xs font-black text-[#F5D061] tracking-wide">
                                  {isLanternLit ? '소원등 점등 중' : '나의 등불 & 기도 정진'}
                                </span>
                                <span className="block text-[11px] text-[#D6CEC2] truncate">
                                  {isLanternLit
                                    ? `📅 ${getSasiDisplayInfo(lanternData?.sasi_date_key).shortLabel} 축원 (11시 회향)`
                                    : '매일 사시예불 축원으로 공덕을 쌓으세요'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('lantern')
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] hover:brightness-105 active:scale-95 text-[#1B1815] font-black text-[11px] shrink-0 shadow flex items-center gap-1 transition whitespace-nowrap"
                            >
                              <span>{isLanternLit ? '내 등불 보기' : '등불 켜기'}</span>
                              <ChevronRight className="w-3.5 h-3.5 -mr-0.5" />
                            </button>
                          </div>

                          {/* 2) 1일 정진 & 총 점등 횟수 통합 단일 버튼 (대표님 지시: 1번 내용을 2번에 통합) */}
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => {
                                setMeritCertType('lantern')
                                setShowMeritCertModal(true)
                              }}
                              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-[#F5D061]/50 text-[#F5D061] text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
                              title="소원등 정진 공덕장 보기"
                            >
                              <Award className="w-3.5 h-3.5 text-[#F5D061] shrink-0" />
                              <span>
                                {isLanternLit ? `🔥 ${currentStreak}일 연속 정진 (총 ${totalMerit}회 점등)` : `총 ${totalMerit}회 점등`}
                              </span>
                              <ChevronRight className="w-3 h-3 text-[#F5D061] -ml-0.5 shrink-0" />
                            </button>
                          </div>

                          {/* 3) 소원등 발원문 본문 (패딩과 line-clamp 분리 + overflow-hidden으로 4번째 줄 완벽 차단) */}
                          {isLanternLit && (
                            <div className="p-2.5 rounded-xl bg-black/35 border border-white/10 overflow-hidden">
                              <p className="text-xs text-[#FAF8F5] leading-relaxed line-clamp-3 overflow-hidden break-keep">
                                <span className="text-[#FFE58A] font-extrabold mr-1">
                                  [{lanternData?.wish_category || '가족건강'}]
                                </span>
                                <span className="text-[#E8DFD1] font-serif-kr">
                                  “{lanternData?.wish_text || '지극정성으로 가족 평안과 소원성취를 발원합니다.'}”
                                </span>
                              </p>
                            </div>
                          )}

                          {/* 4) 장기 기도 (1년 인등 / 100일 기도) 럭셔리 하단 띠배너 */}
                          {/* 4) 장기 기도/위패/불사 봉안 목록 (대표님 지시: 위패나 다른 불사가 있으면 바로 아래 동일하게 표시) */}
                          {dedicatedBulsaItems.length > 0 && (
                            <div className="space-y-2 pt-1 border-t border-white/10">
                              {dedicatedBulsaItems.map((item) => (
                                <div key={item.id} className="p-2.5 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
                                  {/* 1행: 명칭 & 우측 상태 (D-Day / 영구봉안 / 원만회향) */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-extrabold text-[#F5D061] text-xs whitespace-nowrap tracking-tight">
                                      {item.title}
                                    </span>
                                    <span className="text-emerald-400 font-extrabold text-xs font-mono shrink-0">
                                      {item.rightText}
                                    </span>
                                  </div>

                                  {/* 2행: 봉안 위치 & 축원 안내 */}
                                  <div className="flex items-center gap-1.5 text-[10.5px] text-[#C5BBAE] pt-0.5">
                                    <span className="text-[#FFE58A] font-bold shrink-0">{item.location} ·</span>
                                    <span className="truncate">{item.desc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}</div>
                      )
                    })()}
                  </div>

                  
                </section>

                {/* 2. 🎁 도반에게 복(福) 선물하기 (카카오톡 최적화 원클릭 나눔) */}
                <section className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF7EE] to-[#F5EEDD] rounded-3xl p-5 border border-[#E8DEC7] shadow-sm space-y-3.5">
                  <div>
                    <span className="text-[11px] font-bold text-[#9A7418] flex items-center gap-1">
                      <span>🪷</span>
                      <span>부처님과의 소중한 불연(佛緣) 나눔</span>
                    </span>
                    <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] mt-0.5">
                      가족 · 도반에게 복(福)을 전하는 소원등 선물
                    </h3>
                    <p className="text-xs text-[#575049] leading-relaxed mt-1 break-keep">
                      소중한 분들께 1일 무료 소원등을 선물해 보세요. 상대방이 링크를 누르고 소원등을 밝히면 부처님 전에 함께 복을 짓는 <strong className="text-[#8A6510]">‘나의 인연 신도’</strong>로 자동 연결됩니다.
                    </p>
                  </div>

                  {/* 1) 큼직한 카카오톡 원클릭 선물 버튼 (어르신도 1초 만에 터치, 정식 카카오 심볼) */}
                  <button
                    type="button"
                    onClick={() => handleShareKakao(currentUser.code, currentUser.name)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98 border border-[#E6CE00]"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#3A1D1D] shrink-0" aria-hidden="true">
                      <path d="M12 3C6.477 3 2 6.477 2 10.767c0 2.766 1.874 5.19 4.678 6.558l-1.18 4.337a.5.5 0 0 0 .768.528l5.105-3.374c.206.015.414.024.629.024 5.523 0 10-3.477 10-7.767C22 6.477 17.523 3 12 3z"/>
                    </svg>
                    <span className="whitespace-nowrap">카카오톡으로 소원등 선물하기</span>
                  </button>

                  {/* 2) 보조 버튼 2종: 링크 복사 & QR코드 보기 */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyRefLink(currentUser.code)}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#231F1C] border border-[#DDD4C4] font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <Copy className="w-4 h-4 text-[#9A7418]" />
                      <span>전용 링크 복사</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleQr(currentUser.code)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm border ${
                        showQrCode === currentUser.code
                          ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27]'
                          : 'bg-white hover:bg-[#FAF8F5] text-[#231F1C] border-[#DDD4C4]'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-[#9A7418]" />
                      <span>인연 QR코드 보기</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-[#8C8071] flex items-center justify-between pt-0.5">
                    <span>※ 접속 시 인연코드 자동 적용</span>
                    <span className="font-bold text-[#8A6510]">내 인연코드: {currentUser.code}</span>
                  </div>

                  {/* QR코드 펼침 창 */}
                  {showQrCode === currentUser.code && (
                    <div className="mt-3 p-4 rounded-2xl bg-white border-2 border-[#C59B27] flex flex-col items-center text-center space-y-2.5 shadow-md">
                      <div>
                        <span className="text-[11px] font-bold text-[#8A6510]">
                          卍 제주 소원사 모바일 법당 전용 QR
                        </span>
                        <h4 className="font-serif-kr text-sm font-bold text-[#231F1C] mt-0.5">
                          {currentUser.name} {currentUser.dharma_name ? `(${currentUser.dharma_name})` : ''} 님의 복덕 인연 QR
                        </h4>
                      </div>

                      {qrDataUrl ? (
                        <div className="p-3 bg-white rounded-2xl border-2 border-[#C59B27] shadow-inner inline-block">
                          <img
                            src={qrDataUrl}
                            alt="인연 연결 QR코드"
                            className="w-44 h-44 sm:w-48 sm:h-48 rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="w-44 h-44 flex items-center justify-center bg-neutral-50 rounded-2xl border">
                          <span className="text-xs text-[#8C7A5B]">QR 생성 중...</span>
                        </div>
                      )}

                      <p className="text-[11px] text-[#6E655C] leading-snug break-keep max-w-xs">
                        가족이나 도반의 스마트폰 카메라로 비추시면, 회원님의 인연 코드가 자동 연결된 모바일 법당으로 즉시 열립니다.
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleDownloadQr(currentUser.name, currentUser.code)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#231F1C] text-[#F5D061] border border-[#C59B27] text-xs font-bold flex items-center gap-1 shadow hover:brightness-110 transition"
                        >
                          <span>QR 이미지 저장</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowQrCode(null)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-100 border border-[#DDD4C4] text-xs text-[#6E655C] hover:bg-neutral-200 transition"
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* 3. 📊 포교 현황 (포교위원/임원) OR 🌱 인연 공덕 & 50명 포교위원 승급 도전 (일반 신도) */}
                {isAgentOrAbove ? (
                  <section className="bg-gradient-to-br from-[#231F1C] to-[#151210] text-white rounded-3xl p-5 border border-[#C59B27]/40 shadow-sm space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm shrink-0">📜</span>
                        <h3 className="font-serif-kr text-sm sm:text-base font-bold text-[#F5D061] whitespace-nowrap">
                          나의 포교 현황
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('agent')
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="text-[11px] text-[#D6CEC2] hover:text-[#F5D061] flex items-center gap-1 font-semibold transition whitespace-nowrap shrink-0 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 hover:border-[#F5D061]/40"
                      >
                        <span>전산창 바로가기</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
                        <div className="text-[10.5px] text-[#BFB6AA]">인연 신도수</div>
                        <div className="text-base sm:text-lg font-extrabold text-[#F5D061] mt-0.5">
                          {currentUserBelieversCount}명
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
                        <div className="text-[10.5px] text-[#BFB6AA]">위패/불사 봉안</div>
                        <div className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                          {currentUserWipaeCount}기
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
                        <div className="text-[10.5px] text-[#BFB6AA]">포교 요율</div>
                        <div className="text-base sm:text-lg font-extrabold text-emerald-400 mt-0.5">
                          {currentUser.role === 'committee_member' ? '30%' : currentUser.role === 'master' ? '50%' : '40%'}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#A69B8D] p-2.5 rounded-xl bg-black/25 flex items-center justify-between flex-wrap gap-1">
                      <span>수당 정산 계좌:</span>
                      <span className="text-white font-medium">
                        {currentUser.bank_name ? `${currentUser.bank_name} ${currentUser.bank_account} (예금주: ${currentUser.account_holder || currentUser.name})` : '미등록 (아래 내정보 수정에서 입력)'}
                      </span>
                    </div>
                  </section>
                ) : (
                  <section className="bg-gradient-to-br from-[#231F1C] via-[#2A231C] to-[#171310] text-white rounded-3xl p-5 border border-[#C59B27]/40 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm shrink-0">🌱</span>
                        <h3 className="font-serif-kr text-sm sm:text-base font-bold text-[#F5D061] whitespace-nowrap">
                          나의 인연 공덕 현황
                        </h3>
                      </div>
                      <span className="text-[10.5px] font-bold text-[#FFE58A] bg-[#C59B27]/25 px-2.5 py-0.5 rounded-full border border-[#F5D061]/40 shrink-0">
                        {currentUserBelieversCount >= 30 ? '위촉 자격 달성' : '포교위원 승급 도전'}
                      </span>
                    </div>

                    {/* 1. 3개 핵심 지표 (법연 신도 / 적립 공덕금 / 승급 D-Day) */}
                    <div className="grid grid-cols-3 gap-2 pt-0.5">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
                        <div className="text-[10px] sm:text-[10.5px] text-[#BFB6AA]">맺은 법연(신도)</div>
                        <div className="text-base sm:text-lg font-extrabold text-[#F5D061] mt-0.5">
                          {currentUserBelieversCount}명
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
                        <div className="text-[10px] sm:text-[10.5px] text-[#BFB6AA]">신행 복덕 공덕금</div>
                        <div className="text-base sm:text-lg font-extrabold text-[#FFE58A] mt-0.5">
                          {userMeritReward.totalReward.toLocaleString()} 공덕
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
                        <div className="text-[10px] sm:text-[10.5px] text-[#BFB6AA]">포교위원 승급</div>
                        <div className="text-base sm:text-lg font-extrabold text-emerald-400 mt-0.5">
                          {currentUserBelieversCount >= 30 ? '자격 획득' : `D-${Math.max(0, 30 - currentUserBelieversCount)}명`}
                        </div>
                      </div>
                    </div>

                    {/* 2. 🎁 1인 추천 보시 혜택 안내 (기도·불사 공덕 차감 또는 현금 정산) */}
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-[#C59B27]/15 via-[#F5D061]/10 to-transparent border border-[#F5D061]/30 flex items-start gap-2.5">
                      <span className="text-lg shrink-0 mt-0.5">🎁</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="text-xs font-bold text-[#F5D061]">
                            법연 1,000 공덕 · 매일 3대 신행 최대 1,000 공덕(등 200 · 사경 300 · 목탁 500)
                          </span>
                          <span className="text-[10px] text-[#E5D7B5] bg-white/10 px-1.5 py-0.5 rounded font-medium">
                            기도·불사 공덕 차감 or 현금 정산
                          </span>
                        </div>
                        <p className="text-[11px] text-[#BFB6AA] mt-1 leading-relaxed break-keep">
                          소원등을 선물하여 법연을 맺을 때마다 <strong className="text-white">1인 1,000 공덕</strong>, 매일 3대 신행(소원등 점등 200 + 한줄사경 3회 300 + 108 목탁 500) 정진 시 <strong className="text-[#F5D061]">하루 최대 1,000 공덕</strong>의 신행 복덕이 실시간 적립됩니다. (적립된 공덕은 제주 소원사 종무소에서 기도·불사 공덕금 차감 또는 현금 계좌 정산으로 자유롭게 사용 가능합니다.)
                        </p>
                      </div>
                    </div>

                    {/* 3. 🏆 30명 달성 시 정식 포교위원 위촉 목표 게이지 */}
                    <div className="p-3.5 rounded-2xl bg-black/35 border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#D6CEC2] font-semibold text-[11px]">
                          정식 포교위원 위촉 목표 (30명)
                        </span>
                        <span className="font-mono font-bold text-[#F5D061] text-[11px]">
                          {currentUserBelieversCount} / 30명 ({Math.min(100, Math.round((currentUserBelieversCount / 30) * 100))}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#C59B27] via-[#F5D061] to-[#FFE58A] transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(currentUserBelieversCount > 0 ? 5 : 0, Math.round((currentUserBelieversCount / 30) * 100)))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#A89880] leading-snug break-keep pt-0.5">
                        법연을 맺은 인연이 <strong className="text-[#F5D061]">30명</strong>에 도달하면 제주 소원사 <strong className="text-white">정식 포교위원</strong>으로 명예 위촉되며 매월 포교 활동 공덕금이 보시 지원됩니다.
                      </p>
                    </div>
                  </section>
                )}

                {/* 3. 🌿 나의 인연 법연 관리 (3번 형식: 포교 인연 계보도 vs 인연 신도 축원 현황) */}
                {(() => {
                  const filteredRecent = recentMembersFilter === 'direct'
                    ? recentAffiliatedMembers.filter((m) => m.parent_code === currentUser.code)
                    : recentAffiliatedMembers
                  const displayRecent = showAllRecentMembers
                    ? filteredRecent
                    : filteredRecent.slice(0, 5)

                  return (
                    <section id="affiliated-members-section" className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6DEC8] space-y-3.5 scroll-mt-6">
                      {/* 카드 상단 타이틀 */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#EFE9DD] pb-3">
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-[#9A7418] block">
                            卍 부처님과 맺은 소중한 인연
                          </span>
                          <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] mt-0.5">
                            나의 인연 공덕 관리 (전체 {recentAffiliatedMembers.length}명 / 직접 {recentAffiliatedMembers.filter((m) => m.parent_code === currentUser.code).length}명)
                          </h3>
                        </div>
                      </div>

                      {/* 3번 형식: 다크-골드 탭 전환 스위치 (최근 가입 현황 vs 계보도) */}
                      <div className="flex items-center justify-between gap-2 p-1 bg-[#231F1C] rounded-2xl border border-[#C59B27]/40 shadow-xs">
                        <button
                          type="button"
                          onClick={() => setInfoAffiliatedMode('list')}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            infoAffiliatedMode === 'list'
                              ? 'bg-[#F5D061] text-[#1B1815] shadow font-extrabold'
                              : 'text-[#D6CEC2] hover:text-white'
                          }`}
                        >
                          <span>📋 최근 가입 현황</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setInfoAffiliatedMode('tree')}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            infoAffiliatedMode === 'tree'
                              ? 'bg-[#F5D061] text-[#1B1815] shadow font-extrabold'
                              : 'text-[#D6CEC2] hover:text-white'
                          }`}
                        >
                          <span>🌿 포교 인연 계보도</span>
                        </button>
                      </div>

                      {/* [모드 1] 포교 추천 계보도 트리 뷰 */}
                      {infoAffiliatedMode === 'tree' && (
                        <div className="pt-1 animate-fadeIn">
                          <OrganizationTreeView
                            members={members}
                            rootCode={currentUser.code}
                            activeAgentCode={currentUser.code}
                            title="🌿 나의 인연 공덕 계보"
                            onSelectMember={(m) => {
                              showToast(`[${m.name}] 님의 인연 정보 (코드: ${m.code})`)
                            }}
                          />
                        </div>
                      )}

                      {/* [모드 2] 인연 신도 축원 현황 리스트 (최근 가입순) */}
                      {infoAffiliatedMode === 'list' && (
                        <div className="space-y-3 pt-1 animate-fadeIn">
                          {/* 필터 바: 전체 vs 직접 */}
                          <div className="flex items-center justify-between gap-2 border-b border-[#EFE9DD] pb-2.5 flex-wrap">
                            <span className="text-xs text-[#7A6B58] font-bold">
                              최근 가입한 인연 순서대로 표시됩니다
                            </span>
                            <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DEC9] shrink-0">
                              <button
                                type="button"
                                onClick={() => setRecentMembersFilter('all')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  recentMembersFilter === 'all'
                                    ? 'bg-[#1B1815] text-[#F5D061] shadow-xs'
                                    : 'text-[#7A6B58] hover:text-[#231F1C]'
                                }`}
                              >
                                전체 ({recentAffiliatedMembers.length}명)
                              </button>
                              <button
                                type="button"
                                onClick={() => setRecentMembersFilter('direct')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  recentMembersFilter === 'direct'
                                    ? 'bg-[#1B1815] text-[#F5D061] shadow-xs'
                                    : 'text-[#7A6B58] hover:text-[#231F1C]'
                                }`}
                              >
                                직접 ({recentAffiliatedMembers.filter((m) => m.parent_code === currentUser.code).length}명)
                              </button>
                            </div>
                          </div>

                          {displayRecent.length === 0 ? (
                            <div className="text-center py-7 bg-[#FAF8F5] rounded-2xl border border-[#EFE9DD] space-y-2">
                              <div className="text-3xl">🪷</div>
                              <p className="text-xs text-[#7A6B58] font-medium break-keep">
                                {recentMembersFilter === 'direct'
                                  ? '내가 직접 추천하여 가입한 신규 회원이 아직 없습니다.'
                                  : '아직 내 산하로 맺어진 인연 신도가 없습니다.'}
                              </p>
                              <p className="text-[11px] text-[#A89880]">
                                카카오톡으로 소원등을 공유해 소중한 인연을 맺어보세요.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopyRefLink(currentUser.code)}
                                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F5D061] text-[#1B1815] text-xs font-bold shadow-xs hover:bg-[#E5BF4F] transition active:scale-95 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>나의 인연 추천 링크 복사</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {displayRecent.map((m) => {
                                const isDirect = m.parent_code === currentUser.code
                                const parentAgent = !isDirect ? members.find((p) => p.code === m.parent_code) : null
                                const mPrayer = (prayers || []).find((p) =>
                                  p.member_code === m.code ||
                                  (m.phone && p.believer_phone && p.believer_phone.replace(/[^0-9]/g, '') === m.phone.replace(/[^0-9]/g, ''))
                                )
                                const isToday = m.created_at && new Date(m.created_at).toDateString() === new Date().toDateString()

                                return (
                                  <div
                                    key={m.code}
                                    className={`py-2 px-3 rounded-xl border transition flex flex-col gap-1.5 ${
                                      isToday
                                        ? 'bg-[#FFFDF7] border-[#ECC872] shadow-xs'
                                        : 'bg-[#FAF8F5] border-[#E8DEC8] hover:border-[#C59B27]/50'
                                    }`}
                                  >
                                    {/* 상단: 이름, 법명, 추천관계, 가입일시 */}
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F5D061] to-[#C59B27] text-[#1B1815] font-serif-kr font-black flex items-center justify-center text-[10.5px] shrink-0 shadow-xs">
                                          {m.name.slice(0, 1)}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-serif-kr font-bold text-[13px] sm:text-[14px] text-[#1B1815]">
                                              {m.name}
                                            </span>
                                            {m.dharma_name && (
                                              <span className="text-xs font-bold text-[#8A6510]">
                                                ({m.dharma_name})
                                              </span>
                                            )}
                                            <span
                                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold whitespace-nowrap ${
                                                isDirect
                                                  ? 'bg-[#8A6510]/12 text-[#8A6510] border border-[#8A6510]/30'
                                                  : 'bg-stone-200/80 text-stone-600'
                                              }`}
                                            >
                                              {isDirect ? '직접 추천' : `${parentAgent ? parentAgent.name : '산하'} 추천`}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <span
                                          className={`text-[11px] font-bold whitespace-nowrap ${
                                            isToday ? 'text-amber-800 font-black' : 'text-[#8C8071]'
                                          }`}
                                        >
                                          {formatRelativeOrDate(m.created_at)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* 하단: 연락처 + 축원/소원등 접수 현황 */}
                                    <div className="flex items-center justify-between gap-2 text-[11px] pt-1 border-t border-[#EFE9DD]/70 flex-wrap">
                                      <div className="flex items-center gap-1.5 text-[#5C5245]">
                                        <Phone className="w-3 h-3 text-[#A89880]" />
                                        <a
                                          href={`tel:${m.phone}`}
                                          className="font-mono hover:text-[#9A7418] font-semibold transition"
                                          title="전화 걸기"
                                        >
                                          {formatPhone11(m.phone)}
                                        </a>
                                      </div>

                                      <div className="flex items-center gap-1.5 text-[10.5px]">
                                        {mPrayer ? (
                                          <span className="inline-flex items-center gap-1 text-[#8A6510] font-medium bg-[#FAF3DF] px-1.5 py-0.2 rounded border border-[#E5D399]">
                                            <span>🪔 {mPrayer.wish_category || '소원등'}</span>
                                            <span className="text-[9.5px] text-amber-700 font-bold">(축원)</span>
                                          </span>
                                        ) : (
                                          <span className="text-[#8C8071]">
                                            {m.extra_data?.registered_via === 'wish_lantern'
                                              ? '🪔 소원등 동참 가입'
                                              : m.extra_data?.registered_via === 'sutra'
                                              ? '✍️ 마음사경 동참 가입'
                                              : '🙏 모바일 법당 가입'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}

                              {/* 더보기 / 접기 버튼 */}
                              {filteredRecent.length > 5 && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllRecentMembers(!showAllRecentMembers)}
                                  className="w-full py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#7A6B58] border border-[#DDD4C4] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <span>
                                    {showAllRecentMembers
                                      ? '접기 ▲'
                                      : `이전 가입 회원 더보기 (+${filteredRecent.length - 5}명) ▼`}
                                  </span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  )
                })()}

                {/* 5. ⚙️ 내 기본정보 및 대웅전 축원 관리 (스마트 요약 & 접이식 수정 폼) */}
                <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#E6DEC8] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-[#9A7418]">
                        MEMBER PROFILE & PRAYER DB
                      </span>
                      <h3 className="font-serif-kr text-base font-bold text-[#231F1C] mt-0.5">
                        내 기본정보 및 사찰 축원 상세 관리
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsProfileEditOpen(!isProfileEditOpen)}
                      className="px-3 py-1.5 rounded-xl bg-[#231F1C] text-[#F5D061] text-xs font-bold border border-[#C59B27] hover:bg-[#302A25] transition flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      <span>{isProfileEditOpen ? '수정 닫기 ▲' : '✏️ 정보 수정하기'}</span>
                    </button>
                  </div>

                  {/* 평소 요약 보기 (입력창 없이 눈이 편안한 카드) */}
                  {!isProfileEditOpen ? (
                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE9DD]">
                          <span className="text-[11px] text-[#8C8071] block">성함 / 법명</span>
                          <span className="font-bold text-[#231F1C] mt-0.5 block">
                            {currentUser.name} {currentUser.dharma_name ? `(${currentUser.dharma_name})` : '(법명 미입력)'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE9DD]">
                          <span className="text-[11px] text-[#8C8071] block">생년월일 (축원용)</span>
                          <span className="font-bold text-[#231F1C] mt-0.5 block">
                            {currentUser.birth_date ? `${currentUser.birth_date} (${currentUser.lunar_solar || '음력'})` : '생년월일 미입력'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE9DD]">
                        <span className="text-[11px] text-[#8C8071] block">거주지 주소 (대웅전 축원문 낭독용)</span>
                        <span className="font-semibold text-[#231F1C] mt-0.5 block">
                          {currentUser.address || '주소 미입력 (사찰 예불 축원 시 기재 필요)'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE9DD]">
                        <span className="text-[11px] text-[#8C8071] block">가족 축원 명단 / 조상 영가 메모</span>
                        <span className="text-[#3D3630] mt-0.5 block leading-relaxed break-keep">
                          {currentUser.family_memo || '가족 축원 명단 미입력'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE9DD]">
                        <span className="text-[11px] text-[#8C8071]">비밀번호</span>
                        <span className="font-mono text-emerald-600 font-bold">●●●● (안전하게 설정됨)</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsProfileEditOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-[#FAF3DF] hover:bg-[#F5E6BF] text-[#8A6510] border border-[#E5D399] font-bold text-xs transition"
                      >
                        ✏️ 위 기본정보 또는 비밀번호 변경하기
                      </button>
                    </div>
                  ) : (
                    /* 수정 폼 열림 상태 */
                    <form onSubmit={handleSaveProfile} className="space-y-4 pt-1 animate-fadeIn">
                      <div className="grid grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-xs font-bold text-[#3D3630] mb-1">
                            성함 (필수 *)
                          </label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, name: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#3D3630] mb-1">
                            법명 (선택)
                          </label>
                          <input
                            type="text"
                            value={profileForm.dharma_name}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, dharma_name: e.target.value })
                            }
                            placeholder="예: 무량화"
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#3D3630] mb-1">
                            비밀번호 변경
                          </label>
                          <input
                            type="text"
                            value={profileForm.password_pin}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, password_pin: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-bold text-[#3D3630] mb-1">
                            생년월일 (축원용)
                          </label>
                          <input
                            type="text"
                            value={profileForm.birth_date}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, birth_date: e.target.value })
                            }
                            placeholder="예: 1964-02-19"
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#3D3630] mb-1">
                            음력 / 양력 구분
                          </label>
                          <select
                            value={profileForm.lunar_solar}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, lunar_solar: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                          >
                            <option value="음력">음력</option>
                            <option value="양력">양력</option>
                            <option value="음력(윤달)">음력(윤달)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#3D3630] mb-1">
                          거주지 주소 (대웅전 축원문 낭독용)
                        </label>
                        <input
                          type="text"
                          value={profileForm.address}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, address: e.target.value })
                          }
                          placeholder="예: 제주특별자치도 제주시 애월읍..."
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#3D3630] mb-1">
                          가족 축원 명단 / 조상 영가 메모 (자유 기재)
                        </label>
                        <textarea
                          rows={2}
                          value={profileForm.family_memo}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, family_memo: e.target.value })
                          }
                          placeholder="예: 배우자 김성수(59년생), 장녀 김미영(90년생) 건강 발원"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                        />
                      </div>

                      {/* 포교위원 전용 수당 정산 계좌 */}
                      {isAgentOrAbove && (
                        <div className="pt-3 border-t border-[#EFE9DD] space-y-2.5">
                          <span className="block text-[11px] font-bold text-[#9A7418]">
                            [포교위원 전용] 불사 포교비(수당) 정산 계좌 정보
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={profileForm.bank_name}
                              onChange={(e) =>
                                setProfileForm({ ...profileForm, bank_name: e.target.value })
                              }
                              placeholder="은행명 (예: 농협)"
                              className="px-2.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                            />
                            <input
                              type="text"
                              value={profileForm.bank_account}
                              onChange={(e) =>
                                setProfileForm({ ...profileForm, bank_account: e.target.value })
                              }
                              placeholder="계좌번호"
                              className="px-2.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                            />
                            <input
                              type="text"
                              value={profileForm.account_holder}
                              onChange={(e) =>
                                setProfileForm({ ...profileForm, account_holder: e.target.value })
                              }
                              placeholder="예금주"
                              className="px-2.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="submit"
                          className="flex-1 py-3 rounded-xl bg-[#231F1C] text-[#F5D061] font-bold text-xs border border-[#C59B27] hover:bg-[#302A25] transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-4 h-4" />
                          <span>내 회원정보 저장하기</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsProfileEditOpen(false)}
                          className="px-4 py-3 rounded-xl bg-neutral-100 border border-[#DDD4C4] text-xs text-[#6E655C] font-semibold hover:bg-neutral-200 transition"
                        >
                          취소
                        </button>
                      </div>
                    </form>
                  )}
                </section>

              </>
            )}
          </main>
  )
}
