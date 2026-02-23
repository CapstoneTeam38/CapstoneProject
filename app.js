const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// =============================
// 1️⃣ DATABASE CONNECTION
// =============================
mongoose.connect('mongodb://127.0.0.1:27017/fraud_detection')
    .then(() => console.log('MongoDB Connected to fraud_detection'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// =============================
// 2️⃣ MIDDLEWARE & SETTINGS
// =============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =============================
// 3️⃣ SESSION & AUTH CONFIG
// =============================
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false
}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// =============================
// 4️⃣ ROUTES
// =============================

// Auth + Views (login, signup, dashboard, alerts, transactions)
app.use('/', require('./routes/auth'));

// API routes (if you have separate api.js)
app.use(require('./routes/api'));

// =============================
// 5️⃣ WEBHOOK (ML Integration)
// =============================
const Transaction = require('./models/transactions');

app.post('/api/webhook', async (req, res) => {
    try {
        // Send transaction data to Flask ML server
        const mlResponse = await axios.post(
            'http://127.0.0.1:5001/predict',
            req.body,
            { timeout: 5000 }
        );

        // Save result to MongoDB
        const newRecord = new Transaction({
            Amount: req.body.amount,
            isFraud: mlResponse.data.is_fraud,
            riskScore: mlResponse.data.riskScore,
            timestamp: new Date()
        });

        await newRecord.save();

        res.status(200).json({
            status: "Processed",
            isFraud: newRecord.isFraud
        });

    } catch (err) {
        console.error("ML SERVICE ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// =============================
// 6️⃣ START SERVER
// =============================
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});