import Link from "next/link";

const VIDEO_ID = "SilV4Ox3Lm0";
const EMBED_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`;
const YOUTUBE_WATCH_URL = `https://youtu.be/${VIDEO_ID}`;

export default function WatchDemoPage() {
  return (
    <div
      style={{
        background: "#050505",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "96px 20px 64px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "38px" }}>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "5px",
              textTransform: "uppercase",
              color: "#ff6e00",
              marginBottom: "14px",
              fontWeight: 600,
              opacity: 0.9,
            }}
          >
            Zenith Demo Experience
          </div>

          <h1
            style={{
              fontSize: "clamp(30px, 5.2vw, 66px)",
              fontWeight: 900,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              lineHeight: 0.95,
              marginBottom: "18px",
            }}
          >
            Watch Product Demo
          </h1>

          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            Same Zenith visual language, now focused on one thing: a clean demo
            player with zero clutter and full-screen support.
          </p>

          <div
            style={{
              width: "52px",
              height: "2px",
              background: "#ff6e00",
              margin: "24px auto 0",
              opacity: 0.58,
            }}
          />
        </div>

        <section
          style={{
            border: "1px solid rgba(255,110,0,0.42)",
            borderRadius: "18px",
            background:
              "linear-gradient(145deg, rgba(10,10,14,0.95), rgba(8,8,10,0.95))",
            boxShadow: "0 22px 48px rgba(0,0,0,0.45)",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "3px",
                color: "#ff6e00",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Live Demo Feed
            </div>

            <a
              href={YOUTUBE_WATCH_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "11px",
                letterSpacing: "2px",
                color: "#ffffff",
                textTransform: "uppercase",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: "999px",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              Open on YouTube
            </a>
          </div>

          <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
            <iframe
              src={EMBED_URL}
              title="Zenith Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: "0",
                background: "#000",
              }}
            />
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              label: "Demo Focus",
              value: "Product Walkthrough",
              desc: "End-to-end flow from analysis input to decision output.",
            },
            {
              label: "Playback",
              value: "Responsive 16:9 Player",
              desc: "Optimized for mobile, tablet, and desktop screens.",
            },
            {
              label: "Visual Tone",
              value: "Engine-Matched UI",
              desc: "Dark cinematic base with Zenith orange accent styling.",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                padding: "16px",
                background: "rgba(15,15,18,0.78)",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: "8px",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  color: "#ffffff",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                {item.value}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.56)",
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </section>

        <div
          style={{
            marginTop: "26px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/engine"
            style={{
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: "999px",
              padding: "10px 16px",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            Back to Engine
          </Link>

          <a
            href={YOUTUBE_WATCH_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "#050505",
              border: "1px solid #ff6e00",
              borderRadius: "999px",
              padding: "10px 16px",
              background: "#ff6e00",
              fontWeight: 700,
            }}
          >
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
