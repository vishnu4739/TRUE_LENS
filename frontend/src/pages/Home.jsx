import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { analyzeImage } from '../services/analysisService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Shield, Cpu, Activity, Database, ArrowRight } from 'lucide-react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(selectedFile);
      // Navigate to results page with prediction id
      const predId = result._id || result.id || result.prediction_id;
      navigate(`/results/${predId}`, { state: { prediction: result } });
    } catch (err) {
      setError(err.message || 'Analysis failed. Please check backend and ML service status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page home-page">
      <div className="container">
        {/* Header Hero Section */}
        <div className="hero-section">
          <div className="brand-header">
            <span className="hero-tag">Computer Science Research System</span>
            <h1 className="hero-title">TrueLens</h1>
            <p className="hero-subtitle">
              AI-Powered Image Authenticity Detection System. Evaluates statistical noise, 
              frequency artifacts, and texture signatures to estimate whether an image is 
              likely camera-captured or synthetic.
            </p>
          </div>

          {/* Quick Notice */}
          <div className="research-advisory">
            <strong>Model Assessment Notice:</strong> Predictions are algorithmic confidence estimates, 
            not conclusive legal evidence of origin. Seven supervised models provide cross-validation.
          </div>
        </div>

        {/* Upload & Analysis Box */}
        <div className="analysis-box card">
          <h2 className="box-title">Upload Image for Authenticity Inspection</h2>
          <p className="box-desc">
            Select or drag an image file to begin multi-model feature analysis.
          </p>

          <ImageUploader
            selectedFile={selectedFile}
            onImageSelect={(file) => setSelectedFile(file)}
            onRemove={() => setSelectedFile(null)}
          />

          {error && (
            <div style={{ marginTop: '16px' }}>
              <ErrorMessage message={error} onRetry={handleAnalyze} />
            </div>
          )}

          {loading ? (
            <LoadingSpinner message="Extracting HOG, texture, DCT features and evaluating across trained algorithms..." />
          ) : (
            <div className="action-row">
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="btn btn-primary analyze-btn"
              >
                <span>Analyze Authenticity</span>
                <ArrowRight size={16} />
              </button>
              {selectedFile && (
                <span className="ready-indicator">Image ready for model inference</span>
              )}
            </div>
          )}
        </div>

        {/* Methodology Flow */}
        <div className="methodology-section">
          <div className="section-header">
            <h2 className="section-title">Detection Methodology</h2>
            <p className="section-subtitle">
              How TrueLens examines uploaded images across multiple algorithmic tiers
            </p>
          </div>

          <div className="grid-3 method-grid">
            <div className="card method-card">
              <div className="method-step">01</div>
              <Cpu size={22} className="method-icon" />
              <h3 className="method-title">Feature Extraction</h3>
              <p className="method-desc">
                Extracts Histogram of Oriented Gradients (HOG), Local Binary Pattern texture 
                statistics, Discrete Cosine Transform (DCT) frequency distributions, and color moments.
              </p>
            </div>

            <div className="card method-card">
              <div className="method-step">02</div>
              <Activity size={22} className="method-icon" />
              <h3 className="method-title">Multi-Model Inference</h3>
              <p className="method-desc">
                Processes inputs concurrently through 7 trained architectures: Logistic Regression, 
                Random Forest, SVM, KNN, XGBoost, CNN, and Vision Transformer.
              </p>
            </div>

            <div className="card method-card">
              <div className="method-step">03</div>
              <Database size={22} className="method-icon" />
              <h3 className="method-title">Uncertainty Scoring</h3>
              <p className="method-desc">
                Calculates aggregate confidence probabilities. If predictions conflict or fall within 
                the 40% - 60% margin, the result is flagged as inconclusive rather than false certainty.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Formats Info */}
        <div className="card specs-card">
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Supported File Types</span>
              <span className="spec-val">JPG, JPEG, PNG, WEBP</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Maximum Upload Size</span>
              <span className="spec-val">10 Megabytes</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Algorithmic Families</span>
              <span className="spec-val">Traditional ML + Deep Learning</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Inference Mode</span>
              <span className="spec-val">Local Offline Inference</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .home-page {
          padding-top: 40px;
        }
        .hero-section {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 40px;
        }
        .hero-tag {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-secondary);
          display: inline-block;
          margin-bottom: 8px;
        }
        .hero-title {
          font-size: 2.75rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--color-primary);
          margin-bottom: 12px;
        }
        .hero-subtitle {
          font-size: 1.125rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .research-advisory {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #1E40AF;
          padding: 12px 18px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          text-align: left;
        }
        .analysis-box {
          max-width: 780px;
          margin: 0 auto 64px;
          padding: 32px;
        }
        .box-title {
          font-size: 1.35rem;
          margin-bottom: 6px;
        }
        .box-desc {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin-bottom: 24px;
        }
        .action-row {
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .analyze-btn {
          padding: 12px 28px;
          font-size: 1rem;
        }
        .ready-indicator {
          font-size: 0.85rem;
          color: var(--color-success);
          font-weight: 500;
        }
        .methodology-section {
          margin-bottom: 48px;
        }
        .section-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 1.5rem;
          margin-bottom: 6px;
        }
        .section-subtitle {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
        }
        .method-card {
          position: relative;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .method-step {
          position: absolute;
          top: 20px;
          right: 20px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-text-muted);
        }
        .method-icon {
          color: var(--color-primary);
        }
        .method-title {
          font-size: 1.1rem;
        }
        .method-desc {
          font-size: 0.875rem;
          line-height: 1.55;
        }
        .specs-card {
          padding: 24px 32px;
          background: var(--color-surface);
        }
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .spec-label {
          font-size: 0.775rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
          font-weight: 600;
        }
        .spec-val {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.1rem;
          }
          .analysis-box {
            padding: 20px;
          }
          .specs-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .specs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
