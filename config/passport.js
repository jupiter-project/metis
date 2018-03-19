//Loads up passport code
var LocalStrategy = require('passport-local').Strategy;
//Loads up the user model
var User = require('../models/user');
//Loads event handler
var events = require('events');
//Loads library for background jobs
var Queue = require('bull');
//Loads gravity library for communication with blockchain and app encryption
var gravity = require('./gravity.js');


module.exports = function(passport) {
    //Used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.record.id)
    });

    //Used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log('Deserializer being called');
        var user = new User({id: id});

        user.findById()
        .then(response=>{
            var this_user= user;
            done(null, this_user)
        })
        .catch(err=>{
            done(err, null)
        });
    });

    //===================================================
    //LOCAL SIGNUP CODE
    //===================================================
    passport.use('gravity-signup', new LocalStrategy({
            usernameField: 'account',
            passwordField: 'accounthash',
            passReqToCallback: true //allows us to pass back the entire request to the callback
        },
        function(req, account, accounthash, done) {
            process.nextTick(function() {
                var eventEmitter = new events.EventEmitter();
                //var axios = require('axios');
                var tables, user_table;
                var feeNQT = 100;
                var deadline = 60;
                var user;
                var axios = require('axios');
                var params = req.body;

                eventEmitter.on('sent_jupiter_to_new_account', function() {
                    console.log('Saving new account data in Jupiter...');

                    var data = {
                        account: account,
                        email: params.email,
                        firstname: params.firstname,
                        lastname: params.lastname,
                        secret_key: null,
                        twofa_enabled: (params.twofa_enabled == 'true' ? true : false),
                        twofa_completed: false,
                        public_key: params.public_key

                    }

                    //We verify the user data here
                    user = new User(data);

                    user.create()
                        .then(res => {
                            req.session.twofa_pass = false;
                            req.session.public_key = req.body['public_key'];
                            req.session.jup_key = gravity.encrypt(req.body['key']);
                            return done(null, user, req.flash('signupMessage', 'Account created! Please wait a couple of minutes before loggin in while your account is saved in the blockchain'));
                        })
                        .catch(err => {
                            console.log(err);
                            var error_message;
                            if (err.verification_error != undefined && err.verification_error == true) {
                                for (var x in err.errors) {
                                    req.flash('signupMessage', err.errors[x])
                                }
                                error_message = 'There were validation errors';
                            } else {
                                error_message = err.errors;
                            }

                            return done(null, false, req.flash('signupMessage', error_message));
                        })
                });

                eventEmitter.on('app_data_loaded', function() {
                    var aliasQueue = new Queue('Alias registration', 'redis://127.0.0.1:6379')
                    var encrypted_key = gravity.encrypt(req.body['key']);

                    aliasQueue.process(function(job, done) {
                        var processEvent = new events.EventEmitter();

                        console.log('Job started');
                        console.log('Setting Alias for user');

                        var has_balance = false;
                        var alias_set;

                        processEvent.on('job_completed', function() {
                            axios.post(process.env.JUPITERSERVER + '/nxt?requestType=setAlias&secretPhrase=' + gravity.decrypt(job.data.jup_key) + '&aliasName=' + job.data.user.firstname + job.data.user.lastname + '&feeNQT=' + feeNQT + '&deadline=60')
                                .then(function(response) {
                                    console.log(response.data);
                                    if (response.data.broadcasted != null && response.data.errorDescription == null) {
                                        console.log('Alias set');
                                        console.log('Finished setting up alias for user')
                                        done();
                                    } else {
                                        console.log(response.data.errorDescription);
                                    }
                                }).catch(function(error) {
                                    console.log(error);
                                });
                        });

                        setTimeout(function() {
                            console.log(job.data)
                            axios.get(process.env.JUPITERSERVER + '/nxt?requestType=getBalance&account=' + job.data.jup_id)
                                .then(function(response) {
                                    if (parseInt(response.data.balanceNQT) >= 400000000) {
                                        processEvent.emit('job_completed')
                                    } else {
                                        console.log(response.data);
                                    }
                                })
                                .catch(function(error) {
                                    console.log(error);
                                })
                        }, 25000)

                    });

                    aliasQueue.add({ user: { firstname: req.body['firstname'], lastname: req.body['lastname'] }, jup_key: encrypted_key, jup_id: req.body['jup_account_id'] })

                    eventEmitter.emit('record_in_jupiter');
                });

                /*axios.post(process.env.JUPITERSERVER + '/nxt?requestType=sendMoney&secretPhrase=' + process.env.APP_ACCOUNT + '&recipient=' + account + '&amountNQT=10000000&feeNQT=' + feeNQT + '&deadline=60')
                    .then(function(response) {
                        console.log(response.data)
                        if (response.data.signatureHash != null) {
                            console.log('Jupiter sent to new account')
                                //eventEmitter.emit('record_transaction');
                            eventEmitter.emit('sent_jupiter_to_new_account');

                        } else {
                            console.log(response.data)
                            console.log('Cannot send Jupiter to new account, Jupiter issuer has insuficient balance!')
                            throw response.data;
                        }
                    })
                    .catch(function(error) {
                        console.log({ status: 'error', message: 'There was an error', transaction: null, error: error });
                        return done(null, false, req.flash('signupMessage', 'There was an error'));
                    });

                    */
                eventEmitter.emit('sent_jupiter_to_new_account');


            })
        }
    ));

    //==================================================================
    // GRAVITY LOGIN
    //==================================================================
    passport.use('gravity-login', new LocalStrategy({
            usernameField: 'account',
            passwordField: 'accounthash',
            passReqToCallback: 'true'
        },
        function(req, account, accounthash, done) {
            var eventEmitter = new events.EventEmitter();
            //var axios = require('axios');
            var user;
            gravity.getUser(account, req.body['jupkey'])
                .then(response => {
                    if(response.error){
                        return done(null, false, req.flash('loginMessage', 'Account is not registered or has not been confirmed in the blockchain'));
                    }

                    var data = JSON.parse(response.user);
                    data.public_key = req.body['public_key'];
                    user = new User(data);
                    if (user.record.id == undefined) {
                        return done(null, false, req.flash('loginMessage', 'Account is not registered'));
                    } else if (!user.validPassword(accounthash)) {
                        return done(null, false, req.flash('loginMessage', 'Wrong hashphrase'));
                    } else {
                        req.session.public_key = req.body['public_key'];
                        req.session.twofa_pass = false;
                        req.session.jup_key = gravity.encrypt(req.body['jupkey']);
                        return done(null, user);
                    }
                })
                .catch(err => {
                    console.log("Unable to query your user list. Please make sure you have a users table in your database.");
                    console.log(err);
                    return done(null, false, req.flash('loginMessage', 'Login Error'));
                })
        }
    ));
}