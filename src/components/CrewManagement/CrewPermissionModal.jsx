import React, { useEffect, useState } from "react";
import { apiCall } from "../../utils/apiCall";
import { toast } from "react-toastify";
import { Loader2, X } from "lucide-react";

const CrewPermissionModal = ({ isOpen, onClose, crew }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [permission, setPermission] = useState({
    can_manage_flight: false,
    can_manage_rooms: false,
    can_manage_visa: false,
  });

  const [existingPermissions, setExistingPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && crew?.id) {
      fetchUsers();
      fetchPermissions();
    }
  }, [isOpen, crew?.id]);

  // ================= GET USERS =================
  const fetchUsers = async () => {
    try {
      const res = await apiCall("/system-user?status=active");
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to load users");
    }
  };

  // ================= GET EXISTING PERMISSIONS =================
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await apiCall(`/crew-permissions/${crew.id}`);
      setExistingPermissions(res.data || []);
    } catch {
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  // ================= USER SELECT =================
  const handleUserChange = (userId) => {
    setSelectedUser(userId);

    const found = existingPermissions.find(
      (p) => p.system_user_id === Number(userId),
    );

    setPermission({
      can_manage_flight: found?.can_manage_flight || false,
      can_manage_rooms: found?.can_manage_rooms || false,
      can_manage_visa: found?.can_manage_visa || false,
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!selectedUser) {
      toast.error("Select user");
      return;
    }

    try {
      await apiCall("/crew-permissions/assign", "POST", {
        crew_management_id: crew.id,
        system_user_id: selectedUser,
        can_manage_flight: permission.can_manage_flight,
        can_manage_rooms: permission.can_manage_rooms,
        can_manage_visa: permission.can_manage_visa,
      });

      toast.success("Permission saved");
      fetchPermissions();
      setSelectedUser("");
      setPermission({
        can_manage_flight: false,
        can_manage_rooms: false,
        can_manage_visa: false,
      });
    } catch {
      toast.error("Failed to save permission");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]">
      <div className="bg-white w-full max-w-3xl  shadow-xl border border-gray-200 rounded-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-100 rounded-t-xl">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Crew Permission Management
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{crew?.title}</p>
          </div>

          <X
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-red-500"
          />
        </div>

        <div className="p-6 space-y-6">
          {/* USER SELECT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select User
            </label>

            <select
              value={selectedUser}
              onChange={(e) => handleUserChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select system user</option>
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* PERMISSIONS */}
          {selectedUser && (
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Module Permissions
              </h3>

              <div className="flex flex-col  gap-5">
                {/* Flight */}
                <div className="flex items-center justify-between gap-3 border-b border-dashed border-gray-300 pb-3">
                  <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                    Flight Management
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permission.can_manage_flight}
                      onChange={() =>
                        setPermission((p) => ({
                          ...p,
                          can_manage_flight: !p.can_manage_flight,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                    <div className="absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                  </label>
                </div>

                {/* Room */}
                <div className="flex items-center justify-between gap-3 border-b border-dashed border-gray-300 pb-3">
                  <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                    Room Management
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permission.can_manage_rooms}
                      onChange={() =>
                        setPermission((p) => ({
                          ...p,
                          can_manage_rooms: !p.can_manage_rooms,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 transition"></div>
                    <div className="absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                    Visa Management
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permission.can_manage_visa}
                      onChange={() =>
                        setPermission((p) => ({
                          ...p,
                          can_manage_visa: !p.can_manage_visa,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 transition"></div>
                    <div className="absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SAVE */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white 
            text-sm font-medium rounded-md shadow-sm transition"
            >
              Save Permission
            </button>
          </div>

          {/* ASSIGNED USERS TABLE */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Assigned Permissions
            </h3>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : existingPermissions.length === 0 ? (
              <div className="text-sm text-gray-400 border rounded-md py-6 text-center">
                No permissions assigned
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700 text-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2">User</th>
                      <th className="text-center px-4 py-2">Flight</th>
                      <th className="text-center px-4 py-2">Room</th>
                      <th className="text-center px-4 py-2">Visa</th>
                    </tr>
                  </thead>

                  <tbody>
                    {existingPermissions.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-4 py-2 font-medium text-gray-800">
                          {p.user?.name}
                        </td>

                        <td className="px-4 py-2 text-center">
                          {p.can_manage_flight ? (
                            <span className="text-green-600 font-semibold">
                              Yes
                            </span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>

                        <td className="px-4 py-2 text-center">
                          {p.can_manage_rooms ? (
                            <span className="text-green-600 font-semibold">
                              Yes
                            </span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {p.can_manage_visa ? (
                            <span className="text-green-600 font-semibold">
                              Yes
                            </span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewPermissionModal;
