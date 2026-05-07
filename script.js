/* ══════════════════════════════════════════════
   MSR DEPLOYMENT FEEDBACK FORM — SCRIPTS
══════════════════════════════════════════════ */

'use strict';

/* ── Rating categories ── */
const ASPECTS = [
  'Recruitment Process',
  'Document Assistance',
  'Communication & Updates',
  'Recruiter Professionalism',
  'Processing Speed',
  'Overall Satisfaction'
];

const ratings = {};   // { aspectIndex: starValue (0-5) }

/* ── Build star rating cards ── */
(function buildRatings() {
  const grid = document.getElementById('ratingsGrid');
  if (!grid) return; // Prevent errors if grid not found

  ASPECTS.forEach((aspect, ai) => {
    ratings[ai] = 0;

    const card = document.createElement('div');
    card.className = 'rating-card';

    const lbl = document.createElement('div');
    lbl.className = 'rating-label';
    lbl.textContent = aspect;

    const starsEl = document.createElement('div');
    starsEl.className = 'stars';
    starsEl.setAttribute('role', 'group');
    starsEl.setAttribute('aria-label', aspect + ' rating');

    for (let i = 1; i <= 5; i++) {
      const s = document.createElement('button');
      s.className = 'star';
      s.textContent = '★';
      s.dataset.val   = i;
      s.dataset.group = ai;
      s.setAttribute('aria-label', `${i} star`);
      s.type = 'button';

      s.addEventListener('click', function () {
        const v = +this.dataset.val, g = this.dataset.group;
        ratings[g] = v;
        document.querySelectorAll(`.star[data-group="${g}"]`)
          .forEach(st => st.classList.toggle('active', +st.dataset.val <= v));
      });
      s.addEventListener('mouseenter', function () {
        const v = +this.dataset.val, g = this.dataset.group;
        document.querySelectorAll(`.star[data-group="${g}"]`).forEach(st => {
          if (!st.classList.contains('active'))
            st.classList.toggle('hover', +st.dataset.val <= v);
        });
      });
      s.addEventListener('mouseleave', function () {
        document.querySelectorAll(`.star[data-group="${this.dataset.group}"]`)
          .forEach(st => st.classList.remove('hover'));
      });
      starsEl.appendChild(s);
    }

    card.appendChild(lbl);
    card.appendChild(starsEl);
    grid.appendChild(card);
  });
})();

/* ══════════════════════════════════════════════
   LOGGING — Sends submission data to Google Sheet
══════════════════════════════════════════════ */
function logSubmission() {
  const d = getFormData();
  const now = new Date();
  
  const logData = {
    timestamp: now.toLocaleString('en-PH', { dateStyle: 'full', timeStyle: 'medium' }),
    date: now.toLocaleDateString('en-PH'),
    time: now.toLocaleTimeString('en-PH'),
    name: d.name,
    position: d.position,
    country: d.country,
    employer: d.employer,
    recruiter: d.recruiter,
    doc_officer: d.doc_officer,
  };

  // Optional: Send to Google Form (fallback)
  const formID = 'YOUR_GOOGLE_FORM_ID_HERE'; 
  const formURL = `https://docs.google.com/forms/d/e/${formID}/formResponse`;

  if (formID !== 'YOUR_GOOGLE_FORM_ID_HERE') {
    const formData = new FormData();
    formData.append('entry.XXXXX1', logData.name);
    formData.append('entry.XXXXX2', logData.date);
    formData.append('entry.XXXXX3', logData.time);
    formData.append('entry.XXXXX4', logData.position);
    formData.append('entry.XXXXX5', logData.country);
    formData.append('entry.XXXXX6', logData.employer);
    formData.append('entry.XXXXX7', logData.recruiter);
    formData.append('entry.XXXXX8', logData.doc_officer);

    fetch(formURL, { method: 'POST', body: formData, mode: 'no-cors' }).catch(() => {});
  }

  // Also store locally for backup (uses localStorage)
  try {
    const logs = JSON.parse(localStorage.getItem('msr_feedback_logs') || '[]');
    logs.push(logData);
    localStorage.setItem('msr_feedback_logs', JSON.stringify(logs));
  } catch (e) {
    console.error('Local storage error:', e);
  }
}

