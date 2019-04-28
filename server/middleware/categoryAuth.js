const sql = require('mssql');

module.exports = async function categoryAuth(req, res, next) {
    try {
        const validCategoryRequest = new sql.Request();
        validCategory = await validCategoryRequest
            .query(`SELECT 1 FROM Categories WHERE CategoryId = ${req.params.id} AND CategoryUserId = ${req.user.id}`)
        validCategory = validCategory.recordset[0];
        if (!validCategory) return res.status(403).send('Access denied or category non-existent');
        next();
    } catch (ex) {
        next(err);
    }
}