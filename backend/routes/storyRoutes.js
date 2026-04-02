import express from "express";
import { saveStorySession, getStorySession, clearStorySession, saveCompletedStory, getCompletedStories } from "../controllers/storyControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/session", protect, getStorySession);
router.post("/session", protect, saveStorySession);
router.delete("/session", protect, clearStorySession);
router.post("/completed", protect, saveCompletedStory);
router.get("/completed", protect, getCompletedStories);
export default router;