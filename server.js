if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

require('babel-register')({
    presets: ['react']
});

//Loads Express and creates app object
const express = require('express');
const app = express();

//Loads path
var path = require("path");

//Loads Body parser
var bodyParser = require('body-parser');

//Loads react libraries
const React = require('react');
const ReactDOMServer = require('react-dom/server');

//Loads less middleware
const lessMiddleware = require('less-middleware');

//Loads request library
var request = require('request');


//Loads mongoose for data modeling
//var mongoose = require('mongoose');

//Loads passport for authentication
var passport = require('passport');

var flash = require('connect-flash');

//Request logger
var morgan = require('morgan');

var cookieParser = require('cookie-parser');

var session = require('express-session');

//var configDB = require('./config/database.js');

//File and folder finding module
const find = require("find");


//configuration
//mongoose.connect(configDB.url); //Connects to our database

require('./config/passport')(passport); //pass passport for configuration

app.use(morgan('dev')); //log every request to the console
app.use(cookieParser()); //read cookies (needed for authentication)
app.use(bodyParser()); //get information from html forms

//Here is where we load the api routes. We put them here so passport deserializer is not called everytime we make an api call to them
require('./config/api.js')(app);


//Sets public directory
app.use(express.static(__dirname + '/public'));
//app.use(express.static(path.join(__dirname, 'public')));
//required for passport
var session_secret = process.env.SESSION_SECRET != undefined ? process.env.SESSION_SECRET : 'undefined';
app.use(session({ secret: session_secret }));
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions
app.use(flash()); //use connect-flash for flash messages stored in session

//Sets get routes. Files are converted to react elements

//require('./config/routes.js')(app, passport, React, ReactDOMServer);

//Sets get routes. Files are converted to react elements
find.fileSync(/\.js$/, __dirname + '/controllers').forEach((file) => {
    require(file)(app, passport, React, ReactDOMServer);
});


//The following routes any invalid routes black to the root page
app.get('/*',  (req, res) => {
    var flash = require('connect-flash');

    var messages = req.session.flash;
    req.session.flash = null;

    req.flash('errorMessage','Invalid route');

    res.redirect('/');

});

//Sets less middleware
app.use(lessMiddleware('/less', {
    dest: '/css',
    pathRoot: path.join(__dirname, 'public')
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Tells server to listen to port 4000 when app is initialized
app.listen(4000, function() {
    console.log('App running on port 4000');
    //console.log(process.env);
});
