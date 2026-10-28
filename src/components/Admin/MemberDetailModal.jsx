import React from 'react'
import { createPortal } from 'react-dom'
import {
  BookOpen,
  Edit3,
  FileText,
  Flame,
  MessageSquare,
  Phone,
  Plus,
  PlusCircle,
  Printer,
  Save,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'
import { computeZodiacAndGanji } from '../../lib/supabase'

// 🪷 [고급 사찰 통합 ERP 신도 교적부 & 가족 사주 상세/수정 모달]
export default function MemberDetailModal({
  isOpen = true,
  member,
  onClose,
  isEditingMember,
  setIsEditingMember,
  memberEditForm,
  setMemberEditForm,
  onSaveMemberEdit,
  prayers = [],
  settlements = [],
  members = [],
  agents: propAgents,
  getMemberPrayerAndPaymentInfo,
  onOpenIndividualRecordPrint,
  onOpenIndeungPrint,
  onOpenSettlement,
  setSettlementTargetMember,
  setShowSettlementModal,
  setIndividualRecordTargetMember,
  setShowIndividualRecordPrintModal,
  setIndeungTargetMember,
  setShowIndeungNameplateModal,
}) {
  if (!isOpen || !member) return null
  if (typeof document === 'undefined') return null

  const selectedMemberDetail = member
  const handleSaveMemberEdit = onSaveMemberEdit

  const agents = React.useMemo(() => {
    if (propAgents && propAgents.length > 0) return propAgents
    return (members || []).filter(
      (m) =>
        m.role === 'agent' ||
        m.role === 'committee_head' ||
        m.role === 'committee_member' ||
        m.role === 'temple_admin' ||
        m.role === 'master'
    )
  }, [propAgents, members])
    const curComp = computeZodiacAndGanji(selectedMemberDetail.birth_year || selectedMemberDetail.birth_date)
    const curGanji = curComp.ganji || selectedMemberDetail.ganji || ''
    const curAnimal = curComp.animal || selectedMemberDetail.animal || ''

    // 🪷 해당 신도의 다년간 역대 전체 소원등 & 기도 봉안 이력 추출 (연도별 누적)
    const memberHistoryPrayers = (prayers || []).filter(
      (p) =>
        p.member_code === selectedMemberDetail.code ||
        (selectedMemberDetail.phone && p.believer_phone && p.believer_phone.replace(/[^0-9]/g, '') === selectedMemberDetail.phone.replace(/[^0-9]/g, '')) ||
        (p.believer_name && p.believer_name.includes(selectedMemberDetail.name))
    ).sort((a, b) => new Date(b.created_at || '2026-01-01').getTime() - new Date(a.created_at || '2026-01-01').getTime())

    // 🏛️ 해당 신도의 다년간 역대 전체 사찰 불사 & 위패 봉안 동참 이력 추출 (연도별 누적)
    const memberHistorySettlements = (settlements || []).filter(
      (s) =>
        (s.member_code && s.member_code === selectedMemberDetail.code) ||
        (s.believer_name && s.believer_name.includes(selectedMemberDetail.name))
    ).sort((a, b) => new Date(b.created_at || '2026-01-01').getTime() - new Date(a.created_at || '2026-01-01').getTime())

    const totalDonationAmount = memberHistorySettlements.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0)
    const lanternInfo = getMemberPrayerAndPaymentInfo(selectedMemberDetail)

    const openEditForm = () => {
      setMemberEditForm({
        name: selectedMemberDetail.name || '',
        dharma_name: selectedMemberDetail.dharma_name || '',
        gender: selectedMemberDetail.gender || selectedMemberDetail.extra_data?.gender || '여',
        phone: selectedMemberDetail.phone || '',
        tel: selectedMemberDetail.tel || selectedMemberDetail.extra_data?.tel || '',
        birth_year: selectedMemberDetail.birth_year || (selectedMemberDetail.birth_date ? selectedMemberDetail.birth_date.slice(0, 4) : ''),
        lunar_solar: selectedMemberDetail.lunar_solar || '음력',
        address: selectedMemberDetail.address || '',
        role: selectedMemberDetail.role || 'believer',
        parent_code: selectedMemberDetail.parent_code || '55570267',
        password_pin: selectedMemberDetail.password_pin || '0000',
        family_memo: selectedMemberDetail.family_memo || '',
        admin_notes: selectedMemberDetail.admin_notes || selectedMemberDetail.extra_data?.admin_notes || '',
        family_members: selectedMemberDetail.family_members
          ? selectedMemberDetail.family_members.map((f) => ({ ...f }))
          : (selectedMemberDetail.extra_data?.family_members ? [...selectedMemberDetail.extra_data.family_members] : []),
      })
      setIsEditingMember(true)
    }

    return createPortal(
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-4xl bg-[#FAF8F5] text-[#231F1C] rounded-3xl p-5 sm:p-7 border-2 border-[#C59B27] shadow-2xl space-y-5 my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
          {/* 모달 상단 헤더 */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E6DEC8] gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#1B1815] text-[#F5D061] flex items-center justify-center font-bold text-base shrink-0 shadow">
                卍
              </div>
              <div className="min-w-0">
                <h3 className="font-serif-kr text-base sm:text-xl font-black text-[#1B1815] truncate">
                  {isEditingMember ? '신도 교적부 정보 및 가족 사주 수정' : '신도 신적부(교적부) 상세 대장'}
                </h3>
                <p className="text-[11px] text-[#8C8071] truncate">
                  제주 소원사 본부 교적부 · 교적코드 #{selectedMemberDetail.code} · 누적 기도 공덕 {selectedMemberDetail.merit_count || 0}회
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!isEditingMember) {
                    openEditForm()
                  } else {
                    setIsEditingMember(false)
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                  isEditingMember
                    ? 'bg-[#E0D8C8] text-[#554E45] hover:bg-[#D5CCBC]'
                    : 'bg-[#1B1815] text-[#F5D061] hover:bg-[#2C251F]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingMember ? '수정 취소' : '정보 수정'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose()
                  setIsEditingMember(false)
                }}
                className="p-2 rounded-xl bg-white border border-[#DDD4C4] text-[#7A6E5E] hover:text-[#1B1815] transition shadow-sm"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ==================== [수정 모드] ==================== */}
          {isEditingMember && memberEditForm ? (
            <div className="space-y-4 text-xs">
              {/* 1. 기본 인적사항 & 사주 만세력 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6DEC8] shadow-sm space-y-3">
                <div className="text-xs font-bold text-[#8A6510] flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-700" />
                    <span className="text-sm font-serif-kr">1. 신도 기본 신상 및 사주 만세력</span>
                  </div>
                  <span className="text-[11px] text-[#8C8071]">교적번호 #{selectedMemberDetail.code}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#554E45] block mb-1">성함 (본명) *</label>
                    <input
                      type="text"
                      value={memberEditForm.name}
                      onChange={(e) => setMemberEditForm({ ...memberEditForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] font-bold text-[#1B1815] focus:outline-none focus:border-[#C59B27]"
                      placeholder="홍길동"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#554E45] block mb-1">법명 (불명)</label>
                    <input
                      type="text"
                      value={memberEditForm.dharma_name}
                      onChange={(e) => setMemberEditForm({ ...memberEditForm, dharma_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-[#8A6510] font-bold focus:outline-none focus:border-[#C59B27]"
                      placeholder="예: 보현심, 원력행"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#554E45] block mb-1">성별 구분</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['여', '남'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setMemberEditForm({ ...memberEditForm, gender: g })}
                          className={`py-2 rounded-xl font-bold transition text-center ${
                            (memberEditForm.gender || '여') === g
                              ? 'bg-[#1B1815] text-[#F5D061] border border-[#1B1815]'
                              : 'bg-[#FAF8F5] text-[#7A6E5E] border border-[#DDD4C4] hover:bg-white'
                          }`}
                        >
                          {g === '여' ? '여성 (보살)' : '남성 (거사)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 생년 & 사주 만세력 자동 계산 배지 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-[#554E45] block mb-1">생년 (4자리)</label>
                    <input
                      type="text"
                      value={memberEditForm.birth_year || ''}
                      onChange={(e) => setMemberEditForm({ ...memberEditForm, birth_year: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] font-mono font-bold focus:outline-none focus:border-[#C59B27]"
                      placeholder="예: 1968"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#554E45] block mb-1">음력 / 양력 구분</label>
                    <select
                      value={memberEditForm.lunar_solar || '음력'}
                      onChange={(e) => setMemberEditForm({ ...memberEditForm, lunar_solar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] font-semibold text-[#8A6510]"
                    >
                      <option value="음력">음력 (사찰 전통)</option>
                      <option value="양력">양력</option>
                      <option value="윤달">윤달 (음력)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#554E45] block mb-1">사주 간지 및 띠 (자동 계산)</label>
                    <div className="px-3 py-2 rounded-xl bg-[#FAF3DF] border border-[#E8D4A2] flex items-center justify-center min-h-[38px]">
                      {computeZodiacAndGanji(memberEditForm.birth_year).ganji ? (
                        <span className="font-serif-kr font-bold text-xs text-[#7A5B0B]">
                          {computeZodiacAndGanji(memberEditForm.birth_year).ganji} ({computeZodiacAndGanji(memberEditForm.birth_year).animal}띠)
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#A69B8D]">생년 입력 시 자동 산출</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-[#554E45] block mb-1">휴대폰 번호 *</label>
                    <input
                      type="tel"
                      value={memberEditForm.phone}
                      onChange={(e) => setMemberEditForm({ ...memberEditForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] font-mono text-xs focus:outline-none focus:border-[#C59B27]"
                      placeholder="010-0000-0000"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#554E45] block mb-1">일반 / 자택 전화 (선택)</label>
                    <input
                      type="tel"
                      value={memberEditForm.tel || ''}
                      onChange={(e) => setMemberEditForm({ ...memberEditForm, tel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] font-mono text-xs focus:outline-none focus:border-[#C59B27]"
                      placeholder="064-000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#554E45] block mb-1">거주지 주소 (도로명 및 동/호수)</label>
                  <input
                    type="text"
                    value={memberEditForm.address}
                    onChange={(e) => setMemberEditForm({ ...memberEditForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs focus:outline-none focus:border-[#C59B27]"
                    placeholder="제주특별자치도 제주시 애월읍 애월로 12, 101동"
                  />
                </div>
              </div>

              {/* 2. 사찰 소속 행정 & 계정 관리 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6DEC8] shadow-sm space-y-3">
                <div className="text-xs font-bold text-[#8A6510] flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span className="text-sm font-serif-kr">2. 사찰 소속 행정 & 계정 관리</span>
                  </div>
                  <span className="text-[11px] text-[#8C8071]">소원사 도량 귀속</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#554E45] block mb-1">신도 구분 (등급)</label>
                    <select
                      value={memberEditForm.role || 'believer'}
                      onChange={(e) => setMemberEditForm({ ...memberEditForm, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] font-semibold text-xs"
                    >
                      <option value="believer">일반신도</option>
                      <option value="committee_member">포교위원 (30%)</option>
                      <option value="agent">포교위원장 (40%)</option>
                      <option value="temple_admin">사찰 본부임원</option>
                      <option value="master">총괄대표 (마스터)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#554E45] block mb-1">신도 귀속처 (추천인)</label>
                    <select
                      value={memberEditForm.parent_code || '55570267'}
                      onChange={(e) => setMemberEditForm({ ...memberEditForm, parent_code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] font-semibold text-[#8A6510] text-xs"
                    >
                      <option value="55570267">🏛️ 1. 본사 귀속: 양영문 창건주 회장 (사찰본부)</option>
                      <option value="33065540">👑 2. 귀속: 김철수 총괄대표 (전국포교본부)</option>
                      {agents
                        .filter((a) => a.code !== '55570267' && a.code !== '33065540')
                        .map((a) => (
                          <option key={a.code} value={a.code}>
                            귀속: {a.name} ({a.role === 'agent' ? '위원장' : '위원'})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#554E45] block mb-1">모바일 법당 접속 PIN (4자리)</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={memberEditForm.password_pin || '0000'}
                      onChange={(e) => setMemberEditForm({ ...memberEditForm, password_pin: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] font-mono text-xs font-bold text-center tracking-widest focus:outline-none focus:border-[#C59B27]"
                      placeholder="0000"
                    />
                  </div>
                </div>
              </div>

              {/* 3. 가족 사주 명패 명단 (세주 · 배우자 · 자녀) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6DEC8] shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                  <div className="text-xs font-bold text-[#8A6510] flex items-center gap-1.5 flex-wrap">
                    <Flame className="w-4 h-4 text-amber-700" />
                    <span className="text-sm font-serif-kr">3. 가족 사주 명단 (세주 · 배우자 · 자녀)</span>
                    <span className="text-[11px] font-normal text-[#8C8071]">
                      *축원 시 세주(가장)부터 자동 낭독됩니다
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...(memberEditForm.family_members || []),
                        {
                          id: `fm-${Date.now()}`,
                          relation: '자녀',
                          name: '',
                          dharma_name: '',
                          birth_year: '',
                          lunar_solar: '음력',
                          wish: '',
                        },
                      ]
                      setMemberEditForm({ ...memberEditForm, family_members: next })
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#231F1C] text-[#F5D061] text-xs font-bold hover:bg-[#302A25] transition shadow-sm flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ 가족 추가</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(memberEditForm.family_members || []).length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#8C8071] bg-[#FAF8F5] rounded-xl border border-dashed border-[#DDD4C4]">
                      등록된 가족 구성원이 없습니다. 위의 [+ 가족 추가] 버튼을 눌러 세주(가장), 배우자, 자녀를 등록하세요.
                    </div>
                  ) : (
                    (memberEditForm.family_members || []).map((f, idx) => {
                      const { ganji, animal } = computeZodiacAndGanji(f.birth_year || f.birth_date)
                      return (
                        <div
                          key={f.id || idx}
                          className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD4C4] hover:border-[#C59B27] transition space-y-2"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={f.relation}
                              onChange={(e) => {
                                const next = memberEditForm.family_members.map((item, i) =>
                                  i === idx ? { ...item, relation: e.target.value } : item
                                )
                                setMemberEditForm({ ...memberEditForm, family_members: next })
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD4C4] text-xs font-bold text-[#8A6510]"
                            >
                              <option value="세주(가장)">세주(가장)</option>
                              <option value="배우자">배우자</option>
                              <option value="장남">장남</option>
                              <option value="차남">차남</option>
                              <option value="삼남">삼남</option>
                              <option value="장녀">장녀</option>
                              <option value="차녀">차녀</option>
                              <option value="삼녀">삼녀</option>
                              <option value="자녀">자녀</option>
                              <option value="자부">자부</option>
                              <option value="사위">사위</option>
                              <option value="손자">손자</option>
                              <option value="손녀">손녀</option>
                              <option value="부모">부모</option>
                              <option value="기타가족">기타가족</option>
                            </select>

                            <input
                              type="text"
                              value={f.name}
                              onChange={(e) => {
                                const next = memberEditForm.family_members.map((item, i) =>
                                  i === idx ? { ...item, name: e.target.value } : item
                                )
                                setMemberEditForm({ ...memberEditForm, family_members: next })
                              }}
                              placeholder="성함"
                              className="w-24 px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD4C4] text-xs font-bold"
                            />

                            <input
                              type="text"
                              value={f.dharma_name || ''}
                              onChange={(e) => {
                                const next = memberEditForm.family_members.map((item, i) =>
                                  i === idx ? { ...item, dharma_name: e.target.value } : item
                                )
                                setMemberEditForm({ ...memberEditForm, family_members: next })
                              }}
                              placeholder="법명(선택)"
                              className="w-24 px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD4C4] text-xs font-medium text-[#8A6510]"
                            />

                            <input
                              type="text"
                              value={f.birth_year || ''}
                              onChange={(e) => {
                                const y = e.target.value
                                const comp = computeZodiacAndGanji(y)
                                const next = memberEditForm.family_members.map((item, i) =>
                                  i === idx
                                    ? { ...item, birth_year: y, birth_date: `${y}-01-01`, ganji: comp.ganji, animal: comp.animal }
                                    : item
                                )
                                setMemberEditForm({ ...memberEditForm, family_members: next })
                              }}
                              placeholder="생년(1984)"
                              className="w-24 px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD4C4] text-xs font-mono font-bold"
                            />

                            <select
                              value={f.lunar_solar || '음력'}
                              onChange={(e) => {
                                const next = memberEditForm.family_members.map((item, i) =>
                                  i === idx ? { ...item, lunar_solar: e.target.value } : item
                                )
                                setMemberEditForm({ ...memberEditForm, family_members: next })
                              }}
                              className="px-2 py-1.5 rounded-lg bg-white border border-[#DDD4C4] text-xs"
                            >
                              <option value="음력">음력</option>
                              <option value="양력">양력</option>
                              <option value="윤달">윤달</option>
                            </select>

                            <div className="min-w-[130px] flex items-center">
                              {ganji ? (
                                <span className="px-2.5 py-1 rounded-lg bg-[#FAF3DF] text-[#7A5B0B] border border-[#E8D4A2] font-bold text-[11px] font-serif-kr">
                                  {ganji} ({animal}띠)
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#A69B8D]">생년 입력 시 간지 산출</span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const next = memberEditForm.family_members.filter((_, i) => i !== idx)
                                setMemberEditForm({ ...memberEditForm, family_members: next })
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 ml-auto"
                              title="가족 삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#777777] shrink-0">개인 발원:</span>
                            <input
                              type="text"
                              value={f.wish || ''}
                              onChange={(e) => {
                                const next = memberEditForm.family_members.map((item, i) =>
                                  i === idx ? { ...item, wish: e.target.value } : item
                                )
                                setMemberEditForm({ ...memberEditForm, family_members: next })
                              }}
                              placeholder="예: 2027년 수능 대박, 사업 번창, 무병장수 발원"
                              className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-[#DDD4C4] text-xs text-[#555555]"
                            />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* 4. 종무소 관리자 특이사항 & 상담 메모 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6DEC8] shadow-sm space-y-2">
                <div className="text-xs font-bold text-[#8A6510] flex items-center gap-1.5 border-b border-[#F0EAE1] pb-2">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span className="text-sm font-serif-kr">4. 종무소 관리자 특이사항 & 상담 메모 (사찰 내부용)</span>
                </div>
                <textarea
                  rows={3}
                  value={memberEditForm.admin_notes || memberEditForm.family_memo || ''}
                  onChange={(e) =>
                    setMemberEditForm({
                      ...memberEditForm,
                      admin_notes: e.target.value,
                      family_memo: e.target.value,
                    })
                  }
                  placeholder="예: 매월 초하루 정기법회 참석. 공양미 불사 1가마 동참. 차량번호: 12가 3456. 특별 상담 내용 등을 기록하세요."
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs text-[#1B1815] focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              {/* 하단 저장 버튼 */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveMemberEdit}
                  className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>수정사항 소원사 DB에 즉시 저장하기</span>
                </button>
              </div>
            </div>
          ) : (
            /* ==================== [열람 모드 (상세 대장)] ==================== */
            <div className="space-y-4 text-xs">
              {/* 대형 프로필 카드 */}
              <div className="p-5 rounded-2xl bg-white border border-[#E6DEC8] shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-serif-kr text-xl sm:text-2xl font-black text-[#1B1815]">
                      {selectedMemberDetail.name}
                      {selectedMemberDetail.dharma_name && (
                        <span className="text-[#8A6510] ml-1.5 font-bold">({selectedMemberDetail.dharma_name})</span>
                      )}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF3DF] text-[#7A5B0B] border border-[#E8D4A2]">
                      {(selectedMemberDetail.gender || selectedMemberDetail.extra_data?.gender) === '남' ? '남성 (거사님)' : '여성 (보살님)'}
                    </span>
                    {curGanji && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 font-serif-kr">
                        {selectedMemberDetail.birth_year || (selectedMemberDetail.birth_date ? selectedMemberDetail.birth_date.slice(0, 4) : '')}년 {selectedMemberDetail.lunar_solar || '음력'} ({curGanji} {curAnimal}띠)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#1B1815] text-[#F5D061] font-bold">
                      {selectedMemberDetail.role === 'master'
                        ? '총괄 마스터'
                        : selectedMemberDetail.role === 'temple_admin'
                        ? '사찰 본부임원'
                        : selectedMemberDetail.role === 'agent'
                        ? '포교위원장 (40%)'
                        : selectedMemberDetail.role === 'committee_member'
                        ? '포교위원 (30%)'
                        : '일반신도'}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                      공덕 {selectedMemberDetail.merit_count || 0}회
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#F0EAE1]">
                  <div>
                    <span className="text-[10.5px] text-[#8C8071] block">휴대폰 번호</span>
                    <strong className="text-sm font-mono text-[#1B1815]">{selectedMemberDetail.phone}</strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#8C8071] block">일반(자택) 전화</span>
                    <strong className="text-sm font-mono text-[#1B1815]">{selectedMemberDetail.tel || selectedMemberDetail.extra_data?.tel || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#8C8071] block">소속 귀속처</span>
                    <strong className="text-xs text-[#8A6510]">
                      {selectedMemberDetail.parent_code === '55570267'
                        ? '🏛️ 본사 (양영문 창건주 회장)'
                        : selectedMemberDetail.parent_code === '33065540'
                        ? '👑 포교본부 (김철수 총괄대표)'
                        : agents.find((a) => a.code === selectedMemberDetail.parent_code)?.name
                        ? `귀속: ${agents.find((a) => a.code === selectedMemberDetail.parent_code)?.name}`
                        : '소원사 본부'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#8C8071] block">모바일 법당 PIN</span>
                    <strong className="text-xs font-mono text-[#1B1815] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#DDD4C4]">
                      {selectedMemberDetail.password_pin || '0000'}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0EAE1]">
                  <span className="text-[10.5px] text-[#8C8071] block">거주지 주소</span>
                  <p className="text-xs text-[#1B1815] font-semibold mt-0.5">
                    {selectedMemberDetail.address || '제주특별자치도'}
                  </p>
                </div>
              </div>

              {/* 가족 사주 명패 명단 표 */}
              <div className="p-5 rounded-2xl bg-white border border-[#E6DEC8] shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                  <div className="text-xs font-bold text-[#8A6510] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-700" />
                    <span className="text-sm font-serif-kr">가족 사주 명패 명단 (세주 · 배우자 · 자녀)</span>
                  </div>
                  <button
                    type="button"
                    onClick={openEditForm}
                    className="text-[11px] font-bold text-[#8A6510] hover:underline"
                  >
                    + 가족 사주 추가/수정
                  </button>
                </div>

                {selectedMemberDetail.family_members && selectedMemberDetail.family_members.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-[#DDD3C1] text-xs">
                      <thead>
                        <tr className="bg-[#F5EFE6] text-[#231F1C] text-center font-bold">
                          <th className="p-2 border border-[#DDD3C1] w-24">관계</th>
                          <th className="p-2 border border-[#DDD3C1] w-28">성함 (법명)</th>
                          <th className="p-2 border border-[#DDD3C1] w-28">생년(음/양)</th>
                          <th className="p-2 border border-[#DDD3C1] w-36">사주 간지 및 띠</th>
                          <th className="p-2 border border-[#DDD3C1]">개인별 발원 내용</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMemberDetail.family_members.map((f, idx) => {
                          const famComp = computeZodiacAndGanji(f.birth_year || f.birth_date)
                          return (
                            <tr key={idx} className="hover:bg-[#FAF8F5]">
                              <td className="p-2 border border-[#DDD3C1] text-center font-bold text-[#8A6510]">
                                {f.relation}
                              </td>
                              <td className="p-2 border border-[#DDD3C1] font-bold text-[#1B1815]">
                                {f.name} {f.dharma_name ? `(${f.dharma_name})` : ''}
                              </td>
                              <td className="p-2 border border-[#DDD3C1] text-center text-[#555555]">
                                {f.birth_year || (f.birth_date ? f.birth_date.slice(0, 4) : '-')}년 ({f.lunar_solar || '음력'})
                              </td>
                              <td className="p-2 border border-[#DDD3C1] font-serif-kr">
                                <span className="px-2 py-0.5 rounded bg-[#FAF3DF] text-[#7A5B0B] border border-[#E8D4A2] font-bold text-[11px]">
                                  {f.ganji || famComp.ganji} ({f.animal || famComp.animal}띠)
                                </span>
                              </td>
                              <td className="p-2 border border-[#DDD3C1] text-[#666666]">
                                {f.wish || '-'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-5 text-center text-xs text-[#8C8071] bg-[#FAF8F5] rounded-xl border border-dashed border-[#DDD4C4]">
                    등록된 가족 사주 정보가 없습니다. 상단의 [정보 수정]을 눌러 가족 사주를 등록하세요.
                  </div>
                )}
              </div>

              {/* 종무소 관리자 특이사항 메모 박스 */}
              {(selectedMemberDetail.admin_notes || selectedMemberDetail.family_memo || selectedMemberDetail.extra_data?.admin_notes) && (
                <div className="p-4 rounded-2xl bg-white border border-[#E6DEC8] shadow-sm space-y-1.5">
                  <div className="text-[11px] font-bold text-[#8A6510] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>종무소 관리자 특이사항 & 상담 메모</span>
                  </div>
                  <p className="text-xs text-[#333333] leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE2D3] whitespace-pre-wrap">
                    {selectedMemberDetail.admin_notes || selectedMemberDetail.extra_data?.admin_notes || selectedMemberDetail.family_memo}
                  </p>
                </div>
              )}

              {/* 🪷 다년간 신행 공덕 & 소원등·사찰불사 동참 누적 종합 대장 */}
              <div className="p-4 rounded-2xl bg-[#FCFAF6] border-2 border-[#D4AF37]/50 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🪷</span>
                    <span className="font-serif-kr font-bold text-sm text-[#1B1815]">
                      신행 공덕 및 소원등·불사 누적 원장
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EAE2D3] text-[#5C5349]">
                    영구 보존 원장
                  </span>
                </div>

                {/* 4대 종합 지표 카드 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E6DEC8] shadow-xs">
                    <div className="text-[10px] text-[#7A6B58] font-medium">누적 소원등 봉안</div>
                    <div className="text-sm font-black text-[#8A6510] mt-0.5">{memberHistoryPrayers.length}건</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E6DEC8] shadow-xs">
                    <div className="text-[10px] text-[#7A6B58] font-medium">누적 불사·위패 동참</div>
                    <div className="text-sm font-black text-[#8A6510] mt-0.5">{memberHistorySettlements.length}건</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E6DEC8] shadow-xs">
                    <div className="text-[10px] text-[#7A6B58] font-medium">총 불사 보시액</div>
                    <div className="text-sm font-black text-[#D32F2F] mt-0.5">{totalDonationAmount.toLocaleString()}원</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E6DEC8] shadow-xs">
                    <div className="text-[10px] text-[#7A6B58] font-medium">현재 점등 상태</div>
                    <div className="text-xs font-bold text-[#1B1815] mt-1 truncate" title={lanternInfo.label}>{lanternInfo.label}</div>
                  </div>
                </div>

                {/* 1. 역대 소원등 및 축원 기도 봉안 이력 표 */}
                <div className="space-y-1.5">
                  <div className="text-[11.5px] font-bold text-[#3B332B] flex items-center justify-between">
                    <span>📜 역대 소원등·기도 봉안 이력 ({memberHistoryPrayers.length}건)</span>
                    <span className="text-[10px] text-[#8C7A6B]">과거~현재 전체</span>
                  </div>
                  {memberHistoryPrayers.length === 0 ? (
                    <div className="p-3 rounded-xl bg-white border border-[#EAE2D3] text-center text-xs text-[#8C7A6B]">
                      등록된 소원등 봉안 내역이 없습니다.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-[#E6DEC8] bg-white">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#F5EEDB] text-[#5C4D3C] text-[10px] sticky top-0 font-bold border-b border-[#E6DEC8]">
                          <tr>
                            <th className="p-1.5 text-center whitespace-nowrap">접수일</th>
                            <th className="p-1.5 whitespace-nowrap">소원 분류</th>
                            <th className="p-1.5">발원문 / 축원 내용</th>
                            <th className="p-1.5 text-center whitespace-nowrap">기간</th>
                            <th className="p-1.5 text-center whitespace-nowrap">상태</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE7D8]">
                          {memberHistoryPrayers.map((p, idx) => (
                            <tr key={p.id || idx} className="hover:bg-[#FAF8F5]">
                              <td className="p-1.5 text-center whitespace-nowrap font-mono text-[10px] text-[#666]">
                                {(p.created_at || '').slice(0, 10)}
                              </td>
                              <td className="p-1.5 whitespace-nowrap font-bold text-[#8A6510]">
                                {p.wish_category || p.prayer_type || '인등기도'}
                              </td>
                              <td className="p-1.5 text-[#2B231D] max-w-[160px] truncate" title={p.wish_text || p.content}>
                                {p.wish_text || p.content || '-'}
                              </td>
                              <td className="p-1.5 text-center whitespace-nowrap text-[#666]">
                                {p.duration_days ? `${p.duration_days}일` : (p.period || '1년')}
                              </td>
                              <td className="p-1.5 text-center whitespace-nowrap">
                                <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                                  p.status === 'completed' || p.status === 'active' || p.is_approved
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-stone-100 text-stone-600'
                                }`}>
                                  {p.status === 'completed' ? '봉안완료' : p.status === 'active' || p.is_approved ? '봉안중' : '접수'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. 역대 사찰 불사 및 위패 봉안 동참 이력 표 */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11.5px] font-bold text-[#3B332B] flex items-center justify-between">
                    <span>🏛️ 사찰 불사·위패·특별기도 동참 이력 ({memberHistorySettlements.length}건)</span>
                    <span className="text-[10px] text-[#8C7A6B]">누적 {totalDonationAmount.toLocaleString()}원</span>
                  </div>
                  {memberHistorySettlements.length === 0 ? (
                    <div className="p-3 rounded-xl bg-white border border-[#EAE2D3] text-center text-xs text-[#8C7A6B]">
                      등록된 사찰 불사 동참 내역이 없습니다.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-[#E6DEC8] bg-white">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#F5EEDB] text-[#5C4D3C] text-[10px] sticky top-0 font-bold border-b border-[#E6DEC8]">
                          <tr>
                            <th className="p-1.5 text-center whitespace-nowrap">동참일자</th>
                            <th className="p-1.5 whitespace-nowrap">불사 / 동참 항목</th>
                            <th className="p-1.5 text-right whitespace-nowrap">보시 금액</th>
                            <th className="p-1.5 text-center whitespace-nowrap">상태</th>
                            <th className="p-1.5">비고</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE7D8]">
                          {memberHistorySettlements.map((s, idx) => (
                            <tr key={s.id || idx} className="hover:bg-[#FAF8F5]">
                              <td className="p-1.5 text-center whitespace-nowrap font-mono text-[10px] text-[#666]">
                                {(s.created_at || '').slice(0, 10)}
                              </td>
                              <td className="p-1.5 whitespace-nowrap font-bold text-[#1B1815]">
                                {s.item_name || s.title || '사찰 특별불사'}
                              </td>
                              <td className="p-1.5 text-right whitespace-nowrap font-mono font-bold text-[#D32F2F]">
                                {Number(s.total_amount || 0).toLocaleString()}원
                              </td>
                              <td className="p-1.5 text-center whitespace-nowrap">
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                                  {s.payment_status === 'paid' || !s.payment_status ? '완납·동참' : s.payment_status}
                                </span>
                              </td>
                              <td className="p-1.5 text-[#666] max-w-[140px] truncate" title={s.notes || s.memo}>
                                {s.notes || s.memo || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSettlement) {
                      onOpenSettlement(selectedMemberDetail)
                    } else if (typeof setSettlementTargetMember === 'function' && typeof setShowSettlementModal === 'function') {
                      setSettlementTargetMember(selectedMemberDetail)
                      setShowSettlementModal(true)
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#FAF8F5] border border-[#C59B27] text-[#8A6510] font-bold text-xs hover:bg-[#F5EEDB] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#8A6510]" />
                  <span>➕ 이 신도님의 사찰 불사·위패 동참 접수하기</span>
                </button>

                {/* 3. 개인 신도 교적대장 종합 A4 원터치 인쇄 버튼 */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenIndividualRecordPrint) {
                      onOpenIndividualRecordPrint(selectedMemberDetail)
                    } else if (typeof setIndividualRecordTargetMember === 'function' && typeof setShowIndividualRecordPrintModal === 'function') {
                      setIndividualRecordTargetMember(selectedMemberDetail)
                      setShowIndividualRecordPrintModal(true)
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1B1815] via-[#2E2822] to-[#1B1815] border border-[#D4AF37] text-[#F5D061] font-bold text-xs shadow hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  <span>📜 개인 신도 교적대장(신적부) 종합 A4 원터치 인쇄하기</span>
                </button>
              </div>

              {/* 원터치 A4 인쇄 & 통화/문자 액션 버튼바 */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenIndeungPrint) {
                      onOpenIndeungPrint(selectedMemberDetail)
                    } else if (typeof setIndeungTargetMember === 'function' && typeof setShowIndeungNameplateModal === 'function') {
                      setIndeungTargetMember(selectedMemberDetail)
                      setShowIndeungNameplateModal(true)
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#8A6510] text-[#1B1815] font-black text-sm shadow-md hover:brightness-105 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>대웅전 1년 가족 인등 전통 명패 A4 원터치 인쇄하기</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${selectedMemberDetail.phone}`}
                    className="py-2.5 rounded-xl bg-[#231F1C] text-[#F5D061] font-bold text-xs flex items-center justify-center gap-1.5 shadow hover:bg-[#302A25] transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>전화 연결</span>
                  </a>
                  <a
                    href={`sms:${selectedMemberDetail.phone}?body=${encodeURIComponent(
                      `[제주 소원사] 안녕하세요, ${selectedMemberDetail.name} 불자님. 부처님의 가피가 늘 충만하시기를 발원합니다.`
                    )}`}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow hover:brightness-105 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>안내 문자 발송</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    , document.body)
}