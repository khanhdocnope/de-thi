import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, CheckCircle2, GraduationCap, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, promptMessage = '' }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetBlock, setTargetBlock] = useState('A00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(email, password);
        localStorage.setItem('eduprep_token', data.token);
        onAuthSuccess(data.user);
        onClose();
      } else {
        const data = await api.register(name, email, password, targetBlock);
        localStorage.setItem('eduprep_token', data.token);
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
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
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
            {isLogin ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên'}
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Prompt message if required by action */}
        {promptMessage && (
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
            {promptMessage}
          </div>
        )}

        {/* Quick Demo Fill Buttons */}
        <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', marginBottom: '20px', border: '1px dashed #CBD5E1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
            <Sparkles size={14} color="#2563EB" /> Đăng nhập nhanh tài khoản mẫu:
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo('student')}
              style={{ flex: 1, minWidth: '95px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px 8px' }}
            >
              <GraduationCap size={14} color="#2563EB" /> Học sinh
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo('teacher')}
              style={{ flex: 1, minWidth: '95px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px 8px', background: '#F5F3FF', borderColor: '#DDD6FE', color: '#6D28D9' }}
            >
              <Sparkles size={14} color="#8B5CF6" /> Thầy cô (Mai)
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo('admin')}
              style={{ flex: 1, minWidth: '95px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px 8px', background: '#FFFBEB', borderColor: '#FDE68A', color: '#B45309' }}
            >
              <ShieldCheck size={14} color="#D97706" /> Admin
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isLogin && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Họ và tên học sinh
                </label>
                <input 
                  type="text"
                  required
                  className="input-control"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Khối thi mục tiêu
                </label>
                <select 
                  className="input-control"
                  value={targetBlock}
                  onChange={e => setTargetBlock(e.target.value)}
                >
                  <option value="A00">Khối A00 (Toán - Lý - Hóa)</option>
                  <option value="A01">Khối A01 (Toán - Lý - Tiếng Anh)</option>
                  <option value="B00">Khối B00 (Toán - Hóa - Sinh)</option>
                  <option value="C00">Khối C00 (Văn - Sử - Địa)</option>
                  <option value="D01">Khối D01 (Toán - Văn - Tiếng Anh)</option>
                  <option value="D07">Khối D07 (Toán - Hóa - Tiếng Anh)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Địa chỉ Email
            </label>
            <input 
              type="email"
              required
              className="input-control"
              placeholder="tenban@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <input 
              type="password"
              required
              className="input-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản')}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
          {isLogin ? (
            <>
              Chưa có tài khoản?{' '}
              <button 
                type="button" 
                onClick={() => { setIsLogin(false); setError(''); }}
                style={{ color: '#2563EB', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Đăng ký ngay
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button 
                type="button" 
                onClick={() => { setIsLogin(true); setError(''); }}
                style={{ color: '#2563EB', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Đăng nhập
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
