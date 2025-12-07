import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🛡 Protect route middleware
export const protect = async (req, res, next) => {
  // ✅ Check both Authorization header and token header
  const token = req.headers.authorization?.split(' ')[1] || req.headers.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user (without password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("❌ Auth error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Check authentication route
export const checkAuth = async (req, res) => {
  try {
    // User is already attached by protect middleware
    res.status(200).json({
      authenticated: true,
      user: {
        _id: req.user._id,
        username: req.user.name, // ✅ Changed to username
        email: req.user.email,
        bio: req.user.bio,
        profilePic: req.user.profilePic || ""
      }
    });
  } catch (error) {
    console.error("❌ Check auth error:", error);
    res.status(500).json({ 
      authenticated: false, 
      message: "Server error" 
    });
  }
};