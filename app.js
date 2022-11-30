console.clear();
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
var SQLiteStore = require('connect-sqlite3')(sessions);
const mongoose = require('mongoose');  
const cors = require('cors');
require('dotenv/config'); //Specify all credentials in .env

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(cors());

const port = process.env.PORT || 3000;


// creating 24 hours from milliseconds
const thirtyDays = 1000 * 60 * 60 * 24 * 30;


/*
Functionality: This method sets up the user session in the browser
Params:
    - secret:
    - saveUninitialized:
    - cookie: 
    - resave:
    - store:
Returns:
*/
app.use(sessions({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: thirtyDays },
    resave: false,
    store: new SQLiteStore({ db: 'sessions.db', dir: '.' })
}));


// cookie parser middleware
app.use(cookieParser());


// initialize the Fitbit API client
const FitbitApiClient = require('fitbit-node');
const client = new FitbitApiClient({
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	apiVersion: '1.2' // 1.2 is the default
});

const authRoute = require('./api/authenticate');
app.use('/authenticate', authRoute);

//Default action is to authenticate and send to homepage
app.get('/', (req, res) => {
	if(req.session.token)
        res.redirect('/home');
    else
        res.redirect('/authenticate');
});


//Page to display once user has logged in -> aka Homepage
app.get('/home', (req, res) => {
    req.session.save();
    console.log(req.session);
    console.log("Login successful!");
    res.send(`Welcome User<br><a href=\'/profile\'>click to view profile</a>
    <br><a href=\'/steps\'>click to view steps data</a>
    <br><br><a href=\'/authenticate/logout\'>Logout</a>`);
});


//Page to display once user has logged out
app.get('/loggedout', (req, res) => {
    console.log(req.session);
    console.log("Logout successful!");
    res.send("Logout successful!");
});


//Get the user profile
app.get('/profile', (req, res) => {
    if(!req.session.token)
        return res.redirect('/authenticate');

    console.log('Fetching profile');
    // use the access token to fetch the user's profile information
    client.get("/profile.json", req.session.token.access_token).then(results => {
        res.send(results[0]);
    }).catch(err => {
        res.status(err.status).send(err);
    });
});


//Get the user steps data
app.get('/steps', (req, res) => {
    if(!req.session.token)
        return res.redirect('/authenticate');

    console.log('Fetching steps');
    // use the access token to fetch the user's steps data
    client.get("/activities/steps/date/today/30d.json", req.session.token.access_token).then(results => {
        let steps_json = results[0];
        let total_steps = 0;
        steps_json['activities-steps'].forEach(function(obj) { 
            total_steps+=parseInt(obj['value']);
        });
        console.log("\n\nTotal Steps in last 30 days = " + total_steps);

        res.send(JSON.stringify(results[0]) + "<br><br>Total Steps in last 30 days = " + total_steps);
    }).catch(err => {
        res.status(err.status).send(err);
    });
});


//Get the user distance data
app.get('/distance', (req, res) => {
    if(!req.session.token)
        return res.redirect('/authenticate');

    console.log('Fetching steps');
    // use the access token to fetch the user's steps data
    client.get("/activities/distance/date/today/30d.json", req.session.token.access_token).then(results => {
        res.send(JSON.stringify(results[0]));
    }).catch(err => {
        res.status(err.status).send(err);
    });
});


//MongDB connection
mongoose.connect(
    process.env.DB_CONNECTION, 
    () => {
        console.log('Connected to MongoDB');
    }
);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});