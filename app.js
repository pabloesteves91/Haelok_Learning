// app.js
// Zentrale Logik: Dummy-Auth, i18n, Test-Engine, Feedback, Admin-View + Firebase-Integration.

import {
  initFirebase,
  saveResultToFirestore,
  saveFeedbackToFirestore
} from "./firebase.js";

// ------------------------
// Demo-Daten
// ------------------------

const TESTS = [
  {
    id: "safety-basics",
    category: "safety",
    title_de: "Sicherheitsgrundlagen",
    title_en: "Safety Basics",
    description_de: "Einführung in zentrale Sicherheitsregeln.",
    description_en: "Introduction to core safety rules.",
    requiredScorePercent: 90,
    learningSections: [
      {
        id: "s1",
        title_de: "Persönliche Schutzausrüstung",
        title_en: "Personal Protective Equipment",
        content_de: "Tragen Sie immer Ihre vorgeschriebene Schutzausrüstung.",
        content_en: "Always wear the required protective equipment."
      },
      {
        id: "s2",
        title_de: "Fluchtwege",
        title_en: "Escape Routes",
        content_de: "Fluchtwege sind jederzeit freizuhalten.",
        content_en: "Escape routes must remain unobstructed at all times."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "single",
        question_de: "Wann müssen Sie Ihre Schutzausrüstung tragen?",
        question_en: "When must you wear your protective equipment?",
        image: "",
        options_de: [
          "Nur bei Inspektionen",
          "Nur wenn der Vorgesetzte anwesend ist",
          "Immer, wenn Sie im Arbeitsbereich sind"
        ],
        options_en: [
          "Only during inspections",
          "Only when your supervisor is present",
          "Whenever you are in the work area"
        ],
        correctIndexes: [2]
      },
      {
        id: "q2",
        type: "single",
        question_de: "Wie müssen Fluchtwege beschaffen sein?",
        question_en: "How must escape routes be kept?",
        image: "",
        options_de: [
          "Sie dürfen vorübergehend zugestellt werden",
          "Sie müssen jederzeit frei sein",
          "Nur während der Arbeitszeit frei"
        ],
        options_en: [
          "They may be blocked temporarily",
          "They must be free at all times",
          "Only free during working hours"
        ],
        correctIndexes: [1]
      }
    ]
  },
  {
    id: "quality-intro",
    category: "quality",
    title_de: "Qualitätsgrundlagen",
    title_en: "Quality Essentials",
    description_de: "Basiswissen zu Qualitätssicherung und Dokumentation.",
    description_en: "Basic knowledge of quality assurance and documentation.",
    requiredScorePercent: 90,
    learningSections: [
      {
        id: "q1",
        title_de: "Dokumentation",
        title_en: "Documentation",
        content_de: "Jede Abweichung muss dokumentiert werden.",
        content_en: "Every deviation must be documented."
      }
    ],
    questions: [
      {
        id: "qq1",
        type: "single",
        question_de: "Was ist bei Qualitätsabweichungen zu tun?",
        question_en: "What must you do in case of a quality deviation?",
        image: "",
        options_de: [
          "Ignorieren, wenn sie klein ist",
          "Nur mündlich melden",
          "Dokumentieren und melden"
        ],
        options_en: [
          "Ignore if it is small",
          "Report verbally only",
          "Document and report"
        ],
        correctIndexes: [2]
      }
    ]
  }
];

const CATEGORY_LABELS = {
  safety: { de: "Sicherheit", en: "Safety" },
  quality: { de: "Qualität", en: "Quality" }
};

// ------------------------
// i18n
// ------------------------

