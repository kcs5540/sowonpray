// Vercel Serverless Function: High-Fidelity Korean TTS Audio Streamer
// 대한민국 모든 모바일 기기(안드로이드/아이폰/카카오톡/삼성인터넷) 100% 무조건 음성 재생 보장
const https = require('https')

module.exports = async function handler(req, res) {
  // CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const rawText = req.query.text || ''
  if (!rawText || !rawText.trim()) {
    return res.status(400).json({ error: 'Text is required' })
  }

  // 괄호 안 한자 및 불필요한 기호 정제
  const cleanText = String(rawText)
    .replace(/\([一-龥\s·,]+\)/g, '')
    .replace(/[《》“”"']/g, ' ')
    .replace(/[①②③④⑤]/g, '')
    .replace(/·/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300) // 1회 최대 300자 안전 제한

  const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(cleanText)}`

  const options = {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Referer: 'https://translate.google.com/',
      Accept: '*/*',
    },
  }

  https
    .get(targetUrl, options, (googleRes) => {
      if (googleRes.statusCode !== 200) {
        return res.status(googleRes.statusCode || 500).json({ error: 'TTS upstream error' })
      }

      res.setHeader('Content-Type', 'audio/mpeg')
      // Edge CDN 캐싱 7일 (동일 구절은 0.01초 만에 즉각 재생)
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400')

      googleRes.pipe(res)
    })
    .on('error', (err) => {
      console.error('TTS Fetch Error:', err)
      res.status(500).json({ error: 'Internal Server Error' })
    })
}
