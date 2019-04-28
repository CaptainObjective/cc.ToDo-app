const express = require('express');
const sql = require('mssql');
const Joi = require('joi');
const auth = require('../middleware/auth');
const subtaskAuth = require('../middleware/subtaskAuth');

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
    const { error } = validateSubtask(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const userIdRequest = new sql.Request();
        let userId = await userIdRequest
            .query(`SELECT Categories.CategoryUserId AS uid FROM Categories
                    JOIN Tasks ON Categories.CategoryId = Tasks.TaskCategoryId
                    WHERE Tasks.TaskId = '${req.body.taskId}'`);
        if (!userId.recordset[0] || userId.recordset[0].uid != req.user.id) {
            return res.status(403).send('Access denied or task non-existent');
        }

        const request = new sql.Request();
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

router.put('/:id', auth, subtaskAuth, async (req, res, next) => {
    let changeOrder = !!req.query.order;

    const { error } = validateSubtaskPut(req.body, changeOrder);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const request = new sql.Request();
        if (changeOrder) {
            if (req.body.prev) {
                const validPrevRequest = new sql.Request();
                let validPrev = await validPrevRequest
                    .query(`SELECT 1 FROM Subtasks WHERE SubtaskId = ${req.body.prev} SubtaskTaskId = ${req.user.id}`)
                validPrev = validPrev.recordset[0];
                if (!validPrev) return res.status(403).send('Unallowable "prev" value');
            }

            await request
                .input('SubtaskId', req.params.id)
                .input('SubtaskPrev', sql.Int, req.body.prev)
                .execute('UpdateSubtaskOrder')
            return res.send('Subtask order changed');
        }
      
        await request
            .input('desc', sql.NVarChar(1024), req.body.desc)
            .input('completed', sql.Bit, Number(req.body.completed))
            .query(`UPDATE Subtasks
                    SET SubtaskDesc = @desc, SubtaskCompleted = @completed
                    WHERE SubtaskId = '${req.params.id}'`);
        return res.send('Subtask updated');

    } catch (err) {
        next(err);
    }
})

router.delete('/:id', auth, subtaskAuth, async (req, res, next) => {

    try {
        const request = new sql.Request();
        await request
            .input('SubtaskId', req.params.id)
            .execute('DeleteSubtask');
        return res.send('Subtask deleted');
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

function validateSubtaskPut(subtask, changeOrder) {
    let schema
    if (changeOrder) {
        schema = { prev: Joi.number().integer().allow(null).required() };      
    }
    else {
        schema = {
            desc: Joi.string().required(),
            completed: Joi.boolean().required(),
        };
    }
    return Joi.validate(subtask, schema);
}

module.exports = router;