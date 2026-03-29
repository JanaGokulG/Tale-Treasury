import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env directly in this file — guarantees vars are available
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") }); // ← goes up from config/ to backend/

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary config check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "❌ MISSING",
  api_key:    process.env.CLOUDINARY_API_KEY    ? "✅ set" : "❌ MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ set" : "❌ MISSING",
});

export default cloudinary;