// ============================================================
// pages/HomePage.js
// Landing page with hero, search, and featured jobs
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiMapPin, FiTrendingUp, FiBriefcase, FiUsers, FiCheckCircle } from 'react-icons/fi';
import JobCard from '../components/JobCard';
import './HomePage.css';

const CATEGORIES = [
  { name: 'Engineering', icon: '⚙️', count: '1.2k+' },
  { name: 'Design',      icon: '🎨', count: '800+' },
  { name: 'Marketing',   icon: '📣', count: '650+' },
  { name: 'Finance',     icon: '💰', count: '400+' },
  { name: 'Healthcare',  icon: '🏥', count: '900+' },
  { name: 'Education',   icon: '📚', count: '300+' },
  { name: 'Sales',       icon: '📈', count: '500+' },
  { name: 'Data',        icon: '📊', count: '700+' },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState({ jobs: '10,000+', companies: '2,500+', hires: '50,000+' });
  const navigate = useNavigate();

  useEffect(() => {
    // Load featured jobs from API
    axios.get('/api/jobs/featured')
      .then(res => setFeaturedJobs(res.data.jobs))
      .catch(() => {}); // Fail silently if API not running
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="home">
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <span className="hero-badge">
            <FiTrendingUp size={14} /> 10,000+ jobs added this week
          </span>
          <h1>Find Your <span className="hero-highlight">Dream Job</span><br />Today</h1>
          <p>Connect with top companies. Discover opportunities that match your skills, experience, and career goals.</p>

          {/* Search Bar */}
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-field">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <FiMapPin className="search-icon" />
              <input
                type="text"
                placeholder="City, state, or remote"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              Search Jobs
            </button>
          </form>

          <div className="hero-suggestions">
            <span>Popular:</span>
            {['React Developer', 'Product Manager', 'UI Designer', 'Data Scientist'].map(s => (
              <button key={s} onClick={() => navigate(`/jobs?search=${s}`)}>{s}</button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="container">
          <div className="hero-stats">
            <div className="stat"><FiBriefcase size={22} /><div><strong>{stats.jobs}</strong><span>Active Jobs</span></div></div>
            <div className="stat"><FiUsers size={22} /><div><strong>{stats.companies}</strong><span>Companies</span></div></div>
            <div className="stat"><FiCheckCircle size={22} /><div><strong>{stats.hires}</strong><span>Successful Hires</span></div></div>
          </div>
        </div>
      </section>

      {/* ─── Categories ──────────────────────────────────── */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Browse by Category</h2>
            <p>Explore opportunities across top industries</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                className="category-card"
                onClick={() => navigate(`/jobs?category=${cat.name}`)}
              >
                <span className="category-icon">{cat.icon}</span>
                <strong>{cat.name}</strong>
                <span className="category-count">{cat.count} jobs</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Jobs ────────────────────────────────── */}
      {featuredJobs.length > 0 && (
        <section className="section featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Featured Jobs</h2>
              <button className="btn btn-outline" onClick={() => navigate('/jobs')}>View All Jobs</button>
            </div>
            <div className="jobs-grid">
              {featuredJobs.map(job => <JobCard key={job._id} job={job} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─────────────────────────────────────────── */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-cards">
            <div className="cta-card cta-candidate">
              <h3>Looking for a job?</h3>
              <p>Create your profile, upload your resume, and start applying to thousands of jobs today.</p>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>Create Candidate Account</button>
            </div>
            <div className="cta-card cta-employer">
              <h3>Hiring talent?</h3>
              <p>Post your jobs and reach thousands of qualified candidates. Find the perfect fit for your team.</p>
              <button className="btn btn-outline" onClick={() => navigate('/register')}>Post a Job Free</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
