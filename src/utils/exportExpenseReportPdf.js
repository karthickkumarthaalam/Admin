import html2pdf from "html2pdf.js";

// Convert logo URL to Base64
const getBase64Logo = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

export const exportExpensesReportPDF = async ({
  reportData,
  year,
  selectedMerchant,
  selectedUser,
}) => {
  if (!reportData || reportData.length === 0) return;

  const element = document.createElement("div");
  const logoSrc = await getBase64Logo(
    `${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`
  );

  // 🎯 Enhanced Filter + Year section styling
  const filtersApplied =
    selectedMerchant || selectedUser
      ? `
      <div>
        ${
          selectedMerchant
            ? `<p style="margin: 0; font-size: 15px; color: #374151;">
                <strong>Merchant:</strong> ${selectedMerchant}
              </p>`
            : ""
        }
        ${
          selectedUser
            ? `<p style="margin: 0; font-size: 15px; color: #374151;">
                <strong>User:</strong> ${selectedUser}
              </p>`
            : ""
        }
      </div>
      `
      : ``;

  element.innerHTML = `
  <div style="font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1f2937; background-color: #fff;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px;">
      <img src="${logoSrc}" width="180" />
      <div style="text-align: right;">
        <h2 style="margin: 0; font-size: 22px; color: #111827;">Expenses Summary Report</h2>
        <p style="margin: 2px 0; font-size: 13px; color: #4b5563;">THAALAM MEDIA GMBH</p>
        <p style="margin: 2px 0; font-size: 13px; color: #4b5563;">Generated: ${new Date().toLocaleDateString(
          "en-GB"
        )}</p>
      </div>
    </div>

    <!-- Filters and Year Section -->
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
    ">
        ${filtersApplied}
        <p style="margin: 0; font-size: 13px; color: #4338ca; font-weight: 600;">Report Year : <span style="margin: 2px 0 0; font-size: 14px; color: #1e3a8a; font-weight: bold;">${year} </span></p>
    </div>

    <!-- Report Section -->
    <div style="margin-top: 10px;">
      ${reportData
        .map((currency) => {
          const currencySymbol = currency.currency_symbol;
          const currencyName = currency.currency_name;

          const yearTotal = currency.year_total || 0;
          const pendingTotal = currency.pending_total || 0;
          const completedPercent = yearTotal
            ? Math.round(((yearTotal - pendingTotal) / yearTotal) * 100)
            : 0;

          return `
          <div style="margin-bottom: 45px; page-break-inside: avoid;">
            <h3 style="
              font-size: 17px; 
              font-weight: 600; 
              color: #111827; 
              padding-left: 10px; 
              margin-bottom: 15px;
            ">
              ${currencyName} (${currencySymbol})
            </h3>

            <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background-color: #f9fafb; color: #111827;">
                  <th style="padding: 8px 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Month</th>
                  <th style="padding: 8px 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Total Amount (${currencySymbol})</th>
                  <th style="padding: 8px 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Pending (${currencySymbol})</th>
                </tr>
              </thead>
              <tbody>
                ${currency.months
                  .map(
                    (m) => `
                    <tr style="page-break-inside: avoid;">
                      <td style="padding: 6px 10px; border-bottom: 1px solid #f3f4f6;">${
                        m.month
                      }</td>
                      <td style="padding: 6px 10px; text-align: right; border-bottom: 1px solid #f3f4f6;">
                        ${currencySymbol} ${m.total_amount?.toLocaleString(
                      currencySymbol === "CHF" ? "en-CH" : "en-GB",
                      { minimumFractionDigits: 2 }
                    )}
                      </td>
                      <td style="padding: 6px 10px; text-align: right; border-bottom: 1px solid #f3f4f6; color: #b45309;">
                        ${currencySymbol} ${m.pending_amount?.toLocaleString(
                      currencySymbol === "CHF" ? "en-CH" : "en-GB",
                      { minimumFractionDigits: 2 }
                    )}
                      </td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>

            <!-- Totals Summary -->
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 20px;
              border-top: 1px dashed #d1d5db;
              padding-top: 10px;
              page-break-inside: avoid;
            ">
              <div style="flex: 1;">
                <p style="margin: 0; font-size: 13px;">Yearly Total:</p>
                <p style="margin: 0; font-weight: bold; color: #111827;">
                  ${currencySymbol} ${yearTotal.toLocaleString(
            currencySymbol === "CHF" ? "en-CH" : "en-GB",
            { minimumFractionDigits: 2 }
          )}
                </p>
              </div>
              <div style="flex: 1;">
                <p style="margin: 0; font-size: 13px;">Pending Total:</p>
                <p style="margin: 0; font-weight: bold; color: #b45309;">
                  ${currencySymbol} ${pendingTotal.toLocaleString(
            currencySymbol === "CHF" ? "en-CH" : "en-GB",
            { minimumFractionDigits: 2 }
          )}
                </p>
              </div>
              <div style="flex: 1;">
                <p style="margin: 0; font-size: 13px;">Completion:</p>
                <p style="margin: 0; font-weight: bold; color: #059669;">${completedPercent}%</p>
              </div>
            </div>
          </div>`;
        })
        .join("")}
    </div>

    <!-- Footer -->
    <div style="text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px;">
      <p style="margin: 0;">Generated by Thaalam Media Reporting System</p>
    </div>
  </div>`;

  document.body.appendChild(element);

  await html2pdf()
    .set({
      margin: 0.5,
      filename: `Expense_Report_${year}.pdf`,
      html2canvas: { scale: 2, useCORS: true, allowTaint: false, scrollY: 0 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    })
    .from(element)
    .save();

  document.body.removeChild(element);
};
