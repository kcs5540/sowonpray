import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-tts-api',
      configureServer(server) {
        server.middlewares.use('/api/tts', (req, res) => {
          const urlObj = new URL(req.url, 'http://localhost')
          const rawText = urlObj.searchParams.get('text') || ''
          if (!rawText.trim()) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Text required' }))
            return
          }
          const cleanText = String(rawText)
            .replace(/\([一-龥\s·,]+\)/g, '')
            .replace(/[《》“”"']/g, ' ')
            .replace(/[①②③④⑤]/g, '')
            .replace(/·/g, ', ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 300)
          const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(cleanText)}`
          https
            .get(
              targetUrl,
              {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  Referer: 'https://translate.google.com/',
                },
              },
              (upstreamRes) => {
                res.setHeader('Content-Type', 'audio/mpeg')
                res.setHeader('Access-Control-Allow-Origin', '*')
                upstreamRes.pipe(res)
              }
            )
            .on('error', (err) => {
              res.statusCode = 500
              res.end(err.message)
            })
        })
      },
    },
  ],
})
