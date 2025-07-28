import React, { useState } from "react";
import { usePermission } from "../context/PermissionContext";
import Expenses from "../components/Accounts/Expenses/Expenses";
import BudgetPage from "../components/Accounts/Budget/BudgetPage";
import Currency from "../components/Currency";

const AccountsPage = () => {
  const { hasPermission } = usePermission();

  const tabs = [
    { id: "expenses", label: "Expenses", permission: "Expenses" },
    {
      id: "budget",
      label: "Budget",
      permission: "Budget",
    },
    { id: "currency", label: "Currency", permission: "Currency" },
  ];

  const visibleTabs = tabs.filter(({ permission }) => {
    return hasPermission(permission, "read");
  });

  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || null);

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="p-4  border-t border-dashed border-gray-200">
          <div className="flex flex-1 gap-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover: bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-1 overflow-y-auto bg-gray-50">
          {activeTab === "expenses" && <Expenses />}
          {activeTab === "budget" && <BudgetPage />}
          {activeTab === "currency" && <Currency />}
        </div>
      </div>
    </>
  );
};

export default AccountsPage;
