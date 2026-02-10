import React, { useState, useEffect, useCallback } from "react";
import { UploadCloud, Music, Video, Trash2, UploadIcon } from "lucide-react";
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

const UnifiedMediaCard = ({
  type,
  localFile,
  localUrl,
  existingUrl,
  onFileSelect,
  onUpload,
  onDelete,
  uploading,
  deleting,
}) => {
  const config = MEDIA_CONFIG[type];
  const Icon = config.icon;

  const hasLocal = localFile && localUrl;
  const hasExisting = existingUrl && !localUrl;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-xl">
          <Icon size={20} />
        </div>
        <h3 className="font-semibold text-gray-800">Podcast {config.label}</h3>
      </div>

      {/* Preview or Upload */}
      {!hasLocal && !hasExisting && (
        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:bg-gray-50 transition">
          <UploadCloud size={32} className="text-gray-400" />
          <p className="text-sm text-gray-600">
            Click to upload {config.label.toLowerCase()}
          </p>
          <p className="text-xs text-gray-400">
            {type === "audio"
              ? "MP3 / WAV / OGG — Max 100MB"
              : "MP4 / MKV / WEBM — Max 100MB"}
          </p>
          <input
            type="file"
            accept={type === "audio" ? "audio/*" : "video/*"}
            className="hidden"
            onChange={onFileSelect}
          />
        </label>
      )}

      {(hasLocal || hasExisting) && (
        <div className="space-y-4">
          {/* Media Player */}
          {type === "audio" ? (
            <audio controls src={localUrl || existingUrl} className="w-full" />
          ) : (
            <video
              controls
              src={localUrl || existingUrl}
              className="w-full rounded-xl"
            />
          )}

          {/* File Info */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span className="truncate">
              {hasLocal ? localFile.name : existingUrl?.split("/").pop()}
            </span>
            {hasLocal && (
              <span className="text-xs text-orange-500 font-medium">
                Not saved
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <label className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">
              Replace
              <input
                type="file"
                accept={type === "audio" ? "audio/*" : "video/*"}
                className="hidden"
                onChange={onFileSelect}
              />
            </label>

            <button
              onClick={onDelete}
              disabled={deleting}
              className="relative w-10 h-10
             flex items-center justify-center
             border border-red-200
             rounded-lg
             text-red-600
             hover:bg-red-50
             transition
             disabled:opacity-50"
            >
              {deleting ? (
                <span
                  className="w-4 h-4
                     border-2 border-red-300 border-t-red-600
                     rounded-full animate-spin"
                />
              ) : (
                <Trash2 size={18} />
              )}
            </button>

            {hasLocal && (
              <button
                onClick={onUpload}
                disabled={uploading}
                className="relative w-10 h-10
                           flex items-center justify-center
                           bg-indigo-600
                           text-white
                           rounded-lg
                           hover:bg-indigo-700
                           transition
                           disabled:opacity-50"
              >
                {uploading ? (
                  <span
                    className="w-4 h-4
                                   border-2 border-white/40 border-t-white
                                   rounded-full animate-spin"
                  />
                ) : (
                  <UploadIcon size={18} />
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------- */
/*   MAIN COMPONENT                                              */
/* ------------------------------------------------------------- */
const AddPodcastMedia = ({
  editPodcastData,
  setEditPodcastData,
  onSuccess,
}) => {
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
          ", ",
        )}`,
      );
      return;
    }

    if (file.size > config.maxSize) {
      toast.error(
        `${config.label} too large! Max ${config.maxSize / (1024 * 1024)}MB.`,
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

        const res = await apiCall(
          `/podcasts/${editPodcastData.id}/${type}`,
          "PUT",
          formData,
          {
            "Content-Type": "multipart/form-data",
          },
        );

        toast.success(`${MEDIA_CONFIG[type].label} uploaded successfully!`);

        // Cleanup
        if (item.url) URL.revokeObjectURL(item.url);
        setEditPodcastData(res.data);

        setMedia((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            file: null,
            url: null,
            existing:
              type === "audio"
                ? res.data.audio_drive_file_link
                : res.data.video_link,
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
    [media, editPodcastData?.id],
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
    [media, editPodcastData?.id],
  );

  const handleFinish = useCallback(() => {
    if (media.audio.file && !media.audio.existing) {
      toast.error("Please upload the selected audio file before finishing.");
      return;
    }

    if (media.video.file && !media.video.existing) {
      toast.error("Please upload the selected video file before finishing.");
      return;
    }

    onSuccess();
  }, [media, onSuccess]);

  const isUploading = media.audio.uploading || media.video.uploading;

  /* ------------------------------------------------------------- */
  /*   Render                                                      */
  /* ------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* Audio Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnifiedMediaCard
          type="audio"
          localFile={media.audio.file}
          localUrl={media.audio.url}
          existingUrl={media.audio.existing}
          uploading={media.audio.uploading}
          deleting={media.audio.deleting}
          onFileSelect={(e) => handleFileSelect("audio", e)}
          onUpload={() => handleUpload("audio")}
          onDelete={() => handleDelete("audio")}
        />

        <UnifiedMediaCard
          type="video"
          localFile={media.video.file}
          localUrl={media.video.url}
          existingUrl={media.video.existing}
          uploading={media.video.uploading}
          deleting={media.video.deleting}
          onFileSelect={(e) => handleFileSelect("video", e)}
          onUpload={() => handleUpload("video")}
          onDelete={() => handleDelete("video")}
        />
      </div>
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-800">Note:</span> After
        uploading the audio or video, please click the{" "}
        <span className="font-semibold text-indigo-600">Finish</span> button to
        save the podcast.
      </p>
      <div className="flex justify-end items-center">
        <button
          onClick={handleFinish}
          disabled={isUploading}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default AddPodcastMedia;
