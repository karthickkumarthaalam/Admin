import React, { useState } from "react";
import CrewManagementPage from "./CrewManagementPage";
import CrewMerchantPage from "./CrewMerchant/CrewMerchantPage";

const CrewManagement = () => {
  const [activeTab, setActiveTab] = useState("crew");

  const tabs = [
    { id: "crew", label: "Crew" },
    { id: "merchant", label: "Merchant" },
  ];
  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="px-4">
          <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2 ">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5  text-xs font-medium rounded-lg transition-all duration-300 border whitespace-nowrap
          ${
            activeTab === tab.id
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md border-blue-700 scale-[1.03]"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-blue-700 hover:border-blue-300"
          }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        {activeTab === "crew" && <CrewManagementPage />}
        {activeTab === "merchant" && <CrewMerchantPage />}
      </div>
    </>
  );
};

export default CrewManagement;
