// src/components/ImagePreview.tsx
import React from 'react'

interface ImagePreviewProps {
  originalUrl: string
  transformedUrl?: string
  loading?: boolean
  error?: string
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  originalUrl,
  transformedUrl,
  loading,
  error
}) => {
  const handleDownload = () => {
    if (transformedUrl) {
      const link = document.createElement('a')
      link.href = transformedUrl
      link.download = `halloween-transformed-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="image-preview">
      <div className="preview-grid">
        {/* Original Image */}
        <div className="preview-item">
          <h3>Original</h3>
          <div className="image-container">
            <img src={originalUrl} alt="Original" className="preview-image" />
          </div>
        </div>

        {/* Transformed Image */}
        <div className="preview-item">
          <h3>Halloween Transform</h3>
          <div className="image-container">
            {loading && (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Adding Halloween magic...</p>
              </div>
            )}
            
            {error && (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <p className="error-hint">Try again or use a different image</p>
              </div>
            )}
            
            {transformedUrl && !loading && (
              <img src={transformedUrl} alt="Halloween Transform" className="preview-image" />
            )}
            
            {!transformedUrl && !loading && !error && (
              <div className="placeholder-container">
                <div className="placeholder-icon">🎃</div>
                <p>Click "Add Halloween Magic" to transform</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {transformedUrl && (
        <div className="download-section">
          <button onClick={handleDownload} className="download-btn">
            📱 Download Halloween Photo
          </button>
        </div>
      )}
    </div>
  )
}
