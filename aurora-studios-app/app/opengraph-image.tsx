import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "Aurora Studios · Tecnología que impulsa tus ideas, en cualquier país";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="#15141b"/><rect x="1" y="1" width="98" height="98" rx="23" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2"/><g transform="translate(50 50) scale(0.6) translate(-50 -50)"><path d="M16.5 81L50 15l33.5 66" fill="none" stroke="#fdfcf9" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M33.5 89a16.5 16.5 0 0 1 33 0z" fill="#ffd43b"/></g></svg>`;

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
          padding: 72,
          background: "#0e0d13",
          backgroundImage:
            "radial-gradient(circle at 12% 0%, rgba(125,223,176,.45), transparent 45%), radial-gradient(circle at 88% 8%, rgba(139,124,255,.45), transparent 45%), radial-gradient(circle at 60% 120%, rgba(255,212,59,.25), transparent 50%)",
          color: "#fdfcf9",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src={`data:image/svg+xml;base64,${Buffer.from(LOGO).toString("base64")}`} width={96} height={96} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 800 }}>Aurora Studios</div>
            <div style={{ fontSize: 18, letterSpacing: 8, color: "#ff9f45", marginTop: 6 }}>AI DEVELOPMENT</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>Tecnología que impulsa tus ideas,</div>
          <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2, color: "#7ddfb0" }}>en cualquier país.</div>
          <div style={{ fontSize: 28, marginTop: 28, color: "rgba(253,252,249,.7)" }}>
            Páginas web · Bots · Videos · Apps · Videojuegos · IA
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "rgba(253,252,249,.6)" }}>
          <div>{SITE.domain}</div>
          <div>{SITE.group}</div>
        </div>
      </div>
    ),
    size,
  );
}
