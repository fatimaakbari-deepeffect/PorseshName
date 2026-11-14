// ============================================================
// Google Apps Script — دریافت پاسخ‌های پرسش‌نامه و ذخیره در Google Sheets
// نحوه استفاده:
// 1) یک Google Sheet جدید بسازید.
// 2) Extensions > Apps Script را باز کنید.
// 3) این کد را جایگزین کد پیش‌فرض کنید.
// 4) Deploy > New deployment > Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 5) URL دریافتی را در config.js قرار دهید.
// ============================================================

const SHEET_NAME = "Responses";
const ACCESS_CODE = ""; // در صورت نیاز، کد دسترسی را اینجا تنظیم کنید

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return jsonOut({ status: "error", message: "سرور مشغول است، دوباره تلاش کنید." });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ status: "error", message: "بدنه درخواست خالی است." });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonOut({ status: "error", message: "فرمت JSON نامعتبر است." });
    }

    // اعتبارسنجی دسترسی اختیاری
    if (ACCESS_CODE && data.accessCode !== ACCESS_CODE) {
      return jsonOut({ status: "error", message: "کد دسترسی نامعتبر است." });
    }

    if (!data.responseId || typeof data.responseId !== "string") {
      return jsonOut({ status: "error", message: "شناسه پاسخ (responseId) الزامی است." });
    }
    if (!data.answers || typeof data.answers !== "object") {
      return jsonOut({ status: "error", message: "پاسخ‌ها (answers) الزامی هستند." });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // خواندن هدر موجود
    let headers = [];
    if (sheet.getLastRow() >= 1) {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      headers = headers.map(function (h) { return String(h).trim(); }).filter(function (h) { return h !== ""; });
    }

    // اگر شیت خالی است، هدر اولیه بساز
    if (headers.length === 0) {
      headers = ["ResponseID", "Timestamp"];
      Object.keys(data.answers).forEach(function (k) {
        if (headers.indexOf(k) === -1) headers.push(k);
      });
      sheet.appendRow(headers);
    } else {
      // افزودن ستون‌های جدید در صورت وجود سؤال جدید
      let changed = false;
      Object.keys(data.answers).forEach(function (k) {
        if (headers.indexOf(k) === -1) {
          headers.push(k);
          changed = true;
        }
      });
      if (changed) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
    }

    // بررسی تکراری بودن responseId
    const idCol = headers.indexOf("ResponseID");
    if (idCol >= 0 && sheet.getLastRow() > 1) {
      const ids = sheet.getRange(2, idCol + 1, sheet.getLastRow() - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === String(data.responseId)) {
          lock.releaseLock();
          return jsonOut({ status: "duplicate", message: "این پاسخ قبلاً ثبت شده است." });
        }
      }
    }

    // ساخت ردیف
    const row = headers.map(function (h) {
      if (h === "ResponseID") return data.responseId;
      if (h === "Timestamp") return data.timestamp || new Date().toISOString();
      const v = data.answers[h];
      if (v === undefined || v === null) return "";
      if (Array.isArray(v)) return v.join("; ");
      return v;
    });

    sheet.appendRow(row);

    // فرمت‌دهی ساده: bold هدر
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");

    lock.releaseLock();
    return jsonOut({ status: "success", responseId: data.responseId });
  } catch (err) {
    try { lock.releaseLock(); } catch (e) {}
    return jsonOut({ status: "error", message: String(err) });
  }
}

function doGet(e) {
  return jsonOut({ status: "ok", message: "Web App فعال است." });
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// تابع کمکی اختیاری: ایجاد هدرهای پیش‌فرض (در صورت نیاز دستی)
function setupHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  const headers = ["ResponseID", "Timestamp"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
}