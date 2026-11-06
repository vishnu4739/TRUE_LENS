import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return (
    <div className="card empty-card">
      <div className="empty-icon-wrap">
        <FolderOpen size={36} strokeWidth={1.5} />
      </div>
      <h3 className="empty-title">{title || 'No Records Found'}</h3>
      <p className="empty-desc">{description || 'There is no data available to display at this time.'}</p>
      {action && <div className="empty-action">{action}</div>}

      <style>{`
        .empty-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 24px;
          gap: 12px;
        }
        .empty-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--color-background);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
          margin-bottom: 4px;
        }
        .empty-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .empty-desc {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          max-width: 420px;
        }
        .empty-action {
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
