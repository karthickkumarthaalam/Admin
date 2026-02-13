import React, { useCallback, useEffect, useState, useMemo } from "react";
import { usePermission } from "../../../context/PermissionContext";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import BreadCrumb from "../../BreadCrum";
import {
  BadgePlus,
  Search,
  MapPin,
  CalendarDays,
  Edit,
  Trash2,
  Loader2,
  Globe,
  Image as ImageIcon,
} from "lucide-react";
import AddEventModal from "../EventModal/AddEventModal";
import EventEnquiryModal from "../EventEnquiry/EventEnquiryModal";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editEventData, setEditEventData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { hasPermission } = usePermission();
  const pageSize = 10;

  /* ----------------------------- Debounced Search ---------------------------- */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ----------------------------- Fetch Events ----------------------------- */
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall(
        `/event?page=${currentPage}&limit=${pageSize}&search=${debouncedSearch}&status=${
          statusFilter !== "all" ? statusFilter : ""
        }`,
        "GET",
      );
      setEvents(res.data || []);
      setTotalRecords(res.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  /* ----------------------------- Formatters ----------------------------- */
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const getStatusBadge = useCallback((status) => {
    const style = {
      planning: "bg-gray-100 text-gray-700 border-gray-200",
      upcoming: "bg-blue-100 text-blue-800 border-blue-200",
      ongoing: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-purple-100 text-purple-800 border-purple-200",
      postponed: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${
          style[status] || style.planning
        }`}
      >
        {status}
      </span>
    );
  }, []);

  /* ----------------------------- Handlers ----------------------------- */
  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm("Are you sure you want to delete this event?")) {
        setDeletingId(id);
        try {
          await apiCall(`/event/${id}`, "DELETE");
          toast.success("Event deleted successfully!");
          fetchEvents();
        } catch {
          toast.error("Failed to delete event");
        } finally {
          setDeletingId(null);
        }
      }
    },
    [fetchEvents],
  );

  const handleEdit = useCallback((item) => {
    setEditEventData(item);
    setShowModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditEventData(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchEvents();
    handleModalClose();
  }, [fetchEvents, handleModalClose]);

  const handleOpenEnquiryModal = useCallback((item) => {
    setSelectedEvent(item);
    setShowEnquiryModal(true);
  }, []);

  const handleCloseEnquiryModal = useCallback(() => {
    setShowEnquiryModal(false);
    setSelectedEvent(null);
  }, []);

  /* ----------------------------- Pagination ----------------------------- */
  const totalPages = useMemo(
    () => Math.ceil(totalRecords / pageSize),
    [totalRecords],
  );

  /* ----------------------------- UI States ----------------------------- */
  const loadingState = (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Loader2 className="animate-spin text-blue-600 mb-3" size={28} />
      <p className="text-gray-600">Loading events...</p>
    </div>
  );

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <ImageIcon size={42} className="text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-800">No Events Found</h3>
      <p className="text-gray-500 text-sm">
        {searchQuery || statusFilter !== "all"
          ? "Try adjusting your filters or search terms"
          : "Start by creating a new event"}
      </p>
      {hasPermission("Events", "create") && (
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
        >
          + Create Event
        </button>
      )}
    </div>
  );

  /* ----------------------------- Render ----------------------------- */
  return (
    <div className="flex flex-col flex-1">
      <BreadCrumb
        title="Event Management"
        paths={["Events", "Event Management"]}
      />

      <div className="mt-4 rounded-xl shadow-sm px-6 py-6 bg-white flex-1 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-5">
          <h1 className="text-lg font-semibold text-gray-900">
            Event Management
          </h1>
          {hasPermission("Events", "create") && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 shadow-sm"
            >
              <BadgePlus size={18} />
              Add Event
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search events by title or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="postponed">Postponed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Event Table */}
        {loading ? (
          loadingState
        ) : events.length === 0 ? (
          emptyState
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Enquiry
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {events.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-all duration-150"
                  >
                    {/* Index */}
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    {/* Event Logo + Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.logo_image ? (
                          <img
                            src={item.logo_image}
                            alt="Logo"
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border">
                            <ImageIcon size={18} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold whitespace-nowrap text-gray-900 line-clamp-1">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2 whitespace-nowrap mb-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{item.venue || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Globe size={14} className="text-gray-400" />
                        <span>
                          {item.city
                            ? `${item.city}, ${item.state}, ${item.country}`
                            : item.country || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(item.start_date)}{" "}
                      {item.end_date && (
                        <span className="text-gray-500">
                          {" "}
                          – {formatDate(item.end_date)}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleOpenEnquiryModal(item)}
                        className="text-blue-600 hover:underline text-sm font-semibold whitespace-nowrap"
                      >
                        View Enquiries
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 flex gap-2">
                      {hasPermission("Events", "update") && (
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition-all duration-200"
                          title="Edit Event"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {hasPermission("Events", "delete") && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className={`p-2 border rounded-lg text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 ${
                            deletingId === item.id ? "opacity-50" : ""
                          }`}
                          title="Delete Event"
                        >
                          {deletingId === item.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-4 gap-4">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddEventModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editEventData={editEventData}
      />
      <EventEnquiryModal
        isOpen={showEnquiryModal}
        onClose={handleCloseEnquiryModal}
        event={selectedEvent}
      />
    </div>
  );
};

export default EventList;
