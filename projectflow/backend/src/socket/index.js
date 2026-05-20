const jwt = require('jsonwebtoken');
const { store } = require('../store');

module.exports = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      const user = store.users.find(u => u.id === decoded.userId);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`✓ Socket connected: ${user.name} (${socket.id})`);

    // Join user-specific room for notifications
    socket.join(`user:${user.id}`);

    // Join project rooms
    socket.on('join:project', (projectId) => {
      const project = store.projects.find(p => p.id === projectId && p.members.includes(user.id));
      if (project) {
        socket.join(`project:${projectId}`);
        console.log(`  ${user.name} joined project room: ${projectId}`);
      }
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Join task room (for live comments)
    socket.on('join:task', (taskId) => {
      const task = store.tasks.find(t => t.id === taskId);
      if (task) {
        const project = store.projects.find(p => p.id === task.projectId && p.members.includes(user.id));
        if (project) socket.join(`task:${taskId}`);
      }
    });

    socket.on('leave:task', (taskId) => {
      socket.leave(`task:${taskId}`);
    });

    // Typing indicator in task comments
    socket.on('typing:start', ({ taskId }) => {
      socket.to(`task:${taskId}`).emit('user:typing', { user: { id: user.id, name: user.name } });
    });

    socket.on('typing:stop', ({ taskId }) => {
      socket.to(`task:${taskId}`).emit('user:stopped_typing', { userId: user.id });
    });

    socket.on('disconnect', () => {
      console.log(`✗ Socket disconnected: ${user.name}`);
    });
  });
};
