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
        </g>
      </svg>
    </div>
  );
}
