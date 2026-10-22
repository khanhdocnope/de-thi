const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/analytics/user/:userId
router.get('/user/:userId', (req, res) => {
  try {
    const userId = req.params.userId;

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_exams,
        COALESCE(AVG(score), 0) as avg_score,
        COALESCE(MAX(score), 0) as max_score,
        COALESCE(SUM(time_spent_seconds), 0) as total_time_seconds
      FROM submissions
      WHERE user_id = ?
    `).get(userId);

    const recentSubmissions = db.prepare(`
      SELECT sub.*, e.title as exam_title, s.name as subject_name, s.color as subject_color, s.id as subject_id
      FROM submissions sub
      JOIN exams e ON sub.exam_id = e.id
      JOIN subjects s ON e.subject_id = s.id
      WHERE sub.user_id = ?
      ORDER BY sub.completed_at DESC
      LIMIT 10
    `).all(userId);

    // Mistake count
    const mistakeCount = db.prepare(`
      SELECT COUNT(*) as count FROM mistakes WHERE user_id = ? AND is_resolved = 0
    `).get(userId);

    // Topic performance analysis
    const topicAnalysis = {};
    for (const sub of recentSubmissions) {
      if (sub.details_json) {
        try {
          const details = JSON.parse(sub.details_json);
          for (const item of details) {
            const topic = item.topic || 'Chủ đề chung';
            if (!topicAnalysis[topic]) {
              topicAnalysis[topic] = { total: 0, correct: 0 };
            }
            topicAnalysis[topic].total += 1;
            if (item.is_correct) {
              topicAnalysis[topic].correct += 1;
            }
          }
        } catch (e) {
          // Ignore json parse error for malformed details
        }
      }
    }

    const topicStats = Object.keys(topicAnalysis).map(topic => {
      const { total, correct } = topicAnalysis[topic];
      const rate = Math.round((correct / total) * 100);
      return {
        topic,
        total,
        correct,
        accuracy_rate: rate,
        status: rate >= 80 ? 'strong' : rate >= 50 ? 'medium' : 'weak'
      };
    });

    res.json({
      summary: {
        total_exams: stats.total_exams,
        avg_score: Math.round(stats.avg_score * 10) / 10,
        max_score: Math.round(stats.max_score * 10) / 10,
        total_time_minutes: Math.round(stats.total_time_seconds / 60),
        unresolved_mistakes: mistakeCount.count
      },
      recent_submissions: recentSubmissions,
      topic_stats: topicStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi phân tích kết quả học tập' });
  }
});

// GET /api/analytics/mistakes/:userId
router.get('/mistakes/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const mistakes = db.prepare(`
      SELECT m.*, q.question_number, q.part_type, q.content, q.options_json, q.correct_answer_json, q.explanation, q.topic,
             e.id as exam_id, e.title as exam_title, s.name as subject_name, s.color as subject_color
      FROM mistakes m
      JOIN questions q ON m.question_id = q.id
      JOIN exams e ON q.exam_id = e.id
      JOIN subjects s ON e.subject_id = s.id
      WHERE m.user_id = ? AND m.is_resolved = 0
      ORDER BY m.updated_at DESC
    `).all(userId);

    const formatted = mistakes.map(m => ({
      ...m,
      options: m.options_json ? JSON.parse(m.options_json) : null,
      correct_answer: JSON.parse(m.correct_answer_json),
      user_answer: m.user_answer_json ? JSON.parse(m.user_answer_json) : null
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải sổ tay câu làm sai' });
  }
});

// POST /api/analytics/mistakes/:id/resolve
router.post('/mistakes/:id/resolve', (req, res) => {
  try {
    const mistakeId = req.params.id;
    db.prepare('UPDATE mistakes SET is_resolved = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(mistakeId);
    res.json({ success: true, message: 'Đã giải quyết xong câu sai!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái câu sai' });
  }
});

module.exports = router;
