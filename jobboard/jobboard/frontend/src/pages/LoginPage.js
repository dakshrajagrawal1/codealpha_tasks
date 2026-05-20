import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'employer' ? '/employer/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><FiBriefcase size={28} /> JobBoard</div>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit}>
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
                placeholder="Your password"
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        {/* Demo credentials hint */}
        <div className="demo-hint">
          <p><strong>Demo:</strong> Register a new account to get started</p>
        </div>
      </div>
    </div>
  );
}
