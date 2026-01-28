import React, { useEffect, useState } from "react";
import { usePermission } from "../../../context/PermissionContext";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import BreadCrumb from "../../BreadCrum";
import { ImageOff, Loader2, MailCheck, MapPin, PhoneCall } from "lucide-react";
import StatusUpdateModal from "./StatusUpdateModal";
import CreatorDetailsModal from "./CreatorDetailsModal";

const PodcastCreators = () => {
  const [creators, setCreators] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);

  const pageSize = 20;

  useEffect(() => {
    fetchCreators();
  }, [currentPage]);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const response = await apiCall("/creator", "GET");
      setCreators(response.data || []);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch Creators");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb
        title={"Podcasts Creators Management"}
        paths={["Creators", "Podcast Creators"]}
      />
      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        <div className="overflow-x-auto max-w-full border border-gray-200 rounded-lg shadow-sm ">
          <table className="w-full text-sm ">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="px-3 py-3 text-left">SI</th>
                <th className="px-3 py-2 text-left">Image</th>
                <th className="px-3 py-2 text-left">Name & Contact</th>
                <th className="px-3 py-2 text-left">Address</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 size={32} className="animate-spin" />
                      <p className="text-gray-600 font-medium">
                        Loading creators...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : creators.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      No Creators found
                    </h3>
                    <p className="text-gray-500 text-sm">
                      No Creators has registered for Podcasts
                    </p>
                  </td>
                </tr>
              ) : (
                creators.map((creator, index) => (
                  <tr
                    key={creator.id}
                    onClick={() => {
                      setShowDetailsModal(true);
                      setSelectedCreator(creator);
                    }}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } border-b`}
                  >
                    <td className="px-3 py-2 text-gray-800 font-semibold">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    <td className="px-4 py-3">
                      {creator.profile ? (
                        <img
                          src={creator.profile}
                          alt={creator.name}
                          className="w-24 h-24 rounded-md shadow-md object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
                          <ImageOff size={24} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-left space-y-2">
                      <h3 className="text-base font-semibold text-indigo-800">
                        {creator.name}
                      </h3>
                      <div className="flex gap-2 text-gray-800 font-medium">
                        <MailCheck size={16} /> {creator.email}
                      </div>
                      <div className="flex gap-2 text-gray-800 font-medium">
                        <PhoneCall size={16} /> {creator.phone}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-left">
                      <div className="space-y-1 text-sm text-gray-700">
                        {/* Street address */}
                        <p className="leading-snug">
                          {creator.address1}
                          {creator.address2 && (
                            <>
                              <br />
                              {creator.address2}
                            </>
                          )}
                        </p>

                        {/* City / State / Country */}
                        <p className="flex items-center gap-1 text-gray-500">
                          <MapPin size={14} />
                          {creator.city}, {creator.state}
                        </p>
                        <p className="text-gray-400">{creator.country}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3 space-y-2 text-sm">
                      {/* Status Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCreator(creator);
                          setShowStatusModal(true);
                        }}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize
                          ${
                            creator.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : creator.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {creator.status}
                      </button>

                      {/* Rejection Reason */}
                      {creator.status === "rejected" &&
                        creator.rejection_reason && (
                          <p className="text-xs text-red-600">
                            <span className="font-semibold">Reason:</span>{" "}
                            {creator.rejection_reason}
                          </p>
                        )}

                      {/* Verified By */}
                      {creator.verified_by && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Verified by:</span>{" "}
                          {creator.verified_by}
                        </p>
                      )}

                      {/* Verified At */}
                      {creator.verified_at && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">On:</span>{" "}
                          {new Date(creator.verified_at).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
      {selectedCreator && showStatusModal && (
        <StatusUpdateModal
          creator={selectedCreator}
          onClose={() => setShowStatusModal(false)}
          onSuccess={fetchCreators}
        />
      )}
      {selectedCreator && showDetailsModal && (
        <CreatorDetailsModal
          creator={selectedCreator}
          onClose={() => setShowDetailsModal(false)}
          onUpdateStatus={() => {
            setShowDetailsModal(false);
            setShowStatusModal(true);
          }}
        />
      )}
    </div>
  );
};

export default PodcastCreators;
