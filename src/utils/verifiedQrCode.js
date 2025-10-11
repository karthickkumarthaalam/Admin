import { QRCodeSVG } from "qrcode.react";

export default function VerifiedQRCode({ qrData, size = 100 }) {
  return (
    <div className="flex flex-col items-end mt-2">
      <QRCodeSVG
        value={qrData}
        size={size}
        level="H"
        bgColor="#ffffff"
        fgColor="#000000"
      />
      <p className="text-[10px] text-gray-500 text-center mt-1">
        Verified Payslip
      </p>
    </div>
  );
}
