const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/', async (req, res, next) => {
    const { error } = validateLogin(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    try {
        let request = new sql.Request();

        let user = await request
            .query(`select UserId, UserPasswd from Users where UserEmail = '${req.body.email}'`);
        user = user.recordset[0];
        console.log(user);
        if (!user) return res.status(404).send('Invalid email or password.');

        const validPassword = await bcrypt.compare(req.body.passwd, user.UserPasswd);
        if (!validPassword) return res.status(400).send('Invalid email or password.');

        const token = jwt.sign({ id: user.UserId }, process.env.JWT_PRIVATE_KEY);
        res.send(token);
    } catch (err) { 
        next(err) 
    }
});

function validateLogin(req) {
    const schema = {
        email: Joi.string().min(5).max(50).required().email(),
        passwd: Joi.string().min(8).max(50).required()
    };
    return Joi.validate(req, schema);
}

module.exports = router; 
