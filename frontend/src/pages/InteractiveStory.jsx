import { useState, useEffect, useRef, useCallback } from "react";
import jsPDF from "jspdf";
import { useNavigate, useLocation } from "react-router-dom";

const PARCHMENT = "#f5e6c8";
const INK = "#2c1a0e";
const INK_LIGHT = "#5c3d1e";
const GOLD = "#b8860b";
const GOLD_LIGHT = "#d4a017";

// ─── Replace with your actual API base URL ────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=IM+Fell+English:ital@0;1&family=UnifrakturMaguntia&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, #root {
    background: #1a0f05;
    min-height: 100vh;
    font-family: 'IM Fell English', serif;
    overflow-x: hidden;
  }

  .page-bg {
    min-height: 100vh;
    background: radial-gradient(ellipse at 50% 0%, #3d1f00 0%, #1a0f05 65%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 44px 20px 72px;
  }

  .title-area {
    text-align: center;
    margin-bottom: 36px;
    animation: fadeDown 0.8s ease both;
  }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .title-area h1 {
    font-family: 'Cinzel Decorative', serif;
    font-size: clamp(1.5rem, 3.8vw, 2.4rem);
    color: ${GOLD_LIGHT};
    text-shadow: 0 0 28px rgba(212,160,23,0.38), 0 2px 6px rgba(0,0,0,0.5);
    letter-spacing: 0.05em;
    margin-bottom: 7px;
  }

  .title-area p {
    font-family: 'IM Fell English', serif;
    font-style: italic;
    color: rgba(212,160,23,0.55);
    font-size: 1rem;
  }

  .gold-divider {
    width: 160px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${GOLD}, transparent);
    margin: 9px auto;
  }

  .scroll-wrapper { width: 100%; max-width: 760px; }

  .scroll-rod {
    position: relative;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .scroll-rod-bar {
    position: absolute;
    left: 18px; right: 18px;
    height: 18px;
    background: linear-gradient(180deg, #8B5E1A 0%, #5c3d10 45%, #7a4f14 65%, #3d2608 100%);
    border-radius: 9px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12);
  }

  .scroll-knob {
    width: 32px; height: 32px;
    background: radial-gradient(circle at 35% 35%, #d4a017 0%, #8B6914 42%, #5c4010 100%);
    border-radius: 50%;
    border: 2px solid #b8860b;
    box-shadow: 0 2px 7px rgba(0,0,0,0.45);
    z-index: 5; flex-shrink: 0;
  }

  .scroll-body {
    background: ${PARCHMENT};
    margin: 0 18px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(140,90,20,0.3), 0 10px 36px rgba(0,0,0,0.55), inset 0 0 70px rgba(180,130,60,0.14);
  }

  .scroll-body::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(150,100,30,0.055) 27px, rgba(150,100,30,0.055) 28px);
    pointer-events: none;
    z-index: 1;
  }

  .scroll-body.unrolling {
    animation: unroll 1s cubic-bezier(0.34, 1.35, 0.64, 1) both;
  }

  @keyframes unroll {
    0% { transform: scaleY(0); opacity: 0; }
    25% { opacity: 1; }
    100% { transform: scaleY(1); opacity: 1; }
  }

  .scroll-inner {
    position: relative;
    z-index: 2;
    padding: 38px 56px 48px;
  }

  .section-label {
    font-family: 'Cinzel Decorative', serif;
    font-size: 0.64rem;
    color: ${GOLD};
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 11px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, ${GOLD_LIGHT}55, transparent);
  }

  .genre-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
    gap: 7px;
    margin-bottom: 22px;
  }

  .option-btn {
    padding: 7px 10px;
    background: transparent;
    border: 1px solid ${GOLD}55;
    border-radius: 3px;
    color: ${INK_LIGHT};
    font-family: 'IM Fell English', serif;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.18s ease;
    text-align: center;
  }

  .option-btn:hover { background: rgba(184,134,11,0.1); border-color: ${GOLD}; color: ${INK}; }
  .option-btn.selected { background: rgba(184,134,11,0.18); border-color: ${GOLD}; color: ${INK}; font-weight: bold; }

  .prompt-input {
    width: 100%;
    padding: 13px 16px;
    background: rgba(200,160,80,0.1);
    border: 1px solid ${GOLD}45;
    border-radius: 3px;
    color: ${INK};
    font-family: 'IM Fell English', serif;
    font-size: 0.98rem;
    font-style: italic;
    resize: none;
    outline: none;
    transition: border-color 0.2s;
    line-height: 1.6;
    margin-bottom: 18px;
  }

  .prompt-input:focus { border-color: ${GOLD}; background: rgba(200,160,80,0.14); }

  .conjure-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 13px 22px;
    background: linear-gradient(135deg, #5c3d10 0%, #3d2608 50%, #5c3d10 100%);
    border: 1px solid ${GOLD};
    border-radius: 3px;
    color: ${GOLD_LIGHT};
    font-family: 'Cinzel Decorative', serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 3px 14px rgba(0,0,0,0.28);
  }

  .conjure-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #7a5214 0%, #5c3d10 50%, #7a5214 100%);
    box-shadow: 0 5px 22px rgba(0,0,0,0.35), 0 0 16px rgba(184,134,11,0.15);
    transform: translateY(-1px);
  }

  .conjure-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .quill-icon { font-size: 1.1rem; transition: transform 0.25s ease; }
  .conjure-btn:hover .quill-icon { transform: rotate(-14deg) scale(1.15); }
  .conjure-btn.writing .quill-icon { animation: writeAnim 0.35s ease infinite alternate; }

  @keyframes writeAnim {
    from { transform: rotate(-8deg) translateY(0); }
    to { transform: rotate(6deg) translateY(-3px); }
  }

  .story-title-display {
    font-family: 'UnifrakturMaguntia', cursive;
    font-size: 1.95rem;
    color: ${INK};
    text-align: center;
    margin-bottom: 24px;
    line-height: 1.25;
  }

  .story-text { font-family: 'IM Fell English', serif; font-size: 1.06rem; color: ${INK}; line-height: 1.95; text-align: justify; }
  .story-paragraph { margin-bottom: 1.1em; }
  .story-paragraph:last-child { margin-bottom: 0; }

  .drop-cap {
    font-family: 'UnifrakturMaguntia', cursive;
    font-size: 3.5rem;
    float: left;
    line-height: 0.78;
    margin: 6px 9px 0 0;
    color: ${GOLD};
  }

  .cursor-blink {
    display: inline-block;
    width: 2px; height: 1em;
    background: ${INK};
    vertical-align: text-bottom;
    animation: blink 0.75s step-end infinite;
    margin-left: 1px;
  }

  @keyframes blink { 50% { opacity: 0; } }

  .story-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 26px 0 20px;
    color: ${GOLD}90;
    font-size: 0.9rem;
  }

  .story-divider::before, .story-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${GOLD}45, transparent);
  }

  .chosen-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    background: rgba(184,134,11,0.1);
    border: 1px solid ${GOLD}40;
    border-radius: 3px;
    font-family: 'IM Fell English', serif;
    font-size: 0.84rem;
    color: ${INK_LIGHT};
    font-style: italic;
    margin-bottom: 18px;
  }

  .choices-container {
    margin-top: 30px;
    padding: 22px 20px;
    background: rgba(184,134,11,0.07);
    border-radius: 5px;
    border: 1px solid ${GOLD}38;
  }

  .choices-label {
    font-family: 'Cinzel Decorative', serif;
    color: ${GOLD};
    text-align: center;
    margin-bottom: 14px;
    font-size: 0.88rem;
    letter-spacing: 0.06em;
  }

  .choice-btn {
    display: block;
    width: 100%;
    padding: 14px 18px;
    background: rgba(245,230,200,0.55);
    border: 1px solid ${GOLD}50;
    border-left: 4px solid ${GOLD};
    border-radius: 3px;
    margin-bottom: 11px;
    font-family: 'IM Fell English', serif;
    font-size: 0.98rem;
    color: ${INK};
    line-height: 1.6;
    cursor: pointer;
    text-align: left;
    transition: all 0.18s ease;
  }

  .choice-btn:last-child { margin-bottom: 0; }

  .choice-btn:hover {
    background: rgba(184,134,11,0.14);
    border-color: ${GOLD};
    transform: translateX(4px);
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  }

  .choice-num {
    font-family: 'Cinzel Decorative', serif;
    font-size: 0.62rem;
    color: ${GOLD};
    display: block;
    margin-bottom: 4px;
    letter-spacing: 0.14em;
  }

  .ending-seal {
    text-align: center;
    margin-top: 30px;
    padding-top: 22px;
    border-top: 1px solid ${GOLD}35;
  }

  .ending-seal-text {
    font-family: 'Cinzel Decorative', serif;
    font-size: 0.8rem;
    color: ${GOLD}90;
    letter-spacing: 0.22em;
  }

  .ending-ornament { font-size: 1.2rem; margin: 8px 0; color: ${GOLD}75; }

  .stats-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    margin-top: 18px;
    padding-top: 12px;
    border-top: 1px solid ${GOLD}22;
  }

  .stat-item { font-family: 'IM Fell English', serif; font-size: 0.78rem; color: ${INK_LIGHT}75; font-style: italic; }

  .new-story-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 10px;
    padding: 11px 20px;
    background: transparent;
    border: 1px solid ${GOLD}50;
    border-radius: 3px;
    color: ${INK_LIGHT};
    font-family: 'IM Fell English', serif;
    font-size: 0.92rem;
    font-style: italic;
    cursor: pointer;
    transition: all 0.18s ease;
    width: 100%;
  }

  .new-story-btn:hover { background: rgba(184,134,11,0.08); border-color: ${GOLD}; color: ${INK}; }

  .export-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 10px;
    padding: 11px 20px;
    background: rgba(184,134,11,0.12);
    border: 1px solid ${GOLD}70;
    border-radius: 3px;
    color: ${INK};
    font-family: 'IM Fell English', serif;
    font-size: 0.92rem;
    font-style: italic;
    cursor: pointer;
    transition: all 0.18s ease;
    width: 100%;
  }

  .export-btn:hover { background: rgba(184,134,11,0.2); border-color: ${GOLD}; }

  .loading-quill {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 32px 0;
  }

  @keyframes dotPulse {
    0%, 100% { opacity: 0.28; transform: scale(0.75); }
    50% { opacity: 1; transform: scale(1); }
  }

  /* ── Resume Modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.72);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    padding: 20px;
  }

  .modal-box {
    background: ${PARCHMENT};
    border: 2px solid ${GOLD};
    border-radius: 6px;
    padding: 36px 32px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: 0 12px 48px rgba(0,0,0,0.6);
  }

  .modal-icon { font-size: 2.2rem; margin-bottom: 12px; }

  .modal-title {
    font-family: 'Cinzel Decorative', serif;
    font-size: 1.05rem;
    color: ${INK};
    margin-bottom: 10px;
  }

  .modal-body {
    font-family: 'IM Fell English', serif;
    font-size: 0.96rem;
    color: ${INK_LIGHT};
    font-style: italic;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .modal-actions { display: flex; gap: 12px; }

  .modal-btn-primary {
    flex: 1;
    padding: 11px 16px;
    background: linear-gradient(135deg, #5c3d10, #3d2608);
    border: 1px solid ${GOLD};
    border-radius: 3px;
    color: ${GOLD_LIGHT};
    font-family: 'Cinzel Decorative', serif;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.18s;
  }

  .modal-btn-primary:hover { background: linear-gradient(135deg, #7a5214, #5c3d10); }

  .modal-btn-secondary {
    flex: 1;
    padding: 11px 16px;
    background: transparent;
    border: 1px solid ${GOLD}55;
    border-radius: 3px;
    color: ${INK_LIGHT};
    font-family: 'IM Fell English', serif;
    font-size: 0.9rem;
    font-style: italic;
    cursor: pointer;
    transition: all 0.18s;
  }

  .modal-btn-secondary:hover { background: rgba(184,134,11,0.08); border-color: ${GOLD}; }

  .back-to-dashboard-btn {
    position: absolute;
    top: 24px;
    left: 24px;
    background: transparent;
    border: 1px solid ${GOLD}50;
    color: ${GOLD_LIGHT};
    padding: 8px 16px;
    border-radius: 4px;
    font-family: 'Cinzel Decorative', serif;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 100;
  }
  .back-to-dashboard-btn:hover {
    background: rgba(184,134,11,0.15);
    border-color: ${GOLD};
    transform: translateX(-2px);
  }

  @media (max-width: 560px) {
    .scroll-inner { padding: 26px 26px 34px; }
    .genre-grid { grid-template-columns: repeat(4, 1fr); }
  }
`;

const GENRES = ["Fantasy", "Adventure", "Mystery", "Sci-Fi", "Folklore", "Friendship", "Animals", "Magic"];
const AGE_GROUPS = ["4–6 yrs", "7–9 yrs", "10–12 yrs"];
const MAX_CHOICES = 3;

const QuillSVG = ({ animating }) => (
  <svg width="64" height="56" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g style={{ transformOrigin: '20px 55px', animation: animating ? 'quillWrite 0.45s ease-in-out infinite alternate' : 'none' }}>
      <style>{`@keyframes quillWrite { from { transform: rotate(-8deg); } to { transform: rotate(8deg) translateY(-4px); } }`}</style>
      <path d="M20 55 Q35 40 65 8 Q60 20 50 30 Q45 35 40 38 Q55 18 70 5 Q55 12 42 28 Q38 33 32 42 Q28 48 20 55Z" fill="#e8d5a3" stroke="#c4a832" strokeWidth="0.5"/>
      <path d="M20 55 Q30 45 50 25" stroke="#c4a832" strokeWidth="0.6" strokeDasharray="2 2"/>
      <path d="M20 55 L16 62 L22 58 L18 65 L22 60" fill="#2c1a0e" stroke="#2c1a0e" strokeWidth="0.5" strokeLinejoin="round"/>
      {animating && (
        <circle cx="17" cy="67" r="2" fill="#1a0f05" opacity="0.7">
          <animate attributeName="r" values="2;0" dur="0.45s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0" dur="0.45s" repeatCount="indefinite"/>
        </circle>
      )}
    </g>
  </svg>
);

const OLLAMA_BASE = "http://localhost:11434";

// ─── API helpers ──────────────────────────────────────────────────────────────
const apiHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const saveSession = async (state) => {
  try {
    await fetch(`${API_BASE}/story/session`, {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify(state),
    });
  } catch (_) {/* silent — offline Ollama environment, non-critical */}
};

