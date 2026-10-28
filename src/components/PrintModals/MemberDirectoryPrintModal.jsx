import React from 'react'
import { createPortal } from 'react-dom'
import { Printer, Search, X } from 'lucide-react'

// 📋 [소원사 모바일법당 공식 회원명부 A4 인쇄 모달]
export default function MemberDirectoryPrintModal({
  isOpen = true,
  onClose,
  members = [],
  filteredPrintMembers = [],
  memberPrintRoleFilter = 'all',
  setMemberPrintRoleFilter,
  memberPrintSearchQuery = '',
  setMemberPrintSearchQuery,
}) {
  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  return createPortal(

          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-4xl bg-white text-[#111111] rounded-2xl shadow-2xl flex flex-col my-auto border border-[#E5D399] overflow-hidden">
              {/* 모달 상단 조작 바 (인쇄 시 숨김: no-print) */}
              <div className="no-print bg-[#1B1815] text-[#FAF8F5] p-3.5 sm:p-4 flex flex-col gap-2.5 border-b-2 border-[#D4AF37]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#1B1815] flex items-center justify-center font-bold text-sm shrink-0">
                      卍
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif-kr text-sm sm:text-base font-bold text-[#F5D061] truncate">
                        소원사 모바일법당 공식 회원명부 (A4 인쇄)
                      </h3>
                      <p className="text-[11px] text-[#D6CEC2] truncate">
                        사찰본부 보관용 · 총 {members.length}명 중 {filteredPrintMembers.length}명 표시
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs flex items-center gap-1.5 shadow hover:brightness-105 active:scale-95 transition whitespace-nowrap"
                    >
                      <Printer className="w-4 h-4" />
                      <span>A4 인쇄하기</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onClose()}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition"
                      title="닫기"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 인쇄 전 필터 & 검색 툴바 (no-print) */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/10 flex-wrap text-xs">
                  <div className="relative flex-1 min-w-[160px]">
                    <Search className="w-3.5 h-3.5 text-[#D6CEC2] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={memberPrintSearchQuery}
                      onChange={(e) => setMemberPrintSearchQuery(e.target.value)}
                      placeholder="신도 성함, 법명, 연락처, 주소 검색"
                      className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white/10 border border-white/20 text-[#FAF8F5] text-xs placeholder:text-[#A89D8E] focus:outline-none focus:border-[#F5D061]"
                    />
                    {memberPrintSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMemberPrintSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#D6CEC2] hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
                    {[
                      { id: 'all', label: `전체 (${members.length})` },
                      { id: 'believer', label: `일반신도 (${members.filter((m) => m.role === 'believer').length})` },
                      { id: 'agent', label: `포교위원장 (${members.filter((m) => m.role === 'agent' || m.role === 'master').length})` },
                      { id: 'leadership', label: `신도회장 (${members.filter((m) => m.role === 'temple_admin').length})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setMemberPrintRoleFilter(tab.id)}
                        className={`px-2 py-1 rounded-md font-bold whitespace-nowrap transition ${
                          memberPrintRoleFilter === tab.id
                            ? 'bg-[#F5D061] text-[#1B1815]'
                            : 'bg-white/10 text-[#D6CEC2] hover:bg-white/20'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 실제 A4 인쇄 영역 (#printable-member-sheet) */}
              <div id="printable-member-sheet" className="p-6 sm:p-8 space-y-4 bg-white text-[#111111]">
                {/* 전통 사찰 헤더 */}
                <div className="text-center border-b-2 border-[#222222] pb-3.5">
                  <div className="text-xs text-[#555555] tracking-widest mb-1 font-serif-kr">
                    卍 濟州 願成寺 · 소원성취 기도도량 제주 소원사 본부
                  </div>
                  <h1 className="font-serif-kr text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
                    제주 소원사 모바일법당 공식 회원명부
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-xs font-semibold text-[#444444] mt-2 flex-wrap">
                    <span>
                      발행 일시: {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일
                    </span>
                    <span>·</span>
                    <span>
                      총 등재 인원: <strong>{filteredPrintMembers.length}명</strong> (일반신도 {filteredPrintMembers.filter((m) => m.role === 'believer').length}명 · 포교위원회 {filteredPrintMembers.filter((m) => m.role !== 'believer').length}명)
                    </span>
                  </div>
                </div>

                {/* 안내 문구 */}
                <div className="text-xs text-[#444444] bg-[#F9F7F2] p-2.5 rounded-lg border border-[#E8E2D2] flex justify-between items-center text-[11px]">
                  <span>
                    ※ 본 명부는 <strong>제주 소원사 모바일법당</strong>에 공식 등재된 신도 및 포교위원회 관리 대장으로, 사찰 본부 보관 및 행정 관리 전용입니다.
                  </span>
                  <span className="font-bold text-[#111111] shrink-0 ml-2">사찰본부 영구보관용</span>
                </div>

                {/* 회원 명부 테이블 */}
                {filteredPrintMembers.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#777777] font-serif-kr border border-dashed border-[#CCCCCC] rounded-xl">
                    현재 조건에 해당하는 회원이 없습니다.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-[#333333] text-xs">
                      <thead>
                        <tr className="bg-[#F0EDE4] text-[#111111] font-bold text-center border-b border-[#333333]">
                          <th className="p-2 border-r border-[#333333] w-10 text-center">연번</th>
                          <th className="p-2 border-r border-[#333333] w-28">성함 (법명)</th>
                          <th className="p-2 border-r border-[#333333] w-24 text-center">직책 / 구분</th>
                          <th className="p-2 border-r border-[#333333] w-28 text-center">연락처</th>
                          <th className="p-2 border-r border-[#333333]">거주 주소</th>
                          <th className="p-2 border-r border-[#333333] w-28 text-center">추천인</th>
                          <th className="p-2 border-r border-[#333333] w-20 text-center">등록일</th>
                          <th className="p-2 w-16 text-center">확인/인</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPrintMembers.map((m, idx) => {
                          const recommenderName = getRecommenderName(m.parent_code)
                          const roleLabel =
                            m.role === 'temple_admin'
                              ? '신도회장'
                              : m.role === 'master'
                              ? '총괄위원장'
                              : m.role === 'agent'
                              ? '포교위원장'
                              : '일반신도'
                          return (
                            <tr
                              key={m.code || idx}
                              className="border-b border-[#DDDDDD] hover:bg-[#FAF8F4] transition"
                            >
                              <td className="p-2 text-center font-bold border-r border-[#DDDDDD] text-[#555555]">
                                {idx + 1}
                              </td>
                              <td className="p-2 font-bold font-serif-kr border-r border-[#DDDDDD] text-sm text-[#111111]">
                                {m.name}
                                {m.dharma_name && (
                                  <span className="text-[#8A6510] text-xs font-normal ml-1">
                                    ({m.dharma_name})
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-center border-r border-[#DDDDDD] text-[11px] font-semibold">
                                <span className={`px-1.5 py-0.5 rounded ${
                                  m.role === 'temple_admin' ? 'bg-amber-100 text-amber-900 font-bold' :
                                  m.role === 'master' ? 'bg-purple-100 text-purple-900 font-bold' :
                                  m.role === 'agent' ? 'bg-amber-50 text-amber-800 font-semibold' :
                                  m.role === 'committee_member' ? 'bg-teal-50 text-teal-800' :
                                  'text-neutral-700'
                                }`}>
                                  {roleLabel}
                                </span>
                              </td>
                              <td className="p-2 text-center border-r border-[#DDDDDD] text-[11px] font-mono text-[#333333]">
                                {m.phone || '-'}
                              </td>
                              <td className="p-2 text-[#333333] border-r border-[#DDDDDD] text-[11px] truncate max-w-[180px]">
                                {m.address || '-'}
                              </td>
                              <td className="p-2 text-center border-r border-[#DDDDDD] text-[11px] text-[#666666]">
                                {recommenderName}
                              </td>
                              <td className="p-2 text-center text-[10.5px] border-r border-[#DDDDDD] text-[#777777]">
                                {m.joined_at ? m.joined_at.slice(0, 10) : '2026.03'}
                              </td>
                              <td className="p-2 text-center text-[10px] text-[#999999]">
                                (인)
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 전통 사찰 공식 직인 및 검인란 (A4 인쇄 시 사찰 공인 서류 품격 완성) */}
                <div className="pt-4 border-t-2 border-[#222222] grid grid-cols-2 gap-3 text-center text-[11px] font-serif-kr">
                  <div className="border border-[#444444] p-2.5 rounded-lg bg-[#FAF8F5]">
                    <div className="text-[10px] text-[#666666]">사찰 본부 대표</div>
                    <div className="font-extrabold text-[#111111] mt-1 text-xs">창건주 · 신도회장</div>
                    <div className="text-[10.5px] font-bold text-[#8A6510] mt-0.5">양영문 (인)</div>
                  </div>
                  <div className="border border-[#444444] p-2.5 rounded-lg bg-[#FAF8F5]">
                    <div className="text-[10px] text-[#666666]">대웅전 축원 증명</div>
                    <div className="font-extrabold text-[#111111] mt-1 text-xs">대한불교 본원종 제주 소원사</div>
                    <div className="text-[10.5px] font-bold text-[#8A6510] mt-0.5">주지스님 직인 (인)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  , document.body)
}
