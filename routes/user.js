const express = require('express');
const db = require('../models');
//const bcrypt = require('bcrypt');
const passport = require('passport');
const { isNotLoggedIn, isLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {
    const user = req.user;
    res.json(user);
});

router.post('/', isNotLoggedIn, async (req, res) => {
    try {
        //const hash = await bcrypt.hash(req.body.password, 10);
        const exUser = await db.User.findOne({
            where: {
                email: req.body.email
            }
        });

        if (exUser) { // 이메일 중복검사
            return res.status(403).json({
                errorCode: 10, // 프론트랑 백이랑 임의로 정하기
                message: '중복된 이메일  '
            })
        }

        const newUser = await db.User.create({
            email: req.body.email,
            password: req.body.password,
            nickname: req.body.nickname,
        });
        // HTTP STATUS CODE
        return res.status(201).json(newUser);
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.log(err);
            return next(err);
        }
        if (info) {
            return res.status(401).send(info.reason);
        }
        return req.login(user, async (err) => { //세션에 사용자정보 저장
            if (err) {
                console.log(err);
                return next(err);
            }
            return res.json(user);
        })
    })(req, res, next);
});

router.post('/logout', isLoggedIn, (req, res) => {
    console.log("로그아웃 시작");
    try {
        console.log("체크:", req.isAuthenticated());
        if (req.isAuthenticated()) {
            console.log("안함?");
            req.logout();
            req.session.destroy(); // 세션 삭제 (선택)
            return res.status(200).send('로그아웃 되었습니다.');
        } else {
            return res.status(400).send('인증 X');
        }
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;