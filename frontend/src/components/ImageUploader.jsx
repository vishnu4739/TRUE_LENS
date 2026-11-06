import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, X, FileCheck } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ImageUploader({ onImageSelect, selectedFile, onRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndProcessFile = (file) => {
    setError(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB maximum limit.`);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileMeta({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type.replace('image/', '').toUpperCase(),
    });

    onImageSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileMeta(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="uploader-container">
      {error && (
        <div className="upload-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!previewUrl ? (
        <div
          className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp"
            className="sr-only"
          />
          <div className="drop-content">
            <div className="icon-wrapper">
              <Upload size={28} strokeWidth={2} />
            </div>
            <div className="drop-text">
              <p className="primary-text">
                <span className="upload-link">Click to upload</span> or drag and drop an image
              </p>
              <p className="secondary-text">Supported formats: JPG, JPEG, PNG, WEBP (Max 10 MB)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="preview-container card">
          <div className="preview-header">
            <div className="file-info">
              <FileCheck size={18} className="file-icon" />
              <div>
                <span className="file-name">{fileMeta?.name}</span>
                <span className="file-details">
                  {fileMeta?.type} &bull; {fileMeta?.size}
                </span>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="btn btn-ghost btn-sm remove-btn"
              title="Remove image"
            >
              <X size={16} />
              <span>Remove</span>
            </button>
          </div>

          <div className="preview-image-wrapper">
            <img src={previewUrl} alt="Preview for authenticity analysis" className="preview-img" />
          </div>
        </div>
      )}

      <style>{`
        .uploader-container {
          width: 100%;
        }
        .upload-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--color-error-bg);
          border: 1px solid var(--color-error-border);
          color: var(--color-error);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          margin-bottom: 16px;
          font-size: 0.9rem;
        }
        .drop-zone {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-surface);
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-normal);
        }
        .drop-zone:hover,
        .drop-zone-active {
          border-color: var(--color-primary);
          background: #F1F5F9;
        }
        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--color-background);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          border: 1px solid var(--color-border);
        }
        .primary-text {
          font-weight: 500;
          color: var(--color-text-primary);
          margin-bottom: 4px;
        }
        .upload-link {
          color: var(--color-accent);
          text-decoration: underline;
        }
        .secondary-text {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .preview-container {
          padding: 16px;
        }
        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--color-border);
        }
        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .file-icon {
          color: var(--color-success);
        }
        .file-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-text-primary);
          display: block;
        }
        .file-details {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
        .preview-image-wrapper {
          max-height: 400px;
          overflow: hidden;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0F172A;
        }
        .preview-img {
          max-height: 400px;
          object-fit: contain;
          width: auto;
        }
      `}</style>
    </div>
  );
}
