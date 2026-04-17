import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ── Reduced gallery data for your actual website ─────────────────────
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

export default function WorkspaceGallery() {
  const { type } = useParams();
  const navigate = useNavigate();
  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState(type || ALL_SECTIONS[0]);
  const [lightbox, setLightbox] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  // Scroll to section + navigate to companies section
  const scrollToCompanies = () => {
    navigate("/"); // Go to home page
    setTimeout(() => {
      const companiesSection = document.getElementById("workspace-clients-section");
      if (companiesSection) {
        companiesSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
  };

  // Navigate to specific workspace tabs
  const navigateToWorkspace = (path) => {
    navigate(path);
  };

  // Scroll to the section matching the route param
  useEffect(() => {
    const target = type || ALL_SECTIONS[0];
    setActiveSection(target);
    const el = sectionRefs.current[target];
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [type]);

  // Intersection observer to update active pill
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

  const handleImgError = (key) => setImgErrors((prev) => ({ ...prev, [key]: true }));

  const scrollTo = (key) => {
    setActiveSection(key);
    navigate(`/gallery/${key}`, { replace: true });
    const el = sectionRefs.current[key];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wg-root {
          background: #0C0C0B;
          color: #E8E4DC;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── Sticky nav pills ── */
        .wg-pills {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(12,12,11,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          gap: 0;
          padding: 0 clamp(1rem,4vw,4rem);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .wg-pills::-webkit-scrollbar { display: none; }

        .wg-pill {
          flex-shrink: 0;
          padding: 1.1rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.45);
          cursor: pointer;
          border: none;
          background: transparent;
          border-bottom: 2px solid transparent;
          transition: color 0.25s, border-color 0.25s;
          white-space: nowrap;
        }
        .wg-pill.active {
          color: #E8E4DC;
          border-bottom-color: var(--pill-accent, #C8A96E);
        }
        .wg-pill:hover { color: rgba(232,228,220,0.8); }

        /* ── Arrow Navigation Button ── */
        .wg-nav-arrow {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: #E8E4DC;
          padding: 0.8rem 1.2rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .wg-nav-arrow:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        /* ── Section wrapper ── */
        .wg-section {
          padding: clamp(4rem,8vw,8rem) clamp(1rem,5vw,5rem);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        /* ── Section header with arrow ── */
        .wg-section-header {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          gap: 2rem;
          margin-bottom: 3.5rem;
        }
        @media (max-width: 768px) {
          .wg-section-header { grid-template-columns: 1fr; gap: 1.5rem; }
        }

        .wg-eyebrow {
          font-size: 0.72rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--sec-accent, #C8A96E);
          margin-bottom: 0.75rem;
        }
        .wg-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.4rem, 5vw, 4.2rem);
          font-weight: 300;
          line-height: 1.1;
          color: #E8E4DC;
          margin-bottom: 1rem;
        }
        .wg-section-title em {
          font-style: italic;
          color: var(--sec-accent, #C8A96E);
        }
        .wg-section-desc {
          font-size: 0.95rem;
          line-height: 1.75;
          color: rgba(232,228,220,0.55);
          max-width: 44ch;
          margin-top: 1.25rem;
        }

        /* ── Stats row ── */
        .wg-stats {
          display: flex;
          gap: 2.5rem;
          margin-bottom: 4rem;
          flex-wrap: wrap;
        }
        .wg-stat-n {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          font-weight: 600;
          color: var(--sec-accent, #C8A96E);
          line-height: 1;
        }
        .wg-stat-l {
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.4);
          margin-top: 0.3rem;
        }

        /* ── Hero + side strip layout ── */
        .wg-hero-row {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 12px;
          margin-bottom: 12px;
        }
        @media (max-width: 900px) {
          .wg-hero-row { grid-template-columns: 1fr; }
        }
        .wg-hero-img, .wg-side-img, .wg-mosaic-img {
          width: 100%;
          object-fit: cover;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.4s ease, filter 0.4s ease;
          filter: brightness(0.88);
        }
        .wg-hero-img {
          aspect-ratio: 16/9;
        }
        .wg-side-img {
          height: calc(50% - 6px);
        }
        .wg-hero-img:hover, .wg-side-img:hover, .wg-mosaic-img:hover { 
          transform: scale(1.008); 
          filter: brightness(1); 
        }

        .wg-side-strip {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ── Simplified mosaic grid ── */
        .wg-mosaic {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (max-width: 700px) { 
          .wg-mosaic { grid-template-columns: 1fr; } 
        }
        .wg-mosaic-img {
          aspect-ratio: 4/3;
        }

        /* ── Feature badges ── */
        .wg-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 3rem;
        }
        .wg-badge {
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 14px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          color: rgba(232,228,220,0.6);
          background: rgba(255,255,255,0.03);
        }

        /* ── Lightbox ── */
        .wg-lightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0,0,0,0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          cursor: zoom-out;
        }
        .wg-lightbox img {
          max-width: min(90vw, 1400px);
          max-height: 85vh;
          object-fit: contain;
          border-radius: 4px;
        }
        .wg-lightbox-close {
          position: absolute;
          top: 1.5rem;
          right: 2rem;
          font-size: 2rem;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          background: none;
          border: none;
        }
        .wg-lightbox-close:hover { color: #fff; }

        /* ── Fallback & Reveal classes ── */
        .wg-img-fallback {
          width: 100%;
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: rgba(255,255,255,0.15);
          font-size: 0.75rem;
          aspect-ratio: 4/3;
        }
        .wg-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .wg-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className="wg-root">
        {/* ── Sticky pill nav ── */}
        <nav className="wg-pills">
          {ALL_SECTIONS.map((key) => {
            const d = CATEGORY_DATA[key];
            return (
              <button
                key={key}
                className={`wg-pill${activeSection === key ? " active" : ""}`}
                style={{ "--pill-accent": d.accent }}
                onClick={() => scrollTo(key)}
              >
                {d.label}
              </button>
            );
          })}
        </nav>

        {/* ── Render each section ── */}
        {ALL_SECTIONS.map((key) => {
          const d = CATEGORY_DATA[key];
          const stats = STATS[key];
          const features = FEATURES[key];
          const allImages = [d.hero, ...d.grid, ...d.userImages];

          return (
            <section
              key={key}
              ref={(el) => (sectionRefs.current[key] = el)}
              className="wg-section"
              style={{ "--sec-accent": d.accent }}
            >
              {/* Header with ARROW BUTTON */}
              <RevealDiv className="wg-section-header">
                <div>
                  <p className="wg-eyebrow">WorkNest · {d.label}</p>
                  <h2 className="wg-section-title">
                    {d.tagline.split(" ").map((w, i) =>
                      i === 0 ? <em key={i}>{w} </em> : w + " "
                    )}
                  </h2>
                  <p className="wg-section-desc">{d.description}</p>
                </div>
                
                {/* 🟢 ARROW NAVIGATION BUTTONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button 
                    className="wg-nav-arrow" 
                    onClick={scrollToCompanies}
                    style={{ background: 'linear-gradient(135deg, var(--sec-accent), transparent)' }}
                  >
                    ← Companies
                  </button>
                  
                  {/* Specific workspace navigation */}
                  {key === 'office' && (
                    <button 
                      className="wg-nav-arrow" 
                      onClick={() => navigateToWorkspace("/workspaces/office")}
                      style={{ background: 'linear-gradient(135deg, var(--sec-accent), transparent)' }}
                    >
                      Book Office →
                    </button>
                  )}
                  {key === 'coworking' && (
                    <button 
                      className="wg-nav-arrow" 
                      onClick={() => navigateToWorkspace("/workspaces/coworking")}
                      style={{ background: 'linear-gradient(135deg, var(--sec-accent), transparent)' }}
                    >
                      Book Coworking →
                    </button>
                  )}
                  {key === 'meeting' && (
                    <button 
                      className="wg-nav-arrow" 
                      onClick={() => navigateToWorkspace("/workspaces/meeting")}
                      style={{ background: 'linear-gradient(135deg, var(--sec-accent), transparent)' }}
                    >
                      Book Meeting →
                    </button>
                  )}
                  {key === 'enterprise' && (
                    <button 
                      className="wg-nav-arrow" 
                      onClick={() => navigateToWorkspace("/Enterprise")}
                      style={{ background: 'linear-gradient(135deg, var(--sec-accent), transparent)' }}
                    >
                      Enterprise →
                    </button>
                  )}
                  
                  <div className="wg-stats">
                    {stats.map((s) => (
                      <div key={s.l}>
                        <div className="wg-stat-n">{s.n}</div>
                        <div className="wg-stat-l">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealDiv>

              {/* Hero row */}
              <RevealDiv delay={0.1}>
                <div className="wg-hero-row">
                  <ImgTile
                    src={d.hero}
                    alt={`${d.label} hero`}
                    className="wg-hero-img"
                    onClick={() => setLightbox(d.hero)}
                    onError={() => handleImgError(`${key}-hero`)}
                    errored={imgErrors[`${key}-hero`]}
                  />
                  <div className="wg-side-strip">
                    {d.grid.slice(0, 2).map((src, i) => (
                      <ImgTile
                        key={i}
                        src={src}
                        alt={`${d.label} ${i + 1}`}
                        className="wg-side-img"
                        onClick={() => setLightbox(src)}
                        onError={() => handleImgError(`${key}-side-${i}`)}
                        errored={imgErrors[`${key}-side-${i}`]}
                      />
                    ))}
                  </div>
                </div>
              </RevealDiv>

              {/* Simplified mosaic */}
              <RevealDiv delay={0.15} className="wg-mosaic">
                {[...d.grid.slice(2), ...d.userImages].map((src, i) => (
                  <ImgTile
                    key={i}
                    src={src}
                    alt={`${d.label} gallery ${i + 1}`}
                    className="wg-mosaic-img"
                    onClick={() => setLightbox(src)}
                    onError={() => handleImgError(`${key}-m-${i}`)}
                    errored={imgErrors[`${key}-m-${i}`]}
                  />
                ))}
              </RevealDiv>

              {/* Feature badges */}
              <RevealDiv delay={0.2} className="wg-badges">
                {features.map((f) => (
                  <span key={f} className="wg-badge">{f}</span>
                ))}
              </RevealDiv>
            </section>
          );
        })}

        {/* Footer */}
        <footer className="wg-footer" style={{ padding: '3rem clamp(1rem,5vw,5rem)' }}>
          <p style={{ 
            fontFamily: "'Cormorant Garamond', serif", 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            color: 'rgba(232,228,220,0.4)',
            textAlign: 'center'
          }}>
            Every great day starts with the <span style={{ color: '#C8A96E' }}>right space</span>.
          </p>
        </footer>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="wg-lightbox" onClick={() => setLightbox(null)}>
          <button className="wg-lightbox-close" onClick={() => setLightbox(null)}>×</button>
          <img src={lightbox} alt="Full view" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

// ── Helper Components (unchanged) ────────────────────────────────────
function ImgTile({ src, alt, className, onClick, onError, errored }) {
  if (errored) {
    return (
      <div className={`wg-img-fallback ${className}`}>
        {alt}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={onError}
      loading="lazy"
    />
  );
}

function RevealDiv({ children, className, delay = 0, style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`wg-reveal${visible ? " visible" : ""} ${className || ""}`}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
}