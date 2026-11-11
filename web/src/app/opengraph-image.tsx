import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = "AorySoft";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          color: "#f4f7fa",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 72,
            height: 72,
            borderRadius: 6,
            border: "1px solid #1e2836",
            alignItems: "center",
            justifyContent: "center",
            color: "#06b6d4",
            fontSize: 36,
            fontWeight: 600,
          }}
        >
          A
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            {SITE_NAME}
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#a8b3c2",
              fontFamily: "system-ui, sans-serif",
              maxWidth: 900,
            }}
          >
            {SITE_TAGLINE}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
