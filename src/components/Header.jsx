import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Settings,
  ChevronDown,
  User,
  Sun,
  Moon,
  SunMoon,
  CloudSun,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./Notification/NotificationBell";
import AccountSettingsModal from "./settings/AccountSetting/AccountSettingsModal";
import { toast } from "react-toastify";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      toast.dismiss();
      await apiCall("/auth/logout", "POST");
      logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", Icon: SunMoon };
    if (hour < 16) return { text: "Good Afternoon", Icon: Sun };
    if (hour < 20) return { text: "Good Evening", Icon: CloudSun };
    return { text: "Good Night", Icon: Moon };
  };

  const { text: greeting, Icon } = getGreetingData();

  return (
    <>
      <header className="bg-gradient-to-br from-gray-900 to-purple-900 shadow-lg border-b border-gray-400 px-6 py-1">
        <div className="flex justify-between items-center">
          {/* Left Section - Brand & Greeting */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-sm">
                <Icon className="text-white font-semibold" size={22} />{" "}
                {/* ✅ Proper JSX */}
              </div>
              <div>
                <h1 className="hidden md:block text-xl font-bold text-white tracking-tight">
                  Thaalam
                </h1>
                <p className="text-sm text-gray-50 mt-1">
                  {greeting},{" "}
                  <span className="font-semibold text-white">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-2 md:px-3 py-1 transition-all duration-200 border border-white/20 shadow-sm hover:shadow-md md:min-w-[220px] group"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover border-2 border-white/30 shadow-sm group-hover:border-white/50 transition-colors"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm border-2 border-white/30 group-hover:border-white/50 transition-colors">
                        <span className="text-white text-sm font-bold">
                          {getInitials(user?.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-start flex-1">
                    <span className="text-sm font-semibold text-white text-left">
                      {user?.name || "User"}
                    </span>
                    <span className="text-xs text-red-100 text-left capitalize">
                      {user?.role?.toLowerCase() || "admin"}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-white/70 transition-transform duration-200 ${
                    showMenu ? "rotate-180" : ""
                  } group-hover:text-white`}
                />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute top-16 right-0 bg-white shadow-xl rounded-xl w-72 py-2 z-50 border border-gray-100 backdrop-blur-sm">
                  {/* User Info */}
                  <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
                    <div className="flex items-center space-x-3">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                          <User size={20} className="text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        user.email === "admin"
                          ? navigate("/settings")
                          : setShowSettingModal(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 w-full transition-all duration-200 group"
                    >
                      <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Settings size={16} className="text-blue-600" />
                      </div>
                      <span className="font-medium">Account Settings</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-200 group"
                    >
                      <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <LogOut size={16} className="text-red-600" />
                      </div>
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <AccountSettingsModal
        isOpen={showSettingModal}
        onClose={() => setShowSettingModal(false)}
        userData={user}
      />
    </>
  );
};

export default Header;
