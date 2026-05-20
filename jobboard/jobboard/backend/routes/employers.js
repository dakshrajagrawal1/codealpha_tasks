// ============================================================
// routes/employers.js
// Employer dashboard endpoints
// ============================================================

const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ─── GET /api/employers/dashboard ────────────────────────────
// Employer: get dashboard stats
router.get('/dashboard', protect, authorize('employer'), async (req, res) => {
  try {
    const [totalJobs, activeJobs, totalApplications, recentApplications] = await Promise.all([
      Job.countDocuments({ employer: req.user.id }),
      Job.countDocuments({ employer: req.user.id, status: 'active' }),
      Application.countDocuments({ employer: req.user.id }),
      Application.find({ employer: req.user.id })
        .populate('candidate', 'name email headline')
        .populate('job', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({ totalJobs, activeJobs, totalApplications, recentApplications });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/employers/jobs ──────────────────────────────────
// Employer: get all their posted jobs
router.get('/jobs', protect, authorize('employer'), async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PUT /api/employers/profile ───────────────────────────────
// Employer: update company profile
router.put('/profile', protect, authorize('employer'), async (req, res) => {
  try {
    const allowed = ['name', 'companyName', 'companyDescription', 'companySize',
      'industry', 'companyWebsite', 'location'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true, runValidators: true
    });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
