import React from 'react'
import { createPortal } from 'react-dom'
import {
  BookOpen,
  Check,
  CheckCircle2,
  CreditCard,
  Save,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react'
import { computeZodiacAndGanji } from '../../lib/supabase'

// 동참 종목별 표준 권장 보시금 산정 헬퍼
export const getItemStandardPrice = (itemType) => {
  if (!itemType) return 100000
  if (itemType.includes('2기')) return 4000000
  if (
    itemType.includes('황금빛') ||
    itemType.includes('흑색') ||
    itemType.includes('생전예수재') ||
    itemType.includes('영구위패')
  )
    return 2000000
  if (
    itemType.includes('단청') ||
    itemType.includes('명패') ||
    itemType.includes('기둥')
  )
    return 1000000
  if (
    itemType.includes('1년 인등') ||
    itemType.includes('100일') ||
    itemType.includes('기와')
  )
    return 100000
  if (itemType.includes('공양미')) return 50000
  return 100000
}

// 卍 [정식 접수 최종 확인 전용 중앙 팝업 모달]
export function SettlementConfirmModal({
  isOpen = true,
  data,
  onClose,
  onConfirm,
  settlementItemType: propItemType,
  settlementPaymentStatus: propPaymentStatus,
}) {
  if (!isOpen || !data) return null
  if (typeof document === 'undefined') return null
  const { m, stdAmount = 0, actualPaidAmount = 0, unpaidAmt = 0, agent1 } = data
  const settlementItemType = data.settlementItemType || data.itemType || propItemType || '기도 · 위패 · 불사'
  const settlementPaymentStatus = data.settlementPaymentStatus || data.paymentStatus || propPaymentStatus || 'confirmed'

    return createPortal(
      <div
        className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="w-full max-w-md bg-white text-[#1B1815] rounded-3xl shadow-2xl border-2 border-[#D4AF37] overflow-hidden my-auto animate-in zoom-in-95 duration-150">
          {/* 헤더 */}
          <div className="bg-[#1B1815] text-[#FAF8F5] p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#D4AF37]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C59B27] text-[#1B1815] flex items-center justify-center font-bold text-base shadow shrink-0">
                卍
              </div>
              <div>
                <h3 className="font-serif-kr text-base font-bold text-[#F5D061]">
                  불사 · 위패 정식 접수 최종 확인
                </h3>
                <p className="text-xs text-[#D6CEC2]">
                  장부 등록 전 입력하신 정보를 최종 확인합니다.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onClose()}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 본문 요약 카드 */}
          <div className="p-5 space-y-3.5 text-xs">
            {/* 신도 정보 */}
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D3] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#8C8071] block">동참 신도</span>
                <strong className="text-sm font-bold text-[#1B1815]">
                  {m.name} {m.dharma_name ? `(${m.dharma_name})` : ''}
                </strong>
                {m.phone && <span className="font-mono text-xs text-[#666] ml-2">({m.phone})</span>}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#8C8071] block">담당 추천인</span>
                <strong className="text-xs font-bold text-[#8A6510]">
                  {agent1 ? agent1.name : '소원사 본원'}
                </strong>
              </div>
            </div>

            {/* 종목 및 표준 약정금 */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#666] font-semibold">동참 종목</span>
                <strong className="font-bold text-[#1B1815] text-right max-w-[220px] truncate">
                  {settlementItemType}
                </strong>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-[#EAE2D3]">
                <span className="text-[#666] font-semibold">표준 약정액</span>
                <strong className="font-mono font-bold text-sm text-[#1B1815]">
                  {stdAmount.toLocaleString()}원
                </strong>
              </div>
            </div>

            {/* 수납 상태 및 실제 입금액 */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${
              settlementPaymentStatus === 'confirmed'
                ? 'bg-emerald-50/70 border-emerald-300'
                : settlementPaymentStatus === 'partial'
                ? 'bg-amber-50/70 border-amber-300'
                : 'bg-stone-50 border-stone-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#333]">납부 / 수납 상태</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                  settlementPaymentStatus === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : settlementPaymentStatus === 'partial'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-stone-200 text-stone-700 border-stone-300'
                }`}>
                  {settlementPaymentStatus === 'confirmed'
                    ? '✓ 완납 (실시간 전액 정산)'
                    : settlementPaymentStatus === 'partial'
                    ? '△ 분납 (1차 수납)'
                    : '⏳ 미입금 (입금 대기)'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-[#EAE2D3]">
                <span className="font-bold text-[#333]">실제 사찰 수납액</span>
                <strong className={`font-mono font-bold text-base ${
                  settlementPaymentStatus === 'confirmed'
                    ? 'text-emerald-700'
                    : settlementPaymentStatus === 'partial'
                    ? 'text-amber-700'
                    : 'text-stone-500'
                }`}>
                  {actualPaidAmount.toLocaleString()}원
                </strong>
              </div>

              {unpaidAmt > 0 && settlementPaymentStatus !== 'pending' && (
                <div className="flex items-center justify-between text-[11px] text-amber-800 font-bold pt-1">
                  <span>향후 완납 잔액</span>
                  <span>{unpaidAmt.toLocaleString()}원 미납</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-center text-[#7A6E5E] pt-1">
              위 내용으로 정식 등록 및 회계 장부에 반영하시겠습니까?
            </p>

            {/* 하단 버튼 2개 */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onClose()}
                className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#444] font-bold text-xs transition cursor-pointer"
              >
                돌아가서 수정
              </button>
              <button
                type="button"
                onClick={() => onConfirm(data)}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#1B1815] via-[#2A231C] to-[#1B1815] hover:brightness-110 text-[#F5D061] font-bold text-xs shadow-md border border-[#C59B27] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#F5D061]" />
                <span>최종 등록 확인</span>
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }


// ⚙️ [착오 수정 및 환불/취소 처리 전용 모달 렌더러]
export function SettlementEditModal({
  isOpen = true,
  settlement,
  setEditingSettlement,
  onClose,
  onSave,
  onRefund,
  onDelete,
}) {
  if (!isOpen || !settlement) return null
  if (typeof document === 'undefined') return null

  const s = settlement
    const stdAmt = Number(s.standard_amount || s.total_amount || 0)
    const paidAmt = Number(s.paid_amount !== undefined ? s.paid_amount : stdAmt)
    const unpaidAmt = Math.max(0, stdAmt - paidAmt)

    return createPortal(
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="w-full max-w-xl bg-white text-[#1B1815] rounded-3xl shadow-2xl border-2 border-[#D5C59B] overflow-hidden my-auto animate-in fade-in duration-200">
          {/* 헤더 */}
          <div className="bg-[#1B1815] text-[#FAF8F5] p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#D4AF37]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C59B27] text-[#1B1815] flex items-center justify-center font-bold text-base shadow shrink-0">
                ⚙️
              </div>
              <div>
                <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#F5D061]">
                  접수 원장 착오 수정 및 환불/취소 처리
                </h3>
                <p className="text-xs text-[#D6CEC2]">
                  동참 신도: {s.believer_name} · 등록번호: {s.id}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onClose()}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSave} className="p-5 sm:p-6 space-y-4 text-xs">
            {/* 1. 신도 기본 정보 확인 */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D3] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#8C8071] block">동참 신도 성함 / 연락처</span>
                <strong className="text-sm font-bold text-[#1B1815]">
                  {s.believer_name}
                </strong>
                {s.believer_phone && <span className="font-mono text-xs text-[#666] ml-2">({s.believer_phone})</span>}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#8C8071] block">유치 추천인 (1차)</span>
                <strong className="text-xs font-bold text-[#8A6510]">{s.agent_1st_name || '소원사 본원'}</strong>
              </div>
            </div>

            {/* 2. 동참 종목 & 약정액 & 접수일 수정 */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-3">
              <span className="font-bold text-[#8A6510] block pb-1 border-b border-[#EAE2D3]">
                동참 종목 및 표준 약정 정보 수정
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block font-bold text-[#3D3630] mb-1">동참 종목</label>
                  <select
                    value={s.item_name || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      const stdPrice = getItemStandardPrice(val)
                      setEditingSettlement((prev) => ({
                        ...prev,
                        item_name: val,
                        standard_amount: stdPrice,
                        total_amount: stdPrice,
                        paid_amount: prev.payment_status === 'confirmed' ? stdPrice : prev.paid_amount,
                      }))
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C59B] text-xs font-semibold text-[#1B1815]"
                  >
                    <optgroup label="🪷 1. 대웅전 상시 기도 및 공덕 불사">
                      <option value="대웅전 공양미 / 불전시주">① 대웅전 공양미 / 불전시주 (50,000원)</option>
                      <option value="대웅전 1년 인등 (가족등)">② 대웅전 1년 인등 (가족등) (100,000원)</option>
                      <option value="100일 소원성취 특별기도">③ 100일 소원성취 특별기도 (100,000원)</option>
                      <option value="49재 / 천도재 / 기일제사">④ 49재 / 천도재 / 기일제사</option>
                    </optgroup>
                    <optgroup label="🏛️ 2. 영구 위패 봉안 불사">
                      <option value="생전예수재 황금빛 위패 (살아계신 분)">① 생전예수재 황금빛 위패 (살아계신 분) (200만원)</option>
                      <option value="조상 영가 품격 흑색 영구위패">② 조상 영가 품격 흑색 영구위패 (200만원)</option>
                      <option value="조상 영가 부부 영구위패 2기">③ 조상 영가 부부 영구위패 2기 (400만원)</option>
                    </optgroup>
                    <optgroup label="🏔️ 3. 삼성각 성전 건립 대작불사">
                      <option value="삼성각 건립 소원 기와 불사 (1장)">① 삼성각 건립 소원 기와 불사 (1장) (10만원)</option>
                      <option value="삼성각 대들보 · 기둥 · 오색단청 불사">② 삼성각 대들보 · 기둥 · 오색단청 불사 (100만원)</option>
                      <option value="삼성각 가족 영구축원 명패 · 주춧돌">③ 삼성각 가족 영구축원 명패 · 주춧돌 (100만원)</option>
                      <option value="기타 특별기도 및 맞춤 불사 상담">④ 기타 특별기도 및 맞춤 불사 상담</option>
                    </optgroup>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-[#3D3630] mb-1">표준 약정액 (원)</label>
                  <input
                    type="number"
                    value={s.standard_amount || s.total_amount || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setEditingSettlement((prev) => ({
                        ...prev,
                        standard_amount: val,
                        total_amount: val,
                        paid_amount: prev.payment_status === 'confirmed' ? val : prev.paid_amount,
                      }))
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C59B] text-xs font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-[#3D3630] mb-1">접수일자</label>
                  <input
                    type="date"
                    value={(s.applied_date || s.created_at || '').slice(0, 10)}
                    onChange={(e) => setEditingSettlement((prev) => ({ ...prev, applied_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C59B] text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. 실제 수납 / 환불 상태 수정 */}
            <div className={`p-3.5 rounded-2xl border space-y-3 ${
              s.payment_status === 'refunded'
                ? 'bg-red-50/70 border-red-300'
                : s.payment_status === 'confirmed'
                ? 'bg-emerald-50/70 border-emerald-300'
                : s.payment_status === 'partial'
                ? 'bg-amber-50/70 border-amber-300'
                : 'bg-stone-50 border-stone-300'
            }`}>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#EAE2D3]">
                <span className="font-bold flex items-center gap-1.5 text-[#1B1815]">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>실제 입금 수납 및 환불 상태 처리</span>
                </span>
                <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                  s.payment_status === 'refunded'
                    ? 'bg-red-100 text-red-900 border-red-300'
                    : s.payment_status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : s.payment_status === 'partial'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-stone-100 text-stone-700 border-stone-300'
                }`}>
                  {s.payment_status === 'refunded'
                    ? '💸 환불·취소 (정산회수)'
                    : s.payment_status === 'confirmed'
                    ? '✓ 완납 (실시간 정산집행)'
                    : s.payment_status === 'partial'
                    ? '△ 일부입금 (분납)'
                    : '⏳ 미입금 (입금대기)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block font-bold text-[#3D3630] mb-1">납부 / 환불 상태 *</label>
                  <select
                    value={s.payment_status || 'confirmed'}
                    onChange={(e) => {
                      const newStatus = e.target.value
                      setEditingSettlement((prev) => {
                        const curStd = Number(prev.standard_amount || prev.total_amount || 0)
                        if (newStatus === 'confirmed') {
                          return { ...prev, payment_status: newStatus, paid_amount: curStd, unpaid_amount: 0 }
                        } else if (newStatus === 'refunded') {
                          return { ...prev, payment_status: newStatus, paid_amount: 0, unpaid_amount: 0 }
                        } else if (newStatus === 'pending') {
                          return { ...prev, payment_status: newStatus, paid_amount: 0, unpaid_amount: curStd }
                        } else {
                          return { ...prev, payment_status: newStatus, paid_amount: Math.round(curStd / 2) }
                        }
                      })
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C59B] text-xs font-bold"
                  >
                    <option value="confirmed">완납 입금 (실시간 정산 집행)</option>
                    <option value="partial">분납 (일부 납부)</option>
                    <option value="pending">미입금 (입금 대기 · 정산 보류)</option>
                    <option value="refunded">💸 환불 / 접수 취소 (수당 전액 회수)</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-bold text-[#3D3630] mb-1">실제 입금금액 (수납액)</label>
                  <input
                    type="number"
                    value={s.paid_amount !== undefined ? s.paid_amount : stdAmt}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setEditingSettlement((prev) => ({
                        ...prev,
                        paid_amount: val,
                        unpaid_amount: Math.max(0, Number(prev.standard_amount || prev.total_amount || 0) - val),
                      }))
                    }}
                    disabled={s.payment_status === 'refunded' || s.payment_status === 'pending'}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C59B] text-xs font-mono font-bold text-emerald-800"
                  />
                  <span className="text-[10px] text-[#8C8071] mt-0.5 block">
                    {s.payment_status === 'refunded' ? '환불 처리되어 입금액 0원' : `미납: ${unpaidAmt.toLocaleString()}원`}
                  </span>
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-bold text-[#3D3630] mb-1">실제 입금일자</label>
                  <input
                    type="date"
                    value={(s.paid_date || '').slice(0, 10)}
                    onChange={(e) => setEditingSettlement((prev) => ({ ...prev, paid_date: e.target.value }))}
                    disabled={s.payment_status === 'refunded' || s.payment_status === 'pending'}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C59B] text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-[#8C8071] mt-0.5 block">실제 수납 완료일</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3D3630] mb-1">수정 사유 및 축원/환불 메모</label>
                <input
                  type="text"
                  value={s.memo || ''}
                  onChange={(e) => setEditingSettlement((prev) => ({ ...prev, memo: e.target.value }))}
                  placeholder="예: 신도 요청으로 환불 완료 / 착오 금액 정정 등 사유 기록"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5C59B] text-xs text-[#1B1815]"
                />
              </div>
            </div>

            {/* 하단 버튼 그룹 */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* 환불 원터치 버튼 */}
                {s.payment_status !== 'refunded' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`[${s.believer_name}] 신도님의 이 접수 건을 '환불/접수취소' 처리하시겠습니까?\n사찰 본사 및 추천인 수당이 전액 회수(취소)되고 신도의 점등/위패가 소등·원복됩니다.`)) {
                        onRefund(s.id)
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-bold text-xs transition cursor-pointer"
                  >
                    💸 환불/취소 처리
                  </button>
                )}

                {/* 착오 입력 완전 삭제 버튼 */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`[${s.believer_name}] 신도님의 이 원장 기록을 완전히 삭제하시겠습니까?\n(착오로 잘못 등록된 테스트 건이나 중복 건 삭제 전용)`)) {
                      onDelete(s.id)
                    }
                  }}
                  className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  <span>장부 삭제</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#555] font-bold text-xs transition cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1B1815] via-[#2A231C] to-[#1B1815] hover:brightness-110 text-[#F5D061] font-bold text-xs shadow-md border border-[#C59B27] transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 inline mr-1 text-[#F5D061]" />
                  <span>수정사항 저장</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )
  }


