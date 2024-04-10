// It is a nodejs, expressjs project.
const express = require("express");

// 'https' is used to fetch response from the API path. It is a native expressjs package and doesn't require us to create a new 'app' letiable.
const https = require("https");

// 'body-parser' is used to access tags from the html file. We'll be using it to access queryValue.
const bodyParser = require("body-parser");

// axios package; to fetch data from search endpoint. This gives data in parsed form.
const axios = require("axios");

// // 'node-cron' package is being used to scheduele the refresh of tokens.
// const cron = require('node-cron');

// Importing the instance of .Routes() from auth-routes.
const authRoutes = require("./routes/auth-routes");

// The following makes auth-routes understand the strategy named, "spotify".
const passportSetup = require("./config/passport-setup");

// mongoDb compatible library: mongoose.
const mongoose = require("mongoose");

// To link the keys.
const keys = require("./config/keys");

//
const cookieSession = require("cookie-session");

// It is used for OAuth.
const passport = require("passport");

const User = require("./models/user-model");

// The library to encode/decode weird text returned from API endpoint.
const he = require("he");

const ejsLint = require('ejs-lint');

// Import YouTube and Spotify service functions
const {fetchYouTubeResults} = require("./services/youtubeService");
const {fetchSpotifyResults} = require("./services/spotifyService");

// This app constant is created to be able to access the menthods available in 'express' package.
const app = express();

// 'urlencoded' helps access html data. Other data formats could JSON etc.
// body-parser required as to exclusively define "extended: true" although this is no use to us.
app.use(bodyParser.urlencoded({
    extended: true
}));

// This sets a static directory to look for source files like css, js, img. These file links are mentioned in html or ejs files.
// A folder named 'public' has to be in the same directory as "app.js". The source files are stored here.
app.use(express.static("public"));

// ejs view engine has been used to use app.js variables into the output ejs file.
app.set('view engine', 'ejs');

// Starting the server.
app.listen(3000, function () {
    console.log("Server is running on port 3000.")
})

// Set-up Cookies
app.use(cookieSession({
    // maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    maxAge: 60 * 60 * 1000, // 1 hour
    keys: [keys.session.cookieKey]
}))

// Initialize passport for cookieSession
app.use(passport.initialize());
app.use(passport.session());

// Set-up Routes
app.use("/auth", authRoutes);

// Connecting to monogoDb Atlas
mongoose.connect(keys.mongoDb.dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log("Connected to mongoDb Atlas.")
})

// Variables
// let query = "";

// Loop variables
// let i = 0;
// let j = 0;
// let k = 0;
/*
// Spotify Variables
let spotifyResult = "";

let spotifyTrackIdAppJs = [];
let spotifyTrackArtistIdAppJs = [];
let spotifyQueryArtistIdAppJs = [];
let spotifyAlbumIdAppJs = [];

let spotifyTrackArtistIdUniqueAppJs = [];
let spotifyAlbumIdUniqueAppJs = [];
*/
// YouTube Variables
/*
let ytQueryResult = "";
let ytCoverResult = "";
let ytLiveResult = "";

let ytQueryAppJs = [];

let ytCoverAppJs = [];
let ytCoverUniqueAppJs = [];

let ytLiveAppJs = [];
let ytLiveUniqueAppJs = [];
*/

// The page to load when the browser (client) makes request to GET something from the server on "/", i.e., from the homepage.
// This GET request is made as soon as the homepage url is entered in the address bar od browser, automatically.
app.get("/", function (req, res) {
    // res.sendFile(__dirname + "/index.html");
    res.render("index", {
        user: req.user
    });
});

