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
      <div className="flex gap-2 mb-4 px-3 flex-wrap">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3 py-1.5  text-xs font-medium rounded-lg transition-all duration-300 border whitespace-nowrap
        ${
          activeSubTab === tab.id
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md border-blue-700 scale-[1.03]"
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-blue-700 hover:border-blue-300"
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
