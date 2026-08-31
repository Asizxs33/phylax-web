import { ImageResponse } from "next/og";

export const alt = "SAQ — финансовый защитник";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
<path d="M24 2.5 5 9.8v11.4c0 12.8 7.8 21.6 19 25.3 11.2-3.7 19-12.5 19-25.3V9.8L24 2.5Z" stroke="#5b8cf2" stroke-width="2.6" stroke-linejoin="round" fill="#0d1c46"/>
<g transform="translate(24 22.5) scale(0.62) translate(-24 -26)">
<ellipse cx="14" cy="11" rx="4.6" ry="6.4" transform="rotate(-24 14 11)" fill="#5b8cf2"/>
<ellipse cx="34" cy="11" rx="4.6" ry="6.4" transform="rotate(24 34 11)" fill="#5b8cf2"/>
<path d="M24 10c10.6 0 18 6.6 18 16.4C42 36.6 34.4 43 24 43S6 36.6 6 26.4C6 16.6 13.4 10 24 10Z" fill="#5b8cf2"/>
<path d="M24 18.2c-2.5 0-3.6 1.6-6.8 1.6-3.4 0-6.2 2.6-6.2 6.4 0 6 5.4 10.4 13 10.4s13-4.4 13-10.4c0-3.8-2.8-6.4-6.2-6.4-3.2 0-4.3-1.6-6.8-1.6Z" fill="#ffffff"/>
<circle cx="18.6" cy="28" r="3.1" fill="#132a63"/>
<circle cx="29.4" cy="28" r="3.1" fill="#132a63"/>
<path d="M21.4 33.2c1.7 1.5 3.5 1.5 5.2 0" stroke="#132a63" stroke-width="1.6" stroke-linecap="round" fill="none"/>
</g>
</svg>`;
const MARK = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(ellipse 70% 60% at 80% 0%, #16306e, #0d1c46 60%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img width={64} height={64} alt="" src={MARK} />
          <span style={{ color: "#eaf1ff", fontSize: 40, fontWeight: 700, letterSpacing: 2 }}>SAQ</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span
            style={{
              color: "#7ba3f5",
              fontSize: 20,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Aqyl · Сообщество · Обучение
          </span>
          <span style={{ color: "#eaf1ff", fontSize: 76, lineHeight: 1.05, maxWidth: 900 }}>
            Финансовый защитник от пирамид и скама
          </span>
          <span style={{ color: "#9db1dc", fontSize: 28, maxWidth: 820, lineHeight: 1.35 }}>
            Спросите Aqyl — один запрос, десятки открытых источников, прозрачное досье с risk score.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            color: "#5b73aa",
            fontSize: 20,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>Қорғайды</span>
          <span>·</span>
          <span>Анықтайды</span>
          <span>·</span>
          <span>Ескертеді</span>
          <span>·</span>
          <span>Үйретеді</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
