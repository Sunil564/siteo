import { readFileSync } from "fs";
import { join } from "path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "SITEO - Seervi International Trade & Education Organization";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Embed the actual logo file as a data URI (read at build time).
function logoDataUri(): string {
  const bytes = readFileSync(join(process.cwd(), "public", "siteo-logo.jpg"));
  return `data:image/jpeg;base64,${bytes.toString("base64")}`;
}

export default function OpengraphImage() {
  const logo = logoDataUri();
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={560} height={140} alt="SITEO" />
        <div style={{ marginTop: "48px", fontSize: "46px", color: "#f4f7f4", maxWidth: "920px" }}>
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
