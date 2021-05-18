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
  const apiKey = "{API_KEY}"
  const url = "https://www.googleapis.com/youtube/v3/search?key=" + apiKey + "&part=snippet&q=" + query + "&maxResults=1&order=relevance&type=video";

  https.get(url, (response) => {
    const chunks = []
    response.on('data', (d) => {
      chunks.push(d)
    })

    response.on('end', () => {
      var result = JSON.parse((Buffer.concat(chunks).toString()))
      console.log(result)


      var videoId0 = result.items[0].id.videoId;
      console.log("Fetched value: " + videoId0);

      res.render("results", {
        iFrameVideoId0: videoId0
      });
      console.log("Rendered value to be sent: " + videoId0);

    });
  });
});

app.listen(3000, function() {
  console.log("Server is running on port 3000.")
});
