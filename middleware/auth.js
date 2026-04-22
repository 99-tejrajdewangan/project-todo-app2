const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1) Check cookie
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  // 2) Fallback to Authorization header
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('❌ No token found');
    return res.status(401).json({ success: false, message: 'Not authorized - no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    console.log('✅ User authenticated:', req.user.email);
    next();
  } catch (err) {
    console.error('JWT error:', err.message);
    return res.status(401).json({ success: false, message: 'Not authorized - invalid token' });
  }
};

module.exports = { protect };