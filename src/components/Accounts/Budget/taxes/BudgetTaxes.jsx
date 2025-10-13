import React, { useState, useEffect } from "react";
import { BadgePlus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import BreadCrumb from "../../../BreadCrum";
import { apiCall } from "../../../../utils/apiCall";
import { usePermission } from "../../../../context/PermissionContext";
import AddBudgetTaxModal from "./AddBudgetTaxModal";
import { useAuth } from "../../../../context/AuthContext";

const BudgetTaxes = () => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTaxData, setEditTaxData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const { hasPermission } = usePermission();
  const { user } = useAuth();
  const pageSize = 50;

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/budget-tax?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`
      );
      setTaxes(response?.data || []);
      setTotalRecords(response?.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch taxes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tax?")) return;
    try {
      await apiCall(`/budget-tax/${id}`, "DELETE");
      toast.success("Tax deleted successfully");
      fetchTaxes();
    } catch (error) {
      toast.error("Failed to delete tax");
    }
  };

  const handleToggleStatus = async (id) => {
    if (!window.confirm("Are you sure you want to change status of this tax?"))
      return;

    try {
      await apiCall(`/budget-tax/${id}/toggle-status`, "PATCH");
      toast.success("Tax status updated");
      fetchTaxes();
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, [currentPage, searchQuery]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title="Budget Taxes" paths={["Taxes"]} />
      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Tax List</h2>
          {hasPermission("Budget", "create") && (
            <button
              onClick={() => {
                setEditTaxData(null);
                setIsModalOpen(true);
              }}
              className="rounded bg-red-500 text-white px-3 py-2 flex gap-2 items-center hover:bg-red-600 text-sm"
            >
              <BadgePlus size={16} />
              <span>Add Tax</span>
            </button>
          )}
        </div>
        <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full  text-sm">
            <thead className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-left">
              <tr>
                <th className="border-b px-3 py-3 text-left">SI</th>
                <th className="border-b px-3 py-3 text-left">Tax Name</th>
                <th className="border-b px-3 py-3 text-left">Percentage (%)</th>
                <th className="border-b px-3 py-3 text-left">Status</th>
                {user.role === "admin" && (
                  <th className="border-b px-3 py-3 text-left">Created By</th>
                )}
                <th className="border-b px-3 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-red-500"
                    />
                  </td>
                </tr>
              ) : taxes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6">
                    No Taxes Found.
                  </td>
                </tr>
              ) : (
                taxes.map((tax, index) => (
                  <tr
                    key={tax.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:shadow-md`}
                  >
                    <td className="border-b px-3 py-3 align-top">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="border-b px-3 py-2 align-top">
                      {tax.tax_name}
                    </td>
                    <td className="border-b px-3 py-2 align-top">
                      {tax.tax_percentage}%
                    </td>
                    <td className="border-b px-3 py-2 align-top">
                      <span
                        onClick={() => handleToggleStatus(tax.id)}
                        className={`cursor-pointer text-xs px-2 py-1 rounded ${
                          tax.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-200 text-red-700"
                        }`}
                      >
                        {tax.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {user.role === "admin" && (
                      <td className="border-b px-3 py-2 align-top">
                        {tax?.creator?.name || "Admin"}
                      </td>
                    )}
                    <td className="border-b px-3 py-2 align-top">
                      <div className="flex gap-2">
                        {hasPermission("Budget", "update") && (
                          <button
                            className="text-blue-600"
                            onClick={() => {
                              setEditTaxData(tax);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {hasPermission("Budget", "delete") && (
                          <button
                            className="text-red-600"
                            onClick={() => handleDelete(tax.id)}
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

        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AddBudgetTaxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchTaxes();
          setIsModalOpen(false);
        }}
        editTaxData={editTaxData}
      />
    </div>
  );
};

export default BudgetTaxes;
