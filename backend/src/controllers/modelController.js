const mlService = require('../services/mlService');

/**
 * GET /api/models/metrics
 * Get ML model performance metrics
 */
const getMetrics = async (req, res, next) => {
  try {
    const metrics = await mlService.getModelMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * GET /api/models/comparison
 * Get ML model comparison data
 */
const getComparison = async (req, res, next) => {
  try {
    const comparison = await mlService.getModelComparison();
    res.status(200).json(comparison);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  getMetrics,
  getComparison,
};
