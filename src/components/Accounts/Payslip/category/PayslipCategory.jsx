import React, { useState, useEffect } from "react";
import {
  BadgePlus,
  Search,
  Loader2,
  Edit2,
  Trash2,
  ScanEye,
} from "lucide-react";
import { apiCall } from "../../../../utils/apiCall";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import BreadCrumb from "../../../BreadCrum";
import AddPaySlipCategory from "./AddPaySlipCategory";
import { usePermission } from "../../../../context/PermissionContext";

const PayslipCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState(null);

  const { hasPermission } = usePermission();

  const pageSize = 50;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/payslip-category?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`,
        "GET"
      );
      setCategories(response.data);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch payslip categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleAddCategory = () => {
    setEditCategoryData(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditCategoryData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/payslip-category/${id}`, "DELETE");
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title="Payslip Category Management"
          paths={["Payslip", "Category"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Payslip Categories
            </p>
            {hasPermission("PaySlip", "create") && (
              <button
                onClick={handleAddCategory}
                className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
              >
                <BadgePlus size={16} />
                <span>Add Category</span>
              </button>
            )}
          </div>

          {/* Search */}
          <div className="flex justify-end mt-4">
            <div className="relative w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Category..."
                onChange={(e) => handleSearch(e.target.value)}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left text-sm font-semibold ">
                      #
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold ">
                      Name
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold ">
                      Type
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold ">
                      Default Amount
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold ">
                      Description
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold ">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-6 px-4 text-center text-gray-500 text-sm font-medium"
                      >
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 text-xs border font-semibold rounded-full text-white ${
                              item.type === "earning"
                                ? "bg-green-50 border-green-500 text-green-500"
                                : item.type === "deduction"
                                ? "bg-red-50 border-red-500 text-red-500"
                                : "bg-gray-400"
                            }`}
                          >
                            {item.type.charAt(0).toUpperCase() +
                              item.type.slice(1)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {item.default_amount}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 italic">
                          {item.description || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-3">
                            {hasPermission("PaySlip", "update") && (
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                            )}
                            {hasPermission("PaySlip", "delete") && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                                title="Delete"
                              >
                                <Trash2 size={18} />
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

          {/* Pagination */}
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

        {/* Add/Edit Modal */}
        <AddPaySlipCategory
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editcategoryData={editCategoryData}
          onSuccess={() => {
            fetchCategories();
            setShowModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default PayslipCategory;
