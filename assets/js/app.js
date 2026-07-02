import { getQueryParam, isValidSubject } from './router.js';
import { removeAccents, debounce } from './utils.js';

// Elements
const subjectView = document.getElementById("subject-list-view");
const bodeView = document.getElementById("bode-list-view");
const errorView = document.getElementById("error-view");
const breadcrumb = document.getElementById("breadcrumb");
const themeToggleBtn = document.getElementById("theme-toggle");

// Mode B elements
const bodeSubjectTitle = document.getElementById("bode-subject-title");
const bodeSubjectDesc = document.getElementById("bode-subject-desc");
const bodeSubjectIcon = document.getElementById("bode-subject-icon");
const bodeSubjectCount = document.getElementById("bode-subject-count");
const bodeContainer = document.getElementById("bode-container");
const bodeSearchInput = document.getElementById("bode-search");

// State
let subjects = [];
let boDeList = [];
let activeMonSlug = "";
let currentBodeSearch = "";

async function init() {
  setupTheme();
  
  try {
    // Load data from JSON files
    const subjectsRes = await fetch("data/subjects.json");
    subjects = await subjectsRes.json();

    const boDeRes = await fetch("data/bo-de.json");
    boDeList = await boDeRes.json();
    
    // Check router
    activeMonSlug = getQueryParam("mon");

    if (!activeMonSlug) {
      showModeA();
    } else if (isValidSubject(activeMonSlug, subjects)) {
      showModeB();
    } else {
      showError("Môn học không tồn tại", "Đường dẫn bạn yêu cầu không chứa thông tin môn học hợp lý.");
    }
  } catch (error) {
    console.error("Initialization error:", error);
    showError("Lỗi hệ thống", "Không thể nạp dữ liệu cấu trúc hệ thống. Vui lòng tải lại trang.");
  }
}

// 1. SHOW MODE A: SUBJECT LIST
function showModeA() {
  subjectView.style.display = "block";
  bodeView.style.display = "none";
  errorView.style.display = "none";
  breadcrumb.style.display = "none";

  // Calculate subject counts based on bo-de.json
  const subjectsContainer = document.getElementById("subjects-container");
  subjectsContainer.innerHTML = "";

  let totalDocs = 0;
  boDeList.forEach(b => {
    totalDocs += b.totalDeThi || 0;
  });
  
  const totalDocsEl = document.getElementById("subject-total-docs");
  if (totalDocsEl) totalDocsEl.textContent = totalDocs;

  subjects.forEach(sub => {
    // Compute total documents for this subject
    const subjectBoDe = boDeList.filter(b => b.mon === sub.slug);
    const subDocCount = subjectBoDe.reduce((acc, curr) => acc + (curr.totalDeThi || 0), 0);
    const subActive = subDocCount > 0 || sub.slug === "toan"; // Active if has docs

    const card = document.createElement("div");
    card.className = `subject-card ${subActive ? 'active' : 'coming-soon'}`;
    
    card.innerHTML = `
      <div class="subject-icon">
        <i data-lucide="${sub.icon || 'book'}"></i>
      </div>
      <div class="subject-info">
        <h3 class="subject-name">${sub.name}</h3>
        <p class="subject-desc">${sub.description}</p>
        <div class="subject-meta">
          <span class="doc-count">${subDocCount} tài liệu</span>
          <span class="badge">${subActive ? 'Sẵn sàng' : 'Sắp ra mắt'}</span>
        </div>
      </div>
    `;

    if (subActive) {
      card.addEventListener("click", () => {
        window.location.href = `index.html?mon=${sub.slug}`;
      });
    }

    subjectsContainer.appendChild(card);
  });

  lucide.createIcons();
}

// 2. SHOW MODE B: SUB-TOPICS LIST (BỘ ĐỀ)
function showModeB() {
  subjectView.style.display = "none";
  bodeView.style.display = "block";
  errorView.style.display = "none";
  
  // Render Breadcrumb
  const currentSub = subjects.find(s => s.slug === activeMonSlug);
  breadcrumb.style.display = "flex";
  breadcrumb.innerHTML = `
    <a href="index.html" class="breadcrumb-item">Trang chủ</a>
    <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
    <span class="breadcrumb-item active">${currentSub.name}</span>
  `;

  // Update headers
  bodeSubjectTitle.textContent = currentSub.name;
  bodeSubjectDesc.textContent = currentSub.description;
  
  // Set subject icon
  bodeSubjectIcon.innerHTML = `<i data-lucide="${currentSub.icon || 'book'}"></i>`;

  // Render list
  renderBodeGrid();

  // Search filter
  bodeSearchInput.addEventListener("input", debounce((e) => {
    currentBodeSearch = e.target.value;
    renderBodeGrid();
  }, 200));

  lucide.createIcons();
}

function renderBodeGrid() {
  bodeContainer.innerHTML = "";
  
  const filteredBode = boDeList.filter(b => {
    if (b.mon !== activeMonSlug) return false;
    if (!currentBodeSearch) return true;
    
    const searchNorm = removeAccents(currentBodeSearch);
    const nameNorm = removeAccents(b.name);
    const descNorm = removeAccents(b.description);
    return nameNorm.includes(searchNorm) || descNorm.includes(searchNorm);
  });

  bodeSubjectCount.textContent = filteredBode.length;

  if (filteredBode.length === 0) {
    bodeContainer.innerHTML = `
      <div class="empty-state-card">
        <i data-lucide="search-x"></i>
        <p>Không tìm thấy chuyên đề/bộ đề phù hợp với từ khóa</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  filteredBode.forEach(b => {
    const card = document.createElement("div");
    card.className = "bode-card";
    
    card.innerHTML = `
      <div class="bode-card-header">
        <span class="grade-badge">Lớp ${b.grade}</span>
        <span class="bode-doc-badge"><i data-lucide="file-text"></i> ${b.totalDeThi} tài liệu</span>
      </div>
      <h3 class="bode-card-title">${b.name}</h3>
      <p class="bode-card-desc">${b.description}</p>
      <div class="bode-card-footer">
        <button class="bode-view-btn">
          Truy cập bộ đề <i data-lucide="arrow-right"></i>
        </button>
      </div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `list-de.html?mon=${activeMonSlug}&bo-de=${b.id}`;
    });

    bodeContainer.appendChild(card);
  });

  lucide.createIcons();
}

// 3. SHOW ERROR BLOCK
function showError(title, message) {
  subjectView.style.display = "none";
  bodeView.style.display = "none";
  errorView.style.display = "flex";
  breadcrumb.style.display = "none";

  document.getElementById("error-title-text").textContent = title;
  document.getElementById("error-desc-text").textContent = message;
  
  lucide.createIcons();
}

// 4. THEME CONTROL
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
