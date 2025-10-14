import React, { useState, useEffect } from "react";
import {
  BadgePlus,
  Search,
  Loader2,
  Edit2,
  Trash2,
  ScanEye,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import BreadCrumb from "../../../components/BreadCrum";
import AddRadioStationModal from "./AddRadioStationModal";
import ViewRadioStationModal from "./ViewRadioStationModal";
import { usePermission } from "../../../context/PermissionContext";

const RadioStation = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editStationId, setEditStationId] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { hasPermission } = usePermission();

  const pageSize = 20;

  const fetchStations = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/radio-station?page=${currentPage}&limit=${pageSize}`,
        "GET"
      );
      setStations(response.data);
      setTotalRecords(response.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch Radio Stations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleAddStation = () => {
    setEditStationId(null);
    setSelectedStation(null);
    setShowModal(true);
  };

  const handleEdit = (id) => {
    const stationToEdit = stations.find((item) => item.id === id);
    setEditStationId(id);
    setSelectedStation(stationToEdit);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this station?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/radio-station/${id}`, "DELETE");
      toast.success("Station deleted successfully");
      fetchStations();
    } catch (error) {
      toast.error("Failed to delete station");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (item) => {
    if (
      !window.confirm(
        "Are you sure you want to change the status of this station?"
      )
    )
      return;
    const newStatus = item.status === "active" ? "in-active" : "active";
    setLoading(true);
    try {
      await apiCall(`/radio-station/${item.id}/status`, "PATCH", {
        status: newStatus,
      });
      fetchStations();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStation = (item) => {
    setSelectedStation(item);
    setIsViewModalOpen(true);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Radio Station Management"}
          paths={["Streaming", "Radio Station Management"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Radio Stations
            </p>
            {hasPermission("Radio Station", "create") && (
              <button
                onClick={handleAddStation}
                className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
              >
                <BadgePlus size={16} />
                <span>Add Station</span>
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
                placeholder="Search Station..."
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
                <thead className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Logo</th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Station Name
                    </th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Stream URL
                    </th>
                    <th className="py-3 px-4 border-b">Country</th>
                    <th className="py-3 px-4 border-b">Status</th>
                    <th className="py-3 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No stations found.
                      </td>
                    </tr>
                  ) : (
                    stations.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-4 border-b">
                          <img
                            src={`${
                              process.env.REACT_APP_API_BASE_URL
                            }/${item.logo.replace(/\\/g, "/")}`}
                            alt={item.station_name}
                            className="w-40 h-auto object-cover border"
                          />
                        </td>
                        <td className="py-3 px-4 border-b">
                          {item.station_name}
                        </td>
                        <td className="py-3 px-4 border-b break-words">
                          <a
                            href={item.radio_stream_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {" "}
                            {item.radio_stream_url}
                          </a>
                        </td>
                        <td className="py-3 px-4 border-b">{item.country}</td>
                        <td className="py-3 px-4 border-b">
                          <span
                            onClick={() => handleStatusToggle(item)}
                            className={`cursor-pointer px-2 py-1 text-xs rounded font-semibold ${
                              item.status === "active"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewStation(item)}
                              className="text-green-600 hover:text-green-800"
                              title="View"
                            >
                              <ScanEye size={16} />
                            </button>
                            {hasPermission("Radio Station", "update") && (
                              <button
                                onClick={() => handleEdit(item.id)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {hasPermission("Radio Station", "delete") && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800"
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

        <AddRadioStationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editStationId={editStationId}
          editStationData={selectedStation}
          onSuccess={() => {
            fetchStations();
            setShowModal(false);
          }}
        />

        <ViewRadioStationModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          stationData={selectedStation}
        />
      </div>
    </div>
  );
};

export default RadioStation;
