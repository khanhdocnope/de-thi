import React from 'react';
import { GraduationCap, Heart, Sparkles, BookCheck, Shield, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '48px 0 24px 0', marginTop: '64px', borderTop: '1px solid #1E293B' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', marginBottom: '14px' }}>
              <div style={{ background: '#2563EB', padding: '8px', borderRadius: '8px' }}>
                <GraduationCap size={20} color="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'white' }}>
                Edu<span style={{ color: '#60A5FA' }}>Prep</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#94A3B8' }}>
              Hệ thống ôn luyện kiến thức trực quan, bám sát cấu trúc đề thi Tốt nghiệp THPT và kỳ thi Đánh giá năng lực của Bộ Giáo dục & Đào tạo.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>
              Tính Năng Trọng Tâm
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#60A5FA" /> Luyện đề chuẩn Format 2025 (3 phần)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#34D399" /> Chế độ thi thử bấm giờ tự động
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookCheck size={16} color="#FBBF24" /> Giải thích chi tiết với công thức KaTeX
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={16} color="#818CF8" /> Cây lý thuyết & Mini-quiz củng cố
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="#F87171" /> Sổ tay câu sai & Phân tích điểm yếu
              </li>
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>
              Môn Học Ôn Tập
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Toán Học', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Tiếng Anh', 'Lịch Sử', 'Địa Lý'].map(s => (
                <span key={s} style={{ background: '#1E293B', color: '#E2E8F0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Target blocks */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>
              Tổ Hợp Khối Thi
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '12px' }}>
              Hỗ trợ đầy đủ các khối thi đại học hàng đầu: A00, A01, B00, C00, D01, D07...
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontSize: '0.85rem' }}>
              <Sparkles size={16} /> Đồng hành 24/7 cùng sĩ tử 2k7 & 2k8
            </div>
          </div>

        </div>

        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem' }}>
          <div>
            © {new Date().getFullYear()} EduPrep THPTQG. Phát triển với đam mê phục vụ giáo dục Việt Nam.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Thiết kế giao diện hiện đại & trực quan
          </div>
        </div>
      </div>
    </footer>
  );
}
