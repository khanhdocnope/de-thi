import { CONFIG } from './config.js';
import { getQueryParam, isValidSubject, isValidBoDe } from './router.js';
import { removeAccents, debounce, formatDate, convertGoogleDriveLink } from './utils.js';

// Elements
const examsListView = document.getElementById("exams-list-view");
const errorView = document.getElementById("error-view");
const breadcrumb = document.getElementById("breadcrumb");
const themeToggleBtn = document.getElementById("theme-toggle");

const boDeTitleEl = document.getElementById("bo-de-title");
const boDeDescEl = document.getElementById("bo-de-desc");
const examsCountEl = document.getElementById("exams-count");
const examsContainer = document.getElementById("exams-container");

// Filter elements
const examSearchInput = document.getElementById("exam-search");
const filterYearSelect = document.getElementById("filter-year");
const filterSchoolSelect = document.getElementById("filter-school");
const filterAnswersCheck = document.getElementById("filter-answers");
const btnResetFilters = document.getElementById("btn-reset-filters");

// State
let subjects = [];
let boDeList = [];
let deThiList = [];
let filteredDeThi = [];

let activeMonSlug = "";
let activeBoDeId = "";

let currentSearch = "";
let currentYearFilter = "All";
let currentSchoolFilter = "All";
let currentAnswersFilter = false;

let thumbnailObserver = null;

// Set worker url
pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.pdfWorkerSrc;

async function init() {
  setupTheme();
  
  activeMonSlug = getQueryParam("mon");
  activeBoDeId = getQueryParam("bo-de");

  try {
    // Load JSON databases
    const subjectsRes = await fetch("data/subjects.json");
    subjects = await subjectsRes.json();

    const boDeRes = await fetch("data/bo-de.json");
    boDeList = await boDeRes.json();

    // Validate parameters
    const subjectValid = isValidSubject(activeMonSlug, subjects);
    const boDeValid = isValidBoDe(activeBoDeId, activeMonSlug, boDeList);

    if (!subjectValid || !boDeValid) {
      showError("Không tìm thấy bộ đề", "Tham số môn học hoặc bộ đề không hợp lệ. Vui lòng quay lại trang chủ.");
      return;
    }

    const deThiRes = await fetch("data/de-thi.json");
    deThiList = await deThiRes.json();

    // Find active metadata
    const activeSubject = subjects.find(s => s.slug === activeMonSlug);
    const activeBoDe = boDeList.find(b => b.id === activeBoDeId);

    // Setup Breadcrumb
    breadcrumb.innerHTML = `
      <a href="./" class="breadcrumb-item">Trang chủ</a>
      <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
      <a href="./?mon=${activeMonSlug}" class="breadcrumb-item">${activeSubject.name}</a>
      <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
      <span class="breadcrumb-item active">${activeBoDe.name}</span>
    `;

    boDeTitleEl.textContent = activeBoDe.name;
    boDeDescEl.textContent = activeBoDe.description;

    // Filter documents of this boDe
    filteredDeThi = deThiList.filter(d => d.boDe === activeBoDeId && d.mon === activeMonSlug);

    // Setup Filter Event Listeners
    setupFilterListeners();
    
    // Render list
    renderExams();
  } catch (err) {
    console.error("Error loading exams: ", err);
    showError("Lỗi hệ thống", "Không thể nạp dữ liệu đề thi. Vui lòng tải lại trang.");
  }
}

function setupFilterListeners() {
  examSearchInput.addEventListener("input", debounce((e) => {
    currentSearch = e.target.value;
    renderExams();
  }, 200));

  filterYearSelect.addEventListener("change", (e) => {
    currentYearFilter = e.target.value;
    renderExams();
  });

  filterSchoolSelect.addEventListener("change", (e) => {
    currentSchoolFilter = e.target.value;
    renderExams();
  });

  filterAnswersCheck.addEventListener("change", (e) => {
    currentAnswersFilter = e.target.checked;
    renderExams();
  });

  btnResetFilters.addEventListener("click", () => {
    examSearchInput.value = "";
    filterYearSelect.value = "All";
    filterSchoolSelect.value = "All";
    filterAnswersCheck.checked = false;

    currentSearch = "";
    currentYearFilter = "All";
    currentSchoolFilter = "All";
    currentAnswersFilter = false;

    renderExams();
  });
}

