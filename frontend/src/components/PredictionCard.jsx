import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, Layers, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function PredictionCard({ prediction }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

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

  // Determine qualitative confidence level
  const maxScore = Math.max(pOrig, pAi);
  let confidenceLabel = 'High Confidence';
  if (isUncertain) {
    confidenceLabel = 'Inconclusive / Low Confidence';
  } else if (maxScore < 0.75) {
    confidenceLabel = 'Moderate Confidence';
  }

  // Count how many individual models vote Original vs Not Original
  const originalVotes = mPredictions.filter(
    (m) => (m.prediction || m.predicted_class) === 'original' || (m.prediction || m.predicted_class) === 'real'
  ).length;
  const aiVotes = mPredictions.filter(
    (m) => (m.prediction || m.predicted_class) === 'ai_generated' || (m.prediction || m.predicted_class) === 'ai'
  ).length;
  const totalVotes = mPredictions.length;

  return (
    <div className="prediction-card card">
      {/* Primary Verdict Banner */}
      <div className={`verdict-banner ${isUncertain ? 'verdict-uncertain' : isAi ? 'verdict-ai' : 'verdict-real'}`}>
        <div className="verdict-icon-wrap">
          {isUncertain ? (
            <HelpCircle size={40} />
          ) : isAi ? (
            <ShieldAlert size={40} />
          ) : (
            <ShieldCheck size={40} />
          )}
        </div>

        <div className="verdict-text-block">
          <span className="verdict-category">Authenticity Decision</span>
          <h2 className="verdict-status-title">
            {isUncertain
              ? 'INCONCLUSIVE'
              : isAi
              ? 'NOT ORIGINAL (AI-GENERATED)'
              : 'ORIGINAL'}
          </h2>
          <p className="verdict-status-desc">
            {isUncertain
              ? 'The system cannot reliably confirm whether this image is authentic or AI-generated. The models returned conflicting indicators.'
              : isAi
              ? 'This image is NOT an original photograph. Algorithmic patterns match synthetic / AI-generated characteristics.'
              : 'This image is an ORIGINAL photograph. Sensor grain, edge gradient structure, and color moments match camera captures.'}
          </p>
        </div>
      </div>

      {/* Primary Key Decision Summary Box */}
      <div className="decision-summary-section">
        <div className="decision-metrics-grid">
          <div className="decision-metric-box">
            <span className="dm-label">Final Classification</span>
            <span className={`dm-verdict-badge ${isUncertain ? 'badge-warning' : isAi ? 'badge-error' : 'badge-success'}`}>
              {isUncertain ? 'Inconclusive' : isAi ? 'Not Original' : 'Original'}
            </span>
          </div>

          <div className="decision-metric-box">
            <span className="dm-label">Confidence Assessment</span>
            <span className="dm-value-text">{confidenceLabel}</span>
          </div>

          <div className="decision-metric-box">
            <span className="dm-label">Model Consensus</span>
            <span className="dm-value-text">
              {totalVotes > 0
                ? isAi
                  ? `${aiVotes} of ${totalVotes} algorithms detect AI`
                  : `${originalVotes} of ${totalVotes} algorithms verify Original`
                : 'Consensus verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="advisory-box">
        <strong>Important Note:</strong> This assessment is an automated machine learning determination. 
        It distinguishes between natural camera photographs and AI-generated media based on statistical feature patterns.
      </div>

      {/* Model-Wise Classification Table */}
      {mPredictions && mPredictions.length > 0 && (
        <div className="models-breakdown-section">
          <div className="breakdown-header">
            <Layers size={18} />
            <h3 className="section-title">Individual Algorithm Decisions ({mPredictions.length} Models)</h3>
          </div>
          <div className="table-responsive">
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Verdict</th>
                  <th>Confidence Level</th>
                  <th>Consensus</th>
                </tr>
              </thead>
              <tbody>
                {mPredictions.map((mp, index) => {
                  const mName = mp.modelName || mp.model_name || `Model ${index + 1}`;
                  const mClass = mp.prediction || mp.predicted_class || 'original';
                  const mConf = mp.confidence ?? 0;
                  const mUnc = mp.is_uncertain ?? false;

                  const mIsAi = mClass === 'ai_generated' || mClass === 'ai';
                  const agreesWithOverall = isAi === mIsAi;

                  let mConfLabel = 'High Confidence';
                  if (mUnc) {
                    mConfLabel = 'Uncertain';
                  } else if (mConf < 0.75) {
                    mConfLabel = 'Moderate';
                  }

                  return (
                    <tr key={mName + index}>
                      <td className="model-name-cell">{mName}</td>
                      <td>
                        <span className={`badge ${mIsAi ? 'badge-error' : 'badge-success'} verdict-badge-lg`}>
                          {mIsAi ? 'Not Original (AI)' : 'Original'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${mUnc ? 'badge-warning' : 'badge-info'}`}>
                          {mConfLabel}
                        </span>
                      </td>
                      <td>
                        <span className={agreesWithOverall ? 'consensus-yes' : 'consensus-no'}>
                          {agreesWithOverall ? 'Agrees' : 'Disagrees'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Technical Data Drawer (Optional / Collapsible) */}
      <div className="technical-drawer-section">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="btn btn-ghost btn-sm tech-toggle-btn"
        >
          <span>{showTechnicalDetails ? 'Hide Statistical Probabilities' : 'Show Statistical Probabilities'}</span>
          {showTechnicalDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {showTechnicalDetails && (
          <div className="technical-details-box">
            <div className="tech-stat-row">
              <span>Original Probability Score:</span>
              <code>{(pOrig * 100).toFixed(2)}%</code>
            </div>
            <div className="tech-stat-row">
              <span>AI-Generated Probability Score:</span>
              <code>{(pAi * 100).toFixed(2)}%</code>
            </div>
            <div className="tech-stat-row">
              <span>Uncertainty Margin Status:</span>
              <code>{uStatus}</code>
            </div>
          </div>
        )}
      </div>

      {/* Meta Footer */}
      <div className="card-meta-footer">
        {imageFilename && <span>Image: <strong>{imageFilename}</strong></span>}
        <span>Model Version: <strong>{mVersion}</strong></span>
        {timestamp && <span>Analyzed: <strong>{new Date(timestamp).toLocaleString()}</strong></span>}
      </div>

      <style>{`
        .prediction-card {
          padding: 0;
          overflow: hidden;
        }
        .verdict-banner {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          padding: 32px 28px;
          border-bottom: 1px solid var(--color-border);
        }
        .verdict-real {
          background: #F0FDF4;
          border-left: 6px solid var(--color-success);
          color: var(--color-success);
        }
        .verdict-ai {
          background: #FEF2F2;
          border-left: 6px solid var(--color-error);
          color: var(--color-error);
        }
        .verdict-uncertain {
          background: #FFFBEB;
          border-left: 6px solid var(--color-warning);
          color: var(--color-warning);
        }
        .verdict-icon-wrap {
          flex-shrink: 0;
          padding-top: 2px;
        }
        .verdict-category {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          display: block;
          margin-bottom: 6px;
        }
        .verdict-status-title {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--color-text-primary);
          margin-bottom: 8px;
          line-height: 1.15;
        }
        .verdict-status-desc {
          font-size: 1rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          max-width: 680px;
        }
        .decision-summary-section {
          padding: 24px 28px;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-surface);
        }
        .decision-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .decision-metric-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dm-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
          font-weight: 600;
        }
        .dm-verdict-badge {
          display: inline-block;
          font-size: 1rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: var(--radius-sm);
          width: fit-content;
        }
        .dm-value-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .advisory-box {
          margin: 20px 28px;
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
          padding: 0 28px 24px;
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
          font-size: 1.05rem;
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
          padding: 12px 14px;
          background: var(--color-background);
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: 0.775rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--color-border);
        }
        .breakdown-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-primary);
        }
        .model-name-cell {
          font-weight: 600;
        }
        .verdict-badge-lg {
          padding: 4px 10px;
          font-size: 0.85rem;
        }
        .consensus-yes {
          color: var(--color-success);
          font-weight: 600;
          font-size: 0.85rem;
        }
        .consensus-no {
          color: var(--color-error);
          font-weight: 600;
          font-size: 0.85rem;
        }
        .technical-drawer-section {
          padding: 0 28px 20px;
        }
        .tech-toggle-btn {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .technical-details-box {
          margin-top: 10px;
          padding: 14px 18px;
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.85rem;
        }
        .tech-stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--color-text-secondary);
        }
        .tech-stat-row code {
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .card-meta-footer {
          display: flex;
          justify-content: space-between;
          padding: 14px 28px;
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
          .verdict-banner {
            flex-direction: column;
            gap: 12px;
            padding: 20px;
          }
          .verdict-status-title {
            font-size: 1.4rem;
          }
          .decision-metrics-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .decision-summary-section,
          .advisory-box,
          .models-breakdown-section,
          .technical-drawer-section,
          .card-meta-footer {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      `}</style>
    </div>
  );
}
