import api from './api';

export const applicationService = {
  async applyForJob(data) {
    // If data is FormData, send with multipart header
    if (data instanceof FormData) {
      const response = await api.post('/applications', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.post('/applications', data);
    return response.data;
  },

  async getMyApplications(status = 'ALL') {
    const response = await api.get('/applications/my-applications', {
      params: { status },
    });
    return response.data;
  },

  async getJobApplicants(jobId, status = 'ALL') {
    const response = await api.get(`/applications/job/${jobId}`, {
      params: { status },
    });
    return response.data;
  },

  async getAllRecruiterApplicants(params = {}) {
    const response = await api.get('/applications/recruiter/all', { params });
    return response.data;
  },

  async updateApplicationStatus(id, status, notes) {
    const response = await api.patch(`/applications/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  async updateRecruiterNotes(id, notes) {
    const response = await api.patch(`/applications/${id}/notes`, { notes });
    return response.data;
  },

  async scheduleInterview(id, interview) {
    const response = await api.put(`/applications/${id}/interview`, interview);
    return response.data;
  },

  getResumeDownloadUrl(applicationId) {
    const base = import.meta.env.VITE_API_URL || '/api';
    return `${base}/applications/${applicationId}/resume`;
  },

  async downloadResume(applicationId) {
    const response = await api.get(`/applications/${applicationId}/resume`, {
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'];
    let filename = 'resume.pdf';
    if (disposition) {
      const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i.exec(disposition);
      if (match?.[1]) {
        filename = match[1].replace(/['"]/g, '');
      }
    }

    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
};
