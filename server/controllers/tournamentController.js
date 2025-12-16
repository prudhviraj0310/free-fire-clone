const Tournament = require('../models/Tournament');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getTournaments = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const tournaments = await Tournament.find(query).sort({ matchTime: 1 });
        res.status(200).json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        res.status(200).json(tournament);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.joinTournament = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // From middleware

    try {
        const tournament = await Tournament.findById(id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        if (tournament.registeredPlayers.length >= tournament.maxPlayers) {
            return res.status(400).json({ message: 'Tournament is full' });
        }

        const alreadyJoined = tournament.registeredPlayers.some(p => p.userId.toString() === userId);
        if (alreadyJoined) return res.status(400).json({ message: 'Already registered' });

        const user = await User.findById(userId);
        if (user.walletBalance < tournament.entryFee) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct Balance
        user.walletBalance -= tournament.entryFee;
        await user.save();

        // Create Transaction Record
        await Transaction.create({
            userId,
            amount: tournament.entryFee,
            type: 'entry_fee',
            status: 'success',
            description: `Entry fee for ${tournament.title}`
        });

        // Register User
        tournament.registeredPlayers.push({ userId, gameName: user.gameUid }); // Assuming gameUid is set
        await tournament.save();

        res.status(200).json({ message: 'Joined successfully', tournament });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createTournament = async (req, res) => {
    // Admin only check should be in middleware or here
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    try {
        const tournament = new Tournament(req.body);
        await tournament.save();
        res.status(201).json(tournament);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTournament = async (req, res) => { // Adding Room ID/Pass
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    try {
        const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(tournament);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
