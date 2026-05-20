import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="not-found-number">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>Go Home</button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate('/jobs')}>Browse Jobs</button>
        </div>
      </div>
    </div>
  );
}
