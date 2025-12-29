import React, { useEffect, useState } from "react";
import { BadgePlus, Edit, Loader2, Trash2, ImageOff } from "lucide-react";
import { toast } from "react-toastify";
import AddPodcastCategory from "./AddPodcastCategory";
import { apiCall } from "../../../utils/apiCall";
import BreadCrumb from "../../BreadCrum";
import { usePermission } from "../../../context/PermissionContext";
import { useAuth } from "../../../context/AuthContext";

const PodcastCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const { hasPermission } = usePermission();

  const pageSize = 20;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/podcast-category?page=${currentPage}&limit=${pageSize}`,
        "GET"
      );
      setCategories(response?.data || []);
      setTotalRecords(response?.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch podcast categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const handleAdd = () => {
    setEditCategoryData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cat) => {
    setEditCategoryData(cat);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    setLoading(true);
    try {
      await apiCall(`/podcast-category/${id}`, "DELETE");
      toast.success("Podcast category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete podcast category");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb
        title="Podcast Categories"
        paths={["Podcast", "Categories"]}
      />

      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex flex-row justify-between md:justify-end items-center gap-3 border-b border-dashed border-gray-300 pb-3">
          <p className=" md:hidden text-sm sm:text-lg font-semibold text-gray-800">
            Category List
          </p>

          {hasPermission("Podcast", "create") && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
            >
              <BadgePlus size={16} />
              <span>Add Category</span>
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="px-3 py-3 text-left">SI</th>
                <th className="px-3 py-3 text-left">Image</th>
                <th className="px-3 py-3 text-left">Details</th>
                <th className="px-3 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 size={32} className="animate-spin" />
                      <p className="text-gray-600 font-medium">
                        Loading categories...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          No categories found
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Get started by creating your first news category
                        </p>
                      </div>
                      {hasPermission("News", "create") && (
                        <button
                          onClick={handleAdd}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                        >
                          Add First Category
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr
                    key={cat.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } border-b`}
                  >
                    <td className="px-4 py-3 text-gray-700">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    {/* Image Cell */}
                    <td className="px-4 py-3">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          className="w-14 h-14 object-cover rounded-md shadow-sm"
                          alt="Category"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center">
                          <ImageOff size={20} className="text-gray-400" />
                        </div>
                      )}
                    </td>

                    {/* Details Cell */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {cat.description || "No description"}
                      </p>
                    </td>

                    {/* Actions Cell */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-start gap-2">
                        {hasPermission("Podcast", "update") && (
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                        )}

                        {hasPermission("Podcast", "delete") && (
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AddPodcastCategory
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchCategories();
          setIsModalOpen(false);
        }}
        editCategoryData={editCategoryData}
      />
    </div>
  );
};

export default PodcastCategory;
