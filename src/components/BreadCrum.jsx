import React from "react";
import { Home, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BreadCrumb = ({ title, paths = [] }) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/dashboard");
  };

  return (
    <div className="hidden md:flex items-center bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-100 px-6 py-2 mt-2 mx-4">
      {/* Title Section */}
      <div className="flex items-center">
        <h4 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent whitespace-nowrap">
          {title}
        </h4>
        <div className="w-px h-6 bg-gradient-to-b from-gray-200 to-gray-300 mx-4"></div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-3">
        {/* Home Icon */}
        <div
          onClick={handleRedirect}
          className="flex items-center justify-center w-8 h-8 bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:bg-red-50 hover:border-red-200 hover:shadow-md transition-all duration-200 group"
        >
          <Home
            size={18}
            className="text-gray-600 group-hover:text-red-600 transition-colors duration-200"
          />
        </div>

        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />

        {/* Breadcrumb Paths */}
        <div className="flex items-center space-x-2">
          {paths.map((path, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    index === paths.length - 1
                      ? "text-gray-900 bg-gray-100 px-3 py-1 rounded-lg font-semibold"
                      : "text-gray-600 hover:text-gray-900 cursor-default"
                  }`}
                >
                  {path}
                </span>
              </div>

              {index !== paths.length - 1 && (
                <ChevronRight
                  size={14}
                  className="text-gray-400 flex-shrink-0"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Optional: Add a subtle decorative element */}
      <div className="ml-auto flex items-center">
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
          <div className="w-1 h-1 bg-red-300 rounded-full"></div>
          <div className="w-1 h-1 bg-red-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default BreadCrumb;
