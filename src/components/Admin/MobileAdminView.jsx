// src/components/Admin/MobileAdminView.jsx
import React, { useState, useMemo } from 'react'
import {
  Phone,
  MessageSquare,
  Copy,
  Check,
  Search,
  UserPlus,
  Calendar,
  Flame,
  AlertCircle,
  X,
  RefreshCw,
  Users,
  Clock,
  CheckCircle2,
} from 'lucide-react'

export default function MobileAdminView({
  currentUser,
  isMasterOrTempleAdmin,
  members = [],
  setMembers,
  prayers = [],
  setPrayers,
  visits = [],
  setVisits,
  supabase,
  onClose,
  showToast = () => {},
}) {
  const [activeTab, setActiveTab] = useState('bulsa') // 'bulsa' | 'visits' | 'lanterns' | 'members'
  const [bulsaStatusFilter, setBulsaStatusFilter] = useState('all') // 'all' | 'consulting' | 'in_progress' | 'completed'
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedPhone, setCopiedPhone] = useState(null)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 신규 신도 간편 등록 폼 상태
  const [newName, setNewName] = useState('')
  const [newDharmaName, setNewDharmaName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newMemo, setNewMemo] = useState('')

  // 1. 불사·49재·위패 등 상담 대상 건 필터링
  const bulsaInquiries = useMemo(() => {
    return (prayers || []).filter((p) => {
      const cat = String(p.wish_category || '')
      const isBulsaCat =
        cat.includes('49재') ||
        cat.includes('천도재') ||
        cat.includes('위패') ||
        cat.includes('기일') ||
        cat.includes('삼성각') ||
        cat.includes('불사') ||
        cat.includes('공양미') ||
        cat.includes('인등') ||
        cat.includes('생전예수재')
      return isBulsaCat || p.status === 'consulting'
    })
  }, [prayers])

  // 긴급 상담대기 건수
  const pendingBulsaCount = useMemo(() => {
    return bulsaInquiries.filter((p) => p.status === 'consulting').length
  }, [bulsaInquiries])

  // 상담 필터 적용 목록
  const filteredBulsaList = useMemo(() => {
    return bulsaInquiries.filter((p) => {
      if (bulsaStatusFilter === 'consulting') return p.status === 'consulting'
      if (bulsaStatusFilter === 'in_progress') return p.status === 'in_progress'
      if (bulsaStatusFilter === 'completed') return p.status === 'completed'
      return true
    })
  }, [bulsaInquiries, bulsaStatusFilter])

  // 2. 일반 1일 소원등 목록 (당일 사시예불 축원)
  const regularLanterns = useMemo(() => {
    return (prayers || []).filter((p) => {
      const cat = String(p.wish_category || '')
      const isBulsa =
        cat.includes('49재') ||
        cat.includes('천도재') ||
        cat.includes('위패') ||
        cat.includes('기일') ||
        cat.includes('삼성각') ||
        cat.includes('불사') ||
        cat.includes('공양미') ||
        cat.includes('인등') ||
        cat.includes('생전예수재')
      return !isBulsa && p.status !== 'consulting'
    })
  }, [prayers])

  // 3. 신도 검색 목록
  const searchedMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return members.slice(0, 30)
    const cleanQ = q.replace(/[^0-9]/g, '')
    return members.filter((m) => {
      const name = String(m.name || '').toLowerCase()
      const dharma = String(m.dharma_name || '').toLowerCase()
      const phone = String(m.phone || '').replace(/[^0-9]/g, '')
      const memo = String(m.family_memo || '').toLowerCase()
      return (
        name.includes(q) ||
        dharma.includes(q) ||
        memo.includes(q) ||
        (cleanQ && phone.includes(cleanQ))
      )
    })
  }, [members, searchTerm])

  // 전화번호 클립보드 복사
  const handleCopyPhone = (phone) => {
    if (!phone) return
    const clean = phone.replace(/[^0-9]/g, '')
    const formatted = clean.length === 11 ? `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}` : phone
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(formatted)
      setCopiedPhone(phone)
      showToast('연락처가 복사되었습니다.')
      setTimeout(() => setCopiedPhone(null), 2000)
    }
  }

  // 상담 상태 변경 (접수대기 -> 상담중 -> 상담완료)
  const handleUpdatePrayerStatus = async (prayerId, newStatus) => {
    const statusLabels = {
      consulting: '접수대기',
      in_progress: '상담진행중',
      completed: '상담완료',
    }

    setPrayers((prev) =>
      prev.map((p) =>
        p.id === prayerId || p.db_id === prayerId
          ? { ...p, status: newStatus }
          : p
      )
    )

    if (supabase) {
      try {
        const target = prayers.find((p) => p.id === prayerId || p.db_id === prayerId)
        const dbId = target?.db_id || target?.id
        await supabase
          .from('prayers')
          .update({ status: newStatus })
          .eq('id', dbId)
      } catch (err) {}
    }

    showToast(`상태가 [${statusLabels[newStatus] || newStatus}]로 변경되었습니다.`)
  }

  // 방문 예약 상태 변경
  const handleUpdateVisitStatus = async (visitId, newStatus) => {
    setVisits((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, status: newStatus } : v))
    )

    if (supabase) {
      try {
        await supabase.from('visits').update({ status: newStatus }).eq('id', visitId)
      } catch (e) {}
    }
    showToast('방문 예약 상태가 변경되었습니다.')
  }

  // 현장 신규 신도 등록
  const handleRegisterNewBeliever = async (e) => {
    e.preventDefault()
    if (!newName.trim() || !newPhone.trim()) {
      showToast('이름과 연락처를 입력해 주세요.')
      return
    }

    const cleanPhone = newPhone.replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10) {
      showToast('연락처 11자리를 올바르게 입력해 주세요.')
      return
    }

    const code = cleanPhone.slice(-8)
    const formattedPhone = `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 7)}-${cleanPhone.slice(7)}`

    const newBeliever = {
      code,
      phone: formattedPhone,
      password_pin: code.slice(-4) || '1234',
      name: newName.trim(),
      dharma_name: newDharmaName.trim(),
      birth_date: '',
      lunar_solar: '음력',
      address: '',
      family_memo: newMemo.trim() || '모바일 관리자창 현장 간편 등록',
      role: 'believer',
      parent_code: currentUser?.code || '33065540',
      bank_name: '',
      bank_account: '',
      account_holder: '',
      merit_count: 0,
      believers_count: 0,
      wipae_count: 0,
      extra_data: { registered_via: 'mobile_admin_quick' },
      is_active: true,
      created_at: new Date().toISOString(),
    }

    setMembers((prev) => [newBeliever, ...prev])

    if (supabase) {
      try {
        await supabase.from('members').upsert([newBeliever], { onConflict: 'code' })
      } catch (e) {}
    }

    showToast(`불자 ${newName}님이 정상 등록되었습니다.`)
    setNewName('')
    setNewDharmaName('')
    setNewPhone('')
    setNewMemo('')
    setIsRegisterOpen(false)
  }

  // 데이터 수동 새로고침
  const handleRefresh = async () => {
    if (!supabase) return
    setIsRefreshing(true)
    try {
      const [prayersRes, visitsRes, membersRes] = await Promise.all([
        supabase.from('prayers').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('visits').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('members').select('*').order('created_at', { ascending: false }).limit(300),
      ])

      if (prayersRes.data) setPrayers(prayersRes.data)
      if (visitsRes.data) setVisits(visitsRes.data)
      if (membersRes.data) setMembers(membersRes.data)
      showToast('최신 데이터를 성공적으로 동기화했습니다.')
    } catch (e) {
      showToast('새로고침 중 오류가 발생했습니다.')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F1EA] text-[#2D241C] flex flex-col overflow-hidden font-sans">
      {/* 1. 상단 모바일 관리자 헤더 (밝고 기품 있는 화이트·골드) */}
      <header className="bg-white border-b-2 border-[#E8DEC8] px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4A024] to-[#C59B27] flex items-center justify-center text-xs font-black text-[#1C140A] shadow-xs">
            卍
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-serif-kr font-extrabold text-[#2E2214] tracking-tight">소원사 모바일 관제창</h1>
              <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded-full shadow-xs">LIVE</span>
            </div>
            <p className="text-[11px] text-[#7A6B58] truncate">
              {currentUser?.name || '관리자'} ({currentUser?.role === 'master' ? '총괄대표' : '사찰본부'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="w-8 h-8 rounded-lg bg-[#F8F5EE] hover:bg-[#EFEADF] border border-[#DDD3BF] flex items-center justify-center text-[#5C4D3B] active:scale-95 transition"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C59B27]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-lg bg-[#2E2214] hover:bg-[#3D2E1B] text-[#F5D061] text-xs font-bold flex items-center gap-1 active:scale-95 transition shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>닫기</span>
          </button>
        </div>
      </header>

      {/* 2. 통합 탭 메뉴바 (밝은 배경 & 4분할 일체형 카운터) */}
      <nav className="bg-white border-b border-[#E8DEC8] grid grid-cols-4 shrink-0 shadow-xs">
        {/* 1) 불사·상담 탭 */}
        <button
          type="button"
          onClick={() => setActiveTab('bulsa')}
          className={`py-2 px-1 text-center border-b-2 transition flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'bulsa'
              ? 'border-[#C59B27] bg-[#FAF5EB] text-[#2E2214]'
              : 'border-transparent text-[#7A6B58] hover:bg-[#FAF8F5]'
          }`}
        >
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">불사·상담</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-sm font-black text-[#2E2214]">{bulsaInquiries.length}</span>
            {pendingBulsaCount > 0 && (
              <span className="text-[9.5px] font-extrabold bg-red-600 text-white px-1.5 py-0.2 rounded-full animate-pulse shadow-xs">
                대기 {pendingBulsaCount}
              </span>
            )}
          </div>
        </button>

        {/* 2) 방문·공양 탭 */}
        <button
          type="button"
          onClick={() => setActiveTab('visits')}
          className={`py-2 px-1 text-center border-b-2 transition flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'visits'
              ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-bold'
              : 'border-transparent text-[#7A6B58] hover:bg-[#FAF8F5]'
          }`}
        >
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">방문·공양</span>
          </div>
          <div className="text-sm font-black mt-0.5 text-sky-700">
            {visits.length}건
          </div>
        </button>

        {/* 3) 소원등 탭 */}
        <button
          type="button"
          onClick={() => setActiveTab('lanterns')}
          className={`py-2 px-1 text-center border-b-2 transition flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'lanterns'
              ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-bold'
              : 'border-transparent text-[#7A6B58] hover:bg-[#FAF8F5]'
          }`}
        >
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">소원등</span>
          </div>
          <div className="text-sm font-black mt-0.5 text-amber-800">
            {regularLanterns.length}위
          </div>
        </button>

        {/* 4) 신도조회 탭 */}
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`py-2 px-1 text-center border-b-2 transition flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'members'
              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
              : 'border-transparent text-[#7A6B58] hover:bg-[#FAF8F5]'
          }`}
        >
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">신도조회</span>
          </div>
          <div className="text-sm font-black mt-0.5 text-emerald-800">
            {members.length}명
          </div>
        </button>
      </nav>

      {/* 3. 메인 콘텐츠 스크롤 영역 (밝은 아이보리 배경) */}
      <main className="flex-1 overflow-y-auto p-3 space-y-3 pb-20">
        {/* ============================================================== */}
        {/* 탭 1: 불사·제사·위패 상담 목록 */}
        {/* ============================================================== */}
        {activeTab === 'bulsa' && (
          <div className="space-y-3">
            {/* 상태 필터 바 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setBulsaStatusFilter('all')}
                className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition cursor-pointer ${
                  bulsaStatusFilter === 'all'
                    ? 'bg-[#2E2214] text-[#F5D061] border-[#2E2214] font-bold shadow-xs'
                    : 'bg-white text-[#635341] border-[#DDD3BF] hover:bg-[#F8F5EE]'
                }`}
              >
                전체 ({bulsaInquiries.length})
              </button>
              <button
                type="button"
                onClick={() => setBulsaStatusFilter('consulting')}
                className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition cursor-pointer ${
                  bulsaStatusFilter === 'consulting'
                    ? 'bg-red-600 text-white border-red-600 font-bold shadow-xs'
                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                }`}
              >
                🚨 접수대기 ({bulsaInquiries.filter((p) => p.status === 'consulting').length})
              </button>
              <button
                type="button"
                onClick={() => setBulsaStatusFilter('in_progress')}
                className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition cursor-pointer ${
                  bulsaStatusFilter === 'in_progress'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                상담진행중 ({bulsaInquiries.filter((p) => p.status === 'in_progress').length})
              </button>
              <button
                type="button"
                onClick={() => setBulsaStatusFilter('completed')}
                className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition cursor-pointer ${
                  bulsaStatusFilter === 'completed'
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                상담완료 ({bulsaInquiries.filter((p) => p.status === 'completed').length})
              </button>
            </div>

            {filteredBulsaList.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DCB9] text-[#7A6B58] text-xs space-y-1 shadow-xs">
                <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-600" />
                <p className="font-bold text-[#2E2214]">해당하는 상담 접수건이 없습니다.</p>
                <p className="text-[11px] text-[#8C7D6B]">새로운 상담 신청이 들어오면 실시간으로 카드가 생성됩니다.</p>
              </div>
            ) : (
              filteredBulsaList.map((p) => {
                const phone = p.believer_phone || ''
                const cleanPhone = phone.replace(/[^0-9]/g, '')
                const isPending = p.status === 'consulting' || !p.status
                const isInProgress = p.status === 'in_progress'
                const isDone = p.status === 'completed'

                return (
                  <div
                    key={p.id || p.db_id}
                    className={`rounded-2xl p-4 border transition shadow-sm space-y-3 ${
                      isPending
                        ? 'bg-[#FFFDFB] border-red-300 ring-1 ring-red-100'
                        : isInProgress
                        ? 'bg-white border-amber-300'
                        : 'bg-white border-[#E8DEC8]'
                    }`}
                  >
                    {/* 상단: 신청자 실명 & 종목 배지 & 상태 */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-base font-black text-[#1F1710]">
                            {p.believer_name || '신청 불자'}
                          </span>
                          <span className="text-[11px] text-[#8C7D6B] font-mono">
                            #{p.member_code || cleanPhone.slice(-8) || '-'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF3DF] text-[#8A6510] border border-[#E5D399]">
                            {p.wish_category || '불사상담'}
                          </span>
                          {p.created_at && (
                            <span className="text-[10.5px] text-[#8C7D6B] flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-[#A89885]" />
                              {new Date(p.created_at).toLocaleDateString('ko-KR', {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 상태 배지 */}
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 border ${
                          isPending
                            ? 'bg-red-600 text-white border-red-600 animate-pulse shadow-xs'
                            : isInProgress
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                        }`}
                      >
                        {isPending ? '🚨 접수대기' : isInProgress ? '상담진행중' : '✓ 상담완료'}
                      </span>
                    </div>

                    {/* 발원 및 상담 메모 전문 (밝고 선명한 크림 박스) */}
                    <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#EBE1CD] space-y-1">
                      <p className="text-xs text-[#3D3328] leading-relaxed whitespace-pre-line break-keep font-serif-kr font-medium">
                        {p.wish_text || '발원문 메모가 없습니다.'}
                      </p>
                    </div>

                    {/* 원터치 액션 버튼 바 (전화걸기, 문자하기, 번호복사) */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#EFE8DA]">
                      <a
                        href={cleanPhone ? `tel:${cleanPhone}` : '#'}
                        className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition ${
                          cleanPhone
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                            : 'bg-[#EEE8DB] text-[#9E907E] pointer-events-none'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>전화걸기</span>
                      </a>

                      <a
                        href={
                          cleanPhone
                            ? `sms:${cleanPhone}?body=${encodeURIComponent(
                                `[제주 소원사 종무소]\n${p.believer_name} 불자님, 접수해 주신 [${p.wish_category}] 관련하여 안내차 연락드렸습니다.`
                              )}`
                            : '#'
                        }
                        className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition ${
                          cleanPhone
                            ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                            : 'bg-[#EEE8DB] text-[#9E907E] pointer-events-none'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>문자하기</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyPhone(phone)}
                        className="py-2.5 rounded-xl bg-white hover:bg-[#F8F5ED] text-[#4A3D2D] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition border border-[#D5C9B3] shadow-xs cursor-pointer"
                      >
                        {copiedPhone === phone ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">복사됨!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#7A6B58]" />
                            <span>번호복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 상태 변경 버튼 바 */}
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-[#F0ECE1]">
                      <span className="text-[11px] font-medium text-[#7A6B58]">진행 상태 변경:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdatePrayerStatus(p.id, 'consulting')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition cursor-pointer ${
                            isPending
                              ? 'bg-red-600 text-white border-red-600 shadow-xs'
                              : 'bg-[#F4F0E6] text-[#695B49] border-[#DDD3BF] hover:bg-white'
                          }`}
                        >
                          대기
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdatePrayerStatus(p.id, 'in_progress')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition cursor-pointer ${
                            isInProgress
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-[#F4F0E6] text-[#695B49] border-[#DDD3BF] hover:bg-white'
                          }`}
                        >
                          상담중
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdatePrayerStatus(p.id, 'completed')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-[#F4F0E6] text-[#695B49] border-[#DDD3BF] hover:bg-white'
                          }`}
                        >
                          완료
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 탭 2: 도량 방문 & 공양 예약 목록 */}
        {/* ============================================================== */}
        {activeTab === 'visits' && (
          <div className="space-y-3">
            {visits.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DCB9] text-[#7A6B58] text-xs space-y-1 shadow-xs">
                <Calendar className="w-7 h-7 mx-auto text-sky-600" />
                <p className="font-bold text-[#2E2214]">등록된 도량 방문 예약이 없습니다.</p>
              </div>
            ) : (
              visits.map((v) => {
                const phone = v.visitor_phone || ''
                const cleanPhone = phone.replace(/[^0-9]/g, '')

                return (
                  <div
                    key={v.id}
                    className="rounded-2xl p-4 bg-white border border-[#D5E2F0] space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black text-[#152336]">
                            {v.visitor_name || '방문자'}
                          </span>
                          <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                            총 {v.headcount || 1}명
                          </span>
                        </div>
                        <div className="text-xs text-sky-900 font-bold mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-sky-600" />
                          <span>{v.visit_date} {v.visit_time}</span>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-300">
                        {v.visit_purpose || '도량참배'}
                      </span>
                    </div>

                    {v.memo && (
                      <div className="p-3 rounded-xl bg-[#F4F8FC] border border-[#DDE7F2] text-xs text-[#2A3B4E] font-serif-kr">
                        “{v.memo}”
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E8EEF5]">
                      <a
                        href={cleanPhone ? `tel:${cleanPhone}` : '#'}
                        className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>통화연결</span>
                      </a>

                      <a
                        href={
                          cleanPhone
                            ? `sms:${cleanPhone}?body=${encodeURIComponent(
                                `[제주 소원사]\n${v.visitor_name} 불자님, ${v.visit_date} ${v.visit_time} 방문 및 공양 예약 확인차 연락드렸습니다.`
                              )}`
                            : '#'
                        }
                        className="py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>문자보내기</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyPhone(phone)}
                        className="py-2.5 rounded-xl bg-white text-[#334659] text-xs font-bold flex items-center justify-center gap-1.5 border border-[#CFDAE6] hover:bg-[#F5F8FB] shadow-xs cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#5D738A]" />
                        <span>번호복사</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#F0F4F8] text-[#5D738A]">
                      <span>예약 관리:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateVisitStatus(v.id, 'confirmed')}
                          className="px-2.5 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 font-bold cursor-pointer"
                        >
                          예약확정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateVisitStatus(v.id, 'completed')}
                          className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold cursor-pointer"
                        >
                          방문완료
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateVisitStatus(v.id, 'cancelled')}
                          className="px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 cursor-pointer"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 탭 3: 실시간 대웅전 소원등 명부 */}
        {/* ============================================================== */}
        {activeTab === 'lanterns' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-white border border-[#E8DEC8] flex items-center justify-between text-xs shadow-xs">
              <span className="font-bold text-[#8A6510]">오늘 대웅전 사시예불 축원 명부</span>
              <span className="text-[11px] font-bold text-[#5C4D3B]">총 {regularLanterns.length}위</span>
            </div>

            {regularLanterns.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DCB9] text-[#7A6B58] text-xs space-y-1 shadow-xs">
                <Flame className="w-7 h-7 mx-auto text-amber-600" />
                <p className="font-bold text-[#2E2214]">등록된 1일 소원등이 없습니다.</p>
              </div>
            ) : (
              regularLanterns.map((p) => {
                const phone = p.believer_phone || ''
                const cleanPhone = phone.replace(/[^0-9]/g, '')
                return (
                  <div
                    key={p.id || p.db_id}
                    className="rounded-2xl p-3.5 bg-white border border-[#E8DEC8] space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#2E2214] truncate">
                        🕯️ {p.believer_name}
                      </span>
                      <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF3DF] text-[#8A6510] border border-[#E5D399] shrink-0">
                        {p.wish_category || '가족건강'}
                      </span>
                    </div>

                    <p className="text-xs text-[#524436] line-clamp-2 font-serif-kr leading-relaxed">
                      “{p.wish_text}”
                    </p>

                    <div className="flex items-center justify-between pt-1.5 border-t border-[#F0ECE1] text-[11px] text-[#7A6B58]">
                      <span>{p.prayed_at || '사시예불 축원 배정'}</span>
                      {cleanPhone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          className="text-[#8A6510] hover:underline flex items-center gap-1 font-bold"
                        >
                          <Phone className="w-3 h-3 inline text-emerald-600" />
                          통화하기
                        </a>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 탭 4: 신도 빠른 검색 & 간편 등록 */}
        {/* ============================================================== */}
        {activeTab === 'members' && (
          <div className="space-y-3">
            {/* 상단 검색창 및 신규등록 버튼 */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7D6B]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="신도 성함, 법명, 번호 뒷자리 검색..."
                  className="w-full bg-white border border-[#DDD3BF] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#2E2214] placeholder-[#9E907E] focus:outline-none focus:border-[#C59B27] shadow-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A024] to-[#C59B27] hover:brightness-105 text-[#1C140A] text-xs font-bold flex items-center gap-1 active:scale-95 transition shadow-xs whitespace-nowrap cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>간편등록</span>
              </button>
            </div>

            {/* 신도 목록 */}
            <div className="space-y-2">
              {searchedMembers.map((m) => {
                const phone = m.phone || ''
                const cleanPhone = phone.replace(/[^0-9]/g, '')
                return (
                  <div
                    key={m.code || m.id}
                    className="p-3.5 rounded-xl bg-white border border-[#E8DEC8] flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-[#2E2214]">{m.name}</span>
                        {m.dharma_name && (
                          <span className="text-[10.5px] font-bold text-[#8A6510] bg-[#FAF3DF] px-1.5 py-0.2 rounded border border-[#E5D399]">
                            {m.dharma_name}
                          </span>
                        )}
                        <span className="text-[10.5px] text-[#8C7D6B] font-mono">#{m.code}</span>
                      </div>
                      <p className="text-xs text-[#524436] font-medium mt-0.5">{phone}</p>
                      {m.family_memo && (
                        <p className="text-[11px] text-[#7A6B58] line-clamp-1 mt-0.5">
                          {m.family_memo}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {cleanPhone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center active:scale-95 transition shadow-xs"
                          title="전화걸기"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(phone)}
                        className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#5C4D3B] hover:bg-[#EFE9DB] flex items-center justify-center border border-[#DDD3BF] shadow-xs cursor-pointer"
                        title="번호복사"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* 4. 현장 신규 신도 간편 등록 바텀시트 모달 */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full sm:max-w-md bg-white border-t sm:border border-[#E5DCB9] rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
              <h3 className="text-sm font-serif-kr font-bold text-[#2E2214] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#C59B27]" />
                현장 신규 신도 간편 등록
              </h3>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="text-[#7A6B58] hover:text-[#2E2214] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewBeliever} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#524436] font-bold mb-1">성함 (실명) *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full bg-[#FAF8F5] border border-[#DDD3BF] rounded-xl px-3 py-2.5 text-[#2E2214] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#524436] font-bold mb-1">법명 (선택)</label>
                <input
                  type="text"
                  value={newDharmaName}
                  onChange={(e) => setNewDharmaName(e.target.value)}
                  placeholder="예: 보현행"
                  className="w-full bg-[#FAF8F5] border border-[#DDD3BF] rounded-xl px-3 py-2.5 text-[#2E2214] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#524436] font-bold mb-1">연락처 *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full bg-[#FAF8F5] border border-[#DDD3BF] rounded-xl px-3 py-2.5 text-[#2E2214] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#524436] font-bold mb-1">메모 (가족관계, 희망기도 등)</label>
                <input
                  type="text"
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  placeholder="예: 도량 현장 방문 신도, 자녀 시험 기도 희망"
                  className="w-full bg-[#FAF8F5] border border-[#DDD3BF] rounded-xl px-3 py-2.5 text-[#2E2214] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#F0ECE1] text-[#695B49] font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A024] to-[#C59B27] hover:brightness-105 text-[#1C140A] font-bold shadow-md active:scale-95 transition cursor-pointer"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
