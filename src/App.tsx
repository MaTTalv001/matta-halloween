// src/App.tsx
import React, { useState, useCallback } from 'react'
import { ImageUploader } from './components/ImageUploader'
import { HalloweenTransformer } from './components/HalloweenTransformer'
import { ImagePreview } from './components/ImagePreview'
import './App.css'

interface ProcessedImage {
  original: string
  transformed?: string
  loading?: boolean
  error?: string
}

const App: React.FC = () => {
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)

  const handleImageUpload = useCallback((file: File) => {
    const originalUrl = URL.createObjectURL(file)
    setProcessedImage({
      original: originalUrl,
      loading: false
    })
  }, [])

  const handleTransformStart = useCallback(() => {
    if (processedImage) {
      setProcessedImage({
        ...processedImage,
        loading: true,
        error: undefined
      })
    }
  }, [processedImage])

  const handleTransformComplete = useCallback((transformedUrl: string) => {
    if (processedImage) {
      setProcessedImage({
        ...processedImage,
        transformed: transformedUrl,
        loading: false
      })
    }
  }, [processedImage])

  const handleTransformError = useCallback((error: string) => {
    if (processedImage) {
      setProcessedImage({
        ...processedImage,
        loading: false,
        error
      })
    }
  }, [processedImage])

  const handleReset = useCallback(() => {
    if (processedImage?.original) {
      URL.revokeObjectURL(processedImage.original)
    }
    if (processedImage?.transformed) {
      URL.revokeObjectURL(processedImage.transformed)
    }
    setProcessedImage(null)
  }, [processedImage])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎃 Halloween Photo Transformer</h1>
        <p>Transform your photos with Halloween magic!</p>
      </header>

      <main className="app-main">
        {!processedImage ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="transform-section">
            <ImagePreview
              originalUrl={processedImage.original}
              transformedUrl={processedImage.transformed}
              loading={processedImage.loading}
              error={processedImage.error}
            />
            
            <div className="controls">
              <HalloweenTransformer
                imageUrl={processedImage.original}
                onTransformStart={handleTransformStart}
                onTransformComplete={handleTransformComplete}
                onTransformError={handleTransformError}
                disabled={processedImage.loading}
              />
              
              <button 
                onClick={handleReset}
                className="reset-btn"
                type="button"
              >
                🔄 New Photo
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App