const mongoose = require('mongoose');
const Prediction = require('../models/Prediction');
const mlService = require('./mlService');

// In-memory fallback cache for when MongoDB is unavailable
const memoryCache = new Map();

/**
 * Analyze an image: forward to ML service and store the result
 * @param {Object} file - Multer file object (buffer, originalname, mimetype)
 * @param {string|null} userId - Authenticated user ID or null for guests
 * @returns {Object} Saved prediction document
 */
const analyzeImage = async (file, userId = null) => {
  // Forward image to ML service
  const mlResult = await mlService.predictImage(
    file.buffer,
    file.originalname,
    file.mimetype
  );

  // Determine uncertainty status based on probability spread
  const maxProb = Math.max(
    mlResult.original_probability ?? 0,
    mlResult.ai_generated_probability ?? 0
  );
  let uncertaintyStatus = 'certain';
  if (mlResult.uncertainty_status) {
    uncertaintyStatus = mlResult.uncertainty_status;
  } else if (maxProb < 0.6) {
    uncertaintyStatus = 'highly_uncertain';
  } else if (maxProb < 0.75) {
    uncertaintyStatus = 'uncertain';
  }

  // Build prediction document
  const predictionData = {
    userId: userId || null,
    imageFilename: file.originalname,
    predictionClass: mlResult.prediction || mlResult.predicted_class || 'original',
    originalProbability: mlResult.original_probability ?? 0,
    aiGeneratedProbability: mlResult.ai_generated_probability ?? 0,
    modelPredictions: (mlResult.model_predictions || []).map((mp) => ({
      modelName: mp.model_name || mp.modelName,
      prediction: mp.predicted_class || mp.prediction,
      confidence: mp.confidence ?? 0,
      originalProbability: mp.original_probability,
      aiGeneratedProbability: mp.ai_generated_probability,
      is_uncertain: mp.is_uncertain,
    })),
    modelVersion: mlResult.model_version || '1.0.0',
    analysisTimestamp: new Date(),
    uncertaintyStatus,
  };

  // Attempt to save to MongoDB if connected, else fallback to memory
  if (mongoose.connection.readyState === 1) {
    try {
      const saved = await Prediction.create(predictionData);
      memoryCache.set(saved._id.toString(), saved.toObject());
      return saved;
    } catch (err) {
      console.warn('MongoDB save error, falling back to memory storage:', err.message);
    }
  }

  // Fallback storage
  const fallbackId = new mongoose.Types.ObjectId().toString();
  const fallbackDoc = {
    _id: fallbackId,
    id: fallbackId,
    ...predictionData,
  };
  memoryCache.set(fallbackId, fallbackDoc);
  return fallbackDoc;
};

/**
 * Get analysis history for a user
 * @param {string} userId - User ID
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated results
 */
const getUserHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  if (mongoose.connection.readyState === 1) {
    try {
      const [predictions, total] = await Promise.all([
        Prediction.find({ userId })
          .sort({ analysisTimestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Prediction.countDocuments({ userId }),
      ]);

      return {
        predictions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      console.warn('MongoDB history query failed, checking memory:', err.message);
    }
  }

  // Memory fallback
  const userDocs = Array.from(memoryCache.values())
    .filter((d) => d.userId && d.userId.toString() === userId.toString())
    .sort((a, b) => new Date(b.analysisTimestamp) - new Date(a.analysisTimestamp));

  const paged = userDocs.slice(skip, skip + limit);
  return {
    predictions: paged,
    pagination: {
      page,
      limit,
      total: userDocs.length,
      pages: Math.ceil(userDocs.length / limit),
    },
  };
};

/**
 * Get a single prediction by ID
 * @param {string} predictionId - Prediction document ID
 * @returns {Object|null} Prediction document or null
 */
const getPredictionById = async (predictionId) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await Prediction.findById(predictionId).lean();
      if (doc) return doc;
    } catch (err) {
      // ignore and fallback
    }
  }
  return memoryCache.get(predictionId.toString()) || null;
};

/**
 * Delete a prediction by ID (only if owned by user)
 * @param {string} predictionId - Prediction document ID
 * @param {string} userId - User ID for ownership check
 * @returns {Object|null} Deleted prediction or null
 */
const deletePrediction = async (predictionId, userId) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await Prediction.findOneAndDelete({ _id: predictionId, userId });
      if (doc) {
        memoryCache.delete(predictionId.toString());
        return doc;
      }
    } catch (err) {
      // ignore
    }
  }

  const cached = memoryCache.get(predictionId.toString());
  if (cached && cached.userId && cached.userId.toString() === userId.toString()) {
    memoryCache.delete(predictionId.toString());
    return cached;
  }
  return null;
};

/**
 * Delete all predictions for a user
 * @param {string} userId - User ID
 * @returns {Object} Delete result with count
 */
const deleteAllUserPredictions = async (userId) => {
  let count = 0;
  if (mongoose.connection.readyState === 1) {
    try {
      const result = await Prediction.deleteMany({ userId });
      count = result.deletedCount;
    } catch (err) {
      // ignore
    }
  }

  for (const [key, val] of memoryCache.entries()) {
    if (val.userId && val.userId.toString() === userId.toString()) {
      memoryCache.delete(key);
      count++;
    }
  }

  return { deletedCount: count };
};

module.exports = {
  analyzeImage,
  getUserHistory,
  getPredictionById,
  deletePrediction,
  deleteAllUserPredictions,
};
