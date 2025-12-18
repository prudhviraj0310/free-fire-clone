const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 10 },
    upiId: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, default: '' },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date }
});

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
