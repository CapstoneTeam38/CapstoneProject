const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const Transaction = require('../models/transactions');

// ===============================
// MIDDLEWARE
// ===============================
function ensureGuest(req, res, next) {
    if (req.isAuthenticated()) return res.redirect('/dashboard');
    next();
}

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// ===============================
// GET PAGES
// ===============================
router.get('/', (req, res) => res.redirect('/login'));

router.get('/login', ensureGuest, (req, res) => {
    res.render('login', { error: req.flash('error') });
});

router.get('/signup', ensureGuest, (req, res) => {
    res.render('signup', { error: req.flash('error') });
});

router.get('/dashboard', ensureAuth, (req, res) => {
    res.render('dashboard', { user: req.user });
});

// ===============================
// POST SIGNUP
// ===============================
router.post('/signup', ensureGuest, async (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    console.log('BODY RECEIVED:', req.body);

    try {
        if (!name || !email || !password) {
            req.flash('error', 'All fields are required');
            return res.redirect('/signup');
        }

        if (password !== confirm_password) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/signup');
        }

        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters');
            return res.redirect('/signup');
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            req.flash('error', 'Email already registered');
            return res.redirect('/signup');
        }

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password
        });
        await newUser.save();

        req.login(newUser, (err) => {
            if (err) {
                req.flash('error', 'Login after signup failed');
                return res.redirect('/login');
            }
            return res.redirect('/dashboard');
        });

    } catch (err) {
        console.error('SIGNUP ERROR FULL:', err);
        req.flash('error', err.message);
        res.redirect('/signup');
    }
});

// ===============================
// POST LOGIN
// ===============================
router.post('/login', ensureGuest, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('LOGIN ERROR:', err);
            return next(err);
        }
        if (!user) {
            req.flash('error', info?.message || 'Invalid email or password');
            return res.redirect('/login');
        }
        req.login(user, (err) => {
            if (err) return next(err);
            return res.redirect('/dashboard');
        });
    })(req, res, next);
});

// ===============================
// LOGOUT
// ===============================
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

// ===============================
// GOOGLE AUTH
// ===============================
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

// ===============================
// TRANSACTIONS & ALERTS
// ===============================
router.get('/transactions', ensureAuth, async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ timestamp: -1 });
        res.render('transactions', { transactions });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/alerts', ensureAuth, async (req, res) => {
    try {
        const alerts = await Transaction.find({ isFraud: true }).sort({ timestamp: -1 });
        res.render('alerts', { alerts });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ===============================
// API STATS
// ===============================
router.get('/api/stats', ensureAuth, async (req, res) => {
    try {
        const totalCount = await Transaction.countDocuments();
        const fraudCount = await Transaction.countDocuments({ isFraud: true });

        const recentData = await Transaction.find()
            .sort({ timestamp: -1 })
            .limit(10);

        const smoothedRisk = recentData.map((t, i, arr) => {
            const current = t.riskScore || 0;
            const prev = arr[i - 1]?.riskScore ?? current;
            const next = arr[i + 1]?.riskScore ?? current;
            return Math.round((prev + current + next) / 3);
        });

        res.json({
            totalTransactions: totalCount,
            fraudsDetected: fraudCount,
            globalRiskScore: totalCount > 0
                ? Math.round((fraudCount / totalCount) * 100)
                : 0,
            chartLabels: recentData
                .map(t => new Date(t.timestamp).toLocaleTimeString())
                .reverse(),
            chartValues: smoothedRisk.reverse()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;