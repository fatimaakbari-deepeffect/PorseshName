// ============================================================
// questions.js — تعریف ساختار سؤالات پرسش‌نامه
// برای افزودن سؤال/گزینه جدید، فقط این فایل را ویرایش کنید.
// منطق اصلی برنامه (script.js) به این فایل وابسته نیست.
// ============================================================

// گزینه‌های مقیاس Likert (۱ تا ۵)
const LIKERT_LABELS = [
  "کاملاً مخالفم",
  "مخالفم",
  "نظری ندارم",
  "موافقم",
  "کاملاً موافقم"
];

// ------------------------------------------------------------
// بخش‌ها (هر بخش یک مرحله در فرایند پاسخ‌گویی است)
// ------------------------------------------------------------
const SECTIONS = [
  {
    id: "demographics",
    title: "بخش اول: اطلاعات عمومی",
    description: "لطفاً به سؤالات زیر پاسخ دهید.",
    questionIds: [
      "q_age", "q_gender", "q_personality", "q_marital", "q_military",
      "q_student", "q_study_location", "q_degree", "q_major",
      "q_social", "q_daily_time", "q_freq_psych"
    ]
  },
  {
    id: "section2",
    title: "بخش دوم: همذات‌پنداری با محتوای روان‌شناختی",
    description: "در این بخش، میزان شباهت و ارتباطی که هنگام مشاهده محتوای روان‌شناختی با تجربه‌ها و ویژگی‌های خود احساس می‌کنید، بررسی می‌شود. برای هر عبارت یکی از گزینه‌ها را انتخاب کنید.",
    questionIds: [
      "s2_1","s2_2","s2_3","s2_4","s2_5","s2_6","s2_7","s2_8"
    ]
  },
  {
    id: "section3",
    title: "بخش سوم: خودبرچسب‌زنی روان‌شناختی",
    description: "در این بخش بررسی می‌شود که تا چه اندازه پس از مشاهده محتوای روان‌شناختی، عنوان‌ها یا ویژگی‌های مطرح‌شده را به خودتان نسبت می‌دهید.",
    questionIds: [
      "s3_1","s3_2","s3_3","s3_4","s3_5","s3_6","s3_7","s3_8"
    ]
  },
  {
    id: "section4",
    title: "بخش چهارم: تفکر نقادانه در مواجهه با محتوای روان‌شناختی",
    description: "در این بخش میزان بررسی، ارزیابی و تحلیل شما پیش از پذیرفتن مطالب روان‌شناختی شبکه‌های اجتماعی سنجیده می‌شود.",
    questionIds: [
      "s4_1","s4_2","s4_3","s4_4","s4_5","s4_6","s4_7","s4_8"
    ]
  }
];

