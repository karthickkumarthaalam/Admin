import React, { useEffect, useState } from "react";
import { usePermission } from "../../context/PermissionContext";
import { toast } from "react-toastify";
import { apiCall } from "../../utils/apiCall";
import debounce from "lodash.debounce";
import BreadCrumb from "../BreadCrum";
import {
  BadgePlus,
  Edit,
  Loader2,
  MessageCircleMore,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import AddCrewManagement from "./AddCrewManagement";
import CrewMembers from "./CrewMembers/CrewMembers";
import CrewPermissionModal from "./CrewPermissionModal";
import { useAuth } from "../../context/AuthContext";
import CrewManagementDocumentModal from "./CrewManagementDocumentModal";

const CrewManagementPage = () => {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [addCrewModal, setAddCrewModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [addCrewMembers, setAddCrewMember] = useState(false);

  const [openCrewDocument, setOpenCrewDocument] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const [permissionModal, setPermissionModal] = useState(false);
  const [selectedPermissionCrew, setSelectedPermissionCrew] = useState(null);

  const [selectedDocType, setSelectedDocType] = useState(null);

  const { hasPermission } = usePermission();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.name === "admin";
  const pageSize = 20;

  const embassyDocumentTypes = [
    { key: "invitation_letter", label: "Invitation Letter" },
    { key: "covering_letter", label: "Covering Letter" },
    { key: "crew_list", label: "Crew List" },
    { key: "flyer", label: "Flyer" },
    { key: "thaalam_profile", label: "Thaalam Profile" },
    { key: "hotel_itinerary", label: "Hotel Itinerary" },
    { key: "switzerland_residence_id", label: "Switzerland Residence ID" },
    { key: "company_registration", label: "Company Registration" },
    { key: "passport", label: "Passport" },
  ];

  const fetchCrew = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/crew-management?page=${currentPage}&limit=${pageSize}&search=${searchTerm}`,
      );
      setCrew(response.data);
      setTotalRecords(response.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch crew members, please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrew();
  }, [currentPage, pageSize, searchTerm]);

  const handleSearch = debounce((value) => {
    setSearchTerm(value);
  }, 500);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Crew?")) return;
    try {
      await apiCall(`/crew-management/${id}`, "DELETE");
      toast.success("Crew deleted successfully");
      setCrew((prev) => prev.filter((item) => item.id !== id));
      setTotalRecords((prev) => prev - 1);
    } catch (error) {
      toast.error("Failed to delete Crew");
    }
  };
  const handleToggleStatus = async (id) => {
    if (!window.confirm("Do you want to update the status of this crew"))
      return;

    const previousCrew = [...crew];

    setCrew((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_active: !item.is_active } : item,
      ),
    );

    try {
      const res = await apiCall(
        `/crew-management/toggle-status/${id}`,
        "PATCH",
      );

      setCrew((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_active: res.is_active } : item,
        ),
      );

      toast.success(
        res.is_active ? "Access enabled successfully" : "Access disabled",
      );
    } catch (error) {
      setCrew(previousCrew);
      toast.error("Failed to update status");
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb
        title={"Crew Management"}
        paths={["Events", "Crew Management"]}
      />
      <div className="mt-4 rounded-xl shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
          <p className="text-sm sm:text-lg font-semibold text-gray-800">
            Event Crew Management
          </p>
          {hasPermission("Crew Management", "create") && (
            <button
              onClick={() => {
                setAddCrewModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 shadow-sm "
            >
              <BadgePlus size={16} />
              <span>Add Crew </span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-end my-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800"
            />
            <input
              type="text"
              placeholder="Search Crew"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin mt-4 max-w-full border border-gray-200 rounded-xl shadow-sm bg-white ">
            <table className="w-full text-sm ">
              <thead className="bg-gray-700 text-white">
                <tr className="text-left">
                  <th className="py-3 px-3 sm:px-4">#</th>
                  <th className="py-3 px-3 sm:px-4">Crew ID</th>
                  <th className="py-3 px-3 sm:px-4">Title</th>
                  <th className="py-3 px-3 sm:px-4 whitespace-nowrap">
                    Crew Admin Email
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                    Crew Members
                  </th>
                  {isAdmin && (
                    <th className="py-3 px-3 sm:px-4 text-center">
                      Permission
                    </th>
                  )}

                  {/* {isAdmin && (
                    <th className="py-3 px-3 sm:px-4 text-center">Documents</th>
                  )} */}
                  <th className="py-3 px-3 sm:px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {crew.length === 0 ? (
                  <tr>
                    <td colSpan="100%" className="py-14">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                          <MessageCircleMore
                            size={32}
                            className="text-blue-600"
                          />
                        </div>

                        <p className="text-base font-semibold text-gray-700">
                          No Crew Management found
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search or add a new crew member
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  crew.map((item, index) => (
                    <>
                      <tr
                        key={item.id}
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === item.id ? null : item.id,
                          )
                        }
                        className="hover:bg-slate-50 transition border-b"
                      >
                        <td className="py-3 px-3 sm:px-4 text-gray-700 font-semibold">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <span className="text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-md text-xs sm:text-sm">
                            {item.crew_id}
                          </span>
                        </td>
                        <td className="py-3 px-3 sm:px-4 font-bold text-slate-700 whitespace-nowrap">
                          <h2>{item.title}</h2>
                          <span className="text-slate-500 text-xs font-medium">
                            {item.description}
                          </span>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          {item.email ? (
                            <div className="flex items-center gap-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={item.is_active}
                                  onChange={() => handleToggleStatus(item.id)}
                                  className="sr-only peer"
                                />

                                <div
                                  className="w-11 h-6 bg-gray-300 rounded-full peer 
          peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500
          transition-all duration-300"
                                ></div>

                                <div
                                  className="absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full shadow-md
          transition-all duration-300 peer-checked:translate-x-5"
                                ></div>
                              </label>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                  {item.email}
                                </span>

                                <span
                                  className={`text-xs font-semibold mt-1  ${
                                    item.is_active
                                      ? "text-green-600"
                                      : "text-red-500"
                                  }`}
                                >
                                  {item.is_active
                                    ? "Access Enabled"
                                    : "Access Disabled"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400 italic">
                                No Access Assigned
                              </span>
                              <span className="text-[11px] text-gray-300 whitespace-nowrap">
                                Add email to enable login
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddCrewMember(true);
                              setSelectedCrew(item);
                            }}
                            className="font-semibold text-green-600 bg-green-50 border border-green-200 hover:bg-green-100 rounded-md text-xs sm:text-sm px-3 py-1 cursor-pointer whitespace-nowrap "
                          >
                            Crew Members
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-3 sm:px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPermissionCrew(item);
                                setPermissionModal(true);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold 
    bg-indigo-50 text-indigo-700 border border-indigo-200 
    rounded-lg hover:bg-indigo-100 transition whitespace-nowrap"
                            >
                              Manage Access
                            </button>
                          </td>
                        )}
                        {/* {isAdmin && (
                          <td className="py-3 px-3 sm:px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCrew(item);
                                setOpenCrewDocument(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
      bg-blue-50 text-blue-700 border border-blue-200
      rounded-lg hover:bg-blue-100 transition whitespace-nowrap"
                            >
                              <Upload size={14} />
                              Documents
                            </button>
                          </td>
                        )} */}
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex justify-center gap-2">
                            {hasPermission("Crew Management", "update") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCrew(item);
                                  setAddCrewModal(true);
                                }}
                                className="text-sm border border-gray-200  text-blue-500 hover:bg-blue-50 hover:border-blue-500 p-2  rounded-md"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {hasPermission("Crew Management", "delete") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
                                }}
                                className="text-sm border border-gray-200  text-red-500 hover:bg-red-50 hover:border-red-500  p-2 rounded-md"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedRow === item.id && (
                        <tr className="bg-purple-50">
                          <td colSpan="100%" className="px-8 py-7">
                            <div className="rounded-2xl border bg-white shadow-sm p-5">
                              <div className="flex items-center justify-between gap-3 mb-4">
                                <h3 className="font-semibold text-gray-800 text-base">
                                  📁 Embassy Documents
                                </h3>

                                <button
                                  onClick={() => {
                                    setOpenCrewDocument(true);
                                    setSelectedCrew(item);
                                    setSelectedDocType(null);
                                  }}
                                >
                                  <Upload
                                    size={20}
                                    className="text-indigo-600"
                                  />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {embassyDocumentTypes.map((doc) => (
                                  <DocumentRow
                                    key={doc.key}
                                    type={doc.key}
                                    title={doc.label}
                                    docs={item.documents || []}
                                    onOpenModal={() => {
                                      setSelectedCrew(item);
                                      setSelectedDocType(doc.key);
                                      setOpenCrewDocument(true);
                                    }}
                                  />
                                ))}
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
      <CrewMembers
        isOpen={addCrewMembers}
        onClose={() => {
          setAddCrewMember(false);
          setSelectedCrew(null);
        }}
        crewManagement={selectedCrew}
      />
      <AddCrewManagement
        isOpen={addCrewModal}
        onClose={() => {
          setSelectedCrew(null);
          setAddCrewModal(false);
        }}
        onSuccess={fetchCrew}
        editCrewData={selectedCrew}
      />
      <CrewPermissionModal
        isOpen={permissionModal}
        onClose={() => setPermissionModal(false)}
        crew={selectedPermissionCrew}
      />
      <CrewManagementDocumentModal
        isOpen={openCrewDocument}
        onClose={() => {
          setSelectedCrew(null);
          setOpenCrewDocument(false);
        }}
        crew={selectedCrew}
        selectedType={selectedDocType}
      />
    </div>
  );
};

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
                {file.document_type}
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
    </div>
  );
};

export default CrewManagementPage;
