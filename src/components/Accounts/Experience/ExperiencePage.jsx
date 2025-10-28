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
} from "lucide-react";
import { AddExperience } from "./AddExperience";
import ViewExperienceModal from "./ViewExperienceModal";
import { usePermission } from "../../../context/PermissionContext";

const ExperiencePage = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editExperienceData, setEditExperienceData] = useState(null);
  const [viewExperienceData, setViewExperienceData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const { hasPermission } = usePermission();
  const pageSize = 50;

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/experience-letter?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`,
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
  }, [currentPage, searchQuery]);

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

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb title="Experience Management" paths={["Experience"]} />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Experience List
            </p>
            {hasPermission("Experience Letter", "create") && (
              <button
                onClick={handleAddExperience}
                className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
              >
                <BadgePlus size={16} />
                <span>Add Experience</span>
              </button>
            )}
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

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 size={32} className="text-red-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white sticky top-0 z-10">
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
                    <th className="px-5 py-3 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {experiences.length > 0 ? (
                    experiences.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
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
                        <td className="px-5 py-3 text-center flex justify-center gap-2">
                          {hasPermission("Experience Letter", "update") && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {hasPermission("Experience Letter", "delete") && (
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
                        </td>
                      </tr>
                    ))
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
