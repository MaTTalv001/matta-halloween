// src/components/ImageUploader.tsx
import React, { useCallback, useState } from 'react'

interface ImageUploaderProps {
  onImageUpload: (file: File) => void
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [dragOver, setDragOver] = useState(false)

  const processFile = useCallback((file: File) => {
    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    // ファイルサイズチェック (5MB制限)
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    onImageUpload(file)
  }, [onImageUpload])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const file = event.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  return (
    <div 
      className={`image-uploader ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="upload-content">
        <div className="upload-icon">📸</div>
        <h3>Upload Your Photo</h3>
        <p>Drag & drop or click to select</p>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
          id="file-input"
        />
        <label htmlFor="file-input" className="upload-btn">
          Choose Photo
        </label>
        
        <div className="upload-info">
          <small>Supported: JPG, PNG, WEBP • Max 5MB</small>
        </div>
      </div>
    </div>
  )
}