const sql = require('mssql');

 const config = {
     user: 'todoapp_admin',
     password: process.env.DB_PASSWD,
     server: 'coderscamp.database.windows.net',
     database: 'ToDoApp',
     options: {
         encrypt: true
     }
 };

const pool = new sql.ConnectionPool(config);

module.exports = pool;