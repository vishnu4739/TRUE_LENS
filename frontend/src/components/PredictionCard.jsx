import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, Layers } from 'lucide-react';

export default function PredictionCard({ prediction }) {
  if (!prediction) return null;

  const {
    predictionClass,
    predicted_class,
    originalProbability,
    original_probability,
    aiGeneratedProbability,
    ai_generated_probability,
    uncertaintyStatus,
    uncertainty_status,
    modelPredictions,
    model_predictions,
    modelVersion,
    model_version,
    analysisTimestamp,
    analyzed_at,
    imageFilename,
  } = prediction;

  const pClass = predictionClass || predicted_class || 'original';
  const pOrig = originalProbability ?? original_probability ?? 0;
  const pAi = aiGeneratedProbability ?? ai_generated_probability ?? 0;
  const uStatus = uncertaintyStatus || uncertainty_status || 'certain';
  const mPredictions = modelPredictions || model_predictions || [];
  const mVersion = modelVersion || model_version || '1.0.0';
  const timestamp = analysisTimestamp || analyzed_at;

  const isAi = pClass === 'ai_generated' || pClass === 'ai';
  const isUncertain = uStatus === 'uncertain' || uStatus === 'inconclusive' || uStatus === 'highly_uncertain';

  const formatPct = (val) => `${(val * 100).toFixed(1)}%`;

  return (
    <div className="prediction-card card">
      {/* Primary Result Banner */}
      <div className={`result-banner ${isUncertain ? 'banner-uncertain' : isAi ? 'banner-ai' : 'banner-real'}`}>
        <div className="banner-icon">
          {isUncertain ? (
            <HelpCircle size={28} />
          ) : isAi ? (
            <AlertTriangle size={28} />
          ) : (
            <CheckCircle size={28} />
          )}
        </div>
        <div className="banner-text">
          <span className="banner-label">Authenticity Assessment</span>
          <h2 className="banner-title">
            {isUncertain
              ? 'Inconclusive / Uncertain Result'
              : isAi
              ? 'Likely AI-Generated Image'
              : 'Likely Original Photograph'}
          </h2>
          <p className="banner-note">
            {isUncertain
              ? 'The models produced close or conflicting probabilities. No conclusive classification can be made.'
              : isAi
              ? 'Statistical frequency and texture patterns exhibit characteristics commonly found in synthetic generation.'
              : 'Color distribution, sensor grain, and frequency response align with camera-captured photography.'}
          </p>
        </div>
      </div>

      {/* Probability Bars */}
      <div className="probability-section">
        <h3 className="section-title">Aggregate Probability Estimates</h3>
        <div className="prob-grid">
          <div className="prob-item">
            <div className="prob-header">
              <span className="prob-label">Original Photograph</span>
              <span className="prob-value">{formatPct(pOrig)}</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill progress-real"
                style={{ width: `${Math.min(100, Math.max(0, pOrig * 100))}%` }}
              />
            </div>
          </div>

          <div className="prob-item">
            <div className="prob-header">
              <span className="prob-label">AI-Generated Image</span>
              <span className="prob-value">{formatPct(pAi)}</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill progress-ai"
                style={{ width: `${Math.min(100, Math.max(0, pAi * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Uncertainty Advisory Notice */}
      <div className="advisory-box">
        <strong>Notice:</strong> Machine learning predictions represent statistical likelihood estimates 
        derived from algorithmic feature extraction. They do not constitute forensic or legal proof of image provenance.
      </div>

      {/* Per-Model Breakdown */}
      {mPredictions && mPredictions.length > 0 && (
        <div className="models-breakdown-section">
          <div className="breakdown-header">
            <Layers size={18} />
            <h3 className="section-title">Model-Wise Predictions ({mPredictions.length} Algorithms)</h3>
          </div>
          <div className="table-responsive">
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Predicted Class</th>
                  <th>Confidence</th>
                  <th>Real Probability</th>
                  <th>AI Probability</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mPredictions.map((mp, index) => {
                  const mName = mp.modelName || mp.model_name || `Model ${index + 1}`;
                  const mClass = mp.prediction || mp.predicted_class || 'original';
                  const mConf = mp.confidence ?? 0;
                  const mOrigP = mp.originalProbability ?? mp.original_probability ?? (1 - mConf);
                  const mAiP = mp.aiGeneratedProbability ?? mp.ai_generated_probability ?? mConf;
                  const mUnc = mp.is_uncertain ?? (Math.abs(mAiP - mOrigP) < 0.15);

                  const mIsAi = mClass === 'ai_generated' || mClass === 'ai';

                  return (
                    <tr key={mName + index}>
                      <td className="model-name-cell">{mName}</td>
                      <td>
                        <span className={`badge ${mIsAi ? 'badge-error' : 'badge-success'}`}>
                          {mIsAi ? 'AI-Generated' : 'Original'}
                        </span>
                      </td>
                      <td className="mono-cell">{formatPct(mConf)}</td>
                      <td className="mono-cell">{formatPct(mOrigP)}</td>
                      <td className="mono-cell">{formatPct(mAiP)}</td>
                      <td>
                        {mUnc ? (
                          <span className="badge badge-warning">Uncertain</span>
                        ) : (
                          <span className="badge badge-info">Consistent</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Meta Footer */}
      <div className="card-meta-footer">
        {imageFilename && <span>File: <strong>{imageFilename}</strong></span>}
        <span>Model Version: <strong>{mVersion}</strong></span>
        {timestamp && <span>Analyzed: <strong>{new Date(timestamp).toLocaleString()}</strong></span>}
      </div>

      <style>{`
        .prediction-card {
          padding: 0;
          overflow: hidden;
        }
        .result-banner {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 24px;
          border-bottom: 1px solid var(--color-border);
        }
        .banner-real {
          background: var(--color-success-bg);
          border-left: 4px solid var(--color-success);
          color: var(--color-success);
        }
        .banner-ai {
          background: var(--color-error-bg);
          border-left: 4px solid var(--color-error);
          color: var(--color-error);
        }
        .banner-uncertain {
          background: var(--color-warning-bg);
          border-left: 4px solid var(--color-warning);
          color: var(--color-warning);
        }
        .banner-icon {
          flex-shrink: 0;
          padding-top: 2px;
        }
        .banner-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }
        .banner-title {
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 6px;
        }
        .banner-note {
          font-size: 0.925rem;
          color: var(--color-text-secondary);
          line-height: 1.45;
        }
        .probability-section {
          padding: 24px;
          border-bottom: 1px solid var(--color-border);
        }
        .section-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 16px;
        }
        .prob-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .prob-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.875rem;
        }
        .prob-label {
          font-weight: 500;
          color: var(--color-text-primary);
        }
        .prob-value {
          font-weight: 600;
          font-family: var(--font-mono);
          color: var(--color-text-primary);
        }
        .progress-track {
          height: 10px;
          background: var(--color-background);
          border-radius: 9999px;
          overflow: hidden;
          border: 1px solid var(--color-border);
        }
        .progress-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.4s ease;
        }
        .progress-real {
          background: var(--color-success);
        }
        .progress-ai {
          background: var(--color-error);
        }
        .advisory-box {
          margin: 20px 24px;
          padding: 12px 16px;
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }
        .advisory-box strong {
          color: var(--color-text-primary);
        }
        .models-breakdown-section {
          padding: 0 24px 24px;
        }
        .breakdown-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: var(--color-text-primary);
        }
        .breakdown-header .section-title {
          margin-bottom: 0;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .breakdown-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .breakdown-table th {
          text-align: left;
          padding: 10px 12px;
          background: var(--color-background);
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid var(--color-border);
        }
        .breakdown-table td {
          padding: 12px;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-primary);
        }
        .model-name-cell {
          font-weight: 500;
        }
        .mono-cell {
          font-family: var(--font-mono);
          font-size: 0.85rem;
        }
        .card-meta-footer {
          display: flex;
          justify-content: space-between;
          padding: 14px 24px;
          background: var(--color-background);
          border-top: 1px solid var(--color-border);
          font-size: 0.8rem;
          color: var(--color-text-muted);
          flex-wrap: wrap;
          gap: 12px;
        }
        .card-meta-footer strong {
          color: var(--color-text-secondary);
        }
        @media (max-width: 640px) {
          .prob-grid {
            grid-template-columns: 1fr;
          }
          .card-meta-footer {
            flex-direction: column;
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
}
