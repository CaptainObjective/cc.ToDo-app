const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const router = express.Router();

function validateUser(user) {
    const schema = {
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        passwd: Joi.string().min(6).max(50).required()
    };

    return Joi.validate(user, schema);
}

router.get('/:id', async (req, res, next) => {
    try {
        let request = new sql.Request();

        let user = await request
            .query(`select * from Users where UserId = ${req.params.id}`)
        if (!user.recordset[0]) return res.status(404).send('User does not exist.')

        return res.status(200).send(user.recordset[0]);
    } catch (err) {
        next(err)
    }
});

router.post('/', async (req, res, next) => {
    const { error } = validateUser(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    try {
        let request = new sql.Request();

        let user = await request
            .query(`select * from Users where UserEmail = '${req.body.email}'`)
        if (user.recordset[0]) return res.status(400).send('User already registered.');
         
        const salt = await bcrypt.genSalt(10);
        const passwd = await bcrypt.hash(req.body.passwd, salt);

        await request
            .input('name', sql.NVarChar(50), req.body.name)
            .input('email', sql.NVarChar(50), req.body.email)
            .input('passwd', sql.NVarChar(1024), passwd)
            .query('insert into Users (UserName, UserEmail, UserPasswd, UserEXP, UserLevel) values (@name, @email, @passwd, 0, 1)');
        return res.status(200).send('User was created.');
    } catch (err) {
        next(err)
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        let request = new sql.Request();

        let user = await request
            .query(`select * from Users where UserId = '${req.params.id}'`)
        if (!user.recordset[0]) return res.status(404).send('User does not exist.')

        let name, email, passwd; 
        name = (req.body.name) ? req.body.name : user.recordset[0].UserName;
        email = (req.body.email) ? req.body.email : user.recordset[0].UserEmail;
        passwd = (req.body.passwd) ? req.body.passwd : 'test123';

        const { error } = validateUser({ name, email, passwd });
        if (error) return res.status(400).send(error.details[0].message);
        
        if (req.body.passwd) {
            const salt = await bcrypt.genSalt(10);
            passwd = await bcrypt.hash(req.body.passwd, salt);
        }
        else { passwd = user.recordset[0].UserPasswd}

        await request
            .input('name', sql.NVarChar(50), name)
            .input('email', sql.NVarChar(50), email)
            .query(`update Users set UserName = @name, UserEmail = @email, UserPasswd = '${passwd}' WHERE UserId = ${req.params.id}`);
        return res.status(200).send('User was updated.');
    } catch (err) {
        next(err)
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        let request = new sql.Request();

        let user = await request
            .query(`select * from Users where UserEmail = '${req.body.email}'`)
        if (user.recordset[0]) return res.status(404).send('User does not exist.');

        await request
            .query(`delete from Users where UserId = ${req.params.id}`)
        return res.status(200).send('User was deleted.');
    } catch (err) {
        next(err)
    }
});

module.exports = router;