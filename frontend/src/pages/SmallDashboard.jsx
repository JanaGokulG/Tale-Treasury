import { useState, useEffect, useRef } from "react";
import AboutPage from "../components/AboutPage";
import api from "../api/axios";

/* ─────────────────────────────────────────────────────────────────────────
   CONSTANTS  (no mock user/streak/deleted — all come from backend)
───────────────────────────────────────────────────────────────────────── */
const TROPHIES_DEFINITIONS = [
  { id:1, emoji:"📖", label:"First Story Read"                    },
  { id:2, emoji:"🌙", label:"Night Owl – 3 stories after midnight"},
  { id:3, emoji:"🔥", label:"7-Day Streak"                        },
  { id:4, emoji:"✨", label:"Story Weaver – 5 tales generated"    },
  { id:5, emoji:"🌟", label:"Archive Keeper"                      },
  { id:6, emoji:"🎭", label:"Genre Explorer"                      },
];

const LATEST_GENRE = "mystery";

const GENRE_LAMP = {
  fantasy:   { glow:"#FFD580", color:"#FFC940", label:"Fantasy"   },
  mystery:   { glow:"#B388FF", color:"#9C6FFF", label:"Mystery"   },
  romance:   { glow:"#FF8FAB", color:"#FF6B8A", label:"Romance"   },
  horror:    { glow:"#FF6B6B", color:"#E53935", label:"Horror"    },
  adventure: { glow:"#80DEEA", color:"#26C6DA", label:"Adventure" },
};

/* ─────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400&family=Playfair+Display:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --warm-bg:     #1C0F06;
    --warm-paper:  #2A1808;
    --warm-card:   #221204;
    --warm-border: rgba(200,144,60,.28);
    --warm-gold:   #C8903C;
    --warm-cream:  #F5DEB3;
    --warm-muted:  rgba(245,222,179,.45);
    --warm-dim:    rgba(245,222,179,.22);
  }

  .lf-root {
    min-height: 100vh;
    background: var(--warm-bg);
    font-family: 'Lora', Georgia, serif;
    color: var(--warm-cream);
    overflow-x: hidden;
  }

  .lf-header {
    position: relative;
    width: 100%;
    background: linear-gradient(180deg, #0C0512 0%, #1A0C08 55%, #2A1808 100%);
    overflow: hidden;
    border-bottom: 1px solid var(--warm-border);
  }
  .lf-header-inner {
    position: relative;
    max-width: 900px;
    margin: 0 auto;
    padding: 0 16px 16px;
    display: flex;
    align-items: flex-end;
    gap: 14px;
  }

  .lf-grid {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px 14px 40px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
  }

  .lf-card {
    background: var(--warm-card);
    border: 1px solid var(--warm-border);
    border-radius: 12px;
    padding: 18px;
    position: relative;
    overflow: hidden;
    transition: border-color .25s, transform .2s;
  }
  .lf-card:hover { border-color: rgba(200,144,60,.52); }
  .lf-card--wide { grid-column: 1 / -1; }
  .lf-card--action { cursor: pointer; }
  .lf-card--action:hover { transform: translateY(-2px); }

  .lf-card__label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 10px;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--warm-gold);
    margin-bottom: 6px;
  }
  .lf-card__title {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 400;
    color: var(--warm-cream);
    margin-bottom: 4px;
  }
  .lf-card__sub {
    font-size: 12px;
    color: var(--warm-muted);
    font-style: italic;
  }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
    margin-top: 12px;
  }
  .cal-day {
    aspect-ratio: 1;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-family: 'Lora', serif;
  }

  .trophy-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
  }
  .trophy-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--warm-muted);
    text-align: center;
    width: 58px;
    cursor: default;
    position: relative;
  }
  .trophy-item__emoji { font-size: 22px; line-height: 1; }

  .mood-orb {
    width: 52px; height: 52px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
    transition: box-shadow .4s;
  }

  .lf-toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: rgba(14,6,2,.97); color: var(--warm-cream);
    font-family: 'Lora', serif; font-size: 13px;
    padding: 10px 20px; border-radius: 10px;
    border: 1px solid rgba(220,160,80,.4);
    box-shadow: 0 8px 32px rgba(0,0,0,.6);
    display: flex; align-items: center; gap: 10px;
    z-index: 999; animation: toastIn .3s ease both;
    white-space: nowrap;
  }
  @keyframes toastIn {
    from { opacity:0; transform:translateX(-50%) translateY(10px); }
    to   { opacity:1; transform:translateX(-50%) translateY(0); }
  }

  .lantern-cage { transition: box-shadow .4s ease; }
  .lantern-flame { animation: flicker 1.3s ease-in-out infinite; }
  @keyframes flicker {
    0%,100%{opacity:1;transform:scaleY(1) scaleX(1);}
    33%{opacity:.85;transform:scaleY(.9) scaleX(1.1);}
    66%{opacity:.95;transform:scaleY(1.1) scaleX(.95);}
  }

  @keyframes sway { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
  @keyframes pulse-glow { 0%,100%{opacity:.7} 50%{opacity:1} }
  @keyframes trophyFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--warm-bg); }
  ::-webkit-scrollbar-thumb { background: rgba(200,144,60,.3); border-radius: 3px; }
`;

/* ─────────────────────────────────────────────────────────────────────────
   SMALL COMPONENTS
───────────────────────────────────────────────────────────────────────── */
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="lf-toast">
      <span>{msg}</span>
      <span style={{ cursor:"pointer", opacity:.5 }} onClick={onClose}>×</span>
    </div>
  );
}

