import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await apiCall("/auth/logout", "POST");
      logout();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-end md:justify-between items-center bg-white px-6 py-4 relative">
      <h5 className="hidden md:block text-xl font-semibold text-gray-600">
        Welcome to Thaalam
      </h5>
      <div
        className="relative flex items-center space-x-4"
        onClick={() => setShowMenu(!showMenu)}
      >
        {user?.email === "admin" && (
          <h5 className="text-gray-700 font-bold">Admin</h5>
        )}
        <img
          src="https://thaalam.ch/newfile/subscription/assets/img/user1.jpg"
          alt="admin profile"
          className="w-10 h-10 rounded-full object-cover cursor-pointer"
        />

        {showMenu && (
          <div
            className="absolute top-14 right-0 bg-white shadow-lg rounded-lg w-40 py-2 z-20 border"
            onClick={() => setShowMenu(false)}
          >
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
            >
              <Settings size={16} /> Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
