import React from 'react';

export default function LogoLady({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hairGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a18cd1" />
          <stop offset="1" stopColor="#fbc2eb" />
        </linearGradient>
        <linearGradient id="skinGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe0c3" />
          <stop offset="1" stopColor="#fcb69f" />
        </linearGradient>
      </defs>
      {/* 头发 */}
      <path d="M16 24 Q8 44 32 60 Q56 44 48 24 Q40 8 24 16 Q20 18 16 24 Z" fill="url(#hairGradient)" />
      {/* 脸部 */}
      <ellipse cx="32" cy="28" rx="10" ry="13" fill="url(#skinGradient)" />
      {/* 下巴阴影 */}
      <ellipse cx="32" cy="38" rx="6" ry="3" fill="#eab7a1" fillOpacity="0.3" />
      {/* 头发前额弧线 */}
      <path d="M22 22 Q32 10 42 22" stroke="#a18cd1" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* 轮廓线 */}
      <path d="M16 24 Q8 44 32 60 Q56 44 48 24 Q40 8 24 16 Q20 18 16 24 Z" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.7" />
      {/* 眼睛 */}
      <ellipse cx="28" cy="30" rx="1.2" ry="2" fill="#333" />
      <ellipse cx="36" cy="30" rx="1.2" ry="2" fill="#333" />
      {/* 嘴唇 */}
      <path d="M29 36 Q32 38 35 36" stroke="#e57373" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
} 