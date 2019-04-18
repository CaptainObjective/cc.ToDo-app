const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const pool = require('../connection');

const router = express.Router();

function validateUser(user) {
    const schema = {
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        passwd: Joi.string().min(6).max(50).required()
    };

    return Joi.validate(user, schema);
}

router.post('/add', async (req, res) => {
    const { error } = validateUser(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const conn = await pool.connect();

        let user = await conn.request()
            .query(`select * from Users where UserEmail = '${req.body.email}'`)
        if (user.recordset.length > 0) {
            pool.close();
            res.status(400).send('User already registered.');
        }
        
        const salt = await bcrypt.genSalt(10);
        const passwd = await bcrypt.hash(req.body.passwd, salt);

        await conn.request()
            .input('name', sql.NVarChar(50), req.body.name)
            .input('email', sql.NVarChar(50), req.body.email)
            .input('passwd', sql.NVarChar(1024), passwd)
            .query('insert into Users (UserName, UserEmail, UserPasswd, UserEXP, UserLevel) values (@name, @email, @passwd, 0, 1)');
        
        pool.close();
        res.status(200).send('User was created.');       
    } catch (err) {
        pool.close();
        res.status(400).send(err.originalError);
    }
});

module.exports = router;