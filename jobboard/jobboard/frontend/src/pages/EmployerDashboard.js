// ============================================================
// pages/EmployerDashboard.js
// Shows stats, job listings, and recent applications
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiUsers, FiTrendingUp, FiPlusCircle, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import './Dashboard.css';

const statusColors = {
  pending:     'badge-warning',
  reviewing:   'badge-info',
  shortlisted: 'badge-primary',
  interview:   'badge-success',
  offered:     'badge-success',
  rejected:    'badge-danger',
};

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]   = useState({});
  const [jobs, setJobs]     = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, jobsRes] = await Promise.all([
        axios.get('/api/employers/dashboard'),
        axios.get('/api/employers/jobs')
      ]);
      setStats(dashRes.data);
      setRecent(dashRes.data.recentApplications || []);
      setJobs(jobsRes.data.jobs);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Delete this job? All applications will be lost.')) return;
    try {
      await axios.delete(`/api/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const toggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await axios.put(`/api/jobs/${jobId}`, { status: newStatus });
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
      toast.success(`Job ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="dashboard container">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>Welcome, {user.name} 👋</h1>
          <p className="text-muted">{user.companyName} · Employer Dashboard</p>
        </div>
        <Link to="/employer/post-job" className="btn btn-primary">
          <FiPlusCircle /> Post New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8e7ff' }}><FiBriefcase color="#6c63ff" size={22} /></div>
          <div><strong>{stats.totalJobs || 0}</strong><span>Total Jobs Posted</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}><FiTrendingUp color="#10b981" size={22} /></div>
          <div><strong>{stats.activeJobs || 0}</strong><span>Active Jobs</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}><FiUsers color="#3b82f6" size={22} /></div>
          <div><strong>{stats.totalApplications || 0}</strong><span>Total Applications</span></div>
        </div>
      </div>

      {/* Recent Applications */}
      {recent.length > 0 && (
        <div className="dash-section">
          <h2>Recent Applications</h2>
          <div className="applications-list">
            {recent.map(app => (
              <div key={app._id} className="application-item">
                <div className="app-avatar">{app.candidate?.name?.[0]}</div>
                <div className="app-info">
                  <strong>{app.candidate?.name}</strong>
                  <span>{app.job?.title}</span>
                </div>
                <span className={`badge ${statusColors[app.status] || 'badge-gray'}`}>{app.status}</span>
                <span className="text-sm text-muted">{formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="dash-section">
        <div className="section-title-row">
          <h2>Your Job Postings</h2>
          <Link to="/employer/post-job" className="btn btn-outline btn-sm">+ Post Job</Link>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2.5rem' }}>📋</div>
            <h3>No jobs posted yet</h3>
            <p>Start hiring by posting your first job.</p>
            <Link to="/employer/post-job" className="btn btn-primary">Post a Job</Link>
          </div>
        ) : (
          <div className="jobs-table-wrap">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Views</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job._id}>
                    <td>
                      <div>
                        <strong>{job.title}</strong>
                        <span className="text-sm text-muted">{job.location} · {job.type}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleStatus(job._id, job.status)}
                        className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-gray'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle"
                      >
                        {job.status}
                      </button>
                    </td>
                    <td>{job.applicationCount || 0}</td>
                    <td>{job.views || 0}</td>
                    <td className="text-muted text-sm">{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/jobs/${job._id}`} className="icon-btn" title="View"><FiEye /></Link>
                        <Link to={`/employer/jobs/${job._id}/applications`} className="icon-btn" title="Applications"><FiUsers /></Link>
                        <Link to={`/employer/jobs/${job._id}/edit`} className="icon-btn" title="Edit"><FiEdit /></Link>
                        <button onClick={() => deleteJob(job._id)} className="icon-btn danger" title="Delete"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
