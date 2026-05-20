// ============================================================
// routes/jobs.js
// Job posting endpoints: list, search, create, update, delete
// ============================================================

const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

// ─── GET /api/jobs ────────────────────────────────────────────
// Public: Get all active jobs with search & filters
router.get('/', async (req, res) => {
  try {
    const {
      search,       // Text search query
      category,     // Engineering, Design, etc.
      type,         // full-time, part-time, etc.
      location,     // City/country filter
      experience,   // entry, mid, senior, etc.
      remote,       // "true" for remote only
      page = 1,
      limit = 10,
      sort = 'newest'
    } = req.query;

    // Start with active jobs only
    let query = { status: 'active' };

    // Full-text search (uses MongoDB text index)
    if (search) {
      query.$text = { $search: search };
    }

    // Apply filters
    if (category) query.category = category;
    if (type) query.type = type;
    if (location) query.location = new RegExp(location, 'i'); // case-insensitive
    if (experience) query.experienceLevel = experience;
    if (remote === 'true') query.isRemote = true;

    // Sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      salary_high: { 'salary.max': -1 },
      salary_low: { 'salary.min': 1 },
    };
    const sortBy = sortOptions[sort] || sortOptions.newest;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('employer', 'name companyName companyLogo')  // Get employer info
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(query)
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/jobs/featured ───────────────────────────────────
// Public: Get featured jobs for home page
router.get('/featured', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active', featured: true })
      .populate('employer', 'name companyName companyLogo')
      .sort({ createdAt: -1 })
      .limit(6);
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/jobs/:id ────────────────────────────────────────
// Public: Get single job details + increment view count
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },  // Increment views by 1
      { new: true }
    ).populate('employer', 'name companyName companyLogo companyDescription companyWebsite');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ job });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/jobs ───────────────────────────────────────────
// Protected + Employer only: Create a new job
router.post('/', protect, authorize('employer'), async (req, res) => {
  try {
    // Attach employer ID from auth token
    const job = await Job.create({
      ...req.body,
      employer: req.user.id,
      company: req.user.companyName || req.body.company,
      companyLogo: req.user.companyLogo
    });
    res.status(201).json({ job });
  } catch (err) {
    console.error('Create job error:', err);
    res.status(400).json({ error: err.message });
  }
});

// ─── PUT /api/jobs/:id ────────────────────────────────────────
// Protected + Employer only: Update own job
router.put('/:id', protect, authorize('employer'), async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Ensure employer can only edit their own jobs
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.json({ job });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── DELETE /api/jobs/:id ─────────────────────────────────────
// Protected + Employer only: Delete own job
router.delete('/:id', protect, authorize('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
