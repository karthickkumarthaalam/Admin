import React, { useState } from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import CopyrightFooter from "../components/CopyRightsComponent";
import Podcasts from "./Podcasts";
import PodcastComments from "../components/podcasts/PodcastComments";
import PodcastReactionStats from "../components/podcasts/PodcastReactions";
import { usePermission } from "../context/PermissionContext";

const PodcastPage = () => {
  const [activeTab, setActiveTab] = useState("podcast");
  const { hasPermission } = usePermission();

  const tabs = [
    { id: "podcast", label: "Podcasts", permission: "Podcast" },
    { id: "comment", label: "Comments", permission: "Podcast Comment" },
    { id: "reaction", label: "Reactions", permission: "Podcast Reactions" },
  ];

  const visibleTabs = tabs.filter(({ permission }) => {
    return hasPermission(permission, "read");
  });

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="p-4 shadow-lg border-t border-dashed border-gray-200">
              <div className="flex flex-1 gap-2">
                {visibleTabs.map((tab) => {
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded text-sm font-medium ${
                        activeTab === tab.id
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 p-1 overflow-y-auto bg-gray-50">
              {activeTab === "podcast" && <Podcasts />}
              {activeTab === "comment" && <PodcastComments />}
              {activeTab === "reaction" && <PodcastReactionStats />}
            </div>
          </div>

          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
};

export default PodcastPage;
