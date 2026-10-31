import crypto from 'crypto'

/**
 * 제주 소원사 문자(SMS/LMS) 및 알림톡 발송 Serverless API
 * 지원 사업자:
 *  1) 솔라피 (Solapi / 구 쿨에스엠에스 REST API v4)
 *  2) 알리고 (Aligo REST API)
 *
 * 환경변수 또는 관리자 ERP 설정(config)에서 인증키를 읽어 즉시 발송하며,
 * 아직 API 키가 입력되지 않은 경우에도 에러 없이 전산 시뮬레이션 모드로 정상 응답합니다.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const rawMessages = Array.isArray(body.messages) ? body.messages : []
    const clientConfig = body.config || {}

    const provider = (clientConfig.provider || process.env.SMS_PROVIDER || 'solapi').toLowerCase()
    const cleanPhone = (p) => String(p || '').replace(/[^0-9]/g, '')

    const validMessages = rawMessages
      .map((m) => ({
        to: cleanPhone(m.to),
        text: String(m.text || '').trim(),
        subject: String(m.subject || '[제주 소원사]').trim(),
      }))
      .filter((m) => m.to.length >= 9 && m.text.length > 0)

    if (validMessages.length === 0) {
      return res.status(200).json({
        ok: true,
        mode: 'skipped',
        count: 0,
        message: '유효한 수신 번호 또는 메시지 내용이 없습니다.',
      })
    }

    // 1. 솔라피 (Solapi) 발송 처리
    if (provider === 'solapi') {
      const apiKey = (clientConfig.apiKey || process.env.SOLAPI_API_KEY || '').trim()
      const apiSecret = (clientConfig.apiSecret || process.env.SOLAPI_API_SECRET || '').trim()
      const sender = cleanPhone(
        clientConfig.senderPhone || process.env.SOLAPI_SENDER_PHONE || '01049121083'
      )

      if (!apiKey || !apiSecret) {
        return res.status(200).json({
          ok: true,
          mode: 'simulated',
          provider: 'solapi',
          count: validMessages.length,
          message:
            '솔라피(Solapi) API 키가 아직 설정되지 않아 전산 발송 로그에 기록되었습니다. (종무소 ERP > 문자발송 > API 설정에서 키 입력 시 실제 문자가 즉시 발송됩니다)',
        })
      }

      const date = new Date().toISOString()
      const salt = crypto.randomBytes(16).toString('hex')
      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(date + salt)
        .digest('hex')
      const authHeader = `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`

      const solapiPayload = {
        messages: validMessages.map((m) => ({
          to: m.to,
          from: sender,
          text: m.text,
          ...(Buffer.byteLength(m.text, 'utf8') > 90 ? { subject: m.subject } : {}),
        })),
      }

      const response = await fetch('https://api.solapi.com/messages/v4/send-many', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(solapiPayload),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        return res.status(200).json({
          ok: false,
          mode: 'error',
          provider: 'solapi',
          error: result?.errorMessage || result?.message || `HTTP ${response.status}`,
          details: result,
        })
      }

      return res.status(200).json({
        ok: true,
        mode: 'live',
        provider: 'solapi',
        count: validMessages.length,
        result,
      })
    }

    // 2. 알리고 (Aligo) 발송 처리
    if (provider === 'aligo') {
      const apiKey = (clientConfig.apiKey || process.env.ALIGO_API_KEY || '').trim()
      const userId = (clientConfig.aligoUserId || process.env.ALIGO_USER_ID || '').trim()
      const sender = cleanPhone(
        clientConfig.senderPhone || process.env.ALIGO_SENDER_PHONE || '01049121083'
      )

      if (!apiKey || !userId) {
        return res.status(200).json({
          ok: true,
          mode: 'simulated',
          provider: 'aligo',
          count: validMessages.length,
          message:
            '알리고(Aligo) API 키/아이디가 아직 설정되지 않아 전산 발송 로그에 기록되었습니다.',
        })
      }

      const results = []
      for (const msg of validMessages) {
        const params = new URLSearchParams()
        params.append('key', apiKey)
        params.append('user_id', userId)
        params.append('sender', sender)
        params.append('receiver', msg.to)
        params.append('msg', msg.text)
        params.append('title', msg.subject)
        params.append('msg_type', Buffer.byteLength(msg.text, 'utf8') > 90 ? 'LMS' : 'SMS')

        const r = await fetch('https://apis.aligo.in/send/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        })
        const data = await r.json().catch(() => ({}))
        results.push(data)
      }

      return res.status(200).json({
        ok: true,
        mode: 'live',
        provider: 'aligo',
        count: validMessages.length,
        result: results,
      })
    }

    return res.status(200).json({
      ok: true,
      mode: 'simulated',
      count: validMessages.length,
    })
  } catch (err) {
    return res.status(200).json({
      ok: false,
      mode: 'error',
      error: err?.message || 'SMS 발송 처리 중 오류가 발생했습니다.',
    })
  }
}
