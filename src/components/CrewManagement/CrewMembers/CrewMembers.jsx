import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle,
  ChevronDown,
  Download,
  Edit2,
  Filter,
  Globe,
  Hotel,
  Loader2,
  MessageCircleMore,
  Plane,
  PlusCircleIcon,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import AddCrewMembers from "./AddCrewMembers";
import AddCrewFlightsModal from "./AddCrewFlightsModal";
import AddCrewRoomsModal from "./AddCrewRoomModal";
import { useAuth } from "../../../context/AuthContext";
import CrewDocumentsModal from "./CrewDocumentsModal";
import AddCrewVisaModal from "./AddCrewVisaModal";
import { exportCrewMemberPDF } from "../../../utils/exportCrewMemberPDF";
import { exportCategoryCrewPDF } from "../../../utils/exportCategoryCrewPDF";

const CrewMembers = ({ isOpen, onClose, crewManagement }) => {
  const [crewMembers, setCrewMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedCrewMember, setSelectedCrewMember] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const [roomModal, setRoomModal] = useState(false);
  const [flightModal, setFlightModal] = useState(false);
  const [visaModal, setVisaModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [expandedRow, setExpandedRow] = useState(null);

  const [documentModal, setDocumentModal] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);

  const [moduleAccess, setModuleAccess] = useState({
    can_manage_flight: false,
    can_manage_rooms: false,
  });

  const [exportCategory, setExportCategory] = useState("");
  const [exportOptions, setExportOptions] = useState([]);
  const [exportValue, setExportValue] = useState("");

  useEffect(() => {
    if (!exportCategory) {
      setExportOptions([]);
      return;
    }

    let values = [];

    if (exportCategory === "food") {
      values = crewMembers.map((m) => m.food_preference);
    }
    if (exportCategory === "flight") {
      values = crewMembers.map((m) => m.flight_class);
    }

    if (exportCategory === "room") {
      values = crewMembers.map((m) => m.room_preference);
    }

    const uniqueValues = [...new Set(values.filter(Boolean))];

    setExportOptions(uniqueValues);
    setExportValue("");
  }, [exportCategory, crewMembers]);

  const exportFilteredCrew = crewMembers.filter((member) => {
    if (!exportCategory || !exportValue) return false;

    if (exportCategory === "food") {
      return member.food_preference === exportValue;
    }

    if (exportCategory === "flight") {
      return member.flight_class === exportValue;
    }

    if (exportCategory === "room") {
      return member.room_preference === exportValue;
    }

    return false;
  });

  const exportCrewGroupPDF = async (members) => {
    await exportCategoryCrewPDF(
      crewManagement.title,
      exportValue,
      exportCategory,
      members,
    );
  };

  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.name === "admin";

  const fetchModuleAccess = async () => {
    try {
      const res = await apiCall(
        `/crew-permissions/check-module-access?crew_management_id=${crewManagement.id}`,
      );

      setModuleAccess({
        can_manage_flight: res?.can_manage_flight || false,
        can_manage_rooms: res?.can_manage_rooms || false,
      });
    } catch (err) {
      toast.error("Failed to fetch permissions");
    }
  };

  const fetchCrewMembers = async () => {
    try {
      setLoading(true);
      const response = await apiCall(
        `/crew-member/event/${crewManagement.id}`,
        "GET",
      );
      setCrewMembers(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch crew members");
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    onClose();
    setSelectedCrew(null);
    setSelectedRows([]);
    setExpandedRow(null);
    setExportCategory("");
  };

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [onClose],
  );

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiCall(`/crew-member/status/${id}`, "PATCH", { status });
      toast.success("Status Updated successfully");
      fetchCrewMembers();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchCrewMembers();
    fetchModuleAccess();
  }, [isOpen]);

  const toggleSelect = (member) => {
    setSelectedRows((prev) => {
      const exists = prev.find((m) => m.id === member.id);
      if (exists) {
        return prev.filter((m) => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleExportPDF = async (member) => {
    await exportCrewMemberPDF(member);
  };

  const filteredCrew = crewMembers.filter((member) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      member?.given_name?.toLowerCase().includes(search) ||
      member?.sur_name?.toLowerCase().includes(search) ||
      member?.email?.toLowerCase().includes(search) ||
      member?.phone?.toLowerCase().includes(search) ||
      member?.passport_number?.toLowerCase().includes(search) ||
      member?.designation?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "all" ? true : member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("crew_management_id", crewManagement.id);

    try {
      toast.loading("Uploading crew...");

      await apiCall("/crew-member/upload-excel", "POST", formData, true);

      toast.dismiss();
      toast.success("Crew uploaded successfully");

      fetchCrewMembers();
    } catch (err) {
      toast.dismiss();
      toast.error("Upload failed");
    }

    e.target.value = "";
  };

  const clearSelection = () => setSelectedRows([]);

  if (!isOpen) return null;
  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] overflow-auto md:p-4"
    >
      <div className="bg-slate-50 rounded-xl w-full  p-6 relative overflow-auto h-full scrollbar-hide">
        <div className="border-b border-dashed border-gray-600 pb-4 mb-6">
          {/* Top Row */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Crew Members
              </h2>
              <h4 className="text-gray-900 font-bold text-lg md:text-xl">
                {crewManagement.title}
              </h4>
            </div>

            <button
              onClick={handleClose}
              className="p-1 rounded-md hover:bg-red-50 transition"
            >
              <X size={22} className="text-gray-600 hover:text-red-600" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col-reverse lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* LEFT SIDE — EXPORT FILTER */}
            <div className="flex flex-wrap items-center  gap-3 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3">
              <span
                className={`text-sm font-semibold text-gray-700 flex items-center gap-2`}
              >
                <Download size={16} className="text-blue-600" />
                Export
              </span>

              {/* Category Select */}
              <div className="relative">
                <select
                  value={exportCategory}
                  onChange={(e) => setExportCategory(e.target.value)}
                  className="appearance-none pl-4 pr-6 md:pr-10 py-1.5 md:py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition cursor-pointer"
                >
                  <option value="">Category</option>
                  <option value="food">Food Preference</option>
                  <option value="flight">Flight Class</option>
                  <option value="room">Room Preference</option>
                </select>

                <ChevronDown
                  size={16}
                  className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                />
              </div>

              {/* Subcategory */}
              {exportCategory && (
                <div className="relative">
                  <select
                    value={exportValue}
                    onChange={(e) => setExportValue(e.target.value)}
                    className="appearance-none pl-4 pr-6 md:pr-10 py-1.5 md:py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition cursor-pointer"
                  >
                    <option value="">Select Type</option>

                    {exportOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace("_", " ")}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
              )}

              {exportFilteredCrew.length > 0 && (
                <button
                  onClick={() => exportCrewGroupPDF(exportFilteredCrew)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
        bg-gradient-to-r from-blue-600 to-indigo-600 text-white
        hover:from-blue-700 hover:to-indigo-700 transition shadow-sm hover:shadow-md"
                >
                  <Download size={16} />
                  Export PDF{" "}
                  <span className=" px-1 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                    {exportFilteredCrew.length} Member
                  </span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <label
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium 
      bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl 
      hover:from-emerald-700 hover:to-emerald-800 shadow-sm cursor-pointer transition"
              >
                <Upload size={16} />
                Upload Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  hidden
                  onChange={handleExcelUpload}
                />
              </label>

              {/* Add Crew Button */}
              <button
                onClick={() => {
                  setOpenAddModal(true);
                  setSelectedCrewMember(null);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 
      rounded-xl shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 
      hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium transition"
              >
                <PlusCircleIcon size={16} />
                Add Crew Member
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                {crewMembers.length}
              </div>
              <div className="leading-tight">
                <p className="text-xs text-gray-500">Total Crew</p>
                <p className="text-sm font-semibold text-gray-800">Members</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-sm">
                {crewMembers.filter((m) => m.status === "active").length}
              </div>
              <div className="leading-tight">
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-sm font-semibold text-gray-800">Members</p>
              </div>
            </div>

            <div className="flex justify-end lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-xl border border-gray-300 bg-white shadow-sm hover:bg-gray-50 transition"
              >
                <Filter size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <div
              className={`
        ${showFilters ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0 lg:max-h-full lg:opacity-100"}
        overflow-hidden transition-all duration-300 ease-in-out
      `}
            >
              <div className="flex flex-row gap-3 mt-3 lg:mt-0">
                <div className="relative w-full md:w-80 group">
                  <Search
                    size={18}
                    className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition"
                  />

                  <input
                    type="text"
                    placeholder="Search crew..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border-2 border-gray-300 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />

                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500 transition"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </div>

                {/* STATUS FILTER */}
                <div className="relative flex items-center">
                  <Filter size={16} className="absolute left-3 text-gray-400" />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-9 pr-8 py-2.5 rounded-2xl bg-white border-2 border-gray-300 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="in-active">Inactive</option>
                  </select>
                </div>

                {/* CLEAR BUTTON */}
                {(searchTerm || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 transition shadow-sm"
                  >
                    <XCircle size={16} />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedRows.length > 0 && (
          <div className="my-5 sticky top-0 z-20">
            <div
              className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between 
    backdrop-blur-md bg-white/50 border border-gray-200 
    shadow-lg rounded-xl px-5 py-3 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-500 text-sm font-semibold shadow-sm">
                  {selectedRows.length}
                </div>

                <span className="text-sm font-semibold text-gray-800 tracking-wide">
                  Member selected
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  disabled={selectedRows.length !== 1}
                  onClick={() => {
                    if (selectedRows.length !== 1) return;
                    setSelectedCrew(selectedRows[0]);
                    setDocumentModal(true);
                    clearSelection();
                  }}
                  className={`
      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
      transition shadow-sm

      ${
        selectedRows.length === 1
          ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 hover:shadow-md"
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
      }
    `}
                >
                  <Upload size={16} />
                  Documents
                </button>

                <button
                  disabled={selectedRows.length !== 1}
                  onClick={() => {
                    if (selectedRows.length !== 1) return;
                    setSelectedCrewMember(selectedRows[0]);
                    setOpenAddModal(true);
                    clearSelection();
                  }}
                  className={`
      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
      transition shadow-sm

      ${
        selectedRows.length === 1
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
      }
    `}
                >
                  <Edit2 size={16} />
                  Edit
                </button>

                <button
                  disabled={selectedRows.length === 0}
                  onClick={async () => {
                    if (!selectedRows.length) return;
                    if (!window.confirm("Delete selected crew?")) return;

                    try {
                      for (let m of selectedRows) {
                        await apiCall(`/crew-member/${m.id}`, "DELETE");
                      }
                      toast.success("Deleted successfully");
                      clearSelection();
                      fetchCrewMembers();
                    } catch {
                      toast.error("Delete failed");
                    }
                  }}
                  className={`
      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
      transition shadow-sm border

      ${
        selectedRows.length > 0
          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:shadow-md"
          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
      }
    `}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-1/2">
            <Loader2 size={32} className="text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mt-4 max-w-full border border-gray-200 bg-white rounded-xl shadow-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-white">
                  <tr className="text-left">
                    <th className="px-3 py-3 sm:px-4 text-center">#</th>
                    <th className="px-3 py-3 sm:px-4">Details</th>
                    <th className="px-3 py-3 sm:px-4">Preferences</th>
                    <th className="px-3 py-3 sm:px-4 whitespace-nowrap">
                      Passport Details
                    </th>

                    {(isAdmin || moduleAccess.can_manage_flight) && (
                      <th className="px-3 py-3 sm:px-4 whitespace-nowrap">
                        Flight Details
                      </th>
                    )}
                    {(isAdmin || moduleAccess.can_manage_rooms) && (
                      <th className="px-3 py-3 sm:px-4 whitespace-nowrap">
                        Room Details
                      </th>
                    )}
                    {(isAdmin || moduleAccess.can_manage_visa) && (
                      <th className="px-3 py-3 sm:px-4 whitespace-nowrap">
                        Visa Details
                      </th>
                    )}

                    <th className="px-3 py-3 sm:px-4 text-center">Status</th>
                    <th className="px-3 py-3 sm:px-4 text-center whitespace-nowrap">
                      Export PDF
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCrew.length === 0 ? (
                    <tr>
                      <td className="py-14" colSpan="100%">
                        <div className="flex items-center flex-col justify-center text-center">
                          <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                            <MessageCircleMore
                              size={32}
                              className="text-blue-600"
                            />
                          </div>

                          <p className="text-base font-semibold text-gray-700">
                            No Crew Members Found
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCrew.map((member, index) => (
                      <>
                        <tr
                          key={member.id}
                          className="hover:bg-slate-50 transition border-b cursor-pointer"
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === member.id ? null : member.id,
                            )
                          }
                        >
                          <td className="py-3 px-3 sm:px-4 text-gray-700 font-semibold">
                            <label className="relative flex items-center justify-center cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedRows.some(
                                  (m) => m.id === member.id,
                                )}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelect(member);
                                }}
                                className="hidden"
                              />

                              <div
                                className={`
                              w-5 h-5 rounded-lg border flex items-center justify-center
                              transition-all duration-200 shadow-sm

                              ${
                                selectedRows.some((m) => m.id === member.id)
                                  ? "bg-blue-600 border-blue-600 shadow-md"
                                  : "bg-white border-gray-300 group-hover:border-blue-500"
                              }
                            `}
                              >
                                {selectedRows.some(
                                  (m) => m.id === member.id,
                                ) && (
                                  <Check
                                    size={14}
                                    strokeWidth={3}
                                    className="text-white"
                                  />
                                )}
                              </div>
                            </label>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-start gap-3">
                              <span className="text-gray-700 font-semibold text-sm mt-0.5">
                                {index + 1}.
                              </span>

                              <div className="flex flex-col leading-tight">
                                <span className="font-semibold text-gray-900 text-base whitespace-nowrap">
                                  {member?.given_name || ""}{" "}
                                  {member?.sur_name || ""}
                                </span>

                                {member.designation && (
                                  <span className="text-sm text-blue-600 font-medium whitespace-nowrap">
                                    {member.designation}
                                  </span>
                                )}

                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                  <span className="capitalize">
                                    {member.gender}
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span>{member.nationality}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-2 text-sm">
                              <div className="flex items-center  gap-3">
                                <span className="text-gray-500 text-xs">
                                  Food
                                </span>

                                {member.food_preference ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-green-100 text-green-800 font-medium text-xs capitalize border border-green-200">
                                    {member.food_preference.replace("_", " ")}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs italic">
                                    Not added
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center  gap-3">
                                <span className="text-gray-500 text-xs whitespace-nowrap">
                                  Flight Class
                                </span>

                                {member.flight_class ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-medium text-xs capitalize border border-blue-200">
                                    {member.flight_class}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs italic">
                                    Not added
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-gray-500 text-xs whitespace-nowrap">
                                  Room Type
                                </span>
                                {member.room_preference ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-medium text-xs capitalize border border-purple-200">
                                    {member.room_preference}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs italic">
                                    Not added
                                  </span>
                                )}{" "}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            {!member.passport_number ? (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="italic">
                                  No passport provided
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col text-sm">
                                <span className="font-semibold text-gray-900 tracking-wide">
                                  {member.passport_number}
                                </span>

                                {(() => {
                                  const issueDate = member.date_of_issue
                                    ? new Date(member.date_of_issue)
                                    : null;
                                  const expiryDate = member.date_of_expiry
                                    ? new Date(member.date_of_expiry)
                                    : null;

                                  const currentYear = new Date().getFullYear();

                                  const isInvalidIssue =
                                    issueDate &&
                                    expiryDate &&
                                    issueDate > expiryDate;

                                  const isExpiryThisYear =
                                    expiryDate &&
                                    expiryDate.getFullYear() === currentYear;

                                  return (
                                    <>
                                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        <span className="whitespace-nowrap">
                                          Issue:{" "}
                                          {issueDate
                                            ? issueDate.toLocaleDateString(
                                                "en-GB",
                                              )
                                            : "-"}
                                        </span>

                                        <span className="text-gray-300">•</span>

                                        <span className="whitespace-nowrap">
                                          Exp:{" "}
                                          {expiryDate
                                            ? expiryDate.toLocaleDateString(
                                                "en-GB",
                                              )
                                            : "-"}
                                        </span>
                                      </div>

                                      {isInvalidIssue && (
                                        <div className="mt-1 text-xs text-red-600 font-medium">
                                          ⚠ Invalid passport dates (Issue date
                                          is after expiry date)
                                        </div>
                                      )}

                                      {isExpiryThisYear && (
                                        <div className="mt-1 text-xs text-orange-600 font-medium">
                                          ⚠ Passport expiring this year
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </td>
                          {(isAdmin || moduleAccess.can_manage_flight) && (
                            <td className="px-4 py-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCrew(member);
                                  setFlightModal(true);
                                }}
                                className={`
      flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
      border transition-all duration-200 whitespace-nowrap

      ${
        member.flights?.length
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
      }
      `}
                              >
                                <Plane size={14} />

                                {member.flights?.length ? (
                                  <>Flights</>
                                ) : (
                                  "Add Flight"
                                )}
                              </button>
                            </td>
                          )}
                          {(isAdmin || moduleAccess.can_manage_rooms) && (
                            <td className="px-4 py-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCrew(member);
                                  setRoomModal(true);
                                }}
                                className={`
      flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
      border transition-all duration-200 whitespace-nowrap

      ${
        member.rooms?.length
          ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
      }
      `}
                              >
                                <Building2 size={14} />

                                {member.rooms?.length ? <>Rooms</> : "Add Room"}
                              </button>
                            </td>
                          )}
                          {(isAdmin || moduleAccess.can_manage_visa) && (
                            <td className="px-4 py-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCrew(member);
                                  setVisaModal(true);
                                }}
                                className={`
      flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
      border transition-all duration-200 whitespace-nowrap

      ${
        member.visas?.length
          ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
      }
      `}
                              >
                                <ShieldCheck size={14} />

                                {member.visas?.length ? <>Visa</> : "Add Visa"}
                              </button>
                            </td>
                          )}

                          <td className="px-4 py-4">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(
                                    member.id,
                                    member.status === "active"
                                      ? "in-active"
                                      : "active",
                                  );
                                }}
                                className={`
      relative inline-flex items-center h-6 w-11 rounded-full transition-all duration-300 focus:outline-none
      ${member.status === "active" ? "bg-green-500" : "bg-gray-300"}
    `}
                              >
                                <span
                                  className={`
        inline-block h-5 w-5 transform rounded-full bg-white shadow transition-all duration-300
        ${member.status === "active" ? "translate-x-5" : "translate-x-1"}
      `}
                                />
                              </button>

                              <span
                                className={`ml-2 text-xs font-semibold ${
                                  member.status === "active"
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {member.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center">
                              {member?.flights?.length > 0 &&
                              member?.rooms?.length > 0 ? (
                                <button
                                  title="Export PDF"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExportPDF(member);
                                  }}
                                  className="p-2 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-500 to-blue-600
      hover:from-blue-600 hover:to-blue-700 hover:border-blue-300
      transition-all duration-200 shadow-sm hover:shadow text-white flex gap-2 text-xs"
                                >
                                  <Download size={14} />
                                  PDF
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400 italic">
                                  Add flight and <br /> rooms details <br /> to
                                  export pdf
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedRow === member.id && (
                          <tr className="bg-purple-50">
                            <td colSpan="100%" className="px-8 py-7">
                              <div className="space-y-6">
                                <div className="flex items-center justify-between border-b pb-4">
                                  <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                      {member.given_name} {member.sur_name}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                      {member.designation}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                  <div className="rounded-2xl border bg-white shadow-sm p-5">
                                    <h3 className="font-semibold text-gray-800 mb-4">
                                      👤 Crew Info
                                    </h3>

                                    <Info
                                      label="Passport"
                                      value={member.passport_number}
                                    />
                                    <Info
                                      label="DOB"
                                      value={
                                        member?.date_of_birth
                                          ? new Date(
                                              member.date_of_birth,
                                            ).toLocaleDateString("en-GB")
                                          : ""
                                      }
                                    />

                                    <Info
                                      label="Expiry"
                                      value={
                                        member?.date_of_expiry
                                          ? new Date(
                                              member.date_of_expiry,
                                            ).toLocaleDateString("en-GB")
                                          : ""
                                      }
                                    />
                                    <Info
                                      label="Boarding"
                                      value={member.boarding_from}
                                    />
                                    <Info
                                      label="Returning"
                                      value={member.returning_to}
                                    />
                                    <Info
                                      label="Flight Preference"
                                      value={member.flight_class}
                                    />
                                    <Info
                                      label="Food Preference"
                                      value={member.food_preference}
                                    />
                                    <Info
                                      label="Room Preference"
                                      value={member.room_preference}
                                    />
                                  </div>

                                  <div className="rounded-2xl border bg-white shadow-sm p-5">
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                      <h3 className="font-semibold text-gray-800 text-lg">
                                        📁 Visa Documents
                                      </h3>

                                      <button
                                        onClick={() => {
                                          setDocumentModal(true);
                                          setSelectedCrew(member);
                                          setSelectedDocType(null);
                                        }}
                                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition"
                                      >
                                        <Upload
                                          size={20}
                                          className="text-indigo-600"
                                        />
                                      </button>
                                    </div>
                                    <div className="space-y-3">
                                      <DocumentRow
                                        type="photo"
                                        title="Photo"
                                        docs={member.documents}
                                        onOpenModal={() => {
                                          setSelectedCrew(member);
                                          setSelectedDocType("photo");
                                          setDocumentModal(true);
                                        }}
                                      />

                                      <DocumentRow
                                        type="passport"
                                        title="Passport"
                                        docs={member.documents}
                                        onOpenModal={() => {
                                          setSelectedCrew(member);
                                          setSelectedDocType("passport");
                                          setDocumentModal(true);
                                        }}
                                      />

                                      <DocumentRow
                                        type="aadhar_card"
                                        title="Aadhar Card"
                                        docs={member.documents}
                                        onOpenModal={() => {
                                          setSelectedCrew(member);
                                          setSelectedDocType("aadhar_card");
                                          setDocumentModal(true);
                                        }}
                                      />

                                      <DocumentRow
                                        type="bank_statement"
                                        title="Bank Statement"
                                        docs={member.documents}
                                        onOpenModal={() => {
                                          setSelectedCrew(member);
                                          setSelectedDocType("bank_statement");
                                          setDocumentModal(true);
                                        }}
                                      />

                                      <DocumentRow
                                        type="previous_visa"
                                        title="Previous Visa"
                                        docs={member.documents}
                                        onOpenModal={() => {
                                          setSelectedCrew(member);
                                          setSelectedDocType("previous_visa");
                                          setDocumentModal(true);
                                        }}
                                      />

                                      <DocumentRow
                                        type="income_revenue"
                                        title="ITR Document"
                                        docs={member.documents}
                                        onOpenModal={() => {
                                          setSelectedCrew(member);
                                          setSelectedDocType("income_revenue");
                                          setDocumentModal(true);
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="rounded-2xl border bg-white shadow-sm p-5">
                                    <SectionHeader
                                      title="Flights"
                                      count={member.flights?.length}
                                      ok={member.flights?.length}
                                    />

                                    {member.flights?.length ? (
                                      member.flights.map((flight) => (
                                        <FlightRow
                                          key={flight.id}
                                          flight={flight}
                                        />
                                      ))
                                    ) : (
                                      <Empty text="No flights added" />
                                    )}
                                  </div>

                                  <div className="rounded-2xl border bg-white shadow-sm p-5">
                                    <SectionHeader
                                      title="Rooms"
                                      count={member.rooms?.length}
                                      ok={member.rooms?.length}
                                    />

                                    {member.rooms?.length ? (
                                      member.rooms.map((room) => (
                                        <RoomRow key={room.id} room={room} />
                                      ))
                                    ) : (
                                      <Empty text="No rooms booked" />
                                    )}
                                  </div>

                                  <div className="rounded-2xl border bg-white shadow-sm p-5">
                                    <SectionHeader
                                      title="Visa"
                                      count={member.visas?.length}
                                      ok={member.visas?.length}
                                    />

                                    {member.visas?.length ? (
                                      member.visas.map((visa) => (
                                        <VisaRow key={visa.id} visa={visa} />
                                      ))
                                    ) : (
                                      <Empty text="No visa added" />
                                    )}
                                  </div>

                                  <div className="rounded-2xl border bg-white shadow-sm p-5">
                                    <SectionHeader
                                      title="Charges"
                                      count={
                                        (member.flights?.length || 0) +
                                        (member.rooms?.length || 0) +
                                        (member.visas?.length || 0)
                                      }
                                    />

                                    <div className="space-y-3 text-sm">
                                      {/* Flight Charges */}
                                      {member.flights?.map((f) => (
                                        <div
                                          key={`flight-${f.id}`}
                                          className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-lg"
                                        >
                                          <span className="text-gray-700 font-semibold">
                                            Flight ({f.from_city} → {f.to_city})
                                          </span>

                                          <span className="font-semibold text-blue-700">
                                            {f.ticket_charge
                                              ? `${f.currency} ${f.ticket_charge}`
                                              : "-"}
                                          </span>
                                        </div>
                                      ))}

                                      {/* Room Charges */}
                                      {member.rooms?.map((r) => (
                                        <div
                                          key={`room-${r.id}`}
                                          className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded-lg"
                                        >
                                          <span className="text-gray-700 font-semibold">
                                            Room ({r.hotel_name})
                                          </span>

                                          <span className="font-semibold text-purple-700">
                                            {r.room_charge
                                              ? `${r.currency} ${r.room_charge}`
                                              : "-"}
                                          </span>
                                        </div>
                                      ))}

                                      {/* Visa Charges */}
                                      {member.visas?.map((v) => (
                                        <div
                                          key={`visa-${v.id}`}
                                          className="flex justify-between items-center bg-emerald-50 px-3 py-2 rounded-lg"
                                        >
                                          <span className="text-gray-700 font-semibold">
                                            Visa ({v.country})
                                          </span>

                                          <span className="font-semibold text-emerald-700">
                                            {v.visa_charge
                                              ? `${v.currency} ${v.visa_charge}`
                                              : "-"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <AddCrewMembers
        isOpen={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          setSelectedCrewMember(null);
        }}
        editCrewMember={selectedCrewMember}
        crewManagement={crewManagement}
        onSuccess={fetchCrewMembers}
      />
      <AddCrewRoomsModal
        isOpen={roomModal}
        onClose={() => {
          setRoomModal(false);
          fetchCrewMembers();
        }}
        crewMember={selectedCrew}
      />
      <AddCrewFlightsModal
        isOpen={flightModal}
        onClose={() => {
          setFlightModal(false);
          fetchCrewMembers();
        }}
        crewMember={selectedCrew}
      />
      <AddCrewVisaModal
        isOpen={visaModal}
        onClose={() => {
          setVisaModal(false);
          fetchCrewMembers();
        }}
        crewMember={selectedCrew}
      />
      <CrewDocumentsModal
        isOpen={documentModal}
        onClose={() => {
          setSelectedCrew(null);
          setDocumentModal(false);
          setSelectedDocType(null);
          fetchCrewMembers();
        }}
        crewMember={selectedCrew}
        selectedType={selectedDocType}
      />
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1 border-b last:border-none">
    <span className="text-gray-500">{label}</span>
    <span className="font-semibold text-gray-800">
      {value ? value.toUpperCase() : "-"}
    </span>
  </div>
);

const Empty = ({ text }) => (
  <p className="text-gray-400 text-sm italic">{text}</p>
);

const DocumentRow = ({ type, title, docs, onOpenModal }) => {
  const [open, setOpen] = useState(false);

  const filtered = docs?.filter((d) => d.document_type === type) || [];
  const exists = filtered.length > 0;

  const handleClick = () => {
    if (exists) {
      setOpen(!open);
    } else {
      onOpenModal();
    }
  };
  return (
    <div className="border rounded-xl overflow-hidden bg-gray-50">
      <div
        onClick={handleClick}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition
        ${exists ? "hover:bg-blue-50" : "opacity-70 "}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 flex items-center justify-center rounded-full
            ${exists ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
          >
            {exists ? "✓" : "✕"}
          </div>

          <span className="font-semibold text-gray-800">{title}</span>
        </div>

        <div className="text-xs font-semibold text-gray-500">
          {exists ? `${filtered.length} file` : "Missing"}
        </div>
      </div>

      {open && exists && (
        <div className="bg-white border-t px-4 py-3 space-y-2">
          {filtered.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
            >
              <span className="text-sm text-gray-700 truncate w-56">
                {file.file_name}
              </span>

              <a
                href={file.file_url}
                target="_blank"
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}

      {!exists && (
        <div className="px-4 pb-3 text-xs text-red-500">
          Document not uploaded
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ title, count }) => {
  const available = count > 0;

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-800 tracking-tight">
          {title}
        </h3>

        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
          {count || 0}
        </span>
      </div>

      <div
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full
        ${
          available ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-500"
        }`}
      >
        {available ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
        {available ? "Available" : "Missing"}
      </div>
    </div>
  );
};
const FlightRow = ({ flight }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition mb-4 overflow-hidden bg-white">
      <div
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center px-5 py-4 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Plane size={18} className="text-blue-600" />
          </div>

          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {flight.from_city} → {flight.to_city}
            </p>
            <p className="text-xs text-gray-500">
              {flight.airline} • {flight.flight_number}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {flight.flight_class}
          </span>

          <ChevronDown
            size={18}
            className={`transition-transform duration-300 ${
              open ? "rotate-180 text-blue-600" : "text-gray-400"
            }`}
          />
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-5 pb-4 text-sm text-gray-600 space-y-2 border-t">
          <p>
            <b>PNR:</b> {flight.pnr}
          </p>
          <p>
            <b>Departure:</b>{" "}
            {flight.departure_date
              ? `${flight.departure_date}${
                  flight.departure_time
                    ? " • " +
                      new Date(
                        `1970-01-01T${flight.departure_time}`,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : ""
                }`
              : "-"}
          </p>

          <p>
            <b>Arrival:</b>{" "}
            {flight.arrival_date
              ? `${flight.arrival_date}${
                  flight.arrival_time
                    ? " • " +
                      new Date(
                        `1970-01-01T${flight.arrival_time}`,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : ""
                }`
              : "-"}
          </p>
          <p>
            <b>Flight Charges:</b>{" "}
            {flight?.ticket_charge
              ? `${flight.currency} ${flight.ticket_charge}`
              : "No charges added"}
          </p>

          {flight?.ticket_file && (
            <a
              href={flight.ticket_file}
              target="_blank"
              className="inline-block mt-2 text-blue-600 text-xs font-semibold hover:underline"
            >
              View Ticket →
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const RoomRow = ({ room }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition mb-4 bg-white overflow-hidden">
      <div
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center px-5 py-4 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-xl">
            <Hotel size={18} className="text-purple-600" />
          </div>

          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {room.hotel_name}
            </p>
            <p className="text-xs text-gray-500">{room.city}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            {room.room_type}
          </span>

          <ChevronDown
            size={18}
            className={`transition-transform duration-300 ${
              open ? "rotate-180 text-purple-600" : "text-gray-400"
            }`}
          />
        </div>
      </div>

      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 space-y-2 border-t">
          <p>
            <b>Room Number:</b> {room.room_number || "-"}
          </p>
          <p>
            <b>Check-in:</b>{" "}
            {room.checkin_date
              ? `${room.checkin_date}${
                  room.checkin_time
                    ? " • " +
                      new Date(
                        `1970-01-01T${room.checkin_time}`,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : ""
                }`
              : "-"}
          </p>

          <p>
            <b>Check-out:</b>{" "}
            {room.checkout_date
              ? `${room.checkout_date}${
                  room.checkout_time
                    ? " • " +
                      new Date(
                        `1970-01-01T${room.checkout_time}`,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : ""
                }`
              : "-"}
          </p>

          <p>
            <b>Room Charges:</b>{" "}
            {room?.room_charge
              ? `${room.currency} ${room.room_charge}`
              : "No charges added"}
          </p>

          {room?.remarks && (
            <p>
              <b>Remarks:</b> {room.remarks}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
const VisaRow = ({ visa }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition mb-4 bg-white overflow-hidden">
      <div
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center px-5 py-4 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <Globe size={18} className="text-emerald-600" />
          </div>

          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {visa.country}
            </p>
            <p className="text-xs text-gray-500">{visa.visa_type}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {visa.visa_number}
          </span>

          <ChevronDown
            size={18}
            className={`transition-transform duration-300 ${
              open ? "rotate-180 text-emerald-600" : "text-gray-400"
            }`}
          />
        </div>
      </div>

      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 space-y-2 border-t">
          <p>
            <b>Issue Date:</b>{" "}
            {new Date(visa.date_of_issue).toLocaleDateString("en-GB")}
          </p>
          <p>
            <b>Expiry Date:</b>{" "}
            {new Date(visa.date_of_expiry).toLocaleDateString("en-GB")}
          </p>

          <p>
            <b>Room Charges:</b>{" "}
            {visa?.visa_charge
              ? `${visa.currency} ${visa.visa_charge}`
              : "No charges added"}
          </p>

          {visa.visa_file_url && (
            <a
              href={visa.visa_file_url}
              target="_blank"
              className="inline-block mt-2 text-emerald-600 text-xs font-semibold hover:underline"
            >
              View Visa →
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default CrewMembers;
