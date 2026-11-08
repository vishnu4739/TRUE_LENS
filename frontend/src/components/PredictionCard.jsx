import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, Layers, ShieldCheck, ShieldAlert, Image as ImageIcon } from 'lucide-react';

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
    previewUrl,
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

  const origPct = (pOrig * 100).toFixed(1);
  const aiPct = (pAi * 100).toFixed(1);

  // Qualitative confidence label
  const maxScore = Math.max(pOrig, pAi);
  let confidenceLabel = 'High Confidence';
  if (isUncertain) {
    confidenceLabel = 'Inconclusive / Low Confidence';
  } else if (maxScore < 0.75) {
    confidenceLabel = 'Moderate Confidence';
  }

  // Count algorithm votes
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
            <HelpCircle size={44} />
          ) : isAi ? (
            <ShieldAlert size={44} />
          ) : (
            <ShieldCheck size={44} />
          )}
        </div>

        <div className="verdict-text-block">
          <span className="verdict-category">Authenticity Classification</span>
          <h2 className="verdict-status-title">
            {isUncertain
              ? 'INCONCLUSIVE'
              : isAi
              ? 'NOT ORIGINAL (AI-GENERATED)'
              : 'ORIGINAL PHOTOGRAPH'}
          </h2>
          <p className="verdict-status-desc">
            {isUncertain
              ? 'The system cannot reliably confirm image authenticity. Models returned conflicting or border probabilities.'
              : isAi
              ? `This image is classified as AI-Generated with ${aiPct}% synthetic probability.`
              : `This image is verified as an Original Photograph with ${origPct}% authenticity probability.`}
          </p>
        </div>
      </div>

      {/* Prominent Image Authenticity Percentage Meters */}
      <div className="percentage-section">
        <h3 className="section-title">Authenticity Probability Breakdown</h3>
        
        <div className="prob-meter-grid">
          {/* Original Percentage Card */}
          <div className={`prob-box ${!isAi && !isUncertain ? 'prob-box-winner-orig' : ''}`}>
            <div className="prob-header-row">
              <span className="prob-title">Original Photograph</span>
              <span className="prob-number prob-orig-color">{origPct}%</span>
            </div>
            <div className="meter-track">
              <div
                className="meter-fill meter-fill-orig"
                style={{ width: `${Math.min(100, Math.max(0, pOrig * 100))}%` }}
              />
            </div>
            <span className="prob-hint">
              {!isAi && !isUncertain ? 'Dominant Classification (Authentic Camera Capture)' : 'Camera sensor probability'}
            </span>
          </div>

          {/* AI-Generated Percentage Card */}
          <div className={`prob-box ${isAi && !isUncertain ? 'prob-box-winner-ai' : ''}`}>
            <div className="prob-header-row">
              <span className="prob-title">AI-Generated</span>
              <span className="prob-number prob-ai-color">{aiPct}%</span>
            </div>
            <div className="meter-track">
              <div
                className="meter-fill meter-fill-ai"
                style={{ width: `${Math.min(100, Math.max(0, pAi * 100))}%` }}
              />
            </div>
            <span className="prob-hint">
              {isAi && !isUncertain ? 'Dominant Classification (Synthetic Generation Detected)' : 'Generative artifact probability'}
            </span>
          </div>
        </div>
      </div>

      {/* Decision Summary Grid */}
      <div className="decision-summary-section">
        <div className="decision-metrics-grid">
          <div className="decision-metric-box">
            <span className="dm-label">Final Verdict</span>
            <span className={`dm-verdict-badge ${isUncertain ? 'badge-warning' : isAi ? 'badge-error' : 'badge-success'}`}>
              {isUncertain ? 'Inconclusive' : isAi ? 'Not Original (AI)' : 'Original'}
            </span>
          </div>

          <div className="decision-metric-box">
            <span className="dm-label">Confidence Level</span>
            <span className="dm-value-text">{confidenceLabel}</span>
          </div>

          <div className="decision-metric-box">
            <span className="dm-label">Algorithm Consensus</span>
            <span className="dm-value-text">
              {totalVotes > 0
                ? isAi
                  ? `${aiVotes} of ${totalVotes} models identify AI (${aiPct}%)`
                  : `${originalVotes} of ${totalVotes} models verify Original (${origPct}%)`
                : 'Consensus calculated'}
            </span>
          </div>
        </div>
      </div>

      {/* Optional Preview Image Display */}
      {previewUrl && (
        <div className="preview-embed-section">
          <div className="preview-embed-header">
            <ImageIcon size={16} />
            <span>Analyzed Image Sample</span>
          </div>
          <div className="preview-embed-frame">
            <img src={previewUrl} alt="Analyzed specimen" className="preview-embed-img" />
          </div>
        </div>
      )}

      {/* Model-Wise Classification Table with Individual Percentages */}
      {mPredictions && mPredictions.length > 0 && (
        <div className="models-breakdown-section">
          <div className="breakdown-header">
            <Layers size={18} />
            <h3 className="section-title">Individual Algorithm Probability Scores ({mPredictions.length} Models)</h3>
          </div>
          <div className="table-responsive">
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Verdict</th>
                  <th>Original %</th>
                  <th>AI %</th>
                  <th>Confidence</th>
                  <th>Consensus</th>
                </tr>
              </thead>
              <tbody>
                {mPredictions.map((mp, index) => {
                  const mName = mp.modelName || mp.model_name || `Model ${index + 1}`;
                  const mClass = mp.prediction || mp.predicted_class || 'original';
                  const mConf = mp.confidence ?? 0;
                  const mOrigP = mp.originalProbability ?? mp.original_probability ?? (1 - mConf);
                  const mAiP = mp.aiGeneratedProbability ?? mp.ai_generated_probability ?? mConf;
                  const mUnc = mp.is_uncertain ?? false;

                  const mIsAi = mClass === 'ai_generated' || mClass === 'ai';
                  const agreesWithOverall = isAi === mIsAi;

                  return (
                    <tr key={mName + index}>
                      <td className="model-name-cell">{mName}</td>
                      <td>
                        <span className={`badge ${mIsAi ? 'badge-error' : 'badge-success'}`}>
                          {mIsAi ? 'Not Original (AI)' : 'Original'}
                        </span>
                      </td>
                      <td className="mono-cell orig-mono">{(mOrigP * 100).toFixed(1)}%</td>
                      <td className="mono-cell ai-mono">{(mAiP * 100).toFixed(1)}%</td>
                      <td className="mono-cell">{(mConf * 100).toFixed(1)}%</td>
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

      {/* Forensic Verification Notice */}
      <div className="advisory-box">
        Probabilities reflect algorithmic multi-model consensus across extracted frequency and texture signatures.
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
          padding: 28px 28px;
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
          padding-top: 4px;
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
        .percentage-section {
          padding: 24px 28px;
          border-bottom: 1px solid var(--color-border);
          background: #FAFAFA;
        }
        .section-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 16px;
        }
        .prob-meter-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .prob-box {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .prob-box-winner-orig {
          border-color: #86EFAC;
          background: #F0FDF4;
        }
        .prob-box-winner-ai {
          border-color: #FCA5A5;
          background: #FEF2F2;
        }
        .prob-header-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .prob-title {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-text-primary);
        }
        .prob-number {
          font-family: var(--font-mono);
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1;
        }
        .prob-orig-color {
          color: var(--color-success);
        }
        .prob-ai-color {
          color: var(--color-error);
        }
        .meter-track {
          height: 12px;
          background: #E5E7EB;
          border-radius: 9999px;
          overflow: hidden;
        }
        .meter-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.5s ease-out;
        }
        .meter-fill-orig {
          background: var(--color-success);
        }
        .meter-fill-ai {
          background: var(--color-error);
        }
        .prob-hint {
          font-size: 0.775rem;
          color: var(--color-text-muted);
        }
        .decision-summary-section {
          padding: 20px 28px;
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
          font-size: 0.775rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
          font-weight: 600;
        }
        .dm-verdict-badge {
          display: inline-block;
          font-size: 0.95rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: var(--radius-sm);
          width: fit-content;
        }
        .dm-value-text {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .preview-embed-section {
          padding: 20px 28px;
          border-bottom: 1px solid var(--color-border);
        }
        .preview-embed-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 12px;
        }
        .preview-embed-frame {
          max-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0F172A;
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .preview-embed-img {
          max-height: 280px;
          object-fit: contain;
          width: auto;
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
          padding: 24px 28px;
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
        .mono-cell {
          font-family: var(--font-mono);
          font-size: 0.85rem;
        }
        .orig-mono {
          color: var(--color-success);
          font-weight: 600;
        }
        .ai-mono {
          color: var(--color-error);
          font-weight: 600;
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
          .prob-meter-grid,
          .decision-metrics-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .percentage-section,
          .decision-summary-section,
          .preview-embed-section,
          .advisory-box,
          .models-breakdown-section,
          .card-meta-footer {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      `}</style>
    </div>
  );
}
