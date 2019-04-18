const express = require('express')
const users = require('./routes/users');

const app = express()
const port = process.env.PORT || 3000

// app.get('/', (req, res) => res.send('Hello World!'))

app.use(express.static('public'));

app.use(express.json());
app.use('/users', users);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))