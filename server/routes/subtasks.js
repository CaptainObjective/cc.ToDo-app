const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
    const {
        error
    } = validateSubtask(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        let userIdRequest = new sql.Request();
        let userId = await userIdRequest
            .query(`SELECT Categories.CategoryUserId AS uid FROM Categories
            JOIN Tasks ON Categories.CategoryId = Tasks.TaskCategoryId
            WHERE Tasks.TaskId = '${req.body.taskId}'`);
        if (!userId.recordset[0].uid || userId.recordset[0].uid != req.user.id) {
            return res.status(403).send(`Cannot create subtasks for another user`);
        }

        let request = new sql.Request();
        let id = await request
            .input('SubtaskTaskId', sql.Int, req.body.taskId)
            .input('SubtaskDesc', sql.NVarChar(1024), req.body.desc)
            .output('SubtaskId', sql.Int)
            .execute(`InsertSubtask`);
        id = id.output.SubtaskId;
        return res.send({ id: id });

    } catch (err) {
        next(err);
    }
})

router.put('/:id', auth, async (req, res, next) => {
    let changeOrder = !!req.query.order;

    if (!changeOrder) {
        const {
            error
        } = validateSubtaskPut(req.body);
        if (error) return res.status(400).send(error.details[0].message);
    }

    try {
        let userIdRequest = new sql.Request();
        const userId = await userIdRequest
            .query(`SELECT Categories.CategoryUserId AS uid FROM Categories
            JOIN Tasks ON Categories.CategoryId = Tasks.TaskCategoryId
            JOIN Subtasks ON Tasks.TaskId = Subtasks.SubtaskTaskId
            WHERE Subtasks.SubtaskId = '${req.params.id}'`);
        if (!userId.recordset[0] || userId.recordset[0].uid != req.user.id) {
            return res.status(403).send(`Invalid user or task non-existent.`);
        }

        if (changeOrder) {
            await request
                .input('SubtaskId', req.params.id)
                .input('SubtaskPrev', sql.Int, req.body.prev)
                .execute('UpdateSubtaskOrder')
            return res.send('Subtask order changed');
        }

        let request = new sql.Request();
        await request
            .input('taskId', sql.Int, req.body.taskId)
            .input('desc', sql.NVarChar(1024), req.body.desc)
            .input('completed', sql.Int, req.body.completed)
            .query(`UPDATE Subtasks
                    SET SubtaskTaskId = @taskId, SubtaskDesc = @desc, SubtaskCompleted = @completed
                    WHERE SubtaskId = '${req.params.id}'`);
        return res.send({id: req.params.id});

    } catch (err) {
        next(err);
    }
})

router.delete('/:id', auth, async (req, res, next) => {

    try {
        /*let userIdRequest = new sql.Request();
        const userId = await userIdRequest
            .query(`SELECT Categories.CategoryUserId AS uid FROM Categories
                    JOIN Tasks on Tasks.TaskCategoryId = Categories.CategoryId
                    WHERE Tasks.TaskId = '${req.params.id}'`);
        if (!userId.recordset[0] || userId.recordset[0].uid != req.user.id) {
            res.status(403).send(`Cannot delete another user's subtask`);
        }*/
        let request = new sql.Request();

        await request
            .input('SubtaskId', req.params.id)
            .execute('DeleteSubtask');
        return res.send({
            id: req.params.id
        });
    } catch (err) {
        next(err)
    }
})

function validateSubtask(subtask) {
    const schema = {
        taskId: Joi.number().integer().required(),
        desc: Joi.string().required(),
    };
    return Joi.validate(subtask, schema);
}

function validateSubtaskPut(subtask) {
    const schema = {
        taskId: Joi.number().integer().required(),
        desc: Joi.string().required(),
        completed: Joi.number().required(),
        prev: Joi.number().optional(),
    };
    return Joi.validate(subtask, schema);
}

module.exports = router;