
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.initiateDeposit = async (req, res) => {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = new Transaction({
            userId,
            amount,
            type: 'deposit',
            status: 'pending'
        });

        await transaction.save({ session });
        await session.commitTransaction();

        const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'FreeFireEsportsBot';
        const telegramLink = `https://t.me/${botUsername}?start=${transaction._id}`;

        res.status(201).json({
            message: 'Transaction initiated',
            transactionId: transaction._id,
            telegramLink
        });

    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
};

exports.getWalletBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ balance: user.walletBalance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTransactionHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUBLIC API: Fetch payment details
exports.getPaymentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findById(id).select('amount status upiId paymentId createdAt expiresAt');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Strict check for "pending" status (optional, but good for UI)
        if (transaction.status !== 'pending') {
            return res.json({
                amount: transaction.amount,
                status: transaction.status,
                message: `Transaction is ${transaction.status}`
            });
        }

        // Check expiry
        if (new Date() > new Date(transaction.expiresAt)) {
            return res.status(400).json({ message: 'Transaction expired' });
        }

        res.json({
            amount: transaction.amount,
            status: transaction.status,
            upiId: process.env.UPI_ID || 'admin@upi',
            appName: 'FreeFireTournament', // Or from env
            _id: transaction._id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUBLIC API: Submit UTR
exports.submitPaymentUTR = async (req, res) => {
    try {
        const { txId, utr } = req.body;

        if (!txId || !utr) {
            return res.status(400).json({ message: 'Transaction ID and UTR are required' });
        }

        // 12-digit validation
        if (!/^\d{12}$/.test(utr)) {
            return res.status(400).json({ message: 'Invalid UTR format. Must be 12 digits.' });
        }

        // Unique UTR check
        const existing = await Transaction.findOne({ utr });
        if (existing) {
            return res.status(400).json({ message: 'This UTR has already been used.' });
        }

        const transaction = await Transaction.findById(txId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ message: `Transaction is already ${transaction.status}` });
        }

        if (new Date() > new Date(transaction.expiresAt)) {
            return res.status(400).json({ message: 'Transaction expired' });
        }

        transaction.utr = utr;
        transaction.logs.push({
            action: 'UTR_SUBMITTED_WEB',
            performedBy: 'user_web',
            details: `UTR: ${utr}, IP: ${req.ip}`
        });

        await transaction.save();

        // Notify Admin (Reuse Bot service logic if possible, or duplicate/emit event)
        // ideally we import bot service and send message
        try {
            const { initBot } = require('../services/telegramBot'); // Assuming accessible
            const TelegramBot = require('node-telegram-bot-api');
            if (process.env.TELEGRAM_BOT_TOKEN && process.env.ADMIN_TELEGRAM_CHAT_ID) {
                const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
                bot.sendMessage(process.env.ADMIN_TELEGRAM_CHAT_ID,
                    `🌐 *Web Deposit Pending*\n\n` +
                    `Amount: ₹${transaction.amount}\n` +
                    `UTR: \`${utr}\`\n` +
                    `TxID: \`${transaction._id}\`\n` +
                    `Approve: /approve_${transaction._id}`,
                    { parse_mode: 'Markdown' }
                ).catch(err => console.error("Bot Notification Failed", err.message));
            }
        } catch (e) {
            console.warn("Could not notify admin via bot", e);
        }

        res.json({ message: 'UTR Submitted successfully. Waiting for approval.', status: 'pending_verification' });

    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'UTR already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};
