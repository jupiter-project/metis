// import dotenv from "dotenv"
import express from 'express';
import passport from 'passport';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import session from 'express-session'
import redis from 'redis';
import connectRedis from 'connect-redis';
import bodyParser from 'body-parser';
import React from 'react';
import ReactDOMServer from 'react-dom/server.js';
import kue from 'kue';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as https from 'https';
import * as http from 'http'
import * as socketService from './services/socketService.js';
import config from './config.js';
import mongoose from 'mongoose';
import { Server } from "socket.io";
import { gravity } from './config/gravity.cjs';
import RegistrationWorker from './workers/registration.mjs';

// if (process.env.NODE_ENV !== 'production') {
//   dotenv.config();
// }
const __dirname = dirname(fileURLToPath(import.meta.url));

const RedisStore = connectRedis(session);
// const port = config.app.port;
const app = express();
const jobs = kue.createQueue({
  redis: {
      host: config.redis.host,
      port: config.redis.port,
  },
});

// import find from 'find';
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
import api from './config/api.mjs';

// Sets public directory
app.use(express.static(`${__dirname}/public`));

// required for passport
// const sessionSecret = process.env.SESSION_SECRET !== undefined ? process.env.SESSION_SECRET : 'undefined';
// const sessionSecret = config.sessionSecret;

// const sslOptions = {};
// if (config.certFile) { // Set the certificate file
//   sslOptions.cert = fs.readFileSync(`${__dirname}/${config.certFile}`);
// }
// if (config.keyFile) { // set the key file
//   sslOptions.key = fs.readFileSync(`${__dirname}/${config.keyFile}`);
// }

const sslOptions = generateSslOptions(__dirname,config.keyFileName, config.certFileName);




let redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  db: 1,
})
redisClient.unref()
redisClient.on('error', console.log)

let store = new RedisStore({ client: redisClient })


app.use(
    session({
      store: store,
      saveUninitialized: true,
      secret: config.sessionSecret,
      resave: false,
      cookie: { secure: (sslOptions.length) }, // use secure cookies if SSL env vars are present
    })
)


app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// If both cert and key files env vars exist use https,
// otherwise use http


const server = Object.keys(sslOptions).length >= 2
    ? https.createServer(sslOptions, app)
    : http.createServer(app);

export const io = new Server(server, {});

io.on('connection', socketService.connection.bind(this));

import loggerPkg from './utils/logger.js';
const logger = loggerPkg(this);


// const mongoDBOptions = { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true };

import { serializeUser, deserializeUser, metisSignup, metisLogin  } from './config/passport.mjs';

serializeUser(passport); //  pass passport for configuration
deserializeUser(passport); //  pass passport for configuration
metisSignup(passport); //  pass passport for configuration
metisLogin(passport, jobs, io); //  pass passport for configuration

import _application from './controllers/_application.js';
_application(app, passport, React, ReactDOMServer, jobs);

import account from './controllers/account.js';
account(app, passport, React, ReactDOMServer, jobs);

import admin from './controllers/admin.js';
admin(app, passport, React, ReactDOMServer, jobs);

import channels from './controllers/channels.mjs';
channels(app, passport, React, ReactDOMServer, jobs);

import members from './controllers/members.js';
members(app, passport, React, ReactDOMServer, jobs);

import pushNotificationController from './controllers/pushNotificationController.mjs';
pushNotificationController(app, passport, React, ReactDOMServer, jobs);

import transfers from './controllers/transfers.js';
transfers(app, passport, React, ReactDOMServer, jobs);

// Route any invalid routes black to the root page
app.get('/*', (req, res) => {
  req.flash('errorMessage', 'Invalid route');
  res.redirect('/');
});

