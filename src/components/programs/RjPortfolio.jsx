import React, { useState, useEffect } from "react";
import {
  BadgePlus,
  Search,
  Loader2,
  Edit2,
  Trash2,
  ScanEye,
} from "lucide-react";
import { apiCall } from "../../utils/apiCall";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import BreadCrumb from "../../components/BreadCrum";
import AddRjProfileModal from "./AddRjProfileModal";
import ViewRjProfileModal from "./ViewRjProfileModal";

const RjPortfolio = () => {
  const [showModal, setShowModal] = useState(false);
  const [editRjId, setEditRjId] = useState(null);
  const [selectedRj, setSelectedRj] = useState(null);
  const [rjs, setRjs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const pageSize = 20;

  const fetchRjProfiles = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/rj-profile/list?page=${currentPage}&limit=20&search=${searchQuery}`,
        "GET"
      );
      setRjs(response.data);
      setTotalRecords(response.pagination?.totalRecords);
    } catch (error) {
      console.error("Error fetching RJ profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRjProfiles();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleAddRj = () => {
    setEditRjId(null);
    setSelectedRj(null);
    setShowModal(true);
  };

  const handleEdit = (id) => {
    const rjToEdit = rjs.find((item) => item.id === id);
    setEditRjId(id);
    setSelectedRj(rjToEdit);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this RJ profile?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/rj-profile/delete/${id}`, "DELETE");
      toast.success("RJ profile deleted successfully");
      fetchRjProfiles();
    } catch (error) {
      toast.error("Failed to delete RJ profile");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (item) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    setLoading(true);
    try {
      await apiCall(`/rj-profile/update-status/${item.id}`, "PATCH", {
        status: newStatus,
      });
      fetchRjProfiles();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRj = (item) => {
    setSelectedRj(item);
    setIsViewModalOpen(true);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"RJ Portfolio Management"}
          paths={["RJs", "RJ Portfolio Management"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              RJ Portfolio Report
            </p>
            <button
              onClick={handleAddRj}
              className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
            >
              <BadgePlus size={16} />
              <span>Add RJ</span>
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
                placeholder="Search RJ..."
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
            <div className="overflow-x-auto mt-4 max-w-full">
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-4 border">SI</th>
                    <th className="py-2 px-4 border">Image</th>
                    <th className="py-2 px-4 border">Name</th>
                    <th className="py-2 px-4 border">Email</th>
                    <th className="py-2 px-4 border">Status</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rjs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No RJ profiles found.
                      </td>
                    </tr>
                  ) : (
                    rjs.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-2 px-4 border">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-2 px-4 border">
                          <img
                            src={`${
                              process.env.REACT_APP_API_BASE_URL
                            }/${item.image_url.replace(/\\/g, "/")}`}
                            alt={item.name}
                            className="w-20 h-20 object-cover border"
                          />
                        </td>
                        <td className="py-2 px-4 border">{item.name}</td>
                        <td className="py-2 px-4 border">{item.email}</td>
                        <td className="py-2 px-4 border">
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
                        <td className="py-2 px-4 border">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewRj(item)}
                              className="text-green-600 hover:text-green-800"
                              title="View"
                            >
                              <ScanEye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(item.id)}
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
        </div>

        {/* Modals */}
        <AddRjProfileModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editRjId={editRjId}
          editRjData={selectedRj}
          onSuccess={() => {
            fetchRjProfiles();
            setShowModal(false);
          }}
        />

        <ViewRjProfileModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          rjData={selectedRj}
        />
      </div>
    </div>
  );
};

export default RjPortfolio;
