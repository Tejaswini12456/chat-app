import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userroutes.js";
import messageRouter from "./routes/messageroutes.js";

dotenv.config({ path: "./server/.env" });

const app = express();

// -----------------------
// CORS Middleware
// -----------------------
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true,
}));

// ✅ IMPORTANT: Increase payload limit for images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// -----------------------
// Routes
// -----------------------
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Test route
app.get("/api/status", (req, res) => {
  res.send("Server is live 🚀");
});

// -----------------------
// HTTP + Socket.io
// -----------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Export as Map (not let)
export const onlineUsers = new Map();

// -----------------------
// ✅ FIXED Socket.io Handler
// -----------------------
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // ✅ Get userId from query params (sent during connection)
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined" && userId !== "null") {
    onlineUsers.set(userId, socket.id);
    console.log("✅ User connected:", userId);
    console.log("👥 Total online users:", onlineUsers.size);

    // ✅ CRITICAL: Broadcast to ALL clients
    io.emit("online-users", Array.from(onlineUsers.keys()));
  }

  // ✅ Handle explicit user-connected event (backup method)
  socket.on("user-connected", (userId) => {
    if (userId && userId !== "undefined" && userId !== "null") {
      onlineUsers.set(userId, socket.id);
      console.log("📡 User-connected event received:", userId);
      console.log("👥 Total online users:", onlineUsers.size);
      
      // ✅ CRITICAL: Broadcast to ALL clients
      io.emit("online-users", Array.from(onlineUsers.keys()));
    }
  });

  // ✅ Handle message sending via socket
  socket.on("send-message", (message) => {
    console.log("📨 Socket message received:", message);
    
    const receiverSocketId = onlineUsers.get(message.receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", message);
      console.log("✅ Message forwarded to:", message.receiverId);
    } else {
      console.log("📴 Receiver offline:", message.receiverId);
    }
  });

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    
    // Remove user from online users
    let disconnectedUserId = null;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        disconnectedUserId = userId;
        console.log("👋 User disconnected:", userId);
        break;
      }
    }

    console.log("👥 Remaining online users:", onlineUsers.size);
    
    // ✅ CRITICAL: Broadcast updated list to ALL clients
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  // ✅ Error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// -----------------------
// Start server
// -----------------------
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io ready for connections`);
    });
  })
  .catch(err => console.error("DB connection failed:", err));

export { io };