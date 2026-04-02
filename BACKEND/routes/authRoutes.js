import express from "express";
import { signup,getStreakData,logout } from "../controllers/authController.js";
import { login,uploadAvatar,getMe,updateName} from "../controllers/authController.js";
import { googleAuth } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/streak", protect, getStreakData);
router.post("/logout", protect, logout);  
router.get("/me",       protect, getMe);                                    // ← new
router.post("/avatar",  protect, upload.single("avatar"), uploadAvatar); 
router.patch("/update-name", protect, updateName); 
export default router;
