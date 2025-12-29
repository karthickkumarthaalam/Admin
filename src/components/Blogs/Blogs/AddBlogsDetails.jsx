import {
  Calendar,
  FileText,
  ImageIcon,
  Tag,
  Type,
  Upload,
  User,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import { useAuth } from "../../../context/AuthContext";

const AddBlogsDetails = ({ onSuccess, editBlogsData }) => {
  const initialState = useMemo(
    () => ({
      category: "",
      subcategory: "",
      title: "",
      subtitle: "",
      published_by: "",
      publisher_id: "",
      content: "",
      published_date: "",
    }),
    []
  );

  const [blog, setBlog] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const { user } = useAuth();

  // ✅ FIXED LOOP: runs only when editBlogsData changes
  useEffect(() => {
    if (editBlogsData) {
      setBlog({
        category: editBlogsData.category || "",
        subcategory: editBlogsData.subcategory || "",
        title: editBlogsData.title || "",
        subtitle: editBlogsData.subtitle || "",
        published_by: editBlogsData.published_by || "",
        publisher_id: editBlogsData.publisher_id || "",
        content: editBlogsData.content || "",
        published_date: editBlogsData.published_date || "",
      });

      if (editBlogsData.cover_image) {
        setCoverPreview(editBlogsData.cover_image);
      }

      if (editBlogsData.category) {
        fetchSubCategories(editBlogsData.category);
      }
    } else {
      setBlog(() => ({
        ...initialState,
        published_by:
          user?.system_user_id && user?.name !== "Admin" ? user.name : "",
        publisher_id: user?.system_user_id ? user.system_user_id : "",
      }));

      setCoverPreview("");
      setCoverImage(null);
      setSubCategories([]);
    }
  }, [editBlogsData, initialState]);

  // ✅ initialize users + categories on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchUser(), fetchCategories()]);
      } catch {
        toast.error("Failed to initialize data");
      }
    };

    initializeData();
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiCall("/system-user", "GET");
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to fetch users");
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiCall("/blogs-category/list", "GET");
      setCategories(res.data || []);
    } catch {
      toast.error("Failed to fetch categories");
    }
  }, []);

  const fetchSubCategories = useCallback(async (category) => {
    try {
      const res = await apiCall(`/blogs-category/${category}`, "GET");
      setSubCategories(res.subCategories || []);
    } catch {
      toast.error("Failed to fetch subcategories");
    }
  }, []);

  // ✅ FIXED dependencies + correct mapping
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setBlog((prev) => {
        let updated = { ...prev, [name]: value };

        if (name === "category") {
          fetchSubCategories(value);
          updated.subcategory = "";
        }

        if (name === "published_by") {
          const selectedUser = users.find((u) => u.name === value);
          updated = { ...updated, publisher_id: selectedUser?.id || "" };
        }

        return updated;
      });
    },
    [fetchSubCategories, users]
  );

  const handleContentChange = useCallback((value) => {
    setBlog((prev) => ({ ...prev, content: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setCoverImage(file);

    const reader = new FileReader();
    reader.onload = () => {
      setCoverPreview(reader.result);
    };

    reader.onerror = () => {
      console.error("File reading failed");
    };

    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!blog.title.trim()) return toast.error("Blog title required");
    if (!blog.category) return toast.error("Blog category required");
    if (!blog.published_by) return toast.error("Blog publisher required");
    if (!coverImage) return toast.error("Blog image required");
    if (!blog.published_date) return toast.error("Publishing date required");
    if (!blog.content) return toast.error("Blog content required");

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(blog).forEach(([key, value]) => {
        formData.append(key, value || "");
      });

      if (coverImage) formData.append("cover_image", coverImage);

      if (editBlogsData?.id) {
        await apiCall(`/blogs/${editBlogsData.id}`, "PATCH", formData, {
          "Content-Type": "multipart/form-data",
        });
        toast.success("Blog updated successfully");
      } else {
        await apiCall("/blogs/create", "POST", formData, {
          "Content-Type": "multipart/form-data",
        });
        toast.success("Blog published successfully");
      }

      handleReset();
      onSuccess?.();
    } catch {
      toast.error(
        editBlogsData ? "Failed to update blog" : "Failed to create blog"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    setBlog(initialState);
    setCoverPreview("");
    setCoverImage(null);
    setSubCategories([]);
  }, [initialState]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard
        icon={<Type className="text-blue-600" />}
        title="Basic Details"
        description="Enter the title, subtitle, and creator info"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TextInput
            label="Title"
            name="title"
            value={blog.title}
            onChange={handleChange}
            placeholder="Enter Blog Title"
            required
          />
          <TextInput
            label="subtitle"
            name="subtitle"
            value={blog.subtitle}
            onChange={(e) =>
              setBlog((prev) => ({ ...prev, subtitle: e.target.value }))
            }
            placeholder="Enter blog subtitle"
          />

          <SelectInput
            label="Published By"
            name="published_by"
            value={blog.published_by}
            onChange={handleChange}
            options={users.map((u) => ({
              value: u.name,
              label: u.name,
            }))}
            icon={<User size={16} />}
            disabled={!!user?.system_user_id}
          />

          <DateInput
            label="Published Date"
            name="published_date"
            value={blog.published_date}
            onChange={handleChange}
            icon={<Calendar size={16} />}
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={<Tag className="text-green-600" />}
        title="Category Information"
        description="Choose category and subcategory"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SelectInput
            label="Category"
            name="category"
            value={blog.category}
            onChange={handleChange}
            options={categories.map((c) => ({
              value: c,
              label: c,
            }))}
          />
          <SelectInput
            label="subcategory"
            name="subcategory"
            value={blog.subcategory}
            onChange={(e) =>
              setBlog((prev) => ({ ...prev, subcategory: e.target.value }))
            }
            options={subCategories.map((s) => ({
              value: s,
              label: s,
            }))}
            disabled={!blog.category}
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={<FileText className="text-purple-600" />}
        title="Content"
        description="Write the blog content below"
      >
        <RichTextEditor
          label="Content *"
          value={blog.content}
          onChange={handleContentChange}
          placeholder="Write your blog content here..."
        />
      </SectionCard>

      <SectionCard
        icon={<ImageIcon className="text-orange-600" />}
        title="Media Upload"
        description="Upload cover image"
      >
        <FileInput
          label="Cover Image"
          onChange={handleFileChange}
          preview={coverPreview}
        />
      </SectionCard>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50"
        >
          Reset
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-8 py-3 rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {editBlogsData ? "Updating..." : "Saving..."}
            </>
          ) : editBlogsData ? (
            "Update Blog"
          ) : (
            "Publish Blog"
          )}
        </button>
      </div>
    </form>
  );
};

