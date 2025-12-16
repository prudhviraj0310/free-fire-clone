const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    username: { type: String, default: '' },
    gameUid: { type: String, default: '' },
    walletBalance: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
