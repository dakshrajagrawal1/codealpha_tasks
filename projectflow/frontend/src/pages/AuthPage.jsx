import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ name: '', email: 'alice@demo.com', password: 'password123' });

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-grid" />
      </div>

      <div className="auth-card animate-scale">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg viewBox="0 0 32 32" fill="none"><rect x="2" y="2" width="12" height="12" rx="3" fill="var(--accent)"/><rect x="18" y="2" width="12" height="12" rx="3" fill="var(--pink)" opacity="0.8"/><rect x="2" y="18" width="12" height="12" rx="3" fill="var(--cyan)" opacity="0.8"/><rect x="18" y="18" width="12" height="12" rx="3" fill="var(--amber)" opacity="0.7"/></svg>
          </div>
          <span className="auth-logo-text">ProjectFlow</span>
        </div>

        <h1 className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Get started'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Sign in to your workspace' : 'Create your free account'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" type="text" placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <button className="auth-demo-btn" onClick={fillDemo} type="button">
          <svg viewBox="0 0 16 16" fill="none"><path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z" fill="currentColor" opacity="0.7"/></svg>
          Fill demo credentials
        </button>

        <div className="auth-switch">
          {mode === 'login' ? (
            <span>Don't have an account? <button onClick={() => { setMode('register'); setError(''); }}>Sign up</button></span>
          ) : (
            <span>Already have an account? <button onClick={() => { setMode('login'); setError(''); }}>Sign in</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
