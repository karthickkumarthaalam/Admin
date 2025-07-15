import React from "react";
import { Users, Mic, Video, Calendar } from "lucide-react";

const DashboardContent = () => {
  const stats = [
    {
      title: "Total Users",
      value: 11,
      icon: <Users className="w-8 h-8" />,
      color: "from-blue-500 to-indigo-600",
      borderColor: "border-blue-500",
    },
    {
      title: "Total RJs",
      value: 9,
      icon: <Mic className="w-8 h-8" />,
      color: "from-pink-500 to-red-500",
      borderColor: "border-pink-500",
    },
    {
      title: "Total Programs",
      value: 11,
      icon: <Video className="w-8 h-8" />,
      color: "from-purple-500 to-indigo-600",
      borderColor: "border-purple-500",
    },
    {
      title: "Total Events",
      value: 11,
      icon: <Calendar className="w-8 h-8" />,
      color: "from-green-400 to-emerald-500",
      borderColor: "border-green-500",
    },
  ];

  return (
    <div
      className="min-h-[78vh] bg-center bg-cover"
      style={{ backgroundImage: "url('/A8J3K9Z5QW/background_image.jpg')" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 ">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transform hover:-translate-y-1 transition duration-300 border-l-4 ${stat.borderColor}`}
          >
            <div
              className={`bg-gradient-to-br ${stat.color} p-3 rounded-full text-white`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardContent;
