import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import debounce from "lodash.debounce";
import BreadCrumb from "../../BreadCrum";
import {
  BadgePlus,
  Loader2,
  Pencil,
  Trash2,
  FileText,
  Search,
  EyeOff,
  Eye,
} from "lucide-react";
import { AddExperience } from "./AddExperience";
import ViewExperienceModal from "./ViewExperienceModal";
import { usePermission } from "../../../context/PermissionContext";
import { useAuth } from "../../../context/AuthContext";

const ExperiencePage = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editExperienceData, setEditExperienceData] = useState(null);
  const [viewExperienceData, setViewExperienceData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showDeleted, setShowDeleted] = useState(false);

  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const pageSize = 50;

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/experience-letter?page=${currentPage}&limit=${pageSize}&search=${searchQuery}&show_deleted=${showDeleted}`,
        "GET"
      );
      setExperiences(response.data || []);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch experiences");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  useEffect(() => {
    fetchExperiences();
  }, [currentPage, searchQuery, showDeleted]);

  const handleAddExperience = () => {
    setEditExperienceData(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditExperienceData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    setLoading(true);
    try {
      await apiCall(`/experience-letter/${id}`, "DELETE");
      toast.success("Experience deleted successfully");
      fetchExperiences();
    } catch (error) {
      toast.error("Failed to delete experience");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Are you sure you want to restore this payslip"))
      return;
    setLoading(true);
    try {
      await apiCall(`/experience-letter/${id}/restore`, "PATCH");
      toast.success("Experience letter restored successfully");
      fetchExperiences();
    } catch (error) {
      toast.error("Failed to restore Experience");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const isDeleted = (experiences) => experiences.deletedAt !== null;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb title="Experience Management" paths={["Experience"]} />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800 whitespace-nowrap">
              Experience List
            </p>
            <div className="flex items-center gap-4">
              {user.role === "admin" && (
                <button
                  onClick={() => setShowDeleted(!showDeleted)}
                  className={`whitespace-nowrap flex items-center gap-1 px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 shadow-md ${
                    showDeleted
                      ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {" "}
                  {showDeleted ? (
                    <>
                      <EyeOff size={16} />
                      <span>Hide Deleted</span>
                    </>
                  ) : (
                    <>
                      <Eye size={16} />
                      <span>Show Deleted</span>
                    </>
                  )}
                </button>
              )}
              {hasPermission("Experience Letter", "create") && !showDeleted && (
                <button
                  onClick={handleAddExperience}
                  className="whitespace-nowrap flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
                >
                  <BadgePlus size={16} />
                  <span>Add Experience</span>
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="flex justify-end mt-4 gap-2">
            <div className="relative w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Experience"
                onChange={(e) => handleSearch(e.target.value)}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Info Message */}
          {showDeleted && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <EyeOff size={16} />
                Showing deleted Experience letters only. Deleted Experience
                letters can only be viewed.
              </p>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 size={32} className="text-red-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">#</th>
                    <th className="px-5 py-3 text-left font-semibold">
                      Employee
                    </th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">
                      Employee ID
                    </th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">
                      Joining Date
                    </th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">
                      Relieving Date
                    </th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">
                      Employment Type
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-5 py-3 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {experiences.length > 0 ? (
                    experiences.map((item, index) => {
                      const deleted = isDeleted(item);
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-gray-50 transition-colors duration-200 ${
                            deleted
                              ? "bg-red-50/50"
                              : index % 2 === 0
                              ? "bg-gray-50/50"
                              : "bg-white"
                          }`}
                        >
                          <td className="px-5 py-3">{index + 1}</td>
                          <td className="px-5 py-3 font-semibold text-gray-900">
                            {item.user?.name || "N/A"}
                          </td>
                          <td className="px-5 py-3">{item.user.employee_id}</td>
                          <td className="px-5 py-3">
                            {new Date(item.joining_date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-5 py-3">
                            {new Date(item.relieving_date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-5 py-3">{item.employment_type}</td>
                          <td className="px-5 py-3">
                            {deleted ? (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Deleted
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-center flex justify-center gap-2">
                            {deleted ? (
                              <>
                                <button
                                  onClick={() => setViewExperienceData(item)}
                                  className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                                  title="View"
                                >
                                  <FileText size={16} />
                                </button>
                                {hasPermission("PaySlip", "delete") && (
                                  <>
                                    <button
                                      onClick={() => handleRestore(item.id)}
                                      className="p-2 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition"
                                      title="Restore"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                        <path d="M3 3v5h5" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {hasPermission(
                                  "Experience Letter",
                                  "update"
                                ) && (
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                                    title="Edit"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                )}
                                {hasPermission(
                                  "Experience Letter",
                                  "delete"
                                ) && (
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => setViewExperienceData(item)}
                                  className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                                  title="View"
                                >
                                  <FileText size={16} />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center text-gray-500 py-8"
                      >
                        No Experience records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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

        {/* Add/Edit Modal */}
        <AddExperience
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editExperienceData={editExperienceData}
          onSuccess={() => {
            fetchExperiences();
            setShowModal(false);
          }}
        />

        {/* View Modal */}
        <ViewExperienceModal
          isOpen={!!viewExperienceData}
          onClose={() => setViewExperienceData(null)}
          experience={viewExperienceData}
        />
      </div>
    </div>
  );
};

export default ExperiencePage;
