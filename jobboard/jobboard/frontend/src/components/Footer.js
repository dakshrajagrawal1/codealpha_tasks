import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <FiBriefcase size={20} /> JobBoard
          </Link>
          <p>Connecting talent with opportunity.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>For Job Seekers</h4>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/dashboard">My Applications</Link>
          </div>
          <div>
            <h4>For Employers</h4>
            <Link to="/employer/post-job">Post a Job</Link>
            <Link to="/employer/dashboard">Dashboard</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} JobBoard. All rights reserved.</p>
      </div>
    </footer>
  );
}
