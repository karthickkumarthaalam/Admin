import React from "react";

const LoadingComponent = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-700 text-lg font-medium">Loading...</p>
    </div>
  );
};

export default LoadingComponent;
