/**
 * Chatbot.jsx — CoWork AI (Fully Dynamic Edition)
 * All styles inline — no external CSS imports needed
 */

import { useState, useRef, useEffect, useCallback } from "react";
import axiosInstance from "../Services/Axios";

/* ─── Speech ─────────────────────────────────────────────────────────────── */
const SR        = window.SpeechRecognition || window.webkitSpeechRecognition;
const canSpeak  = Boolean(window.speechSynthesis);
const canListen = Boolean(SR);

function speak(text) {
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[*#•\-]/g, ""));
  u.lang = "en-IN"; u.rate = 1.05;
  const v = window.speechSynthesis.getVoices().find(v => v.lang.startsWith("en") && v.localService);
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

/* ─── Typewriter hook ────────────────────────────────────────────────────── */
function useTypewriter(text, active, onTick) {
  const [out, setOut]   = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setOut(text); setDone(true); return; }
    setOut(""); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (onTick) onTick();
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, 12);
    return () => clearInterval(id);
  }, [text, active]);
  return { out, done };
}

/* ─── Sparkle Mic Icon ───────────────────────────────────────────────────── */
function SparkMic({ size = 28, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="17" y="5" width="14" height="22" rx="7" fill={color} opacity=".95"/>
      <path d="M10 24c0 7.732 6.268 14 14 14s14-6.268 14-14"
        stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".9"/>
      <line x1="24" y1="38" x2="24" y2="44" stroke={color} strokeWidth="2.6" strokeLinecap="round"/>
      <line x1="17" y1="44" x2="31" y2="44" stroke={color} strokeWidth="2.6" strokeLinecap="round"/>
      <line x1="37" y1="5"  x2="37" y2="10"   stroke={color} strokeWidth="2"   strokeLinecap="round"/>
      <line x1="34.5" y1="7.5" x2="39.5" y2="7.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="42" y1="11" x2="42" y2="15"   stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="40" y1="13" x2="44" y2="13"   stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Orb Avatar ─────────────────────────────────────────────────────────── */
const ORB_BG = "radial-gradient(circle at 38% 35%, #3a2090 0%, #1a0a5e 38%, #6b1ea0 68%, #c0186a 100%)";

function OrbAvatar({ size = 26 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:"40%", flexShrink:0,
      background:ORB_BG,
      display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow:"0 0 8px rgba(150,40,200,.5)",
      border:"1px solid rgba(255,255,255,.1)",
    }}>
      <SparkMic size={size * 0.52} color="#fff"/>
    </div>
  );
}

/* ─── Typing dots ────────────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display:"flex", gap:4, padding:"6px 2px", alignItems:"center" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:6, height:6, borderRadius:"50%", display:"inline-block",
          background:"linear-gradient(135deg,#c060ff,#7030c0)",
          animation:`cwDot 1.3s ease-in-out ${i*0.22}s infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ─── Bot Message ────────────────────────────────────────────────────────── */
