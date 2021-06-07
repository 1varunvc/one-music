// It is a nodejs, expressjs project.
const express = require("express");

// 'https' is used to fetch response from the API path. It is a native expressjs package and doesn't require us to create a new 'app' letiable.
const https = require("https");

// 'body-parser' is used to access tags from the html file. We'll be using it to access queryValue.
const bodyParser = require("body-parser");

// axios package; to fetch data from search endpoint. This gives data in parsed form.
const axios = require("axios");

// 'node-cron' package is being used to scheduele the refresh of tokens.
// const cron = require('node-cron');

// Importing the instance of .Routes() from auth-routes.
const authRoutes = require("./routes/auth-routes");

// The following makes auth-routes understand the strategy named, "spotify".
const passportSetup = require("./config/passport-setup");

// monogoDb compatible library: mongoose.
const mongoose = require("mongoose");

// To link the keys.
const keys = require("./config/keys");

//
const cookieSession = require("cookie-session");

//
const passport = require("passport");

const User = require("./models/user-model");

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
app.listen(3000, function() {
  console.log("Server is running on port 3000.")
})

// Set-up Cookies
app.use(cookieSession({
  // maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
  maxAge: 60 * 60 * 1000,                 // 1 hour
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

// Spotify Variables
let spotifyResult = "";

let i = 0;
let j = 0;
let k = 0;

let spotifyTrackIdAppJs = [];
let spotifyTrackArtistIdAppJs = [];
let spotifyQueryArtistIdAppJs = [];
let spotifyAlbumIdAppJs = [];

let spotifyTrackArtistIdUniqueAppJs = [];
let spotifyAlbumIdUniqueAppJs = [];

// YouTube Variables
// let i = 0;

let query = "";
let endpoint = "";

let ytQueryResult = "";
let ytCoverResult = "";
let ytLiveResult = "";

let ytQueryAppJs = [];

let ytCoverAppJs = [];
let ytCoverUniqueAppJs = [];

let ytLiveAppJs = [];
let ytLiveUniqueAppJs = [];


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
    userEjs: req.user
  });
});

// Declaring variables for the function 'ytAxiosGetFunc'
let urlOfYtAxiosGetFunc = "";

// This function GETs data, parses it, allocates required values in an array.
async function ytAxiosGetFunc(queryOfYtAxiosGetFunc, maxResultsOfYtAxiosGetFunc) {

  let ytExtractedResult = [];
  urlOfYtAxiosGetFunc = "https://www.googleapis.com/youtube/v3/search?key=" + keys.google.apiKey + "&part=snippet&order=relevance&type=video";

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
      ytExtractedResult[i] = ytResult.items[i].id.videoId;
      // console.log(ytExtractedResult);
    }
    return (ytExtractedResult);
  } catch (e) {
    console.log(e);
  }
}

