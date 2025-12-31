import React, { useState, useEffect } from "react";
import { apiCall } from "../../../../utils/apiCall";
import { X, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";

const accessOptions = ["create", "read", "update", "status-update", "delete"];

const AddPermissionModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [systemUsers, setSystemUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [openModules, setOpenModules] = useState([]);

  const fetchSystemUsers = async () => {
    const res = await apiCall("/system-user?limit=1000", "GET");
    setSystemUsers(res.data);
  };

  const fetchModules = async () => {
    const res = await apiCall("/modules", "GET");
    setModules(res.data);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSystemUsers();
      fetchModules();

      if (editData) {
        setSelectedUserId(editData.system_user_id);

        const formattedPermissions = editData.modules.map((m) => ({
          module_id: m.id,
          access_types:
            typeof m.access_type === "string" ? m.access_type.split(",") : [],
        }));

        setSelectedPermissions(formattedPermissions);
      } else {
        setSelectedUserId("");
        setSelectedPermissions([]);
      }

      setOpenModules([]);
    }
  }, [isOpen]);

  const handleCheckboxChange = (moduleId, type) => {
    setSelectedPermissions((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((p) => p.module_id === moduleId);

      if (index !== -1) {
        const existing = { ...updated[index] };

        if (existing.access_types.includes(type)) {
          existing.access_types = existing.access_types.filter(
            (a) => a !== type
          );
        } else {
          existing.access_types = [...existing.access_types, type];
        }

        if (existing.access_types.length === 0) {
          updated.splice(index, 1);
        } else {
          updated[index] = existing;
        }
      } else {
        updated.push({ module_id: moduleId, access_types: [type] });
      }

      return updated;
    });
  };

  const isChecked = (moduleId, type) => {
    const perm = selectedPermissions.find((p) => p.module_id === moduleId);
    return Array.isArray(perm?.access_types)
      ? perm.access_types.includes(type)
      : false;
  };

  const isModuleChecked = (moduleId) => {
    const perm = selectedPermissions.find((p) => p.module_id === moduleId);
    return Array.isArray(perm?.access_types) && perm.access_types.length > 0;
  };

  const toggleModuleAll = (e, moduleId) => {
    e.stopPropagation();
    const exists = isModuleChecked(moduleId);
    setSelectedPermissions((prev) =>
      exists
        ? prev.filter((p) => p.module_id !== moduleId)
        : [...prev, { module_id: moduleId, access_types: [...accessOptions] }]
    );
  };

  const toggleOpenModule = (moduleId) => {
    setOpenModules((prev) => {
      return prev.includes(moduleId) ? [] : [moduleId];
    });
  };

  const handleSave = async () => {
    if (!selectedUserId) return toast.error("Select a user");
    try {
      await apiCall("/user-permissions", "POST", {
        system_user_id: selectedUserId,
        permissions: selectedPermissions,
      });
      toast.success("Permissions saved successfully");
      onSuccess();
      setSelectedPermissions([]);
    } catch (err) {
      toast.error("Failed to save permissions");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-3">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Assign User Permissions
        </h2>

        {/* User Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select User</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-red-400 outline-none"
          >
            <option value="">-- Select User --</option>
            {systemUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
                {" - "}({" " + user.email + " "})
              </option>
            ))}
          </select>
        </div>

        {/* Module Cards */}
        {/* Module Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto custom-scroll">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="relative flex flex-col border border-gray-200 rounded-xl bg-gray-50 hover:shadow transition"
            >
              <div
                onClick={() => toggleOpenModule(mod.id)}
                className="flex justify-between items-center px-4 py-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isModuleChecked(mod.id)}
                    onClick={(e) => toggleModuleAll(e, mod.id)}
                    onChange={() => {}}
                    className="w-4 h-4 accent-red-500"
                  />
                  <span className="text-base font-semibold text-gray-800">
                    {mod.name}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    openModules.includes(mod.id) ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Dropdown section */}
              {openModules.includes(mod.id) && (
                <div
                  className="absolute top-full left-0 w-full z-10 bg-white border border-gray-200 rounded-b-xl shadow-xl p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col gap-2">
                    {accessOptions.map((opt) => (
                      <div
                        key={opt}
                        className="flex items-center gap-3 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked(mod.id, opt)}
                          onChange={() => handleCheckboxChange(mod.id, opt)}
                          className="w-4 h-4 accent-red-500"
                        />
                        <span className="capitalize">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="text-right mt-8">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white font-medium px-6 py-2.5 rounded-lg hover:brightness-110 transition"
          >
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPermissionModal;
