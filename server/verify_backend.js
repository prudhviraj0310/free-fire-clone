const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('Starting Verification...');

    try {
        // 1. Admin Login & Create Tournament
        console.log('\n--- Admin Flow ---');
        await axios.post(`${BASE_URL}/auth/send-otp`, { phone: '9999999999' });
        const adminLogin = await axios.post(`${BASE_URL}/auth/verify-otp`, { phone: '9999999999', otp: '123456' });
        const adminToken = adminLogin.data.token;
        console.log('Admin Logged In');

        const tournamentRes = await axios.post(`${BASE_URL}/tournaments`, {
            title: 'Verified Cup',
            entryFee: 50,
            prizePool: 1000,
            prizeDistribution: 'Winner takes all',
            matchTime: new Date(Date.now() + 3600000),
            map: 'Bermuda',
            type: 'Solo',
            maxPlayers: 10
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        const tournamentId = tournamentRes.data._id;
        console.log('Tournament Created:', tournamentRes.data.title);


        // 2. User Login
        console.log('\n--- User Flow ---');
        await axios.post(`${BASE_URL}/auth/send-otp`, { phone: '8888888888' });
        const userLogin = await axios.post(`${BASE_URL}/auth/verify-otp`, { phone: '8888888888', otp: '123456' });
        const userToken = userLogin.data.token;
        console.log('User Logged In');

        // 3. Deposit
        console.log('\n--- Wallet Deposit ---');
        await axios.post(`${BASE_URL}/user/deposit`, { amount: 100 }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('Deposit Successful');

        // 4. Join Tournament
        console.log('\n--- Join Tournament ---');
        await axios.post(`${BASE_URL}/tournaments/${tournamentId}/join`, {}, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('Joined Tournament successfully');

        // 5. Verify Registration
        const tCheck = await axios.get(`${BASE_URL}/tournaments/${tournamentId}`);
        if (tCheck.data.registeredPlayers.length === 1) {
            console.log('Verification Passed: Player count is 1');
        } else {
            console.error('Verification Failed: Player count mismatch');
        }

    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

runTests();
