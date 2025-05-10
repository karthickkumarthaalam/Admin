import React, { useState, useEffect } from "react";
import BreadCrumb from "../components/BreadCrum";
import {
  BadgePlus,
  Search,
  Loader2,
  Edit2,
  Trash2,
  ScanEye,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import AddPackageModal from "./AddPackageModal";
import ViewPackageModal from "./PackageDetails";

const Package = () => {
  const [showModal, setShowModal] = useState(false);
  const [editPackageId, setEditPackageId] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [languageFilter, setLanguageFilter] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const pageSize = 20;

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/package?page=${currentPage}&search=${searchQuery}&language=${languageFilter}`,
        "GET"
      );
      setPackages(response.data);
      setTotalRecords(response.pagination.totalRecords);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [currentPage, searchQuery, languageFilter]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleEdit = (id) => {
    const pkgToEdit = packages.find((pkg) => pkg.id === id);
    setEditPackageId(id);
    setSelectedPackage(pkgToEdit);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/package/${id}`, "DELETE");
      fetchPackages();
      setCurrentPage(1);
      toast.success("Package deleted successfully");
    } catch (error) {
      toast.error("Failed to delete package");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (pkg) => {
    const newStatus = pkg.status === "active" ? "inactive" : "active";
    setLoading(true);
    try {
      await apiCall(`/package/${pkg.id}`, "PATCH", { status: newStatus });
      fetchPackages();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageFilter = (lang) => {
    setLanguageFilter(lang);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleAddPackage = () => {
    setEditPackageId(null);
    setSelectedPackage(null);
    setShowModal(true);
  };

  const handleViewPackage = (pkg) => {
    setIsViewModalOpen(true);
    setSelectedPackage(pkg);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Package Management"}
          paths={["Packages", "Package Management"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-6 py-4 mx-4 bg-white flex-1 overflow-y-auto">
          <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Package Report
            </p>
            <button
              onClick={handleAddPackage}
              className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
            >
              <BadgePlus size={16} />
              <span>Add Package</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-4 gap-2 md:gap-4">
            <div className="w-48">
              <select
                onChange={(e) => handleLanguageFilter(e.target.value)}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
              >
                <option value="">All Languages</option>
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
            <div className="relative w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search packages..."
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
            <div className="overflow-x-auto mt-4 max-w-full">
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-4 border">SI</th>
                    <th className="py-2 px-4 border">Package Id</th>
                    <th className="py-2 px-4 border">Package Name</th>
                    <th className="py-2 px-4 border">Duration</th>
                    <th className="py-2 px-4 border">Price</th>
                    <th className="py-2 px-4 border">Status</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No packages found.
                      </td>
                    </tr>
                  ) : (
                    packages.map((pkg, index) => (
                      <tr key={pkg.id}>
                        <td className="py-2 px-4 border">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td
                          className="py-2 px-4 border text-blue-600 hover:text-blue-700 hover:underline"
                          onClick={() => handleViewPackage(pkg)}
                        >
                          {pkg.package_id}
                        </td>
                        <td className="py-2 px-4 border">{pkg.package_name}</td>
                        <td className="py-2 px-4 border">{pkg.duration}</td>
                        <td className="py-2 px-4 border">{pkg.price}</td>
                        <td className="py-2 px-4 border">
                          <span
                            onClick={() => handleStatusToggle(pkg)}
                            className={`cursor-pointer px-2 py-1 text-xs rounded font-semibold ${
                              pkg.status === "active"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {pkg.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 border">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewPackage(pkg)}
                              className="text-green-600 hover:text-green-800"
                              title="view"
                            >
                              <ScanEye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(pkg.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(pkg.id)}
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

        <AddPackageModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editPackageId={editPackageId}
          editPackageData={selectedPackage}
          onSuccess={() => {
            fetchPackages();
            setShowModal(false);
          }}
        />

        <ViewPackageModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          packageData={selectedPackage}
        />
      </div>
    </div>
  );
};

export default Package;
