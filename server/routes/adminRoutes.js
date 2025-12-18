const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const withdrawalController = require('../controllers/withdrawalController');
const tournamentController = require('../controllers/tournamentController');
const { verifyAdmin, restrictTo } = require('../middleware/adminAuth');

// All routes require Admin Token
router.use(verifyAdmin);

// Dashboard
router.get('/stats', adminController.getDashboardStats);

// Finance - Deposits (Finance Admin or Super Admin)
router.get('/deposits', restrictTo('finance_admin'), adminController.getPendingDeposits);
router.post('/deposit/:id', restrictTo('finance_admin'), adminController.handleDeposit);

// Finance - Withdrawals (Finance Admin or Super Admin)
router.get('/withdrawals', restrictTo('finance_admin'), withdrawalController.getPendingWithdrawals);
router.post('/withdrawal/:id', restrictTo('finance_admin'), withdrawalController.handleWithdrawal);

// Matches (Match Admin or Super Admin)
const tournamentController = require('../controllers/tournamentController'); // Import at top

// ... (existing routes)

// Matches (Match Admin or Super Admin)
router.get('/matches', restrictTo('match_admin', 'admin'), adminController.getMatches);
router.get('/match/:id', restrictTo('match_admin', 'admin'), adminController.getMatchDetails);
router.post('/match/:id/results', restrictTo('match_admin', 'admin'), adminController.submitMatchResult);
router.post('/matches', restrictTo('match_admin', 'admin'), tournamentController.createTournament);
router.delete('/match/:id', restrictTo('match_admin', 'admin'), tournamentController.deleteTournament);

// Users (Super Admin only for bans, support for viewing)
router.get('/users', restrictTo('admin', 'super_admin', 'support_admin'), adminController.getUsers);
router.get('/user/:id', restrictTo('admin', 'super_admin', 'support_admin'), adminController.getUserDetails);
router.post('/user/:id/ban', restrictTo('admin', 'super_admin'), adminController.handleBan);

// Notifications
router.post('/broadcast', restrictTo('admin', 'super_admin'), adminController.sendBroadcast);

// Logs
router.get('/logs', restrictTo('super_admin'), adminController.getAuditLogs);

module.exports = router;
