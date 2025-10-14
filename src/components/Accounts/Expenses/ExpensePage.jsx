import React, { useState } from "react";
import Expenses from "./Expenses";
import Category from "./category/Category";
import Merchant from "./merchant/Merchant";
import ExpenseBills from "./bills/ExpenseBills";
import { usePermission } from "../../../context/PermissionContext";

const ExpensePage = () => {
  const { hasPermission } = usePermission();

  const tabs = [
    {
      id: "expense",
      label: "Expenses",
      permission: "Expenses",
    },
    {
      id: "categories",
      label: "Category",
      permission: "Expenses",
    },
    {
      id: "merchant",
      label: "Merchant",
      permission: "Expenses",
    },
    {
      id: "bills",
      label: "Audit Bills",
      permission: "Audit Bills",
    },
  ];

  const visibleTabs = tabs.filter(({ permission }) => {
    return hasPermission(permission, "read");
  });

  const [activeTab, setActiveTab] = useState(
    visibleTabs.length > 0 ? visibleTabs[0].id : null
  );

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="px-4">
          <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border whitespace-nowrap
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

        <div className="flex-1 overflow-y-auto bg-gray-50">
          {activeTab === "expense" && <Expenses />}
          {activeTab === "categories" && <Category />}
          {activeTab === "merchant" && <Merchant />}
          {activeTab === "bills" && <ExpenseBills />}
        </div>
      </div>
    </>
  );
};

export default ExpensePage;
