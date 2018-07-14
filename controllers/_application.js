import axios from 'axios';
import gravity from '../config/gravity';
import controller from '../config/controller';

// This files handles the app's different pages and how they are routed by the system

module.exports = (app, passport, React, ReactDOMServer) => {
  /* var bcrypt = require('bcrypt-nodejs');
    var session = require('express-session');
    var flash = require('connect-flash');
    var Queue = require('bull'); */

  // ===========================================================
  // This constains constants needed to connect with Jupiter
  // ===========================================================
  // Loads Gravity module
  let page;

  app.get('/test', (req, res) => {
    res.send({ success: true });
  });

  // ===============================================================================
  // SIGNIN PAGE
  // ===============================================================================
  app.get('/login', (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;
    // Loads file with Login page
    const LoginPage = require('../views/login.jsx');

    page = ReactDOMServer.renderToString(
      React.createElement(LoginPage, { messages, name: 'Gravity - Login to your account', dashboard: false }),
    );
    res.send(page);
  });

  // ===============================================================================
  // SIGNUP
  // ===============================================================================

  app.get('/signup', (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;
    // Loads file with Signup page
    const SignupPage = require('../views/signup.jsx');

    page = ReactDOMServer.renderToString(
      React.createElement(SignupPage, { messages, name: 'Gravity - Create an account', dashboard: false }),
    );
    res.send(page);
  });

  // ===============================================================================
  // HOMEPAGE, SETTINGS, POOL, DONATION_CHANGE INVEST_MORE
  // ===============================================================================
  app.get('/', controller.isLoggedInIndex, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    // Loads file with Home page file
    const IndexPage = require('../views/index.jsx');

    page = ReactDOMServer.renderToString(
      React.createElement(IndexPage, {
        messages,
        name: 'Gravity - Homepage',
        user: req.user,
        dashboard: true,
      }),
    );
    res.send(page);
  });

  app.get('/gravity', (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;


    const requirements = {
      passphrase: process.env.APP_ACCOUNT,
      address: process.env.APP_ACCOUNT_ADDRESS,
      public_key: process.env.APP_PUBLIC_KEY,
      encryption: process.env.SESSION_SECRET !== undefined ? process.env.SESSION_SECRET : 'undefined',
      name: process.env.APPNAME,
    };

    // Loads gravity setup progress page

    const GravityPage = require('../views/gravity.jsx');

    page = ReactDOMServer.renderToString(
      React.createElement(GravityPage, {
        messages,
        requirements,
        name: 'Gravity - Basic Setup',
        user: req.user,
        dashboard: false,
      }),
    );
    res.send(page);
  });

  app.get('/settings', controller.isLoggedIn, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;
    // Loads settings page
    const SettingsPage = require('../views/settings.jsx');

    page = ReactDOMServer.renderToString(
      React.createElement(SettingsPage, {
        messages,
        name: 'Gravity - Your Settings',
        user: req.user,
        dashboard: true,
        validation: req.session.jup_key,
      }),
    );
    res.send(page);
  });

  // =======================================================
  // LOGOUT
  // =======================================================
  app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    // console.log(req.session);
    res.redirect('/');
  });


  // ===============================================================================
  // JUPITER CALLS
  // ===============================================================================

  app.post('/get_jupiter_account', (req, res) => {
    axios.get(`${gravity.jupiter_data.server}/nxt?requestType=getAccountId&secretPhrase=${req.body.jup_passphrase}`)
      .then((response) => {
        // new_account_created = true;
        // bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
        const { accountRS } = response.data;
        res.send({
          success: true,
          account: accountRS,
          accounthash: accountRS,
          public_key: response.data.publicKey,
        });
      })
      .catch((error) => {
        console.log(error);
        res.send({
          success: false,
          message: 'There was an error in verifying the passphrase with the Blockchain',
        });
      });
  });

  // ===============================================================================
  // NEW ACCOUNT GENERATION
  // ===============================================================================
  app.post('/create_jupiter_account', (req, res) => {
    const form_data = req.body.account_data;

    res.setHeader('Content-Type', 'application/json');

    const seedphrase = req.body.account_data.passphrase;

    axios.get(`${gravity.jupiter_data.server}/nxt?requestType=getAccountId&secretPhrase=${seedphrase}`)
      .then((response) => {
        // new_account_created = true;
        // bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
        const jupiter_account = {
          account: response.data.accountRS,
          public_key: response.data.publicKey,
          accounthash: gravity.encrypt(response.data.accountRS),
          jup_account_id: response.data.account,
          email: form_data.email,
          firstname: form_data.firstname,
          lastname: form_data.lastname,
          twofa_enabled: form_data.twofa_enabled,
        };

        if (response.data.accountRS == null) {
          res.send({ success: false, message: 'There was an error in saving the trasaction record', transaction: response.data });
        } else {
          res.send({ success: true, message: 'Jupiter account created', account: jupiter_account });
        }
      })
      .catch((error) => {
        console.log(error);
        res.send({ success: false, message: 'There was an error', error: error.response });
      });
  });


  // ===============================================================================
  // SIGNUP AND LOGIN post calls
  // ===============================================================================
  // Signup with immediate login afterwards
  /* app.post('/signup', passport.authenticate('gravity-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
     }));
  */

  app.post('/signup',
    passport.authenticate('gravity-signup', { session: false }),
    (req, res) => {
      res.redirect('/login');
    });

  // process the login
  app.post('/login', passport.authenticate('gravity-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }));

  // ===============================================================================
  // GET PASSPHRASE
  // ===============================================================================
  app.get('/create_passphrase', (req, res) => {
    const seedphrase = gravity.generate_passphrase();
    res.send({ success: true, result: seedphrase, message: 'Passphrase generated' });
  });
};
