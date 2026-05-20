import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { api } from '../../utils/api';
import './AppLayout.css';

export default function AppLayout() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/projects').then(d => setProjects(d.projects)).catch(() => {});
  }, []);

  return (
    <div className="app-layout">
      <Sidebar projects={projects} />
      <main className="app-main">
        <Outlet context={{ projects, setProjects }} />
      </main>
    </div>
  );
}
