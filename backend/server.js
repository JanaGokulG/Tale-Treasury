
import dotenv from "dotenv";
dotenv.config();

import express from "express";

import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";


connectDB();

const app = express();

// middleware


app.use(cors({
  origin: "http://localhost:5173", // your frontend
  credentials: true
}));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});