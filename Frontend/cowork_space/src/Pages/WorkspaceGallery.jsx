import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CATEGORY_DATA = {
  coworking: {
    label: "Coworking Spaces",
    accent: "#C8A96E",
    tagline: "Where Ideas Meet Community",
    description: "Flexible desks and vibrant open floors built for collaboration.",
    hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=90",
    grid: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&q=80",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=700&q=80",
    ],
    userImages: ["/g1.webp", "/g2.webp"],
  },
  office: {
    label: "Office Spaces",
    accent: "#6E9EC8",
    tagline: "Your Brand. Your Territory.",
    description: "Dedicated private offices ready to move in.",
    hero: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=90",
    grid: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=700&q=80",
      "https://images.unsplash.com/photo-1568992688065-536de3962603?w=700&q=80",
    ],
    userImages: ["/g6.jpg", "/g7.jpg"],
  },
  meeting: {
    label: "Meeting Rooms",
    accent: "#8EC86E",
    tagline: "Decisions Made Here.",
    description: "AV-equipped rooms for pitches and meetings.",
    hero: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=90",
    grid: [
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=700&q=80",
      "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=700&q=80",
    ],
    userImages: ["/g11.jpg", "/g12.jpeg"],
  },
  enterprise: {
    label: "Enterprise Floors",
    accent: "#C86E8E",
    tagline: "Scale Without Limits.",
    description: "Full floors for enterprise teams.",
    hero: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=90",
    grid: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=700&q=80",
      "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=700&q=80",
    ],
    userImages: ["/g16.jpg", "/g17.jpg"],
  },
};

const ALL_SECTIONS = ["coworking", "office", "meeting", "enterprise"];

const FEATURES = {
  coworking: ["High-Speed WiFi", "24/7 Access", "Community Events"],
  office: ["Dedicated Desk", "Reception", "Security"],
  meeting: ["AV Equipment", "Video Conferencing", "Hourly Booking"],
  enterprise: ["Full Floor", "Custom Fit-Out", "VIP Lounge"],
};

const STATS = {
  coworking: [{ n: "2,400+", l: "Members" }, { n: "6", l: "Locations" }],
  office: [{ n: "380+", l: "Offices" }, { n: "99%", l: "Uptime" }],
  meeting: [{ n: "120+", l: "Rooms" }, { n: "1 hr", l: "Min Booking" }],
  enterprise: [{ n: "50+", l: "Clients" }, { n: "10K+", l: "sqft" }],
};

const BOOK_LABELS = {
  coworking: "Book Coworking →",
  office: "Book Office →",
  meeting: "Book Meeting →",
  enterprise: "Enterprise →",
};

