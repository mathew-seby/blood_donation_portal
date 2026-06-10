/**
 * Abhayam — Google Apps Script Backend
 *
 * SETUP:
 * 1. Create a Google Sheet with two tabs: "Donors" and "Requests"
 * 2. Donors headers (row 1): Timestamp | Name | Phone | Age | Gender | Blood Group | Address | Eligible
 * 3. Requests headers (row 1): Timestamp | Blood Group | Contact Name | Contact Phone
 * 4. Paste this script into Apps Script (Extensions → Apps Script)
 * 5. Set SPREADSHEET_ID and ADMIN_EMAIL below
 * 6. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone
 * 7. Copy the web app URL into apiService.js (WEB_APP_URL)
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const ADMIN_EMAIL = 'nss.blood@bharatamatacollege.edu.in';

const DONORS_SHEET = 'Donors';
const REQUESTS_SHEET = 'Requests';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'registerDonor') {
      return jsonResponse(handleRegisterDonor(body));
    }
    if (action === 'submitRequest') {
      return jsonResponse(handleSubmitRequest(body));
    }

    return jsonResponse({ success: false, message: 'Unknown action.' });
  } catch (err) {
    return jsonResponse({ success: false, message: err.message || 'Server error.' });
  }
}

function doGet() {
  return jsonResponse({ success: true, message: 'Abhayam API is running.' });
}

function handleRegisterDonor(data) {
  validateDonor(data);

  const sheet = getSheet(DONORS_SHEET);
  const timestamp = new Date();

  sheet.appendRow([
    timestamp,
    data.name,
    data.phone,
    data.age,
    data.gender,
    data.bloodGroup,
    data.address,
    data.eligible ? 'Yes' : 'No',
  ]);

  sendEmail(
    'New Donor Registration — ' + data.bloodGroup,
    buildDonorEmailBody(data, timestamp)
  );

  return { success: true, message: 'Donor registered successfully.' };
}

function handleSubmitRequest(data) {
  validateRequest(data);

  const sheet = getSheet(REQUESTS_SHEET);
  const timestamp = new Date();

  sheet.appendRow([
    timestamp,
    data.bloodGroup,
    data.contactName,
    data.contactPhone,
  ]);

  sendEmail(
    '🚨 URGENT Blood Request — ' + data.bloodGroup,
    buildRequestEmailBody(data, timestamp)
  );

  return { success: true, message: 'Blood request submitted successfully.' };
}

function validateDonor(data) {
  if (!data.name || !data.phone || !data.age || !data.gender || !data.bloodGroup || !data.address) {
    throw new Error('All fields are required.');
  }
  if (!/^[6-9]\d{9}$/.test(String(data.phone))) {
    throw new Error('Invalid phone number.');
  }
  const age = Number(data.age);
  if (age < 18 || age > 65) {
    throw new Error('Age must be between 18 and 65.');
  }
}

function validateRequest(data) {
  if (!data.bloodGroup || !data.contactName || !data.contactPhone) {
    throw new Error('All fields are required.');
  }
  if (!/^[6-9]\d{9}$/.test(String(data.contactPhone))) {
    throw new Error('Invalid phone number.');
  }
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === DONORS_SHEET) {
      sheet.appendRow(['Timestamp', 'Name', 'Phone', 'Age', 'Gender', 'Blood Group', 'Address', 'Eligible']);
    } else if (name === REQUESTS_SHEET) {
      sheet.appendRow(['Timestamp', 'Blood Group', 'Contact Name', 'Contact Phone']);
    }
  }
  return sheet;
}

function sendEmail(subject, body) {
  if (!ADMIN_EMAIL) return;
  try {
    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
  } catch (e) {
    Logger.log('Email failed: ' + e.message);
  }
}

function buildDonorEmailBody(data, timestamp) {
  return [
    'New donor registration on Abhayam portal:',
    '',
    'Name: ' + data.name,
    'Phone: ' + data.phone,
    'Age: ' + data.age,
    'Gender: ' + data.gender,
    'Blood Group: ' + data.bloodGroup,
    'Address: ' + data.address,
    'Eligible: ' + (data.eligible ? 'Yes' : 'No'),
    'Submitted: ' + timestamp,
  ].join('\n');
}

function buildRequestEmailBody(data, timestamp) {
  return [
    'URGENT blood request on Abhayam portal:',
    '',
    'Blood Group Needed: ' + data.bloodGroup,
    'Contact Person: ' + data.contactName,
    'Contact Phone: ' + data.contactPhone,
    'Submitted: ' + timestamp,
    '',
    'Please respond immediately.',
  ].join('\n');
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