const fetchSession = async () => {
  try {
    const res = await fetch(`${API_BASE}/story/session`, { headers: apiHeaders() });
    const data = await res.json();
    return data.story;
  } catch (_) { return null; }
};

const clearSession = async () => {
  try {
    await fetch(`${API_BASE}/story/session`, { method: "DELETE", headers: apiHeaders() });
  } catch (_) {}
};
const saveCompletedStoryToDB = async (payload) => {
  try {
    // Build numbered chapter objects: { 0: {...}, 1: {...}, 2: {...}, final: {...} }
    const chapters = {};
    payload.storySegments.forEach((seg, i) => {
      chapters[i] = {
        title: seg.title || "",
        text: seg.text,
        chosenChoice: seg.chosenChoice,
      };
    });
    chapters["final"] = {
      title: "The End",
      text: payload.finalText,
    };

    await fetch(`${API_BASE}/story/completed`, {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({ ...payload, chapters }),
    });
  } catch (_) {}
};
// ─── PDF Export ───────────────────────────────────────────────────────────────
const exportToPDF = (storyTitle, storySegments, currentText, genre, ageGroup) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxW = pageW - margin * 2;
  let y = margin + 10;

  const addPage = () => {
    doc.addPage();
    y = margin + 10;
  };

  const checkY = (needed = 10) => { if (y + needed > pageH - margin) addPage(); };

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(storyTitle || "The Story Scroll", maxW);
  titleLines.forEach(line => {
    checkY(10);
    doc.text(line, pageW / 2, y, { align: "center" });
    y += 10;
  });

  // Subtitle
  y += 4;
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(120, 90, 30);
  doc.text(`${genre} · ${ageGroup}`, pageW / 2, y, { align: "center" });
  y += 3;
  doc.setDrawColor(184, 134, 11);
  doc.line(margin + 20, y, pageW - margin - 20, y);
  y += 8;
  doc.setTextColor(44, 26, 14);

  const addTextBlock = (text, isChosen = false) => {
    if (!text) return;
    if (isChosen) {
      doc.setFont("times", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 70, 20);
      checkY(8);
      doc.text(`↳ ${text}`, margin + 4, y);
      y += 7;
      doc.setTextColor(44, 26, 14);
      return;
    }
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    paragraphs.forEach(para => {
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(para, maxW);
      checkY(lines.length * 6 + 4);
      lines.forEach(line => {
        doc.text(line, margin, y);
        y += 6;
      });
      y += 3;
    });
  };

  storySegments.forEach((seg, i) => {
    addTextBlock(seg.text, false);
    if (seg.chosenChoice) {
      y += 2;
      doc.setDrawColor(184, 134, 11);
      doc.setLineWidth(0.2);
      doc.line(margin + 30, y, pageW - margin - 30, y);
      y += 5;
      addTextBlock(seg.chosenChoice, true);
      y += 2;
    }
  });

  // Current (final) segment
  addTextBlock(currentText, false);

  // The End
  y += 6;
  checkY(14);
  doc.setDrawColor(184, 134, 11);
  doc.line(margin + 20, y, pageW - margin - 20, y);
  y += 8;
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(120, 90, 30);
  doc.text("~ The End ~", pageW / 2, y, { align: "center" });

  doc.save(`${(storyTitle || "story").replace(/\s+/g, "_")}.pdf`);
};

