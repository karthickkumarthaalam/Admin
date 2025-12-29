import React, { useState, useEffect } from "react";
import BreadCrumb from "../components/BreadCrum";
import {
  BadgePlus,
  Search,
  Loader2,
  Trash2,
  Edit,
  Calendar,
  Clock,
  User2,
  UserCircle,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import AddPodcastModal from "../components/podcasts/addPodcast/AddPodcastModal";
import { usePermission } from "../context/PermissionContext";
import { useAuth } from "../context/AuthContext";

const Podcasts = () => {
  const [showModal, setShowModal] = useState(false);
  const [editPodcastId, setEditPodcastId] = useState(null);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [languageFilter, setLanguageFilter] = useState("");

  const { hasPermission } = usePermission();
  const { user } = useAuth();

  const pageSize = 20;

  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/podcasts/admin?page=${currentPage}&search=${searchQuery}&language=${languageFilter}&limit=${pageSize}`,
        "GET"
      );
      setPodcasts(response.data?.data);
      setTotalRecords(response.data?.pagination.totalRecords);
    } catch (error) {
      console.error("Error fetching podcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, [currentPage, searchQuery, languageFilter]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleEdit = (id) => {
    const podcastToEdit = podcasts.find((item) => item.id === id);
    setEditPodcastId(id);
    setSelectedPodcast(podcastToEdit);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this podcast?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/podcasts/delete/${id}`, "DELETE");
      setPodcasts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Podcast deleted successfully");
    } catch (error) {
      toast.error("Failed to delete podcast");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (
      !window.confirm(
        "Are you sure you want to update status of this podcasts?"
      )
    )
      return;
    setLoading(true);
    try {
      await apiCall(`/podcasts/status/${id}`, "PATCH", { status });
      toast.success("Status updated successfully");
      setPodcasts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status,
                status_updated_by: user.name,
                status_updated_at: new Date(),
              }
            : p
        )
      );
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPodcast = () => {
    setEditPodcastId(null);
    setSelectedPodcast(null);
    setShowModal(true);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Podcast Management"}
          paths={["Podcasts", "Podcast Management"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex flex-row justify-between md:justify-end items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className=" md:hidden text-sm sm:text-lg font-semibold text-gray-800">
              Podcast Management
            </p>
            {hasPermission("Podcast", "create") && (
              <button
                onClick={handleAddPodcast}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
              >
                <BadgePlus size={16} />
                <span>Add Podcast</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-4 gap-2 md:gap-4">
            <div className="w-48">
              <select
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
              >
                <option value="">All Languages</option>
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
            <div className="relative w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search podcasts..."
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
            <div className="overflow-x-auto mt-4 max-w-full border border-gray-200 rounded-xl shadow-sm bg-white">
              <table className="w-full text-sm sm:text-base">
                {/* TABLE HEAD */}
                <thead className="bg-gray-700 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-3 sm:px-4">SI</th>
                    <th className="py-3 px-3 sm:px-4">Title</th>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      Contributors
                    </th>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      Published
                    </th>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      Status
                    </th>
                    <th className="py-3 px-3 sm:px-4">Actions</th>
                  </tr>
                </thead>

                {/* TABLE BODY */}
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-16">
                        <Loader2 size={28} className="mx-auto animate-spin" />
                        <p className="mt-2 text-gray-500 font-medium text-sm">
                          Loading podcasts...
                        </p>
                      </td>
                    </tr>
                  ) : podcasts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-14 text-gray-500 italic text-sm"
                      >
                        No podcasts found
                      </td>
                    </tr>
                  ) : (
                    podcasts.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition active:bg-gray-100"
                      >
                        {/* SI */}
                        <td className="py-3 px-3 sm:px-4 text-gray-700 font-semibold">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        {/* TITLE + OPTIONAL CATEGORY */}
                        <td className="py-3 px-3 sm:px-4 font-bold text-slate-700">
                          {item.title}
                          {item.category?.name && (
                            <p className="text-xs text-gray-500 mt-0.5 font-medium">
                              {item.category.name}
                            </p>
                          )}
                        </td>
                        {/* CONTRIBUTORS */}
                        <td className="py-3 px-3 sm:px-4 text-gray-600">
                          <div className="space-y-1.5 text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-500">
                                Published By:
                              </span>
                              <span className="text-indigo-600 font-bold">
                                {item.rjname}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-500">
                                Content Creator:
                              </span>
                              <span className="text-indigo-600 font-bold">
                                {item.content}
                              </span>
                            </div>
                          </div>
                        </td>
                        {/* PUBLISHED DETAILS */}
                        <td className="py-3 px-3 sm:px-4">
                          <div className="space-y-1.5 text-xs sm:text-sm text-gray-700 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} />
                              <span className="whitespace-nowrap">
                                {new Date(item.date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Clock size={13} />
                              <span>{item.duration} Min</span>
                            </div>
                          </div>
                        </td>
                        {/* ADMIN STATUS BOX */}
                        <td className="py-3 px-4 border-b">
                          <div className="flex flex-col gap-2">
                            {/* ✅ Status Pill Dropdown */}
                            {user.role === "admin" && (
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  updateStatus(item.id, e.target.value)
                                }
                                className={`font-semibold px-2 py-0.5 rounded-full text-xs border transition-all focus:ring-2 ${
                                  item.status === "approved"
                                    ? "bg-green-100 text-green-800 border-green-200 focus:ring-green-300"
                                    : item.status === "reviewing"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200 focus:ring-yellow-300"
                                    : "bg-blue-100 text-blue-800 border-blue-200 focus:ring-blue-300"
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="reviewing">Reviewing</option>
                                <option value="approved">Approved</option>
                              </select>
                            )}
                            {item.status === "pending" && (
                              <div className="px-2 py-1.5 rounded-lg bg-blue-50/50 border border-blue-200">
                                <p className="text-xs font-semibold text-blue-500 whitespace-nowrap">
                                  Status Update{" "}
                                  <span className="text-blue-900 ">
                                    Pending
                                  </span>
                                </p>
                              </div>
                            )}

                            {/* ✅ Reviewer Label */}
                            {item.status === "reviewing" && (
                              <div className="px-2 py-1.5 rounded-lg bg-yellow-50/50 border border-yellow-200">
                                <p className="text-xs font-semibold text-yellow-700 whitespace-nowrap">
                                  In Review by{" "}
                                  <span className="text-yellow-900">
                                    {item.status_updated_by || "Admin"}
                                  </span>
                                </p>
                                {item.status_updated_at && (
                                  <p className="text-[10px] text-yellow-900 font-medium mt-0.5">
                                    {new Date(
                                      item.status_updated_at
                                    ).toLocaleString("en-IN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      day: "2-digit",
                                      month: "short",
                                    })}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* ✅ Approved Label */}
                            {item.status === "approved" && (
                              <div className="px-2 py-1.5 rounded-lg bg-green-50/50 border border-green-200">
                                <p className="text-xs font-semibold text-green-700 whitespace-nowrap">
                                  Approved by{" "}
                                  <span className="text-green-900">
                                    {item.status_updated_by || "Admin"}
                                  </span>
                                </p>
                                {item.status_updated_at && (
                                  <p className="text-[10px] text-green-900 font-medium mt-0.5">
                                    {new Date(
                                      item.status_updated_at
                                    ).toLocaleString("en-IN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      day: "2-digit",
                                      month: "short",
                                    })}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 border-b">
                          <div className="flex items-center gap-3">
                            {hasPermission("Podcast", "update") && (
                              <button
                                onClick={() => handleEdit(item.id)}
                                className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 hover:bg-blue-100 rounded-md hover:scale-105"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {hasPermission("Podcast", "delete") && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800 p-2 bg-red-50 hover:bg-red-100 rounded-md hover:scale-105"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
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

        {/* Modals */}
        <AddPodcastModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editPodcastId={editPodcastId}
          editPodcastData={selectedPodcast}
          setEditPodcastData={setSelectedPodcast}
          onSuccess={() => {
            fetchPodcasts();
            setShowModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default Podcasts;
