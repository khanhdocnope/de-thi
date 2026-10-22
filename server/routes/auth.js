const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, target_block } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Email này đã được đăng ký tài khoản' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, target_block)
      VALUES (?, ?, ?, 'student', ?)
    `).run(name, email.toLowerCase(), password_hash, target_block || 'A00');

    const newUser = db.prepare('SELECT id, name, email, role, target_block FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: newUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      target_block: user.target_block
    };

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng nhập' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, target_block FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy thông tin người dùng' });
  }
});

module.exports = router;
