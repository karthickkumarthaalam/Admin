import React, { useState } from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import Banner from "./Banner";
import CopyrightFooter from "../components/CopyRightsComponent";
import PopupBanner from "../components/Banner/PopupBanner";

const BannerPage = () => {
  const [activeTab, setActiveTab] = useState("banner");

  const tabs = [
    { id: "banner", label: "Banner" },
    { id: "popup", label: "Popup Banner" },
  ];

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="p-4 shadow-lg border-t border-dashed border-gray-200">
              <div className="flex flex-1 gap-2">
                {tabs.map((tab) => {
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded text-sm font-medium ${
                        activeTab === tab.id
                          ? "bg-red-500 text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
              {activeTab === "banner" && <Banner />}
              {activeTab === "popup" && <PopupBanner />}
            </div>
          </div>

          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
};

export default BannerPage;
