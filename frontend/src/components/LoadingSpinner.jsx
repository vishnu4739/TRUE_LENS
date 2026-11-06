import React from 'react';

export default function LoadingSpinner({ message = 'Analyzing image patterns...' }) {
  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
      <p className="spinner-message">{message}</p>

      <style>{`
        .spinner-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          gap: 16px;
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .spinner-message {
          font-size: 0.925rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
