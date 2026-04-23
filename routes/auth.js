const express = require('express');
const router = express.Router();
const passport = require('passport');
<<<<<<< HEAD
const User = require('../models/User');
const Transaction = require('../models/transactions');

// ===============================
// MIDDLEWARE
// ===============================
=======
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const User = require('../models/user');

const FLASK = 'http://127.0.0.1:5001';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }
});

>>>>>>> 656b814532bcbe80b788089bfc6156c35dd6d4e8
function ensureGuest(req, res, next) {
    if (req.isAuthenticated()) return res.redirect('/dashboard');
    next();
}
function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

<<<<<<< HEAD
// ===============================
// GET PAGES
// ===============================
=======
// ── Auth Pages ────────────────────────────────────────────────────────────────
>>>>>>> 656b814532bcbe80b788089bfc6156c35dd6d4e8
router.get('/', (req, res) => res.redirect('/login'));

<<<<<<< HEAD
router.get('/login', ensureGuest, (req, res) => {
    res.render('login', { error: req.flash('error') });
});

router.get('/signup', ensureGuest, (req, res) => {
    res.render('signup', { error: req.flash('error') });
});

=======
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

router.post('/signup', ensureGuest, async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
        req.flash('error', 'Email already registered');
        return res.redirect('/signup');
    }
    await User.create({ name, email, password });
    req.flash('error', 'Account created! Please log in.');
    res.redirect('/login');
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
>>>>>>> 656b814532bcbe80b788089bfc6156c35dd6d4e8
router.get('/dashboard', ensureAuth, (req, res) => {
    res.render('dashboard', { user: req.user });
});

<<<<<<< HEAD
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
=======
// ── Google OAuth ──────────────────────────────────────────────────────────────
>>>>>>> 656b814532bcbe80b788089bfc6156c35dd6d4e8
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

<<<<<<< HEAD
// ===============================
// TRANSACTIONS & ALERTS
// ===============================
router.get('/transactions', ensureAuth, async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ timestamp: -1 });
        res.render('transactions', { transactions });
=======
// ── Logout ────────────────────────────────────────────────────────────────────
router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

// ── Transactions ──────────────────────────────────────────────────────────────
router.get('/transactions', ensureAuth, async (req, res) => {
    try {
        const response = await axios.get(`${FLASK}/history`);
        console.log('COUNT:', response.data.length);
        res.render('transactions', { transactions: response.data });
>>>>>>> 656b814532bcbe80b788089bfc6156c35dd6d4e8
    } catch (err) {
        console.error('Transactions error:', err.message);
        res.render('transactions', { transactions: [] });
    }
});

// ── Alerts ────────────────────────────────────────────────────────────────────
router.get('/alerts', ensureAuth, async (req, res) => {
    try {
<<<<<<< HEAD
        const alerts = await Transaction.find({ isFraud: true }).sort({ timestamp: -1 });
        res.render('alerts', { alerts });
=======
        const response = await axios.get(`${FLASK}/history`);
        const anomalies = response.data.filter(tx => tx.is_fraud === 1);
        console.log('ALERTS COUNT:', anomalies.length);
        res.render('alerts', { alerts: anomalies });
>>>>>>> 656b814532bcbe80b788089bfc6156c35dd6d4e8
    } catch (err) {
        console.error('Alerts error:', err.message);
        res.render('alerts', { alerts: [] });
    }
});

<<<<<<< HEAD
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
=======
// ── Stats (no ensureAuth so dashboard.js fetch works) ────────────────────────
router.get('/api/stats', async (req, res) => {
    try {
        const response = await axios.get(`${FLASK}/api/stats`);
        res.json(response.data);
>>>>>>> 656b814532bcbe80b788089bfc6156c35dd6d4e8
    } catch (err) {
        console.error('Stats error:', err.message);
        res.status(500).json({ error: 'Flask offline' });
    }
});

<<<<<<< HEAD
=======
// ── New Pages ─────────────────────────────────────────────────────────────────
router.get('/analytics', ensureAuth, async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/analytics`);
        res.render('analytics', { data: r.data });
    } catch (err) { res.render('analytics', { data: {} }); }
});

router.get('/model-stats', ensureAuth, async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/model-stats`);
        res.render('model_stats', { stats: r.data });
    } catch (err) { res.render('model_stats', { stats: {} }); }
});

router.get('/shap', ensureAuth, (req, res) => res.render('shap'));
router.get('/cases', ensureAuth, async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/cases`);
        res.render('cases', { cases: r.data });
    } catch (err) { res.render('cases', { cases: [] }); }
});

// ── Upload ────────────────────────────────────────────────────────────────────
router.get('/upload', ensureAuth, (req, res) => {
    res.render('upload', { user: req.user });
});

router.post('/upload', ensureAuth, upload.single('csvFile'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file received.' });
    try {
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname || 'upload.csv',
            contentType: 'text/csv'
        });
        form.append('userId', req.user._id.toString());
        const response = await axios.post(`${FLASK}/api/upload-dataset`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 300000
        });
        res.json(response.data);
    } catch (err) {
        const msg = err.response?.data?.error || err.message || 'Upload failed';
        console.error('Upload error:', msg);
        res.status(500).json({ error: msg });
    }
});

>>>>>>> 656b814532bcbe80b788089bfc6156c35dd6d4e8
module.exports = router;