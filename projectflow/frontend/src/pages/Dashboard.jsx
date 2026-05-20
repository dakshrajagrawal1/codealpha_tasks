import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import './Dashboard.css';

const PRIORITY_COLORS = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--emerald)' };
const COL_LABELS = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };

export default function Dashboard() {
  const { user } = useAuth();
  const { projects } = useOutletContext();
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/tasks').then(d => {
      setMyTasks(d.tasks.filter(t => t.assigneeId === user?.id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const stats = {
    total: myTasks.length,
    done: myTasks.filter(t => t.column === 'done').length,
    inProgress: myTasks.filter(t => t.column === 'in_progress').length,
    todo: myTasks.filter(t => t.column === 'todo').length,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">{greeting}, {firstName} 👋</h1>
          <p className="dashboard-sub">Here's what's happening across your projects</p>
        </div>
        <Link to="/projects/new" className="btn-new-project">
          <svg viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          New Project
        </Link>
      </div>

      <div className="dashboard-stats">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'var(--accent)', bg: 'var(--accent-soft)' },
          { label: 'In Progress', value: stats.inProgress, color: 'var(--amber)', bg: 'var(--amber-soft)' },
          { label: 'To Do', value: stats.todo, color: 'var(--cyan)', bg: 'var(--cyan-soft)' },
          { label: 'Completed', value: stats.done, color: 'var(--emerald)', bg: 'var(--emerald-soft)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ '--sc': s.color, '--sbg': s.bg }}>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: stats.total ? `${(s.value / stats.total) * 100}%` : '0%', background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <div className="section-header">
            <h2>My Tasks</h2>
            <span className="section-count">{myTasks.filter(t => t.column !== 'done').length} active</span>
          </div>
          {loading ? (
            <div className="task-list-loading">
              {[1,2,3].map(i => <div key={i} className="task-skeleton" />)}
            </div>
          ) : myTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <p>No tasks assigned to you yet</p>
            </div>
          ) : (
            <div className="task-list">
              {myTasks.filter(t => t.column !== 'done').slice(0, 8).map(task => {
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <button
                    key={task.id}
                    className="task-row"
                    onClick={() => navigate(`/projects/${task.projectId}?task=${task.id}`)}
                  >
                    <div className="task-row-priority" style={{ background: PRIORITY_COLORS[task.priority] }} />
                    <div className="task-row-content">
                      <span className="task-row-title">{task.title}</span>
                      {project && (
                        <span className="task-row-project" style={{ color: project.color }}>
                          <span className="task-row-dot" style={{ background: project.color }} />
                          {project.name}
                        </span>
                      )}
                    </div>
                    <span className="task-row-col">{COL_LABELS[task.column]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Projects</h2>
            <Link to="/projects" className="section-link">View all →</Link>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◈</div>
              <p>No projects yet. Create your first one!</p>
            </div>
          ) : (
            <div className="project-cards-mini">
              {projects.map(p => {
                const done = myTasks.filter(t => t.projectId === p.id && t.column === 'done').length;
                const total = myTasks.filter(t => t.projectId === p.id).length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                const memberCount = Array.isArray(p.members) ? p.members.length : 0;
                return (
                  <Link key={p.id} to={`/projects/${p.id}`} className="project-mini-card">
                    <div className="project-mini-accent" style={{ background: p.color }} />
                    <div className="project-mini-info">
                      <span className="project-mini-name">{p.name}</span>
                      <span className="project-mini-meta">{p.taskCount} tasks · {memberCount} members</span>
                    </div>
                    <div className="project-mini-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: p.color }} />
                      </div>
                      <span className="progress-label">{pct}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
