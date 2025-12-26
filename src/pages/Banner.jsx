import React, { useState, useEffect } from "react";
import BreadCrumb from "../components/BreadCrum";
import { BadgePlus, Search, Loader2, Edit2, Trash2 } from "lucide-react";
import { apiCall } from "../utils/apiCall";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import AddBannerModal from "../components/AddBannerModal";
import { usePermission } from "../context/PermissionContext";

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [languageFilter, setLanguageFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const { hasPermission } = usePermission();

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const pageSize = 20;

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/banners?page=${currentPage}&search=${searchQuery}&language=${languageFilter}`,
        "GET"
      );
      setBanners(response?.data?.data);
      setTotalRecords(response?.data?.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch Banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [currentPage, searchQuery, languageFilter]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleLanguageFilter = (lang) => {
    setLanguageFilter(lang);
    setCurrentPage(1);
  };

  const handleStatusToggle = async (banner) => {
    if (
      !window.confirm(
        "Are you sure you want to change the status of this banner?"
      )
    )
      return;
    const newStatus = banner.status === "active" ? "in-active" : "active";
    setLoading(true);
    try {
      await apiCall(`/banners/${banner.id}`, "PATCH", { status: newStatus });
      fetchBanners();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    setLoading(true);
    try {
      await apiCall(`/banners/${id}`, "DELETE");
      fetchBanners();
      toast.success("Banner deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete banner");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title={"Banner Management"} paths={["Programs", "Banners"]} />

      <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
          <p className="text-sm sm:text-lg font-semibold text-gray-800">
            Banner List
          </p>
          {hasPermission("Banner", "create") && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
            >
              <BadgePlus size={16} />
              <span>Add Banner</span>
            </button>
          )}
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
              placeholder="Search banners..."
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
          <>
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Name</th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Website Image
                    </th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Mobile Image
                    </th>
                    <th className="py-3 px-4 border-b">Status</th>
                    <th className="py-3 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(banners) && banners.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-6 text-gray-500"
                      >
                        No banners available.
                      </td>
                    </tr>
                  ) : (
                    banners.map((banner, index) => (
                      <tr key={banner.id}>
                        <td className="py-3 px-4 border-b align-top">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-4 border-b align-top">
                          {banner.banner_name}
                        </td>
                        <td className="py-3 px-4 border-b align-top">
                          {banner.website_image && (
                            <img
                              src={`${BASE_URL}/${banner.website_image.replace(
                                /\\/g,
                                "/"
                              )}`}
                              alt="website"
                              className="w-32 h-auto rounded border"
                            />
                          )}
                        </td>
                        <td className="py-3 px-4 border-b align-top">
                          {banner.mobile_image && (
                            <img
                              src={`${BASE_URL}/${banner.mobile_image.replace(
                                /\\/g,
                                "/"
                              )}`}
                              alt="mobile"
                              className="w-24 h-auto rounded border"
                            />
                          )}
                        </td>
                        <td className="py-3 px-4 border-b align-top">
                          {hasPermission("Banner", "update") ? (
                            <span
                              onClick={() => handleStatusToggle(banner)}
                              className={`cursor-pointer px-2 py-1 text-xs rounded font-semibold ${
                                banner.status === "active"
                                  ? "bg-green-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {banner.status}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-4 border-b align-top">
                          <div className="flex items-center gap-2">
                            {/* Edit and Delete Actions */}
                            {hasPermission("Banner", "update") && (
                              <button
                                onClick={() => {
                                  setSelectedBanner(banner);
                                  setShowModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {hasPermission("Banner", "delete") && (
                              <button
                                onClick={() => handleDelete(banner.id)}
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

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
          </>
        )}
      </div>

      <AddBannerModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBanner(null);
        }}
        editBannerData={selectedBanner}
        onSuccess={() => {
          fetchBanners();
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default Banner;
