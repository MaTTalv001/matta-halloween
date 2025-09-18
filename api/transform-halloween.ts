// api/transform-halloween.ts (デバッグ強化版)
export default async function handler(req: any, res: any) {
  console.log('=== TRANSFORM API CALLED ===')
  
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
      return res.status(500).json({ error: 'API key not configured' })
    }

    const { imageData } = req.body || {}
    if (!imageData) {
      return res.status(400).json({ error: 'Image data required' })
    }

    console.log('Image data received, length:', imageData.length)

    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData
    const prompt = "Add Halloween costume to this person"

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
    
    // レスポンス構造の詳細なデバッグ
    console.log('Full response structure:', JSON.stringify(data, null, 2))
    console.log('Has candidates:', !!data.candidates)
    console.log('Candidates length:', data.candidates?.length || 0)
    
    if (data.candidates && data.candidates.length > 0) {
      console.log('First candidate:', JSON.stringify(data.candidates[0], null, 2))
    }

    // 画像データの検索
    if (data.candidates?.[0]?.content?.parts) {
      const parts = data.candidates[0].content.parts
      console.log('Parts found:', parts.length)
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        console.log(`Part ${i}:`, Object.keys(part))
        
        if (part.inline_data || part.inlineData) {
          console.log(`Found image data in part ${i}`)
          const imageData = part.inline_data || part.inlineData
          return res.status(200).json({
            success: true,
            transformedImage: `data:${imageData.mime_type || imageData.mimeType};base64,${imageData.data}`
          })
        }
      }
    }

    console.log('No image data found in response')
    return res.status(500).json({ 
      error: 'No image generated',
      debug: {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length || 0,
        responseKeys: Object.keys(data)
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}