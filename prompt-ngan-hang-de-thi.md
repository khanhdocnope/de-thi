# PROMPT: Xây dựng Website "Ngân Hàng Đề Thi" (Static HTML)

Bạn là một lập trình viên frontend chuyên nghiệp. Hãy xây dựng cho tôi một website tĩnh (không cần backend/server, không cần build tool) đóng vai trò **ngân hàng đề thi** — nơi lưu trữ, phân loại và cho phép xem/tải các đề thi dạng PDF theo mô hình phân cấp 3 tầng: **Môn học → Bộ đề → Đề thi (PDF)**.

---

## 1. Tổng quan dự án

- **Tên dự án gợi ý:** Ngân Hàng Đề Thi
- **Loại:** Static site (HTML/CSS/JS thuần, không React/build step), có thể mở trực tiếp bằng cách double-click `index.html` hoặc host trên GitHub Pages / Netlify.
- **Ngôn ngữ giao diện:** Tiếng Việt.
- **Phong cách UI:** Tối giản, tông tối (dark theme), hiện đại, dễ đọc trên di động.
- **Mô hình điều hướng (rất quan trọng):**
  1. `index.html` (không có tham số) → chỉ hiển thị **danh sách môn học**, KHÔNG hiển thị bất kỳ đề thi/bộ đề nào.
  2. `index.html?mon=<slug>` (tham số `mon` hợp lệ) → hiển thị **danh sách bộ đề** (tên tổng quát của các bộ đề lớn) thuộc môn đó.
  3. `list-de.html?mon=<slug>&bo-de=<id>` → hiển thị **danh sách đề thi cụ thể (từng file PDF)** bên trong bộ đề đã chọn, mỗi mục dẫn tới `viewer.html?id=<id>`.
  4. `viewer.html?id=<id>` (hoặc `?src=<url>`) → stream và xem trực tiếp file PDF của đề thi được chọn.

---

## 2. Yêu cầu kỹ thuật

- Chỉ dùng **HTML5 + CSS3 + Vanilla JavaScript (ES6+)**.
- Không dùng framework nặng. Có thể dùng thư viện qua CDN nếu cần (ví dụ **PDF.js** để render PDF ngay trong trang thay vì mở tab mới).
- Toàn bộ dữ liệu (môn học, bộ đề, đề thi) lưu trong các file JSON riêng để dễ chỉnh sửa, KHÔNG hard-code trong HTML.
- Responsive: chạy tốt trên mobile, tablet, desktop.
- Không yêu cầu đăng nhập, không yêu cầu backend.
- Lưu trạng thái người dùng (bộ lọc đã chọn, đề thi xem gần đây...) bằng `localStorage`.
- **Validate tham số query string ở mọi trang**: nếu `mon` hoặc `bo-de` không tồn tại/không hợp lệ, không được hiển thị dữ liệu — thay vào đó hiển thị trạng thái lỗi/rỗng và gợi ý quay lại bước trước.

---

## 3. Cấu trúc thư mục (đề xuất)

```
ngan-hang-de-thi/
│
├── index.html                # Trang môn học (không tham số) HOẶC bộ đề (?mon=... hợp lệ)
├── list-de.html               # Trang danh sách đề thi cụ thể (?mon=...&bo-de=...) -> link tới viewer.html?id=...
├── viewer.html                 # Trang xem PDF (stream inline qua PDF.js)
│
├── assets/
│   ├── css/
│   │   ├── style.css          # Style chính (theme tối, layout, responsive, dùng chung)
│   │   ├── list-de.css         # Style riêng cho trang danh sách đề thi
│   │   └── viewer.css          # Style riêng cho trang xem PDF
│   │
│   ├── js/
│   │   ├── app.js              # Logic index.html: phân biệt chế độ "môn học" vs "bộ đề"
│   │   ├── list-de.js           # Logic list-de.html: đọc mon + bo-de, render danh sách PDF, tạo link viewer.html?id=...
│   │   ├── viewer.js            # Logic stream & render PDF bằng PDF.js
│   │   ├── router.js             # Hàm dùng chung: đọc/validate query string (mon, bo-de, id)
│   │   ├── config.js             # Cấu hình tuỳ biến (nguồn PDF, proxy CORS, chunk size...)
│   │   └── utils.js              # Hàm dùng chung (debounce, format ngày, slugify...)
│   │
│   └── icons/                  # Icon môn học, favicon, logo (SVG/PNG)
│
├── data/
│   ├── subjects.json           # Danh sách môn học (tên, slug, icon, mô tả)
│   ├── bo-de.json               # Danh sách bộ đề lớn, gắn với từng môn (theo "mon" slug)
│   └── de-thi.json              # Danh sách đề thi cụ thể (file PDF), gắn với từng bộ đề, có id để viewer.html?id=... tra cứu
│
└── README.md                    # Hướng dẫn thêm môn/bộ đề/đề thi mới, cách đổi nguồn PDF
```

