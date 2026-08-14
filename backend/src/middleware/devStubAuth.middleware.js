// Temporary stand-in for Dev A's real auth.middleware.js / role.middleware.js.
// Reads a trusted identity straight from headers so event/registration routes
// can be developed and tested before Dev A's JWT middleware lands.
// Delete this file and swap the imports in event.routes.js / registration.routes.js
// once auth.middleware.js / role.middleware.js are merged in.

function stubAuthenticate(req, res, next) {
  req.user = {
    id: Number(req.header('x-user-id')) || 0,
    role: req.header('x-user-role') || 'VOLUNTEER',
  };
  next();
}

function stubRequireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { stubAuthenticate, stubRequireRole };
