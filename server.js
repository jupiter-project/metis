const kue = require('kue');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

require('babel-register')({
  presets: ['react'],
});


// Loads Express and creates app object
const express = require('express');

const app = express();
const port = process.env.PORT || 4000

// Loads job queue modules and variables

const jobs = kue.createQueue({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379',
  },
});

// Loads path
// const path = require('path');

// Loads Body parser
const bodyParser = require('body-parser');

// Loads react libraries
const React = require('react');
const ReactDOMServer = require('react-dom/server');

// Loads request library
// const request = require('request')

// Loads passport for authentication
const passport = require('passport');

const flash = require('connect-flash');

// Request logger
const morgan = require('morgan');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

// File and folder finding module
const find = require('find');

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for authentication)
app.use(express.urlencoded({ extended: true })) // get information from html forms

app.use((req, res, next) => {
  if (req.url !== '/favicon.ico') {
    return next();
  }
  res.status(200);
  res.header('Content-Type', 'image/x-icon');
  res.header('Cache-Control', 'max-age=4294880896');
  res.end();
  return null;
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Here is where we load the api routes. We put them here so passport deserializer
// is not called everytime we make an api call to them
require('./config/api.js')(app);

// Sets public directory
app.use(express.static(`${__dirname}/public`));

// required for passport
const sessionSecret = process.env.SESSION_SECRET !== undefined ? process.env.SESSION_SECRET : 'undefined';
const sslOptions = {};
if (process.env.CERTFILE) { // Set the certificate file
  sslOptions.cert = fs.readFileSync(`${__dirname}/${process.env.CERTFILE}`);
}
if (process.env.KEYFILE) { // set the key file
  sslOptions.key = fs.readFileSync(`${__dirname}/${process.env.KEYFILE}`);
}

// Create a session middleware with the given options.
// @see https://www.npmjs.com/package/express-session
app.use(session({
  secret: sessionSecret,
  saveUninitialized: true,
  resave: false,
  store: new RedisStore({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379',
  }),
  // @see https://stackoverflow.com/questions/16434893/node-express-passport-req-user-undefined
  cookie: { secure: (sslOptions.length) }, // use secure cookies if SSL env vars are present
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// If both cert and key files env vars exist use https, 
// otherwise use http
const server = Object.keys(sslOptions).length >= 2
  ? require('https').createServer(sslOptions, app)
  : require('http').createServer(app);
// Enables websocket
const io = require('socket.io').listen(server);


// require('./config/passport')(passport, jobs, io); //  pass passport for configuration
const { serializeUser, deserializeUser, metisSignup, metisLogin } = require('./config/passport');
serializeUser(passport); //  pass passport for configuration
deserializeUser(passport); //  pass passport for configuration
metisSignup(passport); //  pass passport for configuration
metisLogin(passport, jobs, io); //  pass passport for configuration

// Sets get routes. Files are converted to react elements
find.fileSync(/\.js$/, `${__dirname}/controllers`).forEach((file) => {
  require(file)(app, passport, React, ReactDOMServer, jobs);
});

// Route any invalid routes black to the root page
app.get('/*', (req, res) => {
  req.flash('errorMessage', 'Invalid route');
  res.redirect('/');
});

// Gravity call to check app account properties
const { gravity } = require('./config/gravity');

gravity.getFundingMonitor()
  .then(async (monitorResponse) => {
    const { monitors } = monitorResponse;
    if (monitors.length === 0) {
      console.log('Funding property not set for app. Setting it now...');
      const fundingResponse = await gravity.setFundingProperty({
        passphrase: process.env.APP_ACCOUNT,
      });

      console.log(`Jupiter response: ${JSON.stringify(fundingResponse)}`);
    }
  });

// Worker methods
const RegistrationWorker = require('./workers/registration.js');
// const TransferWorker = require('./workers/transfer.js');


const registrationWorker = new RegistrationWorker(jobs, io);
// registrationWorker.reloadActiveWorkers('completeRegistration')
//   .catch((error) => { if (error.error) console.log(error.message); });
// const transferWorker = new TransferWorker(jobs);

jobs.process('completeRegistration', (job, done) => {
  registrationWorker.checkRegistration(job.data, job.id, done);
});

/* jobs.process('fundAccount', (job, done) => {
  transferWorker.fundAccount(job.data, job.id, done);
}); */

io.sockets.on('connection', (socket) => {
  socket.emit('connected');
});

// Tells server to listen to port 4000 when app is initialized
server.listen(port, () => {
  console.log('')
  console.log('_________________________________________________________________')
  console.log(' ▄▄       ▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄ ') 
  console.log('▐░░▌     ▐░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌') 
  console.log('▐░▌░▌   ▐░▐░▌▐░█▀▀▀▀▀▀▀▀▀  ▀▀▀▀█░█▀▀▀▀  ▀▀▀▀█░█▀▀▀▀ ▐░█▀▀▀▀▀▀▀▀▀ ') 
  console.log('▐░▌▐░▌ ▐░▌▐░▌▐░▌               ▐░▌          ▐░▌     ▐░▌          ')
  console.log('▐░▌ ▐░▐░▌ ▐░▌▐░█▄▄▄▄▄▄▄▄▄      ▐░▌          ▐░▌     ▐░█▄▄▄▄▄▄▄▄▄ ')
  console.log('▐░▌  ▐░▌  ▐░▌▐░░░░░░░░░░░▌     ▐░▌          ▐░▌     ▐░░░░░░░░░░░▌')
  console.log('▐░▌   ▀   ▐░▌▐░█▀▀▀▀▀▀▀▀▀      ▐░▌          ▐░▌      ▀▀▀▀▀▀▀▀▀█░▌')
  console.log('▐░▌       ▐░▌▐░▌               ▐░▌          ▐░▌               ▐░▌')
  console.log('▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄▄▄      ▐░▌      ▄▄▄▄█░█▄▄▄▄  ▄▄▄▄▄▄▄▄▄█░▌')
  console.log('▐░▌       ▐░▌▐░░░░░░░░░░░▌     ▐░▌     ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌')
  console.log(' ▀         ▀  ▀▀▀▀▀▀▀▀▀▀▀       ▀       ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀ ')
  console.log('_________________________________________________________________')
  console.log('')
  console.log(`Metis version ${process.env.VERSION} is now running on port ${port} 🎉`);
  console.log(`Jupiter Node running on ${process.env.JUPITERSERVER}`);
});

kue.app.listen(4001, () => {
  console.log('Job queue server running on port 4001');
});
