const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Mock OTP Store (In-memory for MVP)
const otpStore = {};

exports.sendOtp = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    // Generate Mock OTP
    const otp = '123456';
    otpStore[phone] = otp;

    console.log(`OTP for ${phone}: ${otp}`);

    res.status(200).json({ message: 'OTP sent successfully', otp: '123456' }); // Return OTP for easier testing
};

exports.verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;

    if (otpStore[phone] !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear OTP
    delete otpStore[phone];

    try {
        let user = await User.findOne({ phone });

        if (!user) {
            user = new User({
                phone,
                role: phone === '9999999999' ? 'admin' : 'user', // Backdoor for testing
                walletBalance: phone === '9999999999' ? 10000 : 0
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '7d'
        });

        res.status(200).json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        // Middleware should attach user to req
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
