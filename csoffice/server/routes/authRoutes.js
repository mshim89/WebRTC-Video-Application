const passport = require('passport');
const path = require('path');
//exports into index.js
module.exports = app => {
  //whenever a user comes to this route (/auth/google) we want to kick them into our Oath flow which is being managed by passport
  //hey passport, attempt to authenticate the user coming through the /auth/google route and use the strategy called 'google'
  //GoogleStrategy has an internal identifer of 'google' and thats how passport knows how to take the string 'google' and go and find its corresponding strategy which in this case is GoogleStrategy
  //the second argument is an options object (scope) that specifies to the actual google servers what access we want to have inside of the users profile.. in this case the users profile and email
  //the 2 strings.. 'profile' and 'email' are not made up. google has an internal list of scopes/permissions that we can use to get access to a users information

  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  //instead of putting logic in the second argument to say "take the code and exchange for some information like profile and email", passport (googlestrategy) will handle this for us
  //when a user gets sent back to '/auth/google/callback', inside the url the user will now have a code
  //when the user visit this route they will have the code
  //googlestrategy is going to take the code and exchange for the user profile

  //whenever a user comes to this route we are passing them to passport.authenticate (middleware)
  //take request in and now tell the response to inform the browser to go to other route

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/landing.html'));
  });

  // app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
  //   res.sendFile(path.join(__dirname, '../../client/landing.html'));
  // });

  app.get('/api/logout', (req, res) => {
    req.logout();
    res.sendFile(path.join(__dirname, '../../client/index.html'));
  });

  // app.get('/api/current_user', (req, res) => {
  //   res.send(req.user);
  // });
};
