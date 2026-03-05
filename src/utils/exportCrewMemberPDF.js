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

export const exportCrewMemberPDF = async (member) => {
  const logoSrc = await getBase64Logo(
    `${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`,
  );

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  const element = document.createElement("div");

  element.innerHTML = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px 35px; color:#1f2937; max-width: 1200px; margin: 0 auto;">

      <style>
        * {
          box-sizing: border-box;
        }
        .document-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          margin-left: 8px;
        }
        .badge-present {
          background: #d1fae5;
          color: #065f46;
        }
        .badge-missing {
          background: #fee2e2;
          color: #991b1b;
        }
        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          margin-bottom: 12px;
          align-items: flex-start;
        }
        .info-label {
          width: 120px;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
        .info-value {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
          color: #111827;
        }
        .summary-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          height: 100%;
        }
        .summary-title {
          font-size: 14px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #2563eb;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .summary-content {
          font-size: 12px;
          line-height: 1.6;
          color: #4b5563;
        }
        .flight-detail {
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px dashed #e5e7eb;
        }
        .flight-detail:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
      </style>

      <!-- Header -->
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:18px 22px;
        border-radius:10px;
        background:#f9fafb;
        border:1px solid #e5e7eb;
        margin-bottom:25px;
      ">
        <div style="display:flex; align-items:center;">
          <img src="${logoSrc}" style="width:150px; height:auto;" alt="Logo" />
        </div>
        <div style="text-align:right; line-height:1.5;">
          <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:6px;">
            THAALAM MEDIA GMBH
          </div>
          <div style="font-size:12px; color:#4b5563;">Talacker 41</div>
          <div style="font-size:12px; color:#4b5563;">8001 Zürich, Switzerland</div>
          <div style="font-size:12px; color:#374151;margin-top:4px;font-weight:500;">
            Tel: 079 694 88 89
          </div>
        </div>
      </div>

      <div style="display:flex; gap:30px; margin-bottom:25px;">

  <!-- LEFT : CREW DETAILS -->
  <div style="flex:1;">
    <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;border-bottom:2px solid #2563eb;padding-bottom:10px;">
      CREW DETAILS
    </h3>

    <div class="info-row">
      <span class="info-label">Full Name</span>
      <span class="info-value">${member.given_name || ""} ${member.sur_name || ""}</span>
    </div>

    <div class="info-row">
      <span class="info-label">Designation</span>
      <span class="info-value">${member.designation || "-"}</span>
    </div>

    <div class="info-row">
      <span class="info-label">Date of Birth</span>
      <span class="info-value">${formatDate(member.date_of_birth)}</span>
    </div>

    <div class="info-row">
      <span class="info-label">Gender</span>
      <span class="info-value">${member.gender || "-"}</span>
    </div>

    <div class="info-row">
      <span class="info-label">Nationality</span>
      <span class="info-value">${member.nationality || "-"}</span>
    </div>

    <div class="info-row">
      <span class="info-label">Contact Number</span>
      <span class="info-value">${member.contact_number || "-"}</span>
    </div>

    <div class="info-row">
      <span class="info-label">Email ID</span>
      <span class="info-value">${member.email_id || "-"}</span>
    </div>
  </div>


  <!-- RIGHT : PASSPORT DETAILS -->
  <div style="flex:1;">
    <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;border-bottom:2px solid #2563eb;padding-bottom:10px;">
      PASSPORT DETAILS
    </h3>

    <div class="info-row">
      <span class="info-label">Passport Number</span>
      <span class="info-value">${member.passport_number || "-"}</span>
    </div>

    <div class="info-row">
      <span class="info-label">Passport Issue</span>
      <span class="info-value">${formatDate(member.date_of_issue)}</span>
    </div>

    <div class="info-row">
      <span class="info-label">Passport Expiry</span>
      <span class="info-value">${formatDate(member.date_of_expiry)}</span>
    </div>

    <div class="info-row">
      <span class="info-label">Boarding From</span>
      <span class="info-value">${member.boarding_from || "-"}</span>
    </div>

    <div class="info-row">
      <span class="info-label">Returning To</span>
      <span class="info-value">${member.returning_to || "-"}</span>
    </div>

    <div style="margin-top:20px;">
  <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;border-bottom:2px solid #2563eb;padding-bottom:10px;">
    PREFERENCES
  </h3>


    <div class="info-row">
      <span class="info-label">Food Preference</span>
      <span class="info-value">${member.food_preference || "-"}</span>
    </div>

    <div class="info-row">
      <span class="info-label">Room Preference</span>
      <span class="info-value">${member.room_preference || "-"}</span>
    </div>

</div>

  </div>

