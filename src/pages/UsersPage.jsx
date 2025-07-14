import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import CopyrightFooter from "../components/CopyRightsComponent";
import Department from "../components/Users/department/Department";
import SystemUsers from "../components/Users/users/SystemUsers";

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState("user");

  const tabs = [
    { id: "user", label: "Users" },
    { id: "department", label: "Dapartment" },
  ];

  return (
    <div class="flex h-screen flex-col">
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
              {activeTab === "user" && <SystemUsers />}
              {activeTab === "department" && <Department />}
            </div>
          </div>
          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
