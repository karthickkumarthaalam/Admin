import React, { useEffect, useState, useCallback } from "react";
import { X, Music, Image as ImageIcon } from "lucide-react";
import AddPodcastDetails from "./AddPodcastDetails";
import AddPodcastMedia from "./AddPodcastMedia";

const AddPodcastModal = ({
  isOpen,
  onClose,
  onSuccess,
  editPodcastData,
  setEditPodcastData,
}) => {
  const [activeTab, setActiveTab] = useState("podcast-details");

  // Reset tab when opening modal or switching between edit/create
  useEffect(() => {
    if (isOpen) {
      setActiveTab("podcast-details");
    }
  }, [isOpen]);

  // Close modal on backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleDetailsSuccess = useCallback(
    (podcastData) => {
      setActiveTab("podcast-media");
      setEditPodcastData(podcastData);
    },
    [setEditPodcastData]
  );

  if (!isOpen) return null;

  const tabs = [
    {
      id: "podcast-details",
      label: "Podcast Details",
      icon: <Music size={18} />,
      component: (
        <AddPodcastDetails
          onNext={handleDetailsSuccess}
          editPodcastData={editPodcastData}
        />
      ),
    },
    {
      id: "podcast-media",
      label: "Podcast Media",
      icon: <ImageIcon size={18} />,
      component: (
        <AddPodcastMedia
          editPodcastData={editPodcastData}
          setEditPodcastData={setEditPodcastData}
          onSuccess={onSuccess}
        />
      ),
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] md:p-4 backdrop-blur-md transition-all duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full h-full overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Music className="text-indigo-600" size={20} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editPodcastData ? "Edit Podcast" : "Create New Podcast"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            aria-label="Close modal"
          >
            <X
              size={24}
              className="text-gray-500 group-hover:text-red-500 transition-colors duration-200"
            />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 bg-white px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 font-semibold text-sm transition-all duration-300 relative group ${
                activeTab === tab.id
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-indigo-500"
              }`}
            >
              {/* Icon */}
              <div
                className={`transition-colors duration-300 ${
                  activeTab === tab.id
                    ? "text-indigo-600"
                    : "text-gray-400 group-hover:text-indigo-500"
                }`}
              >
                {tab.icon}
              </div>

              {tab.label}

              {/* Active tab indicator */}
              <div
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transition-all duration-300 ${
                  activeTab === tab.id ? "scale-100" : "scale-0"
                }`}
              />

              {/* Hover indicator */}
              <div
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-200 transition-all duration-300 ${
                  activeTab === tab.id
                    ? "scale-0"
                    : "scale-0 group-hover:scale-100"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-slate-100">
          <div className="p-2 md:p-8">
            {tabs.find((t) => t.id === activeTab)?.component}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              {activeTab === "podcast-details"
                ? "Fill in all required fields marked with *"
                : "Upload and manage podcast audio files"}
            </span>

            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {editPodcastData ? "Editing Mode" : "Creation Mode"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPodcastModal;
