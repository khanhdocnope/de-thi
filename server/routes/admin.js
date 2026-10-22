const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth, requireAdmin, requireTeacherOrAdmin } = require('../middleware/auth');

// Apply requireTeacherOrAdmin to all admin/teacher routes
router.use(requireAuth);
router.use(requireTeacherOrAdmin);

// GET /api/admin/overview
router.get('/overview', (req, res) => {
  try {
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
    const totalTeachers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'").get().count;
    const totalAdmins = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get().count;
    const totalUsers = totalStudents + totalTeachers + totalAdmins;
    const totalExams = db.prepare('SELECT COUNT(*) as count FROM exams').get().count;
    const totalQuestions = db.prepare('SELECT COUNT(*) as count FROM questions').get().count;
    const totalTheories = db.prepare('SELECT COUNT(*) as count FROM theories').get().count;
    const totalSubmissions = db.prepare('SELECT COUNT(*) as count FROM submissions').get().count;

    res.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalExams,
      totalQuestions,
      totalTheories,
      totalSubmissions,
      currentUserRole: req.user.role,
      currentUserId: req.user.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải tổng quan quản trị' });
  }
});

// POST /api/admin/exams - Tạo đề thi thủ công
router.post('/exams', (req, res) => {
  try {
    const { title, subject_id, grade, duration_minutes, total_points, exam_type, year, difficulty, description, questions } = req.body;

    if (!title || !subject_id) {
      return res.status(400).json({ error: 'Tiêu đề đề thi và môn học là bắt buộc' });
    }

    const insertExam = db.prepare(`
      INSERT INTO exams (title, subject_id, grade, duration_minutes, total_points, exam_type, year, difficulty, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertExam.run(
      title,
      subject_id,
      grade || 12,
      duration_minutes || 50,
      total_points || 10.0,
      exam_type || 'thpt_2025',
      year || 2025,
      difficulty || 'medium',
      description || '',
      req.user.id
    );

    const examId = result.lastInsertRowid;

    if (Array.isArray(questions) && questions.length > 0) {
      const insertQ = db.prepare(`
        INSERT INTO questions (exam_id, question_number, part_type, content, image_url, options_json, correct_answer_json, explanation, points, topic)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        insertQ.run(
          examId,
          q.question_number || (i + 1),
          q.part_type || 'part_1_choice',
          q.content,
          q.image_url || null,
          q.options ? JSON.stringify(q.options) : null,
          JSON.stringify(q.correct_answer || { answer: 'A' }),
          q.explanation || '',
          q.points || 0.25,
          q.topic || 'Tổng hợp'
        );
      }
    }

    res.json({ success: true, exam_id: examId, message: 'Tạo đề thi mới thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tạo đề thi' });
  }
});

