//This files handles the app's different pages and how they are routed by the system

module.exports = function(app, passport, React, ReactDOMServer) {
    var bcrypt = require('bcrypt-nodejs');
    var session = require('express-session');
    var flash = require('connect-flash');
    var Queue = require('bull');
    var controller = require('../config/controller.js');
    //===========================================================
    // This constains constants needed to connect with Jupiter
    //===========================================================
    var axios = require('axios');
    //Loads Gravity module
    var gravity = require('../config/gravity.js');
    var page;

    app.get('/test', function(req, res) {
        res.send({success: true});
    });

    //Session variable setup
    //app.use(session({ secret: process.env.SESSION_SECRET }));
    //var sess;

    //===============================================================================
    // SIGNIN PAGE
    //===============================================================================
    app.get('/login', (req, res) => {
        var messages = req.session.flash;
        req.session.flash = null;
        //Loads file with Login page
        const LoginPage = require('../views/login.jsx');

        page = ReactDOMServer.renderToString(
            React.createElement(LoginPage, {
                name: 'Gravity - Login to your account',
                dashboard: false,
                messages: messages
            })
        );


        res.send(page);
    });

    //===============================================================================
    // SIGNUP
    //===============================================================================

    app.get('/signup', (req, res) => {
        var messages = req.session.flash;
        req.session.flash = null;
        //Loads file with Signup page
        const SignupPage = require('../views/signup.jsx');

        page = ReactDOMServer.renderToString(
            React.createElement(SignupPage, { name: 'Gravity - Create an account', dashboard: false, messages: messages })
        );
        res.send(page);
    });

    //===============================================================================
    // HOMEPAGE, SETTINGS, POOL, DONATION_CHANGE INVEST_MORE
    //===============================================================================
    app.get('/', controller.isLoggedInIndex, (req, res) => {
        var messages = req.session.flash;
        req.session.flash = null;

        //Loads file with Home page file
        const IndexPage = require('../views/index.jsx');

        page = ReactDOMServer.renderToString(
            React.createElement(IndexPage, { name: 'Gravity - Homepage', user: req.user, dashboard: true, messages: messages })
        );

        res.send(page);
    });

    app.get('/gravity', (req, res) => {
        var messages = req.session.flash;
        req.session.flash = null;

        /*gravity.findById('9099011094759053931', 'user')
            .then(res => {
                console.log(res);
                var User = require('../models/user');
                var user = new User(res.record);
                console.log(user)
            })
            .catch(err => {
                console.log(err);
            });*/

        var requirements = {
            passphrase: process.env.APP_ACCOUNT,
            address: process.env.APP_ACCOUNT_ADDRESS,
            public_key: process.env.APP_PUBLIC_KEY,
            encryption: process.env.SESSION_SECRET != undefined ? process.env.SESSION_SECRET : 'undefined',
            name: process.env.APPNAME
        }

        //Loads gravity setup progress page

        const GravityPage = require('../views/gravity.jsx');

        page = ReactDOMServer.renderToString(
            React.createElement(GravityPage, { name: 'Gravity - Basic Setup', user: req.user, dashboard: false, messages: messages, requirements: requirements })
        );

        res.send(page);
    });

    app.get('/settings', controller.isLoggedIn, (req, res) => {
        var messages = req.session.flash;
        req.session.flash = null;
        //Loads settings page
        const SettingsPage = require('../views/settings.jsx');

        page = ReactDOMServer.renderToString(
            React.createElement(SettingsPage, { name: 'Gravity - Your Settings', user: req.user, dashboard: true, validation: req.session.jup_key, messages: messages })
        );

        res.send(page);

    });

    //=======================================================
    // LOGOUT
    //=======================================================
    app.get('/logout', function(req, res) {
        req.logout();
        req.session.destroy();
        console.log(req.session);
        res.redirect('/');
    });


    //===============================================================================
    // JUPITER CALLS
    //===============================================================================

    app.post('/get_jupiter_account', (req, res) => {
        axios.get(gravity.jupiter_data.server + '/nxt?requestType=getAccountId&secretPhrase=' + req.body.jup_passphrase)
            .then(function(response) {
                //new_account_created = true;
                //bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
                var accountRS = response.data.accountRS;
                res.send({
                    success: true,
                    account: accountRS,
                    accounthash: accountRS,
                    public_key: response.data.publicKey
                });
            })
            .catch(function(error) {
                console.log(error);
                res.send({
                    success: false,
                    message: 'There was an error in verifying the passphrase with the Blockchain'
                });
            });
    });

    //===============================================================================
    // NEW ACCOUNT GENERATION
    //===============================================================================
    app.post('/create_jupiter_account', function(req, res) {
        var events = require('events');
        var eventEmitter = new events.EventEmitter();
        var axios = require('axios');

        res.setHeader('Content-Type', 'application/json');

        var form_data = req.body.account_data;

        var jupiter_account;

        var seedphrase = req.body.account_data.passphrase;

        var new_account_confirmed;

        axios.get(gravity.jupiter_data.server + '/nxt?requestType=getAccountId&secretPhrase=' + seedphrase)
            .then(function(response) {
                //new_account_created = true;
                //bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
                jupiter_account = {
                    account: response.data.accountRS,
                    public_key: response.data.publicKey,
                    accounthash: gravity.encrypt(response.data.accountRS),
                    jup_account_id: response.data.account,
                    email: form_data.email,
                    firstname: form_data.firstname,
                    lastname: form_data.lastname,
                    twofa_enabled: form_data.twofa_enabled
                }

                if (response.data.accountRS == null) {
                    res.send({ success: false, message: 'There was an error in saving the trasaction record', transaction: err });
                } else {
                    res.send({ success: true, message: 'Jupiter account created', account: jupiter_account });

                }
            })
            .catch(function(error) {
                console.log(error);
                res.send({ success: false, message: 'There was an error', error: error })
            });


    });


    //===============================================================================
    // SIGNUP AND LOGIN post calls
    //===============================================================================
    //Signup with immediate login afterwards
    /*app.post('/signup', passport.authenticate('gravity-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));*/

    app.post('/signup',
        passport.authenticate('gravity-signup', { session: false }),
        function(req, res) {
            res.redirect('/login')
        });

    //process the login
    app.post('/login', passport.authenticate('gravity-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,

    }));

    //===============================================================================
    // GET PASSPHRASE
    //===============================================================================
    app.get('/create_passphrase', function(req, res) {
        var seedphrase = gravity.generate_passphrase();

        res.send({ success: true, result: seedphrase, message: 'Passphrase generated' });
    });

}
