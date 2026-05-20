const { store } = require('../store');

exports.getNotifications = (req, res) => {
  const notifications = store.notifications
    .filter(n => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ notifications });
};

exports.markRead = (req, res) => {
  const notif = store.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (!notif) return res.status(404).json({ message: 'Notification not found' });
  notif.read = true;
  res.json({ notification: notif });
};

exports.markAllRead = (req, res) => {
  store.notifications
    .filter(n => n.userId === req.user.id)
    .forEach(n => { n.read = true; });
  res.json({ message: 'All marked as read' });
};
