import { useEffect, useState } from "react";
import { Trash2, Loader2, Save, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

const AddEventContactDetails = ({ eventId }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [address, setAddress] = useState("");
  const [mobileNumbers, setMobileNumbers] = useState([""]);
  const [emails, setEmails] = useState([""]);
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    linkedin: "",
    tiktok: "",
  });

  useEffect(() => {
    if (!eventId) return;
    fetchContactDetails();
  }, [eventId]);

  const fetchContactDetails = async () => {
    try {
      setLoading(true);
      const res = await apiCall(`/event-contact-details/${eventId}`, "GET");
      const data = res?.data;

      if (data) {
        setAddress(data.address || "");

        // Parse mobile numbers safely
        let parsedMobiles = [];
        if (data.mobile_numbers) {
          try {
            parsedMobiles =
              typeof data.mobile_numbers === "string"
                ? JSON.parse(data.mobile_numbers)
                : data.mobile_numbers;
          } catch {
            parsedMobiles = [];
          }
        }

        setMobileNumbers(
          Array.isArray(parsedMobiles) && parsedMobiles.length
            ? parsedMobiles
            : [""],
        );

        // Parse emails safely
        let parsedEmails = [];
        if (data.emails) {
          try {
            parsedEmails =
              typeof data.emails === "string"
                ? JSON.parse(data.emails)
                : data.emails;
          } catch {
            parsedEmails = [];
          }
        }

        setEmails(
          Array.isArray(parsedEmails) && parsedEmails.length
            ? parsedEmails
            : [""],
        );

        // Parse social links safely
        let parsedSocial = {};
        if (data.social_links) {
          try {
            parsedSocial =
              typeof data.social_links === "string"
                ? JSON.parse(data.social_links)
                : data.social_links;
          } catch {
            parsedSocial = {};
          }
        }

        setSocialLinks({
          facebook: "",
          instagram: "",
          youtube: "",
          twitter: "",
          linkedin: "",
          tiktok: "",
          ...parsedSocial,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!address.trim()) {
      toast.error("Address is required");
      return;
    }

    try {
      setSaving(true);

      await apiCall("/event-contact-details", "POST", {
        event_id: eventId,
        address,
        mobile_numbers: mobileNumbers.filter((n) => n.trim()),
        emails: emails.filter((e) => e.trim()),
        social_links: socialLinks,
      });

      toast.success("Contact details saved successfully");
    } catch (error) {
      toast.error("Failed to save contact details");
    } finally {
      setSaving(false);
    }
  };

  const addField = (setter, values) => setter([...values, ""]);

  const removeField = (setter, values, index) => {
    const updated = values.filter((_, i) => i !== index);
    setter(updated.length ? updated : [""]);
  };

  const updateField = (setter, values, index, value) => {
    const updated = [...values];
    updated[index] = value;
    setter(updated);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="animate-spin text-blue-600" size={30} />
      </div>
    );
  }

  return (
    <div className="">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Event Contact Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage contact information for this event
          </p>
        </div>

        <div className="px-8 py-8 space-y-10">
          {/* Address */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Address
              </h3>
            </div>

            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300  px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-none focus:outline-none transition"
              placeholder="Enter full venue address"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                    Mobile Numbers
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Add one or multiple contact numbers
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => addField(setMobileNumbers, mobileNumbers)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                >
                  <PlusCircle size={18} />
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {mobileNumbers.map((number, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 hover:bg-white hover:shadow-sm transition"
                  >
                    <input
                      type="text"
                      value={number}
                      onChange={(e) =>
                        updateField(
                          setMobileNumbers,
                          mobileNumbers,
                          index,
                          e.target.value,
                        )
                      }
                      className="flex-1 bg-transparent text-sm outline-none focus:ring-0"
                      placeholder="Enter phone number"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeField(setMobileNumbers, mobileNumbers, index)
                      }
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= Emails Card ================= */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                    Email Addresses
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Add support or enquiry emails
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => addField(setEmails, emails)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                >
                  <PlusCircle size={18} />
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {emails.map((email, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 hover:bg-white hover:shadow-sm transition"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        updateField(setEmails, emails, index, e.target.value)
                      }
                      className="flex-1 bg-transparent text-sm outline-none focus:ring-0"
                      placeholder="Enter email address"
                    />

                    <button
                      type="button"
                      onClick={() => removeField(setEmails, emails, index)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              Social Media Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
              {[
                { key: "facebook", label: "Facebook", color: "text-blue-600" },
                {
                  key: "instagram",
                  label: "Instagram",
                  color: "text-pink-500",
                },
                { key: "youtube", label: "YouTube", color: "text-red-600" },
                { key: "twitter", label: "X (Twitter)", color: "text-black" },
                { key: "linkedin", label: "LinkedIn", color: "text-blue-700" },
                { key: "tiktok", label: "TikTok", color: "text-gray-900" },
              ].map((platform) => (
                <div key={platform.key} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">
                    {platform.label}
                  </label>

                  <div className="relative">
                    <input
                      type="url"
                      value={socialLinks[platform.key]}
                      onChange={(e) =>
                        setSocialLinks({
                          ...socialLinks,
                          [platform.key]: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm hover:bg-white focus:ring-2 focus:ring-blue-400 focus:border-none focus:bg-white focus:outline-none transition"
                      placeholder={`${platform.label} URL`}
                    />

                    {/* Icon */}
                    <div
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${platform.color}`}
                    >
                      {platform.key === "facebook" && (
                        <i className="fab fa-facebook-f" />
                      )}
                      {platform.key === "instagram" && (
                        <i className="fab fa-instagram" />
                      )}
                      {platform.key === "youtube" && (
                        <i className="fab fa-youtube" />
                      )}
                      {platform.key === "twitter" && (
                        <i className="fab fa-x-twitter" />
                      )}
                      {platform.key === "linkedin" && (
                        <i className="fab fa-linkedin-in" />
                      )}
                      {platform.key === "tiktok" && (
                        <i className="fab fa-tiktok" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Save Bar */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save Contact Details"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEventContactDetails;
