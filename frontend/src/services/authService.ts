import { api } from './api';


export interface RegisterPayload {
  name: string;
  email: string;
  passwordHash?: string; // mapping locally for backend
  password?: string;
  phone?: string;
  avatar?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export const authService = {
  async register(payload: RegisterPayload) {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  async login(payload: LoginPayload) {
    const res = await api.post('/auth/login', payload);
    return res.data;
  },

  async logout(refreshToken: string) {
    const res = await api.post('/auth/logout', { refreshToken });
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token: string, password: string) {
    const res = await api.post(`/auth/reset-password/${token}`, { password });
    return res.data;
  },

  // User Profile services
  async getMe() {
    const res = await api.get('/users/me');
    return res.data;
  },

  async updateProfile(payload: { name: string; phone?: string; avatar?: string }) {
    const res = await api.put('/users/me', payload);
    return res.data;
  },

  async changePassword(payload: any) {
    const res = await api.put('/users/change-password', payload);
    return res.data;
  },

  // Admin user management services
  async getAllUsers() {
    const res = await api.get('/users');
    return res.data;
  },

  async updateUserRole(id: string, role: 'ADMIN' | 'USER') {
    const res = await api.put(`/users/${id}/role`, { role });
    return res.data;
  },

  async updateUserStatus(id: string, isVerified: boolean) {
    const res = await api.put(`/users/${id}/status`, { isVerified });
    return res.data;
  },

  async getDashboardStats() {
    const res = await api.get('/admin/dashboard/stats');
    return res.data;
  },
};
