const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

var videoId0 = "";
var result = "";

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", function(req, res) {
  const query = req.body.queryValue;
  const apiKey = "AIzaSyC5asO20CAohIW_wEkgJB0XHVH4bOZSN5U"
  const url = "https://www.googleapis.com/youtube/v3/search?key=" + apiKey + "&part=snippet&q=" + query + "&maxResults=1&order=relevance&type=video";

  https.get(url, (response) => {
    const chunks = []
    response.on('data', (d) => {
      chunks.push(d)
    })

    response.on('end', () => {
      var result = JSON.parse((Buffer.concat(chunks).toString()))
      console.log(result)


      var ytVideoIdAppJs00 = result.items[0].id.videoId;
      console.log("Fetched value: " + ytVideoIdAppJs00);

      res.render("results", {
        ytVideoIdEjs00: ytVideoIdAppJs00
      });
      console.log("Value to be used in rendered file: " + ytVideoId00);
    });
  });
});

app.listen(3000, function() {
  console.log("Server is running on port 3000.")
});
