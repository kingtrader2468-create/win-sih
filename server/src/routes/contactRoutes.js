const express = require('express');
const {
  submitContactMessage,
  listContactMessages
} = require('../controllers/contactController');

const router = express.Router();

// Public submission
router.post('/', submitContactMessage);

// Admin review
router.get('/', listContactMessages);

module.exports = router;