// POST /api/admin/exams/publish-draft - Phê duyệt và xuất bản đề thi từ bản nháp AI
router.post('/exams/publish-draft', (req, res) => {
  try {
    const { 
      title, 
      subject_id, 
      grade, 
      duration_minutes, 
      total_points, 
      exam_type, 
      year, 
      difficulty, 
      description, 
      questions 
    } = req.body;

    if (!title || !subject_id) {
      return res.status(400).json({ error: 'Tiêu đề đề thi và môn học là bắt buộc' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Đề thi phải có ít nhất 1 câu hỏi' });
    }

    // Execute in transaction
    const insertTransaction = db.transaction(() => {
      const insertExam = db.prepare(`
        INSERT INTO exams (title, subject_id, grade, duration_minutes, total_points, exam_type, year, difficulty, description, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const examResult = insertExam.run(
        title,
        subject_id,
        grade || 12,
        duration_minutes || 50,
        total_points || 10.0,
        exam_type || 'thpt_2025',
        year || 2026,
        difficulty || 'medium',
        description || 'Đề thi chuẩn hóa THPTQG được AI hỗ trợ số hóa và Giáo viên phê duyệt 2 lớp',
        req.user.id
      );

      const examId = examResult.lastInsertRowid;

      const insertQ = db.prepare(`
        INSERT INTO questions (exam_id, question_number, part_type, content, image_url, options_json, correct_answer_json, explanation, points, topic)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        insertQ.run(
          examId,
          i + 1, // Đánh số tuần tự liên tục 1..N cho toàn bộ đề thi chuẩn hóa
          q.part_type || 'part_1_choice',
          q.content,
          q.image_url || null,
          q.options ? JSON.stringify(q.options) : null,
          JSON.stringify(q.correct_answer || { answer: 'A' }),
          q.explanation || '',
          q.points !== undefined ? q.points : (q.part_type === 'part_2_true_false' ? 1.0 : q.part_type === 'part_3_short_answer' ? 0.5 : 0.25),
          q.topic || 'Chuyên đề ôn thi'
        );
      }

      return examId;
    });

    const newExamId = insertTransaction();

    res.json({
      success: true,
      exam_id: newExamId,
      message: `Đã phê duyệt và xuất bản đề thi "${title}" (${questions.length} câu) thành công lên ngân hàng đề thi!`
    });
  } catch (err) {
    console.error('Error publishing draft exam:', err);
    res.status(500).json({ error: err.message || 'Lỗi khi lưu và xuất bản đề thi' });
  }
});

// PUT /api/admin/exams/:id - Chỉnh sửa thông tin đề thi
router.put('/exams/:id', (req, res) => {
  try {
    const examId = req.params.id;
    const existing = db.prepare('SELECT * FROM exams WHERE id = ?').get(examId);

    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy đề thi cần chỉnh sửa' });
    }

    // Role check: Admin can edit any, Teacher can ONLY edit their own created exams
    if (req.user.role !== 'admin' && existing.created_by !== req.user.id) {
      return res.status(403).json({ 
        error: 'Quyền truy cập bị từ chối! Thầy cô chỉ có quyền chỉnh sửa đề thi do chính mình tạo.' 
      });
    }

    const { title, subject_id, grade, duration_minutes, total_points, exam_type, year, difficulty, description } = req.body;

    db.prepare(`
      UPDATE exams 
      SET title = ?, subject_id = ?, grade = ?, duration_minutes = ?, total_points = ?, exam_type = ?, year = ?, difficulty = ?, description = ?
      WHERE id = ?
    `).run(
      title || existing.title,
      subject_id || existing.subject_id,
      grade || existing.grade,
      duration_minutes || existing.duration_minutes,
      total_points || existing.total_points,
      exam_type || existing.exam_type,
      year || existing.year,
      difficulty || existing.difficulty,
      description !== undefined ? description : existing.description,
      examId
    );

    res.json({ success: true, message: 'Đã cập nhật thông tin đề thi thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi chỉnh sửa đề thi' });
  }
});

// DELETE /api/admin/exams/:id - Xóa đề thi (Admin xóa được tất cả, Teacher chỉ xóa đề của mình)
router.delete('/exams/:id', (req, res) => {
  try {
    const examId = req.params.id;
    const existing = db.prepare('SELECT * FROM exams WHERE id = ?').get(examId);

    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy đề thi' });
    }

    // Role check
    if (req.user.role !== 'admin' && existing.created_by !== req.user.id) {
      return res.status(403).json({ 
        error: 'Quyền truy cập bị từ chối! Thầy cô chỉ có quyền xóa đề thi do chính mình tạo. Admin là người duy nhất có quyền xóa tất cả đề thi.' 
      });
    }

    db.prepare('DELETE FROM questions WHERE exam_id = ?').run(examId);
    db.prepare('DELETE FROM submissions WHERE exam_id = ?').run(examId);
    db.prepare('DELETE FROM exams WHERE id = ?').run(examId);

    res.json({ success: true, message: 'Đã xóa đề thi khỏi hệ thống thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi xóa đề thi' });
  }
});

