const sql = require('mssql');

module.exports = async function taskAuth(req, res, next) {
    try {
        const userIdRequest = new sql.Request();
        const userId = await userIdRequest
            .query(`SELECT Categories.CategoryUserId AS uid FROM Categories
                            JOIN Tasks on Tasks.TaskCategoryId = Categories.CategoryId
                            WHERE Tasks.TaskId = '${req.params.id}'`);
        if (!userId.recordset[0] || userId.recordset[0].uid != req.user.id) {
            return res.status(403).send('Access denied or task non-existent');
        }
        next();
    } catch (ex) {
        next(err);
    }
}