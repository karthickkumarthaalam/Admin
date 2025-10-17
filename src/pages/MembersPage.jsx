import { useState } from "react";
import { usePermission } from "../context/PermissionContext";
import Members from "./Members";
import Subscribers from "./Subscribers";
import Transactions from "./Transactions";
import Enquiry from "../components/Members/Enquiry/Enquiry";
import Advertisement from "../components/Members/Advertisement/Advertisement";

const MembersPage = () => {
  const { hasPermission } = usePermission();
  const tabs = [
    { id: "members", label: "Members", permission: "Members" },
    { id: "subscribers", label: "Subscribers", permission: "Subscriber" },
    { id: "transactions", label: "Transactions", permission: "Transaction" },
    { id: "enquiries", label: "Enquiries", permission: "Enquiry" },
    {
      id: "advertisement",
      label: "Advertisement",
      permission: "Advertisement",
    },
  ];

  const [activeTab, setActiveTab] = useState("members");

  const visibleTabs = tabs.filter(({ permission }) => {
    return hasPermission(permission, "read");
  });

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="bg-slate-100 border-b border-gray-200 px-4 pt-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-2 px-4 text-sm font-semibold transition-colors duration-200 whitespace-nowrap focus:outline-none ${
                  activeTab === tab.id
                    ? "text-gray-900 border-b-2 border-red-500 rounded-sm"
                    : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                }`}
              >
                {tab.label}

                {/* Optional subtle underline animation */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-1 overflow-y-auto bg-slate-100">
          {activeTab === "members" && <Members />}
          {activeTab === "subscribers" && <Subscribers />}
          {activeTab === "transactions" && <Transactions />}
          {activeTab === "enquiries" && <Enquiry />}
          {activeTab === "advertisement" && <Advertisement />}
        </div>
      </div>
    </>
  );
};

export default MembersPage;
