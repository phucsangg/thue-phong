import { api } from './api';

export const roomService = {
  async getAllRooms(params: any = {}) {
    const res = await api.get('/rooms', { params });
    return res.data;
  },

  async getFeaturedRooms() {
    const res = await api.get('/rooms/featured');
    return res.data;
  },

  async getRoomBySlug(slug: string) {
    const res = await api.get(`/rooms/${slug}`);
    return res.data;
  },

  async createRoom(payload: any) {
    const res = await api.post('/rooms', payload);
    return res.data;
  },

  async updateRoom(id: string, payload: any) {
    const res = await api.put(`/rooms/${id}`, payload);
    return res.data;
  },

  async deleteRoom(id: string) {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  },

  async uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const res = await api.post('/rooms/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
