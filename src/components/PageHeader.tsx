export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  index?: string;
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-20">
      <div
        className="pointer-events-none absolute right-0 top-0 h-64 w-64 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(169,196,247,0.5), transparent 65%)",
        }}
      />
      <div className="cyber-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <span className="reveal inline-flex items-center gap-2 text-sm font-medium uppercase tracked text-accent-bright">
          <span className="eyebrow-dot h-1.5 w-1.5 rounded-full bg-accent" />
          {eyebrow}
        </span>
        <h1
          className="reveal mt-4 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          {title}
        </h1>
        {lead && (
          <p
            className="reveal mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted"
            style={{ animationDelay: "160ms" }}
          >
            {lead}
          </p>
        )}
      </div>
    </section>
  );
}
