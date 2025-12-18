const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const { limiter } = require('./middleware/rateLimiter');

// Middleware
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(cookieParser());
app.use(mongoSanitize());

// Apply global rate limiting to API routes
app.use('/api', limiter);

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || [
        "http://localhost:3000",
        "http://localhost:5000",
        "capacitor://localhost",
        "http://192.168.1.10:3000" // Adjust for diverse local dev IPs if needed
    ],
    credentials: true
}));
app.use(require('morgan')('dev'));

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const walletRoutes = require('./routes/walletRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { initBot } = require('./services/telegramBot');

// Initialize Telegram Bot
initBot();

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/disputes', require('./routes/disputeRoutes'));
app.use('/api/admin', adminRoutes);

// Database Connection
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        // Only use In-Memory if NO URI is provided or explicitly requested
        // In Docker/Production, MONGO_URI will be set
        if (!uri || uri === 'MEMORY') {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('CRITICAL: MONGO_URI must be provided in production mode.');
            }
            const mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log('⚠️  Using In-Memory MongoDB (Data will be lost on restart):', uri);
        } else {
            console.log('🔌 Connecting to provided MongoDB URI...');
        }

        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        // Retry logic or exit could be added here
    }
};

connectDB();

const seedData = async (req, res) => {
    try {
        const User = require('./models/User');
        const Tournament = require('./models/Tournament');
        const bcrypt = require('bcryptjs');

        await User.deleteMany({});
        await Tournament.deleteMany({});

        // Hash passwords before seeding
        const hashedUserPassword = await bcrypt.hash('password123', 12);
        const hashedAdminPassword = await bcrypt.hash('adminpassword', 12);

        await User.create([
            {
                phone: '1234567890',
                username: 'Demo User',
                email: 'demo@example.com',
                password: hashedUserPassword,
                role: 'user',
                walletBalance: 500
            },
            {
                phone: '9988776655',
                username: 'Super Admin',
                email: 'admin@freefire.com',
                password: hashedAdminPassword,
                role: 'super_admin',
                walletBalance: 10000
            }
        ]);

        await Tournament.create([
            {
                title: 'Daily Solo Rush',
                entryFee: 50,
                prizePool: 2000,
                prizeDistribution: '1st: 1000, 2nd: 600, 3rd: 400',
                matchTime: new Date(Date.now() + 3600000),
                map: 'Bermuda',
                type: 'BR',
                mode: 'SOLO',
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
                type: 'BR',
                mode: 'SQUAD',
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
                type: 'CS',
                mode: 'SOLO',
                maxPlayers: 30,
                registeredPlayers: []
            }
        ]);

        console.log("Database Seeded via API (with hashed passwords)");
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
