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
} from "lucide-react";

const AddNewsMedia = ({ newsId }) => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  // Fetch existing media when newsId changes
  useEffect(() => {
    if (newsId) {
      fetchMedia();
    } else {
      setMediaList([]);
    }
  }, [newsId]);

  const fetchMedia = async () => {
    if (!newsId) return;

    setLoading(true);
    try {
      const response = await apiCall(`/news-media/by-news/${newsId}`, "GET");
      setMediaList(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch media");
      setMediaList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (!newsId) {
      toast.error("Please save news details first");
      return;
    }

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("news_id", newsId);
        formData.append("media", file);
        formData.append(
          "type",
          file.type.startsWith("video/") ? "video" : "image"
        );

        const response = await apiCall("/news-media/create", "POST", formData, {
          "Content-Type": "multipart/form-data",
        });
        return response.data;
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean);

      if (successfulUploads.length > 0) {
        setMediaList((prev) => [...prev, ...successfulUploads]);
        toast.success(
          `Successfully uploaded ${successfulUploads.length} media files`
        );
      }
    } catch (error) {
      toast.error("Failed to upload some files");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
    e.target.value = ""; // Reset input
  };

  const handleDeleteMedia = async (mediaId, mediaUrl) => {
    if (!window.confirm("Are you sure you want to delete this media?")) return;

    try {
      await apiCall(`/news-media/${mediaId}`, "DELETE");
      setMediaList((prev) => prev.filter((media) => media.id !== mediaId));
      toast.success("Media deleted successfully");
    } catch (error) {
      toast.error("Failed to delete media");
    }
  };

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

    const reorderedMedia = [...mediaList];
    const [movedItem] = reorderedMedia.splice(dragIndex, 1);
    reorderedMedia.splice(dropIndex, 0, movedItem);

    setMediaList(reorderedMedia);
    setDragIndex(null);

    // Update order indices in backend
    updateMediaOrder(reorderedMedia);
  };

  const updateMediaOrder = async (orderedMedia) => {
    try {
      const updatePromises = orderedMedia.map((media, index) =>
        apiCall(`/news-media/${media.id}`, "PATCH", {
          order_index: index,
        })
      );

      await Promise.all(updatePromises);
      toast.success("Media order updated");
    } catch (error) {
      toast.error("Failed to update media order");
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const getFileNameFromUrl = (url) => {
    return url ? url.split("/").pop() : "Unknown file";
  };

  if (!newsId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ImageIcon size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Save News First
        </h3>
        <p className="text-gray-500 text-sm">
          Please save the news details before uploading media files.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upload Media</h3>
          <span className="text-sm text-gray-500">
            {mediaList.length} {mediaList.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200 bg-gray-50/50">
          <input
            type="file"
            id="media-upload"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="media-upload"
            className={`cursor-pointer flex flex-col items-center justify-center gap-4 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? (
              <>
                <Loader2 size={32} className="text-blue-600 animate-spin" />
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-700">
                    Uploading Files...
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Please wait while we process your files
                  </p>
                </div>
              </>
            ) : (
              <>
                <Upload size={32} className="text-gray-400" />
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Supports images and videos (Max 5MB per file)
                  </p>
                </div>
                <div className="px-6 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-500 border-dashed  hover:border-blue-700 transition-colors duration-200 font-medium">
                  Select Files
                </div>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Media Library</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage your news images and videos
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
            <ImageIcon size={16} />
            <span>
              {mediaList.length} {mediaList.length === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <Loader2 size={40} className="text-blue-600 animate-spin" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-sm"></div>
            </div>
            <p className="text-gray-600 font-medium mt-4">
              Loading media library...
            </p>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border-2 border-dashed border-gray-200">
            <div className="relative mb-4">
              <ImageIcon size={56} className="text-gray-300" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload size={12} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No media files yet
            </h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Upload images or videos to create an engaging news experience for
              your readers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {mediaList.map((media, index) => (
              <div
                key={media.id}
                className={`relative group bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 ${
                  dragIndex === index
                    ? "scale-95 opacity-60 border-2 border-blue-400 shadow-lg"
                    : "shadow-sm"
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                {/* Media Preview */}
                <div className="aspect-square relative overflow-hidden">
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt={getFileNameFromUrl(media.url)}
                      className="w-full h-full object-cover transition-transform duration-300 "
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 relative">
                      <Video size={32} className="text-white mb-2" />
                      <span className="text-white text-sm font-medium">
                        Video
                      </span>
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Eye size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Overlay */}
                  <div className="absolute top-0 left-0 right-0  p-3 ">
                    <div className="flex justify-between items-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          media.type === "image"
                            ? "bg-blue-500/80 text-white"
                            : "bg-red-500/80 text-white"
                        }`}
                      ></span>
                      <div className="flex gap-1">
                        <div className="p-1 bg-black/50 rounded text-white backdrop-blur-sm">
                          <Move size={14} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Overlay */}
                  <div className="absolute bottom-0 left-2 right-0">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleDeleteMedia(media.id, media.url)}
                        className="p-2  backdrop-blur-sm rounded-lg text-white bg-red-600 transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Order Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                      #{media.order_index + 1}
                    </div>
                  </div>
                </div>

                {/* File Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{media.type}</span>
                    <span>Order {media.order_index + 1}</span>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-2xl transition-all duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}

        {/* Drag & Drop Hint */}
        {mediaList.length > 0 && (
          <div className="mt-6 flex items-center justify-center text-sm text-gray-500 bg-gray-50 py-3 px-4 rounded-lg border border-gray-200">
            <Move size={16} className="mr-2" />
            <span>Drag and drop to reorder media items</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddNewsMedia;
