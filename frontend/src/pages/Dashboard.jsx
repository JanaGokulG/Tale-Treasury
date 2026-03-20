import { useState, useEffect, useRef } from "react";
import { useLottie } from "lottie-react";
import catanimation from '../assets/cat.json';

/* ── MOCK DATA ──────────────────────────────────────────────────────────── */
const MOCK_USER = {
  name: "Arya",
  avatar: null, // set to image URL once uploaded
  minutesThisSession: 42,
  isConsistent: true,
};
const MOCK_TROPHIES = [
  { id:1, emoji:"📖", label:"First Story Read",               earned:true  },
  { id:2, emoji:"🌙", label:"Night Owl – 3 stories after midnight", earned:true  },
  { id:3, emoji:"🔥", label:"7-Day Streak",                   earned:false },
  { id:4, emoji:"✨", label:"Story Weaver – 5 tales generated",earned:false },
  { id:5, emoji:"🌟", label:"Archive Keeper",                  earned:false },
  { id:6, emoji:"🎭", label:"Genre Explorer",                  earned:false },
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
  fantasy:   { glow:"#FFD580", color:"#FFC940" },
  mystery:   { glow:"#B388FF", color:"#9C6FFF" },
  romance:   { glow:"#FF8FAB", color:"#FF6B8A" },
  horror:    { glow:"#FF6B6B", color:"#E53935" },
  adventure: { glow:"#80DEEA", color:"#26C6DA" },
};

function Cat() {
  const { View, play, stop } = useLottie({
    animationData: catanimation,
    loop: false,
    autoplay: false,
  });

  return (
    <div
      style={{ position: "absolute", width: 260, bottom: "49%" }}
      onMouseEnter={() => play()}
      onMouseLeave={() => stop()}
    >
      {View}
    </div>
  );
}


/* ── Tooltip ─────────────────────────────────────────────────────────────── */
function Tip({ children, text, pos="top", style={} }) {
  const [show, setShow] = useState(false);
  const dirs = {
    top:    { bottom:"110%", left:"50%", transform:"translateX(-50%)" },
    bottom: { top:"110%",   left:"50%", transform:"translateX(-50%)" },
    left:   { right:"110%", top:"50%",  transform:"translateY(-50%)" },
    right:  { left:"110%",  top:"50%",  transform:"translateY(-50%)" },
  };
  return (
    <div style={{ position:"relative", display:"inline-block", ...style }}
      onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      {children}
      {show && text && (
        <div style={{
          position:"absolute", ...dirs[pos], pointerEvents:"none",
          background:"rgba(14,6,2,.96)", color:"#F5DEB3",
          fontFamily:"'Lora',serif", fontSize:12, whiteSpace:"nowrap",
          padding:"6px 13px", borderRadius:8, zIndex:1000,
          border:"1px solid rgba(220,160,80,.3)",
          boxShadow:"0 4px 18px rgba(0,0,0,.6)",
        }}>{text}</div>
      )}
    </div>
  );
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ msg, onClose }) {
  useEffect(() => { const t=setTimeout(onClose,3200); return ()=>clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
      background:"rgba(14,6,2,.96)", color:"#F5DEB3",
      fontFamily:"'Lora',serif", fontSize:14, padding:"11px 22px",
      borderRadius:12, border:"1px solid rgba(220,160,80,.4)",
      boxShadow:"0 8px 32px rgba(0,0,0,.55)", zIndex:1001,
      display:"flex", alignItems:"center", gap:10,
      animation:"fadeUp .3s ease both",
    }}>
      <span>{msg}</span>
      <span style={{ cursor:"pointer", opacity:.5 }} onClick={onClose}>×</span>
    </div>
  );
}

/* ── Wall portrait frame with user photo ─────────────────────────────────── */
function PortraitFrame({ user, onEdit }) {
  const [hov, setHov] = useState(false);
  const hasPhoto = !!user.avatar;
  return (
    <div
      onClick={onEdit}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        position:"absolute",
        top:"9%", left:"43%",
        cursor:"pointer",
        filter: hov ? "drop-shadow(0 0 18px rgba(255,200,80,.55))" : "drop-shadow(0 4px 14px rgba(0,0,0,.55))",
        transition:"filter .25s",
      }}
    >
      {/* Outer ornate frame */}
      <svg width="138" height="158" viewBox="0 0 138 158" style={{ display:"block" }}>
        {/* Frame shadow */}
        <rect x="4" y="6" width="130" height="148" rx="5" fill="rgba(0,0,0,.35)"/>
        {/* Frame outer border */}
        <rect x="2" y="2" width="134" height="154" rx="5" fill="#7A5030" stroke="#C8903C" strokeWidth="2"/>
        {/* Frame inner border detail */}
        <rect x="6" y="6" width="126" height="146" rx="3" fill="none" stroke="rgba(220,170,70,.45)" strokeWidth="1.5"/>
        {/* Corner ornaments */}
        {[[8,8],[126,8],[8,146],[126,146]].map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r="4" fill="#C8903C" opacity=".8"/>
        ))}
        {/* Mat area */}
        <rect x="10" y="10" width="118" height="138" rx="2" fill="#2A1808"/>
        {/* Photo or placeholder */}
        {hasPhoto ? (
          <image href={user.avatar} x="10" y="10" width="118" height="138" clipPath="url(#frameClip)" preserveAspectRatio="xMidYMid slice"/>
        ) : (
          <>
            {/* Warm gradient bg for placeholder */}
            <rect x="10" y="10" width="118" height="138" rx="2" fill="url(#frameBg)"/>
            {/* Silhouette */}
            <circle cx="69" cy="58" r="22" fill="rgba(200,150,80,.38)"/>
            <path d="M22 128c0-26 21-47 47-47s47 21 47 47" fill="rgba(200,150,80,.28)"/>
            {/* Placeholder text */}
            <text x="69" y="108" textAnchor="middle" fill="rgba(200,150,80,.5)"
              fontFamily="serif" fontSize="9" fontStyle="italic">tap to add photo</text>
          </>
        )}
        {/* Name plate */}
        <rect x="32" y="134" width="74" height="18" rx="3" fill="rgba(14,6,2,.82)" stroke="rgba(220,170,70,.4)" strokeWidth="1"/>
        <text x="69" y="146" textAnchor="middle" fill="#F5DEB3"
          fontFamily="serif" fontSize="11" letterSpacing="0.08em">{user.name}</text>

        {/* Hover overlay */}
        {hov && (
          <rect x="10" y="10" width="118" height="124" rx="2" fill="rgba(14,6,2,.72)"/>
        )}
        {hov && (
          <>
            <text x="69" y="70" textAnchor="middle" fontSize="22" fontFamily="serif">{hasPhoto?"✏️":"📷"}</text>
            <text x="69" y="90" textAnchor="middle" fill="#FFD700"
              fontFamily="serif" fontSize="10">{hasPhoto?"Edit photo":"Set photo"}</text>
          </>
        )}
        <defs>
          <clipPath id="frameClip"><rect x="10" y="10" width="118" height="138" rx="2"/></clipPath>
          <linearGradient id="frameBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A2248"/>
            <stop offset="100%" stopColor="#1E1208"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ── Live Clock (session time on hover) ──────────────────────────────────── */
function WallClock({ session }) {
  const [now, setNow] = useState(new Date());
  const [hov, setHov] = useState(false);
  useEffect(()=>{ const id=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(id); },[]);

  const s=now.getSeconds(), m=now.getMinutes(), h=now.getHours()%12;
  const pt=(deg,r)=>{ const a=(deg-90)*Math.PI/180; return [37+r*Math.cos(a), 37+r*Math.sin(a)]; };
  const [hx,hy]=pt(h*30+m*0.5,13);
  const [mx,my]=pt(m*6+s*0.1,19);
  const [sx,sy]=pt(s*6,22);

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ position:"absolute", top:"2.5%", right:"34%", cursor:"pointer", zIndex:10 }}>
      <svg width="72" height="72" viewBox="0 0 72 72"
        style={{ filter: session.isConsistent ? "drop-shadow(0 0 9px rgba(255,190,80,.42))" : "drop-shadow(0 2px 6px rgba(0,0,0,.4))" }}>
        <circle cx="36" cy="36" r="33" fill="#2E1C08" stroke="#C8903C" strokeWidth="2.5"/>
        <circle cx="36" cy="36" r="29" fill="#200E04" stroke="rgba(200,144,60,.22)" strokeWidth="1"/>
        {[...Array(12)].map((_,i)=>{
          const a=(i*30-90)*Math.PI/180;
          return <line key={i} x1={36+24*Math.cos(a)} y1={36+24*Math.sin(a)}
            x2={36+(i%3===0?27:26)*Math.cos(a)} y2={36+(i%3===0?27:26)*Math.sin(a)}
            stroke="#C8903C" strokeWidth={i%3===0?2.2:1} strokeLinecap="round"/>;
        })}
        <text x="36" y="15" textAnchor="middle" fill="rgba(200,144,60,.55)" fontFamily="serif" fontSize="6">XII</text>
        <text x="59" y="40" textAnchor="middle" fill="rgba(200,144,60,.55)" fontFamily="serif" fontSize="6">III</text>
        <text x="36" y="62" textAnchor="middle" fill="rgba(200,144,60,.55)" fontFamily="serif" fontSize="6">VI</text>
        <text x="14" y="40" textAnchor="middle" fill="rgba(200,144,60,.55)" fontFamily="serif" fontSize="6">IX</text>
        <line x1="36" y1="36" x2={hx} y2={hy} stroke="#F5DEB3" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="36" y1="36" x2={mx} y2={my} stroke="#F5DEB3" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="36" y1="36" x2={sx} y2={sy} stroke="#FF8C42" strokeWidth="1" strokeLinecap="round"/>
        <circle cx="36" cy="36" r="2.5" fill="#FF8C42"/>
      </svg>
      {hov && (
        <div style={{
          position:"absolute", bottom:"7%", left:"50%", transform:"translateX(-50%)",
          background:"rgba(14,6,2,.96)", color:"#F5DEB3",
          fontFamily:"'Lora',serif", fontSize:12,
          padding:"9px 16px", borderRadius:10, whiteSpace:"nowrap",
          border:"1px solid rgba(220,160,80,.35)",
          boxShadow:"0 4px 20px rgba(0,0,0,.55)",
          textAlign:"center", lineHeight:1.65, zIndex:999,
        }}>
          <div style={{ color:"#FFB347", fontWeight:600, marginBottom:2 }}>
            ⏱ {now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
          </div>
          Reading this session: <strong style={{ color:"#FF8C42" }}>{session.minutesThisSession} min</strong>
          {session.isConsistent && <div style={{ color:"#FFD700", fontSize:11, marginTop:2 }}>🔥 On a streak!</div>}
        </div>
      )}
    </div>
  );
}

