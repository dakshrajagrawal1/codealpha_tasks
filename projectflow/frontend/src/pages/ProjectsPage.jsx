import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProjectModal from '../components/board/ProjectModal';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, setProjects } = useOutletContext();
  const [showModal, setShowModal] = useState(false);

  const handleCreate = async (data) => {
    const res = await api.post('/projects', data);
    setProjects(prev => [...prev, res.project]);
    setShowModal(false);
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    await api.delete(`/projects/${id}`);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p className="projects-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} you're a member of</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="projects-empty">
          <div className="projects-empty-icon">
            <svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2"/><rect x="26" y="4" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2"/><rect x="4" y="26" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2"/><rect x="26" y="26" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2"/></svg>
          </div>
          <h3>No projects yet</h3>
          <p>Create your first project and start collaborating</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`} className="project-card">
              <div className="project-card-top">
                <div className="project-card-color" style={{ background: p.color }} />
                <div className="project-card-actions">
                  {p.ownerId === user?.id && (
                    <button
                      className="project-card-delete"
                      onClick={(e) => handleDelete(p.id, e)}
                      title="Delete project"
                    >
                      <svg viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="project-card-body">
                <h3 className="project-card-name">{p.name}</h3>
                {p.description && <p className="project-card-desc">{p.description}</p>}
              </div>

              <div className="project-card-footer">
                <div className="project-card-members">
                  {(Array.isArray(p.members) ? p.members : []).slice(0, 4).map((m, i) => (
                    <div
                      key={typeof m === 'object' ? m.id : m}
                      className="member-avatar-sm"
                      style={{
                        background: typeof m === 'object' ? m.avatarColor : '#6366f1',
                        zIndex: 10 - i,
                        marginLeft: i > 0 ? '-8px' : 0,
                      }}
                      title={typeof m === 'object' ? m.name : ''}
                    >
                      {typeof m === 'object' ? m.avatar : '?'}
                    </div>
                  ))}
                  {Array.isArray(p.members) && p.members.length > 4 && (
                    <div className="member-avatar-sm member-overflow" style={{ marginLeft: '-8px' }}>
                      +{p.members.length - 4}
                    </div>
                  )}
                </div>
                <span className="project-card-tasks">{p.taskCount || 0} tasks</span>
              </div>
            </Link>
          ))}

          <button className="project-card project-card--new" onClick={() => setShowModal(true)}>
            <div className="project-card-new-inner">
              <div className="project-card-new-icon">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <span>New Project</span>
            </div>
          </button>
        </div>
      )}

      {showModal && (
        <ProjectModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}
