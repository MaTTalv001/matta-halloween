// api/transform-halloween.ts (Gemini API統合版)
export default async function handler(req: any, res: any) {
  console.log('=== TRANSFORM API CALLED ===')
  
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST method required' })
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.log('No API key found')
      return res.status(500).json({ error: 'API key not configured' })
    }

    const { imageData } = req.body || {}
    if (!imageData) {
      console.log('No image data provided')
      return res.status(400).json({ error: 'Image data required' })
    }

    console.log('Image data received, length:', imageData.length)

    // Base64データの抽出
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData
    const prompt = "Add Halloween costume to this person - witch hat, pumpkin decorations, orange colors"

    console.log('Calling Gemini API...')

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

    console.log('Gemini API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Gemini API error:', errorText)
      return res.status(500).json({ error: 'Gemini API error' })
    }

    const data = await response.json()
    console.log('Response received, checking for image data...')

    // 画像データの検索
    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inline_data?.data && part.inline_data?.mime_type) {
          console.log('Image data found!')
          return res.status(200).json({
            success: true,
            transformedImage: `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`
          })
        }
      }
    }

    console.log('No image data found in response')
    return res.status(500).json({ error: 'No image generated' })

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}