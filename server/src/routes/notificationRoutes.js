const express = require('express');
const {
  listNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All notification routes are strictly gated behind authentication
router.use(protect);

router.get('/', listNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

module.exports = router;
