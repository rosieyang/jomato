const express = require('express');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe
} = require('../controllers/userController');

const User = require('../models/userModel');

const router = express.Router();

const advancedQuery = require('../middleware/advancedQuery');
const { protect, restrictTo } = require('../middleware/auth');

// ========== ACCOUNT DETAILS FOR USERS ==========

// Access allowed only for logged in users after this line
router.use(protect);

router
  .route('/me')
  .get(getMe)
  .patch(updateMe)
  .delete(deleteMe);

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