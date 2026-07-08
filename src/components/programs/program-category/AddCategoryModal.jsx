import { RadioTower, X } from "lucide-react";
import { useCallback } from "react";
import { AddCategoryDetails } from "./AddCategoryDetails";

const AddCategoryModal = ({ isOpen, onClose, onSuccess, editCategoryData }) => {
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-md transition-all duration-300 p-4"
    >
      <div className="bg-white rounded-xl shadow-xl w-full h-full overflow-hidden flex flex-col transform transition-all duraiton-300 scale-100">
        <div className="flex justify-between items-center border-b border-gray-200 bg-gradient-r from-gray-50 to-white px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <RadioTower size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font--bold text-gray-900">
                {editCategoryData ? "Edit Category" : "Create New Category"}
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
              className="text-gray-500 group-hover:text-red-500 trasition-all "
            />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-slate-100">
          <div className="p-2 md:p-8">
            <AddCategoryDetails
              onSuccess={onSuccess}
              onClose={onClose}
              editCategoryData={editCategoryData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
