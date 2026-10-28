import React from 'react'
import { createPortal } from 'react-dom'
import { Printer, X } from 'lucide-react'

// 📜 [개인 신도 교적대장(신적부)] 종합 A4 원터치 인쇄 모달
export default function IndividualRecordPrintModal({
  isOpen = true,
  onClose,
  member,
  prayers = [],
  settlements = [],
}) {
  if (!isOpen || !member) return null
  if (typeof document === 'undefined') return null

  const m = member

    // 가족 목록
    const familyList = Array.isArray(m.family_members) ? m.family_members : []

    // 소원등 누적 기록
    const histPrayers = (prayers || []).filter(
      (p) =>
        p.member_code === m.code ||
        (m.phone && p.believer_phone && p.believer_phone.replace(/[^0-9]/g, '') === m.phone.replace(/[^0-9]/g, '')) ||
        (p.believer_name && p.believer_name.includes(m.name))
    ).sort((a, b) => new Date(b.created_at || '2026-01-01').getTime() - new Date(a.created_at || '2026-01-01').getTime())

    // 사찰 불사 누적 기록
    const histSettlements = (settlements || []).filter(
      (s) =>
        (s.member_code && s.member_code === m.code) ||
        (s.believer_name && s.believer_name.includes(m.name))
    ).sort((a, b) => new Date(b.created_at || '2026-01-01').getTime() - new Date(a.created_at || '2026-01-01').getTime())

    const totalDonation = histSettlements.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0)

    return createPortal(
      <div id="individual-record-portal-root" className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-4xl bg-white text-[#111111] rounded-2xl shadow-2xl flex flex-col my-auto border border-[#E5D399] overflow-hidden max-h-[92vh]">
          {/* 상단 조작 바 (인쇄 시 숨김) */}
          <div className="no-print bg-[#1B1815] text-[#FAF8F5] p-3.5 sm:p-4 flex items-center justify-between gap-3 border-b-2 border-[#D4AF37]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#1B1815] flex items-center justify-center font-bold text-sm shrink-0">
                卍
              </div>
              <div className="min-w-0">
                <h3 className="font-serif-kr text-sm sm:text-base font-bold text-[#F5D061] truncate">
                  개인 신도 교적대장 (신적부) 종합 A4 공식 인쇄
                </h3>
                <p className="text-[11px] text-[#D6CEC2] truncate">
                  {m.name} 불자님 (교적: {m.code || '미부여'}) · 역대 소원등 {histPrayers.length}건 · 사찰불사 {histSettlements.length}건
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs flex items-center gap-1.5 shadow hover:brightness-105 active:scale-95 transition"
              >
                <Printer className="w-4 h-4" />
                <span>A4 인쇄하기</span>
              </button>
              <button
                type="button"
                onClick={() => onClose()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* A4 인쇄 대상 본문 (A4 1장 완결 맞춤형 규격) */}
          <div className="overflow-y-auto p-4 sm:p-8 pb-16 bg-[#1F1C19]/85 flex flex-col items-center">
            <div
              id="printable-individual-record"
              className="w-full max-w-[210mm] bg-white p-6 sm:p-8 pb-8 font-serif-kr text-[#111] shadow-2xl border-2 border-[#D4AF37] space-y-3 text-xs mb-8"
            >
              {/* 상단 헤더 */}
              <div className="text-center pb-2 border-b-2 border-[#1B1815]">
                <div className="flex items-center justify-between text-[10px] text-[#666] mb-0.5">
                  <span>교적대장 등록번호: {m.code || '소원사-신도'}</span>
                  <span>인쇄일자: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAF3E0] border border-[#D4AF37] text-[10px] text-[#8A6510] font-bold mb-1">
                  대한불교 본원종 제주 소원사 영구 보존 원장
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#1B1815] font-serif-kr">
                  신 도 교 적 대 장 (信 籍 簿)
                </h1>
                <p className="text-[10px] text-[#666] mt-0.5">
                  소원성취 기도도량 · 제주시 죽성서길 75 (오등동 935) · 종무소 064-805-2007
                </p>
              </div>

              {/* 1. 신도 기본 인적사항 */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#1B1815] flex items-center gap-1">
                  <span className="text-[#8A6510]">■</span> 신도 기본 인적사항
                </div>
                <table className="w-full border-collapse border border-[#333] text-[10px]">
                  <tbody>
                    <tr>
                      <th className="border border-[#333] bg-[#F7F4EB] p-1.5 w-20 text-center font-bold">성명 (세대주)</th>
                      <td className="border border-[#333] p-1.5 font-bold text-xs">{m.name}</td>
                      <th className="border border-[#333] bg-[#F7F4EB] p-1.5 w-20 text-center font-bold">법명 (法名)</th>
                      <td className="border border-[#333] p-1.5">{m.dharma_name || m.extra_data?.dharma_name || '원력행'}</td>
                      <th className="border border-[#333] bg-[#F7F4EB] p-1.5 w-20 text-center font-bold">생년월일(간지)</th>
                      <td className="border border-[#333] p-1.5">
                        {m.birth_date || m.birth || '-'} ({m.lunar_solar || '음력'}) {m.ganji || ''} {m.animal ? `${m.animal}띠` : ''}
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-[#333] bg-[#F7F4EB] p-1.5 text-center font-bold">연락처</th>
                      <td className="border border-[#333] p-1.5 font-mono">{m.phone || '-'}</td>
                      <th className="border border-[#333] bg-[#F7F4EB] p-1.5 text-center font-bold">신도 구분</th>
                      <td className="border border-[#333] p-1.5">{m.category || m.grade || '일반신도'}</td>
                      <th className="border border-[#333] bg-[#F7F4EB] p-1.5 text-center font-bold">추천 포교사</th>
                      <td className="border border-[#333] p-1.5">{m.introducer_name || m.extra_data?.introducer || '사찰직속'}</td>
                    </tr>
                    <tr>
                      <th className="border border-[#333] bg-[#F7F4EB] p-1.5 text-center font-bold">주소</th>
                      <td colSpan={5} className="border border-[#333] p-1.5">
                        {m.address ? `${m.address} ${m.address_detail || ''}` : '주소 미기재'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. 동참 가족 및 사주 명부 */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#1B1815] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[#8A6510]">■</span> 축원 동참 가족 및 사주 명부 (총 {familyList.length + 1}인)
                  </div>
                  <span className="text-[9.5px] text-[#666]">세대주 포함 가족 축원 대상</span>
                </div>
                <table className="w-full border-collapse border border-[#333] text-[9.5px] text-center">
                  <thead className="bg-[#F7F4EB]">
                    <tr>
                      <th className="border border-[#333] p-1 w-14">관계</th>
                      <th className="border border-[#333] p-1 w-20">성명</th>
                      <th className="border border-[#333] p-1 w-24">생년월일</th>
                      <th className="border border-[#333] p-1 w-12">음/양</th>
                      <th className="border border-[#333] p-1 w-16">간지(사주)</th>
                      <th className="border border-[#333] p-1 w-12">띠</th>
                      <th className="border border-[#333] p-1">개별 발원 및 특이사항</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#333] p-1 font-bold bg-[#FAF8F5]">본인(세대주)</td>
                      <td className="border border-[#333] p-1 font-bold">{m.name}</td>
                      <td className="border border-[#333] p-1 font-mono">{m.birth_date || m.birth || '-'}</td>
                      <td className="border border-[#333] p-1">{m.lunar_solar || '음력'}</td>
                      <td className="border border-[#333] p-1">{m.ganji || '-'}</td>
                      <td className="border border-[#333] p-1">{m.animal ? `${m.animal}띠` : '-'}</td>
                      <td className="border border-[#333] p-1 text-left">{m.main_wish || m.wish || '가정평안 및 소원성취'}</td>
                    </tr>
                    {familyList.map((f, i) => (
                      <tr key={i}>
                        <td className="border border-[#333] p-1 font-bold bg-[#FAF8F5]">{f.relation || `가족${i + 1}`}</td>
                        <td className="border border-[#333] p-1 font-bold">{f.name || '-'}</td>
                        <td className="border border-[#333] p-1 font-mono">{f.birth_date || f.birth || '-'}</td>
                        <td className="border border-[#333] p-1">{f.lunar_solar || '음력'}</td>
                        <td className="border border-[#333] p-1">{f.ganji || '-'}</td>
                        <td className="border border-[#333] p-1">{f.animal ? `${f.animal}띠` : '-'}</td>
                        <td className="border border-[#333] p-1 text-left">{f.wish || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 3. 역대 소원등 및 인등 기도 봉안 기록 */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#1B1815] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[#8A6510]">■</span> 역대 소원등 및 인등 기도 봉안 기록 (누적 {histPrayers.length}건)
                  </div>
                  <span className="text-[9.5px] text-[#666]">다년간 전체 봉안 대장</span>
                </div>
                <table className="w-full border-collapse border border-[#333] text-[9.5px]">
                  <thead className="bg-[#F7F4EB] text-center">
                    <tr>
                      <th className="border border-[#333] p-1 w-20">접수일자</th>
                      <th className="border border-[#333] p-1 w-24">소원 분류</th>
                      <th className="border border-[#333] p-1">발원문 / 축원문 내용</th>
                      <th className="border border-[#333] p-1 w-14">기간</th>
                      <th className="border border-[#333] p-1 w-14">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {histPrayers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border border-[#333] p-1.5 text-center text-[#888]">
                          등록된 소원등 봉안 기록이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      histPrayers.slice(0, 5).map((p, idx) => (
                        <tr key={idx}>
                          <td className="border border-[#333] p-1 text-center font-mono">
                            {(p.created_at || '').slice(0, 10)}
                          </td>
                          <td className="border border-[#333] p-1 text-center font-bold">
                            {p.wish_category || p.prayer_type || '인등기도'}
                          </td>
                          <td className="border border-[#333] p-1">
                            {p.wish_text || p.content || '-'}
                          </td>
                          <td className="border border-[#333] p-1 text-center">
                            {p.duration_days ? `${p.duration_days}일` : (p.period || '1년')}
                          </td>
                          <td className="border border-[#333] p-1 text-center font-bold">
                            {p.status === 'completed' ? '봉안완료' : p.status === 'active' || p.is_approved ? '봉안중' : '접수'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 4. 사찰 불사 및 위패 봉안 동참 기록 */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#1B1815] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[#8A6510]">■</span> 사찰 불사 · 위패 · 특별기도 동참 기록 (누적 {histSettlements.length}건 / 총 {totalDonation.toLocaleString()}원)
                  </div>
                  <span className="text-[9.5px] text-[#666]">영구 보시 원장</span>
                </div>
                <table className="w-full border-collapse border border-[#333] text-[9.5px]">
                  <thead className="bg-[#F7F4EB] text-center">
                    <tr>
                      <th className="border border-[#333] p-1 w-20">동참일자</th>
                      <th className="border border-[#333] p-1 w-28">불사 / 동참 항목</th>
                      <th className="border border-[#333] p-1 w-24 text-right">보시금액</th>
                      <th className="border border-[#333] p-1 w-16">구분</th>
                      <th className="border border-[#333] p-1">비고 및 발원</th>
                    </tr>
                  </thead>
                  <tbody>
                    {histSettlements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border border-[#333] p-1.5 text-center text-[#888]">
                          등록된 사찰 불사 동참 기록이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      histSettlements.slice(0, 5).map((s, idx) => (
                        <tr key={idx}>
                          <td className="border border-[#333] p-1 text-center font-mono">
                            {(s.created_at || '').slice(0, 10)}
                          </td>
                          <td className="border border-[#333] p-1 font-bold">
                            {s.item_name || s.title || '사찰 특별불사'}
                          </td>
                          <td className="border border-[#333] p-1 text-right font-mono font-bold">
                            {Number(s.total_amount || 0).toLocaleString()}원
                          </td>
                          <td className="border border-[#333] p-1 text-center">
                            {s.payment_status === 'paid' || !s.payment_status ? '완납·동참' : s.payment_status}
                          </td>
                          <td className="border border-[#333] p-1">
                            {s.notes || s.memo || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 하단 사찰 공식 증명 및 직인 날인처 */}
              <div className="pt-2 border-t-2 border-[#1B1815] mt-1.5">
                <p className="text-center text-[9.5px] font-bold text-[#333] mb-1.5 leading-tight">
                  위 신도 및 권속은 대한불교 본원종 제주 소원사의 정진 신도로서<br />
                  부처님 전 지극한 정성으로 소원등을 밝히고 사찰 불사에 동참하였기에 이 교적대장을 영구 보존 원장으로 기록·증명합니다.
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-[9.5px]">
                  <div className="border border-[#444] py-1.5 px-1 rounded bg-[#FAF8F5]">
                    <div className="text-[8.5px] text-[#666]">교적대장 기록 증명</div>
                    <div className="font-extrabold text-[#111] mt-0.5 text-[10.5px]">대한불교 본원종 제주 소원사</div>
                    <div className="text-[9.5px] font-bold text-[#8A6510] mt-0.5">주지스님 직인 (인)</div>
                  </div>
                  <div className="border border-[#444] py-1.5 px-1 rounded bg-[#FAF8F5]">
                    <div className="text-[8.5px] text-[#666]">사찰 창건 본부 증명</div>
                    <div className="font-extrabold text-[#111] mt-0.5 text-[10.5px]">소원사 창건주 양영문 본부</div>
                    <div className="text-[9.5px] font-bold text-[#8A6510] mt-0.5">창건주 회장 직인 (인)</div>
                  </div>
                  <div className="border border-[#444] py-1.5 px-1 rounded bg-[#FAF8F5]">
                    <div className="text-[8.5px] text-[#666]">종무 행정 총괄 확인</div>
                    <div className="font-extrabold text-[#111] mt-0.5 text-[10.5px]">제주 소원사 종무소</div>
                    <div className="text-[9.5px] font-bold text-[#8A6510] mt-0.5">종무총괄원장 (인)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }
