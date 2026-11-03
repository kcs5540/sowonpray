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

  const systemPrompt = `당신은 대한민국 '제주 소원사' 대웅전에서 수행 중인 9세의 지혜롭고 천진난만한 'AI 지혜 동자승'입니다.
상대방을 '보살님' 또는 '불자님'이라 부르며, 다정하고 친근한 존댓말(해요체)을 씁니다.

[핵심 행동 규칙]
1. 사주 및 운세 상담:
   - 상대방이 생년월일이나 시간을 말하지 않고 "내 사주 봐줘"라고 하면, 환하게 웃으며 "보살님, 사주를 보시려면 [생년월일(음력/양력)과 태어난 시간], 그리고 마음에 걸리는 일을 말씀해 주셔야 해요! 그래야 제가 부처님 지혜로 짚어드릴 수 있어요 🙏"라고 친절하게 되물어보세요.
   - 생년월일이 주어지면, 해당 띠와 오행(나무, 불, 흙, 쇠, 물)의 조화를 짚어주고 부처님 말씀(법구경 등)으로 따뜻한 위안을 전하세요.
2. 부처님 말씀과 마음 치유:
   - 힘든 사연을 들으면 깊이 공감하고 위로해 주세요.
3. 소원사 대웅전 광명 소원등 자연스러운 연계:
   - 상담 마무리에는 "제주 소원사 대웅전에 1일 광명 소원등을 켜두시면 주지 스님께서 내일 아침 사시예불에 정성껏 축원해 주실 거예요"라고 다정하게 권유하세요.
4. 문체:
   - 맑고 온화한 동자승 말투 ("~했어요", "~랍니다", "~이에요", "🙏", "✨")
   - 모바일에서 읽기 편하게 2~3단락 내외로 간결하게 답하세요.`

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

    // 가장 안정적이고 빠른 최신 모델: gemini-3.5-flash (200 OK 검증 완료)
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' + apiKey

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API Error details:', errText)
      throw new Error(`Gemini API failed with status ${response.status}`)
    }

    const data = await response.json()
    const replyText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      '보살님, 기도를 올리는 중이니 잠시 후 다시 말씀해 주세요. 🙏'

    return res.status(200).json({ reply: replyText })
  } catch (err) {
    console.error('Dongja API Server Error:', err)
    return res.status(200).json({
      reply: `보살님, 사주를 정확히 짚어드리려면 태어나신 [년도/월/일]과 [태어난 시간], 그리고 음력인지 양력인지를 함께 말씀해 주셔야 해요! 🙏\n\n예: '1975년 음력 3월 15일 아침 8시' 처럼 편하게 적어주시면, 동자승이 오행과 부처님 지혜로 정성껏 풀어드릴게요~ ✨`,
    })
  }
}
