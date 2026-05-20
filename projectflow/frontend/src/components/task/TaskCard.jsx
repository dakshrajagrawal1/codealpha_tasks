import React from 'react';
import { format } from 'date-fns';
import './TaskCard.css';

const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'var(--red)', bg: 'var(--red-soft)' },
  medium: { label: 'Medium', color: 'var(--amber)', bg: 'var(--amber-soft)' },
  low: { label: 'Low', color: 'var(--emerald)', bg: 'var(--emerald-soft)' },
};

export default function TaskCard({ task, onClick }) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.column !== 'done';

  return (
    <div className="task-card animate-fade" onClick={onClick}>
      <div className="task-card-priority-bar" style={{ background: priority.color }} />

      <div className="task-card-body">
        <h4 className="task-card-title">{task.title}</h4>

        {task.description && (
          <p className="task-card-desc">{task.description}</p>
        )}

        {task.labels && task.labels.length > 0 && (
          <div className="task-card-labels">
            {task.labels.map(l => (
              <span key={l} className="task-label">{l}</span>
            ))}
          </div>
        )}

        <div className="task-card-footer">
          <div className="task-card-meta">
            <span
              className="task-priority-badge"
              style={{ color: priority.color, background: priority.bg }}
            >
              {priority.label}
            </span>

            {task.dueDate && (
              <span className={`task-due-badge${isOverdue ? ' overdue' : ''}`}>
                <svg viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            {task.commentCount > 0 && (
              <span className="task-comment-count">
                <svg viewBox="0 0 12 12" fill="none"><path d="M1.5 2a1 1 0 011-1h7a1 1 0 011 1v5a1 1 0 01-1 1H7l-2.5 2.5V8H2.5a1 1 0 01-1-1V2z" stroke="currentColor" strokeWidth="1.2"/></svg>
                {task.commentCount}
              </span>
            )}
          </div>

          {task.assignee && (
            <div
              className="task-assignee"
              style={{ background: task.assignee.avatarColor }}
              title={task.assignee.name}
            >
              {task.assignee.avatar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
