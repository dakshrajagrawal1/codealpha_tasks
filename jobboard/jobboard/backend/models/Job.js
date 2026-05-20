// ============================================================
// models/Job.js
// Mongoose schema for job postings
// ============================================================

const mongoose = require('mongoose');
const slugify = require('slugify');

const JobSchema = new mongoose.Schema({
  // Who posted this job
  employer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',  // Links to User model
    required: true
  },

  // Basic job info
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: String,  // URL-friendly version: "senior-react-developer"

  company: {
    type: String,
    required: [true, 'Company name is required']
  },
  companyLogo: String,

  // Job details
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: [String],   // List of requirements
  responsibilities: [String],
  benefits: [String],
  skills: [String],          // Required skills: ["React", "TypeScript"]

  // Type & location
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
    required: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  isRemote: { type: Boolean, default: false },

  // Salary
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    period: {
      type: String,
      enum: ['yearly', 'monthly', 'hourly'],
      default: 'yearly'
    }
  },

  // Experience level
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    required: true
  },
  category: {
    type: String,
    required: true  // e.g. "Engineering", "Design", "Marketing"
  },

  // Status and tracking
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  deadline: Date,       // Application deadline
  views: { type: Number, default: 0 },
  applicationCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }  // Show on home page

}, {
  timestamps: true
});

// ─── Create slug from title before saving ─────────────────────
JobSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

// ─── Index for text search ────────────────────────────────────
JobSchema.index({
  title: 'text',
  description: 'text',
  company: 'text',
  skills: 'text'
});

// ─── Index for common queries ─────────────────────────────────
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ employer: 1 });
JobSchema.index({ category: 1 });

module.exports = mongoose.model('Job', JobSchema);
