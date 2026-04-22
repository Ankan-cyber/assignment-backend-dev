const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const User = require('../models/User');
const fetchuser = require('../middleware/fetchuser');
const fetchadmin = require('../middleware/fetchadmin');
const sendPasswordResetEmail = require('../mail');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const {
  signupValidation,
  loginValidation,
  changePasswordValidation,
  mailResetValidation,
  verifyResetValidation,
  resetPasswordValidation,
  handleValidationErrors,
} = require('../utils/validators');

const JWT_SECRET = process.env.JWT_SECRET;
const RESET_JWT_SECRET = process.env.RESET_JWT_SECRET;
const CLIENT_RESET_URL = process.env.CLIENT_RESET_URL;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1h';

const signAccessToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role,
    },
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const isResetTokenInvalid = (error) =>
  error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError;

// Route 1: Create a user: POST "/api/auth/signup". No login required
router.post('/signup', signupValidation, async (req, res) => {
  if (handleValidationErrors(req, res)) {
    return;
  }

  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return sendError(res, 400, 'EMAIL_ALREADY_EXISTS', 'Sorry a user with this email already exists');
    }

    const password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      name: req.body.name,
      password,
      email: req.body.email,
      role: req.body.role || 'user',
    });

    const authtoken = signAccessToken(user);
    return sendSuccess(res, 200, 'Signup successful', { authtoken });
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
});

// Route 2: Login with credentials: POST "/api/auth/login". No login required
router.post('/login', loginValidation, async (req, res) => {
  if (handleValidationErrors(req, res)) {
    return;
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Please try to login with correct credentials');
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Please try to login with correct credentials');
    }

    const authtoken = signAccessToken(user);
    return sendSuccess(res, 200, 'Login successful', { authtoken });
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
});

// Route 3: Get user data: GET "/api/auth/getuser". login required
router.get('/getuser', fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
    }

    return sendSuccess(res, 200, 'User fetched successfully', { user });
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
});

// Route 4: Change user password: PUT "/api/auth/changepassword". login required
router.put('/changepassword', fetchuser, changePasswordValidation, async (req, res) => {
  if (handleValidationErrors(req, res)) {
    return;
  }

  const { oldpassword, newpassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'USER_NOT_FOUND', "Couldn't find user");
    }

    const passwordCompare = await bcrypt.compare(oldpassword, user.password);
    if (!passwordCompare) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Current password is incorrect');
    }

    user.password = await bcrypt.hash(newpassword, 10);
    if (req.body.name) {
      user.name = req.body.name;
    }
    await user.save();

    return sendSuccess(res, 200, 'Password Changed Successfully');
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
});

// Route 5: Send reset password mail: POST "/api/auth/mailreset". No login required
router.post('/mailreset', mailResetValidation, async (req, res) => {
  if (handleValidationErrors(req, res)) {
    return;
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const resetToken = jwt.sign(data, RESET_JWT_SECRET, { expiresIn: '24h' });
      const link = `${CLIENT_RESET_URL}?token=${resetToken}`;
      sendPasswordResetEmail(user.name, user.email, link);
    }

    return sendSuccess(
      res,
      200,
      'If an account exists for this email, a password reset link has been sent'
    );
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
});

// Route 6: Verify reset token: GET "/api/auth/verify?token={resetToken}". No login required
router.get('/verify', verifyResetValidation, (req, res) => {
  if (handleValidationErrors(req, res)) {
    return;
  }

  const resetToken = req.query.token;
  try {
    const decoded = jwt.verify(resetToken, RESET_JWT_SECRET);
    return sendSuccess(res, 200, 'Token is valid.', { data: decoded });
  } catch (error) {
    if (isResetTokenInvalid(error)) {
      return sendError(res, 401, 'INVALID_OR_EXPIRED_RESET_TOKEN', 'Invalid or expired reset token');
    }
    console.error(error.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
});

// Route 7: Reset user password: PUT "/api/auth/resetpassword". No login required
router.put('/resetpassword', resetPasswordValidation, async (req, res) => {
  if (handleValidationErrors(req, res)) {
    return;
  }

  const { token, id, password } = req.body;
  try {
    const decoded = jwt.verify(token, RESET_JWT_SECRET);
    if (id !== decoded.user.id) {
      return sendError(res, 401, 'INVALID_OR_EXPIRED_RESET_TOKEN', 'Invalid or expired reset token');
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    return sendSuccess(res, 200, 'Password Changed Successfully');
  } catch (error) {
    if (isResetTokenInvalid(error)) {
      return sendError(res, 401, 'INVALID_OR_EXPIRED_RESET_TOKEN', 'Invalid or expired reset token');
    }
    console.error(error.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
  }
});

// Route 8: Admin-only proof endpoint: GET "/api/auth/admin/proof". login + admin required
router.get('/admin/proof', fetchuser, fetchadmin, (req, res) =>
  sendSuccess(res, 200, 'Admin access granted', {
    data: {
      userId: req.user.id,
      role: req.user.role,
    },
  })
);

module.exports = router;
