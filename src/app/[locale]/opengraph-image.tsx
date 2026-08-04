import { ImageResponse } from "next/og";

export const alt = "Catinder — Where Happy Cats Begin Their Forever Story";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social-share card (LINE / Facebook / X link previews).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0B1D3A 0%, #12264a 55%, #0B1D3A 100%)",
          position: "relative",
        }}
      >
        {/* gold glow */}
        <div
          style={{
            position: "absolute",
            top: -160,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.35), transparent 68%)",
          }}
        />
        {/* eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 8,
            color: "#EDD060",
            textTransform: "uppercase",
          }}
        >
          Cat Matchmaking Platform
        </div>
        {/* wordmark */}
        <div
          style={{
            marginTop: 18,
            fontSize: 150,
            fontWeight: 900,
            background: "linear-gradient(135deg, #EDD060, #D4AF37, #B8920A)",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: -2,
          }}
        >
          Catinder
        </div>
        {/* tagline */}
        <div
          style={{
            marginTop: 8,
            fontSize: 38,
            fontWeight: 600,
            color: "#F7D7AB",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Where Happy Cats Begin Their Forever Story
        </div>
        {/* footer chips */}
        <div style={{ marginTop: 44, display: "flex", gap: 20, fontSize: 24, color: "#0B1D3A" }}>
          {["Discover", "Match", "Health Passport"].map((t) => (
            <div
              key={t}
              style={{
                padding: "10px 26px",
                borderRadius: 999,
                background: "linear-gradient(135deg, #EDD060, #D4AF37)",
                fontWeight: 700,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
