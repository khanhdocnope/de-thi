const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
let pdfParse = null;
try {
  const p = require('pdf-parse');
  pdfParse = typeof p === 'function' ? p : (p && typeof p.default === 'function' ? p.default : null);
} catch (e) {
  pdfParse = null;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB
});

// Helper to safely parse JSON containing LaTeX mathematical backslashes (\frac, \alpha, etc.)
function safeParseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (initialErr) {
    // In JSON, valid escape sequences are only: \" \\ \/ \b \f \n \r \t \uXXXX
    // LaTeX formulas produced by AI often contain unescaped \frac, \sqrt, \alpha, \in, \pm, etc.
    // Replace unescaped backslashes with double backslashes
    const fixed = jsonString.replace(/\\([^"\\\/bfnrtu]|u(?![\da-fA-F]{4}))/g, '\\\\$1');
    try {
      return JSON.parse(fixed);
    } catch (secondErr) {
      // Fix trailing commas if any
      const fixed2 = fixed.replace(/,\s*([\]}])/g, '$1');
      return JSON.parse(fixed2);
    }
  }
}

// Helper to normalize Gemini model name
function resolveModelName(rawName) {
  if (!rawName) return 'gemini-3.5-flash-lite';
  const clean = rawName.trim().toLowerCase();
  if (clean.includes('3.5') || clean.includes('3.1') || clean.includes('flash-lite') || clean.includes('flash lite')) {
    return 'gemini-3.5-flash-lite';
  }
  if (clean.includes('2.0') || clean.includes('2.0-flash')) return 'gemini-2.0-flash';
  if (clean.includes('1.5')) return 'gemini-1.5-flash';
  if (clean.includes('flash')) return 'gemini-2.5-flash';
  if (clean.includes('pro')) return 'gemini-2.5-pro';
  return rawName.trim();
}