/* ── Utility: toast notification ── */
function showToast(msg, icon = '✓') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = `<span>${icon}</span> ${msg}`;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ── Utility: collect form data ── */
function getFormData() {
  return {
    name:        document.getElementById('f-name')?.value.trim()        || '—',
    date:        document.getElementById('f-date')?.value               || '—',
    employer:    document.getElementById('f-employer')?.value.trim()    || '—',
    country:     document.getElementById('f-country')?.value.trim()     || '—',
    recruiter:   document.getElementById('f-recruiter')?.value.trim()   || '—',
    position:    document.getElementById('f-position')?.value.trim()    || '—',
    doc_officer: document.getElementById('f-doc-officer')?.value.trim() || '—',
    testimonial: document.getElementById('f-testimonial')?.value.trim() || '—',
    comments:    document.getElementById('f-comments')?.value.trim()    || '—',
  };
}

/* ── Utility: star string ── */
function starStr(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n) + ` (${n}/5)`;
}

/* ── Clear form ── */
function clearForm() {
  ['f-name','f-date','f-employer','f-country','f-recruiter','f-position','f-doc-officer','f-testimonial','f-comments']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = '';
        el.classList.remove('error');
      }
    });
  Object.keys(ratings).forEach(g => {
    ratings[g] = 0;
    document.querySelectorAll(`.star[data-group="${g}"]`)
      .forEach(s => s.classList.remove('active', 'hover'));
  });
  showToast('Form cleared', '🔄');
}

/* ══════════════════════════════════════════════
   CONFIGURATION
══════════════════════════════════════════════ */
// 🔗 Backend URL: Replace with your Google Apps Script deployment URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyR_idFe7kyxaxZWzPldSZq8_h_m3n0z7_SwS7E4ywKtrFPpXYBVaA3AHgml8bzY0v9/exec';

// 🔑 Security: This must match the API_KEY set in your Google Apps Script
const API_KEY = 'MSR_SECURE_TOKEN_2025';

// 🔒 Admin: Password for the local dashboard (Ctrl+Shift+L)
const ADMIN_PASSWORD = 'msr2025'; 

/* ── Submit (with basic validation) ── */
function handleSubmit() {
  // Honeypot check for spam prevention
  const hp = document.getElementById('f-hp');
  if (hp && hp.value !== '') {
    console.warn('Spam detected.');
    return;
  }

  const nameEl = document.getElementById('f-name');
  if (nameEl && !nameEl.value.trim()) {
    nameEl.classList.add('error');
    nameEl.focus();
    showToast('Please enter your full name', '⚠️');
    return;
  }
  if (nameEl) nameEl.classList.remove('error');
  
  // Show loading state
  showToast('Submitting your feedback...', '⏳');
  
  // Log submission in background
  logSubmission();
  
  // Send to Google Apps Script (automatic email + logging)
  submitToServer();
}

/* ── Reset back to form ── */
function resetForm() {
  clearForm();
  document.getElementById('successScreen').style.display = 'none';
  document.getElementById('ff-form').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════
   SUBMIT TO SERVER — Sends to Google Apps Script
══════════════════════════════════════════════ */
function submitToServer() {
  const d = getFormData();
  
  // Prepare submission data
  const submissionData = {
    api_key:     API_KEY, // 🔒 Include security token
    name:        d.name,
    date:        d.date,
    employer:    d.employer,
    country:     d.country,
    recruiter:   d.recruiter,
    position:    d.position,
    doc_officer: d.doc_officer,
    testimonial: d.testimonial,
    comments:    d.comments,
    ratings:     [
      ratings[0] || 0,
      ratings[1] || 0,
      ratings[2] || 0,
      ratings[3] || 0,
      ratings[4] || 0,
      ratings[5] || 0
    ]
  };
  
  // Check if Google Apps Script URL is configured
  if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.includes('YOUR_GOOGLE')) {
    showToast('⚠️ Server not configured. Contact administrator.', '⚠️');
    // Still show success to user (graceful degradation)
    setTimeout(showSuccessScreen, 1000);
    return;
  }
  
  // Send to Google Apps Script
  fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(submissionData)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      showToast('✅ Feedback submitted successfully!', '✅');
      setTimeout(showSuccessScreen, 1500);
    } else {
      showToast('Feedback recorded (server response: ' + result.message + ')', '✓');
      setTimeout(showSuccessScreen, 1500);
    }
  })
  .catch(error => {
    // Graceful error handling - still show success
    console.error('Submission error:', error);
    showToast('Feedback recorded locally', '✓');
    setTimeout(showSuccessScreen, 1500);
  });
}

