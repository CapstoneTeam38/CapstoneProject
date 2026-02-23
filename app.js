const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express(); // 1. INITIALIZE APP FIRST

// 2. DATABASE CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/fraud_detection')
    .then(() => console.log('MongoDB Connected to fraud_detection'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// 3. MIDDLEWARE & SETTINGS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// 4. SESSION & AUTH CONFIGURATION
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false
}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// 5. API ROUTES (For your dashboard.js script)
app.get('/api/stats', async (req, res) => {
    try {
        const Transaction = mongoose.model('Transaction');

        const totalTransactions = await Transaction.countDocuments();
        const fraudsDetected = await Transaction.countDocuments({ isFraud: true });

        //  THIS WAS MISSING
        const recentData = await Transaction.find()
            .sort({ timestamp: -1 })
            .limit(10);

        const stats = await Transaction.aggregate([
            { $group: { _id: null, avgRisk: { $avg: "$riskScore" } } }
        ]);

        res.json({
            totalTransactions,
            fraudsDetected,
            globalRiskScore: stats.length > 0 ? Math.round(stats[0].avgRisk) : 0,
            chartLabels: recentData.map(t => new Date(t.timestamp).toLocaleTimeString()).reverse(),
            chartValues: recentData.map(t => t.Amount).reverse()
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TEMP TEST ROUTE
app.get("/", (req, res) => {
    res.send("Server working fine 🚀");
});


// 6. VIEW ROUTES (For navigating between pages)
app.use('/', require('./routes/auth'));
app.use(require('./routes/api'));
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

// Alerts View (Anomaly Detection Output)
app.get('/alerts', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const col = db.collection('predictions');
        // Fetch only flagged anomalies
        const alerts = await col.find({ isFraud: true }).sort({ _id: -1 }).limit(20).toArray();
        res.render('alerts', { alerts });
    } catch (err) {
        res.status(500).send("Error loading alerts: " + err.message);
    }
});

// Transactions View (Predictive Modeling History)
app.get('/transactions', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const col = db.collection('predictions');
        // Fetch recent modeling history
        const transactions = await col.find().sort({ _id: -1 }).limit(50).toArray();
        res.render('transactions', { transactions });
    } catch (err) {
        res.status(500).send("Error loading transactions: " + err.message);
    }
});

// In your main app.js or a specific route file
const axios = require('axios');
const Transaction = require('./models/transactions');

app.post('/api/webhook', async (req, res) => {
    try {
        // 1. Forward data to Flask (model.py) for scoring
        const mlResponse = await axios.post('http://127.0.0.1:5001/predict', req.body);

        // 2. Combine raw data with ML results
        const newRecord = new Transaction({
            Amount: req.body.amount,
            isFraud: mlResponse.data.is_fraud,
            riskScore: mlResponse.data.riskScore,
            timestamp: new Date()
        });

        // 3. Save to MongoDB to populate the tabs
        await newRecord.save();
        res.status(200).json({ status: "Processed", isFraud: newRecord.isFraud });
    } catch (err) {
        console.error("FULL ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// 7. START SERVER
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

