import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const AddCrewRoomsModal = ({ isOpen, onClose, crewMember }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState([]);

  const emptyRow = {
    hotel_name: "",
    room_number: "",
    room_type: "",
    city: "",
    checkin_date: "",
    checkout_date: "",
    remarks: "",
  };

  // 🟢 fetch existing
  const fetchRooms = async () => {
    if (!crewMember?.id) return;
    try {
      setLoading(true);
      const res = await apiCall(`/crew-rooms/${crewMember.id}`, "GET");
      const data = res.data || [];

      const formatted = data.map((r) => ({
        ...r,
        checkin_date: r.checkin_date
          ? new Date(r.checkin_date).toISOString().slice(0, 16)
          : "",
        checkout_date: r.checkout_date
          ? new Date(r.checkout_date).toISOString().slice(0, 16)
          : "",
      }));

      setRooms(formatted.length ? formatted : [emptyRow]);
    } catch {
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomMerchants = async () => {
    try {
      const response = await apiCall(
        "/crew-merchant/merchant-type?type=room",
        "GET",
      );
      setMerchants(response.data);
    } catch (error) {
      toast.error("Failed to fetch room merchants");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRoomMerchants();
      fetchRooms();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, key, value) => {
    const updated = [...rooms];
    updated[index][key] = value;
    setRooms(updated);
  };

  const addRow = () => {
    setRooms([...rooms, { ...emptyRow }]);
  };
  const removeRow = (index) => {
    const updated = [...rooms];
    updated.splice(index, 1);
    setRooms(updated.length ? updated : [emptyRow]);
  };

  const handleSave = async () => {
    try {
      const cleanRooms = rooms
        .filter((r) => r.hotel_name?.trim())
        .map((r, index) => ({
          id: r.id || null,
          hotel_name: r.hotel_name,
          room_number: r.room_number,
          room_type: r.room_type,
          city: r.city,
          checkin_date: r.checkin_date || null,
          checkout_date: r.checkout_date || null,
          remarks: r.remarks,
          sort_order: index + 1,
        }));

      if (cleanRooms.length === 0) {
        toast.error("Add at least one room");
        return;
      }

      await apiCall("/crew-rooms/bulk-save", "POST", {
        crew_list_id: crewMember.id,
        rooms: cleanRooms,
      });

      toast.success("Rooms saved successfully");
      onClose();
    } catch (err) {
      toast.error("Failed to save rooms");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex justify-center items-center p-4">
      <div className="bg-slate-50 w-full  h-full  rounded-xl shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="px-8 py-5 border-b bg-gradient-to-r rounded-xl from-blue-50 to-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Rooms Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage rooms for{" "}
              <span className="font-semibold text-blue-600">
                {crewMember?.name}
              </span>
            </p>
          </div>

          <X
            size={26}
            className="cursor-pointer text-gray-500 hover:text-red-600 transition"
            onClick={onClose}
          />
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-auto p-6 ">
          {loading ? (
            <div className="text-center py-20">Loading...</div>
          ) : (
            <div className="overflow-x-auto rounded-xl ">
              <table className="min-w-[1100px] w-full border text-sm rounded-xl">
                <thead className="bg-gray-700 text-white text-xs uppercase">
                  <tr className="text-center">
                    <th className="p-3">Hotel</th>
                    <th className="whitespace-nowrap">Room NO</th>
                    <th className="whitespace-nowrap">Room Type</th>
                    <th>City</th>
                    <th>Checkin</th>
                    <th>Checkout</th>
                    <th>Remarks</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rooms.map((room, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">
                        <select
                          value={room.hotel_name || ""}
                          className="input"
                          onChange={(e) =>
                            handleChange(idx, "hotel_name", e.target.value)
                          }
                        >
                          <option value="">Select Room</option>
                          {merchants.map((m) => (
                            <option key={m.id} value={m.merchant_name}>
                              {m.merchant_name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-2">
                        <input
                          value={room.room_number}
                          onChange={(e) =>
                            handleChange(idx, "room_number", e.target.value)
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          value={room.room_type}
                          onChange={(e) =>
                            handleChange(idx, "room_type", e.target.value)
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          value={room.city}
                          onChange={(e) =>
                            handleChange(idx, "city", e.target.value)
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="datetime-local"
                          value={room.checkin_date || ""}
                          onChange={(e) =>
                            handleChange(idx, "checkin_date", e.target.value)
                          }
                          className="border px-2 py-1 rounded"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="datetime-local"
                          value={room.checkout_date || ""}
                          onChange={(e) =>
                            handleChange(idx, "checkout_date", e.target.value)
                          }
                          className="border px-2 py-1 rounded"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          value={room.remarks}
                          onChange={(e) =>
                            handleChange(idx, "remarks", e.target.value)
                          }
                          className="w-full border px-2 py-1 rounded"
                        />
                      </td>

                      <td className="text-center">
                        {rooms.length > 1 && (
                          <button
                            onClick={() => removeRow(idx)}
                            className="text-red-600"
                          >
                            ✖
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            className="mt-4 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
            onClick={addRow}
          >
            + Add Room
          </button>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-4 border-t p-4">
          <button className="px-5 py-2 border rounded-lg" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-md transition disabled:opacity-50"
            onClick={handleSave}
          >
            Save Rooms
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCrewRoomsModal;
