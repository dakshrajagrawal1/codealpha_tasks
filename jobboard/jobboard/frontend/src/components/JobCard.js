// ============================================================
// components/JobCard.js
// Reusable card shown in job listings
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiUsers } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import './JobCard.css';

// Format salary: 50000 → "$50K"
const formatSalary = (salary) => {
  if (!salary?.min && !salary?.max) return null;
  const fmt = (n) => n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
  if (salary.min) return `From ${fmt(salary.min)}`;
  return `Up to ${fmt(salary.max)}`;
};

const typeColors = {
  'full-time':  'badge-success',
  'part-time':  'badge-warning',
  'contract':   'badge-info',
  'internship': 'badge-primary',
  'remote':     'badge-gray',
};

export default function JobCard({ job }) {
  const salary = formatSalary(job.salary);
  const posted = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true });

  return (
    <Link to={`/jobs/${job._id}`} className="job-card">
      <div className="job-card-header">
        <div className="job-card-logo">
          {job.companyLogo
            ? <img src={job.companyLogo} alt={job.company} />
            : <span>{job.company?.[0]?.toUpperCase()}</span>
          }
        </div>
        <div className="job-card-meta">
          <span className="job-card-company">{job.company}</span>
          <h3 className="job-card-title">{job.title}</h3>
        </div>
        {job.featured && <span className="badge badge-primary job-card-featured">Featured</span>}
      </div>

      <div className="job-card-tags">
        <span className={`badge ${typeColors[job.type] || 'badge-gray'}`}>
          {job.type}
        </span>
        <span className="badge badge-gray">{job.experienceLevel}</span>
        <span className="badge badge-gray">{job.category}</span>
      </div>

      <div className="job-card-details">
        <span><FiMapPin size={13} /> {job.location}</span>
        {salary && <span><FiDollarSign size={13} /> {salary}</span>}
        <span><FiClock size={13} /> {posted}</span>
        {job.applicationCount > 0 &&
          <span><FiUsers size={13} /> {job.applicationCount} applicants</span>
        }
      </div>
    </Link>
  );
}
