//express server with morgan
const express = require('express');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

//middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//routes
app.get('/', (req, res) => {
    res.send('Hello World!');

});

app.listen(port, () => {
    console.log(`Server on port ${port}`);
});

