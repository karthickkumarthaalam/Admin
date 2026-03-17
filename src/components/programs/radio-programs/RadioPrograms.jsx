import React, { useState, useEffect } from "react";
import {
  BadgePlus,
  Search,
  Loader2,
  Edit2,
  Trash2,
  ScanEye,
  Radio,
  Clock,
  Edit,
  BarChart3,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import BreadCrumb from "../../../components/BreadCrum";
import AddRadioProgramModal from "./AddRadioProgramModal";
import { usePermission } from "../../../context/PermissionContext";
import { useAuth } from "../../../context/AuthContext";
import ProgramQuestionManagement from "./ProgramQuestionManagement";

const RadioPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editProgramId, setEditProgramId] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const [showPollModal, setShowPollModal] = useState(false);
  const [selectedProgramForPoll, setSelectedProgramForPoll] = useState(null);

  const { hasPermission } = usePermission();
  const { user } = useAuth();

  const pageSize = 20;

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/radio-program?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`,
        "GET",
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

  const handleOpenPolls = (program) => {
    setSelectedProgramForPoll(program);
    setShowPollModal(true);
  };

  const handleStatusToggle = async (item) => {
    if (
      !window.confirm(
        "Are you sure you want to change the status of this program?",
      )
    )
      return;
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
            {hasPermission("Radio Programs", "create") && (
              <button
                onClick={handleAddProgram}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
              >
                <BadgePlus size={16} />
                <span>Add Program</span>
              </button>
            )}
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
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm ">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Banner</th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Program Category
                    </th>
                    <th className="py-3 px-4 border-b text-center">Timmings</th>
                    <th className="py-3 px-4 border-b">Host</th>
                    <th className="py-3 px-4 border-b">Polls</th>
                    <th className="py-3 px-4 border-b">Status</th>
                    <th className="py-3 px-4 border-b">Actions</th>
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
                        <td className="py-4 px-4 border-b font-bold">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-4 border-b">
                          <img
                            src={item.program_category?.image_url}
                            alt={item.program_category?.category}
                            className="w-32 h-auto rounded"
                          />
                        </td>
                        <td className="py-4 px-4 border-b">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Radio size={18} className="text-blue-600" />
                              </div>

                              <p className="text-blue-700 font-semibold">
                                {item.radio_station?.station_name}
                              </p>
                            </div>
                            <h4 className="text-base font-semibold text-gray-700">
                              {item.program_category?.category}
                            </h4>
                          </div>
                        </td>

                        <td className="py-3 px-4 border-b">
                          <div className="flex items-center justify-center gap-2">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                              <Clock size={16} className="text-green-700" />
                            </div>
                            <p className="text-green-800 text-sm font-semibold">
                              {item.program_category?.start_time} -{" "}
                              {item.program_category?.end_time}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <p className="text-gray-800 font-semibold">
                            {item.system_users?.name}
                          </p>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <button
                            onClick={() => handleOpenPolls(item)}
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-1 rounded-md text-xs font-semibold"
                          >
                            <BarChart3 size={14} />
                            Polls
                          </button>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <button
                            onClick={() => {
                              if (user.role !== "admin") {
                                toast.info("Only Admin can update status");
                                return;
                              }
                              handleStatusToggle(item);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 shadow-sm hover:shadow-md ${
                              item.status === "active"
                                ? "text-green-700 border-green-300 bg-green-50 hover:bg-green-100"
                                : "text-red-700 border-red-300 bg-red-50 hover:bg-red-100"
                            }`}
                          >
                            {item.status === "active" ? (
                              <>
                                <CheckCircle size={14} />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={14} />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <div className="flex items-center gap-2">
                            {hasPermission("Radio Programs", "update") && (
                              <button
                                onClick={() => handleEdit(item.id)}
                                className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-md"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {hasPermission("Radio Programs", "delete") && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800 p-2 bg-red-50 rounded-md"
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
      </div>
      {showPollModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full h-full rounded-xl shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <BarChart3 size={20} className="text-indigo-600" />
                </div>

                {/* Program Info */}
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Poll Management
                  </h2>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="font-medium text-indigo-600">
                      {selectedProgramForPoll?.program_category?.category}
                    </span>

                    {selectedProgramForPoll?.radio_station?.station_name && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <Radio size={12} className="text-gray-400" />
                          {selectedProgramForPoll.radio_station.station_name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                {/* Close Button */}
                <button
                  onClick={() => setShowPollModal(false)}
                  className="p-2 rounded-lg hover:bg-red-50 group transition"
                >
                  <X
                    size={20}
                    className="text-gray-400 group-hover:text-red-600 transition"
                  />
                </button>
              </div>
            </div>

            {/* Poll Component */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
              <ProgramQuestionManagement
                radioProgramId={selectedProgramForPoll?.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadioPrograms;
