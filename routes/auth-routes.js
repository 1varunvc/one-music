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

module.exports = router;
