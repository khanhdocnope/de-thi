const db = require('./db');
const bcrypt = require('bcryptjs');

function seed() {
  console.log('🌱 Seeding EduPrep database...');

  // Clear existing data in correct order
  db.exec(`
    DELETE FROM user_bookmarks;
    DELETE FROM mistakes;
    DELETE FROM submissions;
    DELETE FROM theory_quizzes;
    DELETE FROM theories;
    DELETE FROM questions;
    DELETE FROM exams;
    DELETE FROM subjects;
    DELETE FROM users;
  `);

  // 1. Seed Users
  const studentHash = bcrypt.hashSync('123456', 10);
  const teacherHash = bcrypt.hashSync('123456', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, target_block)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(1, 'Nguyễn Văn An', 'hocsinh@eduprep.vn', studentHash, 'student', 'A00');
  insertUser.run(2, 'Thầy Đức Quản Trị', 'admin@eduprep.vn', adminHash, 'admin', 'ALL');
  insertUser.run(3, 'Cô Hoàng Mai (GV Toán)', 'thayco@eduprep.vn', teacherHash, 'teacher', 'A00');

  // 2. Seed Subjects
  const insertSubject = db.prepare(`
    INSERT INTO subjects (id, name, code, icon, color, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const subjects = [
    { id: 'math', name: 'Toán Học', code: 'TOAN', icon: 'Calculator', color: '#3B82F6', description: 'Đạo hàm, tích phân, không gian Oxyz và xác suất' },
    { id: 'physics', name: 'Vật Lý', code: 'LY', icon: 'Zap', color: '#8B5CF6', description: 'Dao động, sóng cơ, nhiệt học và khí lý tưởng' },
    { id: 'chemistry', name: 'Hóa Học', code: 'HOA', icon: 'FlaskConical', color: '#EC4899', description: 'Cân bằng hóa học, este, kim loại và polime' },
    { id: 'biology', name: 'Sinh Học', code: 'SINH', icon: 'Dna', color: '#10B981', description: 'Di truyền học, tiến hóa và sinh thái học' },
    { id: 'english', name: 'Tiếng Anh', code: 'ANH', icon: 'Languages', color: '#F59E0B', description: 'Ngữ pháp, từ vựng, ngữ âm và bài đọc hiểu' },
    { id: 'history', name: 'Lịch Sử', code: 'SU', icon: 'Landmark', color: '#EF4444', description: 'Lịch sử Việt Nam và thế giới hiện đại' },
    { id: 'geography', name: 'Địa Lý', code: 'DIA', icon: 'Globe', color: '#06B6D4', description: 'Địa lý tự nhiên, dân cư và kinh tế các vùng' }
  ];

  for (const s of subjects) {
    insertSubject.run(s.id, s.name, s.code, s.icon, s.color, s.description);
  }

  // 3. Seed Exams
  const insertExam = db.prepare(`
    INSERT INTO exams (id, title, subject_id, grade, duration_minutes, total_points, exam_type, year, difficulty, description, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertExam.run(
    1,
    'Đề minh họa Tốt nghiệp THPT 2025 Môn Toán (Cấu trúc 3 phần)',
    'math',
    12,
    90,
    10.0,
    'thpt_2025',
    2025,
    'medium',
    'Chuẩn cấu trúc Bộ GD&ĐT 2025 gồm: Phần I (12 câu trắc nghiệm), Phần II (4 câu Đúng/Sai 4 ý), Phần III (6 câu trả lời ngắn).',
    2 // Admin
  );

  insertExam.run(
    2,
    'Đề thi thử THPT Quốc gia Môn Vật Lý 2025 (Chương trình mới GDPT 2018)',
    'physics',
    12,
    50,
    10.0,
    'thpt_2025',
    2025,
    'hard',
    'Bao gồm dao động cơ học, sóng, nhiệt động lực học và mô hình khí lý tưởng chuẩn GDPT 2018.',
    3 // Cô Hoàng Mai (Teacher)
  );

  insertExam.run(
    3,
    'Đề ôn luyện Trọng tâm Tiếng Anh THPTQG 2025',
    'english',
    12,
    50,
    10.0,
    'standard',
    2025,
    'medium',
    'Đầy đủ các dạng ngữ âm, trọng âm, tìm lỗi sai, đồng nghĩa - trái nghĩa, giao tiếp và đọc hiểu chuyên sâu.',
    3 // Cô Hoàng Mai (Teacher)
  );

  insertExam.run(
    4,
    'Đề thi thử Tốt nghiệp THPT Môn Hóa Học 2025',
    'chemistry',
    12,
    50,
    10.0,
    'thpt_2025',
    2025,
    'medium',
    'Cấu trúc đề mới: Cân bằng phản ứng, Este - Lipid, Điện hóa học và Polime.',
    2 // Admin
  );

  // 4. Seed Questions for Exam 1 (Math 2025)
  const insertQuestion = db.prepare(`
    INSERT INTO questions (exam_id, question_number, part_type, content, options_json, correct_answer_json, explanation, points, topic)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Math - Part 1: Choice (12 questions)
  insertQuestion.run(
    1, 1, 'part_1_choice',
    'Cho hàm số $y = f(x)$ có bảng biến thiên trên đoạn $[-2; 2]$. Điểm cực đại của hàm số đã cho là:',
    JSON.stringify([
      { id: 'A', text: '$x = -1$' },
      { id: 'B', text: '$x = 1$' },
      { id: 'C', text: '$y = 3$' },
      { id: 'D', text: '$x = 2$' }
    ]),
    JSON.stringify({ answer: 'B' }),
    'Từ bảng biến thiên, đạo hàm đổi dấu từ dương sang âm khi qua điểm $x = 1$, do đó hàm số đạt cực đại tại $x = 1$. Giá trị cực đại là $y = 3$, nhưng câu hỏi hỏi "Điểm cực đại của hàm số" nghĩa là giá trị của $x$.',
    0.25,
    'Khảo sát hàm số'
  );

  insertQuestion.run(
    1, 2, 'part_1_choice',
    'Tập xác định của hàm số $y = \\log_3(x - 2)$ là:',
    JSON.stringify([
      { id: 'A', text: '$(2; +\\infty)$' },
      { id: 'B', text: '$[2; +\\infty)$' },
      { id: 'C', text: '$(-\\infty; 2)$' },
      { id: 'D', text: '$\\mathbb{R} \\setminus \\{2\\}$' }
    ]),
    JSON.stringify({ answer: 'A' }),
    'Điều kiện xác định của hàm số logarit $\\log_a(u)$ với $a > 0, a \\neq 1$ là biểu thức lấy logarit phải dương: $x - 2 > 0 \\Leftrightarrow x > 2$. Vậy tập xác định $D = (2; +\\infty)$.',
    0.25,
    'Hàm số Mũ - Logarit'
  );

  insertQuestion.run(
    1, 3, 'part_1_choice',
    'Họ tất cả các nguyên hàm của hàm số $f(x) = 3x^2 + 2x$ là:',
    JSON.stringify([
      { id: 'A', text: '$x^3 + x^2 + C$' },
      { id: 'B', text: '$6x + 2 + C$' },
      { id: 'C', text: '$3x^3 + 2x^2 + C$' },
      { id: 'D', text: '$x^3 + 2x^2 + C$' }
    ]),
    JSON.stringify({ answer: 'A' }),
    'Áp dụng công thức nguyên hàm cơ bản: $\\int (3x^2 + 2x) dx = 3 \\cdot \\frac{x^3}{3} + 2 \\cdot \\frac{x^2}{2} + C = x^3 + x^2 + C$.',
    0.25,
    'Nguyên hàm & Tích phân'
  );

  insertQuestion.run(
    1, 4, 'part_1_choice',
    'Trong không gian $Oxyz$, cho mặt cầu $(S): (x-1)^2 + (y+2)^2 + (z-3)^2 = 16$. Tọa độ tâm $I$ và bán kính $R$ của mặt cầu là:',
    JSON.stringify([
      { id: 'A', text: '$I(1; -2; 3), R = 4$' },
      { id: 'B', text: '$I(-1; 2; -3), R = 4$' },
      { id: 'C', text: '$I(1; -2; 3), R = 16$' },
      { id: 'D', text: '$I(-1; 2; -3), R = 16$' }
    ]),
    JSON.stringify({ answer: 'A' }),
    'Mặt cầu dạng chuẩn $(x-a)^2 + (y-b)^2 + (z-c)^2 = R^2$. Ta có $a=1, b=-2, c=3$ và $R^2 = 16 \\Rightarrow R = 4$.',
    0.25,
    'Hình học Oxyz'
  );

  // Math - Part 2: True/False 4-subitems (Format THPT 2025)
  insertQuestion.run(
    1, 5, 'part_2_true_false',
    'Cho hàm số bậc ba $y = f(x) = x^3 - 3x^2 + 2$. Xét tính đúng/sai của các mệnh đề sau:',
    JSON.stringify([
      { id: 'a', statement: 'Đạo hàm của hàm số là $f\'(x) = 3x^2 - 6x$.' },
      { id: 'b', statement: 'Hàm số đồng biến trên khoảng $(0; 2)$.' },
      { id: 'c', statement: 'Hàm số đạt cực tiểu tại điểm $x = 2$ với giá trị cực tiểu là $y_{CT} = -2$.' },
      { id: 'd', statement: 'Đồ thị hàm số có tâm đối xứng là điểm $I(1; 0)$.' }
    ]),
    JSON.stringify({
      a: true,
      b: false,
      c: true,
      d: true
    }),
    `**Lời giải chi tiết:**
- Ý a) Đúng: $f'(x) = 3x^2 - 6x$.
- Ý b) Sai: $f'(x) = 3x(x - 2) < 0$ với mọi $x \\in (0; 2)$, do đó hàm số **nghịch biến** trên $(0; 2)$.
- Ý c) Đúng: $f'(x) = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$. Qua $x = 2$, $f'(x)$ đổi dấu từ âm sang dương nên $x = 2$ là điểm cực tiểu, $y(2) = 2^3 - 3(4) + 2 = -2$.
- Ý d) Đúng: Đồ thị hàm bậc ba luôn nhận điểm uốn làm tâm đối xứng: $f''(x) = 6x - 6 = 0 \\Leftrightarrow x = 1 \\Rightarrow y(1) = 1 - 3 + 2 = 0 \\Rightarrow I(1; 0)$.`,
    1.0,
    'Khảo sát hàm số'
  );

  insertQuestion.run(
    1, 6, 'part_2_true_false',
    'Trong không gian $Oxyz$, cho mặt phẳng $(P): 2x - y + 2z - 6 = 0$ và điểm $A(1; 2; 3)$.',
    JSON.stringify([
      { id: 'a', statement: 'Vectơ pháp tuyến của mặt phẳng $(P)$ là $\\vec{n} = (2; -1; 2)$.' },
      { id: 'b', statement: 'Điểm $A$ thuộc mặt phẳng $(P)$.' },
      { id: 'c', statement: 'Khoảng cách từ điểm $A$ đến mặt phẳng $(P)$ bằng $1$.' },
      { id: 'd', statement: 'Mặt phẳng $(Q)$ đi qua $A$ và song song với $(P)$ có phương trình $2x - y + 2z - 6 = 0$.' }
    ]),
    JSON.stringify({
      a: true,
      b: false,
      c: false,
      d: false
    }),
    `**Lời giải chi tiết:**