function BotMessage({ text, isNew, onSpeak, onTypeTick }) {
  const { out, done } = useTypewriter(text, isNew, onTypeTick);
  const html = out
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
  return (
    <div style={{
      display:"flex", gap:7, marginBottom:10, alignItems:"flex-start",
      animation: isNew ? "cwIn .25s cubic-bezier(.22,1,.36,1)" : "none",
    }}>
      <OrbAvatar size={26}/>
      <div style={{ maxWidth:"75%" }}>
        <div style={{
          background:"rgba(120,40,200,.1)",
          border:"1px solid rgba(160,60,220,.18)",
          borderRadius:"3px 14px 14px 14px",
          padding:"9px 12px",
          color:"#ecdeff", fontSize:12.5, lineHeight:1.7,
          boxShadow:"0 2px 12px rgba(100,20,180,.1)",
          wordBreak:"break-word",
        }}>
          <span dangerouslySetInnerHTML={{ __html: html }}/>
          {!done && <span style={{ animation:"cwBlink 1s infinite", marginLeft:2, color:"#b080ff" }}>|</span>}
        </div>
        {canSpeak && done && (
          <button onClick={() => onSpeak(text)} style={{
            marginTop:3, background:"none", border:"none",
            color:"rgba(170,110,255,.45)", fontSize:10, cursor:"pointer",
            padding:"1px 3px", transition:"color .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color="rgba(170,110,255,.9)"}
          onMouseLeave={e => e.currentTarget.style.color="rgba(170,110,255,.45)"}
          >🔊 Read</button>
        )}
      </div>
    </div>
  );
}

/* ─── User Message ───────────────────────────────────────────────────────── */
function UserMessage({ text, isNew }) {
  return (
    <div style={{
      display:"flex", justifyContent:"flex-end", marginBottom:10,
      animation: isNew ? "cwIn .2s cubic-bezier(.22,1,.36,1)" : "none",
    }}>
      <div style={{
        background:"linear-gradient(135deg,#6b1ea0,#3a2090)",
        borderRadius:"14px 3px 14px 14px",
        padding:"9px 13px",
        color:"#fff", fontSize:12.5, lineHeight:1.6,
        maxWidth:"78%", wordBreak:"break-word",
        boxShadow:"0 3px 14px rgba(100,20,180,.38)",
      }}>{text}</div>
    </div>
  );
}

/* ─── Quick chips ────────────────────────────────────────────────────────── */
const QUICK = [
  { label:"Available workspaces", icon:"🏢" },
  { label:"Pricing",              icon:"💰" },
  { label:"Today's slots",        icon:"📅" },
  { label:"Amenities",            icon:"✨" },
  { label:"Special offers",       icon:"🏷️" },
  { label:"How to book?",         icon:"🚀" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function Chatbot() {
  const [open,      setOpen]      = useState(false);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn,   setVoiceOn]   = useState(true);
  const [showQuick, setShowQuick] = useState(true);
  const [newIdx,    setNewIdx]    = useState(null);
  const [unread,    setUnread]    = useState(0);
  const [focused,   setFocused]   = useState(false);

  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef  = useRef(null);
  const recRef    = useRef(null);

  /* ─── Scroll helper ──────────────────────────────────────────────────── */
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);

  /* Greeting */
  useEffect(() => {
    if (open && messages.length === 0) {
      const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long"
      });
      const g = {
        role: "assistant",
        content: `Hi! 👋 I'm your **CoWork AI Assistant**.\n\nToday is ${today}. I have live data from our database — ask me about workspaces, slot availability for any date, pricing, offers, or how to book!`
      };
      setMessages([g]); setNewIdx(0);
      if (voiceOn) speak(g.content);
      setUnread(0);
    }
  }, [open]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTimeout(scrollToBottom, 0);
    });
    return () => cancelAnimationFrame(raf);
  }, [messages, loading, scrollToBottom]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 220); }, [open]);

  /* ─── Send message ──────────────────────────────────────────────────── */
  const send = useCallback(async (override) => {
    const msg = (override !== undefined ? override : input).trim();
    if (!msg || loading) return;
    setInput(""); setShowQuick(false);

    const hist = [...messages, { role: "user", content: msg }];
    setMessages(hist); setNewIdx(hist.length - 1); setLoading(true);

    try {
      const res = await axiosInstance.post("chatbot/", {
        message: msg,
        history: messages,
      });

      const reply = res.data.reply || "Please contact our support team for details.";
      setMessages(prev => {
        const u = [...prev, { role: "assistant", content: reply }];
        setNewIdx(u.length - 1);
        if (!open) setUnread(c => c + 1);
        return u;
      });
      if (voiceOn) speak(reply);
    } catch {
      setMessages(prev => {
        const u = [...prev, {
          role: "assistant",
          content: "Something went wrong. Please try again or contact support."
        }];
        setNewIdx(u.length - 1);
        return u;
      });
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, voiceOn, open]);

  /* ─── Voice ─────────────────────────────────────────────────────────── */
  const startListen = useCallback(() => {
    if (!canListen || listening) return;
    const r = new SR();
    r.lang = "en-IN"; r.interimResults = false;
    r.onstart  = () => setListening(true);
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    r.onresult = e => {
      const t = e.results[0][0].transcript;
      setInput(t);
      setTimeout(() => send(t), 150);
    };
    recRef.current = r; r.start();
  }, [listening, send]);

  const stopListen = () => { recRef.current?.stop(); setListening(false); };
  const stopSpeak  = () => window.speechSynthesis?.cancel();

  const clearChat = () => {
    stopSpeak();
    setMessages([]); setShowQuick(true); setUnread(0);
    setTimeout(() => {
      setMessages([{ role: "assistant", content: "Cleared! 😊 What would you like to know?" }]);
      setNewIdx(0);
    }, 60);
  };

  return (
    <>
      <style>{`
        @keyframes cwIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes cwPop   { from{opacity:0;transform:translateY(20px) scale(.93)} to{opacity:1;transform:none} }
        @keyframes cwGlow  {
          0%,100%{ box-shadow:0 0 0 0 rgba(170,50,220,.6),0 0 28px 4px rgba(90,20,180,.5),0 10px 32px rgba(0,0,0,.6) }
          55%    { box-shadow:0 0 0 18px rgba(170,50,220,0),0 0 42px 12px rgba(90,20,180,.22),0 10px 32px rgba(0,0,0,.6) }
        }
        @keyframes cwRipple{ 0%{transform:scale(1);opacity:.4} 100%{transform:scale(2.2);opacity:0} }
        @keyframes cwSpark { 0%,100%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(14deg) scale(1.1)} }
        @keyframes cwDot   { 0%,80%,100%{transform:scale(.6);opacity:.25} 40%{transform:scale(1.35);opacity:1} }
        @keyframes cwBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes cwShimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes cwListen{ 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.65)} 60%{box-shadow:0 0 0 9px rgba(239,68,68,0)} }

        .cw-fab  { animation:cwGlow 2.8s ease-in-out infinite; }
        .cw-fab:hover{ transform:scale(1.1)!important; }
        .cw-spk  { animation:cwSpark 3.2s ease-in-out infinite; }
        .cw-inp:focus{ outline:none; border-color:rgba(160,60,220,.62)!important; box-shadow:0 0 0 3px rgba(140,40,200,.16)!important; }
        .cw-chip:hover{ background:rgba(140,40,200,.22)!important; border-color:rgba(190,90,255,.5)!important; color:#d4aaff!important; }
        .cw-hbtn:hover{ background:rgba(255,255,255,.18)!important; }
        .cw-send:not(:disabled):hover{ filter:brightness(1.18); transform:scale(1.08); }
        .cw-send{ transition:all .18s cubic-bezier(.22,1,.36,1); }
        .cw-sc::-webkit-scrollbar{ width:3px }
        .cw-sc::-webkit-scrollbar-thumb{ background:rgba(160,60,220,.3); border-radius:4px }

        @media (max-width: 480px) {
          .cw-panel { width: calc(100vw - 16px) !important; right: 8px !important; bottom: 8px !important; }
          .cw-fab-wrap { right: 16px !important; bottom: 16px !important; }
        }
      `}</style>

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      {!open && (
        <div className="cw-fab-wrap" style={{ position:"fixed", bottom:24, right:24, zIndex:9990 }}>
          <div className="cw-fab" onClick={() => { setOpen(true); setUnread(0); }} title="CoWork AI Assistant" style={{
            width:60, height:60, borderRadius:"50%", cursor:"pointer",
            background:ORB_BG,
            border:"1.5px solid rgba(255,255,255,.12)",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"transform .18s", position:"relative",
          }}>
            <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"rgba(160,50,220,.26)", animation:"cwRipple 2.4s ease-out infinite", pointerEvents:"none" }}/>
            <div style={{ position:"absolute",inset:"-7px",borderRadius:"50%",background:"rgba(100,20,180,.14)", animation:"cwRipple 2.4s .9s ease-out infinite", pointerEvents:"none" }}/>
            <div className="cw-spk" style={{ position:"relative",zIndex:1 }}><SparkMic size={28} color="#fff"/></div>
            {unread > 0 && (
              <div style={{
                position:"absolute",top:-2,right:-2,zIndex:2,
                width:17,height:17,borderRadius:"50%",
                background:"#e0305a",border:"2px solid #111",
                fontSize:8,color:"#fff",fontWeight:700,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>{unread}</div>
            )}
          </div>
        </div>
      )}

      {/* ── PANEL ───────────────────────────────────────────────────────── */}
      {open && (
        <div className="cw-panel" style={{
          position:"fixed", bottom:24, right:24, zIndex:9999,
          width:340, maxWidth:"calc(100vw - 20px)",
          height:520, maxHeight:"calc(100vh - 44px)",
          borderRadius:20,
          background:"linear-gradient(160deg,#0e0820 0%,#0c0b1c 55%,#090912 100%)",
          border:"1px solid rgba(160,60,220,.2)",
          boxShadow:"0 28px 70px rgba(0,0,0,.85), 0 0 60px rgba(100,20,180,.13)",
          display:"flex", flexDirection:"column", overflow:"hidden",
          animation:"cwPop .28s cubic-bezier(.22,1,.36,1)",
        }}>

          {/* dot grid */}
          <div style={{ position:"absolute",inset:0,pointerEvents:"none",
            backgroundImage:"radial-gradient(rgba(160,60,220,.04) 1px,transparent 1px)",
            backgroundSize:"20px 20px",borderRadius:"inherit" }}/>

          {/* shimmer line */}
          <div style={{ position:"absolute",top:0,left:0,right:0,height:1,zIndex:2,
            background:"linear-gradient(90deg,transparent,rgba(210,140,255,.55),transparent)",
            backgroundSize:"200% 100%", animation:"cwShimmer 3s linear infinite" }}/>

          {/* ── HEADER ──────────────────────────────────────────────────── */}
          <div style={{
            position:"relative",zIndex:3,padding:"11px 12px",
            background:"linear-gradient(135deg,rgba(100,20,180,.22),rgba(60,16,130,.14))",
            borderBottom:"1px solid rgba(160,60,220,.13)",
            display:"flex",alignItems:"center",gap:9,flexShrink:0,
          }}>
            <div style={{
              width:34,height:34,borderRadius:"50%",flexShrink:0,
              background:ORB_BG,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 0 14px rgba(160,40,200,.6)",
              border:"1px solid rgba(255,255,255,.1)",
            }}>
              <div className="cw-spk"><SparkMic size={17} color="#fff"/></div>
            </div>

            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ color:"#fff",fontWeight:700,fontSize:12.5,letterSpacing:"-.01em" }}>CoWork AI Assistant</div>
              <div style={{ color:"rgba(255,255,255,.38)",fontSize:9.5,marginTop:1,display:"flex",alignItems:"center",gap:4 }}>
                <span style={{
                  width:5,height:5,borderRadius:"50%",background:"#22c55e",display:"inline-block",
                  boxShadow:"0 0 5px #22c55e",animation:"cwBlink 2.4s infinite",
                }}/>
                Live DB · Always updated
              </div>
            </div>

            {[
              { icon:voiceOn?"🔊":"🔇", title:voiceOn?"Mute":"Unmute", fn:()=>{setVoiceOn(v=>!v);stopSpeak();} },
              { icon:"🗑️", title:"Clear", fn:clearChat },
              { icon:"✕",  title:"Close", fn:()=>{setOpen(false);stopSpeak();} },
            ].map(b=>(
              <button key={b.title} onClick={b.fn} title={b.title} className="cw-hbtn" style={{
                width:26,height:26,borderRadius:"50%",border:"none",
                background:"rgba(255,255,255,.07)",color:"rgba(255,255,255,.68)",
                fontSize:11,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"background .18s",flexShrink:0,
              }}>{b.icon}</button>
            ))}
          </div>

          {/* ── MESSAGES ────────────────────────────────────────────────── */}
          <div
            ref={scrollRef}
            className="cw-sc"
            style={{
              position:"relative",zIndex:1,
              flex:1,overflowY:"auto",
              padding:"12px 11px 6px",
              display:"flex",flexDirection:"column",
            }}
          >
            {messages.map((m, i) =>
              m.role === "user"
                ? <UserMessage key={i} text={m.content} isNew={i === newIdx}/>
                : <BotMessage
                    key={i}
                    text={m.content}
                    isNew={i === newIdx}
                    onSpeak={speak}
                    onTypeTick={scrollToBottom}
                  />
            )}

            {loading && (
              <div style={{ display:"flex",gap:7,alignItems:"flex-start",marginBottom:10,animation:"cwIn .2s ease" }}>
                <OrbAvatar size={26}/>
                <div style={{
                  background:"rgba(120,40,200,.1)",
                  border:"1px solid rgba(160,60,220,.17)",
                  borderRadius:"3px 14px 14px 14px",padding:"6px 12px",
                }}><TypingDots/></div>
              </div>
            )}

            {showQuick && messages.length === 1 && !loading && (
              <div style={{ marginTop:6,animation:"cwIn .35s .1s ease both" }}>
                <p style={{ fontSize:9.5,color:"rgba(255,255,255,.25)",textAlign:"center",marginBottom:8,letterSpacing:".06em",textTransform:"uppercase" }}>Quick questions</p>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center" }}>
                  {QUICK.map(q=>(
                    <button key={q.label} onClick={()=>send(q.label)} className="cw-chip" style={{
                      background:"rgba(120,40,200,.08)",
                      border:"1px solid rgba(160,60,220,.2)",
                      borderRadius:14,color:"#c090ff",
                      fontSize:10.5,padding:"5px 10px",
                      cursor:"pointer",transition:"all .18s",
                      display:"flex",alignItems:"center",gap:4,
                    }}>
                      <span style={{ fontSize:10 }}>{q.icon}</span>{q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} style={{ height:1, flexShrink:0 }}/>
          </div>

          {/* ── LISTENING BAR ───────────────────────────────────────────── */}
          {listening && (
            <div style={{
              position:"relative",zIndex:3,padding:"7px 14px",
              background:"rgba(239,68,68,.08)",
              borderTop:"1px solid rgba(239,68,68,.16)",
              color:"#fca5a5",fontSize:11,
              display:"flex",alignItems:"center",gap:7,flexShrink:0,
            }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:"#ef4444",display:"inline-block",animation:"cwListen 1s infinite",flexShrink:0 }}/>
              Listening…
              <button onClick={stopListen} style={{ marginLeft:"auto",background:"none",border:"none",color:"#fca5a5",cursor:"pointer",fontSize:10 }}>✕</button>
            </div>
          )}

          {/* ── INPUT ───────────────────────────────────────────────────── */}
          <div style={{
            position:"relative",zIndex:3,
            padding:"9px 10px 10px",
            background:"rgba(9,9,18,.9)",
            borderTop:"1px solid rgba(160,60,220,.1)",
            display:"flex",gap:7,alignItems:"center",flexShrink:0,
          }}>
            {canListen && (
              <button onClick={listening?stopListen:startListen} title={listening?"Stop":"Voice"} style={{
                width:34,height:34,borderRadius:"50%",border:"none",flexShrink:0,
                background:listening?"rgba(239,68,68,.18)":ORB_BG,
                color:"#fff",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all .18s",
                boxShadow:listening?"none":"0 0 12px rgba(160,40,200,.45)",
                animation:listening?"cwListen 1s infinite":"none",
                fontSize:listening?15:"inherit",
              }}>
                {listening?"⏹":<SparkMic size={17} color="#fff"/>}
              </button>
            )}

            <input
              ref={inputRef}
              className="cw-inp"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
              onFocus={()=>setFocused(true)}
              onBlur={()=>setFocused(false)}
              placeholder="Ask about slots, pricing, availability…"
              disabled={loading}
              style={{
                flex:1,padding:"8px 13px",borderRadius:18,
                border:`1px solid ${focused?"rgba(160,60,220,.55)":"rgba(160,60,220,.18)"}`,
                background:"rgba(160,60,220,.07)",
                color:"#ecdeff",fontSize:12.5,
                transition:"border-color .18s,box-shadow .18s",
                boxShadow:focused?"0 0 0 3px rgba(140,40,200,.15)":"none",
              }}
            />

            <button onClick={()=>send()} disabled={loading||!input.trim()} className="cw-send" title="Send" style={{
              width:34,height:34,borderRadius:"50%",border:"none",flexShrink:0,
              background:loading||!input.trim()?"rgba(255,255,255,.05)":ORB_BG,
              color:loading||!input.trim()?"rgba(255,255,255,.18)":"#fff",
              fontSize:15,cursor:loading||!input.trim()?"not-allowed":"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:loading||!input.trim()?"none":"0 3px 14px rgba(120,20,180,.45)",
            }}>➤</button>
          </div>

          {/* ── FOOTER ──────────────────────────────────────────────────── */}
          <div style={{
            position:"relative",zIndex:3,
            textAlign:"center",fontSize:9,
            color:"rgba(255,255,255,.13)",
            padding:"2px 8px 7px",
            background:"rgba(9,9,18,.9)",
            letterSpacing:".04em",
          }}>
            Powered by live database · CoWorking Space
          </div>
        </div>
      )}
    </>
  );
}