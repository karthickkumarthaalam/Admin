import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiCall } from "../../../../utils/apiCall";
import { toast } from "react-toastify";

const AddModuleModal = ({ isOpen, onClose, editModuleData, onSuccess }) => {
  const [moduleName, setModuleName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editModuleData) {
      setModuleName(editModuleData.name);
    } else {
      setModuleName("");
    }
  }, [editModuleData]);

  const handleSave = async () => {
    if (!moduleName.trim()) {
      toast.error("Module name is required");
      return;
    }

    setLoading(true);

    try {
      if (editModuleData) {
        await apiCall(`/modules/${editModuleData.id}`, "PUT", {
          name: moduleName,
        });
        toast.success("Module updated successfully");
      } else {
        await apiCall("/modules", "POST", { name: moduleName });
        toast.success("Module created successfully");
      }
      setModuleName("");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white w-full max-w-sm p-5 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {editModuleData ? "Edit Module" : "Add Module"}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Name
          </label>
          <input
            type="text"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter module name"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded text-white ${
              loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? "Saving..." : editModuleData ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModuleModal;
