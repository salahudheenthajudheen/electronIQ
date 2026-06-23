export function SVGFallback() {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-space flex items-center justify-center p-8">
      <svg viewBox="0 0 600 300" className="w-full h-full max-w-2xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ccff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="300" cy="150" rx="270" ry="65" fill="none" stroke="#88ccff" strokeWidth="2" opacity="0.3" />
        <rect x="30" y="85" width="540" height="130" rx="65" fill="none" stroke="#88ccff" strokeWidth="2" opacity="0.4" />

        <text x="25" y="30" fill="#F1F5F9" fontSize="16" fontWeight="bold">Cathode Ray Tube</text>

        <text x="25" y="48" fill="#94A3B8" fontSize="11">WebGL is not available in your browser</text>
        <text x="25" y="64" fill="#94A3B8" fontSize="11">Showing 2D diagram instead</text>

        <rect x="50" y="135" width="18" height="30" rx="2" fill="#888" />
        <text x="42" y="120" fill="#94A3B8" fontSize="11">Cathode (-)</text>

        <line x1="68" y1="150" x2="530" y2="150" stroke="url(#beam)" strokeWidth="3" strokeDasharray="6,4" filter="url(#glow)" />
        <text x="270" y="140" fill="#00ccff" fontSize="12" fontWeight="bold">Electron Beam e⁻</text>

        <circle cx="540" cy="150" r="22" fill="none" stroke="#888" strokeWidth="2" />
        <text x="528" y="118" fill="#94A3B8" fontSize="11">Anode (+)</text>

        <rect x="545" y="105" width="25" height="90" rx="3" fill="#00ff88" opacity="0.25" />
        <rect x="545" y="105" width="25" height="90" rx="3" fill="none" stroke="#00ff88" strokeWidth="1.5" />
        <text x="545" y="95" fill="#00ff88" fontSize="11">Screen</text>

        <rect x="240" y="68" width="120" height="10" rx="3" fill="#4488ff" opacity="0.4" />
        <rect x="240" y="222" width="120" height="10" rx="3" fill="#4488ff" opacity="0.4" />
        <text x="225" y="62" fill="#4488ff" fontSize="11">Magnetic Field</text>

        <rect x="180" y="78" width="12" height="45" rx="2" fill="#ff8844" opacity="0.4" />
        <rect x="180" y="177" width="12" height="45" rx="2" fill="#ff8844" opacity="0.4" />
        <text x="155" y="160" fill="#ff8844" fontSize="11">Electric Field</text>
      </svg>
    </div>
  )
}
