const express = require('express');
const {
  listOutreachDrafts,
  getOutreachDraftById,
  updateOutreachDraft,
  generateOutreach
} = require('../controllers/outreachController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', optionalAuth, listOutreachDrafts);
router.get('/:id', optionalAuth, getOutreachDraftById);
router.patch('/:id', protect, updateOutreachDraft);
router.post('/generate', optionalAuth, generateOutreach);

module.exports = router;
