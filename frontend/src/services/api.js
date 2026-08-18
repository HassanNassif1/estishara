// File: frontend/src/services/api.js (Fixed for Vite)
// Vite uses import.meta.env instead of process.env

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper for handling API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'API request failed');
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

// Helper for building headers
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = localStorage.getItem('estishara_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// ==================== AUTH SERVICES ====================

export const register = async (email, password, role = 'client') => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password, role }),
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('estishara_token', data.token);
      localStorage.setItem('estishara_user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('estishara_token', data.token);
      localStorage.setItem('estishara_user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('estishara_token');
  localStorage.removeItem('estishara_user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('estishara_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const getToken = () => {
  return localStorage.getItem('estishara_token');
};

// ==================== VISA TYPE SERVICES ====================

export const getVisaTypes = async () => {
  try {
    const response = await fetch(`${API_URL}/visa-types`, {
      headers: getHeaders(false),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get visa types error:', error);
    throw error;
  }
};

export const createVisaType = async (visaTypeData) => {
  try {
    const response = await fetch(`${API_URL}/visa-types`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(visaTypeData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Create visa type error:', error);
    throw error;
  }
};

// ==================== APPOINTMENT SERVICES ====================

export const getAppointments = async () => {
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      headers: getHeaders(true),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get appointments error:', error);
    throw error;
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(appointmentData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Create appointment error:', error);
    throw error;
  }
};

export const updateAppointment = async (id, updates) => {
  try {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Update appointment error:', error);
    throw error;
  }
};

export const deleteAppointment = async (id) => {
  try {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (response.status === 204) {
      return null;
    }
    return handleResponse(response);
  } catch (error) {
    console.error('Delete appointment error:', error);
    throw error;
  }
};

// ==================== AUTHENTICATED USER SERVICE ====================

export const getCurrentUserProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(true),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};
// Add this to the bottom of your api.js file, before the final export

// In frontend/src/services/api.js
// Add this at the bottom, before the final export

export const getAdminStats = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders(true),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get admin stats error:', error);
    throw error;
  }
};
export const getBookedTimes = async (date) => {
  try {
    const response = await fetch(`${API_URL}/availability/${date}`, {
      headers: getHeaders(true), // CHANGE THIS FROM FALSE TO TRUE!
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get availability error:', error);
    throw error;
  }
};