const { sendError } = require('../utils/apiResponse');

const fetchadmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 403, 'FORBIDDEN', 'Admin access required');
  }

  return next();
};

module.exports = fetchadmin;
