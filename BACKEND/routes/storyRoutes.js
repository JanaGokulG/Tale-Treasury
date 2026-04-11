import express from "express";
import { 
  saveStorySession, getStorySession, clearStorySession,
  archiveStory, getArchivedStories, getStoryById, deleteArchivedStory
} from "../controllers/storyControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/session", protect, getStorySession);
router.post("/session", protect, saveStorySession);
router.delete("/session", protect, clearStorySession);

router.post("/completed", protect, archiveStory);
router.get("/completed", protect, getArchivedStories);
router.get("/:id", protect, getStoryById);
router.delete("/completed/:id", protect, deleteArchivedStory);

export default router;