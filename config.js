// ============================================================
// config.js — تنظیمات پروژه
// پس از انتشار Google Apps Script، آدرس Web App را در
// WEB_APP_URL قرار دهید.
// ============================================================
const CONFIG = {
  // آدرس Web App گوگل (بعد از Deploy دریافت می‌شود)
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzqLey3NWHb6t99G57-KmCEMpRpwlSYLoQJU33T5p1bWQJT_cTwZ2mdYiADwRD7GknH/exec",

  // کد دسترسی اختیاری (در صورت تنظیم در Apps Script)
  ACCESS_CODE: "",

  // کلید ذخیره پیش‌نویس در مرورگر
  DRAFT_KEY: "psych_survey_draft_v1",

  // کلید ثبت موفق در مرورگر (جلوگیری از ارسال تکراری)
  SUBMITTED_KEY: "psych_survey_submitted_v1",

  // عنوان پرسش‌نامه
  SURVEY_TITLE: "نقش تعدیل‌گر تفکر نقادانه در رابطه بین همذات‌پنداری با محتوای روان‌شناختی شبکه‌های اجتماعی و خودبرچسب‌زنی روان‌شناختی در دانشجویان",

  // تخمین مدت تکمیل (دقیقه)
  ESTIMATED_MINUTES: "۱۰"
};

window.CONFIG = CONFIG;