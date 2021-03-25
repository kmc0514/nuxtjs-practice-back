const passport = require('passport');
const db = require('../models');
const local = require('./local');

module.exports = () => {
    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await db.User.findOne({ where: { id } });
            console.log(`de ${user}`);
            return done(null, user);  // req.user, req.isAuthenticated() = true
        } catch (err) {
            console.log(err);
            return done(err);
        }
    });
    local();
};