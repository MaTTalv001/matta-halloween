// src/App.tsx
import React, { useState, ChangeEvent } from 'react'
import './App.css'

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [transformedImage, setTransformedImage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setTransformedImage(null)
      setError(null)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const transformToHalloween = async (): Promise<void> => {
    if (!selectedImage) return
    
    setLoading(true)
    setError(null)
    
    try {
      const base64Data = await fileToBase64(selectedImage)
      
      const response = await fetch('/api/transform-halloween', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64Data
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.transformedImage) {
        setTransformedImage(data.transformedImage)
      } else {
        throw new Error(data.error || '変換に失敗しました')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラー'
      setError(errorMessage)
      console.error('変換エラー:', err)
    } finally {
      setLoading(false)
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
    setError(null)
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  return (
    <div className="app">
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

      <div className="container">
        {!selectedImage ? (
          <div className="upload-section">
            <div className="image-uploader">
              <div className="upload-content">
                <div className="upload-icon">📸</div>
                <h3>写真をアップロード</h3>
                <p>ドラッグ＆ドロップまたはクリックして選択</p>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="file-input"
                  id="file-input"
                />
                <label htmlFor="file-input" className="upload-btn">
                  写真を選択
                </label>
                
                <div className="upload-info">
                  <small>対応形式: JPG, PNG, WEBP • 最大 5MB</small>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="comparison-section">
            <div className="image-comparison">
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