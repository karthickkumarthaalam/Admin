import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import CopyrightFooter from "../components/CopyRightsComponent";
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
    <div className="flex h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="p-4 shadow-lg border-t border-dashed border-gray-200">
              <div className="flex flex-1 gap-2">
                {visibleTabs.map((tab) => {
                  return (
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
                  );
                })}
              </div>
            </div>

            <div className="flex-1 p-1 overflow-y-auto bg-gray-50">
              {activeTab === "radio-station" && <RadioStation />}
              {activeTab === "program-category" && <ProgramCategory />}
              {activeTab === "radio-program" && <RadioPrograms />}
            </div>
          </div>

          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
};

export default ProgramsPage;
