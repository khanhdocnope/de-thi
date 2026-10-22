import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  Mail,
  Lock,
  User,
  Target
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AuthPage({ initialMode = 'login', onAuthSuccess, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const isRegisterPath = location.pathname === '/register' || initialMode === 'register';
  const [isLogin, setIsLogin] = useState(!isRegisterPath);

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  // If already logged in, redirect to home or previous page
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetBlock, setTargetBlock] = useState('A00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(email, password);
        localStorage.setItem('eduprep_token', data.token);
        if (onAuthSuccess) onAuthSuccess(data.user);
        toast.success(`Chào mừng ${data.user.name} đã quay trở lại!`, 'Đăng nhập thành công');
        navigate(-1); // Quay lại trang trước hoặc trang chủ
      } else {
        const data = await api.register(name, email, password, targetBlock);
        localStorage.setItem('eduprep_token', data.token);
        if (onAuthSuccess) onAuthSuccess(data.user);
        toast.success(`Chào mừng bạn gia nhập EduPrep!`, 'Đăng ký thành công');
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
      toast.error(err.message || 'Lỗi xác thực tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (type) => {
    if (type === 'student') {
      setEmail('hocsinh@eduprep.vn');
      setPassword('123456');
    } else if (type === 'teacher') {
      setEmail('thayco@eduprep.vn');
      setPassword('123456');
    } else {
      setEmail('admin@eduprep.vn');
      setPassword('admin123');
    }
    setIsLogin(true);
    toast.info('Đã tự động điền tài khoản mẫu. Nhấn Đăng Nhập để trải nghiệm!', '1-Click Demo');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: '#F8FAFC' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        
        {/* Back Link */}
        <Link 
          to="/" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748B', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, marginBottom: '20px' }}
        >
          <ArrowLeft size={16} /> Quay lại trang chủ
        </Link>

        {/* Main Auth Card */}
        <div className="card glass-panel" style={{ padding: '36px 28px', borderRadius: '20px', borderTop: '4px solid #2563EB' }}>
          
          {/* Logo & Heading */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: '12px',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
            }}>
              <GraduationCap size={28} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              {isLogin ? 'Đăng Nhập EduPrep' : 'Đăng Ký Thành Viên'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              {isLogin 
                ? 'Luyện thi chuẩn cấu trúc THPT 2025+ và theo dõi tiến độ cá nhân' 
                : 'Bắt đầu hành trình bứt phá điểm số thi Tốt nghiệp THPT & Đại học'}
            </p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div style={{ background: '#F1F5F9', padding: '14px', borderRadius: '12px', marginBottom: '24px', border: '1px dashed #CBD5E1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
              <Sparkles size={14} color="#2563EB" /> Đăng nhập nhanh tài khoản mẫu:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo('student')}
                style={{ fontSize: '0.75rem', padding: '6px 4px', background: 'white' }}
              >
                🎓 Học sinh
              </button>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo('teacher')}
                style={{ fontSize: '0.75rem', padding: '6px 4px', background: 'white', color: '#7C3AED' }}
              >
                ✨ Thầy cô
              </button>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo('admin')}
                style={{ fontSize: '0.75rem', padding: '6px 4px', background: 'white', color: '#D97706' }}
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Name & Target Block (Register Only) */}
            {!isLogin && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Họ và tên
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      className="input-control"
                      placeholder="Nguyễn Văn An"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      style={{ paddingLeft: '38px' }}
                    />
                    <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Khối thi mục tiêu
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="input-control"
                      value={targetBlock}
                      onChange={e => setTargetBlock(e.target.value)}
                      style={{ paddingLeft: '38px' }}
                    >
                      <option value="A00">Khối A00 (Toán - Lý - Hóa)</option>
                      <option value="A01">Khối A01 (Toán - Lý - Anh)</option>
                      <option value="B00">Khối B00 (Toán - Hóa - Sinh)</option>
                      <option value="D01">Khối D01 (Toán - Văn - Anh)</option>
                      <option value="C00">Khối C00 (Văn - Sử - Địa)</option>
                    </select>
                    <Target size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email"
                  className="input-control"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '38px' }}
                />
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password"
                  className="input-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '38px' }}
                />
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: '8px', width: '100%', fontWeight: 700 }}
            >
              {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản')}
            </button>

          </form>

          {/* Toggle Login / Register */}
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
            {isLogin ? (
              <span>
                Chưa có tài khoản?{' '}
                <Link 
                  to="/register"
                  onClick={() => setIsLogin(false)}
                  style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}
                >
                  Đăng ký ngay
                </Link>
              </span>
            ) : (
              <span>
                Đã có tài khoản?{' '}
                <Link 
                  to="/login"
                  onClick={() => setIsLogin(true)}
                  style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}
                >
                  Đăng nhập tại đây
                </Link>
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