// POST /api/ai/generate-exam
router.post(
  '/generate-exam',
  upload.fields([
    { name: 'examFile', maxCount: 1 },
    { name: 'solutionFile', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const examFile = req.files?.['examFile']?.[0];
      const solutionFile = req.files?.['solutionFile']?.[0];

      if (!examFile) {
        return res.status(400).json({ error: 'Vui lòng tải lên file đề thi (PDF hoặc Word .docx)' });
      }

      const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: 'Chưa có Gemini API Key. Vui lòng nhập API Key trên giao diện hoặc cấu hình biến môi trường GEMINI_API_KEY.' 
        });
      }

      const modelName = resolveModelName(req.body.modelName || 'gemini-3.5-flash-lite');

      // Extract content from files
      let examText = '';
      let examInlineData = null;

      const examExt = path.extname(examFile.originalname).toLowerCase();
      if (examExt === '.pdf') {
        if (pdfParse) {
          try {
            const parsed = await pdfParse(examFile.buffer);
            examText = parsed.text || '';
          } catch (e) {
            console.warn('pdfParse notice:', e.message);
          }
        }
        // Also provide base64 for Gemini native multimodal PDF reading
        examInlineData = {
          mimeType: 'application/pdf',
          data: examFile.buffer.toString('base64')
        };
      } else if (examExt === '.docx' || examExt === '.doc') {
        const result = await mammoth.extractRawText({ buffer: examFile.buffer });
        examText = result.value || '';
      } else {
        return res.status(400).json({ error: 'Định dạng file đề thi không hợp lệ. Chỉ hỗ trợ file .pdf hoặc .docx' });
      }

      let solutionText = '';
      if (solutionFile) {
        const solExt = path.extname(solutionFile.originalname).toLowerCase();
        if (solExt === '.pdf' && pdfParse) {
          try {
            const solParsed = await pdfParse(solutionFile.buffer);
            solutionText = solParsed.text || '';
          } catch (e) {}
        } else if (solExt === '.docx' || solExt === '.doc') {
          const solResult = await mammoth.extractRawText({ buffer: solutionFile.buffer });
          solutionText = solResult.value || '';
        }
      }

      // Build Prompt for Gemini
      const systemInstruction = `Bạn là chuyên gia số hóa và thẩm định đề thi Tốt nghiệp THPT & Đại học chuẩn Bộ GD&ĐT Việt Nam (Chương trình mới 2025+).
Quy tắc biên soạn BẮT BUỘC:
1. NGUYÊN VĂN 100% (VERBATIM) - TUYỆT ĐỐI KHÔNG TÓM TẮT:
   - TUYỆT ĐỐI KHÔNG ĐƯỢC rút gọn, tóm tắt, viết tắt hay cắt bớt câu chữ trong đề thi gốc.
   - Giữ nguyên trọn vẹn toàn bộ câu dẫn, giả thiết, điều kiện xác định ($x > 0$, hàm liên tục...), đơn vị đo, đoạn văn/ngữ liệu bài đọc.
   - TUYỆT ĐỐI KHÔNG dùng dấu chấm lửng "..." để bỏ qua nội dung câu hỏi hoặc phương án trả lời.
   - Mọi phương án A, B, C, D (hoặc a, b, c, d) phải được giữ nguyên vẹn nội dung gốc.
2. Cấu trúc đề chuẩn THPT 2025 gồm tối đa 3 phần:
   - Phần I: Trắc nghiệm 4 lựa chọn (part_1_choice): 4 phương án A, B, C, D. Điểm mỗi câu thường là 0.25đ.
   - Phần II: Trắc nghiệm Đúng/Sai (part_2_true_false): Mỗi câu có 4 ý a), b), c), d). Điểm chuẩn: đúng 1 ý 0.1đ, 2 ý 0.25đ, 3 ý 0.5đ, 4 ý 1.0đ.
   - Phần III: Trắc nghiệm Trả lời ngắn (part_3_short_answer): Thí sinh điền số hoặc phân số/thập phân ngắn gọn. Điểm thường là 0.5đ/câu.
3. QUAN TRỌNG VỀ ĐÁP ÁN:
   - Nếu có tài liệu lời giải kèm theo: sử dụng lời giải và đáp án đó.
   - NẾU KHÔNG CÓ TÀI LIỆU LỜI GIẢI: Bạn PHẢI tự giải từng câu với độ chính xác tuyệt đối 100%, tìm ra đáp án đúng và viết lời giải chi tiết, rõ ràng từng bước.
4. CÔNG THỨC TOÁN: Mọi công thức Toán/Lý/Hóa PHẢI được định dạng chuẩn KaTeX/LaTeX bằng dấu $công thức$ (inline) hoặc $$công thức$$ (khối riêng). Ví dụ: $y = f(x)$, $\\int_a^b f(x)dx$, $\\lim_{x \\to 0}$, $\\sqrt{x^2+1}$.
5. ĐỊNH DẠNG ĐẦU RA: BẮT BUỘC trả về duy nhất một chuỗi JSON hợp lệ (không kèm giải thích bên ngoài, không kèm markdown code block thừa).`;

      const userPrompt = `Dưới đây là thông tin đề thi cần trích xuất và số hóa:
Tên file đề thi gốc: "${examFile.originalname}"
${solutionFile ? `Có file lời giải tham khảo đi kèm: "${solutionFile.originalname}"\nNội dung lời giải tham khảo:\n${solutionText.slice(0, 15000)}` : 'LƯU Ý: Đề thi KHÔNG có file lời giải đính kèm. Bạn hãy tự giải chi tiết từng câu và xác định đáp án chính xác 100%.'}

Nội dung trích xuất từ đề thi:
${examText ? examText.slice(0, 25000) : '(Xem tài liệu PDF đính kèm)'}

Hãy trả về JSON theo đúng định dạng sau:
{
  "title": "Tiêu đề đề thi trích xuất (ví dụ: Đề kiểm tra Toán 12 Trường Nguyễn Khuyến - Lê Thánh Tông 2026)",
  "subject_id": "math", // 'math' | 'physics' | 'chemistry' | 'biology' | 'english' | 'history' | 'geography'
  "grade": 12,
  "duration_minutes": 50,
  "total_points": 10.0,
  "exam_type": "thpt_2025",
  "year": 2026,
  "description": "Mô tả ma trận đề thi",
  "questions": [
    // Với câu hỏi Phần I:
    {
      "question_number": 1,
      "part_type": "part_1_choice",
      "content": "Nội dung câu hỏi (chứa công thức KaTeX $...$)",
      "options": [
        { "id": "A", "text": "Phương án A $...$" },
        { "id": "B", "text": "Phương án B $...$" },
        { "id": "C", "text": "Phương án C $...$" },
        { "id": "D", "text": "Phương án D $...$" }
      ],
      "correct_answer": { "answer": "A" },
      "explanation": "Lời giải chi tiết từng bước $...$",
      "points": 0.25,
      "topic": "Tên chuyên đề kiến thức"
    },
    // Với câu hỏi Phần II (nếu có):
    {
      "question_number": 13,
      "part_type": "part_2_true_false",
      "content": "Cho hàm số $y = f(x)$... Xét tính đúng sai của các khẳng định sau:",
      "options": [
        { "id": "a", "text": "Ý a $...$" },
        { "id": "b", "text": "Ý b $...$" },
        { "id": "c", "text": "Ý c $...$" },
        { "id": "d", "text": "Ý d $...$" }
      ],
      "correct_answer": { "a": true, "b": false, "c": true, "d": false },
      "explanation": "Giải thích chi tiết từng ý a, b, c, d $...$",
      "points": 1.0,
      "topic": "Tên chuyên đề"
    },
    // Với câu hỏi Phần III (nếu có):
    {
      "question_number": 17,
      "part_type": "part_3_short_answer",
      "content": "Nội dung bài toán tính toán ra đáp số ngắn $...$",
      "options": [],
      "correct_answer": { "answer": "12.5" },
      "explanation": "Các bước tính toán ra đáp số 12.5 $...$",
      "points": 0.5,
      "topic": "Tên chuyên đề"
    }
  ]
}`;

      // Assemble contents for Gemini API request
      const contentsParts = [];

      // Add PDF inlineData if available
      if (examInlineData) {
        contentsParts.push({
          inlineData: examInlineData
        });
      }

      // Add text prompt
      contentsParts.push({
        text: userPrompt
      });

      const geminiBody = {
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: contentsParts
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.95,
          maxOutputTokens: 16384,
          responseMimeType: 'application/json'
        }
      };

      // Candidate models for automatic fallback if requested model is deprecated / 404
      const candidateModels = [
        modelName,
        'gemini-3.5-flash-lite',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

      let data = null;
      let lastError = null;

      // Helper to assign maxOutputTokens dynamically based on model capabilities
      const getMaxTokensForModel = (model) => {
        // Gemini 2.5 and 3.5 support up to 65,536 tokens
        if (model.includes('2.5') || model.includes('3.5')) {
          return 65536;
        }
        // Gemini 1.5 and 2.0 have a strict hard limit of 8,192 tokens from Google API
        return 8192;
      };

      for (const currentModel of candidateModels) {
        try {
          const maxTokens = getMaxTokensForModel(currentModel);
          console.log(`Đang gọi Gemini API với mô hình: ${currentModel} (maxOutputTokens: ${maxTokens})...`);
          const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

          const requestBody = {
            ...geminiBody,
            generationConfig: {
              ...geminiBody.generationConfig,
              maxOutputTokens: maxTokens
            }
          };

          const response = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            data = await response.json();
            console.log(`✅ Gemini API (${currentModel}) phản hồi thành công!`);
            break;
          }

          const errStatus = response.status;
          const errorText = await response.text();
          console.warn(`Gemini (${currentModel}) lỗi (${errStatus}):`, errorText);
          lastError = `Gemini API lỗi (${errStatus}): ${errorText}`;

          // If model is not found / deprecated (404), try next model in fallback list
          if (errStatus === 404 || errorText.includes('no longer available') || errorText.includes('NOT_FOUND')) {
            console.log(`Chuyển sang mô hình dự phòng tiếp theo...`);
            continue;
          } else {
            // If invalid API key (400) or other fatal error, stop immediately
            throw new Error(lastError);
          }
        } catch (err) {
          lastError = err.message;
          if (err.message.includes('API key') || (err.message.includes('400') && !err.message.includes('model'))) {
            throw err;
          }
        }
      }

      if (!data) {
        throw new Error(lastError || 'Không thể kết nối đến mô hình Gemini.');
      }
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Gemini không trả về nội dung hợp lệ.');
      }

      // Clean JSON if needed
      let cleanedJson = rawText.trim();
      if (cleanedJson.startsWith('```json')) {
        cleanedJson = cleanedJson.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const draftExam = safeParseJson(cleanedJson);

      res.json({
        success: true,
        message: 'AI đã trích xuất và tạo bản nháp đề thi thành công! Hãy kiểm tra và thẩm định lại trước khi phê duyệt xuất bản.',
        draft: draftExam
      });

    } catch (err) {
      console.error('Error generating exam from AI:', err);
      res.status(500).json({ 
        error: err.message || 'Lỗi xử lý AI tạo đề thi. Vui lòng kiểm tra lại API Key và định dạng file.' 
      });
    }
  }
);

module.exports = router;
