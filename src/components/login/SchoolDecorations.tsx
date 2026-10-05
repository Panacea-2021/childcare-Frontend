function Cloud({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" fill="none" aria-hidden>
      <ellipse cx="40" cy="36" rx="28" ry="18" fill="rgba(255,255,255,0.85)" />
      <ellipse cx="68" cy="32" rx="34" ry="22" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="92" cy="38" rx="22" ry="14" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}

function Star({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.5l2.4 6.2 6.6.4-5.1 4.2 1.7 6.4L12 16.2 6.4 19.7l1.7-6.4L3 9.1l6.6-.4L12 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function SchoolBuilding({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 96 88" fill="none" aria-hidden>
      <rect x="18" y="34" width="60" height="46" rx="6" fill="#F8E8D0" />
      <path d="M12 38 L48 12 L84 38 Z" fill="#F0C9A8" />
      <rect x="40" y="52" width="16" height="28" rx="3" fill="#5D5FEF" />
      <rect x="26" y="44" width="12" height="12" rx="2" fill="#A8D4F0" />
      <rect x="58" y="44" width="12" height="12" rx="2" fill="#A8D4F0" />
      <rect x="42" y="18" width="12" height="14" rx="2" fill="#E8A0B8" />
      <circle cx="48" cy="16" r="4" fill="#F5D76E" />
    </svg>
  );
}

function Rocket({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 64 96" fill="none" aria-hidden>
      <path d="M32 8c10 14 14 30 14 46 0 8-6 14-14 14s-14-6-14-14c0-16 4-32 14-46z" fill="#F28B82" />
      <circle cx="32" cy="42" r="7" fill="#E8F2FF" stroke="#5D5FEF" strokeWidth="2" />
      <path d="M18 58 L10 74 L22 66 Z" fill="#F5D76E" />
      <path d="M46 58 L54 74 L42 66 Z" fill="#F5D76E" />
      <path d="M26 72 L32 88 L38 72" fill="#FFB347" opacity="0.85" />
    </svg>
  );
}

function Books({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 72 56" fill="none" aria-hidden>
      <rect x="8" y="14" width="14" height="34" rx="2" fill="#5D5FEF" transform="rotate(-8 15 31)" />
      <rect x="26" y="10" width="14" height="38" rx="2" fill="#7BC67E" />
      <rect x="44" y="16" width="14" height="32" rx="2" fill="#F5A623" transform="rotate(6 51 32)" />
    </svg>
  );
}

function Pencil({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 80" fill="none" aria-hidden>
      <rect x="7" y="8" width="10" height="52" rx="2" fill="#F5D76E" />
      <rect x="7" y="8" width="10" height="10" rx="2" fill="#E8A0B8" />
      <path d="M7 60 L12 76 L17 60 Z" fill="#F0C9A8" />
      <path d="M10 70 L12 76 L14 70 Z" fill="#334155" />
    </svg>
  );
}

function Balloon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 40 72" fill="none" aria-hidden>
      <ellipse cx="20" cy="22" rx="16" ry="20" fill="#A8C5F0" />
      <ellipse cx="14" cy="16" rx="4" ry="6" fill="rgba(255,255,255,0.45)" />
      <path d="M20 42 C20 48 16 52 20 58 C24 52 20 48 20 42 Z" fill="#8BA8D9" />
      <path d="M20 58 Q18 66 22 72" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function PaperPlane({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 64 48" fill="none" aria-hidden>
      <path d="M4 24 L60 4 L28 28 L24 44 L20 28 Z" fill="#E8F2FF" stroke="#5D5FEF" strokeWidth="1.5" />
      <path d="M60 4 L28 28 L44 22 Z" fill="#C7D7FF" />
    </svg>
  );
}

function AbcBlock({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="4" y="4" width="40" height="40" rx="8" fill="#FFE8A3" stroke="#E8C96A" strokeWidth="2" />
      <text x="24" y="32" textAnchor="middle" fontSize="20" fontWeight="700" fill="#B8860B" fontFamily="var(--font-body), sans-serif">
        A
      </text>
    </svg>
  );
}

export function SchoolDecorations() {
  return (
    <div className="login-decor" aria-hidden>
      <Cloud className="login-float login-cloud login-cloud-1" />
      <Cloud className="login-float login-cloud login-cloud-2" />
      <Cloud className="login-float login-cloud login-cloud-3" />

      <Star className="login-twinkle login-star login-star-1" />
      <Star className="login-twinkle login-star login-star-2" />
      <Star className="login-twinkle login-star login-star-3" />
      <Star className="login-twinkle login-star login-star-4" />

      <SchoolBuilding className="login-float login-school-illu" />
      <Books className="login-float login-books" />
      <Pencil className="login-float login-pencil" />

      <Rocket className="login-float-rocket login-rocket-illu" />
      <Balloon className="login-float login-balloon" />
      <PaperPlane className="login-drift login-plane" />
      <AbcBlock className="login-float login-block" />

      <span className="login-sparkle login-sparkle-1" />
      <span className="login-sparkle login-sparkle-2" />
      <span className="login-sparkle login-sparkle-3" />
    </div>
  );
}