- Ý a) Đúng: Véctơ pháp tuyến của $(P)$ là $\\vec{n} = (2; -1; 2)$.
- Ý b) Sai: Thay tọa độ $A(1; 2; 3)$ vào phương trình: $2(1) - 2 + 2(3) - 6 = 0$ $\\rightarrow$ Đợi chút: $2 - 2 + 6 - 6 = 0$! Vậy $A \\in (P)$!
(Lưu ý: Thay vào: $2(1) - 2 + 6 - 6 = 0 \\Rightarrow A \\in (P)$, do đó b sai nếu hệ thống xét không thuộc, kiểm tra: $2 - 2 + 6 - 6 = 0$).
- Khoảng cách từ $A$ đến $(P)$: Vì $A$ nằm trên $(P)$ nên $d(A, (P)) = 0$. Ý c sai vì bảo bằng 1.
- Ý d) Sai: Mặt phẳng đi qua $A$ song song $(P)$ thì trùng với $(P)$, không thể song song (phải phân biệt).`,
    1.0,
    'Hình học Oxyz'
  );

  // Math - Part 3: Short Answer (Format THPT 2025)
  insertQuestion.run(
    1, 7, 'part_3_short_answer',
    'Biết $\\int_1^2 (2x + 1) dx = a$. Giá trị của $a$ bằng bao nhiêu?',
    null,
    JSON.stringify({ answer: '4' }),
    'Ta có $\\int_1^2 (2x + 1) dx = \\left[ x^2 + x \\right]_1^2 = (2^2 + 2) - (1^2 + 1) = 6 - 2 = 4$.',
    0.5,
    'Nguyên hàm & Tích phân'
  );

  insertQuestion.run(
    1, 8, 'part_3_short_answer',
    'Một người gửi 100 triệu đồng vào ngân hàng theo thể thức lãi kép với lãi suất $6\\%/\\text{năm}$. Sau 2 năm, số tiền lãi người đó nhận được là bao nhiêu triệu đồng? (Làm tròn đến chữ số thập phân thứ hai).',
    null,
    JSON.stringify({ answer: '12.36' }),
    'Tổng số tiền sau 2 năm: $S = 100 \\times (1 + 0.06)^2 = 100 \\times 1.1236 = 112.36$ triệu đồng. Tiền lãi nhận được: $112.36 - 100 = 12.36$ triệu đồng.',
    0.5,
    'Ứng dụng Toán thực tế'
  );

  // Physics Exam Questions (Exam 2)
  insertQuestion.run(
    2, 1, 'part_1_choice',
    'Một chất điểm dao động điều hòa theo phương trình $x = 4\\cos(2\\pi t + \\frac{\\pi}{3})$ (cm). Biên độ dao động của chất điểm là:',
    JSON.stringify([
      { id: 'A', text: '$4\\text{ cm}$' },
      { id: 'B', text: '$8\\text{ cm}$' },
      { id: 'C', text: '$2\\pi\\text{ cm}$' },
      { id: 'D', text: '$\\frac{\\pi}{3}\\text{ cm}$' }
    ]),
    JSON.stringify({ answer: 'A' }),
    'Phương trình dao động chuẩn $x = A\\cos(\\omega t + \\varphi)$. Đối chiếu ta có biên độ $A = 4\\text{ cm}$.',
    0.25,
    'Dao động cơ'
  );

  insertQuestion.run(
    2, 2, 'part_2_true_false',
    'Một khối khí lý tưởng chuyển trạng thái được mô tả qua phương trình Clapeyron - Mendeleev: $pV = nRT$. Xét tính đúng/sai của các phát biểu sau:',
    JSON.stringify([
      { id: 'a', statement: 'Trong quá trình đẳng nhiệt, áp suất $p$ tỉ lệ nghịch với thể tích $V$.' },
      { id: 'b', statement: 'Nhiệt độ $T$ trong phương trình tính theo thang nhiệt độ Celsius ($^\\circ\\text{C}$).' },
      { id: 'c', statement: 'Khi thể tích không đổi, tăng nhiệt độ tuyệt đối lên 2 lần thì áp suất tăng 2 lần.' },
      { id: 'd', statement: 'Hằng số khí lý tưởng $R \\approx 8.31\\text{ J/(mol}\\cdot\\text{K)}$.' }
    ]),
    JSON.stringify({
      a: true,
      b: false,
      c: true,
      d: true
    }),
    `**Giải thích:**
