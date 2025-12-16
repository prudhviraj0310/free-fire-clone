const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    entryFee: { type: Number, required: true },
    prizePool: { type: Number, required: true },
    prizeDistribution: { type: String, required: true },
    matchTime: { type: Date, required: true },
    map: { type: String, default: 'Bermuda' },
    type: { type: String, enum: ['Solo', 'Duo', 'Squad'], default: 'Solo' },
    maxPlayers: { type: Number, default: 48 },
    registeredPlayers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        gameName: String
    }],
    roomId: { type: String, default: '' },
    roomPassword: { type: String, default: '' },
    status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tournament', TournamentSchema);
