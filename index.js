const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 8000;
require('dotenv').config();

//Create an instance of a database
require('./db');
const app = express();

app.get('/', (req, res) => {
    res.send('The API is working fine.');
});

app.listen(PORT, (req, res) => {
    console.log(`Server is running on PORT ${PORT}`);
})