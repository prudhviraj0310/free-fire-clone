const User = require('../models/User');

exports.checkDeviceLimit = async (req, res, next) => {
    const deviceId = req.headers['x-device-id'];

    // If no device ID provided (e.g. browser without this logic yet), maybe skip or warn
    // For now, we enforce it for mobile app
    if (!deviceId) return next();

    try {
        // Count how many users have this deviceId in their array
        const deviceCount = await User.countDocuments({ deviceId: deviceId });

        // Limit: Max 2 accounts per device
        if (deviceCount >= 2) {
            return res.status(403).json({ message: 'Device limit reached. Max 2 accounts per device.' });
        }

        next();
    } catch (error) {
        console.error("Device Check Error:", error);
        next(); // Fail open or closed? Fail open for now to not block legits on error
    }
};

exports.captureDeviceId = async (req, res, next) => {
    const deviceId = req.headers['x-device-id'];
    if (deviceId && req.user) {
        try {
            // Add deviceId if not present
            if (!req.user.deviceId.includes(deviceId)) {
                req.user.deviceId.push(deviceId);
                await req.user.save();
            }
        } catch (e) {
            console.error("Failed to capture device ID:", e);
        }
    }
    next();
};
