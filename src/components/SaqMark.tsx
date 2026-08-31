/*
 * Aqyl — живой маскот SAQ.
 * mood задаёт выражение лица (лист эмоций бренда), CSS-классы в globals.css
 * дают идл-анимации: моргание, подрагивание ушей, «сканирующие» зрачки.
 */

export type AqylMood =
  | "neutral" // спокойный, лёгкая улыбка
  | "happy" // открытая улыбка
  | "excited" // восторг: улыбка + румянец
  | "wink" // подмигивает
  | "surprised" // округлённые глаза, рот «о»
  | "thinking" // зрачки бегают — сканирует
  | "sleepy" // глаза закрыты
  | "sad" // грустный
  | "alert"; // тревога: брови + хмурый рот

const NAVY = "#132a63";
const TONGUE = "#e0526d";
const BLUSH = "#7ba3f5";

function Eyes({ mood }: { mood: AqylMood }) {
  const closedHappy = (
    <>
      <path d="M15.4 28.4q3.2-3.2 6.4 0" stroke={NAVY} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M26.2 28.4q3.2-3.2 6.4 0" stroke={NAVY} strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  );
  const closedSleepy = (
    <>
      <path d="M15.4 27.6q3.2 2.6 6.4 0" stroke={NAVY} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M26.2 27.6q3.2 2.6 6.4 0" stroke={NAVY} strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  );

  if (mood === "happy" || mood === "excited") return closedHappy;
  if (mood === "sleepy") return closedSleepy;

  if (mood === "wink") {
    return (
      <>
        <g className="aqyl-eyes">
          <circle cx="18.6" cy="28" r="3.1" fill={NAVY} />
          <circle cx="19.7" cy="26.9" r="1" fill="#ffffff" />
        </g>
        <path d="M26.2 28q3.2-2.8 6.4 0" stroke={NAVY} strokeWidth="2" strokeLinecap="round" fill="none" />
      </>
    );
  }

  const r = mood === "surprised" ? 3.7 : 3.1;
  return (
    <g className="aqyl-eyes">
      <g className="aqyl-look">
        <circle cx="18.6" cy="28" r={r} fill={NAVY} />
        <circle cx="29.4" cy="28" r={r} fill={NAVY} />
        <g className={mood === "thinking" ? "aqyl-scan" : undefined}>
          <circle cx="19.7" cy="26.9" r="1" fill="#ffffff" />
          <circle cx="30.5" cy="26.9" r="1" fill="#ffffff" />
        </g>
      </g>
    </g>
  );
}

function Mouth({ mood }: { mood: AqylMood }) {
  switch (mood) {
    case "happy":
    case "excited":
      return (
        <g className="aqyl-pop">
          <path d="M20.4 31.6h7.2c0 2.7-1.6 4.4-3.6 4.4s-3.6-1.7-3.6-4.4Z" fill={NAVY} />
          <path d="M22 34.9c.5.7 1.2 1.1 2 1.1s1.5-.4 2-1.1c-.5-.9-1.2-1.4-2-1.4s-1.5.5-2 1.4Z" fill={TONGUE} />
        </g>
      );
    case "surprised":
      return <circle className="aqyl-pop" cx="24" cy="33.4" r="2.1" fill={NAVY} />;
    case "thinking":
      return <path className="aqyl-pop" d="M21.8 33.4h4.4" stroke={NAVY} strokeWidth="1.7" strokeLinecap="round" />;
    case "sad":
      return (
        <path className="aqyl-pop" d="M21.2 34.6q2.8-2.6 5.6 0" stroke={NAVY} strokeWidth="1.7" strokeLinecap="round" fill="none" />
      );
    case "alert":
      return (
        <path className="aqyl-pop" d="M21.2 34.4q2.8-2.2 5.6 0" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      );
    default:
      return (
        <path className="aqyl-pop" d="M21.4 33.2c1.7 1.5 3.5 1.5 5.2 0" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      );
  }
}

function Extras({ mood }: { mood: AqylMood }) {
  return (
    <>
      {mood === "alert" && (
        <g className="aqyl-pop">
          <path d="M14.6 23.4l6.2 1.9" stroke={NAVY} strokeWidth="1.9" strokeLinecap="round" />
          <path d="M33.4 23.4l-6.2 1.9" stroke={NAVY} strokeWidth="1.9" strokeLinecap="round" />
        </g>
      )}
      {mood === "sad" && (
        <g className="aqyl-pop">
          <path d="M15 24.6l5.6 1.2" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
          <path d="M33 24.6l-5.6 1.2" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
        </g>
      )}
      {(mood === "excited" || mood === "happy") && (
        <g className="aqyl-pop" opacity={mood === "excited" ? 0.85 : 0.5}>
          <ellipse cx="14.4" cy="31.6" rx="2" ry="1.2" fill={BLUSH} />
          <ellipse cx="33.6" cy="31.6" rx="2" ry="1.2" fill={BLUSH} />
        </g>
      )}
      {mood === "excited" && (
        <g className="aqyl-sparkle" fill="var(--accent)">
          <path d="M8 6.5l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9Z" />
          <path d="M40.5 5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7Z" />
        </g>
      )}
      {mood === "thinking" && (
        <g className="aqyl-sparkle" fill="var(--accent)" opacity="0.7">
          <circle cx="41" cy="9" r="1.4" />
          <circle cx="44" cy="5" r="1" />
        </g>
      )}
    </>
  );
}

/* объёмные градиенты — дублируются в каждом svg, id одинаковые,
   браузер резолвит по первому вхождению (все определения идентичны) */
function AqylDefs() {
  return (
    <defs>
      <linearGradient id="aqyl-g-head" x1="10" y1="8" x2="38" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#5f94f9" />
        <stop offset="0.55" stopColor="#2f6ae8" />
        <stop offset="1" stopColor="#1c4ecf" />
      </linearGradient>
      <linearGradient id="aqyl-g-ear" x1="8" y1="4" x2="40" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#4d83f2" />
        <stop offset="1" stopColor="#1e4dc4" />
      </linearGradient>
      <linearGradient id="aqyl-g-face" x1="24" y1="18" x2="24" y2="37" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#eef4ff" />
      </linearGradient>
    </defs>
  );
}

/* Голова Aqyl с выражением лица */
function AqylFace({ mood }: { mood: AqylMood }) {
  return (
    <>
      {/* уши */}
      <g className="aqyl-ear">
        <ellipse cx="14" cy="11" rx="4.6" ry="6.4" transform="rotate(-24 14 11)" fill="url(#aqyl-g-ear)" />
        <ellipse cx="13.4" cy="9.6" rx="1.7" ry="2.6" transform="rotate(-24 13.4 9.6)" fill="#8db3fa" opacity="0.55" />
      </g>
      <g className="aqyl-ear aqyl-ear-r">
        <ellipse cx="34" cy="11" rx="4.6" ry="6.4" transform="rotate(24 34 11)" fill="url(#aqyl-g-ear)" />
        <ellipse cx="34.6" cy="9.6" rx="1.7" ry="2.6" transform="rotate(24 34.6 9.6)" fill="#8db3fa" opacity="0.55" />
      </g>
      {/* голова */}
      <path
        d="M24 10c10.6 0 18 6.6 18 16.4C42 36.6 34.4 43 24 43S6 36.6 6 26.4C6 16.6 13.4 10 24 10Z"
        fill="url(#aqyl-g-head)"
      />
      {/* глянцевый блик на макушке */}
      <ellipse cx="19" cy="14.6" rx="7.5" ry="3" transform="rotate(-12 19 14.6)" fill="#ffffff" opacity="0.3" />
      {/* лицевая панель */}
      <path
        d="M24 18.2c-2.5 0-3.6 1.6-6.8 1.6-3.4 0-6.2 2.6-6.2 6.4 0 6 5.4 10.4 13 10.4s13-4.4 13-10.4c0-3.8-2.8-6.4-6.2-6.4-3.2 0-4.3-1.6-6.8-1.6Z"
        fill="url(#aqyl-g-face)"
      />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      <Extras mood={mood} />
    </>
  );
}

/* Маскот отдельно — чат, обучение, акценты */
export function AqylMark({
  className = "",
  glow = false,
  mood = "neutral",
}: {
  className?: string;
  glow?: boolean;
  mood?: AqylMood;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 18px rgba(47,106,232,0.45))" } : undefined}
    >
      <AqylDefs />
      {/* key заставляет весь «поп» переигрываться при смене настроения */}
      <g key={mood} className="aqyl-breathe">
        <AqylFace mood={mood} />
      </g>
    </svg>
  );
}

/* Основной логотип — щит с Aqyl внутри */
export function SaqMark({
  className = "",
  glow = false,
  mood = "neutral",
}: {
  className?: string;
  glow?: boolean;
  mood?: AqylMood;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 18px rgba(47,106,232,0.45))" } : undefined}
    >
      <AqylDefs />
      <path
        d="M24 2.5 5 9.8v11.4c0 12.8 7.8 21.6 19 25.3 11.2-3.7 19-12.5 19-25.3V9.8L24 2.5Z"
        stroke="url(#aqyl-g-head)"
        strokeWidth="2.6"
        strokeLinejoin="round"
        fill="var(--bg-card, #ffffff)"
      />
      <g key={mood} transform="translate(24 22.5) scale(0.62) translate(-24 -26)">
        <g className="aqyl-breathe">
          <AqylFace mood={mood} />
        </g>
      </g>
    </svg>
  );
}
