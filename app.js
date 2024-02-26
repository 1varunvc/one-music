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

// The following two constants were not here originally.
const superagent = require('superagent');

const CircularJSON = require('circular-json');


// This app constant is created to be able to access the methods available in 'express' package.
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
app.listen(3000, function() {
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

function removeDuplicatesFromResults(arr) {
  var obj = {};
  var ret_arr = [];
  for (var i = 0; i < arr.length; i++) {
    obj[arr[i]] = true;
  }
  for (var key in obj) {
    ret_arr.push(key);
  }
  arr = ret_arr;
  return arr;
}

// https://stackoverflow.com/a/14930567/14597561
function compareAndRemove(removeFromThis, compareToThis) {
  removeFromThis = removeFromThis.filter(val => !compareToThis.includes(val));
  return (removeFromThis);
}

// The page to load when the browser (client) makes request to GET something from the server on "/", i.e., from the homepage.
// This GET request is made as soon as the homepage url is entered in the address bar od browser, automatically.
app.get("/", function(req, res) {
  // res.sendFile(__dirname + "/index.html");
  res.render("index", {
    user: req.user
  });
});

// The following code until line 190 is not a part of the original code.
app.get('/spotify-proxy', async (req, res) => {

  const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';
  // const COOKIE = "sp_t=486b106fa2743ce02cd67430424c109b; sp_dc=AQCaJ8SEln8nOaE4KkT50V6kJFbgTZXx0rsMCsiE2O566QRJYl7hnlFeUhK-vwqEJlu4psruDTG_f6GZ4VSnqzIxOY6G_4fOIIp7R00abDdYRAf9yKpgtwksnemyuqGwkt5Gp35bn43Rhc-uI7W9PXXKi15lw-Y; sp_key=552b8cab-d021-43e3-ae2a-b3f147738870; sp_landing=https://open.spotify.com/embed/track/4R2kfaDFhslZEMJqAFNpdd?sp_cid=486b106fa2743ce02cd67430424c109b&device=desktop"
  // const COOKIE = "__Host-device_id=AQAiviyTBFUYfQ2FQ9NU8QGnrCR75Gg49SMEfVASvuN3PRD93b9MMMaVctM8-dT8TYD0LqTiEd6gGaQo2pmTlhLV8_xqf1PPwRo; sp_t=486b106fa2743ce02cd67430424c109b; sp_m=in-en; OptanonAlertBoxClosed=2023-01-16T07:41:05.981Z; _gcl_au=1.1.1310936527.1682404732; sp_dc=AQCaJ8SEln8nOaE4KkT50V6kJFbgTZXx0rsMCsiE2O566QRJYl7hnlFeUhK-vwqEJlu4psruDTG_f6GZ4VSnqzIxOY6G_4fOIIp7R00abDdYRAf9yKpgtwksnemyuqGwkt5Gp35bn43Rhc-uI7W9PXXKi15lw-Y; sp_key=552b8cab-d021-43e3-ae2a-b3f147738870; sp_gaid=0088fc2e34a9d055a134bddfdb86141709e182f32121931066fa87; OptanonConsent=isIABGlobal=false&datestamp=Mon+May+01+2023+15%3A22%3A20+GMT%2B0530+(India+Standard+Time)&version=6.26.0&hosts=&landingPath=NotLandingPage&groups=s00%3A1%2Cf00%3A0%2Cm00%3A0%2Ct00%3A0%2Ci00%3A0%2Cf11%3A0&geolocation=IN%3BHR&AwaitingReconsent=false; _ga=GA1.1.567394068.1682934741; _ga_ZWRF3NLZJZ=GS1.1.1682934740.1.0.1682935028.0.0.0; inapptestgroup=; sp_tr=false; sp_landing=https%3A%2F%2Fopen.spotify.com%2Fembed%2Fartist%2F2TJHmhbmT7L3gw2NKyDTHh%3Fsp_cid%3D486b106fa2743ce02cd67430424c109b%26device%3Ddesktop"
  const COOKIE = "sp_t=486b106fa2743ce02cd67430424c109b; sp_dc=AQCaJ8SEln8nOaE4KkT50V6kJFbgTZXx0rsMCsiE2O566QRJYl7hnlFeUhK-vwqEJlu4psruDTG_f6GZ4VSnqzIxOY6G_4fOIIp7R00abDdYRAf9yKpgtwksnemyuqGwkt5Gp35bn43Rhc-uI7W9PXXKi15lw-Y; sp_key=552b8cab-d021-43e3-ae2a-b3f147738870; sp_gaid=0088fc2e34a9d055a134bddfdb86141709e182f32121931066fa87; sp_landing=https://open.spotify.com/embed/artist/2TJHmhbmT7L3gw2NKyDTHh?sp_cid=486b106fa2743ce02cd67430424c109b&device=mobile";

  const url = req.query.url;
  const headers = {
    'User-Agent': DESKTOP_USER_AGENT,
    'cookie': COOKIE
  };

  if (!url) {
    return res.status(400).send('Missing the url parameter.');
  }

  console.log(`Proxy server received request for url: ${url}`);

  try {
    const response = await axios.get(url, {headers});
    res.send(response.data);
    console.log("The response from the Spotify's server has been sent to the user, by the [proxy] server.");
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.error(`Error: Spotify server not found for url ${url}`);
      return res.status(404).send('Spotify server not found');
    } else if (error.code === 'ETIMEDOUT') {
      console.error(`Error: Spotify server timed out for url ${url}`);
      return res.status(408).send('Spotify server timed out');
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`Error: Spotify server refused connection for url ${url}`);
      return res.status(502).send('Spotify server refused connection');
    } else {
      console.error(error);
      return res.sendStatus(500);
    }
  }
})


