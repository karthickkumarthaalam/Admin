import React from "react";
import { X, ShieldCheck } from "lucide-react";

const accessOptions = ["create", "read", "update", "delete"];

const ViewPermissionModal = ({ isOpen, onClose, permissionData }) => {
  if (!isOpen || !permissionData) return null;

  const { systemUser, modules } = permissionData;

  const getAccessTypesForModule = (mod) => {
    if (!mod.access_type) return [];
    return mod.access_type.split(",").map((t) => t.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-3">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          User Permissions
        </h2>

        <div className="mb-5 border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center gap-3">
          <ShieldCheck className="text-red-500" size={20} />
          <div>
            <p className="text-sm text-gray-600">System User</p>
            <h4 className="font-semibold text-lg text-gray-800">
              {systemUser?.name || systemUser?.email}
            </h4>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {modules.map((mod) => {
            const accessTypes = getAccessTypesForModule(mod);
            return (
              <div
                key={mod.id}
                className="flex flex-col border border-gray-200 rounded-xl w-full sm:basis-[calc(50%-0.5rem)] bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50 rounded-t-lg">
                  <span className="text-base font-semibold text-gray-800">
                    {mod.name}
                  </span>
                </div>

                <div className="px-4 py-3 flex flex-wrap gap-2">
                  {accessOptions.map((opt) => (
                    <span
                      key={opt}
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        accessTypes.includes(opt)
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-right mt-8">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPermissionModal;
