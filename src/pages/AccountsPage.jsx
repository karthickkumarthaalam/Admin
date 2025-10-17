import React, { useState } from "react";
import { usePermission } from "../context/PermissionContext";
import BudgetPage from "../components/Accounts/Budget/BudgetPage";
import Currency from "../components/Currency";
import ExpensePage from "../components/Accounts/Expenses/ExpensePage";
import PayslipPage from "../components/Accounts/Payslip/PayslipPage";

const AccountsPage = () => {
  const { hasPermission } = usePermission();

  const tabs = [
    {
      id: "expenses",
      label: "Expenses",
      permission: ["Expenses", "Audit Bills"],
    },
    {
      id: "budget",
      label: "Budget",
      permission: "Budget",
    },
    { id: "currency", label: "Currency", permission: "Currency" },
    {
      id: "payslip",
      label: "Pay-Slip",
      permission: "PaySlip",
    },
  ];

  const visibleTabs = tabs.filter(({ permission }) => {
    if (Array.isArray(permission)) {
      return permission.some((p) => hasPermission(p, "read"));
    }
    return hasPermission(permission, "read");
  });

  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || null);

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="p-4 border-t border-gray-200 bg-slate-100 shadow-sm">
          <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-sm font-semibold rounded transition-colors duration-200 whitespace-nowrap focus:outline-none ${
                  activeTab === tab.id
                    ? "text-gray-900 border-b-2 border-red-500 rounded-sm"
                    : "text-gray-600 hover:text-gray-800 border-b-2 border-transparent"
                }`}
              >
                {tab.label}

                {/* Subtle underline for active tab */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-1 overflow-y-auto bg-slate-100">
          {activeTab === "expenses" && <ExpensePage />}
          {activeTab === "budget" && <BudgetPage />}
          {activeTab === "currency" && <Currency />}
          {activeTab === "payslip" && <PayslipPage />}
        </div>
      </div>
    </>
  );
};

export default AccountsPage;
