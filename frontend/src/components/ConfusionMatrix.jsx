import React from 'react';

export default function ConfusionMatrix({ matrix, modelName }) {
  if (!matrix || matrix.length !== 2 || matrix[0].length !== 2) {
    return (
      <div className="card cm-empty">
        <p>Confusion matrix data unavailable for {modelName || 'this model'}.</p>
      </div>
    );
  }

  const [tn, fp] = matrix[0];
  const [fn, tp] = matrix[1];
  const total = tn + fp + fn + tp;

  const pct = (val) => (total > 0 ? `${((val / total) * 100).toFixed(1)}%` : '0%');

  return (
    <div className="card cm-card">
      <div className="cm-header">
        <h4 className="cm-title">{modelName ? `${modelName} - Confusion Matrix` : 'Confusion Matrix'}</h4>
        <span className="cm-sample-total">Test Samples: {total}</span>
      </div>

      <div className="cm-grid-wrapper">
        <div className="cm-axis-y">
          <span className="axis-label-vertical">Actual Ground Truth</span>
        </div>

        <div className="cm-content">
          <div className="cm-axis-x">
            <span className="axis-label-horizontal">Predicted Class</span>
          </div>

          <div className="cm-table-structure">
            <div className="cm-col-headers">
              <span className="col-header">Predicted Real</span>
              <span className="col-header">Predicted AI</span>
            </div>

            <div className="cm-row">
              <span className="row-header">Actual Real</span>
              <div className="cm-cells">
                <div className="cm-cell cell-correct" title="True Negative: Real correctly classified as Real">
                  <span className="cell-type">True Negative (TN)</span>
                  <span className="cell-count">{tn}</span>
                  <span className="cell-pct">{pct(tn)}</span>
                </div>
                <div className="cm-cell cell-error" title="False Positive: Real incorrectly classified as AI">
                  <span className="cell-type">False Positive (FP)</span>
                  <span className="cell-count">{fp}</span>
                  <span className="cell-pct">{pct(fp)}</span>
                </div>
              </div>
            </div>

            <div className="cm-row">
              <span className="row-header">Actual AI</span>
              <div className="cm-cells">
                <div className="cm-cell cell-error" title="False Negative: AI incorrectly classified as Real">
                  <span className="cell-type">False Negative (FN)</span>
                  <span className="cell-count">{fn}</span>
                  <span className="cell-pct">{pct(fn)}</span>
                </div>
                <div className="cm-cell cell-correct" title="True Positive: AI correctly classified as AI">
                  <span className="cell-type">True Positive (TP)</span>
                  <span className="cell-count">{tp}</span>
                  <span className="cell-pct">{pct(tp)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cm-card {
          padding: 20px;
        }
        .cm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 12px;
        }
        .cm-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .cm-sample-total {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
        }
        .cm-grid-wrapper {
          display: flex;
          gap: 12px;
        }
        .cm-axis-y {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
        }
        .axis-label-vertical {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cm-content {
          flex: 1;
        }
        .cm-axis-x {
          text-align: center;
          margin-bottom: 8px;
        }
        .axis-label-horizontal {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cm-table-structure {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cm-col-headers {
          display: grid;
          grid-template-columns: 140px 1fr 1fr;
          gap: 8px;
          text-align: center;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          padding-left: 148px;
        }
        .col-header {
          padding: 4px;
        }
        .cm-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 8px;
          align-items: center;
        }
        .row-header {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-align: right;
          padding-right: 8px;
        }
        .cm-cells {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .cm-cell {
          padding: 16px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 4px;
          border: 1px solid transparent;
        }
        .cell-correct {
          background: #F0FDF4;
          border-color: #BBF7D0;
        }
        .cell-error {
          background: #FEF2F2;
          border-color: #FECACA;
        }
        .cell-type {
          font-size: 0.725rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }
        .cell-count {
          font-size: 1.5rem;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--color-text-primary);
        }
        .cell-pct {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          font-family: var(--font-mono);
        }
        .cm-empty {
          padding: 24px;
          text-align: center;
          color: var(--color-text-muted);
        }
        @media (max-width: 640px) {
          .cm-col-headers {
            padding-left: 90px;
          }
          .cm-row {
            grid-template-columns: 80px 1fr;
          }
          .cm-cell {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}
