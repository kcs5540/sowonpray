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
  ChevronRight,
  User,
  Users,
  Clock,
  Filter,
  CheckCircle2,
  Sparkles,
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
    <div className="fixed inset-0 z-50 bg-[#16120E] text-[#EDE6D6] flex flex-col overflow-hidden font-sans">
      {/* 1. 상단 모바일 관리자 헤더 */}
      <header className="bg-[#241C15] border-b border-[#3D3023] px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4A024] to-[#8C6D1F] flex items-center justify-center text-xs font-black text-[#1C140A] shadow-sm">
            卍
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-[#F5D061] tracking-tight">소원사 모바일 관제창</h1>
              <span className="text-[10px] bg-red-600/80 text-white font-bold px-1.5 py-0.2 rounded-full">LIVE</span>
            </div>
            <p className="text-[10.5px] text-[#A6957E] truncate">
              {currentUser?.name || '관리자'} ({currentUser?.role === 'master' ? '총괄대표' : '사찰본부'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="w-8 h-8 rounded-lg bg-[#33271D] hover:bg-[#423326] flex items-center justify-center text-[#D8C6A5] active:scale-95 transition"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#F5D061]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-lg bg-[#3D2918] hover:bg-[#4E351F] text-[#F5D061] text-xs font-bold flex items-center gap-1 active:scale-95 transition border border-[#6B4E1B]"
          >
            <X className="w-3.5 h-3.5" />
            <span>닫기</span>
          </button>
        </div>
      </header>

      {/* 2. 상단 실시간 카운터 요약 바 (한눈에 보기) */}
      <div className="bg-[#1F1812] px-3 py-2 border-b border-[#33271D] grid grid-cols-4 gap-1.5 text-center shrink-0">
        <button
          type="button"
          onClick={() => { setActiveTab('bulsa'); setBulsaStatusFilter('consulting'); }}
          className={`p-1.5 rounded-lg border transition ${
            activeTab === 'bulsa' && bulsaStatusFilter === 'consulting'
              ? 'bg-red-950/60 border-red-500/80'
              : 'bg-[#291F17] border-[#3D3023]'
          }`}
        >
          <div className="text-[10px] text-[#A89885] flex items-center justify-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            상담대기
          </div>
          <div className="text-base font-extrabold text-red-400 mt-0.5">
            {bulsaInquiries.filter((p) => p.status === 'consulting').length}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bulsa')}
          className={`p-1.5 rounded-lg border transition ${
            activeTab === 'bulsa' && bulsaStatusFilter === 'all'
              ? 'bg-[#3D2E1F] border-[#C59B27]'
              : 'bg-[#291F17] border-[#3D3023]'
          }`}
        >
          <div className="text-[10px] text-[#A89885]">불사·제사</div>
          <div className="text-base font-extrabold text-[#F5D061] mt-0.5">{bulsaInquiries.length}</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('visits')}
          className={`p-1.5 rounded-lg border transition ${
            activeTab === 'visits' ? 'bg-[#1F2F3D] border-sky-500' : 'bg-[#291F17] border-[#3D3023]'
          }`}
        >
          <div className="text-[10px] text-[#A89885]">방문예약</div>
          <div className="text-base font-extrabold text-sky-400 mt-0.5">{visits.length}</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lanterns')}
          className={`p-1.5 rounded-lg border transition ${
            activeTab === 'lanterns' ? 'bg-[#3D2E1F] border-[#C59B27]' : 'bg-[#291F17] border-[#3D3023]'
          }`}
        >
          <div className="text-[10px] text-[#A89885]">소원등</div>
          <div className="text-base font-extrabold text-amber-300 mt-0.5">{regularLanterns.length}</div>
        </button>
      </div>

      {/* 3. 모바일 전산 탭 메뉴바 */}
      <nav className="bg-[#241C15] border-b border-[#3D3023] flex text-xs font-bold shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('bulsa')}
          className={`flex-1 py-2.5 text-center border-b-2 transition flex items-center justify-center gap-1 ${
            activeTab === 'bulsa'
              ? 'border-[#F5D061] text-[#F5D061] bg-[#2E2319]'
              : 'border-transparent text-[#9E8D76] hover:text-[#D1C3AF]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          <span>불사·상담 ({bulsaInquiries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('visits')}
          className={`flex-1 py-2.5 text-center border-b-2 transition flex items-center justify-center gap-1 ${
            activeTab === 'visits'
              ? 'border-sky-400 text-sky-400 bg-[#1E252E]'
              : 'border-transparent text-[#9E8D76] hover:text-[#D1C3AF]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>방문·공양 ({visits.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lanterns')}
          className={`flex-1 py-2.5 text-center border-b-2 transition flex items-center justify-center gap-1 ${
            activeTab === 'lanterns'
              ? 'border-amber-400 text-amber-400 bg-[#2E2319]'
              : 'border-transparent text-[#9E8D76] hover:text-[#D1C3AF]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>소원등 ({regularLanterns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-2.5 text-center border-b-2 transition flex items-center justify-center gap-1 ${
            activeTab === 'members'
              ? 'border-emerald-400 text-emerald-400 bg-[#1E2E24]'
              : 'border-transparent text-[#9E8D76] hover:text-[#D1C3AF]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>신도조회</span>
        </button>
      </nav>

      {/* 4. 메인 콘텐츠 스크롤 영역 */}
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
                className={`px-2.5 py-1 rounded-full border whitespace-nowrap font-medium transition ${
                  bulsaStatusFilter === 'all'
                    ? 'bg-[#F5D061] text-[#1C140A] border-[#F5D061] font-bold'
                    : 'bg-[#241C15] text-[#A6957E] border-[#3D3023]'
                }`}
              >
                전체 ({bulsaInquiries.length})
              </button>
              <button
                type="button"
                onClick={() => setBulsaStatusFilter('consulting')}
                className={`px-2.5 py-1 rounded-full border whitespace-nowrap font-medium transition ${
                  bulsaStatusFilter === 'consulting'
                    ? 'bg-red-600 text-white border-red-500 font-bold'
                    : 'bg-[#241C15] text-red-300 border-red-900/40'
                }`}
              >
                🚨 접수대기 ({bulsaInquiries.filter((p) => p.status === 'consulting').length})
              </button>
              <button
                type="button"
                onClick={() => setBulsaStatusFilter('in_progress')}
                className={`px-2.5 py-1 rounded-full border whitespace-nowrap font-medium transition ${
                  bulsaStatusFilter === 'in_progress'
                    ? 'bg-amber-600 text-white border-amber-500 font-bold'
                    : 'bg-[#241C15] text-amber-300 border-amber-900/40'
                }`}
              >
                상담진행중 ({bulsaInquiries.filter((p) => p.status === 'in_progress').length})
              </button>
              <button
                type="button"
                onClick={() => setBulsaStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-full border whitespace-nowrap font-medium transition ${
                  bulsaStatusFilter === 'completed'
                    ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                    : 'bg-[#241C15] text-emerald-300 border-emerald-900/40'
                }`}
              >
                상담완료 ({bulsaInquiries.filter((p) => p.status === 'completed').length})
              </button>
            </div>

            {filteredBulsaList.length === 0 ? (
              <div className="p-8 text-center bg-[#211A13] rounded-2xl border border-[#33271D] text-[#8C7D6B] text-xs space-y-1">
                <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-600/70" />
                <p className="font-bold text-[#C7B59D]">해당하는 상담 접수건이 없습니다.</p>
                <p className="text-[11px]">새로운 상담 신청이 들어오면 실시간으로 카드가 생성됩니다.</p>
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
                    className={`rounded-2xl p-3.5 border transition shadow-sm space-y-2.5 ${
                      isPending
                        ? 'bg-[#271714] border-red-700/60 shadow-red-950/30'
                        : isInProgress
                        ? 'bg-[#271E14] border-amber-600/50'
                        : 'bg-[#1F1913] border-[#382C1E]'
                    }`}
                  >
                    {/* 상단: 신청자 실명 & 종목 배지 & 상태 */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-extrabold text-[#F7E7C4]">
                            {p.believer_name || '신청 불자'}
                          </span>
                          <span className="text-[10px] text-[#A6957E] font-mono">
                            #{p.member_code || cleanPhone.slice(-8) || '-'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#3D2916] text-[#F5D061] border border-[#6B4E1B]">
                            {p.wish_category || '불사상담'}
                          </span>
                          {p.created_at && (
                            <span className="text-[10px] text-[#8C7D6B] flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
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
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 border ${
                          isPending
                            ? 'bg-red-950 text-red-300 border-red-600/80 animate-pulse'
                            : isInProgress
                            ? 'bg-amber-950 text-amber-300 border-amber-600/80'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-600/80'
                        }`}
                      >
                        {isPending ? '🚨 접수대기' : isInProgress ? '상담진행중' : '✓ 상담완료'}
                      </span>
                    </div>

                    {/* 발원 및 상담 메모 전문 */}
                    <div className="p-2.5 rounded-xl bg-[#140F0A] border border-[#2D2217] space-y-1">
                      <p className="text-xs text-[#E5D7C0] leading-relaxed whitespace-pre-line break-keep font-serif-kr">
                        {p.wish_text || '발원문 메모가 없습니다.'}
                      </p>
                    </div>

                    {/* 원터치 액션 버튼 바 (전화걸기, 문자하기, 번호복사) */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#382C1E]/80">
                      <a
                        href={cleanPhone ? `tel:${cleanPhone}` : '#'}
                        className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition ${
                          cleanPhone
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                            : 'bg-[#291F17] text-[#6B5E4F] pointer-events-none'
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
                        className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition ${
                          cleanPhone
                            ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer'
                            : 'bg-[#291F17] text-[#6B5E4F] pointer-events-none'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>문자하기</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyPhone(phone)}
                        className="py-2 rounded-xl bg-[#33261A] hover:bg-[#423223] text-[#D8C6A5] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition border border-[#4D3A27]"
                      >
                        {copiedPhone === phone ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">복사됨!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>번호복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 상태 변경 버튼 바 */}
                    <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-[#291E15]">
                      <span className="text-[10.5px] text-[#8C7D6B]">진행 상태 변경:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdatePrayerStatus(p.id, 'consulting')}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold border transition ${
                            isPending
                              ? 'bg-red-900/60 text-red-200 border-red-500'
                              : 'bg-[#1F1812] text-[#8C7D6B] border-[#382C1E]'
                          }`}
                        >
                          대기
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdatePrayerStatus(p.id, 'in_progress')}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold border transition ${
                            isInProgress
                              ? 'bg-amber-900/60 text-amber-200 border-amber-500'
                              : 'bg-[#1F1812] text-[#8C7D6B] border-[#382C1E]'
                          }`}
                        >
                          상담중
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdatePrayerStatus(p.id, 'completed')}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold border transition ${
                            isDone
                              ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500'
                              : 'bg-[#1F1812] text-[#8C7D6B] border-[#382C1E]'
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
              <div className="p-8 text-center bg-[#211A13] rounded-2xl border border-[#33271D] text-[#8C7D6B] text-xs space-y-1">
                <Calendar className="w-7 h-7 mx-auto text-sky-500/60" />
                <p className="font-bold text-[#C7B59D]">등록된 도량 방문 예약이 없습니다.</p>
              </div>
            ) : (
              visits.map((v) => {
                const phone = v.visitor_phone || ''
                const cleanPhone = phone.replace(/[^0-9]/g, '')
                const isConfirmed = v.status === 'confirmed' || v.status === 'reserved'

                return (
                  <div
                    key={v.id}
                    className="rounded-2xl p-3.5 bg-[#1B222B] border border-[#2B3A4A] space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-extrabold text-[#DCE8F5]">
                            {v.visitor_name || '방문자'}
                          </span>
                          <span className="text-[11px] font-bold text-sky-400 bg-sky-950/70 px-2 py-0.5 rounded-full border border-sky-800/60">
                            총 {v.headcount || 1}명
                          </span>
                        </div>
                        <div className="text-xs text-sky-200/90 font-bold mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-sky-400" />
                          <span>{v.visit_date} {v.visit_time}</span>
                        </div>
                      </div>

                      <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-sky-950 text-sky-300 border border-sky-600/70">
                        {v.visit_purpose || '도량참배'}
                      </span>
                    </div>

                    {v.memo && (
                      <div className="p-2.5 rounded-xl bg-[#11161D] border border-[#232F3D] text-xs text-[#CBD8E5] font-serif-kr">
                        “{v.memo}”
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#2B3A4A]">
                      <a
                        href={cleanPhone ? `tel:${cleanPhone}` : '#'}
                        className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
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
                        className="py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>문자보내기</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyPhone(phone)}
                        className="py-2 rounded-xl bg-[#232E3A] text-[#C2D3E5] text-xs font-bold flex items-center justify-center gap-1.5 border border-[#3A4B5E]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>번호복사</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] pt-1 text-[#869BB3]">
                      <span>예약 관리:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateVisitStatus(v.id, 'confirmed')}
                          className="px-2 py-0.5 rounded bg-sky-950 text-sky-200 border border-sky-700/60 font-bold"
                        >
                          예약확정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateVisitStatus(v.id, 'completed')}
                          className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-200 border border-emerald-700/60 font-bold"
                        >
                          방문완료
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateVisitStatus(v.id, 'cancelled')}
                          className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-700"
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
            <div className="p-3 rounded-xl bg-[#241C15] border border-[#3D3023] flex items-center justify-between text-xs">
              <span className="font-bold text-[#F5D061]">오늘 대웅전 사시예불 축원 명부</span>
              <span className="text-[11px] text-[#A6957E]">총 {regularLanterns.length}위</span>
            </div>

            {regularLanterns.length === 0 ? (
              <div className="p-8 text-center bg-[#211A13] rounded-2xl border border-[#33271D] text-[#8C7D6B] text-xs space-y-1">
                <Flame className="w-7 h-7 mx-auto text-amber-500/60" />
                <p className="font-bold text-[#C7B59D]">등록된 1일 소원등이 없습니다.</p>
              </div>
            ) : (
              regularLanterns.map((p) => {
                const phone = p.believer_phone || ''
                const cleanPhone = phone.replace(/[^0-9]/g, '')
                return (
                  <div
                    key={p.id || p.db_id}
                    className="rounded-2xl p-3 bg-[#1F1913] border border-[#382C1E] space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#F5E6CC] truncate">
                        🕯️ {p.believer_name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3D2916] text-[#F5D061] border border-[#6B4E1B] shrink-0">
                        {p.wish_category || '가족건강'}
                      </span>
                    </div>

                    <p className="text-xs text-[#B8A78F] line-clamp-2 font-serif-kr">
                      “{p.wish_text}”
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#291E15] text-[10.5px] text-[#8C7D6B]">
                      <span>{p.prayed_at || '사시예불 축원 배정'}</span>
                      {cleanPhone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          className="text-[#D4A024] hover:underline flex items-center gap-0.5 font-bold"
                        >
                          <Phone className="w-3 h-3 inline" />
                          통화
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
                  className="w-full bg-[#241C15] border border-[#3D3023] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5E6CC] placeholder-[#736352] focus:outline-none focus:border-[#C59B27]"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#D4A024] to-[#C59B27] text-[#1C140A] text-xs font-bold flex items-center gap-1 active:scale-95 transition shadow-sm whitespace-nowrap"
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
                    className="p-3 rounded-xl bg-[#1F1913] border border-[#382C1E] flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#F7E7C4]">{m.name}</span>
                        {m.dharma_name && (
                          <span className="text-[10px] text-[#F5D061] bg-[#3D2916] px-1.5 py-0.2 rounded border border-[#6B4E1B]">
                            {m.dharma_name}
                          </span>
                        )}
                        <span className="text-[10px] text-[#8C7D6B] font-mono">#{m.code}</span>
                      </div>
                      <p className="text-[11px] text-[#A89885] mt-0.5">{phone}</p>
                      {m.family_memo && (
                        <p className="text-[10.5px] text-[#7A6B59] line-clamp-1 mt-0.5">
                          {m.family_memo}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {cleanPhone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          className="w-8 h-8 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white flex items-center justify-center active:scale-95 transition"
                          title="전화걸기"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(phone)}
                        className="w-8 h-8 rounded-lg bg-[#33261A] text-[#D8C6A5] flex items-center justify-center border border-[#4D3A27]"
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

      {/* 5. 현장 신규 신도 간편 등록 바텀시트 모달 */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full sm:max-w-md bg-[#241C15] border-t sm:border border-[#3D3023] rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3D3023] pb-3">
              <h3 className="text-sm font-bold text-[#F5D061] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                현장 신규 신도 간편 등록
              </h3>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="text-[#8C7D6B] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewBeliever} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A6957E] font-medium mb-1">성함 (실명) *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full bg-[#1A140F] border border-[#3D3023] rounded-xl px-3 py-2.5 text-[#F5E6CC] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A6957E] font-medium mb-1">법명 (선택)</label>
                <input
                  type="text"
                  value={newDharmaName}
                  onChange={(e) => setNewDharmaName(e.target.value)}
                  placeholder="예: 보현행"
                  className="w-full bg-[#1A140F] border border-[#3D3023] rounded-xl px-3 py-2.5 text-[#F5E6CC] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A6957E] font-medium mb-1">연락처 *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full bg-[#1A140F] border border-[#3D3023] rounded-xl px-3 py-2.5 text-[#F5E6CC] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A6957E] font-medium mb-1">메모 (가족관계, 희망기도 등)</label>
                <input
                  type="text"
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  placeholder="예: 도량 현장 방문 신도, 자녀 시험 기도 희망"
                  className="w-full bg-[#1A140F] border border-[#3D3023] rounded-xl px-3 py-2.5 text-[#F5E6CC] focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#33261A] text-[#A6957E] font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A024] to-[#C59B27] text-[#1C140A] font-bold shadow-md active:scale-95 transition"
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
