"use client";

export function HeroVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 70% 40%, rgba(184,106,50,0.3), transparent 58%), radial-gradient(ellipse 45% 35% at 25% 75%, rgba(63,107,88,0.2), transparent 55%), linear-gradient(155deg, #1a1f27 0%, #0f1217 50%, #1c1712 100%)",
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
        </defs>
        <path
          className="capability-path"
          pathLength={1}
          d="M480 160 V340"
          stroke="url(#branch)"
          strokeWidth="3"
          fill="none"
        />
        <path
          className="capability-path"
          pathLength={1}
          d="M480 340 C410 390, 300 430, 220 510"
          stroke="url(#branch)"
          strokeWidth="2.2"
          fill="none"
          style={{ animationDelay: "0.5s" }}
        />
        <path
          className="capability-path"
          pathLength={1}
          d="M480 340 C550 390, 660 430, 740 510"
          stroke="url(#branch)"
          strokeWidth="2.2"
          fill="none"
          style={{ animationDelay: "0.65s" }}
        />
        <path
          className="capability-path"
          pathLength={1}
          d="M480 340 C475 430, 450 530, 420 630"
          stroke="url(#branch)"
          strokeWidth="2"
          fill="none"
          style={{ animationDelay: "0.8s" }}
        />
        <circle cx="480" cy="160" r="10" fill="#d4844a" />
        <circle cx="480" cy="340" r="7" fill="#e8ecef" />
        <circle cx="220" cy="510" r="5.5" fill="#d4844a" />
        <circle cx="740" cy="510" r="5.5" fill="#d4844a" />
        <circle cx="420" cy="630" r="5" fill="#9bb4a6" />
      </svg>
    </div>
  );
}
