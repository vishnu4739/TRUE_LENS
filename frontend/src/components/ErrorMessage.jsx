import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="card error-card">
      <div className="error-icon-box">
        <AlertCircle size={24} />
      </div>
      <div className="error-content">
        <h3 className="error-title">An Error Occurred</h3>
        <p className="error-text">{message || 'Unable to complete the requested operation.'}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-secondary btn-sm retry-btn">
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        )}
      </div>

      <style>{`
        .error-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          border-left: 4px solid var(--color-error);
          background: #FEF2F2;
          border-color: #FECACA;
        }
        .error-icon-box {
          color: var(--color-error);
          flex-shrink: 0;
          padding-top: 2px;
        }
        .error-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-error);
          margin-bottom: 4px;
        }
        .error-text {
          font-size: 0.9rem;
          color: #7F1D1D;
          margin-bottom: 12px;
        }
        .retry-btn {
          background: white;
          border-color: #FECACA;
          color: var(--color-error);
        }
        .retry-btn:hover {
          background: #FEE2E2;
        }
      `}</style>
    </div>
  );
}
