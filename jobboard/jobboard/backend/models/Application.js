// ============================================================
// models/Application.js
// Mongoose schema for job applications
// ============================================================

const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  // Who applied
  candidate: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  // Which job
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: true
  },
  // Who owns the job (for quick employer queries)
  employer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },

  // Application status (updated by employer)
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'],
    default: 'pending'
  },

  // Cover letter (optional)
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },

  // Resume snapshot at time of application
  resumeUrl: String,
  resumePublicId: String,

  // Employer notes (private)
  notes: String,

  // Track when status changed
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String
  }]

}, {
  timestamps: true
});

// ─── Prevent duplicate applications ──────────────────────────
// A candidate can only apply once per job
ApplicationSchema.index({ candidate: 1, job: 1 }, { unique: true });
ApplicationSchema.index({ employer: 1, status: 1 });
ApplicationSchema.index({ job: 1, createdAt: -1 });

module.exports = mongoose.model('Application', ApplicationSchema);
