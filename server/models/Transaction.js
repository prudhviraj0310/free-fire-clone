const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'withdrawal', 'entry_fee', 'prize_winnings'], required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    paymentId: { type: String, default: '' },
    description: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
