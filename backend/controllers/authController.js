import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const updateLoginStreak = async (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const lastLogin = user.loginHistory.length 
    ? new Date(user.loginHistory[user.loginHistory.length - 1].date) 
    : null;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let shouldAddToday = true;

  if (lastLogin) {
    lastLogin.setHours(0, 0, 0, 0);

    if (lastLogin.getTime() === today.getTime()) {
      shouldAddToday = false; // Already logged in today
    } 
    else if (lastLogin.getTime() === yesterday.getTime()) {
      // Continuing streak
      user.currentStreak += 1;
    } 
    else {
      // Streak broken
      user.currentStreak = 1;
    }
  } else {
    user.currentStreak = 1;
  }

  if (shouldAddToday) {
    user.loginHistory.push({ date: today });
  }

  // Update longest streak
  if (user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak;
  }

  await user.save();
  return user;
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if ( !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      email,
      password: hashedPassword,
    });

    // 5. Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 6. Send response (NO password)
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    await updateLoginStreak(user);

    // 4. Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );


    // 5. Send response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null
      },
    });

  } catch (error) {
   
    res.status(500).json({
      message: "Server error",
    });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    // 1. Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name } = payload;

    // 2. Check if user exists
    let user = await User.findOne({ email });

    // 3. If not, create user
    if (!user) {
      user = await User.create({
        name,
        email,
        password: "google_oauth", // dummy
        avatar: user.avatar || null
        
      });
    }

    await updateLoginStreak(user);

    // 4. Generate JWT
    const appToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token: appToken,
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Google authentication failed",
    });
  }
};


export const getStreakData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);   // ← Now we have req.user from protect

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date();
    const daysToShow = 90; // Last 90 days

    const streakDays = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);   // Normalize to start of day

      const hasLoggedIn = user.loginHistory.some((entry) => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });

      streakDays.push(hasLoggedIn);
    }

    res.json({
      streakDays,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
    });
  } catch (error) {
    console.error("Error in getStreakData:", error);
    res.status(500).json({ message: "Server error while fetching streak data" });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Optional: You can do server-side cleanup here if needed (e.g. blacklist token)
    // For now, we'll just clear login-related data if you want

    res.status(200).json({
      message: "Logged out successfully",
      success: true
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};

const streamToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });

// ─── POST /api/auth/avatar ────────────────────────────────────────────────────
export const uploadAvatar = async (req, res) => {
  try {
    console.log("=== uploadAvatar called ===");
    console.log("req.user:", req.user);
    console.log("req.file:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    console.log("User found:", user?._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatarPublicId) {
      console.log("Deleting old avatar:", user.avatarPublicId);
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    console.log("Uploading to Cloudinary...");

    const result = await streamToCloudinary(req.file.buffer, {
      folder: "avatars",
      public_id: `user_${req.user.id}`,
      overwrite: true,
      transformation: [
        { width: 300, height: 300, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    console.log("Cloudinary result:", result.secure_url);

    user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.json({
      message: "Avatar uploaded successfully",
      avatar: user.avatar,
    });

  } catch (error) {
    console.error("=== uploadAvatar ERROR ===", error); // ← This will show the real error
    res.status(500).json({ message: "Server error during avatar upload", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -avatarPublicId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    res.json({ message: "Name updated", name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};