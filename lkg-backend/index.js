require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const neo4j = require('./config/neo4j');

const query = require('./routes/query');

const app = express();
const port = process.env.PORT || 3000;
neo4j.connect();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/query', query);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server on port ${port}`);
});

