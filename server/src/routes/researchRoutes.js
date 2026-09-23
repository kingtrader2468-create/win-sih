const express = require('express');
const { getResearch, getResearchById, analyzeResearch, chatAboutResearch, markResearchExplored } = require('../controllers/researchController');

const router = express.Router();
router.get('/', getResearch);
router.get('/:id', getResearchById);
router.post('/:id/analyze', analyzeResearch);
router.post('/:id/chat', chatAboutResearch);
router.post('/:id/explore', markResearchExplored);

module.exports = router;
