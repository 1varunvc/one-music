const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;
const keys = require("./keys");
const User = require("../models/user-model");

// Creating cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
})

// Acccessing the created cookie
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  })
})

passport.use(
  new SpotifyStrategy({
    // Options for Spotify Strategy
    clientID: keys.spotify.clientID,
    clientSecret: keys.spotify.clientSecret,
    callbackURL: "/auth/spotify/redirect"
  }, (accessToken, refreshToken, expires_in, profile, done) => {
    // Passport callback function
    console.log("Reached Passport callback function, inside of 'passport-setup.js'.");

    // Check if user already exists in our database or if there is need to create a new one.
    User.findOneAndUpdate({
        spotifyId: profile.id
      }, {
        $set: {
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      }, {
        new: true,
        useFindAndModify: false
      }).then((existingUser) => {
        if (existingUser) {
          console.log("User already exists in database. Latest record:");
          console.log(existingUser);
          done(null, existingUser);
        } else {
          new User({
            displayName: profile.displayName,
            email: profile._json.email,
            spotifyId: profile.id,
            accessToken: accessToken,
            refreshToken: refreshToken
          }).save().then((newUser) => {
            console.log("New user created:");
            console.log(newUser);
            done(null, newUser);
          }).catch((err) => {
            console.log("Error occured: " + err);
          })
        }
      })
  })
)
