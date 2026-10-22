const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('eduprep_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
    return data;
  },

  async register(name, email, password, target_block) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, target_block })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },

  // Exams
  async getSubjects() {
    const res = await fetch(`${API_BASE}/exams/subjects`);
    return res.json();
  },

  async getExams(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/exams?${query}`);
    return res.json();
  },

  async getExamDetail(id) {
    const res = await fetch(`${API_BASE}/exams/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không tải được đề thi');
    return data;
  },

  async checkSingleQuestion(examId, questionId, userAnswer) {
    const res = await fetch(`${API_BASE}/exams/${examId}/check-single`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question_id: questionId, user_answer: userAnswer })
    });
    return res.json();
  },

  async submitExam(examId, payload) {
    const res = await fetch(`${API_BASE}/exams/${examId}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Nộp bài thất bại');
    return data;
  },

  // Theories
  async getTheories(subjectId = 'all') {
    const res = await fetch(`${API_BASE}/theories?subject_id=${subjectId}`);
    return res.json();
  },

  async getTheoryDetail(id) {
    const res = await fetch(`${API_BASE}/theories/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không tải được lý thuyết');
    return data;
  },

  async checkTheoryQuiz(theoryId, answers) {
    const res = await fetch(`${API_BASE}/theories/${theoryId}/quiz-check`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answers })
    });
    return res.json();
  },

  async toggleBookmark(userId, itemId, itemType = 'theory', note = '') {
    const res = await fetch(`${API_BASE}/theories/bookmark`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ user_id: userId, item_id: itemId, item_type: itemType, note })
    });
    return res.json();
  },

  // Analytics
  async getUserAnalytics(userId) {
    const res = await fetch(`${API_BASE}/analytics/user/${userId}`, { headers: getHeaders() });
    return res.json();
  },

  async getUserMistakes(userId) {
    const res = await fetch(`${API_BASE}/analytics/mistakes/${userId}`, { headers: getHeaders() });
    return res.json();
  },

  async resolveMistake(mistakeId) {
    const res = await fetch(`${API_BASE}/analytics/mistakes/${mistakeId}/resolve`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // Admin
  async getAdminOverview() {
    const res = await fetch(`${API_BASE}/admin/overview`, { headers: getHeaders() });
    return res.json();
  },

  async createAdminExam(examData) {
    const res = await fetch(`${API_BASE}/admin/exams`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(examData)
    });
    return res.json();
  },

  async updateAdminExam(examId, examData) {
    const res = await fetch(`${API_BASE}/admin/exams/${examId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(examData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật đề thi');
    return data;
  },

  async deleteAdminExam(examId) {
    const res = await fetch(`${API_BASE}/admin/exams/${examId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa đề thi');
    return data;
  },

  async createAdminTheory(theoryData) {
    const res = await fetch(`${API_BASE}/admin/theories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(theoryData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi thêm bài lý thuyết');
    return data;
  },

  async updateAdminTheory(theoryId, theoryData) {
    const res = await fetch(`${API_BASE}/admin/theories/${theoryId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(theoryData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật bài lý thuyết');
    return data;
  },

  async deleteAdminTheory(theoryId) {
    const res = await fetch(`${API_BASE}/admin/theories/${theoryId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa bài lý thuyết');
    return data;
  },

  // Super Admin: User & Role Management
  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi tải danh sách người dùng');
    return data;
  },

  async updateUserRole(userId, role) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật vai trò');
    return data;
  },

  async createAdminUser(userData) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo tài khoản');
    return data;
  },

  async deleteAdminUser(userId) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa tài khoản người dùng');
    return data;
  },

  // Upload image
  async uploadImage(file) {
    const token = localStorage.getItem('eduprep_token');
    const formData = new FormData();
    formData.append('image', file);

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi tải ảnh lên');
    return data;
  },

  // AI Exam Generator
  async generateExamFromAI(formData) {
    const token = localStorage.getItem('eduprep_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/ai/generate-exam`, {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi xử lý AI tạo đề thi');
    return data;
  },

  // Publish Draft Exam from 2-tier Review Studio
  async publishDraftExam(draftData) {
    const res = await fetch(`${API_BASE}/admin/exams/publish-draft`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(draftData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi phê duyệt và xuất bản đề thi');
    return data;
  }
};
