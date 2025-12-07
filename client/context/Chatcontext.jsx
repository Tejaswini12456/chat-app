// In Chatcontext.js
import { createContext, useContext, useState, useEffect } from "react";
import { Authcontext } from "./Authcontext";
import { toast } from "react-hot-toast";

export const Chatcontext = createContext();

export const Chatprovider = ({ children }) => {
  const { socket, axios, authUser, onlineUsers } = useContext(Authcontext); // ✅ Get onlineUsers

  const [users, setUsers] = useState([]);
  const [selectedUser, setselectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // ✅ NEW: Filter users to show only online ones
  const [allUsers, setAllUsers] = useState([]);

  const getAllUsers = async () => {
    if (!authUser) {
      console.log("⚠️ Cannot fetch users: No authenticated user");
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔄 Fetching users from API...");
      const res = await axios.get("/api/messages/users");
      
      console.log("📡 API Response:", res.data);
      
      if (res.data.success) {
        const filteredUsers = (res.data.users || []).filter(
          (user) => user._id !== authUser._id
        );
        
        setAllUsers(filteredUsers); // ✅ Store all users
        setUnseenMessages(res.data.unseenMessages || {});
        
        console.log("✅ Users loaded successfully:", filteredUsers.length);
      } else {
        console.error("❌ API returned success: false");
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NEW: Update displayed users when onlineUsers changes
  useEffect(() => {
    if (allUsers.length > 0 && onlineUsers.length > 0) {
      const onlineUsersList = allUsers.filter(user => 
        onlineUsers.includes(user._id)
      );
      setUsers(onlineUsersList);
      console.log("✅ Showing only online users:", onlineUsersList.length);
    } else {
      setUsers([]); // No online users
    }
  }, [allUsers, onlineUsers]);

  // ... rest of your code stays the same
  
  const getMessages = async (userId) => {
    try {
      console.log("📩 Fetching messages for user:", userId);
      const res = await axios.get(`/api/messages/${userId}`);
      
      if (res.data.success) {
        setMessages(res.data.messages);
        console.log("✅ Messages loaded:", res.data.messages.length);

        try {
          await axios.put(`/api/messages/mark/${userId}`);
          setUnseenMessages((prev) => ({ ...prev, [userId]: 0 }));
        } catch (error) {
          console.error("⚠️ Failed to mark messages as seen:", error);
        }
      }
    } catch (error) {
      console.error("❌ Error loading messages:", error);
    }
  };

  const sendmessages = async (text, imageBase64) => {
    if (!selectedUser) {
      toast.error("Please select a user first");
      return;
    }

    if (!text.trim() && !imageBase64) {
      toast.error("Please enter a message or select an image");
      return;
    }

    try {
      const payload = {
        text: text.trim() || "",
      };
      
      if (imageBase64) {
        payload.image = imageBase64;
      }

      const res = await axios.post(`/api/messages/send/${selectedUser._id}`, payload);

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        console.log("✅ Message sent successfully");

        if (socket) {
          socket.emit("send-message", res.data.message);
        }
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", (msg) => {
      console.log("📩 New message received from:", msg.senderId);
      
      if (selectedUser?._id === msg.senderId) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [msg.senderId]: (prev[msg.senderId] || 0) + 1,
        }));
      }
    });

    return () => socket.off("receive-message");
  }, [socket, selectedUser]);

  useEffect(() => {
    if (authUser) {
      console.log("🔑 User authenticated, loading users...");
      getAllUsers();
    } else {
      console.log("⚠️ No authenticated user");
      setUsers([]);
      setAllUsers([]);
    }
  }, [authUser]);

  return (
    <Chatcontext.Provider
      value={{
        users,
        selectedUser,
        setselectedUser,
        messages,
        getMessages,
        sendmessages,
        unseenMessages,
        getAllUsers,
        isLoading,
      }}
    >
      {children}
    </Chatcontext.Provider>
  );
};