# 🐟 TinyFish AI Agent Module (EduPrep THPTQG)

Module này được thiết lập riêng theo yêu cầu nhằm tận dụng số dư tài khoản TinyFish AI ($12.984) để tự động hóa nghiên cứu và sinh nội dung lý thuyết, công thức KaTeX, và mini-quiz cho hệ thống EduPrep.

---

## 💡 1. Giải thích về cơ chế tính phí ví TinyFish

Trước đây, khi bạn kiểm tra và thấy ví **chưa bị trừ tiền**, lý do là:
- Endpoint `https://api.search.tinyfish.ai` là **Web Search API** (thuộc gói tìm kiếm cơ bản, không tính phí bước duyệt trình duyệt).
- Số dư **$12.984** trong ví của bạn là dành cho **TinyFish Web Agent Automation** (`https://agent.tinyfish.ai/v1/automation/run`).
- Khi gọi Agent Automation, TinyFish sẽ khởi tạo một **Cloud Headless Browser Agent**, tự động truy cập vào website đích (Wikipedia, Vietjack, Hocmai, Cadasa,...), duyệt qua các phần tử DOM, đọc dữ liệu, trích xuất và tổng hợp câu trả lời theo yêu cầu (`goal`).
- **Chi phí**: TinyFish tính phí khoảng **$0.016 / step** (mỗi bước duyệt web của agent). Một phiên tạo bài học thường tốn từ 4 đến 6 bước (~**$0.06 - $0.09**), rất vừa vặn để tiêu thụ hết hạn mức miễn phí mà không lo lãng phí.

---

## 📁 2. Cấu trúc thư mục `server/tinyfish_agent/`

```
server/tinyfish_agent/
├── client.js             # HTTP Client gọi TinyFish Agent & Search API, đo thời gian & tính chi phí
├── curriculum_agent.js   # Pipeline sinh lý thuyết Toán, Lý, Hóa (Lớp 10 -> 12) & lưu DB
├── cli.js                # Công cụ dòng lệnh tương tác trực tiếp
└── README.md             # Tài liệu hướng dẫn chi tiết
```

---

## 🚀 3. Cách sử dụng qua CLI

Mở terminal trong thư mục dự án và chạy các lệnh sau:

### Xem danh sách các lệnh:
```bash
node server/tinyfish_agent/cli.js
```

### Xem danh sách các chuyên đề Toán - Lý - Hóa sẵn sàng sinh:
```bash
node server/tinyfish_agent/cli.js list
```

### Chạy thử nghiệm 1 lượt để kiểm tra kết nối và bước duyệt (tiêu tốn ~5 steps):
```bash
node server/tinyfish_agent/cli.js test
```

### Chạy sinh nội dung cho 1 bài học cụ thể (ví dụ bài số 0):
```bash
node server/tinyfish_agent/cli.js run --index=0
```

### Chạy sinh theo lô (batch) nhiều bài liên tiếp:
```bash
node server/tinyfish_agent/cli.js batch --count=3
```

---

## 🎨 4. Cải tiến hiển thị Markdown & Công thức Toán KaTeX (UI Fix)

Đã nâng cấp component `client/src/components/MathText.jsx` và `client/src/index.css`:
- **Đề mục Markdown (`##`, `###`)**: Được render tự động thành các heading thẻ chuẩn với đường kẻ gạch chân thẩm mỹ (`.math-h2`, `.math-h3`), không còn xuất hiện ký tự `#` thừa thãi.
- **Hộp ghi chú / Mẹo làm bài (`> [!TIP]`, `> [!NOTE]`)**: Render thành Callout Alert Box có icon bóng đèn `Lightbulb` phát sáng, viền xanh ngọc emerald, bo góc mềm mại.
- **Danh sách số thứ tự & gạch đầu dòng (`1. `, `- `)**: Được định dạng thành danh sách chuẩn thẻ `<ol>`, `<ul>`.
- **In đậm lồng công thức KaTeX (`**Phép giao ($A \cap B$)**`)**: Tokenizer đệ quy tự động nhận diện và in đậm cả văn bản lẫn ký hiệu toán học bên trong một cách mượt mà.