const translations = {
  de: {
    logout: "Logout",
    auth_title: "Login / Registrierung",
    auth_subtitle: "Bitte melden Sie sich mit Ihrem Konto an oder registrieren Sie sich.",
    auth_email_label: "E-Mail",
    auth_name_label: "Name (für Registrierung)",
    auth_password_label: "Passwort (Demo; wird nur lokal simuliert)",
    auth_login_btn: "Einloggen",
    auth_register_btn: "Registrieren",
    auth_notice:
      "Hinweis: In dieser Demo werden Login und Registrierung nur lokal simuliert. In der finalen Version wird Firebase Authentication verwendet.",
    consent_title: "Datenschutz & Einwilligung",
    consent_intro: "Bitte lesen Sie die folgenden Hinweise und bestätigen Sie diese, um fortzufahren.",
    consent_dsgvo: "Ich habe die Datenschutzbestimmungen gelesen und verstanden.",
    consent_provider: "Ich stimme der Verarbeitung meiner Daten durch den externen Verifizierungsanbieter zu.",
    consent_terms: "Ich bestätige, dass ich die Nutzungsbedingungen gelesen habe.",
    consent_continue: "Einwilligungen speichern",
    verify_title: "Identitätsprüfung",
    verify_intro:
      "Für dieses Training ist eine Identitätsprüfung mit Gesichts- und Dokumentenverifikation erforderlich. In dieser Demo wird der Prozess nur simuliert.",
    verify_step1: "Start der Verifikation bei einem externen Anbieter (z. B. pxl-vision).",
    verify_step2: "Upload von Ausweisdokument und Selfie.",
    verify_step3: "Rückmeldung des Status an diese Anwendung.",
    verify_start_btn: "Verifikation jetzt simulieren",
    dashboard_tests_title: "Tests",
    dashboard_category_label: "Kategorie filtern",
    category_all: "Alle Kategorien",
    start_test_btn: "Test starten",
    overall_progress: "Gesamtfortschritt",
    back_to_dashboard: "Zurück",
    prev_question: "Zurück",
    next_question: "Weiter",
    feedback_title: "Feedback",
    feedback_intro: "Wie verständlich war dieser Test?",
    feedback_submit: "Feedback senden",
    dashboard_admin_btn: "Admin-Bereich",
    admin_title: "Admin-Dashboard",
    admin_close: "Schließen",
    admin_intro: "Diese Ansicht zeigt eine einfache Übersicht über Testergebnisse (in dieser Demo aus Local Storage).",
    admin_export_btn: "Ergebnisse als CSV exportieren",
    admin_col_user: "User",
    admin_col_test: "Test",
    admin_col_category: "Kategorie",
    admin_col_score: "Score",
    admin_col_passed: "Bestanden",
    admin_col_date: "Datum",
    admin_col_duration: "Dauer (s)"
  },
  en: {
    logout: "Logout",
    auth_title: "Login / Registration",
    auth_subtitle: "Please log in with your account or register.",
    auth_email_label: "Email",
    auth_name_label: "Name (for registration)",
    auth_password_label: "Password (demo only)",
    auth_login_btn: "Log in",
    auth_register_btn: "Register",
    auth_notice:
      "Note: In this demo, login and registration are simulated locally only. In production, Firebase Authentication should be used.",
    consent_title: "Privacy & Consent",
    consent_intro: "Please read the following information and confirm to continue.",
    consent_dsgvo: "I have read and understood the privacy policy.",
    consent_provider: "I consent to processing of my data by the external verification provider.",
    consent_terms: "I confirm that I have read the terms of use.",
    consent_continue: "Save consent",
    verify_title: "Identity Verification",
    verify_intro:
      "For this training, identity verification with face and document check is required. In this demo, the process is simulated only.",
    verify_step1: "Start verification with an external provider (e.g. pxl-vision).",
    verify_step2: "Upload ID document and selfie.",
    verify_step3: "Receive verification status in this application.",
    verify_start_btn: "Simulate verification now",
    dashboard_tests_title: "Tests",
    dashboard_category_label: "Filter by category",
    category_all: "All categories",
    start_test_btn: "Start test",
    overall_progress: "Overall progress",
    back_to_dashboard: "Back",
    prev_question: "Back",
    next_question: "Next",
    feedback_title: "Feedback",
    feedback_intro: "How clear was this test?",
    feedback_submit: "Submit feedback",
    dashboard_admin_btn: "Admin area",
    admin_title: "Admin dashboard",
    admin_close: "Close",
    admin_intro: "This view shows a simple summary of test results (from local storage in this demo).",
    admin_export_btn: "Export results as CSV",
    admin_col_user: "User",
    admin_col_test: "Test",
    admin_col_category: "Category",
    admin_col_score: "Score",
    admin_col_passed: "Passed",
    admin_col_date: "Date",
    admin_col_duration: "Duration (s)"
  }
};

