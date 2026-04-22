const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
  // Get user from jwt token and add to req object
  const token = req.header('auth-token');
  if (!token) {
    return sendError(res, 401, 'AUTH_REQUIRED', 'Please authenticate using a valid token');
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    return next();
  } catch (error) {
    return sendError(res, 401, 'INVALID_OR_EXPIRED_TOKEN', 'Please authenticate using a valid token');
  }
};

module.exports = fetchuser;
