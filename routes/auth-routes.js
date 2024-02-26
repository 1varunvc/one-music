const router = require("express").Router();
const passport = require("passport");
// const cron = require("node-cron");

// We don't need the following.
// // Login Choices Page
// router.get("/", (req, res) => {
//   res.render("");
// });

// Authenticating Logout
router.get("/logout", (req,res) => {
  req.logout();
  res.redirect("/");
});

// Authorize with Spotify
router.get("/spotify", passport.authenticate("spotify", {
  scope: ["user-read-email"]
}));

// Callback URI for Spotify to redirect to
router.get("/spotify/redirect", passport.authenticate("spotify"), (req, res) => {
  // res.send("You have reached the callback URI. " + req.user);
  res.redirect("/");
})

/* The following code was not here originally until line 58.
const puppeteer = require('puppeteer');

// Callback URI for Spotify to redirect to
router.get("/spotify/redirect", (req, res, next) => {
  // Log the headers of the GET request to Spotify authorization page
  console.log("1111" + req.headers["set-cookie"]);

  passport.authenticate("spotify")(req, res, () => {
    // res.send("You have reached the callback URI. " + req.user);
    // console.log("2222" + req.headers["cookie"]);
    res.redirect("/");
    captureOAuthCookies();
  });
});

async function captureOAuthCookies() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Get the current URL of the user's browser
  await page.goto("http://localhost:3000/");

  // Capture the cookies created by the OAuth provider
  const cookies = await page.cookies('https://accounts.spotify.com');
  console.log("@@@@@@@@@@@@@@@@@@")
  console.log(cookies);

  await browser.close();
}
 */

module.exports = router;
