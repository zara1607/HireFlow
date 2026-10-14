import api from './api';

export const chatService = {
  async getConversations() {
    const response = await api.get('/conversations');
    return response.data;
  },

  async getOrCreateConversation(recipientId, jobId = null) {
    const response = await api.post('/conversations', {
      recipientId,
      jobId,
    });
    return response.data;
  },

  async getMessages(conversationId) {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  async sendMessage(conversationId, text) {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      text,
    });
    return response.data;
  },
};
