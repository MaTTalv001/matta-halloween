// src/utils/geminiApi.ts (Updated)
import { blobToBase64 } from './imageUtils'

export const transformImageWithGemini = async (imageBlob: Blob): Promise<string> => {
  try {
    // Convert blob to base64
    const base64Data = await blobToBase64(imageBlob)
    const dataUrl = `data:${imageBlob.type};base64,${base64Data}`
    
    // Call our backend API instead of Gemini directly
    const response = await fetch('/api/transform-halloween', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: dataUrl
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      if (response.status === 503 && errorData.retryable) {
        throw new Error('Service temporarily unavailable. Please try again in a few minutes.')
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success && data.transformedImage) {
      return data.transformedImage
    } else {
      throw new Error(data.error || 'Transform failed')
    }
    
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}