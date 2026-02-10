import React, { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import {
  Type,
  User,
  Calendar,
  Image as ImageIcon,
  Tag as TagIcon,
  FileText,
  Globe,
  Paperclip,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useAuth } from "../../../context/AuthContext";

/* -------------------------------------------------------------------------- */
/*                              LANGUAGE OPTIONS                              */
/* -------------------------------------------------------------------------- */
const LANGUAGE_OPTIONS = ["English", "Tamil", "German", "French"];

/* -------------------------------------------------------------------------- */
/*                             AddPodcastDetails UI                           */
/* -------------------------------------------------------------------------- */
const AddPodcastDetails = ({ onNext, editPodcastData }) => {
  const initialState = useMemo(
    () => ({
      title: "",
      description: "",
      rj_id: "",
      content: "",
      category_id: "",
      date: "",
      image: null,
      language: [],
      tags: [],
    }),
    [],
  );

  const [podcast, setPodcast] = useState(initialState);
  const [systemUsers, setSystemUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  /* ---------------------------- Fetch RJ Users ---------------------------- */
  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiCall("/system-user?limit=200", "GET");
      setSystemUsers(res.data || []);
    } catch {
      toast.error("Failed to load RJs");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiCall("/podcast-category?limit=200", "GET");
      setCategories(res.data);
    } catch (error) {
      toast.error("Failed to load Category");
    }
  };

  /* -------------------------- Populate Edit Mode -------------------------- */
  useEffect(() => {
    if (editPodcastData) {
      setPodcast({
        title: editPodcastData.title || "",
        description: editPodcastData.description || "",
        rj_id: editPodcastData.rj_id || "",
        category_id: editPodcastData.category_id || "",
        content: editPodcastData.content || "",
        date: editPodcastData.date?.split("T")[0] || "",
        language: editPodcastData.language || [],
        tags: editPodcastData.tags || [],
        image: null,
      });

      if (editPodcastData.image_url) {
        setCoverPreview(editPodcastData.image_url);
      }
    } else {
      setPodcast(() => ({
        ...initialState,
        rj_id: user?.system_user_id ? String(user.system_user_id) : "",
      }));
      setCoverPreview("");
      setCoverImage(null);
    }
  }, [editPodcastData, initialState]);

  /* ----------------------------- Input Handlers ---------------------------- */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setPodcast((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDescriptionChange = (value) => {
    setPodcast((prev) => ({ ...prev, description: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Upload a valid image");
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
  };

  const toggleLanguage = (lang) => {
    setPodcast((prev) => ({
      ...prev,
      language: prev.language.includes(lang)
        ? prev.language.filter((l) => l !== lang)
        : [...prev.language, lang],
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !podcast.tags.includes(tagInput.trim())) {
      setPodcast((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleTagRemove = (i) => {
    setPodcast((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, idx) => idx !== i),
    }));
  };

  /* ------------------------------- Submit Form ------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!podcast.title.trim()) return toast.error("Title is required");
    if (!podcast.rj_id) return toast.error("RJ Name is required");
    if (!podcast.date) return toast.error("Date is required");

    const formData = new FormData();
    Object.entries(podcast).forEach(([key, val]) =>
      Array.isArray(val)
        ? formData.append(key, JSON.stringify(val))
        : formData.append(key, val || ""),
    );
    if (coverImage) formData.append("image", coverImage);

    formData.append("created_by_type", "system");

    if (user.system_user_id) {
      formData.append("system_user_id", user?.system_user_id);
    }

    setLoading(true);

    try {
      let response;
      if (editPodcastData) {
        response = await apiCall(
          `/podcasts/update/${editPodcastData.id}`,
          "PUT",
          formData,
        );
        toast.success("Podcast updated!");
      } else {
        response = await apiCall("/podcasts/create", "POST", formData);
        toast.success("Podcast created!");
      }

      onNext?.(response.data);
    } catch {
      toast.error("Failed to save podcast");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                 UI RENDERING                               */
  /* -------------------------------------------------------------------------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECTION 1 — BASIC DETAILS */}
      <SectionCard
        icon={<Type className="text-indigo-600" />}
        title="Podcast Basic Details"
        description="Enter the title, RJ name & creator info"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TextInput
            label="Title"
            name="title"
            value={podcast.title}
            onChange={handleChange}
            placeholder="Enter podcast title"
            required
          />

          <SelectInput
            label="RJ Name"
            name="rj_id"
            value={podcast.rj_id}
            onChange={handleChange}
            options={systemUsers.map((u) => ({
              value: u.id,
              label: u.name,
            }))}
            icon={<User size={16} />}
            required
            disabled={!!user?.system_user_id}
          />

          <SelectInput
            label="Content Creator"
            name="content"
            value={podcast.content}
            onChange={handleChange}
            options={systemUsers.map((u) => ({
              value: u.name,
              label: u.name,
            }))}
            icon={<User size={16} />}
          />

          <SelectInput
            label="Category"
            name="category_id"
            value={podcast.category_id}
            onChange={handleChange}
            options={categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            icon={<Paperclip size={16} />}
          />

          <DateInput
            label="Published Date"
            name="date"
            value={podcast.date}
            onChange={handleChange}
          />
        </div>
      </SectionCard>

      {/* SECTION 2 — COVER IMAGE */}
      <SectionCard
        icon={<ImageIcon className="text-blue-600" />}
        title="Cover Image"
        description="Upload the podcast cover banner"
      >
        <FileInput
          label="Cover Image"
          onChange={handleFileChange}
          preview={coverPreview}
        />
      </SectionCard>

      {/* SECTION 3 — DESCRIPTION */}
      <SectionCard
        icon={<FileText className="text-purple-600" />}
        title="Description"
        description="Write a detailed description of the podcast"
      >
        <RichTextEditor
          label="Description"
          value={podcast.description}
          onChange={handleDescriptionChange}
        />
      </SectionCard>

      {/* SECTION 4 — TAGS */}
      <SectionCard
        icon={<TagIcon className="text-green-600" />}
        title="Tags"
        description="Add searchable tags for this podcast"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Enter tag"
            className="border border-gray-300 rounded-xl px-4 py-3 w-full"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-3 bg-indigo-600 text-white rounded-xl"
          >
            Add
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {podcast.tags.map((tag, i) => (
            <div
              key={i}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full flex items-center gap-2 text-sm"
            >
              {tag}
              <button onClick={() => handleTagRemove(i)}>×</button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* SECTION 5 — LANGUAGES */}
      <SectionCard
        icon={<Globe className="text-red-600" />}
        title="Languages"
        description="Select available languages"
      >
        <div className="flex gap-4 flex-wrap">
          {LANGUAGE_OPTIONS.map((lang) => (
            <label key={lang} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={podcast.language.includes(lang)}
                onChange={() => toggleLanguage(lang)}
              />
              {lang}
            </label>
          ))}
        </div>
      </SectionCard>

      {/* SECTION 6 — SUBMIT BUTTON */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : editPodcastData
              ? "Update and Next"
              : "Save and Next"}
        </button>
      </div>
    </form>
  );
};

export default AddPodcastDetails;

/* -------------------------------------------------------------------------- */
/*                         Reusable Styled Components                         */
/* -------------------------------------------------------------------------- */

const SectionCard = ({ icon, title, description, children }) => (
  <div className="bg-white/80 rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-start gap-4 mb-6">
      <div className="p-2 bg-gray-100 rounded-xl">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
    {children}
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
    <label className="font-semibold text-sm mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-4 text-gray-500">{icon}</div>
      )}
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:outline-none focus:ring-indigo-600 ${
          icon ? "pl-10" : ""
        }`}
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
  icon,
  required,
  disabled = false,
}) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm mb-2">
      {label} {required && "*"}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-4 text-gray-500">{icon}</div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:outline-none focus:ring-indigo-600 
          ${icon ? "pl-10" : ""}
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}
        `}
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

const DateInput = ({ label, name, value, onChange }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm mb-2">{label}</label>
    <div className="relative">
      <Calendar size={16} className="absolute left-3 top-4 text-gray-500" />
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-xl pl-10 py-3 focus:ring-2 focus:outline-none focus:ring-indigo-600"
      />
    </div>
  </div>
);
const FileInput = ({ label, onChange, preview }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-800 mb-3">{label}</label>

    <div className="flex flex-col md:flex-row gap-6">
      {/* Upload Box */}
      <label className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/40 transition-all duration-200 bg-gray-50/50">
        <ImageIcon size={36} className="text-gray-400" />
        <div className="text-center">
          <span className="text-base font-semibold text-gray-700 block">
            Click to upload
          </span>
          <p className="text-sm text-gray-500 mt-2">PNG, JPG, JPEG (Max 5MB)</p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </label>

      {/* Preview */}
      {preview && (
        <div className="flex-1">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 md:h-72 object-contain rounded-2xl border shadow-sm"
          />
        </div>
      )}
    </div>
  </div>
);

const RichTextEditor = ({ label, value, onChange }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <div className="flex flex-col">
      <label className="font-semibold text-sm mb-2">{label}</label>
      <div className="border border-gray-300 rounded-xl overflow-hidden">
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          theme="snow"
          style={{ minHeight: "250px" }}
        />
      </div>
    </div>
  );
};
