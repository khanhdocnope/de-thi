import { CONFIG } from './config.js';
import { getQueryParam } from './router.js';
import { convertGoogleDriveLink } from './utils.js';

// Elements
const loaderOverlay = document.getElementById("loader-overlay");
const loaderStatus = document.getElementById("loader-status");
const pdfRenderArea = document.getElementById("pdf-render-area");
const pdfIframeFallback = document.getElementById("pdf-iframe-fallback");
const errorView = document.getElementById("error-view");
const breadcrumb = document.getElementById("breadcrumb");
const themeToggleBtn = document.getElementById("theme-toggle");

const docTitleEl = document.getElementById("doc-title");
const docMetaEl = document.getElementById("doc-meta");
const btnBackDashboard = document.getElementById("btn-back-dashboard");
const btnCopyLink = document.getElementById("btn-copy-link");
const btnNewTab = document.getElementById("btn-new-tab");
const btnDownload = document.getElementById("btn-download");

// Floating toolbar elements
const floatingToolbar = document.getElementById("floating-toolbar");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const pageNumInput = document.getElementById("page-num-input");
const pageCountSpan = document.getElementById("page-count");
const btnZoomIn = document.getElementById("btn-zoom-in");
const btnZoomOut = document.getElementById("btn-zoom-out");
const zoomPercentSpan = document.getElementById("zoom-percent");
const btnFitWidth = document.getElementById("btn-fit-width");

// State
let subjects = [];
let boDeList = [];
let deThiList = [];
let activeDoc = null;
let pdfUrl = "";

// PDFJS Rendering State
let currentPdfDoc = null;
let currentPdfPageNum = 1;
let currentPdfZoom = "fit"; // 'fit' or scale factor (e.g., 1.25)
let fetchAbortController = null;

const renderedPages = new Set();
let pageObserver = null;

// Set worker src
pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.pdfWorkerSrc;

async function init() {
  setupTheme();
  setupEventListeners();

  const docId = getQueryParam("id");
  const quickSrc = getQueryParam("src");

  if (!docId && !quickSrc) {
    showError("Không tìm thấy đề thi", "Không có thông tin định danh tài liệu được cung cấp.");
    return;
  }

  try {
    if (docId) {
      // Load databases
      const subjectsRes = await fetch("data/subjects.json");
      subjects = await subjectsRes.json();

      const boDeRes = await fetch("data/bo-de.json");
      boDeList = await boDeRes.json();

      const deThiRes = await fetch("data/de-thi.json");
      deThiList = await deThiRes.json();

      activeDoc = deThiList.find(d => d.id === docId);

      if (!activeDoc) {
        showError("Không tìm thấy đề thi", "Đề thi bạn đang truy cập không tồn tại hoặc đã bị xóa.");
        return;
      }

      pdfUrl = activeDoc.pdfUrl;

      // Update meta titles
      docTitleEl.textContent = activeDoc.title;
      docMetaEl.textContent = `${activeDoc.school || 'EduHub'} • Năm học ${activeDoc.year} • Định dạng PDF`;

      // Set download/tab actions
      btnDownload.href = pdfUrl;
      btnDownload.setAttribute("download", `${activeDoc.title}.pdf`);
      btnNewTab.href = pdfUrl;

      // Set Breadcrumb
      const activeSubject = subjects.find(s => s.slug === activeDoc.mon);
      const activeBoDe = boDeList.find(b => b.id === activeDoc.boDe);

      breadcrumb.innerHTML = `
        <a href="index.html" class="breadcrumb-item">Trang chủ</a>
        <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
        <a href="index.html?mon=${activeDoc.mon}" class="breadcrumb-item">${activeSubject?.name || "Môn học"}</a>
        <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
        <a href="list-de.html?mon=${activeDoc.mon}&bo-de=${activeDoc.boDe}" class="breadcrumb-item">${activeBoDe?.name || "Bộ đề"}</a>
        <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
        <span class="breadcrumb-item active text-truncate" style="max-width: 200px;">${activeDoc.title}</span>
      `;
      lucide.createIcons();

      // Setup back button
      btnBackDashboard.addEventListener("click", () => {
        window.location.href = `list-de.html?mon=${activeDoc.mon}&bo-de=${activeDoc.boDe}`;
      });
    } else {
      // Quick source mode
      pdfUrl = quickSrc;
      docTitleEl.textContent = "Xem nhanh tài liệu PDF";
      docMetaEl.textContent = "Nguồn ngoài chia sẻ • Định dạng PDF";

      btnDownload.href = pdfUrl;
      btnNewTab.href = pdfUrl;

      breadcrumb.innerHTML = `
        <a href="index.html" class="breadcrumb-item">Trang chủ</a>
        <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
        <span class="breadcrumb-item active">Xem nhanh PDF</span>
      `;
      lucide.createIcons();

      btnBackDashboard.addEventListener("click", () => {
        window.location.href = "index.html";
      });
    }

    // Convert link if Google Drive
    if (CONFIG.autoConvertGoogleDriveLink) {
      pdfUrl = convertGoogleDriveLink(pdfUrl);
    }

    // Try PDF.js streaming load
    startPdfStream(pdfUrl);

  } catch (err) {
    console.error("Error displaying PDF: ", err);
    showError("Lỗi hệ thống", "Không thể nạp trình đọc văn bản. Vui lòng tải lại trang.");
  }
}

