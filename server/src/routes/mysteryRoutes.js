const express = require('express');
const { listMysteries, getMystery, saveMystery, submitAnswer, getMysteryResult } = require('../controllers/mysteryController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', optionalAuth, listMysteries);
router.get('/:id', optionalAuth, getMystery);
router.post('/:id/save', protect, saveMystery);
router.post('/:id/answer', protect, submitAnswer);
router.get('/:id/result', optionalAuth, getMysteryResult);

module.exports = router;
