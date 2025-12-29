import React, { useState, useEffect } from "react";
import BreadCrumb from "../../../../components/BreadCrum";
import { BadgePlus, Loader2, Edit2, Trash2 } from "lucide-react";
import { apiCall } from "../../../../utils/apiCall";
import { toast } from "react-toastify";
import AddModuleModal from "./AddModuleModal";

const Module = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModule, setEditModule] = useState(null);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const response = await apiCall(`/modules`, "GET");
      setModules(response.data);
    } catch (error) {
      toast.error("Failed to fetch modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleEdit = (module) => {
    setEditModule(module);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this module?")) return;
    setLoading(true);
    try {
      await apiCall(`/modules/${id}`, "DELETE");
      toast.success("Module deleted successfully");
      fetchModules();
    } catch (error) {
      toast.error("Failed to delete module");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = () => {
    setEditModule(null);
    setShowModal(true);
  };

  return (
    <div className="flex flex-1 overflow-hidden flex-col">
      <BreadCrumb
        title={"Module Management"}
        paths={["Settings", "User Permissions", "Modules"]}
      />

      <div className="mt-4 rounded-sm shadow-md md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto">
        <div className="flex flex-row justify-between items-center border-b border-dashed border-gray-300 pb-3">
          <p className="text-sm sm:text-lg font-semibold text-gray-800">
            Module List
          </p>
          <button
            onClick={handleAddModule}
            className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
          >
            <BadgePlus size={16} />
            <span>Add Module</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-red-500" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-sm ">
              <thead className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                <tr className="text-left">
                  <th className="py-3 px-4 border-b">SI</th>
                  <th className="py-3 px-4 border-b">Module Name</th>
                  <th className="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="py-6 px-4 border text-center text-gray-500 text-sm"
                    >
                      No modules found.
                    </td>
                  </tr>
                ) : (
                  modules.map((mod, index) => (
                    <tr key={mod.id}>
                      <td className="py-3 px-4 border-b">{index + 1}</td>
                      <td className="py-3 px-4 border-b">{mod.name}</td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(mod)}
                            className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-md"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(mod.id)}
                            className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-md"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddModuleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editModuleData={editModule}
        onSuccess={() => {
          fetchModules();
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default Module;
