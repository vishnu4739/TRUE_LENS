import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { analyzeImage } from '../services/analysisService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Logo from '../components/Logo';
import { ShieldCheck, Cpu, Activity, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

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
      const previewUrl = URL.createObjectURL(selectedFile);
      result.previewUrl = previewUrl;
      const predId = result._id || result.id || result.prediction_id;
      navigate(`/results/${predId}`, { state: { prediction: result } });
    } catch (err) {
      setError(err.message || 'Forensic analysis could not be completed. Please try another image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page home-page">
      <div className="container">
        {/* Concise Hero Section */}
        <section className="hero-section">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>Image Forensics Engine</span>
          </div>

          <h1 className="hero-title">
            Verify Image Authenticity
          </h1>

          <p className="hero-tagline">
            Deterministic forensic analysis to verify original photography versus synthetic AI media.
          </p>
        </section>

        {/* Upload & Direct Analysis Workspace */}
        <div className="upload-container card">
          <div className="upload-header">
            <h2 className="upload-heading">Select Image for Forensic Verification</h2>
            <p className="upload-subheading">
              Supports standard formats (JPG, PNG, WEBP) up to 10 MB.
            </p>
          </div>

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
            <LoadingSpinner message="Executing multi-model forensic inference..." />
          ) : (
            <div className="upload-actions">
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="btn btn-primary analyze-submit-btn"
              >
                <span>Analyze Authenticity</span>
                <ArrowRight size={16} />
              </button>
              {selectedFile && (
                <span className="status-ready">
                  <CheckCircle2 size={16} />
                  Ready for verification
                </span>
              )}
            </div>
          )}
        </div>

        {/* Single-Line Core Pillars */}
        <section className="pillars-section">
          <div className="grid-3 pillars-grid">
            <div className="card pillar-card">
              <div className="pillar-icon-box">
                <Cpu size={20} />
              </div>
              <h3 className="pillar-title">Multi-Model Consensus</h3>
              <p className="pillar-desc">
                Cross-validates predictions across 7 machine learning and neural architectures.
              </p>
            </div>

            <div className="card pillar-card">
              <div className="pillar-icon-box">
                <Activity size={20} />
              </div>
              <h3 className="pillar-title">Frequency Forensics</h3>
              <p className="pillar-desc">
                Detects generative diffusion artifacts in spatial and frequency domains.
              </p>
            </div>

            <div className="card pillar-card">
              <div className="pillar-icon-box">
                <Lock size={20} />
              </div>
              <h3 className="pillar-title">Privacy Guaranteed</h3>
              <p className="pillar-desc">
                In-memory evaluation with no permanent external image retention.
              </p>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .home-page {
          padding-top: 36px;
          padding-bottom: 60px;
        }
        .hero-section {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 36px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EFF6FF;
          border: 1px solid #DBEAFE;
          color: #1D4ED8;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 999px;
          margin-bottom: 16px;
          letter-spacing: 0.02em;
        }
        .badge-dot {
          width: 6px;
          height: 6px;
          background: #2563EB;
          border-radius: 50%;
        }
        .hero-title {
          font-size: 2.75rem;
          font-weight: 800;
          letter-spacing: -0.035em;
          color: var(--color-text-primary);
          line-height: 1.15;
          margin-bottom: 12px;
        }
        .hero-tagline {
          font-size: 1.125rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin: 0;
        }
        .upload-container {
          max-width: 720px;
          margin: 0 auto 48px;
          padding: 32px;
          background: #ffffff;
        }
        .upload-header {
          margin-bottom: 20px;
        }
        .upload-heading {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 4px;
        }
        .upload-subheading {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin: 0;
        }
        .upload-actions {
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .analyze-submit-btn {
          padding: 12px 24px;
          font-size: 0.95rem;
        }
        .status-ready {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: var(--color-success);
          font-weight: 500;
        }
        .pillars-section {
          max-width: 960px;
          margin: 0 auto;
        }
        .pillar-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #ffffff;
        }
        .pillar-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #EFF6FF;
          color: #2563EB;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .pillar-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .pillar-desc {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin: 0;
        }
        @media (max-width: 640px) {
          .hero-title {
            font-size: 2.1rem;
          }
          .upload-container {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
