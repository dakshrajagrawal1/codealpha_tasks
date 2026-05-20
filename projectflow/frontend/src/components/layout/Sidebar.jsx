import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from '../notifications/NotificationPanel';
import './Sidebar.css';

const NAV = [
  {
    to: '/',
    end: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none"><path d="M3 10.5L10 4l7 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 8.5V16h4v-4h2v4h4V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    label: 'Dashboard',
  },
  {
    to: '/projects',
    icon: (
      <svg viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/></svg>
    ),
    label: 'Projects',
  },
];

export default function Sidebar({ projects = [] }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/auth'); };

  return (
    <>
      <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg viewBox="0 0 24 24" fill="none"><rect x="1.5" y="1.5" width="9" height="9" rx="2.2" fill="var(--accent)"/><rect x="13.5" y="1.5" width="9" height="9" rx="2.2" fill="var(--pink)" opacity="0.85"/><rect x="1.5" y="13.5" width="9" height="9" rx="2.2" fill="var(--cyan)" opacity="0.85"/><rect x="13.5" y="13.5" width="9" height="9" rx="2.2" fill="var(--amber)" opacity="0.75"/></svg>
            </div>
            {!collapsed && <span className="sidebar-logo-text">ProjectFlow</span>}
          </div>
          <button className="sidebar-collapse-btn" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
            <svg viewBox="0 0 16 16" fill="none"><path d={collapsed ? "M6 3l5 5-5 5" : "M10 3L5 8l5 5"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {projects.length > 0 && !collapsed && (
          <div className="sidebar-projects">
            <div className="sidebar-section-title">Projects</div>
            {projects.map(p => (
              <NavLink
                key={p.id}
                to={`/projects/${p.id}`}
                className={({ isActive }) => `sidebar-project-item${isActive ? ' active' : ''}`}
              >
                <span className="sidebar-project-dot" style={{ background: p.color }} />
                <span className="sidebar-project-name">{p.name}</span>
                {p.taskCount > 0 && <span className="sidebar-project-count">{p.taskCount}</span>}
              </NavLink>
            ))}
          </div>
        )}

        <div className="sidebar-footer">
          <button
            className={`sidebar-notif-btn${notifOpen ? ' active' : ''}`}
            onClick={() => setNotifOpen(o => !o)}
            title="Notifications"
          >
            <span className="sidebar-nav-icon">
              <svg viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 00-6 6v2l-1.5 2.5A1 1 0 003.4 14H16.6a1 1 0 00.9-1.5L16 10V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M8 14v.5a2 2 0 004 0V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </span>
            {!collapsed && <span className="sidebar-nav-label">Notifications</span>}
            {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ background: user?.avatarColor }}>{user?.avatar}</div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name}</span>
                <span className="sidebar-user-email">{user?.email}</span>
              </div>
            )}
            <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign out">
              <svg viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
    </>
  );
}
