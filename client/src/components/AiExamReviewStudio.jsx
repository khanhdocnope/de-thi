import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Eye, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Image as ImageIcon, 
  HelpCircle,
  Clock,
  Key,
  Bot,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import MathText from './MathText';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AiExamReviewStudio({ subjects, onExamPublished }) {
  const { toast, confirm } = useToast();

  // AI Configuration State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [modelName, setModelName] = useState(() => {
    const saved = localStorage.getItem('gemini_model');
    if (saved === 'gemini-2.5-flash-lite' || saved === 'gemini-3.1-flash-lite') {
      return 'gemini-3.5-flash-lite';
    }
    return saved || 'gemini-3.5-flash-lite';
  });
  const [showApiKey, setShowApiKey] = useState(false);

  // File Upload State
  const [examFile, setExamFile] = useState(null);
  const [solutionFile, setSolutionFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  // 2-Tier Review Studio State
  const [draft, setDraft] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingImgIndex, setUploadingImgIndex] = useState(null);

  // Handle AI Ingestion
  const handleGenerateExam = async (e) => {
    e.preventDefault();
    if (!examFile) {
      toast.warning('Vui lòng chọn file đề thi (PDF hoặc Word .docx)');
      return;
    }
    if (!apiKey.trim()) {
      toast.warning('Vui lòng nhập Google Gemini API Key để khởi chạy AI');
      return;
    }

    localStorage.setItem('gemini_api_key', apiKey.trim());
    localStorage.setItem('gemini_model', modelName);

    const formData = new FormData();
    formData.append('examFile', examFile);
    if (solutionFile) {
      formData.append('solutionFile', solutionFile);
    }
    formData.append('apiKey', apiKey.trim());
    formData.append('modelName', modelName);

    setLoading(true);
    setStatusText('AI đang đọc tài liệu, nhận diện công thức KaTeX và phân tích lời giải...');

    try {
      const res = await api.generateExamFromAI(formData);
      if (res.draft) {
        setDraft(res.draft);
        toast.success(
          'AI đã bóc tách đề thi thành công! Mời giáo viên thẩm định lại từng câu trước khi duyệt xuất bản.',
          'Hoàn thành Lớp 1'
        );
      } else {
        throw new Error(res.error || 'Không nhận được dữ liệu đề thi');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xử lý AI tạo đề thi');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  // Upload image for a question in draft
  const handleUploadQuestionImage = async (file, qIndex) => {
    if (!file) return;
    setUploadingImgIndex(qIndex);
    try {
      const res = await api.uploadImage(file);
      if (res.url) {
        setDraft(prev => {
          const updated = { ...prev };
          const qs = [...updated.questions];
          qs[qIndex] = { ...qs[qIndex], image_url: res.url };
          updated.questions = qs;
          return updated;
        });
        toast.success('Đã tải và đính kèm ảnh minh họa vào câu hỏi!');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tải ảnh');
    } finally {
      setUploadingImgIndex(null);
    }
  };

  // Publish Draft Exam
  const handlePublishExam = async () => {
    if (!draft || !draft.questions || draft.questions.length === 0) {
      toast.warning('Bản nháp đề thi chưa có câu hỏi nào để xuất bản');
      return;
    }

    const confirmed = await confirm({
      title: 'Phê Duyệt & Xuất Bản Đề Thi?',
      message: `Bạn đang phê duyệt đề thi "${draft.title}" gồm ${draft.questions.length} câu hỏi lên Ngân hàng đề thi chính thức cho học sinh ôn luyện.`,
      confirmText: 'Phê duyệt & Xuất bản',
      cancelText: 'Xem lại',
      type: 'success'
    });
    if (!confirmed) return;

    try {
      const res = await api.publishDraftExam(draft);
      toast.success(res.message || 'Đã xuất bản đề thi thành công!', 'Xuất bản thành công');
      setDraft(null);
      setExamFile(null);
      setSolutionFile(null);
      if (onExamPublished) onExamPublished();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi lưu và xuất bản đề thi');
    }
  };

  // Reset Draft
  const handleResetDraft = async () => {
    const ok = await confirm({
      title: 'Hủy Bản Nháp Hiện Tại?',
      message: 'Các chỉnh sửa chưa lưu trong bản nháp này sẽ bị mất.',
      confirmText: 'Hủy bản nháp',
      cancelText: 'Giữ lại',
      type: 'danger'
    });
    if (ok) {
      setDraft(null);
      setEditingIndex(null);
      setPreviewMode(false);
    }
  };

  // Update a question field
  const updateQuestion = (index, field, value) => {
    setDraft(prev => {
      const updated = { ...prev };
      const qs = [...updated.questions];
      qs[index] = { ...qs[index], [field]: value };
      updated.questions = qs;
      return updated;
    });
  };

  // Update an option inside a question
  const updateOptionText = (qIndex, optId, newText) => {
    setDraft(prev => {
      const updated = { ...prev };
      const qs = [...updated.questions];
      const q = { ...qs[qIndex] };
      const opts = (q.options || []).map(opt => {
        if (opt.id === optId) return { ...opt, text: newText };
        return opt;
      });
      q.options = opts;
      qs[qIndex] = q;
      updated.questions = qs;
      return updated;
    });
  };

  // Delete a question
  const deleteQuestion = (index) => {
    setDraft(prev => {
      const updated = { ...prev };
      const qs = updated.questions.filter((_, i) => i !== index);
      // Re-number
      const renumbered = qs.map((q, i) => ({ ...q, question_number: i + 1 }));
      updated.questions = renumbered;
      return updated;
    });
    toast.info('Đã xóa câu hỏi khỏi bản nháp');
  };

  // Add a new question
  const addNewQuestion = () => {
    setDraft(prev => {
      const updated = { ...prev };
      const nextNum = (updated.questions || []).length + 1;
      const newQ = {
        question_number: nextNum,
        part_type: 'part_1_choice',
        content: 'Nhập nội dung câu hỏi mới $y = f(x)$...',
        options: [
          { id: 'A', text: 'Phương án A' },
          { id: 'B', text: 'Phương án B' },
          { id: 'C', text: 'Phương án C' },
          { id: 'D', text: 'Phương án D' }
        ],
        correct_answer: { answer: 'A' },
        explanation: 'Hướng dẫn phương pháp giải...',
        points: 0.25,
        topic: 'Chuyên đề ôn tập'
      };
      updated.questions = [...updated.questions, newQ];
      return updated;
    });
    setEditingIndex(draft.questions.length);
    toast.success('Đã thêm 1 câu hỏi mới vào cuối đề thi!');
  };

  // ==========================================
  // VIEW 1: UPLOAD & GENERATE (When no draft)
  // ==========================================
  if (!draft) {
    return (
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '8px', borderRadius: '10px' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
              Trình Tạo Đề Thi Bằng AI & Thẩm Định 2 Lớp (Human-in-the-Loop)
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
              Tải lên file đề thi (PDF hoặc Word). AI tự trích xuất câu hỏi, tự giải ra đáp án nếu đề thiếu lời giải, sau đó chuyển sang Lớp Thẩm Định để Giáo viên phê duyệt trước khi xuất bản.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateExam} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Gemini API Key & Model Configuration */}
          <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E293B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="#2563EB" /> Cấu Hình Google Gemini API Key & Model
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Gemini API Key <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    required
                    className="input-control"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    style={{ paddingRight: '80px', fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748B',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {showApiKey ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Key được lưu an toàn tại trình duyệt của bạn (localStorage), không chia sẻ công khai.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Mô Hình AI (Model)
                </label>
                <select
                  className="input-control"
                  value={modelName}
                  onChange={e => {
                    setModelName(e.target.value);
                    localStorage.setItem('gemini_model', e.target.value);
                  }}
                >
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Mới nhất & Khuyên dùng)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Cân bằng & Chuẩn xác)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Tốc độ cao)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Tương thích cao)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Suy luận Toán sâu)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dual File Upload Zone */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* File 1: Exam File (Required) */}
            <div style={{ border: '2px dashed #3B82F6', borderRadius: '14px', padding: '24px', textAlign: 'center', background: examFile ? '#EFF6FF' : 'white' }}>
              <Upload size={32} color="#2563EB" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                1. File Đề Thi (Bắt buộc) <span style={{ color: '#EF4444' }}>*</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '14px' }}>
                Hỗ trợ file định dạng <strong>.pdf</strong> hoặc <strong>.docx</strong> (Ví dụ file đề trường Nguyễn Khuyến)
              </p>

              <input
                type="file"
                id="examFileInput"
                accept=".pdf,.docx,.doc"
                style={{ display: 'none' }}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setExamFile(e.target.files[0]);
                  }
                }}
              />

              <label
                htmlFor="examFileInput"
                className="btn btn-secondary btn-sm"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={16} /> {examFile ? examFile.name : 'Chọn File Đề Thi'}
              </label>

              {examFile && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>
                  Đã nạp: {examFile.name} ({(examFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* File 2: Solution File (Optional) */}
            <div style={{ border: '2px dashed #CBD5E1', borderRadius: '14px', padding: '24px', textAlign: 'center', background: solutionFile ? '#F0FDF4' : 'white' }}>
              <FileText size={32} color="#10B981" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                2. File Lời Giải / Đáp Án (Tùy chọn)
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '14px' }}>
                Nếu không có file lời giải, <strong>AI sẽ tự động giải chi tiết và đưa ra đáp án đúng 100%</strong>.
              </p>

              <input
                type="file"
                id="solFileInput"
                accept=".pdf,.docx,.doc"
                style={{ display: 'none' }}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setSolutionFile(e.target.files[0]);
                  }
                }}
              />

              <label
                htmlFor="solFileInput"
                className="btn btn-secondary btn-sm"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={16} /> {solutionFile ? solutionFile.name : 'Chọn File Lời Giải (Nếu có)'}
              </label>

              {solutionFile && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>
                  Đã nạp: {solutionFile.name} ({(solutionFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

          </div>

          {/* Action button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              {loading ? (
                <span style={{ color: '#2563EB', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={16} className="spin" /> {statusText}
                </span>
              ) : (
                'Nhấn nút để AI tiến hành bóc tách và giải đề thi tự động'
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Sparkles size={18} /> Khởi Chạy Phân Tích & Tạo Đề Bằng AI
            </button>
          </div>

        </form>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: 2-TIER REVIEW STUDIO (Draft Editor)
  // ==========================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Studio Header & Top Action Bar */}
      <div className="card" style={{ padding: '24px 28px', borderLeft: '5px solid #2563EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-purple">Lớp Thẩm Định Thứ 2 (Human-in-the-Loop)</span>
              <span className="badge badge-blue">{draft.questions?.length || 0} câu hỏi</span>
              <span className="badge badge-green">Cấu trúc 3 phần 2025</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
              Studio Phê Duyệt & Chỉnh Sửa Đề Thi
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
              Vui lòng rà soát công thức KaTeX, kiểm tra đáp án đúng và bổ sung ảnh minh họa nếu có trước khi bấm Xuất bản.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleResetDraft}
              className="btn btn-secondary btn-sm"
              style={{ color: '#EF4444' }}
            >
              <Trash2 size={16} /> Hủy Bản Nháp
            </button>

            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`btn btn-sm ${previewMode ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye size={16} /> {previewMode ? 'Quay Lại Biên Soạn' : 'Mô Phỏng Học Sinh'}
            </button>

            <button
              type="button"
              onClick={handlePublishExam}
              className="btn btn-success"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
            >
              <CheckCircle2 size={18} /> Phê Duyệt & Xuất Bản Đề Thi
            </button>
          </div>
        </div>

        {/* Exam Metadata Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', background: '#F8FAFC', padding: '16px', borderRadius: '12px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Tiêu đề đề thi:
            </label>
            <input
              className="input-control"
              value={draft.title || ''}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Môn học:
            </label>
            <select
              className="input-control"
              value={draft.subject_id || 'math'}
              onChange={e => setDraft({ ...draft, subject_id: e.target.value })}
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Thời gian làm bài (phút):
            </label>
            <input
              type="number"
              className="input-control"
              value={draft.duration_minutes || 50}
              onChange={e => setDraft({ ...draft, duration_minutes: Number(e.target.value) })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Năm thi:
            </label>
            <input
              type="number"
              className="input-control"
              value={draft.year || 2026}
              onChange={e => setDraft({ ...draft, year: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE: SIMULATED STUDENT PREVIEW */}
      {previewMode ? (
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Mô Phỏng Trải Nghiệm Học Sinh Làm Bài (Xem Trước Bản Nháp)
            </h3>
            <button
              onClick={() => setPreviewMode(false)}
              className="btn btn-secondary btn-sm"
            >
              <ArrowLeft size={16} /> Trở về chế độ chỉnh sửa
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {draft.questions?.map(q => (
              <div key={q.question_number} className="card" style={{ padding: '20px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span className="badge badge-blue">Câu {q.question_number}</span>
                  <span className="badge badge-purple">{q.part_type}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Thang điểm: {q.points}đ</span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', marginBottom: '14px', lineHeight: '1.6' }}>
                  <MathText text={q.content} />
                </div>

                {/* Illustration Image */}
                {q.image_url && (
                  <div style={{ margin: '14px 0', textAlign: 'center' }}>
                    <img
                      src={q.image_url.startsWith('http') ? q.image_url : `http://localhost:5000${q.image_url}`}
                      alt={`Minh họa câu ${q.question_number}`}
                      style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '10px', border: '1px solid #CBD5E1', background: 'white', padding: '6px' }}
                    />
                  </div>
                )}

                {/* Options Preview */}
                {q.part_type === 'part_1_choice' && q.options && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                    {q.options.map(opt => (
                      <div
                        key={opt.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: q.correct_answer?.answer === opt.id ? '2px solid #10B981' : '1px solid #CBD5E1',
                          background: q.correct_answer?.answer === opt.id ? '#ECFDF5' : 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}
                      >
                        <strong>{opt.id}. </strong> <MathText text={opt.text} />
                        {q.correct_answer?.answer === opt.id && ' (Đáp án đúng)'}
                      </div>
                    ))}
                  </div>
                )}

                {/* True / False 4 items */}
                {q.part_type === 'part_2_true_false' && q.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                    {q.options.map(opt => (
                      <div key={opt.id} style={{ padding: '8px 12px', background: 'white', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><strong>{opt.id}) </strong> <MathText text={opt.text} /></div>
                        <span className={`badge ${q.correct_answer?.[opt.id] ? 'badge-green' : 'badge-red'}`}>
                          {q.correct_answer?.[opt.id] ? 'ĐÚNG' : 'SAI'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Short answer */}
                {q.part_type === 'part_3_short_answer' && (
                  <div style={{ background: '#EFF6FF', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontWeight: 700, color: '#1E40AF' }}>
                    Đáp số đúng: {q.correct_answer?.answer}
                  </div>
                )}

                <div style={{ background: '#F1F5F9', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
                  <strong style={{ color: '#2563EB', display: 'block', marginBottom: '4px' }}>Hướng dẫn giải chi tiết:</strong>
                  <MathText text={q.explanation || 'Chưa có lời giải'} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* EDITING MODE: QUESTION BY QUESTION REVIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Danh Sách Câu Hỏi Cần Thẩm Định ({draft.questions?.length || 0})
            </h3>

            <button
              type="button"
              onClick={addNewQuestion}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Thêm Câu Hỏi Mới
            </button>
          </div>

          {draft.questions?.map((q, idx) => {
            const isEditing = editingIndex === idx;

            return (
              <div 
                key={idx}
                className="card"
                style={{ 
                  padding: '24px',
                  borderLeft: isEditing ? '4px solid #2563EB' : '1px solid #E2E8F0',
                  boxShadow: isEditing ? '0 10px 25px -5px rgba(37, 99, 235, 0.1)' : undefined
                }}
              >
                {/* Question Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-blue" style={{ fontWeight: 800 }}>
                      Câu {q.question_number}
                    </span>
                    <span className="badge badge-purple">
                      {q.part_type === 'part_1_choice' && 'Phần I: 4 Lựa chọn'}
                      {q.part_type === 'part_2_true_false' && 'Phần II: Đúng / Sai'}
                      {q.part_type === 'part_3_short_answer' && 'Phần III: Trả lời ngắn'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                      Điểm: <strong>{q.points}đ</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingIndex(isEditing ? null : idx)}
                      className={`btn btn-sm ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.8rem' }}
                    >
                      {isEditing ? 'Thu gọn' : 'Chỉnh sửa câu này'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(idx)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#EF4444' }}
                      title="Xóa câu này"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Question Content & KaTeX preview */}
                <div style={{ marginBottom: '14px' }}>
                  {isEditing ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#475569' }}>
                        Nội dung câu hỏi (chèn công thức bằng $công thức$):
                      </label>
                      <textarea
                        className="input-control"
                        rows={3}
                        value={q.content}
                        onChange={e => updateQuestion(idx, 'content', e.target.value)}
                        style={{ marginBottom: '8px' }}
                      />
                    </div>
                  ) : null}

                  <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.975rem', lineHeight: '1.6' }}>
                    <MathText text={q.content} />
                  </div>
                </div>

                {/* Illustration Image Section */}
                <div style={{ marginBottom: '16px' }}>
                  {q.image_url ? (
                    <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', position: 'relative' }}>
                      <img
                        src={q.image_url.startsWith('http') ? q.image_url : `http://localhost:5000${q.image_url}`}
                        alt={`Ảnh câu ${q.question_number}`}
                        style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px', objectFit: 'contain' }}
                      />
                      {isEditing && (
                        <div style={{ marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => updateQuestion(idx, 'image_url', '')}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#EF4444' }}
                          >
                            <Trash2 size={14} /> Gỡ ảnh này
                          </button>
                        </div>
                      )}
                    </div>
                  ) : isEditing ? (
                    <div style={{ background: '#F1F5F9', border: '1px dashed #CBD5E1', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                        <ImageIcon size={18} color="#2563EB" /> Đính kèm hình minh họa (đồ thị, hình học không gian, sơ đồ...):
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="file"
                          id={`img-upload-${idx}`}
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleUploadQuestionImage(e.target.files[0], idx);
                            }
                          }}
                        />
                        <label
                          htmlFor={`img-upload-${idx}`}
                          className="btn btn-secondary btn-sm"
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Upload size={14} /> {uploadingImgIndex === idx ? 'Đang tải...' : 'Tải ảnh từ máy'}
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt('Dán đường link (URL) ảnh minh họa:');
                            if (url) updateQuestion(idx, 'image_url', url.trim());
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          Dán link ảnh
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Options & Correct Answer Editor */}
                {q.part_type === 'part_1_choice' && q.options && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                      Các phương án lựa chọn:
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                      {q.options.map(opt => (
                        <div
                          key={opt.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: q.correct_answer?.answer === opt.id ? '2px solid #10B981' : '1px solid #CBD5E1',
                            background: q.correct_answer?.answer === opt.id ? '#ECFDF5' : 'white'
                          }}
                        >
                          {isEditing ? (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <label style={{ fontWeight: 800, fontSize: '0.85rem' }}>Phương án {opt.id}:</label>
                                <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 700, color: '#059669' }}>
                                  <input
                                    type="radio"
                                    name={`correct-${idx}`}
                                    checked={q.correct_answer?.answer === opt.id}
                                    onChange={() => updateQuestion(idx, 'correct_answer', { answer: opt.id })}
                                  />
                                  Đáp án đúng
                                </label>
                              </div>
                              <input
                                className="input-control"
                                value={opt.text}
                                onChange={e => updateOptionText(idx, opt.id, e.target.value)}
                                style={{ fontSize: '0.85rem', marginBottom: '4px' }}
                              />
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span><strong>{opt.id}. </strong> <MathText text={opt.text} /></span>
                              {q.correct_answer?.answer === opt.id && (
                                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>ĐÚNG</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Part 2: True / False 4 sub-items */}
                {q.part_type === 'part_2_true_false' && q.options && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                      4 Khẳng định Đúng / Sai:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map(opt => {
                        const isTrue = q.correct_answer?.[opt.id] === true;

                        return (
                          <div
                            key={opt.id}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              background: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              {isEditing ? (
                                <input
                                  className="input-control"
                                  value={opt.text}
                                  onChange={e => updateOptionText(idx, opt.id, e.target.value)}
                                  style={{ fontSize: '0.85rem' }}
                                />
                              ) : (
                                <span><strong>{opt.id}) </strong> <MathText text={opt.text} /></span>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentAns = q.correct_answer || {};
                                  updateQuestion(idx, 'correct_answer', { ...currentAns, [opt.id]: true });
                                }}
                                className={`btn btn-sm ${isTrue ? 'btn-success' : 'btn-secondary'}`}
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                              >
                                ĐÚNG
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentAns = q.correct_answer || {};
                                  updateQuestion(idx, 'correct_answer', { ...currentAns, [opt.id]: false });
                                }}
                                className={`btn btn-sm ${!isTrue ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                              >
                                SAI
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Part 3: Short Answer */}
                {q.part_type === 'part_3_short_answer' && (
                  <div style={{ marginBottom: '16px', background: '#EFF6FF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E40AF', display: 'block', marginBottom: '4px' }}>
                      Đáp số trả lời ngắn (số hoặc phân số):
                    </label>
                    {isEditing ? (
                      <input
                        className="input-control"
                        value={q.correct_answer?.answer || ''}
                        onChange={e => updateQuestion(idx, 'correct_answer', { answer: e.target.value })}
                        style={{ maxWidth: '240px' }}
                      />
                    ) : (
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1D4ED8' }}>
                        {q.correct_answer?.answer || '(Chưa nhập)'}
                      </span>
                    )}
                  </div>
                )}

                {/* Explanation */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563EB', marginBottom: '4px' }}>
                    Hướng dẫn phương pháp giải:
                  </div>
                  {isEditing ? (
                    <textarea
                      className="input-control"
                      rows={2}
                      value={q.explanation || ''}
                      onChange={e => updateQuestion(idx, 'explanation', e.target.value)}
                    />
                  ) : (
                    <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                      <MathText text={q.explanation || 'Chưa có lời giải'} />
                    </div>
                  )}
                </div>

              </div>
            );
          })}

          {/* Bottom Floating Confirm & Publish Bar */}
          <div style={{ position: 'sticky', bottom: '20px', background: 'white', padding: '16px 24px', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1.5px solid #2563EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 30 }}>
            <div>
              <strong style={{ color: '#0F172A', fontSize: '1rem' }}>
                Hoàn tất thẩm định đề thi ({draft.questions?.length} câu)
              </strong>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Đề thi sẽ xuất hiện ngay lập tức trong ngân hàng đề để học sinh vào luyện tập.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={addNewQuestion}
                className="btn btn-secondary"
              >
                <Plus size={16} /> Thêm câu
              </button>
              <button
                type="button"
                onClick={handlePublishExam}
                className="btn btn-success btn-lg"
                style={{ fontWeight: 800 }}
              >
                <CheckCircle2 size={18} /> Phê Duyệt & Xuất Bản Đề Thi
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
