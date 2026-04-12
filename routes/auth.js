const express = require('express');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');
const User = require('../models/user');

const FLASK = 'http://127.0.0.1:5001';

function ensureGuest(req, res, next) {
    if (req.isAuthenticated()) return res.redirect('/dashboard');
    next();
}

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// ── Auth Pages ────────────────────────────────────────────────────────────────
router.get('/', (req, res) => res.redirect('/login'));
router.get('/login', ensureGuest, (req, res) => res.render('login', { error: req.flash('error') }));
router.get('/signup', ensureGuest, (req, res) => res.render('signup', { error: req.flash('error') }));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', ensureAuth, (req, res) => {
    res.render('dashboard', { user: req.user });
});

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

// ── Transactions (from Flask/Atlas) ──────────────────────────────────────────
router.get('/transactions', ensureAuth, async (req, res) => {
    try {
        const response = await axios.get(`${FLASK}/history`);
        console.log('COUNT:', response.data.length);
        res.render('transactions', { transactions: response.data });
    } catch (err) {
        console.error('Transactions error:', err.message);
        res.render('transactions', { transactions: [] });
    }
});

// ── Alerts (from Flask/Atlas) ─────────────────────────────────────────────────
router.get('/alerts', ensureAuth, async (req, res) => {
    try {
        const response = await axios.get(`${FLASK}/history`);
        const anomalies = response.data.filter(tx => tx.is_fraud === 1);
        console.log('ALERTS COUNT:', anomalies.length);
        res.render('alerts', { alerts: anomalies });
    } catch (err) {
        console.error('Alerts error:', err.message);
        res.render('alerts', { alerts: [] });
    }
});

// ── Stats (from Flask/Atlas) ──────────────────────────────────────────────────
router.get('/api/stats', ensureAuth, async (req, res) => {
    try {
        const response = await axios.get(`${FLASK}/api/stats`);
        res.json(response.data);
    } catch (err) {
        console.error('Stats error:', err.message);
        res.status(500).json({ error: 'Flask offline' });
    }
});

module.exports = router;