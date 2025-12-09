import { X } from "lucide-react";
import { useState } from "react";
import { exportExpensePDF } from "../../../utils/exportExpensePdf";
import { toast } from "react-toastify";

const ExportModal = ({
  isOpen,
  onClose,
  expenses,
  month,
  year,
  fromDate,
  toDate,
}) => {
  const initialState = {
    submittedByName: "",
    submittedByEmail: "",
    reportedToName: "",
    reportedToEmail: "",
  };
  const [form, setForm] = useState(initialState);

  const handleExport = () => {
    if (!form.submittedByName && !form.reportedToName) {
      toast.error("Submiting Name and Reporting name is required");
      return;
    }
    exportExpensePDF({
      expenses,
      submittedBy: {
        name: form.submittedByName,
        email: form.submittedByEmail,
      },
      reportedTo: {
        name: form.reportedToName,
        email: form.reportedToEmail,
      },
      month,
      year,
      fromDate,
      toDate,
    });
    setForm(initialState);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          class="absolute top-6 right-6 text-gray-500 hover:text-red-500"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold text-red-500 mb-6">
          {" "}
          Export Report
        </h2>
        <div className="space-y-6">
          {/* Submitted By Section */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Submitted By
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <input
                  type="text"
                  value={form.submittedByName}
                  onChange={(e) =>
                    setForm({ ...form, submittedByName: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium  text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  value={form.submittedByEmail}
                  onChange={(e) =>
                    setForm({ ...form, submittedByEmail: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Reported To Section */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Reported To
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium  text-gray-500">
                  Name
                </label>
                <input
                  type="text"
                  value={form.reportedToName}
                  onChange={(e) =>
                    setForm({ ...form, reportedToName: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium  text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  value={form.reportedToEmail}
                  onChange={(e) =>
                    setForm({ ...form, reportedToEmail: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleExport}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-md transition duration-300"
          >
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
