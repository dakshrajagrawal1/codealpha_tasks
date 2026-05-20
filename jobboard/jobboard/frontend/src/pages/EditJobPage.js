// pages/EditJobPage.js — Pre-fills form with existing job data
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './PostJobPage.css';

const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Sales', 'Data', 'Operations', 'Legal', 'Customer Service', 'Other'];

export default function EditJobPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm]       = useState(null);

  useEffect(() => {
    axios.get(`/api/jobs/${id}`).then(({ data }) => {
      const j = data.job;
      setForm({
        title: j.title || '', category: j.category || '', type: j.type || 'full-time',
        location: j.location || '', experienceLevel: j.experienceLevel || 'mid',
        description: j.description || '', isRemote: j.isRemote || false,
        salary: { min: j.salary?.min || '', max: j.salary?.max || '', currency: 'USD', period: j.salary?.period || 'yearly' },
        skills: (j.skills || []).join(', '),
        requirements: (j.requirements || []).join('\n'),
        responsibilities: (j.responsibilities || []).join('\n'),
        benefits: (j.benefits || []).join('\n'),
        deadline: j.deadline ? j.deadline.split('T')[0] : '',
        status: j.status || 'active'
      });
    }).catch(() => { toast.error('Job not found'); navigate('/employer/dashboard'); });
  }, [id]);

  if (!form) return <div className="spinner" />;

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const setSalary = (f, v) => setForm(p => ({ ...p, salary: { ...p.salary, [f]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        requirements: form.requirements.split('\n').map(s => s.trim()).filter(Boolean),
        responsibilities: form.responsibilities.split('\n').map(s => s.trim()).filter(Boolean),
        benefits: form.benefits.split('\n').map(s => s.trim()).filter(Boolean),
        salary: { ...form.salary, min: form.salary.min ? Number(form.salary.min) : undefined, max: form.salary.max ? Number(form.salary.max) : undefined }
      };
      await axios.put(`/api/jobs/${id}`, payload);
      toast.success('Job updated!');
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="post-job-page container">
      <div className="post-job-card">
        <div className="post-job-header">
          <h1>Edit Job Posting</h1>
          <p>Update the details for this job</p>
        </div>
        <form onSubmit={handleSubmit} className="post-job-form">
          <fieldset>
            <legend>Basic Information</legend>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                  {['full-time','part-time','contract','internship','remote'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select className="form-select" value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                  {['entry','mid','senior','lead','executive'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} required />
            </div>
          </fieldset>
          <fieldset>
            <legend>Job Details</legend>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" rows={6} value={form.description} onChange={e => set('description', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Requirements (one per line)</label>
              <textarea className="form-textarea" rows={4} value={form.requirements} onChange={e => set('requirements', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Skills (comma-separated)</label>
              <input className="form-input" value={form.skills} onChange={e => set('skills', e.target.value)} />
            </div>
          </fieldset>
          <div className="post-job-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/employer/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
