import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  X,
  Loader2,
  Upload,
  Plane,
  Clock,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  Eye,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const AddCrewFlightsModal = ({ isOpen, onClose, crewMember }) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = useMemo(
    () => ({
      from_city: "",
      to_city: "",
      flight_number: "",
      airline: "",
      flight_class: "",
      departure_time: "",
      arrival_time: "",
      pnr: "",
      booking_status: "booked",
      remarks: "",
      newTicketFile: null,
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  // ================= API CALLS =================
  const fetchFlights = useCallback(async () => {
    if (!crewMember?.id) return;

    try {
      setLoading(true);
      const res = await apiCall(`/crew-flights/${crewMember.id}`, "GET");
      const data = res.data || [];

      const formatted = data.map((f) => ({
        ...f,
        departure_time: f.departure_time
          ? new Date(f.departure_time).toISOString().slice(0, 16)
          : "",
        arrival_time: f.arrival_time
          ? new Date(f.arrival_time).toISOString().slice(0, 16)
          : "",
      }));

      setFlights(formatted);
    } catch {
      toast.error("Failed to fetch flights");
    } finally {
      setLoading(false);
    }
  }, [crewMember?.id]);

  const fetchMerchants = useCallback(async () => {
    try {
      const res = await apiCall(
        "/crew-merchant/merchant-type?type=flight",
        "GET",
      );
      setMerchants(res.data || []);
    } catch {
      toast.error("Failed to fetch airlines");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFlights();
      fetchMerchants();
    }
  }, [isOpen, fetchFlights, fetchMerchants]);

  // ================= CREATE/UPDATE =================
  const saveFlight = async () => {
    try {
      setSaving(true);
      const fd = new FormData();

      if (!editingId) {
        fd.append("crew_list_id", crewMember.id);
      }

      Object.keys(form).forEach((k) => {
        if (k !== "newTicketFile") fd.append(k, form[k] || "");
      });

      if (form.newTicketFile) fd.append("ticket", form.newTicketFile);

      if (editingId) {
        await apiCall(`/crew-flights/update/${editingId}`, "PUT", fd, true);
        toast.success("Flight updated successfully");
      } else {
        await apiCall("/crew-flights/create", "POST", fd, true);
        toast.success("Flight added successfully");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchFlights();
    } catch {
      toast.error(
        editingId ? "Failed to update flight" : "Failed to add flight",
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE =================
  const deleteFlight = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flight?")) return;

    try {
      await apiCall(`/crew-flights/delete/${id}`, "DELETE");
      toast.success("Flight deleted");
      fetchFlights();
    } catch {
      toast.error("Failed to delete flight");
    }
  };

  // ================= EDIT =================
  const startEdit = (flight) => {
    setEditingId(flight.id);
    // populate the shared form and open it
    setForm({
      ...flight,
      newTicketFile: null,
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleClose = () => {
    onClose();
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full h-full rounded-lg shadow-xl flex flex-col overflow-hidden animate-slideUp">
        {/* HEADER */}
        <div className="p-4  border-b bg-gradient-to-r from-gray-800 to-gray-800 text-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Plane className="h-6 w-6" />
              Flight Management
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Managing flights for:{" "}
              <span className="font-semibold">
                {crewMember?.given_name} {crewMember?.sur_name}
              </span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className=" bg-slate-50">
            <div className="flex justify-end mb-4">
              {!showForm && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setShowForm(true);
                  }}
                  className="whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg shadow-md bg-gradient-to-r  from-blue-600 hover:from-blue-700 to-blue-700 hover:to-blue-800 text-white text-sm "
                >
                  <Plane className="h-4 w-4" />
                  Add Flight Details
                </button>
              )}
            </div>

            {showForm && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  {editingId ? "Edit Flight" : "Add New Flight"}
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-700 font-medium">
                      From City *
                    </label>
                    <input
                      className="
    w-full h-11 px-4
    rounded-xl
    border border-gray-200
    bg-white
    text-sm text-gray-800
    placeholder:text-gray-400
    shadow-sm
    transition-all duration-200
    hover:border-gray-300
    focus:outline-none
    focus:ring-4 focus:ring-blue-100
    focus:border-blue-500
  "
                      placeholder="e.g., New York"
                      value={form.from_city}
                      onChange={(e) =>
                        setForm({ ...form, from_city: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-700 font-medium">
                      To City *
                    </label>
                    <input
                      className="
    w-full h-11 px-4
    rounded-xl
    border border-gray-200
    bg-white
    text-sm text-gray-800
    placeholder:text-gray-400
    shadow-sm
    transition-all duration-200
    hover:border-gray-300
    focus:outline-none
    focus:ring-4 focus:ring-blue-100
    focus:border-blue-500
  "
                      placeholder="e.g., London"
                      value={form.to_city}
                      onChange={(e) =>
                        setForm({ ...form, to_city: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-700 font-medium">
                      Flight No *
                    </label>
                    <input
                      className="
    w-full h-11 px-4
    rounded-xl
    border border-gray-200
    bg-white
    text-sm text-gray-800
    placeholder:text-gray-400
    shadow-sm
    transition-all duration-200
    hover:border-gray-300
    focus:outline-none
    focus:ring-4 focus:ring-blue-100
    focus:border-blue-500
  "
                      placeholder="e.g., AA123"
                      value={form.flight_number}
                      onChange={(e) =>
                        setForm({ ...form, flight_number: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-700 font-medium">
                      Airline *
                    </label>
                    <select
                      className="
    w-full h-11 px-4
    rounded-xl
    border border-gray-200
    bg-white
    text-sm text-gray-800
    placeholder:text-gray-400
    shadow-sm
    transition-all duration-200
    hover:border-gray-300
    focus:outline-none
    focus:ring-4 focus:ring-blue-100
    focus:border-blue-500
  "
                      value={form.airline}
                      onChange={(e) =>
                        setForm({ ...form, airline: e.target.value })
                      }
                    >
                      <option value="">Select Airline</option>
                      {merchants.map((m) => (
                        <option key={m.id} value={m.merchant_name}>
                          {m.merchant_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-700 font-medium">
                      Class
                    </label>
                    <select
                      className="
    w-full h-11 px-4
    rounded-xl
    border border-gray-200
    bg-white
    text-sm text-gray-800
    placeholder:text-gray-400
    shadow-sm
    transition-all duration-200
    hover:border-gray-300
    focus:outline-none
    focus:ring-4 focus:ring-blue-100
    focus:border-blue-500
  "
                      value={form.flight_class}
                      onChange={(e) =>
                        setForm({ ...form, flight_class: e.target.value })
                      }
                    >
                      <option value="">Select Class</option>
                      <option value="economy">Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-700 font-medium">
                      Departure *
                    </label>
                    <input
                      type="datetime-local"
                      className="
    w-full h-11 px-4
    rounded-xl
    border border-gray-200
    bg-white
    text-sm text-gray-800
    placeholder:text-gray-400
    shadow-sm
    transition-all duration-200
    hover:border-gray-300
    focus:outline-none
    focus:ring-4 focus:ring-blue-100
    focus:border-blue-500
  "
                      value={form.departure_time}
                      onChange={(e) =>
                        setForm({ ...form, departure_time: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-700 font-medium">
                      Arrival *
                    </label>
                    <input
                      type="datetime-local"
                      className="
    w-full h-11 px-4
    rounded-xl
    border border-gray-200
    bg-white
    text-sm text-gray-800
    placeholder:text-gray-400
    shadow-sm
    transition-all duration-200
    hover:border-gray-300
    focus:outline-none
    focus:ring-4 focus:ring-blue-100
    focus:border-blue-500
  "
                      value={form.arrival_time}
                      onChange={(e) =>
                        setForm({ ...form, arrival_time: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-700 font-medium">
                      PNR
                    </label>
                    <input
                      className="
    w-full h-11 px-4
    rounded-xl
    border border-gray-200
    bg-white
    text-sm text-gray-800
    placeholder:text-gray-400
    shadow-sm
    transition-all duration-200
    hover:border-gray-300
    focus:outline-none
    focus:ring-4 focus:ring-blue-100
    focus:border-blue-500
  "
                      placeholder="Booking reference"
                      value={form.pnr}
                      onChange={(e) =>
                        setForm({ ...form, pnr: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1 flex flex-col gap-2">
                    <label className="text-sm text-gray-700 font-medium">
                      Remarks
                    </label>

                    <textarea
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm
          transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                      placeholder="Add your remarks"
                      value={form.remarks}
                      onChange={(e) =>
                        setForm({ ...form, remarks: e.target.value })
                      }
                    >
                      {" "}
                    </textarea>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4 mt-6">
                  <label className="flex items-center gap-2 bg-white border-2 border-dashed border-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {form.newTicketFile
                        ? form.newTicketFile.name
                        : "Upload Ticket"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setForm({ ...form, newTicketFile: e.target.files[0] })
                      }
                    />
                  </label>

                  <div className="flex gap-2 items-center">
                    <button
                      onClick={saveFlight}
                      disabled={saving}
                      className="whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg shadow-md bg-gradient-to-r  from-blue-600 hover:from-blue-700 to-blue-700 hover:to-blue-800 text-white text-sm "
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {editingId ? "Updating..." : "Saving..."}
                        </>
                      ) : (
                        <>
                          <Plane className="h-4 w-4" />
                          {editingId ? "Update Flight" : "Add Flight"}
                        </>
                      )}
                    </button>

                    <button
                      onClick={cancelForm}
                      className="px-5 py-2 border bg-white rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : flights.length === 0 && !showForm ? (
              <div className="relative overflow-hidden rounded-2xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-12 text-center shadow-sm">
                {/* background glow */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_60%)]"></div>

                <div className="relative z-10 flex flex-col items-center">
                  {/* ICON */}
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-lg mb-5 animate-float">
                    <Plane className="h-10 w-10 text-white" />
                  </div>

                  {/* TITLE */}
                  <h3 className="text-xl font-semibold text-gray-800 tracking-tight">
                    No Flights Added Yet
                  </h3>

                  {/* DESC */}
                  <p className="text-gray-500 mt-2 max-w-sm">
                    Start building the crew travel schedule by adding flight
                    details. All booked flights will appear here.
                  </p>

                  {/* CTA hint */}
                  <div className="mt-6 flex items-center gap-2 text-sm text-blue-600 bg-blue-100 px-4 py-2 rounded-full">
                    <span className="animate-pulse">✈</span>
                    Click <span className="font-semibold">"Add Flight"</span> to
                    begin
                  </div>
                </div>

                {/* floating animation */}
                <style>{`
    @keyframes float {
      0% { transform: translateY(0px);}
      50% { transform: translateY(-6px);}
      100% { transform: translateY(0px);}
    }
    .animate-float{
      animation: float 3s ease-in-out infinite;
    }
  `}</style>
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((flight) => (
                  <div
                    key={flight.id}
                    className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-[2px]"
                  >
                    {/* LEFT BORDER ACCENT */}
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-white via-blue-500 to-white rounded-l-2xl opacity-80 group-hover:opacity-100"></div>

                    <div className="flex flex-wrap justify-between gap-6">
                      {/* ================= LEFT CONTENT ================= */}
                      <div className="flex-1 min-w-[260px]">
                        {/* ROUTE HEADER */}
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-md">
                            <Plane className="h-5 w-5 text-white" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                              {flight.from_city}
                              <span className="mx-2 text-gray-400">→</span>
                              {flight.to_city}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                              <span className="font-semibold text-gray-700">
                                {flight.flight_number}
                              </span>
                              <span>•</span>
                              <span>{flight.airline}</span>
                              {flight.flight_class && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">
                                    {flight.flight_class}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* TIME SECTION */}
                        <div className="grid sm:grid-cols-3 gap-6 mt-5">
                          {/* DEPARTURE */}
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <Clock className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Departure</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {flight.departure_time
                                  ? new Date(
                                      flight.departure_time,
                                    ).toLocaleString()
                                  : "-"}
                              </p>
                            </div>
                          </div>

                          {/* ARRIVAL */}
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <Clock className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Arrival</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {flight.arrival_time
                                  ? new Date(
                                      flight.arrival_time,
                                    ).toLocaleString()
                                  : "-"}
                              </p>
                            </div>
                          </div>

                          {/* PNR */}
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <FileText className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">PNR</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {flight.pnr || "Not added"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* STATUS + CLASS */}
                        <div className="flex items-center gap-3 mt-5 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide
                              ${
                                flight.booking_status === "confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : flight.booking_status === "cancelled"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {flight.booking_status?.toUpperCase()}
                          </span>

                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Class: {flight.flight_class || "Not set"}
                          </span>
                        </div>

                        <div className="mt-2">
                          {flight.remarks && (
                            <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p>{flight.remarks}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ================= RIGHT ACTIONS ================= */}
                      <div className="flex flex-col items-end justify-between gap-3">
                        {/* ACTION BUTTONS */}
                        <div className="flex gap-2">
                          {flight.ticket_file && (
                            <a
                              href={flight.ticket_file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                              title="View Ticket"
                            >
                              View Ticket
                            </a>
                          )}

                          <button
                            onClick={() => startEdit(flight)}
                            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                            title="Edit Flight"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => deleteFlight(flight.id)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Delete Flight"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        {/* MINI TIMELINE */}
                        <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-400">
                          <MapPin size={12} />
                          {flight.from_city} → {flight.to_city}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCrewFlightsModal;
