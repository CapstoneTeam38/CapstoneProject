const express = require('express');
const router = express.Router();
<<<<<<< HEAD
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
=======
const axios = require('axios');

const FLASK = 'http://127.0.0.1:5001';

router.get('/transactions', async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/history`);
        res.json(r.data);
>>>>>>> 656b814532bcbe80b788089bfc6156c35dd6d4e8
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/stats`);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

router.get('/analytics', async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/analytics`);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

router.get('/model-stats', async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/model-stats`);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

router.get('/transactions-page', async (req, res) => {
    try {
        const { page, limit, filter } = req.query;
        const r = await axios.get(
            `${FLASK}/api/transactions-page?page=${page}&limit=${limit}&filter=${filter}`
        );
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

router.post('/shap-proxy', async (req, res) => {
    try {
        const r = await axios.post(`${FLASK}/api/shap`, req.body);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'SHAP service unavailable. Is Flask running?' });
    }
});

router.get('/cases', async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/cases`);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

router.post('/case-review/:id', async (req, res) => {
    try {
        const r = await axios.post(
            `${FLASK}/api/cases/${req.params.id}/review`, req.body
        );
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Review failed' });
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