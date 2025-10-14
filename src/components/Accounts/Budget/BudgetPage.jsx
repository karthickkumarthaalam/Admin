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
        <div className="px-4">
          <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2">
            {tabs.map((tab) => (
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
