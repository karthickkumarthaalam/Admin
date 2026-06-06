import html2pdf from "html2pdf.js";

const getBase64Logo = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

export const exportSummerFestivalRefundPDF = async ({
  reportData,
  status = "",
  ticketClass = "",
}) => {
  if (!reportData?.length) return;
  const element = document.createElement("div");

  const logoSrc = await getBase64Logo(
    `${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`,
  );

  const totalAmount = reportData.reduce((sum, item) => {
    const amount =
      item.Attendees?.reduce(
        (total, attendee) => total + Number(attendee.AMOUNT_COLLECTED || 0),
        0,
      ) || 0;

    return sum + amount;
  }, 0);
  const ticketClassDisplay = {
    "": "Ilayaraja Show, Yuvan with Simbu, GV Prakash Show (All 3 Day Pass) ",
    "Day 1": "Ilayaraja Show ( Day 1 Pass )",
    "Day 2": "Yuvan Shankar With Simbu ( Day 2 Pass )",
    "Day 3": "GV Prakash Show( Day 3 Pass ) ",
    "3 Days Pass":
      "Ilayaraja Show, Yuvan with Simbu, GV Prakash Show (All 3 Day Pass) ",
  };

  const ticketClassSummaryMap = {};

  reportData.forEach((refund) => {
    refund.Attendees?.forEach((ticket) => {
      const key = ticket.TICKET_CLASS || "Unknown";

      if (!ticketClassSummaryMap[key]) {
        ticketClassSummaryMap[key] = {
          count: 0,
          amount: 0,
        };
      }

      ticketClassSummaryMap[key].count += 1;
      ticketClassSummaryMap[key].amount += Number(ticket.AMOUNT_COLLECTED || 0);
    });
  });

  const ticketClassSummary = Object.entries(ticketClassSummaryMap)
    .map(
      ([ticketClass, data]) => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd;">
          ${ticketClass}
        </td>

        <td style="
          padding:6px;
          border:1px solid #ddd;
          text-align:center;
          font-weight:600;
        ">
          ${data.count}
        </td>

        <td style="
          padding:6px;
          border:1px solid #ddd;
          text-align:right;
          font-weight:bold;
        ">
          CHF ${data.amount?.toLocaleString("en-CH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </td>
      </tr>
    `,
    )
    .join("");

  const tableRows = reportData
    .map((item, index) => {
      const totalRefund =
        item.Attendees?.reduce(
          (sum, attendee) => sum + (attendee.AMOUNT_COLLECTED || 0),
          0,
        ) || 0;

      const ticketDetails =
        item.Attendees?.map(
          (ticket) => `
      <div style="
        font-size:10px;
        margin-bottom:3px;
        color:#374151;
      ">
        <span style="font-weight:600;">
          ${ticket.TICKET_CLASS}
        </span>
        •
        <span>
          ${ticket.TICKET_ID}
        </span>
        •
        <span style="font-weight:700;">
          CHF ${Number(ticket.AMOUNT_COLLECTED).toLocaleString("en-CH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    `,
        ).join("") || "-";

      return `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;text-align:center; font-size:12px;">
          ${index + 1}
        </td>

        <td style="padding:8px;border:1px solid #ddd;font-weight:600; font-size:12px;">
          ${item.ORDER_ID}
        </td>

        <td style="padding:8px;border:1px solid #ddd;">
          <div style="font-size:12px; font-weight:600;">
            ${item.NAME}
          </div>

          <div style="font-size:11px;color:#444; font-weight:600;">
            ${item.EMAIL_ID}
          </div>

          <div style="font-size:11px;color:#444; font-weight:600">
            ${item.PHONE_NUMBER}
          </div>
        </td>

        <td style="padding:8px;border:1px solid #ddd;text-align:center; font-size:12px;">
          ${item.Attendees?.[0]?.COUNTRY || "-"}
        </td>

        <td style="padding:8px;border:1px solid #ddd;">
          ${ticketDetails}
        </td>

        <td
          style="
            padding:8px;
            border:1px solid #ddd;
            text-align:right;
            font-weight:bold;
            font-size:12px;
          "
        >
          CHF ${totalRefund?.toLocaleString("en-CH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </td>
      </tr>
    `;
    })
    .join("");

  element.innerHTML = `
    <div style="
      font-family:Segoe UI, sans-serif;
      padding:20px;
      color:#333;
    ">
    
      <!-- Header -->
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        border-bottom:1px solid #ddd;
        padding-bottom:15px;
        margin-bottom:20px;
      ">
      
        <img src="${logoSrc}" width="180" />

        <div style="text-align:right;">
          <h2 style="margin:0;">
            Summer Festival Report
          </h2>

          <p style="margin:0;font-size:12px;">
            Generated On:
            ${new Date().toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>
                ${
                  ticketClass
                    ? `<p style="margin-bottom:12px; font-size:16px; font-weight:700">
                  ${ticketClassDisplay[ticketClass] || ticketClass}
                </p>`
                    : ""
                }
<table
  style="
    width:100%;
    border-collapse:collapse;
    font-size:9px;
    table-layout:fixed;
  "
>
  <thead>
    <tr
      style="
        background:#374151;
        color:white;
        font-size:12px;
      "
    >
      <th style="width:4%;padding:8px;border:1px solid #ddd;">#</th>

      <th style="width:12%;padding:8px;border:1px solid #ddd;">
        ORDER ID
      </th>

      <th style="width:18%;padding:8px;border:1px solid #ddd;">
        CUSTOMER DETAILS
      </th>

      <th style="width:8%;padding:8px;border:1px solid #ddd;">
        COUNTRY
      </th>

      <th style="width:34%;padding:8px;border:1px solid #ddd;">
        TICKET DETAILS
      </th>

      <th style="width:12%;padding:8px;border:1px solid #ddd;">
        TOTAL PRICE
      </th>

  
    </tr>
  </thead>

  <tbody>
    ${tableRows}
  </tbody>
</table>


<div style="margin-bottom:20px;">
  <h3 style="margin-bottom:10px;">
    TICKET CLASS SUMMARY
  </h3>

  <table
    style="
      width:50%;
      border-collapse:collapse;
      font-size:11px;
    "
  >
    <thead>
      <tr style="background:#f3f4f6;">
        <th
          style="
            padding:6px;
            border:1px solid #ddd;
            text-align:left;
          "
        >
          Ticket Class
        </th>

        <th
          style="
            padding:6px;
            border:1px solid #ddd;
            text-align:center;
          "
        >
          Count
        </th>

        <th
          style="
            padding:6px;
            border:1px solid #ddd;
            text-align:right;
          "
        >
          Total Amount
        </th>
      </tr>
    </thead>

    <tbody>
      ${ticketClassSummary}

      <tr
        style="
          background:#f9fafb;
          font-weight:bold;
        "
      >
        <td style="padding:6px;border:1px solid #ddd;">
          GRAND TOTAL
        </td>

        <td
          style="
            padding:6px;
            border:1px solid #ddd;
            text-align:center;
          "
        >
          ${Object.values(ticketClassSummaryMap).reduce(
            (sum, item) => sum + item.count,
            0,
          )}
        </td>

        <td
          style="
            padding:6px;
            border:1px solid #ddd;
            text-align:right;
          "
        >
          CHF ${totalAmount?.toLocaleString("en-CH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </td>
      </tr>
    </tbody>
  </table>
</div>

    </div>
  `;
  document.body.appendChild(element);
  await html2pdf()
    .set({
      margin: 0.2,
      filename: `${ticketClassDisplay[ticketClass]}${
        new Date().toISOString().split("T")[0]
      }.pdf`,
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "landscape",
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
      },
    })
    .from(element)
    .save();

  document.body.removeChild(element);
};
