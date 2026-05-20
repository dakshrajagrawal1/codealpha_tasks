// ============================================================
// models/User.js
// Mongoose schema for all users (employers & candidates)
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Basic info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,  // No duplicate emails
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false  // Never return password in queries by default
  },
  role: {
    type: String,
    enum: ['candidate', 'employer'],
    required: true
  },

  // Candidate-specific fields
  headline: String,          // e.g. "Full Stack Developer with 5 years experience"
  bio: String,
  skills: [String],          // Array like ["React", "Node.js", "MongoDB"]
  resumeUrl: String,         // Link to uploaded PDF resume
  resumePublicId: String,    // Cloudinary public_id for deletion
  experience: [{
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  education: [{
    degree: String,
    school: String,
    year: Number
  }],
  location: String,
  linkedIn: String,
  github: String,
  portfolio: String,

  // Employer-specific fields
  companyName: String,
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  industry: String,
  companyWebsite: String,
  companyLogo: String,
  companyLogoPublicId: String,
  companyDescription: String,

  // Account status
  isVerified: { type: Boolean, default: false },
  avatar: String,
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

// ─── Pre-save Hook: Hash password before saving ───────────────
// This runs AUTOMATICALLY before every .save() call
UserSchema.pre('save', async function(next) {
  // Only hash if password was actually changed
  if (!this.isModified('password')) return next();

  // bcrypt cost factor 12 = secure but not too slow
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Method: Compare passwords ──────────────────────
// Usage: const isMatch = await user.matchPassword(enteredPassword)
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
