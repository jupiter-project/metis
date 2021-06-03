import axios from 'axios';
import { gravity } from '../config/gravity';
import controller from '../config/controller';

const logger = require('../utils/logger')(module);

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

  const connection = process.env.SOCKET_SERVER;

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
      React.createElement(LoginPage, { messages, name: 'Metis - Log In', dashboard: false }),
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
      React.createElement(SignupPage, { messages, name: 'Metis - Sign Up', dashboard: false }),
    );
    res.send(page);
  });

  // ===============================================================================
  // HOMEPAGE, SETTINGS
  // ===============================================================================
  app.get('/', controller.isLoggedInIndex, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    // Loads file with Home page file
    const IndexPage = require('../views/index.jsx');
    page = ReactDOMServer.renderToString(
      React.createElement(IndexPage, {
        connection,
        messages,
        name: 'Metis',
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
      passphrase: process.env.APP_ACCOUNT ? 'yes' : false,
      address: process.env.APP_ACCOUNT_ADDRESS ? 'yes' : false,
      public_key: process.env.APP_PUBLIC_KEY ? 'yes' : false,
      encryption: process.env.SESSION_SECRET !== undefined ? 'defined' : 'undefined',
      name: process.env.APPNAME,
      version: process.env.VERSION,
    };

    // Loads gravity setup progress page

    const GravityPage = require('../views/gravity.jsx');

    page = ReactDOMServer.renderToString(
      React.createElement(GravityPage, {
        messages,
        requirements,
        name: 'Metis - Log In',
        user: req.user,
        dashboard: false,
      }),
    );
    res.send(page);
  });

  app.get('/home', (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    const requirements = {
      passphrase: process.env.APP_ACCOUNT ? 'yes' : false,
      address: process.env.APP_ACCOUNT_ADDRESS ? 'yes' : false,
      public_key: process.env.APP_PUBLIC_KEY ? 'yes' : false,
      encryption: process.env.SESSION_SECRET !== undefined ? 'defined' : 'undefined',
      name: process.env.APPNAME,
      version: process.env.VERSION,
    };

    // Loads public home page

    const PublicHomePage = require('../views/public_home_page.jsx');

    page = ReactDOMServer.renderToString(
      React.createElement(PublicHomePage, {
        messages,
        requirements,
        name: 'Metis - Home',
        user: req.user,
        dashboard: false,
      }),
    );
    res.send(page);
  });

  app.get('/security', controller.isLoggedIn, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;
    // Loads security page
    const SecurityPage = require('../views/security.jsx');

    page = ReactDOMServer.renderToString(
      React.createElement(SecurityPage, {
        connection,
        messages,
        name: 'Metis - Security',
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
        const { accountRS, publicKey } = response.data;
        res.send({
          success: true,
          account: accountRS, // TODO check if the right value should be response.data.account
          accounthash: accountRS,
          public_key: publicKey,
        });
      })
      .catch((error) => {
        logger.error(error);
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
    const formData = req.body.account_data;

    res.setHeader('Content-Type', 'application/json');

    const seedphrase = req.body.account_data.passphrase;

    axios.get(`${gravity.jupiter_data.server}/nxt?requestType=getAccountId&secretPhrase=${seedphrase}`)
      .then((response) => {
        // new_account_created = true;
        // bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
        const jupiterAccount = {
          account: response.data.accountRS,
          public_key: response.data.publicKey,
          alias: response.data.alias,
          accounthash: gravity.encrypt(response.data.accountRS),
          jup_account_id: response.data.account,
          email: formData.email,
          firstname: formData.firstname,
          lastname: formData.lastname,
          twofa_enabled: formData.twofa_enabled,
        };

        if (response.data.accountRS == null) {
          res.send({ success: false, message: 'There was an error in saving the trasaction record', transaction: response.data });
        } else {
          res.send({ success: true, message: 'Jupiter account created', account: jupiterAccount });
        }
      })
      .catch((error) => {
        logger.error(error);
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

  // used for the mobile app
  app.post('/appLogin', (req, res, next) => {
    logger.info('\n\n\nappLogin\n\n\n');
    logger.info(JSON.stringify(req.headers));
    logger.info('\n\n\nappLogin\n\n\n');

    passport.authenticate('gravity-login', (err, userInfo) => {
      if (err) return next(err);
      if (!userInfo) {
        const errorMessage = 'There was an error in verifying the passphrase with the Blockchain';

        logger.error(new Error(errorMessage));

        return res.status(400).json({
          success: false,
          message: errorMessage,
        });
      }

      const accountData = JSON.parse(gravity.decrypt(userInfo.accountData));

      userInfo.publicKey = accountData.publicKey;
      return res.json(userInfo);
    })(req, res, next);
  });

  // ===============================================================================
  // GET PASSPHRASE
  // ===============================================================================
  app.get('/create_passphrase', (req, res) => {
    const seedphrase = gravity.generate_passphrase();
    res.send({ success: true, result: seedphrase, message: 'Passphrase generated' });
  });
};
