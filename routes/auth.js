const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

// Middleware
function ensureGuest(req, res, next) {
    if (req.isAuthenticated()) return res.redirect('/dashboard');
    next();
}

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Pages
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

// Local Login
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })
);

// Local Signup
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

// 🔥 Google Login
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 🔥 Google Callback
router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })
);

// Logout
router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

module.exports = router;