import api from './api';

const GUEST_STORAGE_KEY = 'truelens_guest_history';

export const getGuestHistory = () => {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveGuestPrediction = (prediction) => {
  try {
    const existing = getGuestHistory();
    const updated = [prediction, ...existing].slice(0, 50); // keep recent 50
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed saving to guest storage', err);
  }
};

export const deleteGuestPrediction = (id) => {
  try {
    const existing = getGuestHistory();
    const updated = existing.filter((item) => (item._id || item.id) !== id);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const clearGuestHistory = () => {
  localStorage.removeItem(GUEST_STORAGE_KEY);
};

export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/analysis/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const prediction = response.data.prediction;

  // Save to guest history if not authenticated
  const token = localStorage.getItem('truelens_token');
  if (!token && prediction) {
    saveGuestPrediction(prediction);
  }

  return prediction;
};

export const getAnalysisHistory = async (page = 1, limit = 20) => {
  const response = await api.get(`/analysis/history?page=${page}&limit=${limit}`);
  return response.data;
};

export const getAnalysisById = async (id) => {
  // Check guest storage first if not authenticated or if local ID matches
  const guestItems = getGuestHistory();
  const localMatch = guestItems.find((p) => (p._id || p.id) === id);
  if (localMatch) {
    return { prediction: localMatch };
  }

  const response = await api.get(`/analysis/${id}`);
  return response.data;
};

export const deleteAnalysisById = async (id) => {
  // Try deleting from local storage as well
  deleteGuestPrediction(id);

  const token = localStorage.getItem('truelens_token');
  if (token) {
    const response = await api.delete(`/analysis/${id}`);
    return response.data;
  }
  return { message: 'Deleted from local history' };
};

export const clearAllAnalyses = async () => {
  clearGuestHistory();

  const token = localStorage.getItem('truelens_token');
  if (token) {
    const response = await api.delete('/analysis');
    return response.data;
  }
  return { message: 'Cleared local history' };
};
