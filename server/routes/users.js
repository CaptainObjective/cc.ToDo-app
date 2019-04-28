const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res, next) => {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const userRequest = new sql.Request();
        let user = await userRequest
            .query(`SELECT 1 FROM Users WHERE UserEmail = '${req.body.email}'`);
        user = user.recordset[0];
        if (user) return res.status(400).send('User already registered');

        const salt = await bcrypt.genSalt(10);
        const passwd = await bcrypt.hash(req.body.passwd, salt);

        const remainingExpRequest = new sql.Request();
        let remainingExp = await remainingExpRequest
                                .query('SELECT MIN(LevelExp) AS LevelExp FROM Levels WHERE LevelNum > 1')
        remainingExp = remainingExp.recordset[0].LevelExp || null;

        const request = new sql.Request();
        await request
            .input('name', sql.NVarChar(50), req.body.name)
            .input('email', sql.NVarChar(50), req.body.email)
            .input('passwd', sql.NVarChar(1024), passwd)
            .query(`INSERT INTO Users (UserName, UserEmail, UserPasswd, UserLevel, UserCurrentExp, UserRemainingExp) VALUES (@name, @email, @passwd, 1, 0, ${remainingExp})`);
        return res.send('User was created');
    } catch (err) {
        next(err)
    }
});

router.get('/me', auth, async (req, res, next) => {
    try {
        const userRequest = new sql.Request();
        let user = await userRequest
            .query(`SELECT 1 FROM Users WHERE UserId = '${req.user.id}'`)
        user = user.recordset[0];
        if (!user) return res.status(404).send('User does not exist');

        const request = new sql.Request();
        userWithDetails = await request
            .query(`EXEC SelectUserWithDetails ${req.user.id}`);
        userWithDetails = userWithDetails.recordset[0][0];
        res.send({ userWithDetails });
    } catch (err) { 
        next(err) 
    }
})

router.put('/me', auth, async (req, res, next) => {
    const { error } = validateEditUser(req.body);
        if (error) return res.status(400).send(error.details[0].message);

    try {
        const userRequest = new sql.Request();
        let user = await userRequest
            .query(`SELECT UserPasswd FROM Users WHERE UserId = '${req.user.id}'`)
        user = user.recordset[0];
        if (!user) return res.status(404).send('User does not exist');

        let passwd; 
        if (req.body.passwd) {
            const salt = await bcrypt.genSalt(10);
            passwd = await bcrypt.hash(req.body.passwd, salt);
        }
        else { passwd = user.UserPasswd}
        
        const request = new sql.Request();
        await request
            .input('name', sql.NVarChar(50), req.body.name)
            .input('email', sql.NVarChar(50), req.body.email)
            .query(`UPDATE Users SET UserName = @name, UserEmail = @email, UserPasswd = '${passwd}' WHERE UserId = ${req.user.id}`);
        return res.send('User was updated');
    } catch (err) {
        next(err)
    }
});

router.delete('/me', auth, async (req, res, next) => {
    try {
        const request = new sql.Request();
        await request
            .query(`DELETE FROM Users WHERE UserId = ${req.user.id}`)
        return res.send('User was deleted');
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
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(50).required().email(),
        passwd: Joi.string().min(8).max(50).optional()
    };
    return Joi.validate(user, schema);
}

module.exports = router;