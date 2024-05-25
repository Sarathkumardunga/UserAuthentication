const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 8000;
require('dotenv').config();

const app = express();
//Create an instance of a database
require('./db');
const User = require('./MODELS/UserSchema');
const bcrypt = require('bcryptjs');


app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('The API is working fine.');
});

//Create register API
app.post('/register', async (req, res) => {
    try{ 
        const {name, password, email, age, gender} = req.body;
        const existingUser = await User.findOne({email});

        if(existingUser) {
            return res.status(409).json({message : 'Email already exists'});
        }

        // Salt says how many times u wanna mix the items.
        const salt = await bcrypt.genSalt(10);

        //Now mix with the password
        const hashedPassword = await bcrypt.hash(password, salt);
        //console.log('salt', salt);
        //console.log('hashedPassword', hashedPassword);

        const newUser = new User({
            name,
            password : hashedPassword,
            email,
            age,
            gender
        });

        await newUser.save();
        res.status(201).json({
            message : 'User registered successfully'
        });
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
});

app.listen(PORT, (req, res) => {
    console.log(`Server is running on PORT ${PORT}`);
});