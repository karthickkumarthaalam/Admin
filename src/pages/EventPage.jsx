import React, { useState } from "react";
import { usePermission } from "../context/PermissionContext";
import EventList from "../components/Events/EventList/EventList";

const EventPage = () => {
  const [activeTab, setActiveTab] = useState("events");
  const { hasPermission } = usePermission();

  const tabs = [
    {
      id: "events",
      label: "Events",
      permission: "Events",
    },
  ];

  const visibleTabs = tabs.filter(({ permission }) => {
    return hasPermission(permission, "read");
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="p-4 border-t border-gray-200 bg-slate-100 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-200 whitespace-nowrap focus:outline-none ${
                activeTab === tab.id
                  ? "text-gray-900 border-b-2 border-red-500 rounded-sm"
                  : "text-gray-600 hover:text-gray-800 border-b-2 border-transparent"
              }`}
            >
              {tab.label}

              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 rounded-full"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-1 overflow-y-auto bg-slate-100">
        {activeTab === "events" && <EventList />}
      </div>
    </div>
  );
};

export default EventPage;
