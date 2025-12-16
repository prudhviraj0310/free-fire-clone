const mongoose = require('mongoose');
const User = require('./models/User');
const Tournament = require('./models/Tournament');
const dotenv = require('dotenv');

dotenv.config();

const { MongoMemoryServer } = require('mongodb-memory-server');

const seed = async () => {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('Connected to In-Memory DB for Seeding');

    await User.deleteMany({});
    await Tournament.deleteMany({});

    // Create Admin
    const admin = await User.create({
        phone: '9999999999',
        username: 'Admin',
        role: 'admin',
        walletBalance: 10000
    });
    console.log('Admin created:', admin.phone);

    // Create User
    const user = await User.create({
        phone: '8888888888',
        username: 'PlayerOne',
        walletBalance: 100,
        gameUid: 'FF_12345'
    });
    console.log('User created:', user.phone);

    // Create Tournaments
    await Tournament.create({
        title: 'Daily Solo Match #1',
        entryFee: 50,
        prizePool: 1000,
        prizeDistribution: '1st: 500, 2nd: 300, 3rd: 200',
        matchTime: new Date(Date.now() + 3600000), // 1 hour later
        map: 'Bermuda',
        type: 'Solo',
        maxPlayers: 48
    });

    await Tournament.create({
        title: 'Squad War #1',
        entryFee: 100,
        prizePool: 2000,
        prizeDistribution: '1st: 1200, 2nd: 800',
        matchTime: new Date(Date.now() + 86400000), // 24 hours later
        map: 'Purgatory',
        type: 'Squad',
        maxPlayers: 12
    });

    console.log('Tournaments seeded');
    process.exit();
};

seed();
