const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user'); // Fixed lowercase 'u'
const Transaction = require('../models/transactions');

// Middleware to protect routes
function ensureGuest(req, res, next) {
    if (req.isAuthenticated()) return res.redirect('/dashboard');
    next();
}

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Auth Pages
router.get('/', (req, res) => res.redirect('/login'));
router.get('/login', ensureGuest, (req, res) => res.render('login', { error: req.flash('error') }));
router.get('/signup', ensureGuest, (req, res) => res.render('signup', { error: req.flash('error') }));

// Dashboard View
router.get('/dashboard', ensureAuth, (req, res) => {
    res.render('dashboard', { user: req.user });
});

// Google Authentication Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

// Transactions & Alerts Views
router.get('/transactions', ensureAuth, async (req, res) => {
    try {
        // Pulls from 'predictions' collection via transactions model
        const transactions = await Transaction.find().sort({ timestamp: -1 });
        res.render('transactions', { transactions });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/alerts', ensureAuth, async (req, res) => {
    try {
        // Pulls only ensemble-flagged frauds
        const alerts = await Transaction.find({ isFraud: true }).sort({ timestamp: -1 });
        res.render('alerts', { alerts });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Inside your BACKEND routes file (e.g., routes/auth.js)
router.get('/api/stats', ensureAuth, async (req, res) => {
    try {
        // 1. Get real data from your MongoDB models
        const totalCount = await Transaction.countDocuments();
        const fraudCount = await Transaction.countDocuments({ isFraud: true });

        // 2. Fetch the last 10 transactions for the graph
        const recentData = await Transaction.find()
            .sort({ timestamp: -1 })
            .limit(10);

        // 3. Send it back as JSON (this is what dashboard.js "eats")
        res.json({
            totalTransactions: totalCount,
            fraudsDetected: fraudCount,
            globalRiskScore: totalCount > 0 ? Math.round((fraudCount / totalCount) * 100) : 0,
            chartLabels: recentData.map(t => new Date(t.timestamp).toLocaleTimeString()).reverse(),
            chartValues: recentData.map(t => t.Amount).reverse()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});
module.exports = router;