import React, { useState } from "react";
import Banner from "./Banner";
import PopupBanner from "../components/Banner/PopupBanner";
import { usePermission } from "../context/PermissionContext";

const BannerPage = () => {
  const [activeTab, setActiveTab] = useState("banner");
  const { hasPermission } = usePermission();

  const tabs = [
    { id: "banner", label: "Banner", permission: "Banner" },
    { id: "popup", label: "Popup Banner", permission: "Popup Banner" },
  ];

  // Filter only tabs the user has 'read' access to
  const visibleTabs = tabs.filter(({ permission }) =>
    hasPermission(permission, "read")
  );

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
          {activeTab === "banner" && <Banner />}
          {activeTab === "popup" && <PopupBanner />}
        </div>
      </div>
    </>
  );
};

export default BannerPage;
