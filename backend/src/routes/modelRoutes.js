const express = require('express');
const router = express.Router();
const { getMetrics, getComparison } = require('../controllers/modelController');

// GET /api/models/metrics
router.get('/metrics', getMetrics);

// GET /api/models/comparison
router.get('/comparison', getComparison);

module.exports = router;
