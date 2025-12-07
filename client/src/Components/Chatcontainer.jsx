import React, { useRef, useEffect, useContext, useState } from "react";
import assets from "../assets/assets";
import { FormatMessageTime } from "../lib/utils";
import { Chatcontext } from "../../context/Chatcontext";
import { Authcontext } from "../../context/Authcontext";

const Chatcontainer = () => {
  const {
    messages,
    selectedUser,
    setselectedUser,
    sendmessages,
    getMessages,
  } = useContext(Chatcontext);

  // ✅ Fixed: Changed to match your actual Authcontext exports
  const { authUser, onlineUsers } = useContext(Authcontext);

  const scrollEnd = useRef();
  const [input, setinput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // Auto scroll
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id]);

  // Send message
  const handlemessage = async (e) => {
    e.preventDefault();

    if (!input.trim() && !selectedImage) return;

    try {
      // Convert image to base64 if exists
      let imageBase64 = null;
      if (selectedImage) {
        console.log("🖼️ Converting image to base64...");
        imageBase64 = await convertToBase64(selectedImage);
        console.log("✅ Image converted, size:", imageBase64.length);
      }

      await sendmessages(input, imageBase64);
      setinput("");
      setSelectedImage(null);

      const fileInput = document.getElementById("image");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("❌ Error in handlemessage:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Convert image file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Select image
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/"))
      return alert("Only image files allowed!");

    if (file.size > 5 * 1024 * 1024)
      return alert("Image must be under 5MB!");

    setSelectedImage(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    const fileInput = document.getElementById("image");
    if (fileInput) fileInput.value = "";
  };

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">

      {/* Header */}
      <div className="flex items-center gap-2 py-3 px-4 border-b border-stone-600">
        <div className="relative">
          <img
            src={selectedUser.profilePic || selectedUser.avatar || assets.avatar_icon}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          {/* Online indicator dot */}
          {onlineUsers?.includes(selectedUser._id) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
          )}
        </div>

        <div className="flex-1">
          <p className="text-lg text-white font-medium">
            {selectedUser.name || selectedUser.fullName || "User"}
          </p>
          <p className={`text-xs ${onlineUsers?.includes(selectedUser._id) ? 'text-green-400' : 'text-gray-400'}`}>
            {onlineUsers?.includes(selectedUser._id) ? '● Online' : '○ Offline'}
          </p>
        </div>

        <img
          onClick={() => setselectedUser(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden w-7 cursor-pointer hover:opacity-80"
        />

        <img
          src={assets.help_icon}
          alt="help"
          className="max-md:hidden w-5 cursor-pointer hover:opacity-70"
          onClick={() => alert("Help section coming soon!")}
        />
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 mb-4 ${
              msg.senderId === authUser?._id ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser?._id
                    ? authUser?.profilePic || authUser?.avatar || assets.avatar_icon
                    : selectedUser?.profilePic || selectedUser?.avatar || assets.avatar_icon
                }
                alt="avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
              <p className="text-gray-400 mt-1">
                {FormatMessageTime(msg.createdAt)}
              </p>
            </div>

            {/* Message Content */}
            {msg.image ? (
              <img
                src={msg.image}
                alt="sent image"
                className="max-w-[230px] border border-gray-600 rounded-lg cursor-pointer"
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light break-words bg-violet-500/30 text-white ${
                  msg.senderId === authUser?._id
                    ? "rounded-lg rounded-br-none"
                    : "rounded-lg rounded-bl-none"
                }`}
              >
                {msg.text}
              </p>
            )}
          </div>
        ))}

        <div ref={scrollEnd}></div>
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="absolute bottom-16 left-0 right-0 bg-gray-900/90 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="preview"
              className="w-16 h-16 object-cover rounded-lg"
            />
            <p className="text-white text-sm">{selectedImage.name}</p>
          </div>

          <button
            onClick={removeSelectedImage}
            className="text-red-500 text-xl px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex flex-1 items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setinput(e.target.value)}
            value={input}
            onKeyDown={(e) => e.key === "Enter" && handlemessage(e)}
            placeholder="Send message..."
            className="flex-1 text-sm border-none p-3 rounded-lg outline-none text-white bg-transparent"
          />

          <input
            type="file"
            id="image"
            accept="image/*"
            hidden
            onChange={handleImageSelect}
          />

          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="gallery"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>

        <img
          onClick={handlemessage}
          src={assets.send_button}
          alt="send"
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
      <img src={assets.logo_icon} alt="logo" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat Anytime here</p>
    </div>
  );
};

export default Chatcontainer;