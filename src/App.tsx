// src/App.tsx (改良版)
import React, { useState, ChangeEvent } from 'react'
import { useHalloweenFilter } from './hooks/useHalloweenFilter'
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [transformedImage, setTransformedImage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  
  const { transformImage, loading, error } = useHalloweenFilter()

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setTransformedImage(null) // リセット
    }
  }

  const transformToHalloween = async (): Promise<void> => {
    if (!selectedImage) return
    
    try {
      const result = await transformImage(selectedImage)
      setTransformedImage(result)
      
    } catch (error) {
      console.error('変換エラー:', error)
      alert('変換に失敗しました')
    }
  }

  const handleDownload = (): void => {
    if (!transformedImage) return
    
    const link = document.createElement('a')
    link.download = `halloween-magic-${Date.now()}.png`
    link.href = transformedImage
    link.click()
  }

  const handleReset = (): void => {
    setSelectedImage(null)
    setTransformedImage(null)
    setPreviewUrl('')
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  return (
    <div className="app">
      {/* ヘッダー */}
      <div className="navbar">
        <div className="navbar-content">
          <h1 className="app-title">
            🎃 ハロウィン写真変換アプリ
          </h1>
          <div className="app-description">
            写真をアップロードして、AIでハロウィン風に変換しよう！
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container">
        {!selectedImage ? (
          /* アップロードエリア */
          <div className="upload-section">
            <ImageUploader onImageUpload={handleImageSelect} />
          </div>
        ) : (
          /* 比較表示エリア */
          <div className="comparison-section">
            {/* 画像比較エリア */}
            <div className="image-comparison">
              {/* オリジナル画像 */}
              <div className="image-panel">
                <h3 className="panel-title">元の写真</h3>
                <div className="image-container">
                  <img 
                    src={previewUrl} 
                    alt="元の写真" 
                    className="comparison-image"
                  />
                </div>
              </div>

              {/* 変換後画像 */}
              <div className="image-panel">
                <h3 className="panel-title">ハロウィン変換後</h3>
                <div className="image-container">
                  {loading && (
                    <div className="loading-container">
                      <div className="spinner"></div>
                      <p>ハロウィン魔法をかけています...</p>
                    </div>
                  )}
                  
                  {transformedImage && !loading && (
                    <img 
                      src={transformedImage} 
                      alt="ハロウィン変換後" 
                      className="comparison-image"
                    />
                  )}
                  
                  {!transformedImage && !loading && (
                    <div className="placeholder-container">
                      <div className="placeholder-icon">🎭</div>
                      <p>「ハロウィン変換」ボタンを<br/>押して変換してください</p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="error-container">
                      <p className="error-message">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* コントロールエリア */}
            <div className="controls">
              <button 
                onClick={transformToHalloween}
                disabled={loading}
                className={`transform-btn ${loading ? 'loading' : ''}`}
                type="button"
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    変換中...
                  </>
                ) : (
                  '🎃 ハロウィン変換'
                )}
              </button>
              
              {transformedImage && (
                <button 
                  onClick={handleDownload}
                  className="download-btn"
                  type="button"
                >
                  📱 ダウンロード
                </button>
              )}

              <button 
                onClick={handleReset}
                className="reset-btn"
                type="button"
              >
                🔄 新しい写真
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App