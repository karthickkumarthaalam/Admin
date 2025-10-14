import React, { useState, useEffect } from "react";
import { Loader2, Edit2, Trash2 } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import BreadCrumb from "../../BreadCrum";
import { toast } from "react-toastify";
import AddFestivalGifModal from "./AddFestivalGifModal";
import { usePermission } from "../../../context/PermissionContext";

const FestivalGif = () => {
  const [festivalGif, setFestivalGif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { hasPermission } = usePermission();
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchFestivalGif = async () => {
    setLoading(true);
    try {
      const response = await apiCall(`/festival-gif`, "GET");
      setFestivalGif(response.data[0]); // single record only
    } catch (error) {
      toast.error("Failed to fetch festival gif");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFestivalGif();
  }, []);

  const handleStatusToggle = async () => {
    if (!festivalGif) return;
    if (!window.confirm("Are you sure you want to change the status?")) return;
    const newStatus = !festivalGif.status;

    setLoading(true);
    try {
      await apiCall(`/festival-gif/status/update`, "PUT", {
        status: newStatus,
      });
      fetchFestivalGif();
      toast.success(`Status updated successfully`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!festivalGif) return;
    if (!window.confirm("Are you sure you want to delete this Festival Gif?"))
      return;

    setLoading(true);
    try {
      await apiCall(`/festival-gif/${id}`, "DELETE");
      fetchFestivalGif();
      toast.success("Festival Gif deleted successfully");
    } catch (error) {
      toast.error("Failed to delete Festival Gif");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb
        title={"Festival Gif Management"}
        paths={["Programs", "Festival Gif"]}
      />

      <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
          <p className="text-sm sm:text-lg font-semibold text-gray-800">
            Festival Gif
          </p>

          {hasPermission("Festival Gif", "create") && (
            <button
              onClick={() => setShowModal(true)}
              className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 flex gap-2 items-center hover:bg-=red-600 transition duration-300"
            >
              <Edit2 size={16} />
              <span>{festivalGif ? "Edit Gif" : "Add Gif"}</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-red-600" size={32} />
          </div>
        ) : festivalGif ? (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex gap-8">
              <div>
                <p className="font-medium text-sm mb-2">Left Side Gif:</p>
                {festivalGif.left_side_image ? (
                  <img
                    src={`${BASE_URL}/${festivalGif.left_side_image.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt="left side gif"
                    className="w-60 h-auto rounded border"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Not uploaded</span>
                )}
              </div>

              <div>
                <p className="font-medium text-sm mb-2">Right Side Gif:</p>
                {festivalGif.right_side_image ? (
                  <img
                    src={`${BASE_URL}/${festivalGif.right_side_image.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt="right side gif"
                    className="w-60 h-auto rounded border"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Not uploaded</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <p className="font-medium text-sm">Status:</p>
              {hasPermission("Festival Gif", "update") ? (
                <span
                  onClick={handleStatusToggle}
                  className={`cursor-pointer px-2 py-1 text-xs rounded font-semibold ${
                    festivalGif.status
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {festivalGif.status ? "Active" : "Inactive"}
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded font-semibold bg-gray-200 text-gray-600">
                  {festivalGif.status ? "Active" : "Inactive"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <p className="font-medium text-sm">Delete:</p>
              {hasPermission("Festival Gif", "delete") ? (
                <span
                  onClick={() => handleDelete(festivalGif.id)}
                  className="text-red-500 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 size={24} />
                </span>
              ) : (
                "-"
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-8 flex items-center">
            No Festival Gif available.
          </p>
        )}
      </div>

      <AddFestivalGifModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        existingGif={festivalGif}
        onSuccess={() => {
          fetchFestivalGif();
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default FestivalGif;
