import React from "react";
import { Users, Mic, Video, Calendar } from "lucide-react";

const DashboardContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 flex items-center space-x-4 hover:scale-[1.03] transition border-l-4 border-red-500">
        <div className="bg-gradient-to-br from-red-400 to-red-600 p-3 rounded-full text-white">
          <Users className="w-8 h-8" />
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">Total Users</p>
          <h3 className="text-2xl font-bold text-gray-800">{11}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 flex items-center space-x-4 hover:scale-[1.03] transition border-l-4 border-pink-600">
        <div className="bg-gradient-to-br from-pink-400 to-pink-600 p-3 rounded-full text-white">
          <Mic className="w-8 h-8" />
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">Total RJs</p>
          <h3 className="text-2xl font-bold text-gray-800">{9}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 flex items-center space-x-4 hover:scale-[1.03] transition border-l-4 border-indigo-600">
        <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 p-3 rounded-full text-white">
          <Video className="w-8 h-8" />
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">Total Programs</p>
          <h3 className="text-2xl font-bold text-gray-800">{11}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 flex items-center space-x-4 hover:scale-[1.03] transition border-l-4 border-green-600">
        <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-full text-white">
          <Calendar className="w-8 h-8" />
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">Total Events</p>
          <h3 className="text-2xl font-bold text-gray-800">{11}</h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