async function startPdfStream(url) {
  let fetchUrl = url;
  if (CONFIG.useCorsProxy) {
    fetchUrl = CONFIG.corsProxyUrl + encodeURIComponent(url);
  }

  loaderOverlay.style.display = "flex";
  loaderStatus.textContent = "Đang kết nối để truyền tải tệp tin PDF...";

  // Setup abort controller
  if (fetchAbortController) fetchAbortController.abort();
  fetchAbortController = new AbortController();
  const signal = fetchAbortController.signal;

  try {
    const response = await fetch(fetchUrl, { signal });
    if (!response.ok) throw new Error(`Mã lỗi kết nối: ${response.status}`);

    const contentLength = response.headers.get("content-length");
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    let loadedBytes = 0;

    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loadedBytes += value.length;

      if (totalBytes > 0) {
        const percent = Math.round((loadedBytes / totalBytes) * 100);
        loaderStatus.textContent = `Đang tải tài liệu: ${percent}% (${(loadedBytes / 1024 / 1024).toFixed(1)}MB / ${(totalBytes / 1024 / 1024).toFixed(1)}MB)...`;
      } else {
        loaderStatus.textContent = `Đang stream tài liệu: ${(loadedBytes / 1024).toFixed(0)} KB...`;
      }
    }

    // Combine binary chunks
    const binaryData = new Uint8Array(loadedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      binaryData.set(chunk, offset);
      offset += chunk.length;
    }

    // Force real download using local same-origin Blob URL
    try {
      const blob = new Blob([binaryData], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      btnDownload.href = blobUrl;
    } catch (blobErr) {
      console.warn("Failed to create local blob URL:", blobErr);
    }

    // Load into PDF.js
    const loadingTask = pdfjsLib.getDocument({ data: binaryData });
    currentPdfDoc = await loadingTask.promise;

    // Show custom viewer elements
    pdfRenderArea.style.display = "flex";
    floatingToolbar.style.display = "flex";
    pdfIframeFallback.style.display = "none";
    loaderOverlay.style.display = "none";

    pageCountSpan.textContent = currentPdfDoc.numPages;
    pageNumInput.max = currentPdfDoc.numPages;

    // Initialize all page container placeholders
    await initPageContainers();

  } catch (err) {
    if (err.name === 'AbortError') return;
    console.warn("PDF stream/CORS failed. Falling back to native browser iframe...", err);
    loadIframeFallback(url);
  }
}

function loadIframeFallback(url) {
  pdfRenderArea.style.display = "none";
  floatingToolbar.style.display = "none";
  pdfIframeFallback.style.display = "block";

  pdfIframeFallback.src = url;
  
  pdfIframeFallback.addEventListener("load", () => {
    loaderOverlay.style.display = "none";
  });
}

