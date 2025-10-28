import React, { useState } from "react";
import { X, Briefcase, FileText, User } from "lucide-react";
import UserDetailsTab from "./UserDetailsTab";
import PreviousEmploymentTab from "./PreviousEmploymentTab";
import DocumentsTab from "./DocumentsTab";

const AddSystemUserModal = ({ isOpen, onClose, editUserData, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("user");

  if (!isOpen) return null;

  const tabs = [
    { id: "user", label: "User Details", icon: <User size={16} /> },
    {
      id: "employment",
      label: "Previous Employment",
      icon: <Briefcase size={16} />,
    },
    { id: "documents", label: "Documents", icon: <FileText size={16} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b bg-gray-50 p-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {editUserData ? "Employee Details" : "Add Employee Details"}
          </h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? "border-b-2 border-red-500 text-red-600 bg-white"
                  : "text-gray-600 hover:text-red-500"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 bg-slate-100">
          {activeTab === "user" && (
            <UserDetailsTab
              onSuccess={onSuccess}
              onClose={onClose}
              editUserData={editUserData}
            />
          )}
          {activeTab === "employment" && (
            <PreviousEmploymentTab userId={editUserData?.id} />
          )}
          {activeTab === "documents" && (
            <DocumentsTab userId={editUserData?.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSystemUserModal;
