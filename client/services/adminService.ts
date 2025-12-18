import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const adminService = {
    // DASHBOARD
    getStats: async () => {
        const res = await axios.get(`${API_URL}/admin/stats`, getAuthHeaders());
        return res.data;
    },

    // FINANCE
    getPendingDeposits: async () => {
        const res = await axios.get(`${API_URL}/admin/deposits`, getAuthHeaders());
        return res.data;
    },

    handleDeposit: async (id: string, action: 'approve' | 'reject', reason?: string) => {
        const res = await axios.post(`${API_URL}/admin/deposit/${id}`, { action, reason }, getAuthHeaders());
        return res.data;
    },

    // MATCHES
    getMatches: async () => {
        const res = await axios.get(`${API_URL}/admin/matches`, getAuthHeaders());
        return res.data;
    },

    getMatch: async (id: string) => {
        const res = await axios.get(`${API_URL}/admin/match/${id}`, getAuthHeaders());
        return res.data;
    },

    submitResults: async (id: string, winners: any[]) => {
        const res = await axios.post(`${API_URL}/admin/match/${id}/results`, { winners }, getAuthHeaders());
        return res.data;
    },

    createTournament: async (data: any) => {
        const res = await axios.post(`${API_URL}/admin/matches`, data, getAuthHeaders());
        return res.data;
    },

    deleteTournament: async (id: string) => {
        const res = await axios.delete(`${API_URL}/admin/match/${id}`, getAuthHeaders());
        return res.data;
    },

    // WITHDRAWALS
    getPendingWithdrawals: async () => {
        const res = await axios.get(`${API_URL}/admin/withdrawals`, getAuthHeaders());
        return res.data;
    },

    handleWithdrawal: async (id: string, action: 'approve' | 'reject', reason?: string) => {
        const res = await axios.post(`${API_URL}/admin/withdrawal/${id}`, { action, reason }, getAuthHeaders());
        return res.data;
    },

    // USERS
    getUsers: async (search?: string) => {
        const params = search ? { search } : {};
        const res = await axios.get(`${API_URL}/admin/users`, { ...getAuthHeaders(), params });
        return res.data;
    },

    getUser: async (id: string) => {
        const res = await axios.get(`${API_URL}/admin/user/${id}`, getAuthHeaders());
        return res.data;
    },

    banUser: async (id: string, action: 'ban' | 'unban', reason?: string) => {
        const res = await axios.post(`${API_URL}/admin/user/${id}/ban`, { action, reason }, getAuthHeaders());
        return res.data;
    },

    // NOTIFICATIONS
    sendBroadcast: async (title: string, body: string) => {
        const res = await axios.post(`${API_URL}/admin/broadcast`, { title, body }, getAuthHeaders());
        return res.data;
    },

    // LOGS
    getLogs: async () => {
        const res = await axios.get(`${API_URL}/admin/logs`, getAuthHeaders());
        return res.data;
    }
};
