# Hệ Thống Ngân Hàng Đề Thi - Static Portal

Hệ thống quản lý, tìm kiếm và xem trực tuyến (streaming) đề thi dưới dạng file PDF được xây dựng bằng công nghệ thuần HTML5, CSS3 và Javascript (ES Modules).

## 1. Cấu trúc thư mục dự án

```
de-thi/
│
├── index.html                # Trang môn học (mặc định) hoặc Chuyên đề (?mon=slug)
├── list-de.html               # Trang danh sách đề thi của chuyên đề (?mon=slug&bo-de=id)
├── viewer.html                 # Trang đọc PDF trực tiếp (stream nhị phân qua PDF.js)
│
├── assets/
│   ├── css/
│   │   ├── style.css          # Giao diện chung, chủ đề sáng/tối, khung nền gradient
│   │   ├── list-de.css         # Kiểu dáng chuyên biệt của bộ lọc và lưới đề thi
│   │   └── viewer.css          # Kiểu dáng của thanh công cụ đọc PDF và khung canvas
│   │
│   └── js/
│       ├── app.js              # Xử lý logic hiển thị của index.html
│       ├── list-de.js           # Xử lý logic bộ lọc nâng cao của list-de.html
│       ├── viewer.js            # Trình đọc PDF, xử lý stream nhị phân (Progressive Loading)
│       ├── router.js             # Validate tham số URL (?mon, ?bo-de, ?id)
│       ├── config.js             # Cấu hình CORS Proxy, Google Drive converter, v.v.
│       └── utils.js              # Các hàm tiện ích bổ trợ (debounce, slugify, date, v.v.)
│
└── data/
    ├── subjects.json           # Danh sách các môn học chính
    ├── bo-de.json               # Danh sách các chuyên đề / bộ đề của môn học
    └── de-thi.json              # Chi tiết các đề thi PDF kèm thẻ tags, năm học
```

---

## 2. Hướng dẫn quản trị & Cập nhật dữ liệu

Vì đây là website tĩnh 100%, mọi thông tin đều được nạp từ các tệp JSON trong thư mục `data/`.

### Bước 1: Thêm môn học mới
Mở `data/subjects.json` và thêm một đối tượng mới:
```json
{
  "slug": "anh-van",
  "name": "Môn Tiếng Anh",
  "icon": "languages",
  "description": "Ngân hàng đề thi thử THPT Quốc gia môn Tiếng Anh."
}
```
*Lưu ý:* `icon` lấy tên class tương ứng từ hệ thống icon **Lucide Icons**.

### Bước 2: Thêm chuyên đề mới cho môn học
Mở `data/bo-de.json` và thêm chuyên đề mới (liên kết với môn học bằng trường `"mon"`):
```json
{
  "id": "tieng-anh-tenses",
  "mon": "anh-van",
  "name": "Chuyên đề: Các thì trong tiếng Anh",
  "grade": "12",
  "description": "Bài tập lý thuyết và luyện tập cấu trúc 12 thì cơ bản.",
  "totalDeThi": 1
}
```

### Bước 3: Thêm đề thi cụ thể
Mở `data/de-thi.json` và liên kết đề thi với chuyên đề bằng trường `"boDe"`:
```json
{
  "id": "tenses-bai-tap-1",
  "boDe": "tieng-anh-tenses",
  "mon": "anh-van",
  "title": "Bài tập trắc nghiệm tổng hợp 12 thì tiếng Anh có giải chi tiết",
  "year": 2026,
  "school": "Sở GD&ĐT Hà Nội",
  "tags": ["Tiếng Anh 12", "Grammar", "có đáp án"],
  "pdfUrl": "https://example.com/tai-lieu-tenses.pdf",
  "hasAnswerKey": true,
  "answerKeyUrl": "https://example.com/tai-lieu-tenses-dapan.pdf",
  "uploadedAt": "2026-07-02"
}
```

---

## 3. Cấu hình nâng cao (`assets/js/config.js`)

Nếu các liên kết PDF bị chặn bởi cơ chế bảo mật **CORS** của trình duyệt, bạn có thể cấu hình như sau trong `assets/js/config.js`:

- `useCorsProxy: true`: Cho phép nạp PDF qua proxy trung gian.
- `corsProxyUrl`: Điểm cuối của proxy (Ví dụ: `https://api.allorigins.win/raw?url=`).
- `autoConvertGoogleDriveLink: true`: Tự động chuyển đổi link Drive chia sẻ thông thường sang link tải trực tiếp.
