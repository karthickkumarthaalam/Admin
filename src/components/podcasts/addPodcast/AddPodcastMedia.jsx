import React, { useState, useEffect, useCallback } from "react";
import {
  UploadCloud,
  Music,
  Trash2,
  Play,
  FileAudio,
  Loader2,
  Video,
} from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

/* ------------------------------------------------------------- */
/*   CONFIG & TYPES                                              */
/* ------------------------------------------------------------- */
const MEDIA_CONFIG = {
  audio: {
    maxSize: 100 * 1024 * 1024, // 100MB
    acceptedTypes: ["mp3", "m4a", "wav", "ogg", "aac"],
    label: "Audio",
    color: "blue",
    icon: Music,
  },
  video: {
    maxSize: 100 * 1024 * 1024, // 150MB (as per UI text)
    acceptedTypes: ["mp4", "mkv", "avi", "webm", "mov"],
    label: "Video",
    color: "emerald",
    icon: Video,
  },
};

/* ------------------------------------------------------------- */
/*   SUBCOMPONENT: MediaUploadCard                               */
/* ------------------------------------------------------------- */
const MediaUploadCard = ({ type, onFileSelect }) => {
  const config = MEDIA_CONFIG[type];
  const Icon = config.icon;
  const colorClasses = {
    blue: {
      border: "hover:border-blue-500",
      bg: "hover:bg-blue-50/40",
      text: "text-blue-600",
      bgLight: "bg-blue-100",
    },
    emerald: {
      border: "hover:border-emerald-500",
      bg: "hover:bg-emerald-50/40",
      text: "text-emerald-600",
      bgLight: "bg-emerald-100",
    },
  };

  const colors = colorClasses[config.color];

  return (
    <div className="flex-1 bg-white/80 border border-gray-100 rounded-2xl shadow-sm p-8 hover:shadow-md transition duration-300">
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-2 ${colors.bgLight} border rounded-xl`}>
          <Icon className={colors.text} size={22} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            Podcast {config.label}
          </h3>
          <p className="text-gray-600 text-sm">
            Upload or manage the {config.label.toLowerCase()} file
          </p>
        </div>
      </div>

      <label
        className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300 rounded-xl p-10 cursor-pointer ${colors.border} ${colors.bg} transition`}
      >
        <UploadCloud size={36} className="text-gray-400" />
        <div className="text-center">
          <p className="font-medium text-gray-700">
            Click to upload {config.label.toLowerCase()}
          </p>
          <p className="text-xs text-gray-500">
            {type === "audio"
              ? "MP3 / M4A / WAV / OGG — Max 100MB"
              : "MP4 / MKV / AVI / MOV / WEBM — Max 100MB"}
          </p>
        </div>
        <input
          type="file"
          accept={type === "audio" ? "audio/*" : "video/*"}
          className="hidden"
          onChange={onFileSelect}
        />
      </label>
    </div>
  );
};

