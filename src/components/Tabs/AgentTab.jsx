import React from 'react'
import {
  Copy,
  QrCode,
  Coffee,
  Phone,
  MessageSquare,
  Search,
  UserCheck,
  X,
} from 'lucide-react'

export default function AgentTab({
  setActiveTab,
  activeAgent,
  isMasterOrTempleAdmin,
  selectedAgentCode,
  setSelectedAgentCode,
  agents,
  myAffiliatedMembers,
  handleCopyRefLink,
  handleToggleQr,
  showQrCode,
  setBusinessCardTarget,
  setShowBusinessCardModal,
  qrDataUrl,
  handleDownloadQr,
  agentViewMode,
  setAgentViewMode,
  OrganizationTreeView,
  members,
  isAgentPrayerListExpanded,
  setIsAgentPrayerListExpanded,
  agentPrayerSearchQuery,
  setAgentPrayerSearchQuery,
  prayers,
  formatPrayerDate,
  isAgentVisitListExpanded,
  setIsAgentVisitListExpanded,
  visits,
  showToast,
  setVisits,
}) {
  const isAdmin = isMasterOrTempleAdmin

  return (
<main className="flex-1 flex flex-col gap-4 px-2 py-3.5">
            {/* 상단: 내정보 창으로 돌아가기 바 */}
            <div className="flex items-center justify-between pb-0.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="text-xs font-bold text-[#8A6510] hover:text-[#C59B27] flex items-center gap-1.5 transition py-1 px-2 rounded-lg bg-[#FAF8F5] border border-[#DDD4C4]"
              >
                <span>← [내정보] 창으로 돌아가기</span>
              </button>
              <span className="text-[11px] text-[#A69B8D] font-medium">포교위원회 전용</span>
            </div>

            <section className="rounded-2xl bg-gradient-to-br from-[#231F1C] to-[#151210] text-white p-5 border border-[#C59B27]/40 shadow-md space-y-4">
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#F5D061] font-semibold flex items-center gap-1">
                  <span>📜</span>
                  <span>포교위원 모바일 파트너 센터</span>
                </span>
                <h2 className="font-serif-kr text-lg sm:text-xl font-bold text-white flex items-center gap-1.5 flex-wrap">
                  <span>{activeAgent.name}</span>
                  <span className="text-[#F5D061]">
                    {activeAgent.role === 'temple_admin' ? '신도회장' : activeAgent.role === 'master' ? '총괄위원장' : '포교위원장'}
                  </span>
                  <span className="text-[#D6CEC2] text-xs font-normal">님의 전법 도량</span>
                </h2>
                {isMasterOrTempleAdmin && (
                  <div className="flex justify-end items-center pt-0.5">
                    <select
                      value={selectedAgentCode}
                      onChange={(e) => setSelectedAgentCode(e.target.value)}
                      className="bg-[#2E2822] text-[#F5D061] border border-[#C59B27]/60 rounded-full px-3 py-1 text-xs font-bold focus:outline-none shadow-sm cursor-pointer"
                    >
                      {agents.map((ag) => (
                        <option key={ag.code} value={ag.code} className="bg-[#231F1C] text-[#F5D061]">
                          {ag.name} ({ag.role === 'temple_admin' ? '신도회장' : ag.role === 'master' ? '총괄위원장' : '포교위원장'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10.5px] text-[#BFB6AA] whitespace-nowrap">산하 인연 신도</div>
                  <div className="text-base sm:text-lg font-bold text-[#F5D061] mt-0.5 whitespace-nowrap">
                    {myAffiliatedMembers.filter((m) => m.role === 'believer').length}명
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10.5px] text-[#BFB6AA] whitespace-nowrap">위패 봉안 누적</div>
                  <div className="text-base sm:text-lg font-bold text-white mt-0.5 whitespace-nowrap">
                    {myAffiliatedMembers.reduce((sum, m) => sum + (Number(m.wipae_count) || 0), 0)}기
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10.5px] text-[#BFB6AA] whitespace-nowrap">직접 포교 요율</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5 whitespace-nowrap">
                    {activeAgent.role === 'master' ? '50%' : '40%'}
                  </div>
                </div>
              </div>

              {/* 판권 및 포교비 집행 안내 카드 (백분율 요율제 & 실입금 정산) */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#1F1B17] to-[#2A231C] border border-[#C59B27]/35 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F5D061] flex items-center gap-1">
                    <span>📜</span>
                    <span>
                      {activeAgent.role === 'committee_member'
                        ? '포교위원 (30% 요율) 불사 포교비 규정'
                        : '포교위원장 (40% 요율) 불사 포교비 규정'}
                    </span>
                  </span>
                  <span className="text-[10.5px] text-[#A69B8D]">실입금액 기준 실시간 자동 정산</span>
                </div>
                <div className="space-y-1.5 text-[11.5px] text-[#E8DFD1]">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/25">
                    <span className="text-[#C59B27] font-semibold">① 본인 직접 유치 성사 포교비</span>
                    <strong className="text-emerald-400 font-bold">
                      실입금액의 {activeAgent.role === 'committee_member' ? '30%' : '40%'}
                    </strong>
                  </div>
                  {activeAgent.role !== 'committee_member' && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/25">
                      <span className="text-[#C59B27] font-semibold">② 산하 포교위원 성사 시 관리 수당</span>
                      <strong className="text-[#F5D061] font-bold">실입금액의 10%</strong>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/25">
                    <span className="text-[#A69B8D]">③ 제주 소원사 사찰 봉안 불사금</span>
                    <span className="text-white font-medium">실입금액의 50%</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#8C8071] pt-1 border-t border-white/10 flex justify-between">
                  <span>※ 분납(할부) 입금 시에도 입금되는 즉시 해당 요율대로 분할 정산됩니다.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181512] border border-[#C59B27]/30 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#D6CEC2] font-medium whitespace-nowrap">
                    전용 포교 링크 (뒤 8자리)
                  </span>
                  <span className="text-[11px] text-[#F5D061] font-bold whitespace-nowrap shrink-0">
                    코드: {activeAgent.code}
                  </span>
                </div>
                {/* 전용 포교 링크 주소 및 원터치 복사 배지 */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://sowonpray.vercel.app/?ref=${activeAgent.code}`}
                    className="flex-1 bg-[#26211C] text-[#E8DFD1] text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none min-w-0 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyRefLink(activeAgent.code)}
                    className="w-10 h-10 rounded-xl bg-[#F5D061] text-[#1B1815] font-bold flex items-center justify-center shrink-0 hover:brightness-105 active:scale-95 transition shadow-sm"
                    title="전용 포교 링크 복사"
                  >
                    <Copy className="w-4 h-4 shrink-0" />
                  </button>
                </div>

                {/* 하단 보조 액션 버튼 (전용 QR 코드 / 모바일 명함) */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleToggleQr(activeAgent.code)}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition border ${
                      showQrCode === activeAgent.code
                        ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                        : 'bg-white/10 text-[#FAF8F5] border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 shrink-0" />
                    <span>전용 QR 코드</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessCardTarget(activeAgent)
                      setShowBusinessCardModal(true)
                    }}
                    className="py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition bg-gradient-to-r from-[#C59B27] to-[#F5D061] text-[#1B1815] shadow-xs cursor-pointer hover:brightness-110"
                    title="해당 포교위원의 모바일 전자명함 보기"
                  >
                    <span>🪪 모바일 전자명함</span>
                  </button>
                </div>

                {showQrCode === activeAgent.code && (
                  <div className="mt-3 p-4 rounded-xl bg-[#26211C] border border-[#C59B27]/40 flex flex-col items-center text-center space-y-2.5">
                    <span className="text-[11px] font-bold text-[#F5D061]">
                      {activeAgent.name} 포교위원 전용 QR코드
                    </span>
                    {qrDataUrl && (
                      <div className="p-3 bg-white rounded-2xl border-2 border-[#C59B27] shadow-md inline-block">
                        <img
                          src={qrDataUrl}
                          alt="포교위원 QR코드"
                          className="w-40 h-40 rounded-lg"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadQr(activeAgent.name, activeAgent.code)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#F5D061] text-[#1B1815] text-xs font-bold shadow hover:brightness-105 transition"
                    >
                      QR 이미지 저장
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 나의 인연 신도 도량 방문 & 사찰 공양(식사) 예약 현황 */}
            {(() => {
              const agentVisits = visits.filter((v) => isAdmin || v.agent_code === activeAgent.code)
              const displayVisits = isAgentVisitListExpanded ? agentVisits : agentVisits.slice(0, 3)
              const totalHeadcount = agentVisits.reduce((acc, cur) => acc + (Number(cur.headcount) || 1), 0)

              return (
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Coffee className="w-4 h-4 text-[#9A7418] shrink-0" />
                      <div>
                        <h3 className="font-serif-kr font-bold text-sm sm:text-base text-[#231F1C]">
                          인연 신도 방문 · 공양(식사) 예약 현황
                        </h3>
                        <p className="text-[11px] text-[#8C7A5B] mt-0.5">
                          기본 3건 표시 (총 {agentVisits.length}건 · 총 {totalHeadcount}명 준비)
                        </p>
                      </div>
                    </div>
                    {agentVisits.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setIsAgentVisitListExpanded(!isAgentVisitListExpanded)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#6E5617] border border-[#DDD4C4] text-xs font-bold flex items-center gap-1 transition shrink-0"
                      >
                        <span>{isAgentVisitListExpanded ? '접기 ▲' : '펼치기 ▼'}</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {displayVisits.length === 0 ? (
                      <div className="p-8 text-center text-sm text-[#8C7A5B] bg-[#FAF8F5] rounded-xl border border-dashed border-[#EAE2D3]">
                        접수된 방문 및 공양 예약 내역이 없습니다.
                      </div>
                    ) : (
                      displayVisits.map((v) => {
                        const visitorDisplayName = v.visitor_name && v.visitor_name !== '.' ? v.visitor_name : '인연 신도'
                        return (
                          <div
                            key={v.id}
                            className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs font-bold text-[#231F1C] truncate">
                                  🍵 {visitorDisplayName}
                                </span>
                                {v.visitor_phone && v.visitor_phone !== '.' && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[11px] text-[#786E63]">({v.visitor_phone})</span>
                                    <a
                                      href={`tel:${v.visitor_phone.replace(/[^0-9]/g, '')}`}
                                      className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition flex items-center justify-center w-6 h-6 shadow-2xs"
                                      title={`${visitorDisplayName}님께 전화 걸기`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Phone className="w-3 h-3" />
                                    </a>
                                    <a
                                      href={`sms:${v.visitor_phone.replace(/[^0-9]/g, '')}`}
                                      className="p-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60 transition flex items-center justify-center w-6 h-6 shadow-2xs"
                                      title={`${visitorDisplayName}님께 문자 보내기`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                                <span className="px-2 py-0.5 rounded-md bg-[#231F1C] text-[#F5D061] text-[11px] font-extrabold whitespace-nowrap shrink-0">
                                  방문 {v.headcount}명 (공양 {v.headcount}인분)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setVisits((prev) =>
                                    prev.map((item) =>
                                      item.id === v.id
                                        ? {
                                            ...item,
                                            status:
                                              item.status === 'confirmed' ? 'reserved' : 'confirmed',
                                          }
                                        : item
                                    )
                                  )
                                  showToast('방문 및 사찰 공양 준비 상태가 변경되었습니다.')
                                }}
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                                  v.status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {v.status === 'confirmed' ? '✓ 공양준비확정' : '예약접수 (터치시 확정)'}
                              </button>
                            </div>
                            <div className="text-xs text-[#8A6510] font-semibold">
                              방문일시: {v.visit_date} · {v.visit_time} · 정확히 {v.headcount}명 방문
                            </div>
                            <div className="text-xs text-[#4A433C]">
                              목적: {v.visit_purpose} / “{v.memo}”
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {agentVisits.length > 3 && (
                    <div className="pt-2 border-t border-[#EAE2D3]">
                      <button
                        type="button"
                        onClick={() => setIsAgentVisitListExpanded(!isAgentVisitListExpanded)}
                        className="w-full py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#6E5617] border border-[#DDD4C4] text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs"
                      >
                        <span>
                          {isAgentVisitListExpanded
                            ? '예약 목록 3개만 보기 (접기) ▲'
                            : `예약 명단 더보기 (+${agentVisits.length - 3}건 모두 펼치기) ▼`}
                        </span>
                      </button>
                    </div>
                  )}
                </section>
              )
            })()}

            {/* 뷰 모드 전환 버튼: 조직도 트리 vs 인연 신도 축원 리스트 */}
            <div className="flex items-center justify-between gap-2 p-1 bg-[#231F1C] rounded-xl border border-[#C59B27]/40">
              <button
                type="button"
                onClick={() => setAgentViewMode('tree')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  agentViewMode === 'tree'
                    ? 'bg-[#F5D061] text-[#1B1815] shadow'
                    : 'text-[#D6CEC2] hover:text-white'
                }`}
              >
                <span>🌿 포교 인연 계보도 (Tree)</span>
              </button>
              <button
                type="button"
                onClick={() => setAgentViewMode('list')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  agentViewMode === 'list'
                    ? 'bg-[#F5D061] text-[#1B1815] shadow'
                    : 'text-[#D6CEC2] hover:text-white'
                }`}
              >
                <span>📋 인연 신도 축원 현황</span>
              </button>
            </div>

            {/* [모드 1] 포교 추천 조직도 트리 뷰 */}
            {agentViewMode === 'tree' && (
              <OrganizationTreeView
                members={members}
                rootCode={isAdmin ? null : activeAgent.code}
                activeAgentCode={activeAgent.code}
                onSelectMember={(m) => {
                  showToast(`[${m.name}] 포교 파트너 (코드: ${m.code}) 선택됨`)
                }}
              />
            )}

            {/* [모드 2] 나의 인연 신도 리스트 */}
            {agentViewMode === 'list' && (() => {
              const agentPrayers = prayers.filter((p) => isAdmin || p.agent_code === activeAgent.code)
              const query = agentPrayerSearchQuery.trim().toLowerCase()
              const filteredPrayers = query
                ? agentPrayers.filter(
                    (p) =>
                      (p.believer_name && p.believer_name.toLowerCase().includes(query)) ||
                      (p.believer_phone && p.believer_phone.includes(query)) ||
                      (p.wish_category && p.wish_category.toLowerCase().includes(query)) ||
                      (p.wish_text && p.wish_text.toLowerCase().includes(query))
                  )
                : agentPrayers

              const isSearching = query.length > 0
              const displayPrayers = (isSearching || isAgentPrayerListExpanded)
                ? filteredPrayers
                : filteredPrayers.slice(0, 5)

              return (
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-serif-kr font-bold text-base text-[#231F1C]">
                        나의 인연 신도 축원 및 상담 현황
                      </h3>
                      <p className="text-[11px] text-[#8C7A5B] mt-0.5">
                        {isSearching
                          ? `검색 결과 ${filteredPrayers.length}건 (전체 ${agentPrayers.length}건)`
                          : `기본 5건 표시 (총 ${agentPrayers.length}건)`}
                      </p>
                    </div>
                    {!isSearching && agentPrayers.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setIsAgentPrayerListExpanded(!isAgentPrayerListExpanded)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#6E5617] border border-[#DDD4C4] text-xs font-bold flex items-center gap-1 transition shrink-0"
                      >
                        <span>{isAgentPrayerListExpanded ? '접기 ▲' : '펼치기 ▼'}</span>
                      </button>
                    )}
                  </div>

                  {/* 3번: 신도 이름 및 발원 내용 간이 검색창 */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#9A7418] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={agentPrayerSearchQuery}
                      onChange={(e) => setAgentPrayerSearchQuery(e.target.value)}
                      placeholder="신도 성함, 연락처, 발원 내용 빠른 검색..."
                      className="w-full bg-[#FAF8F5] text-xs pl-8.5 pr-8 py-2 rounded-xl border border-[#E0D7C6] focus:outline-none focus:border-[#C59B27] placeholder:text-[#A69B8D]"
                    />
                    {agentPrayerSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setAgentPrayerSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A69B8D] hover:text-[#231F1C] p-0.5 transition"
                        title="검색어 지우기"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {displayPrayers.length === 0 ? (
                      <div className="p-8 text-center text-sm text-[#8C7A5B] bg-[#FAF8F5] rounded-xl border border-dashed border-[#EAE2D3]">
                        {isSearching
                          ? '검색 조건에 맞는 신도 축원 내역이 없습니다.'
                          : '접수된 인연 신도 축원 내역이 없습니다.'}
                      </div>
                    ) : (
                      displayPrayers.map((p) => {
                        const cleanPhone = p.believer_phone ? p.believer_phone.replace(/[^0-9]/g, '') : ''
                        return (
                          <div
                            key={p.id}
                            className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <UserCheck className="w-4 h-4 text-[#9A7418] shrink-0" />
                                <span className="text-xs font-bold text-[#231F1C] truncate">
                                  {p.believer_name}
                                </span>
                                {p.believer_phone && (
                                  <span className="text-[11px] text-[#786E63] shrink-0">
                                    ({p.believer_phone})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* 1번: 신도 원터치 전화/문자 연결 버튼 */}
                                {cleanPhone && (
                                  <div className="flex items-center gap-1">
                                    <a
                                      href={`tel:${cleanPhone}`}
                                      className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition flex items-center justify-center w-6 h-6 shadow-2xs"
                                      title={`${p.believer_name}님께 전화 통화`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Phone className="w-3 h-3" />
                                    </a>
                                    <a
                                      href={`sms:${cleanPhone}`}
                                      className="p-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60 transition flex items-center justify-center w-6 h-6 shadow-2xs"
                                      title={`${p.believer_name}님께 문자 발송`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFE7D6] text-[#7D6320]">
                                  {p.status === 'consulting' ? '위패상담중' : '축원진행중'}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs text-[#4A433C]">
                              최근 발원: <strong className="text-[#8A6510]">[{p.wish_category}]</strong> “{p.wish_text}”
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-[#8C7A5B] pt-1 border-t border-[#EFE9DD]">
                              <span>접수일시: {formatPrayerDate(p.created_at)}</span>
                              <span>담당코드: {p.agent_code}</span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {!isSearching && agentPrayers.length > 5 && (
                    <div className="pt-2 border-t border-[#EAE2D3]">
                      <button
                        type="button"
                        onClick={() => setIsAgentPrayerListExpanded(!isAgentPrayerListExpanded)}
                        className="w-full py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE6] text-[#6E5617] border border-[#DDD4C4] text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs"
                      >
                        <span>
                          {isAgentPrayerListExpanded
                            ? '축원 목록 5개만 보기 (접기) ▲'
                            : `축원 명단 더보기 (+${agentPrayers.length - 5}건 모두 펼치기) ▼`}
                        </span>
                      </button>
                    </div>
                  )}
                </section>
              )
            })()}
          </main>
  )
}
