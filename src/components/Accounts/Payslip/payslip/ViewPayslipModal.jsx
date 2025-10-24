"use client";
import React, { useRef, useState } from "react";
import { X, Download, Send, Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import VerifiedQRCode from "../../../../utils/verifiedQrCode";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";

// Convert number to words
const numberToWords = (num) => {
  const a = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const convert = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000)
      return a[Math.floor(n / 100)] + " Hundred " + convert(n % 100);
    if (n < 100000)
      return convert(Math.floor(n / 1000)) + " Thousand " + convert(n % 1000);
    if (n < 10000000)
      return convert(Math.floor(n / 100000)) + " Lakh " + convert(n % 100000);
    return (
      convert(Math.floor(n / 10000000)) + " Crore " + convert(n % 10000000)
    );
  };
  return convert(Math.floor(num)) + " Only";
};

const ViewPayslipModal = ({ isOpen, onClose, payslip }) => {
  const pdfRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);

  if (!isOpen || !payslip) return null;

  const {
    user,
    month,
    currency,
    total_earnings,
    total_deductions,
    net_salary,
    items = [],
    payment_mode,
    paid_days,
    lop_days,
    paid_date,
    conversionCurrency,
    converted_net_salary,
  } = payslip;

  const earnings = items.filter((i) => i.type === "earning");
  const deductions = items.filter((i) => i.type === "deduction");

  const qrData = `https://thaalam.ch/payslip/verify.php?qrid=${payslip.id}`;

  const formatMonth = (m) => {
    if (!m) return "-";
    const [year, mo] = m.split("-");
    return new Date(year, mo - 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amt) =>
    `${currency?.symbol || ""} ${Number(amt).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleDownload = () => {
    const element = pdfRef.current;
    const opt = {
      filename: `${user?.name || "Payslip"}_${month}.pdf`,
      html2canvas: {
        scale: 2, // high quality
        useCORS: true,
        scrollY: 0,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }, // automatically breaks pages
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setSending(true);

      const element = pdfRef.current;
      const opt = {
        html2canvas: {
          scale: 2, // high quality
          useCORS: true,
          scrollY: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf("blob");

      const formData = new FormData();
      formData.append("email", email);
      formData.append("filename", `${user?.name || "payslip"}_${month}.pdf`);
      formData.append("payslip", pdfBlob, "payslip.pdf");

      const res = await apiCall("/payslip/send-email", "POST", formData);

      if (res.status === "success") {
        toast.success("Payslip send successfully");
        setShowEmailModal(false);
        setEmail("");
      }
    } catch (error) {
      toast.error("Failed to send Email, Error sending payslip");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]  md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl  w-full h-full flex flex-col items-center overflow-y-auto scrollbar-none animate-fadeIn">
        {/* Toolbar */}
        <div className="w-full sticky top-0 z-20 bg-gradient-to-r from-gray-600 to-gray-800 text-white px-6 py-3 flex justify-between items-center shadow-md mb-2">
          <h2 className="text-lg font-semibold">Employee Payslip</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-2 bg-white/10 border border-white/30 px-3 py-2 rounded-md text-sm hover:bg-white/20 transition"
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
          className="relative w-[210mm] bg-white text-slate-800 p-10 flex flex-col border border-gray-300 border-b-0"
        >
          {/* Watermark */}
          <img
            src={`${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`}
            alt="Watermark"
            className="absolute top-1/2 left-1/2 w-[350px] h-[300px] opacity-5 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
          />

          {/* Main Content */}
          <div className="flex flex-col h-full  justify-between z-10 relative ">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-400 pb-4 mb-6">
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
              <div className="text-right">
                <p className="text-gray-600 text-sm">Payslip for the month</p>
                <p className="text-gray-800 font-bold">{formatMonth(month)}</p>
              </div>
            </div>

            {/* Employee Info + Net Pay */}
            <div className="grid grid-cols-2 gap-6 mb-8 ml-2">
              {/* Employee Summary (Left Column) */}
              <div className="space-y-2">
                <h2 className="text-sm text-gray-800 font-semibold uppercase  pb-1">
                  Employee Summary
                </h2>
                <div className="grid grid-cols-[150px_1fr] gap-x-2 gap-y-1">
                  <p className="text-sm text-gray-700">Employee Name</p>
                  <p className="text-sm text-gray-700 font-bold whitespace-nowrap">
                    : {user?.name || "-"}
                  </p>

                  <p className="text-sm text-gray-700">Employee ID</p>
                  <p className="text-sm text-gray-700 font-bold whitespace-nowrap">
                    : {user?.employee_id || "-"}
                  </p>

                  <p className="text-sm text-gray-700">Employee Email</p>
                  <p className="text-sm text-gray-700 font-bold whitespace-nowrap">
                    : {user?.email || "-"}
                  </p>

                  <p className="text-sm text-gray-700">Department</p>
                  <p className="text-sm text-gray-700 font-bold whitespace-nowrap">
                    : {user?.department?.department_name || "-"}
                  </p>
                  {user?.account_number && (
                    <>
                      <p className="text-sm text-gray-700">Account Number</p>
                      <p className="text-sm text-gray-700 font-bold whitespace-nowrap">
                        : {`XXXX XXXX ${user.account_number.slice(-4)}`}
                      </p>
                    </>
                  )}

                  {user?.pan_number && (
                    <>
                      <p className="text-sm text-gray-700">PAN Number</p>
                      <p className="text-sm text-gray-700 font-bold whitespace-nowrap">
                        : {`XXX XXX ${user.pan_number.slice(-4)}`}
                      </p>
                    </>
                  )}
                  <p className="text-sm text-gray-700">Date of Issue</p>
                  <p className="text-sm text-gray-700 font-bold whitespace-nowrap">
                    :{" "}
                    {paid_date
                      ? new Date(paid_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </p>
                  {payment_mode && (
                    <>
                      <p className="text-sm text-gray-700">Payment Mode</p>
                      <p className="text-sm text-gray-700 font-bold whitespace-nowrap">
                        : {payment_mode.toUpperCase()}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Info (Right Column, no heading) */}
              <div className="flex justify-end">
                <div className="grid grid-cols-[150px_1fr] gap-x-2 gap-y-1"></div>
              </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 border-2 border-gray-200 rounded-xl shadow-sm">
              {/* Earnings */}
              <div className="p-5 flex flex-col justify-between">
                <div>
                  <div className="font-semibold flex justify-between items-center border-b-2 border-gray-200 py-2 text-gray-800 mb-3 uppercase text-sm tracking-wide">
                    <h3>Earnings</h3>
                    <h3>Amount</h3>
                  </div>
                  {earnings.length ? (
                    earnings.map((e) => (
                      <div
                        key={e.id}
                        className="flex justify-between py-1.5 text-sm"
                      >
                        <span>{e.name}</span>
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(e.amount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic text-center py-3">
                      No earnings
                    </p>
                  )}
                </div>

                {/* Always aligned footer */}
                <div className="flex justify-between pt-3 mt-3 font-bold text-gray-800 border-t border-gray-200">
                  <span>Gross Salary</span>
                  <span>{formatCurrency(total_earnings)}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="p-5 flex flex-col justify-between">
                <div>
                  <div className="font-semibold flex justify-between items-center border-b-2 border-gray-200 py-2 text-gray-800 mb-3 uppercase text-sm tracking-wide">
                    <h3>Deductions</h3>
                    <h3>Amount</h3>
                  </div>
                  {deductions.length ? (
                    deductions.map((d) => (
                      <div
                        key={d.id}
                        className="flex justify-between py-1.5 text-sm"
                      >
                        <span>{d.name}</span>
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(d.amount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic text-center py-3">
                      No deductions
                    </p>
                  )}
                </div>

                {/* Always aligned footer */}
                <div className="flex justify-between pt-3 mt-3 font-bold text-gray-800 border-t border-gray-200">
                  <span>Total Deductions</span>
                  <span>{formatCurrency(total_deductions)}</span>
                </div>
              </div>
            </div>

            {/* Total NET Payable */}
            <div className="p-4 rounded-xl border border-gray-300 flex justify-between items-start shadow-sm  mb-5">
              <div className="space-y-1">
                <p className="text-gray-800 font-semibold text-sm tracking-wide">
                  Total NET PAYABLE SALARY
                </p>
                <p className="text-gray-500 text-xs">
                  Gross Salary - Total Deductions
                </p>
                {conversionCurrency && converted_net_salary && (
                  <p className="text-xs text-gray-800 font-semibold">
                    {" "}
                    Total NET PAYABLE SALARY IN{" "}
                    {conversionCurrency?.code || "INR"}
                  </p>
                )}
                <p className="text-xs text-gray-800 font-semibold">
                  Amount In words
                </p>
              </div>
              <div>
                <p className=" text-gray-800 font-bold pb-6 text-right">
                  {formatCurrency(net_salary)}
                </p>
                {conversionCurrency && converted_net_salary && (
                  <p className="text-gray-600 text-sm text-right">
                    <span className="text-gray-800 font-bold">
                      {conversionCurrency?.symbol || "₹ "}{" "}
                      {converted_net_salary}
                    </span>
                  </p>
                )}
                <p className="text-right text-xs text-gray-600">
                  <span className="text-gray-700 font-bold">
                    {numberToWords(converted_net_salary || net_salary)}
                  </span>
                </p>
              </div>
            </div>

            {/* Amount in words */}

            {/* Footer */}
            <div className="pt-16">
              <div className="flex justify-between items-end">
                {/* Left: Signature Section */}
                <div className="w-1/3 text-center relative flex flex-col items-center">
                  <img
                    src={`${window.location.origin}/A8J3K9Z5QW/signature.png`}
                    alt="Authorized Signature"
                    className="h-14 w-auto mb-2"
                  />
                  <p className="text-gray-800 text-xs font-semibold leading-tight">
                    DHARSHAN RAJAKOBAL
                  </p>
                  <p className="text-gray-800 text-sm font-semibold">
                    Authorized Signatory of CEO
                  </p>
                  {/* ✅ QR Code Section */}
                </div>
                {/* Right: Date Section */}
                <div className="w-1/3 text-right">
                  <VerifiedQRCode qrData={qrData} size={80} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
            <div className="bg-white w-full max-w-md rounded-xl shaodow-xl p-6 relative animate-fadeIn">
              <button
                onClick={() => setShowEmailModal(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Send Payslip via Email
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                Enter the recipient’s email address to send the payslip.
              </p>

              <input
                type="email"
                placeholder="example@gmail.com"
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

export default ViewPayslipModal;
