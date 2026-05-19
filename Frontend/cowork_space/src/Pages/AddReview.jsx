/**
 * ReviewChatWidget.jsx
 * ─────────────────────────────────────────────────────────────────
 * Layout (bottom-right, stacked above AI chatbot FAB):
 *
 *   [▲ arrow toggle]   ← collapses/expands Review button only
 *   [Review 💬]        ← shown/hidden by arrow
 *   [WhatsApp]         ← ALWAYS visible
 *   [AI chatbot FAB]   ← Chatbot.jsx at bottom:24, right:24
 *
 * All styles inline — no external CSS imports.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────── WhatsApp sub-button ─── */
function WAButton() {
  const phoneNumber = "916309383826";
  const message = "Hello, I want to know more about your services.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <style>{`
        @keyframes waPulseRing {
          0%   { transform: scale(0.9); opacity: 0.65; }
          70%  { transform: scale(1.45); opacity: 0; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        .wa-circle-btn:hover {
          transform: translateY(-3px) scale(1.1) !important;
          box-shadow: 0 14px 28px rgba(37,211,102,.48) !important;
        }
      `}</style>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
        className="wa-circle-btn"
        style={{
          position:"relative",
          display:"flex", alignItems:"center", justifyContent:"center",
          width:54, height:54, borderRadius:"50%",
          background:"linear-gradient(135deg,#25d366,#1ead52)",
          boxShadow:"0 8px 22px rgba(37,211,102,.38)",
          color:"#fff", textDecoration:"none",
          transition:"transform .22s, box-shadow .22s",
          flexShrink:0,
        }}
      >
        {/* Pulse ring */}
        <span style={{
          position:"absolute", inset:-4, borderRadius:"50%",
          background:"rgba(37,211,102,.2)",
          animation:"waPulseRing 2.2s ease-out infinite",
          pointerEvents:"none",
        }}/>
        <svg width={26} height={26} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
          <path d="M16.01 3.2c-7.07 0-12.8 5.72-12.8 12.77 0 2.25.59 4.44 1.71 6.37L3 29l6.84-1.79a12.82 12.82 0 0 0 6.17 1.58h.01c7.07 0 12.8-5.72 12.8-12.77S23.08 3.2 16.01 3.2zm0 23.42h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.06 1.06 1.08-3.96-.25-.41A10.56 10.56 0 0 1 5.36 15.97c0-5.85 4.78-10.61 10.65-10.61 2.84 0 5.51 1.1 7.52 3.1a10.53 10.53 0 0 1 3.13 7.51c0 5.85-4.78 10.61-10.65 10.61z"/>
          <path d="M19.11 17.21c-.27-.13-1.58-.78-1.82-.87-.24-.09-.42-.13-.6.13-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.13-1.12-.41-2.13-1.31-.79-.7-1.32-1.57-1.47-1.83-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.45-.82-1.98-.22-.53-.44-.46-.6-.47h-.51c-.18 0-.47.07-.71.34-.24.27-.93.91-.93 2.21s.96 2.57 1.09 2.75c.13.18 1.89 2.88 4.57 4.04.64.28 1.14.45 1.53.58.64.2 1.22.17 1.68.1.51-.08 1.58-.65 1.8-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31z"/>
        </svg>
      </a>
    </>
  );
}

/* ──────────────────────────────────────── Review Panel ─── */
function ReviewPanel({ open, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ rating:5, comment:"" });
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  useEffect(() => {
    axiosInstance.get("reviews/all/")
      .then(res => setReviews(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = () => {
    if (!token) { alert("Please login first ❌"); navigate("/auth"); return; }
    if (!form.comment) { alert("Write something ❌"); return; }
    setLoading(true);
    axiosInstance.post("reviews/add/", form)
      .then(() => {
        alert("Review added 🎉");
        axiosInstance.get("reviews/all/").then(res => setReviews(res.data)).catch(()=>{});
        setForm({ rating:5, comment:"" });
      })
      .catch(err => alert(err.response?.data?.error || "Error ❌"))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <style>{`
        .rw-card:hover { transform:translateY(-3px)!important; box-shadow:0 8px 18px rgba(0,0,0,.08)!important; }
        .rw-close:hover { background:rgba(255,255,255,.22)!important; transform:rotate(90deg)!important; }
        .rw-submit:hover:not(:disabled) { background:linear-gradient(135deg,#e65c00,#ff6b00)!important; transform:translateY(-2px); }
        .rw-textarea:focus, .rw-select:focus { border-color:#ff6b00!important; box-shadow:0 0 0 3px rgba(255,107,0,.12)!important; outline:none; }
        .rw-scroll::-webkit-scrollbar { width:5px; }
        .rw-scroll::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:999px; }
      `}</style>

      <div style={{
        position:"fixed",
        top:0,
        right: open ? 0 : -400,
        width:360, maxWidth:"100vw",
        height:"100dvh",
        background:"#ffffff",
        boxShadow:"-8px 0 30px rgba(0,0,0,.18)",
        display:"flex", flexDirection:"column",
        zIndex:10000,
        transition:"right .35s cubic-bezier(.22,1,.36,1)",
        overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"18px 20px",
          background:"linear-gradient(135deg,#ff6b00,#ff8c42)",
          color:"#fff", flexShrink:0,
        }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:600 }}>⭐ Reviews</h3>
          <button onClick={onClose} className="rw-close" style={{
            width:36, height:36, borderRadius:"50%", border:"none",
            background:"rgba(255,255,255,.12)", color:"#fff",
            fontSize:18, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background .22s, transform .22s",
          }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ padding:16, borderBottom:"1px solid #e5e7eb", background:"#fff", flexShrink:0 }}>
          <textarea
            className="rw-textarea"
            placeholder="Write your review..."
            value={form.comment}
            onChange={e => setForm({...form, comment:e.target.value})}
            style={{
              width:"100%", border:"1px solid #e5e7eb", borderRadius:10,
              padding:"12px 14px", fontSize:14, color:"#111827",
              background:"#fff", minHeight:90, resize:"none",
              marginBottom:12, boxSizing:"border-box",
              transition:"border-color .2s, box-shadow .2s",
            }}
          />
          <select
            className="rw-select"
            value={form.rating}
            onChange={e => setForm({...form, rating:e.target.value})}
            style={{
              width:"100%", border:"1px solid #e5e7eb", borderRadius:10,
              padding:"12px 14px", fontSize:14, color:"#111827",
              background:"#fff", marginBottom:12, boxSizing:"border-box",
              transition:"border-color .2s, box-shadow .2s",
            }}
          >
            <option value="5">⭐⭐⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="2">⭐⭐</option>
            <option value="1">⭐</option>
          </select>
          <button
            className="rw-submit"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width:"100%", border:"none", borderRadius:10,
              padding:"12px 16px",
              background:"linear-gradient(135deg,#ff6b00,#ff8c42)",
              color:"#fff", fontWeight:600, cursor:"pointer",
              fontSize:14, transition:"all .22s",
            }}
          >{loading ? "Submitting…" : "Submit Review"}</button>
        </div>

        {/* List */}
        <div className="rw-scroll" style={{ flex:1, overflowY:"auto", padding:16, background:"#f9fafb" }}>
          {reviews.length === 0
            ? <p style={{ color:"#9ca3af", textAlign:"center", marginTop:32 }}>No reviews yet</p>
            : reviews.map(r => (
              <div key={r.id} className="rw-card" style={{
                background:"#fff", border:"1px solid #e5e7eb", borderRadius:14,
                padding:14, marginBottom:14, boxShadow:"0 4px 12px rgba(0,0,0,.05)",
                transition:"transform .22s, box-shadow .22s",
              }}>
                <h4 style={{ margin:"0 0 6px", fontSize:15, color:"#111827", fontWeight:600 }}>👤 {r.username}</h4>
                <p style={{ margin:"4px 0", color:"#f59e0b", fontSize:15, letterSpacing:2 }}>{"⭐".repeat(r.rating)}</p>
                <p style={{ margin:"4px 0", fontSize:14, lineHeight:1.5, color:"#374151" }}>{r.comment}</p>
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════ */
export default function ReviewChatWidget() {
  const [openReview,   setOpenReview]   = useState(false);
  const [showReviewBtn, setShowReviewBtn] = useState(true);

  return (
    <>
      <style>{`
        @keyframes rcFadeUp {
          from { opacity:0; transform:translateY(10px) scale(.88); }
          to   { opacity:1; transform:none; }
        }
        .rc-review-btn:hover {
          transform: translateY(-3px) scale(1.1) !important;
          box-shadow: 0 12px 28px rgba(255,107,0,.5) !important;
        }
        .rc-arrow-btn:hover {
          background: rgba(110,70,200,.8) !important;
          transform: scale(1.12) !important;
        }
      `}</style>

      {/*
        Fixed column — right:30
        bottom:96 = chatbot FAB (60px) + gap (12px) + chatbot bottom (24px)
        WhatsApp is ALWAYS shown; Review btn is toggled by arrow
      */}
      <div style={{
        position:"fixed",
        right:25,
        bottom:96,
        zIndex:9995,
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        gap:10,
      }}>

        {/* ── Arrow toggle ── */}
        <button
          className="rc-arrow-btn"
          onClick={() => setShowReviewBtn(s => !s)}
          title={showReviewBtn ? "Hide review button" : "Show review button"}
          aria-label="Toggle review button"
          style={{
            width:26, height:26, borderRadius:"50%", border:"none",
            background:"rgba(80,55,160,.58)",
            backdropFilter:"blur(6px)",
            color:"#fff", fontSize:11, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 10px rgba(0,0,0,.22)",
            transition:"background .2s, transform .28s",
            transform: showReviewBtn ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink:0,
          }}
        >▲</button>

        {/* ── Review button (toggleable) ── */}
        {showReviewBtn && (
          <button
            className="rc-review-btn"
            onClick={() => setOpenReview(v => !v)}
            title="Reviews"
            aria-label="Open Reviews"
            style={{
              width:54, height:54, borderRadius:"50%", border:"none",
              background:"linear-gradient(135deg,#ff6b00,#ff8c42)",
              color:"#fff", fontSize:22, cursor:"pointer",
              boxShadow:"0 8px 22px rgba(255,107,0,.38)",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"transform .22s, box-shadow .22s",
              animation:"rcFadeUp .22s ease both",
              flexShrink:0,
            }}
          >💬</button>
        )}

        {/* ── WhatsApp — ALWAYS visible ── */}
        <WAButton />

      </div>

      {/* ── Review slide-in panel ── */}
      <ReviewPanel open={openReview} onClose={() => setOpenReview(false)} />
    </>
  );
}