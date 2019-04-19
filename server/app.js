const express = require('express')
const sql = require('mssql');
const config = require('./config');
const users = require('./routes/users');

const app = express()
const port = process.env.PORT || 3000

sql.connect(config)
    .then(() => console.log('Connected to database...'))
    .catch(err => console.log('Could not connect to database...'));

// app.get('/', (req, res) => res.send('Hello World!'))

app.use(express.static('public'));

app.use(express.json());
app.use('/users', users);
app.use((err, req, res, next) => {
    console.log(err);
    return res.status(500).send('Something went wrong.');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))