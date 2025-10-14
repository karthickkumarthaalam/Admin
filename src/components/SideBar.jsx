import React, { useMemo, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Menu,
  LayoutDashboard,
  ContactRound,
  BriefcaseBusiness,
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
    { label: "Banner", icon: Image, path: "/banner", permission: "Banner" },
    {
      label: "Programs",
      icon: Activity,
      path: "/programs",
      permission: "Radio Station",
    },
    {
      label: "Podcasts",
      icon: Podcast,
      path: "/podcasts",
      permission: "Podcast",
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
      label: "Careers",
      icon: BriefcaseBusiness,
      path: "/career",
      permission: "Careers",
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
        className="md:hidden fixed top-4 left-6 z-50 bg-white p-2 rounded-lg shadow-md text-blue-600 hover:bg-red-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 flex flex-col z-50 transition-transform duration-300 shadow-lg border-r border-gray-200
          ${isOpen || !isMobile ? "translate-x-0" : "-translate-x-full"}
          ${
            isCollapsed && !isMobile ? "w-16" : "w-52"
          } md:translate-x-0 md:relative`}
      >
        {/* Logo */}
        <div className="px-4 py-3 border-b border-gray-200 flex flex-col items-center">
          <img
            src={`${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`}
            alt="Thaalam Logo"
            className={`transition-all duration-300 ${
              isCollapsed && !isMobile ? "" : "h-14 w-20"
            }`}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {allowedMenus.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={label}
              to={path}
              onClick={() => isMobile && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md p-3 transition-all duration-200 relative group
                 ${
                   isActive
                     ? "bg-gradient-to-r from-red-500 to-red-600  text-white shadow-inner scale-[1.02]"
                     : "hover:bg-red-50 hover:text-red-600"
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

              {/* Show label on desktop (if not collapsed) or always on mobile */}
              {(!isCollapsed || isMobile) && (
                <span className="text-sm font-medium">{label}</span>
              )}

              {/* Tooltip for collapsed desktop */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-50 whitespace-nowrap">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Button */}
        {!isMobile && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={toggleCollapse}
              className="flex items-center justify-center w-full gap-2  text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-lg transition"
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
