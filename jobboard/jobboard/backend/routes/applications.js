// ============================================================
// routes/applications.js
// Job application endpoints
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const {
  sendEmail,
  applicationConfirmationEmail,
  newApplicationEmail,
  statusUpdateEmail
} = require('../utils/sendEmail');

// ─── File Upload Config (local storage) ──────────────────────
const uploadsDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `resume_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    // Only allow PDF and Word docs
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// ─── POST /api/applications ───────────────────────────────────
// Candidate submits a job application
router.post('/', protect, authorize('candidate'), upload.single('resume'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Get job details
    const job = await Job.findById(jobId).populate('employer', 'name email');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'active') return res.status(400).json({ error: 'This job is no longer accepting applications' });

    // Check for duplicate application
    const existing = await Application.findOne({
      candidate: req.user.id,
      job: jobId
    });
    if (existing) return res.status(400).json({ error: 'You have already applied for this job' });

    // Determine resume URL (uploaded file or existing profile resume)
    let resumeUrl = req.user.resumeUrl;
    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
    }

    // Create application
    const application = await Application.create({
      candidate: req.user.id,
      job: jobId,
      employer: job.employer._id,
      coverLetter,
      resumeUrl
    });

    // Increment job application counter
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // Populate for response
    await application.populate([
      { path: 'job', select: 'title company' },
      { path: 'candidate', select: 'name email' }
    ]);

    // ─── Send Email Notifications ───────────────────────────
    try {
      // To candidate: confirm application received
      await sendEmail({
        to: req.user.email,
        subject: `Application Submitted: ${job.title} at ${job.company}`,
        html: applicationConfirmationEmail(req.user.name, job.title, job.company)
      });

      // To employer: new application notification
      await sendEmail({
        to: job.employer.email,
        subject: `New Application: ${job.title}`,
        html: newApplicationEmail(job.employer.name, req.user.name, job.title, application._id)
      });
    } catch (emailErr) {
      // Don't fail the request if email fails
      console.error('Email notification failed:', emailErr.message);
    }

    res.status(201).json({ application, message: 'Application submitted successfully!' });
  } catch (err) {
    console.error('Application error:', err);
    res.status(400).json({ error: err.message });
  }
});

// ─── GET /api/applications/my ─────────────────────────────────
// Candidate: get all my applications
router.get('/my', protect, authorize('candidate'), async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title company location type salary status')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/applications/job/:jobId ─────────────────────────
// Employer: get all applications for a job
router.get('/job/:jobId', protect, authorize('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Make sure employer owns this job
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email headline skills resumeUrl location')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PUT /api/applications/:id/status ────────────────────────
// Employer: update application status (reviewing, shortlisted, etc.)
router.put('/:id/status', protect, authorize('employer'), async (req, res) => {
  try {
    const { status, note } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('job', 'title company');

    if (!application) return res.status(404).json({ error: 'Application not found' });

    // Only the job's employer can update status
    if (application.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const oldStatus = application.status;
    application.status = status;
    application.statusHistory.push({ status, note });
    await application.save();

    // Notify candidate of status change
    if (status !== oldStatus) {
      try {
        await sendEmail({
          to: application.candidate.email,
          subject: `Application Update: ${application.job.title}`,
          html: statusUpdateEmail(
            application.candidate.name,
            application.job.title,
            application.job.company,
            status
          )
        });
      } catch (emailErr) {
        console.error('Status email failed:', emailErr.message);
      }
    }

    res.json({ application });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/applications/:id ────────────────────────────
// Candidate: withdraw an application
router.delete('/:id', protect, authorize('candidate'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    if (application.candidate.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await application.deleteOne();
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationCount: -1 } });

    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
