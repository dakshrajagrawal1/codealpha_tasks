// ============================================================
// pages/JobDetailPage.js
// Full job details + application form
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import {
  FiMapPin, FiClock, FiDollarSign, FiBriefcase,
  FiUsers, FiCalendar, FiGlobe, FiArrowLeft,
  FiBookmark, FiShare2, FiCheckCircle
} from 'react-icons/fi';
import './JobDetailPage.css';

export default function JobDetailPage() {
  const { id }      = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [job, setJob]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume]     = useState(null);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const { data } = await axios.get(`/api/jobs/${id}`);
      setJob(data.job);
    } catch (err) {
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }

    setApplying(true);
    try {
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('coverLetter', coverLetter);
      if (resume) formData.append('resume', resume);

      await axios.post('/api/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setApplied(true);
      setShowForm(false);
      toast.success('Application submitted! Check your email for confirmation.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!job) return null;

  const salaryText = job.salary?.min || job.salary?.max
    ? `$${(job.salary.min / 1000).toFixed(0)}K – $${(job.salary.max / 1000).toFixed(0)}K / ${job.salary.period}`
    : 'Not specified';

  return (
    <div className="job-detail-page">
      <div className="container">
        <button onClick={() => navigate('/jobs')} className="back-btn">
          <FiArrowLeft /> Back to Jobs
        </button>

        <div className="job-detail-layout">
          {/* ─── Main Content ─────────────────────────────── */}
          <div className="job-detail-main">
            {/* Header */}
            <div className="job-detail-header card">
              <div className="jd-company-row">
                <div className="jd-logo">
                  {job.companyLogo
                    ? <img src={job.companyLogo} alt={job.company} />
                    : <span>{job.company?.[0]}</span>
                  }
                </div>
                <div>
                  <h1>{job.title}</h1>
                  <p className="jd-company">{job.company}</p>
                </div>
              </div>

              <div className="jd-meta-tags">
                <span className="badge badge-success">{job.type}</span>
                <span className="badge badge-gray">{job.experienceLevel} level</span>
                <span className="badge badge-gray">{job.category}</span>
                {job.isRemote && <span className="badge badge-info">Remote</span>}
              </div>

              <div className="jd-quick-info">
                <span><FiMapPin size={15} /> {job.location}</span>
                <span><FiDollarSign size={15} /> {salaryText}</span>
                <span><FiUsers size={15} /> {job.applicationCount} applicants</span>
                <span><FiClock size={15} /> Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                {job.deadline && <span><FiCalendar size={15} /> Deadline: {format(new Date(job.deadline), 'MMM d, yyyy')}</span>}
              </div>

              <div className="jd-actions">
                {applied ? (
                  <div className="applied-badge">
                    <FiCheckCircle size={18} /> Application Submitted!
                  </div>
                ) : user?.role === 'candidate' ? (
                  <button className="btn btn-primary btn-lg" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Apply Now'}
                  </button>
                ) : !user ? (
                  <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                    Sign In to Apply
                  </button>
                ) : null}
                <button className="btn btn-ghost" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}>
                  <FiShare2 /> Share
                </button>
              </div>

              {/* Application Form */}
              {showForm && !applied && (
                <form onSubmit={handleApply} className="apply-form">
                  <h3>Your Application</h3>
                  <div className="form-group">
                    <label className="form-label">Cover Letter (optional)</label>
                    <textarea
                      className="form-textarea"
                      rows={5}
                      placeholder="Tell the employer why you're a great fit for this role..."
                      value={coverLetter}
                      onChange={e => setCoverLetter(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Resume (PDF/DOC — max 5MB)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => setResume(e.target.files[0])}
                      className="form-input"
                    />
                    <p className="form-help">If no file selected, your profile resume will be used.</p>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={applying}>
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>

            {/* Description */}
            <div className="card job-detail-section">
              <h2>Job Description</h2>
              <div className="job-description-text">{job.description}</div>
            </div>

            {job.requirements?.length > 0 && (
              <div className="card job-detail-section">
                <h2>Requirements</h2>
                <ul className="jd-list">
                  {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {job.responsibilities?.length > 0 && (
              <div className="card job-detail-section">
                <h2>Responsibilities</h2>
                <ul className="jd-list">
                  {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {job.benefits?.length > 0 && (
              <div className="card job-detail-section">
                <h2>Benefits</h2>
                <ul className="jd-list benefits">
                  {job.benefits.map((b, i) => <li key={i}><FiCheckCircle size={15} /> {b}</li>)}
                </ul>
              </div>
            )}

            {job.skills?.length > 0 && (
              <div className="card job-detail-section">
                <h2>Skills Required</h2>
                <div className="skill-tags">
                  {job.skills.map(s => <span key={s} className="badge badge-primary skill-tag">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* ─── Sidebar ─────────────────────────────────── */}
          <div className="job-detail-sidebar">
            <div className="card sidebar-card">
              <h3>About the Company</h3>
              <div className="sidebar-company">
                <div className="jd-logo sm">
                  {job.companyLogo
                    ? <img src={job.companyLogo} alt={job.company} />
                    : <span>{job.company?.[0]}</span>
                  }
                </div>
                <strong>{job.company}</strong>
              </div>
              {job.employer?.companyDescription && (
                <p className="company-desc">{job.employer.companyDescription}</p>
              )}
              {job.employer?.companyWebsite && (
                <a href={job.employer.companyWebsite} target="_blank" rel="noreferrer" className="company-website">
                  <FiGlobe size={14} /> Visit Website
                </a>
              )}
            </div>

            <div className="card sidebar-card">
              <h3>Job Overview</h3>
              <dl className="job-overview">
                <dt>Posted</dt><dd>{format(new Date(job.createdAt), 'MMM d, yyyy')}</dd>
                <dt>Location</dt><dd>{job.location}</dd>
                <dt>Job Type</dt><dd style={{ textTransform: 'capitalize' }}>{job.type}</dd>
                <dt>Experience</dt><dd style={{ textTransform: 'capitalize' }}>{job.experienceLevel}</dd>
                <dt>Category</dt><dd>{job.category}</dd>
                {job.deadline && <><dt>Deadline</dt><dd>{format(new Date(job.deadline), 'MMM d, yyyy')}</dd></>}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
