const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 8000;
require('dotenv').config();

const app = express();
//Create an instance of a database
require('./db');

const User = require('./MODELS/UserSchema');

app.get('/', (req, res) => {
    res.send('The API is working fine.');
});

//Create register API
app.post('/register', (req, res) => {
    try{
        const {name, password, email, age, gender} = req.body;
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
});

app.listen(PORT, (req, res) => {
    console.log(`Server is running on PORT ${PORT}`);
});