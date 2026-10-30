import React, { useState, useMemo, useRef } from 'react'
import {
  Search,
  Sparkles,
  Printer,
  CheckCircle2,
  X,
  UserPlus,
  RefreshCw,
  Layers,
  ArrowRightLeft,
  Flame,
  Award,
  Calendar,
  Phone,
  MapPin,
  HelpCircle,
} from 'lucide-react'
import {
  SOWONSA_INITIAL_MEMBERS,
  generateIndeungSeats,
  generateWipaeSeats,
} from '../../lib/sowonsaLegacyData'

export default function SeatMapView({
  onSelectMemberForDetail,
  onOpenPrintModal,
}) {
  // 모드: 'indeung' (대웅전 1년 인등단) | 'wipae' (지장전 영구위패단)
  const [activeAltar, setActiveAltar] = useState('indeung')

  // 인등 좌석 & 위패 좌석 로컬 상태 (localStorage 연동 지원)
  const [indeungSeats, setIndeungSeats] = useState(() => {
    try {
      const saved = localStorage.getItem('sowonsa_indeung_seats_v1')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      // ignore
    }
    return generateIndeungSeats(SOWONSA_INITIAL_MEMBERS)
  })

  const [wipaeSeats, setWipaeSeats] = useState(() => {
    try {
      const saved = localStorage.getItem('sowonsa_wipae_seats_v1')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      // ignore
    }
    return generateWipaeSeats(SOWONSA_INITIAL_MEMBERS)
  })

  // 검색어 & 포커스 대상
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedSeatId, setFocusedSeatId] = useState(null)

  // 선택된 좌석 모달
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignCandidateSearch, setAssignCandidateSearch] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  // 자리 이동 모달
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [targetMoveSeatId, setTargetMoveSeatId] = useState('')

  // 좌석 상태 저장 헬퍼
  const saveSeats = (newIndeung, newWipae) => {
    if (newIndeung) {
      setIndeungSeats(newIndeung)
      try {
        localStorage.setItem('sowonsa_indeung_seats_v1', JSON.stringify(newIndeung))
      } catch (e) {}
    }
    if (newWipae) {
      setWipaeSeats(newWipae)
      try {
        localStorage.setItem('sowonsa_wipae_seats_v1', JSON.stringify(newWipae))
      } catch (e) {}
    }
  }

  // 현재 활성화된 좌석 목록
  const currentSeats = activeAltar === 'indeung' ? indeungSeats : wipaeSeats

  // 통계 계산
  const stats = useMemo(() => {
    const total = currentSeats.length
    const occupied = currentSeats.filter((s) => s.isOccupied).length
    const vacant = total - occupied
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0
    return { total, occupied, vacant, rate }
  }, [currentSeats])

  // 빠른 자리 검색 및 스크롤
  const handleSearch = (q) => {
    setSearchQuery(q)
    if (!q.trim()) {
      setFocusedSeatId(null)
      return
    }
    const cleanQ = q.trim().toLowerCase()
    const found = currentSeats.find((s) => {
      const codeMatch = s.code?.toLowerCase().includes(cleanQ)
      const nameMatch = (s.memberName || s.pokwiName || s.younggaName || '').toLowerCase().includes(cleanQ)
      const dharmaMatch = (s.dharmaName || '').toLowerCase().includes(cleanQ)
      return codeMatch || nameMatch || dharmaMatch
    })
    if (found) {
      setFocusedSeatId(found.id)
      const el = document.getElementById(`seat-cell-${found.id}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      }
    } else {
      setFocusedSeatId(null)
    }
  }

  // 좌석 클릭 처리
  const handleSeatClick = (seat) => {
    setSelectedSeat(seat)
    if (seat.isOccupied) {
      // 이미 봉안된 좌석: 상세 팝업 열기
    } else {
      // 빈 좌석: 바로 배정 모달 열기
      setShowAssignModal(true)
      setSelectedCandidate(null)
      setAssignCandidateSearch('')
    }
  }

  // 새 신도/영가 자리 배정 실행
  const handleExecuteAssign = () => {
    if (!selectedSeat || !selectedCandidate) return

    if (activeAltar === 'indeung') {
      const updated = indeungSeats.map((s) => {
        if (s.id === selectedSeat.id) {
          return {
            ...s,
            isOccupied: true,
            status: 'occupied',
            memberCode: selectedCandidate.code,
            memberName: selectedCandidate.name,
            dharmaName: selectedCandidate.dharma_name || '',
            phone: selectedCandidate.phone || '',
            prayerCategory: '대웅전 1년 인등(가족등)',
            appliedAt: new Date().toISOString().slice(0, 10),
          }
        }
        return s
      })
      saveSeats(updated, null)
    } else {
      const updated = wipaeSeats.map((s) => {
        if (s.id === selectedSeat.id) {
          return {
            ...s,
            isOccupied: true,
            status: 'occupied',
            memberCode: selectedCandidate.code,
            pokwiName: selectedCandidate.name,
            younggaName: selectedCandidate.younggaName || `${selectedCandidate.name} 선망조상`,
            relation: selectedCandidate.relation || '선망부모',
            bonkwan: selectedCandidate.bonkwan || '본관불명',
            dharmaName: selectedCandidate.dharma_name || '',
            wipaeType: '영구위패',
            deathDate: new Date().toISOString().slice(0, 10),
          }
        }
        return s
      })
      saveSeats(null, updated)
    }

    setShowAssignModal(false)
    setSelectedSeat(null)
  }

  // 좌석 회향 (자리 비우기)
  const handleClearSeat = (seatId) => {
    if (!window.confirm('해당 좌석을 회향(비우기) 처리하시겠습니까?')) return

    if (activeAltar === 'indeung') {
      const updated = indeungSeats.map((s) => {
        if (s.id === seatId) {
          return {
            ...s,
            isOccupied: false,
            status: 'vacant',
            memberCode: null,
            memberName: null,
            dharmaName: null,
            phone: null,
            prayerCategory: null,
            appliedAt: null,
          }
        }
        return s
      })
      saveSeats(updated, null)
    } else {
      const updated = wipaeSeats.map((s) => {
        if (s.id === seatId) {
          return {
            ...s,
            isOccupied: false,
            status: 'vacant',
            memberCode: null,
            pokwiName: null,
            younggaName: null,
            relation: null,
            bonkwan: null,
            dharmaName: null,
            wipaeType: null,
            deathDate: null,
          }
        }
        return s
      })
      saveSeats(null, updated)
    }
    setSelectedSeat(null)
  }

  // 자리 이동 실행
  const handleExecuteMove = () => {
    if (!selectedSeat || !targetMoveSeatId) return

    const targetSeat = currentSeats.find((s) => s.id === targetMoveSeatId)
    if (!targetSeat) {
      alert('이동할 대상 좌석을 찾을 수 없습니다.')
      return
    }
    if (targetSeat.isOccupied) {
      alert('대상 좌석은 이미 다른 신도님이 봉안되어 있습니다. 빈 좌석을 선택해주세요.')
      return
    }

    if (activeAltar === 'indeung') {
      const updated = indeungSeats.map((s) => {
        if (s.id === targetMoveSeatId) {
          return {
            ...s,
            isOccupied: true,
            status: 'occupied',
            memberCode: selectedSeat.memberCode,
            memberName: selectedSeat.memberName,
            dharmaName: selectedSeat.dharmaName,
            phone: selectedSeat.phone,
            prayerCategory: selectedSeat.prayerCategory,
            appliedAt: selectedSeat.appliedAt,
          }
        }
        if (s.id === selectedSeat.id) {
          return {
            ...s,
            isOccupied: false,
            status: 'vacant',
            memberCode: null,
            memberName: null,
            dharmaName: null,
            phone: null,
            prayerCategory: null,
            appliedAt: null,
          }
        }
        return s
      })
      saveSeats(updated, null)
    } else {
      const updated = wipaeSeats.map((s) => {
        if (s.id === targetMoveSeatId) {
          return {
            ...s,
            isOccupied: true,
            status: 'occupied',
            memberCode: selectedSeat.memberCode,
            pokwiName: selectedSeat.pokwiName,
            younggaName: selectedSeat.younggaName,
            relation: selectedSeat.relation,
            bonkwan: selectedSeat.bonkwan,
            dharmaName: selectedSeat.dharmaName,
            wipaeType: selectedSeat.wipaeType,
            deathDate: selectedSeat.deathDate,
          }
        }
        if (s.id === selectedSeat.id) {
          return {
            ...s,
            isOccupied: false,
            status: 'vacant',
            memberCode: null,
            pokwiName: null,
            younggaName: null,
            relation: null,
            bonkwan: null,
            dharmaName: null,
            wipaeType: null,
            deathDate: null,
          }
        }
        return s
      })
      saveSeats(null, updated)
    }

    setShowMoveModal(false)
    setSelectedSeat(null)
    setTargetMoveSeatId('')
    alert(`좌석 이동이 성공적으로 완료되었습니다. (${selectedSeat.code} ➔ ${targetMoveSeatId})`)
  }

  // 초기화 헬퍼
  const handleResetToDefault = () => {
    if (!window.confirm('좌석 배치도를 소원사 기본 초기값으로 리셋하시겠습니까?')) return
    const defaultIndeung = generateIndeungSeats(SOWONSA_INITIAL_MEMBERS)
    const defaultWipae = generateWipaeSeats(SOWONSA_INITIAL_MEMBERS)
    saveSeats(defaultIndeung, defaultWipae)
  }

  // 배정 모달용 신도 검색 필터
  const filteredCandidates = useMemo(() => {
    if (!assignCandidateSearch.trim()) return SOWONSA_INITIAL_MEMBERS.slice(0, 10)
    const q = assignCandidateSearch.trim().toLowerCase()
    return SOWONSA_INITIAL_MEMBERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.dharma_name && m.dharma_name.toLowerCase().includes(q)) ||
        m.code.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q))
    )
  }, [assignCandidateSearch])

  // 이동 가능한 빈 좌석 목록
  const vacantSeats = useMemo(() => {
    return currentSeats.filter((s) => !s.isOccupied)
  }, [currentSeats])

  return (
    <div className="w-full flex flex-col gap-4 text-[#FAF8F5]">
      {/* ==================== 1. 상단 컨트롤 바 & 실시간 KPI ==================== */}
      <section className="bg-[#1F1B17] border border-[#C59B27]/40 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* 전각 탭 선택 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveAltar('indeung')
              setFocusedSeatId(null)
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeAltar === 'indeung'
                ? 'bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] shadow-lg shadow-amber-900/30 font-black'
                : 'bg-white/5 hover:bg-white/10 text-[#C5BBAF]'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>🏮 대웅전 1년 가족 인등단 (200석)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveAltar('wipae')
              setFocusedSeatId(null)
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeAltar === 'wipae'
                ? 'bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] shadow-lg shadow-amber-900/30 font-black'
                : 'bg-white/5 hover:bg-white/10 text-[#C5BBAF]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C59B27]" />
            <span>🪔 지장전 디지털 영구위패단 (160석)</span>
          </button>
        </div>

        {/* 1초 초고속 자리 검색 바 */}
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={
              activeAltar === 'indeung'
                ? '신도명, 법명, 인등번호(예: 인등-동-01) 검색...'
                : '복위자명, 영가명, 위패번호(예: 위패-상-01) 검색...'
            }
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/40 border border-[#C59B27]/50 text-xs text-white placeholder-[#8C8071] focus:outline-none focus:border-[#F5D061]"
          />
          <Search className="w-4 h-4 text-[#C59B27] absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearch('')}
              className="absolute right-2.5 top-2.5 text-[#8C8071] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 우측 퀵 버튼 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>배치도 인쇄</span>
          </button>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#8C8071] hover:text-white transition"
            title="소원사 기본값으로 초기화"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ==================== 2. 좌석 가동률 KPI 카드 ==================== */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#1A1714] border border-white/10">
          <div className="text-[11px] text-[#A69B8D] font-medium">총 배치 좌석</div>
          <div className="text-xl font-black text-white mt-0.5">
            {stats.total}
            <span className="text-xs font-normal text-[#A69B8D] ml-1">석</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1A1714] border border-amber-500/30">
          <div className="text-[11px] text-amber-300 font-medium flex items-center justify-between">
            <span>봉안 완료 (점유)</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="text-xl font-black text-[#F5D061] mt-0.5">
            {stats.occupied}
            <span className="text-xs font-normal text-[#A69B8D] ml-1">석</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1A1714] border border-emerald-500/30">
          <div className="text-[11px] text-emerald-400 font-medium">잔여 빈자리 (공석)</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5">
            {stats.vacant}
            <span className="text-xs font-normal text-[#A69B8D] ml-1">석</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#271E14] to-[#1A1714] border border-[#C59B27]/40">
          <div className="text-[11px] text-[#F5D061] font-bold">봉안 가동률</div>
          <div className="text-xl font-black text-[#F5D061] mt-0.5">
            {stats.rate}%
            <span className="text-[10px] text-[#A69B8D] font-normal ml-1">
              ({stats.occupied}/{stats.total})
            </span>
          </div>
        </div>
      </section>

      {/* ==================== 3. 바둑판 시각적 좌석 배치도 그리드 ==================== */}
      <section id="printable-desk-sheet" className="bg-[#1A1612] border border-[#C59B27]/40 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 overflow-hidden">
        {/* 인등단 범례(Legend) 안내 */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-serif-kr font-bold text-sm text-[#F5D061]">
              {activeAltar === 'indeung'
                ? '🏛️ 대웅전 1년 가족 인등단 바둑판 좌표배치도'
                : '🏛️ 지장전 디지털 영구위패단 바둑판 좌표배치도'}
            </span>
            <span className="text-[11px] text-[#A69B8D]">
              (원하는 자리를 클릭하면 즉시 배정/조회/이동 가능)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-400/80 inline-block shadow-sm shadow-amber-500/50" />
              <span className="text-[#F5D061]">봉안중 (점등)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-white/5 border border-white/20 inline-block" />
              <span className="text-[#A69B8D]">빈자리 (공석)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-400 inline-block" />
              <span className="text-blue-300">검색 포커스</span>
            </div>
          </div>
        </div>

        {/* -------------------- 🏮 대웅전 1년 인등단 (동편 / 서편) -------------------- */}
        {activeAltar === 'indeung' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {['동', '서'].map((secCode) => {
              const secSeats = currentSeats.filter((s) => s.section === secCode)
              const secName = secCode === '동' ? '동편 인등단 (좌측 100석)' : '서편 인등단 (우측 100석)'

              return (
                <div key={secCode} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="font-bold text-xs text-[#F5D061] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      {secName}
                    </span>
                    <span className="text-[11px] text-[#8C8071]">
                      점유: {secSeats.filter((s) => s.isOccupied).length} / 100
                    </span>
                  </div>

                  {/* 10 x 10 바둑판 그리드 */}
                  <div className="overflow-x-auto pb-2">
                    <div className="grid grid-cols-10 gap-1.5 min-w-[500px]">
                      {secSeats.map((seat) => {
                        const isFocused = focusedSeatId === seat.id
                        const isOccupied = seat.isOccupied

                        return (
                          <div
                            key={seat.id}
                            id={`seat-cell-${seat.id}`}
                            onClick={() => handleSeatClick(seat)}
                            title={
                              isOccupied
                                ? `${seat.code} | ${seat.memberName} (${seat.dharmaName || '법명없음'}) - 클릭시 상세/이동`
                                : `${seat.code} (빈자리) - 클릭시 배정`
                            }
                            className={`group relative p-1.5 rounded-lg border text-center transition cursor-pointer select-none flex flex-col items-center justify-between min-h-[52px] ${
                              isFocused
                                ? 'ring-2 ring-blue-400 bg-blue-950/80 border-blue-400 scale-105 z-10 animate-pulse'
                                : isOccupied
                                ? 'bg-gradient-to-b from-[#2E2419] to-[#1E1812] border-[#C59B27]/70 hover:border-[#F5D061] shadow-md shadow-amber-950/50 hover:brightness-110'
                                : 'bg-black/30 border-white/10 hover:border-emerald-500/50 hover:bg-emerald-950/20'
                            }`}
                          >
                            {/* 좌석 번호 */}
                            <span className="text-[9px] font-mono font-bold text-[#A69B8D] leading-none">
                              {seat.seatNumber < 10 ? '0' + seat.seatNumber : seat.seatNumber}
                            </span>

                            {/* 상태 아이콘 / 성함 */}
                            {isOccupied ? (
                              <div className="flex flex-col items-center my-0.5">
                                <span className="text-amber-400 text-xs leading-none">🪔</span>
                                <span className="text-[10px] font-bold text-[#FAF8F5] truncate max-w-full leading-tight mt-0.5">
                                  {seat.memberName}
                                </span>
                                {seat.dharmaName && (
                                  <span className="text-[8px] text-[#F5D061] truncate max-w-full leading-none">
                                    {seat.dharmaName}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="my-auto flex flex-col items-center opacity-40 group-hover:opacity-100 transition">
                                <span className="text-[10px] text-emerald-400">+</span>
                                <span className="text-[8px] text-[#8C8071] leading-none">공석</span>
                              </div>
                            )}

                            {/* 호버 툴팁 미니 바 */}
                            <div className="w-full h-0.5 rounded-full bg-transparent group-hover:bg-[#C59B27]" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* -------------------- 🪔 지장전 영구위패단 (상단 / 하단) -------------------- */}
        {activeAltar === 'wipae' && (
          <div className="space-y-6">
            {['상', '하'].map((tierCode) => {
              const tierSeats = currentSeats.filter((s) => s.tier === tierCode)
              const tierName =
                tierCode === '상'
                  ? '지장전 상단 영구위패단 (1~4단 / 80위)'
                  : '지장전 하단 영구위패단 (5~8단 / 80위)'

              return (
                <div key={tierCode} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="font-bold text-xs text-[#F5D061] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#C59B27]" />
                      {tierName}
                    </span>
                    <span className="text-[11px] text-[#8C8071]">
                      봉안: {tierSeats.filter((s) => s.isOccupied).length} / 80
                    </span>
                  </div>

                  {/* 4 x 20 바둑판 그리드 */}
                  <div className="overflow-x-auto pb-2">
                    <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 min-w-[750px]">
                      {tierSeats.map((seat) => {
                        const isFocused = focusedSeatId === seat.id
                        const isOccupied = seat.isOccupied

                        return (
                          <div
                            key={seat.id}
                            id={`seat-cell-${seat.id}`}
                            onClick={() => handleSeatClick(seat)}
                            title={
                              isOccupied
                                ? `${seat.code} | 영가: ${seat.younggaName} (복위자: ${seat.pokwiName})`
                                : `${seat.code} (빈자리) - 클릭시 배정`
                            }
                            className={`group relative p-1.5 rounded-lg border text-center transition cursor-pointer select-none flex flex-col items-center justify-between min-h-[58px] ${
                              isFocused
                                ? 'ring-2 ring-blue-400 bg-blue-950/80 border-blue-400 scale-105 z-10 animate-pulse'
                                : isOccupied
                                ? 'bg-gradient-to-b from-[#2E2015] to-[#1F160E] border-amber-600/70 hover:border-[#F5D061] shadow-md shadow-amber-950/60 hover:brightness-110'
                                : 'bg-black/30 border-white/10 hover:border-emerald-500/50 hover:bg-emerald-950/20'
                            }`}
                          >
                            {/* 위패 번호 */}
                            <span className="text-[9px] font-mono font-bold text-[#A69B8D] leading-none">
                              {seat.seatNumber < 10 ? '0' + seat.seatNumber : seat.seatNumber}
                            </span>

                            {/* 위패 문양 / 영가 성함 */}
                            {isOccupied ? (
                              <div className="flex flex-col items-center my-0.5">
                                <span className="text-[#F5D061] text-xs font-serif leading-none">位</span>
                                <span className="text-[10px] font-bold text-[#FAF8F5] truncate max-w-full leading-tight mt-0.5">
                                  {seat.younggaName}
                                </span>
                                <span className="text-[8px] text-[#C5BBAF] truncate max-w-full leading-none">
                                  {seat.pokwiName} 복위
                                </span>
                              </div>
                            ) : (
                              <div className="my-auto flex flex-col items-center opacity-40 group-hover:opacity-100 transition">
                                <span className="text-[10px] text-emerald-400">+</span>
                                <span className="text-[8px] text-[#8C8071] leading-none">공석</span>
                              </div>
                            )}

                            <div className="w-full h-0.5 rounded-full bg-transparent group-hover:bg-[#C59B27]" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ==================== 4. 배정된 좌석 상세 모달 & 자리 이동 ==================== */}
      {selectedSeat && selectedSeat.isOccupied && !showMoveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1B1815] text-[#FAF8F5] rounded-3xl border-2 border-[#C59B27] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#C59B27]/40">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#2D241C] text-[#F5D061] flex items-center justify-center font-bold text-sm border border-[#C59B27]/50">
                  卍
                </span>
                <div>
                  <h3 className="font-serif-kr font-bold text-base text-[#F5D061]">
                    {selectedSeat.code} 봉안 상세 정보
                  </h3>
                  <p className="text-[11px] text-[#A69B8D]">
                    {activeAltar === 'indeung'
                      ? '대웅전 1년 인등단 점등 현황'
                      : '지장전 영구위패단 봉안 현황'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSeat(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#A69B8D] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 인등 모드 상세 */}
            {activeAltar === 'indeung' ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 p-3 bg-black/40 rounded-xl border border-white/10">
                  <div>
                    <span className="text-[#8C8071] block">봉안 신도명:</span>
                    <span className="font-bold text-white text-sm">
                      {selectedSeat.memberName}
                      {selectedSeat.dharmaName && ` (${selectedSeat.dharmaName})`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C8071] block">신도 관리코드:</span>
                    <span className="font-mono font-bold text-[#F5D061]">
                      {selectedSeat.memberCode || '소원-직접접수'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C8071]">연락처:</span>
                    <span className="font-mono text-white">{selectedSeat.phone || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C8071]">기도 종목:</span>
                    <span className="text-amber-300 font-bold">
                      {selectedSeat.prayerCategory || '대웅전 1년 인등'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C8071]">점등 접수일:</span>
                    <span className="font-mono text-white">{selectedSeat.appliedAt || '2026-01-10'}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* 위패 모드 상세 */
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 p-3 bg-black/40 rounded-xl border border-white/10">
                  <div>
                    <span className="text-[#8C8071] block">영가 성함:</span>
                    <span className="font-bold text-white text-sm">
                      {selectedSeat.younggaName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C8071] block">복위자 (행효자):</span>
                    <span className="font-bold text-[#F5D061]">
                      {selectedSeat.pokwiName} ({selectedSeat.relation || '인연'})
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C8071]">본관:</span>
                    <span className="text-white">{selectedSeat.bonkwan || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C8071]">위패 종류:</span>
                    <span className="text-amber-300 font-bold">
                      {selectedSeat.wipaeType || '영구위패'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C8071]">기일 (제사일):</span>
                    <span className="font-mono text-white">{selectedSeat.deathDate || '-'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 하단 제어 버튼 */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setShowMoveModal(true)}
                className="py-2.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-500/50 font-bold transition flex items-center justify-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>자리 이동</span>
              </button>

              <button
                type="button"
                onClick={() => handleClearSeat(selectedSeat.id)}
                className="py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700/60 font-bold transition flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>회향 (자리 비우기)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. 빈자리 신규 배정 모달 ==================== */}
      {showAssignModal && selectedSeat && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1B1815] text-[#FAF8F5] rounded-3xl border-2 border-[#C59B27] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#C59B27]/40">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold text-sm border border-emerald-500/50">
                  +
                </span>
                <div>
                  <h3 className="font-serif-kr font-bold text-base text-[#F5D061]">
                    {selectedSeat.code} 좌석 배정
                  </h3>
                  <p className="text-[11px] text-[#A69B8D]">
                    {activeAltar === 'indeung'
                      ? '대웅전 1년 가족인등 배정할 신도를 선택하세요.'
                      : '지장전 영구위패 배정할 신도/영가를 선택하세요.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedSeat(null)
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#A69B8D] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 신도 검색창 */}
            <div>
              <label className="text-xs font-bold text-[#D6CEC2] block mb-1">
                신도 검색 (성함/법명/전화번호)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={assignCandidateSearch}
                  onChange={(e) => setAssignCandidateSearch(e.target.value)}
                  placeholder="예: 강 옥, 강경미, 010..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-[#C59B27]/50 text-xs font-bold text-white focus:outline-none focus:border-[#F5D061]"
                />
                <Search className="w-4 h-4 text-[#C59B27] absolute left-3 top-3" />
              </div>
            </div>

            {/* 검색 결과 리스트 */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {filteredCandidates.map((c) => {
                const isSelected = selectedCandidate?.code === c.code

                return (
                  <div
                    key={c.code}
                    onClick={() => setSelectedCandidate(c)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#2D241C] border-[#F5D061] text-white shadow'
                        : 'bg-black/30 border-white/10 hover:border-white/30 text-[#D6CEC2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{c.name}</span>
                        {c.dharma_name && (
                          <span className="text-[10px] text-[#F5D061]">
                            ({c.dharma_name})
                          </span>
                        )}
                        <span className="text-[10px] text-[#8C8071] font-mono">
                          {c.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8C8071] mt-0.5">
                        {c.phone || c.address || '소원사 신도'}
                      </div>
                    </div>

                    <CheckCircle2
                      className={`w-4 h-4 ${
                        isSelected ? 'text-[#F5D061]' : 'text-transparent'
                      }`}
                    />
                  </div>
                )
              })}
            </div>

            {/* 하단 배정 완료 버튼 */}
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedSeat(null)
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#D6CEC2]"
              >
                취소
              </button>
              <button
                type="button"
                disabled={!selectedCandidate}
                onClick={handleExecuteAssign}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] disabled:opacity-40 text-[#1B1815] font-extrabold text-xs shadow hover:brightness-105"
              >
                해당 자리에 즉시 배정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 6. 자리 이동 모달 ==================== */}
      {showMoveModal && selectedSeat && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1B1815] text-[#FAF8F5] rounded-3xl border-2 border-blue-500 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-950 text-blue-300 flex items-center justify-center font-bold text-sm border border-blue-500/50">
                  <ArrowRightLeft className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif-kr font-bold text-base text-blue-200">
                    좌석 이동: {selectedSeat.code}
                  </h3>
                  <p className="text-[11px] text-[#A69B8D]">
                    이동할 빈 공석을 선택해주세요.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#A69B8D] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-bold text-[#D6CEC2] block mb-1">
                  이동 대상 빈 공석 선택 (총 {vacantSeats.length}개 공석 가능)
                </label>
                <select
                  value={targetMoveSeatId}
                  onChange={(e) => setTargetMoveSeatId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-blue-500/50 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="">이동할 빈자리를 선택하세요</option>
                  {vacantSeats.map((vs) => (
                    <option key={vs.id} value={vs.id}>
                      {vs.code} ({vs.sectionName || vs.tierName || '공석'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-[11px] text-blue-300 leading-relaxed">
                현재 봉안된{' '}
                <strong className="text-white">
                  {selectedSeat.memberName || selectedSeat.younggaName}
                </strong>
                님의 모든 기도·봉안 정보가 선택하신 새로운 공석으로 안전하게 이전됩니다.
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#D6CEC2]"
              >
                취소
              </button>
              <button
                type="button"
                disabled={!targetMoveSeatId}
                onClick={handleExecuteMove}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 disabled:opacity-40 text-white font-extrabold text-xs shadow hover:brightness-105"
              >
                자리 이동 확정하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
