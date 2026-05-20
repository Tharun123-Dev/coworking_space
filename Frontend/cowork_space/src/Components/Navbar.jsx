import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WORKSPACE_TYPES = [
  { label: "Hot Desk",             icon: "⚡" },
  { label: "Dedicated Desk",       icon: "🖥️" },
  { label: "Private Office Space", icon: "🏢" },
  { label: "Private Cabin",        icon: "🔐" },
  { label: "Meeting Room",         icon: "🤝" },
  { label: "Board Room",           icon: "👔" },
  { label: "Event Space",          icon: "🎯" },
  { label: "Podcast Studio",       icon: "🎙️" },
  { label: "Virtual Office",       icon: "🌐" },
];

const LOCATIONS = [
  "Hitech City",
  "Madhapur",
  "Gachibowli",
  "Kondapur",
  "Financial District",
];

const CSS = `
:root {
  --nb-h: 66px;
  --nb-bg: rgba(7, 7, 10, 0.94);
  --nb-border: rgba(201, 162, 84, 0.16);
  --gold: #c9a254;
  --gold-lt: #e2be78;
  --gold-dim: rgba(201, 162, 84, 0.1);
  --gold-glow: rgba(221, 217, 208, 0.28);
  --tx: #f9f7f3;
  --tx-muted: #fcf2d6;
  --surface: rgba(16, 15, 21, 0.755);
  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 18px;
  --ease: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --font-d: 'Cormorant Garamond', Georgia, serif;
  --font-b: 'Outfit', 'Segoe UI', sans-serif;
}

.nb-navbar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 900;
  background: var(--nb-bg);
  backdrop-filter: blur(18px) saturate(1.5);
  -webkit-backdrop-filter: blur(18px) saturate(1.5);
  border-bottom: 1px solid var(--nb-border);
  font-family: var(--font-b);
}

.nb-goldLine {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, var(--gold) 25%, var(--gold-lt) 50%, var(--gold) 75%, transparent 100%);
  opacity: 0.65;
}

.nb-inner {
  max-width: 1380px;
  margin: 0 auto;
  height: var(--nb-h);
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 0;
}

.nb-spacer { flex: 1; }

.nb-logo {
  display: flex;
  align-items: baseline;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
  transition: opacity var(--ease);
}
.nb-logo:hover { opacity: 0.72; }

.nb-logoW {
  font-family: var(--font-d);
  font-size: 40px;
  font-weight: 700;
  color: var(--gold-lt);
  line-height: 1;
  letter-spacing: -1px;
}
.nb-logoRest {
  font-family: var(--font-d);
  font-size: 26px;
  font-weight: 500;
  color: var(--tx);
  letter-spacing: 0.4px;
}

.nb-nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nb-link {
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 13px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.35px;
  color: var(--tx-muted);
  cursor: pointer;
  border-radius: var(--r-sm);
  white-space: nowrap;
  transition: color var(--ease), background var(--ease);
  position: relative;
}
.nb-link::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 13px;
  right: 13px;
  height: 1px;
  background: var(--gold);
  transform: scaleX(0);
  transition: transform 0.24s ease;
}
.nb-link:hover { color: var(--gold-lt); background: var(--gold-dim); }
.nb-link:hover::after { transform: scaleX(1); }

.nb-linkDrop { padding-right: 11px; display: flex; align-items: center; gap: 6px; }
.nb-linkActive { color: var(--gold-lt); background: var(--gold-dim); }
.nb-linkActive::after { transform: scaleX(1); }

.nb-chevron { transition: transform var(--ease); flex-shrink: 0; }
.nb-chevUp  { transform: rotate(180deg); }

.nb-dropWrap { position: relative; display: inline-block; }

.nb-wsDrop {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  width: 520px;
  background: var(--surface);
  border: 1px solid var(--nb-border);
  border-radius: var(--r-lg);
  box-shadow: 0 24px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(201,162,84,0.12);
  overflow: hidden;
  animation: nb-fadeDown 0.18s ease;
  z-index: 500;
}

.nb-wsDropHead {
  padding: 14px 18px 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--gold);
  border-bottom: 1px solid var(--nb-border);
  background: linear-gradient(90deg, rgba(201,162,84,0.06), transparent);
}

.nb-wsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  padding: 10px;
}

.nb-wsItem {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: background var(--ease), transform var(--ease);
}
.nb-wsItem:hover { background: var(--gold-dim); transform: translateX(3px); }
.nb-wsItem:hover .nb-wsLabel { color: var(--gold-lt); }
.nb-wsItem:hover .nb-wsArrow { opacity: 1; transform: translateX(4px); color: var(--gold); }

.nb-wsIcon  { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
.nb-wsLabel { font-size: 12.5px; color: var(--tx-muted); font-weight: 500; flex: 1; transition: color var(--ease); line-height: 1.35; }
.nb-wsArrow { color: var(--tx-muted); opacity: 0; transition: opacity var(--ease), transform var(--ease); flex-shrink: 0; }

.nb-galDrop {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 190px;
  background: var(--surface);
  border: 1px solid var(--nb-border);
  border-radius: var(--r-md);
  padding: 8px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.55);
  animation: nb-fadeDown 0.18s ease;
  z-index: 500;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(10px);
  transition: all 0.25s ease;
}
.nb-dropWrap:hover .nb-galDrop {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
.nb-dropWrap:hover .nb-chevron { transform: rotate(180deg); }

.nb-galItem {
  padding: 10px 14px;
  font-size: 13.5px;
  color: var(--tx-muted);
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: color var(--ease), background var(--ease);
  white-space: nowrap;
}
.nb-galItem:hover { color: var(--gold-lt); background: var(--gold-dim); }

.nb-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 18px;
  flex-shrink: 0;
}

.nb-iconBtn {
  all: unset;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--nb-border);
  color: var(--tx-muted);
  cursor: pointer;
  transition: color var(--ease), border-color var(--ease), background var(--ease);
  flex-shrink: 0;
}
.nb-iconBtn:hover { color: var(--gold-lt); border-color: var(--gold); background: var(--gold-dim); }

.nb-roleAnchor { position: relative; }

.nb-roleMenu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: var(--surface);
  border: 1px solid var(--nb-border);
  border-radius: var(--r-md);
  padding: 8px;
  min-width: 150px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.55);
  animation: nb-fadeDown 0.16s ease;
  z-index: 500;
}
.nb-roleHdr {
  font-size: 10px;
  color: var(--tx-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 5px 12px 8px;
  margin: 0;
  border-bottom: 1px solid var(--nb-border);
}
.nb-roleItem {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 12px;
  font-size: 13px;
  color: var(--tx-muted);
  border-radius: var(--r-sm);
  cursor: pointer;
  margin-top: 3px;
  transition: color var(--ease), background var(--ease);
}
.nb-roleItem:hover { color: var(--gold-lt); background: var(--gold-dim); }

.nb-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), var(--gold-lt));
  color: #08080c;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nb-hiText { font-size: 13px; color: var(--tx-muted); white-space: nowrap; }

.nb-ghostBtn {
  all: unset;
  padding: 6px 13px;
  font-size: 12.5px;
  font-weight: 500;
  font-family: var(--font-b);
  color: var(--tx-muted);
  border: 1px solid var(--nb-border);
  border-radius: 100px;
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--ease), border-color var(--ease), background var(--ease);
}
.nb-ghostBtn:hover { color: var(--gold-lt); border-color: var(--gold); background: var(--gold-dim); }

.nb-getStarted {
  all: unset;
  display: inline-flex;
  align-items: center;
  padding: 9px 22px;
  font-size: 13.5px;
  font-weight: 700;
  font-family: var(--font-b);
  letter-spacing: 0.3px;
  color: #08080c;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-lt) 100%);
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 0 0 22px var(--gold-glow);
  transition: opacity var(--ease), transform var(--ease), box-shadow var(--ease);
  white-space: nowrap;
  flex-shrink: 0;
}
.nb-getStarted:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 6px 28px var(--gold-glow); }
.nb-getStarted:active { transform: translateY(0); }

.nb-burger {
  all: unset;
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 38px;
  height: 38px;
  border: 1px solid var(--nb-border);
  border-radius: var(--r-sm);
  cursor: pointer;
  margin-left: 14px;
  flex-shrink: 0;
  transition: border-color var(--ease);
}
.nb-burger:hover { border-color: var(--gold); }

.nb-burger span {
  display: block;
  width: 19px;
  height: 1.5px;
  background: var(--tx-muted);
  border-radius: 2px;
  transition: transform 0.28s ease, opacity 0.28s ease, background 0.2s ease;
  transform-origin: center;
}
.nb-burgerOpen span { background: var(--gold); }
.nb-burgerOpen span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.nb-burgerOpen span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.nb-burgerOpen span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

.nb-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 910;
  background: rgba(0,0,0,0);
  transition: background 0.3s ease;
}
.nb-backdropOn { display: block; background: rgba(0,0,0,0.68); backdrop-filter: blur(3px); }

.nb-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(85vw, 340px);
  background: var(--surface);
  border-left: 1px solid var(--nb-border);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.33s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 920;
  overflow-y: auto;
}
.nb-drawerOn { transform: translateX(0); }

.nb-drawerTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--nb-border);
  background: linear-gradient(135deg, rgba(201,162,84,0.05), transparent);
  flex-shrink: 0;
}

.nb-closeBtn {
  all: unset;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-sm);
  border: 1px solid var(--nb-border);
  color: var(--tx-muted);
  cursor: pointer;
  transition: color var(--ease), border-color var(--ease);
}
.nb-closeBtn:hover { color: var(--gold-lt); border-color: var(--gold); }

.nb-mStrip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: linear-gradient(90deg, var(--gold-dim), transparent);
}
.nb-mStripAva {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), var(--gold-lt));
  color: #08080c;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nb-mStripGreet { font-size: 10.5px; color: var(--tx-muted); margin: 0; }
.nb-mStripName  { font-size: 15px; font-weight: 600; color: var(--gold-lt); font-family: var(--font-d); margin: 0; }

.nb-hr { border: none; border-top: 1px solid var(--nb-border); margin: 0; }

.nb-mNavList {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nb-mRow {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 12px;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: background var(--ease);
}
.nb-mRow:hover, .nb-mRowOpen { background: var(--gold-dim); }
.nb-mRow:hover .nb-mRowTxt, .nb-mRowOpen .nb-mRowTxt { color: var(--gold-lt); }

.nb-mRowIco { font-size: 15px; width: 22px; text-align: center; flex-shrink: 0; }
.nb-mRowTxt { flex: 1; font-size: 14px; font-weight: 500; color: var(--tx-muted); transition: color var(--ease); }
.nb-mChev { font-size: 18px; color: var(--tx-muted); opacity: 0.5; line-height: 1; }

.nb-mCaret { color: var(--tx-muted); transition: transform var(--ease); flex-shrink: 0; }
.nb-mCaretOpen { transform: rotate(180deg); color: var(--gold); }

.nb-mSub {
  padding: 4px 0 6px 46px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  animation: nb-slideDown 0.18s ease;
}

.nb-mSubRow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--r-sm);
  cursor: pointer;
  font-size: 13px;
  color: var(--tx-muted);
  transition: background var(--ease), color var(--ease);
}
.nb-mSubRow:hover { background: var(--gold-dim); color: var(--gold-lt); }
.nb-mSubIco { font-size: 13px; width: 18px; text-align: center; flex-shrink: 0; }

.nb-drawerFoot {
  padding: 16px 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  flex-shrink: 0;
}

.nb-mProfileRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border-radius: var(--r-sm);
  background: var(--gold-dim);
  font-size: 13.5px;
  color: var(--tx-muted);
  cursor: pointer;
  transition: background var(--ease);
}
.nb-mProfileRow:hover { background: rgba(201,162,84,0.15); }

.nb-mOrderBtn {
  all: unset;
  width: 100%;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-b);
  color: var(--gold-lt);
  border: 1px solid var(--gold);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: background var(--ease);
  box-sizing: border-box;
}
.nb-mOrderBtn:hover { background: var(--gold-dim); }

.nb-mLogoutBtn {
  all: unset;
  width: 100%;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-b);
  color: var(--tx-muted);
  border: 1px solid var(--nb-border);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: color var(--ease), border-color var(--ease);
  box-sizing: border-box;
}
.nb-mLogoutBtn:hover { color: #f87171; border-color: rgba(248,113,113,0.4); }

.nb-mLoginHdr {
  font-size: 10.5px;
  color: var(--tx-muted);
  letter-spacing: 0.9px;
  text-transform: uppercase;
  text-align: center;
  margin: 0 0 2px;
}

.nb-mTiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }

.nb-mTile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 6px;
  border: 1px solid var(--nb-border);
  border-radius: var(--r-md);
  cursor: pointer;
  font-size: 12px;
  color: var(--tx-muted);
  transition: background var(--ease), border-color var(--ease), color var(--ease);
}
.nb-mTile:hover { background: var(--gold-dim); border-color: var(--gold); color: var(--gold-lt); }
.nb-mTileIco { font-size: 20px; }

.nb-mStartBtn {
  all: unset;
  display: block;
  width: 100%;
  padding: 14px;
  text-align: center;
  font-size: 14.5px;
  font-weight: 700;
  font-family: var(--font-b);
  letter-spacing: 0.3px;
  color: #08080c;
  background: linear-gradient(135deg, var(--gold), var(--gold-lt));
  border-radius: var(--r-md);
  cursor: pointer;
  box-shadow: 0 4px 20px var(--gold-glow);
  box-sizing: border-box;
  transition: opacity var(--ease), transform var(--ease);
}
.nb-mStartBtn:hover { opacity: 0.87; transform: translateY(-1px); }

/* Profile Modal */
.nb-profileBackdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: nb-profileFadeIn 0.22s ease;
}

.nb-profileModal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  width: min(92vw, 400px);
  background: rgba(12, 11, 18, 0.97);
  border: 1px solid rgba(201, 162, 84, 0.28);
  border-radius: 24px;
  padding: 40px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 32px 100px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(201, 162, 84, 0.15);
  animation: nb-profileSlideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nb-profileModalClose {
  all: unset;
  position: absolute;
  top: 14px;
  right: 14px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(201, 162, 84, 0.2);
  color: var(--tx-muted);
  cursor: pointer;
  transition: color var(--ease), border-color var(--ease), background var(--ease);
}
.nb-profileModalClose:hover { color: var(--gold-lt); border-color: var(--gold); background: var(--gold-dim); }

.nb-profileLoaderWrap { position: relative; width: 80px; height: 80px; margin-bottom: 20px; }

.nb-profileRing {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  padding: 3px;
  background: conic-gradient(var(--gold-lt) 0deg, rgba(201, 162, 84, 0.15) 270deg, var(--gold-lt) 360deg);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: nb-profileSpin 1.4s linear infinite;
}

.nb-profileRingInner { width: 100%; height: 100%; border-radius: 50%; }

.nb-profileAvatarInner {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), var(--gold-lt));
  color: #08080c;
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-d);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 18px rgba(201, 162, 84, 0.35);
}

.nb-profileModalTitle {
  margin: 0 0 10px;
  font-family: var(--font-d);
  font-size: 22px;
  font-weight: 700;
  color: var(--gold-lt);
  letter-spacing: 0.3px;
}

.nb-profileModalSub {
  margin: 0 0 20px;
  font-size: 13.5px;
  color: var(--tx-muted);
  line-height: 1.65;
  opacity: 0.82;
}
.nb-profileModalSub strong { color: var(--gold-lt); font-weight: 600; }

.nb-profileDots { display: flex; align-items: center; gap: 7px; margin-bottom: 26px; }

.nb-profileDot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gold);
  display: inline-block;
  animation: nb-profilePulse 0.9s ease-in-out infinite alternate;
}

.nb-profileModalActions { display: flex; gap: 10px; width: 100%; }

.nb-profileModalOrders {
  all: unset;
  flex: 1;
  padding: 11px 14px;
  text-align: center;
  font-size: 13.5px;
  font-weight: 700;
  font-family: var(--font-b);
  color: #08080c;
  background: linear-gradient(135deg, var(--gold), var(--gold-lt));
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 0 0 16px var(--gold-glow);
  transition: opacity var(--ease), transform var(--ease);
  white-space: nowrap;
}
.nb-profileModalOrders:hover { opacity: 0.88; transform: translateY(-1px); }

.nb-profileModalDismiss {
  all: unset;
  flex: 1;
  padding: 11px 14px;
  text-align: center;
  font-size: 13.5px;
  font-weight: 500;
  font-family: var(--font-b);
  color: var(--tx-muted);
  border: 1px solid var(--nb-border);
  border-radius: 100px;
  cursor: pointer;
  transition: color var(--ease), border-color var(--ease), background var(--ease);
  white-space: nowrap;
}
.nb-profileModalDismiss:hover { color: var(--gold-lt); border-color: var(--gold); background: var(--gold-dim); }

@keyframes nb-fadeDown {
  from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
@keyframes nb-slideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes nb-profileFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes nb-profileSlideUp {
  from { opacity: 0; transform: translate(-50%, -44%); }
  to   { opacity: 1; transform: translate(-50%, -50%); }
}
@keyframes nb-profileSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes nb-profilePulse {
  from { opacity: 0.25; transform: scale(0.75); }
  to   { opacity: 1;    transform: scale(1.1); }
}

@media (max-width: 1100px) {
  .nb-inner { padding: 0 20px; }
  .nb-link  { padding: 8px 10px; font-size: 13px; }
  .nb-nav   { gap: 0; }
}
@media (max-width: 860px) {
  .nb-nav     { display: none; }
  .nb-actions { display: none; }
  .nb-burger  { display: flex; }
  .nb-spacer  { flex: 1; }
}
@media (max-width: 480px) {
  .nb-inner    { padding: 0 14px; }
  .nb-logoW    { font-size: 27px; }
  .nb-logoRest { font-size: 20px; }
  .nb-drawer   { width: 100vw; border-left: none; }
}
`;

