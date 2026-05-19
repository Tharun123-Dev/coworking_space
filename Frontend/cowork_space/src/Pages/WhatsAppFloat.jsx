/**
 * WhatsAppFloat.jsx — All styles inline, no external CSS
 */

import React from "react";

export default function WhatsAppFloat() {
  const phoneNumber = "916309383826";
  const message = "Hello, I want to know more about your services.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <style>{`
        @keyframes waPulse {
          0%   { transform: scale(0.92); opacity: 0.6; }
          70%  { transform: scale(1.38); opacity: 0; }
          100% { transform: scale(1.38); opacity: 0; }
        }
        @keyframes waEntry {
          from { opacity: 0; transform: translateY(18px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .wa-wrap { animation: waEntry 0.45s ease; text-decoration: none; }
        .wa-btn  { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .wa-wrap:hover .wa-btn {
          transform: translateY(-3px);
          box-shadow: 0 14px 28px rgba(37,211,102,.28), 0 6px 14px rgba(0,0,0,.12) !important;
        }
        .wa-ring { animation: waPulse 2s infinite; }

        @media (max-width: 480px) {
          .wa-text-area { display: none !important; }
          .wa-btn {
            min-width: 44px !important; width: 44px !important;
            height: 44px !important; border-radius: 50% !important;
            padding: 0 !important; justify-content: center !important;
            gap: 0 !important;
          }
          .wa-icon-area {
            width: 44px !important; height: 44px !important;
            min-width: 44px !important; background: transparent !important;
          }
          .wa-icon { width: 20px !important; height: 20px !important; }
          .wa-ring { width: 56px !important; height: 56px !important; }
        }

        @media (max-width: 768px) {
          .wa-btn {
            min-width: 98px !important; height: 42px !important;
            padding: 5px 10px 5px 5px !important; gap: 7px !important;
          }
          .wa-icon-area { width: 32px !important; height: 32px !important; min-width: 32px !important; }
          .wa-icon { width: 17px !important; height: 17px !important; }
          .wa-main-text { font-size: 12px !important; }
          .wa-ring { width: 54px !important; height: 54px !important; }
        }
      `}</style>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-wrap"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
        style={{
          position:"relative",
          display:"inline-flex",
          alignItems:"center",
          justifyContent:"center",
        }}
      >
        {/* Pulse ring */}
        <span className="wa-ring" style={{
          position:"absolute",
          width:58, height:58,
          borderRadius:"50%",
          background:"rgba(37,211,102,.16)",
          zIndex:-1,
          pointerEvents:"none",
        }}/>

        {/* Button pill */}
        <div className="wa-btn" style={{
          display:"flex",
          alignItems:"center",
          gap:8,
          minWidth:108,
          height:46,
          padding:"6px 12px 6px 6px",
          borderRadius:999,
          background:"linear-gradient(135deg,#25d366 0%,#1fb85a 100%)",
          color:"#fff",
          boxShadow:"0 10px 24px rgba(37,211,102,.22), 0 4px 10px rgba(0,0,0,.10)",
          cursor:"pointer",
        }}>
          {/* Icon circle */}
          <div className="wa-icon-area" style={{
            width:34, height:34, minWidth:34,
            borderRadius:"50%",
            background:"rgba(255,255,255,.16)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <svg className="wa-icon" style={{ width:18, height:18, color:"#fff" }}
              viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
              fill="currentColor" aria-hidden="true">
              <path d="M16.01 3.2c-7.07 0-12.8 5.72-12.8 12.77 0 2.25.59 4.44 1.71 6.37L3 29l6.84-1.79a12.82 12.82 0 0 0 6.17 1.58h.01c7.07 0 12.8-5.72 12.8-12.77S23.08 3.2 16.01 3.2zm0 23.42h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.06 1.06 1.08-3.96-.25-.41a10.56 10.56 0 0 1-1.62-5.59c0-5.85 4.78-10.61 10.65-10.61 2.84 0 5.51 1.1 7.52 3.1a10.53 10.53 0 0 1 3.13 7.51c0 5.85-4.78 10.61-10.65 10.61z" />
              <path d="M19.11 17.21c-.27-.13-1.58-.78-1.82-.87-.24-.09-.42-.13-.6.13-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.13-1.12-.41-2.13-1.31-.79-.7-1.32-1.57-1.47-1.83-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.45-.82-1.98-.22-.53-.44-.46-.6-.47h-.51c-.18 0-.47.07-.71.34-.24.27-.93.91-.93 2.21s.96 2.57 1.09 2.75c.13.18 1.89 2.88 4.57 4.04.64.28 1.14.45 1.53.58.64.2 1.22.17 1.68.1.51-.08 1.58-.65 1.8-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31z" />
            </svg>
          </div>

          {/* Text */}
          <div className="wa-text-area" style={{ display:"flex", alignItems:"center" }}>
            <span className="wa-main-text" style={{
              fontSize:13, fontWeight:700,
              letterSpacing:"0.2px", lineHeight:1,
              color:"#fff",
            }}>Chat</span>
          </div>
        </div>
      </a>
    </>
  );
}