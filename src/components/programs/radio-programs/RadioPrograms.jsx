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
import AddRadioProgramModal from "./AddRadioProgramModal";
import ViewRadioProgramModal from "./ViewRadioProgramModal";

const RadioPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editProgramId, setEditProgramId] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programId, setProgramId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const pageSize = 20;

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/radio-program?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`,
        "GET"
      );
      setPrograms(response.data);
      setTotalRecords(response.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch Radio Programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleAddProgram = () => {
    setEditProgramId(null);
    setSelectedProgram(null);
    setShowModal(true);
  };

  const handleEdit = (id) => {
    const programToEdit = programs.find((item) => item.id === id);
    setEditProgramId(id);
    setSelectedProgram(programToEdit);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this program?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/radio-program/${id}`, "DELETE");
      toast.success("Program deleted successfully");
      fetchPrograms();
    } catch (error) {
      toast.error("Failed to delete program");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (item) => {
    const newStatus = item.status === "active" ? "in-active" : "active";
    setLoading(true);
    try {
      await apiCall(`/radio-program/${item.id}/status`, "PATCH", {
        status: newStatus,
      });
      fetchPrograms();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProgram = (item) => {
    setProgramId(item.id);
    setIsViewModalOpen(true);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Radio Programs Management"}
          paths={["Programs", "Radio Programs Management"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Radio Programs
            </p>
            <button
              onClick={handleAddProgram}
              className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
            >
              <BadgePlus size={16} />
              <span>Add Program</span>
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
                placeholder="Search Programs..."
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
                    <th className="py-2 px-4 border">Program Category</th>
                    <th className="py-2 px-4 border">Station Name</th>
                    <th className="py-2 px-4 border">Start Time</th>
                    <th className="py-2 px-4 border">End Time</th>
                    <th className="py-2 px-4 border">Host</th>
                    <th className="py-2 px-4 border">Status</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No programs found.
                      </td>
                    </tr>
                  ) : (
                    programs.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-2 px-4 border">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-2 px-4 border">
                          {item.program_category?.category}
                        </td>
                        <td className="py-2 px-4 border">
                          {item.radio_station?.station_name}
                        </td>
                        <td className="py-2 px-4 border">
                          {item.program_category?.start_time}
                        </td>
                        <td className="py-2 px-4 border">
                          {item.program_category?.end_time}
                        </td>
                        <td className="py-2 px-4 border">
                          {item.system_users?.name}
                        </td>
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
                              onClick={() => handleViewProgram(item)}
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

        <AddRadioProgramModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editProgramId={editProgramId}
          editProgramData={selectedProgram}
          onSuccess={() => {
            fetchPrograms();
            setShowModal(false);
          }}
        />

        <ViewRadioProgramModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          programId={programId}
        />
      </div>
    </div>
  );
};

export default RadioPrograms;
