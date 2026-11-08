import api from './api';
import { runClientForensicAnalysis } from './clientForensics';

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
    const id = prediction._id || prediction.prediction_id;
    // Prevent duplicate entries
    const filtered = existing.filter(
      (item) => (item._id || item.prediction_id) !== id
    );
    const updated = [prediction, ...filtered].slice(0, 50);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed saving to guest storage', err);
  }
};

export const deleteGuestPrediction = (id) => {
  try {
    const existing = getGuestHistory();
    const updated = existing.filter(
      (item) => (item._id || item.prediction_id || item.id) !== id
    );
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const clearGuestHistory = () => {
  localStorage.removeItem(GUEST_STORAGE_KEY);
};

export const clearAllAnalyses = async () => {
  try {
    await api.delete('/analysis', { timeout: 5000 });
  } catch {
    // If backend fails, continue to clear guest storage
  }
  clearGuestHistory();
};

/**
 * Robust image analysis function.
 * Tries the backend API first. If unreachable (e.g. deployed on static Netlify,
 * or offline backend), falls back seamlessly to client-side forensic analysis.
 */
export const analyzeImage = async (file) => {
  let prediction = null;

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/analysis/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 5000, // 5s timeout before falling back
    });

    prediction = response.data?.prediction;
  } catch (apiError) {
    console.warn(
      'Backend API unreachable; falling back to high-accuracy in-browser forensic engine:',
      apiError.message
    );

    // Run client-side forensic engine
    prediction = await runClientForensicAnalysis(file);
  }

  if (prediction) {
    saveGuestPrediction(prediction);
  }

  return prediction;
};

export const getAnalysisHistory = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/analysis/history', {
      params: { page, limit },
      timeout: 5000,
    });
    return response.data;
  } catch (err) {
    // If backend history is unavailable, return guest history
    const guest = getGuestHistory();
    const start = (page - 1) * limit;
    const paginated = guest.slice(start, start + limit);
    return {
      predictions: paginated,
      totalCount: guest.length,
      currentPage: page,
      totalPages: Math.ceil(guest.length / limit) || 1,
    };
  }
};

export const getAnalysisById = async (id) => {
  try {
    const response = await api.get(`/analysis/${id}`, { timeout: 5000 });
    return response.data.prediction;
  } catch {
    // Search guest history
    const guest = getGuestHistory();
    const found = guest.find((p) => (p._id || p.prediction_id || p.id) === id);
    if (found) return found;
    throw new Error('Analysis record not found');
  }
};

export const deleteAnalysisById = async (id) => {
  try {
    await api.delete(`/analysis/${id}`, { timeout: 5000 });
  } catch {
    // Also remove from guest history
  }
  deleteGuestPrediction(id);
};
