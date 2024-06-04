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
const jwt = require('jsonwebtoken');


app.use(bodyParser.json());
app.use(cors());

// Whenever an login api is called,
// Creating a middleware to verify the token generated
// Middleware is smth which is called whenever u make a request
function authenicateToken(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    const { id } = req.body;
    //console.log('token', token);

    if(!token) {
        const error = new Error("Token not found");
        next(error);

        // return res.status(401).json({
        //     message : 'Auth Error'
        // });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(id && decoded.id !== id) {
            const error = new Error('Auth Error');
            next(error);

            // return res.status(401).json({
            //     message : 'Auth Error'
            // })
        }

        req.id = decoded;
        next();
    }
    catch(err) {
        // console.log(err);
        // return res.status(500).json({
        //     message : 'Invalid Token'
        // });

        //calling the above error handling using the middle ware
        next(err);
    }
}


app.get('/', (req, res) => {
    res.send('The API is working fine.');
});

//Create register API
app.post('/register', async (req, res) => {
    try{ 
        const {name, password, email, age, gender} = req.body;
        const existingUser = await User.findOne({email});

        if(existingUser) {
            //This error can also be implemented through error middleware
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
        next(err);
        //res.status(500).json({message: err.message})
    }
});

// Create Login API. Way to token generation
app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        //Checking if user exists
        const existingUser = await User.findOne({email});
        if(!existingUser) {
            return res.status(401).json({message : 'Invalid credentials'});
        }

        // If user exists, ask the bcrypt to compare the password
        // from the body and the password stored in the database
        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

        if(!isPasswordMatch) {
            return res.status(401).json({message : 'Invalid credentials'});
        }

        //If matched we need to create a token(with three unique values)
        // Token  - header.payload.signature
        // u need to send parametres - id from monogoDb, the secret key in .env file
        const accessToken = jwt.sign({id: existingUser._id}, process.env.JWT_SECRET_KEY, {
            expiresIn : 20
        });
        
        const refreshToken = jwt.sign({id: existingUser._id}, process.env.JWT_REFRESH_SECRET_KEY);
        //We want to store this in the frontend via backend 

        existingUser.refreshToken = refreshToken;
        //Save the refresh Token in the backend
        await existingUser.save();

        //Store the refreshToken in the frontend part of the cookies
        res.cookie('refreshToken', refreshToken, {httpOnly: true, path: '/refresh_token'})

        res.status(200).json({
            accessToken,
            refreshToken,
            message : 'user logged in successfully'
        });
    }
    catch(err) {
        next(err);
        //res.status(500).json({message : err.message});
    }
});

//Create API to get my profile
app.get('/getmyprofile', authenicateToken, async (req, res) => {
    const { id } = req.body;
    const user = await User.findById(id);
    //To hide the password
    user.password = undefined;
    res.status(200).json({user});
})

//ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    console.log('error middleware called ', err);
    res.status(500).json({ message: err.message });
})

app.listen(PORT, (req, res) => {
    console.log(`Server is running on PORT ${PORT}`);
});