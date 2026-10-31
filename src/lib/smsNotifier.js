/**
 * 제주 소원사 자동 문자(SMS/LMS) 및 종무소 실시간 알림 유틸리티
 * - 신도님이 기도/소원등, 인등/위패/삼성각 불사, 도량 방문·공양 예약을 접수(또는 취소)할 때
 *   1) 종무소 관리자 휴대폰(기본: 010-4912-1083)으로 즉시 접수 알림 발송
 *   2) 신청 신도님 휴대폰으로 접수 확인 및 사시예불 축원 안내(불사 시 농협 계좌 포함) 자동 발송
 * - 모든 발송 내역은 localStorage('sowonsa_sms_logs_v1')에 기록되어 종무소 ERP에서 언제든 확인 가능
 */

const SMS_CONFIG_KEY = 'sowonsa_sms_config_v1'
const SMS_LOGS_KEY = 'sowonsa_sms_logs_v1'

export const DEFAULT_SMS_CONFIG = {
  provider: 'solapi', // 'solapi' | 'aligo'
  adminPhone: '010-4912-1083', // 종무소 알림 수신 휴대폰 번호 (쉼표로 복수 등록 가능)
  senderPhone: '010-4912-1083', // 발신자 번호 (솔라피/알리고에 등록된 발신번호)
  autoNotifyAdmin: true, // 신규 접수/취소 시 종무소(010-4912-1083) 자동 문자 알림 ON
  autoNotifyBeliever: true, // 신규 접수 시 신청 불자님 휴대폰으로 확인 안내 문자 자동 발송 ON
  apiKey: '',
  apiSecret: '',
  aligoUserId: '',
}

export function getSmsConfig() {
  try {
    const raw = localStorage.getItem(SMS_CONFIG_KEY)
    if (!raw) return { ...DEFAULT_SMS_CONFIG }
    return { ...DEFAULT_SMS_CONFIG, ...JSON.parse(raw) }
  } catch (e) {
    return { ...DEFAULT_SMS_CONFIG }
  }
}

export function saveSmsConfig(newConfig) {
  const merged = { ...getSmsConfig(), ...newConfig }
  try {
    localStorage.setItem(SMS_CONFIG_KEY, JSON.stringify(merged))
  } catch (e) {}
  return merged
}

export function getSmsLogs() {
  try {
    const raw = localStorage.getItem(SMS_LOGS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

export function appendSmsLogs(newEntries) {
  try {
    const current = getSmsLogs()
    const updated = [...newEntries, ...current].slice(0, 200)
    localStorage.setItem(SMS_LOGS_KEY, JSON.stringify(updated))
    return updated
  } catch (e) {
    return []
  }
}

export function clearSmsLogs() {
  try {
    localStorage.removeItem(SMS_LOGS_KEY)
  } catch (e) {}
}

/**
 * 서버리스 `/api/send-sms` 호출 및 발송 로그 저장
 * @param {Array<{to: string, text: string, subject?: string, recipientLabel?: string}>} messages
 * @param {string} triggerType 예: '불사접수 자동알림', '소원등 자동알림', '방문예약 자동알림', '종무소 단체문자'
 */
export async function dispatchSmsBatch(messages = [], triggerType = '자동알림') {
  const config = getSmsConfig()
  const valid = messages.filter((m) => m && String(m.to || '').replace(/[^0-9]/g, '').length >= 9 && m.text)
  if (valid.length === 0) return { ok: true, mode: 'skipped', count: 0 }

  const nowStr = new Date().toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: valid,
        config: {
          provider: config.provider,
          senderPhone: config.senderPhone,
          apiKey: config.apiKey,
          apiSecret: config.apiSecret,
          aligoUserId: config.aligoUserId,
        },
      }),
    })

    const result = await response.json().catch(() => ({ ok: true, mode: 'simulated' }))
    const statusLabel =
      result.mode === 'live'
        ? '실제발송 완료'
        : result.mode === 'error'
        ? `발송오류(${result.error || '확인필요'})`
        : '전산기록 완료(API연동대기)'

    const logEntries = valid.map((m, idx) => ({
      id: `sms-${Date.now()}-${idx}`,
      createdAt: nowStr,
      triggerType,
      recipientLabel: m.recipientLabel || '수신자',
      to: m.to,
      text: m.text,
      mode: result.mode || 'simulated',
      statusLabel,
    }))
    appendSmsLogs(logEntries)
    return result
  } catch (err) {
    const logEntries = valid.map((m, idx) => ({
      id: `sms-${Date.now()}-${idx}`,
      createdAt: nowStr,
      triggerType,
      recipientLabel: m.recipientLabel || '수신자',
      to: m.to,
      text: m.text,
      mode: 'simulated',
      statusLabel: '전산기록 완료',
    }))
    appendSmsLogs(logEntries)
    return { ok: true, mode: 'simulated', count: valid.length }
  }
}

/**
 * 1. 기도 / 소원등 / 인등 / 위패 / 삼성각 불사 접수 시 자동 알림 발송
 */
