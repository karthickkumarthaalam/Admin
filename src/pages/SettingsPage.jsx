import React, { useState } from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import CopyrightFooter from "../components/CopyRightsComponent";
import ResetPassword from "./ResetPassword";
import PasswordManager from "../components/settings/passwordManager/PasswordManager";
import VerifyPasswordModal from "../components/settings/passwordManager/VerifyPasswordModal";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("reset-password");
  const [showOtpModal, setShowOtpModal] = useState(false);

  const tabs = [
    { id: "reset-password", label: "Reset Password" },
    { id: "password-manager", label: "Password Manager" },
  ];

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="p-4 shadow-lg border-t border-dashed border-gray-200">
              <div className="flex flex-1 gap-2">
                {tabs.map((tab) => {
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
                          : "hover:bg-gray-100 text-gray-700"
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

          <CopyrightFooter />
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
    </div>
  );
};

export default SettingsPage;
