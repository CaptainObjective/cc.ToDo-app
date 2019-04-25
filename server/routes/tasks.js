const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
    const { error } = validateTask(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        let userIdRequest = new sql.Request();
        let userId = await userIdRequest
                    .query(`SELECT CategoryUserId AS uid FROM Categories WHERE CategoryId = '${req.body.categoryId}'`);
        if (!userId.recordset[0] || userId.recordset[0].uid != req.user.id) {
            res.status(403).send(`Cannot create tasks for another user`);
        }
                        
        let request = new sql.Request();
        await request
            .input('categoryId', sql.Int, req.body.categoryId)
            .input('desc', sql.NVarChar(1024), req.body.desc)
            .input('deadline', sql.DateTime, new Date(req.body.deadline))
            .input('exp', sql.Int, req.body.exp)
            .input('prev', sql.Int, req.body.prev || null)
            .input('next', sql.Int, req.body.next || null)
            .query(`INSERT INTO Tasks VALUES(@categoryId, @desc, @deadline, 0, @exp, @prev, @next)`)
        return res.send('Task created');

    } catch(err) {
        next(err);
    }
})

router.put('/:id', auth, async (req, res, next) => {
    const { error } = validateTaskPut(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        let userIdRequest = new sql.Request();
        const userId = await userIdRequest
            .query(`SELECT Categories.CategoryUserId AS uid FROM Categories
                            JOIN Tasks on Tasks.TaskCategoryId = Categories.CategoryId
                            WHERE Tasks.TaskId = '${req.params.id}'`);
        if (!userId.recordset[0] || userId.recordset[0].uid != req.user.id) {
            return res.status(403).send(`Invalid user or task non-existent.`);
        }

        let isCompletedRequest = new sql.Request();
        const isCompleted = await isCompletedRequest
                                .query(`SELECT TaskCompleted FROM Tasks
                                        WHERE TaskId = ${req.params.id}`);

        if(!isCompleted.recordset[0].TaskCompleted && req.body.completed) {
            let updateExp = new sql.Request();
            await updateExp.query(`UPDATE Users
                                    SET UserExp = UserExp + ${req.body.exp}
                                    WHERE UserId = ${req.user.id}`);
        }

        let request = new sql.Request();
        await request
            .input('categoryId', sql.Int, req.body.categoryId)
            .input('desc', sql.NVarChar(1024), req.body.desc)
            .input('deadline', sql.DateTime, new Date(req.body.deadline))
            .input('exp', sql.Int, req.body.exp)
            .input('completed', sql.Bit, req.body.completed)
            .input('prev', sql.Int, req.body.prev || null)
            .input('next', sql.Int, req.body.next || null)
            .query(`UPDATE Tasks
                    SET TaskCategoryId = @categoryId, TaskDesc = @desc, TaskDeadline = @deadline, TaskCompleted = @completed, TaskExp = @exp, TaskPrev = @prev, TaskNext = @next
                    WHERE TaskId = '${req.params.id}'`);

        
        let expRequest = new sql.Request();
        let exp = await expRequest.query(`SELECT UserExp FROM Users
                                                WHERE UserId = ${req.user.id}`);
        exp = exp.recordset[0].UserExp;
        let updateLevel = new sql.Request();
        await updateLevel.query(`UPDATE Users
                                    SET UserLevel = (SELECT MAX(LevelNum) FROM Levels WHERE LevelExp <= ${exp})
                                    WHERE UserId = ${req.user.id}`);

        let levelRequest = new sql.Request();
        let level = await levelRequest.query(`SELECT UserLevel FROM Users
                                            WHERE UserId = ${req.user.id}`);
        level = level.recordset[0].UserLevel;
        return res.send({level: level, currentExp: exp});

    } catch (err) {
        next(err);
    }
})

router.delete('/:id', auth, async (req, res, next) => {

    try {
        let userIdRequest = new sql.Request();
        const userId = await userIdRequest
                            .query(`SELECT Categories.CategoryUserId AS uid FROM Categories
                            JOIN Tasks on Tasks.TaskCategoryId = Categories.CategoryId
                            WHERE Tasks.TaskId = '${req.params.id}'`);
        if(!userId.recordset[0].uid || userId.recordset[0].uid != req.user.id) {
            res.status(403).send(`Cannot delete another user's tasks`);
        }
        let request = new sql.Request();

        await request
            .query(`DELETE FROM Tasks WHERE TaskId = '${req.params.id}'`)
        return res.send('Task deleted.');
    } catch (err) {
        next(err)
    }
})

function validateTask(task) {
    const schema = {
        categoryId: Joi.number().integer().required(),
        desc: Joi.string().required(),
        deadline: Joi.date(),
        exp: Joi.number().integer().min(0).required(),
        prev: Joi.number().optional(),
        next: Joi.number().optional(),
    };
    return Joi.validate(task, schema);
}

function validateTaskPut(task) {
    const schema = {
        categoryId: Joi.number().integer().required(),
        desc: Joi.string().required(),
        deadline: Joi.date(),
        exp: Joi.number().integer().min(0).required(),
        completed: Joi.number().integer().required(),
        prev: Joi.number().optional(),
        next: Joi.number().optional(),
    };
    return Joi.validate(task, schema);
}

module.exports = router;