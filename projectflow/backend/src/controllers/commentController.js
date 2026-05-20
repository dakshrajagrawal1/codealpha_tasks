const { store, uuidv4 } = require('../store');

function enrichComment(comment) {
  const user = store.users.find(u => u.id === comment.userId);
  return {
    ...comment,
    user: user ? { id: user.id, name: user.name, avatar: user.avatar, avatarColor: user.avatarColor } : null,
  };
}

exports.getComments = (req, res) => {
  const { taskId } = req.params;
  const task = store.tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const project = store.projects.find(p => p.id === task.projectId);
  if (!project || !project.members.includes(req.user.id)) return res.status(403).json({ message: 'Access denied' });

  const comments = store.comments.filter(c => c.taskId === taskId).map(enrichComment);
  res.json({ comments });
};

exports.createComment = (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Text is required' });

  const task = store.tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const project = store.projects.find(p => p.id === task.projectId);
  if (!project || !project.members.includes(req.user.id)) return res.status(403).json({ message: 'Access denied' });

  const comment = {
    id: uuidv4(),
    taskId,
    userId: req.user.id,
    text,
    createdAt: new Date().toISOString(),
  };
  store.comments.push(comment);

  // Notify task assignee
  if (task.assigneeId && task.assigneeId !== req.user.id) {
    const notif = {
      id: uuidv4(),
      userId: task.assigneeId,
      type: 'comment',
      message: `${req.user.name} commented on "${task.title}"`,
      taskId: task.id,
      projectId: task.projectId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    store.notifications.push(notif);
    if (req.io) req.io.to(`user:${task.assigneeId}`).emit('notification:new', notif);
  }

  const enriched = enrichComment(comment);
  if (req.io) req.io.to(`task:${taskId}`).emit('comment:created', enriched);
  res.status(201).json({ comment: enriched });
};

exports.deleteComment = (req, res) => {
  const idx = store.comments.findIndex(c => c.id === req.params.commentId);
  if (idx === -1) return res.status(404).json({ message: 'Comment not found' });
  if (store.comments[idx].userId !== req.user.id) return res.status(403).json({ message: 'Not your comment' });

  const comment = store.comments[idx];
  store.comments.splice(idx, 1);

  if (req.io) req.io.to(`task:${comment.taskId}`).emit('comment:deleted', { id: req.params.commentId });
  res.json({ message: 'Comment deleted' });
};