/* ------------------------------------------------------------- */
/*   SUBCOMPONENT: MediaPreviewCard                              */
/* ------------------------------------------------------------- */
const MediaPreviewCard = ({
  type,
  localFile,
  localUrl,
  existingUrl,
  onDelete,
  onUpload,
  uploading,
  deleting,
}) => {
  const config = MEDIA_CONFIG[type];
  const colorClasses = {
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      text: "text-blue-700",
      accent: "text-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
    },
    emerald: {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      accent: "text-emerald-500",
      button: "bg-emerald-600 hover:bg-emerald-700",
    },
  };

  const colors = colorClasses[config.color];
  const hasLocal = localFile && localUrl;
  const hasExisting = existingUrl && !localUrl;
  const fileName = hasLocal
    ? localFile.name
    : hasExisting
    ? existingUrl.split("/").pop()
    : "";

  return (
    <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <FileAudio className="text-gray-700" size={20} />
        <h4 className="font-semibold text-gray-800">{config.label} Preview</h4>
      </div>

      {!hasLocal && !hasExisting && (
        <div className="flex flex-col items-center p-10 text-gray-500">
          <Music size={40} className="opacity-40 mb-3" />
          <p>No {config.label.toLowerCase()} uploaded yet</p>
        </div>
      )}

      {hasLocal && (
        <div
          className={`border ${colors.border} ${colors.bg} rounded-xl p-4 shadow-sm`}
        >
          <div className="flex items-center gap-3">
            <Play size={18} className={colors.text} />
            <div className="flex-1">
              <p className={`font-medium ${colors.text}`}>{fileName}</p>
              <p className={`text-xs ${colors.accent}`}>Not saved yet</p>
            </div>
          </div>
          {type === "audio" ? (
            <audio controls src={localUrl} className="mt-4 w-full rounded" />
          ) : (
            <video controls src={localUrl} className="mt-4 w-full rounded-xl" />
          )}
        </div>
      )}

      {hasExisting && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
          {type === "audio" ? (
            <audio controls src={existingUrl} className="mt-4 w-full rounded" />
          ) : (
            <video
              controls
              src={existingUrl}
              className="mt-2 w-full rounded-xl"
            />
          )}
        </div>
      )}

      {(hasLocal || hasExisting) && (
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="px-5 py-3 border border-gray-300 rounded-xl flex items-center gap-2 hover:bg-gray-50 text-gray-700 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Delete {config.label}
          </button>

          {hasLocal && (
            <button
              type="button"
              onClick={onUpload}
              disabled={uploading}
              className={`px-6 py-3 ${colors.button} text-white rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <UploadCloud size={16} /> Upload {config.label}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------- */
/*   MAIN COMPONENT                                              */
/* ------------------------------------------------------------- */
const AddPodcastMedia = ({ editPodcastData, onSuccess }) => {
  const [media, setMedia] = useState({
    audio: {
      file: null,
      url: null,
      existing: null,
      uploading: false,
      deleting: false,
    },
    video: {
      file: null,
      url: null,
      existing: null,
      uploading: false,
      deleting: false,
    },
  });

  /* ------------------------------------------------------------- */
  /*   Load Existing Media                                         */
  /* ------------------------------------------------------------- */
  useEffect(() => {
    setMedia((prev) => ({
      audio: {
        ...prev.audio,
        existing: editPodcastData?.audio_drive_file_link || null,
        file: null,
        url: null,
      },
      video: {
        ...prev.video,
        existing: editPodcastData?.video_link || null,
        file: null,
        url: null,
      },
    }));
  }, [editPodcastData]);

  /* ------------------------------------------------------------- */
  /*   Cleanup Object URLs                                         */
  /* ------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (media.audio.url) URL.revokeObjectURL(media.audio.url);
      if (media.video.url) URL.revokeObjectURL(media.video.url);
    };
  }, [media.audio.url, media.video.url]);

  /* ------------------------------------------------------------- */
  /*   File Select Handler                                         */
  /* ------------------------------------------------------------- */
  const handleFileSelect = useCallback((type, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const config = MEDIA_CONFIG[type];
    const ext = file.name.split(".").pop().toLowerCase();

    if (!config.acceptedTypes.includes(ext)) {
      toast.error(
        `Unsupported ${type} format. Supported: ${config.acceptedTypes.join(
          ", "
        )}`
      );
      return;
    }

    if (file.size > config.maxSize) {
      toast.error(
        `${config.label} too large! Max ${config.maxSize / (1024 * 1024)}MB.`
      );
      return;
    }

    // Revoke previous URL if exists
    setMedia((prev) => {
      if (prev[type].url) URL.revokeObjectURL(prev[type].url);
      return {
        ...prev,
        [type]: {
          ...prev[type],
          file,
          url: URL.createObjectURL(file),
        },
      };
    });
  }, []);

  /* ------------------------------------------------------------- */
  /*   Upload Handler                                              */
  /* ------------------------------------------------------------- */
  const handleUpload = useCallback(
    async (type) => {
      const item = media[type];
      if (!item.file) {
        toast.error(`No ${type} selected!`);
        return;
      }

      setMedia((prev) => ({
        ...prev,
        [type]: { ...prev[type], uploading: true },
      }));

      try {
        const formData = new FormData();
        formData.append(type, item.file);

        await apiCall(
          `/podcasts/${editPodcastData.id}/${type}`,
          "PUT",
          formData,
          {
            "Content-Type": "multipart/form-data",
          }
        );

        toast.success(`${MEDIA_CONFIG[type].label} uploaded successfully!`);

        // Cleanup
        if (item.url) URL.revokeObjectURL(item.url);

        setMedia((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            file: null,
            url: null,
            uploading: false,
          },
        }));
      } catch (error) {
        toast.error(`${MEDIA_CONFIG[type].label} upload failed`);
        setMedia((prev) => ({
          ...prev,
          [type]: { ...prev[type], uploading: false },
        }));
      }
    },
    [media, editPodcastData?.id]
  );

  /* ------------------------------------------------------------- */
  /*   Delete Handler                                              */
  /* ------------------------------------------------------------- */
  const handleDelete = useCallback(
    async (type) => {
      const item = media[type];
      if (!item.existing && !item.file) {
        toast.info(`No ${type} to delete`);
        return;
      }

      if (!window.confirm(`Delete ${type} permanently?`)) return;

      setMedia((prev) => ({
        ...prev,
        [type]: { ...prev[type], deleting: true },
      }));

      try {
        await apiCall(`/podcasts/${editPodcastData.id}/${type}`, "DELETE");

        toast.success(`${MEDIA_CONFIG[type].label} deleted`);

        // Cleanup local file URL if exists
        if (item.url) URL.revokeObjectURL(item.url);

        setMedia((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            file: null,
            url: null,
            existing: null,
            deleting: false,
          },
        }));
      } catch (err) {
        toast.error(`Failed to delete ${type}`);
        setMedia((prev) => ({
          ...prev,
          [type]: { ...prev[type], deleting: false },
        }));
      }
    },
    [media, editPodcastData?.id]
  );

  /* ------------------------------------------------------------- */
  /*   Render                                                      */
  /* ------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* Audio Section */}
      <div className="flex flex-col lg:flex-row gap-4">
        <MediaUploadCard
          type="audio"
          onFileSelect={(e) => handleFileSelect("audio", e)}
        />
        <MediaPreviewCard
          type="audio"
          localFile={media.audio.file}
          localUrl={media.audio.url}
          existingUrl={media.audio.existing}
          onDelete={() => handleDelete("audio")}
          onUpload={() => handleUpload("audio")}
          uploading={media.audio.uploading}
          deleting={media.audio.deleting}
        />
      </div>

      {/* Video Section */}
      <div className="flex flex-col lg:flex-row gap-4">
        <MediaUploadCard
          type="video"
          onFileSelect={(e) => handleFileSelect("video", e)}
        />
        <MediaPreviewCard
          type="video"
          localFile={media.video.file}
          localUrl={media.video.url}
          existingUrl={media.video.existing}
          onDelete={() => handleDelete("video")}
          onUpload={() => handleUpload("video")}
          uploading={media.video.uploading}
          deleting={media.video.deleting}
        />
      </div>
    </div>
  );
};

export default AddPodcastMedia;