let currentLanguage = "de";

function t(key) {
  return translations[currentLanguage]?.[key] || translations["de"][key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = t(key);
    if (text) el.textContent = text;
  });

  // Kategorie-Labels im Filter anpassen
  const catFilter = document.getElementById("category-filter");
  if (catFilter) {
    catFilter.querySelector("option[value='all']").textContent = t("category_all");
  }
}

// ------------------------
// State
// ------------------------

let currentUser = null; // {uid, name, email, role, verificationStatus, consentGiven}
let selectedTest = null;
let currentQuestionIndex = 0;
let currentAnswers = {};
let currentAttemptStartTime = null;
let selectedFeedbackScore = null;

// ------------------------
// Storage Helpers (Demo: Local Storage)
// ------------------------

const STORAGE_KEYS = {
  USER: "learning_demo_user",
  RESULTS: "learning_demo_results"
};

function loadUserFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveUserToStorage(user) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

function clearUserStorage() {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

function loadResultsFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveResultsToStorage(results) {
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
}

// ------------------------
// UI Helpers
// ------------------------

function showView(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function updateHeaderUserInfo() {
  const info = document.getElementById("user-info");
  const nameSpan = document.getElementById("user-name-display");
  if (currentUser) {
    info.classList.remove("hidden");
    nameSpan.textContent = currentUser.name || currentUser.email;
  } else {
    info.classList.add("hidden");
  }
}

function updateAdminLinkVisibility() {
  const wrapper = document.getElementById("admin-link-wrapper");
  if (!wrapper) return;
  if (currentUser && currentUser.role === "admin") {
    wrapper.classList.remove("hidden");
  } else {
    wrapper.classList.add("hidden");
  }
}

// ------------------------
// Auth / Onboarding Flow
// ------------------------

function handleLogin(isRegister) {
  const email = document.getElementById("auth-email").value.trim();
  const name = document.getElementById("auth-name").value.trim();
  const password = document.getElementById("auth-password").value.trim();

  if (!email) {
    alert("Bitte E-Mail eingeben.");
    return;
  }

  let user = loadUserFromStorage();
  if (!user || isRegister) {
    user = {
      uid: "demo-" + Math.random().toString(36).slice(2),
      email,
      name: name || email.split("@")[0],
      role: "user",
      verificationStatus: "pending",
      consentGiven: false,
      language: currentLanguage
    };
  } else {
    user.language = currentLanguage;
  }

  currentUser = user;
  saveUserToStorage(user);
  updateHeaderUserInfo();
  updateAdminLinkVisibility();

  // 🔥 NEU: In Firestore speichern
  saveUserToFirestore(user).catch((err) => {
    console.error("Fehler beim Speichern des Users in Firestore:", err);
  });

  if (!currentUser.consentGiven) {
    showView("view-consent");
  } else if (currentUser.verificationStatus !== "verified") {
    showView("view-verification");
  } else {
    showDashboard();
  }
}

function handleConsentSave() {
  const dsgvo = document.getElementById("consent-dsgvo").checked;
  const provider = document.getElementById("consent-provider").checked;
  const terms = document.getElementById("consent-terms").checked;

  if (!dsgvo || !provider || !terms) {
    alert("Bitte alle Checkboxen bestätigen, um fortzufahren.");
    return;
  }

  currentUser.consentGiven = true;
  saveUserToStorage(currentUser);

  if (currentUser.verificationStatus !== "verified") {
    showView("view-verification");
  } else {
    showDashboard();
  }
}

function handleVerificationSimulate() {
  const statusEl = document.getElementById("verification-status");
  statusEl.textContent =
    currentLanguage === "de"
      ? "Verifikation wird simuliert ..."
      : "Simulating verification ...";

  setTimeout(() => {
    currentUser.verificationStatus = "verified";
    saveUserToStorage(currentUser);
    statusEl.textContent =
      currentLanguage === "de"
        ? "Verifikation erfolgreich. Sie können jetzt mit den Tests beginnen."
        : "Verification successful. You can now start the tests.";
    setTimeout(showDashboard, 1000);
  }, 1200);
}

function showDashboard() {
  renderTestList();
  renderOverallProgress();
  selectedTest = null;
  renderLearning(null);
  showView("view-dashboard");
}

// ------------------------
// Tests & Learnings
// ------------------------

function getLocalizedTestTitle(test) {
  return currentLanguage === "en" ? test.title_en : test.title_de;
}

function getLocalizedTestDescription(test) {
  return currentLanguage === "en" ? test.description_en : test.description_de;
}

function getLocalizedCategoryLabel(category) {
  const obj = CATEGORY_LABELS[category];
  if (!obj) return category;
  return currentLanguage === "en" ? obj.en : obj.de;
}

function populateCategoryFilter() {
  const filter = document.getElementById("category-filter");
  if (!filter) return;

  const existing = new Set(["all"]);
  Array.from(filter.options).forEach((o) => existing.add(o.value));

  TESTS.forEach((t) => {
    if (!existing.has(t.category)) {
      const opt = document.createElement("option");
      opt.value = t.category;
      opt.textContent = getLocalizedCategoryLabel(t.category);
      filter.appendChild(opt);
    }
  });
}

function renderTestList() {
  const list = document.getElementById("test-list");
  const filter = document.getElementById("category-filter");
  if (!list || !filter) return;

  list.innerHTML = "";
  const categoryFilter = filter.value || "all";

  TESTS.forEach((test) => {
    if (categoryFilter !== "all" && test.category !== categoryFilter) return;

    const li = document.createElement("li");
    li.className = "test-list-item";
    li.dataset.testId = test.id;

    const cat = document.createElement("div");
    cat.className = "category";
    cat.textContent = getLocalizedCategoryLabel(test.category);
    li.appendChild(cat);

    const title = document.createElement("div");
    title.textContent = getLocalizedTestTitle(test);
    li.appendChild(title);

    const desc = document.createElement("div");
    desc.className = "muted tiny";
    desc.textContent = getLocalizedTestDescription(test);
    li.appendChild(desc);

    li.addEventListener("click", () => {
      document.querySelectorAll(".test-list-item").forEach((i) => i.classList.remove("active"));
      li.classList.add("active");
      selectedTest = test;
      renderLearning(test);
    });

    list.appendChild(li);
  });
}

function renderLearning(test) {
  const titleEl = document.getElementById("learning-title");
  const descEl = document.getElementById("learning-description");
  const contentEl = document.getElementById("learning-content");
  const startBtn = document.getElementById("start-test-btn");

  if (!test) {
    titleEl.textContent = currentLanguage === "en" ? "Welcome" : "Willkommen";
    descEl.textContent =
      currentLanguage === "en"
        ? "Select a test on the left to view the learning content."
        : "Wählen Sie links einen Test aus, um die Lerninhalte zu sehen.";
    contentEl.innerHTML = "";
    startBtn.disabled = true;
    return;
  }

  titleEl.textContent = getLocalizedTestTitle(test);
  descEl.textContent = getLocalizedTestDescription(test);
  contentEl.innerHTML = "";

  test.learningSections.forEach((sec) => {
    const secEl = document.createElement("div");
    secEl.style.marginBottom = "0.75rem";

    const h3 = document.createElement("h3");
    h3.textContent = currentLanguage === "en" ? sec.title_en : sec.title_de;
    secEl.appendChild(h3);

    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = currentLanguage === "en" ? sec.content_en : sec.content_de;
    secEl.appendChild(p);

    contentEl.appendChild(secEl);
  });

  // Test kann nur gestartet werden, wenn verifiziert + Consent
  const canStart = currentUser && currentUser.verificationStatus === "verified" && currentUser.consentGiven;
  startBtn.disabled = !canStart;
}

function startTest() {
  if (!selectedTest) return;
  currentQuestionIndex = 0;
  currentAnswers = {};
  selectedFeedbackScore = null;
  document.querySelectorAll(".feedback-btn").forEach((b) => b.classList.remove("active"));
  document.getElementById("feedback-comment").value = "";

  currentAttemptStartTime = Date.now();
  renderCurrentQuestion();
  showView("view-test");
}

function renderCurrentQuestion() {
  const container = document.getElementById("question-container");
  const resultBox = document.getElementById("test-result");
  const feedbackSection = document.getElementById("feedback-section");
  feedbackSection.classList.add("hidden");
  resultBox.classList.add("hidden");
  resultBox.innerHTML = "";

  const q = selectedTest.questions[currentQuestionIndex];
  if (!q) return;

  const title = currentLanguage === "en" ? q.question_en : q.question_de;
  const options = currentLanguage === "en" ? q.options_en : q.options_de;

  document.getElementById("test-title").textContent = getLocalizedTestTitle(selectedTest);

  container.innerHTML = "";

  const titleEl = document.createElement("div");
  titleEl.className = "question-title";
  titleEl.textContent = title;
  container.appendChild(titleEl);

  if (q.image) {
    const img = document.createElement("img");
    img.className = "question-image";
    img.src = q.image;
    img.alt = "";
    container.appendChild(img);
  }

  const list = document.createElement("ul");
  list.className = "answer-list";

  const prevAnswer = currentAnswers[q.id] || [];

  options.forEach((opt, idx) => {
    const li = document.createElement("li");
    li.className = "answer-item";

    const input = document.createElement("input");
    input.type = q.type === "multiple" ? "checkbox" : "radio";
    input.name = "answer";
    input.value = idx;
    if (prevAnswer.includes(idx)) input.checked = true;

    input.addEventListener("change", () => {
      if (q.type === "multiple") {
        const arr = currentAnswers[q.id] || [];
        if (input.checked) {
          if (!arr.includes(idx)) arr.push(idx);
        } else {
          const i = arr.indexOf(idx);
          if (i >= 0) arr.splice(i, 1);
        }
        currentAnswers[q.id] = arr;
      } else {
        currentAnswers[q.id] = [idx];
      }
    });

    const label = document.createElement("span");
    label.textContent = opt;

    li.appendChild(input);
    li.appendChild(label);
    list.appendChild(li);
  });

  container.appendChild(list);

  updateTestProgress();

  // Buttons
  document.getElementById("prev-question-btn").disabled = currentQuestionIndex === 0;
  document.getElementById("next-question-btn").textContent =
    currentQuestionIndex === selectedTest.questions.length - 1
      ? currentLanguage === "en"
        ? "Finish"
        : "Abschließen"
      : t("next_question");
}

function updateTestProgress() {
  const total = selectedTest.questions.length;
  const index = currentQuestionIndex + 1;
  const percent = Math.round((index / total) * 100);

  document.getElementById("question-progress-text").textContent = `${index}/${total}`;
  document.getElementById("question-progress-percent").textContent = `${percent}%`;
  document.getElementById("question-progress-fill").style.width = `${percent}%`;
}

function goPrevQuestion() {
  if (currentQuestionIndex <= 0) return;
  currentQuestionIndex--;
  renderCurrentQuestion();
}

function goNextQuestion() {
  const isLast = currentQuestionIndex === selectedTest.questions.length - 1;
  if (isLast) {
    finishTest();
  } else {
    currentQuestionIndex++;
    renderCurrentQuestion();
  }
}

function finishTest() {
  let score = 0;
  const total = selectedTest.questions.length;

  selectedTest.questions.forEach((q) => {
    const given = currentAnswers[q.id] || [];
    const correct = q.correctIndexes || [];

    if (given.length === 0) return;
    const sameLength = given.length === correct.length;
    const sameValues =
      sameLength && given.every((idx) => correct.includes(idx)) && correct.every((idx) => given.includes(idx));
    if (sameValues) score++;
  });

  const percent = Math.round((score / total) * 100);
  const passed = percent >= selectedTest.requiredScorePercent;
  const durationSeconds = Math.round((Date.now() - currentAttemptStartTime) / 1000);

  const resultBox = document.getElementById("test-result");
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = "";

  const p = document.createElement("p");
  p.innerHTML =
    (currentLanguage === "en" ? "Score: " : "Ergebnis: ") +
    `<strong>${percent}%</strong> (${score}/${total})`;
  resultBox.appendChild(p);

  const pass = document.createElement("p");
  pass.innerHTML = passed
    ? currentLanguage === "en"
      ? "<strong>Passed.</strong> You will receive access to the certificate link."
      : "<strong>Bestanden.</strong> Sie erhalten Zugang zum Zertifikatslink."
    : currentLanguage === "en"
    ? "<strong>Not passed.</strong> At least 90% are required."
    : "<strong>Nicht bestanden.</strong> Es sind mindestens 90% erforderlich.";
  resultBox.appendChild(pass);

  if (passed) {
    const link = document.createElement("a");
    link.href = "#";
    link.textContent =
      currentLanguage === "en"
        ? "Open certificate confirmation page (demo link)"
        : "Zertifikatsbestätigung öffnen (Demo-Link)";
    link.style.display = "inline-block";
    link.style.marginTop = "0.25rem";
    resultBox.appendChild(link);
  }

  const resultObj = {
    userId: currentUser.uid,
    userName: currentUser.name,
    testId: selectedTest.id,
    testTitle_de: selectedTest.title_de,
    testTitle_en: selectedTest.title_en,
    category: selectedTest.category,
    scorePercent: percent,
    passed,
    language: currentLanguage,
    startedAt: new Date(currentAttemptStartTime).toISOString(),
    finishedAt: new Date().toISOString(),
    durationSeconds
  };

  // Local Storage
  const results = loadResultsFromStorage();
  results.push(resultObj);
  saveResultsToStorage(results);

  // Firestore
  saveResultToFirestore(resultObj).catch((err) => {
    console.error("Fehler beim Speichern in Firestore:", err);
  });

  renderOverallProgress();

  // Feedback anzeigen
  const feedbackSection = document.getElementById("feedback-section");
  feedbackSection.classList.remove("hidden");
}

// ------------------------
// Overall Progress
// ------------------------

function renderOverallProgress() {
  const wrapper = document.getElementById("learning-progress-wrapper");
  const textEl = document.getElementById("overall-progress-text");
  const fill = document.getElementById("overall-progress-fill");
  if (!wrapper) return;

  const results = loadResultsFromStorage().filter((r) => r.userId === (currentUser && currentUser.uid));
  if (results.length === 0) {
    wrapper.classList.remove("hidden");
    textEl.textContent = "0%";
    fill.style.width = "0%";
    return;
  }

  const passedTests = new Set(results.filter((r) => r.passed).map((r) => r.testId));
  const percent = Math.round((passedTests.size / TESTS.length) * 100);

  wrapper.classList.remove("hidden");
  textEl.textContent = `${percent}%`;
  fill.style.width = `${percent}%`;
}

// ------------------------
// Feedback
// ------------------------

function handleFeedbackButtonClick(score) {
  selectedFeedbackScore = score;
  document.querySelectorAll(".feedback-btn").forEach((b) => {
    const val = parseInt(b.dataset.score, 10);
    if (val === score) b.classList.add("active");
    else b.classList.remove("active");
  });
}

function handleFeedbackSubmit() {
  if (!selectedFeedbackScore) {
    alert(currentLanguage === "en" ? "Please select a rating." : "Bitte eine Bewertung auswählen.");
    return;
  }
  const comment = document.getElementById("feedback-comment").value.trim();

  const feedback = {
    userId: currentUser.uid,
    userName: currentUser.name,
    testId: selectedTest.id,
    score: selectedFeedbackScore,
    comment,
    language: currentLanguage,
    createdAt: new Date().toISOString()
  };

  console.log("Feedback (Demo):", feedback);

  // Firestore
  saveFeedbackToFirestore(feedback).catch((err) => {
    console.error("Fehler beim Feedback-Speichern in Firestore:", err);
  });

  alert(currentLanguage === "en" ? "Thank you for your feedback!" : "Vielen Dank für Ihr Feedback!");
}

// ------------------------
// Admin View
// ------------------------

function openAdminView() {
  renderAdminResults();
  showView("view-admin");
}

function renderAdminResults() {
  const tbody = document.getElementById("admin-results-body");
  tbody.innerHTML = "";

  const results = loadResultsFromStorage();

  results.forEach((r) => {
    const tr = document.createElement("tr");

    const tdUser = document.createElement("td");
    tdUser.textContent = r.userName || r.userId;
    tr.appendChild(tdUser);

    const tdTest = document.createElement("td");
    tdTest.textContent = currentLanguage === "en" ? r.testTitle_en : r.testTitle_de;
    tr.appendChild(tdTest);

    const tdCat = document.createElement("td");
    tdCat.textContent = getLocalizedCategoryLabel(r.category);
    tr.appendChild(tdCat);

    const tdScore = document.createElement("td");
    tdScore.textContent = `${r.scorePercent}%`;
    tr.appendChild(tdScore);

    const tdPassed = document.createElement("td");
    tdPassed.textContent = r.passed ? "✓" : "✗";
    tr.appendChild(tdPassed);

    const tdDate = document.createElement("td");
    tdDate.textContent = new Date(r.finishedAt).toLocaleString();
    tr.appendChild(tdDate);

    const tdDur = document.createElement("td");
    tdDur.textContent = r.durationSeconds;
    tr.appendChild(tdDur);

    tbody.appendChild(tr);
  });
}

function exportResultsAsCSV() {
  const results = loadResultsFromStorage();
  if (results.length === 0) {
    alert(currentLanguage === "en" ? "No results to export." : "Keine Ergebnisse zum Exportieren.");
    return;
  }

  const header = [
    "userId",
    "userName",
    "testId",
    "category",
    "scorePercent",
    "passed",
    "language",
    "startedAt",
    "finishedAt",
    "durationSeconds"
  ];
  const rows = [header.join(",")];

  results.forEach((r) => {
    const row = header
      .map((h) => {
        const v = r[h];
        if (typeof v === "string") {
          return `"${v.replace(/"/g, '""')}"`;
        }
        return v;
      })
      .join(",");
    rows.push(row);
  });

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "results.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ------------------------
// Language Handling
// ------------------------

function handleLanguageChange(lang) {
  currentLanguage = lang;
  if (currentUser) {
    currentUser.language = lang;
    saveUserToStorage(currentUser);
  }

  applyTranslations();
  populateCategoryFilter();
  renderTestList();
  if (selectedTest) renderLearning(selectedTest);
}

// ------------------------
// Init
// ------------------------

function init() {
  // Existing user?
  currentUser = loadUserFromStorage();
  if (currentUser && currentUser.language) {
    currentLanguage = currentUser.language;
  }

  // Wire events
  document.getElementById("login-btn").addEventListener("click", () => handleLogin(false));
  document.getElementById("register-btn").addEventListener("click", () => handleLogin(true));
  document.getElementById("consent-continue-btn").addEventListener("click", handleConsentSave);
  document.getElementById("start-verification-btn").addEventListener("click", handleVerificationSimulate);

  document.getElementById("start-test-btn").addEventListener("click", startTest);
  document.getElementById("back-to-dashboard-btn").addEventListener("click", showDashboard);
  document.getElementById("prev-question-btn").addEventListener("click", goPrevQuestion);
  document.getElementById("next-question-btn").addEventListener("click", goNextQuestion);

  document.querySelectorAll(".feedback-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleFeedbackButtonClick(parseInt(btn.dataset.score, 10)));
  });
  document.getElementById("submit-feedback-btn").addEventListener("click", handleFeedbackSubmit);

  document.getElementById("category-filter").addEventListener("change", renderTestList);
  document.getElementById("logout-btn").addEventListener("click", () => {
    clearUserStorage();
    currentUser = null;
    updateHeaderUserInfo();
    updateAdminLinkVisibility();
    showView("view-auth");
  });

  document.getElementById("open-admin-btn").addEventListener("click", openAdminView);
  document.getElementById("close-admin-btn").addEventListener("click", showDashboard);
  document.getElementById("export-results-btn").addEventListener("click", exportResultsAsCSV);

  document.getElementById("language-select").addEventListener("change", (e) => {
    handleLanguageChange(e.target.value);
  });

  // Initial language select value
  document.getElementById("language-select").value = currentLanguage;

  applyTranslations();
  populateCategoryFilter();
  updateHeaderUserInfo();
  updateAdminLinkVisibility();

  // Flow je nach User-Status
  if (!currentUser) {
    showView("view-auth");
  } else if (!currentUser.consentGiven) {
    showView("view-consent");
  } else if (currentUser.verificationStatus !== "verified") {
    showView("view-verification");
  } else {
    showDashboard();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    initFirebase();
  } catch (e) {
    console.error("Firebase-Init Fehler:", e);
  }
  init();
});
