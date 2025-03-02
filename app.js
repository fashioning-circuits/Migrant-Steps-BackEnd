console.clear();

// Basic NodeJS library imports
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
var SQLiteStore = require('connect-sqlite3')(sessions);
const mongoose = require('mongoose');
const Excerpt = require('./models/Excerpt.js'); 
const cors = require('cors');
require('dotenv/config'); //Specify all credentials in .env

const app = express();
const path = require('path');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static/')));
app.use(cors());

const port = process.env.PORT || 3000;

// thirty days in terms of milliseconds
const thirtyDays = 1000 * 60 * 60 * 24 * 30;


/*
Functionality: This method sets up the user session in the browser
Params:
    - secret: The security code from the .env for securing the browser session
    - saveUninitialized: Save the model even if it's unintialized (Recommendation: Let it be as it is)
    - cookie: The time period for keeping a cookie alive (This basically tells how often do you want the user to log in to fitbit)
    - resave: Resave the session even if it wasn't updated (Recommendation: Let it be as it is)
    - store: The SQLite session store -> essentially, rather than storing on system RAM, we store the session on disk
Returns: Session
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


/*
Functionality: Initializes the Fitbit API client
Params:
    - clientId: The fitbit client's ID from the dev portal
    - clientSecret: The fitbit client's secret from the dev portal
Returns: FitbitApiClient
*/
const FitbitApiClient = require('fitbit-node');
const client = new FitbitApiClient({
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	apiVersion: '1.2' // 1.2 is the default
});


/*
Functionality: Initializes the Authenticate middleware
Params:
    - </path> : specify the sub-path for accessing the authenticate middleware
Returns: authRoute
*/
const authRoute = require('./api/authenticate');
app.use('/authenticate', authRoute);


/*
Functionality: The page to display website is accessed at the root level
    -> Currently redirects to homepage if user session has been established
    -> Otherwise, initiates the authentication step
Params:
Returns: /home
*/
app.get('/', (req, res) => {
	if(req.session.token)
        res.redirect('/home');
    else
        res.redirect('/authenticate');
});


/*
Functionality: This endpoint displays the homepage once the user has successfully logged in
    -> At present, it displays various options for accessing fitbit data
Params:
Returns: Homepage
*/
app.get('/home', (req, res) => {
    req.session.save();
    console.log(req.session);
    console.log("Login successful!");
    res.send(`Welcome User<br><a href=\'/profile\'>Click to view profile</a>
    <br><a href=\'/steps\'>Click to view steps data</a>
    <br><a href=\'/distance\'>Click to view distance data</a>
    <br><br><a href=\'/authenticate/logout\'>Logout</a>`);
});


/*
Functionality: The endpoint to navigate to once the user has successfully logged out
    -> At present, this page would ideally have the path for asking the user to log back in
Params:
Returns: Logout page
*/
app.get('/loggedout', (req, res) => {
    console.log(req.session);
    console.log("Logout successful!");
    res.send("Logout successful!");
});


/*
Functionality: This endpoint fetches the user's profile data stored in their FitBit account
    -> Ensures that the user is logged in, else it will initiate the authentication flow
    -> Fetches the profile data from the user's fitbit account
Params:
Returns: Displays the profile data in JSON format
*/
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


/*
Functionality: This endpoint fetches the user's steps data stored in their FitBit account
    -> Ensures that the user is logged in, else it will initiate the authentication flow
    -> Fetches the steps data from the user's fitbit account
Params:
Returns: Displays the steps data in JSON format. Also displays the total step count in the last 30 days
*/
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


/*
Functionality: This endpoint fetches the user's distance data stored in their FitBit account
    -> Ensures that the user is logged in, else it will initiate the authentication flow
    -> Fetches the distance data from the user's fitbit account
Params:
Returns: Displays the distance data in JSON format
*/
app.get('/distance', (req, res) => {
    if(!req.session.token)
        return res.redirect('/authenticate');

    console.log('Fetching steps');
    // use the access token to fetch the user's distance data
    client.get("/activities/distance/date/today/30d.json", req.session.token.access_token).then(results => {
        res.send(JSON.stringify(results[0]));
    }).catch(err => {
        res.status(err.status).send(err);
    });
});


// Temporary, displays map
app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/'));
});

/*
Functionality: Establishes the MongoDB connection from our backend application using the Mongoose package
Params:
Returns: Prints a message in the console on a successful connection to MongoDB
*/
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const db = mongoose.connection.db;
        console.log('Connected to database:', mongoose.connection.name);
        const documents = await db.collection('Excerpt').find().toArray();
        console.log('Raw documents from Excerpt:', documents);
    })
    .catch(err => console.error('MongoDB connection error:', err.message));


async function listAllCollections() {
    try {
        // Access the database object
        const db = mongoose.connection.db;

        // List all collections
        const collections = await db.listCollections().toArray();

        console.log('Collections in the database:');
        collections.forEach(collection => console.log(collection.name));
    } catch (error) {
        console.error('Error listing collections:', error.message);
    }
}

// Function to fetch all documents
async function fetchAllDocuments() {
    try {
        console.log('Fetching all documents from the Excerpt collection...');
        const documents = await Excerpt.find(); // Fetch all documents

        if (documents.length === 0) {
            console.log('No documents found in the collection.');
        } else {
            console.log('Documents:');
            console.log(documents); // Print documents to the console
        }
    } catch (error) {
        console.error('Error fetching documents:', error.message);
    }
}



/*
Functionality: Gets a document from the Excerpt collection in MongoDB by its id
Params: _id of the MongoDB Document
Returns: MongoDB Document in HTTP Format
*/
app.get('/excerpts/:id', async (req, res) => {
    try {
        console.log('Request received');
        console.log(req.params);
        const { id } = req.params;

        console.log('Fetching excerpt...');
        const excerpt = await Excerpt.findOne({ node_id: id });

        if (!excerpt) {
            console.log('Excerpt not found');
            return res.status(404).json({ message: 'Excerpt not found' });
        }

        console.log('Excerpt found:', excerpt);
        return res.status(200).json(excerpt);

    } catch (error) {
        console.error('Error occurred:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/*
Functionality: The final part of the application that launches it in the browser.
Params:
Returns: Prints a message in the console on a successful launch of the application
*/
app.listen(port, () => {
    console.log(`Migrant Steps app listening on port ${port}`)
});