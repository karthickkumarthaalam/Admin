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


export const exportExpensePDF = async ({ expenses, submittedBy, reportedTo, month, year }) => {
  const element = document.createElement("div");

  let totalAmount = 0;
  let paidAmount = 0;
  let pendingAmount = 0;

  expenses.forEach((exp) => {
    totalAmount += exp.total_amount;
    if (exp.status === "completed") {
      paidAmount += exp.total_amount;
    } else {
      pendingAmount += exp.total_amount;
    }
  });

  const logoSrc = await getBase64Logo(`${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`);

  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long" });
  const monthStart = new Date(year, month - 1, 1).toLocaleDateString("en-GB");
  const monthEnd = new Date(year, month, 0).toLocaleDateString("en-GB");
  const reportDuration = `${monthStart} - ${monthEnd}`;

  const currencySymbol =
    expenses[0]?.categories?.[0]?.currency?.symbol || "₹";

  element.innerHTML = `
    <div style="font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e1ea; padding-bottom: 20px;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <img src="${logoSrc}" width="200px" height="100px" />
          <p style="margin: 0; font-size: 18px;">THAALAM MEDIA GMBH</p>
        </div>
        <div style="text-align: right;">
          <h3 style="font-size: 28px; margin: 0;">Expense Report</h3>
          <p style="font-size: 12px; margin: 4px 0;">Amount to be Reimbursed</p>
          <h5 style="font-size: 28px; margin: 0;">${currencySymbol}${pendingAmount.toFixed(2)}</h5>
        </div>
      </div>

      <div style="border-bottom: 1px solid #e1e1ea; padding: 10px; margin-bottom: 10px;">
        <p style="font-size: 13px; font-weight: bold;">${monthName} month ${year} Expenses</p>
      </div>

      <table style="width: 100%; margin-bottom: 30px; border-bottom: 1px solid #e1e1ea; table-layout: fixed;">
        <tr>
          <td style="width: 33.33%; vertical-align: top; text-align: left; padding: 12px 0;">
            <h3 style="font-size: 12px; color: #1f1f2e;">Submitted By</h3>
            <p style="font-size: 12px; font-weight: bold;">${submittedBy.name}</p>
            <p style="font-size: 12px; font-weight: bold;">${submittedBy.email}</p>
          </td>
          <td style="width: 33.33%; vertical-align: top; text-align: left; border-right: 1px solid #e1e1ea; padding: 12px 0 12px 10px;">
            <h3 style="font-size: 12px; color: #1f1f2e;">Reported To</h3>
            <p style="font-size: 12px; font-weight: bold;">${reportedTo.name}</p>
            <p style="font-size: 12px; font-weight: bold;">${reportedTo.email}</p>
          </td>
          <td style="width: 33.33%; vertical-align: top; padding: 12px 0 12px 30px;">
            <h3 style="font-size: 12px; color: #1f1f2e;">Submitted On</h3>
            <p style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">${new Date().toLocaleDateString("en-GB")}</p>
            <h3 style="font-size: 12px; color: #1f1f2e;">Report Duration</h3>
            <p style="font-size: 12px; font-weight: bold;">${reportDuration}</p>
          </td>
        </tr>
      </table>

      <h3 style="margin-bottom: 10px; font-size: 14px; font-weight:semi-bold;">EXPENSE SUMMARY</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px;">
        <thead>
          <tr style="background-color: #333; color: white;">
            <th style="padding: 6px; text-align: left;">S.No</th>
            <th style="padding: 6px; text-align: left;">Expense Details</th>
            <th style="padding: 6px; text-align: left;">Category</th>
            <th style="padding: 6px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map((exp, index) => {
    const categoryNames = exp.categories?.map(cat => `
                <div style="margin-bottom: 10px; line-height: 1.2;">
                  <div>${cat.category_name}</div>
                  <div style="font-size: 11px; color: #555;">${cat.description || "-"}</div>
                </div>
              `).join('') || '';

    const categoryAmounts = exp.categories?.map(cat => `
                <div style="margin-bottom: 4px; line-height: 2.2; text-align: right; font-weight:bold;">
                  ${cat.currency?.symbol || "₹"}${cat.amount.toFixed(2)}
                </div>
              `).join('') || '';

    return `
                <tr>
                  <td style="padding: 6px; text-align: left; vertical-align: top;">${index + 1}.</td>
                  <td style="padding: 6px; vertical-align: top;">
                    <div style="font-weight: bold;">${exp.document_id}</div>
                    <div style="font-weight: bold;">${new Date(exp.date).toLocaleDateString("en-GB")}</div>
                    <div>Merchant: ${exp.merchant || "-"}</div>
                    ${exp.paymentMode?.name ? `<div>Paid Via: ${exp.paymentMode.name}</div>` : ""}
                    ${exp.paidThrough?.name ? `<div>Paid Through: ${exp.paidThrough.name}</div>` : ""}
                  </td>
                  <td style="padding: 6px; vertical-align: top;">${categoryNames}</td>
                  <td style="padding: 6px; vertical-align: top;">${categoryAmounts}</td>
                </tr>
              `;
  }).join('')}
        </tbody>
      </table>

      <h3 style="margin-bottom: 10px; font-size: 14px; font-weight:semi-bold;">REPORT SUMMARY</h3>
      <hr style="border: 1px dashed #e1e1ea"/>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 40px;">
        <tr>
          <td>Total Expense Amount:</td>
          <td><strong>${currencySymbol}${totalAmount.toFixed(2)}</strong></td>
        </tr>
        <tr>
          <td>Total Paid:</td>
          <td><strong>${currencySymbol}${paidAmount.toFixed(2)}</strong></td>
        </tr>
        <tr>
          <td>Total Pending:</td>
          <td><strong>${currencySymbol}${pendingAmount.toFixed(2)}</strong></td>
        </tr>
      </table>

      <table style="width: 50%; margin-bottom: 10px; font-size: 12px;">
        <tr>
          <td style="font-weight: bold;">Submitted By</td>
          <td style="font-weight: bold;">Reported To</td>
        </tr>
        <tr>
          <td>${submittedBy.name}</td>
          <td>${reportedTo.name}</td>
        </tr>
      </table>
    </div>
    `;

  html2pdf()
    .set({
      margin: 0.5,
      filename: `Expense_Report_${new Date().toISOString().split("T")[0]}.pdf`,
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        scrollY: 0,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
    })
    .from(element)
    .save();
};
