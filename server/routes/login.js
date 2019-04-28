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
        const userRequest = new sql.Request();
        let user = await userRequest
            .query(`SELECT UserId, UserPasswd FROM Users WHERE UserEmail = '${req.body.email}'`);
        user = user.recordset[0];
        if (!user) return res.status(404).send('Invalid email or password.');

        const validPassword = await bcrypt.compare(req.body.passwd, user.UserPasswd);
        if (!validPassword) return res.status(400).send('Invalid email or password.');

        const token = jwt.sign({ id: user.UserId }, process.env.JWT_PRIVATE_KEY);
        
        const request = new sql.Request();
        let userWithDetails = await request
            .query(`EXEC SelectUserWithDetails ${user.UserId}`);
        userWithDetails = userWithDetails.recordset[0][0];
        res.send({ token, user: userWithDetails });
    } catch (err) { 
        next(err) 
    }
});

function validateLogin(req) {
    const schema = {
        email: Joi.string().required().email(),
        passwd: Joi.string().required()
    };
    return Joi.validate(req, schema);
}

module.exports = router; 
