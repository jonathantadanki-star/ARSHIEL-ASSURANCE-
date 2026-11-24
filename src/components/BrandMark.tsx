import React, { useState } from 'react';

export const ARSHIEL_LOGO_SRC =
  '/assets/aistudio/e7cecac8-304b-46b6-8c7b-edbf70228dd3_23beb2d4.png';

export const BRAND_HERO_ARTWORK_URL = ARSHIEL_LOGO_SRC;

export function BrandMark({
  size = 36,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center rounded-lg overflow-hidden border border-amber-400/45 bg-[#040D21] shadow-sm shadow-blue-950/60 shrink-0 ${className}`}
      >
        <img
          src={ARSHIEL_LOGO_SRC}
          alt="ARSHIEL ASSURANCE Official Emblem"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover block"
        />
      </span>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="arshielShieldBg" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F2957" />
          <stop offset="100%" stopColor="#050D1E" />
        </linearGradient>
        <linearGradient id="arshielGold" x1="10" y1="8" x2="28" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="arshielElectric" x1="20" y1="10" x2="33" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <path
        d="M20 2.5L35 8.2V19.6C35 28.4 28.6 34.7 20 37.5C11.4 34.7 5 28.4 5 19.6V8.2L20 2.5Z"
        fill="url(#arshielShieldBg)"
        stroke="#2563EB"
        strokeWidth="1.5"
      />
      <path
        d="M11.5 27.5L18.4 11.2H21.2L23.5 16.8L20.4 19.3L19.6 16.5L15.6 27.5H11.5Z"
        fill="url(#arshielGold)"
      />
      <path
        d="M16.5 23.2H23.2L24.8 27.5H28.8L22.5 12.2H20.8L25.4 22.8"
        stroke="url(#arshielElectric)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
