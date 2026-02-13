import {
  CalendarDays,
  CarIcon,
  Contact2,
  ImageIcon,
  User2,
  X,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import AddEventDetails from "./AddEventDetails";
import AddEventBanner from "./AddEventBanner";
import AddEventCrew from "./AddEventCrew";
import AddEventAmenity from "./AddEventAmenity";
import AddEventContactDetails from "./AddEventContactDetails";

const AddEventModal = ({ isOpen, onClose, onSuccess, editEventData }) => {
  const [activeTab, setActiveTab] = useState("event-details");

  // Reset active tab whenever modal opens/closes or edit data changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab("event-details");
    }
  }, [isOpen, editEventData]);

  // Handle backdrop click (to close modal)
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  const tabs = [
    {
      id: "event-details",
      label: "Event Details",
      icon: <CalendarDays size={18} />,
      component: (
        <AddEventDetails onSuccess={onSuccess} editEventData={editEventData} />
      ),
    },
    {
      id: "event-banner",
      label: "Event Banner",
      icon: <ImageIcon size={18} />,
      component: <AddEventBanner eventId={editEventData?.id} />,
    },
    {
      id: "event-crew",
      label: "Event Crew",
      icon: <User2 size={18} />,
      component: <AddEventCrew eventId={editEventData?.id} />,
    },
    {
      id: "event-amenity",
      label: "Event Amenity",
      icon: <CarIcon size={18} />,
      component: <AddEventAmenity eventId={editEventData?.id} />,
    },
    {
      id: "contact-details",
      label: "Contact Details",
      icon: <Contact2 size={18} />,
      component: <AddEventContactDetails eventId={editEventData?.id} />,
    },
  ];

  const bottomText = {
    "event-details": "Fill in all required event details marked with *",
    "event-banner": "Upload and manage event banners or images",
    "event-crew": "Add and manage crew members associated with this event",
    "event-amenity": "Add and manage amenities available at the event",
    "event-contact": "Provide contact details for event inquiries",
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] md:p-4 backdrop-blur-md transition-all duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full h-full overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <CalendarDays className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editEventData ? "Event Details" : "Create New Event"}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            aria-label="Close modal"
          >
            <X
              size={24}
              className="text-gray-500 group-hover:text-red-500 transition-colors duration-200"
            />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white px-8 overflow-y-scroll scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 whitespace-nowrap px-6 py-4 font-semibold text-sm transition-all duration-300 relative group  ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <div
                className={`transition-colors duration-300 ${
                  activeTab === tab.id
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-blue-500"
                }`}
              >
                {tab.icon}
              </div>
              {tab.label}

              {/* Active indicator */}
              <div
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-all duration-300 ${
                  activeTab === tab.id ? "scale-100" : "scale-0"
                }`}
              />

              {/* Hover effect */}
              <div
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-200 transition-all duration-300 ${
                  activeTab === tab.id
                    ? "scale-0"
                    : "scale-0 group-hover:scale-100"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-slate-100">
          <div className="p-2 md:p-8">
            {tabs.find((tab) => tab.id === activeTab)?.component}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white px-8 py-4">
          <div className="flex justify-between items-center text-xs md:text-sm text-gray-500">
            <span>{bottomText[activeTab]}</span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {editEventData ? "Editing Mode" : "Creation Mode"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
