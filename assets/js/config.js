// config.js - Chứa cấu hình tùy biến hệ thống
export const CONFIG = {
  // Bật/tắt proxy CORS trung gian khi nguồn PDF chặn CORS
  useCorsProxy: false,
  corsProxyUrl: "https://api.allorigins.win/raw?url=",

  // Tự động chuyển link Google Drive "share link" sang "direct download link"
  autoConvertGoogleDriveLink: true,

  // Kích thước chunk khi stream (byte), phục vụ progressive rendering
  streamChunkSize: 1024 * 64, // 64KB chunks

  // Số trang cache trước/sau trang hiện tại để cuộn mượt
  preloadPages: 2,

  // Đường dẫn worker của PDF.js (bắt buộc cho hiệu năng tốt)
  pdfWorkerSrc: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js"
};