function renderExams() {
  examsContainer.innerHTML = "";
  initThumbnailObserver();

  // Apply filters
  const displayDocs = filteredDeThi.filter(doc => {
    // Search filter
    if (currentSearch) {
      const searchNorm = removeAccents(currentSearch);
      const titleNorm = removeAccents(doc.title);
      const schoolNorm = removeAccents(doc.school || "");
      const tagsNorm = doc.tags.map(t => removeAccents(t)).join(" ");
      
      const match = titleNorm.includes(searchNorm) || schoolNorm.includes(searchNorm) || tagsNorm.includes(searchNorm);
      if (!match) return false;
    }

    // Year filter
    if (currentYearFilter !== "All") {
      if (String(doc.year) !== currentYearFilter) return false;
    }

    // School / publisher filter
    if (currentSchoolFilter !== "All") {
      const tagsNorm = doc.tags.map(t => removeAccents(t)).join(" ");
      const schoolNorm = removeAccents(doc.school || "");
      const matchWord = removeAccents(currentSchoolFilter);
      
      const match = schoolNorm.includes(matchWord) || tagsNorm.includes(matchWord);
      if (!match) return false;
    }

    // Answers filter
    if (currentAnswersFilter) {
      if (!doc.hasAnswerKey) return false;
    }

    return true;
  });

  examsCountEl.textContent = displayDocs.length;

  if (displayDocs.length === 0) {
    examsContainer.innerHTML = `
      <div class="empty-state-card w-full">
        <i data-lucide="search-x" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;"></i>
        <p>Không tìm thấy đề thi phù hợp với bộ lọc hiện tại.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  displayDocs.forEach(doc => {
    const card = document.createElement("div");
    card.className = "exam-card";
    
    // Find publisher tag
    const publisherTag = doc.tags.find(tag => 
        tag.includes("Cánh Diều") || 
        tag.includes("Chân Trời Sáng Tạo") || 
        tag.includes("Kết Nối Tri Thức") || 
        tag.includes("Chương trình mới")
    ) || "Lớp 12";

    const formattedDate = formatDate(doc.uploadedAt);

    card.innerHTML = `
      <div class="card-cover">
        <canvas class="pdf-cover-canvas" data-pdf-url="${doc.pdfUrl}"></canvas>
        <div class="cover-loader">
          <div class="spinner"></div>
          <span>Đang tải bìa...</span>
        </div>
        <div class="card-overlay">
          <button class="view-btn">
            <i data-lucide="eye"></i> Xem đề thi
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-meta-row">
          <span class="year-badge">${doc.year}</span>
          <span class="ans-badge ${doc.hasAnswerKey ? 'has-ans' : 'no-ans'}">
            ${doc.hasAnswerKey ? 'Có đáp án' : 'Đang cập nhật đáp án'}
          </span>
        </div>
        <h4 class="card-title" title="${doc.title}">${doc.title}</h4>
        <div class="card-school-info">
          <i data-lucide="school"></i>
          <span>${doc.school || "Sở GD&ĐT"}</span>
        </div>
        <div class="card-footer">
          <span class="upload-date">${formattedDate}</span>
          <a href="${doc.pdfUrl}" download="${doc.title}.pdf" class="download-icon-btn" title="Tải xuống nhanh file PDF">
            <i data-lucide="download"></i>
          </a>
        </div>
      </div>
    `;

    // View button click
    card.querySelector(".view-btn").addEventListener("click", () => {
      window.location.href = `viewer.html?id=${doc.id}`;
    });

    // Lazy load canvas
    const canvas = card.querySelector(".pdf-cover-canvas");
    thumbnailObserver.observe(canvas);

    examsContainer.appendChild(card);
  });

  lucide.createIcons();
}

function initThumbnailObserver() {
  if (thumbnailObserver) {
    thumbnailObserver.disconnect();
  }
  
  thumbnailObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const canvas = entry.target;
        let pdfUrl = canvas.getAttribute("data-pdf-url");
        if (pdfUrl) {
          if (CONFIG.autoConvertGoogleDriveLink) {
            pdfUrl = convertGoogleDriveLink(pdfUrl);
          }
          if (CONFIG.useCorsProxy) {
            pdfUrl = CONFIG.corsProxyUrl + encodeURIComponent(pdfUrl);
          }
          renderPdfThumbnail(canvas, pdfUrl);
        }
        observer.unobserve(canvas);
      }
    });
  }, { rootMargin: "150px" });
}

async function renderPdfThumbnail(canvas, url) {
  const container = canvas.parentElement;
  const loader = container.querySelector(".cover-loader");
  
  try {
    const loadingTask = pdfjsLib.getDocument({
      url: url,
      rangeChunkSize: CONFIG.streamChunkSize,
      disableAutoFetch: true,
      disableStream: true
    });
    
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    
    const viewport = page.getViewport({ scale: 1.0 });
    const canvasWidth = 240;
    const scale = canvasWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale: scale });
    
    const outputScale = window.devicePixelRatio || 1;
    canvas.width = scaledViewport.width * outputScale;
    canvas.height = scaledViewport.height * outputScale;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    
    const ctx = canvas.getContext("2d");
    ctx.scale(outputScale, outputScale);
    
    const renderContext = {
      canvasContext: ctx,
      viewport: scaledViewport
    };
    
    await page.render(renderContext).promise;
    
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 200);
    }
    canvas.style.opacity = "1";
    
    pdf.destroy();
  } catch (err) {
    console.warn("Failed to render PDF cover thumbnail:", err);
    if (loader) {
      loader.innerHTML = `
        <i data-lucide="file-text" style="width: 32px; height: 32px; color: var(--text-muted); opacity: 0.6;"></i>
        <span style="font-size: 0.7rem; margin-top: 4px;">Xem PDF</span>
      `;
      lucide.createIcons({ attrs: { class: "lucide-icon" } });
    }
  }
}

function showError(title, message) {
  examsListView.style.display = "none";
  errorView.style.display = "flex";
  breadcrumb.style.display = "none";

  document.getElementById("error-title-text").textContent = title;
  document.getElementById("error-desc-text").textContent = message;
  
  lucide.createIcons();
}

function setupTheme() {
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  
  themeToggleBtn.addEventListener("click", () => {
    const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  });
}

document.addEventListener("DOMContentLoaded", init);
