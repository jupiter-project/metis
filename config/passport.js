import events from 'events';
import { gravity } from './gravity';
import User from '../models/user';
import RegistrationWorker from '../workers/registration';

// Loads up passport code
const LocalStrategy = require('passport-local').Strategy;

module.exports = (passport, jobs, io) => {
  // Used to serialize the user for the session
  passport.serializeUser((accessData, done) => {
    done(null, accessData);
  });

  // Used to deserialize the user
  passport.deserializeUser((accessData, done) => {
    const user = new User({ id: accessData.id }, accessData);

    user.findById()
      .then((response) => {
        console.log('Deserializer response');
        console.log(response);
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
      let user;

      eventEmitter.on('sent_jupiter_to_new_account', () => {
        console.log('Saving new account data in Jupiter...');

        const data = {
          account,
          email: params.email,
          alias: params.alias,
          firstname: params.firstname,
          lastname: params.lastname,
          secret_key: null,
          twofa_enabled: (params.twofa_enabled === 'true'),
          twofa_completed: false,
          public_key: params.public_key,
          encryption_password: params.encryption_password,
        };

        // console.log(data);

        // We verify the user data here
        user = new User(data);

        user.create()
          .then(async () => {
            req.session.twofa_pass = false;
            req.session.public_key = req.body.public_key;
            req.session.jup_key = gravity.encrypt(req.body.key);
            let moneyTransfer;
            try {
              moneyTransfer = await gravity.sendMoney(
                req.body.jup_account_id,
                parseInt(0.05 * 100000000, 10),
              );
            } catch (e) {
              console.log(e);
              moneyTransfer = e;
            }

            if (!moneyTransfer.success) {
              console.log('SendMoney was not completed');
            }

            return done(null, {
              accessKey: req.session.jup_key,
              encryptionKey: gravity.encrypt(params.encryption_password),
              id: user.data.id,
            }, req.flash('signupMessage', 'Your account has been created and is being saved into the blockchain. Please wait a couple of minutes before logging in.'));
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

    const containedDatabase = {
      account,
      accounthash,
      encryptionPassword: req.body.encryptionPassword,
      passphrase: req.body.jupkey,
      publicKey: req.body.public_key,
      accountId: req.body.jup_account_id,
    };

    containedDatabase.originalTime = Date.now();
    const worker = new RegistrationWorker(jobs, io);
    const workerData = {
      accountData: gravity.encrypt(JSON.stringify(containedDatabase)),
      originalTime: Date.now(),
    };

    gravity.getUser(account, req.body.jupkey, containedDatabase)
      .then(async (response) => {
        if (response.error) {
          return done(null, false, req.flash('loginMessage', 'Account is not registered or has not been confirmed in the blockchain.'));
        }
        console.log('This is the getUser response');
        console.log(response);
        console.log('---------------');
        if (response.noUserTables || response.userNeedsSave) {
          worker.addToQueue('completeRegistration', workerData);
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
          req.session.accessData = gravity.encrypt(JSON.stringify(containedDatabase));
        }
        return done(null, {
          userRecordFound: response.userRecordFound,
          noUserTables: response.noUserTables,
          userNeedsBackup: response.userNeedsBackup,
          accessKey: gravity.encrypt(req.body.jupkey),
          encryptionKey: gravity.encrypt(req.body.encryptionPassword),
          account: gravity.encrypt(account),
          database: response.database,
          accountData: gravity.encrypt(JSON.stringify(containedDatabase)),
          id: user.data.id,
        });
      })
      .catch((err) => {
        console.log('Unable to query your user list. Please make sure you have a users table in your database.');
        console.log(err);
        return done(null, false, req.flash('loginMessage', 'Login Error'));
      });
  }));
};
