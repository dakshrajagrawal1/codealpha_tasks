// ============================================================
// App.js — Main Router
// Defines all routes and wraps app with providers
// ============================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage        from './pages/HomePage';
import JobsPage        from './pages/JobsPage';
import JobDetailPage   from './pages/JobDetailPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import EmployerDashboard  from './pages/EmployerDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import PostJobPage     from './pages/PostJobPage';
import EditJobPage     from './pages/EditJobPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ProfilePage     from './pages/ProfilePage';
import NotFoundPage    from './pages/NotFoundPage';

// Components
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';

// ─── Protected Route: must be logged in ──────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" replace />;
};

// ─── Role-specific Route ──────────────────────────────────────
const RoleRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
};

// ─── App Layout (Navbar + content + Footer) ───────────────────
const Layout = ({ children }) => (
  <div className="page-wrapper">
    <Navbar />
    <main className="page-content">{children}</main>
    <Footer />
  </div>
);

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/"          element={<HomePage />} />
        <Route path="/jobs"      element={<JobsPage />} />
        <Route path="/jobs/:id"  element={<JobDetailPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />

        {/* Employer routes */}
        <Route path="/employer/dashboard" element={
          <RoleRoute role="employer"><EmployerDashboard /></RoleRoute>
        }/>
        <Route path="/employer/post-job" element={
          <RoleRoute role="employer"><PostJobPage /></RoleRoute>
        }/>
        <Route path="/employer/jobs/:id/edit" element={
          <RoleRoute role="employer"><EditJobPage /></RoleRoute>
        }/>
        <Route path="/employer/jobs/:id/applications" element={
          <RoleRoute role="employer"><ApplicationsPage /></RoleRoute>
        }/>

        {/* Candidate routes */}
        <Route path="/dashboard" element={
          <RoleRoute role="candidate"><CandidateDashboard /></RoleRoute>
        }/>

        {/* Shared protected route */}
        <Route path="/profile" element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        }/>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications (top-right corner) */}
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem' },
          success: { iconTheme: { primary: '#6c63ff', secondary: '#fff' } }
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
