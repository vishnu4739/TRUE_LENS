const axios = require('axios');
const FormData = require('form-data');
const { ML_SERVICE_URL } = require('../config/env');

/**
 * Send an image to the FastAPI ML service for prediction
 * @param {Buffer} imageBuffer - Image file buffer from multer
 * @param {string} originalname - Original filename
 * @param {string} mimetype - MIME type of the image
 * @returns {Object} Prediction result from ML service
 */
const predictImage = async (imageBuffer, originalname, mimetype) => {
  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: originalname,
      contentType: mimetype,
    });

    const response = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000, // 60 second timeout for ML processing
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // ML service returned an error response
      const status = error.response.status;
      const message =
        error.response.data?.detail ||
        error.response.data?.message ||
        'ML service returned an error';
      const err = new Error(`ML Service Error (${status}): ${message}`);
      err.statusCode = 502;
      throw err;
    } else if (error.code === 'ECONNREFUSED') {
      const err = new Error('ML service is unavailable. Please try again later.');
      err.statusCode = 503;
      throw err;
    } else if (error.code === 'ECONNABORTED') {
      const err = new Error('ML service request timed out. Please try again.');
      err.statusCode = 504;
      throw err;
    } else {
      const err = new Error(`Failed to communicate with ML service: ${error.message}`);
      err.statusCode = 502;
      throw err;
    }
  }
};

/**
 * Fetch model metrics from the ML service
 * @returns {Object} Model metrics data
 */
const getModelMetrics = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/metrics`, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      const err = new Error('ML service is unavailable.');
      err.statusCode = 503;
      throw err;
    }
    const err = new Error('Failed to fetch model metrics');
    err.statusCode = 502;
    throw err;
  }
};

/**
 * Fetch model comparison data from the ML service
 * @returns {Object} Model comparison data
 */
const getModelComparison = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/models/comparison`, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      const err = new Error('ML service is unavailable.');
      err.statusCode = 503;
      throw err;
    }
    const err = new Error('Failed to fetch model comparison data');
    err.statusCode = 502;
    throw err;
  }
};

module.exports = {
  predictImage,
  getModelMetrics,
  getModelComparison,
};
