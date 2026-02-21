const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/stats', async (req, res) => {
    try {
        const resp = await axios.get('http://127.0.0.1:5001/api/stats');
        res.json(resp.data);
    } catch (e) { res.status(500).json({ error: "AI Engine Offline" }); }
});

module.exports = router;