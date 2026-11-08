import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { Menu, X, User, LogOut } from 'lucide-react';

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
        {/* Brand Logo & Wordmark */}
        <Link to="/" className="brand-wordmark" aria-label="TrueLens Home">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
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
                  className="btn btn-secondary btn-block"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="mobile-auth-grid">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary btn-block"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary btn-block"
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
          position: sticky;
          top: 0;
          z-index: 50;
          background: #ffffff;
          border-bottom: 1px solid var(--color-border);
          backdrop-filter: blur(8px);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          gap: 24px;
        }
        .brand-wordmark {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-item {
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.925rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: all 0.15s ease;
          text-decoration: none;
        }
        .nav-item:hover {
          color: var(--color-primary);
          background-color: var(--color-surface-hover);
        }
        .nav-item-active {
          color: var(--color-primary);
          background-color: var(--color-surface-hover);
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
          gap: 12px;
        }
        .user-email {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--color-text-primary);
          padding: 6px;
          cursor: pointer;
        }
        .mobile-drawer {
          display: none;
        }
        @media (max-width: 820px) {
          .desktop-nav {
            display: none;
          }
          .auth-buttons {
            display: none;
          }
          .mobile-toggle {
            display: block;
          }
          .mobile-drawer {
            display: block;
            border-top: 1px solid var(--color-border);
            background: #ffffff;
            padding: 16px 20px 24px;
          }
          .mobile-nav-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .mobile-nav-item {
            padding: 10px 14px;
            font-size: 0.95rem;
            color: var(--color-text-primary);
            border-radius: var(--radius-sm);
            text-decoration: none;
          }
          .mobile-nav-item.active {
            background-color: var(--color-surface-hover);
            color: var(--color-primary);
            font-weight: 600;
          }
          .mobile-auth-divider {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--color-border);
          }
          .mobile-auth-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </header>
  );
}
