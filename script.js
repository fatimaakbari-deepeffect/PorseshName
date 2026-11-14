// ============================================================
// script.js — منطق اصلی پرسش‌نامه
// وابسته به: config.js, questions.js
// ============================================================

(function () {
  "use strict";

  // ------------------------- state -------------------------
  const state = {
    step: 0,            // 0: landing, 1..N: sections, N+1: review, N+2: success
    answers: {},
    submitting: false,
    submittedId: null,
    errors: {}
  };

  const STEPS = []; // built after load

  // ------------------------- helpers -------------------------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(CONFIG.DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.answers) {
        state.step = typeof parsed.step === "number" ? parsed.step : state.step;
        return parsed.answers;
      }
      return parsed;
    } catch (e) { return null; }
  }
  function saveDraft() {
    try { localStorage.setItem(CONFIG.DRAFT_KEY, JSON.stringify({ answers: state.answers, step: state.step })); } catch (e) {}
  }
  function clearDraft() {
    try { localStorage.removeItem(CONFIG.DRAFT_KEY); } catch (e) {}
  }
  function isSubmitted() {
    try { return !!localStorage.getItem(CONFIG.SUBMITTED_KEY); } catch (e) { return false; }
  }
  function markSubmitted(id) {
    try { localStorage.setItem(CONFIG.SUBMITTED_KEY, id); } catch (e) {}
  }

  function uid() {
    return "resp_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  function visibleQuestions() {
    return QUESTIONS.filter(q => !q.condition || q.condition(state.answers));
  }

  function questionById(id) { return QUESTIONS.find(q => q.id === id); }
  function sectionById(id) { return SECTIONS.find(s => s.id === id); }

  function stepSections() { return SECTIONS; }

  // ------------------------- validation -------------------------
  function validateSection(section) {
    const errs = {};
    let ok = true;
    section.questionIds.forEach(qid => {
      const q = questionById(qid);
      if (!q) return;
      if (q.condition && !q.condition(state.answers)) return; // not visible
      if (!q.required) return;
      const v = state.answers[q.id];
      let valid = true;
      if (q.type === "multi") {
        valid = Array.isArray(v) && v.length > 0;
      } else if (q.type === "short" || q.type === "long") {
        valid = typeof v === "string" && v.trim().length > 0;
      } else {
        valid = v !== undefined && v !== null && v !== "";
      }
      // other text requirement
      if (valid && q.hasOther && v === "سایر موارد") {
        const ot = state.answers[q.id + "__other"];
        if (!ot || !String(ot).trim()) valid = false;
      }
      if (!valid) { errs[q.id] = true; ok = false; }
    });
    state.errors = Object.assign({}, state.errors, errs);
    // clear errors for valid
    Object.keys(state.errors).forEach(k => { if (!errs[k]) delete state.errors[k]; });
    return ok;
  }

  // ------------------------- rendering -------------------------
  const app = document.getElementById("app");

  function render() {
    const header = document.querySelector(".site-header");
    if (header) header.style.display = state.step === 0 ? "" : "none";

    if (state.step === 0) return renderLanding();
    if (state.step <= SECTIONS.length) return renderSectionStep(state.step - 1);
    if (state.step === SECTIONS.length + 1) return renderReview();
    if (state.step === SECTIONS.length + 2) return renderSuccess();
    renderLanding();
  }

  function renderLanding() {
    const submitted = isSubmitted();
    app.innerHTML = `
      <div class="container">
        <!-- HERO -->
        <section class="hero reveal">
          <div class="hero-top-badge">
            <span class="hero-badge">
              <span class="badge-dot"></span>
              پژوهش دانشگاهی
            </span>
          </div>
          <div class="hero-grid">
            <div class="hero-text">
              <h1 class="hero-title">پرسش‌نامه پژوهشی</h1>
              <p class="hero-research-title">${CONFIG.SURVEY_TITLE}</p>
              <p class="hero-lead">
                پاسخ‌دهنده گرامی، این پرسش‌نامه با هدف بررسی تأثیر همذات‌پنداری با محتوای روان‌شناختی منتشرشده در شبکه‌های اجتماعی بر خودبرچسب‌زنی روان‌شناختی و نقش تفکر نقادانه در این رابطه طراحی شده است.
              </p>
              <div class="hero-actions">
                <button class="btn btn-primary btn-lg" id="startBtn" ${submitted ? "disabled" : ""}>
                  <span>${submitted ? "قبلاً ثبت شده است" : "شروع پرسش‌نامه"}</span>
                  <span class="btn-arrow">←</span>
                </button>
                ${submitted ? '<button class="btn btn-ghost btn-lg" id="resetBtn">ثبت پاسخ جدید</button>' : '<a class="btn btn-ghost btn-lg" href="#info">اطلاعات بیشتر</a>'}
              </div>
              <div class="hero-trust">
                <div class="trust-item"><span class="trust-icon">⏱️</span><span>حدود ${CONFIG.ESTIMATED_MINUTES} دقیقه</span></div>
                <div class="trust-item"><span class="trust-icon">🔒</span><span>بدون نام و هویت</span></div>
                <div class="trust-item"><span class="trust-icon">✅</span><span>کاملاً داوطلبانه</span></div>
              </div>
            </div>
            <div class="hero-visual reveal" style="animation-delay:.15s">
              <div class="float-chip chip-1">
                <span class="chip-icon">🧠</span>
                <div>
                  <strong>تفکر نقادانه</strong>
                  <small>نقش تعدیل‌گر</small>
                </div>
              </div>
              <div class="float-chip chip-2">
                <span class="chip-icon">📊</span>
                <div>
                  <strong>۲۴ عبارت</strong>
                  <small>Likert ۱ تا ۵</small>
                </div>
              </div>
              <div class="float-chip chip-3">
                <span class="chip-icon">🎯</span>
                <div>
                  <strong>دانشجویان</strong>
                  <small>۱۸ تا ۲۵ سال</small>
                </div>
              </div>
              <div class="visual-card">
                <div class="img-slot img-slot-hero">
                  <img src="1.png" alt="پرسش‌نامه پژوهشی" onerror="this.remove()" />
                  <span class="img-slot-label">تصویر Hero (توسط شما اضافه می‌شود)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- INFO -->
        <div id="info" class="info-grid">
          <div class="info-card reveal">
            <div class="icon">⏱️</div>
            <h3>مدت تکمیل</h3>
            <p>حدود ${CONFIG.ESTIMATED_MINUTES} دقیقه وقت شما را می‌گیرد.</p>
          </div>
          <div class="info-card reveal" style="animation-delay:.08s">
            <div class="icon">🔒</div>
            <h3>حریم خصوصی</h3>
            <p>پاسخ‌ها بدون نام و مشخصات هویتی بررسی می‌شوند.</p>
          </div>
          <div class="info-card reveal" style="animation-delay:.16s">
            <div class="icon">📋</div>
            <h3>ساختار</h3>
            <p>اطلاعات عمومی + سه بخش پژوهشی (هر کدام ۸ عبارت)</p>
          </div>
          <div class="info-card reveal" style="animation-delay:.24s">
            <div class="icon">✅</div>
            <h3>داوطلبانه</h3>
            <p>شرکت در این پژوهش کاملاً داوطلبانه است.</p>
          </div>
        </div>

        <!-- HYPOTHESES -->
        <div class="card reveal" style="margin-top:10px;">
          <div class="section-head">
            <h2>فرضیه‌های پژوهش</h2>
          </div>
          <ol class="hyp-list">
            <li><span class="hyp-num">۱</span>بین همذات‌پنداری با محتوای روان‌شناختی شبکه‌های اجتماعی و خودبرچسب‌زنی روان‌شناختی رابطه مثبت وجود دارد.</li>
            <li><span class="hyp-num">۲</span>بین تفکر نقادانه و خودبرچسب‌زنی روان‌شناختی رابطه منفی وجود دارد.</li>
            <li><span class="hyp-num">۳</span>تفکر نقادانه رابطه بین همذات‌پنداری با محتوای روان‌شناختی و خودبرچسب‌زنی روان‌شناختی را تعدیل می‌کند؛ به‌گونه‌ای که با افزایش تفکر نقادانه، شدت رابطه مثبت کاهش می‌یابد.</li>
          </ol>
        </div>

        <!-- ABOUT -->
        <div class="card reveal" style="margin-top:22px;">
          <div class="about-grid">
            <div class="about-text">
              <div class="section-head">
                <h2>درباره پژوهش</h2>
              </div>
              <p>
                منظور از محتوای روان‌شناختی، مطالبی درباره اضطراب، سبک‌های دلبستگی، شخصیت، طرحواره‌ها، عزت‌نفس، روابط عاطفی و سایر موضوعات مرتبط با روان‌شناسی است. این پرسش‌نامه ابزار تشخیص اختلالات روان‌شناختی نیست.
              </p>
              <p style="margin-top:12px;">
                <strong>نحوه پاسخ‌گویی:</strong> در بخش‌های ۲ تا ۴، برای هر عبارت یکی از گزینه‌های «کاملاً مخالفم» تا «کاملاً موافقم» را انتخاب کنید. امکان بازگشت و اصلاح پاسخ‌ها وجود دارد.
              </p>
            </div>
            <div class="about-visual">
              <div class="img-slot img-slot-about">
                <img src="2.jpeg" alt="درباره پژوهش" onerror="this.remove()" />
                <span class="img-slot-label">تصویر جانبی (توسط شما)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card reveal" style="margin-top:22px;">
          <div class="section-head">
            <h2>همذات‌پنداری و همزادپنداری</h2>
          </div>
          <div class="note-box" style="margin-top:0;">
            <h3>همذات‌پنداری (Identification)</h3>
            <p>یعنی فرد خودش را از نظر احساسات، افکار، تجربه‌ها یا شرایط با شخص دیگری نزدیک و مشابه بداند و بتواند خودش را جای او تصور کند.</p>
            <p class="note-example"><strong>مثال:</strong> فردی در شبکه‌های اجتماعی ویدئویی از شخصی می‌بیند که درباره اضطراب صحبت می‌کند. چون احساس می‌کند تجربه‌های آن شخص شبیه تجربه‌های خودش است، با او همذات‌پنداری می‌کند.</p>
            <h3 style="margin-top:14px;">همزادپنداری</h3>
            <p>همزادپنداری بیشتر به تصور یا احساس داشتن یک همزاد یا مشابه اشاره دارد؛ یعنی فرد شخص دیگری را مانند همزاد خود یا نسخه‌ای مشابه از خود تصور می‌کند.</p>
          </div>
        </div>
      </div>
    `;
    const btn = $("#startBtn");
    if (btn) btn.addEventListener("click", () => { state.step = 1; saveDraft(); render(); window.scrollTo(0,0); });
    const reset = $("#resetBtn");
    if (reset) reset.addEventListener("click", () => {
      try { localStorage.removeItem(CONFIG.SUBMITTED_KEY); } catch(e){}
      state.submittedId = null;
      render();
    });
    // adjust hero padding to header height + 20px
    requestAnimationFrame(() => {
      const header = document.querySelector(".site-header");
      const hero = document.querySelector(".hero");
      if (header && hero) {
        hero.style.paddingTop = (header.offsetHeight + 30) + "px";
      }
      setupReveal();
      setupParallax();
    });
  }

  function renderSectionStep(idx) {
    const section = SECTIONS[idx];
    if (!section) { state.step = 0; render(); return; }
    const qs = section.questionIds.map(id => questionById(id)).filter(q => !q.condition || q.condition(state.answers));

    app.innerHTML = `
      ${renderProgress()}
      <div class="container">
        <div class="top-back-row">
          <button class="btn btn-ghost btn-sm" id="backHomeTopBtn">← بازگشت به صفحه اصلی</button>
        </div>
        <div class="card section-card">
          <div class="section-head">
            <h2>${section.title}</h2>
            <p>${section.description}</p>
          </div>
          <div class="q-list">
            ${qs.map(q => renderQuestion(q)).join("")}
          </div>
          <div class="nav-row">
            <button class="btn btn-ghost" id="backBtn">${idx === 0 ? "بازگشت به صفحه اصلی" : "مرحله قبل"}</button>
            <button class="btn btn-primary" id="nextBtn">${idx === SECTIONS.length - 1 ? "بررسی پاسخ‌ها" : "مرحله بعد"}</button>
          </div>
        </div>
      </div>
    `;

    bindSectionEvents(section);
    updateProgress();
  }

  function renderQuestion(q) {
    const invalid = state.errors[q.id];
    const req = q.required ? '<span class="req">*</span>' : "";
    let body = "";

    if (q.type === "single") {
      const opts = q.options.map(opt => {
        const sel = state.answers[q.id] === opt ? "selected" : "";
        return `
          <label class="option ${sel}">
            <input type="radio" name="${q.id}" value="${escapeHtml(opt)}" ${state.answers[q.id] === opt ? "checked" : ""} />
            <span>${escapeHtml(opt)}</span>
          </label>`;
      }).join("");
      body = `<div class="options">${opts}</div>`;
      if (q.hasOther && state.answers[q.id] === "سایر موارد") {
        body += `<input class="input other-input" type="text" placeholder="لطفاً مورد خود را بنویسید" data-other="${q.id}" value="${escapeAttr(state.answers[q.id + "__other"] || "")}" />`;
      }
    } else if (q.type === "multi") {
      const opts = q.options.map(opt => {
        const checked = Array.isArray(state.answers[q.id]) && state.answers[q.id].includes(opt);
        return `
          <label class="option ${checked ? "selected" : ""}">
            <input type="checkbox" name="${q.id}" value="${escapeHtml(opt)}" ${checked ? "checked" : ""} />
            <span>${escapeHtml(opt)}</span>
          </label>`;
      }).join("");
      body = `<div class="options">${opts}</div>`;
    } else if (q.type === "short") {
      body = `<input class="input" type="text" name="${q.id}" placeholder="${escapeAttr(q.placeholder || "")}" value="${escapeAttr(state.answers[q.id] || "")}" />`;
    } else if (q.type === "long") {
      body = `<textarea class="textarea" name="${q.id}" placeholder="${escapeAttr(q.placeholder || "")}">${escapeHtml(state.answers[q.id] || "")}</textarea>`;
    } else if (q.type === "likert") {
      const val = state.answers[q.id];
      body = `<div class="likert">
        ${LIKERT_LABELS.map((label, i) => {
          const n = i + 1;
          return `
            <label class="likert-option">
              <input type="radio" name="${q.id}" value="${n}" ${val == n ? "checked" : ""} />
              <span class="num">${n}</span>
              <small>${label}</small>
            </label>`;
        }).join("")}
      </div>`;
    }

    return `
      <div class="question ${invalid ? "invalid" : ""}" data-qid="${q.id}">
        <div class="q-text">${escapeHtml(q.text)}${req}</div>
        ${body}
      </div>`;
  }

  function bindSectionEvents(section) {
    // radio single
    $all('input[type="radio"]').forEach(inp => {
      inp.addEventListener("change", (e) => {
        const name = e.target.name;
        const q = questionById(name);
        if (!q) return;
        setAnswer(name, e.target.value);
        // re-render to update conditional questions and "other" input
        render();
      });
    });
    // checkbox multi
    $all('input[type="checkbox"]').forEach(inp => {
      inp.addEventListener("change", (e) => {
        const name = e.target.name;
        const q = questionById(name);
        if (!q) return;
        const current = Array.isArray(state.answers[name]) ? [...state.answers[name]] : [];
        if (e.target.checked) {
          if (!current.includes(e.target.value)) current.push(e.target.value);
        } else {
          const i = current.indexOf(e.target.value); if (i > -1) current.splice(i, 1);
        }
        setAnswer(name, current);
        render();
      });
    });
    // text inputs
    $all('input[type="text"], textarea').forEach(inp => {
      if (inp.dataset && inp.dataset.other) return;
      const name = inp.name || inp.getAttribute("name");
      if (!name) return;
      inp.addEventListener("input", (e) => {
        setAnswer(name, e.target.value);
      });
    });
    // other inputs
    $all('[data-other]').forEach(inp => {
      inp.addEventListener("input", (e) => {
        setAnswer(inp.dataset.other + "__other", e.target.value);
      });
    });

    const backBtn = $("#backBtn");
    if (backBtn) backBtn.addEventListener("click", () => {
      if (state.step === 1) { state.step = 0; }
      else { state.step -= 1; }
      state.errors = {};
      saveDraft();
      render(); window.scrollTo(0,0);
    });

    const topBack = $("#backHomeTopBtn");
    if (topBack) topBack.addEventListener("click", () => {
      state.step = 0; saveDraft(); render(); window.scrollTo(0,0);
    });

    const nextBtn = $("#nextBtn");
    if (nextBtn) nextBtn.addEventListener("click", () => {
      const sec = SECTIONS[state.step - 1];
      if (!validateSection(sec)) {
        render(); // re-render to show invalid
        const firstInvalid = document.querySelector(".question.invalid");
        if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("لطفاً به سؤالات اجباری پاسخ دهید.", "error");
        return;
      }
      state.errors = {};
      if (state.step === SECTIONS.length) {
        state.step = SECTIONS.length + 1; // review
      } else {
        state.step += 1;
      }
      saveDraft();
      render(); window.scrollTo(0,0);
    });
  }

  function setAnswer(qid, value) {
    state.answers[qid] = value;
    // clear answers for questions whose condition now false
    QUESTIONS.forEach(q => {
      if (q.condition && !q.condition(state.answers)) {
        delete state.answers[q.id];
        delete state.answers[q.id + "__other"];
      }
    });
    saveDraft();
    updateProgress();
  }

  function renderProgress() {
    return `
      <div class="progress-wrap">
        <div class="container">
          <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
          <div class="progress-meta">
            <span id="progressText">0%</span>
            <span>پیشرفت پاسخ‌گویی</span>
          </div>
        </div>
      </div>`;
  }

  function updateProgress() {
    const fill = document.getElementById("progressFill");
    const text = document.getElementById("progressText");
    if (!fill) return;
    const vs = visibleQuestions();
    const total = vs.length;
    let answered = 0;
    vs.forEach(q => {
      const v = state.answers[q.id];
      let ok = false;
      if (q.type === "multi") ok = Array.isArray(v) && v.length > 0;
      else if (q.type === "short" || q.type === "long") ok = typeof v === "string" && v.trim().length > 0;
      else ok = v !== undefined && v !== null && v !== "";
      if (ok) answered++;
    });
    const pct = total ? Math.round((answered / total) * 100) : 0;
    fill.style.width = pct + "%";
    if (text) text.textContent = pct + "%";
  }

  function renderReview() {
    app.innerHTML = `
      ${renderProgress()}
      <div class="container">
        <div class="top-back-row">
          <button class="btn btn-ghost btn-sm" id="backHomeTopBtn">← بازگشت به صفحه اصلی</button>
        </div>
        <div class="card">
          <div class="section-head">
            <h2>بررسی پاسخ‌ها</h2>
            <p>پاسخ‌های خود را بررسی کنید. در صورت نیاز می‌توانید به مراحل قبل بازگردید.</p>
          </div>
          <div class="review-list">
            ${visibleQuestions().map(q => {
              const v = state.answers[q.id];
              let display = "";
              if (Array.isArray(v)) display = v.join("، ");
              else if (v === undefined || v === null || v === "") display = "—";
              else display = String(v);
              if (q.hasOther && state.answers[q.id] === "سایر موارد" && state.answers[q.id + "__other"]) {
                display += " (" + state.answers[q.id + "__other"] + ")";
              }
              return `
                <div class="review-item">
                  <div class="r-q">${escapeHtml(q.text)}</div>
                  <div class="r-a">${escapeHtml(display)}</div>
                </div>`;
            }).join("")}
          </div>
          <p class="review-note">پس از ثبت نهایی، امکان ویرایش پاسخ‌ها وجود نخواهد داشت.</p>
          <div class="nav-row">
            <button class="btn btn-ghost" id="backBtn">مرحله قبل</button>
            <button class="btn btn-primary" id="submitBtn" ${state.submitting ? "disabled" : ""}>
              ${state.submitting ? "در حال ثبت…" : "ثبت نهایی پاسخ‌ها"}
            </button>
          </div>
        </div>
      </div>
    `;
    updateProgress();
    $("#backBtn").addEventListener("click", () => { state.step = SECTIONS.length; state.errors = {}; saveDraft(); render(); window.scrollTo(0,0); });
    const topBack = $("#backHomeTopBtn");
    if (topBack) topBack.addEventListener("click", () => { state.step = 0; saveDraft(); render(); window.scrollTo(0,0); });
    $("#submitBtn").addEventListener("click", submitAnswers);
  }

  function renderSuccess() {
    app.innerHTML = `
      <div class="container">
        <div class="card success-box">
          <div class="success-icon">✓</div>
          <h2>پاسخ شما با موفقیت ثبت شد</h2>
          <p>از مشارکت شما در این پژوهش سپاسگزاریم. پاسخ‌های شما ذخیره شدند.</p>
          ${state.submittedId ? `<p style="margin-top:12px; font-size:0.8rem; color:var(--text-light);">شناسه پاسخ: ${state.submittedId}</p>` : ""}
        </div>
      </div>
    `;
  }

  // ------------------------- submit -------------------------
  async function submitAnswers() {
    if (state.submitting) return;
    if (isSubmitted()) {
      showToast("پاسخ شما قبلاً ثبت شده است.", "error");
      return;
    }
    // final validation
    let allOk = true;
    SECTIONS.forEach(sec => {
      // temporarily validate
      const prevErrors = state.errors;
      state.errors = {};
      const ok = validateSection(sec);
      if (!ok) allOk = false;
      state.errors = Object.assign({}, state.errors, prevErrors);
    });
    if (!allOk) {
      showToast("برخی سؤالات اجباری بدون پاسخ مانده‌اند.", "error");
      return;
    }

    state.submitting = true;
    render();

    const responseId = uid();
    const payload = {
      responseId: responseId,
      timestamp: new Date().toISOString(),
      accessCode: CONFIG.ACCESS_CODE || "",
      answers: buildAnswersPayload()
    };

    try {
      await sendToServer(payload);
      state.submittedId = responseId;
      markSubmitted(responseId);
      clearDraft();
      state.submitting = false;
      state.step = SECTIONS.length + 2;
      render();
      window.scrollTo(0,0);
    } catch (err) {
      state.submitting = false;
      render();
      showToast("ثبت پاسخ با خطا مواجه شد. لطفاً دوباره تلاش کنید. (پیش‌نویس شما حفظ شده است)", "error");
      console.error(err);
    }
  }

  function buildAnswersPayload() {
    const out = {};
    visibleQuestions().forEach(q => {
      let v = state.answers[q.id];
      if (q.type === "likert" && v !== undefined) v = Number(v);
      out[q.id] = (v === undefined ? "" : v);
      if (q.hasOther) {
        out[q.id + "__other"] = state.answers[q.id + "__other"] || "";
      }
    });
    return out;
  }

  function sendToServer(payload) {
    return new Promise((resolve, reject) => {
      if (!CONFIG.WEB_APP_URL || CONFIG.WEB_APP_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
        // demo mode: simulate success
        setTimeout(resolve, 800);
        return;
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      fetch(CONFIG.WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).then(() => {
        clearTimeout(timer);
        resolve();
      }).catch(err => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  // ------------------------- toast -------------------------
  function showToast(msg, type) {
    const t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 3200);
  }

  // ------------------------- escape -------------------------
  function escapeHtml(str) {
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  function escapeAttr(str) {
    return String(str).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }

  // ------------------------- reveal on scroll -------------------------
  function setupReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(e => e.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  // ------------------------- parallax orbs -------------------------
  function setupParallax() {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      document.documentElement.style.setProperty("--px", x.toFixed(3));
      document.documentElement.style.setProperty("--py", y.toFixed(3));
    });
    hero.addEventListener("mouseleave", () => {
      document.documentElement.style.setProperty("--px", "0");
      document.documentElement.style.setProperty("--py", "0");
    });
  }

  // ------------------------- init -------------------------
  function init() {
    const d = loadDraft();
    if (d && typeof d === "object") state.answers = d;

    render();
    updateProgress();
    setupParallax();
    window.addEventListener("resize", () => {
      const header = document.querySelector(".site-header");
      const hero = document.querySelector(".hero");
      if (header && hero) hero.style.paddingTop = (header.offsetHeight + 30) + "px";
    });

    // Premium loader: hide after 5 seconds
    const loader = document.getElementById("premiumLoader");
    const appEl = document.getElementById("app");
    if (loader) {
      setTimeout(() => {
        loader.classList.add("hidden");
        setTimeout(() => {
          loader.remove();
          if (appEl) appEl.classList.add("is-ready");
        }, 900);
      }, 5000);
    } else if (appEl) {
      appEl.classList.add("is-ready");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();