export default function ScrollStoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrollOpen, setScrollOpen] = useState(false);
  const [genre, setGenre] = useState("Fantasy");
  const [ageGroup, setAgeGroup] = useState("7–9 yrs");
  const [prompt, setPrompt] = useState("");

  const [storySegments, setStorySegments] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [choices, setChoices] = useState([]);
  const [isFinalChapter, setIsFinalChapter] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [phase, setPhase] = useState("setup");
  const [storyDone, setStoryDone] = useState(false);

  // Resume modal state
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  const storyEndRef = useRef(null);
  const promptRef = useRef(prompt);
  promptRef.current = prompt;

  // ── On mount: check for interrupted session ────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setScrollOpen(true), 300);
    (async () => {
      if (location.state?.viewStory) {
        // Read mode for archived story
        const vs = location.state.viewStory;
        setGenre(vs.genre || "Fantasy");
        setAgeGroup(vs.ageGroup || "");
        setPrompt(vs.prompt || "");
        setStoryTitle(vs.storyTitle || "Archived Tale");
        
        const segments = [];
        let finalT = "";
        if (vs.chapters) {
           // keys might be "0", "1", "final"
           const keys = Object.keys(vs.chapters).sort();
           for (const k of keys) {
              if (k === "final") {
                 finalT = vs.chapters[k].text;
              } else {
                 segments.push(vs.chapters[k]);
              }
           }
        }
        setStorySegments(segments);
        setCurrentText(vs.finalText || finalT);
        setWordCount(vs.wordCount || 0);
        setIsFinalChapter(true);
        setStoryDone(true);
        setPhase("story");
        return; // skip fetching session
      }

      const session = await fetchSession();
      if (session && session.isGenerating && session.phase !== "setup") {
        // Was mid-generation when user left
        setResumeData(session);
        setShowResumeModal(true);
      } else if (session && session.phase === "story") {
        // Restore a clean (non-generating) session silently
        restoreSession(session);
      }
    })();
    return () => clearTimeout(t);
  }, []);

  const restoreSession = (session) => {
    setGenre(session.genre || "Fantasy");
    setAgeGroup(session.ageGroup || "7–9 yrs");
    setPrompt(session.prompt || "");
    setStoryTitle(session.storyTitle || "");
    setStorySegments(session.storySegments || []);
    setCurrentText(session.currentText || "");
    setChoices(session.choices || []);
    setIsFinalChapter(session.isFinalChapter || false);
    setStoryDone(session.storyDone || false);
    setWordCount(session.wordCount || 0);
    setPhase("story");
  };

  const handleResume = () => {
    // Restore state but mark as NOT generating (user must re-trigger)
    if (resumeData) {
      restoreSession({ ...resumeData, isGenerating: false });
    }
    setShowResumeModal(false);
    setResumeData(null);
  };

  const handleCancelResume = async () => {
    await clearSession();
    setShowResumeModal(false);
    setResumeData(null);
  };

  useEffect(() => {
    const all = storySegments.map(s => s.text).join(" ") + " " + currentText;
    setWordCount(all.trim().split(/\s+/).filter(Boolean).length);
  }, [storySegments, currentText]);

  useEffect(() => {
    if (storyEndRef.current) {
      storyEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentText, choices, isGenerating, storyDone]);

  // ── Auto-save session whenever key state changes ───────────────────────────
  const saveTimerRef = useRef(null);
  const autoSave = useCallback((patch) => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveSession(patch), 600);
  }, []);

  const buildSystemPrompt = (isFirst, isFinal) => {
    const age = ageGroup.replace("–", "-");

    if (isFinal) {
      return `You are a master storyteller writing a children's ${genre} story for ages ${age}.

You are writing the FINAL chapter. This must be a rich, complete ending.

Requirements:
- Write at least 5 full paragraphs (minimum 280 words of actual story).
- Develop the climax fully — show the character facing their biggest challenge.
- Resolve all threads with a satisfying, emotionally warm conclusion.
- End with a memorable closing sentence that feels like the end of a beloved book.
- Do NOT write any choices. Do NOT write "CHOICE". Do NOT end mid-action.
- Language must be wholesome and age-appropriate.

Format:
STORY:
[Full final chapter here]

THE END`;
    }

    if (isFirst) {
      return `You are a master storyteller writing a children's ${genre} story for ages ${age}.

You are writing the OPENING chapter of a choose-your-own-adventure story.

Requirements:
- Write at least 4 full paragraphs (minimum 200 words of actual story).
- Introduce the main character, the world, and the central problem vividly.
- End at a genuine decision point where two different paths open up.
- Each CHOICE must be a short, direct ACTION the character takes.
  CORRECT format: "Climb through the broken window" / "Run to the nearest guard for help"
  WRONG format: "Will she dare to enter?" / "Does he trust the old man?" (no questions ever)
  WRONG format: "Try to escape" (too vague — be specific)
- The two choices must lead to meaningfully different paths.
- Language must be wholesome and age-appropriate.

Format:
TITLE: [A short evocative title — 2 to 5 words]

STORY:
[Opening chapter here]

CHOICE 1: [Specific action, 5–12 words, no question marks]
CHOICE 2: [Specific action, 5–12 words, no question marks]`;
    }

    return `You are a master storyteller writing a children's ${genre} story for ages ${age}.

You are writing a MIDDLE chapter of a choose-your-own-adventure story.

Requirements:
- Write at least 4 full paragraphs (minimum 200 words of actual story).
- Continue directly from the chosen action. Show its immediate consequences and new developments.
- Raise the stakes — introduce a new obstacle, discovery, or complication.
- End at a fresh decision point with two new paths.
- Each CHOICE must be a short, direct ACTION the character takes.
  CORRECT format: "Climb through the broken window" / "Run to the nearest guard for help"
  WRONG format: "Will she dare to enter?" / "Does he trust the old man?" (no questions ever)
- Language must be wholesome and age-appropriate.

Format:
STORY:
[Chapter continuing from chosen action]

CHOICE 1: [Specific action, 5–12 words, no question marks]
CHOICE 2: [Specific action, 5–12 words, no question marks]`;
  };

  const parseResponse = (fullText, isFinal) => {
    const titleMatch = fullText.match(/TITLE:\s*(.+?)(?:\n|$)/i);
    const storyMatch = fullText.match(/STORY:\s*([\s\S]+?)(?=CHOICE 1:|THE END\s*$|$)/i);
    const c1 = fullText.match(/CHOICE 1:\s*(.+?)(?:\n|CHOICE 2:|$)/i);
    const c2 = fullText.match(/CHOICE 2:\s*(.+?)(?:\n|$)/i);
    const hasEnd = /THE END/i.test(fullText);

    let story = storyMatch ? storyMatch[1].trim() : fullText.replace(/TITLE:.*?\n/i, "").replace(/CHOICE \d:.*?(\n|$)/gi, "").replace(/THE END/gi, "").trim();
    story = story.replace(/THE END\s*$/gi, "").trim();

    const rawC1 = c1 ? c1[1].trim() : "";
    const rawC2 = c2 ? c2[1].trim() : "";

    const cleanChoice = (s) => s.replace(/\?$/, "").replace(/^(Will|Should|Does|Can|Could|Would|Might)\s+\w+\s+/i, "").trim();

    return {
      title: titleMatch ? titleMatch[1].trim() : "",
      story,
      choices: isFinal ? [] : [cleanChoice(rawC1), cleanChoice(rawC2)].filter(c => c.length > 3),
      isEnd: isFinal || hasEnd
    };
  };

  const streamFromOllama = async (messages, onChunk) => {
    const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "mistral", messages, stream: true })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            fullText += parsed.message.content;
            onChunk(fullText);
          }
        } catch (_) {}
      }
    }
    return fullText;
  };

  const buildHistory = (segments, initialPrompt) => {
    const msgs = [{ role: "user", content: `Story idea: ${initialPrompt}\n\nBegin the adventure!` }];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      let a = "";
      if (i === 0 && seg.title) a += `TITLE: ${seg.title}\n\n`;
      a += `STORY:\n${seg.text}`;
      if (seg.choices && seg.choices.length === 2) {
        a += `\n\nCHOICE 1: ${seg.choices[0]}\nCHOICE 2: ${seg.choices[1]}`;
      }
      msgs.push({ role: "assistant", content: a });
      if (seg.chosenChoice) {
        msgs.push({ role: "user", content: `I choose: "${seg.chosenChoice}"\n\nContinue the story.` });
      }
    }
    return msgs;
  };

  const generateStory = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setStorySegments([]);
    setCurrentText("");
    setChoices([]);
    setIsFinalChapter(false);
    setStoryTitle("");
    setStoryDone(false);
    setPhase("story");

    const sessionBase = { genre, ageGroup, prompt, phase: "story", isGenerating: true, storySegments: [], currentText: "", choices: [], storyTitle: "", isFinalChapter: false, storyDone: false, wordCount: 0 };
    await saveSession(sessionBase);

    try {
      const sys = buildSystemPrompt(true, false);
      const messages = [
        { role: "system", content: sys },
        { role: "user", content: `Story idea: ${prompt}\n\nBegin the adventure!` }
      ];

      let finalText = "";
      await streamFromOllama(messages, (ft) => {
        finalText = ft;
        const live = parseResponse(ft, false);
        if (live.title) setStoryTitle(live.title);
        setCurrentText(live.story);
        setChoices(live.choices.length === 2 ? live.choices : []);
      });

      const parsed = parseResponse(finalText, false);
      if (parsed.title) setStoryTitle(parsed.title);
      setCurrentText(parsed.story);
      const finalChoices = parsed.choices.length === 2 ? parsed.choices : [];
      setChoices(finalChoices);

      autoSave({ ...sessionBase, isGenerating: false, storyTitle: parsed.title, currentText: parsed.story, choices: finalChoices });
    } catch (err) {
      const errText = "The quill could not reach the mistral...\n\nMake sure Ollama is running on http://localhost:11434 with the mistral model loaded.";
      setCurrentText(errText);
      setChoices([]);
      autoSave({ ...sessionBase, isGenerating: false, currentText: errText, choices: [] });
    } finally {
      setIsGenerating(false);
    }
  };

  const continueWithChoice = async (choiceText, currentChoices) => {
    if (isGenerating) return;

    const choicesMadeSoFar = storySegments.length;
    const willBeFinal = choicesMadeSoFar + 1 >= MAX_CHOICES;

    const newSegments = [...storySegments, {
      title: storySegments.length === 0 ? storyTitle : "",
      text: currentText,
      choices: currentChoices,
      chosenChoice: choiceText,
    }];

    setStorySegments(newSegments);
    setCurrentText("");
    setChoices([]);
    setIsFinalChapter(willBeFinal);
    setIsGenerating(true);

    const sessionPatch = { genre, ageGroup, prompt, phase: "story", storyTitle, storySegments: newSegments, currentText: "", choices: [], isFinalChapter: willBeFinal, storyDone: false, wordCount, isGenerating: true };
    await saveSession(sessionPatch);

    try {
      const sys = buildSystemPrompt(false, willBeFinal);
      const history = buildHistory(newSegments, promptRef.current);
      const messages = [{ role: "system", content: sys }, ...history];

      if (willBeFinal) {
        messages.push({
          role: "user",
          content: `I choose: "${choiceText}"\n\nNow write the final chapter — a full, rich, satisfying conclusion that resolves everything. At least 5 paragraphs. End with "THE END".`
        });
        messages.splice(messages.length - 2, 1);
      }

      let finalText = "";
      await streamFromOllama(messages, (ft) => {
        finalText = ft;
        const live = parseResponse(ft, willBeFinal);
        setCurrentText(live.story);
        if (!willBeFinal) setChoices(live.choices.length === 2 ? live.choices : []);
        else setChoices([]);
      });

      const parsed = parseResponse(finalText, willBeFinal);
      setCurrentText(parsed.story);

      if (willBeFinal) {
  setChoices([]);
  setStoryDone(true);
  await saveCompletedStoryToDB({
    storyTitle,
    genre,
    ageGroup,
    prompt,
    storySegments: newSegments,
    finalText: parsed.story,
    wordCount,
  });
  await clearSession();
} else {
        const fc = parsed.choices.length === 2 ? parsed.choices : [];
        setChoices(fc);
        autoSave({ ...sessionPatch, isGenerating: false, currentText: parsed.story, choices: fc });
      }
    } catch (err) {
      const errText = "The story thread was lost to the mists...\n\nCheck that Ollama is still running.";
      setCurrentText(errText);
      setChoices([]);
      autoSave({ ...sessionPatch, isGenerating: false, currentText: errText, choices: [] });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetStory = async () => {
    await clearSession();
    setPhase("setup");
    setStorySegments([]);
    setCurrentText("");
    setChoices([]);
    setIsFinalChapter(false);
    setStoryTitle("");
    setStoryDone(false);
    setPrompt("");
    setWordCount(0);
  };

  const renderParagraphs = (text, isFirstEver) => {
    if (!text) return null;
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    return (
      <div className="story-text">
        {paragraphs.map((para, i) => {
          if (i === 0 && isFirstEver) {
            return (
              <p key={i} className="story-paragraph">
                <span className="drop-cap">{para[0] || ""}</span>
                {para.slice(1)}
              </p>
            );
          }
          return <p key={i} className="story-paragraph">{para}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>

      {/* ── Resume Modal ── */}
      {showResumeModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon">📜</div>
            <div className="modal-title">An Unfinished Tale</div>
            <div className="modal-body">
              The quill was still writing when you left. Would you like to return to your story, or begin anew?
            </div>
            <div className="modal-actions">
              <button className="modal-btn-primary" onClick={handleResume}>
                Resume Story
              </button>
              <button className="modal-btn-secondary" onClick={handleCancelResume}>
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-bg">
        <button className="back-to-dashboard-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="title-area">
          <h1>The Story Scroll</h1>
          <div className="gold-divider" />
          <p>Choose your own adventure — where will the story lead?</p>
        </div>

        <div className="scroll-wrapper">
          <div className="scroll-rod">
            <div className="scroll-knob" />
            <div className="scroll-rod-bar" />
            <div className="scroll-knob" />
          </div>

          <div className={`scroll-body ${scrollOpen ? "unrolling" : ""}`}>
            <div className="scroll-inner">

              {phase === "setup" && (
                <>
                  <div className="section-label">Genre</div>
                  <div className="genre-grid">
                    {GENRES.map(g => (
                      <button key={g} className={`option-btn ${genre === g ? "selected" : ""}`} onClick={() => setGenre(g)}>{g}</button>
                    ))}
                  </div>

                  <div className="section-label" style={{ marginTop: 18 }}>Age Group</div>
                  <div className="genre-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
                    {AGE_GROUPS.map(a => (
                      <button key={a} className={`option-btn ${ageGroup === a ? "selected" : ""}`} onClick={() => setAgeGroup(a)}>{a}</button>
                    ))}
                  </div>

                  <div className="section-label">Your story seed</div>
                  <textarea
                    className="prompt-input"
                    rows={3}
                    placeholder="e.g. A brave rabbit discovers a magical carrot in the enchanted forest..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && e.ctrlKey && generateStory()}
                  />

                  <button className={`conjure-btn ${isGenerating ? "writing" : ""}`} onClick={generateStory} disabled={isGenerating || !prompt.trim()}>
                    <span className="quill-icon">🪶</span>
                    {isGenerating ? "The quill writes..." : "Conjure the Tale"}
                  </button>
                </>
              )}

              {phase === "story" && (
                <div className="story-area">
                  {storyTitle && <div className="story-title-display">{storyTitle}</div>}

                  {storySegments.map((seg, i) => (
                    <div key={i}>
                      {renderParagraphs(seg.text, i === 0)}
                      {seg.chosenChoice && (
                        <>
                          <div className="story-divider"><span>✦</span></div>
                          <div className="chosen-badge">↳ {seg.chosenChoice}</div>
                        </>
                      )}
                    </div>
                  ))}

                  {isGenerating && !currentText ? (
                    <div className="loading-quill">
                      <QuillSVG animating={true} />
                      <div style={{ display: "flex", gap: 6 }}>
                        {[0, 0.2, 0.4].map((d, i) => (
                          <div key={i} style={{ width: 6, height: 6, background: INK, borderRadius: "50%", animation: `dotPulse 1.1s ease-in-out infinite ${d}s` }} />
                        ))}
                      </div>
                    </div>
                  ) : currentText ? (
                    <>
                      {renderParagraphs(currentText, storySegments.length === 0)}
                      {isGenerating && <span className="cursor-blink" />}
                    </>
                  ) : null}

                  {choices.length === 2 && !isGenerating && (
                    <div className="choices-container">
                      <div className="choices-label">What will you do?</div>
                      {choices.map((choice, i) => (
                        <button key={i} className="choice-btn" onClick={() => continueWithChoice(choice, choices)}>
                          <span className="choice-num">Choice {i + 1}</span>
                          {choice}
                        </button>
                      ))}
                    </div>
                  )}

                  {storyDone && !isGenerating && (
                    <div className="ending-seal">
                      <div style={{ width: "100%", height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)`, margin: "0 0 20px" }} />
                      <div className="ending-ornament">⁕</div>
                      <div className="ending-seal-text">The End</div>
                      <div className="ending-ornament">⁕</div>
                    </div>
                  )}

                  {!isGenerating && (
                    <>
                      <div className="stats-bar">
                        <span className="stat-item">{wordCount} words</span>
                        <span className="stat-item">{ageGroup} · {genre}</span>
                      </div>
                      {storyDone && (
                        <>
                          <button
                            className="export-btn"
                            onClick={() => exportToPDF(storyTitle, storySegments, currentText, genre, ageGroup)}
                          >
                            📄 Export Story as PDF
                          </button>
                          <button className="new-story-btn" onClick={() => navigate('/dashboard')}>
                            ← Return to Dashboard
                          </button>
                        </>
                      )}
                      <button className="new-story-btn" onClick={resetStory}>🪶 Begin a new tale</button>
                    </>
                  )}

                  <div ref={storyEndRef} />
                </div>
              )}
            </div>
          </div>

          <div className="scroll-rod">
            <div className="scroll-knob" />
            <div className="scroll-rod-bar" />
            <div className="scroll-knob" />
          </div>
        </div>
      </div>
    </>
  );
}