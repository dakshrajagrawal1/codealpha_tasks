// ============================================================
// routes/candidates.js
// Candidate profile endpoints
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Resume upload config
const resumeDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resumeDir),
  filename: (req, file, cb) => {
    cb(null, `resume_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF/DOC files allowed'));
  }
});

// ─── PUT /api/candidates/profile ─────────────────────────────
router.put('/profile', protect, authorize('candidate'), async (req, res) => {
  try {
    const allowed = ['name', 'headline', 'bio', 'skills', 'location',
      'linkedIn', 'github', 'portfolio', 'experience', 'education'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── POST /api/candidates/resume ─────────────────────────────
router.post('/resume', protect, authorize('candidate'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id, { resumeUrl }, { new: true }
    );
    res.json({ resumeUrl: user.resumeUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
