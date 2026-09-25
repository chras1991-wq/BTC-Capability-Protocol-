"use client";

export function HeroVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 72% 48%, rgba(184,106,50,0.3), transparent 58%), radial-gradient(ellipse 45% 35% at 25% 78%, rgba(63,107,88,0.2), transparent 55%), linear-gradient(155deg, #1a1f27 0%, #0f1217 50%, #1c1712 100%)",
          animation: "drift 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 48%, black 100%)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 960 720"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="branch" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4844a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e8ecef" stopOpacity="0.35" />
          </linearGradient>
          <clipPath id="below-nav">
            <rect x="0" y="90" width="960" height="630" />
          </clipPath>
        </defs>
        <g clipPath="url(#below-nav)">
          <path
            className="capability-path"
            pathLength={1}
            d="M560 180 V360"
            stroke="url(#branch)"
            strokeWidth="3"
            fill="none"
          />
          <path
            className="capability-path"
            pathLength={1}
            d="M560 360 C490 410, 360 455, 260 540"
            stroke="url(#branch)"
            strokeWidth="2.2"
            fill="none"
            style={{ animationDelay: "0.5s" }}
          />
          <path
            className="capability-path"
            pathLength={1}
            d="M560 360 C630 410, 740 455, 820 540"
            stroke="url(#branch)"
            strokeWidth="2.2"
            fill="none"
            style={{ animationDelay: "0.65s" }}
          />
          <path
            className="capability-path"
            pathLength={1}
            d="M560 360 C555 450, 530 550, 500 650"
            stroke="url(#branch)"
            strokeWidth="2"
            fill="none"
            style={{ animationDelay: "0.8s" }}
          />
          <circle cx="560" cy="180" r="10" fill="#d4844a" />
          <circle cx="560" cy="360" r="7" fill="#e8ecef" />
          <circle cx="260" cy="540" r="5.5" fill="#d4844a" />
          <circle cx="820" cy="540" r="5.5" fill="#d4844a" />
          <circle cx="500" cy="650" r="5" fill="#9bb4a6" />
          <circle
            cx="560"
            cy="360"
            r="42"
            fill="none"
            stroke="#e8ecef"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
          <circle
            cx="560"
            cy="360"
            r="78"
            fill="none"
            stroke="#e8ecef"
            strokeOpacity="0.06"
            strokeWidth="1"
          />
          <text
            x="578"
            y="350"
            fill="#e8ecef"
            fillOpacity="0.38"
            fontSize="9"
            fontFamily="monospace"
            letterSpacing="1.4"
          >
            STRATUM ROUTER
          </text>
          <text
            x="578"
            y="365"
            fill="#e8ecef"
            fillOpacity="0.23"
            fontSize="8"
            fontFamily="monospace"
          >
            SUPPLY PROOF / 01
          </text>
        </g>
      </svg>
    </div>
  );
}