// Declaring variables for the function 'ytAxiosGetFunc'
let urlOfYtAxiosGetFunc = "";

// This function GETs data, parses it, allocates required values in an array.
async function ytAxiosGetFunc(queryOfYtAxiosGetFunc, maxResultsOfYtAxiosGetFunc) {

  let ytExtractedResult = [];
  let ytVideoId = [];
  let ytVideoThumb = [];
  let ytVideoTitle = [];
  let ytVideoChannel = [];
  urlOfYtAxiosGetFunc = "https://www.googleapis.com/youtube/v3/search?key=" + keys.google.apiKey[1] + "&part=snippet&order=relevance&type=video&videoEmbeddable=true";

  try {
    let ytResponse = await axios({
      url: urlOfYtAxiosGetFunc,
      method: "get",
      params: {
        q: queryOfYtAxiosGetFunc,
        maxResults: maxResultsOfYtAxiosGetFunc
      }
    })

    let ytResult = ytResponse.data;

    for (i = 0; i < (ytResult.items).length; i++) {
      ytVideoId[i] = ytResult.items[i].id.videoId;
      ytVideoThumb[i] = ytResult.items[i].snippet.thumbnails.default.url;
      ytVideoTitle[i] = he.decode(ytResult.items[i].snippet.title);
      ytVideoChannel[i] = he.decode(ytResult.items[i].snippet.channelTitle);
    }

    return {
      id: ytVideoId,
      thumb: ytVideoThumb,
      title: ytVideoTitle,
      channel: ytVideoChannel
    };
  } catch (e) {
    console.log(e);
  }
}