// The data that server should GET when the GET request is sent by the client, upon entering the search queryValue, in the search bar (form).
app.get("/search", async function (req, res) {

    // Accessing the queryValue user submitted in index.html.
    const query = req.query.queryValue;
    let results = await fetchYouTubeResults(query);
    let isAjaxRequest = req.query.ajax === 'true'; // A simple way to signal an AJAX request

    if (req.user) {
        // User is logged in, fetch Spotify results
        let spotifyResults = await fetchSpotifyResults(query, req.user.accessToken);
        Object.assign(results, spotifyResults);
    }

    let view;

    if (req.user && isAjaxRequest) {
        view = "partialResultsLoggedIn";
    } else if (isAjaxRequest) {
        view = "partialResultsNotLoggedIn"
    } else {
        view = "results";
    }

    let options = {
        layout: false, // Disable the Express layout
        query: query,
        user: !!req.user,

        // If there is no key named 'id' in ytQueryAppJs, set its values as { id: [], thumb: [], title: [], channel: [] }.
        ytQueryEjs: (results.ytQueryAppJs && 'id' in results.ytQueryAppJs) ? results.ytQueryAppJs : {
            id: [],
            thumb: [],
            title: [],
            channel: []
        },
        ytCoverUniqueEjs: (results.ytCoverUniqueAppJs && 'id' in results.ytCoverUniqueAppJs) ? results.ytCoverUniqueAppJs : {
            id: [],
            thumb: [],
            title: [],
            channel: []
        },
        ytLiveUniqueEjs: (results.ytLiveUniqueAppJs && 'id' in results.ytLiveUniqueAppJs) ? results.ytLiveUniqueAppJs : {
            id: [],
            thumb: [],
            title: [],
            channel: []
        },

        spotifyTrackId: results.spotifyTrackId,
        spotifyTrackThumb: results.spotifyTrackThumb,
        spotifyTrackTitle: results.spotifyTrackTitle,
        spotifyTrackArtist: results.spotifyTrackArtist,

        spotifyUniqueTrackArtistId: results.spotifyUniqueTrackArtistId,
        spotifyUniqueTrackArtistThumb: results.spotifyUniqueTrackArtistThumb,
        spotifyUniqueTrackArtistName: results.spotifyUniqueTrackArtistName,

        spotifyUniqueQueryArtistId: results.spotifyUniqueQueryArtistId,
        spotifyUniqueQueryArtistThumb: results.spotifyUniqueQueryArtistThumb,
        spotifyUniqueQueryArtistName: results.spotifyUniqueQueryArtistName,

        spotifyAlbumId: results.spotifyAlbumId,
        spotifyAlbumThumb: results.spotifyAlbumThumb,
        spotifyAlbumName: results.spotifyAlbumName,
        // spotifyAlbumArtist: spotifyAlbumArtist,

        spotifyUniqueAlbumId: results.spotifyUniqueAlbumId,
        spotifyUniqueAlbumThumb: results.spotifyUniqueAlbumThumb,
        spotifyUniqueAlbumName: results.spotifyUniqueAlbumName,
        spotifyUniqueAlbumArtist: results.spotifyUniqueAlbumArtist
    }

    res.render(view, options, (err, html) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error rendering results");
            return;
        }

        if (view !== "results") {
            res.json({
                html: html,
                updatedData: options
            });
        } else {
            res.send(html);
        }
    });
});

/* Attempt to update access token, using refresh token. Everything works, apart from User.findOneAndUpdate({ });.

// // The following was added nearby, "app.post("/", function(req, res) {"

// Global Variable for refresh token.
// This is to be used further in the node-crone command. Hence, needs to be declared globally.
let refresh_token = "";
let spotify_id = "";

// The data that server should POST when the POST request is sent by the client, upon entering the search queryValue, in the search bar (form).
app.post("/", function(req, res) {

  refresh_token = req.user.refreshToken;
  spotify_id = req.user.spotifyId;

  // // The attempt:
 // Refreshing access_token, 59th minute of every hour. E.g., 04:59, 15:59.
 // It is irrespective of the starting time of the server. I.e., if the server starts at 04:15, the following code would run at 04:59.
 // We 'were', "Refreshing access_token, 59th minute of every hour." But the following would run every second. This was done for development purpose.
 cron.schedule('* * * * * ', (req, res) => {
   axios({
     url: "https://accounts.spotify.com/api/token",
     method: "post",
     params: {
       grant_type: "refresh_token",
       refresh_token: refresh_token
     },
     headers: {
       Authorization: "Basic " + keys.spotify.authorization,
       "Accept": "application/json",
       "Content-Type": "application/x-www-form-urlencoded"
     }
   }).then(function(response) {
     new_access_token = response.data.access_token;
     // console.log("Sdfsdfsdfsdf           " + new_access_token);

     console.log("Test 1          " + spotify_id);
     User.findOneAndUpdate({
       spotifyId: spotify_id
     }, {
       $set: {
         accessToken: new_access_token
       }
     }, {
       new: true,
       useFindAndModify: false
     })
     console.log("Test 2");
   }).then((response) => {
     console.log("Access token updated to " + accessToken + ".");
     console.log(response);
   }).catch(function(error) {
     console.log(error);
   });
 });
*/

