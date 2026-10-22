/**
 * TinyFish Curriculum Agent Pipeline
 * Bám sát chương trình Giáo Dục Phổ Thông (GDPT) mới nhất 2018 
 * theo Thông tư số 32/2018/TT-BGDĐT của Bộ Giáo dục & Đào tạo Việt Nam
 * (Áp dụng cho kỳ thi Tốt nghiệp THPT Quốc gia từ năm 2025).
 * 
 * Hỗ trợ 3 môn thi mũi nhọn: TOÁN HỌC, VẬT LÝ, HÓA HỌC (Lớp 10, 11, 12)
 * Áp dụng chuẩn danh pháp quốc tế IUPAC mới nhất cho Hóa học.
 */

const { runAutomation, searchWeb } = require('./client');
const db = require('../db');

/**
 * Danh mục chuẩn kiến thức toàn diện GDPT 2018
 */
const CURRICULUM_CATALOG = [
  // =========================================================================
  // 📐 TOÁN HỌC
  // =========================================================================

  // --- TOÁN 10 ---
  {
    subject_id: 'math',
    grade: '10',
    chapter_title: 'TOÁN 10 – CHƯƠNG 1: MỆNH ĐỀ & TẬP HỢP',
    topic_title: 'Mệnh đề toán học, mệnh đề kéo theo và mệnh đề tương đương',
    target_url: 'https://vi.wikipedia.org/wiki/M%E1%BB%87nh_%C4%91%E1%BB%81_(to%C3%A1n_h%E1%BB%8Dc)',
    search_fallback: 'menh de toan hoc menh de keo theo phu dinh toan 10'
  },
  {
    subject_id: 'math',
    grade: '10',
    chapter_title: 'TOÁN 10 – CHƯƠNG 1: MỆNH ĐỀ & TẬP HỢP',
    topic_title: 'Tập hợp và các phép toán giao, hợp, hiệu, phần bù',
    target_url: 'https://vi.wikipedia.org/wiki/T%E1%BA%ADp_h%E1%BB%A3p_(to%C3%A1n_h%E1%BB%8Dc)',
    search_fallback: 'tap hop cac phep toan tap hop toan 10'
  },
  {
    subject_id: 'math',
    grade: '10',
    chapter_title: 'TOÁN 10 – CHƯƠNG 2: BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    topic_title: 'Bất phương trình và biểu diễn miền nghiệm của hệ bất phương trình bậc nhất hai ẩn',
    target_url: 'https://vi.wikipedia.org/wiki/Quy_ho%E1%BA%A1ch_tuy%E1%BA%BFn_t%C3%ADnh',
    search_fallback: 'bat phuong trinh bac nhat hai an bieu dien mien nghiem toan 10'
  },
  {
    subject_id: 'math',
    grade: '10',
    chapter_title: 'TOÁN 10 – CHƯƠNG 3: HÀM SỐ BẬC HAI VÀ ĐỒ THỊ',
    topic_title: 'Hàm số bậc hai, đồ thị parabol và dấu của tam thức bậc hai',
    target_url: 'https://vi.wikipedia.org/wiki/H%C3%A0m_s%E1%BB%91_b%E1%BA%ADc_hai',
    search_fallback: 'ham so bac hai dau tam thuc bac hai toan 10'
  },
  {
    subject_id: 'math',
    grade: '10',
    chapter_title: 'TOÁN 10 – CHƯƠNG 4: HỆ THỨC LƯỢNG TRONG TAM GIÁC',
    topic_title: 'Định lý côsin, định lý sin và các công thức tính diện tích tam giác',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_l%C3%BD_h%C3%A0m_s%E1%BB%91_cosin',
    search_fallback: 'dinh ly cosin dinh ly sin he thuc luong toan 10'
  },
  {
    subject_id: 'math',
    grade: '10',
    chapter_title: 'TOÁN 10 – CHƯƠNG 5: VECTƠ VÀ CÁC PHÉP TOÁN',
    topic_title: 'Vectơ, tích của vectơ với một số và tích vô hướng của hai vectơ',
    target_url: 'https://vi.wikipedia.org/wiki/Vector_(h%C3%ACnh_h%E1%BB%8Dc)',
    search_fallback: 'vecto tich vo huong hai vecto toan 10'
  },
  {
    subject_id: 'math',
    grade: '10',
    chapter_title: 'TOÁN 10 – CHƯƠNG 6: PHƯƠNG PHÁP TOẠ ĐỘ TRONG MẶT PHẲNG',
    topic_title: 'Phương trình đường thẳng, đường tròn và ba đường conic (Elip, Parabol, Hypebol)',
    target_url: 'https://vi.wikipedia.org/wiki/H%C3%ACnh_c%C3%B4-nic',
    search_fallback: 'phuong trinh duong thang duong tron ba duong conic toan 10'
  },
  {
    subject_id: 'math',
    grade: '10',
    chapter_title: 'TOÁN 10 – CHƯƠNG 7: ĐẠI SỐ TỔ HỢP',
    topic_title: 'Quy tắc đếm, hoán vị, chỉnh hợp, tổ hợp và khai triển nhị thức Newton',
    target_url: 'https://vi.wikipedia.org/wiki/T%E1%BB%95_h%E1%BB%A3p',
    search_fallback: 'quy tac dem hoan vi chinh hop to hop nhi thuc newton toan 10'
  },
  {
    subject_id: 'math',
    grade: '10',
    chapter_title: 'TOÁN 10 – CHƯƠNG 8: MỘT SỐ YẾU TỐ THỐNG KÊ & XÁC SUẤT',
    topic_title: 'Các số đặc trưng đo xu thế trung tâm và mức độ phân tán của mẫu số liệu',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BB%99_l%E1%BB%87ch_chu%E1%BA%A9n',
    search_fallback: 'so dac trung do xu the trung tam phuong sai do lech chuan toan 10'
  },

  // --- TOÁN 11 ---
  {
    subject_id: 'math',
    grade: '11',
    chapter_title: 'TOÁN 11 – CHƯƠNG 1: HÀM SỐ LƯỢNG GIÁC & PHƯƠNG TRÌNH LƯỢNG GIÁC',
    topic_title: 'Công thức lượng giác cơ bản, công thức cộng, nhân đôi và biến đổi tích thành tổng',
    target_url: 'https://vi.wikipedia.org/wiki/Danh_s%C3%A1ch_%C4%91%E1%BA%B3ng_th%E1%BB%A9c_l%C6%B0%E1%BB%A3ng_gi%C3%A1c',
    search_fallback: 'cong thuc luong giac nhan doi cong bien doi toan 11'
  },
  {
    subject_id: 'math',
    grade: '11',
    chapter_title: 'TOÁN 11 – CHƯƠNG 1: HÀM SỐ LƯỢNG GIÁC & PHƯƠNG TRÌNH LƯỢNG GIÁC',
    topic_title: 'Các hàm số lượng giác và phương trình lượng giác cơ bản',
    target_url: 'https://vi.wikipedia.org/wiki/H%C3%A0m_l%C6%B0%E1%BB%A3ng_gi%C3%A1c',
    search_fallback: 'ham so luong giac phuong trinh luong giac co ban toan 11'
  },
  {
    subject_id: 'math',
    grade: '11',
    chapter_title: 'TOÁN 11 – CHƯƠNG 2: DÃY SỐ, CẤP SỐ CỘNG VÀ CẤP SỐ NHÂN',
    topic_title: 'Dãy số, định nghĩa và công thức số hạng tổng quát của cấp số cộng, cấp số nhân',
    target_url: 'https://vi.wikipedia.org/wiki/C%E1%BA%A5p_s%E1%BB%91_nh%C3%A2n',
    search_fallback: 'cap so cong cap so nhan cong thuc tong toan 11'
  },
  {
    subject_id: 'math',
    grade: '11',
    chapter_title: 'TOÁN 11 – CHƯƠNG 3: GIỚI HẠN VÀ HÀM SỐ LIÊN TỤC',
    topic_title: 'Giới hạn của dãy số, giới hạn hàm số và xét tính liên tục của hàm số',
    target_url: 'https://vi.wikipedia.org/wiki/Gi%E1%BB%9Bi_h%E1%BA%A1n_c%E1%BB%A7a_h%C3%A0m_s%E1%BB%91',
    search_fallback: 'gioi han ham so gioi han day so ham so lien tuc toan 11'
  },
  {
    subject_id: 'math',
    grade: '11',
    chapter_title: 'TOÁN 11 – CHƯƠNG 4: HÀM SỐ MŨ VÀ HÀM SỐ LÔGARIT',
    topic_title: 'Lũy thừa, phép tính lôgarit, hàm số mũ, hàm số logarit và phương trình mũ logarit',
    target_url: 'https://vi.wikipedia.org/wiki/Logarit',
    search_fallback: 'luy thua logarit ham so mu logarit toan 11'
  },
  {
    subject_id: 'math',
    grade: '11',
    chapter_title: 'TOÁN 11 – CHƯƠNG 5: ĐẠO HÀM VÀ Ý NGHĨA HÌNH HỌC',
    topic_title: 'Định nghĩa đạo hàm, quy tắc tính đạo hàm và ý nghĩa hình học của tiếp tuyến',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BA%A1o_h%C3%A0m',
    search_fallback: 'dinh nghia dao ham quy tac tinh dao ham phuong trinh tiep tuyen toan 11'
  },
  {
    subject_id: 'math',
    grade: '11',
    chapter_title: 'TOÁN 11 – CHƯƠNG 6: QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN',
    topic_title: 'Đường thẳng vuông góc với mặt phẳng, hai mặt phẳng vuông góc và khoảng cách',
    target_url: 'https://vi.wikipedia.org/wiki/Quan_h%E1%BB%87_vu%C3%B4ng_g%C3%B3c',
    search_fallback: 'duong thang vuong goc mat phang hai mat phang vuong goc khoang cach toan 11'
  },
  {
    subject_id: 'math',
    grade: '11',
    chapter_title: 'TOÁN 11 – CHƯƠNG 7: XÁC SUẤT CỔ ĐIỂN VÀ QUY TẮC TÍNH XÁC SUẤT',
    topic_title: 'Biến cố hợp, biến cố giao, biến cố độc lập và quy tắc cộng nhân xác suất',
    target_url: 'https://vi.wikipedia.org/wiki/L%C3%BD_thuy%E1%BA%BFt_x%C3%A1c_su%E1%BA%A5t',
    search_fallback: 'bien co giao hop doc lap quy tac cong nhan xac suat toan 11'
  },

  // --- TOÁN 12 ---
  {
    subject_id: 'math',
    grade: '12',
    chapter_title: 'TOÁN 12 – CHƯƠNG 1: ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT HÀM SỐ',
    topic_title: 'Tính đơn điệu, cực trị và giá trị lớn nhất nhỏ nhất của hàm số',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90i%E1%BB%83m_c%E1%BB%B1c_tr%E1%BB%8B',
    search_fallback: 'tinh don dieu cuc tri gia tri lon nhat nho nhat toan 12'
  },
  {
    subject_id: 'math',
    grade: '12',
    chapter_title: 'TOÁN 12 – CHƯƠNG 1: ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT HÀM SỐ',
    topic_title: 'Đường tiệm cận đứng, tiệm cận ngang, tiệm cận xiên và khảo sát đồ thị hàm số',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%C6%B0%E1%BB%9Dng_ti%E1%BB%87m_c%E1%BA%ADn',
    search_fallback: 'tiem can dung tiem can ngang tiem can xien do thi toan 12'
  },
  {
    subject_id: 'math',
    grade: '12',
    chapter_title: 'TOÁN 12 – CHƯƠNG 2: TỌA ĐỘ VÉC-TƠ TRONG KHÔNG GIAN OXYZ',
    topic_title: 'Hệ trục tọa độ Oxyz, tọa độ của điểm, tọa độ vectơ và các biểu thức tọa độ',
    target_url: 'https://vi.wikipedia.org/wiki/H%E1%BB%87_t%E1%BB%8Da_%C4%91%E1%BB%99_Descartes',
    search_fallback: 'he toa do oxyz toa do diem vecto phep toan toan 12'
  },
  {
    subject_id: 'math',
    grade: '12',
    chapter_title: 'TOÁN 12 – CHƯƠNG 3: PHƯƠNG TRÌNH MẶT PHẲNG, ĐƯỜNG THẲNG & MẶT CẦU',
    topic_title: 'Phương trình tổng quát của mặt phẳng, phương trình đường thẳng và vị trí tương đối',
    target_url: 'https://vi.wikipedia.org/wiki/M%E1%BA%B7t_ph%E1%BA%B3ng',
    search_fallback: 'phuong trinh mat phang phuong trinh duong thang oxyz toan 12'
  },
  {
    subject_id: 'math',
    grade: '12',
    chapter_title: 'TOÁN 12 – CHƯƠNG 3: PHƯƠNG TRÌNH MẶT PHẲNG, ĐƯỜNG THẲNG & MẶT CẦU',
    topic_title: 'Phương trình mặt cầu trong không gian Oxyz và bài toán khoảng cách, góc',
    target_url: 'https://vi.wikipedia.org/wiki/M%E1%BA%B7t_c%E1%BA%A7u',
    search_fallback: 'phuong trinh mat cau goc khoang cach oxyz toan 12'
  },
  {
    subject_id: 'math',
    grade: '12',
    chapter_title: 'TOÁN 12 – CHƯƠNG 4: NGUYÊN HÀM, TÍCH PHÂN VÀ ỨNG DỤNG',
    topic_title: 'Định nghĩa nguyên hàm, bảng nguyên hàm cơ bản và các phương pháp tính tích phân',
    target_url: 'https://vi.wikipedia.org/wiki/Nguy%C3%AAn_h%C3%A0m',
    search_fallback: 'nguyen ham tich phan bang nguyen ham co ban toan 12'
  },
  {
    subject_id: 'math',
    grade: '12',
    chapter_title: 'TOÁN 12 – CHƯƠNG 4: NGUYÊN HÀM, TÍCH PHÂN VÀ ỨNG DỤNG',
    topic_title: 'Ứng dụng hình học của tích phân để tính diện tích hình phẳng và thể tích tròn xoay',
    target_url: 'https://vi.wikipedia.org/wiki/T%C3%ADch_ph%C3%A2n',
    search_fallback: 'ung dung tich phan dien tich hinh phang the tich tron xoay toan 12'
  },
  {
    subject_id: 'math',
    grade: '12',
    chapter_title: 'TOÁN 12 – CHƯƠNG 5: XÁC SUẤT CÓ ĐIỀU KIỆN & CÔNG THỨC BAYES',
    topic_title: 'Xác suất có điều kiện, công thức xác suất toàn phần và định lý Bayes',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_l%C3%BD_Bayes',
    search_fallback: 'xac suat co dieu kien xac suat toan phan cong thuc bayes toan 12'
  },

  // =========================================================================
  // ⚡ VẬT LÝ
  // =========================================================================

  // --- VẬT LÝ 10 ---
  {
    subject_id: 'physics',
    grade: '10',
    chapter_title: 'VẬT LÝ 10 – CHƯƠNG 1: ĐỘNG HỌC CHUYỂN ĐỘNG THẲNG',
    topic_title: 'Độ dịch chuyển, vận tốc, gia tốc và phương trình chuyển động thẳng biến đổi đều',
    target_url: 'https://vi.wikipedia.org/wiki/Chuy%E1%BB%83n_%C4%91%E1%BB%99ng_th%E1%BA%B3ng_bi%E1%BA%BFn_%C4%91%E1%BB%95i_%C4%91%E1%BB%81u',
    search_fallback: 'do dich chuyen van toc gia toc chuyen dong thang bien doi deu ly 10'
  },
  {
    subject_id: 'physics',
    grade: '10',
    chapter_title: 'VẬT LÝ 10 – CHƯƠNG 2: ĐỘNG LỰC HỌC VÀ BA ĐỊNH LUẬT NEWTON',
    topic_title: 'Ba định luật Newton, trọng lực, lực ma sát và lực cản của môi trường',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_lu%E1%BA%ADt_chuy%E1%BB%83n_%C4%91%E1%BB%99ng_Newton',
    search_fallback: 'ba dinh luat newton luc ma sat trong luc luc can ly 10'
  },
  {
    subject_id: 'physics',
    grade: '10',
    chapter_title: 'VẬT LÝ 10 – CHƯƠNG 3: CÔNG, NĂNG LƯỢNG VÀ CÔNG SUẤT',
    topic_title: 'Công cơ học, động năng, thế năng và định luật bảo toàn cơ năng',
    target_url: 'https://vi.wikipedia.org/wiki/C%C6%A1_n%C4%83ng',
    search_fallback: 'cong co hoc dong nang the nang dinh luat bao toan co nang ly 10'
  },
  {
    subject_id: 'physics',
    grade: '10',
    chapter_title: 'VẬT LÝ 10 – CHƯƠNG 4: ĐỘNG LƯỢNG VÀ ĐỊNH LUẬT BẢO TOÀN ĐỘNG LƯỢNG',
    topic_title: 'Động lượng, xung lượng của lực và định luật bảo toàn động lượng trong va chạm',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BB%99ng_l%C6%B0%E1%BB%A3ng',
    search_fallback: 'dong luong xung luong dinh luat bao toan dong luong va cham ly 10'
  },
  {
    subject_id: 'physics',
    grade: '10',
    chapter_title: 'VẬT LÝ 10 – CHƯƠNG 5: CHUYỂN ĐỘNG TRÒN ĐỀU',
    topic_title: 'Tốc độ góc, gia tốc hướng tâm và lực hướng tâm trong chuyển động tròn đều',
    target_url: 'https://vi.wikipedia.org/wiki/Chuy%E1%BB%83n_%C4%91%E1%BB%99ng_tr%C3%B2n_%C4%91%E1%BB%81u',
    search_fallback: 'chuyen dong tron deu toc do goc gia toc huong tam luc huong tam ly 10'
  },
  {
    subject_id: 'physics',
    grade: '10',
    chapter_title: 'VẬT LÝ 10 – CHƯƠNG 6: BIẾN DẠNG CỦA VẬT RẮN & ĐỊNH LUẬT HOOKE',
    topic_title: 'Biến dạng kéo, biến dạng nén, giới hạn đàn hồi và định luật Hooke',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_lu%E1%BA%ADt_Hooke',
    search_fallback: 'bien dang keo nen dinh luat hooke gioi han dan hoi ly 10'
  },

  // --- VẬT LÝ 11 ---
  {
    subject_id: 'physics',
    grade: '11',
    chapter_title: 'VẬT LÝ 11 – CHƯƠNG 1: DAO ĐỘNG CƠ HỌC',
    topic_title: 'Phương trình dao động điều hòa, vận tốc, gia tốc, chu kỳ và pha dao động',
    target_url: 'https://vi.wikipedia.org/wiki/Dao_%C4%91%E1%BB%99ng_%C4%91i%E1%BB%81u_h%C3%B2a',
    search_fallback: 'dao dong dieu hoa phuong trinh van toc gia toc chu ky ly 11'
  },
  {
    subject_id: 'physics',
    grade: '11',
    chapter_title: 'VẬT LÝ 11 – CHƯƠNG 1: DAO ĐỘNG CƠ HỌC',
    topic_title: 'Con lắc lò xo, con lắc đơn và sự chuyển hóa năng lượng trong dao động điều hòa',
    target_url: 'https://vi.wikipedia.org/wiki/Con_l%E1%BA%AFc_l%C3%B2_xo',
    search_fallback: 'con lac lo xo con lac don nang luong dao dong ly 11'
  },
  {
    subject_id: 'physics',
    grade: '11',
    chapter_title: 'VẬT LÝ 11 – CHƯƠNG 1: DAO ĐỘNG CƠ HỌC',
    topic_title: 'Dao động tắt dần, dao động cưỡng bức và hiện tượng cộng hưởng cơ',
    target_url: 'https://vi.wikipedia.org/wiki/C%E1%BB%99ng_h%C6%B0%E1%BB%9Fng',
    search_fallback: 'dao dong tat dan dao dong cuong buc cong huong co ly 11'
  },
  {
    subject_id: 'physics',
    grade: '11',
    chapter_title: 'VẬT LÝ 11 – CHƯƠNG 2: SÓNG CƠ VÀ SÓNG ÂM',
    topic_title: 'Phương trình sóng cơ, sự truyền sóng, bước sóng và giao thoa sóng',
    target_url: 'https://vi.wikipedia.org/wiki/S%C3%B3ng_c%C6%A1_h%E1%BB%8Dc',
    search_fallback: 'phuong trinh song co buoc song giao thoa song ly 11'
  },
  {
    subject_id: 'physics',
    grade: '11',
    chapter_title: 'VẬT LÝ 11 – CHƯƠNG 2: SÓNG CƠ VÀ SÓNG ÂM',
    topic_title: 'Sóng dừng trên sợi dây và các đặc trưng vật lý, sinh lý của âm',
    target_url: 'https://vi.wikipedia.org/wiki/S%C3%B3ng_d%E1%BB%ABng',
    search_fallback: 'song dung dac trung vat ly sinh ly am ly 11'
  },
  {
    subject_id: 'physics',
    grade: '11',
    chapter_title: 'VẬT LÝ 11 – CHƯƠNG 3: ĐIỆN TRƯỜNG VÀ ĐIỆN THẾ',
    topic_title: 'Định luật Coulomb, cường độ điện trường, điện thế và điện dung của tụ điện',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_lu%E1%BA%ADt_Coulomb',
    search_fallback: 'dinh luat coulomb cuong do dien truong dien the tu dien ly 11'
  },
  {
    subject_id: 'physics',
    grade: '11',
    chapter_title: 'VẬT LÝ 11 – CHƯƠNG 4: DÒNG ĐIỆN KHÔNG ĐỔI & MẠCH ĐIỆN',
    topic_title: 'Cường độ dòng điện, định luật Ohm cho toàn mạch, nguồn điện và công suất điện',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_lu%E1%BA%ADt_Ohm',
    search_fallback: 'dinh luat ohm toan mach suat dien dong cong suat dien ly 11'
  },

  // --- VẬT LÝ 12 ---
  {
    subject_id: 'physics',
    grade: '12',
    chapter_title: 'VẬT LÝ 12 – CHƯƠNG 1: VẬT LÝ NHIỆT VÀ NỘI NĂNG',
    topic_title: 'Nội năng, định luật 1 nhiệt động lực học và nhiệt dung riêng',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_lu%E1%BA%ADt_th%E1%BB%A9_nh%E1%BA%A5t_nhi%E1%BB%87t_%C4%91%E1%BB%99ng_l%E1%BB%B1c_h%E1%BB%8Dc',
    search_fallback: 'noi nang dinh luat 1 nhiet dong luc hoc nhiet dung rieng ly 12'
  },
  {
    subject_id: 'physics',
    grade: '12',
    chapter_title: 'VẬT LÝ 12 – CHƯƠNG 1: VẬT LÝ NHIỆT VÀ NỘI NĂNG',
    topic_title: 'Nhiệt nóng chảy riêng, nhiệt hóa hơi riêng và sự chuyển thể của các chất',
    target_url: 'https://vi.wikipedia.org/wiki/Nhi%E1%BB%87t_dung_ri%C3%AAng',
    search_fallback: 'nhiet nong chay rieng nhiet hoa hoi rieng chuyen the ly 12'
  },
  {
    subject_id: 'physics',
    grade: '12',
    chapter_title: 'VẬT LÝ 12 – CHƯƠNG 2: KHÍ LÝ TƯỞNG & THUYẾT ĐỘNG HỌC PHÂN TỬ',
    topic_title: 'Mô hình động học phân tử, định luật Boyle, định luật Charles và phương trình trạng thái pV=nRT',
    target_url: 'https://vi.wikipedia.org/wiki/Ph%C6%B0%C6%A1ng_tr%C3%ACnh_kh%C3%AD_l%C3%BD_t%C6%B0%E1%BB%9Fng',
    search_fallback: 'dinh luat boyle charles phuong trinh khi ly tuong pv nrt ly 12'
  },
  {
    subject_id: 'physics',
    grade: '12',
    chapter_title: 'VẬT LÝ 12 – CHƯƠNG 3: TỪ TRƯỜNG VÀ CẢM ỨNG ĐIỆN TỪ',
    topic_title: 'Từ trường, cảm ứng từ và lực từ tác dụng lên đoạn dây dẫn mang dòng điện',
    target_url: 'https://vi.wikipedia.org/wiki/T%E1%BB%AB_tr%C6%B0%E1%BB%9Dng',
    search_fallback: 'tu truong cam ung tu luc tu doan day mang dong dien ly 12'
  },
  {
    subject_id: 'physics',
    grade: '12',
    chapter_title: 'VẬT LÝ 12 – CHƯƠNG 3: TỪ TRƯỜNG VÀ CẢM ỨNG ĐIỆN TỪ',
    topic_title: 'Từ thông, hiện tượng cảm ứng điện từ, định luật Faraday và định luật Lenz',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_lu%E1%BA%ADt_c%E1%BA%A3m_%E1%BB%A9ng_Faraday',
    search_fallback: 'tu thong cam ung dien tu dinh luat faraday dinh luat lenz ly 12'
  },
  {
    subject_id: 'physics',
    grade: '12',
    chapter_title: 'VẬT LÝ 12 – CHƯƠNG 4: ĐẠI CƯƠNG DÒNG ĐIỆN XOAY CHIỀU',
    topic_title: 'Nguyên tắc tạo ra dòng điện xoay chiều, các giá trị hiệu dụng và máy biến áp',
    target_url: 'https://vi.wikipedia.org/wiki/D%C3%B2ng_%C4%91i%E1%BB%87n_xoay_chi%E1%BB%81u',
    search_fallback: 'dai cuong dong dien xoay chieu gia tri hieu dung may bien ap ly 12'
  },
  {
    subject_id: 'physics',
    grade: '12',
    chapter_title: 'VẬT LÝ 12 – CHƯƠNG 5: VẬT LÝ HẠT NHÂN & PHÓNG XẠ',
    topic_title: 'Cấu trúc hạt nhân, độ hụt khối, năng lượng liên kết và phản ứng phóng xạ, phân hạch',
    target_url: 'https://vi.wikipedia.org/wiki/H%E1%BA%A1t_nh%C3%A2n_nguy%C3%AAn_t%E1%BB%AD',
    search_fallback: 'cau truc hat nhan do hut khoi nang luong lien ket phong xa ly 12'
  },

  // =========================================================================
  // 🧪 HÓA HỌC (CHUẨN DANH PHÁP IUPAC MỚI NHẤT)
  // =========================================================================

  // --- HÓA HỌC 10 ---
  {
    subject_id: 'chemistry',
    grade: '10',
    chapter_title: 'HÓA HỌC 10 – CHƯƠNG 1: CẤU TẠO NGUYÊN TỬ',
    topic_title: 'Thành phần nguyên tử, hạt nhân, orbital nguyên tử và cấu hình electron',
    target_url: 'https://vi.wikipedia.org/wiki/C%E1%BA%A5u_h%C3%ACnh_electron',
    search_fallback: 'thanh phan nguyen tu orbital nguyen tu cau hinh electron hoa 10'
  },
  {
    subject_id: 'chemistry',
    grade: '10',
    chapter_title: 'HÓA HỌC 10 – CHƯƠNG 2: BẢNG TUẦN HOÀN & ĐỊNH LUẬT TUẦN HOÀN',
    topic_title: 'Cấu tạo bảng tuần hoàn, ô, chu kỳ, nhóm và quy luật biến đổi tuần hoàn các tính chất',
    target_url: 'https://vi.wikipedia.org/wiki/B%E1%BA%A3ng_tu%E1%BA%A7n_ho%C3%A0n',
    search_fallback: 'bang tuan hoan chu ky nhom quy luat bien doi tuan hoan hoa 10'
  },
  {
    subject_id: 'chemistry',
    grade: '10',
    chapter_title: 'HÓA HỌC 10 – CHƯƠNG 3: LIÊN KẾT HÓA HỌC',
    topic_title: 'Quy tắc Octet, liên kết ion, liên kết cộng hóa trị và tương tác van der Waals',
    target_url: 'https://vi.wikipedia.org/wiki/Li%C3%AAn_k%E1%BA%BFt_h%C3%B3a_h%E1%BB%8Dc',
    search_fallback: 'quy tac octet lien ket ion lien ket cong hoa tri van der waals hoa 10'
  },
  {
    subject_id: 'chemistry',
    grade: '10',
    chapter_title: 'HÓA HỌC 10 – CHƯƠNG 4: PHẢN ỨNG OXI HÓA – KHỬ',
    topic_title: 'Số oxi hóa, chất oxi hóa, chất khử và phương pháp thăng bằng electron',
    target_url: 'https://vi.wikipedia.org/wiki/Ph%E1%BA%A3n_%E1%BB%A9ng_oxy_h%C3%B3a%E2%80%93kh%E1%BB%AD',
    search_fallback: 'so oxi hoa chat oxi hoa chat khu thang bang electron hoa 10'
  },
  {
    subject_id: 'chemistry',
    grade: '10',
    chapter_title: 'HÓA HỌC 10 – CHƯƠNG 5: NĂNG LƯỢNG HÓA HỌC',
    topic_title: 'Phản ứng tỏa nhiệt, thu nhiệt và biến thiên enthalpy chuẩn Delta r H 298',
    target_url: 'https://vi.wikipedia.org/wiki/Enthalpy',
    search_fallback: 'phan ung toa nhiet thu nhiet bien thien enthalpy hoa 10'
  },
  {
    subject_id: 'chemistry',
    grade: '10',
    chapter_title: 'HÓA HỌC 10 – CHƯƠNG 6: TỐC ĐỘ PHẢN ỨNG HÓA HỌC',
    topic_title: 'Khái niệm tốc độ phản ứng, định luật tác dụng khối lượng và các yếu tố ảnh hưởng',
    target_url: 'https://vi.wikipedia.org/wiki/T%E1%BB%91c_%C4%91%E1%BB%99_ph%E1%BA%A3n_%E1%BB%A9ng',
    search_fallback: 'toc do phan ung dinh luat tac dung khoi luong hang so toc do hoa 10'
  },
  {
    subject_id: 'chemistry',
    grade: '10',
    chapter_title: 'HÓA HỌC 10 – CHƯƠNG 7: NGUYÊN TỐ NHÓM VIIA (HALOGEN)',
    topic_title: 'Đơn chất halogen (Fluorine, Chlorine, Bromine, Iodine) và hợp chất hydrogen halide',
    target_url: 'https://vi.wikipedia.org/wiki/Halogen',
    search_fallback: 'don chat halogen hydrohalic acid tinh chat hoa hoc hoa 10'
  },

  // --- HÓA HỌC 11 ---
  {
    subject_id: 'chemistry',
    grade: '11',
    chapter_title: 'HÓA HỌC 11 – CHƯƠNG 1: CÂN BẰNG HÓA HỌC',
    topic_title: 'Khái niệm phản ứng thuận nghịch, hằng số cân bằng Kc và nguyên lý chuyển dịch Le Chatelier',
    target_url: 'https://vi.wikipedia.org/wiki/Nguy%C3%AAn_l%C3%BD_Le_Chatelier',
    search_fallback: 'phan ung thuan nghich hang so can bang Kc nguyen ly le chatelier hoa 11'
  },
  {
    subject_id: 'chemistry',
    grade: '11',
    chapter_title: 'HÓA HỌC 11 – CHƯƠNG 1: CÂN BẰNG HÓA HỌC',
    topic_title: 'Cân bằng trong dung dịch nước, thuyết acid-base Brønsted-Lowry và thang đo pH',
    target_url: 'https://vi.wikipedia.org/wiki/Thuy%E1%BA%BFt_axit-baz%C6%A1_Br%C3%B8nsted-Lowry',
    search_fallback: 'can bang dung dich nuoc thuyet bronsted lowry tinh pH hoa 11'
  },
  {
    subject_id: 'chemistry',
    grade: '11',
    chapter_title: 'HÓA HỌC 11 – CHƯƠNG 2: NITROGEN VÀ SULFUR',
    topic_title: 'Đơn chất nitrogen, khí ammonia (NH3) và tính chất muối ammonium',
    target_url: 'https://vi.wikipedia.org/wiki/Amoniac',
    search_fallback: 'don chat nitrogen ammonia muoi ammonium hoa 11'
  },
  {
    subject_id: 'chemistry',
    grade: '11',
    chapter_title: 'HÓA HỌC 11 – CHƯƠNG 2: NITROGEN VÀ SULFUR',
    topic_title: 'Nitric acid (HNO3), sulfur dioxide (SO2) và sulfuric acid (H2SO4)',
    target_url: 'https://vi.wikipedia.org/wiki/Axit_sunfuric',
    search_fallback: 'nitric acid sulfur dioxide sulfuric acid hoa 11'
  },
  {
    subject_id: 'chemistry',
    grade: '11',
    chapter_title: 'HÓA HỌC 11 – CHƯƠNG 3: ĐẠI CƯƠNG HÓA HỌC HỮU CƠ',
    topic_title: 'Hợp chất hữu cơ, nhóm chức, phổ hồng ngoại IR và hiện tượng đồng phân cấu tạo',
    target_url: 'https://vi.wikipedia.org/wiki/H%C3%B3a_h%E1%BB%8Dc_h%E1%BB%AFu_c%C6%A1',
    search_fallback: 'dai cuong hoa huu co nhom chuc pho hong ngoai IR dong phan hoa 11'
  },
  {
    subject_id: 'chemistry',
    grade: '11',
    chapter_title: 'HÓA HỌC 11 – CHƯƠNG 4: HYDROCARBON',
    topic_title: 'Alkane, Alkene, Alkyne: cấu trúc, danh pháp IUPAC và các phản ứng đặc trưng',
    target_url: 'https://vi.wikipedia.org/wiki/Ankan',
    search_fallback: 'alkane alkene alkyne danh phap IUPAC phan ung cong the hoa 11'
  },
  {
    subject_id: 'chemistry',
    grade: '11',
    chapter_title: 'HÓA HỌC 11 – CHƯƠNG 4: HYDROCARBON',
    topic_title: 'Arene (Benzene, Toluene): cấu trúc vòng thơm và phản ứng thế electrophin',
    target_url: 'https://vi.wikipedia.org/wiki/Benzen',
    search_fallback: 'arene benzene toluene vong thom phan ung the hoa 11'
  },
  {
    subject_id: 'chemistry',
    grade: '11',
    chapter_title: 'HÓA HỌC 11 – CHƯƠNG 5: DẪN XUẤT HALOGEN, ALCOHOL VÀ PHENOL',
    topic_title: 'Dẫn xuất halogen, alcohol (ethanol, glycerol) và phenol: liên kết hydrogen và tính chất hóa học',
    target_url: 'https://vi.wikipedia.org/wiki/Etanol',
    search_fallback: 'dan xuat halogen alcohol ethanol glycerol phenol hoa 11'
  },
  {
    subject_id: 'chemistry',
    grade: '11',
    chapter_title: 'HÓA HỌC 11 – CHƯƠNG 6: HỢP CHẤT CARBONYL VÀ CARBOXYLIC ACID',
    topic_title: 'Aldehyde, ketone và carboxylic acid (acetic acid): phản ứng tráng bạc và tính acid',
    target_url: 'https://vi.wikipedia.org/wiki/Axit_axetic',
    search_fallback: 'aldehyde ketone carboxylic acid acetic acid phan ung trang bac hoa 11'
  },

  // --- HÓA HỌC 12 ---
  {
    subject_id: 'chemistry',
    grade: '12',
    chapter_title: 'HÓA HỌC 12 – CHƯƠNG 1: ESTER VÀ LIPID',
    topic_title: 'Ester, lipid, chất béo và phản ứng xà phòng hóa điều chế xà phòng, chất giặt rửa',
    target_url: 'https://vi.wikipedia.org/wiki/Este',
    search_fallback: 'ester lipid chat beo phan ung xa phong hoa hoa 12'
  },
  {
    subject_id: 'chemistry',
    grade: '12',
    chapter_title: 'HÓA HỌC 12 – CHƯƠNG 2: CARBOHYDRATE',
    topic_title: 'Glucose, fructose, saccharose, maltose, tinh bột và cellulose',
    target_url: 'https://vi.wikipedia.org/wiki/Carbohydrat',
    search_fallback: 'glucose fructose saccharose tinh bot cellulose hoa 12'
  },
  {
    subject_id: 'chemistry',
    grade: '12',
    chapter_title: 'HÓA HỌC 12 – CHƯƠNG 3: HỢP CHẤT CHỨA NITROGEN',
    topic_title: 'Amine, amino acid, peptide, protein và vai trò của enzyme',
    target_url: 'https://vi.wikipedia.org/wiki/Acid_amin',
    search_fallback: 'amine amino acid peptide protein enzyme hoa 12'
  },
  {
    subject_id: 'chemistry',
    grade: '12',
    chapter_title: 'HÓA HỌC 12 – CHƯƠNG 4: POLYMER VÀ VẬT LIỆU POLYMER',
    topic_title: 'Phản ứng trùng hợp, trùng ngưng và các vật liệu polymer (chất dẻo, tơ tổng hợp, cao su, keo dán)',
    target_url: 'https://vi.wikipedia.org/wiki/Polyme',
    search_fallback: 'polymer phan ung trung hop trung ngung chat deo to cao su hoa 12'
  },
  {
    subject_id: 'chemistry',
    grade: '12',
    chapter_title: 'HÓA HỌC 12 – CHƯƠNG 5: PIN ĐIỆN VÀ ĐIỆN PHÂN',
    topic_title: 'Thế điện cực chuẩn, nguyên tắc hoạt động của pin Galvani, quá trình điện phân và chống ăn mòn kim loại',
    target_url: 'https://vi.wikipedia.org/wiki/%C4%90i%E1%BB%87n_ph%C3%A2n',
    search_fallback: 'the dien cuc chuan pin galvani qua trinh dien phan an mon kim loai hoa 12'
  },
  {
    subject_id: 'chemistry',
    grade: '12',
    chapter_title: 'HÓA HỌC 12 – CHƯƠNG 6: ĐẠI CƯƠNG VỀ KIM LOẠI',
    topic_title: 'Cấu tạo tinh thể kim loại, liên kết kim loại, tính chất vật lý và hóa học chung của kim loại',
    target_url: 'https://vi.wikipedia.org/wiki/Kim_lo%E1%BA%A1i',
    search_fallback: 'dai cuong kim loai tinh chat vat ly hoa hoc lien ket kim loai hoa 12'
  },
  {
    subject_id: 'chemistry',
    grade: '12',
    chapter_title: 'HÓA HỌC 12 – CHƯƠNG 7: NGUYÊN TỐ NHÓM IA VÀ NHÓM IIA',
    topic_title: 'Kim loại kiềm (Nhóm IA), kim loại kiềm thổ (Nhóm IIA), nhôm và hợp chất quan trọng',
    target_url: 'https://vi.wikipedia.org/wiki/Kim_lo%E1%BA%A1i_ki%E1%BB%81m',
    search_fallback: 'kim loai kiem nhom IA kim loai kiem tho nhom IIA nhom hoa 12'
  },
  {
    subject_id: 'chemistry',
    grade: '12',
    chapter_title: 'HÓA HỌC 12 – CHƯƠNG 8: KIM LOẠI CHUYỂN TIẾP THỨ NHẤT & PHỨC CHẤT',
    topic_title: 'Sơ lược về dãy kim loại chuyển tiếp thứ nhất và cấu tạo, danh pháp phức chất cơ bản',
    target_url: 'https://vi.wikipedia.org/wiki/Ph%E1%BB%A9c_ch%E1%BA%A5t',
    search_fallback: 'kim loai chuyen tiep thu nhat cau tao phuc chat phoi tu nguyen tu trung tam hoa 12'
  }
];

