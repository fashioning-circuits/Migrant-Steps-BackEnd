console.clear();

// Basic NodeJS library imports
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
var SQLiteStore = require('connect-sqlite3')(sessions);
const mongoose = require('mongoose');  
const cors = require('cors');
require('dotenv/config'); //Specify all credentials in .env
const maps = require("./models/Map.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
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
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interactive Graph</title>
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <style>
          .node { stroke: #000; stroke-width: 1.5px; }
          .link { stroke: #333; stroke-width: 2px; stroke-opacity: 0.9; }
          .highlight { fill: red; stroke: red; stroke-width: 3px; }
        </style>
      </head>
      <body>
        <svg width="600" height="600"></svg>
        <script>
          const map = ${JSON.stringify(Array.from(maps.map).map(s => Array.from(s)))};
          const current = ${JSON.stringify(Array.from(maps.currentID))};
          const unlockable = ${JSON.stringify(Array.from(maps.unlockableID))};
          
          const nodes = map.map((_, index) => ({ id: index }));
          const links = [];
  
          map.forEach((connections, source) => {
            connections.forEach(target => {
              links.push({ source, target });
            });
          });
  
          const width = 600, height = 600;
          const centerX = width / 2, centerY = height / 2;
  
          function circularLayout(nodes, radiusIncrement) {
            const nodesPerCircle = 9;
            let currentCircle = 0, nodeIndex = 0;
  
            nodes[nodeIndex].x = centerX;
            nodes[nodeIndex].y = centerY;
            nodeIndex++;
  
            while (nodeIndex < nodes.length) {
              currentCircle++;
              const radius = currentCircle * radiusIncrement;
              const angleStep = (2 * Math.PI) / nodesPerCircle;
  
              for (let i = 0; i < nodesPerCircle && nodeIndex < nodes.length; i++) {
                const angle = i * angleStep - Math.PI / 2;
                nodes[nodeIndex].x = centerX + radius * Math.cos(angle);
                nodes[nodeIndex].y = centerY + radius * Math.sin(angle);
                nodeIndex++;
              }
            }
          }
  
          circularLayout(nodes, 80);
  
          const svg = d3.select("svg");
          const link = svg.append("g").attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", "link");
  
          const node = svg.append("g").attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 10)
            .attr("fill", d => current.includes(d.id) ? "red" : unlockable.includes(d.id) ? "green" : "black")
            .on("click", (event, d) => console.log(\`Node clicked: \${d.id}\`));
  
          node.append("title").text(d => \`Node \${d.id}\`);
  
          link.attr("x1", d => nodes[d.source].x)
              .attr("y1", d => nodes[d.source].y)
              .attr("x2", d => nodes[d.target].x)
              .attr("y2", d => nodes[d.target].y);
  
          node.attr("cx", d => d.x).attr("cy", d => d.y);
        </script>
      </body>
      </html>
    `);
});

/*
Functionality: Establishes the MongoDB connection from our backend application using the Mongoose package
Params:
Returns: Prints a message in the console on a successful connection to MongoDB
*/
mongoose.set("strictQuery", false);
mongoose.connect(
    process.env.DB_CONNECTION, 
    () => {
        console.log('Connected to MongoDB');
    }
);


/*
Functionality: The final part of the application that launches it in the browser.
Params:
Returns: Prints a message in the console on a successful launch of the application
*/
app.listen(port, () => {
    console.log(`Migrant Steps app listening on port ${port}`)
});