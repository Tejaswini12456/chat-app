import React, { useContext, useState, useEffect } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { Authcontext } from "../../context/Authcontext";
import { Chatcontext } from "../../context/Chatcontext";

const Sidebar = () => {
  const { users, selectedUser, setselectedUser, unseenMessages, getAllUsers } = useContext(Chatcontext);
  // ✅ Fixed: Changed to match your actual Authcontext exports
  const { logout, onlineUsers, authUser } = useContext(Authcontext);
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  // Force reload users when component mounts
  useEffect(() => {
    if (authUser && getAllUsers) {
      console.log("🔄 Sidebar: Loading users...");
      getAllUsers();
    }
  }, [authUser]);

  // Safe filtering with null checks
  const filteredUsers = (users || []).filter((u) =>
    u?.name?.toLowerCase().includes(input.toLowerCase())
  );

  console.log("👥 Sidebar users:", users);
  console.log("🔍 Filtered users:", filteredUsers);
  console.log("👤 Current user:", authUser);

  return (
    <div
      className={`bg-[#8185b2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Header */}
      <div className="pb-5 flex justify-between items-center">
        <img src={assets.logo} alt="logo" className="max-w-[100px]" />
        <div className="relative group">
          <img
            src={assets.menu_icon}
            alt="menu"
            className="max-h-5 cursor-pointer"
          />
          <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
            <p onClick={() => navigate("/Profile")} className="cursor-pointer text-sm">
              Edit profile
            </p>
            <hr className="my-2 border-t border-gray-500" />
            <p onClick={logout} className="cursor-pointer text-sm">
              Logout
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#282142] rounded-full flex items-center gap-2 px-3 py-3 mt-5">
        <img src={assets.search_icon} alt="Search" className="w-3" />
        <input
          type="text"
          placeholder="Search User"
          className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* Users List */}
      <div className="flex flex-col mt-5">
        {!users || users.length === 0 ? (
          <div className="text-center mt-10 px-4">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-300 font-medium mb-2">No Users Found</p>
            <p className="text-xs text-gray-400 mb-4">
              Create another account to start chatting
            </p>
            <button
              onClick={() => getAllUsers && getAllUsers()}
              className="bg-violet-500 hover:bg-violet-600 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              🔄 Refresh Users
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-gray-400">No users match "{input}"</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => {
                console.log("✅ Selected user:", user.name);
                setselectedUser(user);
              }}
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm hover:bg-[#282142]/60 transition-all ${
                selectedUser && selectedUser._id === user._id
                  ? "bg-[#282142]/50 border-l-2 border-violet-500"
                  : ""
              }`}
            >
              <img
                src={user.profilePic || user.avatar || assets.avatar_icon}
                alt={user.name}
                className="w-[35px] h-[35px] rounded-full object-cover"
              />
              <div className="flex flex-col leading-5 flex-1">
                <p className="font-medium">{user.name || "Unknown"}</p>
                <span
                  className={`text-xs ${
                    onlineUsers?.includes(user._id) ? "text-green-400" : "text-neutral-400"
                  }`}
                >
                  {onlineUsers?.includes(user._id) ? "● Online" : "○ Offline"}
                </span>
              </div>
              {unseenMessages && unseenMessages[user._id] > 0 && (
                <p className="absolute top-4 right-4 text-xs h-5 min-w-[20px] px-1.5 flex justify-center items-center rounded-full bg-violet-500 font-bold">
                  {unseenMessages[user._id]}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      
    </div>
  );
};

export default Sidebar;