import React, { useEffect, useState } from "react";
import { usePermission } from "../../../context/PermissionContext";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import BreadCrumb from "../../BreadCrum";
import {
  AirVent,
  BadgePlus,
  BuildingIcon,
  Edit,
  House,
  Loader2,
  Plane,
  Search,
  Trash2,
} from "lucide-react";
import debounce from "lodash.debounce";
import CrewMerchantModal from "./CrewMerchantModal";

const CrewMerchantPage = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [merchantType, setMerchantType] = useState("");
  const [editData, setEditData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { hasPermission } = usePermission();
  const { user } = useAuth();

  const pageSize = 50;

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/crew-merchant?page=${currentPage}&limit=${pageSize}&search=${searchTerm}&merchant_type=${merchantType}`,
        "GET",
      );

      setMerchants(response.data || []);
      setTotalRecords(response.pagination.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, [currentPage, searchTerm, merchantType]);

  const handleSearch = debounce((value) => {
    setSearchTerm(value);
  }, 500);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this merchant?"))
      return;
    try {
      await apiCall(`/crew-merchant/${id}`, "DELETE");

      setMerchants((prev) => {
        return prev.filter((merchant) => merchant.id !== id);
      });
      toast.success("Merchant deleted successfully");
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to delete merchant");
    }
  };
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <BreadCrumb title="Crew Merchants" paths={["Events", "Crew Merchants"]} />
      <div className="mt-4 bg-white rounded-md shadow-md  py-3 mx-4 md:px-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Crew Merchant Lists</h2>
          {hasPermission("Crew Management", "create") && (
            <button
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
            >
              <BadgePlus size={16} />
              <span>Add Merchant</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-end my-2 gap-2">
          <div>
            <select
              value={merchantType}
              onChange={(e) => setMerchantType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Types</option>
              <option value="flight">Flights</option>
              <option value="room">Rooms</option>
            </select>
          </div>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800"
            />
            <input
              type="text"
              placeholder="Search merchant"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500  focus:border-none w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto mt-4 max-w-full border border-gray-200 rounded-xl shadow-sm bg-white">
            <table className="w-full text-sm rounded-xl">
              <thead className="bg-gray-700 text-white">
                <tr className="text-left">
                  <th className="py-3 px-3 sm:px-4">#</th>
                  <th className="py-3 px-3 sm:px-4">Name</th>
                  <th className="py-3 px-3 sm:px-4">Type</th>
                  <th className="py-3 px-3 sm:px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {merchants.length === 0 ? (
                  <tr>
                    <td colSpan="100%">
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                          <BuildingIcon size={32} className="text-blue-600" />
                        </div>
                        <p className="text-base font-semibold text-gray-700">
                          No Crew Merchants found
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search or add a new crew merchants
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  merchants.map((merchant) => (
                    <tr
                      key={merchant.id}
                      className="hover:bg-slate-50 transition border-b"
                    >
                      <td className="py-3 px-3 font-semibold">
                        {(currentPage - 1) * pageSize + 1}
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {merchant.merchant_name}
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                                ${
                                  merchant.merchant_type === "flight"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                        >
                          {merchant.merchant_type === "flight" ? (
                            <Plane size={14} />
                          ) : (
                            <House size={14} />
                          )}
                          {merchant.merchant_type}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center gap-2">
                          {hasPermission("Crew Management", "update") && (
                            <button
                              onClick={() => {
                                setEditData(merchant);
                                setIsModalOpen(true);
                              }}
                              className="text-sm border border-gray-200  text-blue-500 hover:bg-blue-50 hover:border-blue-500 p-2  rounded-md"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {hasPermission("Crew Management", "delete") && (
                            <button
                              onClick={() => {
                                handleDelete(merchant.id);
                              }}
                              className="text-sm border border-gray-200  text-red-500 hover:bg-red-50 hover:border-red-500  p-2 rounded-md"
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
      <CrewMerchantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editData={editData}
        onSuccess={fetchMerchants}
      />
    </div>
  );
};

export default CrewMerchantPage;