// POST /api/admin/theories - Thêm bài học lý thuyết mới
router.post('/theories', (req, res) => {
  try {
    const { subject_id, chapter_title, topic_title, summary, content_markdown, key_formulas } = req.body;
    if (!subject_id || !chapter_title || !topic_title || !content_markdown) {
      return res.status(400).json({ error: 'Vui lòng điền đủ môn học, chương, tên bài và nội dung' });
    }

    const insertTheory = db.prepare(`
      INSERT INTO theories (subject_id, chapter_title, topic_title, summary, content_markdown, key_formulas, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertTheory.run(
      subject_id,
      chapter_title,
      topic_title,
      summary || '',
      content_markdown,
      key_formulas || '',
      req.user.id
    );

    res.json({ success: true, theory_id: result.lastInsertRowid, message: 'Thêm bài học lý thuyết mới thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi thêm bài học lý thuyết' });
  }
});

// PUT /api/admin/theories/:id - Chỉnh sửa bài học lý thuyết
router.put('/theories/:id', (req, res) => {
  try {
    const theoryId = req.params.id;
    const existing = db.prepare('SELECT * FROM theories WHERE id = ?').get(theoryId);

    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy bài học lý thuyết' });
    }

    // Role check: Admin can edit any, Teacher can ONLY edit their own created theories
    if (req.user.role !== 'admin' && existing.created_by !== req.user.id) {
      return res.status(403).json({ 
        error: 'Quyền truy cập bị từ chối! Thầy cô chỉ có quyền chỉnh sửa bài học do chính mình tạo.' 
      });
    }

    const { subject_id, chapter_title, topic_title, summary, content_markdown, key_formulas } = req.body;

    db.prepare(`
      UPDATE theories
      SET subject_id = ?, chapter_title = ?, topic_title = ?, summary = ?, content_markdown = ?, key_formulas = ?
      WHERE id = ?
    `).run(
      subject_id || existing.subject_id,
      chapter_title || existing.chapter_title,
      topic_title || existing.topic_title,
      summary !== undefined ? summary : existing.summary,
      content_markdown || existing.content_markdown,
      key_formulas !== undefined ? key_formulas : existing.key_formulas,
      theoryId
    );

    res.json({ success: true, message: 'Đã cập nhật bài học lý thuyết thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi cập nhật bài học lý thuyết' });
  }
});

// DELETE /api/admin/theories/:id - Xóa bài học lý thuyết
router.delete('/theories/:id', (req, res) => {
  try {
    const theoryId = req.params.id;
    const existing = db.prepare('SELECT * FROM theories WHERE id = ?').get(theoryId);

    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy bài học lý thuyết' });
    }

    // Role check
    if (req.user.role !== 'admin' && existing.created_by !== req.user.id) {
      return res.status(403).json({ 
        error: 'Quyền truy cập bị từ chối! Thầy cô chỉ có quyền xóa bài học do chính mình tạo. Admin là người duy nhất có quyền xóa tất cả bài học.' 
      });
    }

    db.prepare('DELETE FROM theory_quizzes WHERE theory_id = ?').run(theoryId);
    db.prepare("DELETE FROM user_bookmarks WHERE item_type = 'theory' AND item_id = ?").run(theoryId);
    db.prepare('DELETE FROM theories WHERE id = ?').run(theoryId);

    res.json({ success: true, message: 'Đã xóa bài học lý thuyết thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi xóa bài lý thuyết' });
  }
});

// =========================================================================
// SUPER ADMIN ONLY: User & Role Management (Quyền Quản Trị Viên Tối Cao)
// =========================================================================

// GET /api/admin/users - Danh sách người dùng và phân quyền (Chỉ Super Admin)
router.get('/users', requireAdmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.target_block, 
        u.created_at,
        (SELECT COUNT(*) FROM exams WHERE created_by = u.id) as exams_created_count,
        (SELECT COUNT(*) FROM theories WHERE created_by = u.id) as theories_created_count,
        (SELECT COUNT(*) FROM submissions WHERE user_id = u.id) as submissions_count
      FROM users u
      ORDER BY 
        CASE u.role 
          WHEN 'admin' THEN 1 
          WHEN 'teacher' THEN 2 
          ELSE 3 
        END,
        u.id ASC
    `).all();

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải danh sách người dùng' });
  }
});

// PUT /api/admin/users/:id/role - Phân quyền / Chỉnh sửa vai trò (Chỉ Super Admin)
router.put('/users/:id/role', requireAdmin, (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const { role } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Vai trò không hợp lệ. Chọn "student", "teacher", hoặc "admin".' });
    }

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    // Safety: Admin cannot demote self
    if (targetUser.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Bạn không thể tự hạ quyền Admin của chính mình!' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, targetUserId);

    const roleName = role === 'admin' ? 'Quản trị viên (Super Admin)' : role === 'teacher' ? 'Thầy cô (Giáo viên)' : 'Học sinh';

    res.json({
      success: true,
      message: `Đã cập nhật vai trò của "${targetUser.name}" thành [${roleName}] thành công!`,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi cập nhật vai trò người dùng' });
  }
});

// POST /api/admin/users - Thêm tài khoản người dùng trực tiếp kèm phân quyền (Chỉ Super Admin)
router.post('/users', requireAdmin, (req, res) => {
  try {
    const { name, email, password, role, target_block } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Họ tên, email và mật khẩu là bắt buộc' });
    }

    const validRole = ['student', 'teacher', 'admin'].includes(role) ? role : 'teacher';

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Email này đã tồn tại trong hệ thống' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, target_block)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email.toLowerCase(), password_hash, validRole, target_block || 'A00');

    const newUser = db.prepare('SELECT id, name, email, role, target_block, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    res.json({
      success: true,
      user: newUser,
      message: `Đã tạo tài khoản "${name}" với vai trò [${validRole === 'admin' ? 'Admin' : validRole === 'teacher' ? 'Thầy cô' : 'Học sinh'}] thành công!`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tạo tài khoản' });
  }
});

// DELETE /api/admin/users/:id - Xóa tài khoản người dùng (Chỉ Super Admin)
router.delete('/users/:id', requireAdmin, (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);

    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Bạn không thể tự xóa tài khoản của chính mình!' });
    }

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    db.prepare('DELETE FROM submissions WHERE user_id = ?').run(targetUserId);
    db.prepare('DELETE FROM mistakes WHERE user_id = ?').run(targetUserId);
    db.prepare('DELETE FROM user_bookmarks WHERE user_id = ?').run(targetUserId);
    db.prepare('DELETE FROM users WHERE id = ?').run(targetUserId);

    res.json({ success: true, message: `Đã xóa tài khoản "${targetUser.name}" khỏi hệ thống thành công!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi xóa tài khoản người dùng' });
  }
});

module.exports = router;
