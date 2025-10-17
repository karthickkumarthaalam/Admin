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
import AddProgramCategoryModal from "./AddProgramCategoryModal";
import ViewProgramCategoryModal from "./ViewProgramCategoryModal";
import { usePermission } from "../../../context/PermissionContext";

const ProgramCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { hasPermission } = usePermission();

  const pageSize = 20;
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/program-category?page=${currentPage}&limit=${pageSize}`,
        "GET"
      );
      setCategories(response.data);
      setTotalRecords(response.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch Program Categories");
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
    setEditCategoryId(null);
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleEdit = (id) => {
    const categoryToEdit = categories.find((item) => item.id === id);
    setEditCategoryId(id);
    setSelectedCategory(categoryToEdit);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/program-category/${id}`, "DELETE");
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (item) => {
    if (
      !window.confirm(
        "Are you sure you want to change the status of this category?"
      )
    )
      return;
    const newStatus = item.status === "active" ? "in-active" : "active";
    setLoading(true);
    try {
      await apiCall(`/program-category/${item.id}/status`, "PATCH", {
        status: newStatus,
      });
      fetchCategories();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCategory = (item) => {
    setSelectedCategory(item);
    setIsViewModalOpen(true);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Program Category Management"}
          paths={["Programs", "Program Category Management"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Program Categories
            </p>
            {hasPermission("Program Category", "create") && (
              <button
                onClick={handleAddCategory}
                className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
              >
                <BadgePlus size={16} />
                <span>Add Category</span>
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
                placeholder="Search Category..."
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
                <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Category</th>
                    <th className="py-3 px-4 border-b">Banner</th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Start Time
                    </th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      End Time
                    </th>
                    <th className="py-3 px-4 border-b">Country</th>
                    <th className="py-3 px-4 border-b">Status</th>
                    <th className="py-3 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-4 border-b">{item.category}</td>
                        <td className="py-3 px-4 border-b">
                          <img
                            src={item.image_url}
                            alt="website"
                            className="w-32 h-auto rounded border"
                          />
                        </td>
                        <td className="py-3 px-4 border-b">
                          {item.start_time}
                        </td>
                        <td className="py-3 px-4 border-b">{item.end_time}</td>
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
                              onClick={() => handleViewCategory(item)}
                              className="text-green-600 hover:text-green-800"
                              title="View"
                            >
                              <ScanEye size={16} />
                            </button>
                            {hasPermission("Program Category", "update") && (
                              <button
                                onClick={() => handleEdit(item.id)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {hasPermission("Program Category", "delete") && (
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

        <AddProgramCategoryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editCategoryId={editCategoryId}
          editCategoryData={selectedCategory}
          onSuccess={() => {
            fetchCategories();
            setShowModal(false);
          }}
        />

        <ViewProgramCategoryModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          categoryData={selectedCategory}
        />
      </div>
    </div>
  );
};

export default ProgramCategory;
