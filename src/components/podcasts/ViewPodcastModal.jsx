import {
  X,
  Mic,
  Calendar,
  Languages,
  TableOfContents,
  Timer,
} from "lucide-react";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ViewPodcastModal = ({ isOpen, onClose, podcastData }) => {
  if (!isOpen || !podcastData) return null;

  const {
    title,
    rjname,
    content,
    duration,
    description,
    date,
    image_url,
    audio_drive_file_link,
    language,
  } = podcastData;

  const imageSrc = image_url
    ? `${BASE_URL}/${image_url.replace(/\\/g, "/")}`
    : "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[70vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            🎙️ Podcast Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-5">
          {/* Image + Audio side by side */}
          <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
            {/* Image */}
            <img
              src={imageSrc}
              alt="Podcast cover"
              className="w-40 h-40 rounded-lg object-cover border"
            />

            {/* Audio */}
            {audio_drive_file_link && (
              <div className="flex-1 w-full">
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 shadow-inner">
                  <audio
                    controls
                    className="w-full appearance-none outline-none"
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                    }}
                  >
                    <source src={audio_drive_file_link} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <h3 className="text-2xl font-bold text-gray-800">{title}</h3>

            <p className="flex items-center gap-2 text-gray-700">
              <Mic size={18} className="text-red-500" />
              <strong className="text-gray-600">Published By: </strong> {rjname}
            </p>

            <p className="flex items-center gap-2 text-gray-700">
              <TableOfContents size={18} className="text-red-500" />
              <strong className="text-gray-600">Content Creater: </strong>{" "}
              {content}
            </p>

            <p className="flex items-center gap-2 text-gray-700">
              <Timer size={18} className="text-red-500" />
              <strong className="text-gray-600">Duration: </strong> {duration}
            </p>

            <p className="flex items-center gap-2 text-gray-700">
              <Calendar size={18} className="text-red-500" />
              <strong className="text-gray-600">Published Date:</strong>{" "}
              {new Date(date).toLocaleDateString()}
            </p>

            <p className="flex items-center gap-2 text-gray-700">
              <Languages size={18} className="text-red-500" />
              <strong className="text-gray-600">Languages:</strong>{" "}
              {language && Array.isArray(language)
                ? language.join(", ")
                : "N/A"}
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPodcastModal;
