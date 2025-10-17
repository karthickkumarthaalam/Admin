import React, { useState, useEffect } from "react";
import BreadCrumb from "../components/BreadCrum";
import { BadgePlus, Search, Loader2, Edit2, Trash2 } from "lucide-react";
import AddCurrencyModal from "../components/AddCurrencyModal";
import { apiCall } from "../utils/apiCall";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import { usePermission } from "../context/PermissionContext";

const Currency = () => {
  const [showModal, setShowModal] = useState(false);
  const [editCurrencyId, setEditCurrencyId] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 20;

  const { hasPermission } = usePermission();

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/currency?page=${currentPage}&search=${searchQuery}`,
        "GET"
      );
      setCurrencies(response.data);
      setTotalRecords(response.pagination.totalRecords);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleEdit = (id) => {
    const currencyToEdit = currencies.find((currency) => currency.id === id);
    setEditCurrencyId(id);
    setSelectedCurrency(currencyToEdit);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this currency?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/currency/${id}`, "DELETE");
      fetchCurrencies();
      setCurrentPage(1);
      toast.success("Currency deleted successfully");
    } catch (error) {
      toast.error("Failed to delete currency");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleAddCurrency = () => {
    setEditCurrencyId(null);
    setSelectedCurrency(null);
    setShowModal(true);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Currency Management"}
          paths={["Accounts", "Currency Management"]}
        />

        <div className="mt-4 rounded-sm shadow-md md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto">
          <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Currency Report
            </p>
            {hasPermission("Currency", "create") && (
              <button
                onClick={handleAddCurrency}
                className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
              >
                <BadgePlus size={16} />
                <span>Add Currency</span>
              </button>
            )}
          </div>

          <div className="flex justify-center sm:justify-end mt-4">
            <div className="relative w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search currencies..."
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
              <table className="w-full  text-sm">
                <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white text-left">
                  <tr>
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Country</th>
                    <th className="py-3 px-4 border-b">Currency Name</th>
                    <th className="py-3 px-4 border-b">Code</th>
                    <th className="py-3 px-4 border-b">Symbol</th>
                    <th className="py-3 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currencies.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-6 px-4 borde-b text-center text-gray-500 text-sm"
                      >
                        No Currencies found.
                      </td>
                    </tr>
                  ) : (
                    currencies.map((currency, index) => (
                      <tr key={currency.id}>
                        <td className="py-2 px-4 borde-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-2 px-4 borde-b">
                          {currency.country_name}
                        </td>
                        <td className="py-2 px-4 borde-b">
                          {currency.currency_name}
                        </td>
                        <td className="py-2 px-4 borde-b">{currency.code}</td>
                        <td className="py-2 px-4 borde-b">{currency.symbol}</td>
                        <td className="py-2 px-4 borde-b">
                          <div className="flex items-center gap-2">
                            {hasPermission("Currency", "update") && (
                              <button
                                onClick={() => handleEdit(currency.id)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {hasPermission("Currency", "delete") && (
                              <button
                                onClick={() => handleDelete(currency.id)}
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

        <AddCurrencyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editCurrencyId={editCurrencyId}
          editCurrencyData={selectedCurrency}
          onSuccess={() => {
            fetchCurrencies();
            setShowModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default Currency;
