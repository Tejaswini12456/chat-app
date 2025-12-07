import mongoose from "mongoose";

// Define schema for chat messages
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User model
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User model
      required: true,
    },
    content: {
      type: String,
      default: "", // optional if message only contains an image
    },
    image: {
      type: String, // URL of uploaded image (from Cloudinary or local)
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create and export the Message model
const Message = mongoose.model("Message", messageSchema);
export default Message;