function Tip({ children, text }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative", display:"inline-flex" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && text && (
        <div style={{
          position:"absolute", bottom:"calc(100% + 6px)", left:"50%",
          transform:"translateX(-50%)", pointerEvents:"none",
          background:"rgba(14,6,2,.96)", color:"#F5DEB3",
          fontFamily:"'Lora',serif", fontSize:11, whiteSpace:"nowrap",
          padding:"5px 11px", borderRadius:7, zIndex:100,
          border:"1px solid rgba(220,160,80,.3)",
        }}>{text}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ROOM HEADER
───────────────────────────────────────────────────────────────────────── */
function RoomHeader({ dark, onToggleDark, user, genre, onAvatarUpload, onNameSave }) {
  const lamp = GENRE_LAMP[genre] || GENRE_LAMP.fantasy;
  const [now, setNow] = useState(new Date());
  const [showSession, setShowSession] = useState(false);
  const [loginTime, setLoginTime] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal]         = useState(user.name || "");
  const [nameSaving, setNameSaving]   = useState(false);
  const fileInputRef = useState(null);

  // keep nameVal in sync when user prop updates
  useEffect(() => { setNameVal(user.name || ""); }, [user.name]);

  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  // Read the same localStorage key Dashboard.jsx sets — so both show identical session time
  useEffect(() => {
    const STORAGE_KEY = "userLoginTimestamp";
    let saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      saved = Date.now().toString();
      localStorage.setItem(STORAGE_KEY, saved);
    }
    setLoginTime(parseInt(saved, 10));
  }, []);

  const s = now.getSeconds(), m = now.getMinutes(), h = now.getHours() % 12;
  const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [40 + r * Math.cos(a), 40 + r * Math.sin(a)]; };
  const [hx, hy] = pt(h * 30 + m * 0.5, 16);
  const [mx, my] = pt(m * 6 + s * 0.1, 22);
  const [sx, sy] = pt(s * 6, 26);

  const sessionSecs = loginTime ? Math.floor((now.getTime() - loginTime) / 1000) : 0;
  const sesH = Math.floor(sessionSecs / 3600);
  const sesM = Math.floor((sessionSecs % 3600) / 60);
  const sesS = sessionSecs % 60;
  const sessionLabel = sesH > 0
    ? `${sesH}h ${String(sesM).padStart(2,"0")}m`
    : `${String(sesM).padStart(2,"0")}:${String(sesS).padStart(2,"0")}`;

  const handleClockClick = () => setShowSession(v => !v);

  const handleAvatarClick = () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*";
    inp.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("avatar", file);
      try { await onAvatarUpload(formData); } catch {}
    };
    inp.click();
  };

  const handleNameSave = async () => {
    if (!nameVal.trim()) return;
    setNameSaving(true);
    try { await onNameSave(nameVal.trim()); } finally {
      setNameSaving(false);
      setEditingName(false);
    }
  };

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const greetIcon = now.getHours() < 12 ? "☀️" : now.getHours() < 17 ? "🌤️" : "🌙";

  return (
    <div className="lf-header">
      <div style={{
        height: 6,
        background: dark
          ? "linear-gradient(90deg,#0C0918,#1828A0 40%,#0C0918)"
          : "linear-gradient(90deg,#C8903C,#FFF8E6 40%,#FFD580 60%,#C8903C)",
        opacity: .7,
      }}/>

      <svg viewBox="0 0 900 160" style={{ width:"100%", display:"block" }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="roomWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={dark?"#0C0918":"#FFF8E6"}/>
            <stop offset="100%" stopColor={dark?"#1A1020":"#E8D8B0"}/>
          </linearGradient>
          <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={lamp.glow} stopOpacity=".45"/>
            <stop offset="100%" stopColor={lamp.glow} stopOpacity="0"/>
          </radialGradient>
          {dark && (
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8090FF" stopOpacity=".25"/>
              <stop offset="100%" stopColor="#3050C0" stopOpacity="0"/>
            </radialGradient>
          )}
        </defs>

        <rect width="900" height="160" fill="url(#roomWall)"/>

        {/* Window */}
        <rect x="30" y="12" width="160" height="130" rx="4" fill={dark?"#1828A0":"#B8E0FF"} opacity={dark?.18:.2}/>
        <rect x="30" y="12" width="160" height="130" rx="4" fill="none" stroke="#5A3010" strokeWidth="3"/>
        <line x1="110" y1="12" x2="110" y2="142" stroke="#5A3010" strokeWidth="2.5"/>
        <line x1="30" y1="77" x2="190" y2="77" stroke="#5A3010" strokeWidth="2.5"/>
        <rect x="32" y="14" width="77" height="62" rx="2" fill={dark?"rgba(80,100,220,.06)":"rgba(255,250,220,.14)"}/>
        {dark ? (
          <>
            <circle cx="155" cy="45" r="18" fill="#D8E8FF" opacity=".82"/>
            <circle cx="144" cy="45" r="18" fill="#1828A0" opacity=".9"/>
          </>
        ) : (
          <circle cx="155" cy="45" r="16" fill="#FFE87A" opacity=".88"
            style={{ animation:"pulse-glow 4s ease-in-out infinite" }}/>
        )}
        {dark && [[60,30],[90,55],[140,25],[170,60],[80,20],[120,40]].map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r=".9" fill="#E8F0FF" opacity=".7"
            style={{ animation:`pulse-glow ${2+i*.4}s ease-in-out ${i*.3}s infinite` }}/>
        ))}

        {/* Wall clock — click to toggle session duration */}
        <g transform="translate(220,20)" onClick={handleClockClick}
          style={{ cursor:"pointer" }}>
          <circle cx="40" cy="40" r="36" fill="#2E1C08" stroke={showSession?"#FF8C42":"#C8903C"} strokeWidth="2"/>
          <circle cx="40" cy="40" r="31" fill="#200E04" stroke="rgba(200,144,60,.2)" strokeWidth="1"/>
          {[...Array(12)].map((_,i)=>{
            const a=(i*30-90)*Math.PI/180;
            return <line key={i} x1={40+27*Math.cos(a)} y1={40+27*Math.sin(a)}
              x2={40+(i%3===0?31:30)*Math.cos(a)} y2={40+(i%3===0?31:30)*Math.sin(a)}
              stroke="#C8903C" strokeWidth={i%3===0?2:1} strokeLinecap="round"/>;
          })}
          {showSession ? (
            <>
              <text x="40" y="36" textAnchor="middle" fill="#FF8C42" fontFamily="serif" fontSize="7" letterSpacing=".04em">Session</text>
              <text x="40" y="48" textAnchor="middle" fill="#FFD580" fontFamily="serif" fontSize="11" fontWeight="bold">{sessionLabel}</text>
              <text x="40" y="62" textAnchor="middle" fill="rgba(200,144,60,.5)" fontFamily="serif" fontSize="7">⏱ tap to close</text>
            </>
          ) : (
            <>
              <line x1="40" y1="40" x2={hx} y2={hy} stroke="#F5DEB3" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="40" y1="40" x2={mx} y2={my} stroke="#F5DEB3" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="40" y1="40" x2={sx} y2={sy} stroke="#FF8C42" strokeWidth="1" strokeLinecap="round"/>
              <circle cx="40" cy="40" r="2.5" fill="#FF8C42"/>
              <text x="40" y="65" textAnchor="middle" fill="rgba(200,144,60,.55)" fontFamily="serif" fontSize="8">
                {now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
              </text>
            </>
          )}
        </g>

        {/* Hanging plant */}
        <g style={{ transformOrigin:"310px 0", animation:"sway 4.5s ease-in-out infinite" }}>
          <line x1="310" y1="0" x2="310" y2="28" stroke="#8B6040" strokeWidth="1.5"/>
          <ellipse cx="310" cy="30" rx="11" ry="4" fill="#7A4A28"/>
          {[[-9,44,-26],[-2,52,-7],[10,48,22],[-6,58,-14],[8,60,26]].map(([dx,y,rot],j)=>(
            <ellipse key={j} cx={310+dx} cy={y} rx={8+j%2} ry={3.5}
              fill={j%2===0?"#4E7C2A":"#5D8F32"} transform={`rotate(${rot},${310+dx},${y})`} opacity=".88"/>
          ))}
        </g>

        <ellipse cx="380" cy="100" rx="60" ry="50" fill="url(#lampGlow)"/>

        {/* Portrait frame — click to upload avatar */}
        <g transform="translate(450,18)" onClick={handleAvatarClick} style={{ cursor:"pointer" }}>
          <rect x="0" y="0" width="72" height="88" rx="3" fill="#7A5030" stroke="#C8903C" strokeWidth="1.5"/>
          <rect x="4" y="4" width="64" height="80" rx="2" fill={dark?"#2A1808":"#3A2248"}/>
          {user.avatar ? (
            <image href={user.avatar} x="4" y="4" width="64" height="68" clipPath="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>
          ) : (
            <>
              <circle cx="36" cy="28" r="13" fill="rgba(200,150,80,.3)"/>
              <path d="M10 72c0-14 12-26 26-26s26 12 26 26" fill="rgba(200,150,80,.2)"/>
              <text x="36" y="58" textAnchor="middle" fill="rgba(200,144,60,.45)" fontFamily="serif" fontSize="8">tap to</text>
              <text x="36" y="67" textAnchor="middle" fill="rgba(200,144,60,.45)" fontFamily="serif" fontSize="8">upload</text>
            </>
          )}
          {/* upload hint overlay */}
          <rect x="4" y="4" width="64" height="68" rx="2" fill="rgba(0,0,0,0)" stroke="none"
            style={{ transition:"fill .2s" }}
            onMouseEnter={e=>e.currentTarget.setAttribute("fill","rgba(0,0,0,.3)")}
            onMouseLeave={e=>e.currentTarget.setAttribute("fill","rgba(0,0,0,0)")}/>
          {/* Name plate */}
          <rect x="14" y="78" width="44" height="9" rx="2" fill="rgba(14,6,2,.8)" stroke="rgba(220,170,70,.35)" strokeWidth=".8"/>
          <text x="36" y="85" textAnchor="middle" fill="#F5DEB3" fontFamily="serif" fontSize="7" letterSpacing=".06em">
            {user.name || "…"}
          </text>
        </g>
        <defs>
          <clipPath id="avatarClip">
            <rect x="4" y="4" width="64" height="68" rx="2"/>
          </clipPath>
        </defs>

        {/* Dreamcatcher */}
        <g transform="translate(560,0)" style={{ transformOrigin:"0 0", animation:"sway 5.5s ease-in-out .8s infinite" }}>
          <line x1="20" y1="0" x2="20" y2="12" stroke="#C8A060" strokeWidth="1.2"/>
          <circle cx="20" cy="26" r="14" fill="none" stroke="#E8B860" strokeWidth="1.2"/>
          {[0,60,120,180,240,300].map((a,i)=>(
            <line key={i} x1="20" y1="26"
              x2={20+13*Math.cos(a*Math.PI/180)} y2={26+13*Math.sin(a*Math.PI/180)}
              stroke="#E8B860" strokeWidth=".6" opacity=".5"/>
          ))}
          <circle cx="20" cy="26" r="4" fill="none" stroke="#E8B860" strokeWidth=".8" opacity=".5"/>
          {[-6,0,6].map((dx,i)=>(
            <g key={i}>
              <line x1={20+dx} y1="40" x2={20+dx} y2={56+i*3} stroke="#C8A060" strokeWidth=".9"/>
              <ellipse cx={20+dx} cy={49+i*2} rx="3" ry="6" fill="#D4A060" opacity=".65"
                transform={`rotate(${(i-1)*12},${20+dx},${49+i*2})`}/>
            </g>
          ))}
        </g>

        {/* Bookshelf */}
        <rect x="650" y="40" width="230" height="8" rx="2" fill="#5C3A1C" stroke="#7A5028" strokeWidth="1"/>
        <rect x="650" y="48" width="230" height="3" fill="rgba(0,0,0,.22)"/>
        {[
          {x:658,h:36,c:"#B03020",s:"#7A1A10",w:14},
          {x:673,h:42,c:"#2E6B32",s:"#1A4A1E",w:11},
          {x:685,h:38,c:"#1A5FA0",s:"#0D3D6E",w:15},
          {x:701,h:34,c:"#5C3080",s:"#3A1A5C",w:12},
          {x:714,h:40,c:"#C8903C",s:"#8B6020",w:10},
          {x:725,h:36,c:"#8B2820",s:"#5A1010",w:13},
          {x:739,h:44,c:"#2E7D32",s:"#1B5020",w:11},
          {x:751,h:38,c:"#C07830",s:"#8B5020",w:14},
          {x:766,h:33,c:"#4A3080",s:"#2A1A60",w:12},
          {x:779,h:41,c:"#1565C0",s:"#0D3D80",w:10},
          {x:790,h:37,c:"#C84030",s:"#8B2A1A",w:13},
          {x:804,h:35,c:"#3A7A3A",s:"#224A22",w:11},
          {x:816,h:42,c:"#7A5030",s:"#5A3018",w:9,tilt:14},
          {x:824,h:38,c:"#3A5A38",s:"#253D25",w:7,tilt:-8},
        ].map((b,i)=>(
          <rect key={i} x={b.x} y={40-b.h} width={b.w} height={b.h} rx="1"
            fill={b.c} stroke={b.s} strokeWidth=".8"
            transform={b.tilt?`rotate(${b.tilt},${b.x+b.w/2},${40})`:""}/>
        ))}

        {/* Trophy shelf — all unearned until backend provides data */}
        <rect x="650" y="104" width="230" height="7" rx="2" fill="#5C3A1C" stroke="#7A5028" strokeWidth="1"/>
        {TROPHIES_DEFINITIONS.map((t,i)=>(
          <text key={t.id} x={665+i*34} y="101" textAnchor="middle" fontSize="15" opacity=".2">
            {t.emoji}
          </text>
        ))}

        <rect x="0" y="155" width="900" height="5" fill={dark?"#0A0712":"#1A0E08"} opacity=".9"/>
      </svg>

      {/* Header text row */}
      <div className="lf-header-inner">
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(15px,3.2vw,22px)",
            fontWeight:700, color: dark?"#A8C0FF":"#FFD580", letterSpacing:".01em" }}>
            {greeting}{user.name ? `, ${user.name}` : ""} {greetIcon}
          </div>
          <div style={{ fontFamily:"'Lora',serif", fontSize:"clamp(10px,1.8vw,13px)", fontStyle:"italic",
            color: dark?"rgba(168,192,255,.45)":"rgba(255,213,128,.5)", marginTop:2 }}>
            Your cozy corner awaits
          </div>
        </div>

        {/* Name display + inline editor — always visible, no absolute positioning */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0, gap:4 }}>
          {editingName ? (
            <div style={{ display:"flex", gap:4, alignItems:"center" }}>
              <input
                autoFocus
                value={nameVal}
                maxLength={24}
                onChange={e=>setNameVal(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter") handleNameSave(); if(e.key==="Escape") setEditingName(false); }}
                style={{
                  background:"rgba(14,6,2,.95)", border:"1px solid rgba(200,144,60,.6)",
                  borderRadius:5, color:"#F5DEB3", fontFamily:"'Lora',serif",
                  fontSize:12, padding:"4px 8px", width:100, outline:"none",
                }}
              />
              <button onClick={handleNameSave} disabled={nameSaving} style={{
                background:"#C8903C", border:"none", borderRadius:5,
                color:"#1A0A04", fontFamily:"'Lora',serif", fontSize:11,
                padding:"4px 8px", cursor:"pointer", fontWeight:600,
              }}>{nameSaving?"…":"✓"}</button>
              <button onClick={()=>setEditingName(false)} style={{
                background:"rgba(255,255,255,.07)", border:"1px solid rgba(200,144,60,.3)",
                borderRadius:5, color:"rgba(245,222,179,.6)", fontFamily:"'Lora',serif",
                fontSize:11, padding:"4px 8px", cursor:"pointer",
              }}>✕</button>
            </div>
          ) : (
            <div
              onClick={()=>setEditingName(true)}
              title="Edit name"
              style={{
                cursor:"pointer", display:"flex", alignItems:"center", gap:4,
                fontFamily:"'Lora',serif", fontSize:11, color:"rgba(200,144,60,.75)",
                borderRadius:4, padding:"3px 8px",
                border:"1px solid rgba(200,144,60,.25)",
                background:"rgba(14,6,2,.5)",
              }}
            >
              <span>{user.name || "add name"}</span>
              <span style={{ fontSize:9, opacity:.6 }}>✏️</span>
            </div>
          )}
        </div>

        {/* Streak badge — only shows when streak exists */}
        {user.currentStreak > 0 && (
          <div style={{
            background:"rgba(14,6,2,.7)", border:"1px solid rgba(200,144,60,.3)",
            borderRadius:10, padding:"8px 14px", textAlign:"center", flexShrink:0,
          }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(8px,1.4vw,10px)",
              letterSpacing:".15em", textTransform:"uppercase", color:"#C8903C", marginBottom:2 }}>
              Streak
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(16px,3vw,22px)",
              color:"#FF8C42", fontWeight:700, lineHeight:1 }}>
              {user.currentStreak}
              <span style={{ fontSize:"0.55em", color:"rgba(255,140,66,.6)", marginLeft:3 }}>days</span>
            </div>
            {user.currentStreak > 1 && (
              <div style={{ fontSize:10, color:"#FFD700", marginTop:2 }}>🔥 on fire</div>
            )}
          </div>
        )}

        <LanternToggle dark={dark} onToggle={onToggleDark}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   LANTERN TOGGLE
