import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'candidate', companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name}!`);
      navigate(user.role === 'employer' ? '/employer/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><FiBriefcase size={28} /> JobBoard</div>
        <h1>Create your account</h1>
        <p className="auth-sub">Join thousands finding their dream jobs</p>

        {/* Role selector */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${form.role === 'candidate' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'candidate' })}
          >
            <FiUser size={18} />
            <strong>Job Seeker</strong>
            <span>I'm looking for a job</span>
          </button>
          <button
            type="button"
            className={`role-btn ${form.role === 'employer' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'employer' })}
          >
            <FiBriefcase size={18} />
            <strong>Employer</strong>
            <span>I'm hiring talent</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text" className="form-input"
              placeholder="Jane Smith"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          {form.role === 'employer' && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text" className="form-input"
                placeholder="Acme Corp"
                value={form.companyName}
                onChange={e => setForm({ ...form, companyName: e.target.value })}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-field">
              <input
                type={showPass ? 'text' : 'password'} className="form-input"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