> **Lưu ý:** Tách dữ liệu thành 3 tầng (`subjects.json` / `bo-de.json` / `de-thi.json`) thay vì gộp chung 1 file, giúp mỗi trang chỉ cần load đúng phần dữ liệu cần thiết và dễ maintain khi số lượng đề thi tăng lên.

---

## 4. Cấu trúc dữ liệu mẫu

### 4.1. `data/subjects.json` — Danh sách môn học
```json
[
  { "slug": "toan", "name": "Toán", "icon": "toan.svg", "description": "Đề thi môn Toán các cấp" },
  { "slug": "van", "name": "Ngữ Văn", "icon": "van.svg", "description": "Đề thi môn Ngữ Văn các cấp" },
  { "slug": "anh", "name": "Tiếng Anh", "icon": "anh.svg", "description": "Đề thi môn Tiếng Anh các cấp" }
]
```

### 4.2. `data/bo-de.json` — Danh sách bộ đề lớn (tên tổng quát), gắn theo môn
```json
[
  {
    "id": "toan-hk1-lop12",
    "mon": "toan",
    "name": "Bộ đề Học kỳ 1 - Lớp 12",
    "grade": "12",
    "description": "Tổng hợp đề thi học kỳ 1 các trường THPT",
    "totalDeThi": 12
  },
  {
    "id": "toan-thi-thpt-2024",
    "mon": "toan",
    "name": "Bộ đề luyện thi THPT Quốc Gia 2024",
    "grade": "12",
    "description": "Đề luyện thi tốt nghiệp môn Toán",
    "totalDeThi": 30
  }
]
```

### 4.3. `data/de-thi.json` — Danh sách đề thi cụ thể (từng file PDF), gắn theo bộ đề
```json
[
  {
    "id": "toan-hk1-lop12-2024-lehongphong",
    "boDe": "toan-hk1-lop12",
    "mon": "toan",
    "title": "Đề thi HK1 Toán 12 - THPT Chuyên Lê Hồng Phong",
    "year": 2024,
    "school": "THPT Chuyên Lê Hồng Phong",
    "tags": ["trắc nghiệm", "có đáp án"],
    "pdfUrl": "https://example.com/files/toan-hk1-2024-lehongphong.pdf",
    "hasAnswerKey": true,
    "answerKeyUrl": "https://example.com/files/toan-hk1-2024-lehongphong-dapan.pdf",
    "uploadedAt": "2024-12-20"
  }
]
```

> `id` trong `de-thi.json` chính là giá trị dùng cho `viewer.html?id=<id>` — mỗi dòng trong `list-de.html` render ra một link `<a href="viewer.html?id=...">`.

---

## 5. Chức năng chính theo từng trang

### 5.1. `index.html` — 2 chế độ hiển thị dựa trên query string

Dùng `router.js` để đọc tham số `mon` từ URL và quyết định chế độ hiển thị:

- **Chế độ A — không có `mon` (hoặc rỗng):**
  - Chỉ load `subjects.json`.
  - Hiển thị **lưới các môn học** (card: icon + tên môn + số lượng bộ đề).
  - **Không** load hay hiển thị bất kỳ bộ đề/đề thi nào.
  - Click vào 1 môn → điều hướng đến `index.html?mon=<slug>`.

- **Chế độ B — có `mon=<slug>` hợp lệ (tồn tại trong `subjects.json`):**
  - Load `bo-de.json`, lọc theo `mon === slug`.
  - Hiển thị **danh sách bộ đề lớn** thuộc môn đó (tên tổng quát, không phải từng file PDF riêng lẻ).
  - Có breadcrumb: `Trang chủ / <Tên môn>`.
  - Click vào 1 bộ đề → điều hướng đến `list-de.html?mon=<slug>&bo-de=<id>`.

- **Chế độ lỗi — `mon` có giá trị nhưng KHÔNG hợp lệ** (không khớp slug nào trong `subjects.json`):
  - Không hiển thị bộ đề nào cả.
  - Hiển thị thông báo "Không tìm thấy môn học này" + nút quay về danh sách môn học (`index.html`).

### 5.2. `list-de.html?mon=<slug>&bo-de=<id>` — Danh sách đề thi cụ thể (link tới viewer)
- Validate cả 2 tham số: `mon` phải hợp lệ VÀ `bo-de` phải tồn tại trong `bo-de.json` VÀ thuộc đúng `mon` đó. Nếu thiếu 1 trong 2, hoặc không khớp nhau → hiển thị trạng thái lỗi, gợi ý quay lại `index.html?mon=<slug>` hoặc `index.html`.
- Load `de-thi.json`, lọc theo `boDe === id`.
- Hiển thị **danh sách các file PDF cụ thể** trong bộ đề: tên đề, trường, năm, có đáp án hay không, ngày đăng.
- Breadcrumb: `Trang chủ / <Tên môn> / <Tên bộ đề>`.
- Bộ lọc phụ (trong phạm vi bộ đề): theo năm, theo trường, có đáp án.
- Tìm kiếm theo tên đề thi (debounce).
- Mỗi đề thi render thành link **`viewer.html?id=<id>`** (dùng đúng `id` trong `de-thi.json`) để mở trang xem PDF.
- Nút "Tải xuống" tải trực tiếp file gốc (`pdfUrl`), tách biệt với nút "Xem" (mở viewer).

### 5.3. `viewer.html?id=<id>` (hoặc `?src=<url>`) — Stream PDF từ link tải
- Dùng **PDF.js** (qua CDN) để **render PDF ngay trong trang**, không bắt người dùng tải file về mới xem được.
- Nếu có `id`: tra cứu đề thi tương ứng trong `de-thi.json` để lấy `pdfUrl`, đồng thời hiển thị breadcrumb đầy đủ: `Trang chủ / <Môn> / <Bộ đề> / <Tên đề thi>` (dùng `mon` và `boDe` lưu sẵn trong chính bản ghi đề thi để dựng lại breadcrumb, không cần truyền thêm query string).
- Nếu có `src` (link PDF trực tiếp, không cần có trong dữ liệu): xem nhanh, không hiển thị breadcrumb đầy đủ — chỉ hiển thị "Xem nhanh PDF".
- **Tải theo từng phần (progressive loading)**: hiển thị trang đầu tiên ngay khi có đủ dữ liệu, không đợi tải hết toàn bộ file — tận dụng khả năng stream theo range-request của PDF.js.
- Thanh công cụ: phóng to/thu nhỏ, chuyển trang, tải xuống, in.
- Xử lý trạng thái: đang tải (progress bar theo %), lỗi (link hỏng, CORS, file không tồn tại) → thông báo rõ ràng + nút thử lại.

### 5.4. `router.js` — Tiện ích dùng chung cho validate query string
```js
// router.js — dùng chung cho index.html và list-de.html
export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function isValidSubject(slug, subjects) {
  return !!slug && subjects.some(s => s.slug === slug);
}

export function isValidBoDe(id, mon, boDeList) {
  return !!id && boDeList.some(b => b.id === id && b.mon === mon);
}
```

