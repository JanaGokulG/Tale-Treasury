import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function StoryArchive({ onClose }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await api.get("/story/completed");
      setStories(res.data.stories || []);
    } catch (err) {
      console.error("Failed to fetch stories", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to discard this tale forever?")) return;
    try {
      await api.delete(`/story/completed/${id}`);
      setStories((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Failed to delete story", err);
      alert("Failed to delete story.");
    }
  };

  const handleRead = (story) => {
    // Navigate to InteractiveStory passing the loaded story state
    navigate("/InteractiveStory", { state: { viewStory: story } });
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center",
      padding: 20
    }}>
      <div style={{
        background: "#F5E8C7",
        width: "100%", maxWidth: 640, maxHeight: "85vh",
        border: "3px solid #8B6020", borderRadius: 12,
        boxShadow: "0 20px 40px rgba(0,0,0,.75), inset 0 0 80px rgba(139,96,32,.15)",
        display: "flex", flexDirection: "column",
        overflow: "hidden", position: "relative"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(#8B6020,#5C3F14)",
          padding: "24px 20px 16px", textAlign: "center",
          borderBottom: "2px solid #C8903C",
          position: "relative"
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 20,
            background: "none", border: "none", color: "#F5DEB3",
            fontSize: 28, cursor: "pointer", opacity: 0.8,
            lineHeight: 1
          }}>×</button>
          <div style={{ color: "#F5DEB3", fontFamily: "'Cormorant Garamond',serif", fontSize: 26, letterSpacing: "2px" }}>
            The Grand Archive
          </div>
          <div style={{ color: "#E8D5A3", fontSize: 13, marginTop: 4, fontFamily: "'Lora',serif", fontStyle: "italic" }}>
            Tales woven and memories kept
          </div>
        </div>

        {/* List */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 24px",
          background: "repeating-linear-gradient(#F5E8C7,#F5E8C7 28px,#EDE0B8 28px,#EDE0B8 29px)",
          fontFamily: "'Lora',serif",
        }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#8B6020", fontSize: 15 }}>Blowing away the dust...</div>
          ) : stories.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#8B6020", fontStyle: "italic", fontSize: 15 }}>
              Your archive is bare. Return to the desk to begin a tale.
            </div>
          ) : (
            stories.map((story) => (
              <div key={story._id} style={{
                background: "rgba(255,255,255,.65)", border: "1px solid #C8903C",
                borderRadius: 8, padding: 18, marginBottom: 16,
                boxShadow: "0 4px 12px rgba(139,96,32,.1)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 19, fontWeight: 700, color: "#3C2F1E", marginBottom: 6, fontFamily: "'Playfair Display',serif" }}>
                      {story.storyTitle || "Untitled Tale"}
                    </div>
                    <div style={{ fontSize: 13, color: "#8B6020", display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ background: "rgba(200,144,60,.15)", padding: "2px 8px", borderRadius: 12, textTransform: "capitalize" }}>
                        {story.genre || "Unknown"}
                      </span>
                      <span>•</span>
                      <span>{story.wordCount || 0} words</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(139,96,32,.6)", marginTop: 8 }}>
                      Penned on {new Date(story.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: 8, alignSelf: "center" }}>
                    <button onClick={() => handleRead(story)} style={{
                      background: "linear-gradient(135deg, #1A4A1E, #2E6B32)", color: "#FFF", border: "1px solid #143A17",
                      padding: "8px 18px", borderRadius: 6, cursor: "pointer",
                      fontFamily: "'Lora',serif", fontSize: 13, boxShadow: "0 2px 6px rgba(0,0,0,.25)",
                      transition: "transform 0.1s"
                    }}
                    onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.05)"}
                    onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}
                    >Read</button>
                    <button onClick={() => handleDelete(story._id)} style={{
                      background: "linear-gradient(135deg, #8B2010, #B03020)", color: "#FFF", border: "1px solid #5A1005",
                      padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                      fontFamily: "'Lora',serif", fontSize: 13, boxShadow: "0 2px 6px rgba(0,0,0,.25)",
                      transition: "transform 0.1s"
                    }}
                    onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.05)"}
                    onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}
                    >Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
