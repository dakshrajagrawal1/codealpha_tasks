// ============================================================
// components/Navbar.js
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiUser, FiLogOut, FiMenu, FiX, FiPlusCircle } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <FiBriefcase size={22} />
          <span>JobBoard</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <Link to="/jobs" className={isActive('/jobs') ? 'active' : ''}>Browse Jobs</Link>

          {!user && <>
            <Link to="/login" className={isActive('/login') ? 'active' : ''}>Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>}

          {user?.role === 'employer' && <>
            <Link to="/employer/dashboard" className={isActive('/employer/dashboard') ? 'active' : ''}>Dashboard</Link>
            <Link to="/employer/post-job" className="btn btn-primary btn-sm">
              <FiPlusCircle size={15} /> Post Job
            </Link>
          </>}

          {user?.role === 'candidate' && <>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>My Applications</Link>
          </>}

          {user && (
            <div className="navbar-user">
              <Link to="/profile" className="navbar-avatar">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} />
                  : <span>{user.name?.[0]?.toUpperCase()}</span>
                }
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <FiLogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="navbar-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="navbar-mobile">
          <Link to="/jobs" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
          {!user && <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
          </>}
          {user?.role === 'employer' && <>
            <Link to="/employer/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/employer/post-job" onClick={() => setMenuOpen(false)}>Post a Job</Link>
          </>}
          {user?.role === 'candidate' && (
            <Link to="/dashboard" onClick={() => setMenuOpen(false)}>My Applications</Link>
          )}
          {user && <>
            <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </>}
        </div>
      )}
    </nav>
  );
}