async function initPageContainers() {
  pdfRenderArea.innerHTML = "";
  renderedPages.clear();
  
  if (pageObserver) {
    pageObserver.disconnect();
  }

  // Get page 1 viewport details to size the containers correctly
  const firstPage = await currentPdfDoc.getPage(1);
  const viewport = firstPage.getViewport({ scale: 1.0 });
  let calculatedScale = 1.25;

  if (currentPdfZoom === "fit" || window.innerWidth <= 768) {
    const containerWidth = pdfRenderArea.clientWidth - 40;
    calculatedScale = containerWidth / viewport.width;
  } else {
    calculatedScale = parseFloat(currentPdfZoom);
  }

  zoomPercentSpan.textContent = Math.round(calculatedScale * 100) + "%";

  const pageHeight = viewport.height * calculatedScale;
  const pageWidth = viewport.width * calculatedScale;

  // Append wrappers for each page
  for (let i = 1; i <= currentPdfDoc.numPages; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "pdf-page-container";
    wrapper.id = `page-container-${i}`;
    wrapper.dataset.pageNumber = i;
    wrapper.style.width = `${pageWidth}px`;
    wrapper.style.height = `${pageHeight}px`;
    wrapper.style.minHeight = `${pageHeight}px`;
    wrapper.style.marginBottom = "24px";
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = "center";

    const canvas = document.createElement("canvas");
    canvas.id = `pdf-canvas-${i}`;
    canvas.style.display = "block";
    canvas.style.background = "white";
    canvas.style.borderRadius = "4px";
    canvas.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.4)";
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity 0.25s ease";

    wrapper.appendChild(canvas);
    pdfRenderArea.appendChild(wrapper);
  }

  setupIntersectionObserver();
}

function setupIntersectionObserver() {
  const options = {
    root: pdfRenderArea,
    rootMargin: "300px 0px 300px 0px", // Preload pages 300px before entering viewport
    threshold: 0.1
  };

  pageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const pageNum = parseInt(entry.target.dataset.pageNumber, 10);
      if (entry.isIntersecting) {
        if (!renderedPages.has(pageNum)) {
          renderedPages.add(pageNum);
          renderPdfPage(pageNum);
        }
        
        currentPdfPageNum = pageNum;
        pageNumInput.value = pageNum;
      }
    });
  }, options);

  document.querySelectorAll(".pdf-page-container").forEach(el => {
    pageObserver.observe(el);
  });
}

