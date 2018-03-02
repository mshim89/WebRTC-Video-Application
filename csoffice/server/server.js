const keys = require('../config/keys');
require('./models/user');
require('./passport');
const path = require('path');
var os = require('os');

//MONGOOSE
const mongoose = require('mongoose');
mongoose.connect(keys.mongoURI);
mongoose.connection.once('open', () => {
  console.log('===CONNECTED TO DATABASE===');
});

//EXPRESS
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//PASSPORT
const passport = require('passport');
// initialize passport library to use it (create an instance?) in our app
app.use(passport.initialize());
// authenticate session for passport that we have created (cookieSession in our case)
app.use(passport.session());

//MIDDLEWARE
const cookieSession = require('cookie-session');
//maxAge is how long the cookie can exist before it expires (30 days until expire)
app.use(
  cookieSession({
    name: 'hi im a cookie',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);

app.use('/css', express.static(path.join(__dirname, './../client/css')));
app.use('/js', express.static(path.join(__dirname, './../js')));

require('./routes/authRoutes')(app); //require returns functions from routes file and then immediately invokes the function with the app object

const PORT = process.env.PORT || 3000;
let server = app.listen(PORT, () => console.log('===SERVER LISTENING ON PORT 3000==='));

//SOCKET IO
let socket = require('socket.io');
let io = new socket(server);
//SOCKET CONNECTION
io.on('connection', function(socket) {
  console.log('===SOCKET CONNECTED FROM SERVER.JS===');

  // convenience function to log server messages on the client
  // function log() {
  //   var array = ['Message from server:'];
  //   array.push.apply(array, arguments);
  //   socket.emit('log', array);
  // }

  // socket.on('message', function(message) {
  //   log('Client said: ', message);
  //   // for a real app, would be room-only (not broadcast)
  //   socket.broadcast.emit('message', message);
  // });

  // socket.on('create or join', function(room) {
  //   log('Received request to create or join room ' + room);

  //   var clientsInRoom = io.sockets.adapter.rooms[room];
  //   var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
  //   log('Room ' + room + ' now has ' + numClients + ' client(s)');

  //   if (numClients === 0) {
  //     socket.join(room);
  //     log('Client ID ' + socket.id + ' created room ' + room);
  //     socket.emit('created', room, socket.id);
  //   } else if (numClients === 1) {
  //     log('Client ID ' + socket.id + ' joined room ' + room);
  //     io.sockets.in(room).emit('join', room);
  //     socket.join(room);
  //     socket.emit('joined', room, socket.id);
  //     io.sockets.in(room).emit('ready');
  //   } else {
  //     // max two clients
  //     socket.emit('full', room);
  //   }
  // });

  // socket.on('ipaddr', function() {
  //   var ifaces = os.networkInterfaces();
  //   for (var dev in ifaces) {
  //     ifaces[dev].forEach(function(details) {
  //       if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
  //         socket.emit('ipaddr', details.address);
  //       }
  //     });
  //   }
  // });

  // socket.on('bye', function() {
  //   console.log('received bye');
  // });
});
