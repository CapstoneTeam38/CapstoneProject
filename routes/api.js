const express = require('express');
const router = express.Router();
const Transaction = require('../models/transactions');
const axios = require('axios');

// GET /api/transactions
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await Transaction
            .find()
            .sort({ timestamp: -1 })
            .limit(300);

        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/webhook
router.post('/webhook', async (req, res) => {
    try {
        const mlResponse = await axios.post(
            'http://127.0.0.1:5001/predict',
            req.body,
            { timeout: 5000 }
        );

        console.log("ML RESPONSE:", mlResponse.data);

        const newRecord = new Transaction({
            amount: req.body.amount,
            isFraud: mlResponse.data.isFraud,
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

module.exports = router;