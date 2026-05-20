// ============================================================
// pages/ProfilePage.js
// Edit profile for both employers and candidates
// ============================================================

import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiBriefcase, FiUpload, FiSave } from 'react-icons/fi';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  const [form, setForm] = useState({
    name:               user?.name || '',
    headline:           user?.headline || '',
    bio:                user?.bio || '',
    location:           user?.location || '',
    skills:             (user?.skills || []).join(', '),
    linkedIn:           user?.linkedIn || '',
    github:             user?.github || '',
    portfolio:          user?.portfolio || '',
    // Employer fields
    companyName:        user?.companyName || '',
    companyDescription: user?.companyDescription || '',
    companySize:        user?.companySize || '',
    industry:           user?.industry || '',
    companyWebsite:     user?.companyWebsite || '',
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = user.role === 'employer'
        ? '/api/employers/profile'
        : '/api/candidates/profile';

      const payload = user.role === 'candidate'
        ? { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) }
        : form;

      const { data } = await axios.put(endpoint, payload);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', resumeFile);
      const { data } = await axios.post('/api/candidates/resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ resumeUrl: data.resumeUrl });
      toast.success('Resume uploaded!');
      setResumeFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-page container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1>{user?.name}</h1>
            <p>{user?.email} · <span className="role-tag">{user?.role}</span></p>
          </div>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          {/* ─── Common Fields ───────────────────────────── */}
          <fieldset>
            <legend><FiUser size={16} /> Personal Information</legend>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="City, Country" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
            </div>
          </fieldset>

          {/* ─── Candidate Fields ─────────────────────── */}
          {user?.role === 'candidate' && (
            <>
              <fieldset>
                <legend>Professional Profile</legend>
                <div className="form-group">
                  <label className="form-label">Headline</label>
                  <input className="form-input" placeholder="e.g. Full Stack Developer with 5 years experience"
                    value={form.headline} onChange={e => set('headline', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" rows={4} placeholder="Tell employers about yourself..."
                    value={form.bio} onChange={e => set('bio', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Skills (comma-separated)</label>
                  <input className="form-input" placeholder="React, Node.js, MongoDB, TypeScript"
                    value={form.skills} onChange={e => set('skills', e.target.value)} />
                </div>
              </fieldset>

              <fieldset>
                <legend>Links</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">LinkedIn URL</label>
                    <input className="form-input" placeholder="https://linkedin.com/in/yourname"
                      value={form.linkedIn} onChange={e => set('linkedIn', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub URL</label>
                    <input className="form-input" placeholder="https://github.com/yourname"
                      value={form.github} onChange={e => set('github', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Portfolio URL</label>
                    <input className="form-input" placeholder="https://yourwebsite.com"
                      value={form.portfolio} onChange={e => set('portfolio', e.target.value)} />
                  </div>
                </div>
              </fieldset>

              {/* Resume Upload */}
              <fieldset>
                <legend><FiUpload size={15} /> Resume</legend>
                {user?.resumeUrl && (
                  <p className="current-resume">
                    ✅ Resume uploaded —&nbsp;
                    <a href={`http://localhost:5000${user.resumeUrl}`} target="_blank" rel="noreferrer">View current resume</a>
                  </p>
                )}
                <div className="resume-upload-row">
                  <input
                    type="file" accept=".pdf,.doc,.docx"
                    onChange={e => setResumeFile(e.target.files[0])}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleResumeUpload}
                    disabled={!resumeFile || uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  PDF or Word document, max 5MB
                </p>
              </fieldset>
            </>
          )}

          {/* ─── Employer Fields ──────────────────────── */}
          {user?.role === 'employer' && (
            <fieldset>
              <legend><FiBriefcase size={15} /> Company Information</legend>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input className="form-input" value={form.companyName} onChange={e => set('companyName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <input className="form-input" placeholder="e.g. Technology, Healthcare"
                    value={form.industry} onChange={e => set('industry', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company Size</label>
                  <select className="form-select" value={form.companySize} onChange={e => set('companySize', e.target.value)}>
                    <option value="">Select size</option>
                    {['1-10','11-50','51-200','201-500','501-1000','1000+'].map(s => (
                      <option key={s} value={s}>{s} employees</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input className="form-input" placeholder="https://yourcompany.com"
                    value={form.companyWebsite} onChange={e => set('companyWebsite', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Company Description</label>
                <textarea className="form-textarea" rows={4}
                  placeholder="Tell candidates about your company, culture, and mission..."
                  value={form.companyDescription} onChange={e => set('companyDescription', e.target.value)} />
              </div>
            </fieldset>
          )}

          <div className="profile-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              <FiSave size={16} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
