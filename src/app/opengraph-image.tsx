import { ImageResponse } from "next/og";

export const alt = "Phylax — страж против финансовых пирамид";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SHIELD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
<path d="M24 3 6 10v11c0 12.2 7.4 20.6 18 24 10.6-3.4 18-11.8 18-24V10L24 3Z" stroke="#f0ab5a" stroke-width="1.6"/>
<circle cx="24" cy="22" r="6" stroke="#f0ab5a" stroke-width="1.6"/>
<circle cx="24" cy="22" r="2" fill="#f0ab5a"/>
</svg>`;
const SHIELD = `data:image/svg+xml;base64,${Buffer.from(SHIELD_SVG).toString("base64")}`;

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
            "radial-gradient(ellipse 70% 60% at 80% 0%, #1c1408, #0a0b0d 60%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img width={56} height={56} alt="" src={SHIELD} />
          <span style={{ color: "#ece7de", fontSize: 34, letterSpacing: -1 }}>Phylax</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span
            style={{
              color: "#f0ab5a",
              fontSize: 20,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            OSINT · Threat Intelligence
          </span>
          <span style={{ color: "#ece7de", fontSize: 76, lineHeight: 1.05, maxWidth: 900 }}>
            Страж между вами и следующей пирамидой
          </span>
          <span style={{ color: "#96979d", fontSize: 28, maxWidth: 820, lineHeight: 1.35 }}>
            Один запрос — десятки открытых источников — прозрачное досье с risk score.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            color: "#55585f",
            fontSize: 20,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>16+ источников</span>
          <span>·</span>
          <span>6 типов объекта</span>
          <span>·</span>
          <span>0 ботов</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
