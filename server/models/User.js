const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for Google Auth
    phone: { type: String, required: false, unique: true, sparse: true }, // Optional for Google Auth, sparse allows multiple nulls
    googleId: { type: String, unique: true, sparse: true }, // New field for Google Sign-In
    walletBalance: { type: Number, default: 0 },
    role: {
        type: String,
        enum: ['user', 'admin', 'super_admin', 'match_admin', 'finance_admin'],
        default: 'user'
    },
    gameUid: { type: String, default: '' }, // Legacy support, prefer gameDetails.freeFireId
    isBanned: { type: Boolean, default: false },
    gameDetails: {
        freeFireId: { type: String, default: '' },
        inGameName: { type: String, default: '' },
        level: { type: Number, default: 0 },
        rank: { type: String, default: 'Bronze' }
    },
    stats: {
        matchesPlayed: { type: Number, default: 0 },
        matchesWon: { type: Number, default: 0 },
        totalKills: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 }
    },
    // Anti-Fraud & Risk
    deviceId: { type: [String], default: [] }, // Array to allow legitimate partial device changes
    totalWithdrawals: { type: Number, default: 0 },
    kycStatus: {
        type: String,
        enum: ['none', 'pending', 'verified', 'rejected'],
        default: 'none'
    },
    fcmToken: { type: String, default: '' }, // For Firebase Push Notifications
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

