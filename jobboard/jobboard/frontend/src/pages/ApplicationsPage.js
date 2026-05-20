// ============================================================
// pages/ApplicationsPage.js
// Employer views all applicants for a specific job
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { FiArrowLeft, FiDownload, FiMail, FiMapPin } from 'react-icons/fi';
import './ApplicationsPage.css';

const STATUS_OPTIONS = ['pending','reviewing','shortlisted','interview','offered','rejected'];

const statusColors = {
  pending:     'badge-warning',
  reviewing:   'badge-info',
  shortlisted: 'badge-primary',
  interview:   'badge-success',
  offered:     'badge-success',
  rejected:    'badge-danger',
};

export default function ApplicationsPage() {
  const { id } = useParams(); // job ID
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // selected application for detail view
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [appsRes, jobRes] = await Promise.all([
        axios.get(`/api/applications/job/${id}`),
        axios.get(`/api/jobs/${id}`)
      ]);
      setApplications(appsRes.data.applications);
      setJob(jobRes.data.job);
      if (appsRes.data.applications.length > 0) {
        setSelected(appsRes.data.applications[0]);
      }
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, status) => {
    setUpdatingId(appId);
    try {
      const { data } = await axios.put(`/api/applications/${appId}/status`, { status });
      setApplications(prev =>
        prev.map(a => a._id === appId ? { ...a, status } : a)
      );
      if (selected?._id === appId) setSelected(prev => ({ ...prev, status }));
      toast.success(`Status updated to "${status}"`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="applications-page">
      <div className="container">
        {/* Header */}
        <div className="apps-header">
          <button onClick={() => navigate('/employer/dashboard')} className="back-btn">
            <FiArrowLeft /> Back to Dashboard
          </button>
          <div className="apps-title">
            <h1>{job?.title}</h1>
            <p>{applications.length} application{applications.length !== 1 ? 's' : ''} · {job?.company} · {job?.location}</p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem' }}>📭</div>
            <h3>No applications yet</h3>
            <p>Share your job posting to attract candidates.</p>
            <Link to={`/jobs/${id}`} className="btn btn-primary">View Job Posting</Link>
          </div>
        ) : (
          <div className="apps-layout">
            {/* Left: applicant list */}
            <div className="apps-list">
              {applications.map(app => (
                <div
                  key={app._id}
                  className={`app-list-item ${selected?._id === app._id ? 'active' : ''}`}
                  onClick={() => setSelected(app)}
                >
                  <div className="app-list-avatar">
                    {app.candidate?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="app-list-info">
                    <strong>{app.candidate?.name}</strong>
                    <span>{app.candidate?.headline || app.candidate?.email}</span>
                  </div>
                  <span className={`badge ${statusColors[app.status] || 'badge-gray'}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Right: applicant detail */}
            {selected && (
              <div className="app-detail">
                {/* Candidate Info */}
                <div className="app-detail-header">
                  <div className="app-detail-avatar">
                    {selected.candidate?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2>{selected.candidate?.name}</h2>
                    <p>{selected.candidate?.headline || 'No headline'}</p>
                    <div className="app-detail-meta">
                      <span><FiMail size={13} /> {selected.candidate?.email}</span>
                      {selected.candidate?.location &&
                        <span><FiMapPin size={13} /> {selected.candidate?.location}</span>
                      }
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selected.candidate?.skills?.length > 0 && (
                  <div className="app-detail-section">
                    <h4>Skills</h4>
                    <div className="skill-tags">
                      {selected.candidate.skills.map(s => (
                        <span key={s} className="badge badge-primary">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {selected.coverLetter && (
                  <div className="app-detail-section">
                    <h4>Cover Letter</h4>
                    <p className="cover-letter-text">{selected.coverLetter}</p>
                  </div>
                )}

                {/* Resume */}
                {selected.resumeUrl && (
                  <div className="app-detail-section">
                    <h4>Resume</h4>
                    <a
                      href={`http://localhost:5000${selected.resumeUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      <FiDownload size={14} /> Download Resume
                    </a>
                  </div>
                )}

                {/* Applied date */}
                <div className="app-detail-section">
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Applied {formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {/* Status Update */}
                <div className="app-detail-section status-section">
                  <h4>Update Status</h4>
                  <div className="status-buttons">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected._id, s)}
                        disabled={updatingId === selected._id}
                        className={`status-btn ${selected.status === s ? 'active' : ''} status-${s}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
