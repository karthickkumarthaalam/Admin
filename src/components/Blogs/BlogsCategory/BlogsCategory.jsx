import React, { useState, useEffect } from "react";
import { BadgePlus, Edit, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import AddBlogsCategory from "./AddBlogsCategory";
import { apiCall } from "../../../utils/apiCall";
import BreadCrumb from "../../BreadCrum";
import { usePermission } from "../../../context/PermissionContext";
import { useAuth } from "../../../context/AuthContext";

const BlogsCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const { hasPermission } = usePermission();
  const { user } = useAuth();

  const pageSize = 20;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/blogs-category?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`
      );
      setCategories(response?.data || []);
      setTotalRecords(response?.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch blogs categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    setLoading(true);
    try {
      await apiCall(`/blogs-category/${id}`, "DELETE");
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchQuery]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title="Blogs Categories" paths={["Blogs", "Categories"]} />
      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Category List</h2>
          {hasPermission("Blogs", "create") && (
            <button
              onClick={() => {
                setEditCategoryData(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4  py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
            >
              <BadgePlus size={16} />
              <span>Add Category</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
              <tr>
                <th className="px-3 py-3 text-left">SI</th>
                <th className="px-3 py-3 text-left">Category</th>
                <th className="px-3 py-3 text-left">Subcategories</th>
                {user.role === "admin" && (
                  <th className="px-3 py-3 text-left">Created By</th>
                )}
                <th className="px-3 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="relative">
                        <Loader2
                          size={32}
                          className="animate-spin text-blue-600"
                        />
                        <div className="absolute inset-0 border-2 border-blue-200 border-t-transparent rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-gray-600 font-medium">
                        Loading categories...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
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
                          Get started by creating your first Blogs category
                        </p>
                      </div>
                      {hasPermission("Blogs", "create") && (
                        <button
                          onClick={() => setIsAddModalOpen(true)}
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
                    } border-b border-gray-200 transition-colors`}
                  >
                    {/* Serial Number */}
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    {/* Category Name */}
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {cat.category_name}
                    </td>

                    {/* Sub Categories */}
                    <td className="px-4 py-3">
                      {cat.sub_categories?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cat.sub_categories.map((sub, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs rounded-full bg-slate-200 text-gray-800"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 font-medium italic">
                          No subcategories
                        </span>
                      )}
                    </td>

                    {/* Creator (Admin only) */}
                    {user.role === "admin" && (
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {cat?.creator?.name || "Admin"}
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-start gap-2">
                        {hasPermission("Blogs", "update") && (
                          <button
                            onClick={() => {
                              setEditCategoryData(cat);
                              setIsAddModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {hasPermission("Blogs", "delete") && (
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 rounded-md"
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

      <AddBlogsCategory
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

export default BlogsCategory;
