const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eduprep-secret-key-2025-thptqg';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
      return next();
    }
    req.user = user;
    next();
  });
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Quyền truy cập bị từ chối. Chỉ dành cho Quản trị viên cao nhất!' });
  }
  next();
}

function requireTeacherOrAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'teacher')) {
    return res.status(403).json({ error: 'Quyền truy cập bị từ chối. Chỉ dành cho Thầy cô hoặc Quản trị viên!' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireAuth,
  requireAdmin,
  requireTeacherOrAdmin
};
