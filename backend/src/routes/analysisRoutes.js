const express = require('express');
const router = express.Router();
const {
  predict,
  getHistory,
  getAnalysis,
  deleteAnalysis,
  deleteAllAnalyses,
} = require('../controllers/analysisController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/analysis/predict - accessible by authenticated users and guests
router.post('/predict', optionalAuth, upload.single('image'), predict);

// GET /api/analysis/history - authenticated users only
router.get('/history', protect, getHistory);

// GET /api/analysis/:id - accessible with optional auth (ownership checked in controller)
router.get('/:id', optionalAuth, getAnalysis);

// DELETE /api/analysis/:id - authenticated users only
router.delete('/:id', protect, deleteAnalysis);

// DELETE /api/analysis - delete all for authenticated user
router.delete('/', protect, deleteAllAnalyses);

module.exports = router;
