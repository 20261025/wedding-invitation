const RSVP_SHEET_NAME = 'RSVP';
const RSVP_HEADERS = [
  '응답 시각',
  '성함',
  '참석 여부',
  '참석 인원',
  '식사 여부',
  '전하고 싶은 말',
  '청첩장 주소',
];

function doGet() {
  return json_({ ok: true, message: 'Wedding RSVP endpoint is running.' });
}

function doPost(e) {
  const data = parseRequest_(e);
  const name = text_(data.name, 80);
  const attendance = text_(data.attendance, 10);

  if (!name || !['참석', '불참'].includes(attendance)) {
    return json_({ ok: false, message: 'Invalid RSVP data.' });
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(RSVP_SHEET_NAME)
      || spreadsheet.insertSheet(RSVP_SHEET_NAME);
    ensureHeaders_(sheet);

    sheet.appendRow([
      new Date(),
      name,
      attendance,
      attendance === '참석' ? text_(data.guests, 20) : '',
      attendance === '참석' ? text_(data.meal, 40) : '',
      text_(data.message, 1000),
      text_(data.pageUrl, 500),
    ]);

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, message: 'Could not save RSVP data.' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function parseRequest_(e) {
  const raw = e && e.postData && e.postData.contents;
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(RSVP_HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, RSVP_HEADERS.length).setFontWeight('bold');
}

function text_(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
