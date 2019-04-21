const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res, next) => {
    const {
        error
    } = validateRegister(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        let request = new sql.Request();

        let user = await request
            .query(`select * from Users where UserEmail = '${req.body.email}'`);
        user = user.recordset[0];
        if (user) return res.status(400).send('User already registered.');

        const salt = await bcrypt.genSalt(10);
        const passwd = await bcrypt.hash(req.body.passwd, salt);

        await request
            .input('name', sql.NVarChar(50), req.body.name)
            .input('email', sql.NVarChar(50), req.body.email)
            .input('passwd', sql.NVarChar(1024), passwd)
            .query('insert into Users (UserName, UserEmail, UserPasswd, UserExp) values (@name, @email, @passwd, 0)');
        return res.send('User was created.');
    } catch (err) {
        next(err)
    }
});

router.get('/me', auth, async (req, res, next) => {
    try {
        let request = new sql.Request();

        let user = await request
            .query(`select UserName, UserEmail, UserExp from Users where UserId = ${req.user.id}`);
        user = user.recordset[0];

        return res.send(user);
    } catch (err) {
        next(err)
    }
});

router.put('/me', auth, async (req, res, next) => {
    const { error } = validateEditUser(req.body);
        if (error) return res.status(400).send(error.details[0].message);

    try {
        let request = new sql.Request();

        let user = await request
            .query(`select * from Users where UserId = '${req.user.id}'`)
        user = user.recordset[0];

        let name, email, exp, passwd; 
        name = (req.body.name) ? req.body.name : user.UserName;
        email = (req.body.email) ? req.body.email : user.UserEmail;
        exp = (req.body.exp) ? req.body.exp : user.UserExp;
        
        if (req.body.passwd) {
            const salt = await bcrypt.genSalt(10);
            passwd = await bcrypt.hash(req.body.passwd, salt);
        }
        else { passwd = user.UserPasswd}

        await request
            .input('name', sql.NVarChar(50), name)
            .input('email', sql.NVarChar(50), email)
            .input('exp', sql.Int, exp)
            .query(`update Users set UserName = @name, UserEmail = @email, UserPasswd = '${passwd}', UserExp = @exp WHERE UserId = ${req.user.id}`);
        return res.send('User was updated.');
    } catch (err) {
        next(err)
    }
});

router.delete('/me', auth, async (req, res, next) => {
    try {
        let request = new sql.Request();

        await request
            .query(`delete from Users where UserId = ${req.user.id}`)
        return res.send('User was deleted.');
    } catch (err) {
        next(err)
    }
});

function validateRegister(user) {
    const schema = {
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(50).required().email(),
        passwd: Joi.string().min(8).max(50).required()
    };
    return Joi.validate(user, schema);
}

function validateEditUser(user) {
    const schema = {
        name: Joi.string().min(3).max(50),
        email: Joi.string().min(5).max(50).email(),
        passwd: Joi.string().min(8).max(50),
        exp: Joi.number()
    };
    return Joi.validate(user, schema);
}

module.exports = router;