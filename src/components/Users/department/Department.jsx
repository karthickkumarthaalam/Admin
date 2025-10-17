import React, { useState, useEffect } from "react";
import BreadCrumb from "../../../components/BreadCrum";
import { BadgePlus, Search, Loader2, Edit2, Trash2 } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import AddDepartmentModal from "./AddDepartmentModal";

const Department = () => {
  const [showModal, setShowModal] = useState(false);
  const [editDeptId, setEditDeptId] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const pageSize = 20;

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/departments?page=${currentPage}&search=${searchQuery}`,
        "GET"
      );
      setDepartments(response.data);
      setTotalRecords(
        response.pagination?.totalRecords || response.data.length
      );
    } catch (error) {
      toast.error("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleEdit = (id) => {
    const deptToEdit = departments.find((d) => d.id === id);
    setEditDeptId(id);
    setSelectedDept(deptToEdit);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/departments/${id}`, "DELETE");
      toast.success("Department deleted successfully");
      fetchDepartments();
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to delete department");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (dept) => {
    if (
      !window.confirm(
        "Are you sure you want to change the status of this department?"
      )
    )
      return;
    const newStatus = dept.status === "active" ? "in-active" : "active";
    setLoading(true);
    try {
      await apiCall(`/departments/${dept.id}/status`, "PATCH", {
        status: newStatus,
      });
      fetchDepartments();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleAddDepartment = () => {
    setEditDeptId(null);
    setSelectedDept(null);
    setShowModal(true);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Department Management"}
          paths={["Users", "Department Management"]}
        />

        <div className="mt-4 rounded-sm shadow-md md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto">
          <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Department List
            </p>
            <button
              onClick={handleAddDepartment}
              className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
            >
              <BadgePlus size={16} />
              <span>Add Department</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm ">
                <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white">
                  <tr className=" text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Department Name</th>
                    <th className="py-3 px-4 border-b">Status</th>
                    <th className="py-3 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No departments found.
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept, index) => (
                      <tr key={dept.id}>
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {dept.department_name}
                        </td>
                        <td className="py-3 px-4 border-b">
                          <span
                            onClick={() => handleStatusToggle(dept)}
                            className={`cursor-pointer px-2 py-1 text-xs rounded font-semibold ${
                              dept.status === "active"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {dept.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(dept.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(dept.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
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

        <AddDepartmentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editDeptData={selectedDept}
          onSuccess={() => {
            fetchDepartments();
            setShowModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default Department;
