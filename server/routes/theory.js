const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/theories
router.get('/', (req, res) => {
  try {
    const { subject_id } = req.query;
    let query = `
      SELECT t.*, s.name as subject_name, s.color as subject_color, s.icon as subject_icon,
        u.name as author_name, u.role as author_role,
        (SELECT COUNT(*) FROM theory_quizzes WHERE theory_id = t.id) as quiz_count
      FROM theories t
      JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (subject_id && subject_id !== 'all') {
      query += ` AND t.subject_id = ?`;
      params.push(subject_id);
    }

    query += ` ORDER BY t.subject_id ASC, t.order_index ASC`;

    const theories = db.prepare(query).all(...params);
    res.json(theories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải danh mục lý thuyết' });
  }
});

// GET /api/theories/:id
router.get('/:id', (req, res) => {
  try {
    const theoryId = req.params.id;
    const theory = db.prepare(`
      SELECT t.*, s.name as subject_name, s.color as subject_color, s.icon as subject_icon,
        u.name as author_name, u.role as author_role
      FROM theories t
      JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `).get(theoryId);

    if (!theory) {
      return res.status(404).json({ error: 'Không tìm thấy bài học lý thuyết' });
    }

    const rawQuizzes = db.prepare('SELECT * FROM theory_quizzes WHERE theory_id = ?').all(theoryId);
    const quizzes = rawQuizzes.map(q => ({
      ...q,
      options: JSON.parse(q.options_json)
    }));

    res.json({ theory, quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải bài học lý thuyết' });
  }
});

// POST /api/theories/:id/quiz-check
router.post('/:id/quiz-check', (req, res) => {
  try {
    const theoryId = req.params.id;
    const { answers } = req.body; // { quiz_id: selected_option_id }

    const rawQuizzes = db.prepare('SELECT * FROM theory_quizzes WHERE theory_id = ?').all(theoryId);
    let correctCount = 0;
    const results = [];

    for (const q of rawQuizzes) {
      const userSelected = answers ? answers[q.id] : null;
      const isCorrect = userSelected && String(userSelected).toUpperCase() === String(q.correct_answer).toUpperCase();
      if (isCorrect) correctCount++;

      results.push({
        quiz_id: q.id,
        user_answer: userSelected,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation
      });
    }

    res.json({
      total: rawQuizzes.length,
      correct_count: correctCount,
      percentage: rawQuizzes.length > 0 ? Math.round((correctCount / rawQuizzes.length) * 100) : 0,
      results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi kiểm tra bài tập củng cố' });
  }
});

// POST /api/theories/bookmark
router.post('/bookmark', (req, res) => {
  try {
    const { user_id, item_type, item_id, note } = req.body;
    if (!user_id || !item_id) {
      return res.status(400).json({ error: 'Thiếu thông tin bookmark' });
    }

    const existing = db.prepare(`
      SELECT id FROM user_bookmarks WHERE user_id = ? AND item_type = ? AND item_id = ?
    `).get(user_id, item_type || 'theory', item_id);

    if (existing) {
      db.prepare('DELETE FROM user_bookmarks WHERE id = ?').run(existing.id);
      return res.json({ bookmarked: false, message: 'Đã bỏ lưu bài học' });
    } else {
      db.prepare(`
        INSERT INTO user_bookmarks (user_id, item_type, item_id, note)
        VALUES (?, ?, ?, ?)
      `).run(user_id, item_type || 'theory', item_id, note || '');
      return res.json({ bookmarked: true, message: 'Đã lưu bài học vào danh sách yêu thích' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi cập nhật bookmark' });
  }
});

// GET /api/theories/user-bookmarks/:userId
router.get('/user-bookmarks/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const bookmarks = db.prepare(`
      SELECT b.*, t.topic_title, t.chapter_title, s.name as subject_name
      FROM user_bookmarks b
      LEFT JOIN theories t ON b.item_id = t.id AND b.item_type = 'theory'
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(userId);
    res.json(bookmarks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải danh sách ghi chú bookmark' });
  }
});

module.exports = router;
