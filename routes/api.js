const express = require('express');
const router = express.Router();
const axios = require('axios');

const FLASK = 'http://127.0.0.1:5001';

router.get('/transactions', async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/history`);
        res.json(r.data);
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

router.post('/shap', async (req, res) => {
    try {
        const r = await axios.post(`${FLASK}/api/shap`, req.body);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'SHAP service unavailable. Is Flask running?' });
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

module.exports = router;