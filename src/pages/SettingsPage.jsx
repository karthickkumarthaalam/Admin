import React, { useState } from "react";
import ResetPassword from "./ResetPassword";
import PasswordManager from "../components/settings/passwordManager/PasswordManager";
import VerifyPasswordModal from "../components/settings/passwordManager/VerifyPasswordModal";
import { usePermission } from "../context/PermissionContext";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("reset-password");
  const [showOtpModal, setShowOtpModal] = useState(false);

  const { hasPermission } = usePermission();

  const tabs = [
    { id: "reset-password", label: "Reset Password" },
    { id: "password-manager", label: "Password Manager" },
  ];

  const canAccessTab = (tab) => {
    if (tab.id === "password-manager") {
      return hasPermission("Password Manager", "read");
    }

    return true;
  };
  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="p-4 border-t border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
            {tabs
              .filter((tab) => canAccessTab(tab))
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "password-manager") {
                      if (
                        sessionStorage.getItem(
                          "passwordManagerAccessGranted"
                        ) === "true"
                      ) {
                        setActiveTab("password-manager");
                      } else {
                        setShowOtpModal(true);
                      }
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`relative px-4 py-2 text-sm font-semibold rounded transition-colors duration-200 whitespace-nowrap focus:outline-none ${
                    activeTab === tab.id
                      ? "text-gray-900 border-b-2 border-red-500 rounded-sm"
                      : "text-gray-600 hover:text-gray-800 border-b-2 border-transparent"
                  }`}
                >
                  {tab.label}

                  {/* Subtle underline for active tab */}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 rounded-full"></span>
                  )}
                </button>
              ))}
          </div>
        </div>

        <div className="flex-1 p-1 overflow-y-auto bg-gray-50">
          {activeTab === "reset-password" && <ResetPassword />}
          {activeTab === "password-manager" && <PasswordManager />}
        </div>
      </div>

      <VerifyPasswordModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={() => {
          setShowOtpModal(false);
          setActiveTab("password-manager");
        }}
      />
    </>
  );
};

export default SettingsPage;
