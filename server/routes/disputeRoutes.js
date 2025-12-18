const express = require('express');
const router = express.Router();
const Dispute = require('../models/Dispute');
const auth = require('../middleware/auth');

// Create Dispute
router.post('/', auth, async (req, res) => {
    try {
        const { matchId, claimText } = req.body;

        if (!matchId || !claimText) {
            return res.status(400).json({ message: 'Missing details' });
        }

        const dispute = await Dispute.create({
            userId: req.user.id,
            matchId,
            claimText,
            status: 'pending'
        });

        res.status(201).json({ message: 'Dispute submitted', dispute });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
