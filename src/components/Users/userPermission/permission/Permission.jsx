import React, { useState, useEffect } from "react";
import { BadgePlus, Loader2, Trash2, ScanEye } from "lucide-react";
import { apiCall } from "../../../../utils/apiCall";
import { toast } from "react-toastify";
import BreadCrumb from "../../../../components/BreadCrum";
import AddPermissionModal from "./AddPermissionModal";
import ViewPermissionModal from "./ViewPermissionModal";

const Permission = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await apiCall(`/user-permissions`, "GET");
      setPermissions(res.data);
    } catch (error) {
      toast.error("Failed to fetch permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleDelete = async (system_user_id) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this user's permissions?"
      )
    )
      return;
    try {
      await apiCall(`/user-permissions/${system_user_id}`, "DELETE");
      toast.success("Permissions cleared successfully");
      fetchPermissions();
    } catch (error) {
      toast.error("Failed to delete permissions");
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb
        title={"Permission Management"}
        paths={["System Users", "User Permissions"]}
      />

      <div className="mt-4 rounded-sm shadow-md px-4 py-3 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
          <p className="text-sm sm:text-lg font-semibold text-gray-800">
            Permissions List
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 flex gap-2 items-center hover:bg-red-600 transition duration-300"
          >
            <BadgePlus size={16} />
            <span>Add Permission</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-red-500" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-sm ">
              <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white">
                <tr className="text-left">
                  <th className="py-3 px-4 border-b">SI</th>
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b">Modules</th>
                  <th className="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-6 px-4 border text-center text-gray-500 text-sm"
                    >
                      No permissions found.
                    </td>
                  </tr>
                ) : (
                  permissions.map((item, index) => (
                    <tr key={item.system_user_id}>
                      <td className="py-3 px-4 border-b">{index + 1}</td>
                      <td className="py-3 px-4 border-b">
                        {item.systemUser.name}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {item.systemUser.email}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {item.modules.map((m) => m.name).join(", ")}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => {
                              setSelectedUser({
                                systemUser: item.systemUser,
                                modules: item.modules,
                              });
                              setShowViewModal(true);
                            }}
                            className="text-green-600 hover:text-green-800"
                          >
                            <ScanEye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.system_user_id)}
                            className="text-red-600 hover:text-red-800"
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

      <AddPermissionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchPermissions();
          setShowAddModal(false);
        }}
      />

      <ViewPermissionModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        permissionData={selectedUser}
      />
    </div>
  );
};

export default Permission;
