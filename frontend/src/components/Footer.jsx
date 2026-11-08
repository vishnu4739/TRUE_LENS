import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="container footer-inner">
        <div className="footer-main">
          <div className="footer-brand">
            <Logo size="sm" />
            <p className="footer-desc">
              Multi-model forensic verification platform distinguishing authentic photographs from synthetic AI media.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <span className="col-title">Platform</span>
              <Link to="/">Home</Link>
              <Link to="/analyze">Analyze Image</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/models">Models</Link>
            </div>
            <div className="footer-col">
              <span className="col-title">Information</span>
              <Link to="/about">System Purpose</Link>
              <Link to="/history">Inspection History</Link>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} TrueLens. All rights reserved.</span>
          <span className="footer-status-pill">
            <span className="status-dot"></span>
            Operational
          </span>
        </div>
      </div>

      <style>{`
        .footer-root {
          background: #ffffff;
          border-top: 1px solid var(--color-border);
          padding: 40px 0 24px;
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
          gap: 36px;
          flex-wrap: wrap;
        }
        .footer-brand {
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-desc {
          color: var(--color-text-secondary);
          line-height: 1.5;
          font-size: 0.9rem;
          margin: 0;
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
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .footer-col a {
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .footer-col a:hover {
          color: var(--color-primary);
        }
        .footer-bottom {
          padding-top: 20px;
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--color-text-muted);
          font-size: 0.825rem;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
          color: var(--color-success);
        }
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-success);
          display: inline-block;
        }
      `}</style>
    </footer>
  );
}
