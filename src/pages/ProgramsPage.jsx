import React, { useState } from "react";
import Header from "../components/Header";
import RjPortfolio from "../components/programs/RjPortfolio";
import Sidebar from "../components/SideBar";
import CopyrightFooter from "../components/CopyRightsComponent";

const ProgramsPage = () => {
  const [activeTab, setActiveTab] = useState("rj-profile");

  const tabs = [{ id: "rj-profile", label: "Rj Portfolio" }];

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
              {activeTab === "rj-profile" && <RjPortfolio />}
            </div>
          </div>

          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
};

export default ProgramsPage;
