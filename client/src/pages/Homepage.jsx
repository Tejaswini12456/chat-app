import React, { useState, useContext } from "react";
import Sidebar from "../Components/Sidebar";
import Chatcontainer from "../Components/Chatcontainer";
import Rightsidebar from "../Components/Rightsidebar";
import { Authcontext } from "../../context/Authcontext";
import { Chatcontext } from "../../context/Chatcontext";

const Homepage = () => {
  const { authUser, onlineUsers } = useContext(Authcontext);
  const {selectedUser}=useContext(Chatcontext);

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      {/* Welcome Message with Online/Offline Status */}
      {authUser && (
        <div className="flex items-center justify-center gap-3 mb-2">
          <p className="text-green-500 font-semibold text-center text-lg">
            Welcome, {authUser.name || 'User'}!
          </p>
          
          {/* Online/Offline Indicator */}
          <div className="flex items-center gap-1.5">
            <span 
              className={`w-2.5 h-2.5 rounded-full ${
                onlineUsers?.includes(authUser._id) 
                  ? 'bg-green-400 animate-pulse' 
                  : 'bg-gray-400'
              }`}
            ></span>
            <span className={`text-sm font-medium ${
              onlineUsers?.includes(authUser._id) 
                ? 'text-green-400' 
                : 'text-gray-400'
            }`}>
              {onlineUsers?.includes(authUser._id) ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      )}

      <div
        className={`backdrop-blur-xl border-2 border-gray-300 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative
          ${selectedUser ? "md:grid-cols-[1fr_2fr_1fr] xl:grid-cols-[1fr_3fr_1fr]" : "md:grid-cols-2"}
        `}
      >
        <Sidebar />
        <Chatcontainer />
        <Rightsidebar />
      </div>
    </div>
  );
};

export default Homepage;