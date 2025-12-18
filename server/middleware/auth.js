
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = null;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers['authorization']) {
        const bearer = req.headers['authorization'].split(' ');
        if (bearer.length === 2) token = bearer[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyToken;
