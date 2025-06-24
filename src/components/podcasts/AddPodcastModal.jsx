import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiCall } from "../../utils/apiCall";
import { toast } from "react-toastify";

const LANGUAGES = ["English", "Tamil", "French", "German"];
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AddPodcastModal = ({ isOpen, onClose, editPodcastData, onSuccess }) => {
  const [form, setForm] = useState(initialFormState());
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [audioFileName, setAudioFileName] = useState(null);

  const RJ_NAMES = [
    "Dharshan Rajakobal",
    "TKR Thiyagu",
    "Selvamari",
    "Guru Parameshwar",
    "Kavi parthi",
    "Dhusika",
    "Sumi Krishnan",
    "Mithu Thillai",
    "Thusika",
  ];

  function initialFormState() {
    return {
      title: "",
      description: "",
      rjname: "",
      content: "",
      date: "",
      image: null,
      audio: null,
      language: [],
      tags: [],
    };
  }

  useEffect(() => {
    if (isOpen) {
      editPodcastData ? populateForm(editPodcastData) : resetForm();
    }
  }, [isOpen, editPodcastData]);

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
    setImagePreview(null);
    setAudioPreview(null);
    setAudioFileName(null);
  };

  const populateForm = (data) => {
    setForm({
      title: data.title || "",
      description: data.description || "",
      rjname: data.rjname || "",
      content: data.content || "",
      date: data.date ? data.date.split("T")[0] : "",
      image: null,
      audio: null,
      language: data.language || [],
      tags: data.tags || [],
    });
    setImagePreview(
      data.image_url
        ? `${BASE_URL}/${data.image_url.replace(/\\/g, "/")}`
        : null
    );
    setAudioPreview(
      data.audio_drive_file_id
        ? `${BASE_URL}/podcasts/stream-audio/${data.audio_drive_file_id}`
        : null
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, [type]: file }));
      if (type === "image") setImagePreview(URL.createObjectURL(file));
      if (type === "audio") {
        setAudioPreview(URL.createObjectURL(file));
        setAudioFileName(file.name);
      }
      setErrors((prev) => ({ ...prev, [type]: "" }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      language: checked
        ? [...prev.language, value]
        : prev.language.filter((lang) => lang !== value),
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form?.tags?.includes(tagInput.trim())) {
      setForm((prev) => ({
        ...prev,
        tags: [...(prev?.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (index) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = "Podcast title is required.";
    if (!form.rjname) newErrors.rjname = "RJ Name is required.";
    if (!form.date) newErrors.date = "Date is required.";
    if (!editPodcastData && !form.image) newErrors.image = "Image is required.";
    if (!editPodcastData && !form.audio)
      newErrors.audio = "Audio file is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("rjname", form.rjname);
      payload.append("content", form.content);
      payload.append("date", form.date);
      payload.append("language", JSON.stringify(form.language));
      payload.append("tags", JSON.stringify(form.tags));
      if (form.image) payload.append("image", form.image);
      if (form.audio) payload.append("audio", form.audio);

      if (editPodcastData) {
        await apiCall(`/podcasts/update/${editPodcastData.id}`, "PUT", payload);
        toast.success("Podcast updated successfully!");
      } else {
        await apiCall("/podcasts/create", "POST", payload);
        toast.success("Podcast created successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save podcast");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 relative overflow-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editPodcastData ? "Edit Podcast" : "Add Podcast"}
        </h2>

        {/* Title and Description */}
        <div className="mt-4">
          {renderTextInput(
            "Podcast Title",
            "title",
            form.title,
            handleChange,
            errors.title
          )}
        </div>
        <div className="mt-4">
          {renderTextArea(
            "Description",
            "description",
            form.description,
            handleChange
          )}
        </div>

        {/* RJ Name and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {renderRjSelectInput(
            "RJ Name",
            "rjname",
            form.rjname,
            handleChange,
            errors.rjname
          )}
          {renderRjSelectInput(
            "Content Creator",
            "content",
            form.content,
            handleChange,
            errors.content
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {renderDateInput(
            "Published Date",
            "date",
            form.date,
            handleChange,
            errors.date
          )}
        </div>

        {/* Image Upload */}
        <div className="mt-4">
          {renderFileInput(
            "Image",
            "image",
            "image",
            handleFileChange,
            imagePreview,
            errors.image
          )}
        </div>

        {/* Audio Upload + Player */}
        <div className="mt-4">
          {renderAudioInput(
            "Audio",
            "audio",
            "audio",
            handleFileChange,
            audioFileName,
            errors.audio
          )}
        </div>
        {audioPreview && (
          <audio controls src={audioPreview} className="mt-2 w-full">
            Your browser does not support the audio element.
          </audio>
        )}

        <div className="mt-4">{renderTagsInput()}</div>

        {/* Language Checkboxes */}
        <div className="mt-4">{renderLanguageCheckboxes()}</div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
          >
            {editPodcastData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  function renderTextInput(label, name, value, onChange, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  function renderTextArea(label, name, value, onChange) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows="4"
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
      </div>
    );
  }

  function renderRjSelectInput(label, name, value, onChange, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          <option value="">Select {label}</option>
          {RJ_NAMES.map((rj) => (
            <option key={rj} value={rj}>
              {rj}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  function renderDateInput(label, name, value, onChange, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  function renderFileInput(label, type, name, onChange, preview, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input
          type="file"
          accept="image/*"
          name={name}
          onChange={(e) => onChange(e, type)}
        />
        {preview && (
          <img
            src={preview}
            alt={`${label} Preview`}
            className="mt-2 w-full max-h-60 object-contain rounded"
          />
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  function renderAudioInput(label, type, name, onChange, fileName, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input
          type="file"
          accept="audio/*"
          name={name}
          onChange={(e) => onChange(e, type)}
        />
        {fileName && <p className="mt-1 text-sm text-gray-600">{fileName}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  function renderTagsInput() {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">Tags</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Enter a tag"
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none flex-1"
          />
          <button
            onClick={handleAddTag}
            type="button"
            className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Add
          </button>
        </div>
        <div className="flex gap-2 flex-wrap mt-2">
          {form?.tags?.map((tag, index) => (
            <span
              key={index}
              className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  }

  function renderLanguageCheckboxes() {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">Languages</label>
        <div className="flex gap-4 flex-wrap">
          {LANGUAGES.map((lang) => (
            <label key={lang} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                value={lang}
                checked={form.language.includes(lang)}
                onChange={handleCheckboxChange}
              />
              {lang}
            </label>
          ))}
        </div>
      </div>
    );
  }
};

export default AddPodcastModal;
