import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Flag, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Sparkles, 
  HelpCircle,
  ArrowLeft,
  Lightbulb
} from 'lucide-react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MathText from '../components/MathText';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ExamTakingPage({ examId, mode = 'exam', user, onFinishExam, onCancel }) {
  const { toast, confirm, alert } = useToast();
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const effectiveExamId = examId || params.id;
  const effectiveMode = searchParams.get('mode') || mode || 'exam';

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers state: { [questionId]: value }
  // Part 1: string ('A', 'B', etc)
  // Part 2: { a: true/false, b: true/false, c: true/false, d: true/false }
  // Part 3: string ('12.5', '4', etc)
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});

  // Practice mode single-check cache: { [questionId]: { is_correct, explanation, correct_answer } }
  const [practiceFeedbacks, setPracticeFeedbacks] = useState({});

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    async function loadExam() {
      if (!effectiveExamId) return;
      try {
        const data = await api.getExamDetail(effectiveExamId);
        setExam(data.exam);
        setQuestions(data.questions);
        setTimeLeft((data.exam.duration_minutes || 50) * 60);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [effectiveExamId]);

  // Countdown timer for Exam mode
  useEffect(() => {
    if (loading || !exam || mode !== 'exam') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, exam, mode]);

  const handleAutoSubmit = async () => {
    await alert({
      title: 'Hết Giờ Làm Bài!',
      message: 'Thời gian thi đã kết thúc. Hệ thống đang tự động nộp bài thi của bạn.',
      type: 'warning'
    });
    handleSubmit(true);
  };

  const handleSelectOption = (qId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: optionId
    }));
  };

  const handleToggleTrueFalse = (qId, subKey, val) => {
    setAnswers(prev => {
      const currentSub = prev[qId] || {};
      return {
        ...prev,
        [qId]: {
          ...currentSub,
          [subKey]: val
        }
      };
    });
  };

  const handleShortAnswerChange = (qId, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const toggleFlag = (qId) => {
    setFlagged(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Practice mode: check single question immediately
  const handleCheckSingle = async (q) => {
    const userAnswer = answers[q.id];
    if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
      toast.warning('Vui lòng chọn hoặc nhập câu trả lời trước khi kiểm tra!');
      return;
    }

    try {
      const result = await api.checkSingleQuestion(effectiveExamId, q.id, userAnswer);
      setPracticeFeedbacks(prev => ({
        ...prev,
        [q.id]: result
      }));
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi kiểm tra câu hỏi');
    }
  };

  // Submit entire exam
  const handleSubmit = async (isAuto = false) => {
    const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length;
    if (!isAuto && effectiveMode === 'exam' && answeredCount < questions.length) {
      const confirmSubmit = await confirm({
        title: 'Xác Nhận Nộp Bài Thi',
        message: `Bạn mới hoàn thành ${answeredCount}/${questions.length} câu hỏi. Bạn có chắc chắn muốn nộp bài ngay bây giờ?`,
        confirmText: 'Vẫn nộp bài',
        cancelText: 'Tiếp tục làm bài',
        type: 'warning'
      });
      if (!confirmSubmit) return;
    }

    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const result = await api.submitExam(effectiveExamId, {
        answers,
        time_spent_seconds: timeSpentSeconds,
        user_id: user ? user.id : 1 // fallback demo student
      });
      toast.success('Nộp bài thi thành công!');
      if (onFinishExam) {
        onFinishExam(result, exam, answers);
      } else {
        navigate('/ket-qua-thi', { state: { result, exam, answers } });
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi nộp bài');
    }
  };

  const handleExitRoom = async () => {
    if (effectiveMode === 'exam') {
      const ok = await confirm({
        title: 'Rời Phòng Thi?',
        message: 'Tiến trình làm bài hiện tại sẽ không được lưu nếu bạn rời khỏi phòng thi.',
        confirmText: 'Rời khỏi',
        cancelText: 'Ở lại làm tiếp',
        type: 'danger'
      });
      if (!ok) return;
    }
    if (onCancel) {
      onCancel();
    } else {
      navigate('/luyen-de');
    }
  };

  if (loading || !exam) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '1.25rem', color: '#64748B' }}>Đang nạp đề thi và thiết lập phòng thi...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 20px', maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card glass-panel" style={{ padding: '48px 36px', borderTop: '4px solid #2563EB' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
            Vui Lòng Đăng Nhập Để Làm Bài
          </h2>
          <p style={{ color: '#64748B', lineHeight: '1.6', marginBottom: '28px', fontSize: '0.95rem' }}>
            Bạn cần có tài khoản học sinh để hệ thống tính điểm chuẩn xác, bấm giờ thi và lưu lại các câu làm sai vào Sổ tay câu sai cá nhân.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              Đăng Nhập Tài Khoản Học Sinh
            </button>
            <button 
              onClick={() => navigate('/luyen-de')}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Quay lại danh sách đề thi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCurrentAnswered = (q) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null || ans === '') return false;
    if (q.part_type === 'part_2_true_false') {
      return Object.keys(ans).length === 4;
    }
    return true;
  };

  const answeredTotal = questions.filter(q => isCurrentAnswered(q)).length;

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#F8FAFC' }}>
      
      {/* Top Floating Exam Control Header */}
      <div style={{ background: '#0F172A', color: 'white', padding: '12px 0', borderBottom: '1px solid #1E293B', position: 'sticky', top: 'var(--nav-height, 64px)', zIndex: 40, transition: 'all 0.2s ease' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button 
              onClick={handleExitRoom}
              style={{ background: '#1E293B', border: 'none', color: '#E2E8F0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={16} /> Rời phòng
            </button>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>
                {exam.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                {exam.subject_name} • {questions.length} câu • {exam.duration_minutes} phút
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Mode badge */}
            <span className={`badge ${mode === 'exam' ? 'badge-blue' : 'badge-green'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {mode === 'exam' ? (
                <>
                  <Clock size={13} /> Thi Thử
                </>
              ) : (
                <>
                  <Lightbulb size={13} /> Luyện Tập
                </>
              )}
            </span>

            {/* Countdown timer */}
            {mode === 'exam' && (
              <div className={`timer-box ${timeLeft <= 300 ? 'urgent' : ''}`}>
                <Clock size={18} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Finish/Submit button */}
            <button 
              onClick={handleSubmit}
              className="btn btn-success"
              style={{ fontWeight: 700, padding: '8px 20px' }}
            >
              <Send size={16} />
              Nộp Bài Thi
            </button>

          </div>

        </div>
      </div>

      {/* Main Exam Room Layout */}
      <div className="container" style={{ padding: '24px 0' }}>
        <div className="exam-taking-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) clamp(260px, 24vw, 320px)', gap: 'clamp(16px, 2vw, 28px)', alignItems: 'start' }}>
          
          {/* Left Column: Question Viewer */}
          <div>
            
            {/* Part category header banner */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '12px 18px', borderRadius: '12px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 800, color: '#1D4ED8', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  {currentQ.part_type === 'part_1_choice' && 'Phần I: Trắc nghiệm 4 lựa chọn'}
                  {currentQ.part_type === 'part_2_true_false' && 'Phần II: Trắc nghiệm Đúng / Sai (Cấu trúc 2025)'}
                  {currentQ.part_type === 'part_3_short_answer' && 'Phần III: Trắc nghiệm Trả lời ngắn'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>
                  {currentQ.topic || 'Chuyên đề ôn tập'} • Thang điểm: {currentQ.points}đ
                </span>
              </div>

              <button 
                onClick={() => toggleFlag(currentQ.id)}
                className={`btn btn-sm ${flagged[currentQ.id] ? 'btn-accent' : 'btn-secondary'}`}
                title="Đánh dấu câu này để kiểm tra lại trước khi nộp"
              >
                <Flag size={14} />
                {flagged[currentQ.id] ? 'Đã cắm cờ' : 'Cắm cờ'}
              </button>
            </div>

            {/* Question Card */}
            <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
              
              <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                <span style={{ 
                  background: '#2563EB', 
                  color: 'white', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 800, 
                  flexShrink: 0 
                }}>
                  {currentQ.question_number}
                </span>

                <div style={{ flex: 1, fontSize: '1.05rem', lineHeight: '1.7', color: '#0F172A' }}>
                  <MathText text={currentQ.content} />
                </div>
              </div>

              {/* Question Illustration Image (if available) */}
              {currentQ.image_url && (
                <div style={{ margin: '18px 0', textAlign: 'center' }}>
                  <img 
                    src={currentQ.image_url.startsWith('http') ? currentQ.image_url : `http://localhost:5000${currentQ.image_url}`} 
                    alt={`Hình minh họa câu ${currentQ.question_number}`} 
                    style={{ maxWidth: '100%', maxHeight: '380px', borderRadius: '10px', border: '1px solid #E2E8F0', objectFit: 'contain', background: 'white', padding: '6px' }} 
                  />
                </div>
              )}

              {/* Interaction based on Part Type */}
              
              {/* Type 1: Multiple choice A, B, C, D */}
              {currentQ.part_type === 'part_1_choice' && currentQ.options && (
                <div style={{ marginTop: '20px' }}>
                  {currentQ.options.map(opt => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    const feedback = practiceFeedbacks[currentQ.id];
                    let extraClass = '';
                    if (isSelected) extraClass += ' selected';
                    if (feedback) {
                      if (feedback.correct_answer.answer === opt.id) extraClass += ' correct';
                      else if (isSelected && !feedback.is_correct) extraClass += ' incorrect';
                    }

                    return (
                      <div 
                        key={opt.id}
                        className={`option-item ${extraClass}`}
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      >
                        <span className="option-letter">{opt.id}</span>
                        <div style={{ flex: 1, fontSize: '0.975rem' }}>
                          <MathText text={opt.text} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Type 2: True / False 4 sub-items */}
              {currentQ.part_type === 'part_2_true_false' && currentQ.options && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '12px', fontStyle: 'italic' }}>
                    * Chọn Đúng hoặc Sai cho từng mệnh đề a, b, c, d dưới đây:
                  </div>

                  {currentQ.options.map(subItem => {
                    const currentAnswer = answers[currentQ.id] || {};
                    const selectedVal = currentAnswer[subItem.id];
                    const feedback = practiceFeedbacks[currentQ.id];
                    const subRes = feedback && feedback.sub_results ? feedback.sub_results[subItem.id] : null;

                    return (
                      <div 
                        key={subItem.id}
                        className="tf-subitem"
                        style={{
                          borderColor: subRes ? (subRes.match ? '#10B981' : '#EF4444') : '#E2E8F0',
                          background: subRes ? (subRes.match ? '#ECFDF5' : '#FEF2F2') : 'white'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>
                            {subItem.id})
                          </span>
                          <div style={{ fontSize: '0.95rem' }}>
                            <MathText text={subItem.statement} />
                          </div>
                        </div>

                        <div className="tf-controls">
                          <button 
                            className={`tf-btn ${selectedVal === true ? 'active-true' : ''}`}
                            onClick={() => handleToggleTrueFalse(currentQ.id, subItem.id, true)}
                          >
                            Đúng
                          </button>
                          <button 
                            className={`tf-btn ${selectedVal === false ? 'active-false' : ''}`}
                            onClick={() => handleToggleTrueFalse(currentQ.id, subItem.id, false)}
                          >
                            Sai
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Type 3: Short Answer */}
              {currentQ.part_type === 'part_3_short_answer' && (
                <div style={{ marginTop: '20px', background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
                    Điền đáp số của bạn vào ô dưới đây (số nguyên hoặc số thập phân):
                  </label>
                  <div style={{ maxWidth: '300px' }}>
                    <input 
                      type="text"
                      className="input-control"
                      placeholder="Ví dụ: 4 hoặc 12.36"
                      value={answers[currentQ.id] || ''}
                      onChange={e => handleShortAnswerChange(currentQ.id, e.target.value)}
                      style={{ fontSize: '1.1rem', fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}

              {/* Practice Mode: Instant Check Button and Explanation Box */}
              {mode === 'practice' && (
                <div style={{ marginTop: '24px', borderTop: '1px solid #F1F5F9', paddingTop: '18px' }}>
                  {!practiceFeedbacks[currentQ.id] ? (
                    <button 
                      onClick={() => handleCheckSingle(currentQ)}
                      className="btn btn-primary btn-sm"
                    >
                      <Sparkles size={16} /> Kiểm tra đáp án câu này
                    </button>
                  ) : (
                    <div style={{ 
                      background: practiceFeedbacks[currentQ.id].is_correct ? '#ECFDF5' : '#FEF2F2',
                      border: `1.5px solid ${practiceFeedbacks[currentQ.id].is_correct ? '#A7F3D0' : '#FECACA'}`,
                      borderRadius: '12px',
                      padding: '18px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 700, color: practiceFeedbacks[currentQ.id].is_correct ? '#065F46' : '#991B1B' }}>
                        {practiceFeedbacks[currentQ.id].is_correct ? (
                          <>
                            <CheckCircle size={20} color="#10B981" />
                            <span>Chính xác! Điểm đạt được: +{practiceFeedbacks[currentQ.id].earned_points} điểm</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={20} color="#EF4444" />
                            <span>Chưa chính xác! Điểm đạt: {practiceFeedbacks[currentQ.id].earned_points} / {practiceFeedbacks[currentQ.id].max_points}</span>
                          </>
                        )}
                      </div>

                      <div style={{ fontSize: '0.9rem', color: '#1E293B', lineHeight: '1.6' }}>
                        <div style={{ fontWeight: 700, marginBottom: '4px', color: '#0F172A' }}>
                          Lời giải chi tiết:
                        </div>
                        <MathText text={practiceFeedbacks[currentQ.id].explanation} />
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="btn btn-secondary"
              >
                <ChevronLeft size={18} /> Câu trước
              </button>

              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                Câu {currentIndex + 1} / {questions.length}
              </span>

              <button 
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="btn btn-primary"
              >
                Câu tiếp theo <ChevronRight size={18} />
              </button>
            </div>

          </div>

          {/* Right Column: Question Palette & Navigation Drawer */}
          <div className="card glass-panel" style={{ position: 'sticky', top: 'calc(var(--nav-height, 64px) + 76px)', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
            
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Danh Sách Câu Hỏi</span>
              <span className="badge badge-blue">{answeredTotal}/{questions.length}</span>
            </h4>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', marginBottom: '18px' }}>
              <div style={{ 
                width: `${(answeredTotal / questions.length) * 100}%`, 
                height: '100%', 
                background: '#2563EB', 
                transition: 'width 0.3s ease' 
              }} />
            </div>

            {/* Palette Grid with Clean Part Grouping if multi-part */}
            {['part_1_choice', 'part_2_true_false', 'part_3_short_answer'].filter(pt => questions.some(q => q.part_type === pt)).length > 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {[
                  { key: 'part_1_choice', label: 'Phần I: Trắc nghiệm 4 lựa chọn' },
                  { key: 'part_2_true_false', label: 'Phần II: Đúng / Sai' },
                  { key: 'part_3_short_answer', label: 'Phần III: Trả lời ngắn' }
                ].map(group => {
                  const groupQuestions = questions
                    .map((q, idx) => ({ ...q, originalIndex: idx }))
                    .filter(q => q.part_type === group.key);
                  if (groupQuestions.length === 0) return null;

                  return (
                    <div key={group.key}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
                        {group.label} ({groupQuestions.length} câu)
                      </div>
                      <div className="palette-grid">
                        {groupQuestions.map(q => {
                          const answered = isCurrentAnswered(q);
                          const isFlag = flagged[q.id];
                          const isCurrent = q.originalIndex === currentIndex;

                          let cls = 'palette-item';
                          if (answered) cls += ' answered';
                          if (isCurrent) cls += ' current';
                          if (isFlag) cls += ' flagged';

                          return (
                            <button 
                              key={q.id}
                              className={cls}
                              onClick={() => setCurrentIndex(q.originalIndex)}
                              title={`Câu ${q.question_number}`}
                            >
                              {q.question_number}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="palette-grid" style={{ marginBottom: '20px' }}>
                {questions.map((q, idx) => {
                  const answered = isCurrentAnswered(q);
                  const isFlag = flagged[q.id];
                  const isCurrent = idx === currentIndex;

                  let cls = 'palette-item';
                  if (answered) cls += ' answered';
                  if (isCurrent) cls += ' current';
                  if (isFlag) cls += ' flagged';

                  return (
                    <button 
                      key={q.id}
                      className={cls}
                      onClick={() => setCurrentIndex(idx)}
                    >
                      {q.question_number}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', fontSize: '0.75rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2563EB', display: 'inline-block' }} />
                <span>Đã trả lời</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'white', border: '1px solid #CBD5E1', display: 'inline-block' }} />
                <span>Chưa trả lời</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                <span>Đã cắm cờ xem lại</span>
              </div>
            </div>

            {/* Submit in palette */}
            <button 
              onClick={handleSubmit}
              className="btn btn-success"
              style={{ width: '100%', fontWeight: 700 }}
            >
              <Send size={16} /> Nộp Bài Thi
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}