// The data that server should POST when the POST request is sent by the client, upon entering the search queryValue, in the search bar (form).
app.post("/", async function(req, res) {

  let query = "";

  let i = 0;

  let ytQueryResult = "";
  let ytCoverResult = "";
  let ytLiveResult = "";

  let ytQueryAppJs = [];

  let ytCoverAppJs = [];
  let ytCoverUniqueAppJs = [];

  let ytLiveAppJs = [];
  let ytLiveUniqueAppJs = [];

  if (!req.user) {
    // Accessing the queryValue user submitted in index.html.
    query = req.body.queryValue;

    // Fetching top results related to user's query and putting them in the array.
    ytQueryAppJs = await ytAxiosGetFunc(query, 4);
    console.log("ytQueryAppJs:");
    console.log(ytQueryAppJs);

    // Fetching 'cover' songs related to user's query and putting them in the array.
    if (query.includes("cover") == true) {
      ytCoverAppJs = await ytAxiosGetFunc(query, 8);
      console.log("ytCoverAppJs:");
      console.log(ytCoverAppJs);

      // Removing redundant values.
      ytCoverUniqueAppJs.id = compareAndRemove(ytCoverAppJs.id, ytQueryAppJs.id);
      ytCoverUniqueAppJs.thumb = compareAndRemove(ytCoverAppJs.thumb, ytQueryAppJs.thumb);
      ytCoverUniqueAppJs.title = compareAndRemove(ytCoverAppJs.title, ytQueryAppJs.title);
      ytCoverUniqueAppJs.channel = compareAndRemove(ytCoverAppJs.channel, ytQueryAppJs.channel);

      console.log("ytCoverUniqueAppJs:");
      console.log(ytCoverUniqueAppJs);
    } else if (query.includes("live") == true) {
      ytCoverAppJs = await ytAxiosGetFunc(query.replace("live", " cover "), 4);
      console.log("ytCoverAppJs:");
      console.log(ytCoverAppJs);

      // Removing redundant values.
      ytCoverUniqueAppJs.id = compareAndRemove(ytCoverAppJs.id, ytQueryAppJs.id);
      ytCoverUniqueAppJs.thumb = compareAndRemove(ytCoverAppJs.thumb, ytQueryAppJs.thumb);
      ytCoverUniqueAppJs.title = compareAndRemove(ytCoverAppJs.title, ytQueryAppJs.title);
      ytCoverUniqueAppJs.channel = compareAndRemove(ytCoverAppJs.channel, ytQueryAppJs.channel);

      console.log("ytCoverUniqueAppJs:");
      console.log(ytCoverUniqueAppJs);
    } else {
      ytCoverAppJs = await ytAxiosGetFunc(query + " cover", 4);
      console.log("ytCoverAppJs:");
      console.log(ytCoverAppJs);

      // Removing redundant values.
      ytCoverUniqueAppJs.id = compareAndRemove(ytCoverAppJs.id, ytQueryAppJs.id);
      ytCoverUniqueAppJs.thumb = compareAndRemove(ytCoverAppJs.thumb, ytQueryAppJs.thumb);
      ytCoverUniqueAppJs.title = compareAndRemove(ytCoverAppJs.title, ytQueryAppJs.title);
      ytCoverUniqueAppJs.channel = compareAndRemove(ytCoverAppJs.channel, ytQueryAppJs.channel);

      console.log("ytCoverUniqueAppJs:");
      console.log(ytCoverUniqueAppJs);
    }

    // Fetching 'live performances' related to user's query and putting them in the array.
    if (query.includes("live") == true) {
      ytLiveAppJs = await ytAxiosGetFunc(query, 8);
      console.log("ytLiveAppJs:");
      console.log(ytLiveAppJs);

      // Removing redundant values.
      ytLiveUniqueAppJs.id = compareAndRemove(ytLiveAppJs.id, (ytQueryAppJs.id).concat(ytCoverUniqueAppJs.id));
      ytLiveUniqueAppJs.thumb = compareAndRemove(ytLiveAppJs.thumb, (ytQueryAppJs.thumb).concat(ytCoverUniqueAppJs.thumb));
      ytLiveUniqueAppJs.title = compareAndRemove(ytLiveAppJs.title, (ytQueryAppJs.title).concat(ytCoverUniqueAppJs.title));
      ytLiveUniqueAppJs.channel = compareAndRemove(ytLiveAppJs.channel, (ytQueryAppJs.channel).concat(ytCoverUniqueAppJs.channel));

      console.log("ytLiveUniqueAppJs:");
      console.log(ytLiveUniqueAppJs);
    } else if (query.includes("cover") == true) {
      ytLiveAppJs = await ytAxiosGetFunc(query.replace("cover", " live "), 4);
      console.log("ytLiveAppJs:");
      console.log(ytLiveAppJs);

      // Removing redundant values.
      ytLiveUniqueAppJs.id = compareAndRemove(ytLiveAppJs.id, (ytQueryAppJs.id).concat(ytCoverUniqueAppJs.id));
      ytLiveUniqueAppJs.thumb = compareAndRemove(ytLiveAppJs.thumb, (ytQueryAppJs.thumb).concat(ytCoverUniqueAppJs.thumb));
      ytLiveUniqueAppJs.title = compareAndRemove(ytLiveAppJs.title, (ytQueryAppJs.title).concat(ytCoverUniqueAppJs.title));
      ytLiveUniqueAppJs.channel = compareAndRemove(ytLiveAppJs.channel, (ytQueryAppJs.channel).concat(ytCoverUniqueAppJs.channel));

      console.log("ytLiveUniqueAppJs:");
      console.log(ytLiveUniqueAppJs);
    } else {
      ytLiveAppJs = await ytAxiosGetFunc(query + " live", 4);
      console.log("ytLiveAppJs:");
      console.log(ytLiveAppJs);

      // Removing redundant values.
      ytLiveUniqueAppJs.id = compareAndRemove(ytLiveAppJs.id, (ytQueryAppJs.id).concat(ytCoverUniqueAppJs.id));
      ytLiveUniqueAppJs.thumb = compareAndRemove(ytLiveAppJs.thumb, (ytQueryAppJs.thumb).concat(ytCoverUniqueAppJs.thumb));
      ytLiveUniqueAppJs.title = compareAndRemove(ytLiveAppJs.title, (ytQueryAppJs.title).concat(ytCoverUniqueAppJs.title));
      ytLiveUniqueAppJs.channel = compareAndRemove(ytLiveAppJs.channel, (ytQueryAppJs.channel).concat(ytCoverUniqueAppJs.channel));

      console.log("ytLiveUniqueAppJs:");
      console.log(ytLiveUniqueAppJs);
    }

    // The 'results' named EJS file is rendered and fed in response. The 'required' data is passed into it using the following variable(s).
    res.render("results", {
      user: req.user,
      query: query,
      ytQueryEjs: ytQueryAppJs,
      ytCoverUniqueEjs: ytCoverUniqueAppJs,
      ytLiveUniqueEjs: ytLiveUniqueAppJs
    });
    console.log("Values to be sent for rendering: ");
    console.log("ytQueryAppJs");
    console.log(ytQueryAppJs);
    console.log("ytCoverUniqueAppJs");
    console.log(ytCoverUniqueAppJs);
    console.log("ytLiveUniqueAppJs");
    console.log(ytLiveUniqueAppJs);

} else {
    /**************************************YOUTUBE**************************************/
    // Accessing the queryValue user submitted in index.html.
    query = req.body.queryValue;

    // Fetcing top results related to user's query and putting them in the array.
    ytQueryAppJs = await ytAxiosGetFunc(query, 4);
    console.log("ytQueryAppJs:");
    console.log(ytQueryAppJs);

    // Fetching 'cover' songs related to user's query and putting them in the array.
    if (query.includes("cover") == true) {
      ytCoverAppJs = await ytAxiosGetFunc(query, 8);
      console.log("ytCoverAppJs:");
      console.log(ytCoverAppJs);

      // Removing redundant values.
      ytCoverUniqueAppJs.id = compareAndRemove(ytCoverAppJs.id, ytQueryAppJs.id);
      ytCoverUniqueAppJs.thumb = compareAndRemove(ytCoverAppJs.thumb, ytQueryAppJs.thumb);
      ytCoverUniqueAppJs.title = compareAndRemove(ytCoverAppJs.title, ytQueryAppJs.title);
      ytCoverUniqueAppJs.channel = compareAndRemove(ytCoverAppJs.channel, ytQueryAppJs.channel);

      console.log("ytCoverUniqueAppJs:");
      console.log(ytCoverUniqueAppJs);
    } else if (query.includes("live") == true) {
      ytCoverAppJs = await ytAxiosGetFunc(query.replace("live", " cover "), 4);
      console.log("ytCoverAppJs:");
      console.log(ytCoverAppJs);

      // Removing redundant values.
      ytCoverUniqueAppJs.id = compareAndRemove(ytCoverAppJs.id, ytQueryAppJs.id);
      ytCoverUniqueAppJs.thumb = compareAndRemove(ytCoverAppJs.thumb, ytQueryAppJs.thumb);
      ytCoverUniqueAppJs.title = compareAndRemove(ytCoverAppJs.title, ytQueryAppJs.title);
      ytCoverUniqueAppJs.channel = compareAndRemove(ytCoverAppJs.channel, ytQueryAppJs.channel);

      console.log("ytCoverUniqueAppJs:");
      console.log(ytCoverUniqueAppJs);
    } else {
      ytCoverAppJs = await ytAxiosGetFunc(query + " cover", 4);
      console.log("ytCoverAppJs:");
      console.log(ytCoverAppJs);

      // Removing redundant values.
      ytCoverUniqueAppJs.id = compareAndRemove(ytCoverAppJs.id, ytQueryAppJs.id);
      ytCoverUniqueAppJs.thumb = compareAndRemove(ytCoverAppJs.thumb, ytQueryAppJs.thumb);
      ytCoverUniqueAppJs.title = compareAndRemove(ytCoverAppJs.title, ytQueryAppJs.title);
      ytCoverUniqueAppJs.channel = compareAndRemove(ytCoverAppJs.channel, ytQueryAppJs.channel);

      console.log("ytCoverUniqueAppJs:");
      console.log(ytCoverUniqueAppJs);
    }

    // Fetching 'live performances' related to user's query and putting them in the array.
    if (query.includes("live") == true) {
      ytLiveAppJs = await ytAxiosGetFunc(query, 8);
      console.log("ytLiveAppJs:");
      console.log(ytLiveAppJs);

      // Removing redundant values.
      ytLiveUniqueAppJs.id = compareAndRemove(ytLiveAppJs.id, (ytQueryAppJs.id).concat(ytCoverUniqueAppJs.id));
      ytLiveUniqueAppJs.thumb = compareAndRemove(ytLiveAppJs.thumb, (ytQueryAppJs.thumb).concat(ytCoverUniqueAppJs.thumb));
      ytLiveUniqueAppJs.title = compareAndRemove(ytLiveAppJs.title, (ytQueryAppJs.title).concat(ytCoverUniqueAppJs.title));
      ytLiveUniqueAppJs.channel = compareAndRemove(ytLiveAppJs.channel, (ytQueryAppJs.channel).concat(ytCoverUniqueAppJs.channel));

      console.log("ytLiveUniqueAppJs:");
      console.log(ytLiveUniqueAppJs);
    } else if (query.includes("cover") == true) {
      ytLiveAppJs = await ytAxiosGetFunc(query.replace("cover", " live "), 4);
      console.log("ytLiveAppJs:");
      console.log(ytLiveAppJs);

      // Removing redundant values.
      ytLiveUniqueAppJs.id = compareAndRemove(ytLiveAppJs.id, (ytQueryAppJs.id).concat(ytCoverUniqueAppJs.id));
      ytLiveUniqueAppJs.thumb = compareAndRemove(ytLiveAppJs.thumb, (ytQueryAppJs.thumb).concat(ytCoverUniqueAppJs.thumb));
      ytLiveUniqueAppJs.title = compareAndRemove(ytLiveAppJs.title, (ytQueryAppJs.title).concat(ytCoverUniqueAppJs.title));
      ytLiveUniqueAppJs.channel = compareAndRemove(ytLiveAppJs.channel, (ytQueryAppJs.channel).concat(ytCoverUniqueAppJs.channel));

      console.log("ytLiveUniqueAppJs:");
      console.log(ytLiveUniqueAppJs);
    } else {
      ytLiveAppJs = await ytAxiosGetFunc(query + " live", 4);
      console.log("ytLiveAppJs:");
      console.log(ytLiveAppJs);

      // Removing redundant values.
      ytLiveUniqueAppJs.id = compareAndRemove(ytLiveAppJs.id, (ytQueryAppJs.id).concat(ytCoverUniqueAppJs.id));
      ytLiveUniqueAppJs.thumb = compareAndRemove(ytLiveAppJs.thumb, (ytQueryAppJs.thumb).concat(ytCoverUniqueAppJs.thumb));
      ytLiveUniqueAppJs.title = compareAndRemove(ytLiveAppJs.title, (ytQueryAppJs.title).concat(ytCoverUniqueAppJs.title));
      ytLiveUniqueAppJs.channel = compareAndRemove(ytLiveAppJs.channel, (ytQueryAppJs.channel).concat(ytCoverUniqueAppJs.channel));

      console.log("ytLiveUniqueAppJs:");
      console.log(ytLiveUniqueAppJs);
    }

  /* The following function can not be run twice.
    // The 'results' named EJS file is rendered and fed in response. The 'required' data is passed into it using the following variable(s).
    res.render("results", {
      user: req.user,
      query: query,
      ytQueryEjs: ytQueryAppJs,
      ytCoverUniqueEjs: ytCoverUniqueAppJs,
      ytLiveUniqueEjs: ytLiveUniqueAppJs
    });
  */
    console.log("Values to be sent for rendering: ");
    console.log("ytQueryAppJs");
    console.log(ytQueryAppJs);
    console.log("ytCoverUniqueAppJs");
    console.log(ytCoverUniqueAppJs);
    console.log("ytLiveUniqueAppJs");
    console.log(ytLiveUniqueAppJs);

    /**************************************SPOTIFY**************************************/

    // Variables to store the data fetched from API endpoint.
     let spotifyResult = "";
     // let spotifyTrackArtistResult = "";

     let j = 0;
     let k = 0;

     const br1C = "\x1b[36m%s\x1b[0m"
     const br2C = "\x1b[35m%s\x1b[0m"
     const br1 = "-------------------------------";
     const br2 = "---------------------------------------------------------------------------------------------";

     let spotifyTrackId = [];
     let spotifyTrackThumb = [];
     let spotifyTrackTitle = [];
     let spotifyTrackArtist = [];

     let spotifyTrackArtistId = [];
     let spotifyTrackArtistThumb = [];
     let spotifyTrackArtistName = [];

     let spotifyQueryArtistId = [];
     let spotifyQueryArtistThumb = [];
     let spotifyQueryArtistName = [];

     let spotifyUniqueTrackArtistId = [];
     let spotifyUniqueTrackArtistThumb = [];
     let spotifyUniqueTrackArtistName = [];

     let spotifyUniqueQueryArtistId = [];
     let spotifyUniqueQueryArtistThumb = [];
     let spotifyUniqueQueryArtistName = [];

     let spotifyAlbumId = [];
     let spotifyAlbumThumb = [];
     let spotifyAlbumName = [];
     let spotifyTrackAlbumArtist = [];
     let spotifyQueryAlbumArtist = [];

     let spotifyUniqueAlbumId = [];
     let spotifyUniqueAlbumThumb = [];
     let spotifyUniqueAlbumName = [];
     // let spotifyUniqueTrackAlbumArtist = [];
     let spotifyUniqueQueryAlbumArtist = [];
     let spotifyUniqueAlbumArtist = [];

    // The user input query. We are using body-parser package here.
    query = req.body.queryValue;

    // Follow procedure here to get access_token and refresh_token: https://benwiz.com/blog/create-spotify-refresh-token/
    let searchUrl = "https://api.spotify.com/v1/search?q=" + query + "&type=track%2Calbum%2Cartist&limit=4&market=IN";

    //Using Axios to fetch data. It gets parsed to JSON automatically.
     axios.get(searchUrl, {
         headers: {
           // This user.accessToken gets stored in req, after the completion of oAuth process.
           'Authorization': "Bearer " + req.user.accessToken,
         }
       })
       .then(async (resAxios) => {

         // console.log(resAxios.data)
         spotifyResult = resAxios.data;
         // console.log(spotifyResult.tracks.items[0].artists);

         //Extracting required data from 'result'.

         // Allocating values to Track 00, 01, 02, 03.
         if ((spotifyResult.tracks.items).length > 0) {
           console.log("\n");
           for (i = 0; i < (spotifyResult.tracks.items).length; i++) {
             spotifyTrackId[i] = spotifyResult.tracks.items[i].id;

             if ((spotifyResult.tracks.items[i].album.images).length > 0)
              spotifyTrackThumb[i] = spotifyResult.tracks.items[i].album.images[2].url;
             else
              spotifyTrackThumb[i] = "./img/defaults/album" + i + ".png";

             spotifyTrackTitle[i] = he.decode(spotifyResult.tracks.items[i].name);
             spotifyTrackArtist[i] = he.decode(spotifyResult.tracks.items[i].artists[0].name);
             console.groupCollapsed("\x1b[32m%s\x1b[0m", "Track 0" + i + ":");
             console.info(spotifyTrackId[i]);
             console.info(spotifyTrackThumb[i]);
             console.info(spotifyTrackTitle[i]);
             console.info(spotifyTrackArtist[i]);
             console.groupEnd();
           }
         }

         // Values are allocated only if the values exist.
         if ((spotifyResult.tracks.items).length > 0 && (spotifyResult.tracks.items).length > 0 && (spotifyResult.tracks.items).length > 0) {
           console.log(br2C, br2);
           // Allocating values to all the artists of Track 00.
           for (i = 0; i < (spotifyResult.tracks.items[0].artists).length; i++) {
             spotifyTrackArtistId[i] = spotifyResult.tracks.items[0].artists[i].id; //It is not able to set values for tracks with nore than 3 artists. e.g., Girls by Rita Ora.

             await axios.get("https://api.spotify.com/v1/artists/" + spotifyTrackArtistId[i], {
               headers: {
                 'Authorization': "Bearer " + req.user.accessToken,
               }
             }).then((resTrackArtistResult) => {
               // console.log(resTrackArtistResult);
               if ((resTrackArtistResult.data.images).length > 0)
                spotifyTrackArtistThumb[i] = resTrackArtistResult.data.images[2].url;
               else
                spotifyTrackArtistThumb[i] = "./img/defaults/artist" + i + ".png";
             })

             spotifyTrackArtistName[i] = he.decode(spotifyResult.tracks.items[0].artists[i].name);

             console.groupCollapsed("\x1b[32m%s\x1b[0m", "Track 00 Artist 0" + i + ":");
             console.info(spotifyTrackArtistId[i]);
             console.info(spotifyTrackArtistThumb[i]);
             console.info(spotifyTrackArtistName[i]);
             console.groupEnd();
           }

           console.log(br1C, br1);
           // Allocating values to all the artists of Track 01.
           j = 0;
           for (i = (spotifyResult.tracks.items[0].artists).length; i < ((spotifyResult.tracks.items[0].artists).length + (spotifyResult.tracks.items[1].artists).length); i++) {
             spotifyTrackArtistId[i] = spotifyResult.tracks.items[1].artists[j].id;
             await axios.get("https://api.spotify.com/v1/artists/" + spotifyResult.tracks.items[1].artists[j].id, {
               headers: {
                 'Authorization': "Bearer " + req.user.accessToken,
               }
             }).then((resTrackArtistResult) => {
               if ((resTrackArtistResult.data.images).length > 0)
                spotifyTrackArtistThumb[i] = resTrackArtistResult.data.images[2].url;
               else
                spotifyTrackArtistThumb[i] = "./img/defaults/artist" + (i + 5) + ".png";
             })

             spotifyTrackArtistName[i] = he.decode(spotifyResult.tracks.items[1].artists[j].name);

             console.groupCollapsed("\x1b[32m%s\x1b[0m", "Track 01 Artist 0" + j + ":");
             console.info(spotifyTrackArtistId[i]);
             console.info(spotifyTrackArtistThumb[i]);
             console.info(spotifyTrackArtistName[i]);
             console.groupEnd();
             j++;
           }

           console.log(br1C, br1);
           // Allocating values to all the artists of Track 02.
           j = 0;
           for (i = ((spotifyResult.tracks.items[0].artists).length + (spotifyResult.tracks.items[1].artists).length); i < ((spotifyResult.tracks.items[0].artists).length + (spotifyResult.tracks.items[1].artists).length + (spotifyResult.tracks.items[2].artists).length); i++) {
             spotifyTrackArtistId[i] = spotifyResult.tracks.items[2].artists[j].id;
             await axios.get("https://api.spotify.com/v1/artists/" + spotifyResult.tracks.items[2].artists[j].id, {
               headers: {
                 'Authorization': "Bearer " + req.user.accessToken,
               }
             }).then((resTrackArtistResult) => {
               if ((resTrackArtistResult.data.images).length > 0)
                spotifyTrackArtistThumb[i] = resTrackArtistResult.data.images[2].url;
               else
                spotifyTrackArtistThumb[i] = "./img/defaults/artist" + (i + 10) + ".png";
             })

             spotifyTrackArtistName[i] = he.decode(spotifyResult.tracks.items[2].artists[j].name);

             console.groupCollapsed("\x1b[32m%s\x1b[0m", "Track 02 Artist 0" + j + ":");
             console.info(spotifyTrackArtistId[i]);
             console.info(spotifyTrackArtistThumb[i]);
             console.info(spotifyTrackArtistName[i]);
             console.groupEnd();
             j++;
           }
         }

         // Allocating values to 4 artists if the user searches by Artist name. I.e., results matching query value.
         // Values are allocated only if the values exist.
         if ((spotifyResult.artists.items).length > 0) {
           console.log("\n");
           for (i = 0; i < (spotifyResult.artists.items).length; i++) {
             spotifyQueryArtistId[i] = spotifyResult.artists.items[i].id;

            // Some artists do not have a user photo.
             if ((spotifyResult.artists.items[i].images).length > 0)
               spotifyQueryArtistThumb[i] = spotifyResult.artists.items[i].images[2].url;
             else
              spotifyQueryArtistThumb[i] = "./img/defaults/artist" + (i + 15) + ".png";

             spotifyQueryArtistName[i] = he.decode(spotifyResult.artists.items[i].name);

             console.groupCollapsed("\x1b[32m%s\x1b[0m", "Query Artist 0" + i + ":");
             console.info(spotifyQueryArtistId[i]);
             console.info(spotifyQueryArtistThumb[i]);
             console.info(spotifyQueryArtistName[i]);
             console.groupEnd();
           }
         }

         // Removing redundant artists from spotifyTrackArtist_ and adding the unique values to spotifyTrackArtistIdUnique.
         // This is being done, because same artist was being displayed in the 'Artists' secction.
         if ((spotifyResult.tracks.items).length > 0) {
           console.log("\n");
           spotifyUniqueTrackArtistId = removeDuplicatesFromResults(spotifyTrackArtistId);
           spotifyUniqueTrackArtistThumb = removeDuplicatesFromResults(spotifyTrackArtistThumb);
           spotifyUniqueTrackArtistName = removeDuplicatesFromResults(spotifyTrackArtistName);
           console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Track Artists (ID):");
           console.info("\x1b[37m" + spotifyUniqueTrackArtistId + "\x1b[0m");
           console.groupEnd();
           console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Track Artists (Thumbnail):");
           console.info("\x1b[37m" + spotifyUniqueTrackArtistThumb + "\x1b[0m");
           console.groupEnd();
           console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Track Artists (Name):");
           console.info("\x1b[37m" + spotifyUniqueTrackArtistName + "\x1b[0m");
           console.groupEnd();
         }

         if ((spotifyResult.artists.items).length > 0) {
           console.log("\n");
           spotifyUniqueQueryArtistId = compareAndRemove(spotifyQueryArtistId, spotifyUniqueTrackArtistId);
           spotifyUniqueQueryArtistThumb = compareAndRemove(spotifyQueryArtistThumb, spotifyUniqueTrackArtistThumb);
           spotifyUniqueQueryArtistName = compareAndRemove(spotifyQueryArtistName, spotifyUniqueTrackArtistName);
           console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Query Artists (ID):");
           console.info("\x1b[37m" + spotifyUniqueQueryArtistId + "\x1b[0m");
           console.groupEnd();
           console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Query Artists (Thumbnail):");
           console.info("\x1b[37m" + spotifyUniqueQueryArtistThumb + "\x1b[0m");
           console.groupEnd();
           console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Query Artists (Name):");
           console.info("\x1b[37m" + spotifyUniqueQueryArtistName + "\x1b[0m");
           console.groupEnd();
         }

         // Providing album, if the user searches by Track name. (Or artist name.)
         // Allocating value to Album 00 of Track 00. This particular value is being alloted in 0th place of this array.
         // QueryArtists are all unique.
         // Values are allocated only if the values exist.
         if ((spotifyResult.tracks.items).length > 0) {
           console.log(br2C, br2);
           spotifyAlbumId[0] = spotifyResult.tracks.items[0].album.id;

           if ((spotifyResult.tracks.items[0].album.images).length > 0) {
              spotifyAlbumThumb[0] = spotifyResult.tracks.items[0].album.images[2].url;
           } else {
              spotifyAlbumThumb[0] = "./img/defaults/album0.png";
           }

           spotifyAlbumName[0] = he.decode(spotifyResult.tracks.items[0].name);
           spotifyTrackAlbumArtist[0] = he.decode(spotifyResult.tracks.items[0].album.artists[0].name);
           /* This is commented because, compareAndRemove naturally removed the same artist, for everytime same artist was returned for the same album.
            For e.g., See You Again and Summer Throwback are both returned in results and they both have 'Wiz Khalife as the Artist.
            He was being comaparedAndRemoved twice. This resulted in mismatched ordering of artists from the other arrays.
          */
           console.groupCollapsed("\x1b[32m%s\x1b[0m", "[00] Track 00 Album 00:");
           console.info("\x1b[37m" + spotifyAlbumId[0] + "\x1b[0m");
           console.info("\x1b[37m" + spotifyAlbumThumb[0] + "\x1b[0m");
           console.info("\x1b[37m" + spotifyAlbumName[0] + "\x1b[0m");
           // console.info("\x1b[37m" + spotifyAlbumArtist[0] + "\x1b[0m");
           console.groupEnd();
         }


         // Allocating value to Album 00 of Track 01. This particular value is being alloted in 1st place of this array.
         // This album would be shown only if the album ID of track 00 and track 02 are unequal. This logic would be implemented in EJS file.
         // Values are allocated only if the values exist.
         if ((spotifyResult.tracks.items).length > 1) {
           spotifyAlbumId[1] = spotifyResult.tracks.items[1].album.id;

           if ((spotifyResult.tracks.items[1].album.images).length > 0)
            spotifyAlbumThumb[1] = spotifyResult.tracks.items[1].album.images[2].url;
           else
            spotifyTrackThumb[1] = "./img/defaults/album01.png";

           spotifyAlbumName[1] = he.decode(spotifyResult.tracks.items[1].album.name);
           spotifyTrackAlbumArtist[1] = he.decode(spotifyResult.tracks.items[1].album.artists[0].name);
           console.groupCollapsed("\x1b[32m%s\x1b[0m", "[01] Track 01 Album 00:");
           console.info("\x1b[37m" + spotifyAlbumId[1] + "\x1b[0m");
           console.info("\x1b[37m" + spotifyAlbumThumb[1] + "\x1b[0m");
           console.info("\x1b[37m" + spotifyAlbumName[1] + "\x1b[0m");
           // console.info("\x1b[37m" + spotifyAlbumArtist[1] + "\x1b[0m");
           console.groupEnd();
         }


         // Providing album, if the user searches by album name. (Or artist name.)
         // Allocating value to 4 Albums that match the queryValue.
         // '1' is 'added' in the condition below, because we are aiming for i(max.) = 5. As per API URL, (spotifyResult.albums.items).length = 4.
         // If we add '1' to this '4', we would achieve the max. 'i'. To change this value in future, we would need to modify '+1' as per requirement.
         // We are doing 'i-2' because, we want to store the value of 'first' album item in spotifyAlbum_[2].
         if ((spotifyResult.albums.items).length > 0) {
           console.log("\n");
           for (i = 2; i <= ((spotifyResult.albums.items).length) + 1; i++) {
             spotifyAlbumId[i] = spotifyResult.albums.items[i - 2].id;

             if ((spotifyResult.albums.items[i - 2].images).length > 0)
              spotifyAlbumThumb[i] = spotifyResult.albums.items[i - 2].images[2].url;
             else
              spotifyAlbumThumb[i] = "./img/defaults/album" + (i + 2) + ".png";

             spotifyAlbumName[i] = he.decode(spotifyResult.albums.items[i - 2].name);
             spotifyQueryAlbumArtist[i - 2] = he.decode(spotifyResult.albums.items[i - 2].artists[0].name);

             console.groupCollapsed("\x1b[32m%s\x1b[0m", "[0" + i + "] " + "Top Result 0" + (i - 2) + " Album:");
             console.info("\x1b[37m" + spotifyAlbumId[i] + "\x1b[0m");
             console.info("\x1b[37m" + spotifyAlbumThumb[i] + "\x1b[0m");
             console.info("\x1b[37m" + spotifyAlbumName[i] + "\x1b[0m");
             // console.info("\x1b[37m" + spotifyAlbumArtist[i] + "\x1b[0m");
             console.groupEnd();
           }

           // Removing redundant albums.
           spotifyUniqueAlbumId = removeDuplicatesFromResults(spotifyAlbumId);
           spotifyUniqueAlbumThumb = removeDuplicatesFromResults(spotifyAlbumThumb);
           spotifyUniqueAlbumName = removeDuplicatesFromResults(spotifyAlbumName);

           /*
            We need all the _AlbumArtists to maintain order. Hence, this is commented.
            spotifyUniqueTrackAlbumArtist = await removeDuplicatesFromResults(spotifyTrackAlbumArtist);
            spotifyUniqueQueryAlbumArtist = await removeDuplicatesFromResults(spotifyQueryAlbumArtist);
          */

           // Following is being done, because we do not want redundant queryAlbumArtists. It goes with the order as well.
           spotifyUniqueQueryAlbumArtist = compareAndRemove(spotifyQueryAlbumArtist, spotifyTrackAlbumArtist);

           spotifyUniqueAlbumArtist = spotifyTrackAlbumArtist.concat(spotifyUniqueQueryAlbumArtist);

           console.log("\n");
           console.groupCollapsed("spotifyTrackAlbumArtist:");
           console.log(spotifyTrackAlbumArtist);
           console.groupEnd();
           console.log("\n");
           console.groupCollapsed("spotifyUniqueQueryAlbumArtist:");
           console.log(spotifyUniqueQueryAlbumArtist);
           console.groupEnd();

           console.log("\n");
           console.groupCollapsed("Unique Album(s) (ID):");
           console.info(spotifyUniqueAlbumId);
           console.groupEnd();
           console.groupCollapsed("Unique Album(s) (Thumbnail):");
           console.info(spotifyUniqueAlbumThumb);
           console.groupEnd();
           console.groupCollapsed("Unique Album(s) (Name):");
           console.info(spotifyUniqueAlbumName);
           console.groupEnd();
           console.groupCollapsed("Unique Album Artist(s) (Name):");
           console.info(spotifyUniqueAlbumArtist);
           console.groupEnd();
         }
        /* Error Handling for Spotify
         // The 'results' named EJS file is rendered and fed in response. The 'required' data is passed into it using the following variable(s).
         // A folder named 'views' has to be in the same directory as "app.js". That folder contains 'results.ejs'.

         if(spotifyTrackId.length > 1 && spotifyUniqueTrackArtistId.length > 1 && spotifyUniqueQueryArtistId.length > 1 && spotifyUniqueAlbumId.length > 1) {
           res.render("noResults", {
             query: query,
             user: req.user
           });
         }
        */
         // else {
           res.render("results", {
             query: query,
             user: req.user,

             ytQueryEjs: ytQueryAppJs,
             ytCoverUniqueEjs: ytCoverUniqueAppJs,
             ytLiveUniqueEjs: ytLiveUniqueAppJs,

             spotifyTrackId: spotifyTrackId,
             spotifyTrackThumb: spotifyTrackThumb,
             spotifyTrackTitle: spotifyTrackTitle,
             spotifyTrackArtist: spotifyTrackArtist,

             spotifyUniqueTrackArtistId: spotifyUniqueTrackArtistId,
             spotifyUniqueTrackArtistThumb: spotifyUniqueTrackArtistThumb,
             spotifyUniqueTrackArtistName: spotifyUniqueTrackArtistName,

             spotifyUniqueQueryArtistId: spotifyUniqueQueryArtistId,
             spotifyUniqueQueryArtistThumb: spotifyUniqueQueryArtistThumb,
             spotifyUniqueQueryArtistName: spotifyUniqueQueryArtistName,

             spotifyAlbumId: spotifyAlbumId,
             spotifyAlbumThumb: spotifyAlbumThumb,
             spotifyAlbumName: spotifyAlbumName,
             // spotifyAlbumArtist: spotifyAlbumArtist,

             spotifyUniqueAlbumId: spotifyUniqueAlbumId,
             spotifyUniqueAlbumThumb: spotifyUniqueAlbumThumb,
             spotifyUniqueAlbumName: spotifyUniqueAlbumName,
             spotifyUniqueAlbumArtist: spotifyUniqueAlbumArtist,
           })
         // }
       }).catch((error) => {
         console.error(error);
         console.log("Status '" + error.response.status + "': " + error.response.statusText);
         // if(error.response.status == 401) {
         //   res.send("Access token expired. Please open the website again and login.")
         // }
       });
   }
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

// The following code until line 1169 is not a part of the original code.
// Make the request for iFrame to spotify via the server. Superagent is used to set headers for the request.
/*
app.get('/spotify-proxy', async (req, res) => {
  try {
    const response = await superagent
        .get(req.query.url)
        .set('User-Agent', DESKTOP_USER_AGENT);
    console.log(`User-Agent: ${req.headers["user-agent"]}`);
    console.log(req.query.url);
    res.send(response.text);
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.error(`Error: Spotify server not found for url ${url}`);
      return res.status(404).send('Spotify server not found');
    } else if (error.code === 'ETIMEDOUT') {
      console.error(`Error: Spotify server timed out for url ${url}`);
      return res.status(408).send('Spotify server timed out');
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`Error: Spotify server refused connection for url ${url}`);
      return res.status(502).send('Spotify server refused connection');
    } else {
      console.error(error);
      return res.sendStatus(500);
    }
  }
  /*
  catch (error) {
    if (error.response) {
      res.status(error.response.status).send(error.response.text);
    } else {
      res.status(500).send(error.message);
    }
  }

})
*/
