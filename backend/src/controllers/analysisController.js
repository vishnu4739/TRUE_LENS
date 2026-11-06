const analysisService = require('../services/analysisService');

/**
 * POST /api/analysis/predict
 * Analyze an image - accessible by authenticated users and guests
 */
const predict = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const userId = req.user ? req.user._id : null;
    const prediction = await analysisService.analyzeImage(req.file, userId);

    res.status(200).json({
      message: 'Analysis complete',
      prediction,
    });
  } catch (error) {
    // Pass along statusCode from mlService errors
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * GET /api/analysis/history
 * Get analysis history for authenticated user
 */
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const result = await analysisService.getUserHistory(req.user._id, page, limit);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analysis/:id
 * Get a single analysis result by ID
 */
const getAnalysis = async (req, res, next) => {
  try {
    const prediction = await analysisService.getPredictionById(req.params.id);

    if (!prediction) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // If the prediction has a userId, only the owner can access it
    if (
      prediction.userId &&
      (!req.user || prediction.userId.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ prediction });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/analysis/:id
 * Delete a single analysis result (protected)
 */
const deleteAnalysis = async (req, res, next) => {
  try {
    const deleted = await analysisService.deletePrediction(
      req.params.id,
      req.user._id
    );

    if (!deleted) {
      return res.status(404).json({ message: 'Analysis not found or not authorized' });
    }

    res.status(200).json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/analysis
 * Delete all analysis results for the authenticated user
 */
const deleteAllAnalyses = async (req, res, next) => {
  try {
    const result = await analysisService.deleteAllUserPredictions(req.user._id);

    res.status(200).json({
      message: 'All analyses deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  predict,
  getHistory,
  getAnalysis,
  deleteAnalysis,
  deleteAllAnalyses,
};