// ------------------------------------------------------------
// تعریف سؤالات
// type: single | multi | short | long | likert
// condition: تابع (answers) => boolean (اختیاری)
// hasOther: در صورت true و انتخاب "سایر موارد"، فیلد متنی نمایش داده می‌شود
// ------------------------------------------------------------
const QUESTIONS = [

  // ---------- بخش اول: اطلاعات عمومی ----------
  {
    id: "q_age",
    section: "demographics",
    type: "single",
    required: true,
    text: "۱. سن شما چقدر است؟",
    options: ["۱۸ تا ۲۰ سال", "۲۱ تا ۲۳ سال", "۲۴ تا ۲۵ سال", "خارج از این محدوده"]
  },
  {
    id: "q_gender",
    section: "demographics",
    type: "single",
    required: true,
    text: "۴. جنسیت:",
    options: ["زن", "مرد", "ترجیح می‌دهم پاسخ ندهم"]
  },
  {
    id: "q_personality",
    section: "demographics",
    type: "single",
    required: true,
    text: "درونگرا هستید یا برونگرا؟",
    options: ["درونگرا", "برونگرا", "نمی‌دانم"]
  },
  {
    id: "q_marital",
    section: "demographics",
    type: "single",
    required: true,
    text: "وضعیت تأهل؟",
    options: ["مجرد", "متاهل"]
  },
  {
    id: "q_military",
    section: "demographics",
    type: "single",
    required: true,
    text: "اگر آقا هستید، سربازی را به پایان رساندید؟",
    options: ["بله", "خیر"],
    condition: (a) => a.q_gender === "مرد"
  },
  {
    id: "q_student",
    section: "demographics",
    type: "single",
    required: true,
    text: "۲. آیا در حال حاضر دانشجو هستید؟",
    options: ["بله", "خیر"]
  },
  {
    id: "q_study_location",
    section: "demographics",
    type: "single",
    required: true,
    text: "۳. محل تحصیل شما کجاست؟",
    options: ["دانشگاه‌های داخل شهر", "دانشگاه‌های خارج از شهر"],
    condition: (a) => a.q_student === "بله"
  },
  {
    id: "q_degree",
    section: "demographics",
    type: "single",
    required: true,
    text: "مقطع تحصیلی:",
    options: ["کاردانی", "کارشناسی", "کارشناسی ارشد", "دکتری"],
    condition: (a) => a.q_student === "بله"
  },
  {
    id: "q_major",
    section: "demographics",
    type: "short",
    required: true,
    text: "۶. رشته تحصیلی شما چیست؟",
    placeholder: "رشته تحصیلی خود را وارد کنید",
    condition: (a) => a.q_student === "بله"
  },
  {
    id: "q_social",
    section: "demographics",
    type: "single",
    required: true,
    text: "۷. بیشتر از کدام شبکه اجتماعی استفاده می‌کنید؟",
    options: ["اینستاگرام", "تلگرام", "یوتیوب", "تیک‌تاک", "سایر موارد"],
    hasOther: true
  },
  {
    id: "q_daily_time",
    section: "demographics",
    type: "single",
    required: true,
    text: "۸. روزانه به‌طور میانگین چقدر از وقت خود را در شبکه‌های اجتماعی می‌گذرانید؟",
    options: ["کمتر از یک ساعت", "۱ تا ۲ ساعت", "۲ تا ۴ ساعت", "بیش از ۴ ساعت"]
  },
  {
    id: "q_freq_psych",
    section: "demographics",
    type: "single",
    required: true,
    text: "۹. هر چند وقت یک‌بار با محتوای روان‌شناختی در شبکه‌های اجتماعی مواجه می‌شوید؟",
    options: ["هرگز", "به‌ندرت", "گاهی", "اغلب", "تقریباً هر روز"]
  },

  // ---------- بخش دوم: همذات‌پنداری ----------
  { id: "s2_1", section: "section2", type: "likert", required: true, text: "۱. وقتی محتوای روان‌شناختی را می‌بینم، گاهی احساس می‌کنم تجربه‌های شخصی من را توصیف می‌کند." },
  { id: "s2_2", section: "section2", type: "likert", required: true, text: "۲. هنگام مشاهده این محتواها، شباهت‌هایی میان خودم و مثال‌های مطرح‌شده پیدا می‌کنم." },
  { id: "s2_3", section: "section2", type: "likert", required: true, text: "۳. بعضی مطالب روان‌شناختی باعث می‌شوند رفتارها و ویژگی‌های خودم را بهتر بررسی کنم." },
  { id: "s2_4", section: "section2", type: "likert", required: true, text: "۴. وقتی محتوایی تجربه‌ای شبیه تجربه من را توضیح می‌دهد، توجه بیشتری به آن نشان می‌دهم." },
  { id: "s2_5", section: "section2", type: "likert", required: true, text: "۵. گاهی احساس می‌کنم تولیدکننده یک محتوای روان‌شناختی شرایط و احساسات من را به‌خوبی درک کرده است." },
  { id: "s2_6", section: "section2", type: "likert", required: true, text: "۶. محتواهایی که با تجربه‌های شخصی من هماهنگی دارند، بیشتر در ذهنم باقی می‌مانند." },
  { id: "s2_7", section: "section2", type: "likert", required: true, text: "۷. هنگام دیدن محتوای روان‌شناختی، خودم را در موقعیت یا مثال مطرح‌شده تصور می‌کنم." },
  { id: "s2_8", section: "section2", type: "likert", required: true, text: "۸. معمولاً به‌راحتی می‌توانم تشخیص دهم که یک محتوای روان‌شناختی واقعاً با شرایط من مطابقت دارد یا فقط شباهت ظاهری دارد." },

  // ---------- بخش سوم: خودبرچسب‌زنی ----------
  { id: "s3_1", section: "section3", type: "likert", required: true, text: "۱. پس از دیدن برخی محتواهای روان‌شناختی، عنوان یا ویژگی مطرح‌شده را درباره خودم به کار برده‌ام." },
  { id: "s3_2", section: "section3", type: "likert", required: true, text: "۲. گاهی یک محتوای روان‌شناختی باعث شده رفتارهای گذشته‌ام را با یک عنوان روان‌شناختی توضیح بدهم." },
  { id: "s3_3", section: "section3", type: "likert", required: true, text: "۳. پیش آمده است که پس از مشاهده یک محتوا، خودم را دارای یک الگوی روان‌شناختی خاص بدانم." },
  { id: "s3_4", section: "section3", type: "likert", required: true, text: "۴. گاهی بر اساس مطالب شبکه‌های اجتماعی، درباره ویژگی‌های روان‌شناختی خودم به نتیجه رسیده‌ام." },
  { id: "s3_5", section: "section3", type: "likert", required: true, text: "۵. اگر ویژگی‌های مطرح‌شده در یک محتوای روان‌شناختی را در خودم ببینم، ممکن است عنوان آن را به خودم نسبت بدهم." },
  { id: "s3_6", section: "section3", type: "likert", required: true, text: "۶. پیش آمده است که برای توضیح رفتارها یا احساساتم از برچسب‌های روان‌شناختی استفاده کنم." },
  { id: "s3_7", section: "section3", type: "likert", required: true, text: "۷. پیش از پذیرفتن یک عنوان روان‌شناختی درباره خودم، معمولاً درباره آن اطلاعات بیشتری بررسی می‌کنم." },
  { id: "s3_8", section: "section3", type: "likert", required: true, text: "۸. حتی اگر احساس کنم یک توصیف روان‌شناختی شبیه شرایط من است، لزوماً آن را ویژگی قطعی خودم نمی‌دانم." },

  // ---------- بخش چهارم: تفکر نقادانه ----------
  { id: "s4_1", section: "section4", type: "likert", required: true, text: "۱. پیش از پذیرفتن یک ادعای روان‌شناختی در شبکه‌های اجتماعی، درباره اعتبار منبع آن فکر می‌کنم." },
  { id: "s4_2", section: "section4", type: "likert", required: true, text: "۲. اگر یک محتوا ادعای قطعی مطرح کند، به دنبال شواهد و دلایل پشتیبان آن می‌گردم." },
  { id: "s4_3", section: "section4", type: "likert", required: true, text: "۳. می‌دانم که یک تجربه یا نشانه به‌تنهایی برای نتیجه‌گیری درباره وضعیت روان‌شناختی کافی نیست." },
  { id: "s4_4", section: "section4", type: "likert", required: true, text: "۴. معمولاً احتمال می‌دهم که یک محتوای کوتاه، موضوع پیچیده‌ای را بیش از حد ساده کرده باشد." },
  { id: "s4_5", section: "section4", type: "likert", required: true, text: "۵. اگر اطلاعات جدیدی برخلاف برداشت اولیه‌ام پیدا کنم، حاضرم نظرم را تغییر دهم." },
  { id: "s4_6", section: "section4", type: "likert", required: true, text: "۶. می‌توانم بین تجربه شخصی تولیدکننده محتوا و اطلاعات مبتنی بر شواهد علمی تفاوت قائل شوم." },
  { id: "s4_7", section: "section4", type: "likert", required: true, text: "۷. صرفاً به دلیل تعداد بازدید، پسند یا نظرات موافق، یک ادعای روان‌شناختی را درست نمی‌دانم." },
  { id: "s4_8", section: "section4", type: "likert", required: true, text: "۸. هنگام ارزیابی یک مطلب روان‌شناختی، دیدگاه‌ها و توضیحات متفاوت را نیز در نظر می‌گیرم." }
];

// راهنمای سریع: برای افزودن سؤال جدید:
// 1) یک شیء جدید به QUESTIONS اضافه کنید (id یکتا).
// 2) id را به SECTIONS[...].questionIds اضافه کنید.
// 3) در صورت نیاز condition/hasOther را تنظیم کنید.
// 4) ستون متناظر در Google Sheet به‌صورت خودکار ایجاد می‌شود.
window.QUESTIONS = QUESTIONS;
window.SECTIONS = SECTIONS;
window.LIKERT_LABELS = LIKERT_LABELS;