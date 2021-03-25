const passport = require('passport');
const db = require('../models');
const { Strategy: LocalStragtey } = require('passport-local');

module.exports = () => {
    passport.use(new LocalStragtey({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const exUser = await db.User.findOne({ where: { email } });
            if(!exUser) {
                return done(null, false, {
                    reason: '존재하지 않는 사용자입니다.'
                });
            }
            const result = await password == exUser.password;// bcrypt.compare(password, exUser.password) 암호화된 비밀번호 비교하기
            if(result) {
                return done(null, exUser);
            } else {
                return done(null, false, {
                    reason: '비밀번호가 틀렸습니다.'
                });
            }
        } catch (err) {
            console.log(err);
            return done(err);
        }
    }));
};