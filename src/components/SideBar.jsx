import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Menu,
  LayoutDashboard,
  CreditCard,
  Users,
  Ticket,
  BadgeDollarSign,
  X,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menus = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Transactions", icon: CreditCard, path: "/transactions" },
    { label: "Subscribers", icon: Users, path: "/subscribers" },
    { label: "Coupons", icon: Ticket, path: "/coupons" },
    { label: "Packages", icon: BadgeDollarSign, path: "/packages" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <>
      <button
        className="md:hidden fixed top-6 left-4 z-[99] bg-white p-2 rounded shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white text-gray-700 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-lg
          ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:relative md:shadow-non`}
      >
        <div className="p-4 border-b border-gray-400 flex items-center justify-center">
          <img
            src="https://thaalam.ch/newfile/subscription/assets/img/thalam-logo.png"
            alt="thaalam logo"
            className="h-16 w-24"
          />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menus.map(({ label, icon: Icon, path }) => (
            <NavLink
              to={path}
              key={label}
              onClick={() => {
                setIsOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded p-3 transition-all duration-300 ${
                  isActive
                    ? "bg-red-500 text-white"
                    : "hover:bg-gray-100 hover:text-gray-700"
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
