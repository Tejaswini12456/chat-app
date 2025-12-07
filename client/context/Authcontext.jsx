import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const Authcontext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const axiosInstance = axios.create({ baseURL: BACKEND_URL });

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.token = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [authUser, setAuthUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ---------------- AUTH CHECK ----------------
  const checkAuth = async () => {
    try {
      if (!token) {
        setAuthUser(null);
        return null;
      }
      const res = await axiosInstance.get("/api/auth/check-auth");
      setAuthUser(res.data.user);
      return res.data.user;
    } catch (error) {
      setToken("");
      localStorage.removeItem("token");
      setAuthUser(null);
      return null;
    }
  };

  // ---------------- SIGNUP ----------------
  const signup = async (fullName, email, password, bio) => {
    setIsLoading(true);
    if (!fullName || !email || !password) {
      toast.error("Name, email and password are required");
      setIsLoading(false);
      return { success: false };
    }
    try {
      const res = await axiosInstance.post("/api/auth/signup", { fullName, email, password, bio });
      const receivedToken = res.data.token;
      const receivedUser = res.data.user;

      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);
      setAuthUser(receivedUser);

      toast.success("Account created successfully!");
      setIsLoading(false);
      return { success: true, user: receivedUser };
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      setIsLoading(false);
      return { success: false };
    }
  };

  // ---------------- LOGIN ----------------
  const login = async (email, password) => {
    setIsLoading(true);
    if (!email || !password) {
      toast.error("Email and password are required");
      setIsLoading(false);
      return { success: false };
    }
    try {
      const res = await axiosInstance.post("/api/auth/login", { email, password });
      const receivedToken = res.data.token;
      const receivedUser = res.data.user;

      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);
      setAuthUser(receivedUser);

      toast.success("Login successful!");
      setIsLoading(false);
      return { success: true, user: receivedUser };
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      setIsLoading(false);
      return { success: false };
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setAuthUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setOnlineUsers([]); // Clear online users on logout
    toast.success("Logged out successfully");
  };

  // ---------------- UPDATE PROFILE ----------------
  const updateProfile = async (updatedData) => {
    try {
      const res = await axiosInstance.put("/api/auth/update", updatedData);
      setAuthUser(res.data.user);
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
      return false;
    }
  };

  // ---------------- SOCKET CONNECTION - ENHANCED ----------------
  const connectSocket = () => {
    if (socket || !authUser) {
      console.log("⚠️ Socket connection skipped:", { hasSocket: !!socket, hasAuthUser: !!authUser });
      return;
    }

    console.log("🔌 Connecting socket for user:", authUser._id);

    // Send user ID as query for server to identify
    const newSocket = io(BACKEND_URL, { 
      query: { userId: authUser._id },
      transports: ['websocket', 'polling'], // Try both methods
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      if (authUser?._id) {
        console.log("📤 Emitting user-connected:", authUser._id);
        newSocket.emit("user-connected", authUser._id);
      }
    });

    // ✅ CRITICAL: Listen to server broadcast of online users
    newSocket.on("online-users", (users) => {
      console.log("📡 Online users received from server:", users);
      console.log("📊 Type:", typeof users, "| Is Array:", Array.isArray(users));
      console.log("📊 Count:", users?.length);
      
      if (Array.isArray(users)) {
        setOnlineUsers(users);
        console.log("✅ Online users state updated successfully");
      } else {
        console.error("❌ Received non-array online users:", users);
        setOnlineUsers([]);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setOnlineUsers([]); // Clear online users on disconnect
    });

    newSocket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });

    newSocket.on("error", (err) => {
      console.error("⚠️ Socket error:", err);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      if (authUser?._id) {
        newSocket.emit("user-connected", authUser._id);
      }
    });
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (token && !authUser) {
      console.log("🔑 Token found, checking auth...");
      checkAuth();
    }
  }, [token]);

  useEffect(() => {
    if (authUser && !socket) {
      console.log("👤 Auth user loaded, connecting socket...");
      connectSocket();
    }
    
    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log("🧹 Cleaning up socket connection");
        socket.disconnect();
      }
    };
  }, [authUser]);

  const value = {
    axios: axiosInstance,
    token,
    authUser,
    login,
    signup,
    logout,
    updateProfile,
    onlineUsers,
    socket,
    isLoading,
  };

  return <Authcontext.Provider value={value}>{children}</Authcontext.Provider>;
};

export default AuthProvider;