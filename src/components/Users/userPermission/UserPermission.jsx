import React, { useState } from "react";
import Permission from "./permission/Permission";
import Module from "./module/Module";

const UserPermission = () => {
  const [activeSubTab, setActiveSubTab] = useState("permission");

  const subTabs = [
    { id: "permission", label: "Permissions" },
    { id: "module", label: "Modules" },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex gap-2 mb-4 px-3">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              activeSubTab === tab.id
                ? "bg-blue-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSubTab === "permission" && <Permission />}
        {activeSubTab === "module" && <Module />}
      </div>
    </div>
  );
};

export default UserPermission;