const SectionCard = ({ icon, title, description, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
    <div className="p-5">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-2 bg-gray-100 rounded-xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          {description && (
            <p className="text-gray-600 text-xs">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  </div>
);

const TextInput = ({ label, name, value, onChange, placeholder, required }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-800 mb-2">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    />
  </div>
);

const SelectInput = ({
  label,
  name,
  value,
  onChange,
  options,
  disabled,
  icon,
}) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-800 mb-2">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-xl px-4 py-3.5 outline-none bg-white appearance-none ${
          icon ? "pl-11" : "pl-4"
        } ${disabled ? "bg-gray-100 text-gray-900 cursor-not-allowed" : ""}`}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const DateInput = ({ label, name, value, onChange, icon }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-800 mb-2">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-xl pl-10 px-4 py-3.5 focus:outline-none bg-white"
      />
    </div>
  </div>
);

const FileInput = ({ label, onChange, preview }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-800 mb-2">{label}</label>
    <div className="flex flex-col lg:flex-row gap-6">
      <label className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all bg-gray-50">
        <Upload size={32} className="text-gray-400" />
        <div className="text-center">
          <span className="text-base font-semibold text-gray-700 block">
            Click to upload
          </span>
          <p className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG (max 5MB)</p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </label>

      {preview && (
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-800 mb-2">Preview</p>
          <img
            src={preview}
            alt="preview"
            className="w-full h-48 lg:h-auto lg:max-h-64 object-cover rounded-2xl border shadow-sm"
          />
        </div>
      )}
    </div>
  </div>
);

const RichTextEditor = ({ label, value, onChange, placeholder }) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["link", "image"],
        ["blockquote", "code-block"],
        [{ align: [] }],
        ["clean"],
      ],
    }),
    []
  );

  return (
    <div className="flex flex-col">
      <label className="font-semibold text-sm text-gray-800 mb-2">
        {label}
      </label>
      <div className="border border-gray-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <ReactQuill
          value={value}
          onChange={onChange}
          theme="snow"
          modules={modules}
          placeholder={placeholder}
          className="bg-white [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-0"
          style={{ minHeight: "350px" }}
        />
      </div>
    </div>
  );
};

export default AddBlogsDetails;
