import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const AddCrewFlightsModal = ({ isOpen, onClose, crewMember }) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState([]);

  const emptyRow = {
    from_city: "",
    to_city: "",
    flight_number: "",
    airline: "",
    departure_time: "",
    arrival_time: "",
    terminal: "",
    pnr: "",
    ticket_number: "",
    booking_status: "pending",
    ticket_file: "",
    newTicketFile: null,
    remarks: "",
  };

  const fetchFlights = async () => {
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
        newTicketFile: null,
      }));

      setFlights(formatted.length ? formatted : [emptyRow]);
    } catch {
      toast.error("Failed to fetch flights");
    } finally {
      setLoading(false);
    }
  };

  const fetchflightMerchants = async () => {
    try {
      const response = await apiCall(
        "/crew-merchant/merchant-type?type=flight",
        "GET",
      );
      setMerchants(response.data);
    } catch (error) {
      toast.error("Failed to fetch flight merchants");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFlights();
      fetchflightMerchants();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (i, key, value) => {
    const updated = [...flights];
    updated[i][key] = value;
    setFlights(updated);
  };

  const handleFile = (i, file) => {
    const updated = [...flights];
    updated[i].newTicketFile = file;
    setFlights(updated);
  };

  const addRow = () => setFlights([...flights, { ...emptyRow }]);

  const removeRow = (i) => {
    const updated = [...flights];
    updated.splice(i, 1);
    setFlights(updated.length ? updated : [emptyRow]);
  };

  // 💾 SAVE
  const handleSave = async () => {
    try {
      const clean = flights
        .filter((f) => f.from_city && f.to_city)
        .map((f, index) => ({
          id: f.id || null,
          from_city: f.from_city,
          to_city: f.to_city,
          flight_number: f.flight_number,
          airline: f.airline,
          departure_time: f.departure_time || null,
          arrival_time: f.arrival_time || null,
          terminal: f.terminal,
          pnr: f.pnr,
          ticket_number: f.ticket_number,
          booking_status: f.booking_status,
          ticket_file: f.ticket_file || null,
          remarks: f.remarks,
          sort_order: index + 1,
        }));

      if (clean.length === 0) {
        toast.error("Add at least one flight");
        return;
      }

      const formData = new FormData();
      formData.append("crew_list_id", crewMember.id);
      formData.append("flights", JSON.stringify(clean));

      flights.forEach((f, i) => {
        if (f.newTicketFile) {
          formData.append(`ticket_${i}`, f.newTicketFile);
        }
      });

      await apiCall("/crew-flights/bulk-save", "POST", formData, true);

      toast.success("Flights saved successfully");
      onClose();
    } catch {
      toast.error("Failed to save flights");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex justify-center items-center p-4">
      <div className="bg-white w-full  h-full  rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="px-8 py-5 border-b bg-gradient-to-r from-blue-50 to-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Flight Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage flights for{" "}
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

        {/* BODY */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-blue-600" size={30} />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto  modal-scroll rounded-lg">
                <table className="min-w-[1500px] w-full text-sm bg-white">
                  <thead className="bg-gray-700 text-gray-100 text-xs uppercase">
                    <tr className="text-center">
                      <th className="p-3">Route</th>
                      <th>Flight No</th>
                      <th>Airline</th>
                      <th>Departure</th>
                      <th>Arrival</th>
                      <th>PNR</th>
                      <th>Ticket</th>
                      <th>Status</th>
                      <th>Upload</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {flights.map((f, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        {/* ROUTE */}
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <input
                              placeholder="From"
                              value={f.from_city || ""}
                              onChange={(e) =>
                                handleChange(i, "from_city", e.target.value)
                              }
                              className="input"
                            />
                            <span className="text-gray-400">→</span>
                            <input
                              placeholder="To"
                              value={f.to_city || ""}
                              onChange={(e) =>
                                handleChange(i, "to_city", e.target.value)
                              }
                              className="input"
                            />
                          </div>
                        </td>

                        {/* FLIGHT NO */}
                        <td className="p-2">
                          <input
                            value={f.flight_number || ""}
                            onChange={(e) =>
                              handleChange(i, "flight_number", e.target.value)
                            }
                            className="input"
                          />
                        </td>

                        {/* AIRLINE */}
                        <td className="p-2">
                          <select
                            value={f.airline || ""}
                            onChange={(e) =>
                              handleChange(i, "airline", e.target.value)
                            }
                            className="input"
                          >
                            <option value="">Select airline</option>

                            {merchants.map((m) => (
                              <option key={m.id} value={m.merchant_name}>
                                {m.merchant_name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* DEP */}
                        <td className="p-2">
                          <input
                            type="datetime-local"
                            value={f.departure_time || ""}
                            onChange={(e) =>
                              handleChange(i, "departure_time", e.target.value)
                            }
                            className="input"
                          />
                        </td>

                        {/* ARR */}
                        <td className="p-2">
                          <input
                            type="datetime-local"
                            value={f.arrival_time || ""}
                            onChange={(e) =>
                              handleChange(i, "arrival_time", e.target.value)
                            }
                            className="input"
                          />
                        </td>

                        {/* PNR */}
                        <td className="p-2">
                          <input
                            value={f.pnr || ""}
                            onChange={(e) =>
                              handleChange(i, "pnr", e.target.value)
                            }
                            className="input"
                          />
                        </td>

                        {/* VIEW TICKET */}

                        <td className="p-2 text-xs">
                          {f.ticket_file ? (
                            <a
                              href={f.ticket_file}
                              target="_blank"
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                            >
                              View
                            </a>
                          ) : (
                            <div className="text-center">
                              <span className="italic text-xs text-gray-400 ">
                                No ticket uploaded
                              </span>
                            </div>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="p-2">
                          <select
                            value={f.booking_status || ""}
                            onChange={(e) =>
                              handleChange(i, "booking_status", e.target.value)
                            }
                            className={`input font-semibold
      ${
        f.booking_status === "booked"
          ? "text-green-700 bg-green-50 border-green-200"
          : f.booking_status === "cancelled"
            ? "text-red-600 bg-red-50 border-red-200"
            : "text-yellow-700 bg-yellow-50 border-yellow-200"
      }
    `}
                          >
                            <option value="pending">Pending</option>
                            <option value="booked">Booked</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* UPLOAD */}
                        <td className="p-2">
                          <label className="cursor-pointer px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md">
                            Upload
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFile(i, e.target.files[0])}
                            />
                          </label>
                        </td>

                        {/* DELETE */}
                        <td className="text-center">
                          {flights.length > 1 && (
                            <button
                              onClick={() => removeRow(i)}
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

              <button
                className="mt-4 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
                onClick={addRow}
              >
                + Add Flight
              </button>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-5 border-t bg-gray-50">
          <button
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
            onClick={handleSave}
          >
            Save Flights
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCrewFlightsModal;

/* reusable input style */
const style = document.createElement("style");
style.innerHTML = `
.input{
width:100%;
border:1px solid #d1d5db;
border-radius:8px;
padding:6px 10px;
font-size:13px;
outline:none;
transition:.2s;
}
.input:focus{
border-color:#3b82f6;
box-shadow:0 0 0 2px rgba(59,130,246,.2);
}
`;
document.head.appendChild(style);
