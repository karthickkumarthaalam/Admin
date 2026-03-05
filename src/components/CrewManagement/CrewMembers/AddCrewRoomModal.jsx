import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  X,
  Loader2,
  Hotel,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Edit2,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Building,
  Wallet2,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const AddCrewRoomsModal = ({ isOpen, onClose, crewMember }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  const emptyForm = useMemo(
    () => ({
      hotel_name: "",
      room_number: "",
      room_type: "",
      city: "",
      checkin_date: "",
      checkout_date: "",
      checkin_time: "",
      checkout_time: "",
      remarks: "",
      currency: "",
      room_charge: 0,
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  const fetchRooms = useCallback(async () => {
    if (!crewMember?.id) return;

    try {
      setLoading(true);
      const res = await apiCall(`/crew-rooms/${crewMember.id}`, "GET");
      const data = res.data || [];

      const formatted = data.map((r) => ({
        ...r,
        checkin_date: r.checkin_date || "",
        checkout_date: r.checkout_date || "",
        checkin_time: r.checkin_time || "",
        checkout_time: r.checkout_time || "",
      }));

      setRooms(formatted);
    } catch {
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  }, [crewMember?.id]);

  const fetchRoomMerchants = useCallback(async () => {
    try {
      const res = await apiCall(
        "/crew-merchant/merchant-type?type=room",
        "GET",
      );
      setMerchants(res.data || []);
    } catch {
      toast.error("Failed to fetch hotels");
    }
  }, []);

  const fetchCurrency = useCallback(async () => {
    try {
      const res = await apiCall(`/currency`, "GET");
      setCurrencies(res.data);
    } catch (error) {
      toast.error("Failed to fetch currency");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      fetchRoomMerchants();
      fetchCurrency();
    }
  }, [isOpen, fetchRooms, fetchRoomMerchants]);

  // ================= FORM VALIDATION =================
  const validateForm = (formData) => {
    const required = ["hotel_name", "city", "checkin_date", "checkout_date"];
    const missing = required.filter((field) => !formData[field]);

    if (missing.length > 0) {
      toast.error(`Missing required fields: ${missing.join(", ")}`);
      return false;
    }

    if (new Date(formData.checkout_date) <= new Date(formData.checkin_date)) {
      toast.error("Check-out date must be after check-in date");
      return false;
    }

    return true;
  };

  // ================= CREATE/UPDATE =================
  const saveRoom = async () => {
    if (!validateForm(form)) return;

    try {
      setSaving(true);
      const payload = {
        crew_list_id: crewMember.id,
        hotel_name: form.hotel_name,
        room_number: form.room_number,
        room_type: form.room_type,
        city: form.city,
        checkin_date: form.checkin_date,
        checkout_date: form.checkout_date,
        checkin_time: form.checkin_time ? `${form.checkin_time}:00` : null,
        checkout_time: form.checkout_time ? `${form.checkout_time}:00` : null,
        remarks: form.remarks,
        currency: form.currency,
        room_charge: form.room_charge,
      };

      if (editingId) {
        await apiCall(`/crew-rooms/update/${editingId}`, "PUT", payload);
        toast.success("Room updated successfully");
      } else {
        await apiCall("/crew-rooms/create", "POST", payload);
        toast.success("Room added successfully");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchRooms();
    } catch {
      toast.error(editingId ? "Failed to update room" : "Failed to add room");
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE =================
  const deleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room booking?"))
      return;

    try {
      await apiCall(`/crew-rooms/delete/${id}`, "DELETE");
      toast.success("Room deleted");
      fetchRooms();
    } catch {
      toast.error("Failed to delete room");
    }
  };

  // ================= EDIT =================
  const startEdit = (room) => {
    setEditingId(room.id);
    setForm({
      ...room,
      newAttachment: null,
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

  const selectedRoom = merchants.find(
    (m) => m.merchant_name === form.hotel_name,
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-slate-50 w-full h-full rounded-lg shadow-xl flex flex-col overflow-hidden animate-slideUp">
        {/* HEADER */}
        <div className="p-4 border-b bg-gray-800 text-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Hotel className="h-6 w-6" />
              Room Management
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Managing rooms for:{" "}
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
          {/* ADD BUTTON */}
          <div className="flex justify-end">
            {!showForm && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setShowForm(true);
                }}
                className="whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg shadow-md bg-gradient-to-r  from-blue-600 hover:from-blue-700 to-blue-700 hover:to-blue-800 text-white text-sm "
              >
                <Plus className="h-4 w-4" />
                Add Room Booking
              </button>
            )}
          </div>

          {/* ADD/EDIT FORM */}
          {showForm && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6 animate-slideDown">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                {editingId ? "Edit Room Booking" : "Add New Room Booking"}
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Hotel Name *
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
                    value={form.hotel_name}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setForm({ ...form, hotel_name: selected, room_type: "" });
                    }}
                  >
                    <option value="">Select Hotel</option>
                    {merchants.map((m) => (
                      <option key={m.id} value={m.merchant_name}>
                        {m.merchant_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Room Number
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
                    placeholder="e.g., 101, Suite A"
                    value={form.room_number}
                    onChange={(e) =>
                      setForm({ ...form, room_number: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Room Type
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
                    value={form.room_type}
                    onChange={(e) =>
                      setForm({ ...form, room_type: e.target.value })
                    }
                  >
                    <option value="">Select Type</option>

                    {selectedRoom?.merchant_category?.length > 0 ? (
                      selectedRoom.merchant_category.map((cat, i) => (
                        <option key={i} value={cat.toLowerCase()}>
                          {cat}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="suite">Suite</option>
                        <option value="deluxe">Deluxe</option>
                        <option value="presidential">Presidential</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    City *
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
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
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
                    value={form.checkin_date}
                    onChange={(e) =>
                      setForm({ ...form, checkin_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Check-in Time
                  </label>
                  <input
                    type="time"
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
                    value={form.checkin_time}
                    onChange={(e) =>
                      setForm({ ...form, checkin_time: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
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
                    value={form.checkout_date}
                    onChange={(e) =>
                      setForm({ ...form, checkout_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Check-out Time
                  </label>
                  <input
                    type="time"
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
                    value={form.checkout_time}
                    onChange={(e) =>
                      setForm({ ...form, checkout_time: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-700 font-medium">
                    Currency
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
                    value={form.currency}
                    onChange={(e) =>
                      setForm({ ...form, currency: e.target.value })
                    }
                  >
                    <option value="">Select Currency</option>
                    {currencies.map((curr) => (
                      <option key={curr.id} value={curr.symbol}>
                        {curr.currency_name} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-700 font-medium">
                    Room Charge
                  </label>
                  <input
                    type="number"
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
                    placeholder="0"
                    value={form.room_charge}
                    onChange={(e) =>
                      setForm({ ...form, room_charge: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1 ">
                  <label className="text-sm text-gray-700 font-medium">
                    Remarks
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm
          transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    rows="2"
                    placeholder="Any special requests or notes..."
                    value={form.remarks}
                    onChange={(e) =>
                      setForm({ ...form, remarks: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 mt-6">
                <div className="flex gap-2">
                  <button
                    onClick={saveRoom}
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
                        <Hotel className="h-4 w-4" />
                        {editingId ? "Update Room" : "Add Room"}
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

          {/* ROOMS LIST */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : rooms.length === 0 && !showForm ? (
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-12 text-center shadow-sm">
              {/* Background glow */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.15),transparent_60%)]"></div>

              <div className="relative z-10 flex flex-col items-center">
                {/* Icon */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl shadow-lg mb-5 animate-float">
                  <Hotel className="h-10 w-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-800 tracking-tight">
                  No Room Bookings Yet
                </h3>

                {/* Description */}
                <p className="text-gray-500 mt-2 max-w-sm">
                  Start adding room accommodations for the crew member. All
                  bookings will appear here.
                </p>

                {/* CTA hint */}
                <div className="mt-6 flex items-center gap-2 text-sm text-blue-600 bg-blue-100 px-4 py-2 rounded-full">
                  <span className="animate-pulse">🏨</span>
                  Click{" "}
                  <span className="font-semibold">"Add Room Booking"</span> to
                  begin
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => {
                const isActive = new Date(room.checkout_date) > new Date();
                const isCompleted = new Date(room.checkout_date) <= new Date();

                return (
                  <div
                    key={room.id}
                    className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-[2px]"
                  >
                    {/* Left border accent based on status */}
                    <div
                      className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-white rounded-l-2xl opacity-80 group-hover:opacity-100 ${
                        isActive
                          ? "via-blue-500 to-white"
                          : isCompleted
                            ? "via-gray-400 to-white"
                            : "via-yellow-500 to-white"
                      }`}
                    ></div>

                    <div className="flex flex-wrap justify-between gap-6">
                      {/* Left Content */}
                      <div className="flex-1 min-w-[260px]">
                        {/* Hotel Header */}
                        <div className="flex items-start gap-4">
                          <div
                            className={`bg-gradient-to-br p-3 rounded-xl shadow-md ${
                              isActive
                                ? "from-blue-500 to-blue-600"
                                : "from-gray-500 to-gray-600"
                            }`}
                          >
                            <Hotel className="h-5 w-5 text-white" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                              {room.hotel_name}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{room.city}</span>
                              {room.room_number && (
                                <>
                                  <span>•</span>
                                  <span>Room: {room.room_number}</span>
                                </>
                              )}
                              {room.room_type && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">
                                    {room.room_type}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Date Section */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4  gap-4 mt-5">
                          {/* Check-in */}
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <Calendar className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Check-in</p>
                              <p className="text-sm font-semibold text-gray-800">
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
                            </div>
                          </div>

                          {/* Check-out */}
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <Calendar className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Check-out</p>
                              <p className="text-sm font-semibold text-gray-800">
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
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <Wallet2 className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">
                                Room Charge
                              </p>
                              <p className="text-sm font-semibold text-gray-800">
                                {room.room_charge
                                  ? `${room.currency || ""} ${room.room_charge}`
                                  : "Not added"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Duration Badge */}
                        {room.checkin_date && room.checkout_date && (
                          <div className="mt-3 flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {(() => {
                                const diff =
                                  new Date(room.checkout_date) -
                                  new Date(room.checkin_date);
                                const days = Math.floor(diff / 86400000);
                                const nights = days;
                                return `${days} ${days === 1 ? "day" : "days"} (${nights} ${nights === 1 ? "night" : "nights"})`;
                              })()}
                            </span>
                          </div>
                        )}

                        {/* Status + Remarks */}
                        <div className="mt-4 space-y-2">
                          {room.remarks && (
                            <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p>{room.remarks}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex flex-col items-end justify-between gap-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(room)}
                            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                            title="Edit Room"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => deleteRoom(room.id)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Delete Room"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Mini Location */}
                        <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-400">
                          <MapPin size={12} />
                          {room.city}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCrewRoomsModal;
