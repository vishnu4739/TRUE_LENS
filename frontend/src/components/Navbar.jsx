import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Menu, X, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/analyze', label: 'Analyze' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/models', label: 'Models' },
    { to: '/history', label: 'History' },
    { to: '/about', label: 'About' },
  ];

  return (
    <header className="navbar-root">
      <div className="container navbar-inner">
        {/* Brand Wordmark */}
        <Link to="/" className="brand-wordmark">
          <Shield className="brand-icon" size={20} strokeWidth={2.2} />
          <span className="brand-text">TrueLens</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'nav-item nav-item-active' : 'nav-item'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="auth-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-email" title={user?.email}>
                <User size={15} />
                {user?.name || user?.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                title="Sign out"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-list">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? 'mobile-nav-item active' : 'mobile-nav-item'
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mobile-auth-divider">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm full-width"
                >
                  <LogOut size={15} />
                  <span>Sign Out ({user?.name || user?.email})</span>
                </button>
              ) : (
                <div className="mobile-auth-btns">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary btn-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      <style>{`
        .navbar-root {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--navbar-height);
        }
        .brand-wordmark {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-text-primary);
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
        }
        .brand-icon {
          color: var(--color-primary);
        }
        .brand-text {
          color: var(--color-primary);
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-item {
          padding: 8px 14px;
          border-radius: var(--radius-md);
          font-size: 0.925rem;
          color: var(--color-text-secondary);
          font-weight: 500;
          transition: all var(--transition-fast);
        }
        .nav-item:hover {
          color: var(--color-text-primary);
          background: var(--color-background);
        }
        .nav-item-active {
          color: var(--color-text-primary);
          background: var(--color-background);
          font-weight: 600;
        }
        .auth-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .user-menu {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-email {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .mobile-toggle {
          display: none;
          color: var(--color-text-primary);
          padding: 6px;
        }
        .mobile-drawer {
          display: none;
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
          padding: 16px 24px;
        }
        .mobile-nav-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mobile-nav-item {
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          color: var(--color-text-secondary);
        }
        .mobile-nav-item.active {
          background: var(--color-background);
          color: var(--color-text-primary);
          font-weight: 600;
        }
        .mobile-auth-divider {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--color-border);
        }
        .mobile-auth-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .full-width {
          width: 100%;
        }
        @media (max-width: 768px) {
          .desktop-nav,
          .auth-buttons,
          .user-menu {
            display: none;
          }
          .mobile-toggle {
            display: inline-flex;
          }
          .mobile-drawer {
            display: block;
          }
        }
      `}</style>
    </header>
  );
}
