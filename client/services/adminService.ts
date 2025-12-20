import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create instance with credentials support (cookies)
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Add interceptor to inject token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const adminService = {
    // DASHBOARD
    getStats: async () => {
        const res = await api.get('/admin/stats');
        return res.data;
    },

    // FINANCE
    getPendingDeposits: async () => {
        const res = await api.get('/admin/deposits');
        return res.data;
    },

    handleDeposit: async (id: string, action: 'approve' | 'reject', reason?: string) => {
        const res = await api.post(`/admin/deposit/${id}`, { action, reason });
        return res.data;
    },

    // MATCHES
    getMatches: async () => {
        const res = await api.get('/admin/matches');
        return res.data;
    },

    getMatch: async (id: string) => {
        const res = await api.get(`/admin/match/${id}`);
        return res.data;
    },

    submitResults: async (id: string, winners: any[]) => {
        const res = await api.post(`/admin/match/${id}/results`, { winners });
        return res.data;
    },

    createTournament: async (data: any) => {
        const res = await api.post('/admin/matches', data);
        return res.data;
    },

    deleteTournament: async (id: string) => {
        const res = await api.delete(`/admin/match/${id}`);
        return res.data;
    },

    // WITHDRAWALS
    getPendingWithdrawals: async () => {
        const res = await api.get('/admin/withdrawals');
        return res.data;
    },

    handleWithdrawal: async (id: string, action: 'approve' | 'reject', reason?: string) => {
        const res = await api.post(`/admin/withdrawal/${id}`, { action, reason });
        return res.data;
    },

    // USERS
    getUsers: async (search?: string) => {
        const params = search ? { search } : {};
        const res = await api.get('/admin/users', { params });
        return res.data;
    },

    getUser: async (id: string) => {
        const res = await api.get(`/admin/user/${id}`);
        return res.data;
    },

    banUser: async (id: string, action: 'ban' | 'unban', reason?: string) => {
        const res = await api.post(`/admin/user/${id}/ban`, { action, reason });
        return res.data;
    },

    // NOTIFICATIONS
    sendBroadcast: async (title: string, body: string) => {
        const res = await api.post('/admin/broadcast', { title, body });
        return res.data;
    },

    // LOGS
    getLogs: async () => {
        const res = await api.get('/admin/logs');
        return res.data;
    }
};
