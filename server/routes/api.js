const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const userController = require('../controllers/userController');
const jwt = require('jsonwebtoken');

// Middleware duplication (should be shared util, but keeping simple)
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secret', (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token' });
        req.user = decoded;
        next();
    });
};

// Tournament Routes
router.get('/tournaments', tournamentController.getTournaments);
router.get('/tournaments/:id', tournamentController.getTournament);
router.post('/tournaments/:id/join', verifyToken, tournamentController.joinTournament);
router.post('/tournaments', verifyToken, tournamentController.createTournament); // Admin
router.put('/tournaments/:id', verifyToken, tournamentController.updateTournament); // Admin

// User Routes
router.get('/user/transactions', verifyToken, userController.getTransactions);
router.post('/user/deposit', verifyToken, userController.deposit);

module.exports = router;
