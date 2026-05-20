import React, { useState } from 'react';
import { api } from '../../utils/api';
import ProjectModal from './ProjectModal';
import MembersModal from './MembersModal';
import './ProjectHeader.css';

export default function ProjectHeader({ project, setProject, allUsers, currentUser, onNewTask }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const handleEdit = async (data) => {
    const res = await api.put(`/projects/${project.id}`, data);
    setProject(res.project);
    setShowEdit(false);
  };

  const isOwner = project.ownerId === currentUser?.id;

  return (
    <div className="project-header">
      <div className="project-header-left">
        <div className="project-header-color" style={{ background: project.color }} />
        <div>
          <h1 className="project-header-name">{project.name}</h1>
          {project.description && (
            <p className="project-header-desc">{project.description}</p>
          )}
        </div>
      </div>

      <div className="project-header-right">
        <div className="project-members-stack">
          {(project.members || []).slice(0, 5).map((m, i) => (
            <div
              key={m.id || m}
              className="ph-avatar"
              style={{
                background: m.avatarColor || '#6366f1',
                marginLeft: i > 0 ? '-8px' : 0,
                zIndex: 10 - i,
              }}
              title={m.name}
            >
              {m.avatar || '?'}
            </div>
          ))}
          {project.members?.length > 5 && (
            <div className="ph-avatar ph-avatar-more" style={{ marginLeft: '-8px' }}>
              +{project.members.length - 5}
            </div>
          )}
          <button className="ph-add-member" onClick={() => setShowMembers(true)} title="Manage members">
            <svg viewBox="0 0 14 14" fill="none"><path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        {isOwner && (
          <button className="ph-edit-btn" onClick={() => setShowEdit(true)} title="Edit project">
            <svg viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-8 8H3v-3L11 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
          </button>
        )}

        <button className="btn-primary ph-new-task" onClick={onNewTask}>
          <svg viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Add Task
        </button>
      </div>

      {showEdit && (
        <ProjectModal project={project} onClose={() => setShowEdit(false)} onSubmit={handleEdit} />
      )}
      {showMembers && (
        <MembersModal
          project={project}
          setProject={setProject}
          allUsers={allUsers}
          currentUser={currentUser}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  );
}
