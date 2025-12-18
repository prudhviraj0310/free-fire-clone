const Tournament = require('../models/Tournament');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getTournaments = async (req, res) => {
    try {
        const { status } = req.query;
        // Map frontend "upcoming" to new status enums if needed, or backend handles it.
        // For now, return all not completed/cancelled if no status provided
        const query = status ? { status } : { status: { $nin: ['COMPLETED', 'CANCELLED'] } };

        const tournaments = await Tournament.find(query)
            .select('-roomId -roomPassword') // Exclude sensitive info by default
            .sort({ matchTime: 1 });

        res.status(200).json(tournaments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        // Security Check for Room Details
        // Logic: Reveal only if User is joined AND (Status is LIVE/CONFIRMED) AND (Time check passed)
        let showRoomDetails = false;
        const userId = req.user ? req.user.id : null; // Optional auth if public route, but usually auth'd

        if (userId) {
            const isJoined = tournament.players.some(p => p.userId.toString() === userId);

            // Check time: 15 mins before matchTime
            const timeDiff = new Date(tournament.matchTime) - new Date();
            const isNearStart = timeDiff <= 15 * 60 * 1000;

            if (isJoined && (tournament.status === 'CONFIRMED' || tournament.status === 'LIVE') && isNearStart) {
                showRoomDetails = true;
            }
        }

        if (showRoomDetails) {
            // Explicitly fetch/return room details if check passes
            // Since we didn't select them out in findById, they might be hidden by schema options
            // Use explicit select to get them
            const fullTournament = await Tournament.findById(req.params.id).select('+roomId +roomPassword');
            return res.status(200).json(fullTournament);
        }

        // Return without sensitive details (Mongoose default with select: false in schema)
        res.status(200).json(tournament);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.joinTournament = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const tournament = await Tournament.findById(id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        if (tournament.players.length >= tournament.maxPlayers) {
            return res.status(400).json({ message: 'Tournament is full' });
        }

        const alreadyJoined = tournament.players.some(p => p.userId.toString() === userId);
        if (alreadyJoined) return res.status(400).json({ message: 'Already registered' });

        // Atomic Transaction: Check balance AND deduct in one go
        const user = await User.findOneAndUpdate(
            { _id: userId, walletBalance: { $gte: tournament.entryFee } },
            { $inc: { walletBalance: -tournament.entryFee } },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Add to players list
        tournament.players.push({
            userId,
            inGameName: user.gameDetails?.inGameName || user.gameUid || 'Unknown',
            slot: tournament.players.length + 1
        });

        // Update status if full (Optional)
        if (tournament.players.length >= tournament.maxPlayers) {
            // tournament.status = 'CONFIRMED'; // Or keep OPEN until voting check
        }

        await tournament.save();

        // Record Transaction
        await Transaction.create({
            userId,
            amount: tournament.entryFee,
            type: 'entry_fee',
            status: 'success',
            description: `Entry fee for ${tournament.title}`,
            balanceAfter: user.walletBalance,
            matchId: tournament._id
        });

        res.status(200).json({ message: 'Joined successfully', tournament });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createTournament = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    try {
        const tournament = new Tournament({
            ...req.body,
            status: 'CREATED' // Defaut
        });
        await tournament.save();
        res.status(201).json(tournament);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTournament = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    try {
        // Allow updating room details
        const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(tournament);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTournament = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        if (tournament.players.length > 0) {
            return res.status(400).json({ message: 'Cannot delete tournament with registered players. Cancel it instead.' });
        }

        await Tournament.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tournament deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