/* ── Real Calendar with streak dots ─────────────────────────────────────── */
function StreakCalendar({ streakDays }) {
  const today = new Date();
  const [displayDate, setDisplayDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year  = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const monthName = displayDate.toLocaleString("default",{month:"short"}).toUpperCase()+" "+year;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  // Map streak array to date string -> bool
  const streakMap = {};
  streakDays.forEach((v,i)=>{
    const d = new Date(today);
    d.setDate(d.getDate()-(streakDays.length-1-i));
    streakMap[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] = v;
  });

  const cells = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);

  const isToday = (d)=> d===today.getDate() && month===today.getMonth() && year===today.getFullYear();
  const getStreak = (d)=> streakMap[`${year}-${month}-${d}`];

  return (
    <Tip text="Your reading calendar" pos="left" style={{ position:"absolute", top:"34%", right:"1.2%" }}>
      <div style={{
        background:"rgba(14,6,2,.85)",
        border:"1px solid rgba(160,100,40,.42)",
        borderRadius:9, overflow:"hidden",
        backdropFilter:"blur(4px)",
        width:148,
      }}>
        {/* Header */}
        <div style={{
          background:"#8B2820", padding:"5px 8px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <button onClick={()=>setDisplayDate(new Date(year,month-1,1))}
            style={{ background:"none", border:"none", color:"rgba(255,240,220,.7)",
              cursor:"pointer", fontSize:13, lineHeight:1, padding:"0 4px" }}>‹</button>
          <span style={{ fontFamily:"'Cormorant Garamond',serif",
            fontSize:10, letterSpacing:".18em", color:"rgba(255,240,220,.9)", fontWeight:600 }}>
            {monthName}
          </span>
          <button onClick={()=>setDisplayDate(new Date(year,month+1,1))}
            style={{ background:"none", border:"none", color:"rgba(255,240,220,.7)",
              cursor:"pointer", fontSize:13, lineHeight:1, padding:"0 4px" }}>›</button>
        </div>
        {/* Day labels */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"4px 4px 2px" }}>
          {["S","M","T","W","T","F","S"].map((d,i)=>(
            <div key={i} style={{ textAlign:"center", fontFamily:"'Lora',serif",
              fontSize:8, color:"rgba(200,150,80,.55)", fontWeight:600 }}>{d}</div>
          ))}
        </div>
        {/* Dates */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"2px 4px 6px", gap:1 }}>
          {cells.map((d,i)=>{
            if(!d) return <div key={i}/>;
            const logged = getStreak(d);
            const tod = isToday(d);
            return (
              <div key={i} style={{
                width:17, height:17, borderRadius:3, margin:"0 auto",
                background: tod ? "#C8903C"
                  : logged===true  ? "rgba(255,160,50,.6)"
                  : logged===false ? "rgba(255,60,60,.18)"
                  : "rgba(255,255,255,.06)",
                border: tod ? "1px solid #FFD700" : "1px solid transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                position:"relative",
              }}>
                <span style={{ fontFamily:"'Lora',serif", fontSize:7.5,
                  color: tod ? "#1A0A04"
                    : logged===true ? "#FFD700"
                    : logged===false ? "rgba(255,100,100,.65)"
                    : "rgba(200,160,80,.4)",
                  fontWeight: tod ? 700 : 400,
                }}>
                  {logged===true && !tod ? "✓" : logged===false ? "×" : d}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Tip>
  );
}

/* ── Emotion Lamp ─────────────────────────────────────────────────────────── */
function EmotionLamp({ genre }) {
  const lamp = GENRE_LAMP[genre] || GENRE_LAMP.fantasy;
  const [hov,setHov]=useState(false);
  return (
    <Tip text={`Mood: ${genre.charAt(0).toUpperCase()+genre.slice(1)}`} pos="right">
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{
          position:"absolute", bottom:"27%", left:"8.5%",
          filter:`drop-shadow(0 0 ${hov?28:13}px ${lamp.glow})`,
          transition:"filter .4s", animation:"lampPulse 3s ease-in-out infinite",
          cursor:"pointer",
        }}>
        <svg width="52" height="80" viewBox="0 0 52 80">
          <ellipse cx="26" cy="76" rx="15" ry="4" fill="#2A1808"/>
          <rect x="23" y="38" width="6" height="38" rx="3" fill="#5A3520"/>
          <line x1="26" y1="38" x2="15" y2="18" stroke="#5A3520" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M3 18 L26 10 L26 26 Z" fill={lamp.color}/>
          <path d="M3 18 L-12 46 L16 46 Z" fill={lamp.glow} opacity={hov?.4:.22} style={{transition:"opacity .4s"}}/>
          <circle cx="14" cy="18" r="4.5" fill={lamp.glow} opacity=".95"/>
          <circle cx="14" cy="18" r="8" fill={lamp.glow} opacity=".12"/>
        </svg>
      </div>
    </Tip>
  );
}

/* ── Nav Book ─────────────────────────────────────────────────────────────── */
function NavBook({ title, color, spine, w, h, tilt=0, onClick }) {
  const [hov,setHov]=useState(false);
  return (
    <Tip text={title} pos="top">
      <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{
          width:w, height:h, flexShrink:0,
          background:`linear-gradient(to right,${spine} 0%,${color} 14%,${color} 88%,${spine} 100%)`,
          borderRadius:"2px 3px 3px 2px",
          transform: hov ? `translateY(-11px) rotate(${tilt-2}deg)` : `rotate(${tilt}deg)`,
          transition:"transform .26s cubic-bezier(.34,1.56,.64,1)",
          cursor:"pointer",
          boxShadow: hov
            ? "3px -5px 18px rgba(0,0,0,.65), inset 2px 0 4px rgba(255,255,255,.06)"
            : "2px 0 5px rgba(0,0,0,.45), inset 2px 0 4px rgba(255,255,255,.04)",
          display:"flex", alignItems:"flex-end", justifyContent:"center",
          paddingBottom:7, position:"relative",
        }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
          background:"linear-gradient(to bottom,rgba(220,180,80,.4),transparent)",
          borderRadius:"2px 3px 0 0" }}/>
        <div style={{ position:"absolute", top:6, left:0, right:0, height:1, background:"rgba(0,0,0,.14)" }}/>
        <div style={{ position:"absolute", bottom:8, left:0, right:0, height:1, background:"rgba(0,0,0,.12)" }}/>
        <span style={{ writingMode:"vertical-rl", transform:"rotate(180deg)",
          fontFamily:"'Lora',serif", fontSize:9.5, fontWeight:500,
          color:"rgba(255,255,255,.83)", letterSpacing:".08em",
          userSelect:"none", textShadow:"0 1px 2px rgba(0,0,0,.7)" }}>{title}</span>
      </div>
    </Tip>
  );
}

/* ── Shelf board ──────────────────────────────────────────────────────────── */
function ShelfBoard() {
  return (
    <div style={{
      height:10,
      background:"linear-gradient(to bottom,#9B6830,#5C3818)",
      borderRadius:2,
      boxShadow:"0 4px 10px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,200,100,.2)",
    }}/>
  );
}

/* ── The two shelves ──────────────────────────────────────────────────────── */
function Shelves({ onNav }) {
  const books = [
    { title:"Home",    color:"#B03020", spine:"#7A1A10", w:27, h:76 },
    { title:"About",   color:"#2E6B32", spine:"#1A4A1E", w:22, h:84 },
    { title:"Contact", color:"#1A5FA0", spine:"#0D3D6E", w:30, h:70 },
    { title:"GitHub",  color:"#5C3080", spine:"#3A1A5C", w:24, h:79 },
  ];
  return (
    <div style={{ position:"absolute", top:"4.5%", right:"3%", width:"clamp(192px,20vw,238px)" }}>

      {/* ── SHELF 1: Navigation books ── */}
      <div style={{ display:"flex", alignItems:"flex-end", gap:3, margin:"-19px 20px 10px -85px", height:98 }}>
        {books.map((b,i)=>(
          <NavBook key={b.title} {...b} tilt={i===3?8:0} onClick={()=>onNav(b.title)}/>
        ))}
        {/* Two leaning filler books for realism */}
        <div style={{ width:17, height:63, flexShrink:0,
          background:"linear-gradient(to right,#5A3018,#7A5030)",
          borderRadius:"2px 3px 3px 2px",
          transform:"rotate(16deg) translateY(5px)", opacity:"100" }}/>
        <div style={{ width:13, height:70, flexShrink:0,
          background:"linear-gradient(to right,#253D25,#3A5A38)",
          borderRadius:"2px 3px 3px 2px",
          transform:"rotate(-7deg) translateY(3px)", opacity:"100" }}/>
        <div style={{ width:9, height:46, flexShrink:0,
          background:"linear-gradient(to bottom,#C8903C,#8B6020)",
          borderRadius:2, marginLeft:4, opacity:"100",
          boxShadow:"2px 0 5px rgba(0,0,0,.3)" }}/>
      </div>
      {/* <ShelfBoard /> */}

      {/* Gap between shelves */}
      <div style={{ height:13 }}/>

      {/* ── SHELF 2: Trophies ── */}
      <div style={{ display:"flex", alignItems:"flex-end", gap:8, padding:"0 12px", height:56 }}>
        {MOCK_TROPHIES.map((t,i)=>(
          <Tip key={t.id} text={t.label} pos="bottom">
            <div style={{
              fontSize: t.earned ? 21 : 18,
              filter: t.earned
                ? "drop-shadow(0 0 7px rgba(255,200,80,.8))"
                : "grayscale(1) opacity(.22)",
              cursor: t.earned ? "pointer" : "not-allowed",
              animation: t.earned ? `trophyFloat ${2.4+i*.35}s ease-in-out infinite` : "none",
              lineHeight:1,
            }}>{t.emoji}</div>
          </Tip>
        ))}
      </div>
      {/* <ShelfBoard /> */}
    </div>
  );
}

/* ── Laptop on desk ───────────────────────────────────────────────────────── */
function Laptop({ onClick }) {
  const [hov,setHov]=useState(false);
  return (
    /* Positioned so the base sits flush on the desk surface */
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        position:"absolute",
        /* desk top is at ~61% of viewport height; laptop base should sit on it */
        bottom:"37%",
        right:"30%",
        cursor:"pointer",
        filter: hov ? "brightness(1.12)" : "none",
        transition:"filter .25s",
      }}>
      <Tip text="✍️ Generate a new story" pos="top">
        <svg width="164" height="108" viewBox="0 0 164 108" style={{ display:"block" }}>
          {/* Lid open at ~110° */}
          <rect x="8" y="2" width="148" height="88" rx="7" fill="#111" stroke="#282828" strokeWidth="1.5"/>
          {/* Bezel */}
          <rect x="13" y="7" width="138" height="78" rx="5" fill="#0A0A0A"/>
          {/* Screen */}
          <rect x="15" y="9" width="134" height="74" rx="4" fill={hov?"#0C1B28":"#080808"}/>
          {/* Camera */}
          <circle cx="82" cy="6" r="2.2" fill="#1C1C1C" stroke="#252525" strokeWidth=".5"/>
          {/* Content */}
          {!hov ? (
            <>
              <text x="82" y="44" textAnchor="middle" fill="#2A3040" fontFamily="monospace" fontSize="10">_ _</text>
              <text x="82" y="58" textAnchor="middle" fill="#1E2B38" fontFamily="serif" fontSize="9" fontStyle="italic">✍️ click to write</text>
              <text x="82" y="70" textAnchor="middle" fill="#172028" fontFamily="serif" fontSize="8">a new tale</text>
            </>
          ) : (
            <>
              <text x="82" y="44" textAnchor="middle" fill="#FFD700" fontFamily="serif" fontSize="11" fontStyle="italic">✨ Generate</text>
              <text x="82" y="60" textAnchor="middle" fill="#80C8FF" fontFamily="serif" fontSize="11" fontStyle="italic">New Story</text>
              {/* Ping ring — clipped to screen so it can't escape */}
              <clipPath id="screenClip"><rect x="15" y="9" width="134" height="74" rx="4"/></clipPath>
              <circle cx="82" cy="73" r="0" fill="#FFD700" opacity=".9"/>
              <circle cx="82" cy="73" r="9" fill="none" stroke="#FFD700" strokeWidth="1.2" opacity=".55"
                clipPath="url(#screenClip)"
                style={{ transformOrigin:"82px 73px", animation:"pingInner 1.4s ease-out infinite" }}/>
              <circle cx="82" cy="73" r="3" fill="#FFD700" opacity=".9" clipPath="url(#screenClip)"/>
            </>
          )}
          {/* Hinge line */}
          <line x1="8" y1="88" x2="156" y2="88" stroke="#222" strokeWidth="1.2"/>
          {/* Base / keyboard */}
          <rect x="0" y="88" width="164" height="16" rx="4" fill="#181818" stroke="#202020" strokeWidth="1"/>
          {/* Key rows */}
          {[9,25,42,58,74,90,106,122,138].map(x=>(
            <rect key={x} x={x+1} y="92" width="13" height="8" rx="1.8" fill="#222" stroke="#2A2A2A" strokeWidth=".4"/>
          ))}
          {/* Trackpad */}
          <rect x="58" y="101" width="48" height="6" rx="2.5" fill="#1A1A1A" stroke="#252525" strokeWidth=".5"/>
          {/* Bottom foot */}
          <path d="M0 104 L8 108 L156 108 L164 104 Z" fill="#111"/>
        </svg>
      </Tip>
    </div>
  );
}

