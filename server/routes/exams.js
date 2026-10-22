const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/exams/subjects
router.get('/subjects', (req, res) => {
  try {
    const subjects = db.prepare(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM exams WHERE subject_id = s.id) as exam_count,
        (SELECT COUNT(*) FROM theories WHERE subject_id = s.id) as theory_count
      FROM subjects s
    `).all();
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải danh mục môn học' });
  }
});

// GET /api/exams
router.get('/', (req, res) => {
  try {
    const { subject_id, exam_type, year } = req.query;
    let query = `
      SELECT e.*, s.name as subject_name, s.color as subject_color, s.icon as subject_icon,
        u.name as author_name, u.role as author_role,
        (SELECT COUNT(*) FROM questions WHERE exam_id = e.id) as question_count
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (subject_id && subject_id !== 'all') {
      query += ` AND e.subject_id = ?`;
      params.push(subject_id);
    }
    if (exam_type && exam_type !== 'all') {
      query += ` AND e.exam_type = ?`;
      params.push(exam_type);
    }
    if (year) {
      query += ` AND e.year = ?`;
      params.push(year);
    }

    query += ` ORDER BY e.id DESC`;

    const exams = db.prepare(query).all(...params);
    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải danh sách đề thi' });
  }
});

// GET /api/exams/:id
router.get('/:id', (req, res) => {
  try {
    const examId = req.params.id;
    const exam = db.prepare(`
      SELECT e.*, s.name as subject_name, s.color as subject_color, s.icon as subject_icon,
        u.name as author_name, u.role as author_role
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `).get(examId);

    if (!exam) {
      return res.status(404).json({ error: 'Không tìm thấy đề thi' });
    }

    const rawQuestions = db.prepare(`
      SELECT * FROM questions WHERE exam_id = ? ORDER BY question_number ASC, id ASC
    `).all(examId);

    const questions = rawQuestions.map(q => ({
      ...q,
      options: q.options_json ? JSON.parse(q.options_json) : null,
      correct_answer: JSON.parse(q.correct_answer_json)
    }));

    res.json({ exam, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải chi tiết đề thi' });
  }
});

// POST /api/exams/:id/check-single (For practice mode immediate feedback)
router.post('/:id/check-single', (req, res) => {
  try {
    const { question_id, user_answer } = req.body;
    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(question_id);

    if (!question) {
      return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
    }

    const correctAnswer = JSON.parse(question.correct_answer_json);
    const evalResult = gradeQuestion(question.part_type, question.points, user_answer, correctAnswer);

    res.json({
      is_correct: evalResult.is_correct,
      earned_points: evalResult.earned_points,
      max_points: question.points,
      correct_answer: correctAnswer,
      explanation: question.explanation,
      sub_results: evalResult.sub_results || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi kiểm tra câu hỏi' });
  }
});

// POST /api/exams/:id/submit
router.post('/:id/submit', (req, res) => {
  try {
    const examId = req.params.id;
    const { answers, time_spent_seconds, user_id } = req.body;

    const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(examId);
    if (!exam) {
      return res.status(404).json({ error: 'Không tìm thấy đề thi' });
    }

    const rawQuestions = db.prepare('SELECT * FROM questions WHERE exam_id = ? ORDER BY question_number ASC, id ASC').all(examId);

    let totalScore = 0;
    let maxPossibleScore = 0;
    const questionResults = [];
    const wrongQuestionIds = [];

    for (const q of rawQuestions) {
      const correctAnswer = JSON.parse(q.correct_answer_json);
      const userAnswer = answers ? answers[q.id] : null;
      maxPossibleScore += q.points;

      const evalResult = gradeQuestion(q.part_type, q.points, userAnswer, correctAnswer);
      totalScore += evalResult.earned_points;

      if (!evalResult.is_correct) {
        wrongQuestionIds.push({
          question_id: q.id,
          user_answer: userAnswer
        });
      }

      questionResults.push({
        question_id: q.id,
        question_number: q.question_number,
        part_type: q.part_type,
        points: q.points,
        earned_points: evalResult.earned_points,
        is_correct: evalResult.is_correct,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        explanation: q.explanation,
        sub_results: evalResult.sub_results || null,
        topic: q.topic
      });
    }

    // Scale to total_points standard (e.g. 10.0)
    const finalScore = maxPossibleScore > 0 
      ? Math.round(((totalScore / maxPossibleScore) * exam.total_points) * 100) / 100 
      : 0;

    // Save submission if user_id is provided
    let submissionId = null;
    if (user_id) {
      const insertSub = db.prepare(`
        INSERT INTO submissions (user_id, exam_id, score, total_score, answers_json, time_spent_seconds, details_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        user_id,
        examId,
        finalScore,
        exam.total_points,
        JSON.stringify(answers || {}),
        time_spent_seconds || 0,
        JSON.stringify(questionResults)
      );
      submissionId = insertSub.lastInsertRowid;

      // Update mistakes table for wrong answers
      const upsertMistake = db.prepare(`
        INSERT INTO mistakes (user_id, question_id, user_answer_json, is_resolved, updated_at)
        VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, question_id) DO UPDATE SET
          user_answer_json = excluded.user_answer_json,
          is_resolved = 0,
          updated_at = CURRENT_TIMESTAMP
      `);

      for (const wrong of wrongQuestionIds) {
        upsertMistake.run(user_id, wrong.question_id, JSON.stringify(wrong.user_answer));
      }
    }

    res.json({
      submission_id: submissionId,
      score: finalScore,
      total_points: exam.total_points,
      percentage: Math.round((finalScore / exam.total_points) * 100),
      time_spent_seconds: time_spent_seconds || 0,
      total_questions: rawQuestions.length,
      correct_count: questionResults.filter(r => r.is_correct).length,
      question_results: questionResults
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi nộp bài thi' });
  }
});

// Helper: Grade question by format
function gradeQuestion(partType, maxPoints, userAnswer, correctAnswer) {
  if (!userAnswer) {
    return { is_correct: false, earned_points: 0 };
  }

  if (partType === 'part_1_choice') {
    const isCorrect = String(userAnswer).trim().toUpperCase() === String(correctAnswer.answer).trim().toUpperCase();
    return {
      is_correct: isCorrect,
      earned_points: isCorrect ? maxPoints : 0
    };
  }

  if (partType === 'part_2_true_false') {
    // Format 2025: 4 sub-items a, b, c, d
    // MOET 2025 scoring: 1 correct: 0.1đ, 2: 0.25đ, 3: 0.5đ, 4: 1.0đ
    let correctCount = 0;
    const subResults = {};
    const keys = ['a', 'b', 'c', 'd'];

    keys.forEach(k => {
      const uVal = userAnswer[k];
      const cVal = correctAnswer[k];
      const match = uVal !== undefined && Boolean(uVal) === Boolean(cVal);
      subResults[k] = { user: uVal, correct: cVal, match };
      if (match) correctCount++;
    });

    let earned = 0;
    if (correctCount === 1) earned = 0.1;
    else if (correctCount === 2) earned = 0.25;
    else if (correctCount === 3) earned = 0.5;
    else if (correctCount === 4) earned = 1.0;

    return {
      is_correct: correctCount === 4,
      earned_points: earned,
      sub_results: subResults,
      correct_count: correctCount
    };
  }

  if (partType === 'part_3_short_answer') {
    const uStr = String(userAnswer).trim().replace(',', '.');
    const cStr = String(correctAnswer.answer).trim().replace(',', '.');
    const isCorrect = uStr === cStr || (Number(uStr) === Number(cStr) && !isNaN(Number(uStr)));
    return {
      is_correct: isCorrect,
      earned_points: isCorrect ? maxPoints : 0
    };
  }

  return { is_correct: false, earned_points: 0 };
}

module.exports = router;
