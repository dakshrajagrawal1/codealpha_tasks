const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authCtrl = require('../controllers/authController');
const projectCtrl = require('../controllers/projectController');
const taskCtrl = require('../controllers/taskController');
const commentCtrl = require('../controllers/commentController');
const notifCtrl = require('../controllers/notificationController');

// Auth
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', auth, authCtrl.me);
router.get('/users', auth, authCtrl.getUsers);

// Projects
router.get('/projects', auth, projectCtrl.getProjects);
router.get('/projects/:id', auth, projectCtrl.getProject);
router.post('/projects', auth, projectCtrl.createProject);
router.put('/projects/:id', auth, projectCtrl.updateProject);
router.delete('/projects/:id', auth, projectCtrl.deleteProject);
router.post('/projects/:id/members', auth, projectCtrl.addMember);
router.delete('/projects/:id/members/:userId', auth, projectCtrl.removeMember);

// Tasks
router.get('/tasks', auth, taskCtrl.getTasks);
router.get('/tasks/:id', auth, taskCtrl.getTask);
router.post('/tasks', auth, taskCtrl.createTask);
router.put('/tasks/:id', auth, taskCtrl.updateTask);
router.delete('/tasks/:id', auth, taskCtrl.deleteTask);

// Comments
router.get('/tasks/:taskId/comments', auth, commentCtrl.getComments);
router.post('/tasks/:taskId/comments', auth, commentCtrl.createComment);
router.delete('/tasks/:taskId/comments/:commentId', auth, commentCtrl.deleteComment);

// Notifications
router.get('/notifications', auth, notifCtrl.getNotifications);
router.patch('/notifications/:id/read', auth, notifCtrl.markRead);
router.patch('/notifications/read-all', auth, notifCtrl.markAllRead);

module.exports = router;
