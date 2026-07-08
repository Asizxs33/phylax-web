export function PhylaxMark({ className = "", glow = false }: { className?: string; glow?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 18px rgba(217,142,63,0.45))" } : undefined}
    >
      <path
        d="M24 3 6 10v11c0 12.2 7.4 20.6 18 24 10.6-3.4 18-11.8 18-24V10L24 3Z"
        stroke="var(--accent)"
        strokeWidth="1.4"
      />
      <path
        d="M24 9 11 14v7c0 9.6 5.8 16.1 13 19 7.2-2.9 13-9.4 13-19v-7L24 9Z"
        fill="none"
        stroke="var(--ink)"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      <circle cx="24" cy="22" r="5.5" stroke="var(--accent)" strokeWidth="1.4" />
      <circle cx="24" cy="22" r="1.6" fill="var(--accent)" />
    </svg>
  );
}
