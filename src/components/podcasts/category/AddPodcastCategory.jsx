import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import { X, UploadCloud, Trash2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const AddPodcastCategory = ({
  isOpen,
  onClose,
  onSuccess,
  editCategoryData,
}) => {
  const initialState = {
    name: "",
    description: "",
    image_url: "",
  };
  const [formData, setFormData] = useState(initialState);

  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (editCategoryData) {
      setFormData({
        name: editCategoryData.name || "",
        description: editCategoryData.description || "",
        image_url: editCategoryData.image_url || "",
      });
      setPreviewImage(editCategoryData.image_url || "");
    } else {
      setFormData({ name: "", description: "" });
      setImage(null);
      setPreviewImage("");
    }
  }, [editCategoryData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);

    const fileReader = new FileReader();

    fileReader.onload = () => {
      setPreviewImage(fileReader.result);
    };

    fileReader.onerror = () => {
      console.error("File reading failed");
    };

    fileReader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("created_by_type", "system");

    if (user.system_user_id) {
      payload.append("system_user_id", user.system_user_id);
    }
    if (image) payload.append("image", image);
    if (!image && formData.image_url === "") {
      payload.append("image_url", "");
    }
    try {
      if (editCategoryData) {
        await apiCall(
          `/podcast-category/${editCategoryData.id}`,
          "PATCH",
          payload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Podcast category updated successfully");
      } else {
        await apiCall("/podcast-category", "POST", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Podcast category added successfully");
      }
      onSuccess();
      setFormData(initialState);
    } catch (error) {
      toast.error("Failed to save podcast category");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {editCategoryData
              ? "Edit Podcast Category"
              : "Add Podcast Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter podcast category name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter category description"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none resize-none h-28"
            />
          </div>

          {/* Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Category Image
              </label>
              {image && (
                <span className="text-xs text-green-600 font-medium">
                  Image selected
                </span>
              )}
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-500 transition-colors duration-200">
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="preview"
                    className="w-full h-48 object-cover rounded-xl shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreviewImage("");
                      setFormData({ ...formData, image_url: "" });
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/80 rounded-lg shadow hover:bg-white transition"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <UploadCloud size={30} className="text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors duration-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                "Save Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPodcastCategory;
