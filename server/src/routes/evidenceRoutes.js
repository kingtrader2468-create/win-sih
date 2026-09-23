const express = require('express');
const { getEvidenceGraph, markEvidenceInvestigated } = require('../controllers/evidenceController');

const router = express.Router();
router.get('/:findingId', getEvidenceGraph);
router.post('/:findingId/investigate', markEvidenceInvestigated);

module.exports = router;
