// api/transform-halloween.ts (修正版)
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST メソッドのみ対応' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'APIキーが設定されていません' })
  }

  try {
    const { imageData } = req.body

    if (!imageData) {
      return res.status(400).json({ error: '画像データが必要です' })
    }

    const prompt = "Add Halloween costume to this person - witch hat, pumpkin decorations, orange colors"

    const maxRetries = 5
    let lastError = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`試行 ${attempt}/${maxRetries}...`)
        
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
                      data: imageData.split(',')[1]
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

        console.log(`試行 ${attempt}: ステータス ${response.status}`)

        if (response.status === 500) {
          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt - 1) * 1000 + Math.random() * 1000
            console.log(`${waitTime.toFixed(0)}ms 待機してリトライ...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
            continue
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`API エラー: ${response.status} - ${errorData.error?.message || '不明なエラー'}`)
        }

        const data = await response.json()
        console.log('APIレスポンス受信完了')
        
        // 画像データの検索ロジックを修正
        if (data.candidates && data.candidates.length > 0) {
          console.log(`candidates数: ${data.candidates.length}`)
          
          for (let i = 0; i < data.candidates.length; i++) {
            const candidate = data.candidates[i]
            console.log(`candidate ${i} をチェック中...`)
            
            if (candidate.content && candidate.content.parts) {
              console.log(`candidate ${i} の parts数: ${candidate.content.parts.length}`)
              
              for (let j = 0; j < candidate.content.parts.length; j++) {
                const part = candidate.content.parts[j]
                console.log(`part ${j}:`, Object.keys(part))
                
                // inline_data プロパティの存在確認を厳密にチェック
                if (part.inline_data && part.inline_data.data && part.inline_data.mime_type) {
                  console.log(`✅ 画像データを発見! mime_type: ${part.inline_data.mime_type}, data length: ${part.inline_data.data.length}`)
                  
                  return res.status(200).json({
                    success: true,
                    transformedImage: `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`,
                    attemptsUsed: attempt,
                    debug: {
                      candidateIndex: i,
                      partIndex: j,
                      mimeType: part.inline_data.mime_type
                    }
                  })
                }
                
                // inlineData (camelCase) も念のためチェック
                if (part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
                  console.log(`✅ 画像データを発見 (camelCase)! mimeType: ${part.inlineData.mimeType}, data length: ${part.inlineData.data.length}`)
                  
                  return res.status(200).json({
                    success: true,
                    transformedImage: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                    attemptsUsed: attempt,
                    debug: {
                      candidateIndex: i,
                      partIndex: j,
                      mimeType: part.inlineData.mimeType
                    }
                  })
                }
              }
            }
          }
        }
        
        // ここに到達した場合、期待される画像データが見つからなかった
        console.log('❌ 画像データが見つかりませんでした')
        console.log('レスポンス全体:', JSON.stringify(data, null, 2))
        throw new Error('レスポンスに画像データが含まれていません')
        
      } catch (error) {
        lastError = error
        if (attempt < maxRetries && (error as Error).message.includes('500')) {
          const waitTime = Math.pow(2, attempt - 1) * 1000 + Math.random() * 1000
          console.log(`エラー (試行 ${attempt}), ${waitTime.toFixed(0)}ms 待機してリトライ...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else if (attempt >= maxRetries) {
          console.log('全ての試行が失敗しました')
          break
        } else {
          throw error
        }
      }
    }
    
    throw lastError
    
  } catch (error) {
    console.error('最終エラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'サーバーエラー'
    
    return res.status(500).json({ 
      error: errorMessage,
      retryable: errorMessage.includes('500') || errorMessage.includes('INTERNAL')
    })
  }
}