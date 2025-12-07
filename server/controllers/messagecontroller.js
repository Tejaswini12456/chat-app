import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, onlineUsers } from "../server.js";

// 🧾 1️⃣ Get all users (except current user) + unseen message counts
export const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user.id;

    const filteredUsers = await User.find({ _id: { $ne: userId } })
      .select("fullName name email profilePic avatar bio");

    const unseenMessages = {};

    const promises = filteredUsers.map(async (user) => {
      const count = await Message.countDocuments({
        sender: user._id,
        receiver: userId,
        isRead: false,
      });
      unseenMessages[user._id] = count;
    });

    await Promise.all(promises);

    res.status(200).json({
      success: true,
      users: filteredUsers,
      unseenMessages,
    });
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 💬 2️⃣ Get all messages between current user and selected user
export const getAllMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const receiverId = req.params.id;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    // Mark unseen messages as read
    await Message.updateMany(
      { sender: receiverId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      senderId: msg.sender,
      receiverId: msg.receiver,
      text: msg.content,
      image: msg.image,
      createdAt: msg.createdAt,
    }));

    res.status(200).json({
      success: true,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ 3️⃣ Mark messages as seen
export const markMessagesAsSeen = async (req, res) => {
  try {
    const userId = req.user.id;
    const senderId = req.params.id;

    const updated = await Message.updateMany(
      { sender: senderId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as seen successfully.",
      updatedCount: updated.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking messages as seen:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✉️ 4️⃣ Send a new message - COMPLETE FIXED VERSION
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id || req.user.id;

    console.log("\n=== 📥 MESSAGE SEND DEBUG ===");
    console.log("Sender ID:", senderId);
    console.log("Receiver ID:", receiverId);
    console.log("Text:", text || "none");
    console.log("Has image:", !!image);

    // Validate
    if (!text && !image) {
      return res.status(400).json({ 
        success: false, 
        message: "Message must contain text or image" 
      });
    }

    let imageUrl = "";

    // Upload image if provided
    if (image) {
      try {
        console.log("🖼️ Starting image upload to Cloudinary...");
        console.log("Image length:", image.length);
        
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
          console.error("❌ CLOUDINARY_CLOUD_NAME is not set!");
          throw new Error("Cloudinary not configured");
        }

        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "chat-app-messages",
          resource_type: "auto",
        });
        
        imageUrl = uploadResponse.secure_url;
        console.log("✅ Image uploaded successfully:", imageUrl);
        
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:");
        console.error("Error name:", uploadError.name);
        console.error("Error message:", uploadError.message);
        console.error("Full error:", uploadError);
        
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload image: " + uploadError.message,
          error: uploadError.message
        });
      }
    }

    // Create message in database
    console.log("💾 Saving message to database...");
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: text || "",
      image: imageUrl,
      isRead: false,
    });

    console.log("✅ Message saved:", newMessage._id);

    // Format response
    const formattedMessage = {
      _id: newMessage._id,
      senderId: newMessage.sender,
      receiverId: newMessage.receiver,
      text: newMessage.content,
      image: newMessage.image,
      createdAt: newMessage.createdAt,
    };

    // Send via socket if receiver is online
    const receiverSocketId = onlineUsers.get(receiverId);
    
    if (receiverSocketId) {
      console.log("📡 Sending real-time message to:", receiverId);
      io.to(receiverSocketId).emit("receive-message", formattedMessage);
    } else {
      console.log("📴 Receiver is offline");
    }

    res.status(200).json({
      success: true,
      message: formattedMessage,
    });

  } catch (error) {
    console.error("\n=== ❌ ERROR SENDING MESSAGE ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server error while sending message",
      error: error.toString()
    });
  }
};