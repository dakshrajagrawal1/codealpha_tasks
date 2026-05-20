// ============================================================
// pages/JobsPage.js
// Browse all jobs with search, filters, and pagination
// ============================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import JobCard from '../components/JobCard';
import './JobsPage.css';

const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Sales', 'Data', 'Operations', 'Legal'];
const JOB_TYPES  = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXPERIENCE = ['entry', 'mid', 'senior', 'lead', 'executive'];

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Form state (synced from URL)
  const [search,   setSearch]   = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [type,     setType]     = useState(searchParams.get('type') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [remote,   setRemote]   = useState(searchParams.get('remote') || '');
  const [sort,     setSort]     = useState(searchParams.get('sort') || 'newest');
  const [page,     setPage]     = useState(parseInt(searchParams.get('page')) || 1);

  // Load jobs whenever URL params change
  useEffect(() => {
    loadJobs();
  }, [searchParams]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/jobs', { params: Object.fromEntries(searchParams) });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters → update URL (triggers useEffect above)
  const applyFilters = (e) => {
    e?.preventDefault();
    const params = {};
    if (search)    params.search   = search;
    if (location)  params.location = location;
    if (category)  params.category = category;
    if (type)      params.type     = type;
    if (experience) params.experience = experience;
    if (remote)    params.remote   = remote;
    if (sort !== 'newest') params.sort = sort;
    params.page = '1';
    setSearchParams(params);
    setPage(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearch(''); setLocation(''); setCategory(''); setType('');
    setExperience(''); setRemote(''); setSort('newest');
    setSearchParams({});
  };

  const hasFilters = search || location || category || type || experience || remote;

  return (
    <div className="jobs-page">
      <div className="container">
        {/* ─── Search Bar ─────────────────────────────────── */}
        <div className="jobs-search-bar">
          <form onSubmit={applyFilters} className="jobs-search-form">
            <div className="search-input-wrap">
              <FiSearch className="si" />
              <input
                type="text"
                placeholder="Job title, keywords..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="search-input-wrap">
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)}>
              <FiFilter /> Filters
            </button>
          </form>
        </div>

        {/* ─── Filters Panel ──────────────────────────────── */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                  <option value="">All Types</option>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Experience</label>
                <select className="form-select" value={experience} onChange={e => setExperience(e.target.value)}>
                  <option value="">All Levels</option>
                  {EXPERIENCE.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sort By</label>
                <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="salary_high">Highest Salary</option>
                  <option value="salary_low">Lowest Salary</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Remote</label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={remote === 'true'} onChange={e => setRemote(e.target.checked ? 'true' : '')} />
                  Remote only
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={applyFilters} className="btn btn-primary">Apply Filters</button>
              <button onClick={clearFilters} className="btn btn-ghost">Clear All</button>
            </div>
          </div>
        )}

        {/* ─── Results Header ──────────────────────────────── */}
        <div className="jobs-results-header">
          <p>
            {loading ? 'Loading...' : `${pagination.total || 0} jobs found`}
            {hasFilters && <span className="active-filters-note"> (filtered)</span>}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="clear-filters-btn">
              <FiX size={14} /> Clear filters
            </button>
          )}
        </div>

        {/* ─── Job List ─────────────────────────────────────── */}
        {loading ? (
          <div className="spinner" />
        ) : jobs.length === 0 ? (
          <div className="no-results">
            <div style={{ fontSize: '3rem' }}>🔍</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search terms or filters</p>
            <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
          </div>
        ) : (
          <div className="jobs-list">
            {jobs.map(job => <JobCard key={job._id} job={job} />)}
          </div>
        )}

        {/* ─── Pagination ──────────────────────────────────── */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              disabled={page <= 1}
              onClick={() => { const p = page - 1; setPage(p); setSearchParams(prev => { prev.set('page', p); return prev; }); }}
            >← Previous</button>
            <span className="page-info">Page {pagination.page} of {pagination.pages}</span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page >= pagination.pages}
              onClick={() => { const p = page + 1; setPage(p); setSearchParams(prev => { prev.set('page', p); return prev; }); }}
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
