import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Move,
  Eye,
  Loader2,
  CheckCircle,
  CircleX,
} from "lucide-react";

const AddEventBanner = ({ eventId }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* -------------------------- Fetch Existing Banners ------------------------- */
  useEffect(() => {
    if (eventId) fetchBanners();
    else setBanners([]);
  }, [eventId]);

  const fetchBanners = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await apiCall(`/event-banner/event/${eventId}`, "GET");
      setBanners(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch banners");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------- Upload Banner Files --------------------------- */
  const handleFileUpload = async (files) => {
    if (!eventId) {
      toast.error("Please save event details first");
      return;
    }

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("event_id", eventId);
        formData.append("file", file);
        formData.append(
          "type",
          file.type.startsWith("video/") ? "video" : "image"
        );

        const response = await apiCall("/event-banner", "POST", formData, {
          "Content-Type": "multipart/form-data",
        });
        return response.data;
      } catch {
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successful = results.filter(Boolean);
      if (successful.length > 0) {
        setBanners((prev) => [...prev, ...successful]);
        toast.success(`Uploaded ${successful.length} file(s) successfully`);
      }
    } catch {
      toast.error("Some files failed to upload");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) handleFileUpload(files);
    e.target.value = ""; // reset input
  };

  /* ----------------------------- Delete Banner ------------------------------ */
  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    setDeletingId(bannerId); // start animation

    // wait for animation before removing
    setTimeout(async () => {
      try {
        await apiCall(`/event-banner/${bannerId}`, "DELETE");
        setBanners((prev) => prev.filter((b) => b.id !== bannerId));
        toast.success("Banner deleted successfully");
      } catch {
        toast.error("Failed to delete banner");
      } finally {
        setDeletingId(null);
      }
    }, 100); // wait 300ms for fade-out
  };

  const handleStatusUpdate = async (bannerId, newStatus) => {
    if (!window.confirm("Are you sure you want to update status this banner?"))
      return;

    try {
      await apiCall(`/event-banner/status/${bannerId}`, "PATCH", {
        status: newStatus,
      });

      setBanners((prev) =>
        prev.map((b) => (b.id === bannerId ? { ...b, status: newStatus } : b))
      );

      toast.success(`Banner marked as ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update banner status");
    }
  };

  /* ---------------------------- Reordering Logic ---------------------------- */
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    const reordered = [...banners];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    setBanners(reordered);
    setDragIndex(null);
    updateOrder(reordered);
  };

  const handleDragEnd = () => setDragIndex(null);

  const updateOrder = async (ordered) => {
    try {
      await Promise.all(
        ordered.map((banner, index) =>
          apiCall(`/event-banner/${banner.id}`, "PUT", {
            order_index: index,
          })
        )
      );
      toast.success("Banner order updated");
    } catch {
      toast.error("Failed to update order");
    }
  };

  const getFileName = (url) => (url ? url.split("/").pop() : "Unknown");

  /* ------------------------------ No Event Yet ------------------------------ */
  if (!eventId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <ImageIcon size={48} className=" mb-4" />
        <p className="text-lg font-bold">Please save event first</p>
        <p className="text-sm mt-2">
          Please save the event details before uploading banners.
        </p>
      </div>
    );
  }

  /* ------------------------------- UI Layout -------------------------------- */
  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Event Banner
          </h3>
          <span className="text-sm text-gray-500">
            {banners.length} {banners.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200 bg-gray-50/50">
          <input
            type="file"
            id="banner-upload"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="banner-upload"
            className={`cursor-pointer flex flex-col items-center justify-center gap-4 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? (
              <>
                <Loader2 size={32} className="text-blue-600 animate-spin" />
                <p className="text-sm text-gray-500">Uploading banners...</p>
              </>
            ) : (
              <>
                <Upload size={32} className="text-gray-400" />
                <p className="text-base font-semibold text-gray-700">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-gray-500">
                  Supports images & videos (max 5MB each)
                </p>
                <div className="mt-2 px-5 py-1.5 bg-blue-50 border border-blue-400 rounded-lg text-blue-700 font-medium">
                  Select Files
                </div>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Banner Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <ImageIcon className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Banner Library
              </h3>
              <p className="text-sm text-gray-500">
                Manage event banners and videos
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={42} className="text-blue-600 animate-spin" />
            <p className="text-gray-600 font-medium mt-4">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-2xl text-center">
            <ImageIcon size={64} className="text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No Banners Yet
            </h3>
            <p className="text-gray-500 text-sm max-w-md">
              Upload high-quality event banners or videos to make your event
              stand out.
            </p>
          </div>
        ) : (
          /* Banner Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`relative bg-white border border-gray-200 rounded-xl overflow-hidden transform transition-all duration-300 ${
                  dragIndex === index
                    ? "opacity-70 border-blue-400 shadow-md shadow-blue-100"
                    : "shadow-sm"
                } ${
                  deletingId === banner.id
                    ? "opacity-0 scale-95 translate-y-2 blur-[2px]"
                    : "opacity-100 scale-100 translate-y-0"
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                {/* Banner Media */}
                <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                  {banner.type === "image" ? (
                    <img
                      src={banner.url}
                      alt={getFileName(banner.url)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
                      <Video size={36} className="mb-2 text-blue-400" />
                      <span className="text-sm font-medium opacity-90">
                        Video
                      </span>
                    </div>
                  )}

                  {/* Order Badge */}
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                    #{banner.order_index + 1}
                  </div>

                  {/* Always-visible Controls */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          banner.id,
                          banner.status === "active" ? "inactive" : "active"
                        )
                      }
                      className={`p-2 rounded-lg shadow-sm ${
                        banner.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {banner.status === "active" ? (
                        <CheckCircle size={16} />
                      ) : (
                        <CircleX size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      disabled={deletingId === banner.id}
                      className={`p-2 rounded-lg transition-colors ${
                        deletingId === banner.id
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                      title="Delete Banner"
                    >
                      {deletingId === banner.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Banner Info */}
                <div className="px-4 py-3 bg-blue-50/40 border-t border-blue-100 flex justify-between items-center text-xs text-gray-600">
                  <div className="flex items-center gap-1 capitalize text-blue-800 font-medium">
                    {banner.type === "image" ? (
                      <ImageIcon size={12} className="text-blue-500" />
                    ) : (
                      <Video size={12} className="text-blue-500" />
                    )}
                    {banner.type}
                  </div>
                  <span className="text-gray-500">
                    Order {banner.order_index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEventBanner;
