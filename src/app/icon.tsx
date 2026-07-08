import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const SHIELD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
<path d="M24 3 6 10v11c0 12.2 7.4 20.6 18 24 10.6-3.4 18-11.8 18-24V10L24 3Z" stroke="#f0ab5a" stroke-width="2.4"/>
<circle cx="24" cy="22" r="6" stroke="#f0ab5a" stroke-width="2.4"/>
<circle cx="24" cy="22" r="2" fill="#f0ab5a"/>
</svg>`;
const SHIELD = `data:image/svg+xml;base64,${Buffer.from(SHIELD_SVG).toString("base64")}`;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0b0d",
          borderRadius: 7,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={26}
          height={26}
          alt="Phylax"
          src={SHIELD}
        />
      </div>
    ),
    { ...size }
  );
}
