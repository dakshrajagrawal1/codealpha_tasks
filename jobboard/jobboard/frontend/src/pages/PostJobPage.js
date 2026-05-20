// ============================================================
// pages/PostJobPage.js
// Form for employers to create new job postings
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './PostJobPage.css';

const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Sales', 'Data', 'Operations', 'Legal', 'Customer Service', 'Other'];

export default function PostJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', category: '', type: 'full-time', location: '',
    experienceLevel: 'mid', description: '', isRemote: false,
    salary: { min: '', max: '', currency: 'USD', period: 'yearly' },
    skills: '', requirements: '', responsibilities: '', benefits: '',
    deadline: '', status: 'active'
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setSalary = (field, value) => setForm(prev => ({ ...prev, salary: { ...prev.salary, [field]: value } }));

  // Convert comma-separated strings to arrays
  const toArray = (str) => str.split('\n').map(s => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        requirements: toArray(form.requirements),
        responsibilities: toArray(form.responsibilities),
        benefits: toArray(form.benefits),
        salary: {
          ...form.salary,
          min: form.salary.min ? Number(form.salary.min) : undefined,
          max: form.salary.max ? Number(form.salary.max) : undefined,
        }
      };
      await axios.post('/api/jobs', payload);
      toast.success('Job posted successfully!');
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-page container">
      <div className="post-job-card">
        <div className="post-job-header">
          <h1>Post a New Job</h1>
          <p>Fill in the details below to attract the right candidates</p>
        </div>

        <form onSubmit={handleSubmit} className="post-job-form">
          {/* Basic Info */}
          <fieldset>
            <legend>Basic Information</legend>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-input" placeholder="e.g. Senior React Developer"
                  value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Type *</label>
                <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Experience Level *</label>
                <select className="form-select" value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input className="form-input" placeholder="e.g. New York, NY or Remote"
                  value={form.location} onChange={e => set('location', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input type="date" className="form-input"
                  value={form.deadline} onChange={e => set('deadline', e.target.value)} />
              </div>
            </div>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.isRemote} onChange={e => set('isRemote', e.target.checked)} />
              This is a remote-friendly position
            </label>
          </fieldset>

          {/* Salary */}
          <fieldset>
            <legend>Salary (optional)</legend>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Min Salary (USD/year)</label>
                <input type="number" className="form-input" placeholder="e.g. 60000"
                  value={form.salary.min} onChange={e => setSalary('min', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Salary</label>
                <input type="number" className="form-input" placeholder="e.g. 90000"
                  value={form.salary.max} onChange={e => setSalary('max', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Period</label>
                <select className="form-select" value={form.salary.period} onChange={e => setSalary('period', e.target.value)}>
                  <option value="yearly">Per Year</option>
                  <option value="monthly">Per Month</option>
                  <option value="hourly">Per Hour</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Description */}
          <fieldset>
            <legend>Job Details</legend>
            <div className="form-group">
              <label className="form-label">Job Description *</label>
              <textarea className="form-textarea" rows={6}
                placeholder="Describe the role, team, and what makes this opportunity great..."
                value={form.description} onChange={e => set('description', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Requirements (one per line)</label>
              <textarea className="form-textarea" rows={4}
                placeholder="5+ years of React experience&#10;Strong TypeScript skills&#10;Experience with REST APIs"
                value={form.requirements} onChange={e => set('requirements', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Responsibilities (one per line)</label>
              <textarea className="form-textarea" rows={4}
                placeholder="Lead frontend architecture decisions&#10;Mentor junior developers&#10;Collaborate with product team"
                value={form.responsibilities} onChange={e => set('responsibilities', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Benefits (one per line)</label>
              <textarea className="form-textarea" rows={3}
                placeholder="Health, dental & vision insurance&#10;$1,000/year learning budget&#10;Flexible remote work"
                value={form.benefits} onChange={e => set('benefits', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Required Skills (comma-separated)</label>
              <input className="form-input" placeholder="React, TypeScript, Node.js, MongoDB"
                value={form.skills} onChange={e => set('skills', e.target.value)} />
            </div>
          </fieldset>

          {/* Status */}
          <fieldset>
            <legend>Publish Settings</legend>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Publish Immediately</option>
                <option value="draft">Save as Draft</option>
              </select>
            </div>
          </fieldset>

          <div className="post-job-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/employer/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Posting...' : '🚀 Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
