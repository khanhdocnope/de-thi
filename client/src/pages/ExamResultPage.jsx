import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw, 
  BookMarked, 
  ArrowLeft, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import MathText from '../components/MathText';

export default function ExamResultPage({ result, exam, onRetake, onBackToList, onGoToMistakes }) {
  const [filterView, setFilterView] = useState('all'); // 'all', 'wrong', 'correct'
  const location = useLocation();
  const navigate = useNavigate();

  const effectiveResult = result || location.state?.result;
  const effectiveExam = exam || location.state?.exam;

  if (!effectiveResult || !effectiveExam) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="card glass-panel" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
            Chưa có kết quả bài thi
          </h3>
          <p style={{ color: '#64748B', marginBottom: '24px', fontSize: '0.9rem' }}>
            Vui lòng hoàn thành một bài thi thử hoặc bài luyện tập để xem bảng điểm và đáp án chi tiết.
          </p>
          <button 
            onClick={() => navigate('/luyen-de')} 
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Đến danh sách đề thi
          </button>
        </div>
      </div>
    );
  }

  const { score, total_points, percentage, time_spent_seconds, correct_count, total_questions, question_results } = effectiveResult;

  const filteredQuestions = (question_results || []).filter(q => {
    if (filterView === 'wrong') return !q.is_correct;
    if (filterView === 'correct') return q.is_correct;
    return true;
  });

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} phút ${s} giây`;
  };

  const getFeedback = (pct) => {
    if (pct >= 90) return { title: 'Xuất Sắc! Điểm Tuyệt Đối', color: '#10B981', desc: 'Kiến thức của bạn rất vững vàng, sẵn sàng đạt điểm 9-10 trong kỳ thi thật!' };
    if (pct >= 75) return { title: 'Rất Tốt! Đạt Chỉ Tiêu', color: '#2563EB', desc: 'Bạn đã nắm chắc kiến thức cơ bản và vận dụng. Hãy ôn lại vài câu sai để tối ưu điểm số.' };
    if (pct >= 50) return { title: 'Khá Ổn! Cần Luyện Thêm', color: '#F59E0B', desc: 'Có một số dạng câu hỏi bạn còn lúng túng. Hãy tận dụng Sổ tay câu sai để khắc phục.' };
    return { title: 'Cần Nỗ Lực Ôn Tập Lại', color: '#EF4444', desc: 'Hãy đọc lại phần lý thuyết trọng tâm trước khi làm lại đề nhé!' };
  };

  const feedback = getFeedback(percentage);

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '900px' }}>
      
      {/* Back button */}
      <button 
        onClick={() => { if (onBackToList) onBackToList(); else navigate('/luyen-de'); }}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '20px' }}
      >
        <ArrowLeft size={16} /> Danh sách đề thi
      </button>

      {/* Main Score Hero Card */}
      <div className="card glass-panel" style={{ padding: '36px', textAlign: 'center', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${feedback.color}15`, color: feedback.color, padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px' }}>
          <Sparkles size={16} /> Kết quả làm bài thi
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-1px', marginBottom: '6px' }}>
          <span style={{ color: feedback.color }}>{score}</span> / {total_points}
        </h1>

        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: feedback.color, marginBottom: '8px' }}>
          {feedback.title} ({percentage}%)
        </div>

        <p style={{ color: '#64748B', maxWidth: '520px', margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
          {feedback.desc}
        </p>

        {/* Quick stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '600px', margin: '0 auto 28px auto' }}>
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Số câu đúng</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>{correct_count} / {total_questions}</div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Thời gian làm</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>{formatTime(time_spent_seconds)}</div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Câu làm sai</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444' }}>{total_questions - correct_count} câu</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { if (onRetake) onRetake(); else navigate(`/luyen-de/${effectiveExam.id}`); }}
            className="btn btn-primary"
          >
            <RotateCcw size={16} /> Làm lại đề này
          </button>

          <button 
            onClick={() => { if (onGoToMistakes) onGoToMistakes(); else navigate('/so-cau-sai'); }}
            className="btn btn-accent"
          >
            <BookMarked size={16} /> Mở Sổ tay câu sai
          </button>
        </div>

      </div>

      {/* Review Section Header & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
            Chi Tiết Lời Giải Từng Câu
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Đối chiếu câu trả lời của bạn với đáp án chuẩn và lời giải phương pháp
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn btn-sm ${filterView === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterView('all')}
          >
            Tất cả ({question_results.length})
          </button>
          <button 
            className={`btn btn-sm ${filterView === 'wrong' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterView('wrong')}
          >
            Câu sai ({question_results.filter(q => !q.is_correct).length})
          </button>
          <button 
            className={`btn btn-sm ${filterView === 'correct' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterView('correct')}
          >
            Câu đúng ({question_results.filter(q => q.is_correct).length})
          </button>
        </div>
      </div>

      {/* Question Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredQuestions.map(item => (
          <div 
            key={item.question_id}
            className="card"
            style={{ 
              borderLeft: `5px solid ${item.is_correct ? '#10B981' : '#EF4444'}`,
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  background: item.is_correct ? '#ECFDF5' : '#FEF2F2',
                  color: item.is_correct ? '#065F46' : '#991B1B',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  Câu {item.question_number}
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                  {item.topic || 'Chuyên đề'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.is_correct ? '#10B981' : '#EF4444' }}>
                  {item.earned_points} / {item.points} điểm
                </span>
                {item.is_correct ? (
                  <CheckCircle size={20} color="#10B981" />
                ) : (
                  <XCircle size={20} color="#EF4444" />
                )}
              </div>
            </div>

            {/* Question Content */}
            <div style={{ fontSize: '1rem', color: '#0F172A', lineHeight: '1.6', marginBottom: '14px' }}>
              <MathText text={item.content} />
            </div>

            {/* Question Illustration Image (if available) */}
            {item.image_url && (
              <div style={{ margin: '14px 0', textAlign: 'center' }}>
                <img 
                  src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`} 
                  alt={`Hình minh họa câu ${item.question_number}`} 
                  style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '10px', border: '1px solid #E2E8F0', objectFit: 'contain', background: 'white', padding: '6px' }} 
                />
              </div>
            )}

            {/* Answer breakdown by Part Type */}
            {item.part_type === 'part_1_choice' && (
              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', display: 'flex', gap: '24px' }}>
                <div>
                  <strong>Bạn chọn:</strong>{' '}
                  <span style={{ color: item.is_correct ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                    {item.user_answer || 'Chưa trả lời'}
                  </span>
                </div>
                <div>
                  <strong>Đáp án đúng:</strong>{' '}
                  <span style={{ color: '#10B981', fontWeight: 700 }}>
                    {item.correct_answer.answer}
                  </span>
                </div>
              </div>
            )}

            {item.part_type === 'part_2_true_false' && item.sub_results && (
              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '8px', color: '#334155' }}>
                  Chi tiết từng ý (Đúng / Sai):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  {['a', 'b', 'c', 'd'].map(k => {
                    const sub = item.sub_results[k];
                    return (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{k})</span>
                        <span>Chọn: <strong>{sub.user === true ? 'Đúng' : sub.user === false ? 'Sai' : 'Chưa chọn'}</strong></span>
                        <span style={{ color: sub.match ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                          {sub.match ? '✓' : `✗ (Đáp án: ${sub.correct ? 'Đ' : 'S'})`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {item.part_type === 'part_3_short_answer' && (
              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', display: 'flex', gap: '24px' }}>
                <div>
                  <strong>Đáp số bạn điền:</strong>{' '}
                  <span style={{ color: item.is_correct ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                    {item.user_answer || 'Chưa điền'}
                  </span>
                </div>
                <div>
                  <strong>Đáp số chính xác:</strong>{' '}
                  <span style={{ color: '#10B981', fontWeight: 700 }}>
                    {item.correct_answer.answer}
                  </span>
                </div>
              </div>
            )}

            {/* Explanation with KaTeX */}
            <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontWeight: 700, color: '#1D4ED8', marginBottom: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={16} color="#2563EB" /> Hướng dẫn giải chi tiết:
              </div>
              <div style={{ fontSize: '0.925rem', color: '#1E293B', lineHeight: '1.7' }}>
                <MathText text={item.explanation} />
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
