const { store, uuidv4 } = require('../store');

function enrichProject(project) {
  const owner = store.users.find(u => u.id === project.ownerId);
  const members = project.members
    .map(id => store.users.find(u => u.id === id))
    .filter(Boolean)
    .map(({ password, ...u }) => u);
  const taskCount = store.tasks.filter(t => t.projectId === project.id).length;
  return { ...project, owner: owner ? { id: owner.id, name: owner.name, avatar: owner.avatar, avatarColor: owner.avatarColor } : null, members, taskCount };
}

exports.getProjects = (req, res) => {
  const projects = store.projects
    .filter(p => p.members.includes(req.user.id))
    .map(enrichProject);
  res.json({ projects });
};

exports.getProject = (req, res) => {
  const project = store.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!project.members.includes(req.user.id)) return res.status(403).json({ message: 'Access denied' });
  res.json({ project: enrichProject(project) });
};

exports.createProject = (req, res) => {
  const { name, description, color } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });

  const project = {
    id: uuidv4(),
    name,
    description: description || '',
    color: color || '#6366f1',
    ownerId: req.user.id,
    members: [req.user.id],
    createdAt: new Date().toISOString(),
  };
  store.projects.push(project);

  // Notify via socket if available
  if (req.io) {
    req.io.emit('project:created', enrichProject(project));
  }

  res.status(201).json({ project: enrichProject(project) });
};

exports.updateProject = (req, res) => {
  const project = store.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (project.ownerId !== req.user.id) return res.status(403).json({ message: 'Only owner can update' });

  const { name, description, color } = req.body;
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (color) project.color = color;

  if (req.io) req.io.to(`project:${project.id}`).emit('project:updated', enrichProject(project));
  res.json({ project: enrichProject(project) });
};

exports.deleteProject = (req, res) => {
  const idx = store.projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Project not found' });
  if (store.projects[idx].ownerId !== req.user.id) return res.status(403).json({ message: 'Only owner can delete' });

  store.projects.splice(idx, 1);
  store.tasks = store.tasks.filter(t => t.projectId !== req.params.id);

  if (req.io) req.io.emit('project:deleted', { id: req.params.id });
  res.json({ message: 'Project deleted' });
};

exports.addMember = (req, res) => {
  const project = store.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (project.ownerId !== req.user.id) return res.status(403).json({ message: 'Only owner can add members' });

  const { userId } = req.body;
  const user = store.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (project.members.includes(userId)) return res.status(409).json({ message: 'User already a member' });

  project.members.push(userId);

  // Create notification for the added user
  store.notifications.push({
    id: uuidv4(),
    userId,
    type: 'project_invite',
    message: `You were added to project "${project.name}"`,
    projectId: project.id,
    read: false,
    createdAt: new Date().toISOString(),
  });

  if (req.io) {
    req.io.to(`user:${userId}`).emit('notification:new', store.notifications[store.notifications.length - 1]);
    req.io.to(`project:${project.id}`).emit('project:updated', enrichProject(project));
  }

  res.json({ project: enrichProject(project) });
};

exports.removeMember = (req, res) => {
  const project = store.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (project.ownerId !== req.user.id) return res.status(403).json({ message: 'Only owner can remove members' });

  const { userId } = req.params;
  project.members = project.members.filter(id => id !== userId);

  if (req.io) req.io.to(`project:${project.id}`).emit('project:updated', enrichProject(project));
  res.json({ project: enrichProject(project) });
};