/* ─── Global CSS: responsive + hover + animations only ──────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .wg-pills::-webkit-scrollbar { display: none; }

  /* ── Pill active/hover ── */
  .wg-pill { transition: color 0.25s, border-color 0.25s; }
  .wg-pill:hover { color: rgba(232,228,220,0.85) !important; }

  /* ── Nav arrow button — full original style ── */
  .wg-nav-arrow {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.16);
    color: #E8E4DC;
    padding: 0.75rem 1.25rem;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: background 0.28s ease, transform 0.28s ease, box-shadow 0.28s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    white-space: nowrap;
    text-decoration: none;
  }
  .wg-nav-arrow:hover {
    background: rgba(255,255,255,0.18);
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(0,0,0,0.35);
  }
  .wg-nav-arrow:active { transform: translateY(0); }

  /* accent overlay on nav buttons */
  .wg-nav-arrow.accent-overlay {
    background: linear-gradient(135deg, var(--btn-accent-color, rgba(200,169,110,0.18)), rgba(255,255,255,0.04));
    border-color: var(--btn-accent-color, rgba(200,169,110,0.3));
    color: var(--btn-accent-color, #C8A96E);
  }
  .wg-nav-arrow.accent-overlay:hover {
    background: linear-gradient(135deg, var(--btn-accent-color, rgba(200,169,110,0.28)), rgba(255,255,255,0.08));
    box-shadow: 0 10px 28px rgba(0,0,0,0.3);
  }

  /* ── Image hover ── */
  .wg-img { transition: transform 0.4s ease, filter 0.4s ease; }
  .wg-img:hover { transform: scale(1.009) !important; filter: brightness(1) !important; }

  /* ── Reveal animation ── */
  .wg-reveal {
    opacity: 0;
    transform: translateY(22px);
    transition: opacity 0.65s ease, transform 0.65s ease;
  }
  .wg-reveal.visible { opacity: 1; transform: translateY(0); }

  /* ── Tablet ── */
  @media (max-width: 960px) {
    .wg-section-header {
      grid-template-columns: 1fr !important;
      gap: 1.25rem !important;
    }
    .wg-right-col {
      flex-direction: row !important;
      align-items: center !important;
      flex-wrap: wrap !important;
      gap: 0.6rem !important;
    }
    .wg-hero-row {
      grid-template-columns: 1fr !important;
    }
    .wg-side-strip {
      flex-direction: row !important;
      gap: 6px !important;
    }
    .wg-side-img {
      flex: 1;
      aspect-ratio: 4/3 !important;
      height: auto !important;
    }
  }

  /* ── Mobile ── */
  @media (max-width: 600px) {
    .wg-section {
      padding: 1.75rem 1rem 2rem !important;
    }
    .wg-hero-row { gap: 5px !important; margin-bottom: 5px !important; }
    .wg-mosaic { grid-template-columns: 1fr !important; gap: 5px !important; }
    .wg-side-strip { gap: 5px !important; }
    .wg-badges { margin-top: 0.85rem !important; }
    .wg-stats-row { gap: 1.1rem !important; }
    .wg-right-col { gap: 0.5rem !important; }
    .wg-nav-arrow { padding: 0.65rem 1rem; font-size: 0.7rem; }
    .wg-section-title { font-size: clamp(1.75rem, 7vw, 2.8rem) !important; }
  }

  @media (max-width: 400px) {
    .wg-section { padding: 1.5rem 0.85rem 1.75rem !important; }
    .wg-mosaic { grid-template-columns: 1fr !important; }
  }
`;

/* ─── Inline style helpers ──────────────────────────────────── */
const S = {
  root: {
    background: "#0C0C0B",
    color: "#E8E4DC",
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
    overflowX: "hidden",
  },

  pillsNav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(12,12,11,0.93)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    overflowX: "auto",
    scrollbarWidth: "none",
    padding: "0 clamp(1rem,4vw,4rem)",
  },

  pill: (active, accent) => ({
    flexShrink: 0,
    padding: "1.05rem 1.45rem",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.76rem",
    fontWeight: 500,
    letterSpacing: "0.13em",
    textTransform: "uppercase",
    color: active ? "#E8E4DC" : "rgba(232,228,220,0.42)",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    borderBottom: active ? `2px solid ${accent}` : "2px solid transparent",
    whiteSpace: "nowrap",
  }),

  /* section: small but visible bottom padding for breathing room */
  section: {
    padding: "clamp(2.25rem,4.5vw,4.5rem) clamp(1rem,5vw,5rem) clamp(1.5rem,3vw,3rem)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    margin: 0,
  },

  sectionHeader: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "end",
    gap: "1.75rem",
    marginBottom: "1rem",
  },

  eyebrow: (accent) => ({
    display: "block",
    fontSize: "0.69rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: accent,
    marginBottom: "0.1rem",
  }),

  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(2.1rem,4.5vw,3.9rem)",
    fontWeight: 300,
    lineHeight: 1.08,
    color: "#E8E4DC",
    marginBottom: "0.1rem",
  },

  titleEm: (accent) => ({
    fontStyle: "italic",
    color: accent,
  }),

  desc: {
    fontSize: "0.9rem",
    lineHeight: 1.72,
    color: "rgba(232,228,220,0.52)",
    maxWidth: "44ch",
    marginTop: "0.1rem",
  },

  rightCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.1rem",
  },

  btnGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    alignItems: "flex-end",
  },

  statsRow: {
    display: "flex",
    gap: "2rem",
    flexWrap: "wrap",
    marginTop: "0.1rem",
  },

  statN: (accent) => ({
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "2rem",
    fontWeight: 600,
    color: accent,
    lineHeight: 1,
  }),

  statL: {
    fontSize: "0.65rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "rgba(232,228,220,0.38)",
    marginTop: "0.01rem",
  },

  heroRow: {
    display: "grid",
    gridTemplateColumns: "1fr 285px",
    gap: "7px",
    marginBottom: "1px",
  },

  sideStrip: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  heroImg: {
    width: "100%",
    aspectRatio: "16/9",
    objectFit: "cover",
    borderRadius: "5px",
    cursor: "pointer",
    display: "block",
    filter: "brightness(0.84)",
  },

  sideImg: {
    width: "100%",
    objectFit: "cover",
    borderRadius: "5px",
    cursor: "pointer",
    display: "block",
    filter: "brightness(0.84)",
    flex: 1,
    minHeight: 0,
  },

  mosaic: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "7px",
  },

  mosaicImg: {
    width: "100%",
    aspectRatio: "4/3",
    objectFit: "cover",
    borderRadius: "5px",
    cursor: "pointer",
    display: "block",
    filter: "brightness(0.84)",
  },

  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "1rem",
  },

  badge: {
    fontSize: "0.68rem",
    letterSpacing: "0.09em",
    textTransform: "uppercase",
    padding: "5px 13px",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "100px",
    color: "rgba(232,228,220,0.55)",
    background: "rgba(255,255,255,0.03)",
  },

  lightboxBg: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.93)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    cursor: "zoom-out",
  },

  lightboxImg: {
    maxWidth: "min(90vw,1400px)",
    maxHeight: "85vh",
    objectFit: "contain",
    borderRadius: "5px",
  },

  lightboxClose: {
    position: "absolute",
    top: "1.5rem",
    right: "2rem",
    fontSize: "2rem",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    background: "none",
    border: "none",
    lineHeight: 1,
  },

  fallback: {
    background: "rgba(255,255,255,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "5px",
    color: "rgba(255,255,255,0.15)",
    fontSize: "0.72rem",
    aspectRatio: "4/3",
    width: "100%",
  },

  footer: {
    padding: "2.5rem clamp(1rem,5vw,5rem)",
    margin: 0,
    textAlign: "center",
    borderTop: "1px solid rgba(255,255,255,0.04)",
  },

  footerText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(1.6rem,3.5vw,2.8rem)",
    color: "rgba(232,228,220,0.36)",
  },

  footerAccent: { color: "#C8A96E" },
};

/* ══════════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════════ */
export default function WorkspaceGallery() {
  const { type } = useParams();
  const navigate = useNavigate();
  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState(type || ALL_SECTIONS[0]);
  const [lightbox, setLightbox] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  const scrollToCompanies = () => {
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById("workspace-clients-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 500);
  };

  const goToHomePage = () => {
    navigate("/");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 200);
  };

  useEffect(() => {
    const target = type || ALL_SECTIONS[0];
    setActiveSection(target);
    const el = sectionRefs.current[target];
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, [type]);

  useEffect(() => {
    const observers = [];
    ALL_SECTIONS.forEach((key) => {
      const el = sectionRefs.current[key];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(key); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleImgError = (key) =>
    setImgErrors((prev) => ({ ...prev, [key]: true }));

  const scrollTo = (key) => {
    setActiveSection(key);
    navigate(`/gallery/${key}`, { replace: true });
    const el = sectionRefs.current[key];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={S.root}>

        {/* ── Sticky nav pills ── */}
        <nav style={S.pillsNav} className="wg-pills">
          {ALL_SECTIONS.map((key) => {
            const d = CATEGORY_DATA[key];
            return (
              <button
                key={key}
                className="wg-pill"
                style={S.pill(activeSection === key, d.accent)}
                onClick={() => scrollTo(key)}
              >
                {d.label}
              </button>
            );
          })}
        </nav>

        {/* ── Sections ── */}
        {ALL_SECTIONS.map((key) => {
          const d = CATEGORY_DATA[key];
          const stats = STATS[key];
          const features = FEATURES[key];

          return (
            <section
              key={key}
              ref={(el) => (sectionRefs.current[key] = el)}
              style={S.section}
              className="wg-section"
            >
              {/* Section header */}
              <RevealDiv style={S.sectionHeader} className="wg-section-header">
                {/* Left: title block */}
                <div>
                  <span style={S.eyebrow(d.accent)}>WorkNest · {d.label}</span>
                  <h2 style={S.title} className="wg-section-title">
                    {d.tagline.split(" ").map((w, i) =>
                      i === 0
                        ? <em key={i} style={S.titleEm(d.accent)}>{w} </em>
                        : w + " "
                    )}
                  </h2>
                  <p style={S.desc}>{d.description}</p>
                </div>

                {/* Right: buttons + stats */}
                <div style={S.rightCol} className="wg-right-col">
                  <div style={S.btnGroup}>
                    {/* Companies button — ghost style */}
                    <button
                      className="wg-nav-arrow"
                      onClick={scrollToCompanies}
                    >
                      ← Companies
                    </button>

                    {/* Book button — accent style */}
                    <button
                      className="wg-nav-arrow accent-overlay"
                      style={{ "--btn-accent-color": d.accent }}
                      onClick={goToHomePage}
                    >
                      {BOOK_LABELS[key]}
                    </button>
                  </div>

                  {/* Stats */}
                  <div style={S.statsRow} className="wg-stats-row">
                    {stats.map((s) => (
                      <div key={s.l}>
                        <div style={S.statN(d.accent)}>{s.n}</div>
                        <div style={S.statL}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealDiv>

              {/* Hero image + side strip */}
              <RevealDiv delay={0.08}>
                <div style={S.heroRow} className="wg-hero-row">
                  <ImgTile
                    src={d.hero}
                    alt={`${d.label} hero`}
                    imgStyle={S.heroImg}
                    onClick={() => setLightbox(d.hero)}
                    onError={() => handleImgError(`${key}-hero`)}
                    errored={imgErrors[`${key}-hero`]}
                  />
                  <div style={S.sideStrip} className="wg-side-strip">
                    {d.grid.slice(0, 2).map((src, i) => (
                      <ImgTile
                        key={i}
                        src={src}
                        alt={`${d.label} ${i + 1}`}
                        imgStyle={S.sideImg}
                        className="wg-side-img"
                        onClick={() => setLightbox(src)}
                        onError={() => handleImgError(`${key}-side-${i}`)}
                        errored={imgErrors[`${key}-side-${i}`]}
                      />
                    ))}
                  </div>
                </div>
              </RevealDiv>

              {/* Mosaic grid */}
              <RevealDiv delay={0.14} style={S.mosaic} className="wg-mosaic">
                {d.userImages.map((src, i) => (
                  <ImgTile
                    key={i}
                    src={src}
                    alt={`${d.label} gallery ${i + 1}`}
                    imgStyle={S.mosaicImg}
                    onClick={() => setLightbox(src)}
                    onError={() => handleImgError(`${key}-m-${i}`)}
                    errored={imgErrors[`${key}-m-${i}`]}
                  />
                ))}
              </RevealDiv>

              {/* Feature badges */}
              <RevealDiv delay={0.18} style={S.badges} className="wg-badges">
                {features.map((f) => (
                  <span key={f} style={S.badge}>{f}</span>
                ))}
              </RevealDiv>
            </section>
          );
        })}

        {/* Footer */}
        <footer style={S.footer}>
          <p style={S.footerText}>
            Every great day starts with the{" "}
            <span style={S.footerAccent}>right space</span>.
          </p>
        </footer>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={S.lightboxBg} onClick={() => setLightbox(null)}>
          <button
            style={S.lightboxClose}
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <img
            src={lightbox}
            alt="Full view"
            style={S.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   ImgTile — handles hover + error fallback
══════════════════════════════════════════════════════════════ */
function ImgTile({ src, alt, imgStyle, className = "", onClick, onError, errored }) {
  const [hovered, setHovered] = useState(false);

  if (errored) {
    return <div style={{ ...S.fallback }}>{alt}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`wg-img ${className}`}
      style={{
        ...imgStyle,
        ...(hovered ? { transform: "scale(1.009)", filter: "brightness(1)" } : {}),
      }}
      onClick={onClick}
      onError={onError}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      loading="lazy"
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   RevealDiv — scroll-triggered fade-up
══════════════════════════════════════════════════════════════ */
function RevealDiv({ children, className = "", delay = 0, style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`wg-reveal${visible ? " visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
}