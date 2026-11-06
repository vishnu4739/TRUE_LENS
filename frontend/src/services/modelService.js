import api from './api';

export const getModelMetrics = async () => {
  const response = await api.get('/models/metrics');
  return response.data;
};

export const getModelComparison = async () => {
  const response = await api.get('/models/comparison');
  return response.data;
};
