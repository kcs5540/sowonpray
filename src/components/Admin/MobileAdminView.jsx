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
  activeSasiPrayers = [],
  visits = [],
  setVisits,
  supabase,
  onClose,
  showToast = () => {},
}) {
  const [activeTab, setActiveTab] = useState('bulsa') // 'bulsa' | 'visits' | 'lanterns' | 'members'
  const [bulsaStatusFilter, setBulsaStatusFilter] = useState('all') // 'all' | 'consulting' | 'in_progress' | 'completed'
  const [visitDateFilter, setVisitDateFilter] = useState('all') // 'all' | 'today' | 'tomorrow' | 'afterTomorrow' | 'geulpi'
  const [lanternFilter, setLanternFilter] = useState('all') // 'all' | 'today'
  const [memberSort, setMemberSort] = useState('recent') // 'recent' | 'name' | 'family' | 'merit'
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

  // 도량 방문 예약 날짜 키 계산 (오늘, 내일, 모레, 글피)
  const visitDateKeys = useMemo(() => {
    const formatDate = (d) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const date = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${date}`
    }
    const now = new Date()
    const d0 = new Date(now)
    const d1 = new Date(now); d1.setDate(d1.getDate() + 1)
    const d2 = new Date(now); d2.setDate(d2.getDate() + 2)
    const d3 = new Date(now); d3.setDate(d3.getDate() + 3)

    return {
      today: formatDate(d0),
      tomorrow: formatDate(d1),
      afterTomorrow: formatDate(d2),
      geulpi: formatDate(d3),
    }
  }, [])

  // 일자별 방문 예약 그룹화
  const visitGroups = useMemo(() => {
    const todayList = []
    const tomorrowList = []
    const afterTomorrowList = []
    const geulpiList = []
    const pastList = []

    ;(visits || []).forEach((v) => {
      const vDate = String(v.visit_date || '').trim()
      if (vDate === visitDateKeys.today) {
        todayList.push(v)
      } else if (vDate === visitDateKeys.tomorrow) {
        tomorrowList.push(v)
      } else if (vDate === visitDateKeys.afterTomorrow) {
        afterTomorrowList.push(v)
      } else if (vDate >= visitDateKeys.geulpi) {
        geulpiList.push(v)
      } else if (vDate < visitDateKeys.today) {
        pastList.push(v)
      } else {
        todayList.push(v)
      }
    })

    return {
      today: todayList,
      tomorrow: tomorrowList,
      afterTomorrow: afterTomorrowList,
      geulpi: geulpiList,
      past: pastList,
    }
  }, [visits, visitDateKeys])

  // 현재 선택된 일자의 방문 예약 목록
  const currentVisits = useMemo(() => {
    if (visitDateFilter === 'today') return visitGroups.today
    if (visitDateFilter === 'tomorrow') return visitGroups.tomorrow
    if (visitDateFilter === 'afterTomorrow') return visitGroups.afterTomorrow
    if (visitDateFilter === 'geulpi') return visitGroups.geulpi
    return visits
  }, [visitDateFilter, visitGroups, visits])

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

  // 오늘 축원 대상 1일 소원등 선별 (인등 중복 배제 및 동일 불자님 중복 신청 정밀 디둡)
  const todayLanterns = useMemo(() => {
    const now = Date.now()
    const seen = new Set()
    const list = []

    regularLanterns.forEach((p) => {
      let pTime = now
      if (p.created_at) {
        const parsed = new Date(p.created_at).getTime()
        if (!isNaN(parsed)) pTime = parsed
      }
      const diffMs = Math.max(0, now - pTime)
      // 당일 및 최근 48시간 이내 접수된 유효 1일 소원등
      if (diffMs <= 48 * 60 * 60 * 1000) {
        // 동일 불자님(이름+전화번호+발원분야) 중복 카드 단일화
        const key = `${p.believer_name}_${(p.believer_phone || '').replace(/[^0-9]/g, '')}_${p.wish_category}`
        if (!seen.has(key)) {
          seen.add(key)
          list.push(p)
        }
      }
    })

    return list
  }, [regularLanterns])

  // 현재 필터링된 소원등 목록
  const currentLanterns = useMemo(() => {
    if (lanternFilter === 'today') return todayLanterns
    return regularLanterns
  }, [lanternFilter, todayLanterns, regularLanterns])

  // 3. 신도 검색 및 다각도 정렬 목록 (최근등록순 / 이름순 / 가족많은순 / 정진공덕순)
  const sortedAndSearchedMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    const cleanQ = q.replace(/[^0-9]/g, '')

    // 1) 검색 필터링
    let list = (members || []).filter((m) => {
      if (!q) return true
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

    // 2) 정렬 기준 적용
    return [...list].sort((a, b) => {
      if (memberSort === 'name') {
        return String(a.name || '').localeCompare(String(b.name || ''), 'ko')
      }
      if (memberSort === 'family') {
        const famA = Number(a.believers_count) || (a.family_memo ? 2 : 1)
        const famB = Number(b.believers_count) || (b.family_memo ? 2 : 1)
        return famB - famA
      }
      if (memberSort === 'merit') {
        const meritA = Number(a.merit_count) || 0
        const meritB = Number(b.merit_count) || 0
        return meritB - meritA
      }
      // 'recent' (최근 등록일시 최신순)
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
      return timeB - timeA
    })
  }, [members, searchTerm, memberSort])

  // 방문 목적 텍스트를 한눈에 들어오게 간결하게 정돈
  const formatVisitPurpose = (purpose) => {
    const p = String(purpose || '')
    if (p.includes('공양') || p.includes('식사') || p.includes('차')) return '차담 & 점심공양'
    if (p.includes('상담') || p.includes('스님')) return '스님 차담상담'
    if (p.includes('참배')) return '도량 참배'
    return p || '도량 방문'
  }

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
      {/* 1. 상단 모바일 관리자 헤더 (제주 소원사 모바일 법당 정통 다크골드 헤더 스타일) */}
      <header className="sticky top-0 z-40 bg-[#1B1815]/95 backdrop-blur-md text-[#FAF8F5] px-3.5 py-3 border-b-2 border-[#C59B27]/50 flex items-center justify-between gap-2 shadow-md shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D241C] via-[#221C16] to-[#17130F] flex items-center justify-center shadow-[0_0_15px_rgba(245,208,97,0.35)] border border-[#C59B27]/60 p-1 shrink-0" title="제주 소원사 공식 심볼 (황금 연꽃)">
            <svg className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M20 5C20 5 15 14.5 15 21C15 23.8 17.2 26 20 26C22.8 26 25 23.8 25 21C25 14.5 20 5 20 5Z" fill="url(#adminHeaderGoldLotusGrad)" opacity="0.95" />
              <path d="M14 12C14 12 7.5 18.5 7.5 23C7.5 26.2 10.2 28 13.2 28C16.2 28 17.8 25.5 17.8 24C17.8 18.5 14 12 14 12Z" fill="url(#adminHeaderGoldLotusGrad)" opacity="0.82" />
              <path d="M26 12C26 12 32.5 18.5 32.5 23C32.5 26.2 29.8 28 26.8 28C23.8 28 22.2 25.5 22.2 24C22.2 18.5 26 12 26 12Z" fill="url(#adminHeaderGoldLotusGrad)" opacity="0.82" />
              <path d="M6.5 22.5C6.5 22.5 2.5 26 2.5 29C2.5 31.2 4.5 33 7.8 33C11.8 33 14.8 29.8 14.8 28C14.8 25.2 6.5 22.5 6.5 22.5Z" fill="url(#adminHeaderGoldLotusGrad)" opacity="0.65" />
              <path d="M33.5 22.5C33.5 22.5 37.5 26 37.5 29C37.5 31.2 35.5 33 32.2 33C28.2 33 25.2 29.8 25.2 28C25.2 25.2 33.5 22.5 33.5 22.5Z" fill="url(#adminHeaderGoldLotusGrad)" opacity="0.65" />
              <path d="M11.5 32C15.2 34.8 24.8 34.8 28.5 32C26.5 34.8 23.5 35.8 20 35.8C16.5 35.8 13.5 34.8 11.5 32Z" fill="url(#adminHeaderGoldLotusGrad)" />
              <defs>
                <linearGradient id="adminHeaderGoldLotusGrad" x1="5" y1="5" x2="35" y2="35" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FDE68A" />
                  <stop offset="0.5" stopColor="#F5D061" />
                  <stop offset="1" stopColor="#B6861C" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-serif-kr font-extrabold text-base sm:text-lg tracking-tight text-[#F5D061] whitespace-nowrap">
                모바일 관제 센터
              </span>
            </div>
            <p className="text-[10.5px] text-[#D6CEC2] truncate">
              {currentUser?.name || '김철수'} ({currentUser?.role === 'master' ? '총괄대표' : '사찰본부'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2A2520] hover:bg-[#38312A] border border-[#C59B27]/40 text-[#F5D061] transition shadow-xs active:scale-95 cursor-pointer"
            title="실시간 장부 새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#F5D061] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#2A2520] hover:bg-[#38312A] border border-[#C59B27]/50 text-[#F5D061] text-[11px] font-bold whitespace-nowrap transition shadow-xs active:scale-95 cursor-pointer"
            title="관제창 닫기"
          >
            <X className="w-3.5 h-3.5 text-[#F5D061]" />
            <span>닫기</span>
          </button>
        </div>
      </header>

      {/* 2. 현대적 세그먼트 컨트롤 탭 (2026 최신 트렌드: 일체형 트랙 & 플로팅 카드) */}
      <nav className="bg-[#EDE9E1] p-1.5 border-b border-[#DDD6C8] shrink-0">
        <div className="grid grid-cols-4 gap-1">
          {/* 1) 불사·상담 탭 */}
          <button
            type="button"
            onClick={() => setActiveTab('bulsa')}
            className={`py-2 px-1 text-center rounded-xl transition cursor-pointer flex flex-col items-center justify-center relative ${
              activeTab === 'bulsa'
                ? 'bg-white text-[#1E1914] font-black shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#DDD6C8]/80'
                : 'text-[#6E6659] hover:text-[#1E1914] hover:bg-white/40 font-semibold'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <AlertCircle className={`w-3.5 h-3.5 ${activeTab === 'bulsa' ? 'text-red-600' : 'text-[#8C8375]'}`} />
              <span className="truncate">불사·상담</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-sm font-black">{bulsaInquiries.length}</span>
              {pendingBulsaCount > 0 && (
                <span className="text-[9.5px] font-extrabold bg-red-600 text-white px-1.5 py-0.2 rounded-full shadow-xs flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  대기 {pendingBulsaCount}
                </span>
              )}
            </div>
          </button>

          {/* 2) 방문·공양 탭 */}
          <button
            type="button"
            onClick={() => setActiveTab('visits')}
            className={`py-2 px-1 text-center rounded-xl transition cursor-pointer flex flex-col items-center justify-center ${
              activeTab === 'visits'
                ? 'bg-white text-[#1E1914] font-black shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#DDD6C8]/80'
                : 'text-[#6E6659] hover:text-[#1E1914] hover:bg-white/40 font-semibold'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <Calendar className={`w-3.5 h-3.5 ${activeTab === 'visits' ? 'text-sky-600' : 'text-[#8C8375]'}`} />
              <span className="truncate">방문·공양</span>
            </div>
            <div className="text-sm font-black mt-0.5">
              {visits.length}건
            </div>
          </button>

          {/* 3) 소원등 탭 */}
          <button
            type="button"
            onClick={() => setActiveTab('lanterns')}
            className={`py-2 px-1 text-center rounded-xl transition cursor-pointer flex flex-col items-center justify-center ${
              activeTab === 'lanterns'
                ? 'bg-white text-[#1E1914] font-black shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#DDD6C8]/80'
                : 'text-[#6E6659] hover:text-[#1E1914] hover:bg-white/40 font-semibold'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <Flame className={`w-3.5 h-3.5 ${activeTab === 'lanterns' ? 'text-amber-600' : 'text-[#8C8375]'}`} />
              <span className="truncate">소원등</span>
            </div>
            <div className="text-sm font-black mt-0.5">
              {regularLanterns.length}위
            </div>
          </button>

          {/* 4) 신도조회 탭 */}
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 text-center rounded-xl transition cursor-pointer flex flex-col items-center justify-center ${
              activeTab === 'members'
                ? 'bg-white text-[#1E1914] font-black shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#DDD6C8]/80'
                : 'text-[#6E6659] hover:text-[#1E1914] hover:bg-white/40 font-semibold'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <Users className={`w-3.5 h-3.5 ${activeTab === 'members' ? 'text-emerald-600' : 'text-[#8C8375]'}`} />
              <span className="truncate">신도조회</span>
            </div>
            <div className="text-sm font-black mt-0.5">
              {members.length}명
            </div>
          </button>
        </div>
      </nav>

      {/* 3. 메인 콘텐츠 스크롤 영역 (밝은 아이보리 배경) */}
      <main className="flex-1 overflow-y-auto p-3 space-y-3 pb-20">
        {/* ============================================================== */}
        {/* 탭 1: 불사·제사·위패 상담 목록 */}
        {/* ============================================================== */}
        {activeTab === 'bulsa' && (
          <div className="space-y-3">
            {/* 2026 최신 세그먼트 필터 바 (파스텔 테두리 퇴출 & 모던 럭셔리 다크차콜/웜화이트 조화) */}
            <div className="bg-[#EDE9E1] p-1 rounded-xl grid grid-cols-4 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setBulsaStatusFilter('all')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                  bulsaStatusFilter === 'all'
                    ? 'bg-[#1E1914] text-[#F5D061] font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>전체</span>
                <span className={`text-[10.5px] font-black ${bulsaStatusFilter === 'all' ? 'text-[#F5D061]' : 'text-[#8C8375]'}`}>
                  ({bulsaInquiries.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBulsaStatusFilter('consulting')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                  bulsaStatusFilter === 'consulting'
                    ? 'bg-red-600 text-white font-black shadow-xs'
                    : 'text-red-700 hover:bg-white/60 font-bold'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>대기</span>
                <span className="text-[10.5px] font-black">
                  ({bulsaInquiries.filter((p) => p.status === 'consulting').length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBulsaStatusFilter('in_progress')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                  bulsaStatusFilter === 'in_progress'
                    ? 'bg-[#1E1914] text-amber-300 font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>진행</span>
                <span className={`text-[10.5px] font-black ${bulsaStatusFilter === 'in_progress' ? 'text-amber-300' : 'text-[#8C8375]'}`}>
                  ({bulsaInquiries.filter((p) => p.status === 'in_progress').length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBulsaStatusFilter('completed')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                  bulsaStatusFilter === 'completed'
                    ? 'bg-[#1E1914] text-emerald-300 font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>완료</span>
                <span className={`text-[10.5px] font-black ${bulsaStatusFilter === 'completed' ? 'text-emerald-300' : 'text-[#8C8375]'}`}>
                  ({bulsaInquiries.filter((p) => p.status === 'completed').length})
                </span>
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
            {/* 2026 최신 세그먼트 필터 바 (방문·공양: 전체 / 오늘 / 내일 / 모레 / 글피) */}
            <div className="bg-[#EDE9E1] p-1 rounded-xl grid grid-cols-5 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setVisitDateFilter('all')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-0.5 whitespace-nowrap ${
                  visitDateFilter === 'all'
                    ? 'bg-[#1E1914] text-[#F5D061] font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>전체</span>
                <span className={`text-[10.5px] font-black ${visitDateFilter === 'all' ? 'text-[#F5D061]' : 'text-[#8C8375]'}`}>
                  ({visits.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVisitDateFilter('today')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-0.5 whitespace-nowrap ${
                  visitDateFilter === 'today'
                    ? 'bg-sky-700 text-white font-black shadow-xs'
                    : 'text-sky-900 hover:bg-white/60 font-bold'
                }`}
              >
                <span>오늘</span>
                <span className={`text-[10.5px] font-black ${visitDateFilter === 'today' ? 'text-amber-300' : 'text-sky-700'}`}>
                  ({visitGroups.today.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVisitDateFilter('tomorrow')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-0.5 whitespace-nowrap ${
                  visitDateFilter === 'tomorrow'
                    ? 'bg-[#1E1914] text-sky-300 font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>내일</span>
                <span className={`text-[10.5px] font-black ${visitDateFilter === 'tomorrow' ? 'text-sky-300' : 'text-[#8C8375]'}`}>
                  ({visitGroups.tomorrow.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVisitDateFilter('afterTomorrow')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-0.5 whitespace-nowrap ${
                  visitDateFilter === 'afterTomorrow'
                    ? 'bg-[#1E1914] text-sky-300 font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>모레</span>
                <span className={`text-[10.5px] font-black ${visitDateFilter === 'afterTomorrow' ? 'text-sky-300' : 'text-[#8C8375]'}`}>
                  ({visitGroups.afterTomorrow.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVisitDateFilter('geulpi')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-0.5 whitespace-nowrap ${
                  visitDateFilter === 'geulpi'
                    ? 'bg-[#1E1914] text-sky-300 font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>글피</span>
                <span className={`text-[10.5px] font-black ${visitDateFilter === 'geulpi' ? 'text-sky-300' : 'text-[#8C8375]'}`}>
                  ({visitGroups.geulpi.length})
                </span>
              </button>
            </div>

            {currentVisits.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DCB9] text-[#7A6B58] text-xs space-y-1 shadow-xs">
                <Calendar className="w-7 h-7 mx-auto text-sky-600" />
                <p className="font-bold text-[#2E2214]">
                  {visitDateFilter === 'all' && '등록된 도량 방문·공양 예약이 없습니다.'}
                  {visitDateFilter === 'today' && '오늘 예정된 도량 방문·공양 예약이 없습니다.'}
                  {visitDateFilter === 'tomorrow' && '내일 예정된 도량 방문·공양 예약이 없습니다.'}
                  {visitDateFilter === 'afterTomorrow' && '모레 예정된 도량 방문·공양 예약이 없습니다.'}
                  {visitDateFilter === 'geulpi' && '글피 및 이후 예정된 도량 방문·공양 예약이 없습니다.'}
                </p>
              </div>
            ) : (
              currentVisits.map((v) => {
                const phone = v.visitor_phone || ''
                const cleanPhone = phone.replace(/[^0-9]/g, '')
                const statusLabel =
                  v.status === 'confirmed' ? '예약확정' :
                  v.status === 'completed' ? '방문완료' :
                  v.status === 'cancelled' ? '취소됨' : '접수대기'

                return (
                  <div
                    key={v.id}
                    className="rounded-2xl p-4 bg-white border border-[#E5DEC8] space-y-3 shadow-xs"
                  >
                    {/* 1) 상단: 성함 및 일체형 단일 뱃지 (줄바꿈 없이 깔끔하게 정돈) */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#F4EFE6] pb-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base font-black text-[#241E17] truncate">
                          {v.visitor_name || '방문 불자님'}
                        </span>
                        {phone && (
                          <button
                            type="button"
                            onClick={() => handleCopyPhone(phone)}
                            className="text-[11px] text-[#8C8375] hover:text-[#241E17] flex items-center gap-0.5 cursor-pointer ml-1"
                            title="전화번호 복사"
                          >
                            <span>{phone}</span>
                            <Copy className="w-3 h-3 text-[#B0A798]" />
                          </button>
                        )}
                      </div>

                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#FAF5EB] text-[#8A6510] border border-[#E8DEC8] shrink-0 whitespace-nowrap">
                        {formatVisitPurpose(v.visit_purpose)} · {v.headcount || 1}명
                      </span>
                    </div>

                    {/* 2) 방문 일시 (크고 시원하게 부각) */}
                    <div className="flex items-center justify-between text-xs font-bold text-[#1E1914] bg-[#F7F4EE] px-3 py-2 rounded-xl border border-[#EDE7D9]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#C59B27] shrink-0" />
                        <span>{v.visit_date} {v.visit_time}</span>
                      </div>
                      <span className={`text-[10.5px] px-2 py-0.5 rounded font-extrabold ${
                        v.status === 'confirmed' ? 'bg-sky-100 text-sky-800' :
                        v.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        v.status === 'cancelled' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* 3) 요청 메모 */}
                    {v.memo && (
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] text-xs text-[#524436] font-serif-kr leading-relaxed">
                        “{v.memo}”
                      </div>
                    )}

                    {/* 4) 버튼 영역: 2026 최신 2열 정돈 (상단: 통화/문자 2분할, 하단: 상태관리 3분할) */}
                    <div className="space-y-2 pt-1">
                      {/* 1열: 원터치 소통 액션 (균형 잡힌 2분할) */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={cleanPhone ? `tel:${cleanPhone}` : '#'}
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>전화 연결</span>
                        </a>

                        <a
                          href={
                            cleanPhone
                              ? `sms:${cleanPhone}?body=${encodeURIComponent(
                                  `[제주 소원사]\n${v.visitor_name} 불자님, ${v.visit_date} ${v.visit_time} 방문 및 공양 예약 확인차 연락드렸습니다.`
                                )}`
                              : '#'
                          }
                          className="py-2.5 rounded-xl bg-[#241E17] hover:bg-[#383025] text-[#F5D061] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#F5D061]" />
                          <span>문자 발송</span>
                        </a>
                      </div>

                      {/* 2열: 예약 상태 변경 3분할 세그먼트 버튼 (군더더기 없는 미니멀 스타일) */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-[#F4EFE6] text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleUpdateVisitStatus(v.id, 'confirmed')}
                          className={`py-1.5 rounded-lg border text-center transition cursor-pointer font-bold ${
                            v.status === 'confirmed'
                              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                              : 'bg-white text-sky-800 border-sky-200 hover:bg-sky-50'
                          }`}
                        >
                          예약확정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateVisitStatus(v.id, 'completed')}
                          className={`py-1.5 rounded-lg border text-center transition cursor-pointer font-bold ${
                            v.status === 'completed'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          방문완료
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateVisitStatus(v.id, 'cancelled')}
                          className={`py-1.5 rounded-lg border text-center transition cursor-pointer font-semibold ${
                            v.status === 'cancelled'
                              ? 'bg-gray-600 text-white border-gray-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          예약취소
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
            {/* 소원등 하위메뉴 2분할 세그먼트 바 (전체 / 오늘 축원 명부) */}
            <div className="bg-[#EDE9E1] p-1 rounded-xl grid grid-cols-2 gap-1 text-xs">
              <button
                type="button"
                onClick={() => setLanternFilter('all')}
                className={`py-2 px-1 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  lanternFilter === 'all'
                    ? 'bg-[#1E1914] text-[#F5D061] font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>전체</span>
                <span className={`text-[11px] font-black ${lanternFilter === 'all' ? 'text-[#F5D061]' : 'text-[#8C8375]'}`}>
                  ({regularLanterns.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLanternFilter('today')}
                className={`py-2 px-1 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  lanternFilter === 'today'
                    ? 'bg-[#1E1914] text-[#F5D061] font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${lanternFilter === 'today' ? 'text-amber-400' : 'text-[#8C8375]'}`} />
                <span>오늘 축원 명부</span>
                <span className={`text-[11px] font-black ${lanternFilter === 'today' ? 'text-amber-300' : 'text-[#8C8375]'}`}>
                  ({todayLanterns.length})
                </span>
              </button>
            </div>

            {currentLanterns.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DCB9] text-[#7A6B58] text-xs space-y-1 shadow-xs">
                <Flame className="w-7 h-7 mx-auto text-amber-600" />
                <p className="font-bold text-[#2E2214]">
                  {lanternFilter === 'today'
                    ? '오늘 대웅전 사시예불 축원 대상 소원등이 없습니다.'
                    : '등록된 1일 소원등이 없습니다.'}
                </p>
              </div>
            ) : (
              currentLanterns.map((p) => {
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
                      <span className="font-medium text-[#8A6510]">
                        {p.wish_category?.includes('인등') || p.prayer_type === 'indeung_1yr'
                          ? '대웅전 1년 인등 (365일 사시예불 축원)'
                          : p.wish_category?.includes('100일') || p.prayer_type === 'prayer_100d'
                          ? '100일 특별기도 (사시예불 축원)'
                          : (lanternFilter === 'today' ? '오늘 오전 10시 대웅전 사시예불 축원' : (p.prayed_at || '사시예불 축원 배정'))}
                      </span>
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

            {/* 4분할 세그먼트 정렬 바 (최근순 / 이름순 / 가족순 / 정진순) */}
            <div className="bg-[#EDE9E1] p-1 rounded-xl grid grid-cols-4 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setMemberSort('recent')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-0.5 whitespace-nowrap ${
                  memberSort === 'recent'
                    ? 'bg-[#1E1914] text-[#F5D061] font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>최근등록</span>
              </button>

              <button
                type="button"
                onClick={() => setMemberSort('name')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-0.5 whitespace-nowrap ${
                  memberSort === 'name'
                    ? 'bg-[#1E1914] text-[#F5D061] font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>이름(ㄱ-ㅎ)</span>
              </button>

              <button
                type="button"
                onClick={() => setMemberSort('family')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-0.5 whitespace-nowrap ${
                  memberSort === 'family'
                    ? 'bg-[#1E1914] text-[#F5D061] font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>인연신도순</span>
              </button>

              <button
                type="button"
                onClick={() => setMemberSort('merit')}
                className={`py-1.5 px-0.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-0.5 whitespace-nowrap ${
                  memberSort === 'merit'
                    ? 'bg-[#1E1914] text-[#F5D061] font-black shadow-xs'
                    : 'text-[#5C5446] hover:bg-white/60 font-semibold'
                }`}
              >
                <span>정진공덕순</span>
              </button>
            </div>

            {/* 신도 목록 */}
            <div className="space-y-2">
              {sortedAndSearchedMembers.map((m) => {
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
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#7A6B58] flex-wrap">
                        <span className="font-medium text-[#40362C]">{phone}</span>
                        {Number(m.believers_count) > 0 && (
                          <span className="text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200 font-bold text-[10px]">
                            인연신도 {m.believers_count}명
                          </span>
                        )}
                        {Number(m.merit_count) > 0 && (
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-bold text-[10px]">
                            {Number(m.merit_count).toLocaleString()} 공덕
                          </span>
                        )}
                      </div>
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
