import React, { useState } from "react";
import { User, Briefcase, FileText, X } from "lucide-react";
import PreviousEmploymentTab from "../../Users/users/PreviousEmploymentTab";
import DocumentsTab from "../../Users/users/DocumentsTab";
import UserDetailsTab from "./UserDetailsTab";

const AccountSettingsModal = ({ isOpen, onClose, userData }) => {
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full overflow-hidden flex flex-col">
        <div className="flex justify-between items-center border-b bg-gray-50 p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Account Settings
          </h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b bg-gray-50 overflow-x-auto md:px-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                    : "text-gray-600 hover:text-blue-500"
                }
                `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
          {activeTab === "user" && (
            <UserDetailsTab onSuccess={onClose} userId={userData.id} />
          )}
          {activeTab === "employment" && (
            <PreviousEmploymentTab userId={userData.id} idType={"user"} />
          )}
          {activeTab === "documents" && (
            <DocumentsTab userId={userData.id} idType={"user"} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