/* ── Archive cardboard box ────────────────────────────────────────────────── */
function ArchiveBox({ onClick }) {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        position:"absolute", bottom:"8%", left:"34%",
        cursor:"pointer",
        transform: hov ? "translateY(-8px) scale(1.04)" : "none",
        transition:"transform .3s cubic-bezier(.34,1.56,.64,1), filter .25s",
        filter: hov ? "brightness(1.2)" : "none",
      }}>
      <Tip text="📚 Story Archive — all your tales" pos="top">
        <svg width="108" height="90" viewBox="0 0 108 90">
          <ellipse cx="54" cy="88" rx="46" ry="5" fill="rgba(0,0,0,.3)"/>
          <rect x="6" y="32" width="96" height="56" rx="3" fill="#C07830"/>
          <rect x="6" y="32" width="96" height="56" rx="3" fill="url(#bxs2)"/>
          <path d="M6 32 L27 12 L81 12 L102 32" fill="#D4985A" stroke="#A0662A" strokeWidth="1"/>
          <path d="M6 32 Q28 22 54 26 Q80 22 102 32" fill="#B87830"/>
          <rect x="37" y="24" width="34" height="9" rx="4.5" fill="rgba(0,0,0,.24)"/>
          <rect x="12" y="10" width="24" height="27" rx="2" fill="#F5C840" opacity=".93"/>
          <path d="M12 10 L19 4 L36 4 L36 10" fill="#E8B020"/>
          <rect x="9"  y="14" width="21" height="25" rx="2" fill="#E8A020" opacity=".86"/>
          <rect x="67" y="8"  width="26" height="29" rx="2" fill="#F5C840" opacity=".93"/>
          <path d="M67 8 L74 2 L93 2 L93 8" fill="#E8B020"/>
          <rect x="71" y="12" width="19" height="25" rx="2" fill="#E8A020" opacity=".86"/>
          <rect x="41" y="14" width="20" height="21" rx="2" fill="#D4A830" opacity=".7"/>
          <line x1="28" y1="35" x2="26" y2="86" stroke="rgba(0,0,0,.1)" strokeWidth="2"/>
          <line x1="54" y1="34" x2="54" y2="86" stroke="rgba(0,0,0,.1)" strokeWidth="2"/>
          <line x1="80" y1="35" x2="82" y2="86" stroke="rgba(0,0,0,.1)" strokeWidth="2"/>
          <defs>
            <linearGradient id="bxs2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,180,80,.08)"/>
              <stop offset="100%" stopColor="rgba(0,0,0,.2)"/>
            </linearGradient>
          </defs>
        </svg>
      </Tip>
    </div>
  );
}

