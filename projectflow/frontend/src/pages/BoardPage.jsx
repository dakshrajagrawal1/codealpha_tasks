import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useOutletContext } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import KanbanBoard from '../components/board/KanbanBoard';
import TaskModal from '../components/task/TaskModal';
import ProjectHeader from '../components/board/ProjectHeader';
import './BoardPage.css';

export default function BoardPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { setProjects } = useOutletContext();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskCol, setNewTaskCol] = useState('todo');

  const openTaskId = searchParams.get('task');

  const fetchData = useCallback(async () => {
    try {
      const [pRes, tRes, uRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
        api.get('/users'),
      ]);
      setProject(pRes.project);
      setTasks(tRes.tasks);
      setAllUsers(uRes.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Open task from URL param
  useEffect(() => {
    if (openTaskId && tasks.length > 0) {
      const t = tasks.find(t => t.id === openTaskId);
      if (t) setSelectedTask(t);
    }
  }, [openTaskId, tasks]);

  // Real-time socket events
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join:project', id);

    const onTaskCreated = (task) => setTasks(prev => [...prev, task]);
    const onTaskUpdated = (task) => {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      setSelectedTask(prev => prev?.id === task.id ? task : prev);
    };
    const onTaskDeleted = ({ id: tid }) => {
      setTasks(prev => prev.filter(t => t.id !== tid));
      setSelectedTask(prev => prev?.id === tid ? null : prev);
    };
    const onProjectUpdated = (p) => setProject(p);

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:deleted', onTaskDeleted);
    socket.on('project:updated', onProjectUpdated);

    return () => {
      socket.emit('leave:project', id);
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('project:updated', onProjectUpdated);
    };
  }, [socket, id]);

  const handleCreateTask = async (data) => {
    const res = await api.post('/tasks', { ...data, projectId: id });
    setTasks(prev => [...prev, res.task]);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, taskCount: (p.taskCount || 0) + 1 } : p));
    setShowNewTask(false);
  };

  const handleUpdateTask = async (taskId, data) => {
    const res = await api.put(`/tasks/${taskId}`, data);
    setTasks(prev => prev.map(t => t.id === taskId ? res.task : t));
    setSelectedTask(res.task);
  };

  const handleDeleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSelectedTask(null);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, taskCount: Math.max(0, (p.taskCount || 1) - 1) } : p));
  };

  const handleMoveTask = async (taskId, newColumn) => {
    const res = await api.put(`/tasks/${taskId}`, { column: newColumn });
    setTasks(prev => prev.map(t => t.id === taskId ? res.task : t));
  };

  const openNewTask = (col = 'todo') => {
    setNewTaskCol(col);
    setShowNewTask(true);
  };

  const closeTask = () => {
    setSelectedTask(null);
    setSearchParams({});
  };

  if (loading) return (
    <div className="board-loading">
      <div className="board-loading-spinner" />
      <p>Loading board…</p>
    </div>
  );

  if (!project) return (
    <div className="board-error">
      <h2>Project not found</h2>
      <p>This project doesn't exist or you don't have access.</p>
    </div>
  );

  return (
    <div className="board-page">
      <ProjectHeader
        project={project}
        setProject={setProject}
        allUsers={allUsers}
        currentUser={user}
        onNewTask={() => openNewTask('todo')}
      />

      <KanbanBoard
        tasks={tasks}
        onSelectTask={setSelectedTask}
        onMoveTask={handleMoveTask}
        onNewTask={openNewTask}
        project={project}
      />

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          project={project}
          allUsers={allUsers}
          currentUser={user}
          socket={socket}
          onClose={closeTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {showNewTask && (
        <TaskModal
          isNew
          defaultColumn={newTaskCol}
          project={project}
          allUsers={allUsers}
          currentUser={user}
          socket={socket}
          onClose={() => setShowNewTask(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
}
