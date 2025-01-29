const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getUserMemberships } = require('../controllers/userController');

router.get('/groups', authMiddleware, getUserMemberships);

module.exports = router;