function showSuccessScreen() {
  const form = document.getElementById('ff-form');
  const success = document.getElementById('successScreen');
  if (form) form.style.display = 'none';
  if (success) success.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════
   EXPORT AS PDF  (uses jsPDF 2.5.1 UMD)
══════════════════════════════════════════════ */
function exportPdf() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast('PDF library not loaded yet — please wait a moment', '⚠️');
    return;
  }

  const d   = getFormData();
  const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  const W   = 210, M = 18, cw = W - M * 2;
  let y     = 0;

  /* — Header — */
  doc.setFillColor(11, 94, 80);
  doc.rect(0, 0, W, 42, 'F');
  doc.setFillColor(29, 158, 117);
  doc.rect(0, 42, W, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Medical Staffing Resources, Inc.', W / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('DEPLOYMENT FEEDBACK FORM', W / 2, 27, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(159, 225, 203);
  doc.text('Empowering Healthcare Professionals', W / 2, 35, { align: 'center' });

  y = 54;

  /* — Section label helper — */
  function secLabel(txt) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(11, 94, 80);
    doc.text(txt.toUpperCase(), M, y);
    doc.setDrawColor(200, 225, 215);
    doc.setLineWidth(0.3);
    doc.line(M + doc.getTextWidth(txt.toUpperCase()) + 3, y - 0.5, W - M, y - 0.5);
    y += 7;
  }

  /* — Check if new page needed — */
  function checkPage(needed) {
    if (y + needed > 278) {
      doc.addPage();
      y = 18;
    }
  }

  /* — Applicant Info — */
  secLabel('Applicant Information');
  const hw   = (cw - 8) / 2;
  const pairs = [
    ['Full Name',           d.name,      'Date of Deployment',   d.date],
    ['Employer / Principal',d.employer,  'Country of Deployment', d.country],
    ['Assigned Recruiter',  d.recruiter, 'Position / Job Title',  d.position],
  ];
  pairs.forEach(([l1, v1, l2, v2]) => {
    checkPage(14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(l1, M, y);
    doc.text(l2, M + hw + 8, y);
    doc.setFontSize(10.5);
    doc.setTextColor(25, 44, 39);
    doc.text(String(v1), M, y + 5.5);
    doc.text(String(v2), M + hw + 8, y + 5.5);
    y += 14;
  });

  /* — Documentation Officer (full width) — */
  checkPage(14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text('Assigned Documentation Officer', M, y);
  doc.setFontSize(10.5);
  doc.setTextColor(25, 44, 39);
  doc.text(String(d.doc_officer), M, y + 5.5);
  y += 14;

  /* — Ratings — */
  y += 2;
  checkPage(10);
  secLabel('Service Rating');
  ASPECTS.forEach((a, i) => {
    checkPage(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);
    doc.text(a, M, y);
    doc.setTextColor(11, 94, 80);
    doc.text(starStr(ratings[i]), M + 72, y);
    y += 7;
  });

  /* — Text block helper — */
  function textBlock(label, val) {
    y += 4;
    checkPage(30);
    secLabel(label);
    const lines = doc.splitTextToSize(val, cw - 8);
    const bh    = Math.max(22, lines.length * 5.2 + 10);
    checkPage(bh + 2);
    doc.setFillColor(248, 251, 249);
    doc.setDrawColor(210, 228, 220);
    doc.roundedRect(M, y, cw, bh, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(55, 55, 55);
    doc.text(lines, M + 4, y + 7);
    y += bh + 6;
  }

  textBlock('Applicant Testimonial', d.testimonial);
  textBlock('Comments & Suggestions', d.comments);

  /* — Footer — */
  checkPage(12);
  y += 4;
  doc.setDrawColor(210, 228, 220);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(170, 170, 170);
  doc.text(
    `Medical Staffing Resources, Inc.  |  Confidential  |  Generated: ${new Date().toLocaleDateString('en-PH')}`,
    W / 2, y, { align: 'center' }
  );

  doc.save('MSR_Deployment_Feedback.pdf');
  showToast('PDF downloaded successfully', '📄');
}

/* ══════════════════════════════════════════════
   EXPORT AS .DOC (Word-compatible HTML blob)
══════════════════════════════════════════════ */
function exportDocx() {
  const d = getFormData();

  const ratingRows = ASPECTS.map((a, i) => `
    <tr>
      <td style="border:1pt solid #c5e3d8;padding:6pt 10pt;font-size:10pt;color:#333;width:55%">${a}</td>
      <td style="border:1pt solid #c5e3d8;padding:6pt 10pt;font-size:10pt;color:#0B5E50;width:45%">${starStr(ratings[i])}</td>
    </tr>`).join('');

  const dateStr = new Date().toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' });

  const wordHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <meta name=ProgId content=Word.Document>
  <meta name=Generator content="Microsoft Word 15">
  <title>MSR Deployment Feedback</title>
  <style>
    body       { font-family:'Segoe UI',Calibri,Arial,sans-serif; margin:2.5cm; color:#1a2e28; font-size:10pt; }
    .hdr       { background:#0B5E50; padding:22pt 28pt; text-align:center; }
    .hdr h1    { color:#fff; font-size:17pt; margin:0 0 5pt; font-weight:bold; }
    .hdr p     { color:#9FE1CB; font-size:8.5pt; margin:0; text-transform:uppercase; letter-spacing:1.2pt; }
    .bar       { background:#1D9E75; height:4pt; }
    .body-wrap { padding:0; }
    .sec       { font-size:7.5pt; letter-spacing:1.2pt; text-transform:uppercase; color:#0B5E50;
                 font-weight:bold; border-bottom:1pt solid #c5e3d8; padding-bottom:5pt; margin:20pt 0 10pt; }
    .info-tbl  { width:100%; border-collapse:collapse; margin-bottom:14pt; }
    .info-tbl td { padding:5pt 8pt; font-size:10pt; vertical-align:top; width:50%; }
    .lbl       { font-size:7.5pt; color:#8aada5; text-transform:uppercase; letter-spacing:.5pt;
                 display:block; margin-bottom:3pt; }
    .val       { font-size:11pt; color:#192c27; font-weight:500; }
    .rtbl      { width:100%; border-collapse:collapse; margin-bottom:14pt; }
    .tbox      { background:#f7faf8; border:1pt solid #d4e4de; padding:12pt; font-size:10pt;
                 line-height:1.75; color:#2c4a42; min-height:55pt; margin-bottom:14pt;
                 white-space:pre-wrap; }
    .footer    { text-align:center; font-size:8pt; color:#aaa;
                 border-top:1pt solid #d4e4de; padding-top:10pt; margin-top:24pt; }
  </style>
</head>
<body>
  <div class="hdr">
    <h1>Medical Staffing Resources, Inc.</h1>
    <p>Deployment Feedback Form</p>
  </div>
  <div class="bar"></div>
  <div class="body-wrap">
    <div class="sec">Applicant Information</div>
    <table class="info-tbl">
      <tr>
        <td><span class="lbl">Full Name</span><span class="val">${d.name}</span></td>
        <td><span class="lbl">Date of Deployment</span><span class="val">${d.date}</span></td>
      </tr>
      <tr>
        <td><span class="lbl">Employer / Principal</span><span class="val">${d.employer}</span></td>
        <td><span class="lbl">Country of Deployment</span><span class="val">${d.country}</span></td>
      </tr>
      <tr>
        <td><span class="lbl">Assigned Recruiter</span><span class="val">${d.recruiter}</span></td>
        <td><span class="lbl">Position / Job Title</span><span class="val">${d.position}</span></td>
      </tr>
      <tr>
        <td colspan="2"><span class="lbl">Assigned Documentation Officer</span><span class="val">${d.doc_officer}</span></td>
      </tr>
    </table>

    <div class="sec">Service Rating</div>
    <table class="rtbl">${ratingRows}</table>

    <div class="sec">Applicant Testimonial</div>
    <div class="tbox">${d.testimonial}</div>

    <div class="sec">Comments &amp; Suggestions</div>
    <div class="tbox">${d.comments}</div>

    <div class="footer">
      Medical Staffing Resources, Inc. &nbsp;|&nbsp; Confidential Document &nbsp;|&nbsp; ${dateStr}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'MSR_Deployment_Feedback.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Word document downloaded successfully', '📝');
}

/* ══════════════════════════════════════════════
   ADMIN DASHBOARD — View & Export Logs
   (Press Ctrl+Shift+L to open - admin only)
══════════════════════════════════════════════ */
let isAdminMode = false;

// Secret admin access: Ctrl+Shift+L
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyL') {
    e.preventDefault();
    openAdminPanel();
  }
});

function openAdminPanel() {
  const pwd = prompt('🔒 Admin Password:', '');
  if (pwd === ADMIN_PASSWORD) {
    isAdminMode = true;
    displayAdminDashboard();
  } else if (pwd !== null) {
    alert('❌ Incorrect password');
  }
}

function displayAdminDashboard() {
  const logs = JSON.parse(localStorage.getItem('msr_feedback_logs') || '[]');
  
  let html = `
    <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem;" id="adminOverlay">
      <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 900px; width: 100%; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="margin: 0; color: #0B5E50; font-size: 20px;">📊 Submission Logs (${logs.length} total)</h2>
          <button onclick="document.getElementById('adminOverlay').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">&times;</button>
        </div>
        
        <div style="margin-bottom: 1rem; display: flex; gap: 10px;">
          <button onclick="exportLogsCSV()" style="background: #2b579a; color: white; border: none; padding: 9px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;">📥 Export CSV</button>
          <button onclick="exportLogsJSON()" style="background: #1D9E75; color: white; border: none; padding: 9px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;">📥 Export JSON</button>
          <button onclick="if(confirm('⚠️ Clear all logs? This cannot be undone.')) { localStorage.removeItem('msr_feedback_logs'); document.getElementById('adminOverlay').remove(); alert('Logs cleared'); }" style="background: #e74c3c; color: white; border: none; padding: 9px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;">🗑️ Clear All</button>
        </div>
  `;
  
  if (logs.length === 0) {
    html += '<p style="color: #999; text-align: center; padding: 2rem;">No submissions logged yet</p>';
  } else {
    html += `
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #f0f5f2; border-bottom: 2px solid #d4e4de;">
            <th style="padding: 10px; text-align: left; color: #0B5E50; font-weight: 600;">Full Name</th>
            <th style="padding: 10px; text-align: left; color: #0B5E50; font-weight: 600;">Date</th>
            <th style="padding: 10px; text-align: left; color: #0B5E50; font-weight: 600;">Time</th>
            <th style="padding: 10px; text-align: left; color: #0B5E50; font-weight: 600;">Position</th>
            <th style="padding: 10px; text-align: left; color: #0B5E50; font-weight: 600;">Country</th>
            <th style="padding: 10px; text-align: left; color: #0B5E50; font-weight: 600;">Employer</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    logs.forEach((log, i) => {
      const bgColor = i % 2 === 0 ? '#fff' : '#f9fbfa';
      html += `
        <tr style="background: ${bgColor}; border-bottom: 1px solid #e0e8e4;">
          <td style="padding: 10px; color: #192c27;"><strong>${log.name}</strong></td>
          <td style="padding: 10px; color: #476860;">${log.date}</td>
          <td style="padding: 10px; color: #476860;">${log.time}</td>
          <td style="padding: 10px; color: #476860;">${log.position}</td>
          <td style="padding: 10px; color: #476860;">${log.country}</td>
          <td style="padding: 10px; color: #476860;">${log.employer}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
  }
  
  html += `
        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #d4e4de; text-align: center; color: #888; font-size: 12px;">
          ✅ These logs are stored securely in your browser's local storage<br>
          💾 Export them regularly to backup your data
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', html);
}

function exportLogsCSV() {
  const logs = JSON.parse(localStorage.getItem('msr_feedback_logs') || '[]');
  if (logs.length === 0) {
    alert('No logs to export');
    return;
  }
  
  let csv = 'Full Name,Date,Time,Position,Country,Employer,Recruiter,Documentation Officer\n';
  logs.forEach(log => {
    csv += `"${log.name}","${log.date}","${log.time}","${log.position}","${log.country}","${log.employer}","${log.recruiter}","${log.doc_officer}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `MSR_Feedback_Logs_${new Date().toLocaleDateString('en-PH').replace(/\//g, '-')}.csv`;
  link.click();
  showToast('CSV exported successfully', '📥');
}

function exportLogsJSON() {
  const logs = JSON.parse(localStorage.getItem('msr_feedback_logs') || '[]');
  if (logs.length === 0) {
    alert('No logs to export');
    return;
  }
  
  const json = JSON.stringify(logs, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `MSR_Feedback_Logs_${new Date().toLocaleDateString('en-PH').replace(/\//g, '-')}.json`;
  link.click();
  showToast('JSON exported successfully', '📥');
}
