import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, badge, trend }) {
  return (
    <div className="card metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className="metric-icon-wrap">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="metric-body">
        <span className="metric-value">{value}</span>
        {badge && <span className={`badge ${badge.className}`}>{badge.text}</span>}
      </div>
      {subtitle && <p className="metric-subtitle">{subtitle}</p>}

      <style>{`
        .metric-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .metric-title {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .metric-icon-wrap {
          color: var(--color-text-muted);
        }
        .metric-body {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .metric-value {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1.1;
          font-family: var(--font-mono);
        }
        .metric-subtitle {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: -4px;
        }
      `}</style>
    </div>
  );
}
