"use client";

export function CapabilityTree() {
  return (
    <div className="relative h-full w-full overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 62% 42%, rgba(184,106,50,0.28), transparent 60%), radial-gradient(ellipse 50% 40% at 30% 70%, rgba(74,107,92,0.18), transparent 55%), linear-gradient(160deg, #1a1f27 0%, #0f1217 48%, #1c1712 100%)",
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
          <filter id="soft">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        {/* Trunk: ownership */}
        <path
          className="capability-path"
          pathLength={1}
          d="M480 80 V300"
          stroke="url(#branch)"
          strokeWidth="3"
          fill="none"
        />

        {/* Capability branches */}
        <path
          className="capability-path"
          pathLength={1}
          d="M480 300 C420 340, 320 380, 240 460"
          stroke="url(#branch)"
          strokeWidth="2.2"
          fill="none"
          style={{ animationDelay: "0.55s" }}
        />
        <path
          className="capability-path"
          pathLength={1}
          d="M480 300 C540 340, 640 380, 720 460"
          stroke="url(#branch)"
          strokeWidth="2.2"
          fill="none"
          style={{ animationDelay: "0.7s" }}
        />
        <path
          className="capability-path"
          pathLength={1}
          d="M480 300 C470 380, 450 470, 430 580"
          stroke="url(#branch)"
          strokeWidth="2"
          fill="none"
          style={{ animationDelay: "0.85s" }}
        />
        <path
          className="capability-path"
          pathLength={1}
          d="M480 300 C500 390, 540 490, 580 600"
          stroke="url(#branch)"
          strokeWidth="2"
          fill="none"
          style={{ animationDelay: "1s" }}
        />

        {/* Nodes */}
        <circle cx="480" cy="80" r="10" fill="#d4844a" />
        <circle
          cx="480"
          cy="300"
          r="7"
          fill="#e8ecef"
          style={{ animation: "pulse-soft 3.2s ease-in-out infinite" }}
        />
        <circle cx="240" cy="460" r="5.5" fill="#d4844a" opacity="0.9" />
        <circle cx="720" cy="460" r="5.5" fill="#d4844a" opacity="0.9" />
        <circle cx="430" cy="580" r="5" fill="#9bb4a6" />
        <circle cx="580" cy="600" r="5" fill="#9bb4a6" />

        {/* Labels */}
        <text
          x="498"
          y="86"
          fill="#e8ecef"
          fontSize="13"
          fontFamily="ui-monospace, monospace"
        >
          OWNERSHIP
        </text>
        <text
          x="160"
          y="490"
          fill="#e8ecef"
          fontSize="12"
          fontFamily="ui-monospace, monospace"
          opacity="0.85"
        >
          LIQUIDITY CAP
        </text>
        <text
          x="640"
          y="490"
          fill="#e8ecef"
          fontSize="12"
          fontFamily="ui-monospace, monospace"
          opacity="0.85"
        >
          COLLATERAL CAP
        </text>
        <text
          x="290"
          y="600"
          fill="#c5cdd6"
          fontSize="12"
          fontFamily="ui-monospace, monospace"
          opacity="0.75"
        >
          MM CAP
        </text>
        <text
          x="540"
          y="630"
          fill="#c5cdd6"
          fontSize="12"
          fontFamily="ui-monospace, monospace"
          opacity="0.75"
        >
          OPTION CAP
        </text>
      </svg>
    </div>
  );
}