/**
 * Lọc danh sách theo môn học
 */
function getTopicsBySubject(subjectId) {
  return CURRICULUM_CATALOG.filter(t => t.subject_id === subjectId.toLowerCase());
}

/**
 * Lọc danh sách theo khối lớp (10, 11, 12)
 */
function getTopicsByGrade(grade) {
  return CURRICULUM_CATALOG.filter(t => String(t.grade) === String(grade));
}

/**
 * Tạo prompt tối ưu cho TinyFish Web Agent
 */
function buildAgentGoal(topic) {
  return `
Bạn là chuyên gia sư phạm THPT Quốc gia theo chương trình GDPT mới nhất 2025 của Bộ Giáo dục & Đào tạo Việt Nam (Thông tư 32/2018/TT-BGDĐT).
Nhiệm vụ của bạn là truy cập vào trang này và trích xuất/tổng hợp bài học ngắn gọn, cô đọng nhất về chủ đề: "${topic.topic_title}" thuộc môn ${topic.subject_id.toUpperCase()} (Lớp ${topic.grade}).

YÊU CẦU ĐẦU RA (ĐỊNH DẠNG JSON):
Hãy trả về DUY NHẤT một khối JSON hợp lệ theo đúng cấu trúc sau (không kèm văn bản ngoài):
{
  "summary": "Tóm tắt 1 câu trọng tâm cốt lõi của bài học (khoảng 20-35 từ)",
  "content_markdown": "Nội dung lý thuyết chuẩn Markdown:\\n- Dùng ## cho các đề mục chính (ví dụ: ## I. Định nghĩa & Bản chất, ## II. Tính chất & Công thức)\\n- Dùng ### cho đề mục phụ\\n- Các công thức toán/lý/hóa đặt trong cặp dấu $...$ (inline) hoặc $$...$$ (khối riêng) dạng chuẩn KaTeX\\n- Đưa vào ít nhất 1 hộp mẹo thi: > [!TIP]\\n> Nội dung mẹo tránh bẫy hoặc phương pháp giải nhanh bấm máy casio",
  "key_formulas": "Các công thức cốt lõi nhất cần thuộc lòng, mỗi công thức trên 1 dòng dạng KaTeX",
  "quiz": {
    "question": "Câu hỏi trắc nghiệm kiểm tra nhanh hiểu bài (có công thức $...$ nếu cần)",
    "options": [
      { "id": "A", "text": "Lựa chọn A" },
      { "id": "B", "text": "Lựa chọn B" },
      { "id": "C", "text": "Lựa chọn C" },
      { "id": "D", "text": "Lựa chọn D" }
    ],
    "correct_answer": "A",
    "explanation": "Lời giải thích chi tiết ngắn gọn vì sao đáp án đó đúng dạng KaTeX"
  }
}
`.trim();
}

