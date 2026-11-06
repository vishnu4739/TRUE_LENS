import React from 'react';

export default function ModelComparisonTable({ models, highlightBest = true }) {
  if (!models || models.length === 0) {
    return (
      <div className="card empty-table">
        <p>No model comparison data available.</p>
      </div>
    );
  }

  const formatScore = (val) => {
    if (val === null || val === undefined) return <span className="text-muted">Not trained</span>;
    return `${(val * 100).toFixed(1)}%`;
  };

  // Find best accuracy among trained
  const bestAcc = highlightBest
    ? Math.max(...models.map((m) => (m.status === 'trained' && m.accuracy != null ? m.accuracy : -1)))
    : -1;

  return (
    <div className="card model-table-card">
      <div className="table-responsive">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Algorithm</th>
              <th>Architecture</th>
              <th>Accuracy</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1-Score</th>
              <th>ROC-AUC</th>
              <th>Evaluation Status</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m, idx) => {
              const isTrained = m.status === 'trained' && m.accuracy != null;
              const isBest = isTrained && bestAcc > 0 && m.accuracy === bestAcc;

              return (
                <tr key={m.model_key || idx} className={isBest ? 'best-row' : ''}>
                  <td className="rank-cell">
                    <span className="rank-badge">#{m.rank || idx + 1}</span>
                  </td>
                  <td className="model-name">
                    <strong>{m.model_name || m.model}</strong>
                    {isBest && <span className="best-tag">Top Performer</span>}
                  </td>
                  <td>
                    <span className="type-tag">
                      {m.model_type === 'deep' ? 'Deep Learning' : 'Traditional ML'}
                    </span>
                  </td>
                  <td className="score-cell">{formatScore(m.accuracy)}</td>
                  <td className="score-cell">{formatScore(m.precision)}</td>
                  <td className="score-cell">{formatScore(m.recall)}</td>
                  <td className="score-cell">{formatScore(m.f1_score)}</td>
                  <td className="score-cell">{formatScore(m.roc_auc)}</td>
                  <td>
                    {isTrained ? (
                      <span className="badge badge-success">Evaluated</span>
                    ) : (
                      <span className="badge badge-warning">Not trained</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        .model-table-card {
          padding: 0;
          overflow: hidden;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .comparison-table th {
          text-align: left;
          padding: 12px 16px;
          background: var(--color-background);
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: 0.775rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--color-border);
        }
        .comparison-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-primary);
        }
        .comparison-table tbody tr:last-child td {
          border-bottom: none;
        }
        .comparison-table tbody tr:hover {
          background: #F8FAFC;
        }
        .best-row {
          background: #F0FDF4 !important;
        }
        .rank-cell {
          width: 60px;
        }
        .rank-badge {
          font-family: var(--font-mono);
          font-weight: 600;
          font-size: 0.8rem;
          color: var(--color-text-secondary);
        }
        .model-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .best-tag {
          font-size: 0.7rem;
          background: #DCFCE7;
          color: #15803D;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        .type-tag {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
        }
        .score-cell {
          font-family: var(--font-mono);
          font-size: 0.85rem;
        }
        .text-muted {
          color: var(--color-text-muted);
          font-style: italic;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}
