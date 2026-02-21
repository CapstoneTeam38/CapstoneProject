require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("Mongo Error:", err));

const express = require('express');
const axios = require('axios');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// Passport config
require('./config/passport')(passport);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

//  Mount authentication routes
app.use('/', authRoutes);

// Mount API bridge
app.use('/api', apiRoutes);


// ================= ML ROUTES =================

// Alerts Page (Protected inside auth.js via ensureAuth on dashboard)
app.get('/alerts', async (req, res) => {
    try {
        const response = await axios.get('http://127.0.0.1:5001/history');
        const anomalies = response.data.filter(tx => tx.is_fraud === 1);
        res.render('alerts', { alerts: anomalies });
    } catch (err) {
        console.error("Failed to fetch alerts:", err.message);
        res.render('alerts', { alerts: [] });
    }
});

// Transactions Page
app.get('/transactions', async (req, res) => {
    try {
        const response = await axios.get('http://127.0.0.1:5001/history');
        res.render('transactions', { transactions: response.data });
    } catch (err) {
        res.render('transactions', { transactions: [] });
    }
});


//  DO NOT define '/' or '/dashboard' here.
// They are handled in auth.js


app.listen(5000, () => console.log("Server running on http://localhost:5000"));