/* Access Token and Refresh Token Related

 // Declaring token.
 let refresh_token = "AQCqYC-HTBM15P3ZYNpD-UnK0mLzQSuBrKJrRqlgXRH-GCBIWP0DeWMkUqCtvv0V1xWrIDBGOxx8No9aDCpE7_tbOx5R1e5WdWEXY-zAzmpjdK8g0dZY6sP7gpVjKBinEq8";
 let authorization = "Basic MWQ4ZjAwZGY4MDc0NDE5N2JiNWMwM2VmMzBkYmRlOGM6NzE4MTNhNTUyZjQzNGYzNDkzYWFlYTExODRmODdhYmU=";
 let access_token = "";
 let token = "Bearer " + access_token;


 // First Comment: The following is probably me following that chubby fella who built a react app for fetching your current devices and stuff.
 let client_id = "1d8f00df80744197bb5c03ef30dbde8c";
 let code = "";

 // Requesting authorization from user.
 // For us, this step's aim is to have Spotify recognize the user and play full song instead of the sample 30 seconds.

 let authURL = "https://accounts.spotify.com/authorize?client_id=1d8f00df80744197bb5c03ef30dbde8c&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&scope=user-read-playback-state%20app-remote-control%20user-modify-playback-state%20user-read-currently-playing%20user-read-playback-position%20user-read-email%20streaming"

 app.post("/", function(req, res) {
   res.redirect(authURL);
 });

 function onPageLoad() {
   if (window.location.search.length > 0) {
     handleRedirect();
   }
 }

 function handleRedirect() {
   code = getCode();
 }

 function getCode() {
   code = null;
   const queryString = window.location.search;
   if ( queryString.length > 0) {
     const urlParams = new urlSearchParams(queryString);
     code = urlParams.get('code');
   }
   return code;
 }

 code = getCode();

 // Second Comment: Creating access token and refresh token using 'code'.
 axios({
   url: "https://accounts.spotify.com/api/token",
   method: "post",
   params: {
     grant_type: "authorization_code",
     code: code,
     redirect_uri: "http://localhost:3000/"
   },
   headers: {
     Authorization: authorization,
     "Accept": "application/json",
     "Content-Type": "application/x-www-form-urlencoded"
   }
 }).then(function(response) {
   // console.log(response.data);
   // console.log(response.data.access_token);
   access_token = response.data.access_token;
   token = "Bearer " + access_token;
   console.log(token);
 }).catch(function(error) {
   console.log(error);
 });

 // Third Comment: Creating the first access_token using refresh_token
 axios({
   url: "https://accounts.spotify.com/api/token",
   method: "post",
   params: {
     grant_type: "refresh_token",
     refresh_token: refresh_token
   },
   headers: {
     Authorization: authorization,
     "Accept": "application/json",
     "Content-Type": "application/x-www-form-urlencoded"
   }
 }).then(function(response) {
   // console.log(response.data);
   // console.log(response.data.access_token);
   access_token = response.data.access_token;
   token = "Bearer " + access_token;
   console.log(token);
 }).catch(function(error) {
   console.log(error);
 });
*/

