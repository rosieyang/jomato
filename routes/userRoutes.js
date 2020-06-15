const express = require('express');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const User = require('../models/userModel');

const router = express.Router();

const advancedQuery = require('../middleware/advancedQuery');

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