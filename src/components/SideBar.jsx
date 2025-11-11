import React, { useMemo, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Menu,
  LayoutDashboard,
  ContactRound,
  MessageCircleMore,
  BadgeDollarSign,
  Activity,
  X,
  Settings,
  UserCheck,
  Image,
  Podcast,
  Landmark,
  FileText,
  ArrowLeftCircleIcon,
  ChartNetwork,
  Newspaper,
  PartyPopper,
} from "lucide-react";
import { usePermission } from "../context/PermissionContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle
  const [isCollapsed, setIsCollapsed] = useState(true); // Desktop collapse
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { hasPermission, permissionsLoaded } = usePermission();

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menus = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      permission: "Dashboard",
    },
    { label: "Users", icon: ContactRound, path: "/users", permission: "User" },
    {
      label: "Site Information",
      icon: ChartNetwork,
      path: "/site-information",
      permission: "Site Information",
    },
    { label: "Banner", icon: Image, path: "/banner", permission: "Banner" },
    {
      label: "Programs",
      icon: Activity,
      path: "/programs",
      permission: "Radio Station",
    },
    {
      label: "News",
      icon: Newspaper,
      path: "/news",
      permission: "News",
    },
    {
      label: "Podcasts",
      icon: Podcast,
      path: "/podcasts",
      permission: "Podcast",
    },
    {
      label: "Events",
      icon: PartyPopper,
      path: "/events",
      permission: "Events",
    },
    {
      label: "Packages",
      icon: BadgeDollarSign,
      path: "/packages",
      permission: "Package",
    },
    {
      label: "Members",
      icon: UserCheck,
      path: "/members",
      permission: ["Members", "Subscriber", "Transaction"],
    },
    {
      label: "Accounts",
      icon: Landmark,
      path: "/accounts",
      permission: ["Expenses", "Budget", "Currency", "Audit Bills"],
    },
    {
      label: "Agreements",
      icon: FileText,
      path: "/agreements",
      permission: "Agreements",
    },
    {
      label: "Enquiry",
      icon: MessageCircleMore,
      path: "/enquiry",
      permission: "Enquiry",
    },
    { label: "Settings", icon: Settings, path: "/settings", permission: null },
  ];

  const allowedMenus = useMemo(() => {
    if (!permissionsLoaded) return [];
    return menus.filter(({ permission }) => {
      if (!permission) return true;
      if (Array.isArray(permission))
        return permission.some((p) => hasPermission(p, "read"));
      return hasPermission(permission, "read");
    });
  }, [permissionsLoaded, hasPermission]);

  const toggleCollapse = () => {
    if (!isMobile) setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-2.5 left-6 z-50 bg-purple-900 p-2 rounded-lg shadow-md text-gray-100 hover:bg-red-600/30 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full  bg-gray-900 text-gray-200 flex flex-col z-50 transition-transform duration-300 shadow-xl border-r border-gray-800
          ${isOpen || !isMobile ? "translate-x-0" : "-translate-x-full"}
          ${
            isCollapsed && !isMobile ? "w-16" : "w-52"
          } md:translate-x-0 md:relative`}
      >
        {/* Logo */}
        <div className="px-4 py-3 border-b border-gray-800 flex flex-col items-center">
          <img
            src={`${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`}
            alt="Thaalam Logo"
            className={`transition-all duration-300 ${
              isCollapsed && !isMobile ? "h-8 w-8" : "h-14 w-20"
            }`}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 hover:scrollbar-thumb-gray-600">
          {allowedMenus.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={label}
              to={path}
              onClick={() => isMobile && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md p-3 transition-all duration-200 relative group
                 ${
                   isActive
                     ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-700/30 scale-[1.02]"
                     : "hover:bg-gray-800 hover:text-red-400"
                 }
                 ${isCollapsed && !isMobile ? "justify-center" : ""}`
              }
            >
              <div className="flex-shrink-0">
                <Icon
                  size={22}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
              </div>

              {/* Show label */}
              {(!isCollapsed || isMobile) && (
                <span className="text-sm font-medium">{label}</span>
              )}

              {/* Tooltip for collapsed desktop */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-gray-100 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-50 whitespace-nowrap">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Button */}
        {!isMobile && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={toggleCollapse}
              className="flex items-center justify-center w-full gap-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
            >
              <ArrowLeftCircleIcon
                size={18}
                className={`${
                  isCollapsed ? "rotate-180" : ""
                } transition-transform`}
              />
              {!isCollapsed && (
                <span className="text-sm font-medium">Collapse Menu</span>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
