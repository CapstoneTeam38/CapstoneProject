const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const cors = require('cors');
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
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
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
app.use('/', require('./routes/auth'));       // handles /login, /dashboard etc
app.use('/api', require('./routes/api'));     // handles /api/transactions, /api/webhook

// =============================
// 5️⃣ START SERVER
// =============================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});