/* ── Netted dustbin ───────────────────────────────────────────────────────── */
function Dustbin({ deleted }) {
  return (
    <div style={{ position:"absolute", bottom:"6%", right:"5.5%", zIndex:5 }}>
      <svg width="54" height="62" viewBox="0 0 54 62">
        <ellipse cx="27" cy="61" rx="17" ry="3" fill="rgba(0,0,0,.28)"/>
        {/* mesh body */}
        <path d="M9 15 L45 15 L40 57 Q39 60 27 60 Q15 60 14 57 Z" fill="rgba(70,40,12,.1)" stroke="#9B7040" strokeWidth="1.8"/>
        {[26,36,46].map(y=><path key={y} d={`M${9+(y-15)*0.15} ${y} Q27 ${y-4} ${45-(y-15)*0.15} ${y}`} fill="none" stroke="#9B7040" strokeWidth="1.2"/>)}
        {[9,17,25,33,41].map((xo,j)=><line key={j} x1={xo} y1="15" x2={14+(xo-9)*0.65} y2="58" stroke="#9B7040" strokeWidth="1" opacity=".65"/>)}
        {/* paper balls inside */}
        {deleted.slice(0,2).map((s,i)=>(
          <Tip key={s.id} text={`🗑 "${s.title}"`} pos="left">
            <circle cx={20+i*10} cy={42-i*4} r={6-i} fill={i===0?"#E0D090":"#D8C880"} opacity=".72" style={{cursor:"default"}}/>
          </Tip>
        ))}
        {/* lid */}
        <rect x="4" y="10" width="46" height="7" rx="2.5" fill="#7A5030" stroke="#5A3818" strokeWidth="1"/>
        <path d="M19 7 Q27 3 35 7" fill="none" stroke="#6A4028" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

/* ── Cat with yarn ───────────────────────────────────────────────────────── */
// function CatYarn() {
//   const [frame,setFrame]=useState(0);
//   useEffect(()=>{ const id=setInterval(()=>setFrame(f=>(f+1)%4),650); return ()=>clearInterval(id); },[]);
//   const tailAngle = [0,8,-8,4][frame];
//   const pawOffset = [0,3,-2,2][frame];
//   const earTwitch = frame===2;
//   return (
//     <div style={{ position:"absolute", bottom:"6.5%", left:"47%", pointerEvents:"none" }}>
//       <svg width="90" height="70" viewBox="0 0 90 70">
//         {/* Yarn ball */}
//         <circle cx="72" cy="52" r="14" fill="#E8405A" opacity=".88"/>
//         <path d="M60 44 Q72 38 84 46" fill="none" stroke="#C82840" strokeWidth="1.5" opacity=".6"/>
//         <path d="M58 52 Q72 58 86 50" fill="none" stroke="#C82840" strokeWidth="1.4" opacity=".5"/>
//         <path d="M62 60 Q72 64 82 58" fill="none" stroke="#C82840" strokeWidth="1.3" opacity=".5"/>
//         {/* Yarn string to paw */}
//         <path d={`M60 44 Q${40+pawOffset} ${38+pawOffset} 30 45`} fill="none" stroke="#E8405A" strokeWidth="1.2" opacity=".7"/>

//         {/* Cat body */}
//         <ellipse cx="22" cy="52" rx="18" ry="14" fill="#D4A060"/>
//         {/* Head */}
//         <circle cx="22" cy="32" r="14" fill="#D4A060"/>
//         {/* Ears */}
//         <polygon points="10,22 8,8 18,18" fill="#D4A060" stroke="#C49050" strokeWidth="1"/>
//         <polygon points="11,21 9,10 17,18" fill="#FFB8C0" opacity=".7"/>
//         {earTwitch && <polygon points="34,22 36,8 26,18" fill="#D4A060" stroke="#C49050" strokeWidth="1" style={{transform:"rotate(-5deg)",transformOrigin:"30px 15px"}}/>}
//         <polygon points="34,22 36,8 26,18" fill="#D4A060" stroke="#C49050" strokeWidth="1"/>
//         <polygon points="33,21 35,10 27,18" fill="#FFB8C0" opacity=".7"/>
//         {/* Eyes */}
//         <ellipse cx="17" cy="30" rx="3.5" ry={frame===1?1.5:3.5} fill="#2A1808"/>
//         <ellipse cx="27" cy="30" rx="3.5" ry={frame===1?1.5:3.5} fill="#2A1808"/>
//         <circle cx="18" cy="29" r="1" fill="white" opacity=".6"/>
//         <circle cx="28" cy="29" r="1" fill="white" opacity=".6"/>
//         {/* Nose */}
//         <path d="M21 35 L22 37 L23 35" fill="#E87880"/>
//         <path d="M22 37 L18 39 M22 37 L26 39" fill="none" stroke="#C86068" strokeWidth="1" strokeLinecap="round"/>
//         {/* Whiskers */}
//         <line x1="9"  y1="35" x2="19" y2="36" stroke="rgba(255,255,255,.6)" strokeWidth=".9"/>
//         <line x1="8"  y1="38" x2="18" y2="38" stroke="rgba(255,255,255,.6)" strokeWidth=".9"/>
//         <line x1="35" y1="35" x2="25" y2="36" stroke="rgba(255,255,255,.6)" strokeWidth=".9"/>
//         <line x1="36" y1="38" x2="26" y2="38" stroke="rgba(255,255,255,.6)" strokeWidth=".9"/>
//         {/* Paw reaching for yarn */}
//         <ellipse cx={30+pawOffset} cy={47+pawOffset/2} rx="6" ry="4" fill="#D4A060" transform={`rotate(-20,${30+pawOffset},${47+pawOffset/2})`}/>
//         {[0,4,8].map(d=><circle key={d} cx={(30+pawOffset)+d*0.5-2} cy={(47+pawOffset/2)+2} r="1.5" fill="#C49050" opacity=".7"/>)}
//         {/* Tail */}
//         <path d={`M4 58 Q${-4+tailAngle} 44 8 36`} fill="none" stroke="#D4A060" strokeWidth="5" strokeLinecap="round"/>
//         <path d={`M4 58 Q${-4+tailAngle} 44 8 36`} fill="none" stroke="#C49050" strokeWidth="2" strokeLinecap="round" opacity=".4"/>
//         {/* Belly stripe */}
//         <path d="M14 50 Q22 56 30 50" fill="none" stroke="#C49050" strokeWidth="1.5" opacity=".35"/>
//         {/* Shadow */}
//         <ellipse cx="22" cy="66" rx="20" ry="3" fill="rgba(0,0,0,.22)"/>
//       </svg>
//     </div>
//   );
// }

/* ── Floor decor ──────────────────────────────────────────────────────────── */
function FloorDecor() {
  return (
    <>
      {/* Stacked books (left) */}
      <div style={{ position:"absolute", bottom:"6%", left:"5%", pointerEvents:"none" }}>
        <svg width="82" height="52" viewBox="0 0 82 52">
          <rect x="0" y="38" width="78" height="12" rx="2" fill="#C84030" stroke="#8B2A1A" strokeWidth="1"/>
          <rect x="2" y="26" width="72" height="12" rx="2" fill="#2E7D32" stroke="#1B5020" strokeWidth="1"/>
          <rect x="4" y="14" width="66" height="12" rx="2" fill="#C8903C" stroke="#8B6020" strokeWidth="1"/>
          <rect x="6" y="3"  width="60" height="12" rx="2" fill="#1565C0" stroke="#0D3D80" strokeWidth="1"/>
          <text x="39" y="46" textAnchor="middle" fill="rgba(255,255,255,.42)" fontFamily="serif" fontSize="6">Tales</text>
        </svg>
      </div>

      {/* School backpack */}
      <div style={{ position:"absolute", bottom:"7%", left:"12%", pointerEvents:"none" }}>
        <svg width="56" height="74" viewBox="0 0 56 74">
          <ellipse cx="28" cy="72" rx="21" ry="4" fill="rgba(0,0,0,.24)"/>
          <rect x="6" y="14" width="44" height="54" rx="12" fill="#4A6080"/>
          <rect x="12" y="22" width="32" height="24" rx="6" fill="#3A5070" stroke="#5A7090" strokeWidth="1"/>
          <path d="M12 34 L44 34" stroke="#5A7090" strokeWidth="1" strokeDasharray="2 2"/>
          <rect x="18" y="38" width="20" height="3.5" rx="1.5" fill="#6A8090"/>
          <rect x="16" y="10" width="24" height="9" rx="4" fill="#5A7090"/>
          <path d="M20 10 Q28 4 36 10" fill="none" stroke="#4A6080" strokeWidth="3" strokeLinecap="round"/>
          <rect x="10" y="51" width="36" height="15" rx="5" fill="#3A5070" stroke="#5A7090" strokeWidth="1"/>
          <rect x="20" y="56" width="16" height="3.5" rx="1.5" fill="#6A8090"/>
        </svg>
      </div>

      {/* Rug */}
      <div style={{ position:"absolute", bottom:"4%", left:"20%", width:"clamp(180px,26vw,360px)", height:18, pointerEvents:"none" }}>
        <svg width="100%" height="18" viewBox="0 0 360 18" preserveAspectRatio="none">
          <rect width="360" height="18" rx="4" fill="#8B4A28" opacity=".5"/>
          <rect x="10" y="3" width="340" height="12" rx="3" fill="none" stroke="#C87840" strokeWidth="1" opacity=".42"/>
          {[...Array(12)].map((_,i)=>(
            <line key={i} x1={20+i*28} y1="3" x2={20+i*28} y2="15" stroke="#C87840" strokeWidth="1" opacity=".28"/>
          ))}
        </svg>
      </div>

      {/* Stuffed bear */}
      <div style={{ position:"absolute", bottom:"7.5%", left:"28%", pointerEvents:"none" }}>
        <svg width="38" height="46" viewBox="0 0 38 46">
          <ellipse cx="19" cy="44" rx="12" ry="3" fill="rgba(0,0,0,.22)"/>
          <ellipse cx="19" cy="32" rx="13" ry="10" fill="#C8904A"/>
          <circle cx="19" cy="16" r="10.5" fill="#D4A060"/>
          <circle cx="9"  cy="9" r="5.5" fill="#C8904A"/>
          <circle cx="29" cy="9" r="5.5" fill="#C8904A"/>
          <circle cx="9"  cy="9" r="3.2" fill="#E8B870" opacity=".7"/>
          <circle cx="29" cy="9" r="3.2" fill="#E8B870" opacity=".7"/>
          <circle cx="15" cy="14" r="2.2" fill="#2A1808"/>
          <circle cx="23" cy="14" r="2.2" fill="#2A1808"/>
          <circle cx="15.5" cy="13.4" r=".7" fill="white"/>
          <circle cx="23.5" cy="13.4" r=".7" fill="white"/>
          <ellipse cx="19" cy="19" rx="2.8" ry="2" fill="#8B5030"/>
        </svg>
      </div>

      {/* Scattered papers near box */}
      <div style={{ position:"absolute", bottom:"6%", left:"44%", pointerEvents:"none" }}>
        <svg width="70" height="32" viewBox="0 0 70 32">
          <rect x="0" y="9" width="40" height="22" rx="1" fill="#F5E8C0" transform="rotate(-14,0,9)" opacity=".8"/>
          <rect x="22" y="5" width="40" height="22" rx="1" fill="#EED8A0" transform="rotate(7,22,5)" opacity=".74"/>
          <rect x="13" y="13" width="38" height="20" rx="1" fill="#F0E0B0" opacity=".7"/>
          <line x1="18" y1="18" x2="44" y2="18" stroke="rgba(139,100,40,.26)" strokeWidth="1"/>
          <line x1="18" y1="22" x2="42" y2="22" stroke="rgba(139,100,40,.2)" strokeWidth="1"/>
        </svg>
      </div>

      {/* Small toy blocks */}
      <div style={{ position:"absolute", bottom:"7%", left:"62%", pointerEvents:"none" }}>
        <svg width="52" height="42" viewBox="0 0 52 42">
          {/* Block A */}
          <rect x="0" y="18" width="20" height="20" rx="3" fill="#E84848"/>
          <rect x="2" y="18" width="18" height="3" rx="1" fill="#FF7070" opacity=".5"/>
          <text x="10" y="32" textAnchor="middle" fill="rgba(255,255,255,.7)" fontFamily="serif" fontSize="10" fontWeight="700">A</text>
          {/* Block B */}
          <rect x="18" y="22" width="18" height="18" rx="3" fill="#4890E8"/>
          <rect x="20" y="22" width="16" height="3" rx="1" fill="#70B0FF" opacity=".5"/>
          <text x="27" y="34" textAnchor="middle" fill="rgba(255,255,255,.7)" fontFamily="serif" fontSize="9" fontWeight="700">B</text>
          {/* Block C on top */}
          <rect x="4" y="6" width="16" height="16" rx="3" fill="#E8C840"/>
          <rect x="6" y="6" width="14" height="3" rx="1" fill="#FFE070" opacity=".5"/>
          <text x="12" y="18" textAnchor="middle" fill="rgba(255,255,255,.7)" fontFamily="serif" fontSize="8" fontWeight="700">C</text>
          {/* Shadows */}
          <ellipse cx="10" cy="40" rx="10" ry="2" fill="rgba(0,0,0,.2)"/>
          <ellipse cx="27" cy="42" rx="9" ry="2" fill="rgba(0,0,0,.2)"/>
        </svg>
      </div>

      {/* Toy train */}
      <div style={{ position:"absolute", bottom:"6%", left:"70%", pointerEvents:"none" }}>
        <svg width="72" height="36" viewBox="0 0 72 36">
          {/* Engine body */}
          <rect x="2" y="8" width="30" height="18" rx="4" fill="#E84848"/>
          <rect x="6" y="4" width="16" height="10" rx="3" fill="#E84848"/>
          <rect x="7" y="5" width="14" height="8" rx="2" fill="#C83030"/>
          {/* Window */}
          <rect x="9" y="6" width="8" height="6" rx="1.5" fill="#C8E0FF" opacity=".8"/>
          {/* Smokestack */}
          <rect x="20" y="2" width="5" height="7" rx="1.5" fill="#C83030"/>
          <ellipse cx="22" cy="2" rx="4" ry="2" fill="#A82020"/>
          {/* Coupling */}
          <rect x="30" y="15" width="4" height="4" rx="1" fill="#888"/>
          {/* Wagon */}
          <rect x="36" y="10" width="32" height="16" rx="3" fill="#4890E8"/>
          <rect x="38" y="12" width="10" height="10" rx="1.5" fill="#C8E0FF" opacity=".75"/>
          <rect x="52" y="12" width="10" height="10" rx="1.5" fill="#C8E0FF" opacity=".75"/>
          {/* Wheels */}
          <circle cx="10" cy="28" r="5" fill="#2A1808" stroke="#666" strokeWidth="1.5"/>
          <circle cx="24" cy="28" r="5" fill="#2A1808" stroke="#666" strokeWidth="1.5"/>
          <circle cx="42" cy="28" r="5" fill="#2A1808" stroke="#555" strokeWidth="1.5"/>
          <circle cx="58" cy="28" r="5" fill="#2A1808" stroke="#555" strokeWidth="1.5"/>
          <circle cx="10" cy="28" r="2" fill="#888"/>
          <circle cx="24" cy="28" r="2" fill="#888"/>
          <circle cx="42" cy="28" r="2" fill="#777"/>
          <circle cx="58" cy="28" r="2" fill="#777"/>
          {/* Rail track hint */}
          <line x1="0" y1="33" x2="72" y2="33" stroke="#6A4A28" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </>
  );
}

/* ── Dreamcatcher ─────────────────────────────────────────────────────────── */
function DreamCatcher() {
  return (
    <div style={{ position:"absolute", top:"1%", left:"8%", pointerEvents:"none",
      animation:"dreamSway 5.5s ease-in-out infinite", transformOrigin:"top center" }}>
      <svg width="52" height="108" viewBox="0 0 52 108">
        <line x1="26" y1="0" x2="26" y2="10" stroke="#C8A060" strokeWidth="1.2"/>
        <circle cx="26" cy="30" r="19" fill="none" stroke="#E8B860" strokeWidth="1.5"/>
        {[0,60,120,180,240,300].map((a,i)=>(
          <line key={i} x1="26" y1="30"
            x2={26+18*Math.cos(a*Math.PI/180)} y2={30+18*Math.sin(a*Math.PI/180)}
            stroke="#E8B860" strokeWidth=".7" opacity=".55"/>
        ))}
        <circle cx="26" cy="30" r="6" fill="none" stroke="#E8B860" strokeWidth=".9" opacity=".5"/>
        {[0,1,2].map(i=><circle key={i} cx={18+i*8} cy="49" r="2.2" fill="#FF9060" opacity=".9"/>)}
        {[-9,0,9].map((dx,i)=>(
          <g key={i}>
            <line x1={26+dx} y1="49" x2={26+dx} y2={72+i*4} stroke="#C8A060" strokeWidth="1"/>
            <ellipse cx={26+dx} cy={63+i*3} rx="4.5" ry="9" fill="#D4A060" opacity=".72"
              transform={`rotate(${(i-1)*14},${26+dx},${63+i*3})`}/>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Hanging plants ───────────────────────────────────────────────────────── */
function HangingPlants() {
  return (
    <>
      {[{s:"left:1%",d:"0s"},{s:"left:13%",d:"0.9s"},{s:"right:1%",d:"1.5s"}].map((c,i)=>(
        <div key={i} style={{ position:"absolute", top:0, [Object.keys(c)[0]]:Object.values(c)[0].split(":")[1],
          pointerEvents:"none", animationDelay:c.d,
          animation:`sway ${4+i*.5}s ease-in-out infinite`, transformOrigin:"top center" }}>
          <svg width="52" height="92" viewBox="0 0 52 92">
            <line x1="26" y1="0" x2="26" y2="26" stroke="#8B6040" strokeWidth="1.5"/>
            <ellipse cx="26" cy="28" rx="12" ry="5" fill="#7A4A28"/>
            {[[-11,42,-28],[-3,50,-8],[11,46,24],[-7,56,-16],[9,58,28],[-1,64,4],[9,70,18]].map(([dx,y,rot],j)=>(
              <ellipse key={j} cx={26+dx} cy={y} rx={9+j%2} ry={4}
                fill={j%2===0?"#4E7C2A":"#5D8F32"} transform={`rotate(${rot},${26+dx},${y})`} opacity=".88"/>
            ))}
          </svg>
        </div>
      ))}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
 ════════════════════════════════════════════════════════════════════════════ */
// ── Stable star positions for dark mode ────────────────────────────────
const STARS = [
  // Bright focal stars inside the window
  { cx: 280, cy:  80, r: 1.8, op: 0.92, delay: 0.0 },
  { cx: 380, cy: 120, r: 1.6, op: 0.88, delay: 1.4 },
  { cx: 180, cy: 150, r: 1.9, op: 0.90, delay: 2.6 },
  { cx: 460, cy:  90, r: 1.7, op: 0.89, delay: 0.8 },

  // Medium brightness stars
  { cx: 140, cy:  60, r: 1.2, op: 0.68, delay: 3.1 },
  { cx: 320, cy: 180, r: 1.3, op: 0.70, delay: 1.9 },
  { cx: 220, cy: 210, r: 1.1, op: 0.65, delay: 4.2 },
  { cx: 420, cy:  50, r: 1.4, op: 0.72, delay: 2.3 },

  // Smaller / fainter stars for depth (still clearly inside)
  { cx: 100, cy:  40, r: 0.8, op: 0.45, delay: 0.5 },
  { cx: 500, cy:  70, r: 0.9, op: 0.48, delay: 3.7 },
  { cx: 260, cy: 140, r: 0.7, op: 0.42, delay: 1.6 },
  { cx: 360, cy: 220, r: 0.8, op: 0.44, delay: 2.9 },
  { cx: 200, cy: 100, r: 0.6, op: 0.38, delay: 4.0 },

  // Very subtle background twinkles
  { cx: 440, cy: 160, r: 0.5, op: 0.30, delay: 1.2 },
  { cx: 150, cy: 190, r: 0.5, op: 0.28, delay: 3.5 },
];
export default function LofiDashboard() {
  const [toast,setToast] = useState(null);
  const [dark,  setDark ] = useState(false);
  const show = m => setToast(m);
  const lamp = GENRE_LAMP[LATEST_GENRE] || GENRE_LAMP.fantasy;

  // ── Theme tokens ─────────────────────────────────────────────────────────
  const D = {
    outerBg:"#08060F", wallTop:"#0C0918", wallMid:"#0E0C1E", wallBot:"#0A0814",
    floorFill:"#060410", floorLine:"#0A0712",
    wglC:"#5070D0", wglOp:".45", lglOp:".45",
    shaftC:"#5070C0", shaftOp:".08",
    skylightBg:"rgba(4,6,22,.92)",
    skylightGlow:"rgba(255, 200, 100, 0.14)",
    frameStroke:"#1E1208",
    deskFill:"#3A2010", deskStroke:"#5A3418",
    legFill:"#281408", drawerFill:"#1A0E06",
    handleFill:"#3A2010",
    cabinetFill:"#120A04", cabinetStroke:"#221008",
    chairBack:"#2A1A10", chairSeat:"#382820",
    greetC:"#A8C0FF", greetSub:"rgba(160,190,255,.4)",
    toggleBg:"rgba(10,8,24,.88)", toggleBdr:"rgba(100,130,255,.35)",
    toggleIcon:"☀️", toggleLabel:"Light Mode",
  };
  const L = {
    outerBg:"#1E1008", wallTop:"#FFF8E6", wallMid:"#F5F0E0", wallBot:"#C8903C",
    floorFill:"#1A0E08", floorLine:"#110904",
    wglC:"#FFB347", wglOp:".55", lglOp:".28",
    shaftC:"#FFB347", shaftOp:".05",
    skylightBg:"url(#glassG)",
    skylightGlow:"rgba(255,213,128,.12)",
    frameStroke:"#5A3010",
    deskFill:"#5C3A1C", deskStroke:"#7A5028",
    legFill:"#4A2C14", drawerFill:"#2A1608",
    handleFill:"#6A4A28",
    cabinetFill:"#2A1808", cabinetStroke:"#4A2C14",
    chairBack:"#5A4030", chairSeat:"#6A5038",
    greetC:"#14c3d3", greetSub:"rgba(179,245,243,.5)",
    toggleBg:"rgba(20,10,4,.82)", toggleBdr:"rgba(220,160,80,.38)",
    toggleIcon:"🌙", toggleLabel:"Dark Mode",
  };
  const T = dark ? D : L;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,700;1,400&family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html, body { height:100%; }
    @keyframes windowGlow { 0%,100%{opacity:.85;} 50%{opacity:1;} }
    @keyframes lampPulse   { 0%,100%{filter:brightness(1);} 50%{filter:brightness(1.18);} }
    @keyframes trophyFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }
    @keyframes sway        { 0%,100%{transform:rotate(-4deg);} 50%{transform:rotate(4deg);} }
    @keyframes dreamSway   { 0%,100%{transform:rotate(-5deg);} 50%{transform:rotate(5deg);} }
    @keyframes fadeUp      { from{opacity:0;transform:translate(-50%,12px);} to{opacity:1;transform:translate(-50%,0);} }
    @keyframes pingInner   { 0%{transform:scale(1);opacity:.55;} 100%{transform:scale(2.2);opacity:0;} }
    @keyframes catWag      { 0%,100%{transform:rotate(-8deg);} 50%{transform:rotate(8deg);} }
    @keyframes twinkle     { 0%,100%{opacity:.12;} 50%{opacity:1;} }
    @keyframes moonGlow    { 0%,100%{filter:drop-shadow(0 0 8px rgba(200,220,255,.5));} 50%{filter:drop-shadow(0 0 22px rgba(200,220,255,.95));} }
    @keyframes shootStar   { 0%{opacity:0;transform:translate(0,0) rotate(30deg);} 8%{opacity:.9;} 100%{opacity:0;transform:translate(160px,70px) rotate(30deg);} }
    @keyframes themeFade   { from{opacity:0;} to{opacity:1;} }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html:css }}/>
      <div style={{ width:"100vw", height:"100vh", minHeight:560,
        background: T.outerBg,
        position:"relative", overflow:"hidden", fontFamily:"'Lora',serif",
        transition:"background .6s ease",
        animation:"themeFade .4s ease" }}>

        {/* ── BACKGROUND ──────────────────────────────────────────────── */}
        <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice"
          style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
          <defs>
            <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={dark?"#0C0918":"#FFF8E6"}/>
              <stop offset="55%"  stopColor={dark?"#0E0C1E":"#F5F0E0"}/>
              <stop offset="100%" stopColor={dark?"#0A0814":"#C8903C"}/>
            </linearGradient>
            <radialGradient id="wgl" cx="22%" cy="15%" r="36%">
              <stop offset="0%"   stopColor={T.wglC} stopOpacity={T.wglOp}/>
              <stop offset="100%" stopColor={dark?"#3050B0":"#FF8C00"} stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="lgl" cx="12%" cy="57%" r="28%">
              <stop offset="0%"   stopColor={lamp.glow} stopOpacity=".28"/>
              <stop offset="100%" stopColor={lamp.glow} stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="frameGr" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#8B5C28"/>
              <stop offset="50%"  stopColor="#C8903C"/>
              <stop offset="100%" stopColor="#8B5C28"/>
            </linearGradient>
            <linearGradient id="glassG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={dark?"#1828A0":"#B8E0FF"} stopOpacity={dark?".14":".18"}/>
              <stop offset="100%" stopColor={dark?"#0810A0":"#FFD580"} stopOpacity={dark?".08":".32"}/>
            </linearGradient>
          </defs>

          {/* Wall & floor */}
          <rect width="1280" height="602" fill="url(#wallG)"/>
          <rect y="580" width="1280" height="140" fill={dark?"#060410":"#1A0E08"}/>
          <rect y="575" width="1280" height="8" fill={dark?"#0A0712":"#110904"} opacity=".9"/>
          <rect width="1280" height="720" fill="url(#wgl)"/>
          <rect width="1280" height="720" fill="url(#lgl)"/>

          ── DARK MODE: stars, moon, shooting star ──
          

          {/* Light shaft */}
          <polygon points="85,578 530,578 498,720 52,720" fill={T.shaftC} opacity={T.shaftOp}/>
          <line x1="20" y1="578" x2="1280" y2="578" stroke={dark?"#180E06":"#2A1408"} strokeWidth="3"/>

          

          {/* ─── STRUCTURAL SKYLIGHT ─── 
     Now feels like warm daylight pouring in from top-left */}

{/* Outer frame - slightly darker wood in both modes for contrast */}
<polygon 
  points="78,0 558,0 472,282 -4,282" 
  fill={dark ? "#0F0803" : "#3A1F0C"} 
  stroke={T.frameStroke} 
  strokeWidth="3"
/>

{/* Main glass pane */}
<polygon 
  points="100,4 536,4 460,270 20,270" 
  fill={dark ? "#0F1628" : "#E8C276"}
/>

{/* Sunlight glow overlay - stronger & warmer in light mode */}
<polygon 
  points="100,4 536,4 460,270 20,270"
  fill={dark 
    ? "rgba(60,90,220,0.07)"           // subtle cool moonlight in dark mode
    : "rgba(255, 245, 100, 0.16)"      // bright warm sunlight (stronger than before)
  }
  opacity={dark ? 0.9 : 1}
  style={{ 
    animation: "windowGlow 6s ease-in-out infinite",
    mixBlendMode: dark ? "screen" : "overlay"   // helps rays feel additive/light
  }}
/>

{/* ─── Sunlight rays streaming down ─── */}
{/* Diagonal main rays – soft, fading, animated subtle pulse */}
<g opacity="0.22" style={{ mixBlendMode: "screen" }}>
  {/* Ray 1 – main strong beam */}
  <rect 
    x="140" y="20" width="180" height="320" rx="80"
    fill="url(#sunRay1)"
    transform="rotate(-28 140 20)"
    style={{ animation: "rayPulse 9s ease-in-out infinite" }}
  />
  {/* Ray 2 – narrower companion */}
  <rect 
    x="220" y="45" width="120" height="280" rx="60"
    fill="url(#sunRay2)"
    transform="rotate(-22 220 45)"
    style={{ animation: "rayPulse 11s ease-in-out infinite 1.2s" }}
  />
  {/* Ray 3 – faint side ray */}
  <rect 
    x="80" y="10" width="90" height="340" rx="45"
    fill="url(#sunRay3)"
    transform="rotate(-35 80 10)"
    style={{ animation: "rayPulse 13s ease-in-out infinite 3s" }}
  />
</g>

{/* Frame bars - unified theme stroke, thicker in light for visibility */}
<line 
  x1="318" y1="4" x2="240" y2="270" 
  stroke={T.frameStroke} strokeWidth="10" strokeLinecap="round"
/>
<line 
  x1="49" y1="95" x2="526" y2="95" 
  stroke={T.frameStroke} strokeWidth="8" strokeLinecap="round"
/>
<line 
  x1="45" y1="185" x2="502" y2="185" 
  stroke={T.frameStroke} strokeWidth="7" strokeLinecap="round"
/>

{/* Side panels / supports */}
<polygon points="78,0 100,0 20,270 -4,270" fill={dark ? "#1A0B02" : "#4A280F"}/>
<polygon points="536,0 558,0 472,282 450,282" fill={dark ? "#120602" : "#3A1C08"}/>

{/* Top & bottom trim */}
<line x1="78" y1="0" x2="558" y2="0" stroke={dark ? "#4A250D" : "#9B6A30"} strokeWidth="5.5"/>
<line x1="-4" y1="282" x2="472" y2="282" stroke={dark ? "#2A1406" : "#6B3F18"} strokeWidth="4"/>

{/* Subtle inner highlights / caustics */}
<polygon 
  points="108,6 312,6 244,92 110,92" 
  fill={dark ? "rgba(80,120,255,0.05)" : "rgba(255,245,210,0.11)"}
/>
<polygon 
  points="324,6 524,6 502,92 252,92" 
  fill={dark ? "rgba(80,120,255,0.04)" : "rgba(255,245,210,0.09)"}
/>

{/* ─── Define gradients in <defs> (add these higher in your SVG) ─── */}
<defs>
  {/* Glass base gradient - warm daylight */}
  <linearGradient id="glassG" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%"   stopColor={dark ? "#0A1A40" : "#FFFFEA"} stopOpacity="0.19"/>
<stop offset="50%"  stopColor={dark ? "#081540" : "#FFF9C8"} stopOpacity="0.11"/>
<stop offset="100%" stopColor={dark ? "#040C30" : "#FFF2A8"} stopOpacity="0.05"/>
</linearGradient>

  {/* Sun ray gradients – from bright center to transparent edges
  <radialGradient id="sunRay1" cx="50%" cy="0%" r="80%">
    <stop offset="0%" stopColor="#FFF8E1" stopOpacity="0.45"/>
    <stop offset="40%" stopColor="#FFEBB8" stopOpacity="0.28"/>
    <stop offset="100%" stopColor="#FFEBB8" stopOpacity="0"/>
  </radialGradient>
  <radialGradient id="sunRay2" cx="50%" cy="0%" r="90%">
    <stop offset="0%" stopColor="#FFF5D6" stopOpacity="0.38"/>
    <stop offset="50%" stopColor="#FFE4A8" stopOpacity="0.18"/>
    <stop offset="100%" stopColor="#FFE4A8" stopOpacity="0"/>
  </radialGradient>
  <radialGradient id="sunRay3" cx="50%" cy="0%" r="85%">
    <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.32"/>
    <stop offset="60%" stopColor="#FFE9C0" stopOpacity="0.12"/>
    <stop offset="100%" stopColor="#FFE9C0" stopOpacity="0"/>
  </radialGradient> */}

  {/* Optional subtle animation for breathing light
  <style>
    {`
      @keyframes rayPulse {
        0%, 100% { opacity: 0.22; }
        50%      { opacity: 0.38; }
      }
      @keyframes windowGlow {
        0%, 100% { opacity: ${dark ? 0.9 : 1}; filter: brightness(1); }
        50%      { opacity: ${dark ? 1 : 1.15}; filter: brightness(2.12); }
      }
    `}
  </style> */}
</defs>

{dark && STARS.map((s,i)=>(
            
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r}
            
              fill="#E8F0FF" opacity={s.op}
              style={{ animation:`twinkle ${2.5+s.delay}s ease-in-out ${s.delay}s infinite` }}
              />
              
          )) }
          {dark && (
            <>
              {/* Moon */}
              <g style={{ animation: "moonGlow 4s ease-in-out infinite" }}
              transform="rotate(39 430 88)">
  <defs>
    <mask id="crescentMask">
      <circle cx="430" cy="146" r="28" fill="white"/>
      <circle cx="412" cy="146" r="28" fill="black"/>   {/* adjust 412 = 430-18 */}
    </mask>
  </defs>

  <circle 
    cx="430" 
    cy="146" 
    r="28" 
    fill="#D8E8FF" 
    opacity="0.88"
    mask="url(#crescentMask)"
  />

  {/* <circle cx="418" cy="75" r="26" fill="#B8C8F0" opacity="0.12"/> */}
</g>
              {/* Shooting star */}
              <line x1="160" y1="30" x2="185" y2="22"
                stroke="#E0ECFF" strokeWidth="1.5" strokeLinecap="round"
                opacity=".0"
                style={{ animation:"shootStar 6s linear 2s infinite" }}/>
              {/* Moon glow on wall */}
              <radialGradient id="moonWallGl" cx="35%" cy="12%" r="30%">
                <stop offset="0%" stopColor="#5070D0" stopOpacity=".18"/>
                <stop offset="100%" stopColor="#3050C0" stopOpacity="0"/>
              </radialGradient>
              <rect width="1280" height="720" fill="url(#moonWallGl)"/>
            </>
          )}
          {/* ─── DESK ─── */}
          <rect x="725" y="438" width="496" height="22" rx="3" fill={T.deskFill} stroke={T.deskStroke} strokeWidth="1.5"/>
          <rect x="725" y="458" width="496" height="8" rx="2" fill={dark?"rgba(0,0,0,.55)":"rgba(0,0,0,.28)"}/>
          <rect x="736" y="466" width="18" height="114" rx="3" fill={T.legFill}/>
          <rect x="1188" y="466" width="18" height="114" rx="3" fill={T.legFill}/>
          <rect x="870" y="466" width="158" height="114" rx="3" fill={dark?"#1E1008":"#3A2010"} stroke={dark?"#2A1408":"#5A3818"} strokeWidth="1"/>
          {[472,510,546].map((y,i)=>(
            <rect key={y} x="876" y={y} width="146" height={i===0?34:i===1?32:30} rx="2" fill={T.drawerFill} stroke={dark?"#2A1608":"#4A2E14"} strokeWidth="1"/>
          ))}
          {[489,527,561].map(y=><rect key={y} x="932" y={y} width="20" height="4" rx="2" fill={T.handleFill}/>)}

          {/* Pencil cup */}
          <rect x="870" y="402" width="36" height="38" rx="5" fill="#3A2410" stroke="#6A4A24" strokeWidth="1.2"/>
          <line x1="881" y1="402" x2="879" y2="380" stroke="#FFB347" strokeWidth="2.8" strokeLinecap="round"/>
          <line x1="888" y1="402" x2="887" y2="377" stroke="#8B4A2A" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="895" y1="402" x2="896" y2="382" stroke="#C84030" strokeWidth="2.8" strokeLinecap="round"/>
          <line x1="901" y1="402" x2="902" y2="379" stroke="#4A7A30" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Mug */}
          <rect x="920" y="408" width="32" height="32" rx="5" fill="#6A4028" stroke="#8B5830" strokeWidth="1.2"/>
          <path d="M952 416 Q965 424 952 434" fill="none" stroke="#8B5830" strokeWidth="2"/>
          <ellipse cx="936" cy="408" rx="16" ry="4.5" fill="#7A5030"/>
          {/* Small boxes on desk */}
          <rect x="1052" y="390" width="60" height="50" rx="2" fill="#3A2410" stroke="#5A3618" strokeWidth="1"/>
          <rect x="1120" y="406" width="42" height="34" rx="2" fill="#4A3018" stroke="#5A3618" strokeWidth="1"/>

          {/* ─── SHELVES ─── */}
          {/* Upper */}
          <rect x="728" y="136" width="492" height="12" rx="2" fill="#5C3A1C" stroke="#7A5028" strokeWidth="1.5"/>
          <rect x="728" y="146" width="492" height="5" rx="1" fill="rgba(0,0,0,.28)"/>
          <rect x="746" y="136" width="9" height="28" rx="1" fill="#4A2C14"/>
          <rect x="1202" y="136" width="9" height="28" rx="1" fill="#4A2C14"/>
          {/* Lower / trophy */}
          <rect x="728" y="224" width="492" height="11" rx="2" fill="#5C3A1C" stroke="#7A5028" strokeWidth="1.5"/>
          <rect x="728" y="233" width="492" height="5" rx="1" fill="rgba(0,0,0,.28)"/>
          <rect x="746" y="224" width="9" height="22" rx="1" fill="#4A2C14"/>
          <rect x="1202" y="224" width="9" height="22" rx="1" fill="#4A2C14"/>

          {/* ─── LEFT CABINET ─── */}
          <rect x="26" y="390" width="138" height="190" rx="4" fill="#2A1808" stroke="#4A2C14" strokeWidth="1.5"/>
          {[394,435,476,518,558].map((y,i)=>(
            <rect key={y} x="28" y={y} width="134" height={i===4?22:40} rx="2" fill="#1C1006" stroke="#3A2010" strokeWidth="1"/>
          ))}
          {[413,454,494,535].map(y=><rect key={y} x="80" y={y} width="28" height="4" rx="2" fill="#6A4A28"/>)}

          {/* ─── CHAIR ─── */}
          <rect x="1068" y="446" width="122" height="108" rx="18" fill="#5A4030" stroke="#4A3020" strokeWidth="1.5"/>
          <rect x="1075" y="453" width="108" height="94" rx="14" fill="#6A5038"/>
          <path d="M1086 502 L1107 489 L1128 502 L1149 489 L1170 502" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="2.5"/>
          <path d="M1086 515 L1107 502 L1128 515 L1149 502 L1170 515" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="2.5"/>
          <ellipse cx="1129" cy="558" rx="62" ry="14" fill="#5A4030"/>
          <ellipse cx="1129" cy="558" rx="57" ry="12" fill="#6A5038"/>
          <line x1="1129" y1="558" x2="1129" y2="590" stroke="#3A2010" strokeWidth="6"/>
          <line x1="1083" y1="584" x2="1175" y2="584" stroke="#3A2010" strokeWidth="4.5"/>
          <circle cx="1075" cy="593" r="7.5" fill="#2A1808"/>
          <circle cx="1129" cy="596" r="7.5" fill="#2A1808"/>
          <circle cx="1183" cy="593" r="7.5" fill="#2A1808"/>

          {/* Wall socket */}
          <rect x="204" y="616" width="32" height="26" rx="3" fill="#2A1808" stroke="#4A2C14" strokeWidth="1.5"/>
          <circle cx="213" cy="629" r="3.5" fill="#1A0E06"/>
          <circle cx="227" cy="629" r="3.5" fill="#1A0E06"/>
        </svg>

        {/* ── INTERACTIVE / ANIMATED ELEMENTS ────────────────────────── */}

        {/* Portrait frame on wall (replaces night reads art) */}
        <PortraitFrame user={MOCK_USER} onEdit={()=>show(MOCK_USER.avatar?"✏️ Edit your profile photo":"📷 Upload a profile photo")}/>

        {/* Wall clock */}
        <WallClock session={MOCK_USER}/>

        {/* Streak calendar (real, with streak dots) */}
        <StreakCalendar streakDays={MOCK_STREAK}/>

        {/* The two shelves */}
        <Shelves onNav={page=>show(`📖 Navigating to ${page}…`)}/>

        {/* Dreamcatcher */}
        <DreamCatcher/>
       

        {/* Hanging plants */}
        <HangingPlants/>
       

        {/* Emotion lamp */}
        <EmotionLamp genre={LATEST_GENRE}/>

        {/* Laptop ON the desk */}
        <Laptop onClick={()=>show("✨ Starting a new tale!")}/>

        {/* Archive box */}
        <ArchiveBox onClick={()=>show("📦 Opening Story Archive…")}/>

        {/* Dustbin */}
        <Dustbin deleted={MOCK_DELETED}/>

        {/* Animated cat + yarn */}
        <Cat/>

        {/* Static floor items */}
        <FloorDecor/>

         {/* Theme Toggle Button */}
      <button
  onClick={() => setDark(d => !d)}
  style={{
    position: "absolute",
    bottom: "38%",
    right: "20%",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    zIndex: 30,
    outline: "none",
    width: "clamp(35px, 6vw, 55px)", // Responsive width
    height: "clamp(55px, 9vw, 85px)", // Responsive height
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "transform 0.2s ease",
    transform: "scale(1)",
    filter: dark ? "drop-shadow(0 0 6px #FFA500)" : "none",
    ":hover": {
      transform: "scale(1.05)",
    },
    // Media queries for fine-tuning at different screen sizes
    "@media (max-width: 768px)": {
      bottom: "30%",
      right: "10%",
    },
    "@media (max-width: 480px)": {
      bottom: "25%",
      right: "8%",
    },
    "@media (min-width: 1440px)": {
      bottom: "40%",
      right: "22%",
    },
  }}
>
  {/* Top Loop/Hanger - All sizes use relative units */}
  <div
    style={{
      width: "clamp(12px, 2vw, 18px)",
      height: "clamp(7px, 1.2vw, 11px)",
      border: `2px solid ${!dark ? "#6B4F3F" : "#CDA87A"}`,
      borderRadius: "10px 8px 0 0",
      borderBottom: "none",
      background: !dark ? "#3E3227" : "#8B7355",
      marginBottom: -1,
    }}
  />

  {/* Main Cage - Sleek vertical design */}
  <div
    style={{
      position: "relative",
      width: "clamp(30px, 5vw, 40px)",
      height: "clamp(45px, 7vw, 65px)",
      background: "transparent",
      border: `2px solid ${!dark ? "#5D4A3A" : "#CDA87A"}`,
      borderRadius: "18px 18px 17px 17px",
      boxShadow: !dark
        ? "0 2px 6px rgba(0,0,0,0.2)"
        : "0 0 15px rgba(255, 140, 0, 0.4)",
      transition: "all 0.4s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {/* Vertical Bars - Thin and elegant */}
    {[...Array(5)].map((_, i) => (
      <div
        key={`v-${i}`}
        style={{
          position: "absolute",
          width: "clamp(1px, 0.2vw, 1.5px)",
          height: "85%",
          background: !dark ? "#8B7355" : "#FFD700",
          left: `${15 + i * 18}%`,
          top: "8.5%",
          opacity: !dark ? 0.7 : 0.9,
          boxShadow: !dark ? "none" : "0 0 4px #FFA500",
          transition: "all 0.4s ease",
        }}
      />
    ))}

    {/* Top Ring */}
    <div
      style={{
        position: "absolute",
        top: -3,
        left: "50%",
        transform: "translateX(-50%)",
        width: "clamp(22px, 3.5vw, 32px)",
        height: "clamp(3px, 0.5vw, 5px)",
        background: !dark ? "#5D4A3A" : "#CDA87A",
        borderRadius: "4px 4px 0 0",
      }}
    />

    {/* Bottom Ring */}
    <div
      style={{
        position: "absolute",
        bottom: -3,
        left: "50%",
        transform: "translateX(-50%)",
        width: "clamp(24px, 4vw, 35px)",
        height: "clamp(4px, 0.6vw, 6px)",
        background: !dark ? "#5D4A3A" : "#CDA87A",
        borderRadius: "0 0 6px 6px",
      }}
    />

    {/* THE FLAME - Only visible in DARK mode */}
    {dark ? (
      <>
        {/* Main Flame */}
        <div
          style={{
            width: "clamp(8px, 1.3vw, 12px)",
            height: "clamp(12px, 2vw, 19px)",
            background: "radial-gradient(circle at 50% 30%, #FFE55C 0%, #FF8C00 80%)",
            borderRadius: "50% 50% 30% 30%",
            boxShadow: "0 0 15px #FF8C00, 0 0 25px #FF4500",
            animation: "flicker 1.2s ease-in-out infinite",
            transform: "translateY(-2px)",
            zIndex: 2,
          }}
        />
        
        {/* Inner Glow */}
        <div
          style={{
            position: "absolute",
            width: "clamp(3px, 0.5vw, 5px)",
            height: "clamp(4px, 0.7vw, 7px)",
            background: "#FFF",
            borderRadius: "50%",
            filter: "blur(2px)",
            top: "35%",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 0.8,
            animation: "pulse 1s ease-in-out infinite",
          }}
        />
      </>
    ) : (
      /* OFF mode - Empty cage with subtle dark center */
      <div
        style={{
          width: "clamp(6px, 1vw, 10px)",
          height: "clamp(6px, 1vw, 10px)",
          background: "#2A3A3A",
          borderRadius: "50%",
          opacity: 0.3,
        }}
      />
    )}
  </div>

  {/* Base/Foot */}
  <div
    style={{
      width: "clamp(18px, 3vw, 26px)",
      height: "clamp(4px, 0.7vw, 6px)",
      background: !dark ? "#5D4A3A" : "#CDA87A",
      borderRadius: "0 0 8px 8px",
      marginTop: -1,
    }}
  >
    {/* Small decorative divot */}
    <div
      style={{
        width: "clamp(4px, 0.8vw, 7px)",
        height: "clamp(1.5px, 0.3vw, 2.5px)",
        background: !dark ? "#3E3227" : "#8B7355",
        margin: "1px auto 0",
        borderRadius: 1,
      }}
    />
  </div>

 
  {/* <div
    style={{
      marginTop: "clamp(2px, 0.5vw, 4px)",
      width: "clamp(1.5px, 0.3vw, 2.5px)",
      height: "clamp(6px, 1vw, 10px)",
      background: !dark ? "#6B4F3F" : "#CDA87A",
    }}
  />
  <div
    style={{
      width: "clamp(12px, 2vw, 16px)",
      height: "clamp(8px, 1.3vw, 12px)",
      background: !dark ? "#3E3227" : "#8B7355",
      borderRadius: "4px",
      fontSize: "clamp(7px, 1.2vw, 10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: !dark ? "#8B7355" : "#FFE5B4",
      border: `1px solid ${!dark ? "#5D4A3A" : "#B8915C"}`,
    }}
  >
    {dark ? "⚡" : "○"}
  </div> */}

  {/* Animations - unchanged */}
  <style>
    {`
      @keyframes flicker {
        0% { opacity: 1; transform: translateY(-2px) scale(1); }
        25% { opacity: 0.8; transform: translateY(-1px) scale(0.9); }
        50% { opacity: 1; transform: translateY(-3px) scale(1.1); }
        75% { opacity: 0.9; transform: translateY(-1px) scale(0.95); }
        100% { opacity: 1; transform: translateY(-2px) scale(1); }
      }
      
      @keyframes pulse {
        0% { opacity: 0.6; transform: translateX(-50%) scale(0.9); }
        50% { opacity: 1; transform: translateX(-50%) scale(1.2); }
        100% { opacity: 0.6; transform: translateX(-50%) scale(0.9); }
      }
      
      button:hover {
        transform: scale(1.05);
      }
    `}
  </style>
</button>

        {/* Greeting
        <div style={{ position:"absolute", top:"3.5%", left:"3.5%" }}>
          <div style={{
            fontFamily:"'Playfair Display',serif",
            color:"#14c3d3", fontSize:"clamp(14px,1.8vw,22px)",
            fontWeight:600, textShadow:"0 2px 12px rgba(0,0,0,.7)",
          }}>Good evening, {MOCK_USER.name} 🌙</div>
          <div style={{
            fontFamily:"'Lora',serif", fontSize:"clamp(9px,1vw,12px)",
            color:"rgba(179, 245, 243, 0.5)", marginTop:3, fontStyle:"italic",
          }}>Your cozy corner awaits</div>
        </div> */}

        {/* Toast */}
        {toast && <Toast msg={toast} onClose={()=>setToast(null)}/>}
      </div>
    </>
  );
}