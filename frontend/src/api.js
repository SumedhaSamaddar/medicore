import axios from 'axios';

// Dynamically set baseURL based on environment
const getBaseURL = () => {
  return process.env.REACT_APP_API_URL;
};

const API = axios.create({ 
  baseURL: getBaseURL() 
});

// Add token to requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ========== AUTH ==========
export const login = (email, password) => API.post('/auth/login', { email, password });
export const register = (userData) => API.post('/auth/register', userData);
export const getMe = () => API.get('/auth/me');

// ========== PATIENTS ==========
export const getPatients = () => API.get('/patients');
export const getPatient = (id) => API.get(`/patients/${id}`);
export const createPatient = (data) => API.post('/patients', data);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const deletePatient = (id) => API.delete(`/patients/${id}`);

// ========== APPOINTMENTS ==========
export const getAppointments = () => API.get('/appointments');
export const createAppointment = (data) => API.post('/appointments', data);
export const updateAppointment = (id, data) => API.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => API.delete(`/appointments/${id}`);

// ========== DOCTORS ==========
export const getDoctors = () => API.get('/doctors');
export const createDoctor = (data) => API.post('/doctors', data);
export const updateDoctor = (id, data) => API.put(`/doctors/${id}`, data);
export const deleteDoctor = (id) => API.delete(`/doctors/${id}`);

// ========== MEDICINES ==========
export const getMedicines = () => API.get('/medicines');
export const createMedicine = (data) => API.post('/medicines', data);
export const updateMedicine = (id, data) => API.put(`/medicines/${id}`, data);
export const deleteMedicine = (id) => API.delete(`/medicines/${id}`);

// ========== INVOICES ==========
export const getInvoices = () => API.get('/invoices');
export const createInvoice = (data) => API.post('/invoices', data);
export const updateInvoice = (id, data) => API.put(`/invoices/${id}`, data);
export const deleteInvoice = (id) => API.delete(`/invoices/${id}`);

// ========== TRANSACTIONS ==========
export const getTransactions = (clinic) => 
  API.get(`/transactions${clinic ? `?clinic=${clinic}` : ''}`);
export const createTransaction = (data) => API.post('/transactions', data);
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);

// ========== AI ==========
export const getAIPrediction = (data) => API.post('/ai/analyze-symptoms', data)
export const getAIAnalysis = (data) => API.post('/ai/analyze', data);

// ========== EMERGENCY ==========
export const getHospitals = () => API.get('/emergency/hospitals')
export const createHospital = (data) => API.post('/emergency/hospitals', data)
export const updateHospitalBeds = (id, beds) => API.put(`/emergency/hospitals/${id}/beds`, { beds })
export const getAvailableAmbulances = () => API.get('/emergency/ambulances/available')
export const createAmbulance = (data) => API.post('/emergency/ambulances', data)
export const getEmergencyRequests = () => API.get('/emergency/requests')
export const createEmergencyRequest = (data) => API.post('/emergency/requests', data)
export const updateRequestStatus = (id, status) => API.put(`/emergency/requests/${id}/status`, { status })
export const assessEmergency = (symptoms) => API.post('/emergency/assess', { symptoms })
export const getEmergencyStats = () => API.get('/emergency/stats')

// ========== ANALYTICS ==========
export const getBusinessAnalytics = (clinic) => 
  API.get(`/analytics/analytics${clinic ? `?clinic=${clinic}` : ''}`);

export const getAIRevenuePrediction = () => 
  API.post('/analytics/ai-predict');

export const getAIBusinessInsights = () => 
  API.post('/analytics/ai-insights');

export const getClinics = () => 
  API.get('/analytics/clinics');

export const getPerformanceMetrics = () => 
  API.get('/analytics/performance');