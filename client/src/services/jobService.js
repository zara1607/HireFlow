import api from './api';

export const jobService = {
  async getJobs(params = {}) {
    // If the backend expects 'published' but frontend sends 'OPEN', normalize it here
    const normalizedParams = { ...params };
    if (normalizedParams.status === 'OPEN') {
      normalizedParams.status = 'published';
    }
    
    const response = await api.get('/jobs', { params: normalizedParams });
    return response.data;
  },

  async getJobById(id) {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  async getJobCategories() {
    // Based on typical backend setups, this might be at /jobs/categories or /categories
    // Try /jobs/categories first (as you have it), if it fails in the backend, 
    // we will adjust the backend route.
    const response = await api.get('/jobs/categories');
    return response.data;
  },

  async getRecommendedJobs() {
    const response = await api.get('/jobs/recommended');
    return response.data;
  },

  async createJob(jobData) {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  async updateJob(id, jobData) {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  async deleteJob(id) {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  async getRecruiterJobs() {
    const response = await api.get('/jobs/recruiter/my-jobs');
    return response.data;
  },
};