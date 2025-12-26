import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import {
  Upload,
  FileText,
  Type,
  Globe,
  Image as ImageIcon,
  Calendar,
  User,
  Tag,
  MapPin,
  Link,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

/* -------------------------------------------------------------------------- */
/*                                Main Component                              */
/* -------------------------------------------------------------------------- */
const AddNewsDetails = ({ onSuccess, editNewsData }) => {
  const initialState = useMemo(
    () => ({
      category: "",
      subcategory: "",
      title: "",
      subtitle: "",
      published_by: "",
      rj_id: "",
      content_creator: "",
      content: "",
      country: "",
      state: "",
      city: "",
      // status: "",
      video_url: "",
      audio_url: "",
      published_date: "",
    }),
    []
  );

  const [news, setNews] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Populate form when editNewsData changes
  useEffect(() => {
    if (editNewsData) {
      setNews({
        category: editNewsData.category || "",
        subcategory: editNewsData.subcategory || "",
        title: editNewsData.title || "",
        subtitle: editNewsData.subtitle || "",
        published_by: editNewsData.published_by || "",
        rj_id: editNewsData.rj_id || "",
        content_creator: editNewsData.content_creator || "",
        content: editNewsData.content || "",
        country: editNewsData.country || "",
        state: editNewsData.state || "",
        city: editNewsData.city || "",
        // status: editNewsData.status || "",
        video_url: editNewsData.video_url || "",
        audio_url: editNewsData.audio_url || "",
        published_date: editNewsData.published_date || "",
      });

      // Set cover preview if exists
      if (editNewsData.cover_image) {
        setCoverPreview(editNewsData.cover_image);
      }

      // Fetch subcategories if category exists
      if (editNewsData.category) {
        fetchSubCategories(editNewsData.category);
      }

      // Fetch states and cities if location data exists
      if (editNewsData.country) {
        fetchStates(editNewsData.country);
        if (editNewsData.state) {
          fetchCities(editNewsData.country, editNewsData.state);
        }
      }
    } else {
      // Reset form for new news
      setNews(initialState);
      setCoverPreview("");
      setCoverImage(null);
      setSubCategories([]);
      setStates([]);
      setCities([]);
    }
  }, [editNewsData, initialState]);

  /* ------------------------------ Fetch Data ------------------------------ */
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchUser(), fetchCategories(), fetchCountries()]);
      } catch (error) {
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
      const res = await apiCall("/news-category/list", "GET");
      setCategories(res.data || []);
    } catch {
      toast.error("Failed to fetch categories");
    }
  }, []);

  const fetchSubCategories = useCallback(async (category) => {
    try {
      const res = await apiCall(`/news-category/${category}`, "GET");
      setSubCategories(res.subCategories || []);
    } catch {
      toast.error("Failed to fetch subcategories");
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/");
      const data = await res.json();
      setCountries(data.data || []);
    } catch {
      toast.error("Failed to fetch countries");
    }
  }, []);

  const fetchStates = useCallback(async (country) => {
    try {
      const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country }),
        }
      );
      const data = await res.json();
      setStates(data.data?.states || []);
    } catch {
      toast.error("Failed to fetch states");
    }
  }, []);

  const fetchCities = useCallback(async (country, state) => {
    try {
      const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country, state }),
        }
      );
      const data = await res.json();
      setCities(data.data || []);
    } catch {
      toast.error("Failed to fetch cities");
    }
  }, []);

  /* ----------------------------- Input Handlers ---------------------------- */
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setNews((prev) => {
        let updated = { ...prev, [name]: value };

        if (name === "category") {
          fetchSubCategories(value);
        }

        if (name === "country") {
          fetchStates(value);
          updated = { ...updated, state: "", city: "" };
        }

        if (name === "state") {
          fetchCities(updated.country, value);
        }

        if (name === "published_by") {
          const selectedUser = users.find((u) => u.name === value);
          updated = { ...updated, rj_id: selectedUser?.id || "" };
        }

        return updated;
      });
    },
    [fetchSubCategories, fetchStates, fetchCities, users]
  );

  const handleContentChange = useCallback((value) => {
    setNews((prev) => ({ ...prev, content: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic file validation
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setCoverImage(file);

      const fileReader = new FileReader();

      fileReader.onload = () => {
        setCoverPreview(fileReader.result);
      };

      fileReader.onerror = () => {
        console.error("File reading failed");
      };

      fileReader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!news.title.trim() || !news.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(news).forEach(([key, val]) =>
        formData.append(key, val || "")
      );
      if (coverImage) formData.append("cover_image", coverImage);

      if (editNewsData) {
        // Update existing news
        await apiCall(`/news/${editNewsData.id}`, "PATCH", formData, {
          "Content-Type": "multipart/form-data",
        });
        toast.success("News updated successfully!");
      } else {
        // Create new news
        await apiCall("/news/create", "POST", formData, {
          "Content-Type": "multipart/form-data",
        });
        toast.success("News added successfully!");
      }

      setNews(initialState);
      setCoverPreview("");
      setCoverImage(null);
      onSuccess?.();
    } catch {
      toast.error(
        editNewsData ? "Failed to update news" : "Failed to add news"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    setNews(initialState);
    setCoverPreview("");
    setCoverImage(null);
    setSubCategories([]);
    setStates([]);
    setCities([]);
  }, [initialState]);

  /* ------------------------------ Form Layout ------------------------------ */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section: Basic Details */}
      <SectionCard
        icon={<Type className="text-blue-600" />}
        title="Basic Details"
        description="Enter the title, subtitle, and creator info"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TextInput
            label="Title"
            name="title"
            value={news.title}
            onChange={handleChange}
            placeholder="Enter news title"
            required
          />
          <TextInput
            label="Subtitle"
            name="subtitle"
            value={news.subtitle}
            onChange={handleChange}
            placeholder="Enter news subtitle"
          />

          <SelectInput
            label="Published By"
            name="published_by"
            value={news.published_by}
            onChange={handleChange}
            options={users.map((u) => ({
              value: u.name,
              label: u.name,
            }))}
            icon={<User size={16} />}
          />
          <TextInput
            label="Content Creator"
            name="content_creator"
            value={news.content_creator}
            onChange={handleChange}
            placeholder="Enter content creator name"
            icon={<User size={16} />}
          />
          {/* <SelectInput
            label="Status"
            name="status"
            value={news.status}
            onChange={handleChange}
            options={["Draft", "Published", "Archived"]}
          /> */}
          <DateInput
            label="Published Date"
            name="published_date"
            value={news.published_date}
            onChange={handleChange}
          />
        </div>
      </SectionCard>

      {/* Section: Categories */}
      <SectionCard
        icon={<Tag className="text-green-600" />}
        title="Category Information"
        description="Choose category and subcategory for the news item"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SelectInput
            label="Category"
            name="category"
            value={news.category}
            onChange={handleChange}
            options={categories.map((c) => ({
              value: c,
              label: c,
            }))}
          />
          <SelectInput
            label="Subcategory"
            name="subcategory"
            value={news.subcategory}
            onChange={handleChange}
            options={subCategories.map((s) => ({
              value: s,
              label: s,
            }))}
            disabled={!news.category}
          />
        </div>
      </SectionCard>

      {/* Section: Location */}
      <SectionCard
        icon={<MapPin className="text-red-600" />}
        title="Location Details"
        description="Specify the location where the news is relevant"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SelectInput
            label="Country"
            name="country"
            value={news.country}
            onChange={handleChange}
            options={countries.map((c) => c.country)}
            icon={<Globe size={16} />}
          />
          <SelectInput
            label="State"
            name="state"
            value={news.state}
            onChange={handleChange}
            options={states.map((s) => s.name)}
            disabled={!news.country}
          />
          <SelectInput
            label="City"
            name="city"
            value={news.city}
            onChange={handleChange}
            options={cities}
            disabled={!news.state}
          />
        </div>
      </SectionCard>

      {/* Section: Media */}
      <SectionCard
        icon={<ImageIcon className="text-orange-600" />}
        title="Media Upload"
        description="Upload cover image or provide media URLs"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <FileInput
            label="Cover Image"
            onChange={handleFileChange}
            preview={coverPreview}
          />
          <div className="space-y-6">
            <TextInput
              label="Video URL"
              name="video_url"
              value={news.video_url}
              onChange={handleChange}
              placeholder="https://example.com/video"
              icon={<Link size={16} />}
            />
            <TextInput
              label="Audio URL"
              name="audio_url"
              value={news.audio_url}
              onChange={handleChange}
              placeholder="https://example.com/audio"
              icon={<Link size={16} />}
            />
          </div>
        </div>
      </SectionCard>

      {/* Section: Content */}
      <SectionCard
        icon={<FileText className="text-purple-600" />}
        title="Content"
        description="Write or paste the news content below"
      >
        <RichTextEditor
          label="Content *"
          value={news.content}
          onChange={handleContentChange}
          placeholder="Write your news content here..."
        />
      </SectionCard>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {editNewsData ? "Updating..." : "Saving..."}
            </>
          ) : editNewsData ? (
            "Update News"
          ) : (
            "Publish News"
          )}
        </button>
      </div>
    </form>
  );
};

