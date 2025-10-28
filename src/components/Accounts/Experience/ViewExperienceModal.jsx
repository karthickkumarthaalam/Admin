"use client";
import React, { useRef, useState } from "react";
import { X, Download, Send, Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import VerifiedQRCode from "../../../utils/verifiedQrCode";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

const getPerformanceText = (rating) => {
  switch (rating?.toLowerCase()) {
    case "outstanding":
      return "outstanding and exemplary, consistently exceeding performance expectations";
    case "excellent":
      return "excellent, reflecting consistent dedication and leadership qualities";
    case "good":
      return "good, maintaining a reliable and consistent standard of work";
    case "satisfactory":
      return "satisfactory, fulfilling the required responsibilities effectively";
    default:
      return "commendable and consistent";
  }
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const ViewExperienceModal = ({ isOpen, onClose, experience }) => {
  const pdfRef = useRef(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  if (!isOpen || !experience) return null;

  const {
    user,
    joining_date,
    relieving_date,
    employment_type,
    performance_summary,
    issued_date,
    id,
  } = experience;

  const qrData = `https://thaalam.ch/experience/verify?qrid=${id}`;

  const employeeName = user?.name || "Employee Name";
  const employeeId = user?.employee_id || "-";
  const department = user?.department?.department_name || "-";
  const emailDefault = user?.email || "-";

  const calculateTenure = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    let result = [];
    if (years > 0) result.push(`${years} year${years > 1 ? "s" : ""}`);
    if (months > 0) result.push(`${months} month${months > 1 ? "s" : ""}`);
    if (days > 0) result.push(`${days} day${days > 1 ? "s" : ""}`);
    return result.length ? result.join(" ") : "Less than a month";
  };

  const tenure = calculateTenure(joining_date, relieving_date);
  const performanceText = getPerformanceText(performance_summary);

  const handleDownload = () => {
    const element = pdfRef.current;
    const opt = {
      filename: `${employeeName}_Experience.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleSendEmail = async () => {
    if (!email) return toast.error("Please enter an email address");

    try {
      setSending(true);

      const element = pdfRef.current;
      const opt = {
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf("blob");

      const formData = new FormData();
      formData.append("email", email);
      formData.append("filename", `${employeeName}_Experience.pdf`);
      formData.append("experience", pdfBlob, "experience.pdf");

      const res = await apiCall(
        "/experience-letter/send-email",
        "POST",
        formData
      );

      if (res.status === "success") {
        toast.success("Experience Letter sent successfully");
        setShowEmailModal(false);
        setEmail("");
      } else {
        toast.error("Failed to send email");
      }
    } catch (err) {
      toast.error("Error sending Experience Letter");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full flex flex-col items-center overflow-y-auto scrollbar-none animate-fadeIn">
        {/* Toolbar */}
        <div className="w-full sticky top-0 z-20 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-3 flex flex-col items-start md:flex-row gap-4 justify-between md:items-center shadow-md mb-3">
          <h2 className="text-lg font-semibold">Employee Experience Letter</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-2 bg-white/10 border border-white/30 px-3 py-1.5 rounded-md text-sm hover:bg-white/20 transition"
            >
              <Send size={16} /> Send Email
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-white/10 border border-white/30 px-3 py-1.5 rounded-md text-sm hover:bg-white/20 transition"
            >
              <Download size={16} /> Download
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div
          ref={pdfRef}
          className="relative w-[210mm] bg-white text-gray-800 p-12 flex flex-col border border-gray-300 border-b-0"
        >
          {/* Watermark */}
          <img
            src={`${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`}
            alt="Watermark"
            className="absolute top-1/2 left-1/2 w-[350px] h-[300px] opacity-5 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
          />

          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-400 pb-4">
            <div className="flex items-center gap-4">
              <img
                src={`${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`}
                alt="Logo"
                className="h-14"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  THAALAM MEDIA GMBH
                </h1>
                <p className="text-xs text-gray-600">
                  Talacker 41, Zürich | www.thaalam.ch
                </p>
              </div>
            </div>
          </div>

          {/* Letter Title */}
          <div className="text-center mb-6 mt-10">
            <h2 className="text-lg font-semibold underline">
              To Whom It May Concern
            </h2>
          </div>

          <div>
            <div className="text-right text-sm">
              <p>Date of Issue:</p>
              <p className="font-semibold">{formatDate(issued_date)}</p>
            </div>
          </div>

          {/* Employee Info */}

          {/* Letter Body */}
          <div className="text-sm leading-relaxed mt-16 mb-10 space-y-4">
            <p>
              This is to certify that <strong>{employeeName}</strong> (Employee
              ID: <strong>{employeeId}</strong>) was employed with{" "}
              <strong>THAALAM MEDIA GMBH</strong> in the{" "}
              <strong>{department}</strong> department from{" "}
              <strong>{formatDate(joining_date)}</strong> to{" "}
              <strong>{formatDate(relieving_date)}</strong>, serving a total
              tenure of <strong>{tenure}</strong> on a{" "}
              <strong>{employment_type}</strong> basis.
            </p>

            <p>
              During this tenure, {employeeName.split(" ")[0]} demonstrated{" "}
              <strong>{performanceText}</strong>, showing professionalism,
              dedication, and strong teamwork. We sincerely appreciate their
              contributions and wish them continued success in all future
              endeavors.
            </p>
          </div>

          {/* Signature & QR */}
          <div className="flex flex-col justify-between items-start mt-16 gap-4">
            <div className="flex flex-col items-center">
              <img
                src={`${window.location.origin}/A8J3K9Z5QW/signature.png`}
                alt="Authorized Signature"
                className="h-auto w-24 mb-2"
              />
              <p className="text-gray-800 text-sm font-semibold leading-tight">
                DHARSHAN RAJAKOBAL
              </p>
              <p className="text-gray-800 text-xs font-semibold">
                Authorized Signatory
              </p>
            </div>
            <div className="w-[120px] text-right">
              <VerifiedQRCode qrData={qrData} size={80} name="Letter" />
            </div>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative animate-fadeIn">
              <button
                onClick={() => setShowEmailModal(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Send Experience Letter via Email
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                Enter the recipient’s email address to send the Experience
                Letter.
              </p>

              <input
                type="email"
                placeholder={"example@gmail.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <div className="flex justify-end mt-5">
                <button
                  disabled={sending}
                  onClick={handleSendEmail}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewExperienceModal;
