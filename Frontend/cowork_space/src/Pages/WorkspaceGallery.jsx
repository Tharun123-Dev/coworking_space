import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */
const CATEGORY_DATA = {
  coworking: {
    label: "Coworking Spaces",
    accent: "#C8A96E",
    accentRgb: "200,169,110",
    tagline: "Where Ideas Meet Community",
    description: "Flexible desks and vibrant open floors built for collaboration and creativity.",
    images: [
      { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=90", caption: "Open Collaboration Floor" },
      { src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=85", caption: "Hot Desk Zone" },
      { src: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=900&q=85", caption: "Lounge Area" },
      { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&q=85", caption: "Creative Hub" },
      { src: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=900&q=85", caption: "Focus Pods" },
      { src: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=900&q=85", caption: "Rooftop Terrace" },
      { src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=85", caption: "Breakout Nook" },
      { src: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=900&q=85", caption: "Community Kitchen" },
      { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=90", caption: "Phone Booths" },
      { src: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=900&q=85", caption: "Event Space" },
      { src: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=900&q=85", caption: "Studio Wing" },
      { src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=85", caption: "Atrium" },
    ],
  },
  office: {
    label: "Office Spaces",
    accent: "#6E9EC8",
    accentRgb: "110,158,200",
    tagline: "Your Brand. Your Territory.",
    description: "Dedicated private offices ready to move in with premium finishes.",
    images: [
      { src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=90", caption: "Executive Suite" },
      { src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&q=85", caption: "Private Office" },
      { src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&q=85", caption: "Team Room" },
      { src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&q=85", caption: "Corner Office" },
      { src: "https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?w=900&q=85", caption: "Director Suite" },
      { src: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=900&q=85", caption: "Standing Desks" },
      { src: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=900&q=85", caption: "Reception Area" },
      { src: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=900&q=85", caption: "Server Room" },
      { src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&q=85", caption: "Mail Room" },
      { src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=85", caption: "Tech Zone" },
      { src: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=900&q=85", caption: "Break Room" },
      { src: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=900&q=85", caption: "Open Plan" },
    ],
  },
  meeting: {
    label: "Meeting Rooms",
    accent: "#8EC86E",
    accentRgb: "142,200,110",
    tagline: "Decisions Made Here.",
    description: "AV-equipped rooms for pitches, workshops and high-stakes meetings.",
    images: [
      { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=90", caption: "Boardroom Premier" },
      { src: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=900&q=85", caption: "Roundtable Room" },
      { src: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=900&q=85", caption: "Pitch Room" },
      { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&q=85", caption: "Video Suite" },
      { src: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&q=85", caption: "Workshop Space" },
      { src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=85", caption: "Brainstorm Lab" },
      { src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=85", caption: "Tech Briefing" },
      { src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=85", caption: "Client Suite" },
      { src: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=900&q=85", caption: "Training Room" },
      { src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&q=85", caption: "All-Hands Space" },
      { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&q=85", caption: "Strategy Room" },
      { src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=85", caption: "Innovation Lab" },
    ],
  },
  enterprise: {
    label: "Enterprise Floors",
    accent: "#C86E8E",
    accentRgb: "200,110,142",
    tagline: "Scale Without Limits.",
    description: "Full floors custom-fitted for enterprise teams with VIP amenities.",
    images: [
      { src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=90", caption: "Headquarters Floor" },
      { src: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=900&q=85", caption: "Open Plan Floor" },
      { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=85", caption: "VIP Lounge" },
      { src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&q=85", caption: "Executive Floor" },
      { src: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=900&q=85", caption: "Innovation Hub" },
      { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&q=85", caption: "Strategy War Room" },
      { src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=85", caption: "Dev Floor" },
      { src: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=900&q=85", caption: "Wellness Zone" },
      { src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=85", caption: "Collaboration Pods" },
      { src: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=900&q=85", caption: "Rooftop Terrace" },
      { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=85", caption: "Boardroom" },
      { src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=85", caption: "Client Experience" },
    ],
  },
};

const ALL_SECTIONS = ["coworking", "office", "meeting", "enterprise"];

const FEATURES = {
  coworking: ["High-Speed WiFi", "24/7 Access", "Community Events", "Printing", "Lockers", "Café On-Site"],
  office: ["Dedicated Desk", "Reception", "Security", "Mail Handling", "Parking", "CCTV"],
  meeting: ["AV Equipment", "Video Conferencing", "Hourly Booking", "Catering", "Whiteboard", "Soundproofed"],
  enterprise: ["Full Floor", "Custom Fit-Out", "VIP Lounge", "Dedicated IT", "Concierge", "Private Lift"],
};

const STATS = {
  coworking: [{ n: "2,400+", l: "Members" }, { n: "6", l: "Locations" }, { n: "98%", l: "Satisfaction" }],
  office: [{ n: "380+", l: "Offices" }, { n: "99%", l: "Uptime" }, { n: "12K+", l: "sqft" }],
  meeting: [{ n: "120+", l: "Rooms" }, { n: "1 hr", l: "Min Booking" }, { n: "500+", l: "Bookings/Mo" }],
  enterprise: [{ n: "50+", l: "Clients" }, { n: "10K+", l: "sqft" }, { n: "24/7", l: "Support" }],
};

const BOOK_LABELS = {
  coworking: "Book a Desk →",
  office: "Book Office →",
  meeting: "Book Room →",
  enterprise: "Enquire →",
};

/* ══════════════════════════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .wg-root {
    background: #0C0C0B;
    color: #E8E4DC;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Nav pills ── */
  .wg-pills {
    position: sticky;
    top: 0;
    z-index: 200;
    background: rgba(12,12,11,0.97);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    padding: 0 clamp(0.75rem, 3vw, 3.5rem);
  }
  .wg-pills::-webkit-scrollbar { display: none; }

  .wg-pill {
    flex-shrink: 0;
    padding: 1.05rem 1.4rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.73rem;
    font-weight: 500;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: rgba(232,228,220,0.4);
    cursor: pointer;
    border: none;
    background: transparent;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: color 0.22s, border-color 0.22s;
  }
  .wg-pill.active {
    color: #E8E4DC;
    border-bottom-color: var(--pill-accent, #C8A96E);
  }
  .wg-pill:hover { color: rgba(232,228,220,0.82); }

  /* ── Buttons ── */
  .wg-btn {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    color: #E8E4DC;
    padding: 0.68rem 1.2rem;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: background 0.25s, transform 0.25s, box-shadow 0.25s;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    white-space: nowrap;
    text-decoration: none;
    flex-shrink: 0;
  }
  .wg-btn:hover {
    background: rgba(255,255,255,0.16);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  .wg-btn.accent {
    background: rgba(var(--btn-rgb, 200,169,110), 0.14);
    border-color: rgba(var(--btn-rgb, 200,169,110), 0.5);
    color: var(--btn-color, #C8A96E);
  }
  .wg-btn.accent:hover {
    background: rgba(var(--btn-rgb, 200,169,110), 0.24);
  }

  /* ── Section ── */
  .wg-section {
    padding: 0;
    margin: 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  /* ── Section header ── */
  .wg-section-header {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 1.5rem;
    padding: clamp(1.75rem, 3.5vw, 3.5rem) clamp(1rem, 3vw, 3rem) clamp(1rem, 2vw, 2rem);
  }
  .wg-eyebrow {
    display: block;
    font-size: 0.66rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--sec-accent, #C8A96E);
    margin-bottom: 0.35rem;
  }
  .wg-section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4.2vw, 3.7rem);
    font-weight: 300;
    line-height: 1.07;
    color: #E8E4DC;
  }
  .wg-section-title em {
    font-style: italic;
    color: var(--sec-accent, #C8A96E);
  }
  .wg-section-desc {
    font-size: 0.87rem;
    line-height: 1.74;
    color: rgba(232,228,220,0.5);
    max-width: 44ch;
    margin-top: 0.45rem;
  }
  .wg-right-col {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
  }
  .wg-btn-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }
  .wg-stats-row {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .wg-stat-n {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.9rem;
    font-weight: 600;
    color: var(--sec-accent, #C8A96E);
    line-height: 1;
  }
  .wg-stat-l {
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(232,228,220,0.35);
    margin-top: 0.12rem;
  }

  /* ══════════════════════════════════════
     GALLERY — True masonry, zero gaps
  ══════════════════════════════════════ */
  .wg-gallery {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  /* Each row is a flex row with no gap except the 3px between tiles */
  .wg-row {
    display: flex;
    gap: 3px;
    width: 100%;
  }

  /* Tile base */
  .wg-tile {
    position: relative;
    overflow: hidden;
    cursor: zoom-in;
    background: #1a1a18;
    flex-shrink: 0;
  }
  /* All images fill their tile completely — no black bars */
  .wg-tile img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: brightness(0.82);
    transition: filter 0.4s ease, transform 0.45s ease;
    will-change: transform;
  }
  .wg-tile:hover img {
    filter: brightness(1.0);
    transform: scale(1.05);
  }
  .wg-tile .wg-caption {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0.6rem 0.75rem 0.5rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.78));
    font-size: 0.57rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.75);
    opacity: 0;
    transform: translateY(5px);
    transition: opacity 0.25s, transform 0.25s;
    pointer-events: none;
  }
  .wg-tile:hover .wg-caption {
    opacity: 1;
    transform: translateY(0);
  }
  .wg-tile .wg-zoom {
    position: absolute;
    top: 8px; right: 8px;
    width: 24px; height: 24px;
    border-radius: 50%;
    background: rgba(255,255,255,0.9);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: #111;
    opacity: 0;
    transform: scale(0.5);
    transition: opacity 0.22s, transform 0.22s;
    pointer-events: none;
  }
  .wg-tile:hover .wg-zoom {
    opacity: 1; transform: scale(1);
  }
  /* Aspect-ratio wrapper inside each tile for correct height */
  .wg-tile-inner {
    width: 100%;
    height: 100%;
  }

  /* ── VIEW MORE tile ── */
  .wg-view-more-tile {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    background: #111110;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background 0.3s;
  }
  .wg-view-more-tile:hover {
    background: #1a1918;
  }
  .wg-view-more-tile .vm-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 2px;
    width: 72%;
    height: 60%;
    opacity: 0.28;
    transition: opacity 0.3s;
    overflow: hidden;
    border-radius: 3px;
  }
  .wg-view-more-tile:hover .vm-grid { opacity: 0.45; }
  .wg-view-more-tile .vm-grid img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  .wg-view-more-tile .vm-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--sec-accent, #C8A96E);
    text-align: center;
    line-height: 1.5;
  }
  .wg-view-more-tile .vm-count {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem;
    font-weight: 300;
    color: rgba(232,228,220,0.55);
    line-height: 1;
  }
  .wg-view-more-tile .vm-arrow {
    width: 32px; height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(var(--sec-rgb, 200,169,110), 0.45);
    display: flex; align-items: center; justify-content: center;
    color: var(--sec-accent, #C8A96E);
    font-size: 1rem;
    margin-top: 0.2rem;
    transition: background 0.25s, border-color 0.25s;
  }
  .wg-view-more-tile:hover .vm-arrow {
    background: rgba(var(--sec-rgb, 200,169,110), 0.15);
    border-color: rgba(var(--sec-rgb, 200,169,110), 0.7);
  }

  /* ── Badges ── */
  .wg-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    padding: clamp(0.75rem, 1.5vw, 1.25rem) clamp(1rem, 3vw, 3rem) clamp(1.25rem, 2.5vw, 2rem);
  }
  .wg-badge {
    font-size: 0.63rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    padding: 5px 14px;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 100px;
    color: rgba(232,228,220,0.5);
    background: rgba(255,255,255,0.025);
  }

  /* ── Reveal animation ── */
  .wg-reveal {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.55s ease, transform 0.55s ease;
  }
  .wg-reveal.visible { opacity: 1; transform: translateY(0); }

  /* ══════════════════════════════════════
     LIGHTBOX
  ══════════════════════════════════════ */
  .wg-lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(6,6,5,0.97);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3.5rem 4rem;
    cursor: zoom-out;
    animation: lbFadeIn 0.2s ease;
  }
  @keyframes lbFadeIn { from { opacity: 0 } to { opacity: 1 } }

  .wg-lightbox img {
    max-width: min(90vw, 1400px);
    max-height: 82vh;
    object-fit: contain;
    border-radius: 3px;
    cursor: default;
    animation: lbImgIn 0.22s ease;
  }
  @keyframes lbImgIn { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }

  .wg-lightbox-close {
    position: absolute;
    top: 1.2rem; right: 1.8rem;
    font-size: 2rem;
    color: rgba(255,255,255,0.38);
    cursor: pointer;
    background: none;
    border: none;
    line-height: 1;
    transition: color 0.2s;
    padding: 0.2rem;
  }
  .wg-lightbox-close:hover { color: #fff; }

  .wg-lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.18);
    color: rgba(255,255,255,0.6);
    width: 46px; height: 46px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.3rem;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.22s, color 0.22s;
    flex-shrink: 0;
  }
  .wg-lightbox-nav:hover { background: rgba(255,255,255,0.18); color: #fff; }
  .wg-lightbox-prev { left: 1.2rem; }
  .wg-lightbox-next { right: 1.2rem; }

  .wg-lightbox-footer {
    position: absolute;
    bottom: 1.25rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 1rem;
    white-space: nowrap;
  }
  .wg-lightbox-caption {
    font-size: 0.65rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
  }
  .wg-lightbox-dots {
    display: flex;
    gap: 5px;
  }
  .wg-lightbox-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    transition: background 0.2s, transform 0.2s;
    cursor: pointer;
  }
  .wg-lightbox-dot.active {
    background: rgba(255,255,255,0.75);
    transform: scale(1.3);
  }

  /* ══════════════════════════════════════
     MODAL GALLERY (View More)
  ══════════════════════════════════════ */
  .wg-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 8888;
    background: rgba(6,6,5,0.98);
    overflow-y: auto;
    overscroll-behavior: contain;
    animation: lbFadeIn 0.25s ease;
    padding-bottom: 4rem;
  }
  .wg-modal-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(10,10,9,0.95);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem clamp(1rem, 3vw, 3rem);
    gap: 1rem;
  }
  .wg-modal-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 300;
    color: #E8E4DC;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .wg-modal-title em {
    font-style: italic;
    color: var(--sec-accent, #C8A96E);
  }
  .wg-modal-close {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.15);
    color: rgba(232,228,220,0.6);
    width: 38px; height: 38px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background 0.22s, color 0.22s;
  }
  .wg-modal-close:hover { background: rgba(255,255,255,0.16); color: #fff; }

  /* Modal masonry grid */
  .wg-modal-grid {
    padding: 3px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
  }
  .wg-modal-tile {
    position: relative;
    overflow: hidden;
    cursor: zoom-in;
    background: #1a1a18;
    aspect-ratio: 4/3;
  }
  /* Span some tiles for visual interest */
  .wg-modal-tile.wide { grid-column: span 2; aspect-ratio: 16/7; }
  .wg-modal-tile.tall { grid-row: span 2; aspect-ratio: unset; }
  .wg-modal-tile.tall .wg-modal-inner { padding-top: 0; height: 100%; min-height: 360px; }
  .wg-modal-inner {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .wg-modal-tile img {
    position: absolute;
    inset: 0; width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    filter: brightness(0.8);
    transition: filter 0.38s, transform 0.42s;
  }
  .wg-modal-tile:hover img { filter: brightness(1); transform: scale(1.04); }
  .wg-modal-cap {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0.55rem 0.7rem 0.45rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    font-size: 0.57rem;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.22s, transform 0.22s;
    pointer-events: none;
  }
  .wg-modal-tile:hover .wg-modal-cap { opacity: 1; transform: translateY(0); }
  .wg-modal-num {
    position: absolute;
    top: 8px; left: 10px;
    font-size: 0.55rem;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.3);
    font-family: 'DM Sans', sans-serif;
    pointer-events: none;
  }

  /* ── Footer ── */
  .wg-footer {
    padding: 2.5rem clamp(1rem, 3vw, 3rem);
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.04);
  }
  .wg-footer-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.5rem, 3.2vw, 2.7rem);
    font-weight: 300;
    color: rgba(232,228,220,0.3);
  }
  .wg-footer-accent { color: #C8A96E; }

  /* ══════════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════════ */
  @media (max-width: 860px) {
    .wg-section-header {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .wg-right-col {
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .wg-stats-row { justify-content: flex-start; }
    .wg-modal-grid { grid-template-columns: repeat(2, 1fr); }
    .wg-modal-tile.wide { grid-column: span 2; }
    .wg-modal-tile.tall { grid-row: auto; }
    .wg-modal-tile.tall .wg-modal-inner { min-height: 200px; height: auto; }
  }

  @media (max-width: 640px) {
    .wg-section-header { padding: 1.5rem 0.9rem 1rem; }
    .wg-badges { padding: 0.65rem 0.9rem 1.25rem; }
    .wg-section-title { font-size: clamp(1.7rem, 7vw, 2.6rem) !important; }
    .wg-lightbox { padding: 2.5rem 0.5rem; }
    .wg-lightbox-nav { width: 36px; height: 36px; font-size: 1rem; }
    .wg-lightbox-prev { left: 0.4rem; }
    .wg-lightbox-next { right: 0.4rem; }
    .wg-modal-grid { grid-template-columns: repeat(2, 1fr); gap: 2px; padding: 2px; }
    .wg-modal-tile.wide { grid-column: span 2; }
    .wg-modal-tile.tall { grid-row: auto; aspect-ratio: 4/3; }
    .wg-modal-tile.tall .wg-modal-inner { min-height: unset; height: 100%; }
  }

  @media (max-width: 400px) {
    .wg-modal-grid { grid-template-columns: 1fr; }
    .wg-modal-tile.wide { grid-column: span 1; }
    .wg-modal-tile { aspect-ratio: 4/3 !important; }
  }
`;

/* ══════════════════════════════════════════════════════════════
   GALLERY ROW CONFIGS
   Each row: array of { imgIdx, flex, aspect }
   flex = flex-grow weight, aspect = CSS aspect-ratio for height
══════════════════════════════════════════════════════════════ */
const ROW_CONFIG = [
  // Row 0: hero wide + portrait — fills full width perfectly
  [{ imgIdx: 0, flex: 3, aspect: "16/9" }, { imgIdx: 1, flex: 1, aspect: "3/4" }],
  // Row 1: three equal landscape
  [{ imgIdx: 2, flex: 1, aspect: "4/3" }, { imgIdx: 3, flex: 1, aspect: "4/3" }, { imgIdx: 4, flex: 1, aspect: "4/3" }],
  // Row 2: two — wide + narrower
  [{ imgIdx: 5, flex: 5, aspect: "16/8" }, { imgIdx: 6, flex: 3, aspect: "4/3" }],
  // Row 3: four equal square
  [{ imgIdx: 7, flex: 1, aspect: "1/1" }, { imgIdx: 8, flex: 1, aspect: "1/1" }, { imgIdx: 9, flex: 1, aspect: "1/1" }, "viewmore"],
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function WorkspaceGallery() {
  const { type } = useParams();
  const navigate = useNavigate();
  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState(type || ALL_SECTIONS[0]);
  const [lightbox, setLightbox] = useState(null);
  const [modal, setModal] = useState(null); // key of open "view more" modal
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
        { threshold: 0.15 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (lightbox) {
        if (e.key === "Escape") setLightbox(null);
        if (e.key === "ArrowRight") setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lb.images.length }));
        if (e.key === "ArrowLeft") setLightbox(lb => ({ ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }));
      } else if (modal) {
        if (e.key === "Escape") setModal(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, modal]);

  // Lock body scroll when overlay open
  useEffect(() => {
    if (lightbox || modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightbox, modal]);

  const handleImgError = useCallback((key) => {
    setImgErrors((prev) => ({ ...prev, [key]: true }));
  }, []);

  const scrollTo = (key) => {
    setActiveSection(key);
    navigate(`/gallery/${key}`, { replace: true });
    const el = sectionRefs.current[key];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openLightbox = (images, index) => setLightbox({ images, index });

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="wg-root">

        {/* ── Sticky Nav Pills ── */}
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

        {/* ── Sections ── */}
        {ALL_SECTIONS.map((key) => {
          const d = CATEGORY_DATA[key];
          const imgs = d.images;
          const stats = STATS[key];
          const features = FEATURES[key];

          return (
            <section
              key={key}
              ref={(el) => (sectionRefs.current[key] = el)}
              className="wg-section"
              style={{ "--sec-accent": d.accent, "--sec-rgb": d.accentRgb }}
            >
              {/* Header */}
              <RevealDiv className="wg-section-header">
                <div>
                  <span className="wg-eyebrow">WorkNest · {d.label}</span>
                  <h2 className="wg-section-title">
                    {d.tagline.split(" ").map((w, i) =>
                      i === 0 ? <em key={i}>{w} </em> : w + " "
                    )}
                  </h2>
                  <p className="wg-section-desc">{d.description}</p>
                </div>
                <div className="wg-right-col">
                  <div className="wg-btn-group">
                    <button className="wg-btn" onClick={scrollToCompanies}>← Companies</button>
                    <button
                      className="wg-btn accent"
                      style={{ "--btn-color": d.accent, "--btn-rgb": d.accentRgb }}
                      onClick={goToHomePage}
                    >
                      {BOOK_LABELS[key]}
                    </button>
                  </div>
                  <div className="wg-stats-row">
                    {stats.map((s) => (
                      <div key={s.l}>
                        <div className="wg-stat-n">{s.n}</div>
                        <div className="wg-stat-l">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealDiv>

              {/* Gallery */}
              <RevealDiv delay={0.06}>
                <div className="wg-gallery">
                  {ROW_CONFIG.map((rowCells, rowIdx) => (
                    <div className="wg-row" key={rowIdx}>
                      {rowCells.map((cell, cellIdx) => {
                        if (cell === "viewmore") {
                          return (
                            <ViewMoreTile
                              key="vm"
                              images={imgs}
                              count={imgs.length}
                              accent={d.accent}
                              accentRgb={d.accentRgb}
                              onClick={() => setModal(key)}
                            />
                          );
                        }
                        const { imgIdx, flex, aspect } = cell;
                        const img = imgs[imgIdx];
                        if (!img) return null;
                        const errKey = `${key}-${imgIdx}`;
                        return (
                          <GalleryTile
                            key={cellIdx}
                            src={img.src}
                            caption={img.caption}
                            flex={flex}
                            aspect={aspect}
                            errored={imgErrors[errKey]}
                            onError={() => handleImgError(errKey)}
                            onClick={() => openLightbox(imgs, imgIdx)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </RevealDiv>

              {/* Feature Badges */}
              <RevealDiv delay={0.1} className="wg-badges">
                {features.map((f) => (
                  <span key={f} className="wg-badge">{f}</span>
                ))}
              </RevealDiv>
            </section>
          );
        })}

        {/* Footer */}
        <footer className="wg-footer">
          <p className="wg-footer-text">
            Every great day starts with the{" "}
            <span className="wg-footer-accent">right space</span>.
          </p>
        </footer>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="wg-lightbox" onClick={() => setLightbox(null)}>
          <button className="wg-lightbox-close" onClick={() => setLightbox(null)}>×</button>
          <button
            className="wg-lightbox-nav wg-lightbox-prev"
            onClick={(e) => { e.stopPropagation(); setLightbox(lb => ({ ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length })); }}
          >‹</button>
          <img
            key={lightbox.index}
            src={lightbox.images[lightbox.index].src}
            alt={lightbox.images[lightbox.index].caption}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="wg-lightbox-nav wg-lightbox-next"
            onClick={(e) => { e.stopPropagation(); setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lb.images.length })); }}
          >›</button>
          <div className="wg-lightbox-footer">
            <span className="wg-lightbox-caption">
              {lightbox.images[lightbox.index].caption} · {lightbox.index + 1}/{lightbox.images.length}
            </span>
            <div className="wg-lightbox-dots">
              {lightbox.images.slice(0, 12).map((_, i) => (
                <div
                  key={i}
                  className={`wg-lightbox-dot${i === lightbox.index ? " active" : ""}`}
                  onClick={(e) => { e.stopPropagation(); setLightbox(lb => ({ ...lb, index: i })); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── View More Modal ── */}
      {modal && (
        <ModalGallery
          categoryKey={modal}
          data={CATEGORY_DATA[modal]}
          onClose={() => setModal(null)}
          onOpenLightbox={(imgs, idx) => { setModal(null); setTimeout(() => openLightbox(imgs, idx), 50); }}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   GalleryTile — individual image tile in main grid
══════════════════════════════════════════════════════════════ */
function GalleryTile({ src, caption, flex, aspect, errored, onError, onClick }) {
  const style = {
    flex: flex,
    aspectRatio: aspect,
    minWidth: 0,
  };

  if (errored) {
    return (
      <div className="wg-tile" style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {caption}
        </span>
      </div>
    );
  }

  return (
    <div className="wg-tile" style={style} onClick={onClick}>
      <img src={src} alt={caption} loading="lazy" onError={onError} />
      {caption && <div className="wg-caption">{caption}</div>}
      <div className="wg-zoom">⤢</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ViewMoreTile — the "View More" tile at end of gallery
══════════════════════════════════════════════════════════════ */
function ViewMoreTile({ images, count, accent, accentRgb, onClick }) {
  // Show 4 preview thumbnails in the tile background grid
  const previews = images.slice(images.length - 4);

  return (
    <div
      className="wg-view-more-tile"
      style={{ flex: 1, aspectRatio: "1/1", "--sec-accent": accent, "--sec-rgb": accentRgb, minWidth: 0 }}
      onClick={onClick}
    >
      <div className="vm-grid">
        {previews.map((img, i) => (
          <img key={i} src={img.src} alt="" loading="lazy" />
        ))}
      </div>
      <div className="vm-count">+{count}</div>
      <div className="vm-label">View All Photos</div>
      <div className="vm-arrow">→</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ModalGallery — full-screen "View More" overlay
══════════════════════════════════════════════════════════════ */
function ModalGallery({ categoryKey, data, onClose, onOpenLightbox }) {
  const imgs = data.images;

  // Assign layout variants to modal tiles for visual rhythm
  // Pattern: wide, normal, normal, tall+normal, wide, normal, normal...
  const getVariant = (i) => {
    const patterns = [
      "wide", "normal", "normal",
      "tall", "normal", "normal",
      "normal", "wide", "normal",
      "normal", "normal", "normal",
    ];
    return patterns[i % patterns.length] || "normal";
  };

  return (
    <div className="wg-modal-overlay" onClick={onClose}>
      <div className="wg-modal-header" onClick={(e) => e.stopPropagation()}>
        <div className="wg-modal-title" style={{ "--sec-accent": data.accent }}>
          <em>{data.label}</em> — Full Gallery
        </div>
        <button className="wg-modal-close" onClick={onClose}>×</button>
      </div>

      <div
        className="wg-modal-grid"
        style={{ "--sec-accent": data.accent }}
        onClick={(e) => e.stopPropagation()}
      >
        {imgs.map((img, i) => {
          const variant = getVariant(i);
          return (
            <div
              key={i}
              className={`wg-modal-tile${variant === "wide" ? " wide" : variant === "tall" ? " tall" : ""}`}
              onClick={() => onOpenLightbox(imgs, i)}
            >
              <div className="wg-modal-inner">
                <img src={img.src} alt={img.caption} loading="lazy" />
                <div className="wg-modal-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="wg-modal-cap">{img.caption}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.04 }
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
