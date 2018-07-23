import events from 'events';
import Queue from 'bull';
import axios from 'axios';
import { gravity } from './gravity';
import User from '../models/user';

// Loads up passport code
const LocalStrategy = require('passport-local').Strategy;

module.exports = (passport) => {
  // Used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.record.id);
  });

  // Used to deserialize the user
  passport.deserializeUser((id, done) => {
    // console.log('Deserializer being called');
    const user = new User({ id });

    user.findById()
      .then(() => {
        const thisUser = user;
        done(null, thisUser);
      })
      .catch((err) => {
        done(err, null);
      });
  });

  // ===================================================
  // LOCAL SIGNUP CODE
  // ===================================================
  passport.use('gravity-signup', new LocalStrategy({
    usernameField: 'account',
    passwordField: 'accounthash',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  },
  (req, account, accounthash, done) => {
    process.nextTick(() => {
      const eventEmitter = new events.EventEmitter();
      const params = req.body;
      const feeNQT = 100;
      let user;

      eventEmitter.on('sent_jupiter_to_new_account', () => {
        console.log('Saving new account data in Jupiter...');

        const data = {
          account,
          email: params.email,
          firstname: params.firstname,
          lastname: params.lastname,
          secret_key: null,
          twofa_enabled: (params.twofa_enabled === 'true'),
          twofa_completed: false,
          public_key: params.public_key,
        };

        // We verify the user data here
        user = new User(data);

        user.create()
          .then(() => {
            req.session.twofa_pass = false;
            req.session.public_key = req.body.public_key;
            req.session.jup_key = gravity.encrypt(req.body.key);
            return done(null, user, req.flash('signupMessage', 'Account created! Please wait a couple of minutes before loggin in while your account is saved in the blockchain'));
          })
          .catch((err) => {
            console.log(err);
            let errorMessage;
            if (err.verification_error !== undefined && err.verification_error === true) {
              err.errors.forEach((x) => {
                req.flash('signupMessage', err.errors[x]);
              });
              errorMessage = 'There were validation errors';
            } else {
              errorMessage = err.errors;
            }
            return done(null, false, req.flash('signupMessage', errorMessage));
          });
      });

      eventEmitter.on('app_data_loaded', () => {
        const aliasQueue = new Queue('Alias registration', 'redis://127.0.0.1:6379');
        const encryptedKey = gravity.encrypt(req.body.key);

        aliasQueue.process((job, queueDone) => {
          const processEvent = new events.EventEmitter();

          // console.log('Job started');
          // console.log('Setting Alias for user');
          processEvent.on('job_completed', () => {
            axios.post(`${process.env.JUPITERSERVER}/nxt?requestType=setAlias&secretPhrase=${gravity.decrypt(job.data.jup_key)}&aliasName=${job.data.user.firstname + job.data.user.lastname}&feeNQT=${feeNQT}&deadline=60`)
              .then((response) => {
                // console.log(response.data);
                if (response.data.broadcasted != null && response.data.errorDescription == null) {
                  console.log('Alias set');
                  console.log('Finished setting up alias for user');
                  queueDone();
                } else {
                  console.log(response.data.errorDescription);
                }
              }).catch((error) => {
                console.log(error);
              });
          });

          setTimeout(() => {
            // console.log(job.data);
            axios.get(`${process.env.JUPITERSERVER}/nxt?requestType=getBalance&account=${job.data.jup_id}`)
              .then((response) => {
                if (parseInt(response.data.balanceNQT, 10) >= 400000000) {
                  processEvent.emit('job_completed');
                } else {
                  console.log(response.data);
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }, 25000);
        });

        aliasQueue.add({
          user: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
          },
          jup_key: encryptedKey,
          jup_id: req.body.jup_account_id,
        });

        eventEmitter.emit('record_in_jupiter');
      });

      eventEmitter.emit('sent_jupiter_to_new_account');
    });
  }));

  // ==================================================================
  // GRAVITY LOGIN
  // ==================================================================
  passport.use('gravity-login', new LocalStrategy({
    usernameField: 'account',
    passwordField: 'accounthash',
    passReqToCallback: 'true',
  },
  (req, account, accounthash, done) => {
    let user;
    let valid = true;

    gravity.getUser(account, req.body.jupkey)
      .then((response) => {
        if (response.error) {
          return done(null, false, req.flash('loginMessage', 'Account is not registered or has not been confirmed in the blockchain'));
        }
        // console.log(response);
        const data = JSON.parse(response.user);
        data.public_key = req.body.public_key;
        user = new User(data);
        if (user.record.id === undefined) {
          valid = false;
          return done(null, false, req.flash('loginMessage', 'Account is not registered'));
        }
        if (!user.validPassword(accounthash)) {
          valid = false;
          return done(null, false, req.flash('loginMessage', 'Wrong hashphrase'));
        }

        if (valid) {
          req.session.public_key = req.body.public_key;
          req.session.twofa_pass = false;
          req.session.jup_key = gravity.encrypt(req.body.jupkey);
        }
        return done(null, user);
      })
      .catch((err) => {
        console.log('Unable to query your user list. Please make sure you have a users table in your database.');
        console.log(err);
        return done(null, false, req.flash('loginMessage', 'Login Error'));
      });
  }));
};
