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

export const exportBudgetPDF = async ({
  budgetInfo,
  incomeItems,
  expenseItems,
  sponsersItems,
  appliedTaxes,
}) => {
  const {
    title,
    budget_id,
    date,
    from_date,
    to_date,
    currencySymbol,
    created_by
  } = budgetInfo;

  const incomeTotal = incomeItems.reduce(
    (sum, item) => sum + (parseFloat(item.total_amount) || 0),
    0
  );
  const expenseTotal = expenseItems.reduce(
    (sum, item) => sum + (parseFloat(item.total_amount) || 0),
    0
  );
  const sponsersTotal = sponsersItems.reduce(
    (sum, item) => sum + (parseFloat(item.total_amount) || 0),
    0
  );
  const taxTotal = appliedTaxes.reduce((sum, tax) => sum + tax.amount, 0);
  const profit = incomeTotal - expenseTotal - taxTotal;

  const logoSrc = await getBase64Logo(`${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-GB") : "-";

  const groupItemsByCategory = (items) => {
    const map = new Map();
    items.forEach((item) => {
      if (!map.has(item.category)) {
        map.set(item.category, []);
      }
      map.get(item.category).push(item);
    });
    return [...map.entries()];
  };

  const renderGroupedRows = (groupedItems) => {
    return groupedItems.map(([category, rows], groupIndex) =>
      rows.map((row, rowIndex) => {
        const isFirst = rowIndex === 0;
        return `
          <tr>
            <td style="padding: 6px; border: 1px solid #ddd;">${isFirst ? groupIndex + 1 : ""}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${isFirst ? category : ""}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${row.sub_category}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${row.description}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${row.quantity} ${row.units ? "- " + row.units : ""}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${currencySymbol} ${Number(row.amount).toFixed(2)}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${currencySymbol} ${Number(row.total_amount).toFixed(2)}</td>
          </tr>`;
      }).join("")
    ).join("");
  };

  const expenseGroupedHTML = renderGroupedRows(groupItemsByCategory(expenseItems));
  const incomeGroupedHTML = renderGroupedRows(groupItemsByCategory(incomeItems));
  const sponsersGroupedHTML = renderGroupedRows(groupItemsByCategory(sponsersItems));

  const element = document.createElement("div");

  element.innerHTML = `
    <div style="font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333;">
      <style>
        table, tr, td, th {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          border-collapse: collapse;
        }
        div, table {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      </style>

      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 20px;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <img src="${logoSrc}" width="200px" height="100px" />
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 28px;">Estimated Budget Report</h2>
          <p style="margin: 0; font-size: 18px;">THAALAM MEDIA GMBH</p>
          <p style="margin: 0; font-size: 16px;">Talacker 41,</p>
          <p style="margin: 0; font-size: 16px;">8001 Zürich</p>
          <p style="margin: 0; font-size: 16px;">079 694 88 89</p>
        </div>
      </div>

     <div style="margin-top: 20px; font-size: 13px;">
  <div style="display: flex; justify-content: space-between; gap: 20px;">
    <div>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Created By:</strong> ${created_by}</p>
    </div>
    <div>
      ${from_date && to_date
      ? `<p><strong>From:</strong> ${formatDate(from_date)}</p>
             <p><strong>To:</strong> ${formatDate(to_date)}</p>`
      : date
        ? `<p><strong>Date:</strong> ${formatDate(date)}</p>`
        : ""
    }
    </div>
  </div>
</div>

      <div style="page-break-inside: avoid; break-inside: avoid; margin-top:20px;">
        <h3 style="margin-bottom: 5px; font-size: 14px;">EXPENSE</h3>
        <table style="width: 100%; font-size: 12px;">
          <thead>
            <tr style="background-color: #333; color: white;">
              <th style="padding: 6px; text-align: left;">ID</th>
              <th style="padding: 6px; text-align: left;">Category</th>
              <th style="padding: 6px; text-align: left;">Sub-category</th>
              <th style="padding: 6px; text-align: left;">Particulars</th>
              <th style="padding: 6px; text-align: left;">Quantity</th>
              <th style="padding: 6px; text-align: left;">Amount</th>
              <th style="padding: 6px; text-align: left;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenseGroupedHTML}
          </tbody>
        </table>
        <p style="text-align:right; font-size:12px; margin-bottom: 30px;"><strong>Total Expense: </strong>${currencySymbol} ${expenseTotal}</p>
      </div>

      <div style="page-break-inside: avoid; break-inside: avoid;">
        <h3 style="margin-bottom: 5px; font-size: 14px;">INCOME</h3>
        <table style="width: 100%; font-size: 12px;">
          <thead>
            <tr style="background-color: #333; color: white;">
              <th style="padding: 6px; text-align: left;">ID</th>
              <th style="padding: 6px; text-align: left;">Category</th>
              <th style="padding: 6px; text-align: left;">Sub-category</th>
              <th style="padding: 6px; text-align: left;">Particulars</th>
              <th style="padding: 6px; text-align: left;">Quantity</th>
              <th style="padding: 6px; text-align: left;">Amount</th>
              <th style="padding: 6px; text-align: left;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${incomeGroupedHTML}
          </tbody>
        </table>
        <p style="text-align:right; font-size:12px; margin-bottom: 30px;"><strong>Total Income: </strong>${currencySymbol} ${incomeTotal}</p>
      </div>

      <div style="page-break-inside: avoid; break-inside: avoid;">
        <h3 style="margin-bottom: 5px; font-size: 14px;">TAXES APPLIED</h3>
        ${appliedTaxes.length > 0
      ? `<table style="width: 100%; font-size: 12px; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #333; color: white;">
                  <th style="padding: 6px; text-align: left;">Tax</th>
                  <th style="padding: 6px; text-align: left;">Rate (%)</th>
                  <th style="padding: 6px; text-align: left;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${appliedTaxes.map(
        (tax) => `
                    <tr>
                      <td style="padding: 6px; border: 1px solid #ddd;">${tax.tax_name}</td>
                      <td style="padding: 6px; border: 1px solid #ddd;">${tax.percentage}</td>
                      <td style="padding: 6px; border: 1px solid #ddd;">${currencySymbol}${tax.amount.toFixed(2)}</td>
                    </tr>`
      ).join("")}
              </tbody>
            </table>`
      : `<p style="font-size: 12px; color: gray;">No taxes applied.</p>`}
      </div>

      <div style="page-break-inside: avoid; break-inside: avoid;">
        <h3 style="margin-bottom: 5px; font-size: 14px;">SPONSORS</h3>
        <table style="width: 100%; font-size: 12px;">
          <thead>
            <tr style="background-color: #333; color: white;">
              <th style="padding: 6px; text-align: left;">ID</th>
              <th style="padding: 6px; text-align: left;">Category</th>
              <th style="padding: 6px; text-align: left;">Sub-category</th>
              <th style="padding: 6px; text-align: left;">Particulars</th>
              <th style="padding: 6px; text-align: left;">Quantity</th>
              <th style="padding: 6px; text-align: left;">Amount</th>
              <th style="padding: 6px; text-align: left;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${sponsersGroupedHTML}
          </tbody>
        </table>
        <p style="text-align:right; font-size:12px; margin-bottom: 30px;"><strong>Total Sponsers Income: </strong>${currencySymbol} ${sponsersTotal}</p>
      </div>

    <div style="page-break-inside: avoid; break-inside: avoid;">
      <h3 style="margin-bottom: 5px; font-size: 14px;">BUDGET SUMMARY</h3>
      <table style="width: 60%; font-size: 13px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px; font-weight: bold;">Total Income:</td>
          <td style="padding: 6px;">${currencySymbol} ${incomeTotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 6px; font-weight: bold;">Total Expense:</td>
          <td style="padding: 6px;">${currencySymbol} ${expenseTotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 6px; font-weight: bold;">Profit/Loss:</td>
          <td style="padding: 6px; font-weight: bold; color: ${profit >= 0 ? 'green' : 'red'};">
            ${profit >= 0
      ? `<span style="color: green;">🔺 ${currencySymbol} ${profit.toFixed(2)} (Profit)</span>`
      : `<span style="color: red;">🔻 ${currencySymbol} ${Math.abs(profit).toFixed(2)} (Loss)</span>`}
          </td>
        </tr>
      </table>
    </div>

      <div style="display: flex; justify-content: space-between; margin-top: 60px;">
        <div style="width: 45%;">
          <p style="font-size: 14px;"><strong>Submitted By:</strong></p>
          <div style="margin-top: 50px; border-top: 1px solid #000; width: 50%;"></div>
          <p style="margin-top: 4px; font-size: 12px;">Signature</p>
        </div>

        <div style="width: 45%;">
          <p style="font-size: 14px;"><strong>Reported To:</strong></p>
          <div style="margin-top: 50px; border-top: 1px solid #000; width: 50%;"></div>
          <p style="margin-top: 4px; font-size: 12px;">Signature</p>
        </div>
      </div>
    </div>
  `;

  html2pdf()
    .set({
      margin: 0.5,
      filename: `Budget_Report_${budget_id}_${new Date().toISOString().split("T")[0]}.pdf`,
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
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
