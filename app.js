const express = require('express');
const db = require('./models');

const app = express();

db.sequelize.sync();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res, next) => {
    res.send('Hello World 입니다');
})

app.post('/user', async (req, res) => {
    try {
        const newUser = await db.User.create({
            where: {
                email: req.body.email,
                password: req.body.password,
                nickname: req.body.nickname,
            }
        });
        // HTTP STATUS CODE
        res.status(201).json(newUser);
    } catch (err) {
        console.log(err);
        next(err);
    }
})

app.listen(3085, () => {
    console.log(`백엔드 서버 ${3085} 포트에서 적용중`);
})