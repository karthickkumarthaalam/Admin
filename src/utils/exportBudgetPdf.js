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
  actualBudgetMode = false,
}) => {
  const {
    title,
    budget_id,
    date,
    from_date,
    to_date,
    currencySymbol,
    created_by,
  } = budgetInfo;

  let expenseTotal = 0;
  let incomeTotal = 0;
  let sponsersTotal = 0;
  let taxTotal = 0;
  let expenseGroupedHTML = "";
  let incomeGroupedHTML = "";
  let sponsersGroupedHTML = "";

  const logoSrc = await getBase64Logo(
    `${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`
  );

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-GB") : "-";

  const formatCurrency = (amount) => {
    return `${Number(amount || 0).toLocaleString(
      currencySymbol === "CHF" ? "en-CH" : "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

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
    return groupedItems
      .map(([category, rows], groupIndex) =>
        rows
          .map((row, rowIndex) => {
            const isFirst = rowIndex === 0;
            const isLast = rowIndex === rows.length - 1;

            const cellStyle = `
            padding: 6px;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
            border-top: ${isFirst ? "1px solid #ddd" : "1px solid #eee"};
            border-bottom: ${isLast ? "1px solid #ddd" : "1px solid #eee"};
            page-break-inside: avoid;
          `;

            return `
          <tr style="page-break-inside: avoid;">
            <td style="${cellStyle}">${isFirst ? groupIndex + 1 : ""}</td>
            <td style="${cellStyle}">${isFirst ? category : ""}</td>
            <td style="${cellStyle}">${row.sub_category}</td>
            <td style="${cellStyle}">${row.description}</td>
            <td style="${cellStyle}">${row.quantity} ${
              row.units ? "- " + row.units : ""
            }</td>
            ${
              !actualBudgetMode
                ? `
              <td style="${cellStyle} text-align:right;">${formatCurrency(
                    row.amount
                  )}</td>
              <td style="${cellStyle} text-align:right;">${formatCurrency(
                    row.total_amount
                  )}</td>
            `
                : `
              <td colspan="2" style="${cellStyle} text-align:right;">${formatCurrency(
                    row.actual_amount
                  )}</td>
            `
            }
          </tr>`;
          })
          .join("")
      )
      .join("");
  };

  if (expenseItems.length > 0) {
    expenseTotal = expenseItems.reduce(
      (sum, item) =>
        sum +
        (parseFloat(
          actualBudgetMode ? item.actual_amount : item.total_amount
        ) || 0),
      0
    );
    expenseGroupedHTML = renderGroupedRows(groupItemsByCategory(expenseItems));
  }

  if (incomeItems.length > 0) {
    incomeTotal = incomeItems.reduce(
      (sum, item) =>
        sum +
        (parseFloat(
          actualBudgetMode ? item.actual_amount : item.total_amount
        ) || 0),
      0
    );
    incomeGroupedHTML = renderGroupedRows(groupItemsByCategory(incomeItems));
  }

  if (sponsersItems.length > 0) {
    sponsersTotal = sponsersItems.reduce(
      (sum, item) =>
        sum +
        (parseFloat(
          actualBudgetMode ? item.actual_amount : item.total_amount
        ) || 0),
      0
    );
    sponsersGroupedHTML = renderGroupedRows(
      groupItemsByCategory(sponsersItems)
    );
  }

  if (appliedTaxes.length > 0) {
    taxTotal = appliedTaxes.reduce((sum, tax) => sum + tax.amount, 0);
  }

  const profit = incomeTotal + sponsersTotal - expenseTotal - taxTotal;

  const element = document.createElement("div");

  element.innerHTML = `
    <div style="font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333;">
      <style>
        tr, td, th {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          border-collapse: collapse;
        }
      </style>

      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 20px;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <img src="${logoSrc}" width="200px" height="100px" />
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 22px;">${
            actualBudgetMode
              ? "Actual Budget Report"
              : "Estimated Budget Report"
          }</h2>
          <p style="margin: 0; font-size: 15px; color: #555;">THAALAM MEDIA GMBH</p>
          <p style="margin: 0; font-size: 13px; color: #555;">Talacker 41,</p>
          <p style="margin: 0; font-size: 13px; color: #555;">8001 Zürich</p>
          <p style="margin: 0; font-size: 13px; color: #555;">079 694 88 89</p>
        </div>
      </div>

     <div style="margin-top: 20px; font-size: 13px;">
      <div style="display: flex; justify-content: space-between; gap: 20px;">
        <div>
          <p><strong>Event Name:</strong> ${title}</p>
          <p><strong>Submitted By:</strong> ${created_by}</p>
        </div>
        <div>
          ${
            from_date && to_date
              ? `<p><strong>From:</strong> ${formatDate(from_date)}</p>
                 <p><strong>To:</strong> ${formatDate(to_date)}</p>`
              : date
              ? `<p><strong>Date:</strong> ${formatDate(date)}</p>`
              : ""
          }
        </div>
      </div>
      </div>

      ${
        expenseItems.length > 0
          ? `<div style="margin-top:20px;">
                <h3 style="margin-bottom: 10px; font-size: 14px;">EXPENSE</h3>
                <table style="width: 100%; font-size: 11px;">
                  <thead>
                    <tr style="background-color: #333; color: white;">
                      <th style="padding: 6px; text-align: left;">ID</th>
                      <th style="padding: 6px; text-align: left;">Category</th>
                      <th style="padding: 6px; text-align: left;">Sub-category</th>
                      <th style="padding: 6px; text-align: left;">Particulars</th>
                      <th style="padding: 6px; text-align: left;">Quantity</th>
                      ${
                        !actualBudgetMode
                          ? `
                                <th style="padding: 6px; text-align: right; white-space:nowrap;">Amount (${currencySymbol})</th>
                              <th style="padding: 6px; text-align: right; white-space:nowrap;">Total Amount (${currencySymbol})</th>`
                          : `<th style="padding: 6px; text-align: right; white-space:nowrap;">Actual Amount (${currencySymbol})</th>`
                      }
                    </tr>
                  </thead>
                  <tbody>
                    ${expenseGroupedHTML}
                  </tbody>
                </table>
                <p style="text-align:right; font-size:12px; margin-bottom: 30px; color: red;"><span style="color: black">Total Expense:</span> <strong>${currencySymbol} ${formatCurrency(
              expenseTotal
            )}</strong></p>
              </div>`
          : ""
      }

      ${
        incomeItems.length > 0
          ? `
        <div style="page-break-inside: avoid; break-inside: avoid;">
        <h3 style="margin-bottom: 10px; font-size: 14px;">INCOME</h3>
        <table style="width: 100%; font-size: 11px;">
          <thead>
            <tr style="background-color: #333; color: white;">
              <th style="padding: 6px; text-align: left;">ID</th>
              <th style="padding: 6px; text-align: left;">Category</th>
              <th style="padding: 6px; text-align: left;">Sub-category</th>
              <th style="padding: 6px; text-align: left;">Particulars</th>
              <th style="padding: 6px; text-align: left;">Quantity</th>
             ${
               !actualBudgetMode
                 ? `
                <th style="padding: 6px; text-align: right; white-space:nowrap;">Amount (${currencySymbol})</th>
              <th style="padding: 6px; text-align: right; white-space:nowrap;">Total Amount (${currencySymbol})</th>`
                 : `<th style="padding: 6px; text-align: right; white-space:nowrap;">Actual Amount (${currencySymbol})</th>`
             }
            </tr>
          </thead>
          <tbody>
            ${incomeGroupedHTML}
          </tbody>
        </table>
        <p style="text-align:right; font-size:12px; margin-bottom: 30px; color: green;"><span style="color: black">Total Income:</span> <strong>${currencySymbol} ${formatCurrency(
              incomeTotal
            )}</strong></p>
      </div>
`
          : ""
      }

    ${
      appliedTaxes.length > 0
        ? `
        <div style="page-break-inside: avoid; break-inside: avoid;">
        <h3 style="margin-bottom: 10px; font-size: 14px;">TAXES APPLIED</h3>
        ${
          appliedTaxes.length > 0
            ? `<table style="width: 100%; font-size: 11px;">
              <thead>
                <tr style="background-color: #333; color: white;">
                  <th style="padding: 6px; text-align: left;">Tax</th>
                  <th style="padding: 6px; text-align: left;">Rate (%)</th>
                  <th style="padding: 6px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${appliedTaxes
                  .map(
                    (tax) => `
                    <tr>
                      <td style="padding: 6px; border: 1px solid #ddd;">${
                        tax.tax_name
                      }</td>
                      <td style="padding: 6px; border: 1px solid #ddd;">${
                        tax.percentage
                      }</td>
                      <td style="padding: 6px; border: 1px solid #ddd; text-align: right">${currencySymbol} ${formatCurrency(
                      tax.amount
                    )}</td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
                    <p style="text-align:right; font-size:12px; margin-bottom: 30px; color: red;"><span style="color: black">Total Tax:</span> <strong>${currencySymbol} ${formatCurrency(
                taxTotal
              )}</strong></p>`
            : `<p style="font-size: 12px; color: gray;">No taxes applied.</p>`
        }
      </div>`
        : ""
    }

      ${
        sponsersItems.length > 0
          ? `
        <div style="page-break-inside: avoid; break-inside: avoid;">
        <h3 style="margin-bottom: 10px; font-size: 14px;">SPONSORS</h3>
        <table style="width: 100%; font-size: 11px;">
          <thead>
            <tr style="background-color: #333; color: white;">
              <th style="padding: 6px; text-align: left;">ID</th>
              <th style="padding: 6px; text-align: left;">Category</th>
              <th style="padding: 6px; text-align: left;">Sub-category</th>
              <th style="padding: 6px; text-align: left;">Particulars</th>
              <th style="padding: 6px; text-align: left;">Quantity</th>
            ${
              !actualBudgetMode
                ? `
              <th style="padding: 6px; text-align: right; white-space:nowrap;">Amount (${currencySymbol})</th>
              <th style="padding: 6px; text-align: right; white-space:nowrap;">Total Amount (${currencySymbol})</th>`
                : `<th style="padding: 6px; text-align: right; white-space:nowrap;">Actual Amount (${currencySymbol})</th>`
            }
            </tr>
          </thead>
          <tbody>
            ${sponsersGroupedHTML}
          </tbody>
        </table>
        <p style="text-align:right; font-size:12px; margin-bottom: 30px; color: green;"><span style="color: black">Total Sponsers Income:</span> <strong>${currencySymbol} ${formatCurrency(
              sponsersTotal
            )}</strong></p>
      </div>`
          : ""
      }

    ${
      expenseItems.length > 0 && incomeItems.length > 0
        ? `
         <div style="page-break-inside: avoid; break-inside: avoid; margin-top: 30px;">
        <h3 style="margin-bottom: 5px; font-size: 14px;">BUDGET SUMMARY</h3>
        <table style="width: 100%; font-size: 11px;">
          <thead style="background-color: #333; color: white;">
            <tr>
              <th style="padding: 6px;  text-align: left;">Total Income</th>
              <th style="padding: 6px;  text-align: left;">Total Expense</th>
              <th style="padding: 6px;  text-align: left;">Total Taxes</th>
              <th style="padding: 6px;  text-align: left;">Profit / Loss</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; color: green;">
                ${currencySymbol} ${formatCurrency(incomeTotal + sponsersTotal)}
              </td>
              <td style="padding: 8px; border: 1px solid #ddd; color: red;">
                ${currencySymbol} ${formatCurrency(expenseTotal)}
              </td>
                 <td style="padding: 8px; border: 1px solid #ddd; color: red;">
                ${currencySymbol} ${formatCurrency(taxTotal)}
              </td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">
                ${
                  profit >= 0
                    ? `<span style="color: green;">🔺 ${currencySymbol} ${formatCurrency(
                        profit
                      )} (Profit)</span>`
                    : `<span style="color: red;">🔻 ${currencySymbol} ${formatCurrency(
                        Math.abs(profit)
                      )} (Loss)</span>`
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      `
        : ""
    }
    </div>
  `;

  // Append temporarily to DOM
  document.body.appendChild(element);

  await html2pdf()
    .set({
      margin: 0.5,
      filename: `${title}_${new Date().toISOString().split("T")[0]}.pdf`,
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: 0,
        windowWidth: element.scrollWidth, // helps fix width clipping
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
        hotfixes: ["px_scaling"],
      },
    })
    .from(element)
    .save();

  // Remove after export
  document.body.removeChild(element);
};