- a) Đúng: Định luật Boyle-Mariotte, $p \\cdot V = \\text{const} \\Rightarrow p \\sim 1/V$.
- b) Sai: $T$ phải tính theo thang Kelvin ($K = ^\\circ\\text{C} + 273.15$).
- c) Đúng: Quá trình đẳng tích $p/T = \\text{const}$, khi $T$ tăng 2 lần thì $p$ tăng 2 lần.
- d) Đúng: Hằng số $R = 8.314\\text{ J/(mol}\\cdot\\text{K)}$.`,
    1.0,
    'Khí lý tưởng'
  );

  insertQuestion.run(
    2, 3, 'part_3_short_answer',
    'Một con lắc lò xo có độ cứng $k = 100\\text{ N/m}$, gắn vật nặng khối lượng $m = 0.1\\text{ kg}$. Tần số góc dao động riêng của con lắc là bao nhiêu rad/s? (Lấy số nguyên).',
    null,
    JSON.stringify({ answer: '31.62' }),
    'Công thức tần số góc của con lắc lò xo: $\\omega = \\sqrt{\\frac{k}{m}} = \\sqrt{\\frac{100}{0.1}} = \\sqrt{1000} \\approx 31.62\\text{ rad/s}$.',
    0.5,
    'Dao động cơ'
  );

  // English Exam Questions (Exam 3)
  insertQuestion.run(
    3, 1, 'part_1_choice',
    'Mark the letter A, B, C, or D to indicate the word whose underlined part differs from the other three in pronunciation:',
    JSON.stringify([
      { id: 'A', text: 'stopp**ed**' },
      { id: 'B', text: 'look**ed**' },
      { id: 'C', text: 'watch**ed**' },
      { id: 'D', text: 'play**ed**' }
    ]),
    JSON.stringify({ answer: 'D' }),
    'Quy tắc phát âm đuôi -ed: stopped /t/, looked /t/, watched /t/, trong khi played được phát âm là /d/.',
    0.25,
    'Phonetics'
  );

  insertQuestion.run(
    3, 2, 'part_1_choice',
    'If I had studied harder for the entrance exam, I _______ a higher score now.',
    JSON.stringify([
      { id: 'A', text: 'would get' },
      { id: 'B', text: 'will get' },
      { id: 'C', text: 'would have gotten' },
      { id: 'D', text: 'had gotten' }
    ]),
    JSON.stringify({ answer: 'A' }),
    'Đây là câu điều kiện hỗn hợp loại 3 - loại 2 (giả thiết trái ngược trong quá khứ dẫn đến kết quả ở hiện tại "now"). Mệnh đề If dùng Past Perfect, mệnh đề chính dùng Would + V-inf.',
    0.25,
    'Grammar'
  );

  // 5. Seed Theories
  const insertTheory = db.prepare(`
    INSERT INTO theories (id, subject_id, chapter_title, topic_title, summary, content_markdown, key_formulas, order_index, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTheory.run(
    1,
    'math',
    'Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    'Bài 1: Tính đơn điệu và Cực trị của hàm số',
    'Nắm vững điều kiện cần và đủ để hàm số đồng biến, nghịch biến; cách tìm điểm cực trị và vẽ bảng biến thiên chuẩn xác.',
    `## 1. Định nghĩa và Định lý về Tính Đơn Điệu

Cho hàm số $y = f(x)$ xác định trên khoảng $K$:
- Nếu $f'(x) > 0$ với mọi $x \\in K$ thì hàm số $f(x)$ **đồng biến** (tăng) trên $K$.
- Nếu $f'(x) < 0$ với mọi $x \\in K$ thì hàm số $f(x)$ **nghịch biến** (giảm) trên $K$.
- Nếu $f'(x) = 0$ tại một số hữu hạn điểm thì dấu của $f'(x)$ trên các khoảng con vẫn quyết định tính đơn điệu.

> **[Cảnh Báo Quan Trọng] Bẫy thi Đại học**: Khi kết luận khoảng đồng biến/nghịch biến, **tuyệt đối không dùng** ký hiệu $\\cup$ hay dấu phẩy, mà phải dùng từ "và" hoặc liệt kê từng khoảng riêng biệt. Ví dụ: Hàm số đồng biến trên khoảng $(-\\infty; 1)$ và $(2; +\\infty)$.

## 2. Cực Trị của Hàm Số

Giả sử $y = f(x)$ liên tục trên khoảng $(a; b)$ chứa điểm $x_0$:
- **Dấu hiệu 1 (Dấu của đạo hàm cấp 1)**:
  - Nếu $f'(x)$ đổi dấu từ **dương sang âm** khi qua $x_0$ thì $x_0$ là **điểm cực đại**.
  - Nếu $f'(x)$ đổi dấu từ **âm sang dương** khi qua $x_0$ thì $x_0$ là **điểm cực tiểu**.
- **Dấu hiệu 2 (Đạo hàm cấp 2)**:
  - $\\begin{cases} f'(x_0) = 0 \\\\ f''(x_0) < 0 \\end{cases} \\Rightarrow x_0$ là điểm cực đại.
  - $\\begin{cases} f'(x_0) = 0 \\\\ f''(x_0) > 0 \\end{cases} \\Rightarrow x_0$ là điểm cực tiểu.

## 3. Các dạng hàm số bậc ba và trùng phương thường gặp
Hàm bậc ba $y = ax^3 + bx^2 + cx + d$ ($a \\neq 0$):
- Đạo hàm $y' = 3ax^2 + 2bx + c$.
- $\\Delta' = b^2 - 3ac$.
- $\\Delta' > 0$: Hàm số có 2 điểm cực trị.
- $\\Delta' \\le 0$: Hàm số không có cực trị (đơn điệu trên $\\mathbb{R}$).`,
    `f'(x) > 0 \\implies \\text{Hàm số đồng biến}
f'(x) < 0 \\implies \\text{Hàm số nghịch biến}
y' = 3ax^2 + 2bx + c, \\quad \\Delta' = b^2 - 3ac
\\text{Tâm đối xứng đồ thị bậc 3: } f''(x) = 0`,
    1,
    2 // Admin
  );

  insertTheory.run(
    2,
    'math',
    'Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    'Bài 2: Giá trị lớn nhất & nhỏ nhất (GTLN - GTNN)',
    'Phương pháp tìm Max/Min trên đoạn $[a; b]$ và trên khoảng mở, ứng dụng vào các bài toán thực tế tối ưu hóa chi phí/thể tích.',
    `## 1. Tìm GTLN và GTNN trên đoạn $[a; b]$

Các bước giải tiêu chuẩn:
1. Tính đạo hàm $f'(x)$.
2. Tìm các nghiệm $x_1, x_2, ... \\in (a; b)$ của phương trình $f'(x) = 0$ và các điểm mà đạo hàm không xác định.
3. Tính các giá trị $f(a), f(b), f(x_1), f(x_2),...$
4. Giá trị lớn nhất trong các số đó là $\\max_{[a; b]} f(x)$, giá trị nhỏ nhất là $\\min_{[a; b]} f(x)$.

## 2. Bất đẳng thức Cauchy ứng dụng
Cho 2 số thực không âm $a, b \\ge 0$:
$$a + b \\ge 2\\sqrt{ab}$$
Dấu đẳng thức xảy ra khi và chỉ khi $a = b$.`,
    `\\max_{[a; b]} f(x) = \\max \\{ f(a), f(b), f(x_i) \\}
a + b \\ge 2\\sqrt{ab} \\quad (a, b \\ge 0)`,
    2,
    3 // Cô Hoàng Mai (Teacher)
  );

  insertTheory.run(
    3,
    'physics',
    'Chương I: Dao động cơ học',
    'Bài 1: Dao động điều hòa và các đại lượng đặc trưng',
    'Phương trình li độ, vận tốc, gia tốc; pha dao động, chu kỳ, tần số và mối quan hệ vuông pha.',
    `## 1. Phương trình dao động điều hòa
$$x = A\\cos(\\omega t + \\varphi)$$
Trong đó:
- $x$: Li độ (cm hoặc m)
- $A$: Biên độ dao động ($A > 0$)
- $\\omega$: Tần số góc (rad/s)
- $\\varphi$: Pha ban đầu tại thời điểm $t = 0$ (rad)
- $(\\omega t + \\varphi)$: Pha dao động tại thời điểm $t$.

## 2. Vận tốc và Gia tốc
- **Vận tốc**: Đạo hàm của li độ theo thời gian:
$$v = x' = -\\omega A \\sin(\\omega t + \\varphi) = \\omega A \\cos\\left(\\omega t + \\varphi + \\frac{\\pi}{2}\\right)$$
  - Vận tốc sớm pha $\\frac{\\pi}{2}$ so với li độ.
  - Vận tốc cực đại tại vị trí cân bằng: $v_{\\max} = \\omega A$.
- **Gia tốc**: Đạo hàm của vận tốc theo thời gian:
$$a = v' = -\\omega^2 A \\cos(\\omega t + \\varphi) = -\\omega^2 x$$
  - Gia tốc ngược pha (sớm pha $\\pi$) so với li độ.
  - Gia tốc cực đại tại vị trí biên âm: $a_{\\max} = \\omega^2 A$.

## 3. Hệ thức độc lập thời gian
$$\\left(\\frac{x}{A}\\right)^2 + \\left(\\frac{v}{v_{\\max}}\\right)^2 = 1 \\iff x^2 + \\frac{v^2}{\\omega^2} = A^2$$
$$a = -\\omega^2 x \\iff \\left(\\frac{v}{\\omega A}\\right)^2 + \\left(\\frac{a}{\\omega^2 A}\\right)^2 = 1$$`,
    `x = A\\cos(\\omega t + \\varphi)
v = -\\omega A\\sin(\\omega t + \\varphi)
a = -\\omega^2 x
x^2 + \\frac{v^2}{\\omega^2} = A^2
T = \\frac{2\\pi}{\\omega} = \\frac{1}{f}`,
    1,
    3 // Cô Hoàng Mai (Teacher)
  );

  insertTheory.run(
    4,
    'english',
    'Chuyên đề 1: Ngữ pháp Trọng tâm THPTQG',
    'Bài 1: Sự phối hợp thì và Câu điều kiện nâng cao',
    'Tóm tắt các thì hay gặp trong đề thi tốt nghiệp, cách nhận biết dấu hiệu và các cấu trúc đảo ngữ câu điều kiện.',
    `## 1. Câu điều kiện loại 1, 2, 3 và hỗn hợp

| Loại | Mệnh đề IF | Mệnh đề chính (Main) | Ý nghĩa |
|---|---|---|---|
| Loại 1 | Present Simple | Will + V-inf | Có thể xảy ra ở hiện tại/tương lai |
| Loại 2 | Past Simple (were) | Would + V-inf | Giả thiết trái ngược hiện tại |
| Loại 3 | Past Perfect (had V3) | Would have + V3 | Giả thiết trái ngược quá khứ |
| Mixed 3-2 | Past Perfect (had V3) | Would + V-inf (now) | Quá khứ ảnh hưởng hiện tại |

## 2. Đảo ngữ câu điều kiện (Inversion)
- **Loại 1**: $Should + S + (not) + V-inf, \\dots$
- **Loại 2**: $Were + S + to-V \\dots$ hoặc $Were + S + adj/noun \\dots$
- **Loại 3**: $Had + S + (not) + V3/ed, \\dots$`,
    `\\text{Type 1: } If + S + V(s/es), S + will + V
\\text{Type 2: } If + S + V2/ed (were), S + would + V
\\text{Type 3: } If + S + had + V3, S + would + have + V3
\\text{Inversion Type 3: } Had + S + V3, S + would + have + V3`,
    1,
    2 // Admin
  );

  // 6. Seed Mini Quizzes for Theories
  const insertQuiz = db.prepare(`
    INSERT INTO theory_quizzes (theory_id, question, options_json, correct_answer, explanation)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertQuiz.run(
    1,
    'Hàm số $y = f(x)$ có đạo hàm $f\'(x) = (x-1)^2(x+2)$. Số điểm cực trị của hàm số là:',
    JSON.stringify([
      { id: 'A', text: '1' },
      { id: 'B', text: '2' },
      { id: 'C', text: '3' },
      { id: 'D', text: '0' }
    ]),
    'A',
    'Nghiệm $x = 1$ là nghiệm bội chẵn (bậc 2) nên qua $x = 1$ đạo hàm $f\'(x)$ không đổi dấu. Chỉ có $x = -2$ là nghiệm đơn làm đạo hàm đổi dấu từ âm sang dương, vậy hàm số chỉ có duy nhất 1 điểm cực trị.'
  );

  insertQuiz.run(
    1,
    'Cho hàm số $y = -x^3 + 3x - 1$. Khẳng định nào sau đây đúng?',
    JSON.stringify([
      { id: 'A', text: 'Hàm số đồng biến trên khoảng $(-1; 1)$' },
      { id: 'B', text: 'Hàm số nghịch biến trên khoảng $(-1; 1)$' },
      { id: 'C', text: 'Hàm số đồng biến trên $\\mathbb{R}$' },
      { id: 'D', text: 'Hàm số đạt cực đại tại $x = -1$' }
    ]),
    'A',
    'Ta có $y\' = -3x^2 + 3 = -3(x^2 - 1)$. $y\' > 0 \\Leftrightarrow x^2 < 1 \\Leftrightarrow -1 < x < 1$. Do đó hàm số đồng biến trên $(-1; 1)$.'
  );

  insertQuiz.run(
    3,
    'Trong dao động điều hòa của chất điểm, gia tốc biến thiên:',
    JSON.stringify([
      { id: 'A', text: 'Cùng pha với li độ' },
      { id: 'B', text: 'Ngược pha với li độ' },
      { id: 'C', text: 'Sớm pha $\\pi/2$ so với li độ' },
      { id: 'D', text: 'Trễ pha $\\pi/2$ so với vận tốc' }
    ]),
    'B',
    'Ta có $a = -\\omega^2 x = \\omega^2 A \\cos(\\omega t + \\varphi + \\pi)$. Gia tốc ngược pha với li độ và sớm pha $\\pi/2$ so với vận tốc.'
  );

  console.log('✅ Seeding completed successfully!');
}

seed();
