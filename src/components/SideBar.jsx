import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Menu,
  LayoutDashboard,
  BriefcaseBusiness,
  CreditCard,
  Users,
  Ticket,
  BadgeDollarSign,
  Activity,
  X,
  Settings,
  UserCheck,
  Image,
  Podcast,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePermission } from "../context/PermissionContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { hasPermission, permissionsLoaded } = usePermission();

  const menus = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      permission: null,
    },
    {
      label: "Users",
      icon: BriefcaseBusiness,
      path: "/users",
      permission: "User",
    },
    {
      label: "Banner",
      icon: Image,
      path: "/banner",
      permission: "Banner",
    },
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
      label: "Transactions",
      icon: CreditCard,
      path: "/transactions",
      permission: "Transaction",
    },
    {
      label: "Paid Subscribers",
      icon: Users,
      path: "/subscribers",
      permission: "Subscriber",
    },
    {
      label: "Members",
      icon: UserCheck,
      path: "/members",
      permission: "Members",
    },
    {
      label: "Packages",
      icon: BadgeDollarSign,
      path: "/packages",
      permission: "Package",
    },
    {
      label: "Agreements",
      icon: FileText,
      path: "/agreements",
      permission: "Agreements",
    },
    { label: "Settings", icon: Settings, path: "/settings", permission: null },
  ];

  const allowedMenus = useMemo(() => {
    if (!permissionsLoaded) return [];
    return menus.filter(
      ({ permission }) => !permission || hasPermission(permission, "read")
    );
  }, [permissionsLoaded, hasPermission]);

  return (
    <>
      <button
        className="md:hidden fixed top-6 left-4 z-[99] bg-white p-2 rounded shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`fixed top-0 left-0 h-full w-64 md:w-24  bg-white text-gray-700 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-lg
          ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:relative md:shadow-non`}
      >
        <div className="p-2 border-b border-gray-400 flex items-center justify-center">
          <img
            src="https://thaalam.ch/newfile/subscription/assets/img/thalam-logo.png"
            alt="thaalam logo"
            className="h-16 w-24"
          />
        </div>

        <nav className="flex-1 px-2 space-y-2 mt-2">
          {allowedMenus.map(({ label, icon: Icon, path }) => {
            return (
              <NavLink
                to={path}
                key={label}
                onClick={() => {
                  setIsOpen(false);
                }}
                className={({ isActive }) =>
                  `flex flex-row md:flex-col items-center gap-3 rounded p-4 md:px-3 md:py-1 transition-all duration-300 ${
                    isActive
                      ? "bg-red-500 text-white"
                      : "hover:bg-gray-100 hover:text-gray-700"
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-center text-md md:text-xs">{label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
