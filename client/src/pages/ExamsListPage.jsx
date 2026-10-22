import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock, 
  FileCheck, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  Lightbulb
} from 'lucide-react';
import { api } from '../services/api';

export default function ExamsListPage({ selectedSubject, setSelectedSubject, onStartExam }) {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const EXAMS_PER_PAGE = 6;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [subList, examList] = await Promise.all([
          api.getSubjects(),
          api.getExams({ subject_id: selectedSubject })
        ]);
        setSubjects(subList || []);
        setExams(examList || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedSubject]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, searchQuery, filterType]);

  const filteredExams = exams.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || ex.exam_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredExams.length / EXAMS_PER_PAGE);
  const currentExams = filteredExams.slice((currentPage - 1) * EXAMS_PER_PAGE, currentPage * EXAMS_PER_PAGE);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      
      {/* Header title */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-blue">Phòng Luyện Thi Chuẩn Hóa</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          Ngân Hàng Đề Thi Tốt Nghiệp THPT & Đại Học
        </h1>
        <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '6px' }}>
          Lựa chọn đề thi thử bấm giờ như trong phòng thi thật hoặc chế độ luyện tập có giải thích tức thì.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '30px', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Tìm kiếm đề thi..."
              className="input-control"
              style={{ paddingLeft: '38px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Subject Filter Dropdown */}
          <div>
            <select 
              className="input-control"
              value={selectedSubject || 'all'}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="all">Tất cả môn học</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Format Type Filter */}
          <div>
            <select 
              className="input-control"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả định dạng đề</option>
              <option value="thpt_2025">Cấu trúc mới 2025 (3 phần)</option>
              <option value="standard">Trắc nghiệm truyền thống</option>
            </select>
          </div>

        </div>

        {/* Quick Subject Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
          <button 
            className={`btn btn-sm ${!selectedSubject || selectedSubject === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedSubject('all')}
          >
            Tất cả
          </button>
          {subjects.map(sub => (
            <button 
              key={sub.id}
              className={`btn btn-sm ${selectedSubject === sub.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedSubject(sub.id)}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          Đang tải danh sách đề thi...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <FileCheck size={48} style={{ margin: '0 auto 16px auto', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>Không tìm thấy đề thi phù hợp</h3>
          <p style={{ marginTop: '8px' }}>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            {currentExams.map(exam => {
              const isFormat2025 = exam.exam_type === 'thpt_2025';

              return (
                <div 
                  key={exam.id} 
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
                >
                  <div>
                    
                    {/* Subject and tags row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-blue">
                          {exam.subject_name}
                        </span>
                        {isFormat2025 && (
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                            <Sparkles size={12} /> Format 2025
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {exam.duration_minutes} phút
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', lineHeight: '1.4', marginBottom: '10px' }}>
                      {exam.title}
                    </h3>

                    {/* Description */}
                    <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.6', marginBottom: '20px' }}>
                      {exam.description || 'Đề thi bám sát chương trình Giáo dục phổ thông, có hướng dẫn giải chi tiết từng câu.'}
                    </p>

                    {/* Metadata Chips */}
                    <div style={{ display: 'flex', gap: '16px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.8rem', color: '#475569' }}>
                      <div>
                        <strong>Số câu:</strong> {exam.question_count || 8} câu
                      </div>
                      <div>
                        <strong>Thang điểm:</strong> {exam.total_points} điểm
                      </div>
                      <div>
                        <strong>Năm:</strong> {exam.year || 2025}
                      </div>
                    </div>

                  </div>

                  {/* Dual Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                    <button 
                      onClick={() => onStartExam ? onStartExam(exam.id, 'exam') : navigate(`/luyen-de/${exam.id}`)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <Clock size={16} /> Thi Thử
                    </button>

                    <button 
                      onClick={() => onStartExam ? onStartExam(exam.id, 'practice') : navigate(`/luyen-tap/${exam.id}`)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <Lightbulb size={16} /> Luyện Tập
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Hiển thị <strong>{((currentPage - 1) * EXAMS_PER_PAGE) + 1} - {Math.min(currentPage * EXAMS_PER_PAGE, filteredExams.length)}</strong> trên tổng số <strong>{filteredExams.length}</strong> đề thi
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 100, behavior: 'smooth' }); }}
                  className="btn btn-secondary btn-sm"
                >
                  Trang trước
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentPage(idx + 1); window.scrollTo({ top: 100, behavior: 'smooth' }); }}
                    className={`btn btn-sm ${currentPage === idx + 1 ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ minWidth: '34px' }}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 100, behavior: 'smooth' }); }}
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
  );
}
