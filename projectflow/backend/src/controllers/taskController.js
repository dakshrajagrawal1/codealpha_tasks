const { store, uuidv4 } = require('../store');

function enrichTask(task) {
  const assignee = task.assigneeId ? store.users.find(u => u.id === task.assigneeId) : null;
  const commentCount = store.comments.filter(c => c.taskId === task.id).length;
  return {
    ...task,
    assignee: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar, avatarColor: assignee.avatarColor } : null,
    commentCount,
  };
}

exports.getTasks = (req, res) => {
  const { projectId } = req.query;
  let tasks = store.tasks;
  if (projectId) {
    const project = store.projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.members.includes(req.user.id)) return res.status(403).json({ message: 'Access denied' });
    tasks = tasks.filter(t => t.projectId === projectId);
  }
  res.json({ tasks: tasks.map(enrichTask) });
};

exports.getTask = (req, res) => {
  const task = store.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const project = store.projects.find(p => p.id === task.projectId);
  if (!project || !project.members.includes(req.user.id)) return res.status(403).json({ message: 'Access denied' });
  res.json({ task: enrichTask(task) });
};

exports.createTask = (req, res) => {
  const { title, description, column, priority, projectId, assigneeId, dueDate, labels } = req.body;
  if (!title || !projectId) return res.status(400).json({ message: 'Title and projectId required' });

  const project = store.projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!project.members.includes(req.user.id)) return res.status(403).json({ message: 'Access denied' });

  const task = {
    id: uuidv4(),
    title,
    description: description || '',
    column: column || 'todo',
    priority: priority || 'medium',
    projectId,
    assigneeId: assigneeId || null,
    dueDate: dueDate || null,
    labels: labels || [],
    createdById: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.tasks.push(task);

  // Notify assignee
  if (assigneeId && assigneeId !== req.user.id) {
    const notif = {
      id: uuidv4(),
      userId: assigneeId,
      type: 'task_assigned',
      message: `You were assigned to "${title}" in ${project.name}`,
      taskId: task.id,
      projectId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    store.notifications.push(notif);
    if (req.io) req.io.to(`user:${assigneeId}`).emit('notification:new', notif);
  }

  const enriched = enrichTask(task);
  if (req.io) req.io.to(`project:${projectId}`).emit('task:created', enriched);
  res.status(201).json({ task: enriched });
};

exports.updateTask = (req, res) => {
  const task = store.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const project = store.projects.find(p => p.id === task.projectId);
  if (!project || !project.members.includes(req.user.id)) return res.status(403).json({ message: 'Access denied' });

  const oldAssignee = task.assigneeId;
  const fields = ['title', 'description', 'column', 'priority', 'assigneeId', 'dueDate', 'labels'];
  fields.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
  task.updatedAt = new Date().toISOString();

  // Notify new assignee
  if (task.assigneeId && task.assigneeId !== oldAssignee && task.assigneeId !== req.user.id) {
    const notif = {
      id: uuidv4(),
      userId: task.assigneeId,
      type: 'task_assigned',
      message: `You were assigned to "${task.title}" in ${project.name}`,
      taskId: task.id,
      projectId: task.projectId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    store.notifications.push(notif);
    if (req.io) req.io.to(`user:${task.assigneeId}`).emit('notification:new', notif);
  }

  const enriched = enrichTask(task);
  if (req.io) req.io.to(`project:${task.projectId}`).emit('task:updated', enriched);
  res.json({ task: enriched });
};

exports.deleteTask = (req, res) => {
  const idx = store.tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Task not found' });
  const task = store.tasks[idx];
  const project = store.projects.find(p => p.id === task.projectId);
  if (!project || !project.members.includes(req.user.id)) return res.status(403).json({ message: 'Access denied' });

  store.tasks.splice(idx, 1);
  store.comments = store.comments.filter(c => c.taskId !== req.params.id);

  if (req.io) req.io.to(`project:${task.projectId}`).emit('task:deleted', { id: req.params.id, projectId: task.projectId });
  res.json({ message: 'Task deleted' });
};
