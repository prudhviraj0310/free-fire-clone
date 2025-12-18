const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyAdmin = async (req, res, next) => {
    // 1. Verify Token (Cookies or Header)
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
        const user = await User.findById(decoded.id);

        if (!user) return res.status(401).json({ message: 'Admin not found' });

        // Check for ANY admin role
        const adminRoles = ['admin', 'super_admin', 'match_admin', 'finance_admin'];
        if (!adminRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        req.user = user; // Attach full user object for role checking in next step
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// restrictTo('super_admin', 'finance_admin')
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // 'super_admin' always has access
        if (req.user.role === 'super_admin') return next();

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        next();
    };
};
