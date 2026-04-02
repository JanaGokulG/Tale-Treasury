// routes/trophyRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUserTrophies, checkAndAwardTrophies } from "../services/trophyService.js";

const router = express.Router();

// GET /api/trophies  — frontend calls this on load
router.get("/", protect, async (req, res) => {
  try {
    await checkAndAwardTrophies(req.user._id);
    const trophies = await getUserTrophies(req.user._id);
    res.json({ trophies });
  } catch (err) {
    console.error("GET /trophies error:", err);
    res.status(500).json({ error: "Failed to fetch trophies" });
  }
});

// POST /api/trophies/check  — call after login, story read, generate, save
router.post("/check", protect, async (req, res) => {
  try {
    const newlyEarned = await checkAndAwardTrophies(req.user._id);
    res.json({ newlyEarned });
  } catch (err) {
    console.error("POST /trophies/check error:", err);
    res.status(500).json({ error: "Trophy check failed" });
  }
});

export default router;