───────────────────────────────────────────────────────────────────────── */
function LanternToggle({ dark, onToggle }) {
  return (
    <Tip text={dark ? "Switch to day" : "Switch to night"}>
      <button onClick={onToggle} style={{
        background:"transparent", border:"none", cursor:"pointer", padding:0,
        display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0,
        filter: dark ? "drop-shadow(0 0 8px #FFA500)" : "none",
        transition:"filter .4s",
      }}>
        <div style={{ width:12, height:7, border:`2px solid ${dark?"#CDA87A":"#6B4F3F"}`,
          borderRadius:"6px 6px 0 0", borderBottom:"none",
          background:dark?"#8B7355":"#3E3227", marginBottom:-1 }}/>
        <div className="lantern-cage" style={{
          position:"relative", width:28, height:44,
          border:`2px solid ${dark?"#CDA87A":"#5D4A3A"}`,
          borderRadius:"14px 14px 13px 13px",
          boxShadow: dark ? "0 0 18px rgba(255,140,0,.55)" : "0 2px 6px rgba(0,0,0,.3)",
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"transparent",
        }}>
          {[...Array(4)].map((_,i)=>(
            <div key={i} style={{
              position:"absolute", width:1, height:"82%",
              background:dark?"#FFD700":"#8B7355",
              left:`${18+i*22}%`, top:"9%",
              opacity:dark?.9:.65,
              boxShadow: dark?"0 0 3px #FFA500":"none",
            }}/>
          ))}
          <div style={{ position:"absolute", top:-2, left:"50%", transform:"translateX(-50%)",
            width:20, height:3, background:dark?"#CDA87A":"#5D4A3A", borderRadius:"3px 3px 0 0" }}/>
          <div style={{ position:"absolute", bottom:-2, left:"50%", transform:"translateX(-50%)",
            width:22, height:4, background:dark?"#CDA87A":"#5D4A3A", borderRadius:"0 0 5px 5px" }}/>
          {dark ? (
            <div className="lantern-flame" style={{
              width:10, height:16,
              background:"radial-gradient(circle at 50% 30%,#FFE55C 0%,#FF8C00 80%)",
              borderRadius:"50% 50% 30% 30%",
              boxShadow:"0 0 12px #FF8C00,0 0 22px #FF4500",
              zIndex:2,
            }}/>
          ) : (
            <div style={{ width:7, height:7, background:"#2A3A3A", borderRadius:"50%", opacity:.3 }}/>
          )}
        </div>
        <div style={{ width:18, height:5, background:dark?"#CDA87A":"#5D4A3A",
          borderRadius:"0 0 6px 6px", marginTop:-1 }}/>
        <div style={{ fontFamily:"'Lora',serif", fontSize:9, color:"rgba(200,144,60,.5)",
          marginTop:3, letterSpacing:".05em" }}>
          {dark?"day":"night"}
        </div>
      </button>
    </Tip>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STREAK CALENDAR CARD
───────────────────────────────────────────────────────────────────────── */
function StreakCard({ streakDays, currentStreak, longestStreak }) {
  const today = new Date();
  const [displayDate, setDisplayDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = displayDate.getFullYear(), month = displayDate.getMonth();
  const monthName = displayDate.toLocaleString("default",{month:"long"});
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const streakMap = {};
  streakDays.forEach((v,i)=>{
    const d = new Date(today);
    d.setDate(d.getDate()-(streakDays.length-1-i));
    streakMap[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] = v;
  });

  const cells = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  const isToday = d => d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
  const getS = d => streakMap[`${year}-${month}-${d}`];

  const earned = streakDays.filter(Boolean).length;
  const total  = streakDays.length;

  return (
    <div className="lf-card">
      <div className="lf-card__label">Reading streak</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <div className="lf-card__title">{monthName} {year}</div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={()=>setDisplayDate(new Date(year,month-1,1))}
            style={{ background:"none",border:"none",color:"rgba(200,144,60,.7)",cursor:"pointer",fontSize:16,lineHeight:1 }}>‹</button>
          <button onClick={()=>setDisplayDate(new Date(year,month+1,1))}
            style={{ background:"none",border:"none",color:"rgba(200,144,60,.7)",cursor:"pointer",fontSize:16,lineHeight:1 }}>›</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"flex", gap:16, marginBottom:10 }}>
        <div style={{ fontSize:11, color:"rgba(200,144,60,.7)" }}>
          🔥 Current: <strong style={{ color:"#FFD580" }}>{currentStreak} days</strong>
        </div>
        <div style={{ fontSize:11, color:"rgba(200,144,60,.7)" }}>
          🏆 Best: <strong style={{ color:"#FFD580" }}>{longestStreak} days</strong>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height:3, borderRadius:2, background:"rgba(255,255,255,.08)", marginBottom:10, overflow:"hidden" }}>
        <div style={{ height:"100%", width: total > 0 ? `${(earned/total)*100}%` : "0%",
          background:"linear-gradient(90deg,#C8903C,#FFD580)", borderRadius:2 }}/>
      </div>

      {/* Day labels */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
        {["S","M","T","W","T","F","S"].map((d,i)=>(
          <div key={i} style={{ textAlign:"center", fontSize:9, color:"rgba(200,150,80,.5)", fontWeight:600 }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="cal-grid">
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const logged = getS(d), tod = isToday(d);
          return (
            <div key={i} className="cal-day" style={{
              background: tod ? "#C8903C"
                : logged===true  ? "rgba(255,160,50,.55)"
                : logged===false ? "rgba(255,60,60,.15)"
                : "rgba(255,255,255,.05)",
              border: tod ? "1px solid #FFD700" : "1px solid transparent",
              color: tod ? "#1A0A04"
                : logged===true  ? "#FFD700"
                : logged===false ? "rgba(255,100,100,.6)"
                : "rgba(200,160,80,.35)",
              fontWeight: tod ? 700 : 400,
            }}>
              {logged===true && !tod ? "✓" : logged===false ? "×" : d}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:10, fontSize:11, color:"rgba(200,144,60,.55)", fontStyle:"italic" }}>
        {earned} of {total} days logged this period
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TROPHIES CARD  — all locked until backend provides data
───────────────────────────────────────────────────────────────────────── */
function TrophiesCard() {
  return (
    <div className="lf-card">
      <div className="lf-card__label">Shelf of honours</div>
      <div className="lf-card__title">Trophies</div>
      <div className="trophy-grid">
        {TROPHIES_DEFINITIONS.map((t,i)=>(
          <Tip key={t.id} text={t.label}>
            <div className="trophy-item">
              <div className="trophy-item__emoji" style={{
                filter:"grayscale(1) opacity(.22)",
                cursor:"not-allowed",
              }}>{t.emoji}</div>
              <div style={{ fontSize:10, color:"rgba(200,160,80,.25)",
                lineHeight:1.3, maxWidth:54, textAlign:"center" }}>
                {t.label.split(" ").slice(0,3).join(" ")}
              </div>
            </div>
          </Tip>
        ))}
      </div>
      <div style={{ marginTop:12, fontSize:11, color:"rgba(200,144,60,.35)", fontStyle:"italic" }}>
        Complete stories to earn trophies
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MOOD LAMP CARD
───────────────────────────────────────────────────────────────────────── */
function MoodCard() {
  const lamp = GENRE_LAMP[LATEST_GENRE] || GENRE_LAMP.fantasy;
  return (
    <div className="lf-card" style={{ display:"flex", alignItems:"center", gap:16 }}>
      <div className="mood-orb" style={{
        background:`radial-gradient(circle at 40% 35%,${lamp.glow}55,${lamp.color}33)`,
        boxShadow:`0 0 24px ${lamp.glow}88, inset 0 0 12px ${lamp.glow}44`,
        border:`1px solid ${lamp.color}66`,
      }}>
        <svg viewBox="0 0 52 80" width="28" height="44">
          <rect x="23" y="38" width="6" height="30" rx="3" fill="#5A3520"/>
          <line x1="26" y1="38" x2="15" y2="18" stroke="#5A3520" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M3 18 L26 10 L26 26 Z" fill={lamp.color}/>
          <circle cx="14" cy="18" r="5" fill={lamp.glow} opacity=".95"/>
        </svg>
      </div>
      <div>
        <div className="lf-card__label">Mood lamp</div>
        <div className="lf-card__title" style={{ color: lamp.glow }}>{lamp.label}</div>
        <div className="lf-card__sub">Current reading genre</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ACTION CARDS
───────────────────────────────────────────────────────────────────────── */
function ActionCard({ icon, label, title, sub, onClick, accentColor="#C8903C" }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="lf-card lf-card--action"
      onClick={onClick}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        borderColor: hov ? accentColor+"88" : undefined,
        boxShadow: hov ? `0 0 20px ${accentColor}22` : "none",
        transition:"border-color .25s,box-shadow .25s,transform .2s",
        transform: hov ? "translateY(-3px)" : "none",
      }}>
      <div style={{ fontSize:32, marginBottom:10 }}>{icon}</div>
      <div className="lf-card__label">{label}</div>
      <div className="lf-card__title">{title}</div>
      <div className="lf-card__sub">{sub}</div>
      <div style={{
        marginTop:14, display:"inline-flex", alignItems:"center", gap:6,
        fontFamily:"'Cormorant Garamond',serif", fontSize:12,
        letterSpacing:".12em", textTransform:"uppercase",
        color: accentColor, opacity: hov ? 1 : .55, transition:"opacity .2s",
      }}>
        Open <span style={{ fontSize:14 }}>→</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   DELETED STORIES CARD — empty until backend provides data
───────────────────────────────────────────────────────────────────────── */
function DeletedCard({ deleted }) {
  return (
    <div className="lf-card">
      <div className="lf-card__label">Dustbin</div>
      <div className="lf-card__title" style={{ marginBottom:10 }}>Deleted tales</div>
      {deleted.length === 0 ? (
        <div className="lf-card__sub">The bin is empty</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {deleted.map(s=>(
            <div key={s.id} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"8px 12px", borderRadius:8,
              background:"rgba(255,255,255,.04)",
              border:"1px solid rgba(255,60,60,.12)",
            }}>
              <span style={{ fontSize:18 }}>🗑</span>
              <span style={{ fontSize:12, color:"rgba(245,222,179,.55)", fontStyle:"italic",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   NAV BOOKS CARD
───────────────────────────────────────────────────────────────────────── */
const TEAM_PROFILES = [
  {
    name: "Harshith",
    role: "Backend Developer",
    linkedin: "https://linkedin.com/in/yourprofile",
    github: "https://github.com/yourusername",
    instagram: "https://instagram.com/yourusername",
  },
  {
    name: "Nausheen",
    role: "Frontend Designer",
    linkedin: "https://linkedin.com/in/teammate1",
    github: "https://github.com/teammate1",
    instagram: "https://instagram.com/teammate1",
  },
  {
    name: "Full Stack Developer",
    role: "Backend Engineer",
    linkedin: "https://linkedin.com/in/teammate2",
    github: "https://github.com/teammate2",
    instagram: "https://instagram.com/teammate2",
  },
];

function NavCard({ onNav }) {
  const [showContact, setShowContact] = useState(false);
  const cardRef = useRef(null);

  const pages = [
    { title:"Logout",  color:"#B03020", spine:"#7A1A10" },
    { title:"About",   color:"#2E6B32", spine:"#1A4A1E" },
    { title:"Contact", color:"#1A5FA0", spine:"#0D3D6E" },
  ];

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) setShowContact(false);
    };
    if (showContact) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showContact]);

  const handleNav = (title) => {
    if (title === "Contact") { setShowContact(true); return; }
    onNav(title);
  };

  return (
    <div className="lf-card" style={{ position:"relative" }}>
      <div className="lf-card__label">Bookshelf navigation</div>
      <div className="lf-card__title" style={{ marginBottom:14 }}>Pages</div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {pages.map(p=>(
          <button key={p.title} onClick={()=>handleNav(p.title)} style={{
            background:`linear-gradient(135deg,${p.spine},${p.color})`,
            border:"none", borderRadius:6, padding:"8px 16px",
            color:"rgba(255,255,255,.85)", fontFamily:"'Lora',serif",
            fontSize:12, cursor:"pointer", letterSpacing:".05em",
            boxShadow:"0 2px 8px rgba(0,0,0,.35)",
            transition:"transform .18s, box-shadow .18s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,.45)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.35)";}}>
            {p.title}
          </button>
        ))}
      </div>

      {/* ── Parchment Contact Card ── */}
      {showContact && (
        <div ref={cardRef} style={{
          position:"fixed", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          width:320, zIndex:1200,
          background:"#F5E8C7",
          border:"3px solid #8B6020",
          borderRadius:12,
          boxShadow:"0 20px 40px rgba(0,0,0,.75), inset 0 0 80px rgba(139,96,32,.15)",
          overflow:"hidden",
        }}>
          {/* Wax seal */}
          <div style={{
            position:"absolute", top:-18, left:"50%", transform:"translateX(-50%)",
            width:52, height:52, background:"#9C2A2A", borderRadius:"50%",
            border:"4px solid #FFD700", boxShadow:"0 4px 12px rgba(0,0,0,.6)",
            display:"flex", alignItems:"center", justifyContent:"center", zIndex:10,
          }}>
            <span style={{ color:"#FFD700", fontSize:22, fontWeight:"bold" }}>✧</span>
          </div>

          {/* Header */}
          <div style={{
            background:"linear-gradient(#8B6020,#5C3F14)",
            padding:"28px 20px 14px", textAlign:"center",
            borderBottom:"2px solid #C8903C",
          }}>
            <div style={{ color:"#F5DEB3", fontFamily:"'Cormorant Garamond',serif", fontSize:22, letterSpacing:"1.5px" }}>
              Our Team
            </div>
            <div style={{ color:"#E8D5A3", fontSize:12, marginTop:4 }}>
              Connect · Collaborate · Create
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{
            maxHeight:360, overflowY:"auto", padding:"20px 20px 8px",
            background:"repeating-linear-gradient(#F5E8C7,#F5E8C7 28px,#EDE0B8 28px,#EDE0B8 29px)",
            fontFamily:"'Lora',serif",
          }}>
            {TEAM_PROFILES.map((m, i) => (
              <div key={i} style={{
                marginBottom: i === TEAM_PROFILES.length-1 ? 0 : 14,
                padding:14, background:"rgba(255,255,255,.75)",
                border:"1px solid #C8903C", borderRadius:8,
                boxShadow:"inset 0 2px 6px rgba(0,0,0,.1)",
              }}>
                <div style={{ fontSize:16, fontWeight:600, color:"#3C2F1E", marginBottom:2 }}>{m.name}</div>
                <div style={{ color:"#8B6020", fontSize:12, marginBottom:8 }}>{m.role}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" style={{ color:"#0A66C2", textDecoration:"none", fontSize:13 }}>→ LinkedIn</a>
                  <a href={m.github}   target="_blank" rel="noopener noreferrer" style={{ color:"#24292E", textDecoration:"none", fontSize:13 }}>→ GitHub</a>
                  <a href={m.instagram} target="_blank" rel="noopener noreferrer" style={{ color:"#E1306C", textDecoration:"none", fontSize:13 }}>→ Instagram</a>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding:"12px 20px", background:"#EDE0B8",
            borderTop:"2px solid #8B6020", display:"flex", justifyContent:"center",
          }}>
            <button onClick={()=>setShowContact(false)} style={{
              background:"#8B6020", color:"#F5DEB3", border:"none",
              padding:"8px 24px", borderRadius:20, cursor:"pointer",
              fontSize:13, fontFamily:"'Lora',serif",
              boxShadow:"0 3px 8px rgba(0,0,0,.3)",
            }}>
              Close Scroll
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────────────────── */
export default function LofiDashboardSmall() {
  const [dark,      setDark     ] = useState(false);
  const [toast,     setToast    ] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [user,      setUser     ] = useState({ name: "", avatar: null, currentStreak: 0, longestStreak: 0 });
  const [streakDays,setStreakDays] = useState([]);
  const [deleted,   setDeleted  ] = useState([]);

  const show = m => setToast(m);

  /* ── Fetch user + streak on mount ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // User profile
    api.get("/auth/me")
      .then(res => setUser(res.data.user))
      .catch(err => {
        console.error("Failed to load user:", err);
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
      });

    // Streak data
    api.get("/auth/streak")
      .then(res => {
        setStreakDays(res.data.streakDays);
        // Merge streak counts into user state
        setUser(prev => ({
          ...prev,
          currentStreak: res.data.currentStreak,
          longestStreak: res.data.longestStreak,
        }));
      })
      .catch(err => console.error("Failed to load streak:", err));

    // Deleted stories — set empty until you build this endpoint
    setDeleted([]);
  }, []);

  /* ── Avatar upload handler ── */
  const handleAvatarUpload = async (formData) => {
    try {
      const res = await api.post("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(prev => ({ ...prev, avatar: res.data.avatar }));
      show("🖼️ Avatar updated!");
    } catch (err) {
      console.error("Avatar upload failed:", err);
      show("❌ Upload failed, please try again");
    }
  };

  /* ── Logout handler ── */
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // proceed even if server call fails
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userLoginTimestamp");
      window.location.href = "/login"; // adjust path if yours differs
    }
  };

  /* ── Name update handler ── */
  const handleNameSave = async (name) => {
    try {
      await api.patch("/auth/update-name", { name });
      setUser(prev => ({ ...prev, name }));
      show(`✨ Name updated to "${name}"`);
    } catch (err) {
      console.error("Name update failed:", err);
      show("❌ Could not update name");
      throw err; // re-throw so RoomHeader knows it failed
    }
  };

  /* ── Theme overrides ── */
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.style.setProperty("--warm-bg",     "#08060F");
      root.style.setProperty("--warm-paper",  "#0E0C1E");
      root.style.setProperty("--warm-card",   "#0C0A1A");
      root.style.setProperty("--warm-border", "rgba(100,130,200,.25)");
      root.style.setProperty("--warm-gold",   "#A8C0FF");
      root.style.setProperty("--warm-cream",  "#D0D8FF");
      root.style.setProperty("--warm-muted",  "rgba(180,200,255,.45)");
      root.style.setProperty("--warm-dim",    "rgba(180,200,255,.22)");
    } else {
      root.style.setProperty("--warm-bg",     "#1C0F06");
      root.style.setProperty("--warm-paper",  "#2A1808");
      root.style.setProperty("--warm-card",   "#221204");
      root.style.setProperty("--warm-border", "rgba(200,144,60,.28)");
      root.style.setProperty("--warm-gold",   "#C8903C");
      root.style.setProperty("--warm-cream",  "#F5DEB3");
      root.style.setProperty("--warm-muted",  "rgba(245,222,179,.45)");
      root.style.setProperty("--warm-dim",    "rgba(245,222,179,.22)");
    }
  }, [dark]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="lf-root">
        <RoomHeader
          dark={dark}
          onToggleDark={() => setDark(d => !d)}
          user={user}
          genre={LATEST_GENRE}
          onAvatarUpload={handleAvatarUpload}
          onNameSave={handleNameSave}
        />

        <div className="lf-grid">
          {/* Row 1: Generate + Archive */}
          <ActionCard
            icon="💻"
            label="Welcome"
            title="Generate a new story"
            sub="Open the writing desk and begin a new tale"
            onClick={() => show("✨ Starting a new tale!")}
            accentColor="#FFD580"
          />
          <ActionCard
            icon="📦"
            label="Archive box"
            title="Story archive"
            sub="All your tales, bound and shelved"
            onClick={() => show("📦 Opening Story Archive…")}
            accentColor="#C8903C"
          />

          {/* Row 2: Streak calendar (wide) */}
          <div className="lf-card--wide">
            <StreakCard
              streakDays={streakDays}
              currentStreak={user.currentStreak}
              longestStreak={user.longestStreak}
            />
          </div>

          {/* Row 3: Trophies + Mood */}
          <TrophiesCard/>
          <MoodCard/>

          {/* Row 4: Nav + Deleted */}
          <NavCard onNav={page => {
            if (page === "About") setShowAbout(true);
            else if (page === "Logout") handleLogout();
            else show(`📖 Navigating to ${page}…`);
          }}/>
          <DeletedCard deleted={deleted}/>
        </div>

        {toast && <Toast msg={toast} onClose={() => setToast(null)}/>}
        {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}
      </div>
    </>
  );
}