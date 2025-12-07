import React, { useEffect, useState, useContext } from "react";
import assets, { imagesDummyData } from "../assets/assets";
import { Chatcontext } from "../../context/Chatcontext";
import { Authcontext } from "../../context/Authcontext";

const Rightsidebar = () => {
  const { selectedUser, messages } = useContext(Chatcontext);
  const { logout, onlineUsers } = useContext(Authcontext);

  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const imgs = messages
        .filter((msg) => msg.image)
        .map((msg) => msg.image);

      setMsgImages(imgs);
    }
  }, [messages]);

  // If no user is selected, do not show sidebar
  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div
      className={`bg-[#8185b2]/10 text-white h-full p-5 rounded-l-xl overflow-y-scroll flex flex-col justify-between w-80 max-md:hidden`}
    >
      {/* User Info */}
      <div>
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-20 aspect-square rounded-full"
          />

          <h1 className="px-10 text-xl font-medium flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>
            {selectedUser.fullname || selectedUser.name}
          </h1>

          <p className="px-10 text-center">
            {selectedUser.bio || "Hey! I'm using the chat app."}
          </p>
        </div>

        <hr className="border-[#ffffff50] my-4" />

        {/* Media Section */}
        <div className="px-5 text-xs">
          <p className="mb-2">Media</p>

          <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-3 gap-4 opacity-80">
            {msgImages.length > 0
              ? msgImages.map((url, index) => (
                  <div
                    key={index}
                    onClick={() => window.open(url, "_blank")}
                    className="cursor-pointer rounded overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`media-${index}`}
                      className="w-full h-20 object-cover rounded-md"
                    />
                  </div>
                ))
              : msgImages.map((url, index) => (
                  <div
                    key={index}
                    onClick={() => window.open(url, "_blank")}
                    className="cursor-pointer rounded overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`dummy-${index}`}
                      className="w-full h-20 object-cover rounded-md"
                    />
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-4 px-5">
        <button
          onClick={logout}
          className="w-full py-2 border-b-2 border-white bg-gradient-to-r from-purple-400 to-violet-600 cursor-pointer rounded-full text-white font-medium hover:opacity-80 transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Rightsidebar;
