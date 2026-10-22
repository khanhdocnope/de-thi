import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Bookmark, 
  BarChart3, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (path, requiresAuth = false) => {
    if (requiresAuth && !user) {
      navigate('/login');
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const isHomeActive = location.pathname === '/' || location.pathname === '/home';
  const isExamsActive = location.pathname.startsWith('/luyen-de') || location.pathname.startsWith('/exams') || location.pathname.startsWith('/thi') || location.pathname.startsWith('/ket-qua-thi');
  const isTheoryActive = location.pathname.startsWith('/ly-thuyet') || location.pathname.startsWith('/theory');
  const isMistakesActive = location.pathname === '/so-cau-sai' || location.pathname === '/mistakes';
  const isDashboardActive = location.pathname === '/thong-ke' || location.pathname === '/dashboard';
  const isAdminActive = location.pathname.startsWith('/quan-tri') || location.pathname.startsWith('/admin');

  return (
    <header className="glass-nav">
      <div className="container nav-container">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('/')} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
            flexShrink: 0
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', letterSpacing: '-0.5px' }}>
                Edu<span style={{ color: '#2563EB' }}>Prep</span>
              </span>
              <span className="badge badge-purple nav-badge-hide-mobile" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                THPT 2025+
              </span>
            </div>
            <span className="nav-brand-sub">
              Luyện thi Tốt nghiệp & Đại học
            </span>
          </div>
        </div>

        {/* Navigation Menu Links (Desktop) */}
        <nav className="nav-links-desktop">
          <button 
            className={`btn btn-sm ${isHomeActive ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleNavClick('/')}
            style={{ border: 'none' }}
          >
            Trang Chủ
          </button>

          <button 
            className={`btn btn-sm ${isExamsActive ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleNavClick('/luyen-de')}
            style={{ border: 'none' }}
          >
            <FileText size={16} />
            Luyện Đề
          </button>

          <button 
            className={`btn btn-sm ${isTheoryActive ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleNavClick('/ly-thuyet')}
            style={{ border: 'none' }}
          >
            <BookOpen size={16} />
            Lý Thuyết
          </button>

          <button 
            className={`btn btn-sm ${isMistakesActive ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleNavClick('/so-cau-sai', true)}
            style={{ border: 'none' }}
          >
            <Bookmark size={16} />
            Sổ Câu Sai
          </button>

          <button 
            className={`btn btn-sm ${isDashboardActive ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleNavClick('/thong-ke', true)}
            style={{ border: 'none' }}
          >
            <BarChart3 size={16} />
            Thống Kê
          </button>

          {/* Admin / Teacher portal link */}
          {user && (user.role === 'admin' || user.role === 'teacher') && (
            <button 
              className={`btn btn-sm ${isAdminActive ? 'btn-accent' : 'btn-secondary'}`}
              onClick={() => handleNavClick('/quan-tri')}
              style={{ border: 'none' }}
            >
              <ShieldCheck size={16} />
              {user.role === 'admin' ? 'Quản Trị' : 'Khu Vực Thầy Cô'}
            </button>
          )}
        </nav>

        {/* User Auth Info & Hamburger Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {user ? (
            <>
              {/* Desktop User Pill (Tự ẩn trên màn hình điện thoại) */}
              <div className="nav-user-pill">
                <div style={{ 
                  width: '26px', 
                  height: '26px', 
                  borderRadius: '50%', 
                  background: user.role === 'admin' ? '#F59E0B' : user.role === 'teacher' ? '#8B5CF6' : '#2563EB', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ 
                    fontWeight: 700, 
                    fontSize: '0.85rem', 
                    color: '#0F172A', 
                    maxWidth: '120px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {user.name}
                  </span>

                  <span 
                    className={`badge ${user.role === 'admin' ? 'badge-amber' : user.role === 'teacher' ? 'badge-purple' : 'badge-blue'}`} 
                    style={{ fontSize: '0.62rem', padding: '2px 6px', whiteSpace: 'nowrap' }}
                  >
                    {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Thầy Cô' : (user.target_block || 'Học Sinh')}
                  </span>
                </div>

                <button 
                  onClick={onLogout}
                  style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                  title="Đăng xuất"
                >
                  <LogOut size={15} />
                </button>
              </div>

              {/* Mobile Avatar Chip (Chỉ hiện avatar tròn 30px gọn gàng trên mobile) */}
              <div 
                className="nav-user-avatar-mobile" 
                onClick={() => setMobileMenuOpen(true)}
                title={user.name}
              >
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%', 
                  background: user.role === 'admin' ? '#F59E0B' : user.role === 'teacher' ? '#8B5CF6' : '#2563EB', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
            </>
          ) : (
            <button 
              onClick={() => handleNavClick('/login')}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogIn size={15} />
              <span>Đăng Nhập</span>
            </button>
          )}

          {/* Hamburger Button for Mobile / Small Screens */}
          <button 
            className="nav-hamburger-btn" 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer rendered directly into document.body via Portal */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div className="nav-drawer-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <div className="nav-drawer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={24} color="#2563EB" />
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
                  Edu<span style={{ color: '#2563EB' }}>Prep</span>
                </span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                aria-label="Đóng menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Menu List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <button 
                className={`btn ${isHomeActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleNavClick('/')}
                style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
              >
                Trang Chủ
              </button>

              <button 
                className={`btn ${isExamsActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleNavClick('/luyen-de')}
                style={{ justifyContent: 'flex-start', padding: '12px 16px', gap: '10px' }}
              >
                <FileText size={18} /> Luyện Đề
              </button>

              <button 
                className={`btn ${isTheoryActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleNavClick('/ly-thuyet')}
                style={{ justifyContent: 'flex-start', padding: '12px 16px', gap: '10px' }}
              >
                <BookOpen size={18} /> Lý Thuyết
              </button>

              <button 
                className={`btn ${isMistakesActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleNavClick('/so-cau-sai', true)}
                style={{ justifyContent: 'flex-start', padding: '12px 16px', gap: '10px' }}
              >
                <Bookmark size={18} /> Sổ Câu Sai
              </button>

              <button 
                className={`btn ${isDashboardActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleNavClick('/thong-ke', true)}
                style={{ justifyContent: 'flex-start', padding: '12px 16px', gap: '10px' }}
              >
                <BarChart3 size={18} /> Thống Kê
              </button>

              {user && (user.role === 'admin' || user.role === 'teacher') && (
                <button 
                  className={`btn ${isAdminActive ? 'btn-accent' : 'btn-secondary'}`}
                  onClick={() => handleNavClick('/quan-tri')}
                  style={{ justifyContent: 'flex-start', padding: '12px 16px', gap: '10px' }}
                >
                  <ShieldCheck size={18} />
                  {user.role === 'admin' ? 'Quản Trị Viên' : 'Khu Vực Thầy Cô'}
                </button>
              )}
            </div>

            {/* User Drawer Footer */}
            {user ? (
              <div style={{ paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{user.email}</div>
                </div>
                <button 
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="btn btn-secondary btn-sm"
                  title="Đăng xuất"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <button 
                  onClick={() => handleNavClick('/login')}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                >
                  <LogIn size={16} /> Đăng Nhập
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </header>
  );
}