// The data that server should POST when the POST request is sent by the client, upon entering the search queryValue, in the search bar (form).
app.post("/", async function(req, res) {

  if (!req.user) {
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
      ytCoverUniqueAppJs = compareAndRemove(ytCoverAppJs, ytQueryAppJs);

      console.log("ytCoverUniqueAppJs:");
      console.log(ytCoverUniqueAppJs);
    } else if (query.includes("live") == true) {
      ytCoverAppJs = await ytAxiosGetFunc(query.replace("live", " cover "), 8);
      console.log("ytCoverAppJs:");
      console.log(ytCoverAppJs);

      // Removing redundant values.
      ytCoverUniqueAppJs = compareAndRemove(ytCoverAppJs, ytQueryAppJs);

      console.log("ytCoverUniqueAppJs:");
      console.log(ytCoverUniqueAppJs);
    } else {
      ytCoverAppJs = await ytAxiosGetFunc(query + " cover ", 8);
      console.log("ytCoverAppJs:");
      console.log(ytCoverAppJs);

      // Removing redundant values.
      ytCoverUniqueAppJs = compareAndRemove(ytCoverAppJs, ytQueryAppJs);
      console.log("ytCoverUniqueAppJs:");
      console.log(ytCoverUniqueAppJs);
    }

    // Fetching 'live performances' related to user's query and putting them in the array.
    if (query.includes("live") == true) {
      ytLiveAppJs = await ytAxiosGetFunc(query, 8);
      console.log("ytLiveAppJs:");
      console.log(ytLiveAppJs);

      // Removing redundant values.
      ytLiveUniqueAppJs = compareAndRemove(ytLiveAppJs, ytQueryAppJs.concat(ytCoverUniqueAppJs));

      console.log("ytLiveUniqueAppJs:");
      console.log(ytLiveUniqueAppJs);
    } else if (query.includes("cover") == true) {
      ytLiveAppJs = await ytAxiosGetFunc(query.replace("cover", " live "), 8);
      console.log("ytLiveAppJs:");
      console.log(ytLiveAppJs);

      // Removing redundant values.
      ytLiveUniqueAppJs = compareAndRemove(ytLiveAppJs, ytQueryAppJs.concat(ytCoverUniqueAppJs));

      console.log("ytLiveUniqueAppJs:");
      console.log(ytLiveUniqueAppJs);
    } else {
      ytLiveAppJs = await ytAxiosGetFunc(query + " live ", 8);
      console.log("ytLiveAppJs:");
      console.log(ytLiveAppJs);

      // Removing redundant values.
      ytLiveUniqueAppJs = compareAndRemove(ytLiveAppJs, ytQueryAppJs.concat(ytCoverUniqueAppJs));

      console.log("ytLiveUniqueAppJs:");
      console.log(ytLiveUniqueAppJs);
    }

    // The 'results' named EJS file is rendered and fed in response. The 'required' data is passed into it using the following variable(s).
    res.render("results", {
      userEjs: req.user,
      ytQueryEjs: ytQueryAppJs,
      ytCoverUniqueEjs: ytCoverUniqueAppJs,
      ytLiveUniqueEjs: ytLiveUniqueAppJs
    });
    console.log("Values to be sent for rendering: ");
    console.log(ytQueryAppJs);
    console.log(ytCoverUniqueAppJs);
    console.log(ytLiveUniqueAppJs);

    // Emptying all the arrays.
    ytQueryAppJs.length = 0;

    ytCoverAppJs.length = 0;
    ytCoverUniqueAppJs.length = 0;

    ytLiveAppJs.length = 0;
    ytLiveUniqueAppJs.length = 0;

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
              ytCoverUniqueAppJs = compareAndRemove(ytCoverAppJs, ytQueryAppJs);

              console.log("ytCoverUniqueAppJs:");
              console.log(ytCoverUniqueAppJs);
            } else if (query.includes("live") == true) {
              ytCoverAppJs = await ytAxiosGetFunc(query.replace("live", " cover "), 8);
              console.log("ytCoverAppJs:");
              console.log(ytCoverAppJs);

              // Removing redundant values.
              ytCoverUniqueAppJs = compareAndRemove(ytCoverAppJs, ytQueryAppJs);

              console.log("ytCoverUniqueAppJs:");
              console.log(ytCoverUniqueAppJs);
            } else {
              ytCoverAppJs = await ytAxiosGetFunc(query + " cover ", 8);
              console.log("ytCoverAppJs:");
              console.log(ytCoverAppJs);

              // Removing redundant values.
              ytCoverUniqueAppJs = compareAndRemove(ytCoverAppJs, ytQueryAppJs);
              console.log("ytCoverUniqueAppJs:");
              console.log(ytCoverUniqueAppJs);
            }

            // Fetching 'live performances' related to user's query and putting them in the array.
            if (query.includes("live") == true) {
              ytLiveAppJs = await ytAxiosGetFunc(query, 8);
              console.log("ytLiveAppJs:");
              console.log(ytLiveAppJs);

              // Removing redundant values.
              ytLiveUniqueAppJs = compareAndRemove(ytLiveAppJs, ytQueryAppJs.concat(ytCoverUniqueAppJs));

              console.log("ytLiveUniqueAppJs:");
              console.log(ytLiveUniqueAppJs);
            } else if (query.includes("cover") == true) {
              ytLiveAppJs = await ytAxiosGetFunc(query.replace("cover", " live "), 8);
              console.log("ytLiveAppJs:");
              console.log(ytLiveAppJs);

              // Removing redundant values.
              ytLiveUniqueAppJs = compareAndRemove(ytLiveAppJs, ytQueryAppJs.concat(ytCoverUniqueAppJs));

              console.log("ytLiveUniqueAppJs:");
              console.log(ytLiveUniqueAppJs);
            } else {
              ytLiveAppJs = await ytAxiosGetFunc(query + " live ", 8);
              console.log("ytLiveAppJs:");
              console.log(ytLiveAppJs);

              // Removing redundant values.
              ytLiveUniqueAppJs = compareAndRemove(ytLiveAppJs, ytQueryAppJs.concat(ytCoverUniqueAppJs));

              console.log("ytLiveUniqueAppJs:");
              console.log(ytLiveUniqueAppJs);
            }

/**************************************SPOTIFY**************************************/

    // The user input query. We are using body-parser package here.
    // const query = req.body.queryValue;

    // Follow procedure here to get access_token and refresh_token: https://benwiz.com/blog/create-spotify-refresh-token/
    let searchUrl = "https://api.spotify.com/v1/search?q=" + query + "&type=track%2Calbum%2Cartist&limit=4&market=IN";

    //Using Axios to fetch data. It gets parsed to JSON automatically.
    axios.get(searchUrl, {
        headers: {
          // This user.accessToken gets stored in req, after the completion of oAuth process.
          'Authorization': "Bearer " + req.user.accessToken,
        }
      })
      .then((resAxios) => {

        // console.log(resAxios.data)
        spotifyResult = resAxios.data;

        //Extracting required data from 'result'.

        // Allocating values to Track 00, 01, 02, 03.
        if ((spotifyResult.tracks.items).length > 0) {
          for (i = 0; i < (spotifyResult.tracks.items).length; i++) {
            spotifyTrackIdAppJs[i] = spotifyResult.tracks.items[i].id;
            console.log("Track 0" + i + " ID: " + spotifyTrackIdAppJs[i]);
          }
          console.log("\n");
          console.log("\n");
        }

        // Values are allocated only if the values exist.
        for (k = 0; k < (spotifyResult.tracks.items).length; k++) {
          if ((spotifyResult.tracks.items[k].artists).length > 0) {

            // Allocating values to all the artists of Track 00.
            for (i = 0; i < (spotifyResult.tracks.items[0].artists).length; i++) {
              spotifyTrackArtistIdAppJs[i] = spotifyResult.tracks.items[0].artists[i].id;
              console.log("Track 00 Artist 0" + i + " ID: " + spotifyTrackArtistIdAppJs[i]);
            }
            console.log("\n");

            // Allocating values to all the artists of Track 01.
            j = 0;
            for (i = (spotifyResult.tracks.items[0].artists).length; i < ((spotifyResult.tracks.items[0].artists).length + (spotifyResult.tracks.items[1].artists).length); i++) {
              spotifyTrackArtistIdAppJs[i] = spotifyResult.tracks.items[1].artists[j].id;
              j++;
              console.log("Track 01 Artist 0" + i + " ID: " + spotifyTrackArtistIdAppJs[i]);
            }
            console.log("\n");

            // Allocating values to all the artists of Track 02.
            j = 0;
            for (i = ((spotifyResult.tracks.items[0].artists).length + (spotifyResult.tracks.items[1].artists).length); i < ((spotifyResult.tracks.items[0].artists).length + (spotifyResult.tracks.items[1].artists).length + (spotifyResult.tracks.items[2].artists).length); i++) {
              spotifyTrackArtistIdAppJs[i] = spotifyResult.tracks.items[2].artists[j].id;
              j++;
              console.log("Track 02 Artist 0" + i + " ID: " + spotifyTrackArtistIdAppJs[i]);
            }
            console.log("\n");
          }
        }

        // Allocating values to 4 artists if the user searches by Artist name. I.e., results matching query value.
        // Values are allocated only if the values exist.
        if (spotifyResult.artists.items) {
          for (i = 0; i < (spotifyResult.artists.items).length; i++) {
            spotifyQueryArtistIdAppJs[i] = spotifyResult.artists.items[i].id;
            console.log("Top Query Result 0" + i + " Artist ID: " + spotifyQueryArtistIdAppJs[i]);
          }
          console.log("\n");
        }

        // Removing redundant artists from spotifyTrackArtistIdAppJs and adding the unique values to spotifyTrackArtistIdUniqueAppJs.
        // This is being done, because same artist was being displayed in the 'Artists' secction.
          if ((spotifyResult.tracks.items).length > 0) {
            spotifyTrackArtistIdUniqueAppJs = removeDuplicatesFromResults(spotifyTrackArtistIdAppJs);
            console.log("Unique Track Artists:")
            console.log(spotifyTrackArtistIdUniqueAppJs);
            console.log("\n");
          }
          if (spotifyResult.artists.items) {
            spotifyQueryArtistIdUniqueAppJs = compareAndRemove(spotifyQueryArtistIdAppJs, spotifyTrackArtistIdUniqueAppJs)
          }


        // Providing album, if the user searches by Track name. (Or artist name.)
        // Allocating value to Album 00 of Track 00. This particular value is being alloted in 0th place of this array.
        // QueryArtists are all unique.
        // Values are allocated only if the values exist.
        if ((spotifyResult.tracks.items).length > 0) {
          spotifyAlbumIdAppJs[0] = spotifyResult.tracks.items[0].album.id;
          console.log("Track 00 Album 00 ID: " + spotifyAlbumIdAppJs[0])
          console.log("\n");
        }


        // Allocating value to Album 00 of Track 01. This particular value is being alloted in 1st place of this array.
        // This album would be shown only if the album ID of track 00 and track 02 are unequal. This logic would be implemented in EJS file.
        // Values are allocated only if the values exist.
        if ((spotifyResult.tracks.items).length > 0) {
          spotifyAlbumIdAppJs[1] = spotifyResult.tracks.items[1].album.id;
          console.log("Track 01 Album 00 ID: " + spotifyAlbumIdAppJs[0])
          console.log("\n");
        }

        // Providing album, if the user searches by album name. (Or artist name.)
        // Allocating value to 4 Albums that match the queryValue.
        // '1' is 'added' in the condition below, because we are aiming for i(max.) = 5. As per API URL, (spotifyResult.albums.items).length = 4.
        // If we add '1' to this '4', we would achieve the max. 'i'. To change this value in future, we would need to modify '+1' as per requirement.
        // We are doing 'i-2' because, we want to story the value of 'first' album item in spotifyAlbumIdAppJs[2].

        if ((spotifyResult.albums.items).length > 0) {
          for (i = 2; i <= ((spotifyResult.albums.items).length) + 1; i++) {
            spotifyAlbumIdAppJs[i] = spotifyResult.albums.items[i - 2].id;
            console.log("Top Result 0" + i + " Album ID: " + spotifyAlbumIdAppJs[i]);
          }
          console.log("\n");

          // Removing redundant albums.
          spotifyAlbumIdUniqueAppJs = removeDuplicatesFromResults(spotifyAlbumIdAppJs);
          console.log("Unique Albums:")
          console.log(spotifyAlbumIdUniqueAppJs);
          console.log("\n");
        }


        // The 'results' named EJS file is rendered and fed in response. The 'required' data is passed into it using the following variable(s).
        // A folder named 'views' has to be in the same directory as "app.js". That folder contains 'results.ejs'.
        res.render("results", {
          userEjs: req.user,
          spotifyTrackIdEjs: spotifyTrackIdAppJs,
          spotifyTrackArtistIdUniqueEjs: spotifyTrackArtistIdUniqueAppJs,
          spotifyQueryArtistIdEjs: spotifyQueryArtistIdAppJs,
          spotifyQueryArtistIdUniqueEjs: spotifyQueryArtistIdUniqueAppJs,
          spotifyAlbumIdUniqueEjs: spotifyAlbumIdUniqueAppJs,
          ytQueryEjs: ytQueryAppJs,
          ytCoverUniqueEjs: ytCoverUniqueAppJs,
          ytLiveUniqueEjs: ytLiveUniqueAppJs
        })

        // Emptying all the arrays. Not all the elements are over-ridden in the coming calls.
        // For e.g., a Track with 4 artists, may assign values to first 4 places in the array.
        // If the next query returns a Track with 1 artist, first place will be over-ridden while the next 3 places would keep the previous values which may interfere while showing results.ejs.
        spotifyTrackIdAppJs.length = 0;

        spotifyTrackArtistIdAppJs.length = 0;
        spotifyTrackArtistIdUniqueAppJs.length = 0;

        spotifyQueryArtistIdAppJs.length = 0;
        spotifyQueryArtistIdUniqueAppJs.length = 0;

        spotifyAlbumIdAppJs.length = 0;
        spotifyAlbumIdUniqueAppJs.length = 0;

        ytQueryAppJs.length = 0;

        ytCoverAppJs.length = 0;
        ytCoverUniqueAppJs.length = 0;

        ytLiveAppJs.length = 0;
        ytLiveUniqueAppJs.length = 0;
      })
      .catch((error) => {
        console.error(error)
        // console.log("Error: '" + error.response.status + "': " + error.response.statusText);
        if(error.response.status == 401) {
          res.send("Access token expired. Please open the website again and login.")
        }
      })
  }
});

