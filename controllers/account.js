module.exports = function(app, passport, React, ReactDOMServer) {

    var session = require('express-session');
    var flash = require('connect-flash');
    var Queue = require('bull');
    var controller = require('../config/controller.js');
    var page;

    //===========================================================
    // This constains constants needed to connect with Jupiter
    //===========================================================
    var axios = require('axios');

    //Loads Gravity module
    var gravity = require('../config/gravity.js');

    app.get('/account', controller.isLoggedIn, (req, res) => {
        var messages = req.session.flash;
        req.session.flash = null;

        const AccountPage = require('../views/account.jsx');

        page = ReactDOMServer.renderToString(
            React.createElement(AccountPage, {
                name: 'Gravity - Your Account',
                user: req.user,
                dashboard: true,
                messages: messages,
                public_key: req.session.public_key
            })
        );

        res.send(page);
    });


    app.get('/api/account', controller.isLoggedIn, (req, res) => {

        var account_info;

        gravity.findById(req.user.record.id, 'users', { size: 'last' })
            .then(function(response) {
                var user_info = JSON.parse(response.record.user_record);
                res.send({ success: true, account_info: user_info, message: 'Retrieved account info' })
            })
            .catch(function(error) {
                console.log(error);
                res.send({ success: false, errors: error });
            });

    })


    //===============================================================================
    // UPDATE ACCOUNT INFORMATION
    //===============================================================================
    app.put('/account', (req, res) => {
        //This sets the content-type of response
        res.setHeader('Content-Type', 'application/json');
        var account_response;
        var params = req.body.account;

        var data = req.user.record;
        data.firstname = params.firstname;
        data.lastname = params.lastname;
        data.email = params.email;
        data.public_key = req.session.public_key;

        var User = require('../models/user');
        var user = new User(data);
        //res.send({ success: false, message: 'Information entered did not passed validation' });

        user.update()
            .then(response => {
                res.send({ success: true, message: 'Account info saved to blockchain', record: user.record });
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            })
    });



    //===============================================================================
    // GET PROPERTIES FROM JUPITER BLOCKCHAIN
    //===============================================================================
    app.get('/get_properties', (req, res) => {
        //This sets the content-type of response
        res.setHeader('Content-Type', 'application/json');

        var data = req.body.parameters;

        axios.post(gravity.jupiter_data.server + '/nxt?requestType=getAccountProperties&recipient=' + data.address)
            .then(function(response) {
                if (response.data.errorDescription == null) {
                    res.send({ success: true, message: 'Properties retrieved', properties: response.data.properties, full_response: response.data });
                } else {
                    res.send({ success: false, message: response.data.errorDescription });
                }
            }).catch(function(error) {
                res.send({ success: false, message: 'There was an error', error: error });
            });
    });

    //===============================================================================
    // UPDATE User's api key
    //===============================================================================
    app.post('/update_api_key', (req, res) => {
        var mongoose = require('mongoose');
        const User = require("../models/user");

        User.findById(req.body.id, (err, user) => {
            if (err) {
                console.log(err);
                res.send({ success: false, status: 'error', error: err })
            } else {
                if (user.api.generated_key == req.body.api_key) {
                    user.api.generated_key = user.generateKey();
                    user.save((err, user) => {
                        if (err) {
                            console.log(err);
                            res.send({ success: false, status: 'error', error: err })
                        }
                        res.send({ success: true, status: 'success', api_key: user.api.generated_key });
                    });
                } else {
                    res.send({ success: false, status: 'error', error: 'Api key provided in request is incorrect' })
                }
            }
        });
    });

    //=======================================================
    // 2FACTOR-AUTHENTICATION SETUP 
    // We use route middleware to verify if user is logged in
    //=======================================================
    app.get('/2fa_setup', controller.onlyLoggedIn, (req, res) => {
        var messages = req.session.flash;
        req.session.flash = null;

        //Loads 2FA configuration page
        const SetupPage = require('../views/setup.jsx');

        if (req.user.record.twofa_completed != null && req.user.record.twofa_completed != true) {
            page = ReactDOMServer.renderToString(
                React.createElement(SetupPage, {
                    name: 'Gravity - 2FA Setup',
                    user: req.user,
                    dashboard: true
                })
            );

            res.send(page);
        } else {
            res.redirect('/');
        }
    });

    app.get('/2fa_checkup', controller.onlyLoggedIn, (req, res) => {
        var messages = req.session.flash;
        req.session.flash = null;

        //Page for 2fa checkup
        const VerificationPage = require('../views/verification.jsx');

        var check_code = ReactDOMServer.renderToString(
            React.createElement(VerificationPage, {
                name: 'Gravity - Two Factor Verification',
                user: req.user,
                messages: messages,
                dashboard: true
            })
        );

        res.send(check_code);
    });

    app.post('/start2fa', controller.onlyLoggedIn, (req, res) => {
        var speakeasy = require('speakeasy');
        var secret = speakeasy.generateSecret({ length: 20, name: ('Gravity:' + req.user.record.account) });
        var data = req.user.record;
        data.secret_key = secret.base32;
        data.twofa_enabled = true;
        data.public_key = req.session.public_key;

        var User = require('../models/user');
        var user = new User(data);

        req.session.secret = data.secret_key;
        user.update()
            .then(response => {
                res.send({ 'status': 'success', 'secret': secret.otpauth_url, 'user': user });
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            })

    });

    app.post('/verify_code', controller.onlyLoggedIn, (req, res) => {
        var verification_code = req.body.verification_code;
        var user_secret_key = req.user.record.secret_key;
        //console.log(verification_code);
        //console.log(user_secret_key);
        //console.log(req.user);
        //verify that the user token matches what it should be at this moment
        var speakeasy = require('speakeasy');
        var verified = speakeasy.totp.verify({
            secret: user_secret_key,
            encoding: 'base32',
            token: verification_code
        });
        //console.log(verified)

        if (verified == true) {
            req.session.twofa_pass = true

            req.flash('generalMessages', 'Passed verification!');

            res.send({ 'status': 'success', 'message': 'Verification code is correct!' })
        } else {
            res.send({ 'status': 'error', 'message': 'Verification code is incorrect!' });
        }
    });

    app.post('/verify_code_and_save', controller.onlyLoggedIn, (req, res) => {
        var verification_code = req.body.verification_code;
        var user_secret_key = req.session.secret;

        //verify that the user token matches what it should be at this moment
        var speakeasy = require('speakeasy');
        var verified = speakeasy.totp.verify({
            secret: user_secret_key,
            encoding: 'base32',
            token: verification_code
        });

        if (verified == true) {
            var data = req.user.record;
            data.secret_key = user_secret_key;
            data.public_key = req.session.public_key;
            data.twofa_enabled = true;
            data.twofa_completed = true;


            var User = require('../models/user');
            var user = new User(data);

            user.update()
                .then(response => {
                    req.session.twofa_enabled = true;
                    req.session.twofa_pass = true;
                    req.session.twofa_completed = true;
                    res.send({ 'status': 'success', 'message': 'Authentication succeeded! Update pushed to blockchain for saving.', user: user })
                })
                .catch(err => {
                    console.log(err);
                    res.send(err);
                })
        } else {
            res.send({ 'status': 'error', 'message': 'Verification code is incorrect!' });
        }

    });


    app.post('/update_2fa_settings', controller.onlyLoggedIn, (req, res) => {

        res.setHeader('Content-Type', 'application/json');
        var account_response;
        var params = req.body;
        //console.log(params)
        var data = req.user.record;
        var twofa_enabled = params.enable_2fa == 'true' ? true : false;
        data.twofa_enabled = twofa_enabled;
        data.public_key = req.session.public_key;
        var response_message= '';

        var User = require('../models/user');
        var user = new User(data);
        //console.log(user)
        if (twofa_enabled) {
            req.flash('loginMessage', 'Begining 2FA authentication')
            req.session.twofa_enabled = true;
            req.session.twofa_completed = false;
            user.record.twofa_enabled = true;
            user.record.twofa_completed= false;
        } else {
            req.session.twofa_enabled = false;
            req.flash('loginMessage', '2FA authentication disabled. It might take a few minutes for the change to be confirmed in the blockchain')
            user.record.twofa_enabled = false;
            user.record.twofa_completed= false;
            user.record.secret_key=null;
        }
        //res.send({ success: false, message: 'Information entered did not passed validation' });
        console.log(user.record);
        /*if (twofa_enabled) {
            //console.log('This thing trigered');
            //res.redirect('/settings');
        } else if (user.record.twofa_enabled == false) {
            //console.log('This is the other trigered');
            //res.redirect('/settings');
        }*/
        //res.redirect('/settings');
        user.update()
                .then(response => {
                    //console.log(user);
                    //console.log(response);
                    //res.send({ success: true, message: response_message, record: user.record });
                    if (twofa_enabled) {
                        //console.log('This thing trigered');
                        res.redirect('/2fa_setup');
                    } else if (user.record.twofa_enabled == false) {
                        //console.log('This is the other trigered');
                        res.redirect('/settings');
                    }
                })
                .catch(err => {
                    console.log(err);
                    //res.send(err);
                    res.redirect('/settings');

        });
        
    });
}