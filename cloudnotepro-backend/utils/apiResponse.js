const sendSuccess = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    msg: message,
    ...data,
  });
};

const sendError = (res, statusCode, code, message, details) => {
  const payload = {
    success: false,
    msg: message,
    error: {
      code,
      message,
    },
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};
