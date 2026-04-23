const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = function (passport) {
    // ===============================
    // LOCAL STRATEGY
    // ===============================
    passport.use(
        new LocalStrategy(
            { usernameField: 'email' },
            async (email, password, done) => {
                try {
                    const user = await User.findOne({ email: email.toLowerCase() });
                    if (!user) {
                        return done(null, false, { message: 'No user found with that email' });
                    }
                    if (!user.password) {
                        return done(null, false, { message: 'Please login with Google' });
                    }
                    const match = await bcrypt.compare(password, user.password);
                    if (!match) {
                        return done(null, false, { message: 'Incorrect password' });
                    }
                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    // ===============================
    // GOOGLE STRATEGY
    // ===============================
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:5000/auth/google/callback"
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ googleId: profile.id });
                    if (!user) {
                        user = await User.create({
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            googleId: profile.id
                        });
                    }
                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );

    // ===============================
    // SESSION HANDLING
    // ===============================
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};