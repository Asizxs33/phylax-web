export function RadarBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* warm central glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "radial-gradient(circle, rgba(47,106,232,0.12), transparent 62%)",
        }}
      />
      {/* concentric rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2, 3, 4].map((i) => {
          const s = 800 - i * 165;
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/12"
              style={{ height: `${s}px`, width: `${s}px` }}
            />
          );
        })}
      </div>
      {/* crosshair */}
      <div className="absolute left-1/2 top-1/2 h-[800px] w-px -translate-x-1/2 -translate-y-1/2 bg-accent/8" />
      <div className="absolute left-1/2 top-1/2 h-px w-[800px] -translate-x-1/2 -translate-y-1/2 bg-accent/8" />
      {/* rotating sweep */}
      <div className="radar-sweep absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-70" />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 55%, rgba(18,38,92,0.06))",
        }}
      />
    </div>
  );
}
