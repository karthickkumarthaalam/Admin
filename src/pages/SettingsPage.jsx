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
        <div className="p-4 shadow-lg border-t border-dashed border-gray-200">
          <div className="flex flex-1 gap-2">
            {tabs
              .filter((tab) => canAccessTab(tab))
              .map((tab) => {
                return (
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
