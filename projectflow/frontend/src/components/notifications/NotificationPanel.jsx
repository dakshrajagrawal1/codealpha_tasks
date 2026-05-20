import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import './NotificationPanel.css';

const ICONS = {
  task_assigned: (
    <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  comment: (
    <svg viewBox="0 0 16 16" fill="none"><path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H9l-3 3v-3H3a1 1 0 01-1-1V3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
  ),
  project_invite: (
    <svg viewBox="0 0 16 16" fill="none"><path d="M8 2a3 3 0 100 6 3 3 0 000-6zM3 13s-.5-4 5-4 5 4 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
  ),
};

const TYPE_COLORS = {
  task_assigned: 'var(--accent)',
  comment: 'var(--emerald)',
  project_invite: 'var(--pink)',
};

export default function NotificationPanel({ onClose }) {
  const { notifications, markRead, markAllRead } = useNotifications();
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleClick = (n) => {
    markRead(n.id);
    if (n.taskId && n.projectId) navigate(`/projects/${n.projectId}?task=${n.taskId}`);
    else if (n.projectId) navigate(`/projects/${n.projectId}`);
    onClose();
  };

  return (
    <div className="notif-panel animate-scale" ref={ref}>
      <div className="notif-panel-header">
        <h3>Notifications</h3>
        {notifications.some(n => !n.read) && (
          <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <svg viewBox="0 0 40 40" fill="none"><path d="M20 5a10 10 0 00-10 10v3.5L7 23a1.5 1.5 0 001.35 2.15H31.65A1.5 1.5 0 0033 23l-3-4.5V15A10 10 0 0020 5z" stroke="currentColor" strokeWidth="1.5"/><path d="M16 25v.75a4 4 0 008 0V25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <p>All caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              className={`notif-item${n.read ? ' read' : ''}`}
              onClick={() => handleClick(n)}
            >
              <div className="notif-icon" style={{ color: TYPE_COLORS[n.type] || 'var(--accent)', background: `${TYPE_COLORS[n.type] || 'var(--accent)'}18` }}>
                {ICONS[n.type] || ICONS.comment}
              </div>
              <div className="notif-content">
                <p className="notif-message">{n.message}</p>
                <span className="notif-time">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </span>
              </div>
              {!n.read && <div className="notif-dot" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
