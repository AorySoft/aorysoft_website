import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { MARK_VIEWBOX } from "@/components/brand/markGeometry";
import { markDataUri } from "@/lib/brand/mark-svg";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME}: ${SITE_TAGLINE.replace(/\.$/, "")}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MARK_WIDTH = 132;

/** Social card: the official A mark, the wordmark, and the tagline on the true-black stage. */
export default async function OpenGraphImage() {
  // next/font cannot feed ImageResponse; the OFL TTF ships in src/app/fonts.
  const serif = await readFile(join(process.cwd(), "src/app/fonts/InstrumentSerif-Regular.ttf"));

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
          padding: "72px 80px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
        <img
          src={markDataUri(MARK_WIDTH)}
          width={MARK_WIDTH}
          height={Math.round((MARK_WIDTH * MARK_VIEWBOX.height) / MARK_VIEWBOX.width)}
          alt=""
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontFamily: "Instrument Serif", fontSize: 104, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {SITE_NAME}
          </div>
          <div style={{ fontFamily: "Instrument Serif", fontSize: 44, color: "#a8b3c2", lineHeight: 1.2 }}>
            {SITE_TAGLINE}
          </div>
          <div style={{ display: "flex", width: 160, height: 2, marginTop: 12, background: "#06b6d4" }} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Instrument Serif", data: serif, style: "normal", weight: 400 }] },
  );
}
