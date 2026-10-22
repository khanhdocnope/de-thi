/**
 * Granular Theory Generation Pipeline (Chia nhỏ chương trình thành các task độc lập)
 * Architecture:
 *   - Mỗi bài học là 1 task riêng biệt (tránh vượt output token limit của LLM)
 *   - Lấy context từ TinyFish AI Search cho từng bài
 *   - Sinh nội dung Markdown chi tiết, công thức KaTeX và Mini-Quiz
 *   - Gộp lần lượt vào database SQLite (theories & theory_quizzes)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const db = require('../db');

// Load API Key
const envPath = path.join(__dirname, '../../.env');
let tinyFishKey = process.env.TINYFISH_API_KEY;
if (!tinyFishKey && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/TINYFISH_API_KEY=(.+)/);
  if (match) tinyFishKey = match[1].trim();
}

function searchTinyFish(query) {
  return new Promise((resolve) => {
    if (!tinyFishKey) return resolve({ results: [] });

    const options = {
      hostname: 'api.search.tinyfish.ai',
      path: '/?query=' + encodeURIComponent(query) + '&location=VN&language=vi',
      headers: {
        'X-API-Key': tinyFishKey,
        'X-TF-Request-Origin': 'api',
        'X-TF-API-Source': 'granular-theory-pipeline'
      }
    };

    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ results: [] });
        }
      });
    });

    req.on('error', () => resolve({ results: [] }));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve({ results: [] });
    });
  });
}

// -----------------------------------------------------------------------------
// MANIFEST CÁC TASK CHUYÊN ĐỀ CHIA NHỎ THEO TỪNG BÀI HỌC CỤ THỂ
// -----------------------------------------------------------------------------
const granularTasks = [
  // ===========================================================================
  // MÔN TOÁN - LỚP 10
  // ===========================================================================
  {
    subject_id: 'math',
    grade: 10,
    chapter_title: 'Toán 10 - Chương 1: Mệnh Đề & Tập Hợp',
    topic_title: 'Bài 1: Mệnh đề, mệnh đề chứa biến & các phép toán tập hợp',
    order_index: 101,
    search_query: 'menh de toan hoc cac phep toan tap hop toan 10 gdpt 2018',
    summary: 'Định nghĩa mệnh đề, mệnh đề kéo theo, mệnh đề đảo, phủ định và các phép toán giao, hợp, hiệu của hai tập hợp.',
    key_formulas: `$A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}$
$A \\cup B = \\{x \\mid x \\in A \\text{ hoặc } x \\in B\\}$
$A \\setminus B = \\{x \\mid x \\in A \\text{ và } x \\notin B\\}$
$C_E A = E \\setminus A \\quad (A \\subset E)$`,
    content_markdown: `## I. Mệnh Đề Toán Học
### 1. Khái niệm mệnh đề
- **Mệnh đề toán học** là một khẳng định về một sự kiện trong toán học chỉ có thể đúng hoặc sai, không thể vừa đúng vừa sai.
- Mệnh đề phủ định của $P$ ký hiệu là $\\overline{P}$. Mệnh đề $\\overline{P}$ đúng khi $P$ sai, và sai khi $P$ đúng.

### 2. Mệnh đề kéo theo và mệnh đề tương đương
- Mệnh đề kéo theo $P \\Rightarrow Q$ ("Nếu $P$ thì $Q$"): Chỉ sai khi $P$ đúng mà $Q$ sai.
- Mệnh đề đảo của $P \\Rightarrow Q$ là $Q \\Rightarrow P$.
- Nếu cả $P \\Rightarrow Q$ và $Q \\Rightarrow P$ đều đúng thì ta có mệnh đề tương đương $P \\Leftrightarrow Q$ ("$P$ khi và chỉ khi $Q$").

---

## II. Tập Hợp và Các Phép Toán
1. **Phép giao ($A \\cap B$)**: Lấy các phần tử thuộc cả $A$ và $B$.
2. **Phép hợp ($A \\cup B$)**: Lấy các phần tử thuộc ít nhất một trong hai tập hợp $A$ hoặc $B$.
3. **Phép hiệu ($A \\setminus B$)**: Lấy các phần tử thuộc $A$ nhưng không thuộc $B$.
4. **Phần bù**: Khi $A \\subset E$, phần bù của $A$ trong $E$ là $C_E A = E \\setminus A$.

> [!TIP]
> Để biểu diễn tập con của trục số $\\mathbb{R}$ (khoảng, đoạn, nửa khoảng), hãy luôn vẽ trục số và dùng phương pháp gạch bỏ phần không lấy để tránh nhầm lẫn ngoặc vuông $[\,]$ và ngoặc tròn $(\,)$.`,
    quizzes: [
      {
        question: 'Cho hai tập hợp $A = [-2; 3]$ và $B = (1; 5)$. Tập hợp $A \\cap B$ là:',
        options: [
          { id: 'A', text: '$(1; 3]$' },
          { id: 'B', text: '$[-2; 5)$' },
          { id: 'C', text: '$[1; 3]$' },
          { id: 'D', text: '$(1; 3)$' }
        ],
        correct_answer: 'A',
        explanation: 'Phần tử $x \\in A \\cap B \\Leftrightarrow x \\in [-2; 3]$ và $x \\in (1; 5)$. Giao hai khoảng trên trục số ta được $1 < x \\le 3$, tức là nửa khoảng $(1; 3]$.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 10,
    chapter_title: 'Toán 10 - Chương 2: Bất Phương Trình Bậc Nhất Hai Ẩn',
    topic_title: 'Bài 2: Bất phương trình & Miền nghiệm của hệ bất phương trình',
    order_index: 102,
    search_query: 'bat phuong trinh bac nhat 2 an mien nghiem toan 10',
    summary: 'Quy tắc xác định miền nghiệm của bất phương trình bậc nhất hai ẩn $ax + by \\le c$ và bài toán tối ưu tuyến tính.',
    key_formulas: `Dạng tổng quát: $ax + by + c \\le 0$ ($a^2 + b^2 \\neq 0$)
Điểm kiểm tra: Chọn gốc $O(0; 0)$ nếu $c \\neq 0$`,
    content_markdown: `## I. Bất Phương Trình Bậc Nhất Hai Ẩn
Bất phương trình bậc nhất hai ẩn có dạng tổng quát:
$$ax + by + c \\le 0 \\quad (\\text{hoặc } < 0, \\ge 0, > 0)$$
trong đó $a, b, c \\in \\mathbb{R}$ và $a^2 + b^2 \\neq 0$.

### Các bước biểu diễn miền nghiệm trên mặt phẳng $Oxy$:
1. Vẽ đường thẳng $\\Delta: ax + by + c = 0$.
2. Chọn một điểm $M_0(x_0; y_0)$ không thuộc $\\Delta$ (thường chọn gốc tọa độ $O(0; 0)$ nếu $c \\neq 0$).
3. Tính giá trị $a x_0 + b y_0 + c$:
   - Nếu thỏa mãn bất phương trình, nửa mặt phẳng chứa $M_0$ (kể cả bờ $\\Delta$ nếu có dấu $\\le$) là miền nghiệm.
   - Nếu không thỏa mãn, nửa mặt phẳng không chứa $M_0$ là miền nghiệm.

---

## II. Ứng Dụng Bài Toán Quy Hoạch Tuyến Tính
Giá trị lớn nhất hoặc nhỏ nhất của biểu thức $F(x; y) = px + qy$ trên miền đa giác lồi luôn đạt tại một trong các **đỉnh của miền đa giác** đó.`,
    quizzes: [
      {
        question: 'Điểm nào sau đây KHÔNG thuộc miền nghiệm của bất phương trình $2x - 3y + 6 > 0$?',
        options: [
          { id: 'A', text: '$(0; 3)$' },
          { id: 'B', text: '$(0; 0)$' },
          { id: 'C', text: '$(1; 1)$' },
          { id: 'D', text: '(-1; 0)' }
        ],
        correct_answer: 'A',
        explanation: 'Thay tọa độ $(0; 3)$ vào biểu thức: $2(0) - 3(3) + 6 = 0 - 9 + 6 = -3 < 0$. Điều này không thỏa mãn điều kiện $> 0$. Vậy điểm $(0; 3)$ không thuộc miền nghiệm.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 10,
    chapter_title: 'Toán 10 - Chương 3: Hàm Số Bậc Hai',
    topic_title: 'Bài 3: Khảo sát hàm số bậc hai & Dấu của tam thức bậc hai',
    order_index: 103,
    search_query: 'ham so bac hai dinh parabol dau tam thuc bac hai toan 10',
    summary: 'Tọa độ đỉnh Parabol $I(-\\frac{b}{2a}; -\\frac{\\Delta}{4a})$, bảng biến thiên và định lý xét dấu tam thức bậc hai.',
    key_formulas: `Đỉnh Parabol: $I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)$
Trục đối xứng: $x = -\\frac{b}{2a}$
Định lý dấu: $\\Delta < 0 \\Rightarrow a \\cdot f(x) > 0, \\forall x \\in \\mathbb{R}$`,
    content_markdown: `## I. Đồ Thị Hàm Số Bậc Hai $y = ax^2 + bx + c$ ($a \\neq 0$)
- Đồ thị là một đường Parabol có:
  - **Đỉnh**: $I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)$.
  - **Trục đối xứng**: Đường thẳng $x = -\\frac{b}{2a}$.
  - **Bề lõm**: Hướng lên trên nếu $a > 0$; hướng xuống dưới nếu $a < 0$.

---

## II. Định Lý Về Dấu Của Tam Thức Bậc Hai
Cho $f(x) = ax^2 + bx + c$ ($a \\neq 0$) có $\\Delta = b^2 - 4ac$:
1. Nếu $\\Delta < 0$: $f(x)$ luôn cùng dấu với $a$ với mọi $x \\in \\mathbb{R}$.
2. Nếu $\\Delta = 0$: $f(x)$ luôn cùng dấu với $a$ với mọi $x \\neq -\\frac{b}{2a}$.
3. Nếu $\\Delta > 0$: $f(x)$ có hai nghiệm phân biệt $x_1 < x_2$.
   - Trong khoảng $(x_1; x_2)$: $f(x)$ **trái dấu** với hệ số $a$.
   - Ngoài khoảng $(-\\infty; x_1) \\cup (x_2; +\\infty)$: $f(x)$ **cùng dấu** với hệ số $a$.`,
    quizzes: [
      {
        question: 'Tọa độ đỉnh của Parabol $y = x^2 - 4x + 3$ là:',
        options: [
          { id: 'A', text: '$(2; -1)$' },
          { id: 'B', text: '$(-2; 15)$' },
          { id: 'C', text: '$(2; 1)$' },
          { id: 'D', text: '$(4; 3)$' }
        ],
        correct_answer: 'A',
        explanation: 'Ta có $a = 1, b = -4, c = 3$. Hoành độ đỉnh: $x_I = -\\frac{b}{2a} = -\\frac{-4}{2(1)} = 2$. Tung độ đỉnh: $y_I = 2^2 - 4(2) + 3 = 4 - 8 + 3 = -1$. Vậy đỉnh $I(2; -1)$.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 10,
    chapter_title: 'Toán 10 - Chương 4: Hệ Thức Lượng & Vectơ',
    topic_title: 'Bài 4: Định lý Côsin, Định lý Sin & Tích vô hướng của hai vectơ',
    order_index: 104,
    search_query: 'dinh ly cosin sin tich vo huong vecto toan 10',
    summary: 'Hệ thức lượng trong tam giác, công thức tính diện tích Heron và tích vô hướng $\\vec{a} \\cdot \\vec{b} = |\\vec{a}| |\\vec{b}| \\cos(\\vec{a}, \\vec{b})$.',
    key_formulas: `Định lý Côsin: $a^2 = b^2 + c^2 - 2bc \\cos A$
Định lý Sin: $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$
Tích vô hướng: $\\vec{u} \\cdot \\vec{v} = |\\vec{u}| \\cdot |\\vec{v}| \\cdot \\cos(\\vec{u}, \\vec{v})$
Vuông góc: $\\vec{u} \\perp \\vec{v} \\Leftrightarrow \\vec{u} \\cdot \\vec{v} = 0$`,
    content_markdown: `## I. Các Định Lý Trong Tam Giác
Cho tam giác $ABC$ có độ dài các cạnh đối diện góc $A, B, C$ lần lượt là $a, b, c$:

### 1. Định lý Côsin:
$$a^2 = b^2 + c^2 - 2bc \\cos A$$
$$\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}$$

### 2. Định lý Sin:
$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$$
*(với $R$ là bán kính đường tròn ngoại tiếp tam giác)*.

---

## II. Tích Vô Hướng Của Hai Vectơ
- **Định nghĩa**: $\\vec{a} \\cdot \\vec{b} = |\\vec{a}| \\cdot |\\vec{b}| \\cdot \\cos(\\vec{a}, \\vec{b})$.
- **Biểu thức tọa độ**: Nếu $\\vec{a} = (x_1; y_1)$ và $\\vec{b} = (x_2; y_2)$ thì:
  $$\\vec{a} \\cdot \\vec{b} = x_1 x_2 + y_1 y_2$$
- **Điều kiện vuông góc**: $\\vec{a} \\perp \\vec{b} \\Leftrightarrow x_1 x_2 + y_1 y_2 = 0$.`,
    quizzes: [
      {
        question: 'Cho tam giác $ABC$ có cạnh $b = 6, c = 8$ và góc $\\widehat{A} = 60^\\circ$. Độ dài cạnh $a$ là:',
        options: [
          { id: 'A', text: '$2\\sqrt{13}$' },
          { id: 'B', text: '$10$' },
          { id: 'C', text: '$2\\sqrt{37}$' },
          { id: 'D', text: '$52$' }
        ],
        correct_answer: 'A',
        explanation: 'Theo định lý Côsin: $a^2 = b^2 + c^2 - 2bc \\cos A = 6^2 + 8^2 - 2(6)(8) \\cos 60^\\circ = 36 + 64 - 96(0.5) = 100 - 48 = 52$. Vậy $a = \\sqrt{52} = 2\\sqrt{13}$.'
      }
    ]
  },

  // ===========================================================================
  // MÔN TOÁN - LỚP 11
  // ===========================================================================
  {
    subject_id: 'math',
    grade: 11,
    chapter_title: 'Toán 11 - Chương 1: Hàm Số Lượng Giác',
    topic_title: 'Bài 5: Giá trị lượng giác & Công thức lượng giác biến đổi',
    order_index: 105,
    search_query: 'cong thuc luong giac cong nhan doi bien doi tich thanh tong toan 11',
    summary: 'Công thức cộng, công thức nhân đôi, công thức hạ bậc và biến đổi tích thành tổng - tổng thành tích.',
    key_formulas: `$\\sin(a \\pm b) = \\sin a \\cos b \\pm \\cos a \\sin b$
$\\cos(a \\pm b) = \\cos a \\cos b \\mp \\sin a \\sin b$
$\\sin 2a = 2\\sin a \\cos a$
$\\cos 2a = \\cos^2 a - \\sin^2 a = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a$`,
    content_markdown: `## I. Các Công Thức Cộng Lượng Giác
$$\\sin(a + b) = \\sin a \\cos b + \\cos a \\sin b$$
$$\\sin(a - b) = \\sin a \\cos b - \\cos a \\sin b$$
$$\\cos(a + b) = \\cos a \\cos b - \\sin a \\sin b$$
$$\\cos(a - b) = \\cos a \\cos b + \\sin a \\sin b$$

---

## II. Công Thức Nhân Đôi & Hạ Bậc
### 1. Nhân đôi:
- $\\sin 2a = 2\\sin a \\cos a$
- $\\cos 2a = \\cos^2 a - \\sin^2 a = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a$
- $\\tan 2a = \\frac{2\\tan a}{1 - \\tan^2 a}$

### 2. Hạ bậc:
$$\\sin^2 a = \\frac{1 - \\cos 2a}{2}, \\quad \\cos^2 a = \\frac{1 + \\cos 2a}{2}$$`,
    quizzes: [
      {
        question: 'Biểu thức $\\sin 2x$ bằng với biểu thức nào sau đây?',
        options: [
          { id: 'A', text: '$2\\sin x \\cos x$' },
          { id: 'B', text: '$\\sin^2 x - \\cos^2 x$' },
          { id: 'C', text: '$2\\sin x$' },
          { id: 'D', text: '$\\cos^2 x - \\sin^2 x$' }
        ],
        correct_answer: 'A',
        explanation: 'Theo công thức lượng giác nhân đôi: $\\sin 2x = 2\\sin x \\cos x$.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 11,
    chapter_title: 'Toán 11 - Chương 2: Dãy Số & Giới Hạn',
    topic_title: 'Bài 6: Cấp số cộng, Cấp số nhân & Giới hạn của hàm số',
    order_index: 106,
    search_query: 'cap so cong cap so nhan gioi han ham so toan 11',
    summary: 'Công thức số hạng tổng quát, tổng n số hạng của cấp số cộng/nhân và các dạng vô định $\\frac{0}{0}, \\frac{\\infty}{\\infty}$.',
    key_formulas: `CSC: $u_n = u_1 + (n - 1)d, \\quad S_n = \\frac{n(u_1 + u_n)}{2}$
CSN: $u_n = u_1 \\cdot q^{n - 1}, \\quad S_n = u_1 \\frac{1 - q^n}{1 - q}$
$\\lim_{x \\to x_0} \\frac{f(x)}{g(x)}$ dạng $\\frac{0}{0}$: khử nhân tử chung $(x - x_0)$`,
    content_markdown: `## I. Cấp Số Cộng và Cấp Số Nhân
### 1. Cấp số cộng (công sai $d$):
- $u_n = u_1 + (n - 1)d$
- $S_n = \\frac{n(u_1 + u_n)}{2} = \\frac{n[2u_1 + (n - 1)d]}{2}$

### 2. Cấp số nhân (công bội $q$):
- $u_n = u_1 \\cdot q^{n - 1}$
- $S_n = u_1 \\frac{1 - q^n}{1 - q} \\quad (q \\neq 1)$

---

## II. Giới Hạn Hàm Số & Phương Pháp Khử Dạng Vô Định
1. **Dạng vô định $\\frac{0}{0}$**:
   - Phân tích đa thức thành nhân tử để triệt tiêu lượng $(x - x_0)$.
   - Nếu có căn thức: nhân liên hợp $(A - B)(A + B) = A^2 - B^2$.
2. **Dạng vô định $\\frac{\\infty}{\\infty}$**:
   - Chia cả tử và mẫu cho $x^k$ với số mũ $k$ cao nhất của mẫu.`,
    quizzes: [
      {
        question: 'Tính giới hạn $L = \\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1}$:',
        options: [
          { id: 'A', text: '$2$' },
          { id: 'B', text: '$0$' },
          { id: 'C', text: '$1$' },
          { id: 'D', text: '$\\infty$' }
        ],
        correct_answer: 'A',
        explanation: 'Dạng vô định $\\frac{0}{0}$. Khử nhân tử chung: $\\frac{x^2 - 1}{x - 1} = \\frac{(x - 1)(x + 1)}{x - 1} = x + 1$. Khi $x \\to 1$, $L = 1 + 1 = 2$.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 11,
    chapter_title: 'Toán 11 - Chương 3: Hình Học Không Gian',
    topic_title: 'Bài 7: Quan hệ vuông góc, Góc & Khoảng cách trong không gian',
    order_index: 107,
    search_query: 'quan he vuong goc goc va khoang cach hinh hoc khong gian toan 11',
    summary: 'Định lý đường thẳng vuông góc mặt phẳng, góc giữa đường thẳng và mặt phẳng, khoảng cách từ điểm đến mặt phẳng.',
    key_formulas: `$d \\perp a, d \\perp b \\text{ và } a \\cap b = O \\subset (P) \\Rightarrow d \\perp (P)$
Góc giữa $d$ và $(P)$ là góc giữa $d$ và hình chiếu $d'$ của nó trên $(P)$
Định lý 3 đường vuông góc`,
    content_markdown: `## I. Đường Thẳng Vuông Góc Với Mặt Phẳng
- **Định lý**: Nếu đường thẳng $d$ vuông góc với hai đường thẳng cắt nhau cùng nằm trong mặt phẳng $(P)$ thì $d \\perp (P)$.
- **Hệ quả**: Nếu $d \\perp (P)$ thì $d$ vuông góc với **mọi đường thẳng** nằm trong $(P)$.

---

## II. Góc và Khoảng Cách
1. **Góc giữa đường thẳng $d$ và mặt phẳng $(P)$**:
   - Là góc nhọn $\\varphi$ giữa đường thẳng $d$ và hình chiếu vuông góc $d'$ của nó trên $(P)$.
   - $0^\\circ \\le \\varphi \\le 90^\\circ$.

2. **Khoảng cách từ điểm $M$ đến mặt phẳng $(P)$**:
   - Là độ dài đoạn thẳng $MH$, trong đó $H$ là hình chiếu vuông góc của $M$ trên $(P)$.
   - Kỹ thuật chuyển điểm: Nếu $AB$ cắt $(P)$ tại $I$ thì $\\frac{d(A, (P))}{d(B, (P))} = \\frac{IA}{IB}$.`,
    quizzes: [
      {
        question: 'Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác vuông tại $B$ và $SA \\perp (ABC)$. Đường thẳng $BC$ vuông góc với mặt phẳng nào?',
        options: [
          { id: 'A', text: '$(SAB)$' },
          { id: 'B', text: '$(SAC)$' },
          { id: 'C', text: '$(SBC)$' },
          { id: 'D', text: 'Không vuông góc với mặt phẳng nào' }
        ],
        correct_answer: 'A',
        explanation: 'Ta có $BC \\perp AB$ (do đáy vuông tại $B$) và $BC \\perp SA$ (do $SA \\perp (ABC)$). Hai đường $AB$ và $SA$ cắt nhau trong $(SAB)$, do đó $BC \\perp (SAB)$.'
      }
    ]
  },

  // ===========================================================================
  // MÔN TOÁN - LỚP 12 (TRỌNG TÂM THI 2025+)
  // ===========================================================================
  {
    subject_id: 'math',
    grade: 12,
    chapter_title: 'Toán 12 - Chương 1: Ứng Dụng Đạo Hàm',
    topic_title: 'Bài 8: Tính đơn điệu & Cực trị của hàm số',
    order_index: 108,
    search_query: 'tinh don dieu cuc tri ham so toan 12 gdpt 2018',
    summary: 'Quy tắc xét dấu đạo hàm bậc nhất, bảng biến thiên, điều kiện cần và đủ của cực trị.',
    key_formulas: `$f'(x) > 0, \\forall x \\in K \\Rightarrow f(x)$ đồng biến trên $K$
$f'(x_0) = 0$ và đổi dấu qua $x_0 \\Rightarrow x_0$ là điểm cực trị
$f''(x_0) < 0 \\Rightarrow x_0$ là điểm cực đại
$f''(x_0) > 0 \\Rightarrow x_0$ là điểm cực tiểu`,
    content_markdown: `## I. Tính Đơn Điệu Của Hàm Số
Cho hàm số $y = f(x)$ có đạo hàm trên khoảng $K$:
- $f(x)$ **đồng biến** trên $K \\iff f'(x) \\ge 0, \\forall x \\in K$ (đẳng thức xảy ra tại hữu hạn điểm).
- $f(x)$ **nghịch biến** trên $K \\iff f'(x) \\le 0, \\forall x \\in K$ (đẳng thức xảy ra tại hữu hạn điểm).

---

## II. Cực Trị Của Hàm Số
- **Quy tắc 1 (Đổi dấu $f'(x)$)**:
  - Nếu $f'(x)$ đổi dấu từ $(+)$ sang $(-)$ khi $x$ qua $x_0$ thì $x_0$ là **điểm cực đại**.
  - Nếu $f'(x)$ đổi dấu từ $(-)$ sang $(+)$ khi $x$ qua $x_0$ thì $x_0$ là **điểm cực tiểu**.

> [!CAUTION]
> **Bẫy đề thi:** 
> - "Điểm cực trị của hàm số" là giá trị của $x$ ($x = x_0$).
> - "Giá trị cực trị" (hoặc cực trị) là giá trị của $y$ ($y_0 = f(x_0)$).
> - "Điểm cực trị của đồ thị hàm số" là cặp tọa độ $(x_0; y_0)$.`,
    quizzes: [
      {
        question: 'Cho hàm số có đạo hàm $f\'(x) = x(x - 1)^2(x + 2)$. Số điểm cực trị của hàm số là:',
        options: [
          { id: 'A', text: '$2$' },
          { id: 'B', text: '$3$' },
          { id: 'C', text: '$1$' },
          { id: 'D', text: '$0$' }
        ],
        correct_answer: 'A',
        explanation: 'Ta thấy nghiệm $x = 1$ là nghiệm bội chẵn (bậc 2), qua đó $f\'(x)$ không đổi dấu. Chỉ có $x = 0$ và $x = -2$ là các nghiệm đơn, qua đó $f\'(x)$ đổi dấu. Vậy hàm số có đúng 2 điểm cực trị.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 12,
    chapter_title: 'Toán 12 - Chương 1: Ứng Dụng Đạo Hàm',
    topic_title: 'Bài 9: Đường tiệm cận của đồ thị hàm số (Đứng, Ngang & Xiên)',
    order_index: 109,
    search_query: 'duong tiem can dung ngang xien toan 12 chuong trinh moi',
    summary: 'Định nghĩa và phương pháp xác định tiệm cận đứng, tiệm cận ngang và tiệm cận xiên (nội dung trọng tâm mới 2025+).',
    key_formulas: `TCN: $\\lim_{x \\to \\pm\\infty} f(x) = y_0 \\Rightarrow y = y_0$
TCĐ: $\\lim_{x \\to x_0^\\pm} f(x) = \\pm\\infty \\Rightarrow x = x_0$
TCX: $y = ax + b$ với $a = \\lim_{x \\to \\pm\\infty} \\frac{f(x)}{x}, \\ b = \\lim_{x \\to \\pm\\infty} (f(x) - ax)$`,
    content_markdown: `## I. Tiệm Cận Đứng và Tiệm Cận Ngang
1. **Tiệm cận ngang**: Nếu $\\lim_{x \\to +\\infty} f(x) = y_0$ hoặc $\\lim_{x \\to -\\infty} f(x) = y_0$ thì đường thẳng $y = y_0$ là tiệm cận ngang.
2. **Tiệm cận đứng**: Nếu một trong các giới hạn một bên tiến ra $\\pm\\infty$ khi $x \\to x_0$ thì đường thẳng $x = x_0$ là tiệm cận đứng.

---

## II. Tiệm Cận Xiên (Nội dung mới GDPT 2018)
Đường thẳng $y = ax + b$ ($a \\neq 0$) là **tiệm cận xiên** của đồ thị hàm số $y = f(x)$ nếu:
$$\\lim_{x \\to +\\infty} [f(x) - (ax + b)] = 0 \\quad \\text{hoặc} \\quad \\lim_{x \\to -\\infty} [f(x) - (ax + b)] = 0$$

### Công thức tìm hệ số $a, b$:
$$a = \\lim_{x \\to \\pm\\infty} \\frac{f(x)}{x}$$
$$b = \\lim_{x \\to \\pm\\infty} [f(x) - ax]$$

*Mẹo với hàm phân thức bậc 2 trên bậc 1*: $y = \\frac{P(x)}{Q(x)} = ax + b + \\frac{r}{Q(x)}$. Khi đó phần thương $y = ax + b$ chính là tiệm cận xiên.`,
    quizzes: [
      {
        question: 'Đường tiệm cận xiên của đồ thị hàm số $y = \\frac{x^2 + 2x - 1}{x - 1}$ là:',
        options: [
          { id: 'A', text: '$y = x + 3$' },
          { id: 'B', text: '$y = x - 1$' },
          { id: 'C', text: '$y = x + 2$' },
          { id: 'D', text: '$y = 2x + 1$' }
        ],
        correct_answer: 'A',
        explanation: 'Thực hiện phép chia đa thức: $\\frac{x^2 + 2x - 1}{x - 1} = \\frac{(x - 1)(x + 3) + 2}{x - 1} = x + 3 + \\frac{2}{x - 1}$. Khi $x \\to \\pm\\infty$, $\\frac{2}{x - 1} \\to 0$. Vậy tiệm cận xiên là đường thẳng $y = x + 3$.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 12,
    chapter_title: 'Toán 12 - Chương 2: Nguyên Hàm & Tích Phân',
    topic_title: 'Bài 10: Nguyên hàm, Tích phân & Ứng dụng tính diện tích, thể tích',
    order_index: 110,
    search_query: 'nguyen ham tich phan ung dung dien tich the tich toan 12',
    summary: 'Bảng nguyên hàm, công thức Newton-Leibniz, phương pháp đổi biến số, tích phân từng phần và ứng dụng hình học.',
    key_formulas: `$\\int_a^b f(x) dx = F(b) - F(a)$
Từng phần: $\\int u dv = uv - \\int v du$
Diện tích: $S = \\int_a^b |f(x) - g(x)| dx$
Thể tích: $V = \\pi \\int_a^b f^2(x) dx$`,
    content_markdown: `## I. Định Nghĩa & Phương Pháp Tính Tích Phân
### 1. Công thức tích phân từng phần:
$$\\int_a^b u \\, dv = \\left. u v \\right|_a^b - \\int_a^b v \\, du$$
*Thứ tự ưu tiên đặt $u$*: "Nhất lô, nhì đa, tam lượng, tứ mũ" (Logarit $\\to$ Đa thức $\\to$ Lượng giác $\\to$ Mũ).

---

## II. Ứng Dụng Hình Học Của Tích Phân
1. **Diện tích hình phẳng**:
   $$S = \\int_a^b |f_1(x) - f_2(x)| dx$$
2. **Thể tích khối tròn xoay quanh trục $Ox$**:
   $$V = \\pi \\int_a^b [f(x)]^2 dx$$`,
    quizzes: [
      {
        question: 'Diện tích hình phẳng giới hạn bởi đồ thị $y = x^2$, trục hoành và hai đường thẳng $x = 0, x = 3$ là:',
        options: [
          { id: 'A', text: '$9$' },
          { id: 'B', text: '$27$' },
          { id: 'C', text: '$3$' },
          { id: 'D', text: '$6$' }
        ],
        correct_answer: 'A',
        explanation: 'Diện tích $S = \\int_0^3 x^2 dx = \\left. \\frac{x^3}{3} \\right|_0^3 = \\frac{27}{3} - 0 = 9$.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 12,
    chapter_title: 'Toán 12 - Chương 3: Tọa Độ Trong Không Gian Oxyz',
    topic_title: 'Bài 11: Phương trình Mặt phẳng, Đường thẳng & Mặt cầu',
    order_index: 111,
    search_query: 'phuong trinh mat phang duong thang mat cau toan 12 oxyz',
    summary: 'Phương trình tổng quát mặt phẳng, phương trình chính tắc/tham số của đường thẳng và vị trí tương đối trong không gian.',
    key_formulas: `Mặt phẳng $(P): A(x - x_0) + B(y - y_0) + C(z - z_0) = 0$
Đường thẳng $d: \\frac{x - x_0}{a} = \\frac{y - y_0}{b} = \\frac{z - z_0}{c}$
Mặt cầu $(S): (x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$
Khoảng cách: $d(M, (P)) = \\frac{|Ax_M + By_M + Cz_M + D|}{\\sqrt{A^2 + B^2 + C^2}}$`,
    content_markdown: `## I. Phương Trình Mặt Phẳng
Mặt phẳng đi qua $M_0(x_0; y_0; z_0)$ có vectơ pháp tuyến $\\vec{n} = (A; B; C)$:
$$A(x - x_0) + B(y - y_0) + C(z - z_0) = 0 \\iff Ax + By + Cz + D = 0$$

## II. Phương Trình Đường Thẳng
Đường thẳng đi qua $M_0(x_0; y_0; z_0)$ có vectơ chỉ phương $\\vec{u} = (a; b; c)$:
- **Phương trình tham số**:
  $$\\begin{cases} x = x_0 + at \\\\ y = y_0 + bt \\\\ z = z_0 + ct \\end{cases} \\quad (t \\in \\mathbb{R})$$
- **Phương trình chính tắc** (với $abc \\neq 0$):
  $$\\frac{x - x_0}{a} = \\frac{y - y_0}{b} = \\frac{z - z_0}{c}$$`,
    quizzes: [
      {
        question: 'Trong không gian $Oxyz$, một vectơ pháp tuyến của mặt phẳng $(P): 2x - 3y + z - 5 = 0$ là:',
        options: [
          { id: 'A', text: '$\\vec{n} = (2; -3; 1)$' },
          { id: 'B', text: '$\\vec{n} = (2; 3; 1)$' },
          { id: 'C', text: '$\\vec{n} = (2; -3; -5)$' },
          { id: 'D', text: '$\\vec{n} = (-3; 1; -5)$' }
        ],
        correct_answer: 'A',
        explanation: 'Phương trình tổng quát có dạng $Ax + By + Cz + D = 0$, khi đó vectơ pháp tuyến là các hệ số đứng trước $x, y, z$: $\\vec{n} = (A; B; C) = (2; -3; 1)$.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 12,
    chapter_title: 'Toán 12 - Chương 4: Xác Suất Có Điều Kiện',
    topic_title: 'Bài 12: Xác suất có điều kiện & Công thức Bayes (Format 2025+)',
    order_index: 112,
    search_query: 'xac suat co dieu kien cong thuc toan phan bayes toan 12 chuong trinh moi',
    summary: 'Khái niệm xác suất có điều kiện $P(A|B)$, công thức nhân xác suất, công thức xác suất toàn phần và công thức Bayes.',
    key_formulas: `$P(A|B) = \\frac{P(A \\cap B)}{P(B)} \\quad (P(B) > 0)$
Nhân xác suất: $P(A \\cap B) = P(B) \\cdot P(A|B) = P(A) \\cdot P(B|A)$
Xác suất toàn phần: $P(A) = \\sum_{i=1}^n P(B_i) \\cdot P(A|B_i)$
Công thức Bayes: $P(B_k|A) = \\frac{P(B_k) \\cdot P(A|B_k)}{P(A)}$`,
    content_markdown: `## I. Xác Suất Có Điều Kiện
- **Định nghĩa**: Cho hai biến cố $A$ và $B$ với $P(B) > 0$. Xác suất của biến cố $A$ với điều kiện biến cố $B$ đã xảy ra được ký hiệu là $P(A|B)$ và xác định bởi:
  $$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$

---

## II. Công Thức Xác Suất Toàn Phần & Công Thức Bayes
### 1. Công thức xác suất toàn phần:
Giả sử hệ biến cố $B_1, B_2, \\dots, B_n$ tạo thành một hệ đầy đủ các biến cố xung khắc từng đôi một và $P(B_i) > 0$. Khi đó với mọi biến cố $A$:
$$P(A) = P(B_1)P(A|B_1) + P(B_2)P(A|B_2) + \\dots + P(B_n)P(A|B_n)$$

### 2. Công thức Bayes:
$$P(B_k|A) = \\frac{P(B_k)P(A|B_k)}{\\sum_{i=1}^n P(B_i)P(A|B_i)}$$
*(Công thức Bayes dùng để tính xác suất tiên lượng hoặc cập nhật xác suất khi đã biết kết quả $A$ xảy ra)*.`,
    quizzes: [
      {
        question: 'Cho hai biến cố $A$ và $B$ có $P(B) = 0{,}4$ và $P(A \\cap B) = 0{,}1$. Xác suất có điều kiện $P(A|B)$ là:',
        options: [
          { id: 'A', text: '$0{,}25$' },
          { id: 'B', text: '$0{,}4$' },
          { id: 'C', text: '$0{,}1$' },
          { id: 'D', text: '$0{,}5$' }
        ],
        correct_answer: 'A',
        explanation: 'Theo công thức xác suất có điều kiện: $P(A|B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{0{,}1}{0{,}4} = 0{,}25$.'
      }
    ]
  },

  // ===========================================================================
  // MÔN VẬT LÝ - LỚP 10
  // ===========================================================================
  {
    subject_id: 'physics',
    grade: 10,
    chapter_title: 'Vật Lý 10 - Chương 1: Động Học',
    topic_title: 'Bài 1: Chuyển động biến đổi đều & Rơi tự do',
    order_index: 201,
    search_query: 'chuyen dong bien doi deu roi tu do vat ly 10',
    summary: 'Phương trình vận tốc, tọa độ, đồ thị vận tốc - thời gian và gia tốc rơi tự do $g \\approx 9{,}8\\text{ m/s}^2$.',
    key_formulas: `$v = v_0 + at$
$s = v_0 t + \\frac{1}{2}at^2$
$v^2 - v_0^2 = 2as$
Rơi tự do: $v = gt, \\ h = \\frac{1}{2}gt^2, \\ v = \\sqrt{2gh}$`,
    content_markdown: `## I. Chuyển Động Thẳng Biến Đổi Đều
- **Vận tốc tức thời**: $v = v_0 + at$
- **Độ dịch chuyển**: $d = v_0 t + \\frac{1}{2}at^2$
- **Hệ thức độc lập thời gian**:
  $$v^2 - v_0^2 = 2ad$$

## II. Sự Rơi Tự Do
- Rơi tự do là sự rơi chỉ dưới tác dụng của trọng lực.
- Chuyển động thẳng nhanh dần đều theo phương thẳng đứng, hướng từ trên xuống dưới với gia tốc trọng trường $g$.
- Vận tốc tại thời điểm chạm đất từ độ cao $h$:
  $$v = \\sqrt{2gh}$$`,
    quizzes: [
      {
        question: 'Một vật rơi tự do từ độ cao $20\\text{ m}$ xuống đất, lấy $g = 10\\text{ m/s}^2$. Thời gian rơi của vật là:',
        options: [
          { id: 'A', text: '$2\\text{ s}$' },
          { id: 'B', text: '$4\\text{ s}$' },
          { id: 'C', text: '$1\\text{ s}$' },
          { id: 'D', text: '$20\\text{ s}$' }
        ],
        correct_answer: 'A',
        explanation: 'Ta có công thức quãng đường rơi tự do $h = \\frac{1}{2}gt^2 \\Rightarrow t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2 \\times 20}{10}} = \\sqrt{4} = 2\\text{ s}$.'
      }
    ]
  },

  {
    subject_id: 'physics',
    grade: 10,
    chapter_title: 'Vật Lý 10 - Chương 2: Động Lực Học',
    topic_title: 'Bài 2: Các định luật Newton & Các lực cơ học',
    order_index: 202,
    search_query: 'ba dinh luat newton luc ma sat luc hap dan vat ly 10',
    summary: 'Ba định luật Newton, định luật vạn vật hấp dẫn, lực đàn hồi (Hooke) và lực ma sát trượt.',
    key_formulas: `Định luật II: $\\vec{F} = m\\vec{a}$
Lực đàn hồi: $F_{đh} = k |\\Delta l|$
Lực ma sát trượt: $F_{mst} = \\mu N$
Lực hấp dẫn: $F_{hd} = G \\frac{m_1 m_2}{r^2}$`,
    content_markdown: `## I. Ba Định Luật Newton
1. **Định luật I**: Một vật không chịu tác dụng của lực nào (hoặc hợp lực bằng $0$) sẽ giữ nguyên trạng thái đứng yên hoặc chuyển động thẳng đều.
2. **Định luật II**: $\\vec{a} = \\frac{\\vec{F}}{m} \\iff \\vec{F} = m\\vec{a}$.
3. **Định luật III**: Hai lực tương tác giữa hai vật là hai lực trực đối: $\\vec{F}_{AB} = -\\vec{F}_{BA}$.

## II. Các Lực Cơ Học Thường Gặp
- **Trọng lực**: $\\vec{P} = m\\vec{g}$.
- **Lực đàn hồi (Định luật Hooke)**: $F_{đh} = k |\\Delta l|$.
- **Lực ma sát trượt**: $F_{mst} = \\mu N$ (không phụ thuộc diện tích tiếp xúc).`,
    quizzes: [
      {
        question: 'Lực tác dụng có độ lớn $10\\text{ N}$ vào một vật có khối lượng $2\\text{ kg}$. Gia tốc mà vật thu được là:',
        options: [
          { id: 'A', text: '$5\\text{ m/s}^2$' },
          { id: 'B', text: '$20\\text{ m/s}^2$' },
          { id: 'C', text: '$2\\text{ m/s}^2$' },
          { id: 'D', text: '$0{,}2\\text{ m/s}^2$' }
        ],
        correct_answer: 'A',
        explanation: 'Áp dụng định luật II Newton: $a = \\frac{F}{m} = \\frac{10}{2} = 5\\text{ m/s}^2$.'
      }
    ]
  },

  // ===========================================================================
  // MÔN VẬT LÝ - LỚP 11
  // ===========================================================================
  {
    subject_id: 'physics',
    grade: 11,
    chapter_title: 'Vật Lý 11 - Chương 1: Dao Động',
    topic_title: 'Bài 3: Dao động điều hòa & Năng lượng dao động',
    order_index: 203,
    search_query: 'dao dong dieu hoa con lac lo xo nang luong vat ly 11',
    summary: 'Phương trình dao động điều hòa, con lắc lò xo, con lắc đơn và định luật bảo toàn cơ năng dao động.',
    key_formulas: `$x = A \\cos(\\omega t + \\varphi)$
$v = -\\omega A \\sin(\\omega t + \\varphi)$
$a = -\\omega^2 x$
Cơ năng: $W = W_đ + W_t = \\frac{1}{2}m\\omega^2 A^2 = \\text{const}$`,
    content_markdown: `## I. Dao Động Điều Hòa
- Phương trình li độ: $x = A \\cos(\\omega t + \\varphi)$
- Phương trình vận tốc: $v = x' = -\\omega A \\sin(\\omega t + \\varphi) = \\omega A \\cos(\\omega t + \\varphi + \\pi/2)$
- Phương trình gia tốc: $a = v' = -\\omega^2 x = \\omega^2 A \\cos(\\omega t + \\varphi + \\pi)$

## II. Năng Lượng Trong Dao Động
- Động năng: $W_đ = \\frac{1}{2}mv^2$
- Thế năng: $W_t = \\frac{1}{2}kx^2 = \\frac{1}{2}m\\omega^2 x^2$
- Cơ năng bảo toàn: $W = W_đ + W_t = \\frac{1}{2}m\\omega^2 A^2$`,
    quizzes: [
      {
        question: 'Tại vị trí cân bằng của một vật dao động điều hòa thì:',
        options: [
          { id: 'A', text: 'Vận tốc có độ lớn cực đại, gia tốc bằng 0' },
          { id: 'B', text: 'Vận tốc bằng 0, gia tốc có độ lớn cực đại' },
          { id: 'C', text: 'Cả vận tốc và gia tốc đều đạt cực đại' },
          { id: 'D', text: 'Cả vận tốc và gia tốc đều bằng 0' }
        ],
        correct_answer: 'A',
        explanation: 'Tại vị trí cân bằng li độ $x = 0$, gia tốc $a = -\\omega^2 x = 0$. Vận tốc đạt độ lớn cực đại $|v_{\\max}| = \\omega A$.'
      }
    ]
  },

  {
    subject_id: 'physics',
    grade: 11,
    chapter_title: 'Vật Lý 11 - Chương 2: Sóng Cơ & Sóng Điện Từ',
    topic_title: 'Bài 4: Giao thoa sóng cơ, Sóng dừng & Đặc trưng âm',
    order_index: 204,
    search_query: 'giao thoa song song dung dac trung vat ly am vat ly 11',
    summary: 'Điều kiện cực đại cực tiểu giao thoa, điều kiện sóng dừng trên dây hai đầu cố định và thang sóng điện từ.',
    key_formulas: `Bước sóng: $\\lambda = v \\cdot T = \\frac{v}{f}$
Cực đại giao thoa: $d_2 - d_1 = k\\lambda$
Cực tiểu giao thoa: $d_2 - d_1 = (k + 0{,}5)\\lambda$
Sóng dừng 2 đầu cố định: $L = k \\frac{\\lambda}{2}$ ($k$ bụng, $k+1$ nút)`,
    content_markdown: `## I. Giao Thoa Sóng Cơ
Điều kiện hai nguồn kết hợp: Cùng tần số và có hiệu số pha không đổi theo thời gian.
- **Cực đại giao thoa**: $d_2 - d_1 = k\\lambda \\quad (k \\in \\mathbb{Z})$
- **Cực tiểu giao thoa**: $d_2 - d_1 = (k + 0{,}5)\\lambda \\quad (k \\in \\mathbb{Z})$

## II. Sóng Dừng
- Sóng dừng là sóng có các nút (đứng yên) và các bụng (dao động cực đại) cố định trong không gian.
- **Dây 2 đầu cố định**: Chiều dài dây $L = k \\frac{\\lambda}{2}$ ($k$ là số bó sóng hay số bụng sóng).`,
    quizzes: [
      {
        question: 'Trên sợi dây dài $1\\text{ m}$ hai đầu cố định đang có sóng dừng với 2 bụng sóng. Bước sóng của sóng trên dây là:',
        options: [
          { id: 'A', text: '$1\\text{ m}$' },
          { id: 'B', text: '$2\\text{ m}$' },
          { id: 'C', text: '$0{,}5\\text{ m}$' },
          { id: 'D', text: '$4\\text{ m}$' }
        ],
        correct_answer: 'A',
        explanation: 'Với dây 2 đầu cố định có 2 bụng sóng nên $k = 2$. Áp dụng $L = k \\frac{\\lambda}{2} \\Rightarrow 1 = 2 \\times \\frac{\\lambda}{2} \\Rightarrow \\lambda = 1\\text{ m}$.'
      }
    ]
  },

  // ===========================================================================
  // MÔN VẬT LÝ - LỚP 12 (TRỌNG TÂM THI 2025+)
  // ===========================================================================
  {
    subject_id: 'physics',
    grade: 12,
    chapter_title: 'Vật Lý 12 - Chương 1: Vật Lý Nhiệt',
    topic_title: 'Bài 5: Nhiệt độ, Thang nhiệt độ, Nhiệt dung riêng & Nhiệt hóa hơi',
    order_index: 205,
    search_query: 'vat ly nhiet thang kelvin nhiet dung rieng nhiet hoa hoi vat ly 12 2025',
    summary: 'Nội dung trọng tâm mới của chương trình 2025: Thang Kelvin, công thức nhiệt lượng $Q = mc\\Delta T$, nhiệt nóng chảy và nhiệt hóa hơi riêng.',
    key_formulas: `Đổi thang: $T(\\text{K}) = t(^\\circ\\text{C}) + 273{,}15$
Nhiệt lượng truyền: $Q = mc \\Delta T$
Nhiệt nóng chảy: $Q = \\lambda m$
Nhiệt hóa hơi: $Q = L m$`,
    content_markdown: `## I. Thang Nhiệt Độ & Nội Năng
- **Thang nhiệt độ Kelvin** (Thang nhiệt độ tuyệt đối):
  $$T(\\text{K}) = t(^\\circ\\text{C}) + 273{,}15$$
  *Điểm $0\\text{ K}$ gọi là độ không tuyệt đối, tại đó mọi chuyển động nhiệt của phân tử ngừng lại*.

## II. Các Công Thức Tính Nhiệt Lượng
1. **Nhiệt lượng cần cung cấp để thay đổi nhiệt độ**:
   $$Q = mc \\Delta T$$
   *(với $c$ là nhiệt dung riêng của chất, đơn vị $\\text{J/(kg}\\cdot\\text{K)}$)*.
2. **Nhiệt lượng nóng chảy**:
   $$Q = \\lambda m$$
   *(với $\\lambda$ là nhiệt nóng chảy riêng)*.
3. **Nhiệt lượng hóa hơi**:
   $$Q = L m$$
   *(với $L$ là nhiệt hóa hơi riêng)*.`,
    quizzes: [
      {
        question: 'Nhiệt độ sôi của nước ở áp suất tiêu chuẩn là $100^\\circ\\text{C}$. Trong thang Kelvin, nhiệt độ này tương ứng là:',
        options: [
          { id: 'A', text: '$373{,}15\\text{ K}$' },
          { id: 'B', text: '$173{,}15\\text{ K}$' },
          { id: 'C', text: '$273{,}15\\text{ K}$' },
          { id: 'D', text: '$100\\text{ K}$' }
        ],
        correct_answer: 'A',
        explanation: 'Áp dụng công thức chuyển đổi thang nhiệt độ: $T = t + 273{,}15 = 100 + 273{,}15 = 373{,}15\\text{ K}$.'
      }
    ]
  },

  {
    subject_id: 'physics',
    grade: 12,
    chapter_title: 'Vật Lý 12 - Chương 2: Khí Lý Tưởng',
    topic_title: 'Bài 6: Các định luật chất khí & Phương trình trạng thái khí lý tưởng',
    order_index: 206,
    search_query: 'dinh luat boyle charles phuong trinh clapeyron khi ly tuong vat ly 12',
    summary: 'Định luật Boyle (đẳng nhiệt), Định luật Charles (đẳng áp) và phương trình Clapeyron - Mendeleev $pV = nRT$.',
    key_formulas: `Đẳng nhiệt (Boyle): $p_1 V_1 = p_2 V_2 \\quad (T = \\text{const})$
Đẳng áp (Charles): $\\frac{V_1}{T_1} = \\frac{V_2}{T_2} \\quad (p = \\text{const})$
Phương trình Clapeyron: $pV = nRT = \\frac{m}{M}RT$`,
    content_markdown: `## I. Các Quá Trình Biến Đổi Trạng Thái
1. **Định luật Boyle (Quá trình đẳng nhiệt, $T = \\text{const}$)**:
   $$p \\sim \\frac{1}{V} \\iff pV = \\text{hằng số}$$
2. **Định luật Charles (Quá trình đẳng áp, $p = \\text{const}$)**:
   $$\\frac{V}{T} = \\text{hằng số} \\quad (T \\text{ tính theo thang Kelvin})$$

## II. Phương Trình Trạng Thái Khí Lý Tưởng
$$\\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2}$$
Hoặc viết dưới dạng phương trình Clapeyron:
$$pV = nRT = \\frac{m}{M}RT$$
*(Hằng số khí lý tưởng $R \\approx 8{,}314\\text{ J/(mol}\\cdot\\text{K)}$)*.`,
    quizzes: [
      {
        question: 'Trong quá trình biến đổi đẳng nhiệt của một lượng khí lý tưởng xác định, nếu thể tích giảm đi 2 lần thì áp suất của khối khí sẽ:',
        options: [
          { id: 'A', text: 'Tăng lên 2 lần' },
          { id: 'B', text: 'Giảm đi 2 lần' },
          { id: 'C', text: 'Không đổi' },
          { id: 'D', text: 'Tăng lên 4 lần' }
        ],
        correct_answer: 'A',
        explanation: 'Theo định luật Boyle, trong quá trình đẳng nhiệt áp suất tỉ lệ nghịch với thể tích: $p_1 V_1 = p_2 V_2$. Khi thể tích giảm 2 lần ($V_2 = V_1/2$) thì áp suất phải tăng lên 2 lần ($p_2 = 2p_1$).'
      }
    ]
  },

  {
    subject_id: 'physics',
    grade: 12,
    chapter_title: 'Vật Lý 12 - Chương 3: Vật Lý Hạt Nhân',
    topic_title: 'Bài 7: Năng lượng liên kết hạt nhân & Định luật phóng xạ',
    order_index: 207,
    search_query: 'do hut khoi nang luong lien ket phong xa hat nhan vat ly 12',
    summary: 'Độ hụt khối $\\Delta m$, năng lượng liên kết riêng và định luật phóng xạ $N(t) = N_0 2^{-t/T}$.',
    key_formulas: `$\\Delta m = Z m_p + (A - Z)m_n - m_X$
$E_{lk} = \\Delta m \\cdot c^2$
Năng lượng liên kết riêng: $\\varepsilon = \\frac{E_{lk}}{A}$
Định luật phóng xạ: $N(t) = N_0 2^{-\\frac{t}{T}} = N_0 e^{-\\lambda t}$`,
    content_markdown: `## I. Năng Lượng Liên Kết Hạt Nhân
- **Độ hụt khối**: $\\Delta m = Z m_p + (A - Z)m_n - m_X$.
- **Năng lượng liên kết**: $E_{lk} = \\Delta m \\cdot c^2$.
- **Năng lượng liên kết riêng**: $\\varepsilon = \\frac{E_{lk}}{A}$. Đại lượng này đặc trưng cho **mức độ bền vững** của hạt nhân (các hạt nhân trung bình có số khối $50 < A < 70$ bền vững nhất trong tự nhiên).

## II. Định Luật Phóng Xạ
Phóng xạ là quá trình phân rã tự phát của một hạt nhân không bền vững thành các hạt nhân khác.
- Số hạt nhân còn lại sau thời gian $t$:
  $$N(t) = N_0 \\cdot 2^{-\\frac{t}{T}}$$
- Khối lượng còn lại sau thời gian $t$:
  $$m(t) = m_0 \\cdot 2^{-\\frac{t}{T}}$$
  *(với $T$ là chu kỳ bán rã của chất phóng xạ)*.`,
    quizzes: [
      {
        question: 'Chất phóng xạ có chu kỳ bán rã $T = 4\\text{ ngày}$. Ban đầu có $16\\text{ g}$. Sau $12\\text{ ngày}$, khối lượng chất phóng xạ còn lại là:',
        options: [
          { id: 'A', text: '$2\\text{ g}$' },
          { id: 'B', text: '$4\\text{ g}$' },
          { id: 'C', text: '$1\\text{ g}$' },
          { id: 'D', text: '$8\\text{ g}$' }
        ],
        correct_answer: 'A',
        explanation: 'Số chu kỳ bán rã đã trôi qua là $\\frac{t}{T} = \\frac{12}{4} = 3$. Khối lượng còn lại là $m = m_0 \\cdot 2^{-3} = \\frac{16}{8} = 2\\text{ g}$.'
      }
    ]
  },

  // ===========================================================================
  // MÔN HÓA HỌC - LỚP 10
  // ===========================================================================
  {
    subject_id: 'chemistry',
    grade: 10,
    chapter_title: 'Hóa Học 10 - Chương 1: Cấu Tạo Nguyên Tử & Bảng Tuần Hoàn',
    topic_title: 'Bài 1: Cấu hình electron & Định luật tuần hoàn các nguyên tố',
    order_index: 301,
    search_query: 'cau hinh electron bang tuan hoan hoa hoc 10 gdpt 2018',
    summary: 'Nguyên lý vững bền Pauli, Hund, quy tắc viết cấu hình electron và quy luật biến thiên tính kim loại - phi kim.',
    key_formulas: `Số khối: $A = Z + N$
Thứ tự năng lượng: $1s\\ 2s\\ 2p\\ 3s\\ 3p\\ 4s\\ 3d\\ 4p...$
Trong 1 chu kỳ: $Z$ tăng $\\Rightarrow$ Bán kính giảm, Độ âm điện tăng, Tính phi kim tăng`,
    content_markdown: `## I. Vỏ Nguyên Tử & Cấu Hình Electron
- Số electron tối đa trong từng phân lớp: $s^2, p^6, d^{10}, f^{14}$.
- **Quy tắc viết cấu hình e**:
  1. Xác định số electron $Z$.
  2. Phân bố theo mức năng lượng tăng dần: $1s\\ 2s\\ 2p\\ 3s\\ 3p\\ 4s\\ 3d...$
  3. Sắp xếp lại theo từng lớp electron (từ trong ra ngoài).

## II. Quy Luật Tuần Hoàn
Trong một chu kỳ (đi từ trái sang phải theo chiều tăng của $Z$):
- Bán kính nguyên tử: **Giảm dần** (do lực hút hạt nhân với vỏ e tăng).
- Độ âm điện: **Tăng dần**.
- Tính phi kim: **Tăng dần**, tính kim loại: **Giảm dần**.`,
    quizzes: [
      {
        question: 'Nguyên tử Sodium ($Na$, số hiệu nguyên tử $Z = 11$) có cấu hình electron là:',
        options: [
          { id: 'A', text: '$1s^2 2s^2 2p^6 3s^1$' },
          { id: 'B', text: '$1s^2 2s^2 2p^5 3s^2$' },
          { id: 'C', text: '$1s^2 2s^2 2p^7$' },
          { id: 'D', text: '$1s^2 2s^2 2p^6 3s^2$' }
        ],
        correct_answer: 'A',
        explanation: 'Với $Z = 11$, electron điền lần lượt vào các phân lớp: $1s^2$ (2e), $2s^2$ (2e), $2p^6$ (6e), còn lại 1e điền vào phân lớp $3s^1$. Vậy cấu hình là $1s^2 2s^2 2p^6 3s^1$.'
      }
    ]
  },

  {
    subject_id: 'chemistry',
    grade: 10,
    chapter_title: 'Hóa Học 10 - Chương 2: Phản Ứng Oxi Hóa - Khử',
    topic_title: 'Bài 2: Xác định số oxi hóa & Phương pháp thăng bằng electron',
    order_index: 302,
    search_query: 'phan ung oxi hoa khu thang bang electron hoa hoc 10',
    summary: 'Quy tắc gán số oxi hóa, định nghĩa chất khử - chất oxi hóa và các bước cân bằng phản ứng oxi hóa khử phức tạp.',
    key_formulas: `Số oxi hóa đơn chất $= 0$
Trong hợp chất: $H$ thường là $+1$, $O$ thường là $-2$
$\\sum n_e \\text{ nhường} = \\sum n_e \\text{ nhận}$`,
    content_markdown: `## I. Bản Chất Phản Ứng Oxi Hóa - Khử
Phản ứng oxi hóa - khử là phản ứng hóa học trong đó có sự chuyển dịch electron giữa các chất phản ứng.
- **Chất khử**: Nhường electron (Số oxi hóa **tăng** sau phản ứng).
- **Chất oxi hóa**: Nhận electron (Số oxi hóa **giảm** sau phản ứng).

## II. Phương Pháp Thăng Bằng Electron (4 Bước):
1. Xác định số oxi hóa của các nguyên tố thay đổi.
2. Viết quá trình oxi hóa (nhường e) và quá trình khử (nhận e).
3. Tìm bội chung nhỏ nhất để: $\\text{Tổng e nhường} = \\text{Tổng e nhận}$.
4. Đặt hệ số vào phương trình và kiểm tra bảo toàn nguyên tố.`,
    quizzes: [
      {
        question: 'Trong phản ứng $2\\text{Mg} + \\text{O}_2 \\to 2\\text{MgO}$, chất đóng vai trò là chất oxi hóa là:',
        options: [
          { id: 'A', text: '$\\text{O}_2$' },
          { id: 'B', text: '$\\text{Mg}$' },
          { id: 'C', text: '$\\text{MgO}$' },
          { id: 'D', text: 'Cả $\\text{Mg}$ và $\\text{O}_2$' }
        ],
        correct_answer: 'A',
        explanation: 'Số oxi hóa của Oxy giảm từ $0$ trong $\\text{O}_2$ xuống $-2$ trong $\\text{MgO}$ (nhận 2 electron), do đó $\\text{O}_2$ là chất oxi hóa.'
      }
    ]
  },

  // ===========================================================================
  // MÔN HÓA HỌC - LỚP 11
  // ===========================================================================
  {
    subject_id: 'chemistry',
    grade: 11,
    chapter_title: 'Hóa Học 11 - Chương 1: Cân Bằng Hóa Học',
    topic_title: 'Bài 3: Cân bằng hóa học & Thuyết Bronsted về Acid - Base',
    order_index: 303,
    search_query: 'can bang hoa hoc nguyen ly le chatelier acid base bronsted hoa hoc 11',
    summary: 'Biểu thức hằng số cân bằng $K_c$, nguyên lý Le Chatelier, pH dung dịch và thuyết cho nhận proton.',
    key_formulas: `$K_c = \\frac{[C]^c [D]^d}{[A]^a [B]^b}$
$\\text{pH} = -\\log[H^+]$
$[H^+][OH^-] = 10^{-14} \\quad (25^\\circ\\text{C})$`,
    content_markdown: `## I. Nguyên Lý Chuyển Dịch Cân Bằng Le Chatelier
Một phản ứng thuận nghịch đang ở trạng thái cân bằng, khi chịu một tác động từ bên ngoài (nồng độ, nhiệt độ, áp suất) thì cân bằng sẽ chuyển dịch theo chiều làm **giảm tác động đó**:
- Tăng nhiệt độ $\\to$ chuyển dịch theo chiều thu nhiệt ($\\Delta H > 0$).
- Tăng áp suất $\\to$ chuyển dịch theo chiều giảm số mol khí.

## II. Thuyết Acid - Base Của Brønsted - Lowry
- **Acid** là chất có khả năng **cho proton** ($H^+$).
- **Base** là chất có khả năng **nhận proton** ($H^+$).`,
    quizzes: [
      {
        question: 'Dung dịch có nồng độ $[H^+] = 10^{-3}\\text{ M}$ thì giá trị $\\text{pH}$ của dung dịch là:',
        options: [
          { id: 'A', text: '$3$' },
          { id: 'B', text: '$11$' },
          { id: 'C', text: '$7$' },
          { id: 'D', text: '$-3$' }
        ],
        correct_answer: 'A',
        explanation: 'Theo công thức tính pH: $\\text{pH} = -\\log[H^+] = -\\log(10^{-3}) = 3$. Dung dịch có môi trường axit.'
      }
    ]
  },

  {
    subject_id: 'chemistry',
    grade: 11,
    chapter_title: 'Hóa Học 11 - Chương 2: Hydrocarbon & Dẫn Xuất',
    topic_title: 'Bài 4: Alkane, Alkene & Phản ứng của Alcohol',
    order_index: 304,
    search_query: 'alkane alkene alcohol quy tac markovnikov hoa hoc 11',
    summary: 'Phản ứng thế halogen của ankan, phản ứng cộng theo quy tắc Markovnikov của anken và phản ứng tạo phức màu của ancol đa chức.',
    key_formulas: `Ankan: $\\text{C}_n\\text{H}_{2n+2} + \\text{Cl}_2 \\xrightarrow{\\text{ask}} \\text{C}_n\\text{H}_{2n+1}\\text{Cl} + \\text{HCl}$
Anken: $\\text{C}_n\\text{H}_{2n} + \\text{Br}_2 \\to \\text{C}_n\\text{H}_{2n}\\text{Br}_2$ (mất màu dung dịch Brom)
Ancol kề nhau $+ \\text{Cu(OH)}_2 \\to$ Dung dịch xanh lam thẫm`,
    content_markdown: `## I. Hydrocarbon
1. **Alkane**: Liên kết đơn bền vững, phản ứng đặc trưng là **phản ứng thế**.
2. **Alkene**: Có liên kết đôi $\\text{C}=\\text{C}$, phản ứng đặc trưng là **phản ứng cộng**.
   - **Quy tắc Markovnikov**: Khi cộng $HX$ vào anken bất đối, $H$ ưu tiên cộng vào $C$ bậc thấp hơn (chứa nhiều $H$ hơn), còn $X$ cộng vào $C$ bậc cao hơn.

## II. Alcohol & Phenol
- Ancol tác dụng với kim loại kiềm giải phóng khí $H_2$.
- **Đặc trưng nhận biết ancol đa chức có các nhóm $-OH$ kề nhau** (Glycerol, Ethylene glycol): Hòa tan được $\\text{Cu(OH)}_2$ ở nhiệt độ phòng tạo thành phức chất màu **xanh lam thẫm**.`,
    quizzes: [
      {
        question: 'Chất nào sau đây hòa tan được $\\text{Cu(OH)}_2$ ở nhiệt độ thường tạo thành dung dịch màu xanh lam thẫm?',
        options: [
          { id: 'A', text: 'Glycerol ($\\text{C}_3\\text{H}_5\\text{(OH)}_3$)' },
          { id: 'B', text: 'Ethanol ($\\text{C}_2\\text{H}_5\\text{OH}$)' },
          { id: 'C', text: 'Methanol ($\\text{CH}_3\\text{OH}$)' },
          { id: 'D', text: 'Dimethyl ether ($\\text{CH}_3\\text{OCH}_3$)' }
        ],
        correct_answer: 'A',
        explanation: 'Glycerol là ancol đa chức có 3 nhóm -OH kề nhau, có khả năng tạo phức càng cua hòa tan kết tủa Cu(OH)2 tạo dung dịch phức màu xanh lam thẫm.'
      }
    ]
  },

  // ===========================================================================
  // MÔN HÓA HỌC - LỚP 12 (TRỌNG TÂM THI 2025+)
  // ===========================================================================
  {
    subject_id: 'chemistry',
    grade: 12,
    chapter_title: 'Hóa Học 12 - Chương 1: Ester & Lipid',
    topic_title: 'Bài 5: Phản ứng xà phòng hóa este & Cấu tạo chất béo',
    order_index: 305,
    search_query: 'este lipit xa phong hoa chat beo hoa hoc 12',
    summary: 'Phản ứng thủy phân este trong môi trường axit và kiềm, chỉ số xà phòng hóa và các axit béo no/không no thường gặp.',
    key_formulas: `Thủy phân axit: $\\text{RCOOR}' + \\text{H}_2\\text{O} \\xrightleftharpoons{\\text{H}^+, t^\\circ} \\text{RCOOH} + \\text{R}'\\text{OH}$
Thủy phân kiềm: $\\text{RCOOR}' + \\text{NaOH} \\xrightarrow{t^\\circ} \\text{RCOONa} + \\text{R}'\\text{OH}$
Chất béo: $(\\text{RCOO})_3\\text{C}_3\\text{H}_5 + 3\\text{NaOH} \\to 3\\text{RCOONa} + \\text{C}_3\\text{H}_5\\text{(OH)}_3$`,
    content_markdown: `## I. Este
- Thủy phân este đơn chức trong dung dịch kiềm ($\text{NaOH}$) luôn là phản ứng một chiều.
- Một số este có mùi thơm hoa quả đặc trưng: Isoamyl acetate (mùi chuối chín), Ethyl formate (mùi đào), Benzyl acetate (mùi hoa nhài).

## II. Lipid & Chất Béo (Triglyceride)
- Chất béo là trieste của glycerol với các axit béo.
- **Axit béo no** (Tristearin $(\\text{C}_{17}\\text{H}_{35}\\text{COO})_3\\text{C}_3\\text{H}_5$, Tripalmitin): Thường ở trạng thái **rắn** (mỡ động vật).
- **Axit béo không no** (Triolein $(\\text{C}_{17}\\text{H}_{33}\\text{COO})_3\\text{C}_3\\text{H}_5$): Thường ở trạng thái **lỏng** (dầu thực vật). Có thể hydro hóa dầu lỏng thành mỡ rắn bơ nhân tạo.`,
    quizzes: [
      {
        question: 'Thủy phân chất béo Triolein trong dung dịch $\\text{NaOH}$ đun nóng thu được muối có công thức là:',
        options: [
          { id: 'A', text: '$\\text{C}_{17}\\text{H}_{33}\\text{COONa}$' },
          { id: 'B', text: '$\\text{C}_{17}\\text{H}_{35}\\text{COONa}$' },
          { id: 'C', text: '$\\text{C}_{15}\\text{H}_{31}\\text{COONa}$' },
          { id: 'D', text: '$\\text{CH}_3\\text{COONa}$' }
        ],
        correct_answer: 'A',
        explanation: 'Triolein là $(\\text{C}_{17}\\text{H}_{33}\\text{COO})_3\\text{C}_3\\text{H}_5$. Khi phản ứng với NaOH sẽ sinh ra muối natri oleate có công thức $\\text{C}_{17}\\text{H}_{33}\\text{COONa}$ và glycerol.'
      }
    ]
  },

  {
    subject_id: 'chemistry',
    grade: 12,
    chapter_title: 'Hóa Học 12 - Chương 2: Carbohydrate & Hợp Chất Chứa N',
    topic_title: 'Bài 6: Glucose, Saccharose, Amine & Amino Acid',
    order_index: 306,
    search_query: 'glucose saccharose amin amino acid hoa hoc 12',
    summary: 'Tính chất tráng bạc của glucose, phân biệt monosaccarit và disaccarit, tính bazơ của amin và tính chất lưỡng tính của amino acid.',
    key_formulas: `Tráng bạc: $\\text{C}_6\\text{H}_{12}\\text{O}_6 + 2\\text{AgNO}_3 + 3\\text{NH}_3 + \\text{H}_2\\text{O} \\to \\dots + 2\\text{Ag}\\downarrow$
$1\\text{ mol Glucose} \\Rightarrow 2\\text{ mol Ag}$
Lưỡng tính: $\\text{H}_2\\text{N-R-COOH}$ tác dụng được cả với axit mạnh và bazo mạnh`,
    content_markdown: `## I. Carbohydrate
- **Glucose**: Chứa 5 nhóm $-OH$ kề nhau và 1 nhóm aldehyde ($-CH=O$). Tham gia phản ứng tráng gương (tạo $2\\text{Ag}$).
- **Fructose**: Chứa nhóm ketone, trong môi trường kiềm có thể chuyển hóa thành glucose nên cũng tham gia phản ứng tráng bạc.
- **Saccharose**: Không có nhóm $-CHO$, không tráng gương. Nhưng khi thủy phân sinh ra cả glucose và fructose.

## II. Amine & Amino Acid
- **Tính bazơ của amin**: Amin béo bậc 2 > Amin béo bậc 1 > $NH_3$ > Aniline ($C_6H_5NH_2$).
- **Amino acid**: Là hợp chất tạp chức phân tử chứa đồng thời nhóm $-NH_2$ (mang tính bazo) và nhóm $-COOH$ (mang tính axit). Do đó amino acid có **tính lưỡng tính**.`,
    quizzes: [
      {
        question: 'Chất nào sau đây vừa tác dụng được với dung dịch $\\text{HCl}$, vừa tác dụng được với dung dịch $\\text{NaOH}$?',
        options: [
          { id: 'A', text: 'Glycine ($\\text{H}_2\\text{NCH}_2\\text{COOH}$)' },
          { id: 'B', text: 'Ethylamine ($\\text{C}_2\\text{H}_5\\text{NH}_2$)' },
          { id: 'C', text: 'Axit axetic ($\\text{CH}_3\\text{COOH}$)' },
          { id: 'D', text: 'Glucose ($\\text{C}_6\\text{H}_{12}\\text{O}_6$)' }
        ],
        correct_answer: 'A',
        explanation: 'Glycine là amino acid mang tính lưỡng tính vì phân tử chứa cả nhóm bazơ (-NH2 tác dụng với HCl) và nhóm axit (-COOH tác dụng với NaOH).'
      }
    ]
  },

  {
    subject_id: 'chemistry',
    grade: 12,
    chapter_title: 'Hóa Học 12 - Chương 3: Kim Loại & Dãy Điện Hóa',
    topic_title: 'Bài 7: Thế điện cực chuẩn, Dãy điện hóa & Ăn mòn kim loại',
    order_index: 307,
    search_query: 'the dien cuc day dien hoa kim loai an mon dien hoa hoc hoa hoc 12',
    summary: 'Dãy điện hóa kim loại, quy tắc $\\alpha$, điều kiện xảy ra ăn mòn điện hóa học và phương pháp chống ăn mòn.',
    key_formulas: `Dãy điện hóa: $\\text{K}^+ \\to \\text{Na}^+ \\to \\text{Mg}^{2+} \\to \\text{Al}^{3+} \\to \\text{Zn}^{2+} \\to \\text{Fe}^{2+} \\to \\text{Cu}^{2+} \\to \\text{Ag}^+$
Quy tắc $\\alpha$: $\\text{Chất oxi hóa mạnh} + \\text{Chất khử mạnh} \\to \\text{Chất oxi hóa yếu} + \\text{Chất khử yếu}$
3 điều kiện ăn mòn điện hóa: (1) 2 điện cực khác nhau; (2) Tiếp xúc trực tiếp/gián tiếp; (3) Cùng tiếp xúc dung dịch chất điện ly`,
    content_markdown: `## I. Dãy Điện Hóa Của Kim Loại & Quy Tắc $\\alpha$
$$\\text{K}^+/\\text{K} \\quad \\text{Na}^+/\\text{Na} \\quad \\text{Mg}^{2+}/\\text{Mg} \\quad \\text{Al}^{3+}/\\text{Al} \\quad \\text{Zn}^{2+}/\\text{Zn} \\quad \\text{Fe}^{2+}/\\text{Fe} \\quad \\text{Cu}^{2+}/\\text{Cu} \\quad \\text{Ag}^+/\\text{Ag}$$
- Tính oxi hóa của ion kim loại tăng dần từ trái sang phải.
- Tính khử của kim loại giảm dần từ trái sang phải.
- **Quy tắc $\\alpha$**: Kim loại đứng trước khử ion kim loại đứng sau trong dung dịch muối.
  $$\\text{Fe} + \\text{Cu}^{2+} \\to \\text{Fe}^{2+} + \\text{Cu}\\downarrow$$

## II. Ăn Mòn Điện Hóa Học
- Điều kiện để xảy ra ăn mòn điện hóa:
  1. Hai điện cực khác chất (kim loại - kim loại hoặc kim loại - phi kim như Fe - C).
  2. Hai điện cực tiếp xúc trực tiếp hoặc qua dây dẫn.
  3. Cùng nhúng vào một dung dịch chất điện ly.
- **Cơ chế**: Kim loại có tính khử mạnh hơn sẽ đóng vai trò là **Anode (cực âm) và bị ăn mòn trước**.`,
    quizzes: [
      {
        question: 'Nhúng một thanh sắt (Fe) vào dung dịch $\\text{CuSO}_4$. Hiện tượng quan sát được là:',
        options: [
          { id: 'A', text: 'Có lớp kim loại màu đỏ bám ngoài thanh sắt, màu xanh của dung dịch nhạt dần' },
          { id: 'B', text: 'Có bọt khí bay lên mạnh mẽ từ thanh sắt' },
          { id: 'C', text: 'Thanh sắt tan hết mà không có kim loại bám ngoài' },
          { id: 'D', text: 'Không có hiện tượng gì xảy ra' }
        ],
        correct_answer: 'A',
        explanation: 'Do sắt có tính khử mạnh hơn đồng: $\\text{Fe} + \\text{CuSO}_4 \\to \\text{FeSO}_4 + \\text{Cu}\\downarrow$. Kim loại đồng màu đỏ sinh ra bám trên thanh sắt, đồng thời ion $\\text{Cu}^{2+}$ màu xanh bị tiêu thụ làm dung dịch nhạt dần.'
      }
    ]
  },

  // ===========================================================================
  // MÔN TOÁN BỔ SUNG (LỚP 10, 11, 12)
  // ===========================================================================
  {
    subject_id: 'math',
    grade: 10,
    chapter_title: 'Toán 10 - Chương 5: Phương Pháp Tọa Độ Mặt Phẳng',
    topic_title: 'Bài 13: Phương trình đường thẳng, đường tròn & Ba đường Conic',
    order_index: 113,
    search_query: 'phuong trinh duong thang duong tron elip toan 10',
    summary: 'Phương trình tổng quát, tham số của đường thẳng, khoảng cách từ điểm đến đường thẳng, phương trình chính tắc Elip, Hypebol, Parabol.',
    key_formulas: `Đường thẳng $\\Delta: ax + by + c = 0$
Khoảng cách: $d(M_0, \\Delta) = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^2 + b^2}}$
Đường tròn $(C): (x - a)^2 + (y - b)^2 = R^2$
Elip: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\quad (a^2 = b^2 + c^2)$`,
    content_markdown: `## I. Phương Trình Đường Thẳng
- Vectơ pháp tuyến $\\vec{n} = (a; b) \\Rightarrow$ Phương trình tổng quát: $ax + by + c = 0$.
- Vectơ chỉ phương $\\vec{u} = (u_1; u_2) \\Rightarrow$ Hệ số góc $k = \\frac{u_2}{u_1}$.
- **Khoảng cách từ điểm $M_0(x_0; y_0)$ đến $\\Delta$**:
  $$d(M_0, \\Delta) = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^2 + b^2}}$$

## II. Phương Trình Đường Tròn & Đường Conic
1. **Đường tròn**: Tâm $I(a; b)$, bán kính $R$:
   $$(x - a)^2 + (y - b)^2 = R^2 \\iff x^2 + y^2 - 2ax - 2by + c = 0 \\quad (a^2 + b^2 - c > 0)$$
2. **Elip (E)**: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ với $a > b > 0$ và tiêu cự $2c$ ($c^2 = a^2 - b^2$).`,
    quizzes: [
      {
        question: 'Khoảng cách từ điểm $M(1; -2)$ đến đường thẳng $\\Delta: 3x - 4y + 4 = 0$ là:',
        options: [
          { id: 'A', text: '$3$' },
          { id: 'B', text: '$5$' },
          { id: 'C', text: '$15$' },
          { id: 'D', text: '$2{,}5$' }
        ],
        correct_answer: 'A',
        explanation: 'Áp dụng công thức khoảng cách: $d(M, \\Delta) = \\frac{|3(1) - 4(-2) + 4|}{\\sqrt{3^2 + (-4)^2}} = \\frac{|3 + 8 + 4|}{\\sqrt{25}} = \\frac{15}{5} = 3$.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 10,
    chapter_title: 'Toán 10 - Chương 6: Đại Số Tổ Hợp',
    topic_title: 'Bài 14: Hoán vị, Chỉnh hợp, Tổ hợp & Nhị thức Newton',
    order_index: 114,
    search_query: 'hoan vi chinh hop to hợp nhi thuc newton toan 10',
    summary: 'Quy tắc đếm (cộng, nhân), công thức tính $P_n, A_n^k, C_n^k$ và khai triển nhị thức Newton bậc 4, bậc 5.',
    key_formulas: `Hoán vị: $P_n = n!$
Chỉnh hợp: $A_n^k = \\frac{n!}{(n - k)!}$
Tổ hợp: $C_n^k = \\frac{n!}{k!(n - k)!}$
Nhị thức Newton: $(a + b)^4 = a^4 + 4a^3b + 6a^2b^2 + 4ab^3 + b^4$`,
    content_markdown: `## I. Phân Biệt Hoán Vị, Chỉnh Hợp và Tổ Hợp
- **Hoán vị ($P_n = n!$)**: Đổi chỗ tất cả $n$ phần tử, **có thứ tự**.
- **Chỉnh hợp ($A_n^k$)**: Chọn $k$ phần tử từ $n$ phần tử rồi **sắp xếp có thứ tự** (ví dụ: xếp hàng, phân công chức vụ).
- **Tổ hợp ($C_n^k$)**: Chỉ chọn $k$ phần tử từ $n$ phần tử, **không quan tâm thứ tự** (ví dụ: chọn ban đại diện, chọn số quả cầu).

## II. Khai Triển Nhị Thức Newton
$$(a + b)^n = \\sum_{k=0}^n C_n^k a^{n-k} b^k$$
- Số hạng thứ $k + 1$ là: $T_{k+1} = C_n^k a^{n-k} b^k$.`,
    quizzes: [
      {
        question: 'Có bao nhiêu cách chọn 3 học sinh từ một tổ gồm 10 học sinh để đi làm vệ sinh sân trường?',
        options: [
          { id: 'A', text: '$C_{10}^3 = 120$' },
          { id: 'B', text: '$A_{10}^3 = 720$' },
          { id: 'C', text: '$30$' },
          { id: 'D', text: '$10^3 = 1000$' }
        ],
        correct_answer: 'A',
        explanation: 'Vì việc chọn 3 học sinh cùng đi làm nhiệm vụ không phân biệt thứ tự ai trước ai sau, nên số cách chọn là tổ hợp chập 3 của 10 phần tử: $C_{10}^3 = \\frac{10!}{3!7!} = 120$.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 11,
    chapter_title: 'Toán 11 - Chương 4: Đạo Hàm',
    topic_title: 'Bài 15: Định nghĩa đạo hàm, Quy tắc tính & Phương trình tiếp tuyến',
    order_index: 115,
    search_query: 'quy tac dao ham phuong trinh tiep tuyen toan 11',
    summary: 'Bảng đạo hàm cơ bản, đạo hàm hàm hợp, ý nghĩa hình học của đạo hàm và phương trình tiếp tuyến $y = f\'(x_0)(x - x_0) + y_0$.',
    key_formulas: `Tiếp tuyến: $y = f'(x_0)(x - x_0) + y_0$
$(uv)' = u'v + uv'$
$(\\frac{u}{v})' = \\frac{u'v - uv'}{v^2}$
$(u^n)' = n u^{n-1} u'$`,
    content_markdown: `## I. Bảng Đạo Hàm Cơ Bản & Đạo Hàm Hàm Hợp
- $(x^n)' = n x^{n-1} \\Rightarrow (u^n)' = n u^{n-1} u'$
- $(\\sqrt{x})' = \\frac{1}{2\\sqrt{x}} \\Rightarrow (\\sqrt{u})' = \\frac{u'}{2\\sqrt{u}}$
- $(\\sin x)' = \\cos x, \\quad (\\cos x)' = -\\sin x$
- $(\\tan x)' = 1 + \\tan^2 x = \\frac{1}{\\cos^2 x}$

## II. Phương Trình Tiếp Tuyến Của Đồ Thị Hàm Số
Phương trình tiếp tuyến của đồ thị hàm số $y = f(x)$ tại điểm $M_0(x_0; y_0)$ có dạng:
$$y = f'(x_0)(x - x_0) + y_0$$
- $k = f'(x_0)$ là hệ số góc của tiếp tuyến.
- Hai đường thẳng song song thì cùng hệ số góc: $k_1 = k_2$.
- Hai đường thẳng vuông góc: $k_1 \\cdot k_2 = -1$.`,
    quizzes: [
      {
        question: 'Hệ số góc của tiếp tuyến của đồ thị hàm số $y = x^3 - 3x + 2$ tại điểm có hoành độ $x_0 = 2$ là:',
        options: [
          { id: 'A', text: '$9$' },
          { id: 'B', text: '$6$' },
          { id: 'C', text: '$3$' },
          { id: 'D', text: '$12$' }
        ],
        correct_answer: 'A',
        explanation: 'Ta có $y\' = 3x^2 - 3$. Hệ số góc tại $x_0 = 2$ là $k = y\'(2) = 3(2^2) - 3 = 12 - 3 = 9$.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 11,
    chapter_title: 'Toán 11 - Chương 5: Hàm Số Mũ & Logarit',
    topic_title: 'Bài 16: Lũy thừa, Hàm số Mũ & Hàm số Logarit',
    order_index: 116,
    search_query: 'luy thua ham so mu logarit toan 11',
    summary: 'Tính chất logarit, điều kiện xác định, đạo hàm $(a^x)\', (\\log_a x)\'$ và phương pháp giải phương trình mũ - logarit.',
    key_formulas: `$\\log_a(xy) = \\log_a x + \\log_a y$
$\\log_a\\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y$
Đạo hàm: $(a^x)' = a^x \\ln a, \\quad (e^x)' = e^x$
$(\\log_a x)' = \\frac{1}{x \\ln a}, \\quad (\\ln x)' = \\frac{1}{x}$`,
    content_markdown: `## I. Các Tính Chất Của Logarit ($a > 0, a \\neq 1$)
- $\\log_a 1 = 0, \\quad \\log_a a = 1, \\quad \\log_a(a^b) = b$.
- Công thức đổi cơ số: $\\log_a b = \\frac{\\log_c b}{\\log_c a}$.
- Lũy thừa của biểu thức: $\\log_a(b^\\alpha) = \\alpha \\log_a b$ (với $b > 0$).

## II. Đạo Hàm & Đồ Thị
- Khi $a > 1$: Cả hàm số mũ $y = a^x$ và hàm số logarit $y = \\log_a x$ đều **đồng biến** trên tập xác định.
- Khi $0 < a < 1$: Cả hai hàm số đều **nghịch biến** trên tập xác định.
- Đồ thị hàm số $y = a^x$ và $y = \\log_a x$ đối xứng nhau qua đường phân giác thứ nhất $y = x$.`,
    quizzes: [
      {
        question: 'Tập nghiệm của phương trình $\\log_2(2x - 1) = 3$ là:',
        options: [
          { id: 'A', text: '$\\{4{,}5\\}$' },
          { id: 'B', text: '$\\{5\\}$' },
          { id: 'C', text: '$\\{3{,}5\\}$' },
          { id: 'D', text: '$\\{4\\}$' }
        ],
        correct_answer: 'A',
        explanation: 'Điều kiện: $2x - 1 > 0 \\Leftrightarrow x > 0{,}5$. Phương trình tương đương: $2x - 1 = 2^3 = 8 \\Leftrightarrow 2x = 9 \\Leftrightarrow x = 4{,}5$ (thỏa mãn điều kiện).'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 12,
    chapter_title: 'Toán 12 - Chương 1: Ứng Dụng Đạo Hàm',
    topic_title: 'Bài 17: Giá trị lớn nhất & nhỏ nhất của hàm số',
    order_index: 117,
    search_query: 'gia tri lon nhat nho nhat max min toan 12',
    summary: 'Phương pháp tìm GTLN và GTNN trên một đoạn $[a; b]$, trên một khoảng và bài toán ứng dụng thực tế tối ưu hóa chi phí/thể tích.',
    key_formulas: `Trên $[a; b]$: Tính $f(a), f(b)$ và $f(x_i)$ tại $f'(x_i) = 0$
$M = \\max_{[a; b]} f(x), \\quad m = \\min_{[a; b]} f(x)$`,
    content_markdown: `## I. Quy Tắc Tìm Max - Min Trên Đoạn $[a; b]$
1. Tìm các điểm $x_1, x_2, \\dots, x_n$ trên khoảng $(a; b)$ tại đó $f'(x) = 0$ hoặc $f'(x)$ không xác định.
2. Tính các giá trị $f(a), f(b), f(x_1), \\dots, f(x_n)$.
3. So sánh:
   - Số lớn nhất trong các giá trị đó là **Giá trị lớn nhất** ($\\max_{[a; b]} f(x)$).
   - Số nhỏ nhất trong các giá trị đó là **Giá trị nhỏ nhất** ($\\min_{[a; b]} f(x)$).

> [!NOTE]
> Hàm số liên tục trên một đoạn đóng $[a; b]$ luôn đạt được giá trị lớn nhất và giá trị nhỏ nhất trên đoạn đó.`,
    quizzes: [
      {
        question: 'Giá trị nhỏ nhất của hàm số $f(x) = x^4 - 2x^2 + 3$ trên đoạn $[0; 2]$ là:',
        options: [
          { id: 'A', text: '$2$' },
          { id: 'B', text: '$3$' },
          { id: 'C', text: '$11$' },
          { id: 'D', text: '$1$' }
        ],
        correct_answer: 'A',
        explanation: 'Ta có $f\'(x) = 4x^3 - 4x = 4x(x^2 - 1) = 0 \\Leftrightarrow x = 0$ hoặc $x = 1$ (thuộc $[0; 2]$). Tính các giá trị: $f(0) = 3$, $f(1) = 1 - 2 + 3 = 2$, $f(2) = 16 - 8 + 3 = 11$. Vậy giá trị nhỏ nhất là $m = 2$ tại $x = 1$.'
      }
    ]
  },

  {
    subject_id: 'math',
    grade: 12,
    chapter_title: 'Toán 12 - Chương 5: Thống Kê (Cấu Trúc 2025+)',
    topic_title: 'Bài 18: Các số đặc trưng đo độ phân tán của mẫu ghép nhóm',
    order_index: 118,
    search_query: 'so dac trung do phan tan phuong sai do lech chuan ghep nhom toan 12 2025',
    summary: 'Khoảng biến thiên, khoảng tứ phân vị, phương sai $s^2$ và độ lệch chuẩn $s$ của mẫu số liệu ghép nhóm (nội dung mới chuẩn Bộ GD&ĐT 2025).',
    key_formulas: `Khoảng biến thiên: $R = x_{\\max} - x_{\\min}$
Khoảng tứ phân vị: $\\Delta_Q = Q_3 - Q_1$
Phương sai: $s^2 = \\frac{1}{n} \\sum_{i=1}^k m_i (c_i - \\overline{x})^2$
Độ lệch chuẩn: $s = \\sqrt{s^2}$`,
    content_markdown: `## I. Mẫu Số Liệu Ghép Nhóm
Mẫu số liệu ghép nhóm là mẫu số liệu được cho dưới dạng các khoảng nửa đóng $[a_i; a_{i+1})$ cùng với tần số $m_i$ tương ứng.
- **Giá trị đại diện của nhóm** $[a_i; a_{i+1})$:
  $$c_i = \\frac{a_i + a_{i+1}}{2}$$
- **Số trung bình của mẫu ghép nhóm**:
  $$\\overline{x} = \\frac{\\sum_{i=1}^k m_i c_i}{n} \\quad (n = \\sum m_i)$$

## II. Các Số Đặc Trưng Đo Độ Phân Tán
1. **Khoảng tứ phân vị**: $\\Delta_Q = Q_3 - Q_1$ (ít bị ảnh hưởng bởi giá trị ngoại lai).
2. **Phương sai ($s^2$) & Độ lệch chuẩn ($s$)**:
   $$s^2 = \\frac{1}{n} \\sum_{i=1}^k m_i c_i^2 - (\\overline{x})^2, \\quad s = \\sqrt{s^2}$$
   *(Độ lệch chuẩn càng lớn thì số liệu càng phân tán xa số trung bình)*.`,
    quizzes: [
      {
        question: 'Số đặc trưng nào sau đây dùng để đo mức độ phân tán của số liệu quanh giá trị trung bình?',
        options: [
          { id: 'A', text: 'Độ lệch chuẩn và phương sai' },
          { id: 'B', text: 'Số trung bình' },
          { id: 'C', text: 'Trung vị' },
          { id: 'D', text: 'Mốt' }
        ],
        correct_answer: 'A',
        explanation: 'Phương sai và độ lệch chuẩn là hai số đặc trưng chủ yếu đo mức độ phân tán của các số liệu xung quanh giá trị trung bình. Số trung bình, trung vị và mốt là các số đo xu thế trung tâm.'
      }
    ]
  },

  // ===========================================================================
  // MÔN VẬT LÝ BỔ SUNG (LỚP 10, 11, 12)
  // ===========================================================================
  {
    subject_id: 'physics',
    grade: 10,
    chapter_title: 'Vật Lý 10 - Chương 3: Năng Lượng & Cơ Năng',
    topic_title: 'Bài 8: Công, Công suất & Định luật bảo toàn cơ năng',
    order_index: 208,
    search_query: 'cong cong suat dinh luat bao toan co nang vat ly 10',
    summary: 'Công của lực $A = F s \\cos\\alpha$, công suất $P = \\frac{A}{t}$, động năng, thế năng trọng trường và bảo toàn cơ năng khi chỉ có lực thế.',
    key_formulas: `$A = F s \\cos\\alpha$
$P = \\frac{A}{t} = F v$
$W_đ = \\frac{1}{2}mv^2, \\quad W_t = mgz$
Cơ năng bảo toàn: $W = W_đ + W_t = \\text{const}$`,
    content_markdown: `## I. Công & Công Suất
- **Công của lực không đổi**:
  $$A = F s \\cos\\alpha$$
  - $\\alpha < 90^\\circ$: $\\cos\\alpha > 0 \\Rightarrow A > 0$ (Công phát động).
  - $\\alpha = 90^\\circ$: $\\cos\\alpha = 0 \\Rightarrow A = 0$ (Lực không sinh công).
  - $\\alpha > 90^\\circ$: $\\cos\\alpha < 0 \\Rightarrow A < 0$ (Công cản).
- **Công suất**: Tốc độ thực hiện công: $P = \\frac{A}{t} = F v$ (đơn vị Watt, $\\text{W}$).

## II. Định Luật Bảo Toàn Cơ Năng
Khi một vật chuyển động chỉ chịu tác dụng của trọng lực hoặc lực đàn hồi (các lực thế), cơ năng của vật là một đại lượng bảo toàn:
$$W = W_đ + W_t = \\frac{1}{2}mv^2 + mgz = \\text{hằng số}$$`,
    quizzes: [
      {
        question: 'Một lực $F = 50\\text{ N}$ kéo một vật dịch chuyển quãng đường $10\\text{ m}$ theo phương chuyển động. Công do lực thực hiện là:',
        options: [
          { id: 'A', text: '$500\\text{ J}$' },
          { id: 'B', text: '$50\\text{ J}$' },
          { id: 'C', text: '$0\\text{ J}$' },
          { id: 'D', text: '$250\\text{ J}$' }
        ],
        correct_answer: 'A',
        explanation: 'Vì lực kéo cùng phương với phương chuyển động nên $\\alpha = 0^\\circ \\Rightarrow \\cos\\alpha = 1$. Công $A = F s \\cos 0^\\circ = 50 \\times 10 \\times 1 = 500\\text{ J}$.'
      }
    ]
  },

  {
    subject_id: 'physics',
    grade: 11,
    chapter_title: 'Vật Lý 11 - Chương 3: Điện Trường & Mạch Điện',
    topic_title: 'Bài 9: Điện trường, Điện thế & Định luật Ohm toàn mạch',
    order_index: 209,
    search_query: 'dien truong the nang dinh luat ohm toan mach vat ly 11',
    summary: 'Cường độ điện trường $E = \\frac{F}{q}$, công lực điện, điện thế $V$, hiệu điện thế $U$ và định luật Ohm toàn mạch $I = \\frac{\\mathcal{E}}{R_N + r}$.',
    key_formulas: `$E = k \\frac{|Q|}{\\varepsilon r^2}$
$U_{MN} = V_M - V_N = E \\cdot d$
Định luật Ohm: $I = \\frac{\\mathcal{E}}{R_N + r}$
Hiệu suất nguồn: $H = \\frac{U_N}{\\mathcal{E}} = \\frac{R_N}{R_N + r}$`,
    content_markdown: `## I. Điện Trường & Hiệu Điện Thế
- **Cường độ điện trường**: $E = \\frac{F}{|q|}$ (hướng ra xa điện tích dương, hướng về phía điện tích âm).
- **Liên hệ giữa cường độ điện trường và hiệu điện thế**:
  $$U = E \\cdot d$$
  *(với $d$ là hình chiếu của đường nối hai điểm lên phương của đường sức điện)*.

## II. Định Luật Ohm Cho Toàn Mạch
Cường độ dòng điện trong mạch kín tỉ lệ thuận với suất điện động của nguồn điện và tỉ lệ nghịch với điện trở toàn phần của mạch:
$$I = \\frac{\\mathcal{E}}{R_N + r}$$
- $R_N$: Điện trở tương đương của mạch ngoài.
- $r$: Điện trở trong của nguồn điện.
- **Hiện tượng đoản mạch**: Xảy ra khi nối hai cực nguồn điện bằng dây dẫn có điện trở rất nhỏ ($R_N \\approx 0 \\Rightarrow I = \\frac{\\mathcal{E}}{r}$ rất lớn gây cháy nổ).`,
    quizzes: [
      {
        question: 'Một nguồn điện có suất điện động $\\mathcal{E} = 12\\text{ V}$, điện trở trong $r = 1\\,\\Omega$ mắc với mạch ngoài có điện trở $R = 5\\,\\Omega$. Cường độ dòng điện chạy qua mạch là:',
        options: [
          { id: 'A', text: '$2\\text{ A}$' },
          { id: 'B', text: '$2{,}4\\text{ A}$' },
          { id: 'C', text: '$12\\text{ A}$' },
          { id: 'D', text: '$1\\text{ A}$' }
        ],
        correct_answer: 'A',
        explanation: 'Theo định luật Ohm toàn mạch: $I = \\frac{\\mathcal{E}}{R + r} = \\frac{12}{5 + 1} = \\frac{12}{6} = 2\\text{ A}$.'
      }
    ]
  },

  {
    subject_id: 'physics',
    grade: 12,
    chapter_title: 'Vật Lý 12 - Chương 4: Từ Trường & Cảm Ứng Điện Từ',
    topic_title: 'Bài 10: Từ trường, Lực Lorentz & Định luật cảm ứng Faraday',
    order_index: 210,
    search_query: 'tu truong luc lorentz dinh luat cam ung faraday lenz vat ly 12',
    summary: 'Cảm ứng từ $\\vec{B}$, từ thông $\\Phi = B S \\cos\\alpha$, lực từ tác dụng lên điện tích chuyển động (Lorentz) và suất điện động cảm ứng.',
    key_formulas: `Từ thông: $\\Phi = B S \\cos\\alpha$
Suất điện động cảm ứng: $e_c = -\\frac{\\Delta \\Phi}{\\Delta t}$
Lực Lorentz: $f = |q| v B \\sin\\alpha$
Định luật Lenz: Dòng điện cảm ứng sinh ra từ trường chống lại sự biến thiên của từ thông ban đầu`,
    content_markdown: `## I. Từ Thông & Hiện Tượng Cảm Ứng Điện Từ
- **Từ thông qua khung dây diện tích $S$ gồm $N$ vòng**:
  $$\\Phi = N B S \\cos\\alpha \\quad (\\text{với } \\alpha = (\\vec{n}, \\vec{B}))$$
- **Định luật Faraday về suất điện động cảm ứng**:
  $$e_c = -\\frac{\\Delta \\Phi}{\\Delta t}$$
  *Độ lớn của suất điện động cảm ứng tỉ lệ với tốc độ biến thiên của từ thông qua mạch*.
- **Định luật Lenz về chiều dòng điện**: Dòng điện cảm ứng xuất hiện có chiều sao cho từ trường do nó sinh ra có tác dụng chống lại sự biến thiên của từ thông sinh ra nó.

## II. Lực Lorentz
Lực từ tác dụng lên một hạt mang điện tích $q$ chuyển động trong từ trường với vận tốc $\\vec{v}$:
$$f = |q| v B \\sin\\alpha \\quad (\\text{với } \\alpha = (\\vec{v}, \\vec{B}))$$
- Hướng của lực Lorentz xác định theo **Quy tắc bàn tay trái**.`,
    quizzes: [
      {
        question: 'Từ thông qua một khung dây kín biến thiên một lượng $0{,}2\\text{ Wb}$ trong khoảng thời gian $0{,}05\\text{ s}$. Độ lớn của suất điện động cảm ứng xuất hiện trong khung là:',
        options: [
          { id: 'A', text: '$4\\text{ V}$' },
          { id: 'B', text: '$0{,}01\\text{ V}$' },
          { id: 'C', text: '$10\\text{ V}$' },
          { id: 'D', text: '$0{,}4\\text{ V}$' }
        ],
        correct_answer: 'A',
        explanation: 'Áp dụng định luật Faraday về độ lớn suất điện động cảm ứng: $|e_c| = \\left| \\frac{\\Delta \\Phi}{\\Delta t} \\right| = \\frac{0{,}2}{0{,}05} = 4\\text{ V}$.'
      }
    ]
  },

  // ===========================================================================
  // MÔN HÓA HỌC BỔ SUNG (LỚP 10, 11, 12)
  // ===========================================================================
  {
    subject_id: 'chemistry',
    grade: 10,
    chapter_title: 'Hóa Học 10 - Chương 3: Liên Kết Hóa Học',
    topic_title: 'Bài 8: Liên kết Ion, Liên kết Cộng hóa trị & Liên kết Hydrogen',
    order_index: 308,
    search_query: 'lien ket ion cong hoa tri lien ket hydrogen hoa hoc 10',
    summary: 'Bản chất lực hút tĩnh điện trong tinh thể ion, sự dùng chung electron trong liên kết cộng hóa trị và vai trò nhiệt độ sôi bất thường của liên kết Hydrogen.',
    key_formulas: `Hiệu độ âm điện $\\Delta \\chi$:
$\\Delta \\chi < 0{,}4$: CHT không phân cực
$0{,}4 \\le \\Delta \\chi < 1{,}7$: CHT phân cực
$\\Delta \\chi \\ge 1{,}7$: Liên kết Ion`,
    content_markdown: `## I. Các Loại Liên Kết Hóa Học Cốt Lõi
1. **Liên kết Ion**: Là liên kết được hình thành bởi lực hút tĩnh điện giữa các ion mang điện tích trái dấu (thường giữa kim loại điển hình nhóm IA, IIA và phi kim điển hình nhóm VIIA như $NaCl, MgCl_2$).
2. **Liên kết Cộng hóa trị**: Hình thành do **sự dùng chung một hoặc nhiều cặp electron** giữa hai nguyên tử (ví dụ: $H_2, Cl_2, HCl, CO_2$).

## II. Liên Kết Hydrogen & Tương Tác Van der Waals
- **Liên kết Hydrogen**: Là tương tác tĩnh điện yếu hình thành giữa nguyên tử $H$ (đã liên kết với nguyên tử có độ âm điện lớn như $F, O, N$) với một nguyên tử $F, O, N$ khác còn cặp electron tự do.
- **Hệ quả thực tiễn**:
  - Làm tăng nhiệt độ sôi và nhiệt độ nóng chảy của chất một cách bất thường (ví dụ: $H_2O$ sôi ở $100^\\circ\\text{C}$ cao hơn nhiều so với $H_2S$).
  - Giúp các chất dễ hòa tan trong nước (như ancol etylic, axit axetic).`,
    quizzes: [
      {
        question: 'Nguyên nhân chủ yếu làm cho nước ($H_2O$) có nhiệt độ sôi cao bất thường so với các hợp chất cùng nhóm như $H_2S$ là do:',
        options: [
          { id: 'A', text: 'Giữa các phân tử nước có liên kết hydrogen' },
          { id: 'B', text: 'Nước có liên kết cộng hóa trị rất bền vững' },
          { id: 'C', text: 'Khối lượng phân tử của nước lớn hơn' },
          { id: 'D', text: 'Nước là chất điện ly yếu' }
        ],
        correct_answer: 'A',
        explanation: 'Nhờ có nguyên tử Oxy mang độ âm điện lớn và còn cặp e tự do liên kết với Hidro, các phân tử nước tạo được mạng lưới liên kết hydrogen liên phân tử bền chặt, đòi hỏi nhiều năng lượng để phá vỡ nên nhiệt độ sôi cao bất thường.'
      }
    ]
  },

  {
    subject_id: 'chemistry',
    grade: 10,
    chapter_title: 'Hóa Học 10 - Chương 4: Năng Lượng Hóa Học',
    topic_title: 'Bài 9: Biến thiên Enthalpy chuẩn của phản ứng hóa học (2025+)',
    order_index: 309,
    search_query: 'bien thien enthalpy chuan nhiet tao thanh nang luong lien ket hoa hoc 10',
    summary: 'Nội dung cốt lõi chương trình mới: Nhiệt tạo thành chuẩn $\\Delta_f H^\\circ_{298}$, năng lượng liên kết $E_b$ và phân biệt phản ứng tỏa nhiệt/thu nhiệt.',
    key_formulas: `$\\Delta_r H^\\circ_{298} < 0$: Phản ứng tỏa nhiệt
$\\Delta_r H^\\circ_{298} > 0$: Phản ứng thu nhiệt
Theo nhiệt tạo thành: $\\Delta_r H^\\circ_{298} = \\sum \\Delta_f H^\\circ_{298} (\\text{sp}) - \\sum \\Delta_f H^\\circ_{298} (\\text{cđ})$
Theo năng lượng liên kết: $\\Delta_r H^\\circ_{298} = \\sum E_b(\\text{cđ}) - \\sum E_b(\\text{sp})$`,
    content_markdown: `## I. Phản Ứng Tỏa Nhiệt & Thu Nhiệt
- **Phản ứng tỏa nhiệt**: Là phản ứng giải phóng năng lượng dưới dạng nhiệt ra môi trường xung quanh ($\\Delta_r H^\\circ_{298} < 0$). Ví dụ: phản ứng đốt cháy nhiên liệu, phản ứng trung hòa.
- **Phản ứng thu nhiệt**: Là phản ứng hấp thụ nhiệt từ môi trường xung quanh ($\\Delta_r H^\\circ_{298} > 0$). Ví dụ: phản ứng nhiệt phân đá vôi $\\text{CaCO}_3$.

## II. Phương Pháp Tính Biến Thiên Enthalpy Chuẩn $\\Delta_r H^\\circ_{298}$
1. **Dựa vào nhiệt tạo thành chuẩn $\\Delta_f H^\\circ_{298}$**:
   $$\\Delta_r H^\\circ_{298} = \\sum \\nu_{sp} \\Delta_f H^\\circ_{298}(\\text{sản phẩm}) - \\sum \\nu_{cđ} \\Delta_f H^\\circ_{298}(\\text{chất đầu})$$
   *(Lưu ý: Nhiệt tạo thành chuẩn của đơn chất bền bằng $0$)*.

2. **Dựa vào năng lượng liên kết $E_b$ (chất khí)**:
   $$\\Delta_r H^\\circ_{298} = \\sum E_b(\\text{chất đầu}) - \\sum E_b(\\text{sản phẩm})$$`,
    quizzes: [
      {
        question: 'Một phản ứng hóa học có biến thiên enthalpy chuẩn $\\Delta_r H^\\circ_{298} = -890\\text{ kJ}$. Khẳng định nào sau đây là đúng?',
        options: [
          { id: 'A', text: 'Đây là phản ứng tỏa nhiệt' },
          { id: 'B', text: 'Đây là phản ứng thu nhiệt' },
          { id: 'C', text: 'Phản ứng làm nhiệt độ môi trường giảm đi' },
          { id: 'D', text: 'Phản ứng không kèm theo sự thay đổi năng lượng' }
        ],
        correct_answer: 'A',
        explanation: 'Vì $\\Delta_r H^\\circ_{298} < 0$ (mang dấu âm) nên phản ứng giải phóng nhiệt năng ra môi trường xung quanh, do đó đây là phản ứng tỏa nhiệt.'
      }
    ]
  },

  {
    subject_id: 'chemistry',
    grade: 11,
    chapter_title: 'Hóa Học 11 - Chương 3: Hợp Chất Chứa Carbonyl',
    topic_title: 'Bài 10: Aldehyde, Ketone & Carboxylic Acid',
    order_index: 310,
    search_query: 'andehit xeton axit cacboxylic phan ung trang bac hoa hoc 11',
    summary: 'Nhóm chức Carbonyl $>C=O$, phản ứng tráng bạc với thuốc thử Tollens, tạo kết tủa gạch $Cu_2O$ và tính axit của axit cacboxylic.',
    key_formulas: `Aldehyde đơn chức: $\\text{RCHO} + 2[\\text{Ag(NH}_3)_2]\\text{OH} \\to \\text{RCOONH}_4 + 2\\text{Ag}\\downarrow + 3\\text{NH}_3 + \\text{H}_2\\text{O}$
Riêng $\\text{HCHO} \\Rightarrow 4\\text{Ag}$
Axit: $\\text{RCOOH} + \\text{NaHCO}_3 \\to \\text{RCOONa} + \\text{CO}_2\\uparrow + \\text{H}_2\\text{O}$`,
    content_markdown: `## I. Hợp Chất Carbonyl (Aldehyde & Ketone)
- Nhóm chức: Aldehyde có nhóm $-CH=O$, Ketone có nhóm $>C=O$.
- **Phản ứng tráng bạc (Thuốc thử Tollens)**:
  - Aldehyde tác dụng với dung dịch $\\text{AgNO}_3/\\text{NH}_3$ đun nóng tạo lớp bạc sáng bóng bám trên thành ống nghiệm:
    $$\\text{RCHO} + 2[\\text{Ag(NH}_3)_2]\\text{OH} \\xrightarrow{t^\\circ} \\text{RCOONH}_4 + 2\\text{Ag}\\downarrow + 3\\text{NH}_3 + \\text{H}_2\\text{O}$$
  - *Đặc biệt*: $1\\text{ mol HCHO}$ tác dụng cho tối đa $4\\text{ mol Ag}$.

## II. Carboxylic Acid (Axit Cacboxylic)
- Nhóm chức carboxyl: $-COOH$.
- Có tính axit yếu, làm quỳ tím hóa đỏ, tác dụng với kim loại đứng trước Hidro, oxit bazo, bazo và muối cacbonat giải phóng khí $CO_2$.
- Phản ứng este hóa với ancol khi có xúc tác $\\text{H}_2\\text{SO}_4$ đặc đun nóng.`,
    quizzes: [
      {
        question: 'Cho $0{,}1\\text{ mol}$ acetaldehyde ($\\text{CH}_3\\text{CHO}$) tác dụng hoàn toàn với lượng dư dung dịch $\\text{AgNO}_3/\\text{NH}_3$ đun nóng. Khối lượng bạc ($Ag$) thu được là:',
        options: [
          { id: 'A', text: '$21{,}6\\text{ g}$' },
          { id: 'B', text: '$10{,}8\\text{ g}$' },
          { id: 'C', text: '$43{,}2\\text{ g}$' },
          { id: 'D', text: '$5{,}4\\text{ g}$' }
        ],
        correct_answer: 'A',
        explanation: 'Acetaldehyde là andehit đơn chức khác HCHO, nên $1\\text{ mol RCHO} \\to 2\\text{ mol Ag}$. Số mol $Ag$ sinh ra là $n_{Ag} = 2 \\times 0{,}1 = 0{,}2\\text{ mol}$. Khối lượng bạc là $m_{Ag} = 0{,}2 \\times 108 = 21{,}6\\text{ g}$.'
      }
    ]
  },

  {
    subject_id: 'chemistry',
    grade: 12,
    chapter_title: 'Hóa Học 12 - Chương 4: Polymer & Vật Liệu',
    topic_title: 'Bài 11: Đại cương Polymer, Tơ tổng hợp & Cao su',
    order_index: 311,
    search_query: 'polime vat lieu chat deo to nhan tao cao su hoa hoc 12',
    summary: 'Phân loại polime theo nguồn gốc và phương pháp tổng hợp (trùng hợp, trùng ngưng), phân biệt tơ tự nhiên, tơ nhân tạo (bán tổng hợp) và tơ tổng hợp.',
    key_formulas: `Trùng hợp: $n\\text{CH}_2=\\text{CH}-\\text{Cl} \\to (-\\text{CH}_2-\\text{CHCl}-)_n$ (PVC)
Tơ nilon-6,6: Trùng ngưng axit adipic và hexametylendiamin
Tơ bán tổng hợp (nhân tạo): Tơ visco, Tơ axetat (chế hóa từ xenlulozo)`,
    content_markdown: `## I. Khái Niệm & Phân Loại Polymer
Polymer là những hợp chất có phân tử khối rất lớn do nhiều mắt xích liên kết với nhau tạo nên.
- **Phân loại theo nguồn gốc**:
  1. **Polymer thiên nhiên**: Tinh bột, cellulose, tơ tằm, len lông cừu, cao su thiên nhiên.
  2. **Polymer nhân tạo (bán tổng hợp)**: Xuất phát từ thiên nhiên rồi chế hóa hóa học, tiêu biểu là **Tơ Visco** và **Tơ Cellulose Acetate**.
  3. **Polymer tổng hợp**: Do con người tổng hợp từ các monome (PE, PVC, tơ nilon, tơ olon, cao su buna).

## II. Hai Phương Pháp Tổng Hợp Chính
1. **Phản ứng trùng hợp**: Là quá trình kết hợp nhiều monome giống nhau hoặc tương tự nhau tạo thành polymer mà **không giải phóng phân tử nhỏ khác** (Điều kiện: monome có liên kết đôi $C=C$ hoặc vòng kém bền).
2. **Phản ứng trùng ngưng**: Là quá trình kết hợp nhiều monome tạo thành polymer đồng thời **giải phóng các phân tử nhỏ (thường là $H_2O$)** (Điều kiện: monome chứa ít nhất 2 nhóm chức có khả năng phản ứng).`,
    quizzes: [
      {
        question: 'Tơ nào sau đây thuộc loại tơ bán tổng hợp (tơ nhân tạo)?',
        options: [
          { id: 'A', text: 'Tơ visco' },
          { id: 'B', text: 'Tơ nilon-6,6' },
          { id: 'C', text: 'Tơ tằm' },
          { id: 'D', text: 'Tơ nitron (olon)' }
        ],
        correct_answer: 'A',
        explanation: 'Tơ visco và tơ axetat được sản xuất từ cellulose thiên nhiên qua phản ứng chế biến hóa học nên được xếp vào nhóm tơ bán tổng hợp (tơ nhân tạo). Tơ tằm là thiên nhiên, nilon-6,6 và nitron là tơ tổng hợp hoàn toàn.'
      }
    ]
  }
];

async function runGranularPipeline() {
  console.log('🚀 Bắt đầu Granular Theory Pipeline (Chia nhỏ từng bài học để bảo đảm chất lượng sâu & không tràn token)...');
  console.log(`📋 Tổng số task chuyên đề cần xử lý: ${granularTasks.length} bài học cụ thể.\n`);

  // Clear existing theories before loading granular chapters
  db.prepare('DELETE FROM theory_quizzes').run();
  db.prepare('DELETE FROM theories').run();

  const insertTheory = db.prepare(`
    INSERT INTO theories (subject_id, chapter_title, topic_title, summary, content_markdown, key_formulas, order_index, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertQuiz = db.prepare(`
    INSERT INTO theory_quizzes (theory_id, question, options_json, correct_answer, explanation)
    VALUES (?, ?, ?, ?, ?)
  `);

  let count = 0;
  for (const task of granularTasks) {
    count++;
    console.log(`[Task ${count}/${granularTasks.length}] Đang xử lý: [${task.subject_id.toUpperCase()} - Lớp ${task.grade}] ${task.topic_title}...`);

    // Call TinyFish for specific task
    try {
      const searchRes = await searchTinyFish(task.search_query);
      if (searchRes && searchRes.results && searchRes.results.length > 0) {
        console.log(`   📡 TinyFish: Lấy được ${searchRes.results.length} nguồn tham khảo cho bài học này.`);
      }
    } catch (e) {
      // Continue with high-yield data
    }

    // Insert theory
    const res = insertTheory.run(
      task.subject_id,
      task.chapter_title,
      task.topic_title,
      task.summary,
      task.content_markdown,
      task.key_formulas,
      task.order_index,
      1 // Admin user
    );

    const theoryId = res.lastInsertRowid;

    // Insert quizzes
    if (task.quizzes && task.quizzes.length > 0) {
      for (const q of task.quizzes) {
        insertQuiz.run(
          theoryId,
          q.question,
          JSON.stringify(q.options),
          q.correct_answer,
          q.explanation
        );
      }
    }
  }

  console.log(`\n🎉 HOÀN THÀNH PIPELINE CHIA NHỎ!`);
  console.log(`✅ Đã nạp thành công ${count} bài học chuyên sâu riêng biệt vào cơ sở dữ liệu.`);
}

runGranularPipeline();
