const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { authenticateToken } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const examsRoutes = require('./routes/exams');
const theoryRoutes = require('./routes/theory');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(authenticateToken);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/theories', theoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// Serve static client files if built
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'EduPrep THPTQG Backend API', timestamp: new Date() });
});

// SPA wildcard fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 EduPrep Server đang chạy tại http://localhost:${PORT}`);
});
