const express = require('express');
const sql = require('mssql');
const Joi = require('joi');
const auth = require('../middleware/auth');
const categoryAuth = require('../middleware/categoryAuth');

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
    const { error } = validateAddCategory(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const request = new sql.Request();
        let id = await request
            .input('CategoryName', sql.NVarChar(50), req.body.name)
            .input('CategoryUserId', sql.Int, req.user.id)
            .output('CategoryId', sql.Int)
            .execute('InsertCategory')
        id = id.output.CategoryId
        return res.send({ id });

    } catch (err) {
        next(err);
    }
})

router.put('/:id', auth, categoryAuth, async (req, res, next) => {
    let changeOrder = false;
    if (req.query.order) changeOrder = true;

    const { error } = validateEditCategory(req.body, changeOrder);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const request = new sql.Request();
        if (changeOrder) {
            if (req.body.prev) {
                const validPrevRequest = new sql.Request();
                let validPrev = await validPrevRequest
                    .query(`SELECT 1 FROM Categories WHERE CategoryId = ${req.body.prev} AND CategoryUserId = ${req.user.id}`)
                validPrev = validPrev.recordset[0];
                if (!validPrev) return res.status(403).send('Unallowable "prev" value');
            }

            await request
                .input('CategoryId', req.params.id)
                .input('CategoryUserId', sql.Int, req.user.id)
                .input('CategoryPrev', sql.Int, req.body.prev)
                .execute('UpdateCategoryOrder')
            return res.send('Category order changed');       
        }

        await request
            .input('CategoryId', sql.Int, req.params.id)
            .input('CategoryUserId', sql.Int, req.user.id)
            .input('CategoryName', sql.NVarChar(50), req.body.name)
            .input('CategoryArchived', sql.Bit, Number(req.body.archived))
            .execute('UpdateCategory')
        return res.send('Category updated');        
    }
    catch (err) {
        next(err);
    }
})

router.delete('/:id', auth, categoryAuth, async(req, res, next) => {
    try {
        const request = new sql.Request();
        await request
            .input('CategoryId', sql.Int, req.params.id)
            .execute('DeleteCategory')
        return res.send('Category deleted');
    } catch (err) {
        next(err)
    }
})

function validateAddCategory(category) {
    const schema = {
        name: Joi.string().max(50).required(),
    };
    return Joi.validate(category, schema);
}

function validateEditCategory(category, changeOrder) {
    let schema
    if (changeOrder)
        schema = { prev: Joi.number().integer().allow(null).required() };
    else
        schema = { 
            name: Joi.string().max(50).required(),
            archived: Joi.boolean().required()
        };
    return Joi.validate(category, schema);
}

module.exports = router;