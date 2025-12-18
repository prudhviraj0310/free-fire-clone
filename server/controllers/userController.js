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

exports.deposit = async (req, res) => {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.walletBalance += amount;
        await user.save();

        await Transaction.create({
            userId,
            amount,
            type: 'deposit',
            status: 'success',
            paymentId: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            description: `Deposit via ${paymentMethod || 'Gateway'}`,
        });

        res.status(200).json({ message: 'Deposit successful', balance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
