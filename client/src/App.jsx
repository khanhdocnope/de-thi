import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ExamsListPage from './pages/ExamsListPage';
import ExamTakingPage from './pages/ExamTakingPage';
import ExamResultPage from './pages/ExamResultPage';
import TheoryPage from './pages/TheoryPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import { api } from './services/api';

function TheoryRedirect() {
  const { subject } = useParams();
  return <Navigate to={`/ly-thuyet/${subject || ''}`} replace />;
}

export default function App() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  // Auth state
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const [pendingExam, setPendingExam] = useState(null);

  useEffect(() => {
    // Check if token exists in localStorage, load user profile
    const token = localStorage.getItem('eduprep_token');
    if (token) {
      api.getMe()
        .then(u => {
          if (u) setUser(u);
        })
        .catch(() => {
          localStorage.removeItem('eduprep_token');
        });
    }
  }, []);

  const handleStartExam = (examId, mode = 'exam') => {
    if (!user) {
      setPendingExam({ examId, mode });
      setAuthPromptMessage('Vui lòng đăng nhập tài khoản học sinh để bắt đầu làm bài và lưu điểm số của bạn!');
      setIsAuthOpen(true);
      return;
    }
    const path = mode === 'practice' ? `/luyen-tap/${examId}` : `/luyen-de/${examId}`;
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setIsAuthOpen(false);
    setAuthPromptMessage('');
    if (pendingExam) {
      const path = pendingExam.mode === 'practice' 
        ? `/luyen-tap/${pendingExam.examId}` 
        : `/luyen-de/${pendingExam.examId}`;
      setPendingExam(null);
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('eduprep_token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app-layout">
      
      {/* Top Navbar */}
      <Navbar 
        user={user}
        onOpenAuth={() => {
          setAuthPromptMessage('');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Pages Routed via URL */}
      <main className="main-content">
        <Routes>
          {/* 1. Trang Chủ */}
          <Route 
            path="/" 
            element={
              <HomePage 
                setSelectedSubject={setSelectedSubject}
                onStartExam={handleStartExam}
              />
            } 
          />
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* 2. Đăng Nhập & Đăng Ký */}
          <Route 
            path="/login" 
            element={
              <AuthPage 
                initialMode="login" 
                user={user} 
                onAuthSuccess={handleAuthSuccess} 
              />
            } 
          />
          <Route 
            path="/register" 
            element={
              <AuthPage 
                initialMode="register" 
                user={user} 
                onAuthSuccess={handleAuthSuccess} 
              />
            } 
          />

          {/* 3. Danh Sách Đề Thi */}
          <Route 
            path="/luyen-de" 
            element={
              <ExamsListPage 
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                onStartExam={handleStartExam}
              />
            } 
          />
          <Route path="/exams" element={<Navigate to="/luyen-de" replace />} />

          {/* 4. Phòng Thi Thử & Luyện Tập */}
          <Route 
            path="/luyen-de/:id" 
            element={
              <ExamTakingPage 
                user={user} 
                mode="exam"
              />
            } 
          />
          <Route 
            path="/luyen-tap/:id" 
            element={
              <ExamTakingPage 
                user={user} 
                mode="practice"
              />
            } 
          />
          <Route 
            path="/thi/:id" 
            element={
              <ExamTakingPage 
                user={user} 
                mode="exam"
              />
            } 
          />

          {/* 5. Kết Quả & Đáp Án Chi Tiết */}
          <Route 
            path="/ket-qua-thi" 
            element={<ExamResultPage />} 
          />
          <Route path="/result" element={<Navigate to="/ket-qua-thi" replace />} />

          {/* 6. Thư Viện Lý Thuyết Chuyên Đề */}
          <Route 
            path="/ly-thuyet" 
            element={
              <TheoryPage 
                selectedSubject={selectedSubject !== 'all' ? selectedSubject : 'math'}
                user={user}
              />
            } 
          />
          <Route 
            path="/ly-thuyet/:subject" 
            element={
              <TheoryPage 
                user={user}
              />
            } 
          />
          <Route path="/theory" element={<Navigate to="/ly-thuyet" replace />} />
          <Route path="/theory/:subject" element={<TheoryRedirect />} />

          {/* 7. Sổ Tay Câu Sai */}
          <Route 
            path="/so-cau-sai" 
            element={
              <DashboardPage 
                user={user}
                defaultTab="mistakes"
                onStartExam={handleStartExam}
              />
            } 
          />
          <Route path="/mistakes" element={<Navigate to="/so-cau-sai" replace />} />

          {/* 8. Bảng Thống Kê Điểm Số */}
          <Route 
            path="/thong-ke" 
            element={
              <DashboardPage 
                user={user}
                defaultTab="overview"
                onStartExam={handleStartExam}
              />
            } 
          />
          <Route path="/dashboard" element={<Navigate to="/thong-ke" replace />} />

          {/* 9. Quản Trị & Soạn Đề */}
          <Route 
            path="/quan-tri" 
            element={
              <AdminPage 
                user={user} 
                onOpenAuth={() => navigate('/login')} 
              />
            } 
          />
          <Route path="/admin" element={<Navigate to="/quan-tri" replace />} />

          {/* Fallback 404 về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal for inline quick prompt */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthPromptMessage('');
        }}
        promptMessage={authPromptMessage}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
