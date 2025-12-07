import express from "express";
import { registerUser, loginUser, updateProfile } from "../controllers/usercontroller.js";
import { protect, checkAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// 🟢 Register a new user
router.post("/signup", registerUser);

// 🟣 Login existing user
router.post("/login", loginUser);

// 🔵 Update profile (protected route)
router.put("/update", protect, updateProfile);

// 🛡 Check authentication
router.get("/check-auth", protect, checkAuth);

// 🗑️ TEMPORARY - Delete all users for testing (REMOVE AFTER TESTING!)
router.get('/clear-users', async (req, res) => {
  try {
    const result = await User.deleteMany({});
    res.json({ 
      message: 'All users deleted successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
});

export default router;