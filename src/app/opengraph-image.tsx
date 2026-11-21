import { ImageResponse } from "next/og";

export const alt = "University of Swat AI Assistant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at build time, so you don't need to design a share image by hand.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, opacity: 0.85 }}>
          Student project
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1.05, marginTop: 24 }}>
          University of Swat
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1.05 }}>
          AI Assistant
        </div>
        <div style={{ display: "flex", fontSize: 36, marginTop: 40, opacity: 0.9 }}>
          Admissions · Programs · Fees
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 56, opacity: 0.75 }}>
          Built by Sayyed Hassan Bacha, BS Information Technology
        </div>
      </div>
    ),
    { ...size }
  );
}
