// ============================================================
// middleware/auth.js
// JWT Authentication middleware
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── protect: Require logged-in user ─────────────────────────
// Usage: router.get('/private', protect, handler)
const protect = async (req, res, next) => {
  let token;

  // JWT sent as: Authorization: Bearer <token>
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized, invalid token' });
  }
};

// ─── authorize: Restrict to specific roles ───────────────────
// Usage: router.post('/jobs', protect, authorize('employer'), handler)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Role '${req.user.role}' is not authorized for this action`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
