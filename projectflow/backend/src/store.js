const { v4: uuidv4 } = require('uuid');

// In-memory data store (replace with a real DB in production)
const store = {
  users: [],
  projects: [],
  tasks: [],
  comments: [],
  notifications: [],
};

// Seed some demo data
function seedData() {
  const bcrypt = require('bcryptjs');
  const salt = bcrypt.genSaltSync(10);

  const user1 = {
    id: uuidv4(),
    name: 'Alice Johnson',
    email: 'alice@demo.com',
    password: bcrypt.hashSync('password123', salt),
    avatar: 'AJ',
    avatarColor: '#6366f1',
    createdAt: new Date().toISOString(),
  };
  const user2 = {
    id: uuidv4(),
    name: 'Bob Smith',
    email: 'bob@demo.com',
    password: bcrypt.hashSync('password123', salt),
    avatar: 'BS',
    avatarColor: '#ec4899',
    createdAt: new Date().toISOString(),
  };
  const user3 = {
    id: uuidv4(),
    name: 'Carol White',
    email: 'carol@demo.com',
    password: bcrypt.hashSync('password123', salt),
    avatar: 'CW',
    avatarColor: '#f59e0b',
    createdAt: new Date().toISOString(),
  };

  store.users.push(user1, user2, user3);

  const project1 = {
    id: uuidv4(),
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with new branding',
    color: '#6366f1',
    ownerId: user1.id,
    members: [user1.id, user2.id, user3.id],
    createdAt: new Date().toISOString(),
  };
  const project2 = {
    id: uuidv4(),
    name: 'Mobile App Launch',
    description: 'iOS and Android app development and launch strategy',
    color: '#ec4899',
    ownerId: user2.id,
    members: [user1.id, user2.id],
    createdAt: new Date().toISOString(),
  };

  store.projects.push(project1, project2);

  const columns = ['todo', 'in_progress', 'review', 'done'];
  const taskData = [
    { title: 'Design homepage mockup', column: 'done', priority: 'high', projectId: project1.id, assigneeId: user1.id },
    { title: 'Set up CI/CD pipeline', column: 'review', priority: 'medium', projectId: project1.id, assigneeId: user2.id },
    { title: 'Write API documentation', column: 'in_progress', priority: 'low', projectId: project1.id, assigneeId: user3.id },
    { title: 'User testing session', column: 'todo', priority: 'high', projectId: project1.id, assigneeId: user1.id },
    { title: 'Fix navigation bug', column: 'in_progress', priority: 'high', projectId: project1.id, assigneeId: user2.id },
    { title: 'Setup push notifications', column: 'todo', priority: 'medium', projectId: project2.id, assigneeId: user1.id },
    { title: 'App store submission', column: 'todo', priority: 'high', projectId: project2.id, assigneeId: user2.id },
    { title: 'Beta testing feedback', column: 'review', priority: 'medium', projectId: project2.id, assigneeId: user1.id },
  ];

  taskData.forEach(t => {
    const task = {
      id: uuidv4(),
      title: t.title,
      description: 'This is a sample task description with more details about what needs to be done.',
      column: t.column,
      priority: t.priority,
      projectId: t.projectId,
      assigneeId: t.assigneeId,
      labels: [],
      dueDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.tasks.push(task);
  });

  // Add some comments
  const firstTask = store.tasks[0];
  store.comments.push({
    id: uuidv4(),
    taskId: firstTask.id,
    userId: user2.id,
    text: 'Looks great! Just a few minor tweaks needed on the hero section.',
    createdAt: new Date().toISOString(),
  });
  store.comments.push({
    id: uuidv4(),
    taskId: firstTask.id,
    userId: user1.id,
    text: 'Thanks! I\'ll fix those up and push a new version.',
    createdAt: new Date().toISOString(),
  });
}

seedData();

module.exports = { store, uuidv4 };
