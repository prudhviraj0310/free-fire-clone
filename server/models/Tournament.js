const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['BR', 'CS'], required: true, default: 'BR' }, // Battle Royale or Clash Squad
    mode: { type: String, enum: ['SOLO', 'DUO', 'SQUAD'], required: true, default: 'SOLO' },
    map: { type: String, default: 'BERMUDA' },

    matchTime: { type: Date, required: true },

    // Economics
    entryFee: { type: Number, required: true },
    prizePool: { type: Number, required: true },
    commissionRate: { type: Number, default: 30 }, // Percentage

    // Players
    maxPlayers: { type: Number, default: 48 },
    minPlayers: { type: Number, default: 30 },

    players: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        inGameName: String,
        slot: Number,
        teamId: String, // For Duo/Squad logic
        joinedAt: { type: Date, default: Date.now }
    }],
    registeredPlayers: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, gameName: String }], // Legacy support temporarily

    // Room Details (Protected)
    roomId: { type: String, select: false },
    roomPassword: { type: String, select: false },

    // State
    status: {
        type: String,
        enum: ['CREATED', 'OPEN', 'VOTING', 'CONFIRMED', 'LIVE', 'COMPLETED', 'CANCELLED'],
        default: 'CREATED'
    },

    // Voting System for Low Participation
    voting: {
        isActive: { type: Boolean, default: false },
        deadline: Date,
        votes: [{
            userId: mongoose.Schema.Types.ObjectId,
            vote: { type: String, enum: ['YES', 'NO'] }
        }]
    },

    // Results & Prizes
    winners: [{
        rank: Number,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        prizeAmount: Number,
        killCount: Number
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tournament', TournamentSchema);
