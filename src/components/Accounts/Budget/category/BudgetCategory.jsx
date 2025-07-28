import React, { useState, useEffect } from "react";
import { BadgePlus, Edit, Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import BreadCrumb from "../../../BreadCrum";
import { apiCall } from "../../../../utils/apiCall";
import { usePermission } from "../../../../context/PermissionContext";
import AddBudgetCategory from "./AddBudgetCategory";
import { useAuth } from "../../../../context/AuthContext";

const BudgetCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const { hasPermission } = usePermission();

  const { user } = useAuth();

  const pageSize = 50;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/budget-category?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`
      );
      setCategories(response?.data);
      setTotalRecords(response?.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Category?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/budget-category/${id}`, "DELETE");
      fetchCategories();
      setCurrentPage(1);
      toast.success("Category deleted successfully");
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
      <BreadCrumb title="Budget Categories" paths={["Categories"]} />
      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Category List</h2>
          <div className="flex gap-4">
            {hasPermission("Budget", "create") && (
              <button
                onClick={() => {
                  setEditCategoryData(null);
                  setIsAddModalOpen(true);
                }}
                className="rounded bg-red-500 text-white px-3 py-2 flex gap-2 items-center hover:bg-red-600 text-sm"
              >
                <BadgePlus size={16} />
                <span>Add Category</span>
              </button>
            )}
          </div>
        </div>
        {/* 
        <div className="mt-4 flex justify-end">
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Categories..."
              onChange={(e) => handleSearch(e.target.value)}
              className="border-2 rounded-md px-8 py-2 w-full text-sm"
            />
          </div>
        </div> */}

        <div className="overflow-x-auto mt-4">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">SI</th>
                <th className="border px-3 py-2 text-left">Category</th>
                <th className="border px-3 py-2 text-left">Subcategories</th>
                {user.role === "admin" && (
                  <th className="border px-3 py-2 text-left">Created By</th>
                )}
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-red-500"
                    />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6">
                    No Categories Found.
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr key={cat.id}>
                    <td className="border px-3 py-2 align-top">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="border px-3 py-2 align-top">
                      {cat.category_name}
                    </td>
                    <td className="border px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        {cat.subCategories.map((sub, index) => (
                          <span key={index} className="text-sm text-gray-800">
                            • {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                    {user.role === "admin" && (
                      <td className="border px-3 py-2 align-top">
                        {" "}
                        {cat?.creator?.name || "Admin"}
                      </td>
                    )}
                    <td className="border px-3 py-2 align-top">
                      <div className="flex gap-2">
                        {hasPermission("Budget", "update") && (
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
                        {hasPermission("Budget", "delete") && (
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

      <AddBudgetCategory
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

export default BudgetCategory;
