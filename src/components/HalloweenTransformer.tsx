// src/components/HalloweenTransformer.tsx (修正版)
import React, { useCallback, useState } from 'react'
import { transformImageWithGemini } from '../utils/geminiApi'
import { resizeImage } from '../utils/imageUtils'

interface HalloweenTransformerProps {
  imageUrl: string
  onTransformStart: () => void
  onTransformComplete: (transformedUrl: string) => void
  onTransformError: (error: string) => void
  disabled?: boolean
}

export const HalloweenTransformer: React.FC<HalloweenTransformerProps> = ({
  imageUrl,
  onTransformStart,
  onTransformComplete,
  onTransformError,
  disabled
}) => {
  const [retryCount, setRetryCount] = useState(0)

  const transformImage = useCallback(async () => {
    try {
      onTransformStart()
      setRetryCount(0)

      // 画像をリサイズ
      const resizedImageBlob = await resizeImage(imageUrl, 512, 512)
      
      // API呼び出し
      const transformedDataUrl = await transformImageWithGemini(resizedImageBlob)
      
      onTransformComplete(transformedDataUrl)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Transform error:', error)
      
      // 503エラー（一時的な問題）の場合、自動リトライを提案
      if (errorMessage.includes('一時的に不安定') || errorMessage.includes('503')) {
        setRetryCount(prev => prev + 1)
        onTransformError(`${errorMessage} (試行回数: ${retryCount + 1})`)
      } else {
        onTransformError(errorMessage)
      }
    }
  }, [imageUrl, onTransformStart, onTransformComplete, onTransformError, retryCount])

  return (
    <div className="halloween-transformer">
      <button
        onClick={transformImage}
        disabled={disabled}
        className="transform-btn"
        type="button"
      >
        {disabled ? (
          <>
            <span className="spinner"></span>
            変換中... {retryCount > 0 && `(${retryCount}回目)`}
          </>
        ) : (
          '🎃 ハロウィン魔法をかける'
        )}
      </button>
      
      {retryCount > 0 && (
        <div className="retry-info">
          <small>API が不安定な場合があります。しばらく待ってから再試行してください。</small>
        </div>
      )}
    </div>
  )
}