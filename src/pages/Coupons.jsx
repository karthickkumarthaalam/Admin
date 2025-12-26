import React, { useState, useEffect } from "react";
import BreadCrumb from "../components/BreadCrum";
import { BadgePlus, Search, Loader2, Edit2, Trash2 } from "lucide-react";
import AddHeader from "../components/AddCouponModal";
import { apiCall } from "../utils/apiCall";
import debounce from "lodash.debounce";
import CopyrightFooter from "../components/CopyRightsComponent";
import { toast } from "react-toastify";
import { usePermission } from "../context/PermissionContext";

const Coupons = () => {
  const [showModal, setShowModal] = useState(false);
  const [editCouponId, setEditCouponId] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 20;

  const { hasPermission } = usePermission();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/coupons?page=${currentPage}&search=${searchQuery}`,
        "GET"
      );
      setCoupons(response.data);
      setTotalRecords(response.pagination.totalRecords);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleEdit = (id) => {
    const couponToEdit = coupons.find((coupon) => coupon.id === id);
    setEditCouponId(id);
    setSelectedCoupon(couponToEdit);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    setLoading(true);
    try {
      await apiCall(`/coupons/${id}`, "DELETE");
      fetchCoupons();
      toast.success("Coupon Delete successfully");
    } catch (error) {
      toast.error("Failed to delete Coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (coupon) => {
    const newStatus = coupon.status === "active" ? "inactive" : "active";
    setLoading(true);
    try {
      await apiCall(`/coupons/${coupon.id}`, "PATCH", { status: newStatus });
      fetchCoupons();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleAddCoupon = () => {
    setEditCouponId(null);
    setSelectedCoupon(null);
    setShowModal(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Coupon Report"}
          paths={["Programs", "Coupon Report"]}
        />
        <div className="md:mt-4 rounded-sm shadow-md md:px-6 py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Coupon Report
            </p>
            {hasPermission("Coupon", "create") && (
              <button
                onClick={handleAddCoupon}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
              >
                <BadgePlus size={16} />
                <span>Add Coupon</span>
              </button>
            )}
          </div>

          <div className="flex justify-center sm:justify-end mt-4">
            <div className="relative w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search coupons..."
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
                <table className="w-full text-sm ">
                  <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white">
                    <tr className="text-left">
                      <th className="py-3 px-4 border-b">SI</th>
                      <th className="py-3 px-4 border-b whitespace-nowrap">
                        Coupon Name
                      </th>
                      <th className="py-3 px-4 border-b">Code</th>
                      <th className="py-3 px-4 border-b">Description</th>
                      <th className="py-3 px-4 border-b">Start</th>
                      <th className="py-3 px-4 border-b">End</th>
                      <th className="py-3 px-4 border-b">Status</th>
                      <th className="py-3 px-4 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-6 text-gray-500"
                        >
                          No coupons available.
                        </td>
                      </tr>
                    ) : (
                      coupons.map((coupon, index) => {
                        const isExpired = coupon.status === "expired";
                        return (
                          <tr key={coupon.id}>
                            <td className="py-3 px-4 border-b">
                              {(currentPage - 1) * pageSize + index + 1}
                            </td>
                            <td className="py-3 px-4 border-b">
                              {coupon.coupon_name}
                            </td>
                            <td className="py-3 px-4 border-b">
                              {coupon.coupon_code}
                            </td>
                            <td className="py-3 px-4 border-b">
                              {coupon.description}
                            </td>
                            <td className="py-3 px-4 border-b">
                              {new Date(coupon.start_date).toLocaleDateString(
                                "en-GB"
                              )}
                            </td>
                            <td className="py-3 px-4 border-b">
                              {new Date(coupon.end_date).toLocaleDateString(
                                "en-GB"
                              )}
                            </td>
                            <td className="py-3 px-4 border-b">
                              <span
                                onClick={() =>
                                  !isExpired && handleStatusToggle(coupon)
                                }
                                className={`cursor-pointer px-2 py-1 text-xs rounded font-semibold ${
                                  coupon.status === "active"
                                    ? "bg-green-500 text-white"
                                    : coupon.status === "expired"
                                    ? "bg-gray-500 text-white"
                                    : "bg-red-500 text-white"
                                }`}
                              >
                                {coupon.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 border-b">
                              <div className="flex items-center gap-2">
                                {hasPermission("Coupon", "update") && (
                                  <button
                                    onClick={() => handleEdit(coupon.id)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                )}
                                {hasPermission("Coupon", "delete") && (
                                  <button
                                    onClick={() => handleDelete(coupon.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
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
        <CopyrightFooter />
        <AddHeader
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editCouponId={editCouponId}
          editCouponData={selectedCoupon}
          onSuccess={() => {
            fetchCoupons();
            setShowModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default Coupons;
