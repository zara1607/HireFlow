import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updatePassword(passwordData) {
    const response = await api.put('/auth/update-password', passwordData);
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  async uploadResume(formData) {
    const response = await api.post('/users/resume', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('hireflow_token') || ''}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getCandidateById(candidateId) {
    const response = await api.get(`/users/candidate/${candidateId}`);
    return response.data;
  },

  async getSavedJobs() {
    const response = await api.get('/users/saved-jobs');
    return response.data;
  },

  async saveJob(jobId) {
    const response = await api.put(`/users/saved-jobs/${jobId}`);
    return response.data;
  },

  async removeSavedJob(jobId) {
    const response = await api.delete(`/users/saved-jobs/${jobId}`);
    return response.data;
  },
};
