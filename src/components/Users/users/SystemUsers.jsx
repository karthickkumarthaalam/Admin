import React, { useState, useEffect } from "react";
import {
  BadgePlus,
  Search,
  Loader2,
  Edit2,
  Trash2,
  ScanEye,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import BreadCrumb from "../../../components/BreadCrum";
import AddSystemUserModal from "./AddSystemUserModal";
import ViewSystemUserModal from "./ViewSystemUserModal";

const SystemUsers = () => {
  const [showModal, setShowModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [systemUsers, setSystemUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showUserModal, setShowUserModal] = useState(false);

  const pageSize = 20;

  const fetchSystemUsers = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/system-user?page=${currentPage}&limit=20&search=${searchQuery}`,
        "GET"
      );
      setSystemUsers(response.data);
      setTotalRecords(response.pagination?.totalRecords);
    } catch (error) {
      console.error("Error fetching system users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemUsers();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleAddUser = () => {
    setEditUserId(null);
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (id) => {
    const userToEdit = systemUsers.find((item) => item.id === id);
    setEditUserId(id);
    setSelectedUser(userToEdit);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this system user?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/system-user/${id}`, "DELETE");
      toast.success("System user deleted successfully");
      fetchSystemUsers();
    } catch (error) {
      toast.error("Failed to delete system user");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (item) => {
    if (
      !window.confirm(
        "Are you sure you want to Change Status of this system user?"
      )
    )
      return;
    const newStatus = item.status === "active" ? "inactive" : "active";
    setLoading(true);
    try {
      await apiCall(`/system-user/${item.id}/status`, "PATCH", {
        status: newStatus,
      });
      fetchSystemUsers();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"System Users Management"}
          paths={["System Users", "System Users Management"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              System Users Report
            </p>
            <button
              onClick={handleAddUser}
              className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
            >
              <BadgePlus size={16} />
              <span>Add System User</span>
            </button>
          </div>

          <div className="flex justify-end mt-4">
            <div className="relative w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search System User..."
                onChange={(e) => handleSearch(e.target.value)}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          ) : (
            <div className="mt-6 w-full overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg shadow-sm bg-white text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-900 text-left text-xs uppercase tracking-wide">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b min-w-[120px] text-center">
                      Profile
                    </th>
                    <th className="py-3 px-4 border-b">Name</th>
                    <th className="py-3 px-4 border-b text-center whitespace-nowrap">
                      Employee ID
                    </th>
                    <th className="py-3 px-4 border-b">Email</th>
                    <th className="py-3 px-4 border-b">Department</th>
                    <th className="py-3 px-4 border-b text-center">Status</th>
                    <th className="py-3 px-4 border-b text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {systemUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="py-8 px-4 text-center text-gray-500 text-sm"
                      >
                        No system users found.
                      </td>
                    </tr>
                  ) : (
                    systemUsers.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-3 px-4 border-b text-gray-600">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>

                        {/* Profile Image */}
                        <td className="py-3 px-4 border-b">
                          <div className="flex justify-center">
                            <img
                              src={`${
                                process.env.REACT_APP_API_BASE_URL
                              }/${item.image_url?.replace(/\\/g, "/")}`}
                              alt={item.name}
                              className="w-16 h-16 object-fit rounded-lg border border-gray-200 shadow-sm"
                            />
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4 border-b font-medium text-gray-800">
                          {item.name}
                        </td>

                        {/* Employee ID */}
                        <td className="py-3 px-4 border-b text-center text-gray-700">
                          {item.employee_id || "-"}
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 border-b text-gray-600">
                          {item.email}
                        </td>

                        {/* Department */}
                        <td className="py-3 px-4 border-b text-gray-700">
                          {item.department?.department_name || "-"}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 border-b text-center">
                          <span
                            onClick={() => handleStatusToggle(item)}
                            className={`cursor-pointer px-3 py-1 text-xs rounded-full font-medium transition-all ${
                              item.status === "active"
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-red-100 text-red-700 border border-red-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 border-b">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedUser(item);
                                setShowUserModal(true);
                              }}
                              className="text-gray-600 hover:text-green-600 transition"
                              title="View"
                            >
                              <ScanEye size={16} />
                            </button>

                            <button
                              onClick={() => handleEdit(item.id)}
                              className="text-gray-600 hover:text-blue-600 transition"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-gray-600 hover:text-red-600 transition"
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-sm px-3 py-1.5 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="text-sm px-3 py-1.5 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <ViewSystemUserModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          userData={selectedUser}
        />
        {/* Add/Edit Modal */}
        <AddSystemUserModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editUserId={editUserId}
          editUserData={selectedUser}
          onSuccess={() => {
            fetchSystemUsers();
            setShowModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default SystemUsers;
