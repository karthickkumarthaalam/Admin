import React, { useState } from "react";
import { usePermission } from "../../../context/PermissionContext";
import PayslipCategory from "./category/PayslipCategory";
import PayslipComponent from "./payslip/PayslipComponent";

const PayslipPage = () => {
  const { hasPermission } = usePermission();

  const tabs = [
    { id: "payslip", label: "Pay Slip", permission: "PaySlip" },
    { id: "category", label: "Category", permission: "PaySlip" },
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
        <div className="px-4 flex flex-1 gap-2 overflow-y-scroll">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded text-sm font-medium ${
                activeTab === tab.id
                  ? "bg-blue-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } whitespace-nowrap`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {activeTab === "payslip" && <PayslipComponent />}
        {activeTab === "category" && <PayslipCategory />}
      </div>
    </>
  );
};

export default PayslipPage;
