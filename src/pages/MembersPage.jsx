import { useState } from "react";
import { usePermission } from "../context/PermissionContext";
import Members from "./Members";
import Subscribers from "./Subscribers";
import Transactions from "./Transactions";
import Enquiry from "../components/Members/Enquiry/Enquiry";

const MembersPage = () => {
  const { hasPermission } = usePermission();
  const tabs = [
    { id: "members", label: "Members", permission: "Members" },
    { id: "subscribers", label: "Subscribers", permission: "Subscriber" },
    { id: "transactions", label: "Transactions", permission: "Transaction" },
    { id: "enquiries", label: "Enquiries", permission: "Enquiry" },
  ];

  const [activeTab, setActiveTab] = useState("members");

  const visibleTabs = tabs.filter(({ permission }) => {
    return hasPermission(permission, "read");
  });

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
          {activeTab === "members" && <Members />}
          {activeTab === "subscribers" && <Subscribers />}
          {activeTab === "transactions" && <Transactions />}
          {activeTab === "enquiries" && <Enquiry />}
        </div>
      </div>
    </>
  );
};

export default MembersPage;
