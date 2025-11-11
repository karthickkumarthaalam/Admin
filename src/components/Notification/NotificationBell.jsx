import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../../utils/socket";
import { toast } from "react-toastify";
import { apiCall } from "../../utils/apiCall";
import {
  Bell,
  MessageSquare,
  UserPlus,
  FileText,
  Briefcase,
  X,
} from "lucide-react";
import clsx from "clsx";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const modalRef = useRef(null);

  useSocket((newNotif) => {
    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);
  });

  useEffect(() => {
    fetchNotifications();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    // Close modal if clicking outside
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !event.target.closest(".bell-button")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiCall("/notifications", "GET");
      const list = res?.data?.data || res?.data || [];
      setNotifications(list);
      setUnreadCount(Array.isArray(list) ? list.length : 0);
    } catch {
      toast.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiCall(`/notifications/${id}/read`, "PUT");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const getIconByType = (type) => {
    switch (type) {
      case "comment":
      case "news_comment":
        return <MessageSquare className="text-blue-500" size={18} />;
      case "member":
        return <UserPlus className="text-green-500" size={18} />;
      case "advertisement":
        return <FileText className="text-orange-500" size={18} />;
      case "career":
        return <Briefcase className="text-purple-500" size={18} />;
      default:
        return <Bell className="text-gray-500" size={18} />;
    }
  };

  const closeDropdown = () => setOpen(false);

  return (
    <div className="relative">
      {/* 🔔 Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "bell-button relative flex items-center justify-center p-2 rounded-full transition-all duration-300",
          "hover:scale-110 hover:shadow-lg bg-white/10 backdrop-blur-md border border-white/20"
        )}
      >
        <Bell
          className={clsx(
            "text-white transition-all duration-300",
            open ? "scale-110 text-yellow-400" : "text-white"
          )}
          size={22}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-[5px] py-[1px] rounded-full font-bold shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown / Modal */}
      {open && (
        <div>
          {/* Desktop View */}
          {!isMobile ? (
            <div
              ref={modalRef}
              className={clsx(
                "absolute right-0 mt-3 w-96 rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/20",
                "bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl"
              )}
            >
              <div className="p-3 border-b border-white/30 bg-white/30 flex justify-between items-center">
                <span className="font-semibold text-gray-800">
                  Notifications
                </span>
                <span className="text-xs text-gray-500">
                  {unreadCount} unread
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {notifications.length === 0 ? (
                  <div className="flex justify-center items-center h-60">
                    <p className="text-center text-gray-600 text-sm">
                      No new notifications
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={clsx(
                        "flex gap-3 p-3 items-start border-b border-gray-100 hover:bg-white/70 transition-all duration-200 cursor-pointer",
                        "hover:shadow-sm active:scale-[0.99]"
                      )}
                    >
                      <div className="p-2 rounded-lg bg-white/70 shadow-inner">
                        {getIconByType(notif.type)}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-gray-800 leading-tight">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            // 📱 Centered Mobile Modal
            <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black/60 backdrop-blur-sm">
              <div
                ref={modalRef}
                className="w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn"
              >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200 bg-gray-50">
                  <span className="font-semibold text-gray-800 text-base">
                    Notifications
                  </span>
                  <button
                    onClick={closeDropdown}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content (fixed height even if empty) */}
                <div className="h-[65vh] overflow-y-auto p-2">
                  {notifications.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-center text-gray-600 text-sm">
                        No new notifications
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className="flex gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 active:scale-[0.99] rounded-lg transition-all"
                      >
                        <div className="p-2">{getIconByType(notif.type)}</div>
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold text-gray-800">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
