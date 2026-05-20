import React, { useState } from 'react';
import { api } from '../../utils/api';
import './Modal.css';
import './MembersModal.css';

export default function MembersModal({ project, setProject, allUsers, currentUser, onClose }) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(null);

  const memberIds = (project.members || []).map(m => m.id || m);
  const isOwner = project.ownerId === currentUser?.id;

  const nonMembers = allUsers.filter(u =>
    !memberIds.includes(u.id) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const members = allUsers.filter(u => memberIds.includes(u.id));

  const addMember = async (userId) => {
    setLoading(userId);
    try {
      const res = await api.post(`/projects/${project.id}/members`, { userId });
      setProject(res.project);
    } catch {}
    setLoading(null);
  };

  const removeMember = async (userId) => {
    if (userId === project.ownerId) return;
    setLoading(userId);
    try {
      const res = await api.delete(`/projects/${project.id}/members/${userId}`);
      setProject(res.project);
    } catch {}
    setLoading(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Members</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="members-modal-body">
          <div className="members-section">
            <div className="members-section-title">Current Members ({members.length})</div>
            <div className="members-list">
              {members.map(m => (
                <div key={m.id} className="member-row">
                  <div className="member-avatar" style={{ background: m.avatarColor }}>{m.avatar}</div>
                  <div className="member-info">
                    <span className="member-name">{m.name}</span>
                    <span className="member-email">{m.email}</span>
                  </div>
                  {m.id === project.ownerId ? (
                    <span className="member-owner-badge">Owner</span>
                  ) : isOwner && m.id !== currentUser?.id ? (
                    <button
                      className="member-remove-btn"
                      onClick={() => removeMember(m.id)}
                      disabled={loading === m.id}
                    >
                      {loading === m.id ? <span className="spinner-sm" /> : 'Remove'}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {isOwner && (
            <div className="members-section">
              <div className="members-section-title">Add Members</div>
              <input
                placeholder="Search users…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: 10 }}
              />
              <div className="members-list">
                {nonMembers.length === 0 ? (
                  <div className="members-empty">No users found</div>
                ) : (
                  nonMembers.map(u => (
                    <div key={u.id} className="member-row">
                      <div className="member-avatar" style={{ background: u.avatarColor }}>{u.avatar}</div>
                      <div className="member-info">
                        <span className="member-name">{u.name}</span>
                        <span className="member-email">{u.email}</span>
                      </div>
                      <button
                        className="member-add-btn"
                        onClick={() => addMember(u.id)}
                        disabled={loading === u.id}
                      >
                        {loading === u.id ? <span className="spinner-sm" /> : 'Add'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
