// It is a nodejs and expressjs project.
const express = require("express");
// https is used to fetch response from the API path. It is a native expressjs package and doesn't require us to create a new 'app' variable.
const https = require("https");
// body-parser is used to access tags from the html file. We'll be using it to access queryValue.
const bodyParser = require("body-parser");

// This app constant is created to be able to access the menthods available in 'express' package.
const app = express();

// 'urlencoded' helps access html data. Other data formats could JSON etc.
// body-parser required as to exclusively define "extended: true" although this is no use to us.
app.use(bodyParser.urlencoded({extended: true}));

// This sets a static directory to look for source files like css, js, img. These file links are mentioned in html or ejs files.
// A folder named 'public' has to be in the same directory as "app.js". The source files are stored here.
app.use(express.static("public"));

// ejs view engine has been used to use app.js variables into the output ejs file.
app.set('view engine', 'ejs');

// Variables to store the data fetched from API endpoint.
var ytVideoIdAppJs00 = "";
var result = "";

// The page to load when the browser (client) makes request to GET something from the server on "/", i.e., from the homepage.
// This GET request is made as soon as the homepage url is entered in the address bar od browser, automatically.
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

// The data that server should POST when the POST request is sent by the client, upon entering the search queryValue, in the search bar (form).
app.post("/", function(req, res) {
  // The constants used for https.get method.
  const query = req.body.queryValue;                          // The user input query. We are using body-parser package here.
  const apiKey = "AIzaSyC5asO20CAohIW_wEkgJB0XHVH4bOZSN5U"    // This API key is easy to gerenate. Just go to https://console.cloud.google.com/apis/credentials and generate the API credential.
  const url = "https://www.googleapis.com/youtube/v3/search?key=" + apiKey + "&part=snippet&q=" + query + "&maxResults=1&order=relevance&type=video"; // The endpoint to fetch the data from.

  // Using https package to fetch data (response) from the 'url'. Using arrow function notation.
  https.get(url, (response) => {
    // The fetched data (in HEX) wasn't able to be parsed into JSON. It was giving the error, "SyntaxError: Unexpected end of JSON input"
    // We need to hold onto all the chunks of data recieved 'until' the response has ended. Refer answer https://stackoverflow.com/a/43791288/14597561 available on the page https://stackoverflow.com/questions/43782549/why-can-i-not-parse-the-json-from-youtube-data-api-in-node-js
    const chunks = []
    response.on('data', (d) => {
      chunks.push(d)
    })

    // The response (chunks created) is parsed to JSON. And stored in variable 'result'.
    response.on('end', () => {
      var result = JSON.parse((Buffer.concat(chunks).toString()))
      console.log(result)

      //Extracting required data from 'result'. The following "items[0].id.videoId" is the address of the data that we need from the JSON 'result'.
      var ytVideoIdAppJs00 = result.items[0].id.videoId;
      console.log("Fetched value: " + ytVideoIdAppJs00);

      // The 'results' named EJS file is rendered and fed in response. The 'required' data is passed into it using the following variable(s).
      // A folder named 'views' has to be in the same directory as "app.js". That folder contains 'results.ejs'.
      res.render("results", {
        ytVideoIdEjs00: ytVideoIdAppJs00
      });
      console.log("Value to be used in rendered file: " + ytVideoId00);
    });
  });
});

// Starting the server. Should this be placed at the top of all other commands?
app.listen(3000, function() {
  console.log("Server is running on port 3000.")
});
