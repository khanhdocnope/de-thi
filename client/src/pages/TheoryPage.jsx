import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  ArrowRight, 
  ChevronRight,
  Calculator,
  Zap,
  FlaskConical,
  Languages,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import MathText from '../components/MathText';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function TheoryPage({ selectedSubject = 'math', user }) {
  const { toast } = useToast();
  const params = useParams();
  const navigate = useNavigate();

  const effectiveSubject = params.subject || selectedSubject || 'math';
  const [subjects, setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(effectiveSubject);
  const [theories, setTheories] = useState([]);
  const [activeTheoryId, setActiveTheoryId] = useState(null);
  const [currentTheory, setCurrentTheory] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeSection, setActiveSection] = useState('theory'); // 'theory', 'formulas', 'quiz'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.subject && params.subject !== currentSubject) {
      setCurrentSubject(params.subject);
    }
  }, [params.subject]);

  // Load subjects and theories
  useEffect(() => {
    async function loadInitial() {
      try {
        const subData = await api.getSubjects();
        setSubjects(subData || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    async function loadTheories() {
      setLoading(true);
      try {
        const list = await api.getTheories(currentSubject);
        setTheories(list || []);
        if (list && list.length > 0) {
          setActiveTheoryId(list[0].id);
        } else {
          setActiveTheoryId(null);
          setCurrentTheory(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTheories();
  }, [currentSubject]);

  // Load detail of active theory
  useEffect(() => {
    if (!activeTheoryId) return;
    async function loadDetail() {
      try {
        const data = await api.getTheoryDetail(activeTheoryId);
        setCurrentTheory(data.theory);
        setQuizzes(data.quizzes || []);
        setQuizAnswers({});
        setQuizResults(null);
      } catch (err) {
        console.error(err);
      }
    }
    loadDetail();
  }, [activeTheoryId]);

  const handleSelectQuizOption = (quizId, optId) => {
    setQuizAnswers(prev => ({
      ...prev,
      [quizId]: optId
    }));
  };

  const handleCheckQuiz = async () => {
    if (Object.keys(quizAnswers).length === 0) {
      toast.warning('Vui lòng chọn câu trả lời trước khi kiểm tra!');
      return;
    }
    try {
      const res = await api.checkTheoryQuiz(activeTheoryId, quizAnswers);
      setQuizResults(res);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi kiểm tra kết quả.');
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await api.toggleBookmark(user ? user.id : 1, activeTheoryId, 'theory');
      setBookmarked(res.bookmarked);
      toast.success(res.message);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi lưu bài học.');
    }
  };

  const [selectedGrade, setSelectedGrade] = useState('all'); // 'all', '10', '11', '12'

  // Group theories by chapter with grade filter
  const chapters = {};
  const filteredTheories = theories.filter(t => {
    if (selectedGrade === 'all') return true;
    return t.chapter_title.includes(`Lớp ${selectedGrade}`) || t.chapter_title.includes(`${selectedGrade}`);
  });

  filteredTheories.forEach(t => {
    if (!chapters[t.chapter_title]) {
      chapters[t.chapter_title] = [];
    }
    chapters[t.chapter_title].push(t);
  });

  // Ensure active theory is visible when grade filter changes
  useEffect(() => {
    if (filteredTheories.length > 0) {
      const exists = filteredTheories.some(t => t.id === activeTheoryId);
      if (!exists) {
        setActiveTheoryId(filteredTheories[0].id);
      }
    }
  }, [selectedGrade, theories]);

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '6px' }}>Thư Viện Lý Thuyết Trọng Tâm</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
            Hệ Thống Kiến Thức THPT Quốc Gia
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Tóm tắt cô đọng các định lý, công thức KaTeX và câu hỏi củng cố nhanh sau mỗi bài học.
          </p>
        </div>

        {/* Subject selector tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {subjects.map(s => (
            <button
              key={s.id}
              className={`btn btn-sm ${currentSubject === s.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setCurrentSubject(s.id);
                navigate(`/ly-thuyet/${s.id}`);
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Sidebar Tree + Content Reader */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Sidebar: Topic Tree */}
        <div className="card" style={{ padding: '20px', position: 'sticky', top: '90px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="#2563EB" /> Cây Chuyên Đề
          </h3>

          {/* Grade filter buttons */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
            {['all', '10', '11', '12'].map(g => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`btn btn-sm ${selectedGrade === g ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '4px 6px', fontSize: '0.75rem', border: 'none', borderRadius: '6px' }}
              >
                {g === 'all' ? 'Tất cả' : `Lớp ${g}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ color: '#64748B', fontSize: '0.85rem' }}>Đang nạp bài học...</div>
          ) : theories.length === 0 ? (
            <div style={{ color: '#64748B', fontSize: '0.85rem' }}>Chưa có bài học cho môn này.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.keys(chapters).map((chapter, cIdx) => (
                <div key={chapter}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.3px' }}>
                    {chapter}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {chapters[chapter].map(t => {
                      const isActive = t.id === activeTheoryId;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setActiveTheoryId(t.id)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            background: isActive ? '#EFF6FF' : 'transparent',
                            borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                            color: isActive ? '#1D4ED8' : '#334155',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s'
                          }}
                        >
                          <span style={{ lineHeight: '1.4' }}>{t.topic_title}</span>
                          {t.quiz_count > 0 && (
                            <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                              {t.quiz_count} quiz
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Area: Theory Content & Mini-Quiz */}
        <div>
          {currentTheory ? (
            <div className="card" style={{ padding: '36px' }}>
              
              {/* Header of lesson */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>
                    {currentTheory.chapter_title}
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
                    {currentTheory.topic_title}
                  </h2>
                </div>

                <button 
                  onClick={handleToggleBookmark}
                  className={`btn btn-sm ${bookmarked ? 'btn-accent' : 'btn-secondary'}`}
                  title="Lưu lại vào sổ tay kiến thức"
                >
                  <Bookmark size={16} />
                  {bookmarked ? 'Đã lưu' : 'Lưu bài'}
                </button>
              </div>

              {/* Sub-page Navigation Tabs for interactive bite-sized learning */}
              <div style={{ display: 'flex', gap: '8px', background: '#F8FAFC', padding: '6px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '28px' }}>
                <button
                  type="button"
                  onClick={() => setActiveSection('theory')}
                  className={`btn btn-sm ${activeSection === 'theory' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <BookOpen size={16} /> 1. Lý Thuyết Chi Tiết
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('formulas')}
                  className={`btn btn-sm ${activeSection === 'formulas' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Sparkles size={16} /> 2. Sổ Tay Công Thức
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('quiz')}
                  className={`btn btn-sm ${activeSection === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Target size={16} /> 3. Mini-Quiz ({quizzes.length})
                </button>
              </div>

              {/* TAB 1: THEORY BODY */}
              {activeSection === 'theory' && (
                <div>
                  {/* Key summary callout box */}
                  {currentTheory.summary && (
                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '18px 20px', marginBottom: '28px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <Lightbulb size={24} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#1D4ED8', fontSize: '0.95rem', marginBottom: '4px' }}>
                          Trọng tâm ghi nhớ:
                        </strong>
                        <div style={{ fontSize: '0.925rem', color: '#1E293B', lineHeight: '1.6' }}>
                          {currentTheory.summary}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Markdown & Math Content */}
                  <div style={{ fontSize: '1rem', lineHeight: '1.8', color: '#334155', marginBottom: '36px' }}>
                    <MathText text={currentTheory.content_markdown} />
                  </div>

                  {/* Continue step button */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setActiveSection('formulas'); window.scrollTo({ top: 120, behavior: 'smooth' }); }}
                      className="btn btn-primary"
                    >
                      Tiếp tục: Xem Sổ Tay Công Thức <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: FORMULAS SHEET */}
              {activeSection === 'formulas' && (
                <div>
                  <div style={{ background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: '14px', padding: '24px', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 800, color: '#6D28D9', fontSize: '1.1rem' }}>
                      <Sparkles size={20} color="#8B5CF6" /> Sổ Tay Công Thức Vàng Cần Thuộc Lòng
                    </div>
                    
                    <div style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <MathText text={currentTheory.key_formulas || 'Đang cập nhật công thức...'} />
                    </div>
                  </div>

                  {/* Step navigation buttons */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      onClick={() => setActiveSection('theory')}
                      className="btn btn-secondary"
                    >
                      <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Quay lại Bài học
                    </button>

                    <button
                      onClick={() => { setActiveSection('quiz'); window.scrollTo({ top: 120, behavior: 'smooth' }); }}
                      className="btn btn-primary"
                    >
                      Tiếp tục: Làm Mini-Quiz <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: MINI QUIZ */}
              {activeSection === 'quiz' && (
                <div>
                  {quizzes.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Target size={22} color="#2563EB" /> Mini-Quiz Tự Kiểm Tra (3-5 phút)
                          </h3>
                          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                            Làm nhanh câu hỏi củng cố để khắc sâu kiến thức vừa học
                          </p>
                        </div>

                        {quizResults && (
                          <span className={`badge ${quizResults.percentage >= 80 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                            Điểm đạt: {quizResults.correct_count} / {quizResults.total} ({quizResults.percentage}%)
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
                        {quizzes.map((quiz, qIdx) => {
                          const res = quizResults ? quizResults.results.find(r => r.quiz_id === quiz.id) : null;

                          return (
                            <div 
                              key={quiz.id}
                              style={{ 
                                background: '#F8FAFC', 
                                border: `1.5px solid ${res ? (res.is_correct ? '#10B981' : '#EF4444') : '#E2E8F0'}`, 
                                borderRadius: '12px', 
                                padding: '20px' 
                              }}
                            >
                              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                                <span>Câu {qIdx + 1}:</span>
                                <div style={{ flex: 1 }}>
                                  <MathText text={quiz.question} />
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {quiz.options.map(opt => {
                                  const isSelected = quizAnswers[quiz.id] === opt.id;
                                  let border = '#CBD5E1';
                                  let bg = 'white';

                                  if (isSelected) {
                                    border = '#2563EB';
                                    bg = '#EFF6FF';
                                  }

                                  if (res) {
                                    if (opt.id === res.correct_answer) {
                                      border = '#10B981';
                                      bg = '#ECFDF5';
                                    } else if (isSelected && !res.is_correct) {
                                      border = '#EF4444';
                                      bg = '#FEF2F2';
                                    }
                                  }

                                  return (
                                    <div
                                      key={opt.id}
                                      onClick={() => !quizResults && handleSelectQuizOption(quiz.id, opt.id)}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: `1.5px solid ${border}`,
                                        background: bg,
                                        cursor: quizResults ? 'default' : 'pointer',
                                        fontSize: '0.9rem'
                                      }}
                                    >
                                      <span style={{ fontWeight: 700, width: '24px', height: '24px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                        {opt.id}
                                      </span>
                                      <div style={{ flex: 1 }}>
                                        <MathText text={opt.text} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation if checked */}
                              {res && (
                                <div style={{ marginTop: '12px', padding: '10px 14px', background: 'white', borderRadius: '8px', fontSize: '0.875rem', color: '#1E293B', borderLeft: `3px solid ${res.is_correct ? '#10B981' : '#EF4444'}` }}>
                                  <strong>Giải thích:</strong> <MathText text={res.explanation} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                        <button
                          onClick={() => setActiveSection('formulas')}
                          className="btn btn-secondary"
                        >
                          <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Xem lại Công thức
                        </button>

                        {!quizResults ? (
                          <button 
                            onClick={handleCheckQuiz}
                            className="btn btn-primary"
                          >
                            <CheckCircle2 size={18} /> Kiểm Tra Đáp Án Mini-Quiz
                          </button>
                        ) : (
                          <button 
                            onClick={() => { setQuizResults(null); setQuizAnswers({}); }}
                            className="btn btn-secondary"
                          >
                            Làm lại Mini-quiz
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                      Chưa có câu hỏi Mini-quiz cho bài học này.
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '80px 20px', color: '#64748B' }}>
              Vui lòng chọn một bài học từ Cây chuyên đề bên trái để bắt đầu ôn tập.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
