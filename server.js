if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

require('babel-register')({
  presets: ['react'],
});


// Loads Express and creates app object
const express = require('express');

const app = express();

// Loads path
const path = require('path');

// Loads Body parser
const bodyParser = require('body-parser');

// Loads react libraries
const React = require('react');
const ReactDOMServer = require('react-dom/server');

// Loads less middleware
const lessMiddleware = require('less-middleware');

// Loads request library
// const request = require('request')

// Loads passport for authentication
const passport = require('passport');

const flash = require('connect-flash');

// Request logger
const morgan = require('morgan');

const cookieParser = require('cookie-parser');

const session = require('express-session');

// File and folder finding module
const find = require('find');

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for authentication)
app.use(bodyParser()); // get information from html forms

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

// Here is where we load the api routes. We put them here so passport deserializer
// is not called everytime we make an api call to them
require('./config/api.js')(app);

// Sets less middleware
app.use(lessMiddleware('/less', {
  dest: '/css',
  pathRoot: path.join(__dirname, 'public'),
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sets public directory
app.use(express.static(`${__dirname}/public`));

require('./config/passport')(passport); //  pass passport for configuration

// required for passport
const session_secret = process.env.SESSION_SECRET !== undefined ? process.env.SESSION_SECRET : 'undefined';
app.use(session({ secret: session_secret }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Sets get routes. Files are converted to react elements
find.fileSync(/\.js$/, `${__dirname}/controllers`).forEach((file) => {
  require(file)(app, passport, React, ReactDOMServer);
});


// The following routes any invalid routes black to the root page
app.get('/*', (req, res) => {
  req.flash('errorMessage', 'Invalid route');
  res.redirect('/');
});

// Tells server to listen to port 4000 when app is initialized
app.listen(4000, () => {
  console.log('Gravity app running on port 4000');
});
