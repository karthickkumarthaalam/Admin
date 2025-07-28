import React, { useState } from "react";
import Budget from "./Budget";
import BudgetCategory from "./category/BudgetCategory";
import BudgetTaxes from "./taxes/BudgetTaxes";
import BudgetMerchant from "./merchant/BudgetMerchant";
import BudgetUnits from "./units/BudgetUnits";

const BudgetPage = () => {
  const [activeTab, setActiveTab] = useState("budget");

  const tabs = [
    { id: "budget", label: "Budget" },
    {
      id: "category",
      label: "Category",
    },
    {
      id: "taxes",
      label: "Taxes",
    },
    {
      id: "merchants",
      label: "Merchant",
    },
    {
      id: "units",
      label: "Units",
    },
  ];

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="px-4 border-t border-dashed border-gray-200">
          <div className="flex flex-1 gap-2 overflow-y-scroll">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-blue-800 text-white"
                    : "bg-gray-100 text-gray-700 hover: bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1  overflow-y-auto bg-gray-50 ">
          {activeTab === "budget" && <Budget />}
          {activeTab === "category" && <BudgetCategory />}
          {activeTab === "taxes" && <BudgetTaxes />}
          {activeTab === "merchants" && <BudgetMerchant />}
          {activeTab === "units" && <BudgetUnits />}
        </div>
      </div>
    </>
  );
};

export default BudgetPage;
