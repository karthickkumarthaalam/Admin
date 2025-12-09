import { NotebookIcon, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import AddBlogsDetails from "./AddBlogsDetails";

const AddBlogsModal = ({ isOpen, onClose, onSuccess, editBlogsData }) => {
  const [activeTab, setActiveTab] = useState("blogs-details");

  useEffect(() => {
    if (isOpen) {
      setActiveTab("blogs-details");
    }
  }, [isOpen, editBlogsData]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  const tabs = [
    {
      id: "blogs-details",
      label: "Blog Details",
      icon: <NotebookIcon size={18} />,
      component: (
        <AddBlogsDetails onSuccess={onSuccess} editBlogsData={editBlogsData} />
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
            <div className="p-2 bg-blue-100 rounded-xl">
              <NotebookIcon className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editBlogsData
                  ? "Edit Blog Article"
                  : "Create New Blog Article"}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 font-semibold text-sm transition-all duration-300 relative group ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <div
                className={`transition-colors duration-300 ${
                  activeTab === tab.id
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-blue-500"
                }`}
              >
                {tab.icon}
              </div>
              {tab.label}

              {/* Active indicator */}
              <div
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-all duration-300 ${
                  activeTab === tab.id ? "scale-100" : "scale-0"
                }`}
              />

              {/* Hover effect */}
              <div
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-200 transition-all duration-300 ${
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
            {tabs.find((tab) => tab.id === activeTab)?.component}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              {activeTab === "news-details"
                ? "Fill in all required fields marked with *"
                : "Upload and manage news media files"}
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {editBlogsData ? "Editing Mode" : "Creation Mode"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBlogsModal;
