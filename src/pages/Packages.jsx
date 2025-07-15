import React, { useState } from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import CopyrightFooter from "../components/CopyRightsComponent";
import Currency from "../components/Currency";
import Package from "../components/Package";
import { usePermission } from "../context/PermissionContext";
import Coupons from "./Coupons";

const Packages = () => {
  const [activeTab, setActiveTab] = useState("packages");

  const { hasPermission } = usePermission();

  const tabs = [
    { id: "packages", label: "Packages", permission: "Package" },
    {
      id: "coupons",
      label: "Coupons",
      permission: "Coupon",
    },
    { id: "currency", label: "Currency", permission: "Currency" },
  ];

  const visibleTabs = tabs.filter(({ permission }) => {
    return hasPermission(permission, "read");
  });

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="p-4 shadow-lg border-t border-dashed border-gray-200">
          <div className="flex flex-1 gap-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-1 overflow-y-auto bg-gray-50">
          {activeTab === "packages" && <Package />}
          {activeTab === "coupons" && <Coupons />}
          {activeTab === "currency" && <Currency />}
        </div>
      </div>
    </>
  );
};

export default Packages;
