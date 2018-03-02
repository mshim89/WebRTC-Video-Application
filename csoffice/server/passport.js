const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');
const User = mongoose.model('users');
//user is our model class that holds the collection and now can assign model instances to the model class
//one argument means were trying to fetch something out of mongoose

//user is the user model instance and turned it into id
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//taking id and turning it back into a mongoose model instance and then call done after we get it
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

//creates a new instance of new googlestrategy.
//passport.use.. passport i want you to be aware that a new strategy available
//understand that users can use this to authenticate themselves inside our application
//https://console.developers.google.com
//sign up for google+ api

//MAKE SURE TO USE CAPITAL ID
//bring in the keys from the keys.js folder and assign them to two objects
passport.use(
  //my name is 'google'
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleID: profile.id });
      if (existingUser) {
        console.log('===EXISTING USER IN DB=== ', existingUser);
        return done(null, existingUser);
      }
      const user = await new User({ googleID: profile.id }).save();
      done(null, user);
    }
  )
);

//save takes the record, the model instance, and save it to the DB for us
