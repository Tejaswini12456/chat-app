import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// ✅ CRITICAL: Load environment variables first
dotenv.config({ path: "./server/.env" });

// ✅ Configure Cloudinary with loaded env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS
});

// ✅ Debug: Check if config is loaded (remove in production)
console.log("\n🔧 === CLOUDINARY CONFIG CHECK ===");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Loaded" : "❌ MISSING");
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "✅ Loaded" : "❌ MISSING");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "✅ Loaded" : "❌ MISSING");

// ✅ Warn if any config is missing
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("\n⚠️  WARNING: Cloudinary is not properly configured!");
  console.error("Please check your .env file and ensure these variables are set:");
  console.error("  - CLOUDINARY_CLOUD_NAME");
  console.error("  - CLOUDINARY_API_KEY");
  console.error("  - CLOUDINARY_API_SECRET");
  console.error("\nImage uploads will fail until this is fixed.\n");
}

export default cloudinary;