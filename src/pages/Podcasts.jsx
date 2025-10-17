import React, { useState, useEffect } from "react";
import BreadCrumb from "../components/BreadCrum";
import {
  BadgePlus,
  Search,
  Loader2,
  Edit2,
  Trash2,
  ScanEye,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import AddPodcastModal from "../components/podcasts/AddPodcastModal";
import ViewPodcastModal from "../components/podcasts/ViewPodcastModal";
import { usePermission } from "../context/PermissionContext";

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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { hasPermission } = usePermission();

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
      fetchPodcasts();
      setCurrentPage(1);
      toast.success("Podcast deleted successfully");
    } catch (error) {
      toast.error("Failed to delete podcast");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (item) => {
    if (
      !window.confirm(
        "Are you sure you want to change the status of this podcast?"
      )
    )
      return;
    const newStatus = item.status === "active" ? "inactive" : "active";
    setLoading(true);
    try {
      await apiCall(`/podcasts/status/${item.id}`, "PATCH", {
        status: newStatus,
      });
      fetchPodcasts();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPodcast = () => {
    setEditPodcastId(null);
    setSelectedPodcast(null);
    setShowModal(true);
  };

  const handleViewPodcast = (item) => {
    setIsViewModalOpen(true);
    setSelectedPodcast(item);
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
          <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Podcast Report
            </p>
            {hasPermission("Podcast", "create") && (
              <button
                onClick={handleAddPodcast}
                className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
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
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm ">
                <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 borde-b">SI</th>
                    <th className="py-3 px-4 borde-b">Title</th>
                    <th className="py-3 px-4 borde-b whitespace-nowrap">
                      Published By
                    </th>
                    <th className="py-3 px-4 borde-b whitespace-nowrap">
                      Content Creater
                    </th>
                    <th className="py-3 px-4 borde-b whitespace-nowrap">
                      Published Date
                    </th>
                    <th className="py-3 px-4 borde-b whitespace-nowrap">
                      Audio Duration
                    </th>
                    <th className="py-3 px-4 borde-b">Status</th>
                    <th className="py-3 px-4 borde-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {podcasts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No podcasts found.
                      </td>
                    </tr>
                  ) : (
                    podcasts.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-4 border-b">{item.title}</td>
                        <td className="py-3 px-4 border-b">{item.rjname}</td>
                        <td className="py-3 px-4 border-b">{item.content}</td>
                        <td className="py-3 px-4 border-b">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 border-b">{item.duration}</td>
                        <td className="py-3 px-4 border-b">
                          <span
                            onClick={() => handleStatusToggle(item)}
                            className={`cursor-pointer px-2 py-1 text-xs rounded font-semibold ${
                              item.status === "active"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewPodcast(item)}
                              className="text-green-600 hover:text-green-800"
                              title="View"
                            >
                              <ScanEye size={16} />
                            </button>
                            {hasPermission("Podcast", "update") && (
                              <button
                                onClick={() => handleEdit(item.id)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {hasPermission("Podcast", "delete") && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800"
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
          onSuccess={() => {
            fetchPodcasts();
            setShowModal(false);
          }}
        />

        <ViewPodcastModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          podcastData={selectedPodcast}
        />
      </div>
    </div>
  );
};

export default Podcasts;