// //Declaring token.
// let refresh_token = "AQCqYC-HTBM15P3ZYNpD-UnK0mLzQSuBrKJrRqlgXRH-GCBIWP0DeWMkUqCtvv0V1xWrIDBGOxx8No9aDCpE7_tbOx5R1e5WdWEXY-zAzmpjdK8g0dZY6sP7gpVjKBinEq8";
// let authorization = "Basic MWQ4ZjAwZGY4MDc0NDE5N2JiNWMwM2VmMzBkYmRlOGM6NzE4MTNhNTUyZjQzNGYzNDkzYWFlYTExODRmODdhYmU=";
// let access_token = "";
// let token = "Bearer " + access_token;


// // First Comment: The following is probably me following that chubby fella who built a react app for fetching your current devices and stuff.
// let client_id = "1d8f00df80744197bb5c03ef30dbde8c";
// let code = "";
//
// // Requesting authorization from user.
// // For us, this step's aim is to have Spotify recognize the user and play full song instead of the sample 30 seconds.
//
// let authURL = "https://accounts.spotify.com/authorize?client_id=1d8f00df80744197bb5c03ef30dbde8c&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&scope=user-read-playback-state%20app-remote-control%20user-modify-playback-state%20user-read-currently-playing%20user-read-playback-position%20user-read-email%20streaming"
//
// app.post("/", function(req, res) {
//   res.redirect(authURL);
// });

