const mongoose = require('mongoose');

const modelPredictionSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      required: true,
    },
    prediction: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    originalProbability: {
      type: Number,
      min: 0,
      max: 1,
    },
    aiGeneratedProbability: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for guest users
      index: true,
    },
    imageFilename: {
      type: String,
      required: [true, 'Image filename is required'],
    },
    predictionClass: {
      type: String,
      required: [true, 'Prediction class is required'],
      enum: ['original', 'ai_generated'],
    },
    originalProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    aiGeneratedProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    modelPredictions: {
      type: [modelPredictionSchema],
      default: [],
    },
    modelVersion: {
      type: String,
      default: '1.0.0',
    },
    analysisTimestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    uncertaintyStatus: {
      type: String,
      enum: ['certain', 'uncertain', 'highly_uncertain'],
      default: 'certain',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user history queries
predictionSchema.index({ userId: 1, analysisTimestamp: -1 });

const Prediction = mongoose.model('Prediction', predictionSchema);

module.exports = Prediction;
