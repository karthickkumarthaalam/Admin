import { useState } from "react";
import { usePermission } from "../context/PermissionContext";
import Enquiry from "../components/Members/Enquiry/Enquiry";
import Advertisement from "../components/Members/Advertisement/Advertisement";
import CareersPage from "./CareersPage";
import SummerFestivalRefund from "../components/Members/Enquiry/SummerFestivalRefund";

const EnquiryPage = () => {
  const { hasPermission } = usePermission();
  const tabs = [
    {
      id: "summer-festival",
      label: "Summer Festival",
      permission: "Enquiry",
    },
    { id: "enquiries", label: "Enquiries", permission: "Enquiry" },
    {
      id: "advertisement",
      label: "Advertisement",
      permission: "Advertisement",
    },
    {
      id: "career",
      label: "Career",
      permission: "Career",
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
          {activeTab === "summer-festival" && <SummerFestivalRefund />}
          {activeTab === "enquiries" && <Enquiry />}
          {activeTab === "advertisement" && <Advertisement />}
          {activeTab === "career" && <CareersPage />}
        </div>
      </div>
    </>
  );
};

export default EnquiryPage;