// function onPageLoad() {
//   if (window.location.search.length > 0) {
//     handleRedirect();
//   }
// }
//
// function handleRedirect() {
//   code = getCode();
// }
//
// function getCode() {
//   code = null;
//   const queryString = window.location.search;
//   if ( queryString.length > 0) {
//     const urlParams = new urlSearchParams(queryString);
//     code = urlParams.get('code');
//   }
//   return code;
// }
//
// code = getCode();

// // Second Comment: Creating access token and refresh token using 'code'.
// axios({
//   url: "https://accounts.spotify.com/api/token",
//   method: "post",
//   params: {
//     grant_type: "authorization_code",
//     code: code,
//     redirect_uri: "http://localhost:3000/"
//   },
//   headers: {
//     Authorization: authorization,
//     "Accept": "application/json",
//     "Content-Type": "application/x-www-form-urlencoded"
//   }
// }).then(function(response) {
//   // console.log(response.data);
//   // console.log(response.data.access_token);
//   access_token = response.data.access_token;
//   token = "Bearer " + access_token;
//   console.log(token);
// }).catch(function(error) {
//   console.log(error);
// });

// // Third Comment: Creating the first access_token using refresh_token
// axios({
//   url: "https://accounts.spotify.com/api/token",
//   method: "post",
//   params: {
//     grant_type: "refresh_token",
//     refresh_token: refresh_token
//   },
//   headers: {
//     Authorization: authorization,
//     "Accept": "application/json",
//     "Content-Type": "application/x-www-form-urlencoded"
//   }
// }).then(function(response) {
//   // console.log(response.data);
//   // console.log(response.data.access_token);
//   access_token = response.data.access_token;
//   token = "Bearer " + access_token;
//   console.log(token);
// }).catch(function(error) {
//   console.log(error);
// });
//
// // Refreshing access_token, 59th minute of every hour. E.g., 04:59, 15:59.
// // It is irrespective of the starting time of the server. I.e., if the server starts at 04:15, the following code would run at 04:59.
// cron.schedule('*/59 * * * *', () => {
//   axios({
//     url: "https://accounts.spotify.com/api/token",
//     method: "post",
//     params: {
//       grant_type: "refresh_token",
//       refresh_token: refresh_token
//     },
//     headers: {
//       Authorization: authorization,
//       "Accept": "application/json",
//       "Content-Type": "application/x-www-form-urlencoded"
//     }
//   }).then(function(response) {
//     // console.log(response.data);
//     // console.log(response.data.access_token);
//     access_token = response.data.access_token;
//     token = "Bearer " + access_token;
//     console.log(token);
//   }).catch(function(error) {
//     console.log(error);
//   });
// });
