/**
 * GOOGLE APPS SCRIPT — MSR Deployment Feedback Form Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Copy ALL of this code into the editor
 * 4. Replace recipients with actual emails
 * 5. Save the project
 * 6. Click "Deploy" -> "New deployment" -> select "Web app"
 * 7. Execute as: "Me" | Who has access: "Anyone"
 * 8. Copy the deployment URL and paste it in script.js
 */

const EMAIL_RECIPIENT_1 = "msrdeployment@msr.ph";
const EMAIL_RECIPIENT_2 = "angelica.necor@msr.ph";

// 🔑 SECURITY: Set a unique API key here. This must match the key in script.js
const API_KEY = "MSR_SECURE_TOKEN_2025"; 

// --- Create/get Google Sheet ---
function getOrCreateSheet() {
  var spreadsheet = null;
  var files = DriveApp.getFilesByName("MSR_Deployment_Feedback_Logs");
  
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
  } else {
    spreadsheet = SpreadsheetApp.create("MSR_Deployment_Feedback_Logs");
    DriveApp.getFileById(spreadsheet.getId()).moveTo(DriveApp.getRootFolder());
  }
  
  return spreadsheet;
}

// --- Initialize sheet headers ---
function initializeSheet(sheet) {
  var headers = [
    "Timestamp",
    "Full Name",
    "Employer / Principal",
    "Country of Deployment",
    "Position / Job Title",
    "Assigned Recruiter",
    "Assigned Documentation Officer",
    "Recruitment Process",
    "Document Assistance",
    "Communication & Updates",
    "Recruiter Professionalism",
    "Processing Speed",
    "Overall Satisfaction"
  ];
  
  var firstRow = sheet.getRange(1, 1, 1, headers.length);
  firstRow.setValues([headers]);
  
  // Format header row
  firstRow.setFontWeight("bold");
  firstRow.setBackground("#0B5E50");
  firstRow.setFontColor("#ffffff");
  
  // Auto-fit columns
  for (var i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
  
  return sheet;
}

// --- Main handler ---
function doPost(e) {
  try {
    // Parse request data
    var data = JSON.parse(e.postData.contents);

    // Security Check: Verify API Key
    if (!data.api_key || data.api_key !== API_KEY) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Unauthorized: Invalid or missing API Key"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get or create spreadsheet
    var spreadsheet = getOrCreateSheet();
    var sheet = spreadsheet.getSheets()[0];
    
    // Initialize sheet if empty
    if (sheet.getLastRow() === 0) {
      sheet = initializeSheet(sheet);
    }
    
    // Prepare row data
    var timestamp = new Date().toLocaleString('en-PH', {
      dateStyle: 'full',
      timeStyle: 'medium'
    });
    
    var rowData = [
      timestamp,
      data.name || "—",
      data.employer || "—",
      data.country || "—",
      data.position || "—",
      data.recruiter || "—",
      data.doc_officer || "—",
      data.ratings[0] || 0,
      data.ratings[1] || 0,
      data.ratings[2] || 0,
      data.ratings[3] || 0,
      data.ratings[4] || 0,
      data.ratings[5] || 0
    ];
    
    // Append row to sheet
    sheet.appendRow(rowData);
    
    // Send emails
    sendEmails(data);
    
    // Return success
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Feedback submitted successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- Send emails ---
function sendEmails(data) {
  var starStr = function(n) {
    return '★'.repeat(n) + '☆'.repeat(5 - n) + ' (' + n + '/5)';
  };
  
  var aspects = [
    'Recruitment Process',
    'Document Assistance',
    'Communication & Updates',
    'Professionalism',
    'Processing Speed',
    'Overall Satisfaction'
  ];
  
  var ratingLines = aspects.map(function(a, i) { 
    return '  ' + a + ': ' + starStr(data.ratings[i] || 0);
  }).join('\n');
  
  var emailBody = "MEDICAL STAFFING RESOURCES, INC.\n" +
    "DEPLOYMENT FEEDBACK FORM\n" +
    "------------------------------------------------------\n\n" +
    "APPLICANT INFORMATION\n" +
    "  Full Name             : " + (data.name || "—") + "\n" +
    "  Date of Deployment   : " + (data.date || "—") + "\n" +
    "  Employer / Principal : " + (data.employer || "—") + "\n" +
    "  Country              : " + (data.country || "—") + "\n" +
    "  Assigned Recruiter   : " + (data.recruiter || "—") + "\n" +
    "  Position / Job Title : " + (data.position || "—") + "\n" +
    "  Documentation Officer: " + (data.doc_officer || "—") + "\n\n" +
    "SERVICE RATING\n" +
    ratingLines + "\n\n" +
    "APPLICANT TESTIMONIAL\n" +
    (data.testimonial || "—") + "\n\n" +
    "COMMENTS & SUGGESTIONS\n" +
    (data.comments || "—") + "\n\n" +
    "------------------------------------------------------\n" +
    "Submitted on: " + new Date().toLocaleString('en-PH', { dateStyle: 'full', timeStyle: 'medium' }) + "\n\n" +
    "This is a confidential deployment feedback submission from\n" +
    "Medical Staffing Resources, Inc. — Deployment Feedback Form.";
  
  var subject = "Deployment Feedback — " + (data.name || "Applicant") + " (" + (data.date || "N/A") + ")";
  
  try {
    GmailApp.sendEmail(EMAIL_RECIPIENT_1, subject, emailBody);
    Logger.log("Email sent to: " + EMAIL_RECIPIENT_1);
  } catch (e) {
    Logger.log("Failed to send to recipient 1: " + e.toString());
  }
  
  try {
    GmailApp.sendEmail(EMAIL_RECIPIENT_2, subject, emailBody);
    Logger.log("Email sent to: " + EMAIL_RECIPIENT_2);
  } catch (e) {
    Logger.log("Failed to send to recipient 2: " + e.toString());
  }
}

// --- Test function ---
function doTest() {
  var spreadsheet = getOrCreateSheet();
  var sheet = initializeSheet(spreadsheet.getSheets()[0]);
  Logger.log("Sheet initialized: " + spreadsheet.getUrl());
}