export default function Navbar() {
  const navigate = useNavigate();

  const [wsOpen,       setWsOpen]       = useState(false);
  const [roleOpen,     setRoleOpen]     = useState(false);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [mWsOpen,      setMWsOpen]      = useState(false);
  const [mLocOpen,     setMLocOpen]     = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const wsTimer  = useRef(null);
  const token    = localStorage.getItem("access");
  const isAdmin  = localStorage.getItem("is_admin");
  const username = localStorage.getItem("username");

  // Inject CSS once
  useEffect(() => {
    const id = "nb-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }
    return () => {};
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (!e.target.closest(".nb-roleAnchor")) setRoleOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen || profileModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen, profileModalOpen]);

  const closeDrawer = () => { setDrawerOpen(false); setMWsOpen(false); setMLocOpen(false); };
  const go = (path) => { navigate(path); closeDrawer(); };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 300);
    }
    closeDrawer();
  };

  const goToType = (typeLabel) => {
    navigate("/Enterprise", { state: { workspaceType: typeLabel } });
    setWsOpen(false);
    closeDrawer();
  };

  const goToLocation = (locationName) => {
    navigate(`/Enterprise?location=${encodeURIComponent(locationName)}`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 300);
    closeDrawer();
  };

  const handleLogout = () => {
    ["access", "refresh", "is_admin", "username"].forEach((k) => localStorage.removeItem(k));
    alert("Logged out successfully");
    navigate("/");
    closeDrawer();
  };

  const enterWs = () => { clearTimeout(wsTimer.current); setWsOpen(true); };
  const leaveWs = () => { wsTimer.current = setTimeout(() => setWsOpen(false), 160); };

  return (
    <>
      {/* ═══ NAVBAR ═══ */}
      <header className="nb-navbar">
        <div className="nb-goldLine" />
        <div className="nb-inner">

          {/* LOGO */}
          <div className="nb-logo" onClick={() => { navigate("/"); scrollToTop(); }}>
            <span className="nb-logoW">C</span>
            <span className="nb-logoRest">oWork</span>
          </div>

          <div className="nb-spacer" />

          {/* DESKTOP NAV */}
          <nav className="nb-nav">
            <button className="nb-link" onClick={() => { navigate("/"); scrollToTop(); }}>Home</button>

            {/* Booking dropdown */}
            <div className="nb-dropWrap" onMouseEnter={enterWs} onMouseLeave={leaveWs}>
              <button className={`nb-link nb-linkDrop${wsOpen ? " nb-linkActive" : ""}`}>
                Booking
                <svg className={`nb-chevron${wsOpen ? " nb-chevUp" : ""}`} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {wsOpen && (
                <div className="nb-wsDrop">
                  <div className="nb-wsDropHead">Choose your workspace</div>
                  <div className="nb-wsGrid">
                    {WORKSPACE_TYPES.map((ws) => (
                      <div key={ws.label} className="nb-wsItem" onClick={() => goToType(ws.label)}>
                        <span className="nb-wsIcon">{ws.icon}</span>
                        <span className="nb-wsLabel">{ws.label}</span>
                        <svg className="nb-wsArrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Spaces */}
            <button className="nb-link" onClick={() => scrollToSection("spaces-section")}>Spaces</button>

            {/* Locations dropdown */}
            <div className="nb-dropWrap">
              <button className="nb-link nb-linkDrop">
                Locations
                <svg className="nb-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="nb-galDrop">
                {LOCATIONS.map((loc) => (
                  <div key={loc} className="nb-galItem" onClick={() => goToLocation(loc)}>{loc}</div>
                ))}
              </div>
            </div>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="nb-actions">
            <div className="nb-roleAnchor">
              <button
                className="nb-iconBtn"
                onClick={() => {
                  if (token) {
                    if (isAdmin === "true") navigate("/admin-dashboard");
                    else setProfileModalOpen(true);
                  } else setRoleOpen((r) => !r);
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {roleOpen && !token && (
                <div className="nb-roleMenu">
                  <p className="nb-roleHdr">Login as</p>
                  {[{ l: "User", i: "👤", t: "user" }, { l: "Manager", i: "🏢", t: "owner" }, { l: "Admin", i: "⚙️", t: "admin" }].map((r) => (
                    <div key={r.t} className="nb-roleItem" onClick={() => { navigate(`/auth?type=${r.t}`); setRoleOpen(false); }}>
                      <span>{r.i}</span><span>{r.l}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {token ? (
              <>
                <div className="nb-avatar">{(username || "U").charAt(0).toUpperCase()}</div>
                <span className="nb-hiText">Hi, {username || "User"}</span>
                {localStorage.getItem("role") === "user" && (
                  <button className="nb-ghostBtn" onClick={() => navigate("/my-orders")}>MY Orders</button>
                )}
                <button className="nb-ghostBtn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <button className="nb-getStarted" onClick={() => navigate("/getquote")}>Get A Quote</button>
            )}
          </div>

          {/* HAMBURGER */}
          <button
            className={`nb-burger${drawerOpen ? " nb-burgerOpen" : ""}`}
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ═══ MOBILE BACKDROP ═══ */}
      <div className={`nb-backdrop${drawerOpen ? " nb-backdropOn" : ""}`} onClick={closeDrawer} />

      {/* ═══ MOBILE DRAWER ═══ */}
      <div className={`nb-drawer${drawerOpen ? " nb-drawerOn" : ""}`}>
        <div className="nb-drawerTop">
          <div className="nb-logo" style={{ cursor: "pointer" }} onClick={() => { go("/"); scrollToTop(); }}>
            <span className="nb-logoW">C</span>
            <span className="nb-logoRest">oWork</span>
          </div>
          <button className="nb-closeBtn" onClick={closeDrawer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {token && username && (
          <div className="nb-mStrip">
            <div className="nb-mStripAva">{username.charAt(0).toUpperCase()}</div>
            <div>
              <p className="nb-mStripGreet">Welcome back</p>
              <p className="nb-mStripName">{username}</p>
            </div>
          </div>
        )}

        <hr className="nb-hr" />

        <div className="nb-mNavList">
          <div className="nb-mRow" onClick={() => { go("/"); scrollToTop(); }}>
            <span className="nb-mRowIco">⌂</span>
            <span className="nb-mRowTxt">Home</span>
            <span className="nb-mChev">›</span>
          </div>

          {/* Booking accordion */}
          <div>
            <div className={`nb-mRow${mWsOpen ? " nb-mRowOpen" : ""}`} onClick={() => setMWsOpen((o) => !o)}>
              <span className="nb-mRowIco">🏙️</span>
              <span className="nb-mRowTxt">Booking</span>
              <svg className={`nb-mCaret${mWsOpen ? " nb-mCaretOpen" : ""}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {mWsOpen && (
              <div className="nb-mSub">
                {WORKSPACE_TYPES.map((ws) => (
                  <div key={ws.label} className="nb-mSubRow" onClick={() => goToType(ws.label)}>
                    <span className="nb-mSubIco">{ws.icon}</span>
                    <span>{ws.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Spaces */}
          <div className="nb-mRow" onClick={() => scrollToSection("spaces-section")}>
            <span className="nb-mRowIco">🏢</span>
            <span className="nb-mRowTxt">Spaces</span>
            <span className="nb-mChev">›</span>
          </div>

          {/* Locations accordion */}
          <div>
            <div className={`nb-mRow${mLocOpen ? " nb-mRowOpen" : ""}`} onClick={() => setMLocOpen((o) => !o)}>
              <span className="nb-mRowIco">📍</span>
              <span className="nb-mRowTxt">Locations</span>
              <svg className={`nb-mCaret${mLocOpen ? " nb-mCaretOpen" : ""}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {mLocOpen && (
              <div className="nb-mSub">
                {LOCATIONS.map((loc) => (
                  <div key={loc} className="nb-mSubRow" onClick={() => goToLocation(loc)}>
                    <span className="nb-mSubIco">📍</span>
                    <span>{loc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <hr className="nb-hr" />

        <div className="nb-drawerFoot">
          {token ? (
            <>
              <div
                className="nb-mProfileRow"
                onClick={() => isAdmin === "true" ? go("/admin-dashboard") : setProfileModalOpen(true)}
              >
                <span>{isAdmin === "true" ? "⚙️ Admin Dashboard" : "👤 My Profile"}</span>
                <span>›</span>
              </div>
              {localStorage.getItem("role") === "user" && (
                <button className="nb-mOrderBtn" onClick={() => { navigate("/my-orders"); closeDrawer(); }}>
                  My Orders
                </button>
              )}
              <button className="nb-mLogoutBtn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <p className="nb-mLoginHdr">Continue as</p>
              <div className="nb-mTiles">
                {[{ l: "User", i: "👤", t: "user" }, { l: "Manager", i: "🏢", t: "owner" }, { l: "Admin", i: "⚙️", t: "admin" }].map((r) => (
                  <div key={r.t} className="nb-mTile" onClick={() => go(`/auth?type=${r.t}`)}>
                    <span className="nb-mTileIco">{r.i}</span>
                    <span>{r.l}</span>
                  </div>
                ))}
              </div>
              <button className="nb-mStartBtn" onClick={() => go("/auth")}>Get Started →</button>
            </>
          )}
        </div>
      </div>

      {/* ═══ PROFILE MODAL ═══ */}
      {profileModalOpen && (
        <>
          <div className="nb-profileBackdrop" onClick={() => setProfileModalOpen(false)} />
          <div className="nb-profileModal">
            <button className="nb-profileModalClose" onClick={() => setProfileModalOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="nb-profileLoaderWrap">
              <div className="nb-profileRing">
                <div className="nb-profileRingInner" />
              </div>
              <div className="nb-profileAvatarInner">
                {(username || "U").charAt(0).toUpperCase()}
              </div>
            </div>

            <h2 className="nb-profileModalTitle">Your Space Awaits ✦</h2>
            <p className="nb-profileModalSub">
              Good to see you, <strong>{username || "there"}</strong>. Your personal dashboard is being
              tailored just for you — every booking, every preference, all in one place.
              <br /><br />We're putting the finishing touches on it now.
            </p>

            <div className="nb-profileDots">
              <span className="nb-profileDot" style={{ animationDelay: "0s" }} />
              <span className="nb-profileDot" style={{ animationDelay: "0.22s" }} />
              <span className="nb-profileDot" style={{ animationDelay: "0.44s" }} />
            </div>

            <div className="nb-profileModalActions">
              <button className="nb-profileModalOrders" onClick={() => { navigate("/my-orders"); setProfileModalOpen(false); }}>
                View My Orders
              </button>
              <button className="nb-profileModalDismiss" onClick={() => setProfileModalOpen(false)}>
                Dismiss
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}