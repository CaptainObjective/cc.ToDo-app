const express = require('express');
const sql = require('mssql');
const Joi = require('joi');
const auth = require('../middleware/auth');
const taskAuth = require('../middleware/taskAuth');

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
    const { error } = validateTask(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const userIdRequest = new sql.Request();
        let userId = await userIdRequest
                    .query(`SELECT CategoryUserId AS uid FROM Categories WHERE CategoryId = '${req.body.categoryId}'`);
        if (!userId.recordset[0] || userId.recordset[0].uid != req.user.id) {
            res.status(403).send('Access denied or category non-existent');
        }
        
        let deadline = req.body.deadline ? new Date(req.body.deadline) : null;
        const request = new sql.Request();
        let id = await request
            .input('TaskCategoryId', sql.Int, req.body.categoryId)
            .input('TaskDesc', sql.NVarChar(1024), req.body.desc)
            .input('TaskDeadline', sql.DateTime2, deadline)
            .input('TaskExp', sql.Int, req.body.exp)
            .output('TaskId', sql.Int)
            .execute(`InsertTask`);
        id = id.output.TaskId
        return res.send({id});

    } catch(err) {
        next(err);
    }
})

router.put('/:id', auth, taskAuth, async(req, res, next) => {
    let changeOrder = !!req.query.order;

    const { error } = validateTaskPut(req.body, changeOrder);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const transaction = new sql.Transaction()
        await new Promise(resolve => transaction.begin(resolve));
        const request = new sql.Request(transaction);

        if(changeOrder) {
            if (req.body.prev) {
                const validPrevRequest = new sql.Request(transaction);
                let validPrev = await validPrevRequest
                    .query(`SELECT 1 FROM Tasks WHERE TaskId = ${req.params.id} TaskUserId = '${req.user.id}'`)
                validPrev = validPrev.recordset[0];
                if (!validPrev) return res.status(401).send('Unallowable "prev" value');
            }

            let request = new sql.Request(transaction);
            await request
                .input('TaskId', req.params.id)
                .input('TaskPrev', sql.Int, req.body.prev)
                .execute('UpdateTaskOrder')
            return res.send('Task order changed');
        }

        const validCategoryRequest = new sql.Request(transaction);
        validCategory = await validCategoryRequest
            .query(`SELECT 1 FROM Categories WHERE CategoryId = ${req.body.categoryId} AND CategoryUserId = ${req.user.id}`)
        validCategory = validCategory.recordset[0];
        if (!validCategory) return res.status(403).send('Access denied or category non-existent');

        const taskRequest = new sql.Request();
        let task = await taskRequest
                    .query(`SELECT TaskCategoryId, TaskCompleted FROM Tasks
                            WHERE TaskId = ${req.params.id}`);
        task = task.recordset[0];

        if (task.TaskCategoryId !== Number(req.body.categoryId)) {
            console.log("updating category id");
            const updateTaskCategoryRequest = new sql.Request(transaction);
            await updateTaskCategoryRequest
                    .input('TaskId', sql.Int, req.params.id)
                    .input('TaskCategoryId', sql.Int, req.body.categoryId)
                    .execute('UpdateTaskCategory');
        }

        if (task.TaskCompleted !== Boolean(req.body.completed)) {
            const updateExp = new sql.Request(transaction);
            if (req.body.completed) {
                await updateExp
                        .query(`UPDATE Users
                                SET UserCurrentExp = UserCurrentExp + ${req.body.exp}
                                WHERE UserId = ${req.user.id}`);
            }
            else {
                await updateExp
                        .query(`UPDATE Users
                                SET UserCurrentExp = UserCurrentExp - ${req.body.exp}
                                WHERE UserId = ${req.user.id}`);
            }

            const expRequest = new sql.Request(transaction);
            exp = await expRequest.query(`SELECT UserCurrentExp FROM Users WHERE UserId = ${req.user.id}`);
            exp = exp.recordset[0].UserCurrentExp;

            const updateUserequest = new sql.Request(transaction);
            await updateUserequest
                    .query(`UPDATE Users
                            SET UserLevel = (SELECT MAX(LevelNum) FROM Levels WHERE LevelExp <= ${exp}),
                                UserRemainingExp = (SELECT MIN(LevelExp) FROM Levels WHERE LevelExp > ${exp})-${exp}
                            WHERE UserId = ${req.user.id}`);
        }

        let deadline = req.body.deadline ? new Date(req.body.deadline) : null;       
        await request
            .input('desc', sql.NVarChar(1024), req.body.desc)
            .input('deadline', sql.DateTime, deadline)
            .input('exp', sql.Int, req.body.exp)
            .input('completed', sql.Bit, Number(Boolean(req.body.completed)))
            .query(`UPDATE Tasks
                    SET TaskDesc = @desc, TaskDeadline = @deadline, TaskCompleted = @completed, TaskExp = @exp
                    WHERE TaskId = '${req.params.id}'`);     

        let userWithDetailsRequest = new sql.Request();
        let userWithDetails = await userWithDetailsRequest
            .query(`EXEC SelectUserWithDetails ${req.user.id}`);
        userWithDetails = userWithDetails.recordset[0][0];
        res.send({
            user: userWithDetails
        });

    } catch (err) {
        next(err);
    }
})

router.delete('/:id', auth, taskAuth, async(req, res, next) => {
    try {
        const request = new sql.Request();
        await request
            .input('TaskId', req.params.id)
            .execute('DeleteTask');
        return res.send('Task deleted');
    } catch (err) {
        next(err)
    }
})

function validateTask(task) {
    const schema = {
        categoryId: Joi.number().integer().required(),
        desc: Joi.string().required(),
        deadline: Joi.date().allow(null).optional(),
        exp: Joi.number().integer().min(0).required()
    };
    return Joi.validate(task, schema);
}

function validateTaskPut(task, changeOrder) {
    let schema
     if (changeOrder) {
        schema = { prev: Joi.number().integer().allow(null).required() };      
    }
    else {
        schema = {
            categoryId: Joi.number().integer().required(),
            desc: Joi.string().required(),
            deadline: Joi.date().allow(null).optional(),
            exp: Joi.number().integer().min(0).required(),
            completed: Joi.boolean().required(),
        };
    }
    return Joi.validate(task, schema);
}

module.exports = router;