const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Database Connection
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;
        if (!uri || uri.includes('localhost')) {
            const mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log('Using In-Memory MongoDB:', uri);
        }

        await mongoose.connect(uri);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
    }
};

connectDB();

const seedData = async (req, res) => {
    try {
        const User = require('./models/User');
        const Tournament = require('./models/Tournament');

        await User.deleteMany({});
        await Tournament.deleteMany({});

        await User.create({
            phone: '1234567890',
            username: 'Demo User',
            role: 'user',
            walletBalance: 500
        });

        await Tournament.create([
            {
                title: 'Daily Solo Rush',
                entryFee: 50,
                prizePool: 2000,
                prizeDistribution: '1st: 1000, 2nd: 600, 3rd: 400',
                matchTime: new Date(Date.now() + 3600000),
                map: 'Bermuda',
                type: 'Solo',
                maxPlayers: 48,
                registeredPlayers: []
            },
            {
                title: 'Squad Brawlers',
                entryFee: 200,
                prizePool: 8000,
                prizeDistribution: '1st: 5000, 2nd: 3000',
                matchTime: new Date(Date.now() + 7200000),
                map: 'Purgatory',
                type: 'Squad',
                maxPlayers: 12,
                registeredPlayers: []
            },
            {
                title: 'Sniper Only',
                entryFee: 100,
                prizePool: 3000,
                prizeDistribution: 'Winner Takes All',
                matchTime: new Date(Date.now() + 10000000),
                map: 'Kalahari',
                type: 'Solo',
                maxPlayers: 30,
                registeredPlayers: []
            }
        ]);

        console.log("Database Seeded via API");
        if (res) res.json({ message: "Seeded" });
    } catch (e) {
        console.error(e);
        if (res) res.status(500).json({ error: e.message });
    }
};

app.get('/api/seed', seedData);

// Routes
app.get('/', (req, res) => {
    res.send('Free Fire Tournament API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