export async function notifyPrayerSubmission({
  believerName,
  believerPhone,
  category,
  wishText,
  isPaidPrayer,
}) {
  const config = getSmsConfig()
  const messages = []

  const adminPhones = String(config.adminPhone || '010-4912-1083')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  // (1) 종무소 관리자(010-4912-1083)에게 신규 접수 즉시 알림
  if (config.autoNotifyAdmin) {
    const adminMsg = `[제주소원사 ${isPaidPrayer ? '불사·기도접수' : '소원등접수'}]\n▶ 신청자: ${believerName}\n▶ 연락처: ${believerPhone}\n▶ 종목: ${category}\n▶ 발원문: ${String(wishText || '').slice(0, 90)}`
    adminPhones.forEach((admPhone) => {
      messages.push({
        to: admPhone,
        subject: '[제주소원사 신규접수 알림]',
        text: adminMsg,
        recipientLabel: `종무소(${admPhone})`,
      })
    })
  }

  // (2) 신청 신도님 휴대폰으로 접수 완료 & 축원/계좌 안내 문자 발송
  if (config.autoNotifyBeliever && believerPhone) {
    const believerMsg = isPaidPrayer
      ? `[대한불교 조계종 제주 소원사]\n${believerName} 불자님, [${category}] 신청이 종무소에 정식 접수되었습니다.\n매일 오전 10시 대웅전 사시예불에 스님께서 정성껏 축원 올립니다.\n\n▶ 무통장 시주 계좌\n농협 301-0324-0024-41\n(예금주: 대한불교조계종소원사)\n▶ 종무소: 064-805-2007 · 010-4912-1083`
      : `[대한불교 조계종 제주 소원사]\n${believerName} 불자님, 대웅전 소원등(${category})이 밝게 점등되었습니다.\n매일 오전 10시 대웅전 사시예불에서 가정의 평안과 소원성취를 정성껏 축원합니다.\n\n▶ 종무소: 064-805-2007 · 010-4912-1083`

    messages.push({
      to: believerPhone,
      subject: '[제주 소원사 접수 완료 안내]',
      text: believerMsg,
      recipientLabel: `신청신도(${believerName})`,
    })
  }

  return dispatchSmsBatch(messages, isPaidPrayer ? '불사·위패 접수알림' : '소원등 점등알림')
}

/**
 * 2. 방금 신청한 기도/불사를 [접수 취소] 했을 때 종무소 자동 취소 알림 발송
 */
export async function notifyPrayerCancellation({ believerName, believerPhone, category }) {
  const config = getSmsConfig()
  if (!config.autoNotifyAdmin) return { ok: true, mode: 'skipped' }

  const adminPhones = String(config.adminPhone || '010-4912-1083')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  const messages = adminPhones.map((admPhone) => ({
    to: admPhone,
    subject: '[제주소원사 접수취소 알림]',
    text: `[제주소원사 접수취소]\n신청자: ${believerName} (${believerPhone || '-'})\n취소종목: ${category}\n※ 신도님이 접수 직후 취소하여 DB 및 장부에서 자동 제외되었습니다.`,
    recipientLabel: `종무소(${admPhone})`,
  }))

  return dispatchSmsBatch(messages, '접수취소 알림')
}

/**
 * 3. 도량 방문 & 차담·공양(식사) 사전 예약 시 자동 알림 발송
 */
export async function notifyVisitReservation({
  visitorName,
  visitorPhone,
  visitDate,
  visitTime,
  headcount,
  purpose,
  memo,
}) {
  const config = getSmsConfig()
  const messages = []

  const adminPhones = String(config.adminPhone || '010-4912-1083')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  if (config.autoNotifyAdmin) {
    const adminMsg = `[제주소원사 방문·공양예약]\n▶ 예약자: ${visitorName} (${visitorPhone})\n▶ 방문일시: ${visitDate} ${visitTime}\n▶ 방문인원: ${headcount}명 (${purpose || '도량참배'})\n▶ 메모: ${String(memo || '').slice(0, 70)}`
    adminPhones.forEach((admPhone) => {
      messages.push({
        to: admPhone,
        subject: '[제주소원사 방문예약 알림]',
        text: adminMsg,
        recipientLabel: `종무소(${admPhone})`,
      })
    })
  }

  if (config.autoNotifyBeliever && visitorPhone) {
    const believerMsg = `[대한불교 조계종 제주 소원사]\n${visitorName} 불자님, ${visitDate} ${visitTime} (총 ${headcount}명) 도량 방문 및 차담·공양 예약이 접수되었습니다.\n따뜻한 차와 공양을 정성껏 준비해 두겠습니다.\n\n▶ 종무소: 064-805-2007 · 010-4912-1083`
    messages.push({
      to: visitorPhone,
      subject: '[제주 소원사 방문예약 확인]',
      text: believerMsg,
      recipientLabel: `예약신도(${visitorName})`,
    })
  }

  return dispatchSmsBatch(messages, '방문·공양 예약알림')
}
