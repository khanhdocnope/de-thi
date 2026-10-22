import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Bookmark, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Trash2, 
  Check, 
  RotateCcw, 
  Sparkles, 
  BookOpen,
  Lightbulb
} from 'lucide-react';
import MathText from '../components/MathText';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function DashboardPage({ user, defaultTab = 'overview', onStartExam }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab); // 'overview' or 'mistakes'
  const [analytics, setAnalytics] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mistakeSubjectFilter, setMistakeSubjectFilter] = useState('all');
  const [mistakePage, setMistakePage] = useState(1);
  const MISTAKES_PER_PAGE = 3;

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const userId = user ? user.id : 1;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [anaData, misData] = await Promise.all([
          api.getUserAnalytics(userId),
          api.getUserMistakes(userId)
        ]);
        setAnalytics(anaData);
        setMistakes(misData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const handleResolveMistake = async (mistakeId) => {
    try {
      await api.resolveMistake(mistakeId);
      setMistakes(prev => prev.filter(m => m.id !== mistakeId));
      toast.success('Đã ghi nhận bạn đã nắm vững phương pháp giải câu hỏi này!', 'Tuyệt vời!');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi lưu trạng thái.');
    }
  };

  const filteredMistakes = mistakes.filter(m => {
    if (mistakeSubjectFilter === 'all') return true;
    return m.subject_color === mistakeSubjectFilter || m.subject_name.toLowerCase().includes(mistakeSubjectFilter.toLowerCase());
  });

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom: '6px' }}>Theo Dõi Năng Lực Học Tập</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
            Bảng Phân Tích & Sổ Tay Câu Sai
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Học sinh: <strong>{user ? user.name : 'Nguyễn Văn An'}</strong> • Mục tiêu: <strong>Khối {user ? user.target_block : 'A00'}</strong>
          </p>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '6px', borderRadius: '12px' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('overview');
              navigate('/thong-ke');
            }}
            style={{ border: 'none' }}
          >
            <BarChart3 size={16} /> Tổng Quan Điểm Số
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'mistakes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('mistakes');
              navigate('/so-cau-sai');
            }}
            style={{ border: 'none' }}
          >
            <Bookmark size={16} /> Sổ Tay Câu Sai ({mistakes.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          Đang tổng hợp dữ liệu học tập...
        </div>
      ) : activeTab === 'overview' ? (
        <div>
          
          {/* Stat Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Điểm Trung Bình</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>
                  {analytics?.summary?.avg_score || 0} / 10
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Điểm Cao Nhất</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981' }}>
                  {analytics?.summary?.max_score || 0} / 10
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Số Đề Đã Luyện</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>
                  {analytics?.summary?.total_exams || 0} đề
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Câu Sai Cần Khắc Phục</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#EF4444' }}>
                  {analytics?.summary?.unresolved_mistakes || 0} câu
                </div>
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
            
            {/* Topic Strength / Weakness Radar Analysis */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#2563EB" /> Đánh Giá Năng Lực Theo Chuyên Đề
              </h3>

              {analytics?.topic_stats?.length === 0 ? (
                <div style={{ color: '#64748B', fontSize: '0.9rem', padding: '20px 0', textAlign: 'center' }}>
                  Hãy làm ít nhất một đề thi để xem phân tích chuyên đề mạnh/yếu!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {analytics?.topic_stats?.map(t => (
                    <div key={t.topic}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
                        <span style={{ fontWeight: 600, color: '#1E293B' }}>{t.topic}</span>
                        <span style={{ fontWeight: 700, color: t.status === 'strong' ? '#10B981' : t.status === 'medium' ? '#F59E0B' : '#EF4444' }}>
                          {t.correct} / {t.total} ({t.accuracy_rate}%) • {t.status === 'strong' ? 'Vững chắc' : t.status === 'medium' ? 'Khá' : 'Cần ôn thêm'}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${t.accuracy_rate}%`, 
                          height: '100%', 
                          background: t.status === 'strong' ? '#10B981' : t.status === 'medium' ? '#F59E0B' : '#EF4444',
                          borderRadius: '999px'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Exam Submissions */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#8B5CF6" /> Lịch Sử Luyện Thi Gần Đây
              </h3>

              {analytics?.recent_submissions?.length === 0 ? (
                <div style={{ color: '#64748B', fontSize: '0.9rem', padding: '20px 0', textAlign: 'center' }}>
                  Chưa có bài thi nào được ghi nhận. Hãy bắt đầu ngay với một đề thi thử nhé!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analytics?.recent_submissions?.map(sub => (
                    <div 
                      key={sub.id}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: '#F8FAFC',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                          {sub.exam_title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          Môn {sub.subject_name} • {Math.round(sub.time_spent_seconds / 60)} phút • {new Date(sub.completed_at).toLocaleDateString('vi-VN')}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          fontWeight: 800, 
                          fontSize: '1.15rem', 
                          color: sub.score >= 8 ? '#10B981' : sub.score >= 5 ? '#2563EB' : '#EF4444' 
                        }}>
                          {sub.score} / {sub.total_score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* Mistake Notebook Tab */
        <div>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Bookmark size={24} color="#B45309" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem', color: '#78350F' }}>
              <strong>Sổ tay câu sai thông minh:</strong> Nơi tự động lưu lại những câu hỏi bạn đã trả lời chưa chính xác trong các đề thi. Hãy làm lại và bấm <em>"Đánh dấu đã hiểu"</em> khi bạn đã thực sự nắm vững phương pháp giải!
            </div>
          </div>

          {filteredMistakes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
              <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
                Tuyệt Vời! Không Có Câu Sai Nào Cần Khắc Phục
              </h3>
              <p style={{ marginTop: '6px' }}>
                Bạn đã giải quyết sạch sẽ các câu làm sai hoặc chưa làm sai câu nào. Hãy tiếp tục thử sức với các đề thi mới nhé!
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                {filteredMistakes.slice((mistakePage - 1) * MISTAKES_PER_PAGE, mistakePage * MISTAKES_PER_PAGE).map(m => (
                  <div key={m.id} className="card" style={{ borderLeft: '4px solid #EF4444', padding: '24px' }}>
                    
                    {/* Top metadata of mistake */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-purple">{m.subject_name}</span>
                        <span className="badge badge-blue">Câu {m.question_number}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                          Đề: {m.exam_title}
                        </span>
                      </div>

                      <button 
                        onClick={() => handleResolveMistake(m.id)}
                        className="btn btn-success btn-sm"
                      >
                        <Check size={14} /> Đánh dấu đã hiểu
                      </button>
                    </div>

                    {/* Question content */}
                    <div style={{ fontSize: '1rem', color: '#0F172A', lineHeight: '1.6', marginBottom: '16px' }}>
                      <MathText text={m.content} />
                    </div>

                    {/* Question Illustration Image (if available) */}
                    {m.image_url && (
                      <div style={{ margin: '14px 0', textAlign: 'center' }}>
                        <img 
                          src={m.image_url.startsWith('http') ? m.image_url : `http://localhost:5000${m.image_url}`} 
                          alt={`Hình minh họa câu ${m.question_number}`} 
                          style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '10px', border: '1px solid #E2E8F0', objectFit: 'contain', background: 'white', padding: '6px' }} 
                        />
                      </div>
                    )}

                    {/* Explanation and Solution */}
                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '16px', borderRadius: '10px' }}>
                      <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '0.875rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lightbulb size={16} color="#2563EB" /> Hướng dẫn phương pháp giải:
                      </div>
                      <div style={{ fontSize: '0.925rem', color: '#1E293B', lineHeight: '1.7' }}>
                        <MathText text={m.explanation} />
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Mistake Pagination Controls */}
              {Math.ceil(filteredMistakes.length / MISTAKES_PER_PAGE) > 1 && (
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                    Hiển thị <strong>{((mistakePage - 1) * MISTAKES_PER_PAGE) + 1} - {Math.min(mistakePage * MISTAKES_PER_PAGE, filteredMistakes.length)}</strong> trên tổng <strong>{filteredMistakes.length}</strong> câu hỏi cần khắc phục
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      disabled={mistakePage === 1}
                      onClick={() => { setMistakePage(p => p - 1); window.scrollTo({ top: 100, behavior: 'smooth' }); }}
                      className="btn btn-secondary btn-sm"
                    >
                      Trang trước
                    </button>
                    {Array.from({ length: Math.ceil(filteredMistakes.length / MISTAKES_PER_PAGE) }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setMistakePage(idx + 1); window.scrollTo({ top: 100, behavior: 'smooth' }); }}
                        className={`btn btn-sm ${mistakePage === idx + 1 ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ minWidth: '34px' }}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button 
                      disabled={mistakePage >= Math.ceil(filteredMistakes.length / MISTAKES_PER_PAGE)}
                      onClick={() => { setMistakePage(p => p + 1); window.scrollTo({ top: 100, behavior: 'smooth' }); }}
                      className="btn btn-secondary btn-sm"
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

    </div>
  );
}