/* -------------------------------------------------------------------------- */
/*                               Reusable Components                          */
/* -------------------------------------------------------------------------- */
const SectionCard = ({ icon, title, description, children }) => (
  <div className="bg-white/80 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
    <div className="p-5">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          {description && (
            <p className="text-gray-600 text-xs leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  </div>
);

const TextInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  icon,
}) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
          icon ? "pl-11" : "pl-4"
        } placeholder-gray-400`}
      />
    </div>
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
    <label className="font-semibold text-sm text-gray-800 mb-3">{label}</label>
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
        className={`w-full border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white appearance-none ${
          icon ? "pl-11" : "pl-4"
        } ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
      >
        <option value="">Select {label}</option>
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
        </svg>
      </div>
    </div>
  </div>
);

const DateInput = ({ label, name, value, onChange }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-800 mb-3">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Calendar size={16} />
      </div>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
      />
    </div>
  </div>
);

const FileInput = ({ label, onChange, preview }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-800 mb-3">{label}</label>
    <div className="flex flex-col lg:flex-row gap-6">
      <label className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 bg-gray-50/50">
        <Upload size={32} className="text-gray-400" />
        <div className="text-center">
          <span className="text-base font-semibold text-gray-700 block">
            Click to upload
          </span>
          <p className="text-sm text-gray-500 mt-2">PNG, JPG, JPEG (max 5MB)</p>
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
          <p className="font-semibold text-sm text-gray-800 mb-3">Preview</p>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 lg:h-auto lg:max-h-64 object-cover rounded-2xl border shadow-sm"
          />
        </div>
      )}
    </div>
  </div>
);

/* -------------------------- Rich Text Editor -------------------------- */
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
      <label className="font-semibold text-sm text-gray-800 mb-3">
        {label}
      </label>
      <div className="border border-gray-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
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

export default AddNewsDetails;