// Gravity call to check app account properties
gravity.getFundingMonitor()
  .then(async (monitorResponse) => {
    logger.info('Server > gravity.getFundingMonitor() > .then : ' + JSON.stringify(monitorResponse));
    const { monitors } = monitorResponse;

    if (monitors.length === 0) {
      logger.info('Funding property not set for app. Setting it now...');
      const fundingResponse = await gravity.setFundingProperty({
        passphrase: config.app.passPhrase,
      });

      console.log(`Jupiter response: ${JSON.stringify(fundingResponse)}`);
    }
  })
  .catch((error) => {
    logger.error('server.mjs > getFundingMonitor: ' + JSON.stringify(error) );
    throw error;
  });

// Worker methods
const registrationWorker = new RegistrationWorker(jobs, io);

jobs.process('completeRegistration', (job, done) => {
  registrationWorker.checkRegistration(job.data, job.id, done);
});

mongoose.connect(config.mongo.url, config.mongo.options, (err, resp) => {
  if (err) {
    logger.error(err);
    throw err;
  }

  logger.info('Mongo connection: ' & resp);
});

// logger.info('Memory Usage:');
// logger.info(JSON.stringify(process.memoryUsage()));



server.listen(config.app.port, () => {
  console.log('');
  console.log('_________________________________________________________________');
  console.log(' ▄▄       ▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄ ');
  console.log('▐░░▌     ▐░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌');
  console.log('▐░▌░▌   ▐░▐░▌▐░█▀▀▀▀▀▀▀▀▀  ▀▀▀▀█░█▀▀▀▀  ▀▀▀▀█░█▀▀▀▀ ▐░█▀▀▀▀▀▀▀▀▀ ');
  console.log('▐░▌▐░▌ ▐░▌▐░▌▐░▌               ▐░▌          ▐░▌     ▐░▌          ');
  console.log('▐░▌ ▐░▐░▌ ▐░▌▐░█▄▄▄▄▄▄▄▄▄      ▐░▌          ▐░▌     ▐░█▄▄▄▄▄▄▄▄▄ ');
  console.log('▐░▌  ▐░▌  ▐░▌▐░░░░░░░░░░░▌     ▐░▌          ▐░▌     ▐░░░░░░░░░░░▌');
  console.log('▐░▌   ▀   ▐░▌▐░█▀▀▀▀▀▀▀▀▀      ▐░▌          ▐░▌      ▀▀▀▀▀▀▀▀▀█░▌');
  console.log('▐░▌       ▐░▌▐░▌               ▐░▌          ▐░▌               ▐░▌');
  console.log('▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄▄▄      ▐░▌      ▄▄▄▄█░█▄▄▄▄  ▄▄▄▄▄▄▄▄▄█░▌');
  console.log('▐░▌       ▐░▌▐░░░░░░░░░░░▌     ▐░▌     ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌');
  console.log(' ▀         ▀  ▀▀▀▀▀▀▀▀▀▀▀       ▀       ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀ ');
  console.log('_________________________________________________________________');
  console.log('');
  console.log(`Metis version ${config.version} is now running on port ${config.app.port} 🎉🎉`);
  console.log(`Jupiter Node running on ${config.jupiter.server}`);
});

// Kue is no longer maintained. Please see e.g. Bull as an alternative. Thank you!
kue.app.listen(config.jobQueue.port, () => {
  console.log(`Job queue server running on port ${config.jobQueue.port}`);
});



// function mongoSettings(environment){
//   let mongoSettings = {
//     host : environment.MONGO_HOST,
//     port : environment.MONGO_PORT,
//     dbName : environment.MONGO_DB_NAME,
//     url: "mongodb:\/\/${environment.MONGO_HOST}:${environment.MONGO_PORT}/${environment.MONGO_DB_NAME}",
//     options : { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }
//   }
//
//   console.log(mongoSettings);
//   return mongoSettings;
// }


function generateSslOptions(path, certFile, keyFile){
  let sslOptions = {};
  if (certFile) {
    sslOptions.cert = fs.readFileSync(`${path}/${certFile}`);
  }

  if (keyFile) {
    sslOptions.key = fs.readFileSync(`${path}/${keyFile}`);
  }

  return sslOptions;
}
