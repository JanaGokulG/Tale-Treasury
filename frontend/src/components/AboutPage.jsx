import { useState, useEffect } from "react";

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes pageFlipOpen {
    0%   { transform: perspective(1400px) rotateY(0deg);   opacity: 1; }
    100% { transform: perspective(1400px) rotateY(-180deg); opacity: 1; }
  }
  @keyframes overlayFadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes overlayFadeOut { from { opacity: 1; } to { opacity: 0; } }
  @keyframes bookAppear {
    0%   { transform: scale(0.78) translateY(40px); opacity: 0; }
    100% { transform: scale(1)    translateY(0);    opacity: 1; }
  }
  @keyframes contentReveal {
    0%   { opacity: 0; transform: translateY(18px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes quillWiggle {
    0%,100% { transform: rotate(-10deg); }
    50%      { transform: rotate(10deg); }
  }
  @keyframes inkDrop {
    0%   { opacity: 0; transform: scale(0) translateY(-6px); }
    60%  { opacity: 1; transform: scale(1.2) translateY(0); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes pageFlutter {
    0%,100% { transform: perspective(800px) rotateY(0deg); }
    50%      { transform: perspective(800px) rotateY(-6deg); }
  }
  @keyframes starTwinkle {
    0%,100% { opacity: 0.3; transform: scale(1); }
    50%      { opacity: 1;   transform: scale(1.4); }
  }
  @keyframes floatUp {
    0%   { transform: translateY(0px);  opacity: 0.7; }
    100% { transform: translateY(-8px); opacity: 1;   }
  }
  @keyframes closeFlip {
    0%   { transform: perspective(1400px) rotateY(-180deg); }
    100% { transform: perspective(1400px) rotateY(0deg); }
  }

  .about-overlay {
    position: fixed; inset: 0;
    background: rgba(8, 4, 2, 0.92);
    z-index: 2000;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(8px);
    overflow: hidden; /* Prevent scrollbars during animation */
  }
  .overlay-entering { animation: overlayFadeIn 0.35s ease forwards; }
  .overlay-exiting  { animation: overlayFadeOut 0.4s ease forwards; }

  /* ── Book wrapper ── */
  .book-scene {
    perspective: 1400px;
    width: min(880px, 96vw);
    height: min(580px, 85vh);
    animation: bookAppear 0.55s cubic-bezier(.34,1.56,.64,1) 0.1s both;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.3s ease;
  }

  .book-container {
    width: 100%; height: 100%;
    position: relative;
    transform-style: preserve-3d;
    display: flex;
  }

  /* ── Mobile Responsiveness ── */
  @media (max-width: 900px) {
    .book-scene { height: min(500px, 80vh); }
    .page-content { padding: clamp(14px, 3vw, 24px); }
    .chapter-title { font-size: clamp(15px, 3.5vw, 19px); }
    .page-body { font-size: clamp(10.5px, 2.4vw, 12px); line-height: 1.5; }
    .drop-cap { font-size: clamp(34px, 7vw, 44px); }
  }

  @media (max-width: 768px) {
    .book-scene {
      transform: scale(0.9);
      width: 98vw;
    }
  }

  @media (max-width: 600px) {
    .about-overlay {
      align-items: flex-start;
      padding: 40px 16px;
      overflow-y: auto;
      display: block; /* Allow natural scrolling */
    }
    .book-scene {
      width: 100%;
      height: auto;
      min-height: auto;
      transform: none;
      perspective: none;
      margin: 0 auto;
      display: block;
    }
    .book-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      transform-style: flat;
    }
    .book-spine { display: none; }
    
    /* Stacked Page Sections */
    .book-left-page, .book-right-page {
      width: 100% !important;
      height: auto !important;
      margin: 0 !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
      position: relative !important;
    }
    
    /* Cover as Header */
    .book-cover-panel {
      position: relative !important;
      width: 100% !important;
      height: 240px !important;
      transform: none !important;
      animation: none !important;
      margin-bottom: 10px;
    }
    .cover-back { display: none; }
    .cover-front { border-radius: 8px !important; }

    .page-content {
      padding: 30px 20px;
      height: auto;
      animation: contentReveal 0.6s ease forwards;
    }
    .page-lines { opacity: 0.3; }
    
    .close-btn {
      position: fixed !important;
      top: 12px !important; right: 12px !important;
      z-index: 100;
    }
  }

  /* ── Spine ── */
  .book-spine {
    width: 36px; height: 100%;
    background: linear-gradient(to right, #3A1C08, #6B3A18, #4A2410, #2A1208);
    border-radius: 4px 0 0 4px;
    box-shadow: -4px 0 18px rgba(0,0,0,0.7), inset 2px 0 6px rgba(255,180,80,0.12);
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 3;
  }
  .spine-title {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px; font-weight: 500; letter-spacing: 0.2em;
    color: rgba(220,170,90,0.75);
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
    user-select: none;
  }

  /* ── Cover (right half, appears first, then flips) ── */
  .book-cover-panel {
    width: calc(50% - 18px);
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    transform-origin: left center;
    transform-style: preserve-3d;
    z-index: 4;
    border-radius: 0 6px 6px 0;
    box-shadow: 8px 0 32px rgba(0,0,0,0.55);
  }
  .cover-flipping {
    animation: pageFlipOpen 0.9s cubic-bezier(0.645,0.045,0.355,1) 0.2s forwards;
  }
  .cover-closing {
    animation: closeFlip 0.9s cubic-bezier(0.645,0.045,0.355,1) forwards;
  }

  .cover-front {
    backface-visibility: hidden;
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #5C2A10 0%, #3A1808 40%, #2A1006 100%);
    border-radius: 0 6px 6px 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 32px 24px;
    gap: 16px;
    position: relative; overflow: hidden;
  }
  .cover-front::before {
    content: '';
    position: absolute; inset: 8px;
    border: 1px solid rgba(200,144,60,0.35);
    border-radius: 4px; pointer-events: none;
  }
  .cover-front::after {
    content: '';
    position: absolute; inset: 12px;
    border: 1px solid rgba(200,144,60,0.15);
    border-radius: 3px; pointer-events: none;
  }

  .cover-back {
    backface-visibility: hidden;
    width: 100%; height: 100%;
    position: absolute; top: 0; left: 0;
    transform: rotateY(180deg);
    background: linear-gradient(to right, #F5E8C0, #EDD8A0);
    border-radius: 0 6px 6px 0;
    border-left: 3px solid rgba(139,96,32,0.4);
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Left page (back of book, static) ── */
  .book-left-page {
    width: calc(50% - 18px);
    height: 100%;
    margin-left: 36px;
    background: linear-gradient(to right, #F0E0B0, #F5E8C0);
    border-radius: 0;
    position: relative;
    overflow: hidden;
    box-shadow: inset 4px 0 12px rgba(0,0,0,0.12);
  }
  .book-left-page::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 18px;
    background: linear-gradient(to right, rgba(0,0,0,0.12), transparent);
  }

  /* ── Right page (revealed after flip) ── */
  .book-right-page {
    width: calc(50% - 18px);
    height: 100%;
    background: linear-gradient(to left, #EDD8A0, #F5E8C0);
    border-radius: 0 6px 6px 0;
    position: relative; overflow: hidden;
  }
  .book-right-page::after {
    content: '';
    position: absolute; right: 0; top: 0; bottom: 0; width: 18px;
    background: linear-gradient(to left, rgba(0,0,0,0.08), transparent);
  }

  /* ── Page line rules ── */
  .page-lines {
    position: absolute; inset: 0;
    background-image: repeating-linear-gradient(
      transparent, transparent 31px,
      rgba(139,100,40,0.12) 31px, rgba(139,100,40,0.12) 32px
    );
    background-position: 0 48px;
  }

  /* ── Content containers ── */
  .page-content {
    position: relative; z-index: 2;
    padding: 36px 28px 24px;
    height: 100%;
    display: flex; flex-direction: column;
    gap: 0;
    animation: contentReveal 0.6s ease 1.15s both;
  }

  /* ── Page number ── */
  .page-number {
    position: absolute; bottom: 14px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 12px; color: rgba(100,70,30,0.5);
    font-style: italic;
  }
  .page-number-left  { right: 20px; }
  .page-number-right { left: 20px; }

  /* ── Cover ornament ── */
  .cover-ornament {
    color: #C8903C; font-size: 48px;
    text-shadow: 0 0 24px rgba(200,144,60,0.6);
    animation: floatUp 2.5s ease-in-out infinite alternate;
  }
  .cover-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(18px,2.5vw,26px); font-weight: 700; font-style: italic;
    color: #F5DEB3;
    text-align: center;
    text-shadow: 0 2px 12px rgba(0,0,0,0.6);
    line-height: 1.3;
  }
  .cover-subtitle {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px; letter-spacing: 0.22em;
    color: rgba(200,160,80,0.65);
    text-transform: uppercase; text-align: center;
  }
  .cover-rule {
    width: 60%; height: 1px;
    background: linear-gradient(to right, transparent, rgba(200,144,60,0.6), transparent);
  }
  .cover-year {
    font-family: 'Lora', serif; font-size: 12px;
    color: rgba(200,160,80,0.45);
    letter-spacing: 0.18em;
  }

  /* ── Chapter heading ── */
  .chapter-label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase;
    color: rgba(100,70,30,0.5); margin-bottom: 6px;
  }
  .chapter-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(17px,2.2vw,22px); font-weight: 700; font-style: italic;
    color: #3C2410; line-height: 1.25; margin-bottom: 12px;
  }
  .chapter-rule {
    width: 100%; height: 1px; margin-bottom: 16px;
    background: linear-gradient(to right, rgba(139,96,32,0.5), rgba(139,96,32,0.15));
  }

  /* ── Drop cap ── */
  .drop-cap {
    float: left; font-family: 'Playfair Display', serif;
    font-size: 56px; line-height: 0.8; font-weight: 700;
    color: #8B5A20; margin-right: 6px; margin-top: 4px;
    text-shadow: 1px 1px 0 rgba(139,90,32,0.3);
  }

  /* ── Body text ── */
  .page-body {
    font-family: 'Lora', serif; font-size: clamp(11.5px,1.2vw,13.5px);
    line-height: 1.82; color: #3C2A14;
    text-align: justify;
  }
  .page-body em { font-style: italic; color: #6B3A18; }
  .page-body strong { font-weight: 600; color: #5A2A10; }

  /* ── Section divider ── */
  .ornament-divider {
    text-align: center; margin: 14px 0;
    color: rgba(139,90,32,0.45); font-size: 14px; letter-spacing: 8px;
  }

  /* ── Creator cards (right page) ── */
  .creators-section {
    display: flex; flex-direction: column; gap: 10px;
    margin-top: 8px;
  }
  .creator-card {
    display: flex; align-items: center; gap: 12px;
    padding: 9px 12px;
    background: rgba(139,90,32,0.07);
    border-left: 2px solid rgba(139,90,32,0.35);
    border-radius: 0 4px 4px 0;
    transition: background 0.2s;
  }
  .creator-card:hover { background: rgba(139,90,32,0.13); }
  .creator-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, #C8903C, #8B5A20);
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  .creator-name {
    font-family: 'Playfair Display', serif;
    font-size: 13.5px; font-weight: 700; color: #3C2410;
    margin-bottom: 1px;
  }
  .creator-role {
    font-family: 'Lora', serif; font-size: 11px; font-style: italic;
    color: rgba(100,60,20,0.65);
  }

  /* ── Quill decoration ── */
  .quill-deco {
    font-size: 22px;
    display: inline-block;
    animation: quillWiggle 3s ease-in-out infinite;
  }

  /* ── Close button ── */
  .close-btn {
    position: absolute; top: 16px; right: 20px; z-index: 10;
    background: rgba(60,30,10,0.72); border: 1px solid rgba(200,144,60,0.4);
    color: #F5DEB3; font-family: 'Lora', serif; font-size: 12px;
    padding: 5px 14px; border-radius: 20px; cursor: pointer;
    letter-spacing: 0.1em;
    transition: background 0.2s, transform 0.15s;
  }
  .close-btn:hover { background: rgba(100,50,15,0.9); transform: scale(1.04); }

  /* ── Wax seal ── */
  .wax-seal {
    position: absolute; bottom: 22px; right: 22px;
    width: 46px; height: 46px; border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, #D44, #9A1A1A);
    border: 3px solid rgba(255,200,80,0.5);
    box-shadow: 0 3px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }

  /* ── Stars on cover ── */
  .cover-star {
    position: absolute; color: #C8903C;
    animation: starTwinkle var(--dur,2s) ease-in-out var(--del,0s) infinite;
  }

  /* ── Page curl hint ── */
  .page-curl {
    position: absolute; bottom: 0; right: 0;
    width: 24px; height: 24px;
    background: linear-gradient(225deg, #E0C88A 40%, rgba(245,232,192,0) 100%);
    border-top-left-radius: 18px;
    opacity: 0.6;
  }

  /* ── Tape/bookmark ── */
  .bookmark-ribbon {
    position: absolute; top: -2px; left: 32px;
    width: 18px; height: 44px;
    background: linear-gradient(to bottom, #C84030, #A02020);
    border-radius: 0 0 4px 4px;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.3);
  }
  .bookmark-ribbon::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0;
    border-top: 8px solid #A02020;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
  }
`;

/* ── Creators data ─────────────────────────────────────────────────────── */
/* Removed as per request */

/* ════════════════════════════════════════════════════════════════════════════
   ABOUT PAGE COMPONENT
 ════════════════════════════════════════════════════════════════════════════ */
export default function AboutPage({ onClose }) {
  const [phase, setPhase] = useState("entering"); // entering | open | closing

  // Kick off the cover flip right after mount
  useEffect(() => {
    if (phase === "entering") {
      const t = setTimeout(() => setPhase("open"), 80);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleClose = () => {
    setPhase("closing");
    setTimeout(onClose, 1300);
  };

  const overlayClass = [
    "about-overlay",
    phase === "entering" ? "overlay-entering" : "",
    phase === "closing"  ? "overlay-exiting"  : "",
  ].join(" ");

  const coverClass = [
    "book-cover-panel",
    phase !== "entering" ? "cover-flipping" : "",
    phase === "closing"  ? "cover-closing"  : "",
  ].join(" ");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className={overlayClass} onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
        <div className="book-scene">
          <div className="book-container">

            {/* ── Spine ── */}
            <div className="book-spine">
              <span className="spine-title">Tale Treasury · 2026</span>
            </div>

            {/* ── Left page (always visible) ── */}
            <div className="book-left-page">
              <div className="page-lines" />
              <div className="bookmark-ribbon" />

              <div className="page-content">
                <div className="chapter-label">Chapter I</div>
                <div className="chapter-title">The Magical Treasury</div>
                <div className="chapter-rule" />

                <p className="page-body">
                  <span className="drop-cap">T</span>
                  ale Treasury is a magical storytelling platform designed especially for
                  children and their families, where parents can create personalized stories
                  using the power of AI.
                </p>

                <div className="ornament-divider">· · · ✦ · · ·</div>

                <p className="page-body">
                  Our goal is to make storytelling more engaging, creative, and meaningful
                  by giving every child a story that feels uniquely theirs. Whether it’s
                  an adventurous journey, a bedtime tale, or a fun learning experience,
                  Tale Treasury helps turn imagination into beautifully crafted stories
                  that children will love and remember.
                </p>

                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="quill-deco">🌈</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, fontStyle: "italic", color: "rgba(100,70,30,0.5)" }}>
                    Written with Heart, 2026
                  </span>
                </div>
              </div>

              <span className="page-number page-number-left">2</span>
            </div>

            {/* ── Right page (revealed after cover flips) ── */}
            <div className="book-right-page">
              <div className="page-lines" />

              <div className="page-content">
                <div className="chapter-label">Chapter II</div>
                <div className="chapter-title">Inspiration & Bond</div>
                <div className="chapter-rule" />

                <p className="page-body">
                  We believe that every child deserves stories that inspire curiosity,
                  creativity, and joy. By combining technology with storytelling,
                  Tale Treasury makes it easy for parents to generate fun, educational,
                  and customized stories anytime.
                </p>

                <div className="ornament-divider">· · · ✦ · · ·</div>

                <p className="page-body">
                  Our platform not only encourages reading habits but also strengthens
                  the bond between parents and children through shared storytelling moments,
                  making every story an unforgettable experience.
                </p>

                <div className="ornament-divider" style={{ marginTop: 14 }}>· · · ✦ · · ·</div>

                <p className="page-body" style={{ fontSize: 11.5, textAlign: "center", fontStyle: "italic" }}>
                  "Turning imagination into reality, one story at a time."
                </p>

                <div className="wax-seal">✦</div>
              </div>

              <div className="page-curl" />
              <span className="page-number page-number-right">3</span>
            </div>

            {/* ── Cover (flips open on mount) ── */}
            <div className={coverClass}>
              {/* Front face of cover */}
              <div className="cover-front">
                {/* Scattered stars */}
                {[
                  { top:"12%", left:"8%",  fs:10, dur:"2.2s", del:"0s"  },
                  { top:"18%", right:"12%",fs:8,  dur:"3.1s", del:"0.8s"},
                  { top:"72%", left:"14%", fs:9,  dur:"2.7s", del:"1.4s"},
                  { top:"80%", right:"8%", fs:7,  dur:"1.9s", del:"0.3s"},
                ].map((s,i)=>(
                  <span key={i} className="cover-star"
                    style={{ top:s.top, left:s.left, right:s.right, fontSize:s.fs,
                      "--dur":s.dur, "--del":s.del }}>✦</span>
                ))}

                <div className="cover-ornament">👑</div>
                <div className="cover-rule" />
                <div className="cover-title">Tale Treasury</div>
                <div className="cover-subtitle">Magical Personalized Stories</div>
                <div className="cover-rule" />
                <div className="cover-year">MMXXVI · About</div>
              </div>

              {/* Back face of cover (parchment texture after flip) */}
              <div className="cover-back">
                <div style={{
                  background: "repeating-linear-gradient(#F5E8C7,#F5E8C7 29px,#EDE0B8 29px,#EDE0B8 30px)",
                  width:"100%", height:"100%", borderRadius:"0 6px 6px 0",
                  opacity: 0.5,
                }} />
              </div>
            </div>

          </div>{/* /book-container */}
        </div>{/* /book-scene */}

        {/* Close button — outside the 3d context */}
        <button className="close-btn" onClick={handleClose}
          style={{ position:"fixed", top:24, right:28 }}>
          Close the Book ✕
        </button>
      </div>
    </>
  );
}