/*  Methods for fetching Album Artists.

// Method 1:
// The following approach was causing the loading time to be increase by (API Call Time) x resAlbumArtistResult.data.artists).length. Which is terribly slow.
await axios.get("https://api.spotify.com/v1/albums/artists?ids=" + spotifyUniqueAlbumId, {
  headers: {
    'Authorization': "Bearer " + req.user.accessToken,
  }
}).then((resAlbumArtistResult) => {
  for (i = 0; i < (resAlbumArtistResult.data.artists).length; i++) {
    // console.log(resTrackArtistResult);
    spotifyUniqueAlbumArtist[i] = resAlbumArtistResult.data.artists[i].name;
  }
})

// Method 2:
// The following approach is now unnecessay.
// Allocating values to unique album artists. Track-wise, then Query-wise, and then concatinating the two to spotifyUniqueAlbumArtist.
for (i = 0; i < spotifyUniqueTrackAlbumArtist.length; i++) {
  // console.log(spotifyUniqueAlbumId.length);
  // console.log(i);
  for (j = 0; j < 1; j++) {
    // console.log("    " + j);
    if (JSON.stringify(spotifyUniqueTrackAlbumArtist[i]).localeCompare(JSON.stringify(spotifyResult.tracks.items[j].album.id)) == 0) {
      console.log("    Matched pairs: " + i + "    " + j);
      console.log("    " + JSON.stringify(spotifyUniqueTrackAlbumArtist[i]));
      console.log("    " + JSON.stringify(spotifyResult.albums.items[j].id));
      spotifyUniqueAlbumArtist[i] = spotifyResult.tracks.items[j].album.artists[0].name;
      console.log(spotifyUniqueAlbumArtist[i]);
      break;
    }
  }
}

for (i = spotifyUniqueTrackAlbumArtist.length; i < (spotifyUniqueTrackAlbumArtist.length + spotifyUniqueQueryAlbumArtist.length); i++) {
  // console.log(spotifyUniqueAlbumId.length);
  // console.log(i);
  for (j = 0; j < 2; j++) {
    // console.log("    " + j);
    if (JSON.stringify(spotifyUniqueQueryAlbumArtist[i]).localeCompare(JSON.stringify(spotifyResult.albums.items[j].id)) == 0) {
      console.log("    Matched pairs: " + i + "    " + j);
      console.log("    " + JSON.stringify(spotifyUniqueQueryAlbumArtist[i]));
      console.log("    " + JSON.stringify(spotifyResult.albums.items[j].id));
      spotifyUniqueAlbumArtist[i] = spotifyResult.albums.items[j].artists[0].name;
      console.log(spotifyUniqueAlbumArtist[i]);
      break;
    }
  }
}
*/

/* Since we are now declaring the variables locally. We need not to empty every array.
// Emptying all the arrays. Not all the elements are over-ridden in the coming calls.
// For e.g., a Track with 4 artists, may assign values to first 4 places in the array.
// If the next query returns a Track with 1 artist, first place will be over-ridden while the next 3 places would keep the previous values which may interfere while showing results.ejs.
spotifyTrackId.length = 0;
spotifyTrackThumb.length = 0;
spotifyTrackTitle.length = 0;
spotifyTrackArtist.length = 0;

spotifyTrackArtistId.length = 0;
spotifyTrackArtistThumb.length = 0;
spotifyTrackArtistName.length = 0;

spotifyQueryArtistId.length = 0;
spotifyQueryArtistThumb.length = 0;
spotifyQueryArtistName.length = 0;

spotifyUniqueTrackArtistId.length = 0;
spotifyUniqueTrackArtistThumb.length = 0;
spotifyUniqueTrackArtistName.length = 0;

spotifyUniqueQueryArtistId.length = 0;
spotifyUniqueQueryArtistThumb.length = 0;
spotifyUniqueQueryArtistName.length = 0;

spotifyAlbumId.length = 0;
spotifyAlbumThumb.length = 0;
spotifyAlbumName.length = 0;
spotifyAlbumArtist.length = 0;

spotifyUniqueAlbumId.length = 0;
spotifyUniqueAlbumThumb.length = 0;
spotifyUniqueAlbumName.length = 0;
spotifyUniqueAlbumArtist.length = 0;
*/

/* Unnecessary renders
spotifyTrackArtistId: spotifyTrackArtistId,
spotifyTrackArtistThumb: spotifyTrackArtistThumb,
spotifyTrackArtistName: spotifyTrackArtistName,

spotifyQueryArtistId: spotifyQueryArtistId,
spotifyQueryArtistThumb: spotifyQueryArtistThumb,
spotifyQueryArtistName: spotifyQueryArtistName,
*/

/*
  // Emptying all the arrays.
  ytQueryAppJs.length = 0;

  ytCoverAppJs.length = 0;
  ytCoverUniqueAppJs.length = 0;

  ytLiveAppJs.length = 0;
  ytLiveUniqueAppJs.length = 0;
*/
