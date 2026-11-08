import React from 'react';

/**
 * TrueLens Professional Optical Aperture Logo
 * Custom geometric SVG combining an optical lens aperture, focal ring, and crosshair reticle.
 */
export default function Logo({ size = 'md', showText = true, className = '' }) {
  // Dimensions
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 44 : 32;
  const fontSize = size === 'sm' ? '1.05rem' : size === 'lg' ? '1.65rem' : '1.25rem';

  return (
    <div
      className={`truelens-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '8px' : '10px',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
        aria-label="TrueLens Aperture Emblem"
      >
        <defs>
          <linearGradient id="tlGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="tlRing" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* Outer chassis ring */}
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="url(#tlGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Outer ticks (precision camera markings) */}
        <line x1="32" y1="4" x2="32" y2="9" stroke="url(#tlGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="55" x2="32" y2="60" stroke="url(#tlGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="4" y1="32" x2="9" y2="32" stroke="url(#tlGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="55" y1="32" x2="60" y2="32" stroke="url(#tlGrad)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Optical Aperture Blades (6 geometric precision blades) */}
        <path
          d="M32 16 L44 26 L36 34 Z"
          fill="url(#tlRing)"
          opacity="0.9"
        />
        <path
          d="M48 28 L48 44 L38 38 Z"
          fill="url(#tlRing)"
          opacity="0.95"
        />
        <path
          d="M44 46 L28 50 L32 38 Z"
          fill="url(#tlRing)"
          opacity="0.9"
        />
        <path
          d="M26 48 L16 36 L26 32 Z"
          fill="url(#tlRing)"
          opacity="0.85"
        />
        <path
          d="M16 32 L20 18 L28 26 Z"
          fill="url(#tlRing)"
          opacity="0.9"
        />
        <path
          d="M24 16 L40 16 L32 26 Z"
          fill="url(#tlRing)"
          opacity="0.85"
        />

        {/* Center Focal Aperture Eye */}
        <circle
          cx="32"
          cy="32"
          r="7"
          fill="#0F172A"
          stroke="#60A5FA"
          strokeWidth="2"
        />
        <circle
          cx="32"
          cy="32"
          r="2.5"
          fill="#93C5FD"
        />
      </svg>

      {showText && (
        <span
          style={{
            fontSize,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--color-text-primary, #0f172a)',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'baseline',
          }}
        >
          <span>True</span>
          <span style={{ color: '#2563EB', fontWeight: 800 }}>Lens</span>
        </span>
      )}
    </div>
  );
}
