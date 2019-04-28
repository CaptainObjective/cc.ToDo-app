const sql = require('mssql');

module.exports = async function subtaskAuth(req, res, next) {
    try {
        const userIdRequest = new sql.Request();
        let userId = await userIdRequest
            .query(`SELECT Categories.CategoryUserId AS uid FROM Categories
                    JOIN Tasks ON Categories.CategoryId = Tasks.TaskCategoryId
                    JOIN Subtasks ON Tasks.TaskId = Subtasks.SubtaskTaskId
                    WHERE Subtasks.SubtaskId = '${req.params.id}'`);
        if (!userId.recordset[0] || userId.recordset[0].uid != req.user.id) {
            return res.status(403).send('Access denied or subtask non-existent');
        }
        next();
    } catch (ex) {
        next(err);
    }
}

