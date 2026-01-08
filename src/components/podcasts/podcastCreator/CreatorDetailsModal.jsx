import React, { useEffect } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  User,
  Link2,
  Briefcase,
  MessageSquare,
} from "lucide-react";

const CreatorDetailsModal = ({ creator, onClose, onUpdateStatus }) => {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!creator) return null;

  /* ---------------- Status ---------------- */

  const statusMap = {
    approved: {
      label: "Approved",
      color: "bg-emerald-100 text-emerald-800",
      icon: CheckCircle,
    },
    pending: {
      label: "Pending Review",
      color: "bg-amber-100 text-amber-800",
      icon: Clock,
    },
    rejected: {
      label: "Rejected",
      color: "bg-rose-100 text-rose-800",
      icon: XCircle,
    },
  };

  const status = statusMap[creator.status];
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden">
        {/* ================= HEADER ================= */}
        <div className="relative bg-gradient-to-br from-indigo-50 to-white px-8 py-7">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5"
          >
            <X />
          </button>

          <div className="flex items-center gap-6">
            <img
              src={creator.profile || "/avatar-placeholder.png"}
              alt=""
              className="w-24 h-24 rounded-2xl object-cover shadow-md border"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {creator.name}
                </h2>

                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                >
                  <StatusIcon size={14} />
                  {status.label}
                </span>

                {creator.experience && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                    <Briefcase size={14} />
                    {creator.experience}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Submitted on{" "}
                {creator.createdAt
                  ? new Date(creator.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>

              <p className="mt-4 text-gray-700 max-w-3xl leading-relaxed">
                {creator.bio || "No bio provided by the creator."}
              </p>
            </div>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="px-8 py-8 space-y-10 overflow-y-auto max-h-[70vh]">
          {/* Reason to Join */}
          {creator.reason_to_join && (
            <section className="bg-indigo-50 rounded-2xl p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-900 mb-3">
                <MessageSquare size={16} />
                Motivation to Join
              </h3>
              <p className="text-gray-800 leading-relaxed">
                {creator.reason_to_join}
              </p>
            </section>
          )}

          {/* Key Information */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Info label="Email" value={creator.email} icon={Mail} />
              <Info label="Phone" value={creator.phone} icon={Phone} />
              <Info
                label="Date of Birth"
                value={creator.date_of_birth}
                icon={Calendar}
              />
              <Info label="Gender" value={creator.gender} icon={User} />
              <Info
                label="Location"
                value={`${creator.city}, ${creator.state}`}
                icon={MapPin}
              />
              <Info label="Country" value={creator.country} icon={Globe} />
            </div>
          </section>

          {/* Social Presence */}
          {creator.social_links &&
            Object.keys(creator.social_links).length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                  <Link2 size={16} />
                  Social Presence
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(creator.social_links).map(
                    ([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between px-5 py-4 rounded-2xl border bg-white hover:shadow-md transition"
                      >
                        <span className="capitalize font-medium text-gray-700 group-hover:text-indigo-700">
                          {platform}
                        </span>
                        <Eye
                          size={14}
                          className="text-gray-400 group-hover:text-indigo-600"
                        />
                      </a>
                    )
                  )}
                </div>
              </section>
            )}

          {/* Identity Proof */}
          {creator.id_proof_link && (
            <section className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Identity Proof
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {creator.id_proof_name}
                </p>
              </div>

              <a
                href={creator.id_proof_link}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-lg text-sm font-medium bg-white border hover:bg-gray-100"
              >
                View Document
              </a>
            </section>
          )}

          {/* Rejection Reason */}
          {creator.status === "rejected" && creator.rejection_reason && (
            <section className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-rose-900 mb-2">
                Rejection Reason
              </h3>
              <p className="text-rose-800">{creator.rejection_reason}</p>
            </section>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="border-t px-8 py-5 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm rounded-lg border hover:bg-gray-100"
          >
            Close
          </button>

          <button
            onClick={() => onUpdateStatus(creator)}
            className="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= Helper ================= */

const Info = ({ label, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border">
    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-2">
      {Icon && <Icon size={14} />}
      {label}
    </div>
    <div className="text-gray-900 font-medium">{value || "—"}</div>
  </div>
);

export default CreatorDetailsModal;