### 5.5. Tuỳ biến nguồn PDF (`assets/js/config.js`)
Vì nhiều link tải PDF (Google Drive, Dropbox...) không hỗ trợ CORS trực tiếp, cần một lớp cấu hình để dễ đổi chiến lược mà không sửa code chính:

```js
// config.js — chỉnh ở đây, không cần sửa viewer.js
export const CONFIG = {
  // Bật/tắt proxy CORS trung gian khi nguồn PDF chặn CORS
  useCorsProxy: false,
  corsProxyUrl: "https://your-proxy.example.com/?url=",

  // Tự động chuyển link Google Drive "share link" sang "direct download link"
  autoConvertGoogleDriveLink: true,

  // Kích thước chunk khi stream (byte), phục vụ progressive rendering
  streamChunkSize: 1024 * 256,

  // Số trang cache trước/sau trang hiện tại để cuộn mượt
  preloadPages: 2,

  // Đường dẫn worker của PDF.js (bắt buộc cho hiệu năng tốt)
  pdfWorkerSrc: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.0/pdf.worker.min.js"
};
```

- Nếu `pdfUrl` là link Google Drive dạng chia sẻ, tự động convert sang dạng `uc?export=download&id=...`.
- Nếu gặp lỗi CORS, tự động thử lại qua `corsProxyUrl` (nếu `useCorsProxy: true`).
- Cho phép sau này dễ dàng đổi sang nguồn khác (self-host, CDN riêng) chỉ bằng cách sửa `de-thi.json`, không đụng vào logic.

---

## 6. Yêu cầu giao diện (UI/UX)

- **Theme tối** làm mặc định: nền `#0f0f14` hoặc tương tự, chữ sáng, điểm nhấn màu accent (ví dụ tím/xanh ngọc).
- Font dễ đọc tiếng Việt có dấu (Inter, Be Vietnam Pro, hoặc hệ thống font mặc định).
- **Breadcrumb rõ ràng** ở mọi trang (trừ trang môn học gốc) để người dùng luôn biết mình đang ở đâu trong cây Môn → Bộ đề → Đề thi.
- Animation nhẹ nhàng khi chuyển trang/hover card, không gây rối mắt.
- Có nút chuyển **sáng/tối** (tuỳ chọn, lưu trong `localStorage`).
- Trạng thái rỗng (không có kết quả) và trạng thái lỗi (tham số không hợp lệ) phải có thông báo thân thiện, có icon minh họa và nút điều hướng quay lại bước hợp lệ gần nhất.

---

## 7. Ghi chú kỹ thuật bổ sung

- Vì đây là static site, mọi thao tác với dữ liệu diễn ra ở client — không có backend để upload file, nên trong `README.md` cần hướng dẫn rõ cách:
  - Thêm **môn học mới** (thêm object vào `subjects.json`).
  - Thêm **bộ đề mới** (thêm object vào `bo-de.json`, gắn đúng `mon`).
  - Thêm **đề thi mới** (thêm object vào `de-thi.json`, gắn đúng `boDe`, upload PDF lên nguồn lưu trữ ngoài) — `id` của đề thi chính là giá trị sẽ dùng trong link `viewer.html?id=...`.
- Cân nhắc thêm sitemap tĩnh hoặc trang "Tất cả đề thi" để SEO nếu deploy công khai.
- Toàn bộ code cần có chú thích (comment) rõ ràng bằng tiếng Việt để dễ bảo trì sau này.

---

**Yêu cầu đầu ra:** Hãy tạo đầy đủ các file theo cấu trúc thư mục ở trên, với dữ liệu mẫu (2-3 môn học, mỗi môn 2 bộ đề, mỗi bộ đề 3-5 đề thi giả lập) trong các file JSON để có thể demo ngay toàn bộ luồng điều hướng: `index.html` → `index.html?mon=...` → `list-de.html?mon=...&bo-de=...` → `viewer.html?id=...`.