// 🏛️ [신도 교적부 기반 사찰 불사 & 위패 봉안 정식 접수 등록 모달]
export function SettlementModal({
  isOpen = true,
  member,
  onClose,
  members = [],
  settlementItemType,
  setSettlementItemType,
  settlementStandardAmount,
  setSettlementStandardAmount,
  settlementPaidAmount,
  setSettlementPaidAmount,
  settlementPaymentStatus,
  setSettlementPaymentStatus,
  settlementMemo,
  setSettlementMemo,
  settlementAppliedDate,
  setSettlementAppliedDate,
  settlementPaidDate,
  setSettlementPaidDate,
  settlementPaymentMethod,
  setSettlementPaymentMethod,
  onSubmit,
  onOpenCategorySheet,
}) {
  if (!isOpen || !member) return null
  if (typeof document === 'undefined') return null

  const m = member
  const zInfo = computeZodiacAndGanji(m.birth_year || (m.birth_date ? m.birth_date.slice(0, 4) : ''))

  const [internalAppliedDate, setInternalAppliedDate] = React.useState(() => new Date().toISOString().slice(0, 10))
  const [internalPaidDate, setInternalPaidDate] = React.useState(() => new Date().toISOString().slice(0, 10))
  const [internalMethod, setInternalMethod] = React.useState('계좌이체 (사찰)')

  const appliedDate = settlementAppliedDate !== undefined ? settlementAppliedDate : internalAppliedDate
  const onAppliedDateChange = setSettlementAppliedDate || setInternalAppliedDate

  const paidDate = settlementPaidDate !== undefined ? settlementPaidDate : internalPaidDate
  const onPaidDateChange = setSettlementPaidDate || setInternalPaidDate

  const paymentMethod = settlementPaymentMethod !== undefined ? settlementPaymentMethod : internalMethod
  const onPaymentMethodChange = setSettlementPaymentMethod || setInternalPaymentMethod
    
    // 조직표 계보 매칭
    const directAgent = members.find((a) => a.code === (m.parent_code || '33065540')) || members.find((a) => a.code === '33065540')
    const upperAgent = directAgent?.parent_code ? members.find((a) => a.code === directAgent.parent_code) : null

    return createPortal(
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-xl bg-white text-[#1B1815] rounded-3xl shadow-2xl border-2 border-[#D5C59B] overflow-hidden my-auto animate-in fade-in duration-200">
          {/* 헤더 */}
          <div className="bg-[#1B1815] text-[#FAF8F5] p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#D4AF37]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C59B27] text-[#1B1815] flex items-center justify-center font-bold text-base shadow shrink-0">
                卍
              </div>
              <div>
                <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#F5D061]">
                  기도 · 위패 · 불사 정식 접수
                </h3>
                <p className="text-xs text-[#D6CEC2]">
                  신도교적부 등록 회원 기준 · 소원사 조직표 계보 실시간 정산 연동 (모바일 신청란 표준 100% 일치)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose()
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            {/* 1. 신도 기본 교적 정보 */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#EAE2D3]">
                <span className="font-bold text-[#8A6510] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#8A6510]" />
                  <span>1. 동참 신도 교적 정보</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#554E45] bg-white px-2.5 py-0.5 rounded border border-[#DDD4C4]">
                    담당 추천인: {directAgent ? `${directAgent.name} (${directAgent.role === 'master' ? '총괄위원장' : directAgent.role === 'temple_admin' ? '신도회장' : '포교위원장'})` : '소원사 본원'}
                  </span>
                  <span className="text-[11px] font-mono text-[#666] bg-white px-2 py-0.5 rounded border border-[#DDD4C4]">
                    교적: {m.code}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11.5px]">
                <div>
                  <span className="text-[#8C8071] block">성함 / 법명:</span>
                  <strong className="text-sm font-bold text-[#1B1815]">
                    {m.name} {m.dharma_name ? `(${m.dharma_name})` : ''}
                  </strong>
                </div>
                <div>
                  <span className="text-[#8C8071] block">연락처:</span>
                  <strong className="font-mono text-[#1B1815]">{m.phone || '-'}</strong>
                </div>
                <div>
                  <span className="text-[#8C8071] block">생년 / 간지:</span>
                  <span className="font-medium text-[#444]">
                    {m.birth_year || (m.birth_date ? m.birth_date.slice(0, 4) : '-')}년 {zInfo.ganji ? `(${zInfo.ganji} ${zInfo.animal}띠)` : ''}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-[#777] truncate">
                🏠 {m.address || '제주특별자치도 제주시'}
              </div>
            </div>

            {/* 2. 동참 종목 및 접수·약정 표준금액 */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#EAE2D3]">
                <span className="font-bold text-[#8A6510] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#8A6510]" />
                  <span>2. 동참 종목 및 접수·약정 표준 정보</span>
                </span>
                <span className="text-[10.5px] font-bold text-[#8A6510] bg-[#FAF3DF] px-2 py-0.5 rounded border border-[#E8D4A2]">
                  모바일 신청란 표준
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* 동참 종목 선택 (sm:col-span-6) */}
                <div className="sm:col-span-6">
                  <label className="block font-bold text-[#3D3630] mb-1">
                    동참 종목 선택 *
                  </label>
                  <select
                    value={settlementItemType}
                    onChange={(e) => {
                      const val = e.target.value
                      const stdPrice = getItemStandardPrice(val)
                      setSettlementItemType(val)
                      setSettlementStandardAmount(stdPrice)
                      if (settlementPaymentStatus === 'confirmed') {
                        setSettlementPaidAmount(stdPrice)
                      } else if (settlementPaymentStatus === 'partial') {
                        setSettlementPaidAmount(Math.round(stdPrice / 2))
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D5C59B] text-xs font-semibold text-[#1B1815] shadow-inner"
                  >
                    <optgroup label="🪷 1. 대웅전 상시 기도 및 공덕 불사">
                      <option value="대웅전 공양미 / 불전시주">① 대웅전 공양미 / 불전시주 (50,000원)</option>
                      <option value="대웅전 1년 인등 (가족등)">② 대웅전 1년 인등 (가족등) (100,000원)</option>
                      <option value="100일 소원성취 특별기도">③ 100일 소원성취 특별기도 (100,000원)</option>
                      <option value="49재 / 천도재 / 기일제사">④ 49재 / 천도재 / 기일제사 (상담 및 직접입력)</option>
                    </optgroup>
                    <optgroup label="🏛️ 2. 영구 위패 봉안 불사">
                      <option value="생전예수재 황금빛 위패 (살아계신 분)">① 생전예수재 황금빛 위패 (살아계신 분) (200만원)</option>
                      <option value="조상 영가 품격 흑색 영구위패">② 조상 영가 품격 흑색 영구위패 (200만원)</option>
                      <option value="조상 영가 부부 영구위패 2기">③ 조상 영가 부부 영구위패 2기 (400만원)</option>
                    </optgroup>
                    <optgroup label="🏔️ 3. 삼성각 성전 건립 대작불사">
                      <option value="삼성각 건립 소원 기와 불사 (1장)">① 삼성각 건립 소원 기와 불사 (1장) (10만원)</option>
                      <option value="삼성각 대들보 · 기둥 · 오색단청 불사">② 삼성각 대들보 · 기둥 · 오색단청 불사 (100만원)</option>
                      <option value="삼성각 가족 영구축원 명패 · 주춧돌">③ 삼성각 가족 영구축원 명패 · 주춧돌 (100만원)</option>
                      <option value="기타 특별기도 및 맞춤 불사 상담">④ 기타 특별기도 및 맞춤 불사 상담</option>
                    </optgroup>
                  </select>
                </div>

                {/* 표준 약정금액 (sm:col-span-3) */}
                <div className="sm:col-span-3">
                  <label className="block font-bold text-[#3D3630] mb-1">
                    표준 약정금액 (원) *
                  </label>
                  <input
                    type="number"
                    value={settlementStandardAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setSettlementStandardAmount(val)
                      if (settlementPaymentStatus === 'confirmed') setSettlementPaidAmount(val)
                    }}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D5C59B] text-xs font-mono font-bold text-[#1B1815]"
                  />
                  <span className="text-[10px] text-[#8C8071] mt-0.5 block">
                    종목 권장 기준금액
                  </span>
                </div>

                {/* 접수일자 (sm:col-span-3) */}
                <div className="sm:col-span-3">
                  <label className="block font-bold text-[#3D3630] mb-1">
                    접수일자 (신청일) *
                  </label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => onAppliedDateChange(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D5C59B] text-xs font-mono font-bold text-[#1B1815]"
                  />
                  <span className="text-[10px] text-[#8C8071] mt-0.5 block">
                    현장/온라인 신청일
                  </span>
                </div>
              </div>
            </div>

            {/* 3. 실제 입금 수납 처리 (회계 및 정산 집행) */}
            <div className={`p-3.5 rounded-2xl border space-y-3 transition ${
              settlementPaymentStatus === 'confirmed'
                ? 'bg-emerald-50/70 border-emerald-300'
                : settlementPaymentStatus === 'partial'
                ? 'bg-amber-50/70 border-amber-300'
                : 'bg-stone-50 border-stone-300'
            }`}>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#EAE2D3]">
                <span className="font-bold flex items-center gap-1.5 text-[#1B1815]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>3. 실제 입금 수납 처리 (회계 및 정산 집행)</span>
                </span>
                <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                  settlementPaymentStatus === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : settlementPaymentStatus === 'partial'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-stone-100 text-stone-700 border-stone-300'
                }`}>
                  {settlementPaymentStatus === 'confirmed'
                    ? '✓ 완납 확인 (실시간 전액 정산 집행)'
                    : settlementPaymentStatus === 'partial'
                    ? '✓ 일부 납부 (불사·위패 공식 집행 및 1차 정산)'
                    : '⏳ 전액 미입금 (불사 및 정산 보류)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* 납부/수납 상태 (sm:col-span-4) */}
                <div className="sm:col-span-4">
                  <label className="block font-bold text-[#3D3630] mb-1">
                    납부/수납 상태 *
                  </label>
                  <select
                    value={settlementPaymentStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value
                      setSettlementPaymentStatus(newStatus)
                      if (newStatus === 'confirmed') {
                        setSettlementPaidAmount(settlementStandardAmount)
                        if (!paidDate) onPaidDateChange(new Date().toISOString().slice(0, 10))
                      } else if (newStatus === 'pending') {
                        setSettlementPaidAmount(0)
                      } else if (newStatus === 'partial') {
                        if (settlementPaidAmount === settlementStandardAmount || settlementPaidAmount === 0) {
                          setSettlementPaidAmount(Math.round(settlementStandardAmount / 2))
                        }
                        if (!paidDate) onPaidDateChange(new Date().toISOString().slice(0, 10))
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D5C59B] text-xs font-bold text-[#1B1815]"
                  >
                    <option value="confirmed">완납 입금 (실시간 정산 집행)</option>
                    <option value="partial">분납 (일부 입금 처리)</option>
                    <option value="pending">미입금 (입금 대기 · 정산 보류)</option>
                  </select>
                </div>

                {/* 실제 입금금액 (sm:col-span-4) */}
                <div className="sm:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#3D3630]">
                      실제 입금금액 (수납액) *
                    </label>
                    {settlementStandardAmount - settlementPaidAmount > 0 && (
                      <span className="text-[10px] font-bold text-amber-700">
                        미납: {(settlementStandardAmount - settlementPaidAmount).toLocaleString()}원
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={settlementPaidAmount}
                    onChange={(e) => setSettlementPaidAmount(Number(e.target.value))}
                    disabled={settlementPaymentStatus === 'pending'}
                    required
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono font-bold ${
                      settlementPaymentStatus === 'pending'
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        : 'bg-white border-[#D5C59B] text-emerald-800'
                    }`}
                  />
                  <div className="flex items-center justify-between text-[10px] mt-0.5">
                    <span className="text-[#8C8071]">
                      {settlementPaymentStatus === 'pending' ? '미입금 상태 (0원)' : '실제 사찰 수납 금액'}
                    </span>
                    <strong className={settlementStandardAmount - settlementPaidAmount === 0 ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
                      {settlementStandardAmount - settlementPaidAmount === 0
                        ? '완납 (잔액 0원)'
                        : `잔여 ${(settlementStandardAmount - settlementPaidAmount).toLocaleString()}원 미납`}
                    </strong>
                  </div>
                </div>

                {/* 실제 입금일자 (sm:col-span-4) */}
                <div className="sm:col-span-4">
                  <label className="block font-bold text-[#3D3630] mb-1">
                    실제 입금일자 *
                  </label>
                  <input
                    type="date"
                    value={settlementPaymentStatus === 'pending' ? '' : settlementPaidDate}
                    onChange={(e) => setSettlementPaidDate(e.target.value)}
                    disabled={settlementPaymentStatus === 'pending'}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono font-bold ${
                      settlementPaymentStatus === 'pending'
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        : 'bg-white border-[#D5C59B] text-[#1B1815]'
                    }`}
                  />
                  <span className="text-[10px] text-[#8C8071] mt-0.5 block">
                    {settlementPaymentStatus === 'pending' ? '입금 시 일자 입력' : '통장 수납 완료일'}
                  </span>
                </div>
              </div>

              {/* 결제 수단 선택 & 회계 안내 */}
              <div className="pt-2 border-t border-[#EAE2D3] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#554E45]">입금/수납 수단:</span>
                  <div className="flex items-center gap-1">
                    {['계좌이체 (사찰통장)', '현금 (종무소)', '신용카드', '기타'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => onPaymentMethodChange(method)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition border ${
                          paymentMethod === method
                            ? 'bg-[#1B1815] text-[#F5D061] border-[#1B1815] shadow-xs'
                            : 'bg-white text-[#666] border-[#DDD4C4] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[10.5px] text-[#8C8071]">
                  {settlementPaymentStatus === 'confirmed'
                    ? '💡 완납 확인 즉시 불사 집행 및 조직도 수당이 전액 집행됩니다.'
                    : settlementPaymentStatus === 'partial'
                    ? '💡 일부 납부(분납) 시에도 향후 완납을 전제로 불사·위패가 공식 집행되며, 납부액 기준으로 1차 수당이 실시간 집행됩니다.'
                    : '⚠️ 전액 미입금 건은 신도 입금 완료 시까지 불사 및 수당 정산이 자동 보류됩니다.'}
                </div>
              </div>
            </div>

            {/* 5. 축원 발원 메모 */}
            <div>
              <label className="block font-bold text-[#3D3630] mb-1">
                축원 발원문 및 종무 메모 (선택)
              </label>
              <input
                type="text"
                value={settlementMemo}
                onChange={(e) => setSettlementMemo(e.target.value)}
                placeholder="예: 가족 건강 및 사업 번창, 조상 영가 극락왕생 발원 (사시예불 축원 연동)"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D5C59B] text-xs font-serif-kr text-[#1B1815] placeholder:text-[#A89D8E]"
              />
            </div>

            {/* 6. 제출 및 정산 집행 버튼 */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#1B1815] via-[#2A231C] to-[#1B1815] hover:brightness-110 text-[#F5D061] font-serif-kr font-bold text-sm shadow-md flex items-center justify-center gap-2 border border-[#C59B27] transition cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#F5D061] shrink-0" />
                {settlementPaymentStatus === 'confirmed' ? (
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                      ✓ 완납 확인
                    </span>
                    <span>卍 기도 · 위패 · 불사 정식 접수 및 완납 수납 등록</span>
                  </div>
                ) : settlementPaymentStatus === 'partial' ? (
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/40">
                      △ 분납 (1차 수납)
                    </span>
                    <span>卍 기도 · 위패 · 불사 정식 접수 및 분납 수납 등록</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <span className="px-2 py-0.5 rounded-md bg-stone-500/30 text-stone-300 text-xs font-bold border border-stone-500/40">
                      ⏳ 입금 대기
                    </span>
                    <span>卍 기도 · 위패 · 불사 접수 등록 (정산 보류)</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )
  }

