
const TelegramBot = require('node-telegram-bot-api');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
// In-memory session store for simplicity (Production should use Redis or DB)
const userSessions = {};

let bot;

const initBot = () => {
    if (!token) {
        console.warn('TELEGRAM_BOT_TOKEN is not set. Bot will not start.');
        return;
    }

    bot = new TelegramBot(token, { polling: true });

    // Helper for safe messaging
    const safeSendMessage = async (chatId, text, options = {}) => {
        try {
            await bot.sendMessage(chatId, text, options);
        } catch (e) {
            console.error(`Failed to send message to ${chatId}:`, e.message);
        }
    };

    // Handle /start <txId>
    bot.onText(/\/start (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const txId = match[1];

        try {
            const transaction = await Transaction.findById(txId);

            if (!transaction) {
                return safeSendMessage(chatId, "Invalid or Expired Transaction ID.");
            }

            if (transaction.status !== 'pending') {
                return safeSendMessage(chatId, `Transaction is already ${transaction.status}.`);
            }

            transaction.telegramChatId = chatId;
            transaction.logs.push({ action: 'BOT_STARTED', performedBy: 'user', details: `ChatID: ${chatId}` });
            await transaction.save();

            const welcomeText = `Welcome! You are depositing ₹${transaction.amount}.\n\n` +
                `Please pay to the following UPI ID:\n` +
                `\`${process.env.UPI_ID || 'admin@upi'}\`\n\n` +
                `After payment, please reply with the 12-digit UTR number.`;

            const qrPath = require('path').join(__dirname, '../assets/upi-qr.png');
            const fs = require('fs');

            if (fs.existsSync(qrPath)) {
                try {
                    await bot.sendPhoto(chatId, qrPath, {
                        caption: welcomeText,
                        parse_mode: 'Markdown'
                    });
                } catch (imgError) {
                    console.error("Error sending QR:", imgError);
                    // Fallback to text
                    safeSendMessage(chatId, welcomeText, { parse_mode: 'Markdown' });
                }
            } else {
                safeSendMessage(chatId, welcomeText, { parse_mode: 'Markdown' });
            }

            userSessions[chatId] = { step: 'WAITING_UTR', txId: txId };

        } catch (error) {
            console.error(error);
            safeSendMessage(chatId, "Error processing request.");
        }
    });

    // Handle UTR Input
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text && text.startsWith('/')) return; // Ignore commands

        const session = userSessions[chatId];
        if (!session || session.step !== 'WAITING_UTR') {
            // specific logic could go here, for now ignore or guide user
            return;
        }

        const utr = text.trim();
        if (!/^\d{12}$/.test(utr)) {
            return safeSendMessage(chatId, "Invalid UTR format. Please send the 12-digit UTR number.");
        }

        try {
            // Check for unique UTR
            const existing = await Transaction.findOne({ utr });
            if (existing) {
                return safeSendMessage(chatId, " This UTR has already been used. Please contact support.");
            }

            const transaction = await Transaction.findById(session.txId).populate('userId');
            if (!transaction) {
                delete userSessions[chatId];
                return safeSendMessage(chatId, "Transaction expired or not found.");
            }

            if (transaction.status !== 'pending') {
                delete userSessions[chatId];
                return safeSendMessage(chatId, `Transaction is already ${transaction.status}.`);
            }

            transaction.utr = utr;
            transaction.logs.push({ action: 'UTR_SUBMITTED', performedBy: 'user', details: `UTR: ${utr}` });
            await transaction.save();

            safeSendMessage(chatId, "UTR Received! verification pending. You will be notified once approved.");
            delete userSessions[chatId];

            if (adminChatId) {
                safeSendMessage(adminChatId,
                    `🔔 *New Deposit Pending*\n\n` +
                    `User: ${transaction.userId?.username || 'Unknown'} (${transaction.userId?.phone})\n` +
                    `Amount: ₹${transaction.amount}\n` +
                    `UTR: \`${utr}\`\n` +
                    `TxID: \`${transaction._id}\`\n\n` +
                    `To approve: /approve_${transaction._id}\n` +
                    `To reject: /reject_${transaction._id}`,
                    { parse_mode: 'Markdown' }
                );
            }

        } catch (error) {
            console.error(error);
            // Handle duplicate key error strictly if it slips through logic
            if (error.code === 11000) {
                return safeSendMessage(chatId, "Error: UTR already used.");
            }
            safeSendMessage(chatId, "Error saving UTR. Please try again.");
        }
    });

    // Atomic Approval
    bot.onText(/\/approve_(.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const txId = match[1];

        if (chatId.toString() !== adminChatId) return; // Silent reject

        try {
            // Atomic update to prevent race conditions
            const transaction = await Transaction.findOneAndUpdate(
                { _id: txId, status: 'pending' },
                {
                    $set: {
                        status: 'success',
                        adminActionBy: null // System/Admin bot context
                    },
                    $push: {
                        logs: { action: 'APPROVED', performedBy: 'admin', details: `Admin Chat: ${chatId}` }
                    }
                },
                { new: true }
            ).populate('userId');

            if (!transaction) {
                return safeSendMessage(chatId, "❌ Request failed. Transaction invalid, already processed, or expired.");
            }

            // Credit User Wallet
            // Note: Ideally this should be part of a transaction session if critical, 
            // but for now we assume consistency.
            const user = await User.findById(transaction.userId._id);
            if (user) {
                user.walletBalance += transaction.amount;
                await user.save();
            }

            safeSendMessage(chatId, `✅ Approved! User credited ₹${transaction.amount}.`);
            if (transaction.telegramChatId) {
                safeSendMessage(transaction.telegramChatId, `✅ Your deposit of ₹${transaction.amount} is successful! Balance updated.`);
            }

        } catch (error) {
            console.error(error);
            safeSendMessage(chatId, "Error performing approval.");
        }
    });

    // Atomic Rejection
    bot.onText(/\/reject_(.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const txId = match[1];

        if (chatId.toString() !== adminChatId) return;

        try {
            const transaction = await Transaction.findOneAndUpdate(
                { _id: txId, status: 'pending' },
                {
                    $set: { status: 'failed' },
                    $push: {
                        logs: { action: 'REJECTED', performedBy: 'admin', details: `Admin Chat: ${chatId}` }
                    }
                },
                { new: true }
            );

            if (!transaction) {
                return safeSendMessage(chatId, "❌ Request failed. Transaction invalid, already processed, or expired.");
            }

            safeSendMessage(chatId, "❌ Transaction rejected.");
            if (transaction.telegramChatId) {
                safeSendMessage(transaction.telegramChatId, `❌ Your deposit of ₹${transaction.amount} was rejected. Contact admin.`);
            }
        } catch (error) {
            console.error(error);
            safeSendMessage(chatId, "Error rejecting.");
        }
    });

    console.log('Telegram Bot Initilized (Secure Mode)');
};

module.exports = { initBot };
