import React, { useState } from "react";
import RadioStation from "../components/programs/radio-station/RadioStation";
import ProgramCategory from "../components/programs/program-category/ProgramCategory";
import RadioPrograms from "../components/programs/radio-programs/RadioPrograms";
import { usePermission } from "../context/PermissionContext";

const ProgramsPage = () => {
  const [activeTab, setActiveTab] = useState("radio-station");

  const { hasPermission } = usePermission();

  const tabs = [
    {
      id: "radio-station",
      label: "Radio Station",
      permission: "Radio Station",
    },
    {
      id: "program-category",
      label: "Program Category",
      permission: "Program Category",
    },
    {
      id: "radio-program",
      label: "Radio Programs",
      permission: "Radio Programs",
    },
  ];

  const visibleTabs = tabs.filter(({ permission }) => {
    return hasPermission(permission, "read");
  });

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="p-4 border-t border-gray-200 bg-white shadow-sm">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-200 whitespace-nowrap focus:outline-none ${
                  activeTab === tab.id
                    ? "text-gray-900 border-b-2 border-red-500 rounded-sm"
                    : "text-gray-600 hover:text-gray-800 border-b-2 border-transparent"
                }`}
              >
                {tab.label}

                {/* Optional subtle underline for active tab */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-1 overflow-y-auto bg-gray-50">
          {activeTab === "radio-station" && <RadioStation />}
          {activeTab === "program-category" && <ProgramCategory />}
          {activeTab === "radio-program" && <RadioPrograms />}
        </div>
      </div>
    </>
  );
};

export default ProgramsPage;
