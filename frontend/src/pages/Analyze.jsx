import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import PredictionCard from '../components/PredictionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { analyzeImage } from '../services/analysisService';
import { ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function Analyze() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      result.previewUrl = previewUrl;
      setPrediction(result);
    } catch (err) {
      setError(err.message || 'Forensic analysis failed. Please select a valid image file.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="page analyze-page">
      <div className="container">
        <div className="page-header">
          <h1>Image Authenticity Verification</h1>
          <p>
            Verify whether an image is an original photograph or synthetic AI media.
          </p>
        </div>

        {!prediction ? (
          <div className="card upload-card">
            <ImageUploader
              selectedFile={selectedFile}
              onImageSelect={(file) => {
                setSelectedFile(file);
                setError(null);
              }}
              onRemove={() => setSelectedFile(null)}
            />

            {error && (
              <div style={{ marginTop: '16px' }}>
                <ErrorMessage message={error} onRetry={handleAnalyze} />
              </div>
            )}

            {loading ? (
              <LoadingSpinner message="Executing multi-model forensic analysis..." />
            ) : (
              <div className="action-bar">
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading}
                  className="btn btn-primary"
                >
                  <span>Verify Authenticity</span>
                  <ArrowRight size={16} />
                </button>
                {selectedFile && (
                  <span className="file-ready-text">
                    <CheckCircle2 size={15} />
                    Ready for inspection
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="results-wrapper">
            <div className="results-actions">
              <button onClick={handleReset} className="btn btn-secondary">
                <RotateCcw size={16} />
                <span>Verify Another Image</span>
              </button>
            </div>

            <PredictionCard prediction={prediction} />
          </div>
        )}
      </div>

      <style>{`
        .analyze-page {
          padding-top: 32px;
          padding-bottom: 60px;
        }
        .page-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .page-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--color-text-primary);
          margin-bottom: 8px;
        }
        .page-header p {
          color: var(--color-text-secondary);
          font-size: 1.05rem;
          margin: 0;
        }
        .upload-card {
          max-width: 720px;
          margin: 0 auto;
          padding: 32px;
          background: #ffffff;
        }
        .action-bar {
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .file-ready-text {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--color-success);
          font-size: 0.875rem;
          font-weight: 500;
        }
        .results-wrapper {
          max-width: 820px;
          margin: 0 auto;
        }
        .results-actions {
          margin-bottom: 20px;
          display: flex;
          justify-content: flex-end;
        }
        @media (max-width: 640px) {
          .upload-card {
            padding: 20px;
          }
          .page-header h1 {
            font-size: 1.85rem;
          }
        }
      `}</style>
    </div>
  );
}
