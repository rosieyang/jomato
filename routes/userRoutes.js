const express = require('express');
const {
  signup,
  login,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe,
  uploadPhoto
} = require('../controllers/userController');

const User = require('../models/userModel');

const router = express.Router();

const advancedQuery = require('../middleware/advancedQuery');
const { protect, restrictTo } = require('../middleware/auth');

// ========== USER AUTHENTICATION ==========

// Public access
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:resetToken', resetPassword);

// Access allowed only for logged in users after this line
router.use(protect);

router.patch('/update-password', updatePassword);

// ========== ACCOUNT SETTINGS FOR USERS ==========

router
  .route('/me')
  .get(getMe)
  .patch(updateMe)
  .delete(deleteMe);

router.post('/me/photo', uploadPhoto);

// ========== CRUD USERS FOR ADMIN ==========

// Access allowed only for admin users after this line
router.use(restrictTo('admin'));

router
  .route('/')
  .get(advancedQuery(User), getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;