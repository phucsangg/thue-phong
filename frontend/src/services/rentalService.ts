import { api } from './api';

export interface SubmitRequestPayload {
  room: string;
  startDate: string;
  durationMonths: number;
  message?: string;
}

export const rentalService = {
  async createRequest(payload: SubmitRequestPayload) {
    const res = await api.post('/rental-requests', payload);
    return res.data;
  },

  async getMyRequests() {
    const res = await api.get('/rental-requests/my');
    return res.data;
  },

  async cancelRequest(id: string) {
    const res = await api.post(`/rental-requests/${id}/cancel`);
    return res.data;
  },

  // Admin APIs
  async getAllRequests() {
    const res = await api.get('/rental-requests');
    return res.data;
  },

  async approveRequest(id: string) {
    const res = await api.put(`/rental-requests/${id}/approve`);
    return res.data;
  },

  async rejectRequest(id: string, note?: string) {
    const res = await api.put(`/rental-requests/${id}/reject`, { note });
    return res.data;
  },
};
