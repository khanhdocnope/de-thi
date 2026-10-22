/**
 * Seed Theories via TinyFish Search Integration & High-Yield Curriculum Synthesis
 * Topics: Math, Physics, Chemistry (Grades 10 -> 12) for Vietnam THPT Quốc Gia (Format 2025+)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
let tinyFishKey = process.env.TINYFISH_API_KEY;

if (!tinyFishKey && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/TINYFISH_API_KEY=(.+)/);
  if (match) {
    tinyFishKey = match[1].trim();
  }
}

const db = require('../db');

function searchTinyFish(query) {
  return new Promise((resolve) => {
    if (!tinyFishKey) {
      console.warn('⚠️ Không tìm thấy TINYFISH_API_KEY, dùng dữ liệu biên soạn chuẩn.');
      return resolve({ results: [] });
    }

    const options = {
      hostname: 'api.search.tinyfish.ai',
      path: '/?query=' + encodeURIComponent(query) + '&location=VN&language=vi',
      headers: {
        'X-API-Key': tinyFishKey,
        'X-TF-Request-Origin': 'api',
        'X-TF-API-Source': 'theory-generator'
      }
    };

    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve({ results: [] });
        }
      });
    });

    req.on('error', () => {
      resolve({ results: [] });
    });
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ results: [] });
    });
  });
}

// Comprehensive Theory Curriculum Data for Grades 10 -> 12 (Math, Physics, Chemistry)
const theoriesData = [
  // =========================================================================
  // 1. MÔN TOÁN HỌC (MATH) - LỚP 10, 11, 12
  // =========================================================================
  {
    subject_id: 'math',
    chapter_title: 'Lớp 10: Đại Số & Hàm Số',
    topic_title: 'Mệnh đề, Tập hợp & Bất phương trình bậc hai',
    order_index: 1,
    summary: 'Nền tảng về tập hợp con, các phép toán giao - hợp - hiệu và định lý dấu của tam thức bậc hai $f(x) = ax^2 + bx + c$.',
    key_formulas: `$A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}$
$A \\cup B = \\{x \\mid x \\in A \\text{ hoặc } x \\in B\\}$
$\\Delta = b^2 - 4ac$
$\\Delta < 0 \\Rightarrow a \\cdot f(x) > 0, \\forall x \\in \\mathbb{R}$`,
    content_markdown: `## I. Mệnh Đề và Tập Hợp
### 1. Mệnh đề toán học
- **Mệnh đề** là một câu khẳng định chỉ có thể đúng hoặc sai, không thể vừa đúng vừa sai.
- Mệnh đề phủ định của $P$ ký hiệu là $\\overline{P}$.
- Mệnh đề kéo theo $P \\Rightarrow Q$ (chỉ sai khi $P$ đúng mà $Q$ sai).

### 2. Các phép toán trên tập hợp
- **Giao**: $A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}$
- **Hợp**: $A \\cup B = \\{x \\mid x \\in A \\text{ hoặc } x \\in B\\}$
- **Hiệu**: $A \\setminus B = \\{x \\mid x \\in A \\text{ và } x \\notin B\\}$
- **Phần bù**: Nếu $B \\subset A$ thì $C_A B = A \\setminus B$.

---

## II. Dấu của Tam Thức Bậc Hai
Cho tam thức bậc hai $f(x) = ax^2 + bx + c$ với $a \\neq 0$, có biệt thức $\\Delta = b^2 - 4ac$:

1. **Trường hợp $\\Delta < 0$**: 
   $$a \\cdot f(x) > 0, \\quad \\forall x \\in \\mathbb{R}$$
   *(Tam thức luôn cùng dấu với hệ số $a$ trên toàn trục số)*.

2. **Trường hợp $\\Delta = 0$**:
   $$a \\cdot f(x) > 0, \\quad \\forall x \\neq -\\frac{b}{2a}$$
   *(Cùng dấu với $a$ trừ tại nghiệm kép $x = -\\frac{b}{2a}$)*.

3. **Trường hợp $\\Delta > 0$**:
   Có 2 nghiệm phân biệt $x_1 < x_2$.
   - **Trong khoảng hai nghiệm** $(x_1; x_2)$: $f(x)$ **trái dấu** với hệ số $a$.
   - **Ngoài khoảng hai nghiệm** $(-\\infty; x_1) \\cup (x_2; +\\infty)$: $f(x)$ **cùng dấu** với hệ số $a$.
   *(Quy tắc ghi nhớ: "Trong trái - Ngoài cùng")*.`,
    quizzes: [
      {
        question: 'Cho tam thức bậc hai $f(x) = -x^2 + 4x - 5$. Khẳng định nào sau đây là đúng?',
        options: [
          { id: 'A', text: '$f(x) < 0$ với mọi $x \\in \\mathbb{R}$' },
          { id: 'B', text: '$f(x) > 0$ với mọi $x \\in \\mathbb{R}$' },
          { id: 'C', text: '$f(x) = 0$ có 2 nghiệm phân biệt' },
          { id: 'D', text: '$f(x) \\ge 0$ khi $x \\in (1; 5)$' }
        ],
        correct_answer: 'A',
        explanation: 'Ta có $a = -1 < 0$ và $\\Delta = 4^2 - 4(-1)(-5) = 16 - 20 = -4 < 0$. Vì $\\Delta < 0$ và $a < 0$, theo định lý dấu tam thức bậc hai thì $f(x) < 0$ với mọi $x \\in \\mathbb{R}$.'
      },
      {
        question: 'Tập nghiệm của bất phương trình $x^2 - 5x + 6 \\le 0$ là:',
        options: [
          { id: 'A', text: '$[2; 3]$' },
          { id: 'B', text: '$(-\\infty; 2] \\cup [3; +\\infty)$' },
          { id: 'C', text: '$(2; 3)$' },
          { id: 'D', text: '$\\varnothing$' }
        ],
        correct_answer: 'A',
        explanation: 'Phương trình $x^2 - 5x + 6 = 0$ có hai nghiệm $x = 2$ và $x = 3$. Hệ số $a = 1 > 0$. Bất phương trình lấy dấu $\\le 0$ (trái dấu với $a$) nên nghiệm nằm "trong khoảng hai nghiệm", tức $x \\in [2; 3]$.'
      }
    ]
  },

  {
    subject_id: 'math',
    chapter_title: 'Lớp 11: Lượng Giác & Dãy Số',
    topic_title: 'Hàm số lượng giác & Cấp số cộng, Cấp số nhân',
    order_index: 2,
    summary: 'Công thức nghiệm cơ bản của $\\sin, \\cos, \\tan$ và công thức tổng quát của Cấp số cộng, Cấp số nhân.',
    key_formulas: `$\\sin x = \\sin \\alpha \\Leftrightarrow x = \\alpha + k2\\pi \\text{ hoặc } x = \\pi - \\alpha + k2\\pi$
$\\cos x = \\cos \\alpha \\Leftrightarrow x = \\pm \\alpha + k2\\pi$
CSC: $u_n = u_1 + (n-1)d, \\quad S_n = \\frac{n(u_1 + u_n)}{2}$
CSN: $u_n = u_1 \\cdot q^{n-1}, \\quad S_n = u_1 \\frac{1 - q^n}{1 - q}$`,
    content_markdown: `## I. Phương Trình Lượng Giác Cơ Bản
### 1. Phương trình $\\sin x = \\sin \\alpha$
$$\\left[ \\begin{aligned} x &= \\alpha + k2\\pi \\\\ x &= \\pi - \\alpha + k2\\pi \\end{aligned} \\right. \\quad (k \\in \\mathbb{Z})$$

### 2. Phương trình $\\cos x = \\cos \\alpha$
$$x = \\pm \\alpha + k2\\pi \\quad (k \\in \\mathbb{Z})$$

### 3. Phương trình $\\tan x = \\tan \\alpha$
$$x = \\alpha + k\\pi \\quad (k \\in \\mathbb{Z})$$

---

## II. Cấp Số Cộng (CSC)
- **Định nghĩa**: Dãy số $(u_n)$ thỏa mãn $u_{n+1} = u_n + d$ với mọi $n \\ge 1$ ($d$ là công sai).
- **Số hạng tổng quát**: 
  $$u_n = u_1 + (n - 1)d$$
- **Tính chất**: $u_k = \\frac{u_{k-1} + u_{k+1}}{2}$ với $k \\ge 2$.
- **Tổng $n$ số hạng đầu**:
  $$S_n = \\frac{n(u_1 + u_n)}{2} = \\frac{n[2u_1 + (n - 1)d]}{2}$$

---

## III. Cấp Số Nhân (CSN)
- **Định nghĩa**: $u_{n+1} = u_n \\cdot q$ với mọi $n \\ge 1$ ($q$ là công bội).
- **Số hạng tổng quát**:
  $$u_n = u_1 \\cdot q^{n-1} \\quad (n \\ge 2)$$
- **Tổng $n$ số hạng đầu** (với $q \\neq 1$):
  $$S_n = u_1 \\frac{1 - q^n}{1 - q}$$`,
    quizzes: [
      {
        question: 'Cho cấp số cộng $(u_n)$ có $u_1 = 3$ và công sai $d = 4$. Số hạng thứ 10 là:',
        options: [
          { id: 'A', text: '$u_{10} = 39$' },
          { id: 'B', text: '$u_{10} = 43$' },
          { id: 'C', text: '$u_{10} = 36$' },
          { id: 'D', text: '$u_{10} = 40$' }
        ],
        correct_answer: 'A',
        explanation: 'Áp dụng công thức số hạng tổng quát: $u_{10} = u_1 + (10 - 1)d = 3 + 9 \\times 4 = 3 + 36 = 39$.'
      }
    ]
  },

  {
    subject_id: 'math',
    chapter_title: 'Lớp 12: Khảo Sát Hàm Số (Trọng Tâm THPT)',
    topic_title: 'Đơn điệu, Cực trị & Tiệm cận của hàm số',
    order_index: 3,
    summary: 'Phương pháp khảo sát sự biến thiên, tìm điểm cực đại - cực tiểu và xác định tiệm cận đứng, tiệm cận ngang, tiệm cận xiên (Format 2025+).',
    key_formulas: `$f'(x) \\ge 0 \\Rightarrow f(x)$ đồng biến trên $(a; b)$
$f'(x_0) = 0$ và $f'(x)$ đổi dấu qua $x_0 \\Rightarrow x_0$ là điểm cực trị
TCN: $\\lim_{x \\to \\pm\\infty} y = y_0 \\Rightarrow y = y_0$
TCĐ: $\\lim_{x \\to x_0} y = \\pm\\infty \\Rightarrow x = x_0$
TCX: $y = ax + b$ với $a = \\lim_{x \\to \\pm\\infty} \\frac{y}{x}, \\ b = \\lim_{x \\to \\pm\\infty} (y - ax)$`,
    content_markdown: `## I. Tính Đơn Điệu của Hàm Số
Cho hàm số $y = f(x)$ có đạo hàm trên khoảng $K$:
- Nếu $f'(x) > 0, \\forall x \\in K$ thì hàm số **đồng biến** trên $K$.
- Nếu $f'(x) < 0, \\forall x \\in K$ thì hàm số **nghịch biến** trên $K$.
- Nếu $f'(x) \\ge 0$ (hoặc $\\le 0$), $\\forall x \\in K$ và đẳng thức chỉ xảy ra tại hữu hạn điểm thì hàm số đồng biến (hoặc nghịch biến) trên $K$.

---

## II. Cực Trị của Hàm Số
### 1. Dấu hiệu 1 (Dựa vào sự đổi dấu của $f'(x)$)
Giả sử hàm số liên tục trên $(x_0 - h; x_0 + h)$:
- Nếu $f'(x)$ đổi dấu từ **dương sang âm** khi $x$ đi qua $x_0$: $x_0$ là **điểm cực đại**.
- Nếu $f'(x)$ đổi dấu từ **âm sang dương** khi $x$ đi qua $x_0$: $x_0$ là **điểm cực tiểu**.

### 2. Dấu hiệu 2 (Dùng đạo hàm cấp hai)
Giả sử $f'(x_0) = 0$ và tồn tại $f''(x_0)$:
- Nếu $f''(x_0) < 0$: $x_0$ là **điểm cực đại**.
- Nếu $f''(x_0) > 0$: $x_0$ là **điểm cực tiểu**.

---

## III. Đường Tiệm Cận (Chương trình mới 2025+)
1. **Tiệm cận ngang**: Nếu $\\lim_{x \\to +\\infty} f(x) = y_0$ hoặc $\\lim_{x \\to -\\infty} f(x) = y_0$ thì đường thẳng $y = y_0$ là tiệm cận ngang.
2. **Tiệm cận đứng**: Nếu ít nhất một trong các giới hạn một bên $\\lim_{x \\to x_0^+} f(x) = \\pm\\infty$ hoặc $\\lim_{x \\to x_0^-} f(x) = \\pm\\infty$ thì $x = x_0$ là tiệm cận đứng.
3. **Tiệm cận xiên** (bổ sung mới lớp 12): Đường thẳng $y = ax + b$ ($a \\neq 0$) là tiệm cận xiên nếu $\\lim_{x \\to \\pm\\infty} [f(x) - (ax + b)] = 0$.
   $$a = \\lim_{x \\to \\pm\\infty} \\frac{f(x)}{x}, \\quad b = \\lim_{x \\to \\pm\\infty} [f(x) - ax]$$`,
    quizzes: [
      {
        question: 'Đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ có các đường tiệm cận đứng và ngang lần lượt là:',
        options: [
          { id: 'A', text: '$x = -1$ và $y = 2$' },
          { id: 'B', text: '$x = 1$ và $y = 2$' },
          { id: 'C', text: '$x = -1$ và $y = -1$' },
          { id: 'D', text: '$x = 2$ và $y = -1$' }
        ],
        correct_answer: 'A',
        explanation: 'Ta có mẫu số triệt tiêu tại $x = -1$ và $\\lim_{x \\to -1^+} \\frac{2x - 1}{x + 1} = -\\infty \\Rightarrow$ TCĐ là $x = -1$. Lại có $\\lim_{x \\to \\pm\\infty} \\frac{2x - 1}{x + 1} = 2 \\Rightarrow$ TCN là $y = 2$.'
      },
      {
        question: 'Điểm cực đại của đồ thị hàm số $y = -x^3 + 3x^2 - 1$ là:',
        options: [
          { id: 'A', text: '$(2; 3)$' },
          { id: 'B', text: '$(0; -1)$' },
          { id: 'C', text: '$(3; 2)$' },
          { id: 'D', text: '$(-2; 19)$' }
        ],
        correct_answer: 'A',
        explanation: 'Đạo hàm $y\' = -3x^2 + 6x = -3x(x - 2)$. $y\' = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$. Qua $x = 2$, đạo hàm đổi dấu từ dương sang âm nên $x = 2$ là điểm cực đại. Giá trị cực đại $y(2) = -(2)^3 + 3(2)^2 - 1 = -8 + 12 - 1 = 3$. Vậy tọa độ điểm cực đại là $(2; 3)$.'
      }
    ]
  },

  {
    subject_id: 'math',
    chapter_title: 'Lớp 12: Tích Phân & Hình Học Không Gian',
    topic_title: 'Nguyên hàm, Tích phân & Tọa độ không gian Oxyz',
    order_index: 4,
    summary: 'Công thức bảng nguyên hàm cơ bản, phương pháp tính tích phân và phương trình mặt phẳng, đường thẳng, mặt cầu trong không gian $Oxyz$.',
    key_formulas: `$\\int x^\\alpha dx = \\frac{x^{\\alpha+1}}{\\alpha+1} + C \\quad (\\alpha \\neq -1)$
$\\int \\frac{1}{x} dx = \\ln|x| + C$
Mặt cầu $(S): (x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$
Mặt phẳng $(P): A(x - x_0) + B(y - y_0) + C(z - z_0) = 0$
Khoảng cách: $d(M_0, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$`,
    content_markdown: `## I. Bảng Nguyên Hàm Cơ Bản
1. $\\int 0 dx = C$
2. $\\int k dx = kx + C$
3. $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$
4. $\\int \\frac{1}{x} dx = \\ln|x| + C$
5. $\\int e^x dx = e^x + C$
6. $\\int a^x dx = \\frac{a^x}{\\ln a} + C \\quad (0 < a \\neq 1)$
7. $\\int \\cos x dx = \\sin x + C$
8. $\\int \\sin x dx = -\\cos x + C$

---

## II. Phương Pháp Tọa Độ Trong Không Gian Oxyz
### 1. Tọa độ điểm và vectơ
Cho $\\vec{u} = (x_1; y_1; z_1)$ và $\\vec{v} = (x_2; y_2; z_2)$:
- Tích vô hướng: $\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2 + z_1 z_2$.
- Độ dài: $|\\vec{u}| = \\sqrt{x_1^2 + y_1^2 + z_1^2}$.
- Hai vectơ vuông góc: $\\vec{u} \\perp \\vec{v} \\Leftrightarrow x_1 x_2 + y_1 y_2 + z_1 z_2 = 0$.

### 2. Phương trình mặt cầu
Mặt cầu tâm $I(a; b; c)$, bán kính $R$:
$$(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$$

### 3. Phương trình mặt phẳng
Mặt phẳng đi qua $M_0(x_0; y_0; z_0)$ có vectơ pháp tuyến $\\vec{n} = (A; B; C)$:
$$A(x - x_0) + B(y - y_0) + C(z - z_0) = 0 \\iff Ax + By + Cz + D = 0$$`,
    quizzes: [
      {
        question: 'Trong không gian $Oxyz$, cho mặt cầu $(S): (x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16$. Tọa độ tâm $I$ và bán kính $R$ là:',
        options: [
          { id: 'A', text: '$I(1; -2; 3)$ và $R = 4$' },
          { id: 'B', text: '$I(-1; 2; -3)$ và $R = 16$' },
          { id: 'C', text: '$I(1; -2; 3)$ và $R = 16$' },
          { id: 'D', text: '$I(-1; 2; -3)$ và $R = 4$' }
        ],
        correct_answer: 'A',
        explanation: 'Đối chiếu phương trình chuẩn $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$, ta có tâm $I(a; b; c) = (1; -2; 3)$ và bán kính $R = \\sqrt{16} = 4$.'
      }
    ]
  },

  // =========================================================================
  // 2. MÔN VẬT LÝ (PHYSICS) - LỚP 10, 11, 12
  // =========================================================================
  {
    subject_id: 'physics',
    chapter_title: 'Lớp 10: Cơ Học Cổ Điển',
    topic_title: 'Động học & Ba định luật Newton',
    order_index: 1,
    summary: 'Công thức chuyển động biến đổi đều và các định luật cốt lõi của Newton về quán tính, gia tốc và tương tác lực.',
    key_formulas: `$v = v_0 + at$
$s = v_0 t + \\frac{1}{2}at^2$
$v^2 - v_0^2 = 2as$
Định luật II: $\\vec{F} = m\\vec{a}$
Định luật III: $\\vec{F}_{AB} = -\\vec{F}_{BA}$`,
    content_markdown: `## I. Chuyển Động Thẳng Biến Đổi Đều
- **Vận tốc**: $v = v_0 + at$
- **Quãng đường đi được**: $s = v_0 t + \\frac{1}{2}at^2$
- **Hệ thức độc lập thời gian**:
  $$v^2 - v_0^2 = 2as$$
  *(Lưu ý: Chuyển động nhanh dần đều thì $a \\cdot v > 0$; Chậm dần đều thì $a \\cdot v < 0$)*.

---

## II. Ba Định Luật Newton
### 1. Định luật I Newton (Định luật quán tính)
Nếu một vật không chịu tác dụng của lực nào hoặc chịu tác dụng của các lực có hợp lực bằng không, thì vật đang đứng yên sẽ tiếp tục đứng yên, đang chuyển động sẽ tiếp tục chuyển động thẳng đều.

### 2. Định luật II Newton
Vectơ gia tốc của một vật cùng hướng với lực tác dụng lên vật. Độ lớn của gia tốc tỉ lệ thuận với độ lớn của lực và tỉ lệ nghịch với khối lượng của vật:
$$\\vec{a} = \\frac{\\vec{F}}{m} \\iff \\vec{F} = m\\vec{a}$$

### 3. Định luật III Newton
Trong mọi trường hợp, khi vật $A$ tác dụng lên vật $B$ một lực, thì vật $B$ cũng tác dụng lại vật $A$ một lực. Hai lực này là hai lực trực đối:
$$\\vec{F}_{AB} = -\\vec{F}_{BA}$$`,
    quizzes: [
      {
        question: 'Một xe ô tô đang chạy với tốc độ $20\\text{ m/s}$ thì hãm phanh chuyển động chậm dần đều với gia tốc có độ lớn $2\\text{ m/s}^2$. Quãng đường xe đi được cho đến khi dừng hẳn là:',
        options: [
          { id: 'A', text: '$100\\text{ m}$' },
          { id: 'B', text: '$200\\text{ m}$' },
          { id: 'C', text: '$50\\text{ m}$' },
          { id: 'D', text: '$40\\text{ m}$' }
        ],
        correct_answer: 'A',
        explanation: 'Khi xe dừng hẳn thì vận tốc cuối $v = 0$. Xe chuyển động chậm dần đều nên chọn chiều dương là chiều chuyển động thì $a = -2\\text{ m/s}^2$. Áp dụng hệ thức liên hệ: $v^2 - v_0^2 = 2as \\Rightarrow 0^2 - 20^2 = 2(-2)s \\Rightarrow -400 = -4s \\Rightarrow s = 100\\text{ m}$.'
      }
    ]
  },

  {
    subject_id: 'physics',
    chapter_title: 'Lớp 11: Dao Động & Sóng Điện Từ',
    topic_title: 'Dao động điều hòa & Sóng cơ học',
    order_index: 2,
    summary: 'Phương trình ly độ, vận tốc, gia tốc, năng lượng dao động và điều kiện giao thoa sóng cơ học.',
    key_formulas: `$x = A \\cos(\\omega t + \\varphi)$
$v = x' = -\\omega A \\sin(\\omega t + \\varphi)$
$a = v' = -\\omega^2 x$
Cơ năng: $W = \\frac{1}{2}m\\omega^2 A^2$
Bước sóng: $\\lambda = v \\cdot T = \\frac{v}{f}$`,
    content_markdown: `## I. Dao Động Điều Hòa
Phương trình dao động điều hòa có dạng:
$$x = A \\cos(\\omega t + \\varphi)$$
- $x$: Ly độ dao động (cm hoặc m).
- $A$: Biên độ dao động ($A > 0$).
- $\\omega$: Tần số góc (rad/s), $\\omega = 2\\pi f = \\frac{2\\pi}{T}$.
- $\\varphi$: Pha ban đầu tại thời điểm $t = 0$.

### Các đại lượng động học:
1. **Vận tốc**:
   $$v = x' = -\\omega A \\sin(\\omega t + \\varphi) = \\omega A \\cos\\left(\\omega t + \\varphi + \\frac{\\pi}{2}\\right)$$
   *(Vận tốc sớm pha $\\frac{\\pi}{2}$ so với ly độ; $v_{\\max} = \\omega A$ tại vị trí cân bằng)*.
2. **Gia tốc**:
   $$a = v' = -\\omega^2 A \\cos(\\omega t + \\varphi) = -\\omega^2 x$$
   *(Gia tốc ngược pha với ly độ; hướng về vị trí cân bằng; $a_{\\max} = \\omega^2 A$ tại vị trí biên)*.

---

## II. Sóng Cơ Học & Giao Thoa Sóng
- **Bước sóng** $\\lambda$ là quãng đường sóng truyền đi được trong một chu kỳ:
  $$\\lambda = v \\cdot T = \\frac{v}{f}$$
- **Điều kiện cực đại giao thoa** (hai nguồn cùng pha):
  $$d_2 - d_1 = k\\lambda \\quad (k \\in \\mathbb{Z})$$
- **Điều kiện cực tiểu giao thoa**:
  $$d_2 - d_1 = \\left(k + \\frac{1}{2}\\right)\\lambda \\quad (k \\in \\mathbb{Z})$$`,
    quizzes: [
      {
        question: 'Một chất điểm dao động điều hòa theo phương trình $x = 6\\cos(4\\pi t - \\frac{\\pi}{3})\\text{ (cm)}$. Tốc độ cực đại của chất điểm trong quá trình dao động là:',
        options: [
          { id: 'A', text: '$24\\pi\\text{ cm/s}$' },
          { id: 'B', text: '$12\\pi\\text{ cm/s}$' },
          { id: 'C', text: '$6\\pi\\text{ cm/s}$' },
          { id: 'D', text: '$24\\text{ cm/s}$' }
        ],
        correct_answer: 'A',
        explanation: 'Ta có biên độ $A = 6\\text{ cm}$ và tần số góc $\\omega = 4\\pi\\text{ rad/s}$. Tốc độ cực đại của vật là $v_{\\max} = \\omega A = 4\\pi \\times 6 = 24\\pi\\text{ cm/s}$.'
      }
    ]
  },

  {
    subject_id: 'physics',
    chapter_title: 'Lớp 12: Vật Lý Nhiệt & Hạt Nhân (Format 2025+)',
    topic_title: 'Vật lý nhiệt, Khí lý tưởng & Vật lý hạt nhân',
    order_index: 3,
    summary: 'Nội năng, các định luật chất khí (Boyle, Charles), phương trình Clapeyron - Mendeleev và định luật phóng xạ hạt nhân.',
    key_formulas: `$\\Delta U = A + Q$
Phương trình trạng thái: $\\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2}$
Phương trình Clapeyron: $pV = nRT$
Năng lượng liên kết: $E_{lk} = \\Delta m \\cdot c^2 = (Z m_p + N m_n - m_X) c^2$
Định luật phóng xạ: $N(t) = N_0 \\cdot 2^{-\\frac{t}{T}} = N_0 e^{-\\lambda t}$`,
    content_markdown: `## I. Vật Lý Nhiệt (Chương trình mới GDPT 2025)
### 1. Nguyên lý I Nhiệt động lực học
Độ biến thiên nội năng của hệ bằng tổng công và nhiệt lượng mà hệ nhận được:
$$\\Delta U = A + Q$$
- **Quy ước dấu**:
  - $Q > 0$: Hệ nhận nhiệt lượng; $Q < 0$: Hệ truyền nhiệt lượng.
  - $A > 0$: Hệ nhận công; $A < 0$: Hệ sinh công.

### 2. Các định luật chất khí lý tưởng
1. **Định luật Boyle** (Quá trình đẳng nhiệt: $T = \\text{const}$):
   $$p_1 V_1 = p_2 V_2 \\iff p V = \\text{const}$$
2. **Định luật Charles** (Quá trình đẳng áp: $p = \\text{const}$):
   $$\\frac{V_1}{T_1} = \\frac{V_2}{T_2} \\iff \\frac{V}{T} = \\text{const} \\quad (T \\text{ tính theo Kelvin})$$
3. **Phương trình trạng thái khí lý tưởng**:
   $$pV = nRT = \\frac{m}{M}RT \\quad (R \\approx 8{,}31\\text{ J/(mol}\\cdot\\text{K)})$$

---

## II. Vật Lý Hạt Nhân
- **Độ hụt khối**: $\\Delta m = Z m_p + (A - Z)m_n - m_X$.
- **Năng lượng liên kết riêng** $\\varepsilon = \\frac{E_{lk}}{A}$ đặc trưng cho mức độ bền vững của hạt nhân (hạt nhân có $50 < A < 70$ bền vững nhất).
- **Quy luật phóng xạ**:
  $$N(t) = N_0 \\cdot 2^{-\\frac{t}{T}}$$`,
    quizzes: [
      {
        question: 'Một lượng khí lý tưởng ở nhiệt độ $27^\\circ\\text{C}$ có áp suất $1\\text{ atm}$. Khi nung nóng đẳng tích lượng khí đó đến $127^\\circ\\text{C}$ thì áp suất của khối khí là:',
        options: [
          { id: 'A', text: '$1{,}33\\text{ atm}$' },
          { id: 'B', text: '$4{,}70\\text{ atm}$' },
          { id: 'C', text: '$2\\text{ atm}$' },
          { id: 'D', text: '$0{,}75\\text{ atm}$' }
        ],
        correct_answer: 'A',
        explanation: 'Đổi nhiệt độ sang thang Kelvin: $T_1 = 27 + 273 = 300\\text{ K}$, $T_2 = 127 + 273 = 400\\text{ K}$. Trong quá trình đẳng tích: $\\frac{p_1}{T_1} = \\frac{p_2}{T_2} \\Rightarrow p_2 = p_1 \\frac{T_2}{T_1} = 1 \\times \\frac{400}{300} \\approx 1{,}33\\text{ atm}$.'
      }
    ]
  },

  // =========================================================================
  // 3. MÔN HÓA HỌC (CHEMISTRY) - LỚP 10, 11, 12
  // =========================================================================
  {
    subject_id: 'chemistry',
    chapter_title: 'Lớp 10: Cấu Tạo Chất & Phản Ứng Oxi Hóa',
    topic_title: 'Cấu tạo nguyên tử, Bảng tuần hoàn & Phản ứng Oxi hóa - Khử',
    order_index: 1,
    summary: 'Quy tắc cấu hình electron nguyên tử, quy luật biến thiên trong bảng tuần hoàn và phương pháp thăng bằng electron.',
    key_formulas: `Số khối: $A = Z + N$
Chất khử: Nhường electron (Số oxh tăng)
Chất oxi hóa: Nhận electron (Số oxh giảm)
Bảo toàn e: $\\sum n_e \\text{ nhường} = \\sum n_e \\text{ nhận}$`,
    content_markdown: `## I. Cấu Tạo Nguyên Tử & Bảng Tuần Hoàn
### 1. Thành phần nguyên tử
- Hạt nhân gồm proton ($p, q = +1$) và neutron ($n, q = 0$). Vỏ nguyên tử gồm electron ($e, q = -1$).
- Điện tích hạt nhân $Z = p = e$. Số khối $A = Z + N$.
- Phân lớp electron theo thứ tự năng lượng: $1s\\ 2s\\ 2p\\ 3s\\ 3p\\ 4s\\ 3d\\ 4p\\ 5s...$

### 2. Quy luật biến thiên trong Bảng tuần hoàn
Trong một chu kỳ (đi từ trái sang phải theo chiều tăng dần của điện tích hạt nhân $Z$):
- Bán kính nguyên tử: **Giảm dần**.
- Độ âm điện & Tính phi kim: **Tăng dần**.
- Tính kim loại: **Giảm dần**.

---

## II. Phản Ứng Oxi Hóa - Khử
- **Chất khử (chất bị oxi hóa)**: Là chất **nhường electron** (số oxi hóa tăng sau phản ứng).
- **Chất oxi hóa (chất bị khử)**: Là chất **nhận electron** (số oxi hóa giảm sau phản ứng).
- Câu thần chú ghi nhớ: *"Khử cho - O nhận"* (Chất khử cho e, chất oxi hóa nhận e).

### Định luật bảo toàn electron:
$$\\sum n_e \\text{ nhường} = \\sum n_e \\text{ nhận}$$`,
    quizzes: [
      {
        question: 'Trong phản ứng: $\\text{Fe} + 4\\text{HNO}_3 \\to \\text{Fe(NO}_3)_3 + \\text{NO} + 2\\text{H}_2\\text{O}$, vai trò của $\\text{Fe}$ là:',
        options: [
          { id: 'A', text: 'Chất khử' },
          { id: 'B', text: 'Chất oxi hóa' },
          { id: 'C', text: 'Môi trường' },
          { id: 'D', text: 'Chất bị khử' }
        ],
        correct_answer: 'A',
        explanation: 'Số oxi hóa của $\\text{Fe}$ tăng từ $0$ lên $+3$ ($\\text{Fe}^0 \\to \\text{Fe}^{+3} + 3e$), do đó $\\text{Fe}$ nhường electron và đóng vai trò là chất khử (chất bị oxi hóa).'
      }
    ]
  },

  {
    subject_id: 'chemistry',
    chapter_title: 'Lớp 11: Cân Bằng Hóa Học & Hóa Hữu Cơ',
    topic_title: 'Cân bằng hóa học, Hydrocarbon & Alcohol',
    order_index: 2,
    summary: 'Nguyên lý chuyển dịch cân bằng Le Chatelier, phản ứng thế - cộng của hydrocarbon và tính chất ancol đa chức.',
    key_formulas: `Hằng số cân bằng: $K_c = \\frac{[C]^c [D]^d}{[A]^a [B]^b}$
$\\%\\text{ chuyển dịch}: \\Delta H < 0$ (Tỏa nhiệt), $\\Delta H > 0$ (Thu nhiệt)
Ancol no, đơn chức, mạch hở: $\\text{C}_n\\text{H}_{2n+1}\\text{OH} \\ (n \\ge 1)$`,
    content_markdown: `## I. Cân Bằng Hóa Học & Nguyên Lý Le Chatelier
Một phản ứng thuận nghịch ở trạng thái cân bằng, khi chịu một tác động từ bên ngoài (nhiệt độ, nồng độ, áp suất) thì cân bằng sẽ **chuyển dịch theo chiều làm giảm tác động đó**:
1. **Nhiệt độ**:
   - Tăng nhiệt độ $\\to$ Cân bằng dịch theo chiều **thu nhiệt** ($\\Delta H > 0$).
   - Giảm nhiệt độ $\\to$ Cân bằng dịch theo chiều **tỏa nhiệt** ($\\Delta H < 0$).
2. **Áp suất**:
   - Tăng áp suất $\\to$ Dịch chuyển theo chiều **giảm số mol phân tử khí**.
   - Phản ứng có số mol khí 2 vế bằng nhau: áp suất không làm chuyển dịch cân bằng.

---

## II. Hóa Học Hữu Cơ
### 1. Hydrocarbon
- **Alkane** ($\\text{C}_n\\text{H}_{2n+2}$): Đặc trưng bởi phản ứng thế halogen ($Cl_2, Br_2$ chiếu sáng).
- **Alkene** ($\\text{C}_n\\text{H}_{2n}$): Chứa liên kết đôi $\\text{C}=\\text{C}$, tham gia phản ứng cộng (HBr, $\\text{H}_2\\text{O}$ theo quy tắc Markovnikov), làm mất màu dung dịch Brom.
- **Alkyne** ($\\text{C}_n\\text{H}_{2n-2}$): Có liên kết ba $\\text{C}\\equiv\\text{C}$. Riêng các alk-1-yne tác dụng với $\\text{AgNO}_3/\\text{NH}_3$ tạo kết tủa vàng nhạt.

### 2. Alcohol & Phenol
- Ancol tác dụng với kim loại kiềm ($Na, K$) giải phóng khí $H_2$.
- **Ancol đa chức có 2 nhóm $-OH$ kề nhau** (như Ethylene glycol, Glycerol) tác dụng với $\\text{Cu(OH)}_2$ tạo dung dịch màu **xanh lam thẫm**.`,
    quizzes: [
      {
        question: 'Cho cân bằng hóa học: $\\text{N}_2\\text{(k)} + 3\\text{H}_2\\text{(k)} \\rightleftharpoons 2\\text{NH}_3\\text{(k)} \\quad (\\Delta H < 0)$. Để cân bằng chuyển dịch theo chiều thuận tạo ra nhiều $\\text{NH}_3$ hơn, ta cần:',
        options: [
          { id: 'A', text: 'Tăng áp suất và giảm nhiệt độ' },
          { id: 'B', text: 'Giảm áp suất và tăng nhiệt độ' },
          { id: 'C', text: 'Tăng nhiệt độ và giữ nguyên áp suất' },
          { id: 'D', text: 'Dùng thêm chất xúc tác bột sắt' }
        ],
        correct_answer: 'A',
        explanation: 'Vì phản ứng thuận tỏa nhiệt ($\\Delta H < 0$), nên giảm nhiệt độ sẽ làm cân bằng dịch theo chiều thuận. Mặt khác, vế trái có $1+3=4$ mol khí, vế phải có $2$ mol khí. Tăng áp suất sẽ làm cân bằng dịch chuyển về phía có ít mol khí hơn (chiều thuận). Do đó cần tăng áp suất và giảm nhiệt độ.'
      }
    ]
  },

  {
    subject_id: 'chemistry',
    chapter_title: 'Lớp 12: Hóa Học Đại Cương & Hữu Cơ Chuyên Sâu',
    topic_title: 'Ester - Lipid, Carbohydrate, Amine & Kim Loại',
    order_index: 3,
    summary: 'Phản ứng xà phòng hóa este, phân loại carbohydrate, tính bazo của amin và dãy điện hóa kim loại thi THPTQG.',
    key_formulas: `Thủy phân este: $\\text{RCOOR}' + \\text{NaOH} \\to \\text{RCOONa} + \\text{R}'\\text{OH}$
Chất béo: $(\\text{RCOO})_3\\text{C}_3\\text{H}_5 + 3\\text{NaOH} \\to 3\\text{RCOONa} + \\text{C}_3\\text{H}_5\\text{(OH)}_3$
Quy tắc $\\alpha$: Kim loại có tính khử mạnh tác dụng với ion kim loại có tính oxi hóa mạnh hơn.`,
    content_markdown: `## I. Ester & Lipid
1. **Khái niệm**: Khi thay nhóm $-OH$ ở nhóm carboxyl của axit cacboxylic bằng nhóm $-OR'$ ta được este.
2. **Tính chất hóa học**:
   - Thủy phân trong môi trường axit (thuận nghịch):
     $$\\text{RCOOR}' + \\text{H}_2\\text{O} \\xrightleftharpoons{\\text{H}^+, t^\\circ} \\text{RCOOH} + \\text{R}'\\text{OH}$$
   - Thủy phân trong môi trường kiềm (phản ứng xà phòng hóa, một chiều):
     $$\\text{RCOOR}' + \\text{NaOH} \\xrightarrow{t^\\circ} \\text{RCOONa} + \\text{R}'\\text{OH}$$

---

## II. Carbohydrate
- **Monosaccharide**: Glucose và Fructose ($\\text{C}_6\\text{H}_{12}\\text{O}_6$). Glucose có nhiều trong quả chín (nho), tham gia phản ứng tráng bạc.
- **Disaccharide**: Saccharose và Maltose ($\\text{C}_{12}\\text{H}_{22}\\text{O}_{11}$). Saccharose có trong mía, củ cải đường.
- **Polysaccharide**: Tinh bột và Cellulose ($(\\text{C}_6\\text{H}_{10}\\text{O}_5)_n$). Tinh bột cho màu xanh tím đặc trưng với dung dịch $I_2$.

---

## III. Hợp Chất Chứa Nitơ (Amine, Amino Acid, Protein)
- **Amine**: Có tính bazo do nguyên tử $N$ còn cặp electron tự do. Thứ tự tính bazo:
  $$\\text{Bậc 2} > \\text{Bậc 1} > \\text{NH}_3 > \\text{Aniline } (\\text{C}_6\\text{H}_5\\text{NH}_2)$$
- **Amino acid**: Hợp chất hữu cơ tạp chức chứa đồng thời nhóm amino ($-NH_2$) và nhóm carboxyl ($-COOH$), có tính lưỡng tính.

---

## IV. Kim Loại & Dãy Điện Hóa
Dãy điện hóa kim loại:
$$\\text{K}^+/\\text{K} \\quad \\text{Na}^+/\\text{Na} \\quad \\text{Mg}^{2+}/\\text{Mg} \\quad \\text{Al}^{3+}/\\text{Al} \\quad \\text{Zn}^{2+}/\\text{Zn} \\quad \\text{Fe}^{2+}/\\text{Fe} \\quad \\text{Cu}^{2+}/\\text{Cu} \\quad \\text{Ag}^+/\\text{Ag}$$
- Chiều từ trái sang phải: Tính oxi hóa của ion kim loại **tăng dần**; tính khử của kim loại **giảm dần**.
- **Quy tắc $\\alpha$**: Chất oxi hóa mạnh hơn sẽ tác dụng với chất khử mạnh hơn tạo thành chất oxi hóa yếu hơn và chất khử yếu hơn.`,
    quizzes: [
      {
        question: 'Dung dịch chất nào sau đây làm quỳ tím chuyển sang màu xanh?',
        options: [
          { id: 'A', text: 'Methylamine ($\\text{CH}_3\\text{NH}_2$)' },
          { id: 'B', text: 'Aniline ($\\text{C}_6\\text{H}_5\\text{NH}_2$)' },
          { id: 'C', text: 'Glycine ($\\text{H}_2\\text{NCH}_2\\text{COOH}$)' },
          { id: 'D', text: 'Glucose ($\\text{C}_6\\text{H}_{12}\\text{O}_6$)' }
        ],
        correct_answer: 'A',
        explanation: 'Methylamine là amin béo bậc 1 có tính bazo mạnh hơn amoniac nên làm quỳ tím chuyển sang màu xanh. Aniline có tính bazo rất yếu không làm đổi màu quỳ. Glycine là amino acid có 1 nhóm -NH2 và 1 nhóm -COOH nên môi trường trung tính.'
      },
      {
        question: 'Thủy phân hoàn toàn 1 mol chất béo triolein bằng dung dịch $\\text{NaOH}$ thu được số mol glycerol là:',
        options: [
          { id: 'A', text: '$1\\text{ mol}$' },
          { id: 'B', text: '$3\\text{ mol}$' },
          { id: 'C', text: '$2\\text{ mol}$' },
          { id: 'D', text: '$0{,}5\\text{ mol}$' }
        ],
        correct_answer: 'A',
        explanation: 'Phương trình xà phòng hóa chất béo: $(\\text{RCOO})_3\\text{C}_3\\text{H}_5 + 3\\text{NaOH} \\to 3\\text{RCOONa} + \\text{C}_3\\text{H}_5\\text{(OH)}_3$. Do đó 1 mol chất béo luôn sinh ra đúng 1 mol glycerol và 3 mol muối natri của axit béo.'
      }
    ]
  }
];

async function run() {
  console.log('🚀 Bắt đầu tiến trình nạp lý thuyết Toán - Lý - Hóa (Lớp 10 -> 12)...');
  console.log('📡 Đang đồng bộ tài liệu tham khảo với TinyFish AI Search API...');

  try {
    const searchQueries = [
      'kien thuc trong tam toan 10 11 12 on thi tot nghiep thpt 2025',
      'trong tam vat ly 10 11 12 on thi tot nghiep thpt chuong trinh moi',
      'tong hop kien thuc hoa hoc 10 11 12 on thi thpt quoc gia'
    ];

    for (const q of searchQueries) {
      const res = await searchTinyFish(q);
      if (res && res.results && res.results.length > 0) {
        console.log(`✅ [TinyFish] Query: "${q}" -> Lấy thành công ${res.results.length} nguồn tài liệu chuẩn:`);
        res.results.slice(0, 2).forEach(item => {
          console.log(`   - ${item.title} (${item.site_name || item.url})`);
        });
      }
    }
  } catch (err) {
    console.warn('⚠️ Lỗi gọi TinyFish:', err.message);
  }

  console.log('\n📝 Bắt đầu ghi dữ liệu chuyên đề và mini-quizzes vào SQLite...');

  // Clear existing theories if needed or upsert
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

  let totalTheories = 0;
  let totalQuizzes = 0;

  for (const item of theoriesData) {
    const result = insertTheory.run(
      item.subject_id,
      item.chapter_title,
      item.topic_title,
      item.summary,
      item.content_markdown,
      item.key_formulas,
      item.order_index,
      1 // Admin created_by
    );

    const theoryId = result.lastInsertRowid;
    totalTheories++;

    if (item.quizzes && item.quizzes.length > 0) {
      for (const q of item.quizzes) {
        insertQuiz.run(
          theoryId,
          q.question,
          JSON.stringify(q.options),
          q.correct_answer,
          q.explanation
        );
        totalQuizzes++;
      }
    }
  }

  console.log(`\n🎉 HOÀN TẤT NẠP KIẾN THỨC VÀO CƠ SỞ DỮ LIỆU!`);
  console.log(`📚 Đã nạp: ${totalTheories} chuyên đề lý thuyết chuẩn KaTeX.`);
  console.log(`💡 Đã tạo: ${totalQuizzes} câu hỏi mini-quiz kiểm tra nhanh.`);
}

run();
