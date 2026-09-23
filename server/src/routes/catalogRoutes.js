const express = require('express');
const { listCatalog, getCatalogItem } = require('../controllers/catalogController');

const router = express.Router();
router.get('/:collection', listCatalog);
router.get('/:collection/:id', getCatalogItem);

module.exports = router;
