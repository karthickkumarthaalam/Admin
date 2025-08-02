import React, { useState } from "react";
import Expenses from "./Expenses";
import Category from "./category/Category";
import Merchant from "./merchant/Merchant";

const ExpensePage = () => {
  const [activeTab, setActiveTab] = useState("expense");

  const tabs = [
    {
      id: "expense",
      label: "Expenses",
    },
    {
      id: "categories",
      label: "Category",
    },
    {
      id: "merchant",
      label: "Merchant",
    },
  ];
  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="px-4">
          <div className="flex flex-1 gap-2 overflow-y-scroll">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-blue-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
        </div>
      </div>
    </>
  );
};

export default ExpensePage;
