const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20")
const LocalStrategy = require('passport-local').Strategy
const User = require("../models/user-model.js")

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/auth/google/redirect",
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id }).then((foundUser) => {
        // console.log(profile._json.email)
        if (foundUser) {
          //console.log("this user already exists " + foundUser);
          done(null, foundUser);
        } else {
          // console.log(profile)
          new User({
            username: profile.displayName,
            googleId: profile.id,
            thumbnail: profile._json.picture,
            email: profile._json.email
          })
            .save()
            .then((newlyCreatedUser) => {
              //console.log("you have created  " + newlyCreatedUser);
              done(null, newlyCreatedUser);
            }).catch((err) => console.log(err))
        }
      })
    }
  )
)
