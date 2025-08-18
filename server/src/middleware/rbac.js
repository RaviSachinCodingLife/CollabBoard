module.exports = function requireRole(allowedRoles = []) {
  if (typeof allowedRoles === 'string') allowedRoles = [allowedRoles];

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
};
