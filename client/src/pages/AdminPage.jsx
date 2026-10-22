import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  PlusCircle, 
  FileText, 
  BookOpen, 
  Trash2, 
  Eye, 
  Sparkles, 
  Users, 
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Edit3,
  UserPlus,
  Search,
  Lock,
  UserCheck,
  X,
  Check
} from 'lucide-react';
import MathText from '../components/MathText';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import AiExamReviewStudio from '../components/AiExamReviewStudio';

export default function AdminPage({ user, onOpenAuth }) {
  const navigate = useNavigate();
  const { toast, confirm } = useToast();

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  if (!user || (!isAdmin && !isTeacher)) {
    return (
      <div className="container" style={{ padding: '80px 20px', maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card glass-panel" style={{ padding: '48px 36px', borderTop: '4px solid #EF4444' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
            Khu Vực Soạn Đề & Quản Trị
          </h2>
          <p style={{ color: '#64748B', lineHeight: '1.6', marginBottom: '28px', fontSize: '0.95rem' }}>
            Bạn cần đăng nhập với tài khoản <strong>Thầy cô (Giáo viên)</strong> hoặc <strong>Quản trị viên (Admin)</strong> để vào soạn thảo đề thi, duyệt câu hỏi và quản lý chuyên đề.
          </p>
          <button 
            onClick={() => {
              if (onOpenAuth) onOpenAuth();
              else navigate('/login');
            }}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ShieldCheck size={18} /> Đăng Nhập Tài Khoản Thầy Cô / Admin
          </button>
        </div>
      </div>
    );
  }

  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('create_exam'); // 'create_exam', 'create_theory', 'manage'
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [theories, setTheories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exam Creation Wizard Steps: 1 (Info), 2 (Question & Live Math Preview), 3 (Review & Publish)
  const [examStep, setExamStep] = useState(1);

  // New exam form state
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState('math');
  const [examDuration, setExamDuration] = useState(50);
  const [examType, setExamType] = useState('thpt_2025');
  const [examDesc, setExamDesc] = useState('');

  // Sample question for new exam
  const [qContent, setQContent] = useState('Tính đạo hàm của hàm số $y = \\sin(2x)$:');
  const [qPartType, setQPartType] = useState('part_1_choice');
  const [qImage, setQImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [qOptA, setQOptA] = useState('$y\' = 2\\cos(2x)$');
  const [qOptB, setQOptB] = useState('$y\' = \\cos(2x)$');
  const [qOptC, setQOptC] = useState('$y\' = -2\\cos(2x)$');
  const [qOptD, setQOptD] = useState('$y\' = -\\cos(2x)$');
  const [qAnswer, setQAnswer] = useState('A');
  const [qExplain, setQExplain] = useState('Áp dụng công thức đạo hàm hàm hợp $(\\sin u)\' = u\' \\cdot \\cos u$, với $u = 2x \\implies u\' = 2$. Do đó $y\' = 2\\cos(2x)$.');

  const handleUploadManualImage = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      if (res.url) {
        setQImage(res.url);
        toast.success('Đã tải và đính kèm ảnh minh họa vào câu hỏi!');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tải ảnh');
    } finally {
      setUploadingImage(false);
    }
  };

  // Theory Creation Wizard Steps: 1 (Chapter Info), 2 (Content & Math), 3 (Formulas & Save)
  const [theoryStep, setTheoryStep] = useState(1);
  const [thSubject, setThSubject] = useState('math');
  const [thChapter, setThChapter] = useState('Chương II: Nguyên hàm và Tích phân');
  const [thTitle, setThTitle] = useState('Phương pháp đổi biến số trong tích phân');
  const [thSummary, setThSummary] = useState('Kỹ thuật đặt ẩn phụ $t = u(x)$ để đưa tích phân phức tạp về tích phân cơ bản theo biến $t$.');
  const [thContent, setThContent] = useState(`## 1. Công thức Đổi Biến Số
Cho hàm số $u = u(x)$ có đạo hàm liên tục trên $[a; b]$:
$$\\int_a^b f(u(x)) u'(x) dx = \\int_{u(a)}^{u(b)} f(t) dt$$

## 2. Các Bước Thực Hiện
1. Đặt $t = u(x)$, sau đó tính vi phân $dt = u'(x)dx$.
2. Đổi cận: với $x = a \\implies t = u(a)$; với $x = b \\implies t = u(b)$.
3. Thay toàn bộ biểu thức theo biến $t$ và tính kết quả.`);
  const [thFormulas, setThFormulas] = useState('\\int_a^b f(u(x)) u\'(x) dx = \\int_{u(a)}^{u(b)} f(t) dt');

  // Manage content pagination & sub-tabs
  const [manageSubTab, setManageSubTab] = useState('exams'); // 'exams', 'theories'
  const [examPage, setExamPage] = useState(1);
  const [theoryPage, setTheoryPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Super Admin: Users & Role Management State
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('teacher');

  // Edit Exam Modal State
  const [editingExam, setEditingExam] = useState(null);
  const [editExamTitle, setEditExamTitle] = useState('');
  const [editExamSubject, setEditExamSubject] = useState('math');
  const [editExamDuration, setEditExamDuration] = useState(50);
  const [editExamType, setEditExamType] = useState('thpt_2025');
  const [editExamYear, setEditExamYear] = useState(2025);
  const [editExamDesc, setEditExamDesc] = useState('');

  // Edit Theory Modal State
  const [editingTheory, setEditingTheory] = useState(null);
  const [editThSubject, setEditThSubject] = useState('math');
  const [editThChapter, setEditThChapter] = useState('');
  const [editThTitle, setEditThTitle] = useState('');
  const [editThSummary, setEditThSummary] = useState('');
  const [editThContent, setEditThContent] = useState('');
  const [editThFormulas, setEditThFormulas] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ov, subs, exList, thList] = await Promise.all([
        api.getAdminOverview(),
        api.getSubjects(),
        api.getExams(),
        api.getTheories('all')
      ]);
      setOverview(ov);
      setSubjects(subs || []);
      setExams(exList || []);
      setTheories(thList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsersData = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const data = await api.getAdminUsers();
      setUsersList(data || []);
    } catch (err) {
      toast.error(err.message || 'Lỗi tải danh sách người dùng');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      loadUsersData();
    }
  }, [activeTab, isAdmin]);

  const handleCreateExam = async (e) => {
    if (e) e.preventDefault();
    if (!examTitle) {
      toast.warning('Vui lòng nhập tiêu đề đề thi ở Bước 1');
      setExamStep(1);
      return;
    }

    const newQuestion = {
      question_number: 1,
      part_type: qPartType,
      content: qContent,
      image_url: qImage || null,
      options: [
        { id: 'A', text: qOptA },
        { id: 'B', text: qOptB },
        { id: 'C', text: qOptC },
        { id: 'D', text: qOptD }
      ],
      correct_answer: { answer: qAnswer },
      explanation: qExplain,
      points: 0.25,
      topic: 'Đạo hàm & Hàm số'
    };

    try {
      await api.createAdminExam({
        title: examTitle,
        subject_id: examSubject,
        grade: 12,
        duration_minutes: examDuration,
        total_points: 10.0,
        exam_type: examType,
        year: 2025,
        difficulty: 'medium',
        description: examDesc,
        questions: [newQuestion]
      });

      toast.success('Tạo đề thi mới thành công!');
      setExamTitle('');
      setExamDesc('');
      setExamStep(1);
      const updated = await api.getExams();
      setExams(updated);
      setActiveTab('manage');
      setManageSubTab('exams');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi tạo đề');
    }
  };

  const handleCreateTheory = async (e) => {
    if (e) e.preventDefault();
    if (!thTitle || !thChapter) {
      toast.warning('Vui lòng điền đủ tên chương và bài học ở Bước 1');
      setTheoryStep(1);
      return;
    }
    try {
      await api.createAdminTheory({
        subject_id: thSubject,
        chapter_title: thChapter,
        topic_title: thTitle,
        summary: thSummary,
        content_markdown: thContent,
        key_formulas: thFormulas
      });
      toast.success('Tạo bài học lý thuyết thành công!');
      setTheoryStep(1);
      const updatedTh = await api.getTheories('all');
      setTheories(updatedTh);
      setActiveTab('manage');
      setManageSubTab('theories');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi tạo lý thuyết');
    }
  };

  const handleDeleteExam = async (exam) => {
    const isOwner = exam.created_by === user.id;
    if (!isAdmin && !isOwner) {
      toast.warning('Thầy cô chỉ có quyền xóa đề thi do chính mình tạo!');
      return;
    }

    const confirmed = await confirm({
      title: `Xóa Đề Thi "${exam.title}"?`,
      message: isAdmin && !isOwner 
        ? 'Bạn đang xóa đề thi này với tư cách Quản Trị Viên Tối Cao (Super Admin).' 
        : 'Đề thi này sẽ bị xóa vĩnh viễn khỏi kho đề của hệ thống.',
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      await api.deleteAdminExam(exam.id);
      setExams(prev => prev.filter(e => e.id !== exam.id));
      toast.success('Đã xóa đề thi khỏi hệ thống!');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa đề');
    }
  };

  const handleDeleteTheory = async (theory) => {
    const isOwner = theory.created_by === user.id;
    if (!isAdmin && !isOwner) {
      toast.warning('Thầy cô chỉ có quyền xóa bài học do chính mình tạo!');
      return;
    }

    const confirmed = await confirm({
      title: `Xóa Bài Học "${theory.topic_title}"?`,
      message: isAdmin && !isOwner 
        ? 'Bạn đang xóa bài học này với tư cách Quản Trị Viên Tối Cao (Super Admin).' 
        : 'Bài học này sẽ bị xóa khỏi cây chuyên đề của học sinh.',
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      await api.deleteAdminTheory(theory.id);
      setTheories(prev => prev.filter(t => t.id !== theory.id));
      toast.success('Đã xóa bài học khỏi hệ thống!');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa bài học');
    }
  };

  // Exam Edit Handlers
  const handleOpenEditExam = (e) => {
    setEditingExam(e);
    setEditExamTitle(e.title || '');
    setEditExamSubject(e.subject_id || 'math');
    setEditExamDuration(e.duration_minutes || 50);
    setEditExamType(e.exam_type || 'thpt_2025');
    setEditExamYear(e.year || 2025);
    setEditExamDesc(e.description || '');
  };

  const handleSaveEditExam = async (e) => {
    e.preventDefault();
    if (!editExamTitle.trim()) {
      toast.warning('Tiêu đề đề thi không được để trống');
      return;
    }
    try {
      await api.updateAdminExam(editingExam.id, {
        title: editExamTitle,
        subject_id: editExamSubject,
        duration_minutes: editExamDuration,
        exam_type: editExamType,
        year: editExamYear,
        description: editExamDesc
      });
      toast.success('Đã cập nhật thông tin đề thi thành công!');
      setEditingExam(null);
      const updated = await api.getExams();
      setExams(updated || []);
    } catch (err) {
      toast.error(err.message || 'Lỗi khi cập nhật đề thi');
    }
  };

  // Theory Edit Handlers
  const handleOpenEditTheory = (t) => {
    setEditingTheory(t);
    setEditThSubject(t.subject_id || 'math');
    setEditThChapter(t.chapter_title || '');
    setEditThTitle(t.topic_title || '');
    setEditThSummary(t.summary || '');
    setEditThContent(t.content_markdown || '');
    setEditThFormulas(t.key_formulas || '');
  };

  const handleSaveEditTheory = async (e) => {
    e.preventDefault();
    if (!editThTitle.trim() || !editThChapter.trim()) {
      toast.warning('Tên chương và bài học không được để trống');
      return;
    }
    try {
      await api.updateAdminTheory(editingTheory.id, {
        subject_id: editThSubject,
        chapter_title: editThChapter,
        topic_title: editThTitle,
        summary: editThSummary,
        content_markdown: editThContent,
        key_formulas: editThFormulas
      });
      toast.success('Đã cập nhật bài học lý thuyết thành công!');
      setEditingTheory(null);
      const updated = await api.getTheories('all');
      setTheories(updated || []);
    } catch (err) {
      toast.error(err.message || 'Lỗi khi cập nhật bài học lý thuyết');
    }
  };

  // User Role Management Handlers (Super Admin)
  const handleUpdateRole = async (targetUser, newRole) => {
    if (targetUser.id === user.id && newRole !== 'admin') {
      toast.warning('Bạn không thể tự hạ quyền Admin của chính mình!');
      return;
    }
    const roleLabel = newRole === 'admin' ? 'Quản trị viên (Super Admin)' : newRole === 'teacher' ? 'Thầy cô (Giáo viên)' : 'Học sinh';
    const confirmed = await confirm({
      title: 'Xác Nhận Phân Quyền?',
      message: `Bạn có chắc muốn chuyển vai trò của "${targetUser.name}" (${targetUser.email}) thành [${roleLabel}]?`,
      confirmText: 'Xác nhận phân quyền',
      cancelText: 'Hủy'
    });
    if (!confirmed) return;

    try {
      const res = await api.updateUserRole(targetUser.id, newRole);
      toast.success(res.message || 'Cập nhật vai trò thành công!');
      loadUsersData();
      const ov = await api.getAdminOverview();
      setOverview(ov);
    } catch (err) {
      toast.error(err.message || 'Lỗi cập nhật vai trò');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === user.id) {
      toast.warning('Bạn không thể xóa tài khoản của chính mình!');
      return;
    }
    const confirmed = await confirm({
      title: `Xóa Tài Khoản "${targetUser.name}"?`,
      message: `Tài khoản ${targetUser.email} sẽ bị xóa vĩnh viễn khỏi hệ thống cùng toàn bộ kết quả thi của người dùng này.`,
      confirmText: 'Xác nhận xóa tài khoản',
      cancelText: 'Hủy bỏ',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      await api.deleteAdminUser(targetUser.id);
      toast.success(`Đã xóa tài khoản "${targetUser.name}" thành công!`);
      loadUsersData();
      const ov = await api.getAdminOverview();
      setOverview(ov);
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa tài khoản');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword) {
      toast.warning('Vui lòng điền đủ họ tên, email và mật khẩu!');
      return;
    }
    try {
      const res = await api.createAdminUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      });
      toast.success(res.message || 'Tạo tài khoản thành công!');
      setShowCreateUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('teacher');
      loadUsersData();
      const ov = await api.getAdminOverview();
      setOverview(ov);
    } catch (err) {
      toast.error(err.message || 'Lỗi khi tạo tài khoản');
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className={`badge ${isAdmin ? 'badge-amber' : 'badge-purple'}`} style={{ marginBottom: '6px' }}>
            {isAdmin ? 'Cổng Quản Trị Hệ Thống (Super Admin)' : 'Không Gian Thầy Cô (Giáo Viên)'}
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
            {isAdmin ? 'Quản Lý Đề Thi, Lý Thuyết & Phân Quyền' : 'Soạn Đề Thi & Quản Lý Chuyên Đề'}
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            {isAdmin 
              ? 'Toàn quyền xóa/sửa tất cả đề thi, lý thuyết trong hệ thống và phân quyền vai trò người dùng (Admin, Thầy cô, Học sinh).'
              : 'Soạn thảo đề thi mới, duyệt đề AI 2 lớp và quản lý các đề thi/chuyên đề do thầy cô đã khởi tạo.'}
          </p>
        </div>

        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '6px', borderRadius: '12px', flexWrap: 'wrap' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'ai_create' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ai_create')}
            style={{ 
              border: 'none',
              background: activeTab === 'ai_create' ? 'linear-gradient(135deg, #7C3AED, #2563EB)' : '#EDE9FE',
              color: activeTab === 'ai_create' ? 'white' : '#6D28D9',
              fontWeight: 700
            }}
          >
            <Sparkles size={16} /> AI Tạo Đề & Duyệt 2 Lớp
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'create_exam' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('create_exam')}
            style={{ border: 'none' }}
          >
            <PlusCircle size={16} /> Soạn Đề Thủ Công
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'create_theory' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('create_theory')}
            style={{ border: 'none' }}
          >
            <BookOpen size={16} /> Thêm Lý Thuyết
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'manage' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('manage')}
            style={{ border: 'none' }}
          >
            <FileText size={16} /> Danh Mục Hiện Có
          </button>
          {isAdmin && (
            <button 
              className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('users')}
              style={{ 
                border: 'none',
                background: activeTab === 'users' ? 'linear-gradient(135deg, #F59E0B, #DC2626)' : '#FEF3C7',
                color: activeTab === 'users' ? 'white' : '#92400E',
                fontWeight: 700
              }}
            >
              <Users size={16} /> Phân Quyền & Người Dùng
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Badges */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Tổng Học Sinh</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563EB' }}>{overview.totalUsers}</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Đề Thi Trong Kho</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8B5CF6' }}>{overview.totalExams}</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Tổng Số Câu Hỏi</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>{overview.totalQuestions}</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Bài Học Lý Thuyết</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>{overview.totalTheories}</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Lượt Nộp Bài Thi</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>{overview.totalSubmissions}</div>
          </div>
        </div>
      )}

      {/* Tab 0: AI Exam Review Studio - 2-Tier Human-in-the-Loop */}
      {activeTab === 'ai_create' && (
        <AiExamReviewStudio 
          subjects={subjects}
          onExamPublished={async (newExamId) => {
            try {
              const updated = await api.getExams();
              setExams(updated || []);
              const ov = await api.getAdminOverview();
              setOverview(ov);
              setActiveTab('manage');
              setManageSubTab('exams');
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}

      {/* Tab 1: Create Exam - 3-Step Interactive Wizard */}
      {activeTab === 'create_exam' && (
        <div className="card" style={{ padding: '32px' }}>
          
          {/* Step Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={() => setExamStep(1)}
                className={`btn btn-sm ${examStep === 1 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '20px', padding: '6px 16px' }}
              >
                1. Thông Tin Đề Thi
              </button>
              <button 
                type="button"
                onClick={() => setExamStep(2)}
                className={`btn btn-sm ${examStep === 2 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '20px', padding: '6px 16px' }}
              >
                2. Soạn Câu Hỏi & KaTeX
              </button>
              <button 
                type="button"
                onClick={() => setExamStep(3)}
                className={`btn btn-sm ${examStep === 3 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '20px', padding: '6px 16px' }}
              >
                3. Xem Trước & Xuất Bản
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
              Bước {examStep} / 3
            </div>
          </div>

          {/* STEP 1: Basic Exam Information */}
          {examStep === 1 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
                Bước 1: Thiết Lập Thông Tin Chung Về Đề Thi
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Tiêu đề đề thi <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    className="input-control"
                    placeholder="Ví dụ: Đề khảo sát chất lượng Toán học 2025"
                    value={examTitle}
                    onChange={e => setExamTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Môn học
                  </label>
                  <select 
                    className="input-control"
                    value={examSubject}
                    onChange={e => setExamSubject(e.target.value)}
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Thời gian làm bài (phút)
                  </label>
                  <input 
                    type="number"
                    className="input-control"
                    value={examDuration}
                    onChange={e => setExamDuration(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Định dạng đề thi
                  </label>
                  <select 
                    className="input-control"
                    value={examType}
                    onChange={e => setExamType(e.target.value)}
                  >
                    <option value="thpt_2025">Cấu trúc 3 phần mới Bộ GD&ĐT 2025+</option>
                    <option value="standard">Trắc nghiệm 4 lựa chọn truyền thống</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Mô tả / Ma trận kiến thức đề thi
                </label>
                <textarea 
                  className="input-control"
                  rows={3}
                  placeholder="Ghi chú về mức độ khó, ma trận phân bổ câu hỏi hoặc đối tượng học sinh ôn luyện..."
                  value={examDesc}
                  onChange={e => setExamDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                <button 
                  type="button"
                  onClick={() => {
                    if (!examTitle.trim()) {
                      toast.warning('Vui lòng nhập tiêu đề đề thi trước khi tiếp tục');
                      return;
                    }
                    setExamStep(2);
                  }}
                  className="btn btn-primary"
                >
                  Tiếp Tục: Soạn Thảo Câu Hỏi <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Question Authoring & Live KaTeX Preview */}
          {examStep === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  Bước 2: Soạn Thảo Câu Hỏi (Hỗ Trợ KaTeX Công Thức Trực Tiếp)
                </h3>
                <span className="badge badge-blue">Định dạng KaTeX: gõ $công thức$ hoặc công thức toán</span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
                
                {/* Question Content Input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Nội dung câu hỏi (Ví dụ: Cho hàm số $y = f(x)$, tính đạo hàm...)
                  </label>
                  <textarea 
                    className="input-control"
                    rows={3}
                    value={qContent}
                    onChange={e => setQContent(e.target.value)}
                  />
                </div>

                {/* Illustration Image Upload / URL Attachment */}
                <div style={{ marginBottom: '20px', background: 'white', padding: '14px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    <ImageIcon size={16} color="#2563EB" /> Đính kèm hình ảnh minh họa / đồ thị (tùy chọn)
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label 
                      className={`btn btn-secondary btn-sm ${uploadingImage ? 'disabled' : ''}`}
                      style={{ cursor: uploadingImage ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Upload size={14} />
                      {uploadingImage ? 'Đang tải lên...' : 'Tải ảnh từ máy tính'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        disabled={uploadingImage}
                        onChange={e => {
                          if (e.target.files?.[0]) handleUploadManualImage(e.target.files[0]);
                        }} 
                      />
                    </label>
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>hoặc dán đường dẫn:</span>
                    <input 
                      type="text" 
                      className="input-control" 
                      placeholder="https://... hoặc /uploads/..."
                      value={qImage}
                      onChange={e => setQImage(e.target.value)}
                      style={{ flex: 1, minWidth: '220px', fontSize: '0.85rem' }}
                    />
                    {qImage && (
                      <button 
                        type="button" 
                        onClick={() => setQImage('')} 
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#EF4444', border: '1px solid #FCA5A5' }}
                      >
                        Gỡ ảnh
                      </button>
                    )}
                  </div>

                  {qImage && (
                    <div style={{ marginTop: '12px', textAlign: 'center', background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                      <img 
                        src={qImage.startsWith('http') ? qImage : `http://localhost:5000${qImage}`} 
                        alt="Ảnh minh họa câu hỏi" 
                        style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }}
                      />
                    </div>
                  )}
                </div>

                {/* Question Live KaTeX Preview */}
                <div style={{ background: 'white', border: '1px dashed #3B82F6', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Xem trước KaTeX câu hỏi trực tiếp:
                  </div>
                  <MathText text={qContent || '(Chưa nhập nội dung)'} />
                  {qImage && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={qImage.startsWith('http') ? qImage : `http://localhost:5000${qImage}`} 
                        alt="Minh họa" 
                        style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }}
                      />
                    </div>
                  )}
                </div>

                {/* 4 Options with Individual Live Math Previews */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  
                  {/* Option A */}
                  <div style={{ background: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563EB', display: 'block', marginBottom: '4px' }}>
                      Phương án A:
                    </label>
                    <input className="input-control" value={qOptA} onChange={e => setQOptA(e.target.value)} style={{ marginBottom: '6px' }} />
                    <div style={{ fontSize: '0.85rem', color: '#475569', minHeight: '24px', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px' }}>
                      <MathText text={qOptA} />
                    </div>
                  </div>

                  {/* Option B */}
                  <div style={{ background: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563EB', display: 'block', marginBottom: '4px' }}>
                      Phương án B:
                    </label>
                    <input className="input-control" value={qOptB} onChange={e => setQOptB(e.target.value)} style={{ marginBottom: '6px' }} />
                    <div style={{ fontSize: '0.85rem', color: '#475569', minHeight: '24px', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px' }}>
                      <MathText text={qOptB} />
                    </div>
                  </div>

                  {/* Option C */}
                  <div style={{ background: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563EB', display: 'block', marginBottom: '4px' }}>
                      Phương án C:
                    </label>
                    <input className="input-control" value={qOptC} onChange={e => setQOptC(e.target.value)} style={{ marginBottom: '6px' }} />
                    <div style={{ fontSize: '0.85rem', color: '#475569', minHeight: '24px', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px' }}>
                      <MathText text={qOptC} />
                    </div>
                  </div>

                  {/* Option D */}
                  <div style={{ background: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563EB', display: 'block', marginBottom: '4px' }}>
                      Phương án D:
                    </label>
                    <input className="input-control" value={qOptD} onChange={e => setQOptD(e.target.value)} style={{ marginBottom: '6px' }} />
                    <div style={{ fontSize: '0.85rem', color: '#475569', minHeight: '24px', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px' }}>
                      <MathText text={qOptD} />
                    </div>
                  </div>
                </div>

                {/* Correct Answer Selection */}
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '12px 18px', borderRadius: '8px', display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E3A8A' }}>Đáp án chính xác:</label>
                  {['A', 'B', 'C', 'D'].map(l => (
                    <label key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700, color: qAnswer === l ? '#2563EB' : '#475569' }}>
                      <input type="radio" name="correctRadio" checked={qAnswer === l} onChange={() => setQAnswer(l)} />
                      Phương án {l}
                    </label>
                  ))}
                </div>

                {/* Detailed Explanation */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Lời giải chi tiết & Phương pháp giải (KaTeX)
                  </label>
                  <textarea 
                    className="input-control"
                    rows={2}
                    value={qExplain}
                    onChange={e => setQExplain(e.target.value)}
                  />
                  <div style={{ background: 'white', border: '1px dashed #CBD5E1', padding: '10px 14px', borderRadius: '6px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981' }}>Xem trước giải thích: </span>
                    <MathText text={qExplain} />
                  </div>
                </div>

              </div>

              {/* Wizard navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                <button 
                  type="button"
                  onClick={() => setExamStep(1)}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={16} /> Quay Lại Bước 1
                </button>
                <button 
                  type="button"
                  onClick={() => setExamStep(3)}
                  className="btn btn-primary"
                >
                  Tiếp Tục: Xem Trước & Xuất Bản <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Full Review & Publish */}
          {examStep === 3 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                Bước 3: Kiểm Tra Thẩm Định Đề Thi & Xuất Bản
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px' }}>
                Dưới đây là bản mô phỏng giao diện học sinh sẽ nhìn thấy khi làm bài. Hãy kiểm tra các công thức toán trước khi lưu.
              </p>

              {/* Exam Metadata Preview Box */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span className="badge badge-blue" style={{ marginBottom: '6px' }}>Môn: {examSubject.toUpperCase()}</span>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>{examTitle || '(Chưa có tiêu đề)'}</h4>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>{examDesc || 'Chưa có mô tả'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Thời gian thi: <strong>{examDuration} phút</strong></div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>Cấu trúc: <strong>{examType === 'thpt_2025' ? 'Cấu trúc 3 phần 2025+' : 'Trắc nghiệm chuẩn'}</strong></div>
                </div>
              </div>

              {/* Rendered Mock Question Card */}
              <div className="card" style={{ border: '1.5px solid #3B82F6', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span className="badge badge-purple">Câu 1</span>
                  <span className="badge badge-green">0.25 điểm</span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>
                  <MathText text={qContent} />
                </div>
                {qImage && (
                  <div style={{ marginBottom: '16px', textAlign: 'center', background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                    <img 
                      src={qImage.startsWith('http') ? qImage : `http://localhost:5000${qImage}`} 
                      alt="Ảnh minh họa" 
                      style={{ maxHeight: '220px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }} 
                    />
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  {[{ id: 'A', text: qOptA }, { id: 'B', text: qOptB }, { id: 'C', text: qOptC }, { id: 'D', text: qOptD }].map(opt => (
                    <div 
                      key={opt.id}
                      style={{ 
                        padding: '10px 14px', 
                        borderRadius: '8px', 
                        border: opt.id === qAnswer ? '2px solid #10B981' : '1px solid #CBD5E1',
                        background: opt.id === qAnswer ? '#ECFDF5' : 'white',
                        fontWeight: 600
                      }}
                    >
                      <strong>{opt.id}. </strong> <MathText text={opt.text} /> {opt.id === qAnswer && ' (Đáp án đúng)'}
                    </div>
                  ))}
                </div>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '12px 16px', borderRadius: '8px' }}>
                  <strong style={{ color: '#1D4ED8', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Phương pháp giải:</strong>
                  <MathText text={qExplain} />
                </div>
              </div>

              {/* Wizard navigation and Final Publish */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                <button 
                  type="button"
                  onClick={() => setExamStep(2)}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={16} /> Quay Lại Soạn Câu Hỏi
                </button>
                <button 
                  type="button"
                  onClick={handleCreateExam}
                  className="btn btn-success btn-lg"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <CheckCircle2 size={20} /> Xác Nhận & Xuất Bản Đề Thi Lên Hệ Thống
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Create Theory - 3-Step Interactive Wizard */}
      {activeTab === 'create_theory' && (
        <div className="card" style={{ padding: '32px' }}>
          
          {/* Theory Step Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={() => setTheoryStep(1)}
                className={`btn btn-sm ${theoryStep === 1 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '20px', padding: '6px 16px' }}
              >
                1. Phân Mục & Tóm Tắt
              </button>
              <button 
                type="button"
                onClick={() => setTheoryStep(2)}
                className={`btn btn-sm ${theoryStep === 2 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '20px', padding: '6px 16px' }}
              >
                2. Soạn Thảo Chi Tiết
              </button>
              <button 
                type="button"
                onClick={() => setTheoryStep(3)}
                className={`btn btn-sm ${theoryStep === 3 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '20px', padding: '6px 16px' }}
              >
                3. Sổ Tay Công Thức & Lưu
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
              Bước {theoryStep} / 3
            </div>
          </div>

          {/* THEORY STEP 1: Classification & Summary */}
          {theoryStep === 1 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
                Bước 1: Phân Mục Chuyên Đề & Ghi Nhớ Nhanh
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Môn học
                  </label>
                  <select className="input-control" value={thSubject} onChange={e => setThSubject(e.target.value)}>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Tên Chương / Chuyên đề lớn <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="input-control" 
                    value={thChapter} 
                    onChange={e => setThChapter(e.target.value)} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Tên Bài học cụ thể <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="input-control" 
                    value={thTitle} 
                    onChange={e => setThTitle(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Tóm tắt trọng tâm (Ghi nhớ nhanh cho học sinh)
                </label>
                <textarea 
                  className="input-control" 
                  rows={3} 
                  value={thSummary} 
                  onChange={e => setThSummary(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                <button 
                  type="button"
                  onClick={() => {
                    if (!thChapter.trim() || !thTitle.trim()) {
                      toast.warning('Vui lòng điền đủ tên chương và bài học trước khi tiếp tục');
                      return;
                    }
                    setTheoryStep(2);
                  }}
                  className="btn btn-primary"
                >
                  Tiếp Tục: Soạn Thảo Nội Dung <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* THEORY STEP 2: Content & Live Math Preview */}
          {theoryStep === 2 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                Bước 2: Soạn Thảo Nội Dung Lý Thuyết & Xem Trước KaTeX
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '18px' }}>
                Hỗ trợ cú pháp Markdown và công thức toán bằng <code>$công thức$</code> hoặc <code>$$công thức$$</code>.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Soạn thảo Markdown:
                  </label>
                  <textarea 
                    className="input-control" 
                    rows={12} 
                    value={thContent} 
                    onChange={e => setThContent(e.target.value)} 
                    style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#2563EB' }}>
                    Xem trước hiển thị trực tiếp (Live KaTeX):
                  </label>
                  <div style={{ border: '1px solid #CBD5E1', borderRadius: '10px', padding: '16px', height: '270px', overflowY: 'auto', background: 'white' }}>
                    <MathText text={thContent} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                <button 
                  type="button"
                  onClick={() => setTheoryStep(1)}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={16} /> Quay Lại Bước 1
                </button>
                <button 
                  type="button"
                  onClick={() => setTheoryStep(3)}
                  className="btn btn-primary"
                >
                  Tiếp Tục: Sổ Tay Công Thức & Lưu <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* THEORY STEP 3: Formulas & Save */}
          {theoryStep === 3 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                Bước 3: Sổ Tay Công Thức Vàng & Xác Nhận Lưu
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px' }}>
                Các công thức quan trọng này sẽ hiển thị ở tab "Sổ Tay Công Thức Vàng" để học sinh tiện tra cứu và thuộc lòng.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Công thức trọng điểm (KaTeX):
                </label>
                <textarea 
                  className="input-control" 
                  rows={3} 
                  value={thFormulas} 
                  onChange={e => setThFormulas(e.target.value)} 
                />
              </div>

              <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
                <strong style={{ display: 'block', color: '#6D28D9', fontSize: '0.9rem', marginBottom: '8px' }}>
                  Xem trước sổ tay công thức:
                </strong>
                <div style={{ background: 'white', padding: '14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                  <MathText text={thFormulas || '(Chưa nhập công thức)'} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                <button 
                  type="button"
                  onClick={() => setTheoryStep(2)}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={16} /> Quay Lại Soạn Nội Dung
                </button>
                <button 
                  type="button"
                  onClick={handleCreateTheory}
                  className="btn btn-success btn-lg"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <CheckCircle2 size={20} /> Lưu Bài Học Lý Thuyết Vào Kho
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab 3: Manage Content with Sub-tabs and Pagination */}
      {activeTab === 'manage' && (
        <div className="card" style={{ padding: '28px' }}>
          
          {/* Sub-tabs header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => { setManageSubTab('exams'); setExamPage(1); }}
                className={`btn btn-sm ${manageSubTab === 'exams' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <FileText size={16} /> Kho Đề Thi ({exams.length})
              </button>
              <button 
                type="button"
                onClick={() => { setManageSubTab('theories'); setTheoryPage(1); }}
                className={`btn btn-sm ${manageSubTab === 'theories' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <BookOpen size={16} /> Kho Lý Thuyết ({theories.length})
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Trang phân loại quản lý nội dung
            </div>
          </div>

          {/* Sub-tab 1: Exams List with Pagination */}
          {manageSubTab === 'exams' && (
            <div>
              {exams.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                  Chưa có đề thi nào trong kho.
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {exams.slice((examPage - 1) * ITEMS_PER_PAGE, examPage * ITEMS_PER_PAGE).map(e => {
                      const isOwner = e.created_by === user.id;
                      const canModify = isAdmin || isOwner;

                      return (
                        <div 
                          key={e.id}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '14px 18px',
                            background: '#F8FAFC',
                            borderRadius: '10px',
                            border: isOwner ? '1.5px solid #DDD6FE' : '1px solid #E2E8F0',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span className="badge badge-blue">{e.subject_name}</span>
                              {isOwner && (
                                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Của bạn</span>
                              )}
                              {e.author_name && (
                                <span style={{ fontSize: '0.75rem', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>
                                  Tác giả: <strong>{e.author_name}</strong> {e.author_role === 'admin' ? '(Admin)' : '(Thầy cô)'}
                                </span>
                              )}
                            </div>
                            <strong style={{ color: '#0F172A', fontSize: '1rem' }}>{e.title}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                              {e.duration_minutes} phút • Năm {e.year} • {e.exam_type === 'thpt_2025' ? 'Cấu trúc 3 phần 2025' : 'Trắc nghiệm chuẩn'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {canModify ? (
                              <>
                                <button 
                                  onClick={() => handleOpenEditExam(e)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: '#2563EB', border: '1px solid #BFDBFE' }}
                                  title="Chỉnh sửa thông tin đề thi"
                                >
                                  <Edit3 size={15} /> Sửa
                                </button>
                                <button 
                                  onClick={() => handleDeleteExam(e)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: '#EF4444', border: '1px solid #FECACA' }}
                                  title={isAdmin && !isOwner ? "Xóa đề thi (Quyền Admin tối cao)" : "Xóa đề thi của bạn"}
                                >
                                  <Trash2 size={15} /> Xóa
                                </button>
                              </>
                            ) : (
                              <span className="badge badge-gray" title="Thầy cô chỉ có quyền sửa/xóa đề thi do chính mình tạo">
                                <Lock size={12} style={{ marginRight: '4px' }} /> Chỉ xem (Tác giả khác)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {Math.ceil(exams.length / ITEMS_PER_PAGE) > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        Hiển thị {((examPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(examPage * ITEMS_PER_PAGE, exams.length)} trên tổng {exams.length} đề thi
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          disabled={examPage === 1}
                          onClick={() => setExamPage(p => p - 1)}
                          className="btn btn-secondary btn-sm"
                        >
                          Trang trước
                        </button>
                        {Array.from({ length: Math.ceil(exams.length / ITEMS_PER_PAGE) }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setExamPage(idx + 1)}
                            className={`btn btn-sm ${examPage === idx + 1 ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ minWidth: '32px' }}
                          >
                            {idx + 1}
                          </button>
                        ))}
                        <button 
                          disabled={examPage >= Math.ceil(exams.length / ITEMS_PER_PAGE)}
                          onClick={() => setExamPage(p => p + 1)}
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

          {/* Sub-tab 2: Theories List with Pagination */}
          {manageSubTab === 'theories' && (
            <div>
              {theories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                  Chưa có bài học lý thuyết nào.
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {theories.slice((theoryPage - 1) * ITEMS_PER_PAGE, theoryPage * ITEMS_PER_PAGE).map(t => {
                      const isOwner = t.created_by === user.id;
                      const canModify = isAdmin || isOwner;

                      return (
                        <div 
                          key={t.id}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '14px 18px',
                            background: '#F8FAFC',
                            borderRadius: '10px',
                            border: isOwner ? '1.5px solid #DDD6FE' : '1px solid #E2E8F0',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span className="badge badge-purple">{t.subject_name}</span>
                              {isOwner && (
                                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Của bạn</span>
                              )}
                              {t.author_name && (
                                <span style={{ fontSize: '0.75rem', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>
                                  Tác giả: <strong>{t.author_name}</strong> {t.author_role === 'admin' ? '(Admin)' : '(Thầy cô)'}
                                </span>
                              )}
                            </div>
                            <strong style={{ color: '#0F172A', fontSize: '1rem' }}>{t.topic_title}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                              {t.chapter_title}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {canModify ? (
                              <>
                                <button 
                                  onClick={() => handleOpenEditTheory(t)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: '#2563EB', border: '1px solid #BFDBFE' }}
                                  title="Chỉnh sửa bài học lý thuyết"
                                >
                                  <Edit3 size={15} /> Sửa
                                </button>
                                <button 
                                  onClick={() => handleDeleteTheory(t)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: '#EF4444', border: '1px solid #FECACA' }}
                                  title={isAdmin && !isOwner ? "Xóa bài học (Quyền Admin tối cao)" : "Xóa bài học của bạn"}
                                >
                                  <Trash2 size={15} /> Xóa
                                </button>
                              </>
                            ) : (
                              <span className="badge badge-gray" title="Thầy cô chỉ có quyền sửa/xóa bài học do chính mình tạo">
                                <Lock size={12} style={{ marginRight: '4px' }} /> Chỉ xem (Tác giả khác)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {Math.ceil(theories.length / ITEMS_PER_PAGE) > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        Hiển thị {((theoryPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(theoryPage * ITEMS_PER_PAGE, theories.length)} trên tổng {theories.length} bài học
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          disabled={theoryPage === 1}
                          onClick={() => setTheoryPage(p => p - 1)}
                          className="btn btn-secondary btn-sm"
                        >
                          Trang trước
                        </button>
                        {Array.from({ length: Math.ceil(theories.length / ITEMS_PER_PAGE) }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setTheoryPage(idx + 1)}
                            className={`btn btn-sm ${theoryPage === idx + 1 ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ minWidth: '32px' }}
                          >
                            {idx + 1}
                          </button>
                        ))}
                        <button 
                          disabled={theoryPage >= Math.ceil(theories.length / ITEMS_PER_PAGE)}
                          onClick={() => setTheoryPage(p => p + 1)}
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
      )}

      {/* Tab 4: Users & Role Management (Super Admin Only) */}
      {activeTab === 'users' && isAdmin && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="badge badge-amber" style={{ marginBottom: '6px' }}>Phân Quyền Toàn Hệ Thống</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
                Quản Lý Người Dùng & Phân Vai Trò
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Xem danh sách tất cả tài khoản, cấp quyền Thầy cô, Học sinh hoặc Quản trị viên tối cao.
              </p>
            </div>

            <button 
              onClick={() => setShowCreateUserModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <UserPlus size={16} /> Thêm Thành Viên Mới
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input 
                type="text"
                className="input-control"
                placeholder="Tìm theo tên hoặc email người dùng..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Lọc vai trò:</span>
              <select 
                className="input-control" 
                value={userRoleFilter} 
                onChange={e => setUserRoleFilter(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="all">Tất cả ({usersList.length})</option>
                <option value="admin">Quản trị viên ({usersList.filter(u => u.role === 'admin').length})</option>
                <option value="teacher">Thầy cô / GV ({usersList.filter(u => u.role === 'teacher').length})</option>
                <option value="student">Học sinh ({usersList.filter(u => u.role === 'student').length})</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {loadingUsers ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Đang tải danh sách người dùng...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px' }}>Người Dùng</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Vai Trò Hiện Tại</th>
                    <th style={{ padding: '12px' }}>Đóng Góp / Hoạt Động</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Hành Động Phân Quyền</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList
                    .filter(u => {
                      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
                      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                      return matchesSearch && matchesRole;
                    })
                    .map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px' }}>
                          <strong style={{ color: '#0F172A', display: 'block' }}>{u.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: #{u.id} {u.id === user.id && '(Bạn)'}</span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#334155' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${u.role === 'admin' ? 'badge-amber' : u.role === 'teacher' ? 'badge-purple' : 'badge-blue'}`}>
                            {u.role === 'admin' ? 'Quản trị viên' : u.role === 'teacher' ? 'Thầy cô' : 'Học sinh'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.8rem', color: '#64748B' }}>
                          <div>Tạo đề: <strong>{u.exams_created_count || 0}</strong> • Lý thuyết: <strong>{u.theories_created_count || 0}</strong></div>
                          <div>Bài đã thi: <strong>{u.submissions_count || 0}</strong></div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <select 
                            className="input-control" 
                            style={{ 
                              padding: '6px 10px', 
                              fontSize: '0.85rem', 
                              fontWeight: 600,
                              borderColor: u.role === 'admin' ? '#F59E0B' : u.role === 'teacher' ? '#8B5CF6' : '#3B82F6',
                              background: u.role === 'admin' ? '#FFFBEB' : u.role === 'teacher' ? '#F5F3FF' : 'white',
                              color: u.role === 'admin' ? '#B45309' : u.role === 'teacher' ? '#6D28D9' : '#1D4ED8'
                            }}
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u, e.target.value)}
                            disabled={u.id === user.id}
                            title={u.id === user.id ? "Không thể tự đổi vai trò của chính mình" : "Thay đổi vai trò"}
                          >
                            <option value="student">Học sinh</option>
                            <option value="teacher">Thầy cô (Giáo viên)</option>
                            <option value="admin">Quản trị viên (Admin)</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteUser(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#EF4444', border: '1px solid #FECACA' }}
                            disabled={u.id === user.id}
                            title={u.id === user.id ? "Không thể xóa chính mình" : "Xóa tài khoản này"}
                          >
                            <Trash2 size={14} /> Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Edit Exam Modal */}
      {editingExam && (
        <div className="modal-backdrop" onClick={() => setEditingExam(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                Chỉnh Sửa Thông Tin Đề Thi
              </h3>
              <button onClick={() => setEditingExam(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditExam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Tiêu đề đề thi <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="text"
                  required
                  className="input-control"
                  value={editExamTitle}
                  onChange={e => setEditExamTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Môn học
                  </label>
                  <select className="input-control" value={editExamSubject} onChange={e => setEditExamSubject(e.target.value)}>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Thời gian thi (phút)
                  </label>
                  <input 
                    type="number"
                    className="input-control"
                    value={editExamDuration}
                    onChange={e => setEditExamDuration(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Định dạng đề
                  </label>
                  <select className="input-control" value={editExamType} onChange={e => setEditExamType(e.target.value)}>
                    <option value="thpt_2025">Cấu trúc 3 phần 2025+</option>
                    <option value="standard">Trắc nghiệm chuẩn</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Năm áp dụng
                  </label>
                  <input 
                    type="number"
                    className="input-control"
                    value={editExamYear}
                    onChange={e => setEditExamYear(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Mô tả đề thi
                </label>
                <textarea 
                  className="input-control"
                  rows={3}
                  value={editExamDesc}
                  onChange={e => setEditExamDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingExam(null)} className="btn btn-secondary">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Theory Modal */}
      {editingTheory && (
        <div className="modal-backdrop" onClick={() => setEditingTheory(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                Chỉnh Sửa Bài Học Lý Thuyết
              </h3>
              <button onClick={() => setEditingTheory(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditTheory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Môn học
                  </label>
                  <select className="input-control" value={editThSubject} onChange={e => setEditThSubject(e.target.value)}>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Tên Chương / Chuyên đề <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    className="input-control"
                    value={editThChapter}
                    onChange={e => setEditThChapter(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Tên Bài học <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="text"
                  required
                  className="input-control"
                  value={editThTitle}
                  onChange={e => setEditThTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Tóm tắt bài học
                </label>
                <textarea 
                  className="input-control"
                  rows={2}
                  value={editThSummary}
                  onChange={e => setEditThSummary(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Nội dung chi tiết (Markdown & KaTeX)
                </label>
                <textarea 
                  className="input-control"
                  rows={6}
                  value={editThContent}
                  onChange={e => setEditThContent(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Sổ tay công thức vàng (KaTeX)
                </label>
                <input 
                  type="text"
                  className="input-control"
                  value={editThFormulas}
                  onChange={e => setEditThFormulas(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingTheory(null)} className="btn btn-secondary">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Create User Modal (Super Admin Only) */}
      {showCreateUserModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                Thêm Thành Viên & Phân Quyền
              </h3>
              <button onClick={() => setShowCreateUserModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Họ và tên <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="text"
                  required
                  className="input-control"
                  placeholder="Ví dụ: Thầy Trần Minh Tuấn"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Email đăng nhập <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="email"
                  required
                  className="input-control"
                  placeholder="giaovien@eduprep.vn"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Mật khẩu khởi tạo <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="password"
                  required
                  className="input-control"
                  placeholder="Ít nhất 6 ký tự"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Vai trò phân quyền <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select className="input-control" value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                  <option value="teacher">Thầy cô (Giáo viên - Quyền soạn đề & sửa bài của mình)</option>
                  <option value="student">Học sinh (Luyện đề & học lý thuyết)</option>
                  <option value="admin">Quản trị viên (Super Admin - Toàn quyền cao nhất)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCreateUserModal(false)} className="btn btn-secondary">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserPlus size={16} /> Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
