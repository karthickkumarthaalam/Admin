import React from "react";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BreadCrumb = ({ title, paths = [] }) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/dashboard");
  };

  return (
    <div className="hidden md:flex  text-white rounded-sm shadow-md px-6 py-3 mt-4 mx-4">
      <div className="flex items-center space-x-4">
        <h4 className="text-xl text-gray-800 font-bold border-r-2 pr-4 ">
          {title}
        </h4>
        <Home className="w-5 h-5 text-red-500" onClick={handleRedirect} />

        <span className="text-gray-800">&gt;</span>
        {paths.map((path, index) => (
          <div key={index} className="flex items-center space-x-4">
            <p className="text-md text-gray-600 font-semibold">{path}</p>
            {index !== paths.length - 1 && (
              <span className="text-gray-800">&gt;</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BreadCrumb;
