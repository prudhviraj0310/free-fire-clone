const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'withdrawal', 'entry_fee', 'prize_winnings'], required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    paymentId: { type: String, default: '' },
    description: { type: String, default: '' },
    utr: { type: String, default: '', unique: true, sparse: true },
    telegramChatId: { type: String, default: '' },
    adminActionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, default: '' },

    // For Statement & Transparency
    balanceAfter: { type: Number, default: null }, // Balance AFTER this transaction (snapshot)
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }, // Link to match if applicable

    expiresAt: { type: Date, default: () => new Date(+new Date() + 30 * 60 * 1000), index: { expires: '0s' } },
    logs: [{
        action: String,
        performedBy: String, // 'user' or 'admin' 
        timestamp: { type: Date, default: Date.now },
        details: String
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
