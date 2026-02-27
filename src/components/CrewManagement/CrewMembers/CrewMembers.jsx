import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import {
  Check,
  Edit2,
  Edit2Icon,
  Edit3,
  Loader2,
  MessageCircleMore,
  PlusCircleIcon,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import AddCrewMembers from "./AddCrewMembers";
import AddCrewFlightsModal from "./AddCrewFlightsModal";
import AddCrewRoomsModal from "./AddCrewRoomModal";
import { useAuth } from "../../../context/AuthContext";

const CrewMembers = ({ isOpen, onClose, crewManagement }) => {
  const [crewMembers, setCrewMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedCrewMember, setSelectedCrewMember] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const [roomModal, setRoomModal] = useState(false);
  const [flightModal, setFlightModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState(null);

  const [moduleAccess, setModuleAccess] = useState({
    can_manage_flight: false,
    can_manage_rooms: false,
  });

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

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm("Are you sure you want to update status")) return;
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
        <div className="border-b border-dashed border-gray-600 pb-3 mb-6 flex items-start md:items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold  text-blue-600 ">
              Crew Members
            </h2>
            <h4 className="text-gray-900 font-semibold text-xl">
              {crewManagement.title}
            </h4>
          </div>

          <div className="flex flex-col-reverse md:flex-row items-end md:items-center justify-end gap-5 md:gap-3">
            <label className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-br from-emerald-600 to-emerald-700  text-white rounded-md  hover:from-emerald-700 hover:to-emerald-800 shadow-sm cursor-pointer">
              <Upload size={16} /> Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handleExcelUpload}
              />
            </label>
            <button
              onClick={() => {
                setOpenAddModal(true);
                setSelectedCrewMember(null);
              }}
              className="whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg shadow-md bg-gradient-to-r  from-blue-600 hover:from-blue-700 to-blue-700 hover:to-blue-800 text-white text-sm "
            >
              <PlusCircleIcon size={16} />
              Add Crew Member
            </button>
            <X
              size={24}
              className="font-semibold text-gray-900 hover:text-red-600"
              onClick={onClose}
            />
          </div>
        </div>

        {selectedRows.length > 0 && (
          <div className="mb-5 sticky top-0 z-20">
            <div
              className="flex items-center justify-between 
    backdrop-blur-md bg-white/50 border border-gray-200 
    shadow-lg rounded-xl px-5 py-3 transition-all"
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold shadow">
                  {selectedRows.length}
                </div>

                <span className="text-sm font-semibold text-gray-800 tracking-wide">
                  Member selected
                </span>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex items-center gap-2">
                {/* EDIT */}
                {selectedRows.length === 1 && (
                  <button
                    onClick={() => {
                      setSelectedCrewMember(selectedRows[0]);
                      setOpenAddModal(true);
                      clearSelection();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl 
            bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium 
            shadow-sm hover:shadow-md transition"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                )}

                {/* DELETE */}
                <button
                  onClick={async () => {
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl 
          bg-red-50 hover:bg-red-100 text-red-600 border border-red-200
          text-sm font-medium transition"
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
          <div className="overflow-x-auto mt-4 max-w-full border border-gray-200 bg-white rounded-xl shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-700 text-white">
                <tr className="text-left">
                  <th className="px-3 py-3 sm:px-4 text-center">#</th>
                  <th className="px-3 py-3 sm:px-4">Details</th>
                  <th className="px-3 py-3 sm:px-4">Preferences</th>
                  <th className="px-3 py-3 sm:px-4 whitespace-nowrap">
                    Passport Details
                  </th>
                  <th className="px-3 py-3 sm:px-4 whitespace-nowrap">
                    Visa Details
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
                  <th className="px-3 py-3 sm:px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {crewMembers.length === 0 ? (
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
                  crewMembers.map((member, index) => (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50 transition border-b"
                    >
                      <td className="py-3 px-3 sm:px-4 text-gray-700 font-semibold">
                        <label className="relative flex items-center justify-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedRows.some(
                              (m) => m.id === member.id,
                            )}
                            onChange={() => toggleSelect(member)}
                            className="hidden"
                          />

                          {/* box */}
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
                            {selectedRows.some((m) => m.id === member.id) && (
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
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-gray-900 text-base whitespace-nowrap">
                            {member?.given_name || ""} {member?.sur_name || ""}
                          </span>

                          {member.designation && (
                            <span className="text-sm text-blue-600 font-medium whitespace-nowrap">
                              {member.designation}
                            </span>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="capitalize">{member.gender}</span>
                            <span className="text-gray-300">•</span>
                            <span>{member.nationality}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex items-center  gap-3">
                            <span className="text-gray-500 text-xs">Food</span>

                            {member.food_preference ? (
                              <span className="px-2 py-0.5 rounded-lg bg-green-50 text-green-700 font-medium text-xs capitalize border border-green-200">
                                {member.food_preference.replace("_", " ")}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs italic">
                                Not added
                              </span>
                            )}
                          </div>

                          {/* Flight Class */}
                          <div className="flex items-center  gap-3">
                            <span className="text-gray-500 text-xs whitespace-nowrap">
                              Flight Class
                            </span>

                            {member.flight_class ? (
                              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-xs capitalize border border-blue-200">
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
                              <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-medium text-xs capitalize border border-purple-200">
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
                            <span className="italic">No passport Provided</span>
                          </div>
                        ) : (
                          <div className="flex  flex-col text-sm">
                            <span className="font-semibold text-gray-900 tracking-wide">
                              {member.passport_number}
                            </span>

                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span>
                                Issue:{" "}
                                {member.date_of_issue
                                  ? new Date(
                                      member.date_of_issue,
                                    ).toLocaleDateString("en-GB")
                                  : "-"}
                              </span>

                              <span className="text-gray-300">•</span>

                              <span>
                                Exp:{" "}
                                {member.date_of_expiry
                                  ? new Date(
                                      member.date_of_expiry,
                                    ).toLocaleDateString("en-GB")
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {!member.visa_type && !member.visa_number ? (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="italic">No Visa Provided</span>
                          </div>
                        ) : (
                          <div className="flex flex-col text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 tracking-wide mb-1">
                                {member.visa_number}
                              </span>
                              <span className="text-gray-300">•</span>

                              <span className="text-xs text-gray-700 font-medium ">
                                {member.visa_type?.toUpperCase()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span>
                                Exp:{" "}
                                {member.visa_expiry
                                  ? new Date(
                                      member.visa_expiry,
                                    ).toLocaleDateString("en-GB")
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {(isAdmin || moduleAccess.can_manage_flight) && (
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedCrew(member);
                              setFlightModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                  rounded-lg text-xs font-semibold 
                                  bg-gradient-to-r from-blue-50 to-indigo-50 
                                  text-blue-700 border border-blue-200
                                  hover:from-blue-100 hover:to-indigo-100 
                                  hover:border-blue-300 hover:text-blue-800
                                  transition-all duration-200 shadow-sm hover:shadow whitespace-nowrap"
                          >
                            + Add Flight
                          </button>
                        </td>
                      )}
                      {(isAdmin || moduleAccess.can_manage_rooms) && (
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedCrew(member);
                              setRoomModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                  rounded-lg text-xs font-semibold 
                                  bg-gradient-to-r from-purple-50 to-pink-50 
                                  text-purple-700 border border-purple-200
                                  hover:from-purple-100 hover:to-pink-100 
                                  hover:border-purple-300 hover:text-purple-800
                                  transition-all duration-200 shadow-sm hover:shadow whitespace-nowrap"
                          >
                            + Add Room
                          </button>
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                member.id,
                                member.status === "active"
                                  ? "in-active"
                                  : "active",
                              )
                            }
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
                            {member.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
        onClose={() => setRoomModal(false)}
        crewMember={selectedCrew}
      />
      <AddCrewFlightsModal
        isOpen={flightModal}
        onClose={() => setFlightModal(false)}
        crewMember={selectedCrew}
      />
    </div>
  );
};

export default CrewMembers;
