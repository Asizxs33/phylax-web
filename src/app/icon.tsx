import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
<ellipse cx="14" cy="11" rx="4.6" ry="6.4" transform="rotate(-24 14 11)" fill="#5b8cf2"/>
<ellipse cx="34" cy="11" rx="4.6" ry="6.4" transform="rotate(24 34 11)" fill="#5b8cf2"/>
<path d="M24 10c10.6 0 18 6.6 18 16.4C42 36.6 34.4 43 24 43S6 36.6 6 26.4C6 16.6 13.4 10 24 10Z" fill="#5b8cf2"/>
<path d="M24 18.2c-2.5 0-3.6 1.6-6.8 1.6-3.4 0-6.2 2.6-6.2 6.4 0 6 5.4 10.4 13 10.4s13-4.4 13-10.4c0-3.8-2.8-6.4-6.2-6.4-3.2 0-4.3-1.6-6.8-1.6Z" fill="#ffffff"/>
<circle cx="18.6" cy="28" r="3.1" fill="#132a63"/>
<circle cx="29.4" cy="28" r="3.1" fill="#132a63"/>
<path d="M21.4 33.2c1.7 1.5 3.5 1.5 5.2 0" stroke="#132a63" stroke-width="1.6" stroke-linecap="round" fill="none"/>
</svg>`;
const MARK = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;

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
          background: "#0d1c46",
          borderRadius: 7,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={27}
          height={27}
          alt="SAQ"
          src={MARK}
        />
      </div>
    ),
    { ...size }
  );
}
