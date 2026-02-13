import React, { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Tag,
  User,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

const EventEnquiryModal = ({ isOpen, onClose, event }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const pageSize = 50;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const fetchEnquiries = useCallback(async () => {
    if (!isOpen || !event?.id) return;

    setLoading(true);
    try {
      const response = await apiCall(
        `/event-enquiries/enquiry/${event.id}?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(
          searchQuery,
        )}&status=${status}`,
        "GET",
      );

      setEnquiries(response?.data || []);
      setTotalRecords(response?.pagination?.totalRecords || 0);
    } catch (error) {
      setEnquiries([]);
      setTotalRecords(0);
      toast.error("Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  }, [isOpen, event?.id, currentPage, pageSize, searchQuery, status]);

  useEffect(() => {
    if (!isOpen || !event?.id) return;
    fetchEnquiries();
  }, [fetchEnquiries, isOpen, event?.id]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPage(1);
    setSearchQuery("");
    setStatus("");
    setSelectedEnquiry(null);
    setIsMessageModalOpen(false);
  }, [isOpen, event?.id]);

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);

      const response = await apiCall(`/event-enquiries/${id}/status`, "PUT", {
        status: newStatus,
      });

      if (response?.status === "success") {
        // Update UI without refetch
        setEnquiries((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item,
          ),
        );

        toast.success("Status updated successfully");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full h-full rounded-xl bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-slate-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Event Enquiries
            </h2>
            {event?.title && (
              <p className="text-sm text-gray-500 mt-1">{event.title}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-4 flex-1 overflow-y-auto">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              {(currentPage - 1) * pageSize + (enquiries.length ? 1 : 0)} to{" "}
              {(currentPage - 1) * pageSize + enquiries.length} of{" "}
              {totalRecords}
            </p>

            <div className="flex gap-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Search..."
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearchQuery(e.target.value);
                  }}
                  className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>

              <select
                value={status}
                onChange={(e) => {
                  setCurrentPage(1);
                  setStatus(e.target.value);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-200 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" size={28} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700 text-white">
                    <tr className="text-left">
                      <th className="px-4 py-3">SI</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No enquiries found
                        </td>
                      </tr>
                    ) : (
                      enquiries.map((enquiry, index) => (
                        <tr
                          key={enquiry.id}
                          className="border-t border-gray-100"
                        >
                          <td className="px-4 py-3">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td className="px-4 py-3">{enquiry.name}</td>
                          <td className="px-4 py-3">{enquiry.email}</td>
                          <td className="px-4 py-3">{enquiry.phone}</td>
                          <td className="px-4 py-3">{enquiry.subject}</td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <select
                                value={enquiry.status}
                                disabled={updatingId === enquiry.id}
                                onChange={(e) =>
                                  updateStatus(enquiry.id, e.target.value)
                                }
                                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize border
                                        ${
                                          enquiry.status === "pending"
                                            ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                                            : enquiry.status === "resolved"
                                              ? "bg-green-50 text-green-800 border-green-200"
                                              : "bg-gray-100 text-gray-700 border-gray-200"
                                        }
                                        focus:outline-none cursor-pointer
                                      `}
                              >
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>

                              {updatingId === enquiry.id && (
                                <Loader2
                                  size={14}
                                  className="absolute -right-5 top-1/2 -translate-y-1/2 animate-spin text-gray-500"
                                />
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEnquiry(enquiry);
                                setIsMessageModalOpen(true);
                              }}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              View Message
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded border disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded border disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>

      <EnquiryMessageModal
        isOpen={isMessageModalOpen}
        enquiry={selectedEnquiry}
        onClose={() => {
          setIsMessageModalOpen(false);
          setSelectedEnquiry(null);
        }}
      />
    </div>
  );
};

const EnquiryMessageModal = ({ isOpen, enquiry, onClose }) => {
  if (!isOpen || !enquiry) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with gradient */}
        <div className="relative px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                  Enquiry Details
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-2 ml-11">
                <Calendar size={14} className="text-gray-400" />
                <p className="text-xs text-gray-500">
                  Submitted on{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(enquiry.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200 group"
            >
              <X
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
          </div>
        </div>

        {/* Body with improved spacing */}
        <div className="px-6 py-8 space-y-8">
          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group rounded-lg bg-gray-50 p-4 hover:bg-gray-100/80 transition-colors duration-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Full Name
              </p>
              <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                {enquiry.name}
              </p>
            </div>

            <div className="group rounded-lg bg-gray-50 p-4 hover:bg-gray-100/80 transition-colors duration-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Email Address
              </p>
              <p className="text-base text-gray-900 flex items-center gap-2 break-all">
                <Mail size={16} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{enquiry.email}</span>
              </p>
            </div>

            <div className="group rounded-lg bg-gray-50 p-4 hover:bg-gray-100/80 transition-colors duration-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Phone Number
              </p>
              <p className="text-base text-gray-900 flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                {enquiry.phone || (
                  <span className="text-gray-400 italic">Not provided</span>
                )}
              </p>
            </div>

            <div className="group rounded-lg bg-gray-50 p-4 hover:bg-gray-100/80 transition-colors duration-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Subject
              </p>
              <p className="text-base text-gray-900 flex items-center gap-2">
                <Tag size={16} className="text-gray-400" />
                {enquiry.subject || (
                  <span className="text-gray-400 italic">No subject</span>
                )}
              </p>
            </div>
          </div>

          {/* Message Section - Enhanced */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 bg-blue-500 rounded-full"></div>
              <p className="text-sm font-semibold text-gray-700">
                Message Content
              </p>
            </div>

            <div className="relative">
              {enquiry.message ? (
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto prose prose-sm max-w-none">
                  {enquiry.message}
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
                  <MessageCircle
                    size={32}
                    className="mx-auto text-gray-400 mb-2"
                  />
                  <p className="text-gray-500 italic">No message provided</p>
                </div>
              )}

              {/* Decorative corner accent */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-200 rounded-tl-xl pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Footer with subtle design */}
        <div className="flex justify-end items-center px-6 py-4 border-t border-gray-100 bg-gray-50/80">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <X size={16} />
            Close Enquiry
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventEnquiryModal;
