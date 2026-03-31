import { useState, useEffect } from "react";
import AboutPage from "../components/AboutPage";
import api from "../api/axios";

/* ─────────────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────────────── */
const MOCK_USER = {
  name: "Arya",
  avatar: null,
  minutesThisSession: 42,
  isConsistent: true,
};
const MOCK_TROPHIES = [
  { id:1, emoji:"📖", label:"First Story Read",                    earned:true  },
  { id:2, emoji:"🌙", label:"Night Owl – 3 stories after midnight",earned:true  },
  { id:3, emoji:"🔥", label:"7-Day Streak",                        earned:false },
  { id:4, emoji:"✨", label:"Story Weaver – 5 tales generated",    earned:false },
  { id:5, emoji:"🌟", label:"Archive Keeper",                      earned:false },
  { id:6, emoji:"🎭", label:"Genre Explorer",                      earned:false },
];
const MOCK_STREAK = [
  true,true,false,true,true,true,false,
  true,true,true,true,false,true,true,
  false,true,true,true,true,true,false,
  true,true,false,true,true,true,true,
  true,true,
];
const MOCK_DELETED = [
  { id:1, title:"The Lighthouse at the Edge of Memory" },
  { id:2, title:"A Fox Who Learned to Forgive" },
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

  /* ── room header ── */
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

  /* ── card grid ── */
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

  /* ── streak calendar ── */
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

  /* ── trophies ── */
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
  .trophy-item__emoji {
    font-size: 22px;
    line-height: 1;
  }

  /* ── mood lamp ── */
  .mood-orb {
    width: 52px; height: 52px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
    transition: box-shadow .4s;
  }

  /* ── toast ── */
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

  /* ── clock ── */
  .lf-clock-ring {
    animation: secondPulse 1s ease-in-out infinite;
  }
  @keyframes secondPulse { 0%,100%{opacity:.9} 50%{opacity:.6} }

  /* ── lantern toggle ── */
  .lantern-cage {
    transition: box-shadow .4s ease;
  }
  .lantern-flame {
    animation: flicker 1.3s ease-in-out infinite;
  }
  @keyframes flicker {
    0%,100%{opacity:1;transform:scaleY(1) scaleX(1);}
    33%{opacity:.85;transform:scaleY(.9) scaleX(1.1);}
    66%{opacity:.95;transform:scaleY(1.1) scaleX(.95);}
  }

  /* ── room header scene elements ── */
  @keyframes sway { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
  @keyframes pulse-glow { 0%,100%{opacity:.7} 50%{opacity:1} }
  @keyframes trophyFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

  /* ── scrollbar ── */
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

/* ── Tooltip ── */
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
   ROOM HEADER — mini illustrated scene
───────────────────────────────────────────────────────────────────────── */
function RoomHeader({ dark, onToggleDark, user, genre }) {
  const lamp = GENRE_LAMP[genre] || GENRE_LAMP.fantasy;
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  const s = now.getSeconds(), m = now.getMinutes(), h = now.getHours() % 12;
  const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; };
  const [hx, hy] = pt(h * 30 + m * 0.5, 16);
  const [mx, my] = pt(m * 6 + s * 0.1, 22);
  const [sx, sy] = pt(s * 6, 26);

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const greetIcon = now.getHours() < 12 ? "☀️" : now.getHours() < 17 ? "🌤️" : "🌙";

  return (
    <div className="lf-header">
      {/* Skylight gradient strip */}
      <div style={{
        height: 6,
        background: dark
          ? "linear-gradient(90deg,#0C0918,#1828A0 40%,#0C0918)"
          : "linear-gradient(90deg,#C8903C,#FFF8E6 40%,#FFD580 60%,#C8903C)",
        opacity: .7,
      }}/>

      {/* Scene SVG */}
      <svg viewBox="0 0 900 160" style={{ width:"100%", display:"block" }}
        preserveAspectRatio="xMidYMid meet">
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

        {/* Wall */}
        <rect width="900" height="160" fill="url(#roomWall)"/>

        {/* Window */}
        <rect x="30" y="12" width="160" height="130" rx="4" fill={dark?"#1828A0":"#B8E0FF"} opacity={dark?.18:.2}/>
        <rect x="30" y="12" width="160" height="130" rx="4" fill="none" stroke="#5A3010" strokeWidth="3"/>
        <line x1="110" y1="12" x2="110" y2="142" stroke="#5A3010" strokeWidth="2.5"/>
        <line x1="30" y1="77" x2="190" y2="77" stroke="#5A3010" strokeWidth="2.5"/>
        {/* Window pane shimmer */}
        <rect x="32" y="14" width="77" height="62" rx="2" fill={dark?"rgba(80,100,220,.06)":"rgba(255,250,220,.14)"}/>
        {/* Moon or sun in window */}
        {dark ? (
          <>
            <circle cx="155" cy="45" r="18" fill="#D8E8FF" opacity=".82"/>
            <circle cx="144" cy="45" r="18" fill={dark?"#1828A0":"#B8E0FF"} opacity=".9"/>
          </>
        ) : (
          <circle cx="155" cy="45" r="16" fill="#FFE87A" opacity=".88"
            style={{ animation:"pulse-glow 4s ease-in-out infinite" }}/>
        )}
        {/* Stars (dark) */}
        {dark && [[60,30],[90,55],[140,25],[170,60],[80,20],[120,40]].map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r=".9" fill="#E8F0FF" opacity=".7"
            style={{ animation:`pulse-glow ${2+i*.4}s ease-in-out ${i*.3}s infinite` }}/>
        ))}

        {/* Wall clock */}
        <g transform="translate(220,20)">
          <circle cx="40" cy="40" r="36" fill="#2E1C08" stroke="#C8903C" strokeWidth="2"/>
          <circle cx="40" cy="40" r="31" fill="#200E04" stroke="rgba(200,144,60,.2)" strokeWidth="1"/>
          {[...Array(12)].map((_,i)=>{
            const a=(i*30-90)*Math.PI/180;
            return <line key={i} x1={40+27*Math.cos(a)} y1={40+27*Math.sin(a)}
              x2={40+(i%3===0?31:30)*Math.cos(a)} y2={40+(i%3===0?31:30)*Math.sin(a)}
              stroke="#C8903C" strokeWidth={i%3===0?2:1} strokeLinecap="round"/>;
          })}
          <line x1="40" y1="40" x2={hx+10} y2={hy+10} stroke="#F5DEB3" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="40" y1="40" x2={mx+10} y2={my+10} stroke="#F5DEB3" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="40" y1="40" x2={sx+10} y2={sy+10} stroke="#FF8C42" strokeWidth="1" strokeLinecap="round"/>
          <circle cx="40" cy="40" r="2.5" fill="#FF8C42"/>
          <text x="40" y="65" textAnchor="middle" fill="rgba(200,144,60,.55)" fontFamily="serif" fontSize="8">
            {now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
          </text>
        </g>

        {/* Hanging plant (left) */}
        <g style={{ transformOrigin:"310px 0", animation:"sway 4.5s ease-in-out infinite" }}>
          <line x1="310" y1="0" x2="310" y2="28" stroke="#8B6040" strokeWidth="1.5"/>
          <ellipse cx="310" cy="30" rx="11" ry="4" fill="#7A4A28"/>
          {[[-9,44,-26],[-2,52,-7],[10,48,22],[-6,58,-14],[8,60,26]].map(([dx,y,rot],j)=>(
            <ellipse key={j} cx={310+dx} cy={y} rx={8+j%2} ry={3.5}
              fill={j%2===0?"#4E7C2A":"#5D8F32"} transform={`rotate(${rot},${310+dx},${y})`} opacity=".88"/>
          ))}
        </g>

        {/* Lamp glow orb */}
        <ellipse cx="380" cy="100" rx="60" ry="50" fill="url(#lampGlow)"/>

        {/* Portrait frame */}
        <g transform="translate(450,18)">
          <rect x="0" y="0" width="72" height="88" rx="3" fill="#7A5030" stroke="#C8903C" strokeWidth="1.5"/>
          <rect x="4" y="4" width="64" height="80" rx="2" fill={dark?"#2A1808":"#3A2248"}/>
          {/* silhouette */}
          <circle cx="36" cy="28" r="13" fill="rgba(200,150,80,.3)"/>
          <path d="M10 72c0-14 12-26 26-26s26 12 26 26" fill="rgba(200,150,80,.2)"/>
          <text x="36" y="58" textAnchor="middle" fill="rgba(200,150,80,.45)" fontFamily="serif" fontSize="6" fontStyle="italic">
            {user.name}
          </text>
          <rect x="14" y="78" width="44" height="9" rx="2" fill="rgba(14,6,2,.8)" stroke="rgba(220,170,70,.35)" strokeWidth=".8"/>
          <text x="36" y="85" textAnchor="middle" fill="#F5DEB3" fontFamily="serif" fontSize="7" letterSpacing=".06em">{user.name}</text>
        </g>

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

        {/* Bookshelf strip */}
        <rect x="650" y="40" width="230" height="8" rx="2" fill="#5C3A1C" stroke="#7A5028" strokeWidth="1"/>
        <rect x="650" y="48" width="230" height="3" fill="rgba(0,0,0,.22)"/>
        {/* Mini books */}
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
          // leaning
          {x:816,h:42,c:"#7A5030",s:"#5A3018",w:9,tilt:14},
          {x:824,h:38,c:"#3A5A38",s:"#253D25",w:7,tilt:-8},
        ].map((b,i)=>(
          <rect key={i} x={b.x} y={40-b.h} width={b.w} height={b.h} rx="1"
            fill={b.c} stroke={b.s} strokeWidth=".8"
            transform={b.tilt?`rotate(${b.tilt},${b.x+b.w/2},${40})`:""}/>
        ))}
        {/* Trophy row */}
        <rect x="650" y="104" width="230" height="7" rx="2" fill="#5C3A1C" stroke="#7A5028" strokeWidth="1"/>
        {MOCK_TROPHIES.map((t,i)=>(
          <text key={t.id} x={665+i*34} y="101" textAnchor="middle"
            fontSize={t.earned?18:15}
            opacity={t.earned?1:.2}
            style={{ filter: t.earned?"drop-shadow(0 0 5px rgba(255,200,80,.8))":"none",
              animation: t.earned?`trophyFloat ${2.4+i*.35}s ease-in-out infinite`:"none" }}>
            {t.emoji}
          </text>
        ))}

        {/* Floor line */}
        <rect x="0" y="155" width="900" height="5" fill={dark?"#0A0712":"#1A0E08"} opacity=".9"/>
      </svg>

      {/* Header text row */}
      <div className="lf-header-inner">
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(15px,3.2vw,22px)",
            fontWeight:700, color: dark?"#A8C0FF":"#FFD580", letterSpacing:".01em" }}>
            {greeting}, {user.name} {greetIcon}
          </div>
          <div style={{ fontFamily:"'Lora',serif", fontSize:"clamp(10px,1.8vw,13px)", fontStyle:"italic",
            color: dark?"rgba(168,192,255,.45)":"rgba(255,213,128,.5)", marginTop:2 }}>
            Your cozy corner awaits
          </div>
        </div>

        {/* Session badge */}
        <div style={{
          background:"rgba(14,6,2,.7)", border:"1px solid rgba(200,144,60,.3)",
          borderRadius:10, padding:"8px 14px", textAlign:"center", flexShrink:0,
        }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(8px,1.4vw,10px)",
            letterSpacing:".15em", textTransform:"uppercase", color:"#C8903C", marginBottom:2 }}>
            Session
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(16px,3vw,22px)",
            color:"#FF8C42", fontWeight:700, lineHeight:1 }}>
            {MOCK_USER.minutesThisSession}<span style={{ fontSize:"0.55em", color:"rgba(255,140,66,.6)", marginLeft:3 }}>min</span>
          </div>
          {user.isConsistent && (
            <div style={{ fontSize:10, color:"#FFD700", marginTop:2 }}>🔥 streak</div>
          )}
        </div>

        {/* Lantern toggle */}
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
        display:"flex", flexDirection:"column", alignItems:"center",
        flexShrink:0,
        filter: dark ? "drop-shadow(0 0 8px #FFA500)" : "none",
        transition:"filter .4s",
      }}>
        {/* hanger */}
        <div style={{ width:12, height:7, border:`2px solid ${dark?"#CDA87A":"#6B4F3F"}`,
          borderRadius:"6px 6px 0 0", borderBottom:"none",
          background:dark?"#8B7355":"#3E3227", marginBottom:-1 }}/>
        {/* cage */}
        <div className="lantern-cage" style={{
          position:"relative", width:28, height:44,
          border:`2px solid ${dark?"#CDA87A":"#5D4A3A"}`,
          borderRadius:"14px 14px 13px 13px",
          boxShadow: dark ? "0 0 18px rgba(255,140,0,.55)" : "0 2px 6px rgba(0,0,0,.3)",
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"transparent",
        }}>
          {/* bars */}
          {[...Array(4)].map((_,i)=>(
            <div key={i} style={{
              position:"absolute", width:1, height:"82%",
              background:dark?"#FFD700":"#8B7355",
              left:`${18+i*22}%`, top:"9%",
              opacity:dark?.9:.65,
              boxShadow: dark?"0 0 3px #FFA500":"none",
            }}/>
          ))}
          {/* top ring */}
          <div style={{ position:"absolute", top:-2, left:"50%", transform:"translateX(-50%)",
            width:20, height:3, background:dark?"#CDA87A":"#5D4A3A", borderRadius:"3px 3px 0 0" }}/>
          {/* bottom ring */}
          <div style={{ position:"absolute", bottom:-2, left:"50%", transform:"translateX(-50%)",
            width:22, height:4, background:dark?"#CDA87A":"#5D4A3A", borderRadius:"0 0 5px 5px" }}/>
          {/* flame or empty */}
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
        {/* base */}
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
function StreakCard({ streakDays }) {
  const today = new Date();
  const [displayDate, setDisplayDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = displayDate.getFullYear(), month = displayDate.getMonth();
  const monthName = displayDate.toLocaleString("default",{month:"long"});
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const streakMap = {};
  streakDays.forEach((v,i)=>{
    const d = new Date(today); d.setDate(d.getDate()-(streakDays.length-1-i));
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

      {/* Progress bar */}
      <div style={{ height:3, borderRadius:2, background:"rgba(255,255,255,.08)", marginBottom:10, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${(earned/total)*100}%`,
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
   TROPHIES CARD
───────────────────────────────────────────────────────────────────────── */
function TrophiesCard() {
  return (
    <div className="lf-card">
      <div className="lf-card__label">Shelf of honours</div>
      <div className="lf-card__title">Trophies</div>
      <div className="trophy-grid">
        {MOCK_TROPHIES.map((t,i)=>(
          <Tip key={t.id} text={t.label}>
            <div className="trophy-item">
              <div className="trophy-item__emoji" style={{
                filter: t.earned ? "drop-shadow(0 0 6px rgba(255,200,80,.8))" : "grayscale(1) opacity(.22)",
                cursor: t.earned ? "pointer" : "not-allowed",
                animation: t.earned ? `trophyFloat ${2.4+i*.35}s ease-in-out infinite` : "none",
              }}>{t.emoji}</div>
              <div style={{ fontSize:10, color: t.earned?"rgba(255,213,128,.65)":"rgba(200,160,80,.25)",
                lineHeight:1.3, maxWidth:54, textAlign:"center" }}>
                {t.label.split(" ").slice(0,3).join(" ")}
              </div>
            </div>
          </Tip>
        ))}
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
      {/* Lamp orb */}
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
   ACTION CARDS  (Laptop / Archive / Dustbin)
───────────────────────────────────────────────────────────────────────── */
function ActionCard({ icon, label, title, sub, onClick, accentColor="#C8903C" }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="lf-card lf-card--action"
      onClick={onClick}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{ borderColor: hov ? accentColor+"88" : undefined,
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
   DELETED STORIES CARD
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
function NavCard({ onNav }) {
  const pages = [
    { title:"Home",    color:"#B03020", spine:"#7A1A10" },
    { title:"About",   color:"#2E6B32", spine:"#1A4A1E" },
    { title:"Contact", color:"#1A5FA0", spine:"#0D3D6E" },
    { title:"GitHub",  color:"#5C3080", spine:"#3A1A5C" },
  ];
  return (
    <div className="lf-card">
      <div className="lf-card__label">Bookshelf navigation</div>
      <div className="lf-card__title" style={{ marginBottom:14 }}>Pages</div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {pages.map(p=>(
          <button key={p.title} onClick={()=>onNav(p.title)} style={{
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
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN — SmallDashboard
───────────────────────────────────────────────────────────────────────── */
export default function LofiDashboardSmall() {
  const [dark,  setDark ] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [user, setUser] = useState({ name: "", avatar: null });
  const show = m => setToast(m);

  // Load real user from backend on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api.get("/auth/me")
      .then(res => setUser(res.data.user))
      .catch(err => {
        console.error("Failed to load user:", err);
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
      });
  }, []);

  // Theme surface overrides for dark mode
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
            <StreakCard streakDays={MOCK_STREAK}/>
          </div>

          {/* Row 3: Trophies + Mood */}
          <TrophiesCard/>
          <MoodCard/>

          {/* Row 4: Nav + Deleted */}
          <NavCard onNav={page => {
            if (page === "About") setShowAbout(true);
            else show(`📖 Navigating to ${page}…`);
          }}/>
          <DeletedCard deleted={MOCK_DELETED}/>
        </div>

        {toast && <Toast msg={toast} onClose={() => setToast(null)}/>}

        {/* About Page Overlay */}
        {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}
      </div>
    </>
  );
}