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
          d="M480 90 V310"
          stroke="url(#branch)"
          strokeWidth="3"
          fill="none"
        />
        <path
          className="capability-path"
          pathLength={1}
          d="M480 310 C410 360, 300 400, 220 480"
          stroke="url(#branch)"
          strokeWidth="2.2"
          fill="none"
          style={{ animationDelay: "0.5s" }}
        />
        <path
          className="capability-path"
          pathLength={1}
          d="M480 310 C550 360, 660 400, 740 480"
          stroke="url(#branch)"
          strokeWidth="2.2"
          fill="none"
          style={{ animationDelay: "0.65s" }}
        />
        <path
          className="capability-path"
          pathLength={1}
          d="M480 310 C475 400, 450 500, 420 600"
          stroke="url(#branch)"
          strokeWidth="2"
          fill="none"
          style={{ animationDelay: "0.8s" }}
        />
        <circle cx="480" cy="90" r="10" fill="#d4844a" />
        <circle cx="480" cy="310" r="7" fill="#e8ecef" />
        <circle cx="220" cy="480" r="5.5" fill="#d4844a" />
        <circle cx="740" cy="480" r="5.5" fill="#d4844a" />
        <circle cx="420" cy="600" r="5" fill="#9bb4a6" />
      </svg>
    </div>
  );
}