function renderPdfPage(num) {
  const container = document.getElementById(`page-container-${num}`);
  if (!container) return;
  const canvas = container.querySelector("canvas");
  if (!canvas) return;

  currentPdfDoc.getPage(num).then(page => {
    let viewport = page.getViewport({ scale: 1.0 });
    let calculatedScale = 1.25;

    if (currentPdfZoom === "fit" || window.innerWidth <= 768) {
      const containerWidth = pdfRenderArea.clientWidth - 40;
      calculatedScale = containerWidth / viewport.width;
    } else {
      calculatedScale = parseFloat(currentPdfZoom);
    }

    const scaledViewport = page.getViewport({ scale: calculatedScale });
    const outputScale = window.devicePixelRatio || 1;
    canvas.height = scaledViewport.height * outputScale;
    canvas.width = scaledViewport.width * outputScale;
    canvas.style.width = `${scaledViewport.width}px`;
    canvas.style.height = `${scaledViewport.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(outputScale, outputScale);

    const renderContext = {
      canvasContext: ctx,
      viewport: scaledViewport
    };

    page.render(renderContext).promise.then(() => {
      canvas.style.opacity = "1";
    });
  });
}

async function updateZoomAndLayout() {
  if (!currentPdfDoc) return;

  const firstPage = await currentPdfDoc.getPage(1);
  const viewport = firstPage.getViewport({ scale: 1.0 });
  let calculatedScale = 1.25;

  if (currentPdfZoom === "fit" || window.innerWidth <= 768) {
    const containerWidth = pdfRenderArea.clientWidth - 40;
    calculatedScale = containerWidth / viewport.width;
  } else {
    calculatedScale = parseFloat(currentPdfZoom);
  }

  zoomPercentSpan.textContent = Math.round(calculatedScale * 100) + "%";

  const pageHeight = viewport.height * calculatedScale;
  const pageWidth = viewport.width * calculatedScale;

  // Clear current render caches
  renderedPages.clear();

  // Resize wrappers
  const containers = document.querySelectorAll(".pdf-page-container");
  containers.forEach(wrapper => {
    wrapper.style.width = `${pageWidth}px`;
    wrapper.style.height = `${pageHeight}px`;
    wrapper.style.minHeight = `${pageHeight}px`;

    const canvas = wrapper.querySelector("canvas");
    if (canvas) {
      canvas.style.opacity = "0";
    }
  });

  // Re-initialize intersection observers to trigger renders for visible pages
  setupIntersectionObserver();
}

function scrollToPage(num) {
  const container = document.getElementById(`page-container-${num}`);
  if (container) {
    container.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!renderedPages.has(num)) {
      renderedPages.add(num);
      renderPdfPage(num);
    }
    currentPdfPageNum = num;
    pageNumInput.value = num;
  }
}

function setupEventListeners() {
  btnPrev.addEventListener("click", () => {
    if (currentPdfDoc && currentPdfPageNum > 1) {
      scrollToPage(currentPdfPageNum - 1);
    }
  });

  btnNext.addEventListener("click", () => {
    if (currentPdfDoc && currentPdfPageNum < currentPdfDoc.numPages) {
      scrollToPage(currentPdfPageNum + 1);
    }
  });

  pageNumInput.addEventListener("change", (e) => {
    if (!currentPdfDoc) return;
    let num = parseInt(e.target.value, 10);
    if (num >= 1 && num <= currentPdfDoc.numPages) {
      scrollToPage(num);
    } else {
      e.target.value = currentPdfPageNum;
    }
  });

  btnZoomIn.addEventListener("click", () => {
    if (!currentPdfDoc) return;
    if (currentPdfZoom === "fit") {
      currentPdfZoom = 1.25;
    } else {
      currentPdfZoom = Math.min(3.0, parseFloat(currentPdfZoom) + 0.25);
    }
    updateZoomAndLayout();
  });

  btnZoomOut.addEventListener("click", () => {
    if (!currentPdfDoc) return;
    if (currentPdfZoom === "fit") {
      currentPdfZoom = 1.0;
    } else {
      currentPdfZoom = Math.max(0.5, parseFloat(currentPdfZoom) - 0.25);
    }
    updateZoomAndLayout();
  });

  btnFitWidth.addEventListener("click", () => {
    if (!currentPdfDoc) return;
    currentPdfZoom = "fit";
    updateZoomAndLayout();
  });

  // Window Resize
  window.addEventListener("resize", () => {
    if (currentPdfDoc && (currentPdfZoom === "fit" || window.innerWidth <= 768)) {
      updateZoomAndLayout();
    }
  });

  // Copy share link
  btnCopyLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (!pdfUrl) return;

    navigator.clipboard.writeText(pdfUrl)
      .then(() => showToast("Đã sao chép liên kết tải đề thi thành công!"))
      .catch(err => {
        console.error("Copy error: ", err);
        showToast("Không thể sao chép tự động. Vui lòng tự copy link trong thanh mới.");
      });
  });
}

function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <i data-lucide="check-circle" class="success-icon"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.animation = "toast-out 0.3s forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showError(title, message) {
  loaderOverlay.style.display = "none";
  pdfRenderArea.style.display = "none";
  floatingToolbar.style.display = "none";
  pdfIframeFallback.style.display = "none";
  errorView.style.display = "flex";

  document.getElementById("error-title-text").textContent = title;
  document.getElementById("error-desc-text").textContent = message;

  breadcrumb.innerHTML = `
    <a href="index.html" class="breadcrumb-item">Trang chủ</a>
    <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
    <span class="breadcrumb-item active">Lỗi</span>
  `;
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
