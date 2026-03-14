import html2pdf from "html2pdf.js";

const getBase64Logo = async (url) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Logo fetch failed", error);
    return "";
  }
};

export const exportCategoryCrewPDF = async (
  crewtitle,
  value,
  category,
  members,
) => {
  const logoSrc = await getBase64Logo(
    `${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`,
  );

  const element = document.createElement("div");

  element.innerHTML = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color:#1f2937;">
          <style>
        tr, td, th {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          border-collapse: collapse;
        }
      </style>
      <div style="display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-radius:10px; background:#f9fafb; border:1px solid #e5e7eb; margin-bottom:25px;">
        <img src="${logoSrc}" style="width:150px; height:auto;" alt="Logo" />
        <div style="text-align:right;">
          <div style="font-size:16px; font-weight:700; color:#111827;">THAALAM MEDIA GMBH</div>
          <div style="font-size:11px; color:#4b5563;">Talacker 41, 8001 Zürich, Switzerland</div>
          <div style="font-size:11px; color:#374151; font-weight:500;">Tel: 079 694 88 89</div>
        </div>
      </div>

<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; font-family: sans-serif; border-bottom: 1px solid #f3f4f6; padding-bottom: 12px;">
  <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">
    ${crewtitle}
  </h2>

  <p style="margin: 0; font-size: 13px; color: #6b7280;">
    Category: <span style="font-weight: 600; color: #374151;">${category} (${value})</span>
  </p>
</div>

<table style="width:100%; border-collapse:separate; border-spacing:0; margin-top:10px; font-size:11px; overflow:hidden; border-radius:8px; border:1px solid #e5e7eb;">
  <thead>
    <tr style="background:#111827; color:#ffffff;">
      <th style="padding:8px; text-align:center; width:6%; font-weight:600; padding-bottom:15px;">#</th>
      <th style="padding:8px; text-align:left; width:20%; font-weight:600; padding-bottom:15px;">Given Name</th>
      <th style="padding:8px; text-align:left; width:20%; font-weight:600; padding-bottom:15px;">Surname</th>
      <th style="padding:8px; text-align:left; width:22%; font-weight:600; padding-bottom:15px;">Designation</th>
      <th style="padding:8px; text-align:center; width:12%; font-weight:600; padding-bottom:15px; ">Gender</th>
      <th style="padding:8px; text-align:left; width:20%; font-weight:600; padding-bottom:15px;">Passport No.</th>
    </tr>
  </thead>

  <tbody>
    ${members
      .map(
        (member, index) => `
      <tr style="
        background:${index % 2 === 0 ? "#ffffff" : "#f9fafb"};
        border-bottom:1px solid #e5e7eb;
      ">
        <td style="padding:10px; text-align:center; font-weight:500; color:#374151;">
          ${index + 1}
        </td>

        <td style="padding:10px; font-weight:600; color:#111827;">
          ${member.given_name || "-"}
        </td>

        <td style="padding:10px; color:#374151;">
          ${member.sur_name || "-"}
        </td>

        <td style="padding:10px; color:#374151;">
          ${member.designation || "-"}
        </td>

        <td style="padding:10px; text-align:center; color:#374151;">
          ${member?.gender ? member.gender?.toUpperCase() : "-"}
        </td>

        <td style="padding:10px; font-family:monospace; letter-spacing:0.5px; color:#111827;">
          ${member.passport_number || "-"}
        </td>
      </tr>
    `,
      )
      .join("")}
  </tbody>
</table>
      </table>
      
      <div style="margin-top: 20px; font-size: 10px; color: #9ca3af; text-align: center;">
        Generated on ${new Date().toLocaleString()}
      </div>
    </div>
  `;

  document.body.appendChild(element);

  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: `${crewtitle}-${category}-${value}.pdf`,
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait",
    },
  };

  await html2pdf().set(opt).from(element).save();

  document.body.removeChild(element);
};
