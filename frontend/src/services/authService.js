import api from './api';
import {
  clientRegister,
  clientLogin,
  getClientProfile,
  clientLogout,
} from './clientAuth';

export const register = async (name, email, password) => {
  try {
    const response = await api.post(
      '/auth/register',
      { name, email, password },
      { timeout: 3500 }
    );
    return response.data;
  } catch (apiError) {
    // If it's a validation error or user already exists (409/400), throw directly
    if (apiError.response && apiError.response.status < 500) {
      throw apiError;
    }
    console.warn(
      'Backend unreachable for registration, using secure offline auth:',
      apiError.message
    );
    return await clientRegister(name, email, password);
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post(
      '/auth/login',
      { email, password },
      { timeout: 3500 }
    );
    return response.data;
  } catch (apiError) {
    // If it's an explicit 401 unauthorized from backend, throw it
    if (apiError.response && apiError.response.status === 401) {
      throw apiError;
    }
    console.warn(
      'Backend unreachable for login, checking offline user registry:',
      apiError.message
    );
    return await clientLogin(email, password);
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile', { timeout: 3500 });
    return response.data;
  } catch (apiError) {
    const localProfile = getClientProfile();
    if (localProfile) {
      return localProfile;
    }
    throw apiError;
  }
};

export const logoutUser = () => {
  clientLogout();
};
