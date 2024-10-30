const express = require('express');
const router = express.Router();
require('dotenv/config'); //Specify all credentials in .env
const Token = require('../models/Token');


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
Functionality: The endpoint that redirects the application for authentication
    -> Currently redirects to homepage if user session has been established
    -> Otherwise, initiates the authentication step
Params:
Returns: GetToken endpoint
*/
let token = null;
router.get('/', (req, res) => {
    console.log(req.session);
    //Check if valid access token exists or not
    //If not, update it
    // if(token == null)
    return res.redirect('./authenticate/gettoken');

    // res.send('Authenticate homepage!');
});


/*
Functionality: The endpoint redirects the user to the Fitbit authorization page
Params:
    - scope: specifies access to various parts of the user's fitbit data
Returns: <REDIRECT URL>
*/
router.get('/authorize', async (req, res) => {
	// request access to the user's activity, heartrate, location, nutrion, profile, settings, sleep, social, and weight scopes
	const authorize_url = await client.getAuthorizeUrl('activity heartrate location nutrition profile settings sleep social weight', process.env.REDIRECT_URL, "login");
    console.log(authorize_url);
    res.redirect(authorize_url);
});


/*
Functionality: This endpoint handles the callback action from the Fitbit authorization flow
    -> Fetches the Fitbit Token based on the Token model
    -> Stores the new token in the session
Params:
    - REDIRECT_URL: Uses the redirect url from the env file
Returns: /savetoken
*/
router.get('/callback', async (req, res) => {
	// exchange the authorization code we just received for an access token
    console.log("Callback URL called!");
    console.log(req.session);
	await client.getAccessToken(req.query.code, process.env.REDIRECT_URL).then(result => {
        token = new Token(result);
        req.session.token = token;
        console.log(token);
        res.redirect('./savetoken');
	}).catch(err => {
		res.status(500).send(err);
	});
});


/*
Functionality: The endpoint refreshes an expired access token
Params:
    - access_token: specify the old access token
    - refresh_token: specify the valid, unexpired refresh token
    - expires_in: specify the time in milliseconds (upto 8 hrs equivalent) for the validity of new access token
Returns: /savetoken
*/
router.get('/refreshtoken', async (req, res) => {
    console.log("Refresh Token called!");
    console.log(req.session);
    if(token == null)
        res.redirect('./gettoken'); // Can't refresh if a token doesn't exist -> so fetch from db

	await client.refreshAccessToken(token.access_token, token.refresh_token, token.expires_in)
    .then(result => {
        token = new Token(result);
        req.session.token = token;
        console.log("Token refreshed successfully!");
        console.log(token);
        res.redirect('./savetoken')
	}).catch(err => {
		res.status(500).send(err);
	});
});


/*
Functionality: The endpoint saves the token to the MongoDB
Params:
    - Token: Saves/Updates the specified token to DB
Returns: /home
*/
router.get('/savetoken', async (req, res) => {
    console.log("savetoken called!");
    try {
        await Token.findOneAndUpdate(
            { user_id : token.user_id }, 
            { $set : { 
                access_token: token.access_token,
                expires_in: token.expires_in,
                refresh_token: token.refresh_token,
                scope: token.scope,
                token_type: token.token_type,
                user_id: token.user_id
            }}, 
            { new : true, upsert : true })
            .then((docs) => {
                console.log(docs);
                console.log("Token updated successfully in db");
                res.redirect('/home');
            })
            .catch((err) => res.status(500).send({ message: err }));
    } catch (error) {
        res.status(500).json({ message : error });
    }
});


/*
Functionality: Gets a saved token from MongoDB else restarts the authorization process
Params:
    - session: uses the current session for verifying whether a token exists or not
Returns: /authorize
*/
router.get('/gettoken', async (req, res) => {
    console.log("GetToken called!");
    if(!req.session.token) //check if user id exists in our session
    {
        console.log("session_user_id is null");
        return res.redirect('./authorize');
    }
    try {
        await Token.findOne({ user_id : req.session.token.user_id })
        .then((docs) => {
            token = docs;
            req.session.token = token;
            console.log(token);
            console.log("Token fetched successfully from db");
            res.redirect('./refreshtoken');
        })
        .catch((err) => res.status(500).send({ message: err }));
    } catch (error) {
        console.error(error);
        res.redirect('./authorize');
    }
});


/*
Functionality: The endpoint logs out the signed in user
Params:
    - user_id: fetches the current user_id to log out
Returns: /loggedout
*/
//Logs out the user and removes the tokens from db
router.get('/logout', async (req, res) => {
    console.log("Logout called!");
    console.log(req.session);
    try {
        await Token.deleteOne({ user_id : req.session.token.user_id })
        .then(() => {
            console.warn("Token deleted successfully from db");
            req.session.destroy();
            console.warn("Token deleted successfully from session");
            token = null;
            req.session = null;
            res.redirect('/loggedout');
        })
        .catch((err) => res.status(500).send({ message: err }));
    } catch (error) {
        res.status(500).json({ message : error });
    }
});


module.exports = router;