/**
 * Thực thi sinh hoặc làm giàu bài học với TinyFish Agent
 */
async function generateLesson(topic) {
  console.log(`\n======================================================`);
  console.log(`[Curriculum Agent] Processing: [${topic.subject_id.toUpperCase()} Lớp ${topic.grade}]`);
  console.log(`[Topic] ${topic.topic_title}`);
  console.log(`[Target URL] ${topic.target_url}`);
  
  const goal = buildAgentGoal(topic);
  
  // Gọi TinyFish Agent Automation
  const runResult = await runAutomation({
    url: topic.target_url,
    goal: goal
  });

  const rawText = runResult.result || '';
  
  // Trích xuất JSON từ kết quả của agent
  let parsed = null;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn('[Curriculum Agent] Warning: Could not parse pure JSON from agent output. Using text wrapper.');
  }

  // Định dạng các trường dữ liệu
  const summary = (parsed && parsed.summary) || `Trọng tâm kiến thức: ${topic.topic_title}`;
  const contentMarkdown = (parsed && parsed.content_markdown) || rawText;
  const keyFormulas = (parsed && parsed.key_formulas) || `$$c^2 = a^2 + b^2 - 2ab \\cos C$$`;
  
  // Lưu hoặc cập nhật vào database SQLite
  const existing = db.prepare('SELECT id FROM theories WHERE topic_title = ?').get(topic.topic_title);
  let theoryId;

  if (existing) {
    theoryId = existing.id;
    db.prepare(`
      UPDATE theories 
      SET summary = ?, content_markdown = ?, key_formulas = ?
      WHERE id = ?
    `).run(summary, contentMarkdown, keyFormulas, theoryId);
    console.log(`[Curriculum Agent] ✅ Updated existing theory ID ${theoryId}`);
  } else {
    const info = db.prepare(`
      INSERT INTO theories (subject_id, chapter_title, topic_title, summary, content_markdown, key_formulas, order_index, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      topic.subject_id,
      topic.chapter_title,
      topic.topic_title,
      summary,
      contentMarkdown,
      keyFormulas,
      parseInt(topic.grade) * 10
    );
    theoryId = info.lastInsertRowid;
    console.log(`[Curriculum Agent] ✅ Created new theory ID ${theoryId}`);
  }

  // Chèn câu hỏi trắc nghiệm củng cố (mini-quiz)
  if (parsed && parsed.quiz && parsed.quiz.question) {
    db.prepare('DELETE FROM theory_quizzes WHERE theory_id = ?').run(theoryId);
    db.prepare(`
      INSERT INTO theory_quizzes (theory_id, question, options_json, correct_answer, explanation)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      theoryId,
      parsed.quiz.question,
      JSON.stringify(parsed.quiz.options),
      parsed.quiz.correct_answer || 'A',
      parsed.quiz.explanation || 'Xem lại lý thuyết trọng tâm.'
    );
    console.log(`[Curriculum Agent] ✅ Saved mini-quiz for theory ID ${theoryId}`);
  }

  return {
    theoryId,
    topicTitle: topic.topic_title,
    steps: runResult.steps,
    cost: runResult.estimatedCost
  };
}

module.exports = {
  CURRICULUM_CATALOG,
  getTopicsBySubject,
  getTopicsByGrade,
  generateLesson
};
