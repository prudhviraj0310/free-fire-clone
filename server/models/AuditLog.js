const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'APPROVE_DEPOSIT', 'CREATE_MATCH'
    targetModel: { type: String, required: true }, // 'Transaction', 'Tournament', 'User'
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    details: { type: Object }, // Snapshot of changes or Request Body
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
