import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../utils/apiCall";
import { toast } from "react-toastify";
import {
  AtSign,
  BadgeCheck,
  Building2,
  Cake,
  CalendarDays,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  UserCircle,
  MapPin,
  Pencil,
} from "lucide-react";
import AccountSettingsModal from "../components/settings/AccountSetting/AccountSettingsModal";

const ProfilePage = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSettingModal, setShowSettingModal] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await apiCall(`/system-user/${user?.id}/user-details`, "GET");
      setUserData(res.data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 overflow-y-auto">
      <div className="max-w-8xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* ====================================================== */}
        {/* ASIDE                                                  */}
        {/* ====================================================== */}
        <aside className="lg:col-span-1">
          <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl border border-gray-200 shadow-md overflow-hidden h-fit">
            {/* Header with subtle gradient */}
            <div className="bg-gradient-to-r from-blue-50/30 to-indigo-50/20 p-6 border-b border-gray-100">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar with glow effect */}
                <div className="relative">
                  <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100" />
                    {userData.image_url ? (
                      <img
                        src={`${BASE_URL}/${userData.image_url.replace(
                          /\\/g,
                          "/"
                        )}`}
                        alt={userData.name}
                        className="relative w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <UserCircle className="w-24 h-24 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {/* Active indicator */}
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md" />
                </div>

                {/* Name with gradient */}
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {userData.name}
                  </h2>
                  <p className="text-sm text-gray-600 px-4">
                    {userData.description || "No description"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Edit button with hover effect */}
              <button
                onClick={() => setShowSettingModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Pencil size={14} />
                Edit Profile
              </button>

              {/* Meta info cards */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <BadgeCheck size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">
                        Employee ID
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {userData.employee_id || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                      <Building2 size={16} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">
                        Department
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {userData.department?.department_name || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        {/* ====================================================== */}
        {/* MAIN CONTENT                                           */}
        {/* ====================================================== */}
        <main className="lg:col-span-3 space-y-12">
          {/* Personal Information */}
          <section className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl border border-slate-200 shadow-md p-6 ">
            <div className="flex items-start gap-4 mb-6 border-b border-gray-300 border-dashed pb-2">
              <div className="p-2 md:p-3 bg-slate-100 rounded-xl text-indigo-600">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Personal Information
                </h3>
                <p className="text-sm text-slate-500">
                  Basic details associated with your account
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <Row
                icon={<Mail size={16} />}
                label="Email"
                value={userData.email}
              />
              <Row
                icon={<AtSign size={16} />}
                label="Gender"
                value={userData.gender}
              />
              <Row
                icon={<Cake size={16} />}
                label="Date of Birth"
                value={formatDate(userData.date_of_birth)}
              />
              <Row
                icon={<CalendarDays size={16} />}
                label="Date of Joining"
                value={formatDate(userData.date_of_joining)}
              />
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl border border-slate-200 shadow-md p-6">
            <div className="flex items-start gap-4 mb-6 border-b border-gray-300 border-dashed pb-2">
              <div className="p-2 md:p-3 bg-slate-100 rounded-xl text-indigo-600">
                <Phone size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Contact Information
                </h3>
                <p className="text-sm text-slate-500">
                  How others can reach you
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <Row
                icon={<Phone size={16} />}
                label="Phone"
                value={userData.phone_number}
              />
              <Row
                icon={<MessageSquare size={16} />}
                label="WhatsApp"
                value={userData.whatsapp_number}
              />
              <Row
                icon={<MapPin size={16} />}
                label="Address"
                value={userData.address}
                multiline
              />
            </div>
          </section>
        </main>
      </div>
      <AccountSettingsModal
        isOpen={showSettingModal}
        onClose={() => setShowSettingModal(false)}
        userData={user}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               INLINE ROW                                   */
/* -------------------------------------------------------------------------- */

const Row = ({ icon, label, value, multiline }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 text-slate-400">{icon}</div>
    <div className="w-44 text-sm text-slate-500">{label}</div>
    <div className={`text-slate-900 ${multiline ? "whitespace-pre-line" : ""}`}>
      {value || "—"}
    </div>
  </div>
);

export default ProfilePage;
