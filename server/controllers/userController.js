const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.depositMock = async (req, res) => { // For MVP testing
    const { amount } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        user.walletBalance += amount;
        await user.save();

        await Transaction.create({
            userId,
            amount,
            type: 'deposit',
            status: 'success',
            description: 'Mock Deposit'
        });

        res.status(200).json({ message: 'Deposit successful', balance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
