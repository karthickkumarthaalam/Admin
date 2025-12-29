import React, { useState, useEffect } from "react";
import { BadgePlus, Edit, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import BreadCrumb from "../../BreadCrum";
import { apiCall } from "../../../utils/apiCall";
import { usePermission } from "../../../context/PermissionContext";
import AddAgreementCategoryModal from "./AddAgreementCategoryModal";

const AgreementCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const { hasPermission } = usePermission();

  const pageSize = 50;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/agreement-category?page=${currentPage}&limit=${pageSize}`
      );
      setCategories(response?.data || []);
      setTotalRecords(response?.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch agreement categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Category?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/agreement-category/${id}`, "DELETE");
      toast.success("Category deleted successfully");
      fetchCategories();
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb
        title="Agreement Categories"
        paths={["Agreement", "Categories"]}
      />
      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Agreement Category List</h2>
          {hasPermission("Agreement", "create") && (
            <button
              onClick={() => {
                setEditCategoryData(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
            >
              <BadgePlus size={16} />
              <span>Add Category</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-sm ">
            <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white">
              <tr className="text-left">
                <th className="border-b px-3 py-3 text-left">SI</th>
                <th className="border-b px-3 py-3 text-left">Category</th>
                <th className="border-b px-3 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-6">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-red-500"
                    />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6">
                    No Categories Found.
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr
                    key={cat.id}
                    className={`${
                      index % 2 !== 0 ? "bg-white" : "bg-gray-50"
                    } hover:shadow-md`}
                  >
                    <td className="border-b px-3 py-3 align-top">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="border-b px-3 py-3 align-top">
                      {cat.category_name}
                    </td>
                    <td className="border-b px-3 py-3 align-top">
                      <div className="flex gap-2">
                        {hasPermission("Agreement", "update") && (
                          <button
                            className="text-blue-600"
                            onClick={() => {
                              setEditCategoryData(cat);
                              setIsAddModalOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {hasPermission("Agreement", "delete") && (
                          <button
                            className="text-red-600"
                            onClick={() => handleDelete(cat.id)}
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

      <AddAgreementCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchCategories();
          setIsAddModalOpen(false);
        }}
        editCategoryData={editCategoryData}
      />
    </div>
  );
};

export default AgreementCategory;
