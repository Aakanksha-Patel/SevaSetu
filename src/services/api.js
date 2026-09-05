// =======================================================
// SevaSetu Frontend API Service (Axios Client)
// Connected to all 8 MySQL database tables
// =======================================================

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sevasetu_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// 1. Authentication & Users Table
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  demoLogin: (role) => api.post('/auth/demo-login', { role }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  becomeVolunteer: (data) => api.post('/auth/become-volunteer', data),
  getDbStatus: () => api.get('/auth/db-status'),
};

// 2. Events Table
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  updateStatus: (id, status) => api.patch(`/events/${id}/status`, { status }),
};

// 3. Volunteer Applications Table
export const volunteerApplicationsAPI = {
  apply: (data) => api.post('/volunteer-applications', data),
  getMyApplications: () => api.get('/volunteer-applications/my-applications'),
  getNgoApplications: () => api.get('/volunteer-applications/ngo-applications'),
  updateStatus: (id, status) => api.patch(`/volunteer-applications/${id}/status`, { status }),
};

// 4. Donations Table
export const donationsAPI = {
  donate: (data) => api.post('/donations', data),
  getMyDonations: () => api.get('/donations/my-donations'),
  getMyNgoDonations: () => api.get('/donations/my-ngo-donations'),
  getNgoDonations: (ngoId) => api.get(`/donations/ngo/${ngoId}`),
};

// 5. Feedback Table
export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  create: (data) => api.post('/feedback', data),
  getMyFeedback: () => api.get('/feedback/my-feedback'),
  getMyNgoFeedback: () => api.get('/feedback/my-ngo-feedback'),
  getByNgo: (ngoId) => api.get(`/feedback/ngo/${ngoId}`),
  getByEvent: (eventId) => api.get(`/feedback/event/${eventId}`),
};

// Saved NGOs Table (Citizen Bookmarks)
export const savedNgosAPI = {
  getAll: () => api.get('/saved-ngos'),
  getIds: () => api.get('/saved-ngos/ids'),
  save: (ngoId) => api.post('/saved-ngos', { ngo_id: ngoId }),
  remove: (ngoId) => api.delete(`/saved-ngos/${ngoId}`),
};

// 6. Certificates Table
export const certificatesAPI = {
  generate: (data) => api.post('/certificates/generate', data),
  getMyCertificates: () => api.get('/certificates/my-certificates'),
  verify: (certNumber) => api.get(`/certificates/verify/${certNumber}`),
};

// 7. NGOs Table
export const ngosAPI = {
  getAll: (params) => api.get('/ngos', { params }),
  getById: (id) => api.get(`/ngos/${id}`),
  getMyProfile: () => api.get('/ngos/my-profile'),
  updateMyProfile: (data) => api.put('/ngos/my-profile', data),
  getMyStats: () => api.get('/ngos/my-stats'),
  verify: (id, status) => api.patch(`/ngos/${id}/verify`, { status }),
};

// 8. Volunteers Table
export const volunteersAPI = {
  getAll: (params) => api.get('/volunteers', { params }),
  getProfile: () => api.get('/volunteers/profile'),
  getStats: () => api.get('/volunteers/stats'),
  updateProfile: (data) => api.put('/volunteers/profile', data),
  // Opportunity aliases
  getOpportunities: (params) => api.get('/events', { params }),
  createOpportunity: (data) => api.post('/events', data),
  apply: (data) => api.post('/volunteer-applications', data),
  getMyApplications: () => api.get('/volunteer-applications/my-applications'),
  getNgoApplications: () => api.get('/volunteer-applications/ngo-applications'),
  updateApplicationStatus: (id, data) => api.patch(`/volunteer-applications/${id}/status`, data),
};

// Admin Management (All 8 Tables)
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getSystemStats: () => api.get('/admin/public-stats').catch(() => api.get('/admin/stats')),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getVolunteers: (params) => api.get('/admin/volunteers', { params }),
  getVolunteerActivity: (id) => api.get(`/admin/volunteers/${id}/activity`),
  getNgos: (params) => api.get('/admin/ngos', { params }),
  verifyNgo: (id, status) => api.patch(`/admin/ngos/${id}/verify`, { status }),
  getEvents: (params) => api.get('/admin/events', { params }),
  updateEventStatus: (id, status) => api.patch(`/admin/events/${id}/status`, { status }),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
  getDonations: (params) => api.get('/admin/donations', { params }),
  getFeedback: (params) => api.get('/admin/feedback', { params }),
  deleteFeedback: (id) => api.delete(`/admin/feedback/${id}`),
  getReports: () => api.get('/admin/reports'),
};

// Backward-compatible campaigns API aliased to events & donations
export const campaignsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  donate: (id, data) => api.post('/donations', { ...data, ngo_id: id }),
  getMyDonations: () => api.get('/donations/my-donations'),
  updateStatus: (id, status) => api.patch(`/events/${id}/status`, { status }),
};

export const helpRequestsAPI = {
  getAll: (params) => api.get('/help-requests', { params }),
  create: (data) => api.post('/help-requests', data),
  assign: (id, assigned_to) => api.patch(`/help-requests/${id}/assign`, { assigned_to }),
  resolve: (id) => api.patch(`/help-requests/${id}/resolve`),
  updateStatus: (id, data) => api.patch(`/help-requests/${id}/status`, data),
};

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getRecent: () => api.get('/contact/recent'),
};

export default api;
