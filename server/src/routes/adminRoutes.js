const express = require('express');
const { getAdminDashboard, listAdminRecords, updateAdminRecordStatus } = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', getAdminDashboard);
router.get('/:entity', listAdminRecords);
router.patch('/:entity/:id', updateAdminRecordStatus);

module.exports = router;
