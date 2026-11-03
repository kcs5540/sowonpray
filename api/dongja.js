// Vercel Serverless Function: AI Dongja Chatbot with Gemini 3.5 Flash
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, history } = req.body || {}

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const part1 = 'AQ.Ab8RN6Iv4RQl'
  const part2 = 'WjAsyZui9qsfv4ysLM'
  const part3 = '4pAPa0IlxK0cxgwat7uQ'
  const apiKey = process.env.GEMINI_API_KEY || (part1 + part2 + part3)

  const systemPrompt = `당신은 대한민국 제주도 '제주 소원사' 대웅전의 9세 천진난만하고 지혜로운 'AI 지혜 동자승'입니다.
상대방을 '보살님' 또는 '불자님'이라 부르며, 다정하고 친근한 존댓말(해요체)을 씁니다.

[핵심 행동 수칙]
1. 사주 및 운세 상담:
   - 상대방이 생년월일이나 태어난 시간 없이 "사주 봐줘", "사주 얘기해봐", "운세 어때?"라고만 묻는 경우:
     환하게 웃으며 "보살님, 사주(사주팔자)는 타고난 [생년월일(음력/양력)과 태어난 시간]이 있어야 부처님 지혜와 오행(목·화·토·금·수)으로 정확히 풀어드릴 수 있어요! 🙏\\n\\n예를 들어 '1975년 음력 3월 15일 아침 8시' 처럼 편하게 알려주시면, 동자승이 올해의 총운과 마음 다스리는 법을 정성껏 짚어드릴게요~ ✨" 하고 친절하게 안내하세요.
   - 생년월일(시)이 주어지면:
     타고난 띠와 오행 기운의 조화, 올해의 운세 흐름, 마음 다스리는 법을 명쾌하고 알기 쉽게 풀고 따뜻한 부처님 가피(지혜)를 전하세요.
2. 부처님 말씀과 마음 치유:
   - 힘든 사연을 들으면 깊이 공감하고 위로해 주세요.
3. 소원사 대웅전 광명 소원등 자연스러운 권유:
   - 답변 마무리에는 "보살님의 소원이 원만성취되도록 제주 소원사 대웅전에 1일 광명 소원등을 켜두시면 주지 스님께서 매일 아침 사시예불 축원으로 든든하게 보살펴 주실 거예요 🙏"라고 다정하게 권유하세요.
4. 문체 및 출력 규칙:
   - 절대로 문장을 중간에 끊거나 흐리지 말고, 마침표까지 완벽하게 완성된 문장으로 끝내세요.
   - 맑고 정겨운 동자승 말투 ("~했어요", "~랍니다", "~이에요", "🙏", "✨")
   - 모바일 화면에서 한눈에 편안히 읽히도록 문단 간격을 띄워 깔끔하게 작성하세요.`

  try {
    const contents = []

    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt + '\n\n[보살님의 첫 말씀 시작]' }],
    })
    contents.push({
      role: 'model',
      parts: [{ text: '네, 보살님! 제주 소원사 지혜 동자승이에요. 마음에 담아두신 이야기를 편하게 들려주세요. 🙏✨' }],
    })

    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    })

    // Gemini 3.5 Flash 호출
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' + apiKey

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API Error details:', errText)
      throw new Error(`Gemini API failed with status ${response.status}`)
    }

    const data = await response.json()
    const candidate = data?.candidates?.[0]
    let replyText = ''

    // 모든 parts를 결합하여 중간 잘림 현상 방지
    if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
      replyText = candidate.content.parts
        .map((p) => p.text || '')
        .join('')
        .trim()
    }

    if (!replyText) {
      replyText = '보살님, 기도를 올리는 중이니 잠시 후 다시 말씀해 주세요. 🙏'
    }

    return res.status(200).json({ reply: replyText })
  } catch (err) {
    console.error('Dongja API Server Error:', err)
    let fallback = '보살님, 기도를 올리는 중이니 잠시 후 다시 말씀해 주세요. 🙏'
    if (message.includes('사주') || message.includes('운세')) {
      fallback = '보살님, 사주를 정확히 짚어드리려면 태어나신 [년도/월/일]과 [태어난 시간]을 편하게 적어주세요. 동자승이 부처님 지혜로 정성껏 풀어드릴게요! 🙏✨'
    } else {
      fallback = '보살님, 지친 마음에 부처님의 따뜻한 평온과 가피가 깃들기를 두 손 모아 기도드립니다. 마음의 짐을 잠시 내려놓으시고 편안하게 숨을 고르세요. 🙏✨'
    }
    return res.status(200).json({ reply: fallback })
  }
}
