const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    Amount: Number,
    is_fraud: Number,
    riskScore: Number,
    timestamp: { type: Date, default: Date.now }
}, { strict: false });
module.exports = mongoose.model('Transaction', transactionSchema, 'predictions');