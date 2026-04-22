const { body, query, validationResult } = require('express-validator');
const { sendError } = require('./apiResponse');

const signupValidation = [
  body('name', 'Enter a valid name').trim().isLength({ min: 3 }).escape(),
  body('email', 'Enter a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
  body('role', 'Role must be either user or admin').optional().isIn(['user', 'admin']),
];

const loginValidation = [
  body('email', 'Enter a valid email').isEmail().normalizeEmail(),
  body('password', 'Password cannot be blank').notEmpty(),
];

const changePasswordValidation = [
  body('oldpassword', 'Current password is required').notEmpty(),
  body('newpassword', 'Password must be atleast 5 characters').isLength({ min: 5 }),
  body('name').optional().trim().isLength({ min: 3 }).escape(),
];

const mailResetValidation = [
  body('email', 'Enter a valid email').isEmail().normalizeEmail(),
];

const verifyResetValidation = [
  query('token', 'Reset token is required').trim().notEmpty(),
];

const resetPasswordValidation = [
  body('token', 'Reset token is required').trim().notEmpty(),
  body('id', 'User id is required').trim().notEmpty(),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
];

const noteCreateValidation = [
  body('title', 'Title should be more than 3 character').trim().isLength({ min: 3 }).escape(),
  body('description', 'Description should be more than 5 character').trim().isLength({ min: 5 }).escape(),
  body('tag').optional().trim().isLength({ min: 1, max: 50 }).escape(),
];

const noteUpdateValidation = [
  body('title').optional().trim().isLength({ min: 3 }).escape(),
  body('description').optional().trim().isLength({ min: 5 }).escape(),
  body('tag').optional().trim().isLength({ min: 1, max: 50 }).escape(),
  body().custom((value) => {
    if (!value.title && !value.description && !value.tag) {
      throw new Error('At least one field (title, description, tag) is required');
    }
    return true;
  }),
];

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return false;
  }

  const details = errors.array().map((error) => ({
    field: error.param,
    message: error.msg,
  }));

  sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', details);
  return true;
};

module.exports = {
  signupValidation,
  loginValidation,
  changePasswordValidation,
  mailResetValidation,
  verifyResetValidation,
  resetPasswordValidation,
  noteCreateValidation,
  noteUpdateValidation,
  handleValidationErrors,
};
