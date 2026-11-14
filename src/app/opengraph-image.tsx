import { ImageResponse } from "next/og";

export const alt = "Mcpatenz Bill Tracker — Bill tracking and reminders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #070b14 0%, #0c1424 55%, #101c33 100%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(139,92,246,0.5), rgba(139,92,246,0))",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -220,
            left: -120,
            width: 640,
            height: 640,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(45,212,167,0.32), rgba(45,212,167,0))",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #8b5cf6, #2dd4a7)",
              color: "#070b14",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            B
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#e8edf9" }}>Mcpatenz Bill Tracker</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 76,
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#f4f7ff",
              letterSpacing: "-0.03em",
            }}
          >
            <span>Never&nbsp;miss&nbsp;</span>
            <span style={{ color: "#a78bfa" }}>another due date.</span>
          </div>
          <div style={{ fontSize: 30, color: "#93a0bb", lineHeight: 1.4 }}>
            Track every bill. Get calm, automatic email reminders. See exactly what is due next.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {["Email reminders", "Recurring bills", "Spending insights"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "12px 22px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.28)",
                background: "rgba(255,255,255,0.04)",
                color: "#cbd5e1",
                fontSize: 22,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
