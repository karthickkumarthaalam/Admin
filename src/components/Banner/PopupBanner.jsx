import React, { useState, useEffect } from "react";
import { Loader2, Edit2, Trash2 } from "lucide-react";
import { apiCall } from "../../utils/apiCall";
import BreadCrumb from "../BreadCrum";
import { toast } from "react-toastify";
import AddPopupBannerModal from "./AddPopupBannerModal";

const PopupBanner = () => {
  const [popupBanner, setPopupBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchPopupBanner = async () => {
    setLoading(true);
    try {
      const response = await apiCall(`/popup-banner`, "GET");
      setPopupBanner(response.data[0]);
    } catch (error) {
      toast.error("Failed to fetch popup banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopupBanner();
  }, []);

  const handleStatusToggle = async () => {
    if (!popupBanner) return;
    const newStatus = popupBanner.status === "active" ? "in-active" : "active";
    setLoading(true);
    try {
      await apiCall(`/popup-banner`, "PATCH", { status: newStatus });
      fetchPopupBanner();
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!popupBanner) return;
    if (!window.confirm("Are you sure you want to delete this Popup-Banner?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/popup-banner/${id}`, "DELETE");
      fetchPopupBanner();
      toast.success("Popup Banner deleted succssfully");
    } catch (error) {
      toast.error("Failed to delete Popup Banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb
        title={"Popup Banner Management"}
        paths={["Programs", "Popup Banner"]}
      />

      <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
          <p className="text-sm sm:text-lg font-semibold text-gray-800">
            Popup Banner
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 flex gap-2 items-center hover:bg-red-600 transition duration-300"
          >
            <Edit2 size={16} />
            <span>{popupBanner ? "Edit Banner" : "Add Banner"}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-red-500" size={32} />
          </div>
        ) : popupBanner ? (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex gap-6">
              <div>
                <p className="font-medium text-sm mb-2">Website Image:</p>
                {popupBanner.website_image ? (
                  <img
                    src={`${BASE_URL}/${popupBanner.website_image.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt="website"
                    className="w-60 h-auto rounded border"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Not uploaded</span>
                )}
              </div>
              <div>
                <p className="font-medium text-sm mb-2">Mobile Image:</p>
                {popupBanner.mobile_image ? (
                  <img
                    src={`${BASE_URL}/${popupBanner.mobile_image.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt="mobile"
                    className="w-40 h-auto rounded border"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Not uploaded</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <p className="font-medium text-sm">Status:</p>
              <span
                onClick={handleStatusToggle}
                className={`cursor-pointer px-2 py-1 text-xs rounded font-semibold ${
                  popupBanner.status === "active"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {popupBanner.status}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <p className="font-medium text-sm">Delete:</p>
              <span
                onClick={() => handleDelete(popupBanner.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={24} />
              </span>
            </div>

            <div className="flex gap-2 flex-wrap mt-4">
              <p className="font-medium text-sm">Languages:</p>
              {popupBanner.language.map((lang, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-200 text-xs rounded-full"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-8 flex items-center">
            No popup banner available.
          </p>
        )}
      </div>

      <AddPopupBannerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        existingBanner={popupBanner}
        onSuccess={() => {
          fetchPopupBanner();
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default PopupBanner;
