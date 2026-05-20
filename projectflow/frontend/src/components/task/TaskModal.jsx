import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../utils/api';
import { format } from 'date-fns';
import './TaskModal.css';

const COLUMNS = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];
const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--emerald)' };

export default function TaskModal({
  task, isNew, defaultColumn, project, allUsers, currentUser,
  socket, onClose, onUpdate, onCreate, onDelete,
}) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    column: task?.column || defaultColumn || 'todo',
    priority: task?.priority || 'medium',
    assigneeId: task?.assigneeId || '',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    labels: task?.labels || [],
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [editing, setEditing] = useState(!!isNew);
  const [typingUsers, setTypingUsers] = useState([]);
  const [labelInput, setLabelInput] = useState('');
  const commentsEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (!task || isNew) return;
    setLoadingComments(true);
    api.get(`/tasks/${task.id}/comments`)
      .then(d => setComments(d.comments))
      .catch(() => {})
      .finally(() => setLoadingComments(false));
  }, [task, isNew]);

  // Socket: join task room, live comments, typing
  useEffect(() => {
    if (!socket || !task || isNew) return;
    socket.emit('join:task', task.id);

    const onComment = (c) => setComments(prev => [...prev, c]);
    const onCommentDeleted = ({ id }) => setComments(prev => prev.filter(c => c.id !== id));
    const onTyping = ({ user }) => {
      if (user.id === currentUser?.id) return;
      setTypingUsers(prev => prev.find(u => u.id === user.id) ? prev : [...prev, user]);
    };
    const onStopTyping = ({ userId }) => setTypingUsers(prev => prev.filter(u => u.id !== userId));

    socket.on('comment:created', onComment);
    socket.on('comment:deleted', onCommentDeleted);
    socket.on('user:typing', onTyping);
    socket.on('user:stopped_typing', onStopTyping);

    return () => {
      socket.emit('leave:task', task.id);
      socket.off('comment:created', onComment);
      socket.off('comment:deleted', onCommentDeleted);
      socket.off('user:typing', onTyping);
      socket.off('user:stopped_typing', onStopTyping);
    };
  }, [socket, task, isNew, currentUser]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, assigneeId: form.assigneeId || null, dueDate: form.dueDate || null };
      if (isNew) {
        await onCreate(payload);
      } else {
        await onUpdate(task.id, payload);
        setEditing(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await api.post(`/tasks/${task.id}/comments`, { text: newComment });
      setNewComment('');
      if (socket) socket.emit('typing:stop', { taskId: task.id });
    } catch {}
    setCommentLoading(false);
  };

  const handleDeleteComment = async (commentId) => {
    await api.delete(`/tasks/${task.id}/comments/${commentId}`);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleCommentTyping = (val) => {
    setNewComment(val);
    if (!socket || !task) return;
    socket.emit('typing:start', { taskId: task.id });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing:stop', { taskId: task.id });
    }, 2000);
  };

  const addLabel = (e) => {
    e.preventDefault();
    const l = labelInput.trim();
    if (l && !form.labels.includes(l)) {
      setForm(f => ({ ...f, labels: [...f.labels, l] }));
    }
    setLabelInput('');
  };
  const removeLabel = (l) => setForm(f => ({ ...f, labels: f.labels.filter(x => x !== l) }));

  const members = project?.members || [];

  return (
    <div className="modal-overlay task-modal-overlay" onClick={onClose}>
      <div className="modal modal-wide task-modal animate-scale" onClick={e => e.stopPropagation()}>
        <div className="task-modal-layout">
          {/* Left: main content */}
          <div className="task-modal-main">
            <div className="task-modal-header">
              {editing ? (
                <input
                  className="task-title-input"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Task title…"
                  autoFocus
                />
              ) : (
                <h2 className="task-modal-title">{task?.title}</h2>
              )}
              <button className="modal-close" onClick={onClose}>
                <svg viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div className="task-modal-desc-section">
              <div className="task-field-label">Description</div>
              {editing ? (
                <textarea
                  className="task-desc-input"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Add a description…"
                  rows={4}
                />
              ) : (
                <p className="task-desc-text" onClick={() => setEditing(true)}>
                  {task?.description || <span style={{ color: 'var(--text-muted)' }}>No description. Click to edit.</span>}
                </p>
              )}
            </div>

            {/* Labels */}
            <div className="task-field-section">
              <div className="task-field-label">Labels</div>
              <div className="task-labels-row">
                {form.labels.map(l => (
                  <span key={l} className="task-label-chip">
                    {l}
                    {editing && (
                      <button onClick={() => removeLabel(l)}>×</button>
                    )}
                  </span>
                ))}
                {editing && (
                  <form onSubmit={addLabel} className="label-add-form">
                    <input
                      value={labelInput}
                      onChange={e => setLabelInput(e.target.value)}
                      placeholder="Add label…"
                      className="label-input"
                    />
                  </form>
                )}
              </div>
            </div>

            {/* Edit / Save buttons */}
            {!isNew && (
              <div className="task-modal-edit-row">
                {editing ? (
                  <>
                    <button className="btn-primary" onClick={handleSave} disabled={submitting} style={{ fontSize: 13, padding: '7px 16px' }}>
                      {submitting ? <span className="spinner" /> : 'Save Changes'}
                    </button>
                    <button className="btn-ghost" onClick={() => setEditing(false)} style={{ fontSize: 13, padding: '7px 14px' }}>Cancel</button>
                    <button className="btn-danger" onClick={() => onDelete(task.id)} style={{ fontSize: 13, padding: '7px 14px', marginLeft: 'auto' }}>Delete Task</button>
                  </>
                ) : (
                  <button className="btn-ghost" onClick={() => setEditing(true)} style={{ fontSize: 13, padding: '7px 14px' }}>
                    <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12, marginRight: 4 }}><path d="M9.5 1.5l3 3-7 7H2.5v-3l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                    Edit Task
                  </button>
                )}
              </div>
            )}

            {/* Comments */}
            {!isNew && (
              <div className="task-comments-section">
                <div className="task-field-label">Comments ({comments.length})</div>
                <div className="comments-list">
                  {loadingComments ? (
                    <div className="comments-loading">Loading comments…</div>
                  ) : comments.length === 0 ? (
                    <div className="comments-empty">No comments yet. Be the first!</div>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="comment-item">
                        <div className="comment-avatar" style={{ background: c.user?.avatarColor || '#6366f1' }}>
                          {c.user?.avatar || '?'}
                        </div>
                        <div className="comment-content">
                          <div className="comment-meta">
                            <span className="comment-author">{c.user?.name || 'Unknown'}</span>
                            <span className="comment-time">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                          </div>
                          <p className="comment-text">{c.text}</p>
                        </div>
                        {c.userId === currentUser?.id && (
                          <button className="comment-delete" onClick={() => handleDeleteComment(c.id)} title="Delete">
                            <svg viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M4.5 3V2h3v1M4 3l.5 7M8 3l-.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                  {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                      <div className="typing-dots"><span /><span /><span /></div>
                      <span>{typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…</span>
                    </div>
                  )}
                  <div ref={commentsEndRef} />
                </div>

                <form onSubmit={handleCommentSubmit} className="comment-form">
                  <div className="comment-input-avatar" style={{ background: currentUser?.avatarColor }}>
                    {currentUser?.avatar}
                  </div>
                  <input
                    value={newComment}
                    onChange={e => handleCommentTyping(e.target.value)}
                    placeholder="Write a comment…"
                    className="comment-input"
                  />
                  <button type="submit" className="comment-submit" disabled={!newComment.trim() || commentLoading}>
                    {commentLoading ? <span className="spinner-sm" /> : (
                      <svg viewBox="0 0 16 16" fill="none"><path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right: sidebar metadata */}
          <div className="task-modal-sidebar">
            <div className="task-meta-group">
              <div className="task-meta-label">Status</div>
              <select value={form.column} onChange={e => setForm(f => ({ ...f, column: e.target.value }))} disabled={!editing && !isNew}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            <div className="task-meta-group">
              <div className="task-meta-label">Priority</div>
              <div className="priority-selector">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    className={`priority-opt${form.priority === p ? ' selected' : ''}`}
                    style={form.priority === p ? { background: `${PRIORITY_COLORS[p]}20`, color: PRIORITY_COLORS[p], borderColor: `${PRIORITY_COLORS[p]}50` } : {}}
                    onClick={() => (editing || isNew) && setForm(f => ({ ...f, priority: p }))}
                    disabled={!editing && !isNew}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="task-meta-group">
              <div className="task-meta-label">Assignee</div>
              <select value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))} disabled={!editing && !isNew}>
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id || m} value={m.id || m}>
                    {typeof m === 'object' ? m.name : m}
                  </option>
                ))}
              </select>
              {form.assigneeId && (() => {
                const a = members.find(m => (m.id || m) === form.assigneeId);
                if (!a || typeof a !== 'object') return null;
                return (
                  <div className="assignee-preview">
                    <div className="assignee-avatar" style={{ background: a.avatarColor }}>{a.avatar}</div>
                    <span>{a.name}</span>
                  </div>
                );
              })()}
            </div>

            <div className="task-meta-group">
              <div className="task-meta-label">Due Date</div>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                disabled={!editing && !isNew}
              />
            </div>

            {!isNew && task?.createdAt && (
              <div className="task-meta-group">
                <div className="task-meta-label">Created</div>
                <div className="task-meta-value">{format(new Date(task.createdAt), 'MMM d, yyyy')}</div>
              </div>
            )}

            {isNew && (
              <button className="btn-primary" onClick={handleSave} disabled={submitting || !form.title.trim()} style={{ marginTop: 8 }}>
                {submitting ? <span className="spinner" /> : 'Create Task'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
