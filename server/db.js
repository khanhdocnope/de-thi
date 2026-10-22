const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'eduprep.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      avatar TEXT,
      target_block TEXT DEFAULT 'A00',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      grade INTEGER DEFAULT 12,
      duration_minutes INTEGER DEFAULT 50,
      total_points REAL DEFAULT 10.0,
      exam_type TEXT DEFAULT 'thpt_2025',
      year INTEGER DEFAULT 2025,
      difficulty TEXT DEFAULT 'medium',
      description TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      question_number INTEGER NOT NULL,
      part_type TEXT NOT NULL, -- 'part_1_choice', 'part_2_true_false', 'part_3_short_answer'
      content TEXT NOT NULL,
      image_url TEXT,
      options_json TEXT, -- JSON array of choices/items
      correct_answer_json TEXT NOT NULL,
      explanation TEXT,
      points REAL DEFAULT 0.25,
      topic TEXT,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      exam_id INTEGER NOT NULL,
      score REAL NOT NULL,
      total_score REAL NOT NULL,
      answers_json TEXT NOT NULL,
      time_spent_seconds INTEGER NOT NULL,
      details_json TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (exam_id) REFERENCES exams(id)
    );

    CREATE TABLE IF NOT EXISTS mistakes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      user_answer_json TEXT,
      is_resolved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, question_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS theories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id TEXT NOT NULL,
      chapter_title TEXT NOT NULL,
      topic_title TEXT NOT NULL,
      summary TEXT,
      content_markdown TEXT NOT NULL,
      key_formulas TEXT,
      order_index INTEGER DEFAULT 1,
      created_by INTEGER,
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS theory_quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theory_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options_json TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      FOREIGN KEY (theory_id) REFERENCES theories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_type TEXT NOT NULL, -- 'theory' or 'exam'
      item_id INTEGER NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, item_type, item_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Safe migrations for created_by
  try {
    db.exec('ALTER TABLE exams ADD COLUMN created_by INTEGER REFERENCES users(id)');
  } catch (e) {
    // Column already exists
  }
  try {
    db.exec('ALTER TABLE theories ADD COLUMN created_by INTEGER REFERENCES users(id)');
  } catch (e) {
    // Column already exists
  }
}

initDatabase();

module.exports = db;
