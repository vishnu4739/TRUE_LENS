import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="container footer-inner">
        <div className="footer-main">
          <div className="footer-brand">
            <span className="footer-title">TrueLens</span>
            <p className="footer-desc">
              AI-Powered Image Authenticity Detection System. Research-driven classification 
              evaluating statistical patterns between camera captures and synthetic images.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <span className="col-title">Navigation</span>
              <Link to="/">Home</Link>
              <Link to="/analyze">Analyze Image</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/models">Model Comparison</Link>
            </div>
            <div className="footer-col">
              <span className="col-title">Documentation</span>
              <Link to="/about">Methodology</Link>
              <Link to="/about#algorithms">Algorithms</Link>
              <Link to="/about#metrics">Evaluation Metrics</Link>
              <Link to="/about#limitations">System Limitations</Link>
            </div>
          </div>
        </div>

        <div className="footer-notice">
          <strong>Academic Disclaimer:</strong> TrueLens predictions are machine learning 
          probability estimates, not definitive proof of image authenticity or provenance. 
          Detection models are subject to false positives and domain transfer limits.
        </div>

        <div className="footer-bottom">
          <span>Final Year Computer Science Project</span>
          <span>TrueLens &bull; Academic Research Prototype</span>
        </div>
      </div>

      <style>{`
        .footer-root {
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          padding: 48px 0 24px;
          margin-top: auto;
          font-size: 0.875rem;
        }
        .footer-inner {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .footer-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 48px;
          flex-wrap: wrap;
        }
        .footer-brand {
          max-width: 440px;
        }
        .footer-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-text-primary);
          display: block;
          margin-bottom: 8px;
        }
        .footer-desc {
          color: var(--color-text-secondary);
          line-height: 1.5;
        }
        .footer-links {
          display: flex;
          gap: 48px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .col-title {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 4px;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .footer-col a {
          color: var(--color-text-secondary);
        }
        .footer-col a:hover {
          color: var(--color-text-primary);
        }
        .footer-notice {
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          font-size: 0.825rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }
        .footer-notice strong {
          color: var(--color-text-primary);
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--color-text-muted);
          font-size: 0.8rem;
          border-top: 1px solid var(--color-border);
          padding-top: 16px;
        }
        @media (max-width: 640px) {
          .footer-main {
            flex-direction: column;
            gap: 24px;
          }
          .footer-links {
            gap: 32px;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
