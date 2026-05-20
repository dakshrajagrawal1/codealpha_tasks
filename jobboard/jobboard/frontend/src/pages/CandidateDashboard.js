// ============================================================
// pages/CandidateDashboard.js
// Shows candidate's applications and their statuses
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiFileText, FiCheckCircle, FiClock, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import './Dashboard.css';

const statusColors = {
  pending:     'badge-warning',
  reviewing:   'badge-info',
  shortlisted: 'badge-primary',
  interview:   'badge-success',
  offered:     'badge-success',
  rejected:    'badge-danger',
  withdrawn:   'badge-gray',
};

const statusLabel = {
  pending:     '⏳ Pending',
  reviewing:   '👀 Under Review',
  shortlisted: '⭐ Shortlisted',
  interview:   '🎯 Interview',
  offered:     '🎉 Offered',
  rejected:    '❌ Rejected',
  withdrawn:   '↩ Withdrawn',
};

export default function CandidateDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => { loadApplications(); }, []);

  const loadApplications = async () => {
    try {
      const { data } = await axios.get('/api/applications/my');
      setApplications(data.applications);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await axios.delete(`/api/applications/${appId}`);
      setApplications(prev => prev.filter(a => a._id !== appId));
      toast.success('Application withdrawn');
    } catch {
      toast.error('Failed to withdraw');
    }
  };

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter);

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <div className="spinner" />;

  return (
    <div className="dashboard container">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>My Applications 👋</h1>
          <p className="text-muted">Hi {user.name} · Track your job applications</p>
        </div>
        <Link to="/jobs" className="btn btn-primary">
          <FiSearch /> Browse Jobs
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8e7ff' }}><FiFileText color="#6c63ff" size={22} /></div>
          <div><strong>{applications.length}</strong><span>Total Applied</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}><FiClock color="#f59e0b" size={22} /></div>
          <div><strong>{(counts.pending || 0) + (counts.reviewing || 0)}</strong><span>In Progress</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}><FiCheckCircle color="#10b981" size={22} /></div>
          <div><strong>{(counts.shortlisted || 0) + (counts.interview || 0) + (counts.offered || 0)}</strong><span>Positive Responses</span></div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {['all', 'pending', 'reviewing', 'shortlisted', 'interview', 'offered', 'rejected'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `All (${applications.length})` : `${statusLabel[f]?.split(' ').slice(1).join(' ')} (${counts[f] || 0})`}
          </button>
        ))}
      </div>

      {/* Applications */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '2.5rem' }}>📋</div>
          <h3>{filter === 'all' ? 'No applications yet' : `No ${filter} applications`}</h3>
          <p>Start browsing jobs and apply today!</p>
          <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className="applications-cards">
          {filtered.map(app => (
            <div key={app._id} className="application-card">
              <div className="app-card-top">
                <div className="app-card-logo">
                  {app.job?.company?.[0] || '?'}
                </div>
                <div className="app-card-info">
                  <h3>{app.job?.title || 'Job Deleted'}</h3>
                  <p>{app.job?.company} · {app.job?.location}</p>
                </div>
                <span className={`badge ${statusColors[app.status] || 'badge-gray'}`}>
                  {statusLabel[app.status] || app.status}
                </span>
              </div>
              <div className="app-card-bottom">
                <span className="text-sm text-muted">
                  Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                </span>
                {app.job?.type && <span className="badge badge-gray">{app.job.type}</span>}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  {app.job?._id && (
                    <Link to={`/jobs/${app.job._id}`} className="btn btn-ghost btn-sm">View Job</Link>
                  )}
                  {app.status !== 'withdrawn' && app.status !== 'offered' && (
                    <button onClick={() => withdraw(app._id)} className="icon-btn danger" title="Withdraw">
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
