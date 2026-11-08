import React from 'react';
import { ShieldCheck, Cpu, Database, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="page about-page">
      <div className="container about-container">
        <div className="page-header">
          <h1>Platform Overview</h1>
          <p>
            TrueLens provides automated forensic verification to differentiate authentic camera captures from synthetic AI media.
          </p>
        </div>

        <div className="about-stack">
          {/* Card 1: Core Purpose */}
          <div className="card concise-card">
            <div className="concise-header">
              <ShieldCheck size={20} className="concise-icon" />
              <h2>Core Purpose</h2>
            </div>
            <p className="concise-statement">
              Deterministic verification of digital image provenance using algorithmic pattern recognition.
            </p>
            <div className="spec-list">
              <div className="spec-line">
                <CheckCircle2 size={16} className="spec-check" />
                <span>Distinguishes natural optical sensor artifacts from synthetic generative diffusion noise.</span>
              </div>
              <div className="spec-line">
                <CheckCircle2 size={16} className="spec-check" />
                <span>Provides objective probability scores for both authentic and synthetic classifications.</span>
              </div>
              <div className="spec-line">
                <CheckCircle2 size={16} className="spec-check" />
                <span>Detects image tampering, latent upscaling artifacts, and synthetic face generation.</span>
              </div>
            </div>
          </div>

          {/* Card 2: Algorithms */}
          <div className="card concise-card">
            <div className="concise-header">
              <Cpu size={20} className="concise-icon" />
              <h2>Detection Engines</h2>
            </div>
            <p className="concise-statement">
              Multi-model consensus combining traditional statistical classifiers and deep vision networks.
            </p>
            <div className="engine-grid">
              <div className="engine-badge">Logistic Regression</div>
              <div className="engine-badge">Random Forest</div>
              <div className="engine-badge">Support Vector Machine (SVM)</div>
              <div className="engine-badge">K-Nearest Neighbors (KNN)</div>
              <div className="engine-badge">XGBoost Gradient Boosting</div>
              <div className="engine-badge">Convolutional Neural Network (CNN)</div>
              <div className="engine-badge">Vision Transformer (ViT)</div>
            </div>
          </div>

          {/* Card 3: Security & Privacy */}
          <div className="card concise-card">
            <div className="concise-header">
              <Database size={20} className="concise-icon" />
              <h2>Security &amp; Data Handling</h2>
            </div>
            <p className="concise-statement">
              Built for confidential forensics with zero permanent storage of uploaded imagery.
            </p>
            <div className="spec-list">
              <div className="spec-line">
                <CheckCircle2 size={16} className="spec-check" />
                <span>In-memory processing ensures image buffers are released immediately after inference.</span>
              </div>
              <div className="spec-line">
                <CheckCircle2 size={16} className="spec-check" />
                <span>Zero telemetry or tracking tags attached to uploaded files.</span>
              </div>
              <div className="spec-line">
                <CheckCircle2 size={16} className="spec-check" />
                <span>Encrypted transit via HTTPS and strict Content Security Policy enforcement.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about-page {
          padding-top: 36px;
          padding-bottom: 60px;
        }
        .about-container {
          max-width: 780px;
        }
        .page-header {
          text-align: center;
          margin-bottom: 36px;
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
        .about-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .concise-card {
          padding: 28px 32px;
          background: #ffffff;
        }
        .concise-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .concise-icon {
          color: #2563EB;
        }
        .concise-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .concise-statement {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin: 0 0 18px 0;
          line-height: 1.5;
        }
        .spec-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .spec-line {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--color-text-primary);
          line-height: 1.4;
        }
        .spec-check {
          color: var(--color-success);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .engine-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .engine-badge {
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          color: var(--color-text-primary);
          font-size: 0.825rem;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: var(--radius-sm);
        }
        @media (max-width: 640px) {
          .concise-card {
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
