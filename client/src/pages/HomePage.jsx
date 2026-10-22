import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  FileText, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Zap, 
  Calculator, 
  FlaskConical, 
  Languages, 
  Dna, 
  Globe, 
  Landmark,
  Lightbulb
} from 'lucide-react';
import { api } from '../services/api';
import MathText from '../components/MathText';

const subjectIconMap = {
  Calculator: Calculator,
  Zap: Zap,
  FlaskConical: FlaskConical,
  Languages: Languages,
  Dna: Dna,
  Globe: Globe,
  Landmark: Landmark
};

export default function HomePage({ setCurrentView, setSelectedSubject, onStartExam }) {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [featuredExams, setFeaturedExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [subData, examData] = await Promise.all([
          api.getSubjects(),
          api.getExams()
        ]);
        setSubjects(Array.isArray(subData) ? subData : []);
        setFeaturedExams(Array.isArray(examData) ? examData.slice(0, 3) : []);
      } catch (err) {
        console.error(err);
        setSubjects([]);
        setFeaturedExams([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectSubject = (subId) => {
    if (setSelectedSubject) setSelectedSubject(subId);
    if (setCurrentView) setCurrentView('exams');
    navigate('/luyen-de');
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-gradient" style={{ padding: 'clamp(40px, 6vw, 70px) 0 clamp(48px, 8vw, 80px) 0', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(24px, 4vw, 48px)', alignItems: 'center' }}>
            <div style={{ maxWidth: '640px' }}>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', marginBottom: '24px', backdropFilter: 'blur(8px)', maxWidth: '100%' }}>
                <Sparkles size={16} color="#60A5FA" style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Cập nhật cấu trúc đề thi THPT Quốc gia 2025 mới nhất</span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.85rem, 5vw, 2.8rem)', fontWeight: 800, lineHeight: '1.2', marginBottom: '20px', letterSpacing: '-0.5px' }}>
                Bứt Phá Điểm Số Thi Đại Học Với <span style={{ color: '#60A5FA' }}>EduPrep</span>
              </h1>

              <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#CBD5E1', lineHeight: '1.7', marginBottom: '36px' }}>
                Nền tảng luyện đề trực quan hỗ trợ cả <strong>Format mới 2025+ (3 phần chuẩn Bộ GD&ĐT)</strong> và trắc nghiệm truyền thống. Tích hợp giải thích chi tiết KaTeX, cây lý thuyết chuyên sâu và sổ tay gom câu làm sai thông minh.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <button 
                  onClick={() => {
                    if (setCurrentView) setCurrentView('exams');
                    navigate('/luyen-de');
                  }}
                  className="btn btn-primary btn-lg"
                  style={{ background: '#2563EB' }}
                >
                  Vào Phòng Luyện Đề <ArrowRight size={18} />
                </button>

                <button 
                  onClick={() => {
                    if (setCurrentView) setCurrentView('theory');
                    navigate('/ly-thuyet');
                  }}
                  className="btn btn-secondary btn-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                >
                  <BookOpen size={18} />
                  Học Lý Thuyết Chuyên Đề
                </button>
              </div>

              {/* Quick Metrics */}
              <div style={{ display: 'flex', gap: '32px', marginTop: '48px', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '28px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60A5FA' }}>100%</div>
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Bám sát ma trận Bộ GD</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399' }}>2 Chế Độ</div>
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Thi thử & Luyện tập tức thì</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FBBF24' }}>KaTeX</div>
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Hiển thị chuẩn công thức Toán - Lý</div>
                </div>
              </div>

            </div>

            {/* Generated Art Hero Illustration */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(59, 130, 246, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                maxWidth: '520px',
                width: '100%',
                background: 'rgba(15, 23, 42, 0.6)'
              }}>
                <img 
                  src="/hero-illustration.jpg" 
                  alt="EduPrep THPTQG - Luyện thi đại học trực quan" 
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Choose Subject Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px auto' }}>
            <span className="badge badge-blue" style={{ marginBottom: '10px' }}>Danh Mục Môn Học</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              Chọn Môn Thi Của Bạn
            </h2>
            <p style={{ color: '#64748B', marginTop: '8px' }}>
              Đầy đủ các môn trọng tâm cho các khối xét tuyển Đại học A00, A01, B00, C00, D01...
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {subjects.map(sub => {
              const IconComp = subjectIconMap[sub.icon] || BookOpen;
              return (
                <div 
                  key={sub.id} 
                  className="card"
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  onClick={() => handleSelectSubject(sub.id)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px', 
                        background: `${sub.color}15`, 
                        color: sub.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComp size={26} />
                      </div>
                      <span className="badge badge-purple">Khối 12</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      {sub.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.5', marginBottom: '16px' }}>
                      {sub.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '14px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>
                      {sub.exam_count || 1} Đề thi • {sub.theory_count || 1} Bài lý thuyết
                    </span>
                    <span style={{ color: '#2563EB', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Ôn ngay <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. 2025 Exam Structure Feature Callout */}
      <section style={{ background: '#F1F5F9', padding: '60px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
            
            <div>
              <span className="badge badge-green" style={{ marginBottom: '12px' }}>Cấu Trúc Đề Mới 2025</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: '1.3', marginBottom: '16px' }}>
                Hỗ Trợ Toàn Diện Format 3 Phần Chuẩn Bộ GD&ĐT
              </h2>
              <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '24px' }}>
                Từ năm 2025, kỳ thi tốt nghiệp THPT đổi mới toàn diện với 3 dạng thức câu hỏi. EduPrep xây dựng công cụ chấm điểm chính xác theo barem chuẩn:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '8px', borderRadius: '8px', fontWeight: 800 }}>I</div>
                  <div>
                    <strong style={{ display: 'block', color: '#0F172A' }}>Phần 1: Trắc nghiệm 4 lựa chọn (A, B, C, D)</strong>
                    <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Chọn 1 phương án đúng duy nhất, nền tảng cho nhận biết và thông hiểu.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#F5F3FF', color: '#8B5CF6', padding: '8px', borderRadius: '8px', fontWeight: 800 }}>II</div>
                  <div>
                    <strong style={{ display: 'block', color: '#0F172A' }}>Phần 2: Trắc nghiệm Đúng / Sai 4 ý (a, b, c, d)</strong>
                    <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Chấm điểm lũy tiến Bộ GD: đúng 1 ý = 0.1đ; 2 ý = 0.25đ; 3 ý = 0.5đ; 4 ý = 1.0đ.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#ECFDF5', color: '#10B981', padding: '8px', borderRadius: '8px', fontWeight: 800 }}>III</div>
                  <div>
                    <strong style={{ display: 'block', color: '#0F172A' }}>Phần 3: Trắc nghiệm Trả lời ngắn</strong>
                    <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Điền đáp số trực tiếp, triệt tiêu hoàn toàn khả năng khoanh lụi may rủi.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="card glass-panel" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>Mô phỏng Câu hỏi Phần II (Đúng/Sai)</div>
                <span className="badge badge-blue">Toán 2025</span>
              </div>

              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>
                <MathText text="Cho hàm số bậc ba $y = f(x) = x^3 - 3x^2 + 2$. Xét tính đúng/sai:" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="tf-subitem" style={{ margin: 0, padding: '10px 14px' }}>
                  <div style={{ fontSize: '0.875rem' }}>
                    <MathText text="a) Đạo hàm $f'(x) = 3x^2 - 6x$" />
                  </div>
                  <div className="tf-controls">
                    <button className="tf-btn active-true" style={{ cursor: 'default' }}>Đúng</button>
                    <button className="tf-btn" style={{ cursor: 'default' }}>Sai</button>
                  </div>
                </div>

                <div className="tf-subitem" style={{ margin: 0, padding: '10px 14px' }}>
                  <div style={{ fontSize: '0.875rem' }}>
                    <MathText text="b) Hàm số đồng biến trên $(0; 2)$" />
                  </div>
                  <div className="tf-controls">
                    <button className="tf-btn" style={{ cursor: 'default' }}>Đúng</button>
                    <button className="tf-btn active-false" style={{ cursor: 'default' }}>Sai</button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px', background: '#EFF6FF', borderRadius: '8px', fontSize: '0.825rem', color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> Bấm nộp bài để xem ngay lời giải và đối chiếu kết quả!
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Featured Exams */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>
                Đề Thi Nổi Bật Được Luyện Nhiều Nhất
              </h2>
              <p style={{ color: '#64748B' }}>Các đề chuẩn minh họa mới nhất năm học 2024 - 2025</p>
            </div>

            <button 
              onClick={() => {
                if (setCurrentView) setCurrentView('exams');
                navigate('/luyen-de');
              }}
              className="btn btn-outline btn-sm"
            >
              Xem tất cả đề thi <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {featuredExams.map(ex => (
              <div key={ex.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span className="badge badge-purple">{ex.subject_name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {ex.duration_minutes} phút
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '10px', lineHeight: '1.4' }}>
                    {ex.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.6', marginBottom: '20px' }}>
                    {ex.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                  <button 
                    onClick={() => onStartExam(ex.id, 'exam')}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Clock size={14} /> Thi Thử
                  </button>
                  <button 
                    onClick={() => onStartExam(ex.id, 'practice')}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Lightbulb size={14} /> Luyện Tập
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
