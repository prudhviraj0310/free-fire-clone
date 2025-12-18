const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }, // Optional, if linked to a payout
    claimText: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' },
    adminResponse: { type: String, default: '' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dispute', DisputeSchema);
