import { useState, useEffect, useRef } from "react";
import bg from '../assets/bg.png';
import { useNavigate } from "react-router-dom";
import { signupUser } from "../services/authService";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axios";
const GRANDMA=bg;
const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

function Field({ label, icon, type, id, placeholder, value, onChange, right }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: "flex", alignItems: "center", gap: 5,
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 10.5, fontWeight: 600, letterSpacing: "0.16em",
        textTransform: "uppercase", color: focused ? "#7A4A10" : "#9B7840",
        marginBottom: 6, transition: "color 0.25s", userSelect: "none",
      }}>
        {icon}{label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id} type={type} placeholder={placeholder} value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", background: "transparent", border: "none",
            borderBottom: `1.5px solid ${focused ? "#B8822A" : "rgba(160,118,50,0.4)"}`,
            padding: "9px 36px 8px 0",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 16, color: "#1C0E04", outline: "none",
            transition: "border-color 0.3s", letterSpacing: "0.01em",
            boxSizing: "border-box",
          }}
        />
        {focused && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "1.5px",
            background: "linear-gradient(90deg, transparent, #C49A2E 25%, #E8C060 60%, #C49A2E, transparent)",
            animation: "shimmerLine 0.4s ease forwards",
          }} />
        )}
        {right && (
          <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TaleTreasuryLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePass, setRePass] = useState("")
  const [showPwd, setShowPwd] = useState(false);
  const [showRePwd, setShowRePwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [error, setError] = useState("");
useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  const particles = useRef(
    [...Array(18)].map(() => ({
      left: `${5 + Math.random() * 90}%`,
      size: 2 + Math.random() * 4,
      dur: `${8 + Math.random() * 10}s`,
      delay: `${Math.random() * 12}s`,
      opacity: 0.15 + Math.random() * 0.4,
    }))
  );

  useEffect(() => {
    const t1 = setTimeout(() => setBookOpen(true), 200);
    const t2 = setTimeout(() => setContentVisible(true), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setTimeout(() => { setLoading(false); setSuccess(true); }, 1800);
  // };
  function moveToLogin(){navigate('/')}
  
const handlesubmit = async (e) => {
  e.preventDefault();

  if ( !email || !password) {
    setError("Please fill all fields");
    return;
  }

  setLoading(true);
  setError("");

  try {
    if (password !== rePass) {
      setError("Passwords do not match");
      return;
    }

    const data = await signupUser({
      email,
      password,
    });

    setSuccess(true);

    setTimeout(() => {
      navigate("/");
    }, 1500);

  } catch (err) {
    const message =
      err.response?.data?.message || "Signup failed";

    setError(message);
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }

        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-130vh) rotate(380deg); opacity: 0; }
        }
        @keyframes shimmerLine {
          from { opacity: 0; transform: scaleX(0); transform-origin: left; }
          to { opacity: 1; transform: scaleX(1); transform-origin: left; }
        }
        @keyframes shimmerGold {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes btnShine {
          0% { left: -60%; }
          100% { left: 130%; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn {
          0% { transform: scale(0.65); opacity: 0; }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.75); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.016); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes coverLift {
          0% { transform: perspective(1400px) rotateY(-95deg); transform-origin: right center; opacity: 0.2; }
          60% { opacity: 1; }
          100% { transform: perspective(1400px) rotateY(0deg); transform-origin: right center; opacity: 1; }
        }
        @keyframes rightReveal {
          0% { transform: perspective(1400px) scaleX(0); transform-origin: left center; opacity: 0; }
          100% { transform: perspective(1400px) scaleX(1); transform-origin: left center; opacity: 1; }
        }
        @keyframes spineGlow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
        }

        .page-rule { position: absolute; left: 0; right: 0; height: 1px; background: rgba(155,115,48,0.07); pointer-events: none; }

        .btn-primary {
          width: 100%; padding: 12px 16px; border: none; border-radius: 8px; cursor: pointer;
          font-family: 'Cormorant Garamond', serif; font-size: 15.5px; font-weight: 600;
          letter-spacing: 0.05em; color: #FFFDF6; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #C49A2E 0%, #8B5A1A 50%, #C49A2E 100%);
          background-size: 200% 100%;
          box-shadow: 0 4px 16px rgba(140,90,20,0.32), inset 0 1px 0 rgba(255,255,255,0.12);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(140,90,20,0.44); }
        .btn-primary:active { transform: none; }
        .btn-shine {
          position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: btnShine 2.8s ease-in-out infinite;
        }
        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }

        .btn-google {
          width: 100%; padding: 10px 14px; border-radius: 8px; cursor: pointer;
          font-family: 'Cormorant Garamond', serif; font-size: 14.5px; font-weight: 500;
          color: #3D2B0E; display: flex; align-items: center; justify-content: center; gap: 9px;
          background: rgba(255,255,255,0.5); border: 1px solid rgba(180,130,50,0.3);
          transition: all 0.22s;
        }
        .btn-google:hover {
          background: rgba(255,255,255,0.8); border-color: #C49A2E;
          transform: translateY(-1px); box-shadow: 0 3px 12px rgba(140,90,20,0.12);
        }

        .tt-link {
          background: none; border: none; cursor: pointer;
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          color: #8B5A1A; font-size: 13px; padding: 0;
          border-bottom: 1px dotted rgba(139,90,26,0.35); transition: color 0.2s;
        }
        .tt-link:hover { color: #4A2808; }

        input::placeholder { color: rgba(100,65,20,0.35); font-style: italic; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #F5EBCA inset !important;
          -webkit-text-fill-color: #1C0E04 !important;
        }
        .right-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── ROOT — full parchment bg ── */}
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(148deg, #F5E8CC 0%, #EDD9A8 35%, #E8D49E 65%, #EFE0B8 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "28px 20px", position: "relative", overflow: "hidden",
        fontFamily: "'Lora', serif",overflowX: "hidden",
      }}>
        {/* Dot texture */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(139,90,26,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        {/* Edge vignette */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          boxShadow: "inset 0 0 140px rgba(100,55,10,0.2)",
        }} />

        {/* Gold dust particles */}
        {particles.current.map((p, i) => (
          <div key={i} style={{
            position: "fixed", borderRadius: "50%", pointerEvents: "none",
            width: p.size, height: p.size,
            background: "radial-gradient(circle, rgba(196,154,46,0.65) 0%, transparent 70%)",
            left: p.left, bottom: "-6px",
            animation: `floatUp ${p.dur} linear ${p.delay} infinite`,
            opacity: p.opacity,
          }} />
        ))}

        {/* ── THE BOOK ── */}
        <div style={{
          width: "100%", maxWidth: 1040,
          position: "relative",
          filter: "drop-shadow(0 50px 80px rgba(70,35,5,0.38)) drop-shadow(0 12px 28px rgba(70,35,5,0.22))",
        }}>
          {/* Page stack depth layers behind book */}
          {[8, 5, 3].map((off, i) => (
            <div key={i} style={{
              position: "absolute", inset: 0,
              background: i === 0 ? "#DCCF88" : i === 1 ? "#E5D898" : "#EDE2A8",
              borderRadius: 3,
              transform: `translateY(${off}px) translateX(${off * 0.6}px)`,
              zIndex: 0,
            }} />
          ))}

          {/* Book pages container */}
          <div style={{
            position: "relative", zIndex: 2,
            display: "flex", width: "100%",
            flexDirection: isMobile ? "column" : "row",
            minHeight: isMobile ? "auto" : 620,
            minHeight: 620,
            borderRadius: 3,
            overflow: "hidden",
            outline: "1px solid rgba(155,105,35,0.38)",
          }}>

            {/* ═══ LEFT PAGE ═══ */}
            <div style={{
              width: isMobile ? "100%" : "45%", flexShrink: 0,
              background: "linear-gradient(158deg, #F6EED8 0%, #EDE3C2 50%, #E6D9AE 100%)",
              position: "relative", overflow: "hidden",
              transformOrigin: "right center",
              animation: bookOpen ? "coverLift 0.9s cubic-bezier(0.25,0.46,0.45,0.94) forwards" : "none",
              opacity: 0,
            }}>
              {/* Ruled lines */}
              {[...Array(30)].map((_, i) => (
                <div key={i} className="page-rule" style={{ top: `${2.5 + i * 3.3}%` }} />
              ))}
              {/* Aged spots */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 40% 32% at 10% 14%, rgba(160,110,40,0.07) 0%, transparent 70%), radial-gradient(ellipse 30% 40% at 90% 82%, rgba(140,90,30,0.08) 0%, transparent 70%)",
              }} />
              {/* Right-edge spine shadow */}
              <div style={{
                position: "absolute", right: 0, top: 0, bottom: 0, width: 30,
                background: "linear-gradient(to right, transparent, rgba(80,40,8,0.13))",
                pointerEvents: "none",
              }} />
              {/* Top stripe */}
              <div style={{
                height: 5, position: "absolute", top: 0, left: 0, right: 0,
                background: "linear-gradient(90deg, #7A2E2E,#9C3F3F,#B65252,#8F3737,#7A2E2E)",
                backgroundSize: "200% 100%", animation: "shimmerGold 3s linear infinite",
              }} />
              {/* Bottom stripe */}
              <div style={{
                height: 4, position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(90deg, #7A2E2E,#9C3F3F,#B65252,#8F3737,#7A2E2E)",
                backgroundSize: "200% 100%", animation: "shimmerGold 3.5s linear infinite",
              }} />

              {/* Left page content */}
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "30px 30px 36px",
                height: "100%", paddingTop: 50, paddingBottom: 40,
                opacity: contentVisible ? 1 : 0,
                transition: "opacity 0.7s ease",
              }}>
                {/* Badge */}
                <div style={{ marginBottom: 80 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "5px 16px",
                    background: "rgba(139,90,26,0.08)",
                    border: "1px solid rgba(196,154,46,0.28)", borderRadius: 20,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1L8.5 5.2H13.5L9.5 7.8L11 12.5L7 9.9L3 12.5L4.5 7.8L.5 5.2H5.5Z" fill="#C49A2E"/>
                    </svg>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 15, letterSpacing: "0.22em", textTransform: "uppercase",
                      color: "#7A5018", fontWeight: 500,
                    }}>Tale Treasury</span>
                  </div>
                </div>

                {/* Illustration */}
                <div style={{
                  width: "100%",
                  maxWidth: isMobile ? 200 : 268,
                  animation: contentVisible ? "breathe 5.5s ease-in-out infinite" : "none",
                  filter: "drop-shadow(0 12px 28px rgba(80,40,10,0.18))",
                }}>
                  <img src={GRANDMA} alt="Grandma reading"
                    style={{ width: "100%", height:"100%", display: "block", borderRadius: 14 }} />
                </div>

                {/* Tagline */}
                <div style={{ textAlign: "center", marginTop: 22 }}>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 17, fontWeight: 400, fontStyle: "italic",
                    color: "#5C3008", lineHeight: 1.6, marginBottom: 10,
                  }}>
                    Every great story begins<br/>with turning the first page.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
                    <div style={{ width: 26, height: 1, background: "rgba(196,154,46,0.4)" }} />
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1L7.1 4.3H10.5L7.7 6.2L8.9 9.5L6 7.6L3.1 9.5L4.3 6.2L1.5 4.3H4.9Z" fill="#C49A2E" opacity="0.62"/>
                    </svg>
                    <div style={{ width: 26, height: 1, background: "rgba(196,154,46,0.4)" }} />
                  </div>
                </div>

                {/* Page number */}
                <div style={{
                  position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center",
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 11,
                  color: "rgba(139,90,26,0.38)", letterSpacing: "0.1em",
                }}>— i —</div>
              </div>
            </div>

            {/* ═══ SPINE ═══ */}
            <div style={{
              display: isMobile ? "none" : "block", flexShrink: 0,
              background: "linear-gradient(to right, #7A2E2E,#9C3F3F,#B65252,#8F3737,#7A2E2E)",
              position: "relative", zIndex: 4,
              animation: "spineGlow 4s ease-in-out infinite",
              boxShadow: "inset 2px 0 5px rgba(80,40,0,0.22), inset -2px 0 5px rgba(80,40,0,0.18)",
            }}>
              {/* Spine top & bottom caps */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 5,
                background: "linear-gradient(90deg, #C49A2E, #EAC84A, #C49A2E)",
              }} />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 4,
                background: "linear-gradient(90deg, #C49A2E, #EAC84A, #C49A2E)",
              }} />
              {/* Spine text */}
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%) rotate(-90deg)",
                whiteSpace: "nowrap",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "11.5", letterSpacing: "0.22em", textTransform: "uppercase",
                color: "rgba(230, 201, 9, 0.45)", fontWeight: 1000,
              }}>Tale Treasury</div>
            </div>

            {/* ═══ RIGHT PAGE ═══ */}
            <div style={{
              flex: 1,
              background: "linear-gradient(158deg, #FAF3E0 0%, #F5EBCA 50%, #F0E4BA 100%)",
              position: "relative", overflow: "hidden",
              transformOrigin: "left center",
              animation: bookOpen ? "rightReveal 0.9s cubic-bezier(0.25,0.46,0.45,0.94) 0.05s forwards" : "none",
              opacity: 0,
            }}>
              {/* Ruled lines */}
              {[...Array(30)].map((_, i) => (
                <div key={i} className="page-rule" style={{ top: `${2.5 + i * 3.3}%` }} />
              ))}
              {/* Aged spots */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 50% 28% at 82% 10%, rgba(160,110,40,0.065) 0%, transparent 70%), radial-gradient(ellipse 32% 50% at 12% 88%, rgba(140,90,30,0.07) 0%, transparent 70%)",
              }} />
              {/* Left-edge spine shadow */}
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 26,
                background: "linear-gradient(to right, rgba(80,40,8,0.1), transparent)",
                pointerEvents: "none",
              }} />
              {/* Top stripe */}
              <div style={{
                height: 5, position: "absolute", top: 0, left: 0, right: 0,
                background: "linear-gradient(90deg, #7A2E2E,#9C3F3F,#B65252,#8F3737,#7A2E2E)",
                backgroundSize: "200% 100%", animation: "shimmerGold 3s linear infinite",
              }} />
              {/* Bottom stripe */}
              <div style={{
                height: 4, position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(90deg, #7A2E2E,#9C3F3F,#B65252,#8F3737,#7A2E2E)",
                backgroundSize: "200% 100%", animation: "shimmerGold 3.5s linear infinite",
              }} />

              {/* Corner ornaments */}
              {[
                { top: 14, right: 14 },
                { bottom: 14, right: 14 },
                { bottom: 14, left: 30 },
              ].map((pos, i) => (
                <div key={i} style={{ position: "absolute", width: 24, height: 24, opacity: 0.28, zIndex: 2, ...pos }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d={
                      i === 0 ? "M22 22L22 2L2 2" :
                      i === 1 ? "M22 2L22 22L2 22" :
                      "M2 2L2 22L22 22"
                    } stroke="#C49A2E" strokeWidth="1.2" fill="none"/>
                    <circle cx={i === 0 ? 22 : i === 1 ? 22 : 2} cy={i === 0 ? 2 : 22} r="2" fill="#C49A2E" opacity="0.5"/>
                  </svg>
                </div>
              ))}

              {/* Right page scrollable content */}
              <div
                className="right-scroll"
                style={{
                  padding: isMobile ? "20px" : "34px 36px 30px",
                  height: "calc(100% - 9px)",
                  overflowY: "auto",
                  paddingTop: 42,
                  opacity: contentVisible ? 1 : 0,
                  transition: "opacity 0.7s ease 0.15s",
                }}
              >
                {!success ? (
                  <>
                    {/* Chapter eyebrow */}
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(196,154,46,0.45))" }} />
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif", fontSize: 9.5,
                        letterSpacing: "0.24em", textTransform: "uppercase",
                        color: "#C49A2E", fontWeight: 600, whiteSpace: "nowrap",
                      }}>Chapter I — The Beginning</span>
                      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(196,154,46,0.45))" }} />
                    </div>

                    <h1 style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: isMobile ? 20 : 27, fontWeight: 700, color: "#1C1008",
                      lineHeight: 1.15, marginBottom: 5,
                    }}>
                      Welcome,<br/>
                      <em style={{ fontWeight: 400 }}>dear reader.</em>
                    </h1>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                      fontSize: isMobile ? 16 : 19 , color: "#8B6A30", lineHeight: 1.6, marginBottom: 22,
                    }}>
                      Your story awaits — sign up to continue the adventure.
                    </p>

                    <form onSubmit={handlesubmit}>
                      <Field
                        label="Your Scroll Name" id="email" type="email"
                        placeholder="e.g. avid.reader@tales.com"
                        value={email} onChange={e => setEmail(e.target.value)}
                        icon={
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4l6 4 6-4M2 4h12v9H2z" stroke="#9B7840" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                        }
                      />

                      <Field
                        label="Secret Passage" id="password"
                        type={showPwd ? "text" : "password"}
                        placeholder="The magic words…"
                        value={password} onChange={e => setPassword(e.target.value)}
                        icon={
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                            <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#9B7840" strokeWidth="1.3" fill="none"/>
                            <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="#9B7840" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                          </svg>
                        }
                        right={
                          <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#9B7840", display: "flex", padding: 4, transition: "color 0.2s",
                          }}>
                            <EyeIcon open={showPwd} />
                          </button>
                        }
                      />

                      {/* <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18, marginTop: -4}}>
                        <button type="button" className="tt-link">
                          Misplaced your key? Recover it →
                        </button>
                      </div> */}
                      <Field
                        label="Re-nter secret Passage" id="password"
                        type={showRePwd ? "text" : "password"}
                        placeholder="The magic words…"
                        value={rePass} onChange={e => setRePass(e.target.value)}
                        icon={
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                            <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#9B7840" strokeWidth="1.3" fill="none"/>
                            <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="#9B7840" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                          </svg>
                        }
                        right={
                          <button type="button" onClick={() => setShowRePwd(v => !v)} style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#9B7840", display: "flex", padding: 4, transition: "color 0.2s",
                          }}>
                            <EyeIcon open={showRePwd} />
                          </button>
                        }
                      />

                      <button type="submit" className="btn-primary" disabled={loading}>
                        <div className="btn-shine" />
                        {loading ? (
                          <div className="btn-inner">
                            <div style={{
                              width: 14, height: 14,
                              border: "2px solid rgba(255,253,246,0.3)",
                              borderTopColor: "#FFFDF6", borderRadius: "50%",
                              animation: "spin 0.65s linear infinite",
                            }} />
                            <span>Turning the page...</span>
                          </div>
                        ) : (
                          <div className="btn-inner">
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                              <path d="M2 8h9M7 4l5 4-5 4" stroke="#FFFDF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                            Open My Story
                          </div>
                        )}
                      </button>

                      <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "15px 0" }}>
                        <div style={{ flex: 1, height: 1, background: "rgba(180,130,50,0.22)" }} />
                        <span style={{
                          fontFamily: "'Cormorant Garamond', serif", fontSize: 10.5,
                          letterSpacing: "0.12em", textTransform: "uppercase", color: "#A08040",
                        }}>or continue with</span>
                        <div style={{ flex: 1, height: 1, background: "rgba(180,130,50,0.22)" }} />
                      </div>

                      <GoogleLogin
                          onSuccess={async (credentialResponse) => {
                          const token = credentialResponse.credential;

                           const res = await api.post("/auth/google", {token,});
                           localStorage.setItem("token", res.data.token);
                           navigate("/dashboard");
                                              }
                              }
                      onError={() => {
                        console.log("Login Failed");
                      }}
                    />
                    </form>

                    { <div style={{
                      marginTop: 16, padding: "11px 14px",
                      background: "rgba(196,154,46,0.07)",
                      border: "1px solid rgba(196,154,46,0.2)", borderRadius: 8,
                      textAlign: "center",
                    }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 14, fontStyle: "italic", color: "#7A5A28",
                      }}>
                        Been here before?{" "}
                        <button type="button" style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                          fontWeight: 700, fontSize: 14.5, color: "#6B3E10",
                          textDecoration: "underline", textDecorationStyle: "dotted",
                          textUnderlineOffset: "2px", padding: 0, transition: "color 0.2s",
                        }} onClick={moveToLogin}>
                          Continue your tale →
                        </button>
                      </span>
                    </div> }
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "28px 8px", animation: "fadeUp 0.5s ease both" }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      background: "rgba(196,154,46,0.1)", border: "2px solid rgba(196,154,46,0.38)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 16px",
                      animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}>
                      <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
                        <path d="M5 13.5l5.5 5.5 11-11" stroke="#C49A2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h2 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 22, fontWeight: 700, color: "#1C1008", marginBottom: 8,
                    }}>Your chapter awaits!</h2>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic", fontSize: 15, color: "#8B6A30", lineHeight: 1.65,
                    }}>
                      The pages are turning…<br/>Step into your story, dear reader.
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
                      {[0, 0.15, 0.3].map((d, i) => (
                        <div key={i} style={{
                          width: 7, height: 7, borderRadius: "50%", background: "#C49A2E",
                          animation: `dotPulse 1.2s ease-in-out ${d}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Page number */}
                <div style={{
                  textAlign: "center", marginTop: 14,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 11, color: "rgba(139,90,26,0.35)", letterSpacing: "0.1em",
                }}>— ii —</div>
              </div>
            </div>
          </div>

          {/* ── BOOK THICKNESS — bottom page edges ── */}
          <div style={{
            position: "absolute", bottom: -9, left: 8, right: -3,
            height: 12, background: "linear-gradient(to bottom, #E2D490, #CEC070)",
            borderRadius: "0 0 3px 3px", zIndex: 1,
          }} />
          <div style={{
            position: "absolute", bottom: -17, left: 13, right: -6,
            height: 10, background: "linear-gradient(to bottom, #CEC070, #BAA850)",
            borderRadius: "0 0 3px 3px", zIndex: 0,
          }} />
          <div style={{
            position: "absolute", bottom: -23, left: 17, right: -8,
            height: 8, background: "linear-gradient(to bottom, #7A2E2E,#9C3F3F,#B65252,#8F3737,#7A2E2E)",
            borderRadius: "0 0 3px 3px", zIndex: -1,
          }} />

          {/* Right binding side */}
          <div style={{
            position: "absolute", top: 5, right: -8, bottom: -23,
            width: 10, background: "linear-gradient(to right, #7A2E2E,#9C3F3F,#B65252,#8F3737,#7A2E2E)",
            borderRadius: "0 3px 3px 0", zIndex: 1,
          }} />
        </div>
      </div>
    </>
  );
}