const Withdrawal = require('../models/Withdrawal');
const { sendNotification } = require('../services/notificationService');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Helper to Log Admin Actions
const logAction = async (adminId, action, targetModel, targetId, details, ip) => {
    try {
        await AuditLog.create({ adminId, action, targetModel, targetId, details, ipAddress: ip });
    } catch (e) {
        console.error("Audit Log Failure:", e);
    }
};

// USER: Request Withdrawal
exports.requestWithdrawal = async (req, res) => {
    const { amount, upiId } = req.body;
    const userId = req.user.id;

    // LIMITS: Min ₹50, Max ₹2000 per request
    if (!amount || amount < 50) {
        return res.status(400).json({ message: 'Minimum withdrawal is ₹50' });
    }
    if (amount > 2000) {
        return res.status(400).json({ message: 'Maximum withdrawal per request is ₹2000' });
    }

    if (!upiId || !/^[\w.-]+@[\w]+$/.test(upiId)) {
        return res.status(400).json({ message: 'Invalid UPI ID format' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // KYC CHECK: If total withdrawals > 5000, require KYC
        if (user.totalWithdrawals + amount > 5000 && user.kycStatus !== 'verified') {
            return res.status(403).json({ message: 'KYC Verification required for withdrawals exceeding ₹5000 lifetime.' });
        }

        if (user.walletBalance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Check for pending withdrawal
        const existingPending = await Withdrawal.findOne({ userId, status: 'pending' });
        if (existingPending) {
            return res.status(400).json({ message: 'You already have a pending withdrawal request' });
        }

        const withdrawal = await Withdrawal.create({
            userId,
            amount,
            upiId,
            status: 'pending'
        });

        res.status(201).json({
            message: 'Withdrawal request submitted successfully',
            withdrawal
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// USER: Get My Withdrawals
exports.getMyWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ userId: req.user.id })
            .sort({ requestedAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ADMIN: Get Pending Withdrawals
exports.getPendingWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ status: 'pending' })
            .populate('userId', 'username phone email walletBalance')
            .sort({ requestedAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ADMIN: Handle Withdrawal (Approve/Reject)
exports.handleWithdrawal = async (req, res) => {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject'

    try {
        const withdrawal = await Withdrawal.findById(id).populate('userId');
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ message: 'Withdrawal already processed' });
        }

        if (action === 'approve') {
            // Atomic wallet deduction
            const user = await User.findOneAndUpdate(
                { _id: withdrawal.userId._id, walletBalance: { $gte: withdrawal.amount } },
                { $inc: { walletBalance: -withdrawal.amount } },
                { new: true }
            );

            if (!user) {
                return res.status(400).json({ message: 'Insufficient balance or user not found' });
            }

            withdrawal.status = 'approved';
            withdrawal.adminId = req.user.id;
            withdrawal.processedAt = new Date();
            await withdrawal.save();

            // Create Transaction Record for Statement
            await Transaction.create({
                userId: user._id,
                amount: withdrawal.amount,
                type: 'withdrawal',
                status: 'success',
                description: `Withdrawal Approved (UPI: ${withdrawal.upiId})`,
                balanceAfter: user.walletBalance
            });

            await logAction(req.user.id, 'APPROVE_WITHDRAWAL', 'Withdrawal', id, {
                amount: withdrawal.amount,
                upiId: withdrawal.upiId,
                balanceAfter: user.walletBalance
            }, req.ip);

            if (user.fcmToken) {
                await sendNotification(
                    user.fcmToken,
                    '✅ Withdrawal Approved',
                    `Your withdrawal of ₹${withdrawal.amount} has been processed.`
                );
            }

            res.json({ message: 'Withdrawal approved successfully', withdrawal });

        } else if (action === 'reject') {
            withdrawal.status = 'rejected';
            withdrawal.adminId = req.user.id;
            withdrawal.rejectionReason = reason || 'Admin rejected';
            withdrawal.processedAt = new Date();
            await withdrawal.save();

            await logAction(req.user.id, 'REJECT_WITHDRAWAL', 'Withdrawal', id, { reason }, req.ip);

            const user = await User.findById(withdrawal.userId);
            if (user && user.fcmToken) {
                await sendNotification(
                    user.fcmToken,
                    '❌ Withdrawal Rejected',
                    `Reason: ${reason || 'Admin decision'}`
                );
            }

            res.json({ message: 'Withdrawal rejected', withdrawal });

        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
