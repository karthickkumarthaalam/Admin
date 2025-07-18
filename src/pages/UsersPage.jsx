import { useState } from "react";
import Department from "../components/Users/department/Department";
import SystemUsers from "../components/Users/users/SystemUsers";
import UserPermission from "../components/Users/userPermission/UserPermission";

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState("user");

  const tabs = [
    { id: "user", label: "Users" },
    { id: "department", label: "Dapartment" },
    { id: "userPermission", label: "User Permission" },
  ];

  return (
    <>
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
          {activeTab === "userPermission" && <UserPermission />}
        </div>
      </div>
    </>
  );
};

export default UsersPage;
