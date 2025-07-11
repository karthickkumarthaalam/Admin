import React, { useState, useEffect } from "react";
import { apiCall } from "../../../utils/apiCall";
import { Loader2, Eye, EyeOff, Edit2, Trash2, BadgePlus } from "lucide-react";
import BreadCrumb from "../../BreadCrum";
import { toast } from "react-toastify";
import AddPasswordModal from "./AddPasswordModal";
import UpdatePasswordManagerModal from "./UpdatePasswordManagerModal";

const PasswordManager = () => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editPasswordId, setEditPasswordId] = useState(null);
  const [selectedPassword, setSelectedPassword] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);

  const pageSize = 20;

  const fetchPasswords = async () => {
    setLoading(true);
    try {
      const res = await apiCall(
        `/passwords?page=${currentPage}&limit=${pageSize}`,
        "GET"
      );
      setPasswords(res.data);
      setTotalRecords(res.pagination.totalRecords);
    } catch (err) {
      console.error("Fetch Passwords Error:", err);
      toast.error("Failed to fetch passwords");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, [currentPage]);

  const handleTogglePassword = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this password entry?")) return;
    setLoading(true);
    try {
      await apiCall(`/passwords/${id}`, "DELETE");
      toast.success("Password entry deleted");
      fetchPasswords();
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPassword = () => {
    setEditPasswordId(null);
    setSelectedPassword(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditPasswordId(item.id);
    setSelectedPassword(item);
    setShowModal(true);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Password Manager"}
          paths={["Admin", "Password Manager"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex flex-row justify-between items-center border-b border-dashed border-gray-300 pb-3">
            <p className="text-lg font-semibold text-gray-800">Passwords</p>

            <button
              onClick={handleAddPassword}
              className="rounded-md bg-red-500 font-medium text-sm text-white px-3 py-2 flex gap-2 items-center hover:bg-red-600 transition"
            >
              <BadgePlus size={16} />
              Add Password
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto mt-4 max-w-full">
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-4 border">SI</th>
                    <th className="py-2 px-4 border">Service Name</th>
                    <th className="py-2 px-4 border">Username / Email</th>
                    <th className="py-2 px-4 border">URL</th>
                    <th className="py-2 px-4 border">Password</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passwords.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No passwords found.
                      </td>
                    </tr>
                  ) : (
                    passwords.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-2 px-4 border">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-2 px-4 border">
                          {item.service_name || "-"}
                        </td>
                        <td className="py-2 px-4 border">{item.username}</td>
                        <td className="py-2 px-4 border">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {item.url}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-2 px-4 border">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {visiblePasswords[item.id]
                                ? item.password
                                : "••••••••"}
                            </span>
                            <button
                              onClick={() => handleTogglePassword(item.id)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              {visiblePasswords[item.id] ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-4 border">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800"
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
          <div className="relative">
            <button
              onClick={() => setShowUpdatePasswordModal(true)}
              className="absolute right-0 px-4 py-2 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition mt-4"
            >
              Change Access Password
            </button>
          </div>
        </div>

        {/* Modal */}
        <AddPasswordModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editPasswordId={editPasswordId}
          editPasswordData={selectedPassword}
          onSuccess={() => {
            fetchPasswords();
            setShowModal(false);
          }}
        />

        <UpdatePasswordManagerModal
          isOpen={showUpdatePasswordModal}
          onClose={() => setShowUpdatePasswordModal(false)}
        />
      </div>
    </div>
  );
};

export default PasswordManager;
