import { ImageResponse } from "next/og";

export const alt = "SITEO — Seervi International Trade & Education Organization";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BLOCKS = [
  { letter: "S", color: "#dd156b" },
  { letter: "I", color: "#488ecc" },
  { letter: "T", color: "#f6931e" },
  { letter: "E", color: "#6f2d8f" },
  { letter: "O", color: "#00707e" },
];

// Social card: deep-green field with the full-color logo mark (hero moment) +
// name. Uses ImageResponse's built-in font fallback (no external font fetch).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#0e3b2e",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", gap: "12px" }}>
          {BLOCKS.map((b) => (
            <div
              key={b.letter}
              style={{
                width: "104px",
                height: "104px",
                backgroundColor: b.color,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "64px",
                fontWeight: 800,
              }}
            >
              {b.letter}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "48px", fontSize: "46px", color: "#f4f7f4", maxWidth: "900px" }}>
          Seervi International Trade &amp; Education Organization
        </div>
        <div style={{ marginTop: "16px", fontSize: "26px", color: "#c9a227" }}>
          Trade · Education · Development
        </div>
      </div>
    ),
    { ...size },
  );
}
