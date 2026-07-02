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
      initCountdown();
      initQuotes();
      initMathGame();
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
        <img src="assets/images/logo-${sub.slug}.svg" alt="${sub.name}" class="subject-logo-img">
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
    <a href="./" class="breadcrumb-item">Trang chủ</a>
    <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
    <span class="breadcrumb-item active">${currentSub.name}</span>
  `;

  // Update headers
  bodeSubjectTitle.textContent = currentSub.name;
  bodeSubjectDesc.textContent = currentSub.description;
  
  // Set subject icon
  bodeSubjectIcon.innerHTML = `<img src="assets/images/logo-${currentSub.slug}.svg" alt="${currentSub.name}" class="subject-logo-img-large">`;

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

// 5. COUNTDOWN TIMER TO THPT 2027
function initCountdown() {
  const countdownEl = document.getElementById("countdown-timer");
  if (!countdownEl) return;
  
  const targetDate = new Date("June 28, 2027 07:30:00").getTime();
  
  function updateTimer() {
    const now = new Date().getTime();
    const diff = targetDate - now;
    
    if (diff <= 0) {
      countdownEl.innerHTML = "<div style='font-size: 1rem; font-weight: 700; color: var(--success); width: 100%; text-align: center;'>Kỳ thi THPT Quốc Gia đang diễn ra hoặc đã kết thúc!</div>";
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById("days").textContent = String(days).padStart(2, '0');
    document.getElementById("hours").textContent = String(hours).padStart(2, '0');
    document.getElementById("minutes").textContent = String(minutes).padStart(2, '0');
    document.getElementById("seconds").textContent = String(seconds).padStart(2, '0');
  }
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

// 6. STUDY MOTIVATIONAL QUOTES
const MOTIVATIONAL_QUOTES = [
  { text: "Học tập là hạt giống của kiến thức, kiến thức là hạt giống của hạnh phúc.", author: "Ngạn ngữ" },
  { text: "Cách duy nhất để học một môn toán học là bắt đầu làm toán.", author: "Paul Halmos" },
  { text: "Đừng xấu hổ khi không biết, chỉ xấu hổ khi không học.", author: "Khuyết danh" },
  { text: "Trong học tập, người kiên trì sẽ chiến thắng.", author: "Ngạn ngữ" },
  { text: "Nếu bạn không thể giải thích đơn giản, nghĩa là bạn chưa hiểu đủ rõ.", author: "Albert Einstein" },
  { text: "Thành công là tổng hợp của những nỗ lực nhỏ bé, lặp đi lặp lại ngày qua ngày.", author: "Robert Collier" },
  { text: "Thiên tài chỉ có 1% năng khiếu, 99% còn lại là mồ hôi.", author: "Thomas Edison" },
  { text: "Giáo dục là vũ khí mạnh nhất mà bạn có thể dùng để thay đổi thế giới.", author: "Nelson Mandela" }
];

function initQuotes() {
  const quoteText = document.getElementById("quote-text");
  const quoteAuthor = document.getElementById("quote-author");
  const btnNextQuote = document.getElementById("btn-next-quote");
  
  if (!quoteText || !quoteAuthor || !btnNextQuote) return;
  
  function setRandomQuote() {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    const quote = MOTIVATIONAL_QUOTES[randomIndex];
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `— ${quote.author}`;
  }
  
  setRandomQuote();
  
  btnNextQuote.addEventListener("click", () => {
    const icon = btnNextQuote.querySelector("i, svg");
    if (icon) {
      icon.style.transform = "rotate(360deg)";
      icon.style.transition = "transform 0.4s ease";
      setTimeout(() => {
        icon.style.transform = "none";
        icon.style.transition = "none";
      }, 400);
    }
    setRandomQuote();
  });
}

// 7. MINI GAME: QUICK MATH CHALLENGE
function initMathGame() {
  const gameArea = document.getElementById("game-area");
  const btnStart = document.getElementById("btn-start-game");
  
  if (!gameArea || !btnStart) return;
  
  let score = 0;
  let timer = null;
  let timeRemaining = 8;
  let correctAnswer = 0;
  
  function generateQuestion() {
    const operators = ["+", "-", "*"];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let num1 = 0, num2 = 0;
    
    if (op === "+") {
      num1 = Math.floor(Math.random() * 89) + 10;
      num2 = Math.floor(Math.random() * 89) + 10;
      correctAnswer = num1 + num2;
    } else if (op === "-") {
      num1 = Math.floor(Math.random() * 89) + 10;
      num2 = Math.floor(Math.random() * (num1 - 5)) + 5;
      correctAnswer = num1 - num2;
    } else if (op === "*") {
      num1 = Math.floor(Math.random() * 11) + 2;
      num2 = Math.floor(Math.random() * 11) + 2;
      correctAnswer = num1 * num2;
    }
    
    const answers = [correctAnswer];
    while (answers.length < 4) {
      const offset = Math.floor(Math.random() * 19) - 9;
      const wrongAns = correctAnswer + offset;
      if (wrongAns !== correctAnswer && wrongAns > 0 && !answers.includes(wrongAns)) {
        answers.push(wrongAns);
      }
    }
    
    answers.sort(() => Math.random() - 0.5);
    
    gameArea.innerHTML = `
      <div class="game-play-header">
        <span class="game-score">Điểm: <strong>${score}</strong></span>
        <span class="game-timer" id="game-time-left">${timeRemaining}s</span>
      </div>
      <p class="game-question">${num1} ${op === "*" ? "×" : op} ${num2} = ?</p>
      <div class="game-options-grid">
        ${answers.map(ans => `<button class="game-option-btn" data-value="${ans}">${ans}</button>`).join("")}
      </div>
    `;
    
    gameArea.querySelectorAll(".game-option-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const val = parseInt(e.target.getAttribute("data-value"));
        if (val === correctAnswer) {
          score++;
          timeRemaining = Math.max(5, 8 - Math.floor(score / 5));
          clearInterval(timer);
          startTimer();
          generateQuestion();
        } else {
          gameOver();
        }
      });
    });
  }
  
  function startTimer() {
    timer = setInterval(() => {
      timeRemaining--;
      const timerEl = document.getElementById("game-time-left");
      if (timerEl) timerEl.textContent = `${timeRemaining}s`;
      
      if (timeRemaining <= 0) {
        gameOver();
      }
    }, 1000);
  }
  
  function gameOver() {
    clearInterval(timer);
    gameArea.innerHTML = `
      <div class="game-over-view">
        <i data-lucide="trophy" class="game-over-icon"></i>
        <h4 class="game-over-title">Kết thúc thử thách!</h4>
        <p class="game-over-desc">Điểm số của bạn đạt được là: <strong>${score}</strong></p>
        <button class="btn-start-game" id="btn-restart-game">Chơi lại</button>
      </div>
    `;
    lucide.createIcons();
    
    document.getElementById("btn-restart-game").addEventListener("click", () => {
      score = 0;
      timeRemaining = 8;
      generateQuestion();
      startTimer();
    });
  }
  
  btnStart.addEventListener("click", () => {
    score = 0;
    timeRemaining = 8;
    generateQuestion();
    startTimer();
  });
}

document.addEventListener("DOMContentLoaded", init);
