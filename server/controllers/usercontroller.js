import bcrypt from "bcryptjs";
import User from "../models/User.js"; 
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js"; // ✅ ADD THIS IMPORT

// 🟢 Register New User
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    console.log("📝 Signup request:", { fullName, email, bio });

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(user._id);

    console.log("✅ User registered:", user.name);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        fullName: user.name, // ✅ ADDED
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic || ""
      }
    });
  } catch (error) {
    console.error("❌ Signup error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `User with this ${Object.keys(error.keyValue)[0]} already exists`
      });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🟢 Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login request:", { email });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const token = generateToken(user._id);

    console.log("✅ Login successful:", user.name);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        fullName: user.name, // ✅ ADDED
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic || ""
      }
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🟢 Check Auth
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        fullName: user.name, // ✅ ADDED
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic || "",
      },
    });
  } catch (error) {
    console.error("❌ Check auth error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// 🟢 Update User Profile - ✅ COMPLETELY REWRITTEN
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, bio, profilePic } = req.body;

    console.log("\n=== 📸 PROFILE UPDATE ===");
    console.log("User ID:", userId);
    console.log("Has profilePic:", !!profilePic);

    let profilePicUrl = "";

    // ✅ Upload image to Cloudinary if provided
    if (profilePic && profilePic.startsWith("data:image")) {
      try {
        console.log("🖼️ Uploading to Cloudinary...");
        
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "chat-app-profiles",
          resource_type: "image",
        });
        
        profilePicUrl = uploadResponse.secure_url;
        console.log("✅ Uploaded:", profilePicUrl);
        
      } catch (uploadError) {
        console.error("❌ Upload failed:", uploadError);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload image: " + uploadError.message 
        });
      }
    }

    // ✅ Build update object
    const updateData = {};
    if (fullName) updateData.name = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicUrl) updateData.profilePic = profilePicUrl;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("✅ Profile updated");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        fullName: user.name, // ✅ ADDED
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic || ""
      }
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};