const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Tournament = require('../models/Tournament');
const AuditLog = require('../models/AuditLog');
const { sendNotification } = require('../services/notificationService');

// Helper to Log Admin Actions
const logAction = async (adminId, action, targetModel, targetId, details, ip) => {
    try {
        await AuditLog.create({ adminId, action, targetModel, targetId, details, ipAddress: ip });
    } catch (e) {
        console.error("Audit Log Failure:", e);
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const newUsersToday = await User.countDocuments({
            role: 'user',
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        const activeMatches = await Tournament.countDocuments({ status: { $in: ['OPEN', 'LIVE', 'CONFIRMED'] } });

        const pendingDeposits = await Transaction.countDocuments({ type: 'deposit', status: 'pending' });
        const pendingDepositsValue = await Transaction.aggregate([
            { $match: { type: 'deposit', status: 'pending' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
        const pendingWithdrawalsValue = await Withdrawal.aggregate([
            { $match: { status: 'pending' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Revenue (Commission Logs)
        const revenue = await AuditLog.aggregate([
            { $match: { action: 'COMMISSION_LOG' } },
            { $group: { _id: null, total: { $sum: "$details.commissionAmount" } } }
        ]);

        const revenueToday = await AuditLog.aggregate([
            {
                $match: {
                    action: 'COMMISSION_LOG',
                    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                }
            },
            { $group: { _id: null, total: { $sum: "$details.commissionAmount" } } }
        ]);

        res.json({
            users: { total: totalUsers, today: newUsersToday },
            matches: { active: activeMatches },
            finance: {
                pendingDeposits: { count: pendingDeposits, value: pendingDepositsValue[0]?.total || 0 },
                pendingWithdrawals: { count: pendingWithdrawals, value: pendingWithdrawalsValue[0]?.total || 0 },
                revenue: { total: revenue[0]?.total || 0, today: revenueToday[0]?.total || 0 }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// FINANCE: Get Pending Deposits
exports.getPendingDeposits = async (req, res) => {
    try {
        const deposits = await Transaction.find({ type: 'deposit', status: 'pending' })
            .populate('userId', 'username phone')
            .sort({ createdAt: -1 });
        res.json(deposits);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// FINANCE: Handle Deposit (Approve/Reject)
exports.handleDeposit = async (req, res) => {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject'

    try {
        const transaction = await Transaction.findById(id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if (transaction.status !== 'pending') return res.status(400).json({ message: 'Transaction already processed' });

        if (action === 'approve') {
            transaction.status = 'success';
            transaction.adminActionBy = req.user.id;

            const user = await User.findById(transaction.userId);
            user.walletBalance += transaction.amount;
            await user.save();

            transaction.balanceAfter = user.walletBalance; // Snapshot balance
            await logAction(req.user.id, 'APPROVE_DEPOSIT', 'Transaction', id, { amount: transaction.amount, balanceAfter: user.walletBalance }, req.ip);

        } else if (action === 'reject') {
            transaction.status = 'failed';
            transaction.adminActionBy = req.user.id;
            transaction.rejectionReason = reason || 'Admin Rejected';

            await logAction(req.user.id, 'REJECT_DEPOSIT', 'Transaction', id, { reason }, req.ip);
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await transaction.save();
        res.json({ message: `Deposit ${action}ed successfully`, transaction });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// MATCHES: Submit & Distribute Prizes
exports.submitMatchResult = async (req, res) => {
    const { id } = req.params;
    const { winners } = req.body; // Array: [{ userId, rank, killCount }]

    try {
        const tournament = await Tournament.findById(id).populate('players.userId');
        if (!tournament) return res.status(404).json({ message: 'Match not found' });
        if (tournament.status === 'COMPLETED') return res.status(400).json({ message: 'Match already completed' });

        const totalPot = tournament.players.length * tournament.entryFee;
        const netPool = totalPot * (1 - (tournament.commissionRate / 100));

        // Distribution Logic (Simple 50-30-20 or Dynamic)
        // For MVP, assume admin sends exact prize amounts or we calc here.
        // Let's implement dynamic calculation closer to system design:
        // Rank 1: 50%, Rank 2: 30%, Rank 3: 20% (of NetPool)

        const distribution = [0.5, 0.3, 0.2]; // Configurable?
        const results = [];

        // Sort winners by rank just in case
        winners.sort((a, b) => a.rank - b.rank);

        for (let i = 0; i < winners.length; i++) {
            const winData = winners[i];
            const prize = Math.floor(netPool * (distribution[i] || 0));

            if (prize > 0) {
                // Atomic Wallet Credit
                const updatedUser = await User.findByIdAndUpdate(
                    winData.userId,
                    { $inc: { walletBalance: prize } },
                    { new: true }
                );

                // Record Transaction
                await Transaction.create({
                    userId: winData.userId,
                    amount: prize,
                    type: 'prize_winnings',
                    status: 'success',
                    description: `Won Rank ${winData.rank} in ${tournament.title}`,
                    balanceAfter: updatedUser.walletBalance,
                    matchId: tournament._id
                });

                results.push({ ...winData, prizeAmount: prize });

                // Send Notification
                if (updatedUser.fcmToken) {
                    await sendNotification(
                        updatedUser.fcmToken,
                        '🏆 Prize Credited!',
                        `You won ₹${prize} in ${tournament.title} (Rank ${winData.rank}).`
                    );
                }
            }
        }

        // Commission Logging
        const houseEarnings = totalPot - netPool;
        if (houseEarnings > 0) {
            await AuditLog.create({
                adminId: req.user.id,
                action: 'COMMISSION_LOG',
                targetModel: 'Tournament',
                targetId: tournament._id,
                details: {
                    matchId: tournament._id,
                    totalPot,
                    netPool,
                    commissionAmount: houseEarnings,
                    timestamp: new Date()
                },
                ipAddress: req.ip
            });
        }

        tournament.winners = results;
        tournament.status = 'COMPLETED';
        await tournament.save();

        await logAction(req.user.id, 'SUBMIT_RESULTS', 'Tournament', id, { winners: results }, req.ip);

        res.json({ message: 'Results submitted and prizes distributed', results });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// MATCHES: Get All Matches
exports.getMatches = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const matches = await Tournament.find(query)
            .select('title type mode map entryFee prizePool maxPlayers players status matchTime createdAt')
            .sort({ matchTime: -1 });

        const formatted = matches.map(m => ({
            _id: m._id,
            title: m.title,
            type: m.type,
            mode: m.mode,
            map: m.map,
            entryFee: m.entryFee,
            prizePool: m.prizePool,
            joined: m.players.length,
            maxPlayers: m.maxPlayers,
            status: m.status,
            matchTime: m.matchTime,
            createdAt: m.createdAt
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// MATCHES: Get Match Details (with players)
exports.getMatchDetails = async (req, res) => {
    try {
        const match = await Tournament.findById(req.params.id)
            .populate('players.userId', 'username phone gameDetails walletBalance');

        if (!match) return res.status(404).json({ message: 'Match not found' });

        res.json(match);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// USERS: Get All Users (Search & Pagination)
exports.getUsers = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const query = { role: 'user' };

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('username phone email walletBalance isBanned flags createdAt lastLogin')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// USERS: Get User Details
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch user stats summary
        const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);
        const tourneysPlayed = await Tournament.countDocuments({ "players.userId": user._id });

        const depositTotal = await Transaction.aggregate([
            { $match: { userId: user._id, type: 'deposit', status: 'success' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const withdrawTotal = await Transaction.aggregate([
            { $match: { userId: user._id, type: 'withdraw', status: 'success' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.json({
            user,
            stats: {
                matchesPlayed: tourneysPlayed,
                totalDeposited: depositTotal[0]?.total || 0,
                totalWithdrawn: withdrawTotal[0]?.total || 0
            },
            recentTransactions: transactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// USERS: Ban/Unban User
exports.handleBan = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body; // action: 'ban' | 'unban'

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (action === 'ban') {
            user.isBanned = true;
            user.banReason = reason || 'Violation of terms';
            await logAction(req.user.id, 'BAN_USER', 'User', id, { reason }, req.ip);
        } else {
            user.isBanned = false;
            user.banReason = null;
            await logAction(req.user.id, 'UNBAN_USER', 'User', id, {}, req.ip);
        }

        await user.save();
        res.json({ message: `User ${action}ned successfully`, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
