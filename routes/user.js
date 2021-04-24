const express = require('express');
const db = require('../models');
//const bcrypt = require('bcrypt');
const passport = require('passport');
const { isNotLoggedIn, isLoggedIn } = require('./middlewares');
const user = require('../models/user');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {
    const user = req.user;
    return res.json(user);
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
        const fullUser = await db.User.findOne({
            where: { id: user.id },
            attributes: ['id', 'email', 'nickname'],
            include: [
                {
                    model: db.Post,
                    as: 'Posts',
                    attributes: ['id']
                },
                {
                    model: db.User,
                    as: 'Followings',
                    attributes: ['id']
                },
                {
                    model: db.User,
                    as: 'Followers',
                    attributes: ['id']
                }
            ]
        })
        // HTTP STATUS CODE
        return res.status(201).json(fullUser);
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
            const fullUser = await db.User.findOne({
                where: { id: user.id },
                attributes: ['id', 'email', 'nickname'],
                include: [
                    {
                        model: db.Post,
                        as: 'Posts',
                        attributes: ['id']
                    },
                    {
                        model: db.User,
                        as: 'Followings',
                        attributes: ['id']
                    },
                    {
                        model: db.User,
                        as: 'Followers',
                        attributes: ['id']
                    }
                ]
            })
            // HTTP STATUS CODE
            return res.status(201).json(fullUser);
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
});

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
    try {
        const me = await db.User.findOne({
            where: { id: req.user.id }
        })
        await me.addFollowing(req.params.id);
        res.send(req.params.id);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete('/:id/follow', isLoggedIn, async (req, res, next) => {
    try {
        const me = await db.User.findOne({
            where: { id: req.user.id }
        })
        await me.removeFollowing(req.params.id);
        res.send(req.params.id);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.patch('/nickname', isLoggedIn, async (req, res, next) => {
    try {
        await db.User.update(
            {
                nickname: req.body.nickname,
            },
            {
                where: { id: req.user.id }
            }
        );
        res.send(req.body.nickname);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/:id/followings', isLoggedIn, async (req, res, next) => {
    try {
        const user = await db.User.findOne({
            where: { id: req.user.id }
        });
        const followings = await user.getFollowings({
            attributes: ['id', 'nickname'],
            limit: parseInt(req.query.limit || 3, 10),
            offset: parseInt(req.query.offset || 0, 10)
        })
        res.json(followings);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/:id/followers', isLoggedIn, async (req, res, next) => {
    try {
        const user = await db.User.findOne({
            where: { id: req.user.id }
        });
        const followers = await user.getFollowers({
            attributes: ['id', 'nickname'],
            limit: parseInt(req.query.limit || 3, 10),
            offset: parseInt(req.query.offset || 0, 10)
        })
        res.json(followers);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete('/:id/follwer', isLoggedIn, async (req, res, next) => {
    try {
        const me = await db.User.findOne({
            where: { id: req.user.id }
        });
        await me.removeFollower(req.params.id);
        res.send(req.params.id);
    } catch (error) {
        console.error(error);
        next(error);
    }
})


module.exports = router;