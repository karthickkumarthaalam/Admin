import React, { useState } from "react";
import Agreements from "../components/Agreements/Agreements";
import { usePermission } from "../context/PermissionContext";

const AgreementPage = () => {
  const [activeTab, setActiveTab] = useState("agreement");
  const { hasPermission } = usePermission();

  const tabs = [
    { id: "agreement", label: "Agreements", permission: "Agreement" },
  ];

  const VisibleTabs = tabs.filter(({ permission }) => {
    return hasPermission(permission, "read");
  });

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="p-4 shadow-lg border-t border-dashed border-gray-200">
          <div className="flex flex-1 gap-2">
            {VisibleTabs.map((tab) => {
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

        <div className="flex-1 p-1 overflow-y-auto bg-gray-50">
          {activeTab === "agreement" && <Agreements />}
        </div>
      </div>
    </>
  );
};

export default AgreementPage;
