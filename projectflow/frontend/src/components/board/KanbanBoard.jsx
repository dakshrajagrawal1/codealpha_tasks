import React, { useState } from 'react';
import TaskCard from '../task/TaskCard';
import './KanbanBoard.css';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'var(--text-muted)' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--amber)' },
  { id: 'review', label: 'Review', color: 'var(--cyan)' },
  { id: 'done', label: 'Done', color: 'var(--emerald)' },
];

export default function KanbanBoard({ tasks, onSelectTask, onMoveTask, onNewTask, project }) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const getColTasks = (colId) => tasks.filter(t => t.column === colId);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    if (draggedTask && draggedTask.column !== colId) {
      onMoveTask(draggedTask.id, colId);
    }
    setDraggedTask(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverCol(null);
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = getColTasks(col.id);
        const isDragOver = dragOverCol === col.id;
        return (
          <div
            key={col.id}
            className={`kanban-column${isDragOver ? ' drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragLeave={() => setDragOverCol(null)}
          >
            <div className="kanban-col-header">
              <div className="kanban-col-title">
                <div className="kanban-col-dot" style={{ background: col.color }} />
                <span>{col.label}</span>
                <span className="kanban-col-count">{colTasks.length}</span>
              </div>
              <button className="kanban-col-add" onClick={() => onNewTask(col.id)} title={`Add task to ${col.label}`}>
                <svg viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div className="kanban-col-body">
              {colTasks.length === 0 && (
                <div className={`kanban-col-empty${isDragOver ? ' drag-over' : ''}`}>
                  Drop tasks here
                </div>
              )}
              {colTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  className={draggedTask?.id === task.id ? 'task-dragging' : ''}
                >
                  <TaskCard
                    task={task}
                    project={project}
                    onClick={() => onSelectTask(task)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
