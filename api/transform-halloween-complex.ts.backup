import type { VercelRequest, VercelResponse } from '@vercel/node'

// シンプルなレート制限
const rateLimiter = new Map<string, number>()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定の改善
  const allowedOrigins = [
    process.env.VERCEL_URL,
    'http://localhost:3000',
    'http://localhost:5173'
  ].filter(Boolean)
  
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST method required' })
  }

  // レート制限
  const clientIP = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress
  const now = Date.now()
  const lastRequest = rateLimiter.get(clientIP)

  if (lastRequest && now - lastRequest < 10000) {
    return res.status(429).json({ error: 'Rate limit exceeded' })
  }
  rateLimiter.set(clientIP, now)

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const { imageData } = req.body

    // 入力検証の強化
    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ error: 'Invalid image data' })
    }

    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' })
    }

    // サイズ制限
    const base64Data = imageData.split(',')[1]
    if (!base64Data) {
      return res.status(400).json({ error: 'Invalid base64 data' })
    }

    const sizeInBytes = (base64Data.length * 3) / 4
    if (sizeInBytes > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large' })
    }

    const prompt = "Add Halloween costume to this person - witch hat, pumpkin decorations, orange colors"
    const maxRetries = 3 // リトライ回数を削減

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: base64Data
                    }
                  }
                ]
              }],
              generationConfig: {
                responseModalities: ["TEXT", "IMAGE"]
              }
            })
          }
        )

        if (response.status === 500 && attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        
        // 画像データの検索
        if (data.candidates?.[0]?.content?.parts) {
          for (const part of data.candidates[0].content.parts) {
            if (part.inline_data?.data && part.inline_data?.mime_type) {
              return res.status(200).json({
                success: true,
                transformedImage: `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`
              })
            }
          }
        }
        
        throw new Error('No image generated')
        
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
  } catch (error) {
    // エラー情報の制限
    const isDev = process.env.NODE_ENV === 'development'
    if (isDev) {
      console.error('Transform error:', error)
    }
    
    return res.status(500).json({ 
      error: 'Internal server error'
    })
  }
}