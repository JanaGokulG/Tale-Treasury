import express from "express";
import { saveStorySession, getStorySession, clearStorySession } from "../controllers/storyControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/session", protect, getStorySession);
router.post("/session", protect, saveStorySession);
router.delete("/session", protect, clearStorySession);

export default router;