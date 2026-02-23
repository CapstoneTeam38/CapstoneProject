const express = require('express');
const router = express.Router();
const Transaction = require('../models/transactions');

// GET transactions
router.get('/api/transactions', async (req, res) => {
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

module.exports = router;