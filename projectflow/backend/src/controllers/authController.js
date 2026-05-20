const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { store, uuidv4 } = require('../store');

const avatarColors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];

function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (store.users.find(u => u.email === email)) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const color = avatarColors[store.users.length % avatarColors.length];

    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      avatar: initials,
      avatarColor: color,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);

    const token = generateToken(user.id);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = store.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user.id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.me = (req, res) => {
  const { password, ...safe } = req.user;
  res.json({ user: safe });
};

exports.getUsers = (req, res) => {
  const users = store.users.map(({ password, ...u }) => u);
  res.json({ users });
};
