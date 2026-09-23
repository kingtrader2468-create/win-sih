const express = require('express');
const { listMedia, getMediaById } = require('../controllers/mediaController');

const router = express.Router();

router.get('/', listMedia);
router.get('/:id', getMediaById);

module.exports = router;
