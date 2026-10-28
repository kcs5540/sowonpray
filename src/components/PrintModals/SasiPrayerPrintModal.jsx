import React from 'react'
import { createPortal } from 'react-dom'
import { Printer, X } from 'lucide-react'
import { computeZodiacAndGanji } from '../../lib/supabase'

// 📅 축원 접수일시 포맷팅 헬퍼
function formatPrayerDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = d.getHours()
  const min = d.getMinutes()
  return `${m}/${day} ${h}:${min < 10 ? '0' : ''}${min}`
}

// 📿 [대웅전 사시예불 축원 명부 A4 공식 인쇄 모달]
export default function SasiPrayerPrintModal({
  isOpen = true,
  onClose,
  activeSasiPrayers = [],
  filteredSasiPrayers = [],
  sasiPrayedCheckedIds = new Set(),
  toggleSasiPrayedCheck,
  sasiPrayerTypeTab = 'all',
  setSasiPrayerTypeTab,
  members = [],
}) {
  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  return createPortal(

          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-4xl bg-white text-[#111111] rounded-2xl shadow-2xl flex flex-col my-auto border border-[#E5D399] overflow-hidden">
              <div className="no-print bg-[#1B1815] text-[#FAF8F5] p-3.5 sm:p-4 flex flex-col gap-2.5 border-b-2 border-[#D4AF37]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#1B1815] flex items-center justify-center font-bold text-sm shrink-0">
                      卍
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif-kr text-sm sm:text-base font-bold text-[#F5D061] truncate">
                        오늘의 대웅전 사시예불 축원 명부 (7일 유효 신도 전용)
                      </h3>
                      <p className="text-[11px] text-[#D6CEC2] truncate">
                        접수 7일 이내 정진 불자 (총 {activeSasiPrayers.length}위 중 {filteredSasiPrayers.length}위 표시 · {sasiPrayedCheckedIds.size}위 축원 완료)
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

                <div className="flex items-center gap-1 pt-1 overflow-x-auto no-scrollbar text-xs">
                  <button
                    type="button"
                    onClick={() => setSasiPrayerTypeTab('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                      sasiPrayerTypeTab === 'all'
                        ? 'bg-[#F5D061] text-[#1B1815]'
                        : 'bg-white/10 text-[#C5BBAF] hover:bg-white/20'
                    }`}
                  >
                    전체 사시예불 ({activeSasiPrayers.length}위)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSasiPrayerTypeTab('lantern_1d')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                      sasiPrayerTypeTab === 'lantern_1d'
                        ? 'bg-[#F5D061] text-[#1B1815]'
                        : 'bg-white/10 text-[#C5BBAF] hover:bg-white/20'
                    }`}
                  >
                    1일 소원등 ({activeSasiPrayers.filter((p) => (p.duration_days === 1 || p.prayer_type === 'lantern_1d')).length}위)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSasiPrayerTypeTab('prayer_100d')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                      sasiPrayerTypeTab === 'prayer_100d'
                        ? 'bg-[#F5D061] text-[#1B1815]'
                        : 'bg-white/10 text-[#C5BBAF] hover:bg-white/20'
                    }`}
                  >
                    100일 특별기도 ({activeSasiPrayers.filter((p) => p.prayer_type === 'prayer_100d').length}위)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSasiPrayerTypeTab('indeung_1yr')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                      sasiPrayerTypeTab === 'indeung_1yr'
                        ? 'bg-[#F5D061] text-[#1B1815]'
                        : 'bg-white/10 text-[#C5BBAF] hover:bg-white/20'
                    }`}
                  >
                    🏮 대웅전 1년 인등 명패 ({activeSasiPrayers.filter((p) => p.prayer_type === 'indeung_1yr').length}위)
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible font-serif-kr">
                {filteredSasiPrayers.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#777777] border border-dashed border-[#CCCCCC] rounded-xl">
                    현재 조건에 해당하는 사시예불 접수 내역이 없습니다.
                  </div>
                ) : sasiPrayerTypeTab === 'indeung_1yr' ? (
                  <div className="space-y-4">
                    {filteredSasiPrayers.map((p, idx) => {
                      const member = (members || []).find((m) => m.code === p.member_code) || null
                      const familyList = member?.family_members && member.family_members.length > 0
                        ? member.family_members
                        : [
                            {
                              id: 'fm-default',
                              relation: '세주(가장)',
                              name: p.believer_name?.split(' ')[0] || '불자',
                              birth_year: member?.birth_date?.slice(0, 4) || '1964',
                              lunar_solar: member?.lunar_solar || '음력',
                              ganji: computeZodiacAndGanji(member?.birth_date?.slice(0, 4) || '1964').ganji,
                              animal: computeZodiacAndGanji(member?.birth_date?.slice(0, 4) || '1964').animal,
                              dharma_name: member?.dharma_name || '',
                            },
                          ]

                      return (
                        <div
                          key={p.id || idx}
                          className="border-2 border-[#C59B27] p-4 sm:p-5 rounded-2xl bg-[#FAF6EE] relative shadow-sm page-break-inside-avoid"
                        >
                          <div className="flex items-center justify-between border-b border-[#D5C59B] pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base text-[#8A6510]">🏮</span>
                              <span className="font-serif-kr font-extrabold text-sm sm:text-base text-[#241E17]">
                                제주 소원사 대웅전 1년 인등(가족등) 봉안 명패 #{idx + 1}
                              </span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#EFE3C3] text-[#7A5B0B] text-xs font-bold border border-[#D5C59B]">
                              365일 상시 축원등
                            </span>
                          </div>

                          <div className="text-xs text-[#554E45] font-serif-kr mb-3 flex items-center gap-2">
                            <span className="font-bold text-[#8A6510]">주소:</span>
                            <span>{member?.address || '제주특별자치도 제주시 (소원사 도량)'}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3.5">
                            {familyList.map((f, fIdx) => (
                              <div
                                key={f.id || fIdx}
                                className="p-3 rounded-xl bg-white border border-[#DDD3C1] text-xs font-serif-kr space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#8A6510] text-[11px] px-1.5 py-0.2 rounded bg-[#FAF3DF]">
                                    {f.relation}
                                  </span>
                                  <span className="text-[10.5px] text-[#777777]">
                                    {f.lunar_solar || '음력'}
                                  </span>
                                </div>
                                <div className="text-sm font-black text-[#1B1815] pt-0.5">
                                  {f.name}
                                  {f.dharma_name && (
                                    <span className="text-xs text-[#8A6510] font-normal ml-1">
                                      ({f.dharma_name})
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#554E45]">
                                  {f.ganji ? `${f.ganji} (${f.animal})` : `${f.birth_year || '연도'}생`}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#F0EAE1] border border-[#DDD3C1] text-xs text-[#3A3228] font-serif-kr leading-relaxed flex items-start gap-2">
                            <span className="font-bold text-[#8A6510] shrink-0">가내 길상 발원:</span>
                            <span>“{p.wish_text || '사시사철 온 가족 무병장수하고 가업이 날로 번창하기를 지심 축원합니다.'}”</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-[#333333] text-xs">
                      <thead>
                        <tr className="bg-[#F0EDE4] text-[#111111] font-bold text-center border-b border-[#333333]">
                          <th className="p-2 border-r border-[#333333] w-12 text-center no-print">축원</th>
                          <th className="p-2 border-r border-[#333333] w-12 text-center">연번</th>
                          <th className="p-2 border-r border-[#333333] w-36">신청자 / 축원대상</th>
                          <th className="p-2 border-r border-[#333333] w-28 text-center">기원 분야</th>
                          <th className="p-2 border-r border-[#333333]">부처님 전 지극지성 발원문</th>
                          <th className="p-2 border-r border-[#333333] w-20 text-center">정진 기간</th>
                          <th className="p-2 w-24 text-center">접수일</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSasiPrayers.map((p, idx) => {
                          const isPrayed = sasiPrayedCheckedIds.has(p.id)
                          return (
                            <tr
                              key={p.id}
                              className={`border-b border-[#DDDDDD] hover:bg-[#FAF8F4] transition ${
                                isPrayed ? 'bg-amber-50/50' : ''
                              }`}
                            >
                              <td className="p-2 text-center border-r border-[#DDDDDD] no-print">
                                <input
                                  type="checkbox"
                                  checked={isPrayed}
                                  onChange={() => toggleSasiPrayedCheck(p.id)}
                                  className="w-4 h-4 accent-[#8A6510] cursor-pointer"
                                />
                              </td>
                              <td className="p-2.5 text-center font-bold border-r border-[#DDDDDD] text-[#555555]">
                                {idx + 1}
                              </td>
                              <td className="p-2.5 font-bold font-serif-kr border-r border-[#DDDDDD] text-sm text-[#111111]">
                                {p.believer_name}
                              </td>
                              <td className="p-2.5 font-semibold text-center border-r border-[#DDDDDD] text-[#8A6510]">
                                [{p.wish_category}]
                              </td>
                              <td className="p-2.5 text-[#222222] leading-snug border-r border-[#DDDDDD] break-keep font-serif-kr">
                                “{p.wish_text}”
                              </td>
                              <td className="p-2.5 text-center font-bold border-r border-[#DDDDDD] text-[#B8860B]">
                                {p.duration_days ? `${p.duration_days}일` : `D-${p.daysLeft}`}
                              </td>
                              <td className="p-2.5 text-center text-[11px] text-[#666666] whitespace-nowrap">
                                {formatPrayerDate(p.created_at)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="pt-4 border-t-2 border-[#222222] grid grid-cols-2 gap-3 text-center text-[11px] font-serif-kr">
                  <div className="border border-[#444444] p-2.5 rounded-lg bg-[#FAF8F5]">
                    <div className="text-[10px] text-[#666666]">대웅전 축원 증명</div>
                    <div className="font-extrabold text-[#111111] mt-1 text-xs">대한불교 본원종 제주 소원사</div>
                    <div className="text-[10.5px] font-bold text-[#8A6510] mt-0.5">주지스님 직인 (인)</div>
                  </div>
                  <div className="border border-[#444444] p-2.5 rounded-lg bg-[#FAF8F5]">
                    <div className="text-[10px] text-[#666666]">사찰 본부 증명</div>
                    <div className="font-extrabold text-[#111111] mt-1 text-xs">소원사 창건주 양영문 본부</div>
                    <div className="text-[10.5px] font-bold text-[#8A6510] mt-0.5">창건주 회장 직인 (인)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  , document.body)
}