</div>


      <div style="margin-top: 30px;">
        <h3 style="font-size: 16px; margin: 0 0 15px 0; color: #111827;">📌 SUMMARY</h3>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          
          <div class="summary-card">
            <div class="summary-title">
              FLIGHT
            </div>
            <div class="summary-content">
              ${
                member.flights && member.flights.length > 0
                  ? member.flights
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(
                        (f) => `
<div style="
  background:#f9fafb;
  border-bottom:1px solid #e5e7eb;
  border-radius:8px;
  padding-bottom: 8px;
  margin-bottom:8px;
">

  <div style="font-weight:700;font-size:13px;color:#1d4ed8;margin-bottom:6px;">
    ${f.from_city || "-"} → ${f.to_city || "-"}
  </div>

  <div style="font-size:12px;margin-bottom:3px;">
    <span style="color:#6b7280;font-weight:600;">Airline:</span>
    <span style="color:#111827;">${f.airline || "-"}</span>
  </div>

  <div style="font-size:12px;margin-bottom:3px;">
    <span style="color:#6b7280;font-weight:600;">Flight:</span>
    <span style="color:#111827;">${f.flight_number || "-"}</span>
  </div>

  <div style="font-size:12px;margin-bottom:3px;">
    <span style="color:#6b7280;font-weight:600;">Departure:</span>
    <span>${formatDate(f.departure_date)} ${formatTime(f.departure_time)}</span>
  </div>

  <div style="font-size:12px;margin-bottom:3px;">
    <span style="color:#6b7280;font-weight:600;">Arrival:</span>
    <span>${formatDate(f.arrival_date)} ${formatTime(f.arrival_time)}</span>
  </div>

  <div style="font-size:12px;margin-bottom:4px;">
    <span style="color:#6b7280;font-weight:600;">Class:</span>
    <span>${f.flight_class || "-"}</span>
    <span style="margin-left:8px;color:#6b7280;font-weight:600;">PNR:</span>
    <span>${f.pnr || "-"}</span>
  </div>
</div>
`,
                      )
                      .join("")
                  : "No flight information available"
              }
            </div>
          </div>
          
          <!-- Room Column -->
          <div class="summary-card">
            <div class="summary-title">
               ROOM
            </div>
            <div class="summary-content">
              ${
                member.rooms && member.rooms.length > 0
                  ? member.rooms
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(
                        (r) => `
<div style="
  background:#f9fafb;
  border-bottom:1px solid #e5e7eb;
  border-radius:8px;
  padding-bottom:8px;
  margin-bottom:8px;
">

<div style="font-weight:700;font-size:13px;color:#059669;margin-bottom:6px;">
  ${r.hotel_name || "Hotel"}
</div>

<div style="font-size:12px;margin-bottom:3px;">
  <span style="color:#6b7280;font-weight:600;">City:</span>
  <span style="color:#111827;">${r.city || "-"}</span>
</div>

  <div style="font-size:12px;margin-bottom:3px;">
    <span style="color:#6b7280;font-weight:600;">Room Type:</span>
    <span>${r.room_type || "-"}</span>
    ${
      r.room_number
        ? `<span style="margin-left:8px;color:#6b7280;font-weight:600;">Room:</span>
           <span>${r.room_number}</span>`
        : ""
    }
  </div>

  <div style="font-size:12px;margin-bottom:3px;">
    <span style="color:#6b7280;font-weight:600;">Check-in:</span>
    <span>${formatDate(r.checkin_date)} ${formatTime(r.checkin_time)}</span>
  </div>

  <div style="font-size:12px;">
    <span style="color:#6b7280;font-weight:600;">Check-out:</span>
    <span>${formatDate(r.checkout_date)} ${formatTime(r.checkout_time)}</span>
  </div>

</div>
`,
                      )
                      .join("")
                  : "No room booking available"
              }
            </div>
          </div>
          
          <!-- Visa Column -->
          <div class="summary-card">
            <div class="summary-title">
               VISA
            </div>
            <div class="summary-content">
              ${
                member.visas && member.visas.length > 0
                  ? member.visas
                      .map(
                        (v) => `
<div style="
  background:#f9fafb;
  border-bottom:1px solid #e5e7eb;
  border-radius:8px;
  padding-bottom:8px;
  margin-bottom:8px;
">

<div style="font-weight:700;font-size:13px;color:#7c3aed;margin-bottom:6px;">
  ${v.country || "-"}
</div>

  <div style="font-size:12px;margin-bottom:3px;">
    <span style="color:#6b7280;font-weight:600;">Visa Type:</span>
    <span style="color:#111827;">${v.visa_type || "-"}</span>
  </div>

  <div style="font-size:12px;margin-bottom:3px;">
    <span style="color:#6b7280;font-weight:600;">Visa Number:</span>
    <span>${v.visa_number || "-"}</span>
  </div>

  <div style="font-size:12px;margin-bottom:3px;">
    <span style="color:#6b7280;font-weight:600;">Valid From:</span>
    <span>${formatDate(v.date_of_issue)}</span>
  </div>

  <div style="font-size:12px;margin-bottom:3px;">
    <span style="color:#6b7280;font-weight:600;">Valid Until:</span>
    <span>${formatDate(v.date_of_expiry)}</span>
  </div>
</div>
`,
                      )
                      .join("")
                  : "No visa information available"
              }
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  `;

  document.body.appendChild(element);

  await html2pdf()
    .set({
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `${member.given_name}_${member.sur_name}_profile.pdf`,
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
    })
    .from(element)
    .save();

  document.body.removeChild(element);
};
